/**
 * PropertiesPanel
 *
 * Context-sensitive right panel. Shows different controls depending on what is selected:
 *  - Nothing selected → section grid config for the focused section
 *  - Cell selected → cell span config + add widget/container buttons
 *  - Container selected → container styles (bg, padding, flex, etc.)
 *  - Widget selected → widget-specific config (same fields as old right panel)
 */
import React from "react";
import { Trash2 } from "lucide-react";
import type { SelectionNodeType } from "./EditorSelectionContext";
import type { TemplateV2, SectionGridV2, TemplateWidget, TemplateContainer, GridConfig, ContainerStyles } from "@/types/templateV2";
import { collectWidgets, collectBodyWidgets, findNodeInSection, findNodeInBody } from "@/types/templateV2";
import type { SectionTarget } from "@/hooks/useTemplateEditor";
import type { ElementType } from "@/types/template";

// ── Shared sub-components ─────────────────────────────────────────────────────

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                {title}
            </div>
            {children}
        </div>
    );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <label style={{ fontSize: 11, color: "#6b7280", minWidth: 80, flexShrink: 0 }}>{label}</label>
            <div style={{ flex: 1 }}>{children}</div>
        </div>
    );
}

function NumberInput({ value, onChange, min = 0, max = 100, step = 1 }: {
    value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number;
}) {
    return (
        <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => onChange(Number(e.target.value))}
            style={{ width: "100%", padding: "3px 6px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 12 }}
        />
    );
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
    return (
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            style={{ width: "100%", padding: "3px 6px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 12, boxSizing: "border-box" }}
        />
    );
}

function ColorInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
    return (
        <Row label={label}>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input
                    type="color"
                    value={value || "#ffffff"}
                    onChange={(e) => onChange(e.target.value)}
                    style={{ width: 28, height: 28, border: "1px solid #d1d5db", borderRadius: 4, cursor: "pointer", padding: 2 }}
                />
                <TextInput value={value} onChange={onChange} placeholder="#ffffff" />
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

function GridConfigPanel({ section, onUpdate, onUpdateHeight, onUpdateBg }: GridConfigPanelProps) {
    const { grid, background } = section;

    return (
        <>
            {section.height !== undefined && (
                <PanelSection title="Size">
                    <Row label="Height (px)">
                        <NumberInput value={section.height} onChange={(v) => onUpdateHeight?.(v)} min={40} max={500} />
                    </Row>
                </PanelSection>
            )}

            <PanelSection title="Grid">
                <Row label="Columns">
                    <NumberInput value={grid.columns} onChange={(v) => onUpdate({ columns: v })} min={1} max={12} />
                </Row>
                <Row label="Rows">
                    <NumberInput value={grid.rows} onChange={(v) => onUpdate({ rows: v })} min={1} max={20} />
                </Row>
                <Row label="Col gap (px)">
                    <NumberInput value={grid.colGap} onChange={(v) => onUpdate({ colGap: v })} min={0} max={64} />
                </Row>
                <Row label="Row gap (px)">
                    <NumberInput value={grid.rowGap} onChange={(v) => onUpdate({ rowGap: v })} min={0} max={64} />
                </Row>
                <Row label="Padding (px)">
                    <NumberInput value={grid.padding} onChange={(v) => onUpdate({ padding: v })} min={0} max={64} />
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
                        onChange={(v) => onUpdateBg({ ...background, color: v })}
                    />
                    <Row label="Image URL">
                        <TextInput
                            value={background?.imageUrl ?? ""}
                            onChange={(v) => onUpdateBg({ ...background, imageUrl: v })}
                            placeholder="https://..."
                        />
                    </Row>
                </PanelSection>
            )}
        </>
    );
}

// ── Container Style Panel ─────────────────────────────────────────────────────

interface ContainerStylePanelProps {
    container: TemplateContainer;
    onUpdate: (styles: Partial<ContainerStyles>) => void;
    onDelete: () => void;
}

function ContainerStylePanel({ container, onUpdate, onDelete }: ContainerStylePanelProps) {
    const s = container.styles;

    return (
        <>
            <PanelSection title="Background">
                <ColorInput label="Color" value={s.backgroundColor ?? ""} onChange={(v) => onUpdate({ backgroundColor: v || undefined })} />
                <Row label="Image URL">
                    <TextInput value={s.backgroundImage ?? ""} onChange={(v) => onUpdate({ backgroundImage: v || undefined })} placeholder="https://..." />
                </Row>
                <Row label="Image size">
                    <select
                        value={s.backgroundSize ?? "cover"}
                        onChange={(e) => onUpdate({ backgroundSize: e.target.value as ContainerStyles["backgroundSize"] })}
                        style={{ width: "100%", padding: "3px 6px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 12 }}
                    >
                        <option value="cover">Cover (crop)</option>
                        <option value="contain">Contain (fit)</option>
                        <option value="repeat">Tile</option>
                    </select>
                </Row>
            </PanelSection>

            <PanelSection title="Border">
                <Row label="Radius">
                    <TextInput value={s.borderRadius ?? ""} onChange={(v) => onUpdate({ borderRadius: v || undefined })} placeholder="8px" />
                </Row>
                <Row label="Border">
                    <TextInput value={s.border ?? ""} onChange={(v) => onUpdate({ border: v || undefined })} placeholder="1px solid #ccc" />
                </Row>
            </PanelSection>

            <PanelSection title="Spacing">
                <Row label="Padding">
                    <TextInput value={s.padding ?? ""} onChange={(v) => onUpdate({ padding: v || undefined })} placeholder="16px" />
                </Row>
                <Row label="Margin">
                    <TextInput value={s.margin ?? ""} onChange={(v) => onUpdate({ margin: v || undefined })} placeholder="0px" />
                </Row>
                <Row label="Min height">
                    <TextInput value={s.minHeight ?? ""} onChange={(v) => onUpdate({ minHeight: v || undefined })} placeholder="40px" />
                </Row>
            </PanelSection>

            <PanelSection title="Layout">
                <Row label="Display">
                    <select
                        value={s.display ?? "block"}
                        onChange={(e) => onUpdate({ display: e.target.value as ContainerStyles["display"] })}
                        style={{ width: "100%", padding: "3px 6px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 12 }}
                    >
                        <option value="block">Block</option>
                        <option value="flex">Flex</option>
                    </select>
                </Row>
                {s.display === "flex" && (
                    <>
                        <Row label="Direction">
                            <select
                                value={s.flexDirection ?? "column"}
                                onChange={(e) => onUpdate({ flexDirection: e.target.value as ContainerStyles["flexDirection"] })}
                                style={{ width: "100%", padding: "3px 6px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 12 }}
                            >
                                <option value="row">Row</option>
                                <option value="column">Column</option>
                            </select>
                        </Row>
                        <Row label="Gap">
                            <TextInput value={s.gap ?? ""} onChange={(v) => onUpdate({ gap: v || undefined })} placeholder="8px" />
                        </Row>
                        <Row label="Align items">
                            <select
                                value={s.alignItems ?? "flex-start"}
                                onChange={(e) => onUpdate({ alignItems: e.target.value as ContainerStyles["alignItems"] })}
                                style={{ width: "100%", padding: "3px 6px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 12 }}
                            >
                                <option value="flex-start">Start</option>
                                <option value="center">Center</option>
                                <option value="flex-end">End</option>
                                <option value="stretch">Stretch</option>
                            </select>
                        </Row>
                        <Row label="Justify">
                            <select
                                value={s.justifyContent ?? "flex-start"}
                                onChange={(e) => onUpdate({ justifyContent: e.target.value as ContainerStyles["justifyContent"] })}
                                style={{ width: "100%", padding: "3px 6px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 12 }}
                            >
                                <option value="flex-start">Start</option>
                                <option value="center">Center</option>
                                <option value="flex-end">End</option>
                                <option value="space-between">Space between</option>
                                <option value="space-around">Space around</option>
                            </select>
                        </Row>
                    </>
                )}
            </PanelSection>

            <button
                onClick={onDelete}
                style={{ display: "flex", alignItems: "center", gap: 6, color: "#ef4444", background: "none", border: "1px solid #fecaca", borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontSize: 12 }}
            >
                <Trash2 size={12} /> Delete container
            </button>
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
    const placements: Array<{ value: import("@/types/templateV2").BodyPlacement; label: string }> = [
        { value: "first-page", label: "First page only" },
        { value: "all-pages", label: "Every page" },
        { value: "last-page", label: "Last page only" },
    ];

    return (
        <>
            <PanelSection title="Widget">
                <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 8, textTransform: "capitalize" }}>
                    {widget.type.replace(/([A-Z])/g, " $1")}
                </div>
                <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8 }}>ID: {widget.id}</div>
            </PanelSection>

            {widget.placement !== undefined && (
                <PanelSection title="Page placement">
                    {placements.map((p) => (
                        <label key={p.value} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, cursor: "pointer", fontSize: 12 }}>
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
                style={{ display: "flex", alignItems: "center", gap: 6, color: "#ef4444", background: "none", border: "1px solid #fecaca", borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontSize: 12 }}
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
    onUpdateGridConfig: (target: SectionTarget, patch: Partial<GridConfig>) => void;
    onUpdateSectionHeight: (sectionId: "header" | "footer", h: number) => void;
    onUpdateSectionBg: (target: SectionTarget, bg: SectionGridV2["background"]) => void;
    onUpdateContainerStyles: (nodeId: string, styles: Partial<ContainerStyles>) => void;
    onUpdateWidgetPlacement: (nodeId: string, p: import("@/types/templateV2").BodyPlacement) => void;
    onDeleteNode: (nodeId: string) => void;
    onAddWidget: (target: SectionTarget, cellId: string, type: ElementType) => void;
    onAddContainer: (target: SectionTarget, cellId: string) => void;
}

/** Resolve focused section id to a SectionGridV2 and SectionTarget */
function resolveFocusedSection(template: TemplateV2, focusedSectionId: string): {
    section: SectionGridV2 | null;
    target: SectionTarget;
} {
    if (focusedSectionId === "header") return { section: template.header, target: "header" };
    if (focusedSectionId === "footer") return { section: template.footer, target: "footer" };
    // Body grid id
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
    onUpdateContainerStyles,
    onUpdateWidgetPlacement,
    onDeleteNode,
    onAddWidget,
    onAddContainer,
}: PropsPP) {
    const { section, target } = resolveFocusedSection(template, focusedSectionId);

    // Find selected widget across all sections
    let selectedWidget: TemplateWidget | null = null;
    if (selectedId && selectedType === "widget") {
        const headerWidgets = collectWidgets(template.header);
        const footerWidgets = collectWidgets(template.footer);
        const bodyWidgets = collectBodyWidgets(template.body);
        const all = [...headerWidgets, ...footerWidgets, ...bodyWidgets];
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
                            focusedSectionId === "header" || focusedSectionId === "footer"
                                ? (h) => onUpdateSectionHeight(focusedSectionId as "header" | "footer", h)
                                : undefined
                        }
                        onUpdateBg={(bg) => onUpdateSectionBg(target, bg)}
                    />
                )}

                {/* Widget selected */}
                {selectedType === "widget" && selectedWidget && (
                    <WidgetConfigPanel
                        widget={selectedWidget}
                        onUpdatePlacement={(p) => onUpdateWidgetPlacement(selectedWidget!.id, p)}
                        onDelete={() => onDeleteNode(selectedWidget!.id)}
                    />
                )}

                {/* Container selected */}
                {selectedType === "container" && selectedId && (
                    <ContainerStylePanelWrapper
                        template={template}
                        containerId={selectedId}
                        onUpdateContainerStyles={onUpdateContainerStyles}
                        onDeleteNode={onDeleteNode}
                    />
                )}
            </div>
        </div>
    );
}

function ContainerStylePanelWrapper({
    template,
    containerId,
    onUpdateContainerStyles,
    onDeleteNode,
}: {
    template: TemplateV2;
    containerId: string;
    onUpdateContainerStyles: (nodeId: string, styles: Partial<ContainerStyles>) => void;
    onDeleteNode: (nodeId: string) => void;
}) {
    let container: TemplateContainer | null = null;
    // Search header
    const inHeader = findNodeInSection(template.header, containerId);
    if (inHeader?.kind === "container") container = inHeader as TemplateContainer;
    // Search footer
    if (!container) {
        const inFooter = findNodeInSection(template.footer, containerId);
        if (inFooter?.kind === "container") container = inFooter as TemplateContainer;
    }
    // Search body grids
    if (!container) {
        const inBody = findNodeInBody(template.body, containerId);
        if (inBody?.kind === "container") container = inBody as TemplateContainer;
    }
    if (!container) return <div style={{ fontSize: 12, color: "#9ca3af" }}>Container not found</div>;
    return (
        <ContainerStylePanel
            container={container}
            onUpdate={(s) => onUpdateContainerStyles(containerId, s)}
            onDelete={() => onDeleteNode(containerId)}
        />
    );
}
