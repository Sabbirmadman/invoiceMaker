import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Check,
    ImagePlus,
    X,
    ChevronDown,
    Settings2,
    LayoutTemplate,
    Palette,
    FileText,
    Table2,
    Calculator,
    AlignLeft,
    AlignCenter,
    AlignRight,
    ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CanvasPage } from "@/components/canvas/CanvasPage";
import { FillModeProvider } from "@/components/fill-mode/FillModeContext";
import { calculateTotals } from "@/services/calculations";
import {
    buildTemplateFromWizard,
    defaultWizardState,
    wizardStateFromTemplate,
    COMPANY_FIELD_OPTIONS,
    ALL_COMPANY_FIELDS,
} from "@/utils/buildTemplate";
import type {
    WizardState,
    ColumnConfig,
    HeaderElementSlot,
    FooterElementSlot,
    CompanyField,
} from "@/utils/buildTemplate";
import {
    addCustomTemplate,
    updateCustomTemplate,
} from "@/store/slices/templatesSlice";
import { selectAllTemplates } from "@/store";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import type { StoredDocument, TotalsResult } from "@/types/document";
import type { DocumentType } from "@/types/common";

// ── Sample preview data ───────────────────────────────────────────────
const PREVIEW_DOC_BASE: Omit<StoredDocument, "templateSnapshot"> = {
    id: "preview",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    documentType: "invoice",
    data: {
        company: {
            name: "Acme Corp",
            address: "123 Main Street",
            city: "New York",
            state: "NY",
            zip: "10001",
            country: "USA",
            phone: "+1 555 000 0000",
            email: "hello@acme.com",
            website: "www.acme.com",
            taxId: "TAX-123456",
            logoUrl: "",
        },
        client: {
            name: "Jane Smith",
            company: "Client LLC",
            address: "456 Oak Ave",
            city: "Los Angeles",
            state: "CA",
            zip: "90001",
            country: "USA",
            phone: "+1 555 111 2222",
            email: "jane@client.com",
            taxId: "",
            shippingAddress: "456 Oak Ave, Los Angeles CA 90001",
        },
        meta: {
            type: "invoice",
            number: "INV-0001",
            date: "2025-01-15",
            dueDate: "2025-02-15",
            terms: "Net 30",
            poNumber: "PO-999",
            projectName: "Sample Project",
            reference: "",
            placeOfSupply: "",
            currency: "USD",
        },
        items: [
            {
                id: "i1",
                name: "Design Services",
                description: "UI/UX design",
                qty: 10,
                unit: "hrs",
                rate: 150,
                discount: 0,
                discountType: "flat",
                taxRate: 10,
                amount: 1500,
            },
            {
                id: "i2",
                name: "Development",
                description: "Frontend build",
                qty: 20,
                unit: "hrs",
                rate: 120,
                discount: 0,
                discountType: "flat",
                taxRate: 10,
                amount: 2400,
            },
            {
                id: "i3",
                name: "Consulting",
                description: "",
                qty: 5,
                unit: "hrs",
                rate: 200,
                discount: 0,
                discountType: "flat",
                taxRate: 0,
                amount: 1000,
            },
        ],
        totalsConfig: {
            overallDiscount: 0,
            overallDiscountType: "flat",
            tax1: { label: "Tax (10%)", rate: 10, enabled: true },
            tax2: { label: "GST", rate: 0, enabled: false },
            shipping: 0,
            adjustment: 0,
            amountPaid: 0,
            currency: "USD",
        },
        notes: "Thank you for your business!",
        terms: "Payment due within 30 days.",
    },
};

// ── Nav section definitions ───────────────────────────────────────────
type Section =
    | "general"
    | "header-footer"
    | "theme"
    | "body"
    | "table"
    | "totals";

const NAV_SECTIONS: {
    id: Section;
    label: string;
    Icon: React.ComponentType<{ className?: string }>;
}[] = [
    { id: "general", label: "General", Icon: Settings2 },
    { id: "header-footer", label: "Header & Footer", Icon: LayoutTemplate },
    { id: "theme", label: "Theme", Icon: Palette },
    { id: "body", label: "Body", Icon: FileText },
    { id: "table", label: "Table", Icon: Table2 },
    { id: "totals", label: "Totals", Icon: Calculator },
];

// ── Slot options ──────────────────────────────────────────────────────
const HEADER_SLOT_OPTIONS: { value: HeaderElementSlot; label: string }[] = [
    { value: "empty", label: "Empty" },
    { value: "companyDetails", label: "Company Details" },
    { value: "logo", label: "Logo" },
    { value: "detailsBlock", label: "Invoice / Estimate / Receipt Details" },
    { value: "textLabel", label: "Text Label" },
];

const FOOTER_SLOT_OPTIONS: { value: FooterElementSlot; label: string }[] = [
    { value: "empty", label: "Empty" },
    { value: "notes", label: "Notes" },
    { value: "termsConditions", label: "Terms & Conditions" },
    { value: "pageNumber", label: "Page Number" },
];

const FONT_OPTIONS = [
    { value: "system-ui, sans-serif", label: "System UI (default)" },
    { value: "Georgia, serif", label: "Georgia (serif)" },
    { value: '"Courier New", monospace', label: "Courier New (mono)" },
    { value: "Arial, sans-serif", label: "Arial" },
    { value: '"Inter", sans-serif', label: "Inter" },
];

const ITEM_COLUMN_OPTIONS = [
    { value: "name", label: "Name" },
    { value: "description", label: "Description" },
    { value: "qty", label: "Qty" },
    { value: "unit", label: "Unit" },
    { value: "rate", label: "Rate" },
    { value: "discount", label: "Discount" },
    { value: "tax", label: "Tax %" },
    { value: "amount", label: "Amount" },
];

const TOTALS_ROW_OPTIONS = [
    { value: "subTotal", label: "Subtotal" },
    { value: "discount", label: "Discount" },
    { value: "tax1", label: "Tax 1" },
    { value: "tax2", label: "Tax 2" },
    { value: "shipping", label: "Shipping" },
    { value: "adjustment", label: "Adjustment" },
    { value: "total", label: "Total" },
    { value: "amountPaid", label: "Amount Paid" },
    { value: "balanceDue", label: "Balance Due" },
];

// ── Reusable UI primitives ────────────────────────────────────────────

function SectionGroup({
    title,
    children,
    defaultOpen = true,
}: {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border rounded-lg overflow-hidden mb-3">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold bg-muted/40 hover:bg-muted/70 transition-colors text-left"
            >
                {title}
                <ChevronDown
                    className={`size-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                />
            </button>
            {open && <div className="p-4 space-y-4">{children}</div>}
        </div>
    );
}

function ColorInput({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="flex items-center gap-3">
            <div
                className="size-9 rounded-md border cursor-pointer shrink-0 overflow-hidden shadow-sm"
                style={{ backgroundColor: value }}
                title={value}
            >
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="opacity-0 w-full h-full cursor-pointer"
                />
            </div>
            <div className="flex-1">
                <Label className="text-xs text-muted-foreground">{label}</Label>
                <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-7 text-xs font-mono mt-0.5"
                />
            </div>
        </div>
    );
}

function CheckRow({
    label,
    checked,
    onChange,
}: {
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="size-4 rounded"
            />
            <span className="text-sm group-hover:text-foreground text-muted-foreground transition-colors">
                {label}
            </span>
        </label>
    );
}

function ImageUploadInput({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (dataUrl: string) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    function handleFile(file: File) {
        if (!file.type.startsWith("image/")) return;
        if (file.size > 5 * 1024 * 1024) {
            alert("Image must be smaller than 5 MB.");
            return;
        }
        const reader = new FileReader();
        reader.onload = () => onChange(reader.result as string);
        reader.readAsDataURL(file);
    }

    if (value) {
        return (
            <div>
                <Label className="text-xs text-muted-foreground">{label}</Label>
                <div
                    className="mt-1 relative rounded-md overflow-hidden border"
                    style={{ height: 56 }}
                >
                    <img
                        src={value}
                        alt="background"
                        className="w-full h-full object-cover"
                    />
                    <button
                        type="button"
                        onClick={() => onChange("")}
                        className="absolute top-1 right-1 bg-white/90 rounded-full shadow p-0.5 hover:bg-destructive/10 transition-colors"
                        title="Remove image"
                    >
                        <X className="size-3 text-destructive" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Label className="text-xs text-muted-foreground">{label}</Label>
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="mt-1 flex items-center gap-2 w-full border border-dashed rounded-md px-3 py-2.5 text-xs text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-colors"
            >
                <ImagePlus className="size-4 shrink-0" />
                <span>Upload image…</span>
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFile(file);
                        e.target.value = "";
                    }}
                />
            </button>
        </div>
    );
}

function BgSizeSelect({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: "cover" | "contain" | "repeat") => void;
}) {
    return (
        <div>
            <Label className="text-xs text-muted-foreground">Image Fit</Label>
            <Select
                value={value}
                onValueChange={(v) =>
                    onChange(v as "cover" | "contain" | "repeat")
                }
            >
                <SelectTrigger className="h-8 mt-1">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="cover">Cover (fill, crop)</SelectItem>
                    <SelectItem value="contain">
                        Contain (fit, no crop)
                    </SelectItem>
                    <SelectItem value="repeat">Tile (repeat)</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}

// ── Column configurator ───────────────────────────────────────────────
function ColumnConfigurator({
    columns,
    onChange,
    slotOptions,
    sectionType,
}: {
    columns: ColumnConfig[];
    onChange: (cols: ColumnConfig[]) => void;
    slotOptions: { value: string; label: string }[];
    sectionType: "header" | "footer";
}) {
    const numCols = columns.length;

    function setNumCols(n: number) {
        if (n === numCols) return;
        if (n > numCols) {
            const used = columns.reduce(
                (sum, c) => sum + parseFloat(c.width),
                0,
            );
            const remaining = Math.max(10, 100 - used);
            const next = [...columns];
            for (let i = numCols; i < n; i++) {
                next.push({ width: `${remaining}%`, element: "empty" });
            }
            onChange(next);
        } else {
            onChange(columns.slice(0, n));
        }
    }

    function updateCol(i: number, patch: Partial<ColumnConfig>) {
        onChange(columns.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
    }

    return (
        <div className="space-y-3">
            <div>
                <Label className="text-xs text-muted-foreground">Columns</Label>
                <Select
                    value={String(numCols)}
                    onValueChange={(v) => setNumCols(Number(v))}
                >
                    <SelectTrigger className="h-8 mt-1">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1">1 column</SelectItem>
                        <SelectItem value="2">2 columns</SelectItem>
                        {sectionType === "header" && (
                            <SelectItem value="3">3 columns</SelectItem>
                        )}
                    </SelectContent>
                </Select>
            </div>

            {columns.map((col, i) => (
                <div
                    key={i}
                    className="border rounded-md p-3 space-y-2 bg-muted/20"
                >
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Column {i + 1}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label className="text-xs text-muted-foreground">
                                Width
                            </Label>
                            <Input
                                value={col.width}
                                onChange={(e) =>
                                    updateCol(i, { width: e.target.value })
                                }
                                className="h-7 text-xs mt-0.5"
                                placeholder="50%"
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground">
                                Element
                            </Label>
                            <Select
                                value={col.element}
                                onValueChange={(v) =>
                                    updateCol(i, {
                                        element: v as HeaderElementSlot &
                                            FooterElementSlot,
                                    })
                                }
                            >
                                <SelectTrigger className="h-7 mt-0.5 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {slotOptions.map((opt) => (
                                        <SelectItem
                                            key={opt.value}
                                            value={opt.value}
                                        >
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    {col.element === "textLabel" && (
                        <div>
                            <Label className="text-xs text-muted-foreground">
                                Label text
                            </Label>
                            <Input
                                value={col.textLabelText ?? "INVOICE"}
                                onChange={(e) =>
                                    updateCol(i, {
                                        textLabelText: e.target.value,
                                    })
                                }
                                className="h-7 text-xs mt-0.5"
                            />
                        </div>
                    )}
                    {/* Alignment */}
                    <div>
                        <Label className="text-xs text-muted-foreground">
                            Alignment
                        </Label>
                        <div className="flex gap-1 mt-1">
                            {(["left", "center", "right"] as const).map((a) => {
                                const Icon =
                                    a === "left"
                                        ? AlignLeft
                                        : a === "center"
                                          ? AlignCenter
                                          : AlignRight;
                                return (
                                    <button
                                        key={a}
                                        type="button"
                                        title={a}
                                        onClick={() =>
                                            updateCol(i, { align: a })
                                        }
                                        className={`flex-1 flex items-center justify-center py-1.5 rounded border text-xs transition-colors ${
                                            (col.align ?? "left") === a
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "border-border hover:bg-muted"
                                        }`}
                                    >
                                        <Icon className="size-3.5" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    {col.element === "companyDetails" && (
                        <div>
                            <Label className="text-xs text-muted-foreground mb-1.5 block">
                                Visible Fields
                            </Label>
                            <div className="grid grid-cols-2 gap-y-1.5 gap-x-3">
                                {COMPANY_FIELD_OPTIONS.map((opt) => {
                                    const activeFields: CompanyField[] =
                                        col.companyFields ?? ALL_COMPANY_FIELDS;
                                    const checked = activeFields.includes(
                                        opt.value,
                                    );
                                    return (
                                        <label
                                            key={opt.value}
                                            className="flex items-center gap-2 cursor-pointer group"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={(e) => {
                                                    const next = e.target
                                                        .checked
                                                        ? [
                                                              ...activeFields,
                                                              opt.value,
                                                          ]
                                                        : activeFields.filter(
                                                              (f) =>
                                                                  f !==
                                                                  opt.value,
                                                          );
                                                    // keep at least one field
                                                    updateCol(i, {
                                                        companyFields:
                                                            next.length > 0
                                                                ? next
                                                                : activeFields,
                                                    });
                                                }}
                                                className="size-3.5 rounded"
                                            />
                                            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                                                {opt.label}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

// ── Section panel renderers ───────────────────────────────────────────

function GeneralSection({
    state,
    patch,
}: {
    state: WizardState;
    patch: (p: Partial<WizardState>) => void;
}) {
    return (
        <>
            <SectionGroup title="Template Properties">
                <div>
                    <Label>Template Name</Label>
                    <Input
                        value={state.name}
                        onChange={(e) => patch({ name: e.target.value })}
                        className="mt-1"
                        placeholder="My Invoice Template"
                    />
                </div>

                <div>
                    <Label className="mb-2 block">Document Type</Label>
                    <div className="flex gap-2">
                        {(
                            ["invoice", "estimate", "receipt"] as DocumentType[]
                        ).map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => patch({ documentType: t })}
                                className={`flex-1 py-2 rounded-md border text-sm capitalize transition-colors ${
                                    state.documentType === t
                                        ? "bg-primary text-primary-foreground border-primary font-medium"
                                        : "bg-background hover:bg-muted border-border"
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <Label className="mb-2 block">Page Size</Label>
                    <div className="flex gap-2">
                        {(["A4", "Letter"] as const).map((p) => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => patch({ pageSize: p })}
                                className={`flex-1 py-2 rounded-md border text-sm transition-colors ${
                                    state.pageSize === p
                                        ? "bg-primary text-primary-foreground border-primary font-medium"
                                        : "bg-background hover:bg-muted border-border"
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </SectionGroup>
        </>
    );
}

function HeaderFooterSection({
    state,
    patch,
}: {
    state: WizardState;
    patch: (p: Partial<WizardState>) => void;
}) {
    const hasLogo = state.headerColumns.some((c) => c.element === "logo");

    return (
        <>
            <SectionGroup title="Header">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Label className="text-xs text-muted-foreground">
                            Height (px)
                        </Label>
                        <Input
                            type="number"
                            min={60}
                            max={300}
                            value={state.headerHeight}
                            onChange={(e) =>
                                patch({ headerHeight: Number(e.target.value) })
                            }
                            className="h-8 mt-1"
                        />
                    </div>
                    <ColorInput
                        label="Background Color"
                        value={state.headerBackground}
                        onChange={(v) => patch({ headerBackground: v })}
                    />
                </div>

                <ImageUploadInput
                    label="Background Image"
                    value={state.headerBackgroundImage}
                    onChange={(v) => patch({ headerBackgroundImage: v })}
                />
                {state.headerBackgroundImage && (
                    <BgSizeSelect
                        value={state.headerBackgroundSize}
                        onChange={(v) => patch({ headerBackgroundSize: v })}
                    />
                )}

                <ColumnConfigurator
                    columns={state.headerColumns}
                    onChange={(cols) => patch({ headerColumns: cols })}
                    slotOptions={HEADER_SLOT_OPTIONS}
                    sectionType="header"
                />
            </SectionGroup>

            {hasLogo && (
                <SectionGroup title="Logo Options">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="text-xs text-muted-foreground">
                                Max Height
                            </Label>
                            <Input
                                value={state.logoMaxHeight}
                                onChange={(e) =>
                                    patch({ logoMaxHeight: e.target.value })
                                }
                                className="h-8 mt-1"
                                placeholder="80px"
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground">
                                Fit Mode
                            </Label>
                            <Select
                                value={state.logoFit}
                                onValueChange={(v) =>
                                    patch({
                                        logoFit: v as typeof state.logoFit,
                                    })
                                }
                            >
                                <SelectTrigger className="h-8 mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="contain">
                                        Contain
                                    </SelectItem>
                                    <SelectItem value="cover">
                                        Cover (crop)
                                    </SelectItem>
                                    <SelectItem value="fill">
                                        Stretch
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </SectionGroup>
            )}

            <SectionGroup title="Footer">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Label className="text-xs text-muted-foreground">
                            Height (px)
                        </Label>
                        <Input
                            type="number"
                            min={40}
                            max={200}
                            value={state.footerHeight}
                            onChange={(e) =>
                                patch({ footerHeight: Number(e.target.value) })
                            }
                            className="h-8 mt-1"
                        />
                    </div>
                    <ColorInput
                        label="Background Color"
                        value={state.footerBackground}
                        onChange={(v) => patch({ footerBackground: v })}
                    />
                </div>

                <ColorInput
                    label="Border Color"
                    value={state.footerBorderColor}
                    onChange={(v) => patch({ footerBorderColor: v })}
                />

                <ImageUploadInput
                    label="Background Image"
                    value={state.footerBackgroundImage}
                    onChange={(v) => patch({ footerBackgroundImage: v })}
                />
                {state.footerBackgroundImage && (
                    <BgSizeSelect
                        value={state.footerBackgroundSize}
                        onChange={(v) => patch({ footerBackgroundSize: v })}
                    />
                )}

                <ColumnConfigurator
                    columns={state.footerColumns}
                    onChange={(cols) => patch({ footerColumns: cols })}
                    slotOptions={FOOTER_SLOT_OPTIONS}
                    sectionType="footer"
                />
            </SectionGroup>
        </>
    );
}

function ThemeSection({
    state,
    patch,
}: {
    state: WizardState;
    patch: (p: Partial<WizardState>) => void;
}) {
    return (
        <>
            <SectionGroup title="Colors">
                <ColorInput
                    label="Primary Color"
                    value={state.primaryColor}
                    onChange={(v) => patch({ primaryColor: v })}
                />
                <ColorInput
                    label="Accent Color"
                    value={state.accentColor}
                    onChange={(v) => patch({ accentColor: v })}
                />
            </SectionGroup>

            <SectionGroup title="Typography">
                <div>
                    <Label>Font Family</Label>
                    <Select
                        value={state.fontFamily}
                        onValueChange={(v) => patch({ fontFamily: v })}
                    >
                        <SelectTrigger className="mt-1">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {FONT_OPTIONS.map((f) => (
                                <SelectItem key={f.value} value={f.value}>
                                    {f.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </SectionGroup>
        </>
    );
}

function BodySection({
    state,
    patch,
}: {
    state: WizardState;
    patch: (p: Partial<WizardState>) => void;
}) {
    const detailsLabel =
        state.documentType === "estimate"
            ? "Estimate Details"
            : state.documentType === "receipt"
              ? "Receipt Details"
              : "Invoice Details";

    // Visibility maps
    const firstPageVisible: Record<string, boolean> = {
        billTo: state.showBillTo,
        shipTo: state.showShipTo,
        details: state.showDetailsBlock,
        logo: state.showLogo,
        companyDetails: state.showCompanyDetails,
    };
    const firstPageLabels: Record<string, string> = {
        billTo: "Bill To",
        shipTo: "Ship To",
        details: detailsLabel,
        logo: "Company Logo",
        companyDetails: "Company Details",
    };
    const lastPageVisible: Record<string, boolean> = {
        divider: state.showDivider,
        totals: true, // always on
        notes: state.showNotes,
        terms: state.showTerms,
    };
    const lastPageLabels: Record<string, string> = {
        divider: "Divider Line",
        totals: "Totals Block",
        notes: "Notes",
        terms: "Terms & Conditions",
    };

    function moveFirstPage(idx: number, dir: -1 | 1) {
        const next = [...state.bodyFirstPageOrder];
        const swap = idx + dir;
        if (swap < 0 || swap >= next.length) return;
        [next[idx], next[swap]] = [next[swap], next[idx]];
        patch({ bodyFirstPageOrder: next });
    }

    function moveLastPage(idx: number, dir: -1 | 1) {
        const next = [...state.bodyLastPageOrder];
        const swap = idx + dir;
        if (swap < 0 || swap >= next.length) return;
        [next[idx], next[swap]] = [next[swap], next[idx]];
        patch({ bodyLastPageOrder: next });
    }

    function toggleFirstPage(key: string, checked: boolean) {
        const patchMap: Partial<WizardState> = {
            showBillTo: key === "billTo" ? checked : state.showBillTo,
            showShipTo: key === "shipTo" ? checked : state.showShipTo,
            showDetailsBlock:
                key === "details" ? checked : state.showDetailsBlock,
            showLogo: key === "logo" ? checked : state.showLogo,
            showCompanyDetails:
                key === "companyDetails" ? checked : state.showCompanyDetails,
        };
        patch(patchMap);
    }

    function toggleLastPage(key: string, checked: boolean) {
        const patchMap: Partial<WizardState> = {
            showDivider: key === "divider" ? checked : state.showDivider,
            showNotes: key === "notes" ? checked : state.showNotes,
            showTerms: key === "terms" ? checked : state.showTerms,
        };
        patch(patchMap);
    }

    return (
        <>
            <SectionGroup title="First Page Elements">
                <p className="text-xs text-muted-foreground -mt-1">
                    Toggle and reorder elements shown above the item table on
                    page 1.
                </p>
                <div className="space-y-2">
                    {state.bodyFirstPageOrder.map((key, idx) => (
                        <div
                            key={key}
                            className="flex items-center gap-2 p-2 rounded-md border bg-muted/20"
                        >
                            <input
                                type="checkbox"
                                checked={!!firstPageVisible[key]}
                                onChange={(e) =>
                                    toggleFirstPage(key, e.target.checked)
                                }
                                className="size-4 rounded shrink-0"
                                disabled={key === "totals"}
                            />
                            <span className="text-sm flex-1 text-muted-foreground">
                                {firstPageLabels[key]}
                            </span>
                            <div className="flex gap-0.5">
                                <button
                                    type="button"
                                    onClick={() => moveFirstPage(idx, -1)}
                                    disabled={idx === 0}
                                    className="p-1 rounded hover:bg-muted disabled:opacity-30"
                                >
                                    <ChevronUp className="size-3.5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => moveFirstPage(idx, 1)}
                                    disabled={
                                        idx ===
                                        state.bodyFirstPageOrder.length - 1
                                    }
                                    className="p-1 rounded hover:bg-muted disabled:opacity-30"
                                >
                                    <ChevronDown className="size-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </SectionGroup>

            <SectionGroup title="Last Page Elements">
                <p className="text-xs text-muted-foreground -mt-1">
                    Toggle and reorder elements shown after the item table on
                    the last page.
                </p>
                <div className="space-y-2">
                    {state.bodyLastPageOrder.map((key, idx) => (
                        <div
                            key={key}
                            className="flex items-center gap-2 p-2 rounded-md border bg-muted/20"
                        >
                            <input
                                type="checkbox"
                                checked={!!lastPageVisible[key]}
                                onChange={(e) =>
                                    toggleLastPage(key, e.target.checked)
                                }
                                className="size-4 rounded shrink-0"
                                disabled={key === "totals"}
                            />
                            <span className="text-sm flex-1 text-muted-foreground">
                                {lastPageLabels[key]}
                                {key === "totals" && (
                                    <span className="ml-1 text-xs text-muted-foreground/60">
                                        (always shown)
                                    </span>
                                )}
                            </span>
                            <div className="flex gap-0.5">
                                <button
                                    type="button"
                                    onClick={() => moveLastPage(idx, -1)}
                                    disabled={idx === 0}
                                    className="p-1 rounded hover:bg-muted disabled:opacity-30"
                                >
                                    <ChevronUp className="size-3.5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => moveLastPage(idx, 1)}
                                    disabled={
                                        idx ===
                                        state.bodyLastPageOrder.length - 1
                                    }
                                    className="p-1 rounded hover:bg-muted disabled:opacity-30"
                                >
                                    <ChevronDown className="size-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </SectionGroup>

            <SectionGroup title="Page Background" defaultOpen={false}>
                <ColorInput
                    label="Background Color"
                    value={state.bodyBackgroundColor || "#ffffff"}
                    onChange={(v) =>
                        patch({ bodyBackgroundColor: v === "#ffffff" ? "" : v })
                    }
                />
                <ImageUploadInput
                    label="Background Image"
                    value={state.bodyBackgroundImage}
                    onChange={(v) => patch({ bodyBackgroundImage: v })}
                />
                {state.bodyBackgroundImage && (
                    <BgSizeSelect
                        value={state.bodyBackgroundSize}
                        onChange={(v) => patch({ bodyBackgroundSize: v })}
                    />
                )}
            </SectionGroup>
        </>
    );
}

function TableSection({
    state,
    patch,
}: {
    state: WizardState;
    patch: (p: Partial<WizardState>) => void;
}) {
    return (
        <>
            <SectionGroup title="Columns">
                <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
                    {ITEM_COLUMN_OPTIONS.map((col) => (
                        <label
                            key={col.value}
                            className="flex items-center gap-2 cursor-pointer group"
                        >
                            <input
                                type="checkbox"
                                checked={state.itemColumns.includes(col.value)}
                                onChange={(e) => {
                                    const next = e.target.checked
                                        ? [...state.itemColumns, col.value]
                                        : state.itemColumns.filter(
                                              (c) => c !== col.value,
                                          );
                                    patch({
                                        itemColumns:
                                            next.length > 0
                                                ? next
                                                : state.itemColumns,
                                    });
                                }}
                                className="size-4 rounded"
                            />
                            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                                {col.label}
                            </span>
                        </label>
                    ))}
                </div>
            </SectionGroup>

            <SectionGroup title="Appearance">
                <ColorInput
                    label="Header Background"
                    value={state.itemHeaderBackground}
                    onChange={(v) => patch({ itemHeaderBackground: v })}
                />
                <ColorInput
                    label="Header Text Color"
                    value={state.itemHeaderColor}
                    onChange={(v) => patch({ itemHeaderColor: v })}
                />
                <ColorInput
                    label="Alternate Row Color"
                    value={state.itemAlternateRowColor}
                    onChange={(v) => patch({ itemAlternateRowColor: v })}
                />
            </SectionGroup>
        </>
    );
}

function TotalsSection({
    state,
    patch,
}: {
    state: WizardState;
    patch: (p: Partial<WizardState>) => void;
}) {
    return (
        <SectionGroup title="Visible Rows">
            <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
                {TOTALS_ROW_OPTIONS.map((row) => (
                    <label
                        key={row.value}
                        className="flex items-center gap-2 cursor-pointer group"
                    >
                        <input
                            type="checkbox"
                            checked={state.totalsShow.includes(row.value)}
                            onChange={(e) => {
                                const next = e.target.checked
                                    ? [...state.totalsShow, row.value]
                                    : state.totalsShow.filter(
                                          (r) => r !== row.value,
                                      );
                                patch({ totalsShow: next });
                            }}
                            className="size-4 rounded"
                        />
                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                            {row.label}
                        </span>
                    </label>
                ))}
            </div>
        </SectionGroup>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────
export default function TemplateEditorPage() {
    const navigate = useNavigate();
    const { id: editId } = useParams<{ id?: string }>();
    const dispatch = useAppDispatch();
    const allTemplates = useAppSelector(selectAllTemplates);

    const existingTemplate = editId
        ? allTemplates.find((t) => t.id === editId)
        : undefined;

    const [activeSection, setActiveSection] = useState<Section>("general");
    const [state, setState] = useState<WizardState>(() =>
        existingTemplate
            ? wizardStateFromTemplate(existingTemplate)
            : defaultWizardState(),
    );

    function patch(partial: Partial<WizardState>) {
        setState((s) => ({ ...s, ...partial }));
    }

    // Live preview
    const previewTemplate = useMemo(
        () => buildTemplateFromWizard(state, "preview_tmpl"),
        [state],
    );
    const previewDoc: StoredDocument = useMemo(
        () => ({
            ...PREVIEW_DOC_BASE,
            documentType: state.documentType,
            templateSnapshot: previewTemplate,
            data: {
                ...PREVIEW_DOC_BASE.data,
                meta:
                    state.documentType === "estimate"
                        ? {
                              type: "estimate",
                              number: "EST-0001",
                              date: "2025-01-15",
                              expiryDate: "2025-02-15",
                              reference: "",
                              poNumber: "",
                              projectName: "",
                              currency: "USD",
                          }
                        : state.documentType === "receipt"
                          ? {
                                type: "receipt",
                                number: "REC-0001",
                                issueDate: "2025-01-15",
                                paymentDate: "2025-01-15",
                                paymentMethod: "Credit Card",
                                transactionId: "TXN-001",
                                relatedInvoiceNumber: "INV-001",
                                currency: "USD",
                            }
                          : PREVIEW_DOC_BASE.data.meta,
            },
        }),
        [previewTemplate, state.documentType],
    );

    const previewTotals: TotalsResult = useMemo(
        () =>
            calculateTotals(
                previewDoc.data.items,
                previewDoc.data.totalsConfig,
            ),
        [previewDoc],
    );

    // Auto-scale preview to fit container width
    const previewContainerRef = useRef<HTMLDivElement>(null);
    const [previewScale, setPreviewScale] = useState(0.55);
    useEffect(() => {
        const el = previewContainerRef.current;
        if (!el) return;
        const obs = new ResizeObserver(([entry]) => {
            const w = entry.contentRect.width - 48; // 24px padding each side
            const pageW = state.pageSize === "A4" ? 794 : 816;
            setPreviewScale(Math.min(0.85, Math.max(0.3, w / pageW)));
        });
        obs.observe(el);
        return () => obs.disconnect();
    }, [state.pageSize]);

    function handleSave() {
        const template = buildTemplateFromWizard(state, editId);
        if (editId) {
            dispatch(updateCustomTemplate(template));
        } else {
            dispatch(addCustomTemplate(template));
        }
        navigate("/");
    }

    function renderSection() {
        switch (activeSection) {
            case "general":
                return <GeneralSection state={state} patch={patch} />;
            case "header-footer":
                return <HeaderFooterSection state={state} patch={patch} />;
            case "theme":
                return <ThemeSection state={state} patch={patch} />;
            case "body":
                return <BodySection state={state} patch={patch} />;
            case "table":
                return <TableSection state={state} patch={patch} />;
            case "totals":
                return <TotalsSection state={state} patch={patch} />;
        }
    }

    const pageH = state.pageSize === "A4" ? 1123 : 1056;

    return (
        <FillModeProvider
            value={{
                fillMode: false,
                showBounds: false,
                docId: "preview",
                onUpdateCompany: () => {},
                onUpdateClient: () => {},
                onUpdateInvoiceMeta: () => {},
                onUpdateEstimateMeta: () => {},
                onUpdateReceiptMeta: () => {},
                onUpdateItems: () => {},
                onUpdateTotalsConfig: () => {},
                onUpdateNotes: () => {},
                onUpdateTerms: () => {},
                onUpdateData: () => {},
            }}
        >
            <div className="min-h-screen bg-background flex flex-col">
                {/* Top bar */}
                <header className="border-b bg-card shrink-0 z-10">
                    <div className="px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(-1)}
                            >
                                <ArrowLeft className="size-4 mr-1" />
                                Back
                            </Button>
                            <span className="text-muted-foreground select-none">
                                |
                            </span>
                            <h1 className="text-base font-semibold">
                                {editId ? "Edit Template" : "New Template"}
                            </h1>
                        </div>
                        <Button
                            onClick={handleSave}
                            size="sm"
                            className="gap-1.5"
                        >
                            <Check className="size-4" />
                            Save Template
                        </Button>
                    </div>
                </header>

                <div className="flex flex-1 overflow-hidden">
                    {/* Icon sidebar nav */}
                    <nav className="w-18 shrink-0 border-r bg-card flex flex-col items-center py-3 gap-1">
                        {NAV_SECTIONS.map(({ id, label, Icon }) => (
                            <button
                                key={id}
                                type="button"
                                title={label}
                                onClick={() => setActiveSection(id)}
                                className={`w-14 flex flex-col items-center gap-1 py-2.5 px-1 rounded-lg text-center transition-colors ${
                                    activeSection === id
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`}
                            >
                                <Icon className="size-5 shrink-0" />
                                <span className="text-[10px] font-medium leading-tight">
                                    {label}
                                </span>
                            </button>
                        ))}
                    </nav>

                    {/* Settings panel */}
                    <div className="w-85 shrink-0 border-r bg-card flex flex-col overflow-hidden">
                        <div className="px-4 py-3 border-b shrink-0">
                            <h2 className="text-sm font-semibold">
                                {
                                    NAV_SECTIONS.find(
                                        (s) => s.id === activeSection,
                                    )?.label
                                }
                            </h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            {renderSection()}
                        </div>
                    </div>

                    {/* Live preview */}
                    <div
                        ref={previewContainerRef}
                        className="flex-1 overflow-auto bg-muted/30 flex flex-col items-center py-8 px-6"
                    >
                        <p className="text-xs text-muted-foreground mb-6 uppercase tracking-widest font-medium">
                            Live Preview
                        </p>
                        <div
                            style={{
                                transform: `scale(${previewScale})`,
                                transformOrigin: "top center",
                                marginBottom: `${pageH * (previewScale - 1)}px`,
                            }}
                        >
                            <CanvasPage
                                doc={previewDoc}
                                totals={previewTotals}
                                pageNumber={1}
                                totalPages={1}
                                zoom={1}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </FillModeProvider>
    );
}
