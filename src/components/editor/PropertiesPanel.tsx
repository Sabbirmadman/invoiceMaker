/**
 * PropertiesPanel
 *
 * Two-tab right panel:
 *  - PAGE tab  â†’ paper size, page padding, accent borders
 *  - SECTION tab (default) â†’ context-sensitive:
 *      â€¢ Nothing / section selected â†’ grid config + divider color
 *      â€¢ Cell selected â†’ flex layout controls
 *      â€¢ Widget selected:
 *          logo      â†’ image size / border controls
 *          textLabel â†’ rich text formatting + content editor
 *          others    â†’ placement + delete
 */
// @ts-nocheck â€” large generated file, skip strict checks
import React, { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import type { SelectionNodeType } from "./EditorSelectionContext";
import type {
    TemplateV2,
    SectionGridV2,
    TemplateWidget,
    GridConfig,
    CellFlex,
    PagePadding,
    AccentBorder,
    PageAccentBorders,
    TemplateGridCell,
} from "@/types/templateV2";
import { collectWidgets, collectBodyWidgets } from "@/types/templateV2";
import type { SectionTarget } from "@/hooks/useTemplateEditor";
import type { ElementType } from "@/types/template";
import type { PageSize } from "@/types/common";

// â”€â”€ Shared sub-components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
            <label style={{ fontSize: 11, color: "#6b7280", minWidth: 76, flexShrink: 0 }}>{label}</label>
            <div style={{ flex: 1 }}>{children}</div>
        </div>
    );
}

function NumberInput({
    value, onChange, min = 0, max = 1000, step = 1,
}: { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
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

function TextInput({
    value, onChange, placeholder,
}: { value: string; onChange: (v: string) => void; placeholder?: string }) {
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

function SelectInput({
    value, onChange, options,
}: { value: string; onChange: (v: string) => void; options: Array<{ label: string; value: string }> }) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{ width: "100%", padding: "3px 6px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 12, background: "white" }}
        >
            {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
    );
}

function ColorInput({
    value, onChange, label,
}: { value: string; onChange: (v: string) => void; label: string }) {
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

// â”€â”€ Four-side padding input â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function FourSideInput({
    values, onChange, title,
}: {
    values: { top: number; right: number; bottom: number; left: number };
    onChange: (v: { top: number; right: number; bottom: number; left: number }) => void;
    title: string;
}) {
    return (
        <PanelSection title={title}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {(["top", "right", "bottom", "left"] as const).map((side) => (
                    <div key={side}>
                        <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 2, textTransform: "capitalize" }}>{side}</div>
                        <NumberInput
                            value={values[side]}
                            onChange={(v) => onChange({ ...values, [side]: v })}
                            min={0}
                            max={200}
                        />
                    </div>
                ))}
            </div>
        </PanelSection>
    );
}

// â”€â”€ Page Settings Panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface PagePanelProps {
    template: TemplateV2;
    onUpdateTemplate: (patch: Partial<Pick<TemplateV2, "pageSize" | "orientation" | "pagePadding" | "accentBorders">>) => void;
}

function PageSettingsPanel({ template, onUpdateTemplate }: PagePanelProps) {
    const pagePadding: PagePadding = template.pagePadding ?? { top: 0, right: 0, bottom: 0, left: 0 };
    const accentBorders: PageAccentBorders = template.accentBorders ?? {};

    function updateBorder(side: "top" | "right" | "bottom" | "left", patch: Partial<AccentBorder>) {
        const current = accentBorders[side] ?? { color: "#b45309", width: 6, enabled: false };
        onUpdateTemplate({ accentBorders: { ...accentBorders, [side]: { ...current, ...patch } } });
    }

    return (
        <>
            <PanelSection title="Paper Size">
                <Row label="Size">
                    <SelectInput
                        value={template.pageSize}
                        onChange={(v) => onUpdateTemplate({ pageSize: v as PageSize })}
                        options={[
                            { label: "A4 (210Ã—297mm)", value: "A4" },
                            { label: "A5 (148Ã—210mm)", value: "A5" },
                            { label: "Letter (8.5Ã—11in)", value: "Letter" },
                        ]}
                    />
                </Row>
                <Row label="Orientation">
                    <SelectInput
                        value={template.orientation}
                        onChange={(v) => onUpdateTemplate({ orientation: v as "portrait" | "landscape" })}
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

            <PanelSection title="Accent Borders">
                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8, lineHeight: 1.4 }}>
                    Decorative colored borders on the page edges.
                </div>
                {(["top", "right", "bottom", "left"] as const).map((side) => {
                    const border = accentBorders[side];
                    const enabled = border?.enabled ?? false;
                    return (
                        <div key={side} style={{ marginBottom: 10 }}>
                            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 4 }}>
                                <input
                                    type="checkbox"
                                    checked={enabled}
                                    onChange={(e) => updateBorder(side, { enabled: e.target.checked })}
                                />
                                <span style={{ fontSize: 12, fontWeight: 600, color: "#374151", textTransform: "capitalize" }}>
                                    {side}
                                    {enabled && border?.color && (
                                        <span style={{
                                            display: "inline-block", width: 10, height: 10, borderRadius: 2,
                                            background: border.color, marginLeft: 6, verticalAlign: "middle",
                                        }} />
                                    )}
                                </span>
                            </label>
                            {enabled && (
                                <div style={{ paddingLeft: 20, paddingTop: 4 }}>
                                    <ColorInput
                                        label="Color"
                                        value={border?.color ?? "#b45309"}
                                        onChange={(v) => updateBorder(side, { color: v })}
                                    />
                                    <Row label="Width (px)">
                                        <NumberInput
                                            value={border?.width ?? 6}
                                            onChange={(v) => updateBorder(side, { width: v })}
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

// â”€â”€ Grid Config Panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface GridConfigPanelProps {
    section: SectionGridV2;
    isHeaderOrFooter: boolean;
    onUpdate: (patch: Partial<GridConfig>) => void;
    onUpdateHeight?: (h: number) => void;
    onUpdateBg?: (bg: SectionGridV2["background"]) => void;
    onUpdateDividerColor?: (color: string) => void;
}

function GridConfigPanel({
    section, isHeaderOrFooter, onUpdate, onUpdateHeight, onUpdateBg, onUpdateDividerColor,
}: GridConfigPanelProps) {
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
                                const nw = [...grid.colWidths];
                                nw[i] = v;
                                onUpdate({ colWidths: nw });
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
                                const nh = [...grid.rowHeights];
                                nh[i] = v;
                                onUpdate({ rowHeights: nh });
                            }}
                            placeholder="auto"
                        />
                    </Row>
                ))}
            </PanelSection>

            {isHeaderOrFooter && onUpdateDividerColor && (
                <PanelSection title="Divider Line">
                    <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8, lineHeight: 1.4 }}>
                        Border between header/body or body/footer.
                    </div>
                    <ColorInput
                        label="Color"
                        value={section.dividerColor ?? "#e2e8f0"}
                        onChange={onUpdateDividerColor}
                    />
                </PanelSection>
            )}

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

// â”€â”€ Cell Flex Panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function CellFlexPanel({
    cell, onChange,
}: { cell: TemplateGridCell; onChange: (f: CellFlex) => void }) {
    const flex = cell.flex ?? {};

    return (
        <PanelSection title="Cell Layout (Flex)">
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8, lineHeight: 1.4 }}>
                Controls how elements inside this cell are arranged.
            </div>
            <Row label="Direction">
                <SelectInput
                    value={flex.direction ?? "column"}
                    onChange={(v) => onChange({ ...flex, direction: v as "row" | "column" })}
                    options={[
                        { label: "Column (vertical)", value: "column" },
                        { label: "Row (horizontal)", value: "row" },
                    ]}
                />
            </Row>
            <Row label="Align Items">
                <SelectInput
                    value={flex.alignItems ?? "stretch"}
                    onChange={(v) => onChange({ ...flex, alignItems: v })}
                    options={[
                        { label: "Stretch (fill)", value: "stretch" },
                        { label: "Start", value: "flex-start" },
                        { label: "Center", value: "center" },
                        { label: "End", value: "flex-end" },
                    ]}
                />
            </Row>
            <Row label="Justify">
                <SelectInput
                    value={flex.justifyContent ?? "flex-start"}
                    onChange={(v) => onChange({ ...flex, justifyContent: v })}
                    options={[
                        { label: "Start", value: "flex-start" },
                        { label: "Center", value: "center" },
                        { label: "End", value: "flex-end" },
                        { label: "Space Between", value: "space-between" },
                        { label: "Space Around", value: "space-around" },
                    ]}
                />
            </Row>
            <Row label="Gap (px)">
                <NumberInput value={flex.gap ?? 4} onChange={(v) => onChange({ ...flex, gap: v })} min={0} max={64} />
            </Row>
        </PanelSection>
    );
}

// â”€â”€ Logo Widget Panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function LogoWidgetPanel({
    widget, onUpdateConfig,
}: {
    widget: TemplateWidget;
    onUpdateConfig: (patch: Partial<Pick<TemplateWidget, "config" | "styles">>) => void;
}) {
    const styles = (widget.styles ?? {}) as Record<string, string>;

    function setStyle(key: string, value: string) {
        onUpdateConfig({ styles: { ...styles, [key]: value } });
    }

    const borderWidthNum = parseInt(styles.borderWidth ?? "0") || 0;
    const borderRadiusNum = parseInt(styles.borderRadius ?? "0") || 0;

    return (
        <>
            <PanelSection title="Image Size">
                <Row label="Width">
                    <TextInput value={styles.width ?? "auto"} onChange={(v) => setStyle("width", v)} placeholder="auto / 80px / 100%" />
                </Row>
                <Row label="Max Height">
                    <TextInput value={styles.maxHeight ?? "80px"} onChange={(v) => setStyle("maxHeight", v)} placeholder="80px" />
                </Row>
                <Row label="Object Fit">
                    <SelectInput
                        value={styles.objectFit ?? "contain"}
                        onChange={(v) => setStyle("objectFit", v)}
                        options={[
                            { label: "Contain", value: "contain" },
                            { label: "Cover", value: "cover" },
                            { label: "Fill", value: "fill" },
                        ]}
                    />
                </Row>
            </PanelSection>

            <PanelSection title="Border">
                <Row label="Width (px)">
                    <NumberInput
                        value={borderWidthNum}
                        onChange={(v) => setStyle("borderWidth", `${v}px`)}
                        min={0}
                        max={20}
                    />
                </Row>
                {borderWidthNum > 0 && (
                    <>
                        <ColorInput
                            label="Color"
                            value={styles.borderColor ?? "#e2e8f0"}
                            onChange={(v) => setStyle("borderColor", v)}
                        />
                        <Row label="Style">
                            <SelectInput
                                value={styles.borderStyle ?? "solid"}
                                onChange={(v) => setStyle("borderStyle", v)}
                                options={[
                                    { label: "Solid", value: "solid" },
                                    { label: "Dashed", value: "dashed" },
                                    { label: "Dotted", value: "dotted" },
                                ]}
                            />
                        </Row>
                    </>
                )}
                <Row label="Radius (px)">
                    <NumberInput
                        value={borderRadiusNum}
                        onChange={(v) => setStyle("borderRadius", `${v}px`)}
                        min={0}
                        max={200}
                    />
                </Row>
            </PanelSection>
        </>
    );
}

// â”€â”€ TextLabel Rich Editor Panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ToggleBtn({
    active, onClick, title, children,
}: { active: boolean; onClick: () => void; title: string; children: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            title={title}
            style={{
                padding: "3px 8px",
                border: `1px solid ${active ? "#6366f1" : "#d1d5db"}`,
                borderRadius: 4,
                background: active ? "#ede9fe" : "white",
                cursor: "pointer",
                fontSize: 13,
                color: active ? "#6366f1" : "#374151",
                minWidth: 28,
                textAlign: "center" as const,
            }}
        >
            {children}
        </button>
    );
}

function TextLabelPanel({
    widget, onUpdateConfig,
}: {
    widget: TemplateWidget;
    onUpdateConfig: (patch: Partial<Pick<TemplateWidget, "config" | "styles">>) => void;
}) {
    const styles = (widget.styles ?? {}) as Record<string, string>;
    const config = widget.config ?? {};
    const text = (config.text as string) ?? "";

    function setStyle(key: string, value: string) {
        onUpdateConfig({ styles: { ...styles, [key]: value } });
    }

    const isBold = styles.fontWeight === "bold" || styles.fontWeight === "700";
    const isItalic = styles.fontStyle === "italic";
    const isUnderline = (styles.textDecoration ?? "").includes("underline");
    const align = styles.textAlign ?? "left";

    return (
        <>
            <PanelSection title="Text Content">
                <textarea
                    value={text}
                    onChange={(e) => onUpdateConfig({ config: { ...config, text: e.target.value } })}
                    rows={5}
                    style={{
                        width: "100%",
                        padding: "5px 6px",
                        border: "1px solid #d1d5db",
                        borderRadius: 4,
                        fontSize: 12,
                        resize: "vertical",
                        fontFamily: "inherit",
                        boxSizing: "border-box" as const,
                        lineHeight: 1.5,
                    }}
                    placeholder="Enter textâ€¦"
                />
            </PanelSection>

            <PanelSection title="Format">
                <div style={{ display: "flex", gap: 3, marginBottom: 10, flexWrap: "wrap" as const }}>
                    <ToggleBtn active={isBold} onClick={() => setStyle("fontWeight", isBold ? "normal" : "bold")} title="Bold">
                        <strong>B</strong>
                    </ToggleBtn>
                    <ToggleBtn active={isItalic} onClick={() => setStyle("fontStyle", isItalic ? "normal" : "italic")} title="Italic">
                        <em>I</em>
                    </ToggleBtn>
                    <ToggleBtn
                        active={isUnderline}
                        onClick={() => setStyle("textDecoration", isUnderline ? "none" : "underline")}
                        title="Underline"
                    >
                        <span style={{ textDecoration: "underline" }}>U</span>
                    </ToggleBtn>
                    <div style={{ width: 1, background: "#e5e7eb", margin: "0 2px" }} />
                    {(["left", "center", "right"] as const).map((a) => (
                        <ToggleBtn key={a} active={align === a} onClick={() => setStyle("textAlign", a)} title={`Align ${a}`}>
                            {a === "left" ? "â‰¡ L" : a === "center" ? "â‰¡ C" : "â‰¡ R"}
                        </ToggleBtn>
                    ))}
                </div>

                <Row label="Font Size">
                    <TextInput value={styles.fontSize ?? "14px"} onChange={(v) => setStyle("fontSize", v)} placeholder="14px" />
                </Row>
                <Row label="Font Family">
                    <TextInput value={styles.fontFamily ?? ""} onChange={(v) => setStyle("fontFamily", v)} placeholder="inherit" />
                </Row>
                <Row label="Line Height">
                    <TextInput value={styles.lineHeight ?? "1.5"} onChange={(v) => setStyle("lineHeight", v)} placeholder="1.5" />
                </Row>
                <Row label="Letter Spacing">
                    <TextInput value={styles.letterSpacing ?? "0"} onChange={(v) => setStyle("letterSpacing", v)} placeholder="0px" />
                </Row>
            </PanelSection>

            <PanelSection title="Colors">
                <ColorInput label="Text Color" value={styles.color ?? "#111827"} onChange={(v) => setStyle("color", v)} />
                <ColorInput label="Background" value={styles.backgroundColor ?? ""} onChange={(v) => setStyle("backgroundColor", v)} />
            </PanelSection>

            <PanelSection title="Spacing">
                <Row label="Padding">
                    <TextInput value={styles.padding ?? "0"} onChange={(v) => setStyle("padding", v)} placeholder="8px or 4px 8px" />
                </Row>
            </PanelSection>
        </>
    );
}

// â”€â”€ Widget Config Panel (placement + delete) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
                <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4, textTransform: "capitalize" }}>
                    {widget.type.replace(/([A-Z])/g, " $1")}
                </div>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>ID: {widget.id}</div>
            </PanelSection>

            {widget.placement !== undefined && (
                <PanelSection title="Page Placement">
                    {placements.map((p) => (
                        <label
                            key={p.value}
                            style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, cursor: "pointer", fontSize: 12 }}
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
                    marginTop: 4,
                }}
            >
                <Trash2 size={12} /> Remove widget
            </button>
        </>
    );
}

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function resolveFocusedSection(
    template: TemplateV2,
    focusedSectionId: string,
): { section: SectionGridV2 | null; target: SectionTarget } {
    if (focusedSectionId === "header") return { section: template.header, target: "header" };
    if (focusedSectionId === "footer") return { section: template.footer, target: "footer" };
    const grid = template.body.grids.find((g) => g.id === focusedSectionId);
    return { section: grid ?? null, target: { bodyGridId: focusedSectionId } };
}

function findCellById(template: TemplateV2, cellId: string): TemplateGridCell | null {
    const hc = template.header.cells.find((c) => c.id === cellId);
    if (hc) return hc;
    const fc = template.footer.cells.find((c) => c.id === cellId);
    if (fc) return fc;
    for (const grid of template.body.grids) {
        const bc = grid.cells.find((c) => c.id === cellId);
        if (bc) return bc;
    }
    return null;
}

// â”€â”€ Tab Button â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function TabBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
    return (
        <button
            onClick={onClick}
            style={{
                flex: 1,
                padding: "7px 0",
                fontSize: 11,
                fontWeight: active ? 700 : 500,
                color: active ? "#6366f1" : "#64748b",
                background: active ? "#f5f3ff" : "transparent",
                border: "none",
                borderBottom: active ? "2px solid #6366f1" : "2px solid transparent",
                cursor: "pointer",
                letterSpacing: "0.04em",
                textTransform: "uppercase" as const,
                transition: "all 0.1s",
            }}
        >
            {label}
        </button>
    );
}

// â”€â”€ Main PropertiesPanel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface PropsPP {
    template: TemplateV2;
    selectedId: string | null;
    selectedType: SelectionNodeType;
    focusedSectionId: string;
    onUpdateGridConfig: (target: SectionTarget, patch: Partial<GridConfig>) => void;
    onUpdateSectionHeight: (sectionId: "header" | "footer", h: number) => void;
    onUpdateSectionBg: (target: SectionTarget, bg: SectionGridV2["background"]) => void;
    onUpdateSectionDividerColor: (target: "header" | "footer", color: string) => void;
    onUpdateWidgetPlacement: (nodeId: string, p: import("@/types/templateV2").BodyPlacement) => void;
    onDeleteNode: (nodeId: string) => void;
    onAddWidget: (target: SectionTarget, cellId: string, type: ElementType) => void;
    onUpdateTemplate: (patch: Partial<Pick<TemplateV2, "pageSize" | "orientation" | "pagePadding" | "accentBorders">>) => void;
    onUpdateWidgetConfig: (nodeId: string, patch: Partial<Pick<TemplateWidget, "config" | "styles" | "bindings" | "placement">>) => void;
    onUpdateCellFlex: (cellId: string, flex: CellFlex | undefined) => void;
}

export function PropertiesPanel({
    template,
    selectedId,
    selectedType,
    focusedSectionId,
    onUpdateGridConfig,
    onUpdateSectionHeight,
    onUpdateSectionBg,
    onUpdateSectionDividerColor,
    onUpdateWidgetPlacement,
    onDeleteNode,
    onUpdateTemplate,
    onUpdateWidgetConfig,
    onUpdateCellFlex,
}: PropsPP) {
    const [pageMode, setPageMode] = useState(false);

    // Auto-exit page mode when a widget or cell gets selected
    useEffect(() => {
        if (selectedType === "widget" || selectedType === "cell") setPageMode(false);
    }, [selectedType]);

    const { section, target } = resolveFocusedSection(template, focusedSectionId);
    const isHF = focusedSectionId === "header" || focusedSectionId === "footer";

    // Find selected widget
    let selectedWidget: TemplateWidget | null = null;
    if (selectedId && selectedType === "widget") {
        const all = [
            ...collectWidgets(template.header),
            ...collectWidgets(template.footer),
            ...collectBodyWidgets(template.body),
        ];
        selectedWidget = all.find((w) => w.id === selectedId) ?? null;
    }

    // Find selected cell
    const selectedCell = (selectedId && selectedType === "cell") ? findCellById(template, selectedId) : null;

    // Panel context label
    let panelLabel = "Section Config";
    if (pageMode) panelLabel = "Page Settings";
    else if (selectedType === "cell") panelLabel = "Cell Layout";
    else if (selectedType === "widget" && selectedWidget) {
        panelLabel = selectedWidget.type.replace(/([A-Z])/g, " $1").trim();
    }

    return (
        <div
            style={{
                width: 240,
                flexShrink: 0,
                borderLeft: "1px solid #e2e8f0",
                background: "#f8fafc",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
            }}
        >
            {/* Tab bar */}
            <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", flexShrink: 0 }}>
                <TabBtn active={!pageMode} onClick={() => setPageMode(false)} label="Section" />
                <TabBtn active={pageMode} onClick={() => setPageMode(true)} label="Page" />
            </div>

            {/* Context label */}
            <div
                style={{
                    padding: "5px 10px",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#64748b",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    borderBottom: "1px solid #f1f5f9",
                    flexShrink: 0,
                }}
            >
                {panelLabel}
            </div>

            {/* Scrollable content */}
            <div style={{ padding: "10px 12px", flex: 1, overflowY: "auto" }}>
                {pageMode ? (
                    /* â”€â”€ PAGE tab â”€â”€ */
                    <PageSettingsPanel template={template} onUpdateTemplate={onUpdateTemplate} />
                ) : (
                    /* â”€â”€ SECTION tab (context-sensitive) â”€â”€ */
                    <>
                        {/* Cell selected â†’ flex layout controls */}
                        {selectedType === "cell" && selectedCell && (
                            <CellFlexPanel
                                cell={selectedCell}
                                onChange={(f) => onUpdateCellFlex(selectedCell.id, f)}
                            />
                        )}

                        {/* Widget selected â†’ type-specific controls + placement/delete */}
                        {selectedType === "widget" && selectedWidget && (
                            <>
                                {selectedWidget.type === "logo" && (
                                    <LogoWidgetPanel
                                        widget={selectedWidget}
                                        onUpdateConfig={(patch) => onUpdateWidgetConfig(selectedWidget!.id, patch)}
                                    />
                                )}
                                {selectedWidget.type === "textLabel" && (
                                    <TextLabelPanel
                                        widget={selectedWidget}
                                        onUpdateConfig={(patch) => onUpdateWidgetConfig(selectedWidget!.id, patch)}
                                    />
                                )}
                                <WidgetConfigPanel
                                    widget={selectedWidget}
                                    onUpdatePlacement={(p) => onUpdateWidgetPlacement(selectedWidget!.id, p)}
                                    onDelete={() => onDeleteNode(selectedWidget!.id)}
                                />
                            </>
                        )}

                        {/* Nothing / section selected â†’ grid config */}
                        {(!selectedType || selectedType === "section") && section && (
                            <GridConfigPanel
                                section={section}
                                isHeaderOrFooter={isHF}
                                onUpdate={(patch) => onUpdateGridConfig(target, patch)}
                                onUpdateHeight={
                                    isHF
                                        ? (h) => onUpdateSectionHeight(focusedSectionId as "header" | "footer", h)
                                        : undefined
                                }
                                onUpdateBg={(bg) => onUpdateSectionBg(target, bg)}
                                onUpdateDividerColor={
                                    isHF
                                        ? (color) => onUpdateSectionDividerColor(focusedSectionId as "header" | "footer", color)
                                        : undefined
                                }
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
