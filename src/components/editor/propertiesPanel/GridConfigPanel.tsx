import type {
    SectionGridV2,
    GridConfig,
    CellFlex,
    TemplateGridCell,
    SectionBorder,
} from "@/types/templateV2";
import { PanelSection, Row, NumberInput, TextInput, ColorInput, SelectInput } from "./shared";

// -- Grid Config Panel -------------------------------------------------------

interface GridConfigPanelProps {
    section: SectionGridV2;
    isHeaderOrFooter: boolean;
    onUpdate: (patch: Partial<GridConfig>) => void;
    onUpdateHeight?: (h: number) => void;
    onUpdateBg?: (bg: SectionGridV2["background"]) => void;
    onUpdateDividerColor?: (color: string) => void;
    onUpdateBorder?: (border: SectionBorder | null) => void;
}

export function GridConfigPanel({
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

// -- Section Border Panel ----------------------------------------------------

const DEFAULT_BORDER: SectionBorder = {
    color: "#e2e8f0",
    width: 1,
    style: "solid",
    top: false,
    right: false,
    bottom: false,
    left: false,
};

export function SectionBorderPanel({
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

// -- Cell Flex Panel ---------------------------------------------------------

export function CellFlexPanel({
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
