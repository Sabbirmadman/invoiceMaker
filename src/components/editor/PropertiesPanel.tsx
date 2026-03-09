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
// PropertiesPanel — large generated file
import React, { useState } from "react";
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
    WatermarkConfig,
    SectionBorder,
} from "@/types/templateV2";
import { collectWidgets, collectBodyWidgets } from "@/types/templateV2";
import type { SectionTarget } from "@/hooks/useTemplateEditor";
import type { ElementType } from "@/types/template";
import type { PageSize, DocumentType } from "@/types/common";

// â"€â"€ Shared sub-components â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

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
                    minWidth: 76,
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
    max = 1000,
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

function SelectInput({
    value,
    onChange,
    options,
}: {
    value: string;
    onChange: (v: string) => void;
    options: Array<{ label: string; value: string }>;
}) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
                width: "100%",
                padding: "3px 6px",
                border: "1px solid #d1d5db",
                borderRadius: 4,
                fontSize: 12,
                background: "white",
            }}
        >
            {options.map((o) => (
                <option key={o.value} value={o.value}>
                    {o.label}
                </option>
            ))}
        </select>
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

// â"€â"€ Four-side padding input â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function FourSideInput({
    values,
    onChange,
    title,
}: {
    values: { top: number; right: number; bottom: number; left: number };
    onChange: (v: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    }) => void;
    title: string;
}) {
    return (
        <PanelSection title={title}>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 6,
                }}
            >
                {(["top", "right", "bottom", "left"] as const).map((side) => (
                    <div key={side}>
                        <div
                            style={{
                                fontSize: 10,
                                color: "#94a3b8",
                                marginBottom: 2,
                                textTransform: "capitalize",
                            }}
                        >
                            {side}
                        </div>
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

// â"€â"€ Page Settings Panel â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

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

function PageSettingsPanel({ template, onUpdateTemplate }: PagePanelProps) {
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
                            { label: "A4 (210Ã—297mm)", value: "A4" },
                            { label: "A5 (148Ã—210mm)", value: "A5" },
                            { label: "Letter (8.5Ã—11in)", value: "Letter" },
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

// â"€â"€ Grid Config Panel â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

interface GridConfigPanelProps {
    section: SectionGridV2;
    isHeaderOrFooter: boolean;
    onUpdate: (patch: Partial<GridConfig>) => void;
    onUpdateHeight?: (h: number) => void;
    onUpdateBg?: (bg: SectionGridV2["background"]) => void;
    onUpdateDividerColor?: (color: string) => void;
    onUpdateBorder?: (border: SectionBorder | null) => void;
}

function GridConfigPanel({
    section,
    isHeaderOrFooter,
    onUpdate,
    onUpdateHeight,
    onUpdateBg,
    onUpdateDividerColor,
    onUpdateBorder,
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
            </PanelSection>

            <PanelSection title="Padding (px)">
                <Row label="Top">
                    <NumberInput
                        value={grid.paddingTop ?? grid.padding}
                        onChange={(v) => onUpdate({ paddingTop: v })}
                        min={0}
                        max={128}
                    />
                </Row>
                <Row label="Right">
                    <NumberInput
                        value={grid.paddingRight ?? grid.padding}
                        onChange={(v) => onUpdate({ paddingRight: v })}
                        min={0}
                        max={128}
                    />
                </Row>
                <Row label="Bottom">
                    <NumberInput
                        value={grid.paddingBottom ?? grid.padding}
                        onChange={(v) => onUpdate({ paddingBottom: v })}
                        min={0}
                        max={128}
                    />
                </Row>
                <Row label="Left">
                    <NumberInput
                        value={grid.paddingLeft ?? grid.padding}
                        onChange={(v) => onUpdate({ paddingLeft: v })}
                        min={0}
                        max={128}
                    />
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

            {onUpdateBorder && (
                <SectionBorderPanel border={section.border ?? null} onChange={onUpdateBorder} />
            )}

            {isHeaderOrFooter && onUpdateDividerColor && (
                <PanelSection title="Divider Line">
                    <div
                        style={{
                            fontSize: 11,
                            color: "#94a3b8",
                            marginBottom: 8,
                            lineHeight: 1.4,
                        }}
                    >
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

// -- Section Border Panel ---------------------------------------------------

const DEFAULT_BORDER: SectionBorder = {
    color: "#e2e8f0",
    width: 1,
    style: "solid",
    top: false,
    right: false,
    bottom: false,
    left: false,
};

function SectionBorderPanel({
    border,
    onChange,
}: {
    border: SectionBorder | null;
    onChange: (b: SectionBorder | null) => void;
}) {
    const enabled = border !== null;
    const b = border ?? DEFAULT_BORDER;

    function toggle(side: "top" | "right" | "bottom" | "left") {
        onChange({ ...b, [side]: !b[side] });
    }

    return (
        <PanelSection title="Border">
            <Row label="Enabled">
                <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => onChange(e.target.checked ? { ...DEFAULT_BORDER } : null)}
                />
            </Row>
            {enabled && (
                <>
                    <ColorInput label="Color" value={b.color} onChange={(v) => onChange({ ...b, color: v })} />
                    <Row label="Width (px)">
                        <NumberInput value={b.width} onChange={(v) => onChange({ ...b, width: v })} min={1} max={20} />
                    </Row>
                    <Row label="Style">
                        <select
                            value={b.style}
                            onChange={(e) => onChange({ ...b, style: e.target.value as SectionBorder["style"] })}
                            style={{ fontSize: 11, border: "1px solid #d1d5db", borderRadius: 4, padding: "3px 4px", width: "100%" }}
                        >
                            <option value="solid">Solid</option>
                            <option value="dashed">Dashed</option>
                            <option value="dotted">Dotted</option>
                        </select>
                    </Row>
                    <Row label="Sides">
                        <div style={{ display: "flex", gap: 4 }}>
                            {(["top", "right", "bottom", "left"] as const).map((side) => (
                                <button
                                    key={side}
                                    onClick={() => toggle(side)}
                                    style={{
                                        fontSize: 9,
                                        padding: "2px 5px",
                                        borderRadius: 4,
                                        border: `1px solid ${b[side] ? "#6366f1" : "#d1d5db"}`,
                                        background: b[side] ? "#eef2ff" : "white",
                                        color: b[side] ? "#4f46e5" : "#64748b",
                                        cursor: "pointer",
                                        fontWeight: b[side] ? 700 : 400,
                                        textTransform: "capitalize",
                                    }}
                                >
                                    {side[0].toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </Row>
                </>
            )}
        </PanelSection>
    );
}


function CellFlexPanel({
    cell,
    onChange,
    onSpanChange,
    section,
}: {
    cell: TemplateGridCell;
    onChange: (f: CellFlex) => void;
    onSpanChange?: (colSpan: number, rowSpan: number) => void;
    section?: SectionGridV2;
}) {
    const flex = cell.flex ?? {};
    const maxCols = section ? section.grid.columns : 12;
    const maxRows = section ? section.grid.rows : 20;

    return (
        <PanelSection title="Cell Layout (Flex)">
            <div
                style={{
                    fontSize: 11,
                    color: "#94a3b8",
                    marginBottom: 8,
                    lineHeight: 1.4,
                }}
            >
                Controls how elements inside this cell are arranged.
            </div>
            <Row label="Direction">
                <SelectInput
                    value={flex.direction ?? "column"}
                    onChange={(v) =>
                        onChange({ ...flex, direction: v as "row" | "column" })
                    }
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
                <NumberInput
                    value={flex.gap ?? 4}
                    onChange={(v) => onChange({ ...flex, gap: v })}
                    min={0}
                    max={64}
                />
            </Row>
            {onSpanChange && (
                <>
                    <div
                        style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#64748b",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            marginTop: 10,
                            marginBottom: 6,
                        }}
                    >
                        Cell Merge (Span)
                    </div>
                    <div
                        style={{
                            fontSize: 11,
                            color: "#94a3b8",
                            marginBottom: 8,
                            lineHeight: 1.4,
                        }}
                    >
                        Expand this cell to span multiple columns or rows.
                    </div>
                    <Row label="Col Span">
                        <NumberInput
                            value={cell.colSpan}
                            onChange={(v) => onSpanChange(v, cell.rowSpan)}
                            min={1}
                            max={maxCols - cell.colStart + 1}
                        />
                    </Row>
                    <Row label="Row Span">
                        <NumberInput
                            value={cell.rowSpan}
                            onChange={(v) => onSpanChange(cell.colSpan, v)}
                            min={1}
                            max={maxRows - cell.rowStart + 1}
                        />
                    </Row>
                </>
            )}
        </PanelSection>
    );
}


function LogoWidgetPanel({
    widget,
    onUpdateConfig,
}: {
    widget: TemplateWidget;
    onUpdateConfig: (
        patch: Partial<Pick<TemplateWidget, "config" | "styles">>,
    ) => void;
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
                    <TextInput
                        value={styles.width ?? "auto"}
                        onChange={(v) => setStyle("width", v)}
                        placeholder="auto / 80px / 100%"
                    />
                </Row>
                <Row label="Max Height">
                    <TextInput
                        value={styles.maxHeight ?? "80px"}
                        onChange={(v) => setStyle("maxHeight", v)}
                        placeholder="80px"
                    />
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

// â"€â"€ TextLabel Rich Editor Panel â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function ToggleBtn({
    active,
    onClick,
    title,
    children,
}: {
    active: boolean;
    onClick: () => void;
    title: string;
    children: React.ReactNode;
}) {
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
    widget,
    onUpdateConfig,
}: {
    widget: TemplateWidget;
    onUpdateConfig: (
        patch: Partial<Pick<TemplateWidget, "config" | "styles">>,
    ) => void;
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
                    onChange={(e) =>
                        onUpdateConfig({
                            config: { ...config, text: e.target.value },
                        })
                    }
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
                <div
                    style={{
                        display: "flex",
                        gap: 3,
                        marginBottom: 10,
                        flexWrap: "wrap" as const,
                    }}
                >
                    <ToggleBtn
                        active={isBold}
                        onClick={() =>
                            setStyle("fontWeight", isBold ? "normal" : "bold")
                        }
                        title="Bold"
                    >
                        <strong>B</strong>
                    </ToggleBtn>
                    <ToggleBtn
                        active={isItalic}
                        onClick={() =>
                            setStyle(
                                "fontStyle",
                                isItalic ? "normal" : "italic",
                            )
                        }
                        title="Italic"
                    >
                        <em>I</em>
                    </ToggleBtn>
                    <ToggleBtn
                        active={isUnderline}
                        onClick={() =>
                            setStyle(
                                "textDecoration",
                                isUnderline ? "none" : "underline",
                            )
                        }
                        title="Underline"
                    >
                        <span style={{ textDecoration: "underline" }}>U</span>
                    </ToggleBtn>
                    <div
                        style={{
                            width: 1,
                            background: "#e5e7eb",
                            margin: "0 2px",
                        }}
                    />
                    {(["left", "center", "right"] as const).map((a) => (
                        <ToggleBtn
                            key={a}
                            active={align === a}
                            onClick={() => setStyle("textAlign", a)}
                            title={`Align ${a}`}
                        >
                            {a === "left"
                                ? "â‰¡ L"
                                : a === "center"
                                  ? "â‰¡ C"
                                  : "â‰¡ R"}
                        </ToggleBtn>
                    ))}
                </div>

                <Row label="Font Size">
                    <TextInput
                        value={styles.fontSize ?? "14px"}
                        onChange={(v) => setStyle("fontSize", v)}
                        placeholder="14px"
                    />
                </Row>
                <Row label="Font Family">
                    <TextInput
                        value={styles.fontFamily ?? ""}
                        onChange={(v) => setStyle("fontFamily", v)}
                        placeholder="inherit"
                    />
                </Row>
                <Row label="Line Height">
                    <TextInput
                        value={styles.lineHeight ?? "1.5"}
                        onChange={(v) => setStyle("lineHeight", v)}
                        placeholder="1.5"
                    />
                </Row>
                <Row label="Letter Spacing">
                    <TextInput
                        value={styles.letterSpacing ?? "0"}
                        onChange={(v) => setStyle("letterSpacing", v)}
                        placeholder="0px"
                    />
                </Row>
            </PanelSection>

            <PanelSection title="Colors">
                <ColorInput
                    label="Text Color"
                    value={styles.color ?? "#111827"}
                    onChange={(v) => setStyle("color", v)}
                />
                <ColorInput
                    label="Background"
                    value={styles.backgroundColor ?? ""}
                    onChange={(v) => setStyle("backgroundColor", v)}
                />
            </PanelSection>

            <PanelSection title="Spacing">
                <Row label="Padding">
                    <TextInput
                        value={styles.padding ?? "0"}
                        onChange={(v) => setStyle("padding", v)}
                        placeholder="8px or 4px 8px"
                    />
                </Row>
            </PanelSection>
        </>
    );
}


// -- Widget Fields & Layout Panel ---------------------------------------------

const DOCUMENT_INFO_FIELDS: Array<{ key: string; label: string }> = [
    { key: "title", label: "Document Title (INVOICE/ESTIMATE/RECEIPT)" },
    { key: "number", label: "Number (#)" },
    { key: "date", label: "Date / Issue Date" },
    { key: "dueDate", label: "Due Date (invoice)" },
    { key: "expiryDate", label: "Expiry Date (estimate)" },
    { key: "terms", label: "Terms (invoice)" },
    { key: "poNumber", label: "PO Number" },
    { key: "projectName", label: "Project" },
    { key: "reference", label: "Reference" },
    { key: "placeOfSupply", label: "Place of Supply (invoice)" },
    { key: "paymentDate", label: "Payment Date (receipt)" },
    { key: "paymentMethod", label: "Payment Method (receipt)" },
    { key: "transactionId", label: "Transaction ID (receipt)" },
    { key: "relatedInvoiceNumber", label: "Related Invoice # (receipt)" },
];

const WIDGET_FIELDS: Partial<Record<string, Array<{ key: string; label: string }>>> = {
    companyDetails: [
        { key: "name", label: "Name" },
        { key: "address", label: "Address" },
        { key: "cityStateZip", label: "City / State / ZIP" },
        { key: "country", label: "Country" },
        { key: "phone", label: "Phone" },
        { key: "email", label: "Email" },
        { key: "website", label: "Website" },
        { key: "taxId", label: "Tax ID" },
    ],
    billTo: [
        { key: "label", label: '"Bill To" heading' },
        { key: "name", label: "Name" },
        { key: "company", label: "Company" },
        { key: "address", label: "Address" },
        { key: "cityStateZip", label: "City / State / ZIP" },
        { key: "country", label: "Country" },
        { key: "phone", label: "Phone" },
        { key: "email", label: "Email" },
    ],
    shipTo: [
        { key: "label", label: '"Ship To" heading' },
        { key: "address", label: "Address" },
    ],
    documentInfo: DOCUMENT_INFO_FIELDS,
    invoiceDetails: DOCUMENT_INFO_FIELDS,
    estimateDetails: DOCUMENT_INFO_FIELDS,
    receiptDetails: DOCUMENT_INFO_FIELDS,
};

function DocumentInfoPanel({
    widget,
    onUpdateConfig,
}: {
    widget: TemplateWidget;
    onUpdateConfig: (patch: Partial<Pick<TemplateWidget, "config">>) => void;
}) {
    const config = widget.config ?? {};
    const docType = (config.docType as string | undefined) ?? "";
    return (
        <PanelSection title="Document Type">
            <SelectInput
                value={docType}
                onChange={(v) => onUpdateConfig({ config: { ...config, docType: v || undefined } })}
                options={[
                    { value: "", label: "Auto (from template)" },
                    { value: "invoice", label: "Invoice" },
                    { value: "estimate", label: "Estimate" },
                    { value: "receipt", label: "Receipt" },
                ]}
            />
        </PanelSection>
    );
}

function FieldsConfigPanel({
    widget,
    onUpdateConfig,
}: {
    widget: TemplateWidget;
    onUpdateConfig: (patch: Partial<Pick<TemplateWidget, "config">>) => void;
}) {
    const fieldDefs = WIDGET_FIELDS[widget.type];
    if (!fieldDefs) return null;

    const config = widget.config ?? {};
    const allKeys = fieldDefs.map((fd) => fd.key);
    const enabledFields: string[] =
        (config.fields as string[] | undefined) ?? allKeys;
    const layout = (config.layout as string | undefined) ?? "vertical";

    function toggleField(key: string) {
        const next = enabledFields.includes(key)
            ? enabledFields.filter((k) => k !== key)
            : [...enabledFields, key];
        const ordered = allKeys.filter((k) => next.includes(k));
        onUpdateConfig({ config: { ...config, fields: ordered } });
    }

    const justify = (config.justify as string | undefined) ?? "stretch";

    function setLayout(v: string) {
        onUpdateConfig({ config: { ...config, layout: v } });
    }

    function setJustify(v: string) {
        onUpdateConfig({ config: { ...config, justify: v } });
    }

    return (
        <>
            <PanelSection title="Layout Direction">
                <div style={{ display: "flex", gap: 6 }}>
                    {(["vertical", "horizontal"] as const).map((v) => (
                        <button
                            key={v}
                            onClick={() => setLayout(v)}
                            style={{
                                flex: 1,
                                padding: "5px 4px",
                                fontSize: 11,
                                fontWeight: layout === v ? 700 : 500,
                                color: layout === v ? "#4f46e5" : "#64748b",
                                background: layout === v ? "#ede9fe" : "white",
                                border: `1px solid ${layout === v ? "#c7d2fe" : "#d1d5db"}`,
                                borderRadius: 5,
                                cursor: "pointer",
                            }}
                        >
                            {v === "vertical" ? "\u2195 Vertical" : "\u2194 Horizontal"}
                        </button>
                    ))}
                </div>
                {layout === "horizontal" && (
                    <div style={{ marginTop: 8 }}>
                        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4, fontWeight: 500 }}>Field Spacing</div>
                        <select
                            value={justify}
                            onChange={(e) => setJustify(e.target.value)}
                            style={{
                                width: "100%",
                                fontSize: 11,
                                padding: "4px 6px",
                                border: "1px solid #d1d5db",
                                borderRadius: 5,
                                background: "white",
                                color: "#374151",
                                cursor: "pointer",
                            }}
                        >
                            <option value="stretch">Stretch (fill width)</option>
                            <option value="space-between">Space Between</option>
                            <option value="space-around">Space Around</option>
                            <option value="start">Pack Start</option>
                            <option value="center">Pack Center</option>
                            <option value="end">Pack End</option>
                        </select>
                    </div>
                )}
            </PanelSection>

            <PanelSection title="Visible Fields">
                {fieldDefs.map(({ key, label }) => (
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
                            checked={enabledFields.includes(key)}
                            onChange={() => toggleField(key)}
                        />
                        {label}
                    </label>
                ))}
            </PanelSection>
        </>
    );
}

// -- Totals Block Panel --

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

function TotalsBlockPanel({
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
        { value: "left",   label: "\u2190 Left" },
        { value: "center", label: "\u2194 Center" },
        { value: "right",  label: "\u2192 Right" },
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

// -- Widget Styles Panel (text color, font size, font weight) --

function WidgetStylesPanel({
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

// -- Widget Config Panel (placement + delete) --

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

            {widget.placement !== undefined && (
                <PanelSection title="Page Placement">
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
                    marginTop: 4,
                }}
            >
                <Trash2 size={12} /> Remove widget
            </button>
        </>
    );
}

// â"€â"€ Helpers â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function resolveFocusedSection(
    template: TemplateV2,
    focusedSectionId: string,
): { section: SectionGridV2 | null; target: SectionTarget } {
    if (focusedSectionId === "header")
        return { section: template.header, target: "header" };
    if (focusedSectionId === "footer")
        return { section: template.footer, target: "footer" };
    const grid = template.body.grids.find((g) => g.id === focusedSectionId);
    return { section: grid ?? null, target: { bodyGridId: focusedSectionId } };
}

function findCellById(
    template: TemplateV2,
    cellId: string,
): TemplateGridCell | null {
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

function findCellContainingWidget(
    template: TemplateV2,
    widgetId: string,
): TemplateGridCell | null {
    for (const cell of template.header.cells) {
        if (cell.children.some((n) => n.id === widgetId)) return cell;
    }
    for (const cell of template.footer.cells) {
        if (cell.children.some((n) => n.id === widgetId)) return cell;
    }
    for (const grid of template.body.grids) {
        for (const cell of grid.cells) {
            if (cell.children.some((n) => n.id === widgetId)) return cell;
        }
    }
    return null;
}

// â"€â"€ Tab Button â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function TabBtn({
    active,
    onClick,
    label,
}: {
    active: boolean;
    onClick: () => void;
    label: string;
}) {
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
                borderBottom: active
                    ? "2px solid #6366f1"
                    : "2px solid transparent",
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

// â"€â"€ Main PropertiesPanel â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

// Section Watermark Panel

function SectionWatermarkPanel({
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

// Page Watermark Panel

function PageWatermarkPanel({
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

interface PropsPP {
    template: TemplateV2;
    selectedId: string | null;
    selectedType: SelectionNodeType;
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
    onUpdateSectionDividerColor: (
        target: "header" | "footer",
        color: string,
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
    onUpdateTemplate: (
        patch: Partial<
            Pick<
                TemplateV2,
                "pageSize" | "orientation" | "pagePadding" | "accentBorders" | "theme" | "documentType"
            >
        >,
    ) => void;
    onUpdateWidgetConfig: (
        nodeId: string,
        patch: Partial<
            Pick<TemplateWidget, "config" | "styles" | "bindings" | "placement">
        >,
    ) => void;
    onUpdateCellFlex: (cellId: string, flex: CellFlex | undefined) => void;
    onUpdateCellSpan?: (cellId: string, colSpan: number, rowSpan: number) => void;
    onSetSectionWatermark?: (target: SectionTarget, config: WatermarkConfig | null) => void;
    onSetPageWatermark?: (layer: "background" | "foreground", config: WatermarkConfig | null) => void;
    onUpdateSectionBorder?: (target: SectionTarget, border: SectionBorder | null) => void;
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
    onUpdateCellSpan,
    onSetSectionWatermark,
    onSetPageWatermark,
    onUpdateSectionBorder,
}: PropsPP) {
    const [_pageMode, setPageMode] = useState(false);
    // Auto-exit page mode when a widget or cell is selected
    const pageMode =
        _pageMode && selectedType !== "widget" && selectedType !== "cell";

    const { section, target } = resolveFocusedSection(
        template,
        focusedSectionId,
    );
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
    const selectedCell =
        selectedId && selectedType === "cell"
            ? findCellById(template, selectedId)
            : null;

    // When a widget is selected, also find its containing cell so we can
    // always show cell layout controls at the bottom of the panel.
    const widgetParentCell =
        selectedType === "widget" && selectedWidget
            ? findCellContainingWidget(template, selectedWidget.id)
            : null;

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
            <div
                style={{
                    display: "flex",
                    borderBottom: "1px solid #e2e8f0",
                    flexShrink: 0,
                }}
            >
                <TabBtn
                    active={!pageMode}
                    onClick={() => setPageMode(false)}
                    label="Section"
                />
                <TabBtn
                    active={pageMode}
                    onClick={() => setPageMode(true)}
                    label="Page"
                />
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
                    /* ── PAGE tab ── */
                    <>
                        <PageSettingsPanel
                            template={template}
                            onUpdateTemplate={onUpdateTemplate}
                        />
                        {onSetPageWatermark && (
                            <PageWatermarkPanel
                                pageWatermarks={template.pageWatermarks}
                                onChange={onSetPageWatermark}
                            />
                        )}
                    </>
                ) : (
                    /* â"€â"€ SECTION tab (context-sensitive) â"€â"€ */
                    <>
                        {/* Cell selected â†’ flex layout controls */}
                        {selectedType === "cell" && selectedCell && (
                            <CellFlexPanel
                                cell={selectedCell}
                                onChange={(f) =>
                                    onUpdateCellFlex(selectedCell.id, f)
                                }
                            />
                        )}

                        {/* Widget selected â†’ type-specific controls + placement/delete */}
                        {selectedType === "widget" && selectedWidget && (
                            <>
                                {selectedWidget.type === "logo" && (
                                    <LogoWidgetPanel
                                        widget={selectedWidget}
                                        onUpdateConfig={(patch) =>
                                            onUpdateWidgetConfig(
                                                selectedWidget!.id,
                                                patch,
                                            )
                                        }
                                    />
                                )}
                                {selectedWidget.type === "textLabel" && (
                                    <TextLabelPanel
                                        widget={selectedWidget}
                                        onUpdateConfig={(patch) =>
                                            onUpdateWidgetConfig(
                                                selectedWidget!.id,
                                                patch,
                                            )
                                        }
                                    />
                                )}
                                {selectedWidget.type === "totalsBlock" && (
                                    <TotalsBlockPanel
                                        widget={selectedWidget}
                                        onUpdateConfig={(patch) =>
                                            onUpdateWidgetConfig(
                                                selectedWidget!.id,
                                                patch,
                                            )
                                        }
                                    />
                                )}
                                {selectedWidget.type !== "logo" &&
                                    selectedWidget.type !== "textLabel" && (
                                        <WidgetStylesPanel
                                            widget={selectedWidget}
                                            onUpdateStyles={(s) =>
                                                onUpdateWidgetConfig(
                                                    selectedWidget!.id,
                                                    { styles: s },
                                                )
                                            }
                                        />
                                    )}
                                {selectedWidget.type === "documentInfo" && (
                                    <DocumentInfoPanel
                                        widget={selectedWidget}
                                        onUpdateConfig={(patch) =>
                                            onUpdateWidgetConfig(
                                                selectedWidget!.id,
                                                patch,
                                            )
                                        }
                                    />
                                )}
                                <FieldsConfigPanel
                                    widget={selectedWidget}
                                    onUpdateConfig={(patch) =>
                                        onUpdateWidgetConfig(
                                            selectedWidget!.id,
                                            patch,
                                        )
                                    }
                                />
                                <WidgetConfigPanel
                                    widget={selectedWidget}
                                    onUpdatePlacement={(p) =>
                                        onUpdateWidgetPlacement(
                                            selectedWidget!.id,
                                            p,
                                        )
                                    }
                                    onDelete={() =>
                                        onDeleteNode(selectedWidget!.id)
                                    }
                                />
                                {widgetParentCell && (
                                    <CellFlexPanel
                                        cell={widgetParentCell}
                                        section={section ?? undefined}
                                        onChange={(f) =>
                                            onUpdateCellFlex(
                                                widgetParentCell.id,
                                                f,
                                            )
                                        }
                                        onSpanChange={
                                            onUpdateCellSpan
                                                ? (cs, rs) =>
                                                      onUpdateCellSpan(
                                                          widgetParentCell.id,
                                                          cs,
                                                          rs,
                                                      )
                                                : undefined
                                        }
                                    />
                                )}
                            </>
                        )}

                        {/* Nothing / section selected â†’ grid config */}
                        {(!selectedType || selectedType === "section") &&
                            section && (
                                <>
                                    <GridConfigPanel
                                        section={section}
                                        isHeaderOrFooter={isHF}
                                        onUpdate={(patch) =>
                                            onUpdateGridConfig(target, patch)
                                        }
                                        onUpdateHeight={
                                            isHF
                                                ? (h) =>
                                                      onUpdateSectionHeight(
                                                          focusedSectionId as
                                                              | "header"
                                                              | "footer",
                                                          h,
                                                      )
                                                : undefined
                                        }
                                        onUpdateBg={(bg) =>
                                            onUpdateSectionBg(target, bg)
                                        }
                                        onUpdateDividerColor={
                                            isHF
                                                ? (color) =>
                                                      onUpdateSectionDividerColor(
                                                          focusedSectionId as
                                                              | "header"
                                                              | "footer",
                                                          color,
                                                      )
                                                : undefined
                                        }
                                        onUpdateBorder={
                                            onUpdateSectionBorder
                                                ? (b) => onUpdateSectionBorder(target, b)
                                                : undefined
                                        }
                                    />
                                    {onSetSectionWatermark && (
                                        <SectionWatermarkPanel
                                            watermark={section.watermark}
                                            onChange={(cfg) => onSetSectionWatermark(target, cfg)}
                                        />
                                    )}
                                </>
                            )}
                    </>
                )}
            </div>
        </div>
    );
}
