import type { TemplateElement } from "@/types/template";
import type { EstimateMeta } from "@/types/document";
import { InlineField } from "@/components/fill-mode/InlineField";
import { useFillMode } from "@/components/fill-mode/FillModeContext";

interface Props {
    element: TemplateElement;
    meta: EstimateMeta;
}

const LABEL_STYLE = "text-muted-foreground text-xs uppercase tracking-wide";
const VALUE_STYLE = "font-medium text-sm";
const DATE_INPUT =
    "w-full bg-transparent border border-transparent hover:border-blue-300 focus:border-blue-500 focus:outline-none rounded px-1 text-sm";

export function EstimateDetailsElement({ element, meta }: Props) {
    const { fillMode, onUpdateEstimateMeta } = useFillMode();

    if (fillMode) {
        return (
            <div
                className="flex flex-col gap-1"
                style={element.styles as React.CSSProperties}
            >
                <div className="text-2xl font-bold uppercase tracking-wide mb-2">
                    ESTIMATE
                </div>
                <div className="flex flex-col gap-1 text-sm">
                    <div>
                        <span className={LABEL_STYLE}>Estimate #</span>
                        <InlineField
                            value={meta.number}
                            onChange={(v) =>
                                onUpdateEstimateMeta({ number: v })
                            }
                            placeholder="EST-001"
                            className={VALUE_STYLE}
                        />
                    </div>
                    <div>
                        <span className={LABEL_STYLE}>Date</span>
                        <input
                            type="date"
                            value={meta.date}
                            onChange={(e) =>
                                onUpdateEstimateMeta({ date: e.target.value })
                            }
                            className={DATE_INPUT}
                        />
                    </div>
                    <div>
                        <span className={LABEL_STYLE}>Expiry Date</span>
                        <input
                            type="date"
                            value={meta.expiryDate ?? ""}
                            onChange={(e) =>
                                onUpdateEstimateMeta({
                                    expiryDate: e.target.value,
                                })
                            }
                            className={DATE_INPUT}
                        />
                    </div>
                    <div>
                        <span className={LABEL_STYLE}>Reference</span>
                        <InlineField
                            value={meta.reference ?? ""}
                            onChange={(v) =>
                                onUpdateEstimateMeta({ reference: v })
                            }
                            placeholder="Ref #"
                            className={VALUE_STYLE}
                        />
                    </div>
                    <div>
                        <span className={LABEL_STYLE}>PO Number</span>
                        <InlineField
                            value={meta.poNumber ?? ""}
                            onChange={(v) =>
                                onUpdateEstimateMeta({ poNumber: v })
                            }
                            placeholder="PO#"
                            className={VALUE_STYLE}
                        />
                    </div>
                    <div>
                        <span className={LABEL_STYLE}>Project</span>
                        <InlineField
                            value={meta.projectName ?? ""}
                            onChange={(v) =>
                                onUpdateEstimateMeta({ projectName: v })
                            }
                            placeholder="Project name"
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
                ESTIMATE
            </div>
            <div className="flex flex-col gap-1">
                <div>
                    <span className={LABEL_STYLE}>Estimate #</span>
                    <div className={VALUE_STYLE}>{meta.number || "—"}</div>
                </div>
                <div>
                    <span className={LABEL_STYLE}>Date</span>
                    <div className={VALUE_STYLE}>{meta.date || "—"}</div>
                </div>
                {meta.expiryDate && (
                    <div>
                        <span className={LABEL_STYLE}>Expiry Date</span>
                        <div className={VALUE_STYLE}>{meta.expiryDate}</div>
                    </div>
                )}
                {meta.reference && (
                    <div>
                        <span className={LABEL_STYLE}>Reference</span>
                        <div className={VALUE_STYLE}>{meta.reference}</div>
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
            </div>
        </div>
    );
}
