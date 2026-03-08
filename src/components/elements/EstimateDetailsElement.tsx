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

    const f = (field: string) => {
        const fields = element.config?.fields as string[] | undefined;
        return !fields || fields.includes(field);
    };

    const accentColor =
        element.styles?.accentColor ?? "var(--doc-accent, #2563eb)";

    const contentCols =
        (element.config?.contentCols as number | undefined) ?? 1;
    const fieldsStyle: React.CSSProperties =
        contentCols > 1
            ? {
                  display: "grid",
                  gridTemplateColumns: `repeat(${contentCols}, 1fr)`,
                  gap: "0 12px",
                  alignItems: "start",
              }
            : {};

    if (fillMode) {
        return (
            <div
                className="flex flex-col gap-1"
                style={element.styles as React.CSSProperties}
            >
                <div
                    className="text-2xl font-bold uppercase tracking-wide mb-2 pb-2"
                    style={{
                        color: accentColor,
                        borderBottom: `2px solid ${accentColor}`,
                    }}
                >
                    ESTIMATE
                </div>
                <div
                    className="flex flex-col gap-1 text-sm"
                    style={fieldsStyle}
                >
                    {f("number") && (
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
                    )}
                    {f("date") && (
                        <div>
                            <span className={LABEL_STYLE}>Date</span>
                            <input
                                type="date"
                                value={meta.date}
                                onChange={(e) =>
                                    onUpdateEstimateMeta({
                                        date: e.target.value,
                                    })
                                }
                                className={DATE_INPUT}
                            />
                        </div>
                    )}
                    {f("expiryDate") && (
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
                    )}
                    {f("reference") && (
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
                    )}
                    {f("poNumber") && (
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
                    )}
                    {f("projectName") && (
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
            <div
                className="text-2xl font-bold uppercase tracking-wide mb-2 pb-2"
                style={{
                    color: accentColor,
                    borderBottom: `2px solid ${accentColor}`,
                }}
            >
                ESTIMATE
            </div>
            <div style={fieldsStyle}>
                {f("number") && (
                    <div>
                        <span className={LABEL_STYLE}>Estimate #</span>
                        <div className={VALUE_STYLE}>{meta.number || "—"}</div>
                    </div>
                )}
                {f("date") && (
                    <div>
                        <span className={LABEL_STYLE}>Date</span>
                        <div className={VALUE_STYLE}>{meta.date || "—"}</div>
                    </div>
                )}
                {f("expiryDate") && meta.expiryDate && (
                    <div>
                        <span className={LABEL_STYLE}>Expiry Date</span>
                        <div className={VALUE_STYLE}>{meta.expiryDate}</div>
                    </div>
                )}
                {f("reference") && meta.reference && (
                    <div>
                        <span className={LABEL_STYLE}>Reference</span>
                        <div className={VALUE_STYLE}>{meta.reference}</div>
                    </div>
                )}
                {f("poNumber") && meta.poNumber && (
                    <div>
                        <span className={LABEL_STYLE}>PO Number</span>
                        <div className={VALUE_STYLE}>{meta.poNumber}</div>
                    </div>
                )}
                {f("projectName") && meta.projectName && (
                    <div>
                        <span className={LABEL_STYLE}>Project</span>
                        <div className={VALUE_STYLE}>{meta.projectName}</div>
                    </div>
                )}
            </div>
        </div>
    );
}
