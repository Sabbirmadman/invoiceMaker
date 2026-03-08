import type { TemplateElement } from "@/types/template";
import type { InvoiceMeta } from "@/types/document";
import { InlineField } from "@/components/fill-mode/InlineField";
import { useFillMode } from "@/components/fill-mode/FillModeContext";

interface Props {
    element: TemplateElement;
    meta: InvoiceMeta;
}

const LABEL_STYLE =
    "text-[10px] uppercase tracking-widest font-semibold opacity-60 leading-none mb-0.5";
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

function FieldRow({
    label,
    value,
    fillMode,
    onChange,
    placeholder,
    inputType = "text",
    onDateChange,
}: FieldRowProps) {
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

    const f = (field: string) => {
        const fields = element.config?.fields as string[] | undefined;
        return !fields || fields.includes(field);
    };

    const accentColor =
        element.styles?.accentColor ??
        element.styles?.borderLeftColor ??
        "var(--doc-accent, #2563eb)";
    const textAlign = (element.styles?.textAlign ??
        "left") as React.CSSProperties["textAlign"];
    const isRight = textAlign === "right";
    const contentCols =
        (element.config?.contentCols as number | undefined) ?? 1;

    const containerStyle: React.CSSProperties = {
        ...(element.styles as React.CSSProperties),
        textAlign,
    };

    const fieldsStyle: React.CSSProperties =
        contentCols > 1
            ? {
                  display: "grid",
                  gridTemplateColumns: `repeat(${contentCols}, 1fr)`,
                  gap: "0 12px",
                  alignItems: "start",
              }
            : { display: "flex", flexDirection: "column", flex: 1 };

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
            <div style={fieldsStyle}>
                {f("number") && (
                    <FieldRow
                        label="Invoice #"
                        value={meta.number}
                        fillMode={fillMode}
                        onChange={(v) => onUpdateInvoiceMeta({ number: v })}
                        placeholder="INV-001"
                    />
                )}
                {f("date") && (
                    <FieldRow
                        label="Date"
                        value={meta.date}
                        fillMode={fillMode}
                        inputType="date"
                        onDateChange={(v) => onUpdateInvoiceMeta({ date: v })}
                        placeholder=""
                    />
                )}
                {f("dueDate") && (fillMode || meta.dueDate) && (
                    <FieldRow
                        label="Due Date"
                        value={meta.dueDate}
                        fillMode={fillMode}
                        inputType="date"
                        onDateChange={(v) =>
                            onUpdateInvoiceMeta({ dueDate: v })
                        }
                        placeholder=""
                    />
                )}
                {f("terms") && (fillMode || meta.terms) && (
                    <FieldRow
                        label="Terms"
                        value={meta.terms}
                        fillMode={fillMode}
                        onChange={(v) => onUpdateInvoiceMeta({ terms: v })}
                        placeholder="e.g. Net 30"
                    />
                )}
                {f("poNumber") && (fillMode || meta.poNumber) && (
                    <FieldRow
                        label="PO Number"
                        value={meta.poNumber}
                        fillMode={fillMode}
                        onChange={(v) => onUpdateInvoiceMeta({ poNumber: v })}
                        placeholder="PO#"
                    />
                )}
                {f("projectName") && (fillMode || meta.projectName) && (
                    <FieldRow
                        label="Project"
                        value={meta.projectName}
                        fillMode={fillMode}
                        onChange={(v) =>
                            onUpdateInvoiceMeta({ projectName: v })
                        }
                        placeholder="Project name"
                    />
                )}
                {f("reference") && (fillMode || meta.reference) && (
                    <FieldRow
                        label="Reference"
                        value={meta.reference}
                        fillMode={fillMode}
                        onChange={(v) => onUpdateInvoiceMeta({ reference: v })}
                        placeholder="Ref #"
                    />
                )}
                {f("placeOfSupply") && (fillMode || meta.placeOfSupply) && (
                    <FieldRow
                        label="Place of Supply"
                        value={meta.placeOfSupply}
                        fillMode={fillMode}
                        onChange={(v) =>
                            onUpdateInvoiceMeta({ placeOfSupply: v })
                        }
                        placeholder="State / Country"
                    />
                )}
            </div>
        </div>
    );
}
