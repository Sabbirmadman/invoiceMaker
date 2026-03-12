
import type { TemplateElement } from "@/types/template";
import type { DocumentMeta, InvoiceMeta, EstimateMeta, ReceiptMeta } from "@/types/document";
import type { DocumentType } from "@/types/common";
import { InlineField } from "@/components/fill-mode/InlineField";
import { useFillMode } from "@/components/fill-mode/FillModeContext";

interface Props {
    element: TemplateElement;
    meta: DocumentMeta;
    /** Override document type (used when widget type is "documentInfo" with explicit config.docType) */
    docType?: DocumentType;
}

const LABEL_STYLE = "text-[10px] uppercase tracking-widest font-semibold opacity-60 leading-none mb-0.5";
const VALUE_STYLE = "font-medium text-sm leading-snug";
const DATE_INPUT = "w-full bg-transparent border border-transparent hover:border-blue-300 focus:border-blue-500 focus:outline-none rounded px-0.5 py-0 text-sm font-medium";

/** Format an ISO date string (YYYY-MM-DD) to MM/DD/YYYY for display. */
function formatDateDisplay(iso: string): string {
    if (!iso) return "";
    const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? `${m[2]}/${m[3]}/${m[1]}` : iso;
}

interface TableStyle {
    labelBg: string;
    labelColor: string;
    valueBg: string;
    valueColor: string;
    borderColor: string;
}

function FieldRow({ label, value, fillMode, onChange, inputType = "text", onDateChange, tableStyle }: {
    label: string; value: string; fillMode: boolean;
    onChange?: (v: string) => void; inputType?: string; onDateChange?: (v: string) => void;
    tableStyle?: TableStyle;
}) {
    if (tableStyle) {
        const valueNode = fillMode
            ? inputType === "date"
                ? <input type="date" value={value} onChange={(e) => onDateChange?.(e.target.value)} className={DATE_INPUT} style={{ height: '1lh', font: 'inherit', color: tableStyle.valueColor }} />
                : <InlineField value={value} onChange={onChange!} className={VALUE_STYLE} />
            : <span style={{ color: tableStyle.valueColor }}>{inputType === "date" ? (formatDateDisplay(value) || "\u2014") : (value || "\u2014")}</span>;

        return (
            <div style={{ display: "flex", borderBottom: `1px solid ${tableStyle.borderColor}` }}>
                <div style={{
                    padding: "6px 10px",
                    background: tableStyle.labelBg,
                    color: tableStyle.labelColor,
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    width: "42%",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                }}>
                    {label}
                </div>
                <div style={{
                    flex: 1,
                    padding: "6px 10px",
                    background: tableStyle.valueBg,
                    fontSize: 13,
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                }}>
                    {valueNode}
                </div>
            </div>
        );
    }

    return (
        <div className="py-1.5 border-b border-current/10 last:border-0 w-full">
            <div className={LABEL_STYLE}>{label}</div>
            {fillMode ? (
                inputType === "date" ? (
                    <input type="date" value={value} onChange={(e) => onDateChange?.(e.target.value)} className={DATE_INPUT} style={{ height: '1lh', font: 'inherit' }} />
                ) : (
                    <InlineField value={value} onChange={onChange!} className={VALUE_STYLE} />
                )
            ) : (
                <div className={VALUE_STYLE}>
                    {inputType === "date" ? (formatDateDisplay(value) || "\u2014") : (value || "\u2014")}
                </div>
            )}
        </div>
    );
}

export function DocumentInfoElement({ element, meta, docType: docTypeProp }: Props) {
    const { fillMode, onUpdateInvoiceMeta, onUpdateEstimateMeta, onUpdateReceiptMeta } = useFillMode();

    const f = (field: string) => {
        const fields = element.config?.fields as string[] | undefined;
        return !fields || fields.includes(field);
    };

    const docType: DocumentType = (element.config?.docType as DocumentType | undefined) ?? docTypeProp ?? meta.type;

    const accentColor = (element.styles?.accentColor as string | undefined) ?? "var(--doc-accent, #2563eb)";
    const textAlign = ((element.styles?.textAlign as string | undefined) ?? "left") as React.CSSProperties["textAlign"];
    const isRight = textAlign === "right";
    const layout = (element.config?.layout as string | undefined) ?? "vertical";
    const isHorizontal = layout === "horizontal";
    const isTable = layout === "table";
    const gridColumns = (element.config?.gridColumns as number | undefined) ?? 3;

    // Table layout style config
    const tableStyle: TableStyle | undefined = isTable ? {
        labelBg: (element.styles?.labelBg as string | undefined) ?? "#111111",
        labelColor: (element.styles?.labelColor as string | undefined) ?? "#ffffff",
        valueBg: (element.styles?.valueBg as string | undefined) ?? "#ffffff",
        valueColor: (element.styles?.valueColor as string | undefined) ?? "#111111",
        borderColor: (element.styles?.tableBorderColor as string | undefined) ?? "#e5e7eb",
    } : undefined;

    const containerStyle: React.CSSProperties = {
        ...(element.styles as React.CSSProperties),
        textAlign,
    };

    const fieldsStyle: React.CSSProperties = isHorizontal
        ? { display: "grid", gridTemplateColumns: `repeat(${gridColumns}, 1fr)`, gap: "0 16px", width: "100%", alignItems: "start" }
        : isTable
          ? { display: "flex", flexDirection: "column", width: "100%", border: `1px solid ${tableStyle!.borderColor}`, borderRadius: 4, overflow: "hidden" }
          : { display: "flex", flexDirection: "column", width: "100%" };
    const fieldItemStyle: React.CSSProperties = isTable ? { display: "contents" } : { minWidth: 0, width: "100%" };

    const TITLE_MAP: Record<string, string> = { invoice: "INVOICE", estimate: "ESTIMATE", receipt: "RECEIPT" };
    const title = TITLE_MAP[docType] ?? "INVOICE";

    // Helper to safely get typed meta fields
    const inv = meta as InvoiceMeta;
    const est = meta as EstimateMeta;
    const rec = meta as ReceiptMeta;

    return (
        <div className="flex flex-col h-full" style={containerStyle}>
            {f("title") && (
                <div
                    className="mb-3 pb-2"
                    style={{ borderBottom: "2px solid " + accentColor, display: "flex", flexDirection: "column", alignItems: isRight ? "flex-end" : "flex-start" }}
                >
                    <div
                        className="text-3xl font-black uppercase tracking-widest leading-none"
                        style={{ color: accentColor, letterSpacing: "0.12em" }}
                    >
                        {title}
                    </div>
                </div>
            )}

            <div style={fieldsStyle}>
                {/* Number */}
                {f("number") && (
                    <div style={fieldItemStyle}>
                        <FieldRow
                            label={docType === "estimate" ? "Estimate #" : docType === "receipt" ? "Receipt #" : "Invoice #"}
                            value={docType === "estimate" ? (est.number ?? "") : docType === "receipt" ? (rec.number ?? "") : (inv.number ?? "")}
                            fillMode={fillMode}
                            tableStyle={tableStyle}
                            onChange={(v) => {
                                if (docType === "estimate") onUpdateEstimateMeta({ number: v });
                                else if (docType === "receipt") onUpdateReceiptMeta({ number: v });
                                else onUpdateInvoiceMeta({ number: v });
                            }}
                        />
                    </div>
                )}

                {/* Date */}
                {f("date") && (
                    <div style={fieldItemStyle}>
                        <FieldRow
                            label={docType === "receipt" ? "Issue Date" : "Date"}
                            value={docType === "estimate" ? (est.date ?? "") : docType === "receipt" ? (rec.issueDate ?? "") : (inv.date ?? "")}
                            fillMode={fillMode}
                            tableStyle={tableStyle}
                            inputType="date"
                            onDateChange={(v) => {
                                if (docType === "estimate") onUpdateEstimateMeta({ date: v });
                                else if (docType === "receipt") onUpdateReceiptMeta({ issueDate: v });
                                else onUpdateInvoiceMeta({ date: v });
                            }}
                        />
                    </div>
                )}

                {/* Due Date -- invoice only */}
                {docType === "invoice" && f("dueDate") && (
                    <div style={fieldItemStyle}>
                        <FieldRow
                            label="Due Date"
                            value={inv.dueDate ?? ""}
                            fillMode={fillMode}
                            tableStyle={tableStyle}
                            inputType="date"
                            onDateChange={(v) => onUpdateInvoiceMeta({ dueDate: v })}
                        />
                    </div>
                )}

                {/* Expiry Date -- estimate only */}
                {docType === "estimate" && f("expiryDate") && (
                    <div style={fieldItemStyle}>
                        <FieldRow
                            label="Expiry Date"
                            value={est.expiryDate ?? ""}
                            fillMode={fillMode}
                            tableStyle={tableStyle}
                            inputType="date"
                            onDateChange={(v) => onUpdateEstimateMeta({ expiryDate: v })}
                        />
                    </div>
                )}

                {/* Terms -- invoice only */}
                {docType === "invoice" && f("terms") && (
                    <div style={fieldItemStyle}>
                        <FieldRow
                            label="Terms"
                            value={inv.terms ?? ""}
                            fillMode={fillMode}
                            tableStyle={tableStyle}
                            onChange={(v) => onUpdateInvoiceMeta({ terms: v })}
                        />
                    </div>
                )}

                {/* PO Number -- invoice + estimate */}
                {(docType === "invoice" || docType === "estimate") && f("poNumber") && (
                    <div style={fieldItemStyle}>
                        <FieldRow
                            label="PO Number"
                            value={docType === "estimate" ? (est.poNumber ?? "") : (inv.poNumber ?? "")}
                            fillMode={fillMode}
                            tableStyle={tableStyle}
                            onChange={(v) => {
                                if (docType === "estimate") onUpdateEstimateMeta({ poNumber: v });
                                else onUpdateInvoiceMeta({ poNumber: v });
                            }}
                        />
                    </div>
                )}

                {/* Project -- invoice + estimate */}
                {(docType === "invoice" || docType === "estimate") && f("projectName") && (
                    <div style={fieldItemStyle}>
                        <FieldRow
                            label="Project"
                            value={docType === "estimate" ? (est.projectName ?? "") : (inv.projectName ?? "")}
                            fillMode={fillMode}
                            tableStyle={tableStyle}
                            onChange={(v) => {
                                if (docType === "estimate") onUpdateEstimateMeta({ projectName: v });
                                else onUpdateInvoiceMeta({ projectName: v });
                            }}
                        />
                    </div>
                )}

                {/* Reference -- invoice + estimate */}
                {(docType === "invoice" || docType === "estimate") && f("reference") && (
                    <div style={fieldItemStyle}>
                        <FieldRow
                            label="Reference"
                            value={docType === "estimate" ? (est.reference ?? "") : (inv.reference ?? "")}
                            fillMode={fillMode}
                            tableStyle={tableStyle}
                            onChange={(v) => {
                                if (docType === "estimate") onUpdateEstimateMeta({ reference: v });
                                else onUpdateInvoiceMeta({ reference: v });
                            }}
                        />
                    </div>
                )}

                {/* Place of Supply -- invoice only */}
                {docType === "invoice" && f("placeOfSupply") && (
                    <div style={fieldItemStyle}>
                        <FieldRow
                            label="Place of Supply"
                            value={inv.placeOfSupply ?? ""}
                            fillMode={fillMode}
                            tableStyle={tableStyle}
                            onChange={(v) => onUpdateInvoiceMeta({ placeOfSupply: v })}
                        />
                    </div>
                )}

                {/* Payment Date -- receipt only */}
                {docType === "receipt" && f("paymentDate") && (
                    <div style={fieldItemStyle}>
                        <FieldRow
                            label="Payment Date"
                            value={rec.paymentDate ?? ""}
                            fillMode={fillMode}
                            tableStyle={tableStyle}
                            inputType="date"
                            onDateChange={(v) => onUpdateReceiptMeta({ paymentDate: v })}
                        />
                    </div>
                )}

                {/* Payment Method -- receipt only */}
                {docType === "receipt" && f("paymentMethod") && (
                    <div style={fieldItemStyle}>
                        <FieldRow
                            label="Payment Method"
                            value={rec.paymentMethod ?? ""}
                            fillMode={fillMode}
                            tableStyle={tableStyle}
                            onChange={(v) => onUpdateReceiptMeta({ paymentMethod: v })}
                        />
                    </div>
                )}

                {/* Transaction ID -- receipt only */}
                {docType === "receipt" && f("transactionId") && (
                    <div style={fieldItemStyle}>
                        <FieldRow
                            label="Transaction ID"
                            value={rec.transactionId ?? ""}
                            fillMode={fillMode}
                            tableStyle={tableStyle}
                            onChange={(v) => onUpdateReceiptMeta({ transactionId: v })}
                        />
                    </div>
                )}

                {/* Related Invoice # -- receipt only */}
                {docType === "receipt" && f("relatedInvoiceNumber") && (
                    <div style={fieldItemStyle}>
                        <FieldRow
                            label="Related Invoice #"
                            value={rec.relatedInvoiceNumber ?? ""}
                            fillMode={fillMode}
                            tableStyle={tableStyle}
                            onChange={(v) => onUpdateReceiptMeta({ relatedInvoiceNumber: v })}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
