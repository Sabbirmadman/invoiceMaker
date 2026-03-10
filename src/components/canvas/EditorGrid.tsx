/**
 * EditorGrid
 *
 * Renders a SectionGridV2 as a CSS Grid.
 * - In editor mode: draws dashed gray grid lines, section label, settings button.
 * - Renders EditorCell for each occupied cell.
 * - Implicit empty cells are shown as drop targets in editor mode.
 * - In preview mode: clean CSS grid, no overlays.
 */
import React from "react";
import { Settings } from "lucide-react";
import type { SectionGridV2 } from "@/types/templateV2";
import type { StoredDocument, TotalsResult } from "@/types/document";
import { useEditorSelection } from "@/components/editor/EditorSelectionContext";
import { useDrag } from "@/components/editor/DragContext";
import { EditorCell } from "./EditorCell";
import { WatermarkElement } from "@/components/elements/WatermarkElement";

interface Props {
    section: SectionGridV2;
    sectionLabel?: string;
    doc: StoredDocument;
    totals: TotalsResult;
    editMode?: boolean;
    /** Called when a node is dropped into a cell */
    onDropIntoCell?: (cellId: string, dropIndex: number) => void;
    /** Called when the settings gear is clicked (open grid config panel) */
    onSettingsClick?: (sectionId: string) => void;
}

export function EditorGrid({
    section,
    sectionLabel,
    doc,
    totals,
    editMode = false,
    onDropIntoCell,
    onSettingsClick,
}: Props) {
    const { selectNode } = useEditorSelection();
    const { setDropTarget, dropTargetId, endDrag, draggingWidgetType, draggingNodeId } = useDrag();

    const { grid } = section;
    const colTemplate = grid.colWidths.join(" ");
    const rowTemplate = grid.rowHeights.join(" ");

    // Build set of occupied (colStart, rowStart) for empty-cell detection
    const occupiedKeys = new Set(
        section.cells.map((c) => cellKey(c.colStart, c.rowStart)),
    );

    // Generate all implied grid positions for editor empty-cell placeholders
    const allCells: Array<{ col: number; row: number }> = [];
    if (editMode) {
        for (let r = 1; r <= grid.rows; r++) {
            for (let c = 1; c <= grid.columns; c++) {
                if (!occupiedKeys.has(cellKey(c, r))) {
                    allCells.push({ col: c, row: r });
                }
            }
        }
    }

    // Per-side padding (fall back to uniform `grid.padding` if unset)
    const pt = grid.paddingTop ?? grid.padding;
    const pr = grid.paddingRight ?? grid.padding;
    const pb = grid.paddingBottom ?? grid.padding;
    const pl = grid.paddingLeft ?? grid.padding;

    // Border style from section.border
    const b = section.border;
    const borderStyle: React.CSSProperties = b
        ? {
              borderTop: b.top ? `${b.width}px ${b.style} ${b.color}` : undefined,
              borderRight: b.right ? `${b.width}px ${b.style} ${b.color}` : undefined,
              borderBottom: b.bottom ? `${b.width}px ${b.style} ${b.color}` : undefined,
              borderLeft: b.left ? `${b.width}px ${b.style} ${b.color}` : undefined,
          }
        : {};

    const gridStyle: React.CSSProperties = {
        display: "grid",
        gridTemplateColumns: colTemplate,
        gridTemplateRows: rowTemplate,
        gap: `${grid.rowGap}px ${grid.colGap}px`,
        paddingTop: pt,
        paddingRight: pr,
        paddingBottom: pb,
        paddingLeft: pl,
        width: "100%",
        height: section.height !== undefined ? section.height : "auto",
        position: "relative",
        boxSizing: "border-box",
        ...borderStyle,
    };

    // Background styles
    const bgStyle: React.CSSProperties = {};
    if (section.background?.color) bgStyle.backgroundColor = section.background.color;
    if (section.background?.imageUrl) {
        bgStyle.backgroundImage = `url('${section.background.imageUrl}')`;
        bgStyle.backgroundSize =
            section.background.imageSize === "repeat" ? "auto" : (section.background.imageSize ?? "cover");
        bgStyle.backgroundPosition = "center";
        bgStyle.backgroundRepeat = section.background.imageSize === "repeat" ? "repeat" : "no-repeat";
    }

    function handleGridClick(e: React.MouseEvent) {
        if (!editMode) return;
        // Only fire if clicking directly on the grid (not a child)
        if (e.target === e.currentTarget) {
            selectNode(section.id, "section");
        }
    }

    // Build a fake TemplateElement to pass to WatermarkElement
    const sectionWatermarkEl = section.watermark
        ? { id: `wm_${section.id}`, type: "watermark" as const, zIndex: 20, config: section.watermark as unknown as Record<string, unknown> }
        : null;

    return (
        <div style={{ position: "relative", ...bgStyle }}>
            {/* Section label bar — editor only */}
            {editMode && sectionLabel && (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "2px 8px",
                        background: "#f8fafc",
                        borderBottom: "1px solid #e2e8f0",
                        fontSize: 10,
                        color: "#64748b",
                        fontWeight: 600,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        userSelect: "none",
                    }}
                >
                    <span>{sectionLabel}</span>
                    <button
                        onClick={() => onSettingsClick?.(section.id)}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 2,
                            color: "#94a3b8",
                            display: "flex",
                            alignItems: "center",
                        }}
                        title={`Configure ${sectionLabel} grid`}
                    >
                        <Settings size={11} />
                    </button>
                </div>
            )}

            {/* Grid */}
            <div
                style={gridStyle}
                onClick={handleGridClick}
                data-section-id={section.id}
            >
                {/* Occupied cells */}
                {section.cells.map((cell) => (
                    <EditorCell
                        key={cell.id}
                        cell={cell}
                        doc={doc}
                        totals={totals}
                        editMode={editMode}
                        onDrop={onDropIntoCell}
                    />
                ))}

                {/* Empty cell placeholders — editor only */}
                {editMode &&
                    allCells.map(({ col, row }) => {
                        const id = `empty_${section.id}_${col}_${row}`;
                        const isTarget = dropTargetId === id;
                        const isDragging = draggingWidgetType !== null || draggingNodeId !== null;

                        return (
                            <EmptyCell
                                key={id}
                                id={id}
                                col={col}
                                row={row}
                                isTarget={isTarget && isDragging}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setDropTarget(id, 0);
                                }}
                                onDragLeave={() => setDropTarget(null)}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    // Caller handles creating the cell
                                    onDropIntoCell?.(id, 0);
                                    endDrag();
                                }}
                            />
                        );
                    })}
            </div>

            {/* Section-level watermark overlay */}
            {sectionWatermarkEl && (
                <WatermarkElement element={sectionWatermarkEl} />
            )}
        </div>
    );
}

// ── Empty cell placeholder ────────────────────────────────────────────────────

function EmptyCell({
    id,
    col,
    row,
    isTarget,
    onDragOver,
    onDragLeave,
    onDrop,
}: {
    id: string;
    col: number;
    row: number;
    isTarget: boolean;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: () => void;
    onDrop: (e: React.DragEvent) => void;
}) {
    return (
        <div
            data-empty-cell-id={id}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            style={{
                gridColumn: `${col} / span 1`,
                gridRow: `${row} / span 1`,
                border: isTarget ? "2px dashed #2563eb" : "1px dashed #e2e8f0",
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: isTarget ? "#2563eb" : "#cbd5e1",
                fontSize: 18,
                minHeight: 32,
                transition: "border-color 0.1s, color 0.1s, background-color 0.1s",
                backgroundColor: isTarget ? "rgba(37, 99, 235, 0.05)" : "transparent",
                cursor: "default",
                userSelect: "none",
            }}
        >
            {isTarget ? "" : "+"}
        </div>
    );
}

function cellKey(col: number, row: number): string {
    return `${col}:${row}`;
}
