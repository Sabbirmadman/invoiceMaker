/**
 * WatermarkPlacementDialog
 *
 * Modal shown when the user clicks the Watermark palette item.
 * Lets them choose where the watermark is applied and configure text/opacity.
 */
import { useState } from "react";
import { createPortal } from "react-dom";
import type { WatermarkConfig } from "@/types/templateV2";

export type WatermarkScope =
    | "page-bg"
    | "page-fg"
    | "header"
    | { bodyGridIndex: number }
    | "footer"
    | "cell"; // user will drag into a cell after dialog closes

interface OptionDef {
    scope: WatermarkScope;
    label: string;
    description: string;
}

interface Props {
    bodyGridCount: number;
    onConfirm: (scope: WatermarkScope, config: WatermarkConfig) => void;
    onCancel: () => void;
}

function scopeKey(s: WatermarkScope): string {
    if (typeof s === "object") return `body-${s.bodyGridIndex}`;
    return s;
}

export function WatermarkPlacementDialog({ bodyGridCount, onConfirm, onCancel }: Props) {
    const [selected, setSelected] = useState<WatermarkScope>("page-bg");
    const [text, setText] = useState("DRAFT");
    const [opacity, setOpacity] = useState(8); // 1–100 integer percent

    const bodyGridOptions: OptionDef[] = Array.from({ length: bodyGridCount }, (_, i) => ({
        scope: { bodyGridIndex: i },
        label: bodyGridCount === 1 ? "Body" : `Body — Section ${i + 1}`,
        description: "Covers this body section only",
    }));

    const groups: { label: string; options: OptionDef[] }[] = [
        {
            label: "Full Page",
            options: [
                { scope: "page-bg", label: "Page Background", description: "Behind all content — classic watermark effect" },
                { scope: "page-fg", label: "Page Foreground", description: "In front of all content — always visible" },
            ],
        },
        {
            label: "Section",
            options: [
                { scope: "header", label: "Header", description: "Covers the header section only" },
                ...bodyGridOptions,
                { scope: "footer", label: "Footer", description: "Covers the footer section only" },
            ],
        },
        {
            label: "In a Cell",
            options: [
                { scope: "cell", label: "Drop into Cell", description: "Close dialog then drag onto any grid cell" },
            ],
        },
    ];

    function handleConfirm() {
        onConfirm(selected, { text: text.trim() || "DRAFT", opacity: opacity / 100 });
    }

    const confirmLabel = selected === "cell" ? "Close & Drag" : "Add Watermark";
    const canConfirm = text.trim().length > 0 || selected === "cell";

    return createPortal(
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 10000,
                background: "rgba(0,0,0,0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
            onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
        >
            <div
                style={{
                    background: "#fff",
                    borderRadius: 12,
                    boxShadow: "0 8px 40px rgba(0,0,0,0.22)",
                    width: 420,
                    maxHeight: "80vh",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                }}
            >
                {/* Header */}
                <div style={{
                    padding: "16px 20px 12px",
                    borderBottom: "1px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}>
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Add Watermark</div>
                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Choose where to apply the watermark</div>
                    </div>
                    <button
                        onClick={onCancel}
                        style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: "#94a3b8", fontSize: 20, lineHeight: 1, padding: "2px 5px", borderRadius: 4,
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Config inputs */}
                <div style={{
                    padding: "12px 20px",
                    borderBottom: "1px solid #f1f5f9",
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-end",
                }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 4 }}>Text</label>
                        <input
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="DRAFT"
                            style={{
                                width: "100%",
                                padding: "6px 8px",
                                border: "1px solid #d1d5db",
                                borderRadius: 6,
                                fontSize: 13,
                                outline: "none",
                                boxSizing: "border-box",
                            }}
                        />
                    </div>
                    <div style={{ width: 110 }}>
                        <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 4 }}>
                            Opacity — {opacity}%
                        </label>
                        <input
                            type="range" min={1} max={50} value={opacity}
                            onChange={(e) => setOpacity(Number(e.target.value))}
                            style={{ width: "100%", cursor: "pointer" }}
                        />
                    </div>
                </div>

                {/* Placement options */}
                <div style={{ overflowY: "auto", padding: "10px 20px 6px", flex: 1 }}>
                    {groups.map((group) => (
                        <div key={group.label} style={{ marginBottom: 14 }}>
                            <div style={{
                                fontSize: 10, fontWeight: 700, color: "#94a3b8",
                                textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5,
                            }}>
                                {group.label}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                {group.options.map((opt) => {
                                    const active = scopeKey(opt.scope) === scopeKey(selected);
                                    return (
                                        <button
                                            key={scopeKey(opt.scope)}
                                            onClick={() => setSelected(opt.scope)}
                                            style={{
                                                display: "flex", alignItems: "flex-start", gap: 10,
                                                padding: "8px 10px",
                                                border: active ? "1.5px solid #4f46e5" : "1px solid #e2e8f0",
                                                borderRadius: 7,
                                                background: active ? "#eef2ff" : "#fff",
                                                cursor: "pointer",
                                                textAlign: "left",
                                                transition: "all 0.1s",
                                            }}
                                        >
                                            <div style={{
                                                width: 14, height: 14, borderRadius: "50%", marginTop: 1, flexShrink: 0,
                                                border: active ? "4px solid #4f46e5" : "1.5px solid #d1d5db",
                                                background: "transparent",
                                                boxSizing: "border-box",
                                            }} />
                                            <div>
                                                <div style={{ fontSize: 12, fontWeight: 600, color: active ? "#3730a3" : "#1e293b" }}>
                                                    {opt.label}
                                                </div>
                                                <div style={{ fontSize: 11, color: "#64748b", marginTop: 1 }}>
                                                    {opt.description}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer buttons */}
                <div style={{
                    padding: "12px 20px",
                    borderTop: "1px solid #e2e8f0",
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 8,
                }}>
                    <button
                        onClick={onCancel}
                        style={{
                            padding: "7px 16px", border: "1px solid #e2e8f0", borderRadius: 7,
                            background: "#fff", fontSize: 13, color: "#374151", cursor: "pointer",
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!canConfirm}
                        style={{
                            padding: "7px 16px", border: "none", borderRadius: 7,
                            background: canConfirm ? "#4f46e5" : "#a5b4fc",
                            fontSize: 13, color: "#fff",
                            cursor: canConfirm ? "pointer" : "not-allowed",
                            fontWeight: 600,
                        }}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
