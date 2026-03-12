import { Trash2 } from "lucide-react";
import type { TemplateWidget } from "@/types/templateV2";
import { PanelSection, Row, NumberInput, SelectInput, ColorInput } from "../shared";

// -- Widget Styles Panel (text color, font size, font weight) ----------------

export function WidgetStylesPanel({
    widget,
    onUpdateStyles,
}: {
    widget: TemplateWidget;
    onUpdateStyles: (styles: Record<string, string>) => void;
}) {
    const styles = (widget.styles ?? {}) as Record<string, string>;

    function set(key: string, value: string) {
        onUpdateStyles({ ...styles, [key]: value });
    }

    function clear(key: string) {
        const next = { ...styles };
        delete next[key];
        onUpdateStyles(next);
    }

    return (
        <PanelSection title="Text Style">
            <ColorInput
                label="Color"
                value={styles.color ?? "#000000"}
                onChange={(v) => set("color", v)}
            />
            <Row label="Font Size">
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                    <NumberInput
                        value={styles.fontSize ? parseInt(styles.fontSize) : 14}
                        onChange={(v) => set("fontSize", `${v}px`)}
                        min={8}
                        max={72}
                    />
                    {styles.fontSize && (
                        <button
                            onClick={() => clear("fontSize")}
                            style={{ fontSize: 10, color: "#9ca3af", background: "none", border: "none", cursor: "pointer", padding: "0 2px" }}
                            title="Reset"
                        >
                            reset
                        </button>
                    )}
                </div>
            </Row>
            <Row label="Weight">
                <SelectInput
                    value={styles.fontWeight ?? ""}
                    onChange={(v) => v ? set("fontWeight", v) : clear("fontWeight")}
                    options={[
                        { value: "", label: "Default" },
                        { value: "400", label: "Normal" },
                        { value: "500", label: "Medium" },
                        { value: "600", label: "Semibold" },
                        { value: "700", label: "Bold" },
                    ]}
                />
            </Row>
        </PanelSection>
    );
}

// -- Widget Config Panel (placement + delete) --------------------------------

export function WidgetConfigPanel({
    widget,
    onUpdatePlacement,
    onDelete,
}: {
    widget: TemplateWidget;
    onUpdatePlacement: (p: import("@/types/templateV2").BodyPlacement) => void;
    onDelete: () => void;
}) {
    const placements: Array<{
        value: import("@/types/templateV2").BodyPlacement;
        label: string;
    }> = [
        { value: "first-page", label: "1st" },
        { value: "all-pages", label: "All" },
        { value: "last-page", label: "Last" },
    ];

    const activePlacement = widget.placement ?? "all-pages";

    return (
        <>
            <PanelSection title="Widget">
                <div
                    style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#374151",
                        marginBottom: 4,
                        textTransform: "capitalize",
                    }}
                >
                    {widget.type.replace(/([A-Z])/g, " $1")}
                </div>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>
                    ID: {widget.id}
                </div>
            </PanelSection>

            <PanelSection title="Page Scope">
                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6, lineHeight: 1.4 }}>
                    Which pages this widget appears on.
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                    {placements.map((p) => (
                        <button
                            key={p.value}
                            onClick={() => onUpdatePlacement(p.value)}
                            style={{
                                flex: 1,
                                padding: "5px 4px",
                                fontSize: 11,
                                fontWeight: activePlacement === p.value ? 700 : 500,
                                color: activePlacement === p.value ? "#4f46e5" : "#64748b",
                                background: activePlacement === p.value ? "#ede9fe" : "white",
                                border: `1px solid ${activePlacement === p.value ? "#c7d2fe" : "#d1d5db"}`,
                                borderRadius: 5,
                                cursor: "pointer",
                            }}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </PanelSection>

            <button
                onClick={onDelete}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: "#ef4444",
                    background: "none",
                    border: "1px solid #fecaca",
                    borderRadius: 6,
                    padding: "5px 10px",
                    cursor: "pointer",
                    fontSize: 12,
                    marginTop: 4,
                }}
            >
                <Trash2 size={12} /> Remove widget
            </button>
        </>
    );
}
