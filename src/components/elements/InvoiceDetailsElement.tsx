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
        <div className="py-1.5 border-b border-current/10 last:border-0" style={{ minWidth: "100px" }}>
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
    const layout = (element.config?.layout as string | undefined) ?? "vertical";

    const containerStyle: React.CSSProperties = {
        ...(element.styles as React.CSSProperties),
        textAlign,
    };

    const isHorizontal = layout === "horizontal";
    const justify = (element.config?.justify as string | undefined) ?? "stretch";
    const fieldsStyle: React.CSSProperties =
        isHorizontal
            ? { display: "flex", flexDirection: "row", flexWrap: "nowrap", gap: "0 16px", alignItems: "start", width: "100%", justifyContent: justify === "stretch" ? "flex-start" : justify }
            : { display: "flex", flexDirection: "column", flex: 1 };
    const fieldItemStyle: React.CSSProperties = isHorizontal ? { ...(justify === "stretch" ? { flex: 1 } : {}), minWidth: 0 } : {};

    return (
        <div className="flex flex-col h-full" style={containerStyle}>
            {/* Title block */}
            {f("title") && (
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
            )}

            {/* Fields */}
            <div style={fieldsStyle}>
                {f("number") && (
                    <div style={fieldItemStyle}><FieldRow
                        label="Invoice #"
                        value={meta.number}
                        fillMode={fillMode}
                        onChange={(v) => onUpdateInvoiceMeta({ number: v })}
                        placeholder="INV-001"
                    /></div>
                )}
                {f("date") && (
                    <div style={fieldItemStyle}><FieldRow
                        label="Date"
                        value={meta.date}
                        fillMode={fillMode}
                        inputType="date"
                        onDateChange={(v) => onUpdateInvoiceMeta({ date: v })}
                        placeholder=""
                    /></div>
                )}
                {f("dueDate") && (fillMode || meta.dueDate) && (
                    <div style={fieldItemStyle}><FieldRow
                        label="Due Date"
                        value={meta.dueDate}
                        fillMode={fillMode}
                        inputType="date"
                        onDateChange={(v) =>
                            onUpdateInvoiceMeta({ dueDate: v })
                        }
                        placeholder=""
                    /></div>
                )}
                {f("terms") && (fillMode || meta.terms) && (
                    <div style={fieldItemStyle}><FieldRow
                        label="Terms"
                        value={meta.terms}
                        fillMode={fillMode}
                        onChange={(v) => onUpdateInvoiceMeta({ terms: v })}
                        placeholder="e.g. Net 30"
                    /></div>
                )}
                {f("poNumber") && (fillMode || meta.poNumber) && (
                    <div style={fieldItemStyle}><FieldRow
                        label="PO Number"
                        value={meta.poNumber}
                        fillMode={fillMode}
                        onChange={(v) => onUpdateInvoiceMeta({ poNumber: v })}
                        placeholder="PO#"
                    /></div>
                )}
                {f("projectName") && (fillMode || meta.projectName) && (
                    <div style={fieldItemStyle}><FieldRow
                        label="Project"
                        value={meta.projectName}
                        fillMode={fillMode}
                        onChange={(v) =>
                            onUpdateInvoiceMeta({ projectName: v })
                        }
                        placeholder="Project name"
                    /></div>
                )}
                {f("reference") && (fillMode || meta.reference) && (
                    <div style={fieldItemStyle}><FieldRow
                        label="Reference"
                        value={meta.reference}
                        fillMode={fillMode}
                        onChange={(v) => onUpdateInvoiceMeta({ reference: v })}
                        placeholder="Ref #"
                    /></div>
                )}
                {f("placeOfSupply") && (fillMode || meta.placeOfSupply) && (
                    <div style={fieldItemStyle}><FieldRow
                        label="Place of Supply"
                        value={meta.placeOfSupply}
                        fillMode={fillMode}
                        onChange={(v) =>
                            onUpdateInvoiceMeta({ placeOfSupply: v })
                        }
                        placeholder="State / Country"
                    /></div>
                )}
            </div>
        </div>
    );
}
