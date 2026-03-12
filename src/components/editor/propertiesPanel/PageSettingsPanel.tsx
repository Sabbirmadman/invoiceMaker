
import type {
    TemplateV2,
    PagePadding,
    AccentBorder,
    PageAccentBorders,
    WatermarkConfig,
} from "@/types/templateV2";
import type { PageSize, DocumentType } from "@/types/common";
import { PanelSection, Row, NumberInput, SelectInput, ColorInput, FourSideInput } from "./shared";

// -- Page Settings Panel -----------------------------------------------------

interface PagePanelProps {
    template: TemplateV2;
    onUpdateTemplate: (
        patch: Partial<
            Pick<
                TemplateV2,
                "pageSize" | "orientation" | "pagePadding" | "accentBorders" | "pageBackground" | "theme" | "documentType"
            >
        >,
    ) => void;
}

export function PageSettingsPanel({ template, onUpdateTemplate }: PagePanelProps) {
    const pagePadding: PagePadding = template.pagePadding ?? {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    };
    const accentBorders: PageAccentBorders = template.accentBorders ?? {};

    function updateBorder(
        side: "top" | "right" | "bottom" | "left",
        patch: Partial<AccentBorder>,
    ) {
        const current = accentBorders[side] ?? {
            color: "#b45309",
            width: 6,
            enabled: false,
        };
        onUpdateTemplate({
            accentBorders: {
                ...accentBorders,
                [side]: { ...current, ...patch },
            },
        });
    }

    return (
        <>
            <PanelSection title="Paper Size">
                <Row label="Size">
                    <SelectInput
                        value={template.pageSize}
                        onChange={(v) =>
                            onUpdateTemplate({ pageSize: v as PageSize })
                        }
                        options={[
                            { label: "A4 (210×297mm)", value: "A4" },
                            { label: "A5 (148×210mm)", value: "A5" },
                            { label: "Letter (8.5×11in)", value: "Letter" },
                        ]}
                    />
                </Row>
                <Row label="Orientation">
                    <SelectInput
                        value={template.orientation}
                        onChange={(v) =>
                            onUpdateTemplate({
                                orientation: v as "portrait" | "landscape",
                            })
                        }
                        options={[
                            { label: "Portrait", value: "portrait" },
                            { label: "Landscape", value: "landscape" },
                        ]}
                    />
                </Row>
            </PanelSection>

            <FourSideInput
                title="Page Padding (px)"
                values={pagePadding}
                onChange={(v) => onUpdateTemplate({ pagePadding: v })}
            />

            <PanelSection title="Page Background">
                <ColorInput
                    label="Color"
                    value={template.pageBackground ?? "#ffffff"}
                    onChange={(v) => onUpdateTemplate({ pageBackground: v })}
                />
            </PanelSection>

            <PanelSection title="Document Type">
                <SelectInput
                    value={template.documentType}
                    onChange={(v) => onUpdateTemplate({ documentType: v as DocumentType })}
                    options={[
                        { value: "invoice", label: "Invoice" },
                        { value: "estimate", label: "Estimate" },
                        { value: "receipt", label: "Receipt" },
                    ]}
                />
            </PanelSection>

            <PanelSection title="Font">
                <SelectInput
                    value={template.theme.fontFamily ?? ""}
                    onChange={(v) => onUpdateTemplate({ theme: { ...template.theme, fontFamily: v } })}
                    options={[
                        { value: "", label: "Default (system)" },
                        { value: "Inter, sans-serif", label: "Inter" },
                        { value: "Georgia, serif", label: "Georgia" },
                        { value: "Times New Roman, serif", label: "Times New Roman" },
                        { value: "Arial, sans-serif", label: "Arial" },
                        { value: "Helvetica Neue, Helvetica, sans-serif", label: "Helvetica" },
                        { value: "Courier New, monospace", label: "Courier New" },
                        { value: "Trebuchet MS, sans-serif", label: "Trebuchet" },
                        { value: "Verdana, sans-serif", label: "Verdana" },
                    ]}
                />
            </PanelSection>

            <PanelSection title="Accent Borders">
                <div
                    style={{
                        fontSize: 11,
                        color: "#94a3b8",
                        marginBottom: 8,
                        lineHeight: 1.4,
                    }}
                >
                    Decorative colored borders on the page edges.
                </div>
                {(["top", "right", "bottom", "left"] as const).map((side) => {
                    const border = accentBorders[side];
                    const enabled = border?.enabled ?? false;
                    return (
                        <div key={side} style={{ marginBottom: 10 }}>
                            <label
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    cursor: "pointer",
                                    marginBottom: 4,
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={enabled}
                                    onChange={(e) =>
                                        updateBorder(side, {
                                            enabled: e.target.checked,
                                        })
                                    }
                                />
                                <span
                                    style={{
                                        fontSize: 12,
                                        fontWeight: 600,
                                        color: "#374151",
                                        textTransform: "capitalize",
                                    }}
                                >
                                    {side}
                                    {enabled && border?.color && (
                                        <span
                                            style={{
                                                display: "inline-block",
                                                width: 10,
                                                height: 10,
                                                borderRadius: 2,
                                                background: border.color,
                                                marginLeft: 6,
                                                verticalAlign: "middle",
                                            }}
                                        />
                                    )}
                                </span>
                            </label>
                            {enabled && (
                                <div style={{ paddingLeft: 20, paddingTop: 4 }}>
                                    <ColorInput
                                        label="Color"
                                        value={border?.color ?? "#b45309"}
                                        onChange={(v) =>
                                            updateBorder(side, { color: v })
                                        }
                                    />
                                    <Row label="Width (px)">
                                        <NumberInput
                                            value={border?.width ?? 6}
                                            onChange={(v) =>
                                                updateBorder(side, { width: v })
                                            }
                                            min={1}
                                            max={40}
                                        />
                                    </Row>
                                </div>
                            )}
                        </div>
                    );
                })}
            </PanelSection>
        </>
    );
}

// -- Section Watermark Panel -------------------------------------------------

export function SectionWatermarkPanel({
    watermark,
    onChange,
}: {
    watermark?: WatermarkConfig;
    onChange: (cfg: WatermarkConfig | null) => void;
}) {
    const has = !!watermark;
    return (
        <PanelSection title="Section Watermark">
            <Row label="Enabled">
                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                    <input
                        type="checkbox"
                        checked={has}
                        onChange={(e) =>
                            onChange(e.target.checked ? { text: "DRAFT", opacity: 0.08 } : null)
                        }
                    />
                    <span style={{ fontSize: 11, color: "#374151" }}>Show watermark</span>
                </label>
            </Row>
            {has && watermark && (
                <>
                    <Row label="Text">
                        <input
                            value={watermark.text}
                            onChange={(e) => onChange({ ...watermark, text: e.target.value })}
                            style={{ width: "100%", padding: "4px 6px", border: "1px solid #d1d5db", borderRadius: 5, fontSize: 12, boxSizing: "border-box" as const }}
                        />
                    </Row>
                    <Row label="Opacity">
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <input
                                type="range" min={1} max={50}
                                value={Math.round((watermark.opacity ?? 0.08) * 100)}
                                onChange={(e) => onChange({ ...watermark, opacity: Number(e.target.value) / 100 })}
                                style={{ flex: 1 }}
                            />
                            <span style={{ fontSize: 11, color: "#64748b", minWidth: 30 }}>
                                {Math.round((watermark.opacity ?? 0.08) * 100)}%
                            </span>
                        </div>
                    </Row>
                    <Row label="Rotation">
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <input
                                type="range" min={-90} max={90}
                                value={watermark.rotate ?? -30}
                                onChange={(e) => onChange({ ...watermark, rotate: Number(e.target.value) })}
                                style={{ flex: 1 }}
                            />
                            <span style={{ fontSize: 11, color: "#64748b", minWidth: 30 }}>
                                {watermark.rotate ?? -30}deg
                            </span>
                        </div>
                    </Row>
                    <button
                        onClick={() => onChange(null)}
                        style={{ marginTop: 4, fontSize: 11, color: "#ef4444", background: "none", border: "1px solid #fca5a5", borderRadius: 5, padding: "3px 8px", cursor: "pointer" }}
                    >
                        Remove Watermark
                    </button>
                </>
            )}
        </PanelSection>
    );
}

// -- Page Watermark Panel ----------------------------------------------------

export function PageWatermarkPanel({
    pageWatermarks,
    onChange,
}: {
    pageWatermarks?: { background?: WatermarkConfig; foreground?: WatermarkConfig };
    onChange: (layer: "background" | "foreground", cfg: WatermarkConfig | null) => void;
}) {
    return (
        <PanelSection title="Page Watermarks">
            {(["background", "foreground"] as const).map((layer) => {
                const wm = pageWatermarks?.[layer];
                const has = !!wm;
                return (
                    <div key={layer} style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", marginBottom: 4, textTransform: "capitalize" as const }}>
                            {layer}
                        </div>
                        <Row label="Enabled">
                            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                                <input
                                    type="checkbox"
                                    checked={has}
                                    onChange={(e) =>
                                        onChange(layer, e.target.checked ? { text: "DRAFT", opacity: 0.08 } : null)
                                    }
                                />
                                <span style={{ fontSize: 11, color: "#374151" }}>Show</span>
                            </label>
                        </Row>
                        {has && wm && (
                            <>
                                <Row label="Text">
                                    <input
                                        value={wm.text}
                                        onChange={(e) => onChange(layer, { ...wm, text: e.target.value })}
                                        style={{ width: "100%", padding: "4px 6px", border: "1px solid #d1d5db", borderRadius: 5, fontSize: 12, boxSizing: "border-box" as const }}
                                    />
                                </Row>
                                <Row label="Opacity">
                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <input
                                            type="range" min={1} max={50}
                                            value={Math.round((wm.opacity ?? 0.08) * 100)}
                                            onChange={(e) => onChange(layer, { ...wm, opacity: Number(e.target.value) / 100 })}
                                            style={{ flex: 1 }}
                                        />
                                        <span style={{ fontSize: 11, color: "#64748b", minWidth: 30 }}>
                                            {Math.round((wm.opacity ?? 0.08) * 100)}%
                                        </span>
                                    </div>
                                </Row>
                                <Row label="Rotation">
                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <input
                                            type="range" min={-90} max={90}
                                            value={wm.rotate ?? -30}
                                            onChange={(e) => onChange(layer, { ...wm, rotate: Number(e.target.value) })}
                                            style={{ flex: 1 }}
                                        />
                                        <span style={{ fontSize: 11, color: "#64748b", minWidth: 30 }}>
                                            {wm.rotate ?? -30}deg
                                        </span>
                                    </div>
                                </Row>
                            </>
                        )}
                    </div>
                );
            })}
        </PanelSection>
    );
}
