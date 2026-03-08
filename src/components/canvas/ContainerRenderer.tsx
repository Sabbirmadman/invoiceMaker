/**
 * ContainerRenderer
 *
 * Renders a TemplateContainer with its styles applied.
 * Recursively renders children (TemplateNode[]) which can be more containers or widgets.
 * In editor mode: dashed outline, selection highlight, drag handle, drop target.
 */
import React from "react";
import type { TemplateContainer, TemplateNode } from "@/types/templateV2";
import type { StoredDocument, TotalsResult } from "@/types/document";
import { useEditorSelection } from "@/components/editor/EditorSelectionContext";
import { useDrag } from "@/components/editor/DragContext";
import { WidgetRenderer } from "./WidgetRenderer";

interface Props {
    container: TemplateContainer;
    doc: StoredDocument;
    totals: TotalsResult;
    currentPage?: number;
    totalPages?: number;
    editMode?: boolean;
    onDropIntoContainer?: (containerId: string, index: number) => void;
}

export function ContainerRenderer({
    container,
    doc,
    totals,
    currentPage = 1,
    totalPages = 1,
    editMode = false,
    onDropIntoContainer,
}: Props) {
    const { isSelected, selectNode } = useEditorSelection();
    const { setDropTarget, dropTargetId, endDrag, draggingWidgetType, draggingNodeId } = useDrag();
    const selected = editMode && isSelected(container.id);
    const isDropTarget = editMode && dropTargetId === container.id;
    const isDraggingOver = isDropTarget && (draggingWidgetType !== null || draggingNodeId !== null);

    function handleClick(e: React.MouseEvent) {
        if (!editMode) return;
        e.stopPropagation();
        selectNode(container.id, "container");
    }

    function handleDragOver(e: React.DragEvent) {
        if (!editMode) return;
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "move";
        setDropTarget(container.id, container.children.length);
    }

    function handleDragLeave(e: React.DragEvent) {
        if (!editMode) return;
        // Only clear if leaving the container itself (not a child)
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setDropTarget(null);
        }
    }

    function handleDrop(e: React.DragEvent) {
        if (!editMode) return;
        e.preventDefault();
        e.stopPropagation();
        onDropIntoContainer?.(container.id, container.children.length);
        endDrag();
    }

    const { styles } = container;
    const containerStyle: React.CSSProperties = {
        backgroundColor: styles.backgroundColor,
        backgroundImage: styles.backgroundImage,
        backgroundSize: styles.backgroundSize ?? "cover",
        backgroundPosition: "center",
        backgroundRepeat: styles.backgroundSize === "repeat" ? "repeat" : "no-repeat",
        borderRadius: styles.borderRadius,
        border: styles.border,
        padding: styles.padding,
        margin: styles.margin,
        display: styles.display ?? "block",
        flexDirection: styles.flexDirection,
        gap: styles.gap,
        alignItems: styles.alignItems,
        justifyContent: styles.justifyContent,
        minHeight: styles.minHeight,
        width: styles.width ?? "100%",
        position: "relative",
    };

    // Editor mode overlays
    const editorOutline = editMode
        ? selected
            ? "2px solid #16a34a"
            : isDraggingOver
              ? "2px dashed #2563eb"
              : "1px dashed #d1d5db"
        : undefined;

    return (
        <div
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
                ...containerStyle,
                outline: editorOutline,
                outlineOffset: editMode ? 1 : undefined,
                transition: editMode ? "outline-color 0.1s, background-color 0.1s" : undefined,
                backgroundColor: isDraggingOver
                    ? "rgba(37, 99, 235, 0.05)"
                    : containerStyle.backgroundColor,
            }}
            className={editMode ? "group/container" : undefined}
            data-container-id={container.id}
        >
            {editMode && selected && (
                <div
                    style={{
                        position: "absolute",
                        top: -1,
                        left: -1,
                        background: "#16a34a",
                        color: "#fff",
                        fontSize: 8,
                        padding: "0 4px",
                        borderRadius: "2px 0 2px 0",
                        zIndex: 50,
                        lineHeight: "14px",
                        pointerEvents: "none",
                        whiteSpace: "nowrap",
                    }}
                >
                    container
                </div>
            )}

            {container.children.map((child) => (
                <NodeRenderer
                    key={child.id}
                    node={child}
                    doc={doc}
                    totals={totals}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    editMode={editMode}
                    onDropIntoContainer={onDropIntoContainer}
                />
            ))}

            {/* Empty state in editor */}
            {editMode && container.children.length === 0 && (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: 40,
                        color: "#9ca3af",
                        fontSize: 11,
                        pointerEvents: "none",
                    }}
                >
                    {isDraggingOver ? "Drop here" : "Empty container"}
                </div>
            )}
        </div>
    );
}

/** Renders any TemplateNode (widget or container) */
export function NodeRenderer({
    node,
    doc,
    totals,
    currentPage,
    totalPages,
    editMode,
    onDropIntoContainer,
}: {
    node: TemplateNode;
    doc: StoredDocument;
    totals: TotalsResult;
    currentPage?: number;
    totalPages?: number;
    editMode?: boolean;
    onDropIntoContainer?: (containerId: string, index: number) => void;
}) {
    if (node.kind === "container") {
        return (
            <ContainerRenderer
                container={node}
                doc={doc}
                totals={totals}
                currentPage={currentPage}
                totalPages={totalPages}
                editMode={editMode}
                onDropIntoContainer={onDropIntoContainer}
            />
        );
    }
    return (
        <WidgetRenderer
            widget={node}
            doc={doc}
            totals={totals}
            currentPage={currentPage}
            totalPages={totalPages}
            editMode={editMode}
        />
    );
}
