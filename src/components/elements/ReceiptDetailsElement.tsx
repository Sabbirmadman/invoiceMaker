import type { TemplateElement } from "@/types/template";
import type { ReceiptMeta } from "@/types/document";
import { InlineField } from "@/components/fill-mode/InlineField";
import { useFillMode } from "@/components/fill-mode/FillModeContext";

interface Props {
    element: TemplateElement;
    meta: ReceiptMeta;
}

const LABEL_STYLE = "text-muted-foreground text-xs uppercase tracking-wide";
const VALUE_STYLE = "font-medium text-sm";
const DATE_INPUT =
    "w-full bg-transparent border border-transparent hover:border-blue-300 focus:border-blue-500 focus:outline-none rounded px-1 text-sm";

export function ReceiptDetailsElement({ element, meta }: Props) {
    const { fillMode, onUpdateReceiptMeta } = useFillMode();

    const f = (field: string) => {
        const fields = element.config?.fields as string[] | undefined;
        return !fields || fields.includes(field);
    };

    const accentColor =
        element.styles?.accentColor ?? "var(--doc-accent, #2563eb)";

    const layout = (element.config?.layout as string | undefined) ?? "vertical";
    const isHorizontal = layout === "horizontal";
    const justify = (element.config?.justify as string | undefined) ?? "stretch";
    const fieldsStyle: React.CSSProperties = isHorizontal
        ? { display: "flex", flexDirection: "row", flexWrap: "nowrap", gap: "2px 16px", alignItems: "start", width: "100%", justifyContent: justify === "stretch" ? "flex-start" : justify }
        : {};
    const fieldItemStyle: React.CSSProperties = isHorizontal ? { ...(justify === "stretch" ? { flex: 1 } : {}), minWidth: 0 } : { minWidth: "100px" };

    if (fillMode) {
        return (
            <div
                className="flex flex-col gap-1"
                style={element.styles as React.CSSProperties}
            >
                {f("title") && (
                    <div
                        className="text-2xl font-bold uppercase tracking-wide mb-2 pb-2"
                        style={{
                            color: accentColor,
                            borderBottom: `2px solid ${accentColor}`,
                        }}
                    >
                        RECEIPT
                    </div>
                )}
                <div
                    className="flex flex-col gap-1 text-sm"
                    style={fieldsStyle}
                >
                    {f("number") && (
                        <div style={fieldItemStyle}>
                            <span className={LABEL_STYLE}>Receipt #</span>
                            <InlineField
                                value={meta.number}
                                onChange={(v) =>
                                    onUpdateReceiptMeta({ number: v })
                                }
                                placeholder="REC-001"
                                className={VALUE_STYLE}
                            />
                        </div>
                    )}
                    {f("issueDate") && (
                        <div style={fieldItemStyle}>
                            <span className={LABEL_STYLE}>Issue Date</span>
                            <input
                                type="date"
                                value={meta.issueDate}
                                onChange={(e) =>
                                    onUpdateReceiptMeta({
                                        issueDate: e.target.value,
                                    })
                                }
                                className={DATE_INPUT}
                            />
                        </div>
                    )}
                    {f("paymentDate") && (
                        <div style={fieldItemStyle}>
                            <span className={LABEL_STYLE}>Payment Date</span>
                            <input
                                type="date"
                                value={meta.paymentDate ?? ""}
                                onChange={(e) =>
                                    onUpdateReceiptMeta({
                                        paymentDate: e.target.value,
                                    })
                                }
                                className={DATE_INPUT}
                            />
                        </div>
                    )}
                    {f("paymentMethod") && (
                        <div style={fieldItemStyle}>
                            <span className={LABEL_STYLE}>Payment Method</span>
                            <InlineField
                                value={meta.paymentMethod ?? ""}
                                onChange={(v) =>
                                    onUpdateReceiptMeta({ paymentMethod: v })
                                }
                                placeholder="Cash, Card, Bank Transfer..."
                                className={VALUE_STYLE}
                            />
                        </div>
                    )}
                    {f("transactionId") && (
                        <div style={fieldItemStyle}>
                            <span className={LABEL_STYLE}>Transaction ID</span>
                            <InlineField
                                value={meta.transactionId ?? ""}
                                onChange={(v) =>
                                    onUpdateReceiptMeta({ transactionId: v })
                                }
                                placeholder="TXN-123"
                                className={VALUE_STYLE}
                            />
                        </div>
                    )}
                    {f("relatedInvoiceNumber") && (
                        <div style={fieldItemStyle}>
                            <span className={LABEL_STYLE}>
                                Related Invoice #
                            </span>
                            <InlineField
                                value={meta.relatedInvoiceNumber ?? ""}
                                onChange={(v) =>
                                    onUpdateReceiptMeta({
                                        relatedInvoiceNumber: v,
                                    })
                                }
                                placeholder="INV-001"
                                className={VALUE_STYLE}
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div
            className="flex flex-col gap-1"
            style={element.styles as React.CSSProperties}
        >
            {f("title") && (
                <div
                    className="text-2xl font-bold uppercase tracking-wide mb-2 pb-2"
                    style={{
                        color: accentColor,
                        borderBottom: `2px solid ${accentColor}`,
                    }}
                >
                    RECEIPT
                </div>
            )}
            <div style={fieldsStyle}>
                {f("number") && (
                    <div style={fieldItemStyle}>
                        <span className={LABEL_STYLE}>Receipt #</span>
                        <div className={VALUE_STYLE}>{meta.number || "—"}</div>
                    </div>
                )}
                {f("issueDate") && (
                    <div style={fieldItemStyle}>
                        <span className={LABEL_STYLE}>Issue Date</span>
                        <div className={VALUE_STYLE}>
                            {meta.issueDate || "—"}
                        </div>
                    </div>
                )}
                {f("paymentDate") && meta.paymentDate && (
                    <div style={fieldItemStyle}>
                        <span className={LABEL_STYLE}>Payment Date</span>
                        <div className={VALUE_STYLE}>{meta.paymentDate}</div>
                    </div>
                )}
                {f("paymentMethod") && meta.paymentMethod && (
                    <div style={fieldItemStyle}>
                        <span className={LABEL_STYLE}>Payment Method</span>
                        <div className={VALUE_STYLE}>{meta.paymentMethod}</div>
                    </div>
                )}
                {f("transactionId") && meta.transactionId && (
                    <div style={fieldItemStyle}>
                        <span className={LABEL_STYLE}>Transaction ID</span>
                        <div className={VALUE_STYLE}>{meta.transactionId}</div>
                    </div>
                )}
                {f("relatedInvoiceNumber") && meta.relatedInvoiceNumber && (
                    <div style={fieldItemStyle}>
                        <span className={LABEL_STYLE}>Related Invoice #</span>
                        <div className={VALUE_STYLE}>
                            {meta.relatedInvoiceNumber}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
