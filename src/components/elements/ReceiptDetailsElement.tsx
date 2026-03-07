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

    if (fillMode) {
        return (
            <div
                className="flex flex-col gap-1"
                style={element.styles as React.CSSProperties}
            >
                <div className="text-2xl font-bold uppercase tracking-wide mb-2">
                    RECEIPT
                </div>
                <div className="flex flex-col gap-1 text-sm">
                    <div>
                        <span className={LABEL_STYLE}>Receipt #</span>
                        <InlineField
                            value={meta.number}
                            onChange={(v) => onUpdateReceiptMeta({ number: v })}
                            placeholder="REC-001"
                            className={VALUE_STYLE}
                        />
                    </div>
                    <div>
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
                    <div>
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
                    <div>
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
                    <div>
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
                    <div>
                        <span className={LABEL_STYLE}>Related Invoice #</span>
                        <InlineField
                            value={meta.relatedInvoiceNumber ?? ""}
                            onChange={(v) =>
                                onUpdateReceiptMeta({ relatedInvoiceNumber: v })
                            }
                            placeholder="INV-001"
                            className={VALUE_STYLE}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="flex flex-col gap-1"
            style={element.styles as React.CSSProperties}
        >
            <div className="text-2xl font-bold uppercase tracking-wide mb-2">
                RECEIPT
            </div>
            <div className="flex flex-col gap-1">
                <div>
                    <span className={LABEL_STYLE}>Receipt #</span>
                    <div className={VALUE_STYLE}>{meta.number || "—"}</div>
                </div>
                <div>
                    <span className={LABEL_STYLE}>Issue Date</span>
                    <div className={VALUE_STYLE}>{meta.issueDate || "—"}</div>
                </div>
                {meta.paymentDate && (
                    <div>
                        <span className={LABEL_STYLE}>Payment Date</span>
                        <div className={VALUE_STYLE}>{meta.paymentDate}</div>
                    </div>
                )}
                {meta.paymentMethod && (
                    <div>
                        <span className={LABEL_STYLE}>Payment Method</span>
                        <div className={VALUE_STYLE}>{meta.paymentMethod}</div>
                    </div>
                )}
                {meta.transactionId && (
                    <div>
                        <span className={LABEL_STYLE}>Transaction ID</span>
                        <div className={VALUE_STYLE}>{meta.transactionId}</div>
                    </div>
                )}
                {meta.relatedInvoiceNumber && (
                    <div>
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
