/**
 * EditorCell
 *
 * Renders one TemplateGridCell in the editor.
 * - Positioned via CSS grid (colStart/colSpan/rowStart/rowSpan).
 * - In editor mode: dashed outline, cell coordinate label, drop target highlight.
 * - Accepts drops from palette and from existing widgets.
 * - Children (TemplateNodes) rendered vertically stacked.
 */
import React from "react";
import type { TemplateGridCell } from "@/types/templateV2";
import type { StoredDocument, TotalsResult } from "@/types/document";
import { useEditorSelection } from "@/components/editor/EditorSelectionContext";
import { useDrag } from "@/components/editor/DragContext";
import { NodeRenderer } from "./ContainerRenderer";

interface Props {
    cell: TemplateGridCell;
    doc: StoredDocument;
    totals: TotalsResult;
    currentPage?: number;
    totalPages?: number;
    editMode?: boolean;
    /** Called when a drop lands on this cell */
    onDrop?: (cellId: string, dropIndex: number) => void;
    /** Called when a drop lands inside a container within this cell */
    onDropIntoContainer?: (containerId: string, index: number) => void;
}

export function EditorCell({
    cell,
    doc,
    totals,
    currentPage = 1,
    totalPages = 1,
    editMode = false,
    onDrop,
    onDropIntoContainer,
}: Props) {
    const { isSelected, selectNode } = useEditorSelection();
    const { setDropTarget, dropTargetId, endDrag, draggingWidgetType, draggingNodeId } = useDrag();

    const selected = editMode && isSelected(cell.id);
    const isDropTarget = editMode && dropTargetId === cell.id;
    const isDraggingOver = isDropTarget && (draggingWidgetType !== null || draggingNodeId !== null);

    function handleClick(e: React.MouseEvent) {
        if (!editMode) return;
        e.stopPropagation();
        selectNode(cell.id, "cell");
    }

    function handleDragOver(e: React.DragEvent) {
        if (!editMode) return;
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "move";
        setDropTarget(cell.id, cell.children.length);
    }

    function handleDragLeave(e: React.DragEvent) {
        if (!editMode) return;
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setDropTarget(null);
        }
    }

    function handleDrop(e: React.DragEvent) {
        if (!editMode) return;
        e.preventDefault();
        e.stopPropagation();
        onDrop?.(cell.id, cell.children.length);
        endDrag();
    }

    const gridStyle: React.CSSProperties = {
        gridColumn: `${cell.colStart} / span ${cell.colSpan}`,
        gridRow: `${cell.rowStart} / span ${cell.rowSpan}`,
        minHeight: 0,
        overflow: "hidden",
        position: "relative",
    };

    const editOverlayStyle: React.CSSProperties = editMode
        ? {
              outline: selected
                  ? "2px solid #7c3aed"
                  : isDraggingOver
                    ? "2px dashed #2563eb"
                    : "1px dashed #d1d5db",
              outlineOffset: -1,
              backgroundColor: isDraggingOver ? "rgba(37, 99, 235, 0.04)" : undefined,
              transition: "outline-color 0.1s, background-color 0.1s",
          }
        : {};

    return (
        <div
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{ ...gridStyle, ...editOverlayStyle }}
            className={editMode ? "group/cell" : undefined}
            data-cell-id={cell.id}
        >
            {/* Cell label — editor only, top-left corner */}
            {editMode && (
                <div
                    style={{
                        position: "absolute",
                        top: 1,
                        left: 1,
                        zIndex: 40,
                        background: selected ? "#7c3aed" : "#94a3b8",
                        color: "#fff",
                        fontSize: 7,
                        padding: "0 3px",
                        borderRadius: 2,
                        lineHeight: "13px",
                        opacity: selected ? 1 : 0,
                        pointerEvents: "none",
                        whiteSpace: "nowrap",
                        transition: "opacity 0.1s",
                    }}
                    className="group-hover/cell:opacity-100"
                >
                    {cell.colStart}:{cell.rowStart}
                    {(cell.colSpan > 1 || cell.rowSpan > 1) && ` (${cell.colSpan}×${cell.rowSpan})`}
                </div>
            )}

            {/* Children — stacked vertically */}
            <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 4 }}>
                {cell.children.map((node) => (
                    <NodeRenderer
                        key={node.id}
                        node={node}
                        doc={doc}
                        totals={totals}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        editMode={editMode}
                        onDropIntoContainer={onDropIntoContainer}
                    />
                ))}

                {/* Empty cell drop zone */}
                {editMode && cell.children.length === 0 && (
                    <div
                        style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: isDraggingOver ? "#2563eb" : "#9ca3af",
                            fontSize: 11,
                            minHeight: 32,
                            pointerEvents: "none",
                        }}
                    >
                        {isDraggingOver ? "Drop here" : "+"}
                    </div>
                )}
            </div>
        </div>
    );
}
