import type { TemplateWidget } from "@/types/templateV2";
import { PanelSection, ColorInput } from "../shared";

const TOTALS_ROWS: Array<{ key: string; label: string }> = [
    { key: "subTotal",    label: "Sub Total" },
    { key: "discount",    label: "Discount" },
    { key: "tax1",        label: "Tax 1" },
    { key: "tax2",        label: "Tax 2" },
    { key: "shipping",    label: "Shipping" },
    { key: "adjustment",  label: "Adjustment" },
    { key: "total",       label: "Total" },
    { key: "amountPaid",  label: "Amount Paid" },
    { key: "balanceDue",  label: "Balance Due" },
];

const DEFAULT_TOTALS_SHOW = ["subTotal", "tax1", "total", "balanceDue"];

export function TotalsBlockPanel({
    widget,
    onUpdateConfig,
}: {
    widget: TemplateWidget;
    onUpdateConfig: (patch: Partial<Pick<TemplateWidget, "config">>) => void;
}) {
    const config = widget.config ?? {};
    const show: string[] = (config.show as string[] | undefined) ?? DEFAULT_TOTALS_SHOW;
    const align: string = (config.align as string | undefined) ?? "right";
    const showDivider: boolean = (config.divider as boolean | undefined) ?? true;
    const dividerColor: string = (config.dividerColor as string | undefined) ?? "#e5e7eb";

    function toggleRow(key: string) {
        const next = show.includes(key)
            ? show.filter((k) => k !== key)
            : [...show, key];
        const ordered = TOTALS_ROWS.map((r) => r.key).filter((k) => next.includes(k));
        onUpdateConfig({ config: { ...config, show: ordered } });
    }

    function setAlign(v: string) {
        onUpdateConfig({ config: { ...config, align: v } });
    }

    function setDivider(v: boolean) {
        onUpdateConfig({ config: { ...config, divider: v } });
    }

    function setDividerColor(v: string) {
        onUpdateConfig({ config: { ...config, dividerColor: v } });
    }

    const alignOptions = [
        { value: "left",   label: "← Left" },
        { value: "center", label: "↔ Center" },
        { value: "right",  label: "→ Right" },
    ];

    return (
        <>
            <PanelSection title="Alignment">
                <div style={{ display: "flex", gap: 4 }}>
                    {alignOptions.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setAlign(opt.value)}
                            style={{
                                flex: 1,
                                padding: "5px 4px",
                                fontSize: 11,
                                fontWeight: align === opt.value ? 700 : 500,
                                color: align === opt.value ? "#4f46e5" : "#64748b",
                                background: align === opt.value ? "#ede9fe" : "white",
                                border: `1px solid ${align === opt.value ? "#c7d2fe" : "#d1d5db"}`,
                                borderRadius: 5,
                                cursor: "pointer",
                            }}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </PanelSection>

            <PanelSection title="Row Divider">
                <label
                    style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, cursor: "pointer", marginBottom: 8 }}
                >
                    <input
                        type="checkbox"
                        checked={showDivider}
                        onChange={(e) => setDivider(e.target.checked)}
                        style={{ accentColor: "#4f46e5" }}
                    />
                    Show divider lines
                </label>
                {showDivider && (
                    <ColorInput
                        label="Color"
                        value={dividerColor}
                        onChange={setDividerColor}
                    />
                )}
            </PanelSection>

            <PanelSection title="Visible Rows">
                {TOTALS_ROWS.map(({ key, label }) => (
                    <label
                        key={key}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 7,
                            marginBottom: 5,
                            cursor: "pointer",
                            fontSize: 12,
                            color: "#374151",
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={show.includes(key)}
                            onChange={() => toggleRow(key)}
                            style={{ accentColor: "#4f46e5" }}
                        />
                        {label}
                    </label>
                ))}
            </PanelSection>
        </>
    );
}
