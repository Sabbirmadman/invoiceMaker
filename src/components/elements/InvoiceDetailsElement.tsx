import type { TemplateElement } from "@/types/template";
import type { InvoiceMeta } from "@/types/document";
import { InlineField } from "@/components/fill-mode/InlineField";
import { useFillMode } from "@/components/fill-mode/FillModeContext";

interface Props {
    element: TemplateElement;
    meta: InvoiceMeta;
}

const LABEL_STYLE = "text-[10px] uppercase tracking-widest font-semibold opacity-60 leading-none mb-0.5";
const VALUE_STYLE = "font-medium text-sm leading-snug";

interface FieldRowProps {
    label: string;
    value: string;
    fillMode: boolean;
    onChange?: (v: string) => void;
    placeholder?: string;
    inputType?: string;
    onDateChange?: (v: string) => void;
}

function FieldRow({ label, value, fillMode, onChange, placeholder, inputType = "text", onDateChange }: FieldRowProps) {
    return (
        <div className="py-1.5 border-b border-current/10 last:border-0">
            <div className={LABEL_STYLE}>{label}</div>
            {fillMode ? (
                inputType === "date" ? (
                    <input
                        type="date"
                        value={value}
                        onChange={(e) => onDateChange?.(e.target.value)}
                        className="w-full bg-transparent border border-transparent hover:border-blue-300 focus:border-blue-500 focus:outline-none rounded px-1 text-sm font-medium"
                    />
                ) : (
                    <InlineField
                        value={value}
                        onChange={onChange!}
                        placeholder={placeholder}
                        className={VALUE_STYLE}
                    />
                )
            ) : (
                <div className={VALUE_STYLE}>{value || "—"}</div>
            )}
        </div>
    );
}

export function InvoiceDetailsElement({ element, meta }: Props) {
    const { fillMode, onUpdateInvoiceMeta } = useFillMode();

    const accentColor = element.styles?.accentColor ?? element.styles?.borderLeftColor ?? "#2563eb";
    const textAlign = (element.styles?.textAlign ?? "left") as React.CSSProperties["textAlign"];
    const isRight = textAlign === "right";

    const containerStyle: React.CSSProperties = {
        ...(element.styles as React.CSSProperties),
        textAlign,
    };

    return (
        <div className="flex flex-col h-full" style={containerStyle}>
            {/* Title block */}
            <div
                className="mb-3 pb-2"
                style={{
                    borderBottom: `2px solid ${accentColor}`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isRight ? "flex-end" : "flex-start",
                }}
            >
                <div
                    className="text-3xl font-black uppercase tracking-widest leading-none"
                    style={{ color: accentColor, letterSpacing: "0.12em" }}
                >
                    INVOICE
                </div>
            </div>

            {/* Fields */}
            <div className="flex flex-col flex-1">
                <FieldRow
                    label="Invoice #"
                    value={meta.number}
                    fillMode={fillMode}
                    onChange={(v) => onUpdateInvoiceMeta({ number: v })}
                    placeholder="INV-001"
                />
                <FieldRow
                    label="Date"
                    value={meta.date}
                    fillMode={fillMode}
                    inputType="date"
                    onDateChange={(v) => onUpdateInvoiceMeta({ date: v })}
                    placeholder=""
                />
                {(fillMode || meta.dueDate) && (
                    <FieldRow
                        label="Due Date"
                        value={meta.dueDate}
                        fillMode={fillMode}
                        inputType="date"
                        onDateChange={(v) => onUpdateInvoiceMeta({ dueDate: v })}
                        placeholder=""
                    />
                )}
                {(fillMode || meta.terms) && (
                    <FieldRow
                        label="Terms"
                        value={meta.terms}
                        fillMode={fillMode}
                        onChange={(v) => onUpdateInvoiceMeta({ terms: v })}
                        placeholder="e.g. Net 30"
                    />
                )}
                {(fillMode || meta.poNumber) && (
                    <FieldRow
                        label="PO Number"
                        value={meta.poNumber}
                        fillMode={fillMode}
                        onChange={(v) => onUpdateInvoiceMeta({ poNumber: v })}
                        placeholder="PO#"
                    />
                )}
                {(fillMode || meta.projectName) && (
                    <FieldRow
                        label="Project"
                        value={meta.projectName}
                        fillMode={fillMode}
                        onChange={(v) => onUpdateInvoiceMeta({ projectName: v })}
                        placeholder="Project name"
                    />
                )}
                {(fillMode || meta.reference) && (
                    <FieldRow
                        label="Reference"
                        value={meta.reference}
                        fillMode={fillMode}
                        onChange={(v) => onUpdateInvoiceMeta({ reference: v })}
                        placeholder="Ref #"
                    />
                )}
                {(fillMode || meta.placeOfSupply) && (
                    <FieldRow
                        label="Place of Supply"
                        value={meta.placeOfSupply}
                        fillMode={fillMode}
                        onChange={(v) => onUpdateInvoiceMeta({ placeOfSupply: v })}
                        placeholder="State / Country"
                    />
                )}
            </div>
        </div>
    );
}
