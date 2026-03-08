/**
 * PropertiesPanel
 *
 * Context-sensitive right panel. Shows different controls depending on what is selected:
 *  - Nothing selected → section grid config for the focused section
 *  - Section selected → section grid config
 *  - Widget selected → widget-specific config
 */
import React from "react";
import { Trash2 } from "lucide-react";
import type { SelectionNodeType } from "./EditorSelectionContext";
import type {
    TemplateV2,
    SectionGridV2,
    TemplateWidget,
    GridConfig,
} from "@/types/templateV2";
import { collectWidgets, collectBodyWidgets } from "@/types/templateV2";
import type { SectionTarget } from "@/hooks/useTemplateEditor";
import type { ElementType } from "@/types/template";

// ── Shared sub-components ─────────────────────────────────────────────────────

function PanelSection({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div
            style={{
                borderBottom: "1px solid #f1f5f9",
                paddingBottom: 12,
                marginBottom: 12,
            }}
        >
            <div
                style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#64748b",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: 8,
                }}
            >
                {title}
            </div>
            {children}
        </div>
    );
}

function Row({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
            }}
        >
            <label
                style={{
                    fontSize: 11,
                    color: "#6b7280",
                    minWidth: 80,
                    flexShrink: 0,
                }}
            >
                {label}
            </label>
            <div style={{ flex: 1 }}>{children}</div>
        </div>
    );
}

function NumberInput({
    value,
    onChange,
    min = 0,
    max = 100,
    step = 1,
}: {
    value: number;
    onChange: (v: number) => void;
    min?: number;
    max?: number;
    step?: number;
}) {
    return (
        <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => onChange(Number(e.target.value))}
            style={{
                width: "100%",
                padding: "3px 6px",
                border: "1px solid #d1d5db",
                borderRadius: 4,
                fontSize: 12,
            }}
        />
    );
}

function TextInput({
    value,
    onChange,
    placeholder,
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}) {
    return (
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            style={{
                width: "100%",
                padding: "3px 6px",
                border: "1px solid #d1d5db",
                borderRadius: 4,
                fontSize: 12,
                boxSizing: "border-box",
            }}
        />
    );
}

function ColorInput({
    value,
    onChange,
    label,
}: {
    value: string;
    onChange: (v: string) => void;
    label: string;
}) {
    return (
        <Row label={label}>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input
                    type="color"
                    value={value || "#ffffff"}
                    onChange={(e) => onChange(e.target.value)}
                    style={{
                        width: 28,
                        height: 28,
                        border: "1px solid #d1d5db",
                        borderRadius: 4,
                        cursor: "pointer",
                        padding: 2,
                    }}
                />
                <TextInput
                    value={value}
                    onChange={onChange}
                    placeholder="#ffffff"
                />
            </div>
        </Row>
    );
}

// ── Grid Config Panel ─────────────────────────────────────────────────────────

interface GridConfigPanelProps {
    section: SectionGridV2;
    onUpdate: (patch: Partial<GridConfig>) => void;
    onUpdateHeight?: (h: number) => void;
    onUpdateBg?: (bg: SectionGridV2["background"]) => void;
}

function GridConfigPanel({
    section,
    onUpdate,
    onUpdateHeight,
    onUpdateBg,
}: GridConfigPanelProps) {
    const { grid, background } = section;

    return (
        <>
            {section.height !== undefined && (
                <PanelSection title="Size">
                    <Row label="Height (px)">
                        <NumberInput
                            value={section.height}
                            onChange={(v) => onUpdateHeight?.(v)}
                            min={40}
                            max={500}
                        />
                    </Row>
                </PanelSection>
            )}

            <PanelSection title="Grid">
                <Row label="Columns">
                    <NumberInput
                        value={grid.columns}
                        onChange={(v) => onUpdate({ columns: v })}
                        min={1}
                        max={12}
                    />
                </Row>
                <Row label="Rows">
                    <NumberInput
                        value={grid.rows}
                        onChange={(v) => onUpdate({ rows: v })}
                        min={1}
                        max={20}
                    />
                </Row>
                <Row label="Col gap (px)">
                    <NumberInput
                        value={grid.colGap}
                        onChange={(v) => onUpdate({ colGap: v })}
                        min={0}
                        max={64}
                    />
                </Row>
                <Row label="Row gap (px)">
                    <NumberInput
                        value={grid.rowGap}
                        onChange={(v) => onUpdate({ rowGap: v })}
                        min={0}
                        max={64}
                    />
                </Row>
                <Row label="Padding (px)">
                    <NumberInput
                        value={grid.padding}
                        onChange={(v) => onUpdate({ padding: v })}
                        min={0}
                        max={64}
                    />
                </Row>
            </PanelSection>

            <PanelSection title="Column Widths">
                {grid.colWidths.map((w, i) => (
                    <Row key={i} label={`Col ${i + 1}`}>
                        <TextInput
                            value={w}
                            onChange={(v) => {
                                const newWidths = [...grid.colWidths];
                                newWidths[i] = v;
                                onUpdate({ colWidths: newWidths });
                            }}
                            placeholder="1fr"
                        />
                    </Row>
                ))}
            </PanelSection>

            <PanelSection title="Row Heights">
                {grid.rowHeights.map((h, i) => (
                    <Row key={i} label={`Row ${i + 1}`}>
                        <TextInput
                            value={h}
                            onChange={(v) => {
                                const newHeights = [...grid.rowHeights];
                                newHeights[i] = v;
                                onUpdate({ rowHeights: newHeights });
                            }}
                            placeholder="auto"
                        />
                    </Row>
                ))}
            </PanelSection>

            {onUpdateBg && (
                <PanelSection title="Background">
                    <ColorInput
                        label="Color"
                        value={background?.color ?? ""}
                        onChange={(v) =>
                            onUpdateBg({ ...background, color: v })
                        }
                    />
                    <Row label="Image URL">
                        <TextInput
                            value={background?.imageUrl ?? ""}
                            onChange={(v) =>
                                onUpdateBg({ ...background, imageUrl: v })
                            }
                            placeholder="https://..."
                        />
                    </Row>
                </PanelSection>
            )}
        </>
    );
}

// ── Widget Config Panel ───────────────────────────────────────────────────────

function WidgetConfigPanel({
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
        { value: "first-page", label: "First page only" },
        { value: "all-pages", label: "Every page" },
        { value: "last-page", label: "Last page only" },
    ];

    return (
        <>
            <PanelSection title="Widget">
                <div
                    style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#374151",
                        marginBottom: 8,
                        textTransform: "capitalize",
                    }}
                >
                    {widget.type.replace(/([A-Z])/g, " $1")}
                </div>
                <div
                    style={{ fontSize: 11, color: "#6b7280", marginBottom: 8 }}
                >
                    ID: {widget.id}
                </div>
            </PanelSection>

            {widget.placement !== undefined && (
                <PanelSection title="Page placement">
                    {placements.map((p) => (
                        <label
                            key={p.value}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                marginBottom: 4,
                                cursor: "pointer",
                                fontSize: 12,
                            }}
                        >
                            <input
                                type="radio"
                                name="placement"
                                checked={widget.placement === p.value}
                                onChange={() => onUpdatePlacement(p.value)}
                            />
                            {p.label}
                        </label>
                    ))}
                </PanelSection>
            )}

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
                }}
            >
                <Trash2 size={12} /> Remove widget
            </button>
        </>
    );
}

// ── Main PropertiesPanel ──────────────────────────────────────────────────────

interface PropsPP {
    template: TemplateV2;
    selectedId: string | null;
    selectedType: SelectionNodeType;
    /** "header" | "footer" | or a body grid id string */
    focusedSectionId: string;
    onUpdateGridConfig: (
        target: SectionTarget,
        patch: Partial<GridConfig>,
    ) => void;
    onUpdateSectionHeight: (sectionId: "header" | "footer", h: number) => void;
    onUpdateSectionBg: (
        target: SectionTarget,
        bg: SectionGridV2["background"],
    ) => void;
    onUpdateWidgetPlacement: (
        nodeId: string,
        p: import("@/types/templateV2").BodyPlacement,
    ) => void;
    onDeleteNode: (nodeId: string) => void;
    onAddWidget: (
        target: SectionTarget,
        cellId: string,
        type: ElementType,
    ) => void;
}

/** Resolve focused section id to a SectionGridV2 and SectionTarget */
function resolveFocusedSection(
    template: TemplateV2,
    focusedSectionId: string,
): {
    section: SectionGridV2 | null;
    target: SectionTarget;
} {
    if (focusedSectionId === "header")
        return { section: template.header, target: "header" };
    if (focusedSectionId === "footer")
        return { section: template.footer, target: "footer" };
    const grid = template.body.grids.find((g) => g.id === focusedSectionId);
    return { section: grid ?? null, target: { bodyGridId: focusedSectionId } };
}

export function PropertiesPanel({
    template,
    selectedId,
    selectedType,
    focusedSectionId,
    onUpdateGridConfig,
    onUpdateSectionHeight,
    onUpdateSectionBg,
    onUpdateWidgetPlacement,
    onDeleteNode,
}: PropsPP) {
    const { section, target } = resolveFocusedSection(
        template,
        focusedSectionId,
    );

    // Find selected widget across all sections
    let selectedWidget: TemplateWidget | null = null;
    if (selectedId && selectedType === "widget") {
        const all = [
            ...collectWidgets(template.header),
            ...collectWidgets(template.footer),
            ...collectBodyWidgets(template.body),
        ];
        selectedWidget = all.find((w) => w.id === selectedId) ?? null;
    }

    return (
        <div
            style={{
                width: 220,
                flexShrink: 0,
                borderLeft: "1px solid #e2e8f0",
                background: "#f8fafc",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <div
                style={{
                    padding: "8px 10px 6px",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#64748b",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    borderBottom: "1px solid #e2e8f0",
                }}
            >
                {selectedType ? `${selectedType} properties` : "Section config"}
            </div>

            <div style={{ padding: "10px 12px", flex: 1 }}>
                {/* Nothing selected or section selected — show grid config */}
                {(!selectedType || selectedType === "section") && section && (
                    <GridConfigPanel
                        section={section}
                        onUpdate={(patch) => onUpdateGridConfig(target, patch)}
                        onUpdateHeight={
                            focusedSectionId === "header" ||
                            focusedSectionId === "footer"
                                ? (h) =>
                                      onUpdateSectionHeight(
                                          focusedSectionId as
                                              | "header"
                                              | "footer",
                                          h,
                                      )
                                : undefined
                        }
                        onUpdateBg={(bg) => onUpdateSectionBg(target, bg)}
                    />
                )}

                {/* Widget selected */}
                {selectedType === "widget" && selectedWidget && (
                    <WidgetConfigPanel
                        widget={selectedWidget}
                        onUpdatePlacement={(p) =>
                            onUpdateWidgetPlacement(selectedWidget!.id, p)
                        }
                        onDelete={() => onDeleteNode(selectedWidget!.id)}
                    />
                )}
            </div>
        </div>
    );
}
