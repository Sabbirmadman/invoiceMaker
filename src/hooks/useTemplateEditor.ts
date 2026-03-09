/**
 * useTemplateEditor
 *
 * Central hook for all template mutation operations.
 * Manages TemplateV2 state with undo/redo history (max 50 steps).
 *
 * Body is now BodySectionV2 — an ordered list of SectionGridV2 grids.
 * Body-targeting operations accept a `gridId` to identify which body grid to modify.
 */

import { useState, useCallback } from "react";
import type {
    TemplateV2,
    BodySectionV2,
    SectionGridV2,
    TemplateGridCell,
    TemplateNode,
    TemplateWidget,
    GridConfig,
    CellFlex,
    PagePadding,
    PageAccentBorders,
    WatermarkConfig,
    SectionBorder,
} from "@/types/templateV2";
import {
    makeWidget,
    makeCell,
    removeNodeById,
    insertNode,
    removeNodeFromSection,
    removeNodeFromBody,
    makeBodyGrid,
    pruneEmptyCellsInTemplate,
} from "@/types/templateV2";
import type { ElementType } from "@/types/template";
import type { BodyPlacement } from "@/types/templateV2";

const MAX_HISTORY = 50;

export type SectionTarget = "header" | "footer" | { bodyGridId: string };

export interface UseTemplateEditorReturn {
    template: TemplateV2;
    canUndo: boolean;
    canRedo: boolean;
    undo: () => void;
    redo: () => void;
    // Grid config
    updateGridConfig: (
        target: SectionTarget,
        config: Partial<GridConfig>,
    ) => void;
    // Body grid management
    addBodyGrid: (columns?: number) => string; // returns new grid id
    removeBodyGrid: (gridId: string) => void;
    moveBodyGrid: (gridId: string, direction: "up" | "down") => void;
    // Cell operations
    addWidget: (
        target: SectionTarget,
        cellId: string,
        widgetType: ElementType,
        dropIndex?: number,
    ) => void;
    // Node operations
    moveNode: (
        nodeId: string,
        targetCellId: string,
        targetGridId?: string,
    ) => void;
    deleteNode: (nodeId: string) => void;
    updateWidgetConfig: (
        nodeId: string,
        patch: Partial<
            Pick<TemplateWidget, "config" | "styles" | "bindings" | "placement">
        >,
    ) => void;
    // Section/grid background
    updateGridBackground: (
        target: SectionTarget,
        bg: SectionGridV2["background"],
    ) => void;
    updateSectionBackground: (
        target: SectionTarget,
        bg: SectionGridV2["background"],
    ) => void;
    // Section height (header/footer)
    updateSectionHeight: (target: "header" | "footer", height: number) => void;
    // Section divider color (header/footer)
    updateSectionDividerColor: (
        target: "header" | "footer",
        color: string,
    ) => void;
    // Visibility
    setSectionVisible: (target: "header" | "footer", visible: boolean) => void;
    // Page-level settings
    updateTemplate: (
        patch: Partial<
            Pick<
                TemplateV2,
                "pageSize" | "orientation" | "pagePadding" | "accentBorders" | "pageBackground" | "theme" | "documentType"
            >
        >,
    ) => void;
    // Cell flex
    updateCellFlex: (cellId: string, flex: CellFlex | undefined) => void;
    // Cell span
    updateCellSpan: (cellId: string, colSpan: number, rowSpan: number) => void;
    // Watermarks
    setSectionWatermark: (target: SectionTarget, config: WatermarkConfig | null) => void;
    setPageWatermark: (layer: "background" | "foreground", config: WatermarkConfig | null) => void;
    // Border
    updateSectionBorder: (target: SectionTarget, border: SectionBorder | null) => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

let _seq = 0;
function uid(prefix = "n"): string {
    return `${prefix}_${Date.now()}_${++_seq}`;
}

function getFixedSection(
    t: TemplateV2,
    id: "header" | "footer",
): SectionGridV2 {
    return t[id];
}

function setFixedSection(
    t: TemplateV2,
    id: "header" | "footer",
    s: SectionGridV2,
): TemplateV2 {
    return { ...t, [id]: s };
}

function getBodyGrid(t: TemplateV2, gridId: string): SectionGridV2 | undefined {
    return t.body.grids.find((g) => g.id === gridId);
}

function setBodyGrid(
    t: TemplateV2,
    gridId: string,
    grid: SectionGridV2,
): TemplateV2 {
    return {
        ...t,
        body: {
            grids: t.body.grids.map((g) => (g.id === gridId ? grid : g)),
        },
    };
}

function resolveSection(
    t: TemplateV2,
    target: SectionTarget,
): SectionGridV2 | undefined {
    if (target === "header") return t.header;
    if (target === "footer") return t.footer;
    return getBodyGrid(t, target.bodyGridId);
}

function applyToSection(
    t: TemplateV2,
    target: SectionTarget,
    section: SectionGridV2,
): TemplateV2 {
    if (target === "header") return { ...t, header: section };
    if (target === "footer") return { ...t, footer: section };
    return setBodyGrid(t, target.bodyGridId, section);
}

function findCell(
    section: SectionGridV2,
    cellId: string,
): TemplateGridCell | null {
    return section.cells.find((c) => c.id === cellId) ?? null;
}

function upsertCell(
    section: SectionGridV2,
    cell: TemplateGridCell,
): SectionGridV2 {
    const exists = section.cells.some((c) => c.id === cell.id);
    const cells = exists
        ? section.cells.map((c) => (c.id === cell.id ? cell : c))
        : [...section.cells, cell];
    return { ...section, cells };
}

/** Parse empty-cell placeholder id "empty_{gridId}_{col}_{row}" */
function parseEmptyCellId(
    id: string,
): { gridId: string; col: number; row: number } | null {
    // Format: empty_{anything}_{col}_{row} — gridId may contain underscores
    const m = id.match(/^empty_(.+)_(\d+)_(\d+)$/);
    if (!m) return null;
    return { gridId: m[1], col: Number(m[2]), row: Number(m[3]) };
}

/** Find which section (header/footer or a body grid) and cell contain a node */
function locateNode(
    t: TemplateV2,
    nodeId: string,
): {
    target: SectionTarget;
    section: SectionGridV2;
    cell: TemplateGridCell;
    index: number;
} | null {
    // Check header
    for (const cell of t.header.cells) {
        const idx = cell.children.findIndex((n) => n.id === nodeId);
        if (idx !== -1)
            return { target: "header", section: t.header, cell, index: idx };
    }
    // Check footer
    for (const cell of t.footer.cells) {
        const idx = cell.children.findIndex((n) => n.id === nodeId);
        if (idx !== -1)
            return { target: "footer", section: t.footer, cell, index: idx };
    }
    // Check body grids
    for (const grid of t.body.grids) {
        for (const cell of grid.cells) {
            const idx = cell.children.findIndex((n) => n.id === nodeId);
            if (idx !== -1)
                return {
                    target: { bodyGridId: grid.id },
                    section: grid,
                    cell,
                    index: idx,
                };
        }
    }
    return null;
}

function removeNodeFromAll(t: TemplateV2, nodeId: string): TemplateV2 {
    return {
        ...t,
        header: removeNodeFromSection(t.header, nodeId),
        footer: removeNodeFromSection(t.footer, nodeId),
        body: removeNodeFromBody(t.body, nodeId),
    };
}

function patchNodeInSection(
    section: SectionGridV2,
    nodeId: string,
    patcher: (n: TemplateNode) => TemplateNode,
): SectionGridV2 {
    return {
        ...section,
        cells: section.cells.map((cell) => ({
            ...cell,
            children: cell.children.map((n) =>
                n.id === nodeId ? patcher(n) : n,
            ),
        })),
    };
}

function patchNodeInAll(
    t: TemplateV2,
    nodeId: string,
    patcher: (n: TemplateNode) => TemplateNode,
): TemplateV2 {
    return {
        ...t,
        header: patchNodeInSection(t.header, nodeId, patcher),
        footer: patchNodeInSection(t.footer, nodeId, patcher),
        body: {
            grids: t.body.grids.map((g) =>
                patchNodeInSection(g, nodeId, patcher),
            ),
        },
    };
}

function resolveTargetFromCellId(
    t: TemplateV2,
    cellId: string,
    fallback: SectionTarget,
): SectionTarget {
    // Check empty cell id prefix
    const empty = parseEmptyCellId(cellId);
    if (empty) {
        if (empty.gridId === "header") return "header";
        if (empty.gridId === "footer") return "footer";
        return { bodyGridId: empty.gridId };
    }
    // Check which section owns this real cell
    if (t.header.cells.some((c) => c.id === cellId)) return "header";
    if (t.footer.cells.some((c) => c.id === cellId)) return "footer";
    for (const g of t.body.grids) {
        if (g.cells.some((c) => c.id === cellId)) return { bodyGridId: g.id };
    }
    return fallback;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useTemplateEditor(
    initial: TemplateV2,
): UseTemplateEditorReturn {
    const [history, setHistory] = useState<TemplateV2[]>([initial]);
    const [historyIndex, setHistoryIndex] = useState(0);

    const template = history[historyIndex];

    const push = useCallback(
        (next: TemplateV2) => {
            setHistory((prev) => {
                const sliced = prev.slice(0, historyIndex + 1);
                const trimmed =
                    sliced.length >= MAX_HISTORY ? sliced.slice(1) : sliced;
                return [...trimmed, next];
            });
            setHistoryIndex((i) => Math.min(i + 1, MAX_HISTORY - 1));
        },
        [historyIndex],
    );

    const undo = useCallback(
        () => setHistoryIndex((i) => Math.max(0, i - 1)),
        [],
    );
    const redo = useCallback(
        () => setHistoryIndex((i) => Math.min(history.length - 1, i + 1)),
        [history.length],
    );

    // ── Grid config ──────────────────────────────────────────────────────────

    const updateGridConfig = useCallback(
        (target: SectionTarget, config: Partial<GridConfig>) => {
            const s = resolveSection(template, target);
            if (!s) return;
            const newGrid = { ...s.grid, ...config };
            if (
                config.columns !== undefined &&
                config.columns !== s.grid.columns
            ) {
                const cols = config.columns;
                newGrid.colWidths = Array.from(
                    { length: cols },
                    (_, i) => s.grid.colWidths[i] ?? "1fr",
                );
            }
            if (config.rows !== undefined && config.rows !== s.grid.rows) {
                const rows = config.rows;
                newGrid.rowHeights = Array.from(
                    { length: rows },
                    (_, i) => s.grid.rowHeights[i] ?? "auto",
                );
            }
            push(applyToSection(template, target, { ...s, grid: newGrid }));
        },
        [template, push],
    );

    // ── Body grid management ─────────────────────────────────────────────────

    const addBodyGrid = useCallback(
        (columns = 1): string => {
            const newGridId = uid("body_grid");
            const newGrid = makeBodyGrid(newGridId, columns);
            push({
                ...template,
                body: { grids: [...template.body.grids, newGrid] },
            });
            return newGridId;
        },
        [template, push],
    );

    const removeBodyGrid = useCallback(
        (gridId: string) => {
            const grids = template.body.grids.filter((g) => g.id !== gridId);
            push({
                ...template,
                body: {
                    grids:
                        grids.length > 0
                            ? grids
                            : [makeBodyGrid(uid("body_grid"))],
                },
            });
        },
        [template, push],
    );

    const moveBodyGrid = useCallback(
        (gridId: string, direction: "up" | "down") => {
            const grids = [...template.body.grids];
            const idx = grids.findIndex((g) => g.id === gridId);
            if (idx === -1) return;
            const newIdx = direction === "up" ? idx - 1 : idx + 1;
            if (newIdx < 0 || newIdx >= grids.length) return;
            [grids[idx], grids[newIdx]] = [grids[newIdx], grids[idx]];
            push({ ...template, body: { grids } });
        },
        [template, push],
    );

    // ── Add widget ───────────────────────────────────────────────────────────

    const addWidget = useCallback(
        (
            target: SectionTarget,
            cellId: string,
            widgetType: ElementType,
            dropIndex?: number,
        ) => {
            const resolvedTarget = resolveTargetFromCellId(
                template,
                cellId,
                target,
            );
            const section = resolveSection(template, resolvedTarget);
            if (!section) return;

            const placement: BodyPlacement | undefined =
                typeof resolvedTarget === "object"
                    ? widgetType === "itemList"
                        ? "all-pages"
                        : "last-page"
                    : undefined;
            const widget = makeWidget(uid("w"), widgetType, placement);

            const empty = parseEmptyCellId(cellId);
            if (empty) {
                const newCell = makeCell(
                    uid("cell"),
                    empty.col,
                    empty.row,
                    1,
                    1,
                    [widget],
                );
                push(
                    applyToSection(
                        template,
                        resolvedTarget,
                        upsertCell(section, newCell),
                    ),
                );
                return;
            }

            const cell = findCell(section, cellId);
            if (!cell) return;
            const idx = dropIndex ?? cell.children.length;
            push(
                applyToSection(
                    template,
                    resolvedTarget,
                    upsertCell(section, {
                        ...cell,
                        children: insertNode(cell.children, widget, idx),
                    }),
                ),
            );
        },
        [template, push],
    );

    // ── Move node ────────────────────────────────────────────────────────────

    const moveNode = useCallback(
        (nodeId: string, targetCellId: string, targetGridId?: string) => {
            const location = locateNode(template, nodeId);
            if (!location) return;
            const node = location.cell.children[location.index];
            if (!node) return;

            let t = removeNodeFromAll(template, nodeId);

            const fallbackTarget: SectionTarget = targetGridId
                ? { bodyGridId: targetGridId }
                : location.target;
            const resolvedTarget = resolveTargetFromCellId(
                t,
                targetCellId,
                fallbackTarget,
            );
            const section = resolveSection(t, resolvedTarget);
            if (!section) return;

            const empty = parseEmptyCellId(targetCellId);
            if (empty) {
                const newCell = makeCell(
                    uid("cell"),
                    empty.col,
                    empty.row,
                    1,
                    1,
                    [node],
                );
                t = applyToSection(
                    t,
                    resolvedTarget,
                    upsertCell(section, newCell),
                );
            } else {
                const cell = findCell(section, targetCellId);
                if (!cell) return;
                const newChildren = insertNode(
                    cell.children,
                    node,
                    cell.children.length,
                );
                t = applyToSection(
                    t,
                    resolvedTarget,
                    upsertCell(section, { ...cell, children: newChildren }),
                );
            }
            // Prune the cell that was vacated so its position becomes an empty drop target again
            push(pruneEmptyCellsInTemplate(t));
        },
        [template, push],
    );

    // ── Delete node ──────────────────────────────────────────────────────────

    const deleteNode = useCallback(
        (nodeId: string) => {
            // Also prune cells that become empty after the delete so the
            // empty-cell placeholder re-appears and can receive new drops.
            push(pruneEmptyCellsInTemplate(removeNodeFromAll(template, nodeId)));
        },
        [template, push],
    );

    // ── Update widget config ─────────────────────────────────────────────────

    const updateWidgetConfig = useCallback(
        (
            nodeId: string,
            patch: Partial<
                Pick<
                    TemplateWidget,
                    "config" | "styles" | "bindings" | "placement"
                >
            >,
        ) => {
            push(
                patchNodeInAll(template, nodeId, (n) =>
                    n.kind === "widget" ? { ...n, ...patch } : n,
                ),
            );
        },
        [template, push],
    );

    // ── Grid/section background ──────────────────────────────────────────────

    const updateGridBackground = useCallback(
        (target: SectionTarget, bg: SectionGridV2["background"]) => {
            const s = resolveSection(template, target);
            if (!s) return;
            push(applyToSection(template, target, { ...s, background: bg }));
        },
        [template, push],
    );

    // ── Section height ───────────────────────────────────────────────────────

    const updateSectionHeight = useCallback(
        (target: "header" | "footer", height: number) => {
            const s = getFixedSection(template, target);
            push(setFixedSection(template, target, { ...s, height }));
        },
        [template, push],
    );
    // ── Section divider color ─────────────────────────────────────────

    const updateSectionDividerColor = useCallback(
        (target: "header" | "footer", color: string) => {
            const s = getFixedSection(template, target);
            push(
                setFixedSection(template, target, {
                    ...s,
                    dividerColor: color,
                }),
            );
        },
        [template, push],
    );

    // ── Page-level settings ───────────────────────────────────────────

    const updateTemplate = useCallback(
        (
            patch: Partial<
                Pick<
                    TemplateV2,
                    "pageSize" | "orientation" | "pagePadding" | "accentBorders" | "pageBackground" | "theme" | "documentType"
                >
            >,
        ) => {
            push({ ...template, ...patch });
        },
        [template, push],
    );

    // ── Cell flex ─────────────────────────────────────────────────────

    const updateCellFlex = useCallback(
        (cellId: string, flex: CellFlex | undefined) => {
            function patchSection(s: SectionGridV2): SectionGridV2 {
                if (!s.cells.some((c) => c.id === cellId)) return s;
                return {
                    ...s,
                    cells: s.cells.map((c) =>
                        c.id === cellId ? { ...c, flex } : c,
                    ),
                };
            }
            push({
                ...template,
                header: patchSection(template.header),
                footer: patchSection(template.footer),
                body: { grids: template.body.grids.map(patchSection) },
            });
        },
        [template, push],
    );

    // ── Cell span ─────────────────────────────────────────────────────

    const updateCellSpan = useCallback(
        (cellId: string, colSpan: number, rowSpan: number) => {
            function patchSection(s: SectionGridV2): SectionGridV2 {
                if (!s.cells.some((c) => c.id === cellId)) return s;
                return {
                    ...s,
                    cells: s.cells.map((c) =>
                        c.id === cellId
                            ? {
                                  ...c,
                                  colSpan: Math.max(1, colSpan),
                                  rowSpan: Math.max(1, rowSpan),
                              }
                            : c,
                    ),
                };
            }
            push({
                ...template,
                header: patchSection(template.header),
                footer: patchSection(template.footer),
                body: { grids: template.body.grids.map(patchSection) },
            });
        },
        [template, push],
    );
    // ── Watermarks ────────────────────────────────────────────────────────────

    const setSectionWatermark = useCallback(
        (target: SectionTarget, config: WatermarkConfig | null) => {
            const s = resolveSection(template, target);
            if (!s) return;
            const updated = config ? { ...s, watermark: config } : (() => { const { watermark: _w, ...rest } = s; return rest as SectionGridV2; })();
            push(applyToSection(template, target, updated));
        },
        [template, push],
    );

    const setPageWatermark = useCallback(
        (layer: "background" | "foreground", config: WatermarkConfig | null) => {
            const existing = template.pageWatermarks ?? {};
            if (config === null) {
                const { [layer === "background" ? "background" : "foreground"]: _removed, ...rest } = existing;
                push({ ...template, pageWatermarks: Object.keys(rest).length ? rest : undefined });
            } else {
                push({ ...template, pageWatermarks: { ...existing, [layer]: config } });
            }
        },
        [template, push],
    );

    // ── Section border ────────────────────────────────────────────────────────

    const updateSectionBorder = useCallback(
        (target: SectionTarget, border: SectionBorder | null) => {
            const s = resolveSection(template, target);
            if (!s) return;
            if (border === null) {
                const { border: _b, ...rest } = s;
                push(applyToSection(template, target, rest as SectionGridV2));
            } else {
                push(applyToSection(template, target, { ...s, border }));
            }
        },
        [template, push],
    );

    // ── Visibility ───────────────────────────────────────────────────────────

    const setSectionVisible = useCallback(
        (target: "header" | "footer", visible: boolean) => {
            const s = getFixedSection(template, target);
            push(setFixedSection(template, target, { ...s, visible }));
        },
        [template, push],
    );

    return {
        template,
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1,
        undo,
        redo,
        updateGridConfig,
        addBodyGrid,
        removeBodyGrid,
        moveBodyGrid,
        addWidget,
        moveNode,
        deleteNode,
        updateWidgetConfig,
        updateGridBackground,
        updateSectionBackground: updateGridBackground, // alias used by TemplateEditorPageV2
        updateSectionHeight,
        updateSectionDividerColor,
        updateTemplate,
        updateCellFlex,
        updateCellSpan,
        setSectionVisible,
        setSectionWatermark,
        setPageWatermark,
        updateSectionBorder,
    };
}
