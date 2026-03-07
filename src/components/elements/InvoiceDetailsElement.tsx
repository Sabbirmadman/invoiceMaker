import type { TemplateElement } from "@/types/template";
import type { InvoiceMeta } from "@/types/document";
import { InlineField } from "@/components/fill-mode/InlineField";
import { useFillMode } from "@/components/fill-mode/FillModeContext";

interface Props {
    element: TemplateElement;
    meta: InvoiceMeta;
}

const LABEL_STYLE = "text-muted-foreground text-xs uppercase tracking-wide";
const VALUE_STYLE = "font-medium text-sm";

export function InvoiceDetailsElement({ element, meta }: Props) {
    const { fillMode, onUpdateInvoiceMeta } = useFillMode();

    if (fillMode) {
        return (
            <div
                className="flex flex-col gap-1"
                style={element.styles as React.CSSProperties}
            >
                <div className="text-2xl font-bold uppercase tracking-wide mb-2">
                    INVOICE
                </div>
                <div className="flex flex-col gap-1 text-sm">
                    <div>
                        <span className={LABEL_STYLE}>Invoice #</span>
                        <InlineField
                            value={meta.number}
                            onChange={(v) => onUpdateInvoiceMeta({ number: v })}
                            placeholder="INV-001"
                            className={VALUE_STYLE}
                        />
                    </div>
                    <div>
                        <span className={LABEL_STYLE}>Date</span>
                        <input
                            type="date"
                            value={meta.date}
                            onChange={(e) =>
                                onUpdateInvoiceMeta({ date: e.target.value })
                            }
                            className="w-full bg-transparent border border-transparent hover:border-blue-300 focus:border-blue-500 focus:outline-none rounded px-1 text-sm"
                        />
                    </div>
                    <div>
                        <span className={LABEL_STYLE}>Due Date</span>
                        <input
                            type="date"
                            value={meta.dueDate}
                            onChange={(e) =>
                                onUpdateInvoiceMeta({ dueDate: e.target.value })
                            }
                            className="w-full bg-transparent border border-transparent hover:border-blue-300 focus:border-blue-500 focus:outline-none rounded px-1 text-sm"
                        />
                    </div>
                    <div>
                        <span className={LABEL_STYLE}>Terms</span>
                        <InlineField
                            value={meta.terms}
                            onChange={(v) => onUpdateInvoiceMeta({ terms: v })}
                            placeholder="e.g. Net 30"
                            className={VALUE_STYLE}
                        />
                    </div>
                    <div>
                        <span className={LABEL_STYLE}>PO Number</span>
                        <InlineField
                            value={meta.poNumber}
                            onChange={(v) =>
                                onUpdateInvoiceMeta({ poNumber: v })
                            }
                            placeholder="PO#"
                            className={VALUE_STYLE}
                        />
                    </div>
                    <div>
                        <span className={LABEL_STYLE}>Project</span>
                        <InlineField
                            value={meta.projectName}
                            onChange={(v) =>
                                onUpdateInvoiceMeta({ projectName: v })
                            }
                            placeholder="Project name"
                            className={VALUE_STYLE}
                        />
                    </div>
                    <div>
                        <span className={LABEL_STYLE}>Reference</span>
                        <InlineField
                            value={meta.reference}
                            onChange={(v) =>
                                onUpdateInvoiceMeta({ reference: v })
                            }
                            placeholder="Ref #"
                            className={VALUE_STYLE}
                        />
                    </div>
                    <div>
                        <span className={LABEL_STYLE}>Place of Supply</span>
                        <InlineField
                            value={meta.placeOfSupply}
                            onChange={(v) =>
                                onUpdateInvoiceMeta({ placeOfSupply: v })
                            }
                            placeholder="State / Country"
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
                INVOICE
            </div>
            <div className="flex flex-col gap-1">
                <div>
                    <span className={LABEL_STYLE}>Invoice #</span>
                    <div className={VALUE_STYLE}>{meta.number || "—"}</div>
                </div>
                <div>
                    <span className={LABEL_STYLE}>Date</span>
                    <div className={VALUE_STYLE}>{meta.date || "—"}</div>
                </div>
                {meta.dueDate && (
                    <div>
                        <span className={LABEL_STYLE}>Due Date</span>
                        <div className={VALUE_STYLE}>{meta.dueDate}</div>
                    </div>
                )}
                {meta.terms && (
                    <div>
                        <span className={LABEL_STYLE}>Terms</span>
                        <div className={VALUE_STYLE}>{meta.terms}</div>
                    </div>
                )}
                {meta.poNumber && (
                    <div>
                        <span className={LABEL_STYLE}>PO Number</span>
                        <div className={VALUE_STYLE}>{meta.poNumber}</div>
                    </div>
                )}
                {meta.projectName && (
                    <div>
                        <span className={LABEL_STYLE}>Project</span>
                        <div className={VALUE_STYLE}>{meta.projectName}</div>
                    </div>
                )}
                {meta.reference && (
                    <div>
                        <span className={LABEL_STYLE}>Reference</span>
                        <div className={VALUE_STYLE}>{meta.reference}</div>
                    </div>
                )}
                {meta.placeOfSupply && (
                    <div>
                        <span className={LABEL_STYLE}>Place of Supply</span>
                        <div className={VALUE_STYLE}>{meta.placeOfSupply}</div>
                    </div>
                )}
            </div>
        </div>
    );
}
