import React, { createContext, useContext, useState, useCallback } from "react";
import type { ElementType } from "@/types/template";

/** What's being dragged from the palette — a widget type or "container" */
export type PaletteDragType = ElementType | "container";

interface DragState {
    /** ID of an existing node being moved (null if dragging from palette) */
    draggingNodeId: string | null;
    /** Type being dragged from palette — ElementType for widgets, "container" for containers, null if moving existing */
    draggingWidgetType: PaletteDragType | null;
    /** ID of cell or container being hovered as a drop target */
    dropTargetId: string | null;
    /** Index within the target's children list for insertion */
    dropIndex: number;
}

interface DragContextValue extends DragState {
    startDragFromPalette: (type: PaletteDragType) => void;
    startDragExisting: (nodeId: string) => void;
    setDropTarget: (id: string | null, index?: number) => void;
    endDrag: () => void;
    isDragging: boolean;
}

const DragContext = createContext<DragContextValue>({
    draggingNodeId: null,
    draggingWidgetType: null,
    dropTargetId: null,
    dropIndex: 0,
    startDragFromPalette: () => {},
    startDragExisting: () => {},
    setDropTarget: () => {},
    endDrag: () => {},
    isDragging: false,
});

export function DragProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<DragState>({
        draggingNodeId: null,
        draggingWidgetType: null,
        dropTargetId: null,
        dropIndex: 0,
    });

    const startDragFromPalette = useCallback((type: PaletteDragType) => {
        setState({ draggingNodeId: null, draggingWidgetType: type, dropTargetId: null, dropIndex: 0 });
    }, []);

    const startDragExisting = useCallback((nodeId: string) => {
        setState({ draggingNodeId: nodeId, draggingWidgetType: null, dropTargetId: null, dropIndex: 0 });
    }, []);

    const setDropTarget = useCallback((id: string | null, index = 0) => {
        setState((prev) => ({ ...prev, dropTargetId: id, dropIndex: index }));
    }, []);

    const endDrag = useCallback(() => {
        setState({ draggingNodeId: null, draggingWidgetType: null, dropTargetId: null, dropIndex: 0 });
    }, []);

    const isDragging = state.draggingNodeId !== null || state.draggingWidgetType !== null;

    return (
        <DragContext.Provider value={{ ...state, startDragFromPalette, startDragExisting, setDropTarget, endDrag, isDragging }}>
            {children}
        </DragContext.Provider>
    );
}

export const useDrag = () => useContext(DragContext);
