import { createContext, useContext, useState, useCallback } from "react";

export type SelectionNodeType = "section" | "cell" | "widget" | null;

interface EditorSelectionValue {
    selectedId: string | null;
    selectedType: SelectionNodeType;
    selectNode: (id: string, type: NonNullable<SelectionNodeType>) => void;
    clearSelection: () => void;
    isSelected: (id: string) => boolean;
}

const EditorSelectionContext = createContext<EditorSelectionValue>({
    selectedId: null,
    selectedType: null,
    selectNode: () => {},
    clearSelection: () => {},
    isSelected: () => false,
});

export function EditorSelectionProvider({ children }: { children: React.ReactNode }) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<SelectionNodeType>(null);

    const selectNode = useCallback((id: string, type: NonNullable<SelectionNodeType>) => {
        setSelectedId(id);
        setSelectedType(type);
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedId(null);
        setSelectedType(null);
    }, []);

    const isSelected = useCallback((id: string) => selectedId === id, [selectedId]);

    return (
        <EditorSelectionContext.Provider
            value={{ selectedId, selectedType, selectNode, clearSelection, isSelected }}
        >
            {children}
        </EditorSelectionContext.Provider>
    );
}

export const useEditorSelection = () => useContext(EditorSelectionContext);
