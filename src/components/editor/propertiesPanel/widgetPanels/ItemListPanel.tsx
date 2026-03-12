import type { TemplateWidget } from "@/types/templateV2";
import { PanelSection } from "../shared";

function colorRow(label: string, value: string, onChange: (v: string) => void) {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, gap: 6 }}>
            <span style={{ fontSize: 11, color: "#374151", flexShrink: 0 }}>{label}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    style={{ width: 24, height: 24, padding: 1, border: "1px solid #d1d5db", borderRadius: 4, cursor: "pointer", flexShrink: 0 }}
                />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => {
                        const v = e.target.value.startsWith("#") ? e.target.value : "#" + e.target.value;
                        if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v);
                    }}
                    onBlur={(e) => {
                        const v = e.target.value;
                        if (/^#[0-9a-fA-F]{3}$/.test(v)) {
                            onChange(`#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`);
                        }
                    }}
                    style={{ width: 72, fontSize: 11, padding: "2px 4px", border: "1px solid #d1d5db", borderRadius: 4, fontFamily: "monospace" }}
                />
            </div>
        </div>
    );
}

export function ItemListPanel({
    widget,
    onUpdateConfig,
}: {
    widget: TemplateWidget;
    onUpdateConfig: (patch: Partial<Pick<TemplateWidget, "config" | "styles">>) => void;
}) {
    const config = widget.config ?? {};
    const styles = (widget.styles ?? {}) as Record<string, string>;

    const stacked = (config.stackNameDescription as boolean) ?? false;
    const descriptionWrap = (config.descriptionWrap as boolean) ?? false;
    const headerBg = (styles.headerBackground as string) ?? "#111111";
    const headerColor = (styles.headerColor as string) ?? "#ffffff";
    const altRowColor = (styles.alternateRowColor as string) ?? "#f0f2f5";
    const rowBorderColor = (styles.rowBorderColor as string) ?? "#e5e7eb";
    const showOuterBorder = styles.showOuterBorder === "true";
    const showColumnBorders = (config.showColumnBorders as boolean) ?? false;

    const setConfig = (k: string, v: unknown) =>
        onUpdateConfig({ config: { ...config, [k]: v } });
    const setStyle = (k: string, v: unknown) =>
        onUpdateConfig({ styles: { ...styles, [k]: v as string } });

    return (
        <>
            <PanelSection title="Layout">
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#374151", cursor: "pointer" }}>
                    <input
                        type="checkbox"
                        checked={stacked}
                        onChange={(e) => setConfig("stackNameDescription", e.target.checked)}
                    />
                    Stack Item &amp; Description in one column
                </label>
            </PanelSection>

            <PanelSection title="Description Column">
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>Overflow behaviour</div>
                <div style={{ display: "flex", gap: 6 }}>
                    {([
                        { value: false, label: "… Truncate" },
                        { value: true, label: "↵ Wrap" },
                    ] as const).map(({ value: v, label }) => (
                        <button
                            key={String(v)}
                            onClick={() => setConfig("descriptionWrap", v)}
                            style={{
                                flex: 1,
                                padding: "5px 4px",
                                fontSize: 11,
                                fontWeight: descriptionWrap === v ? 700 : 500,
                                color: descriptionWrap === v ? "#4f46e5" : "#64748b",
                                background: descriptionWrap === v ? "#ede9fe" : "white",
                                border: `1px solid ${descriptionWrap === v ? "#c7d2fe" : "#d1d5db"}`,
                                borderRadius: 5,
                                cursor: "pointer",
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </PanelSection>

            <PanelSection title="Header">
                {colorRow("Background", headerBg, (v) => setStyle("headerBackground", v))}
                {colorRow("Text Color", headerColor, (v) => setStyle("headerColor", v))}
            </PanelSection>

            <PanelSection title="Rows">
                {colorRow("Alternate Row", altRowColor, (v) => setStyle("alternateRowColor", v))}
                {colorRow("Row Border", rowBorderColor, (v) => setStyle("rowBorderColor", v))}
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#374151", cursor: "pointer", marginTop: 4 }}>
                    <input
                        type="checkbox"
                        checked={showColumnBorders}
                        onChange={(e) => setConfig("showColumnBorders", e.target.checked)}
                    />
                    Show column borders
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#374151", cursor: "pointer", marginTop: 4 }}>
                    <input
                        type="checkbox"
                        checked={showOuterBorder}
                        onChange={(e) => setStyle("showOuterBorder", e.target.checked)}
                    />
                    Show outer border
                </label>
            </PanelSection>
        </>
    );
}
