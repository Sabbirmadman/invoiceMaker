/**
 * TemplateV2 — Grid-based drag-and-drop template system.
 *
 * Header and Footer are a single SectionGridV2.
 * Body is a BodySectionV2 — an ordered list of independent SectionGridV2 grids
 * stacked vertically, each with its own column/row config, gap, padding, background.
 *
 * This system is additive — old Template (V1) types are kept in template.ts for backward compat.
 */

import type { DocumentType, PageSize, Orientation } from "./common";
import type { ElementType, Theme } from "./template";

// ── Re-export ElementType so consumers only need this file ──────────────────
export type { ElementType, Theme };

// ── Placement ───────────────────────────────────────────────────────────────

/**
 * Controls which page(s) a widget appears on.
 * - 'first-page' : rendered only on page 1
 * - 'all-pages'  : repeated on every page (used by itemList)
 * - 'last-page'  : rendered only on the final page (default)
 */
export type BodyPlacement = "first-page" | "all-pages" | "last-page";

// ── Container styles ─────────────────────────────────────────────────────────

export interface ContainerStyles {
    backgroundColor?: string;
    backgroundImage?: string;          // full CSS value e.g. "url('...')"
    backgroundSize?: "cover" | "contain" | "repeat";
    borderRadius?: string;             // e.g. "8px"
    border?: string;                   // e.g. "1px solid #ccc"
    padding?: string;                  // e.g. "16px" or "8px 16px"
    margin?: string;
    display?: "flex" | "block";
    flexDirection?: "row" | "column";
    gap?: string;                      // e.g. "8px"
    alignItems?: "flex-start" | "center" | "flex-end" | "stretch";
    justifyContent?: "flex-start" | "center" | "flex-end" | "space-between" | "space-around";
    minHeight?: string;
    width?: string;
}

// ── Node tree ────────────────────────────────────────────────────────────────

export interface TemplateContainer {
    id: string;
    kind: "container";
    styles: ContainerStyles;
    children: TemplateNode[];
}

export interface TemplateWidget {
    id: string;
    kind: "widget";
    type: ElementType;
    /** Only meaningful for widgets inside the body section */
    placement?: BodyPlacement;
    config?: Record<string, unknown>;
    styles?: Record<string, string>;
    bindings?: Record<string, string>;
}

export type TemplateNode = TemplateContainer | TemplateWidget;

// ── Grid cell ────────────────────────────────────────────────────────────────

export interface TemplateGridCell {
    id: string;
    /** 1-based column start */
    colStart: number;
    colSpan: number;
    /** 1-based row start */
    rowStart: number;
    rowSpan: number;
    children: TemplateNode[];
}

// ── Grid configuration ───────────────────────────────────────────────────────

export interface GridConfig {
    columns: number;
    rows: number;
    /** Column widths — length must equal `columns`. Defaults to "1fr" for each. */
    colWidths: string[];
    /** Row heights — length must equal `rows`. Defaults to "auto" for each. */
    rowHeights: string[];
    colGap: number;   // px
    rowGap: number;   // px
    padding: number;  // px, uniform for now
}

// ── Grid section ─────────────────────────────────────────────────────────────

export interface SectionGridV2 {
    id: string;
    visible: boolean;
    /**
     * Fixed height in px for header/footer grids.
     * Undefined for body grids (auto-height, drives pagination).
     */
    height?: number;
    grid: GridConfig;
    /** Sparse list — only cells that have content are stored. */
    cells: TemplateGridCell[];
    /** Background color/image for this grid block */
    background?: {
        color?: string;
        imageUrl?: string;
        imageSize?: "cover" | "contain" | "repeat";
    };
}

// ── Body section — multiple independent grids stacked vertically ──────────────

export interface BodySectionV2 {
    /** Ordered list of grid blocks, rendered top to bottom */
    grids: SectionGridV2[];
}

// ── Top-level template ───────────────────────────────────────────────────────

export interface TemplateV2 {
    /** Marks this as V2 so we can distinguish from old Template */
    version: 2;
    id: string;
    name: string;
    documentType: DocumentType;
    pageSize: PageSize;
    orientation: Orientation;
    theme: Theme;
    header: SectionGridV2;
    body: BodySectionV2;
    footer: SectionGridV2;
}

// ── Factory helpers ──────────────────────────────────────────────────────────

export function makeDefaultGridConfig(columns = 1, rows = 1): GridConfig {
    return {
        columns,
        rows,
        colWidths: Array(columns).fill("1fr"),
        rowHeights: Array(rows).fill("auto"),
        colGap: 0,
        rowGap: 0,
        padding: 16,
    };
}

export function makeCell(
    id: string,
    colStart: number,
    rowStart: number,
    colSpan = 1,
    rowSpan = 1,
    children: TemplateNode[] = [],
): TemplateGridCell {
    return { id, colStart, colSpan, rowStart, rowSpan, children };
}

export function makeWidget(
    id: string,
    type: ElementType,
    placement?: BodyPlacement,
    config?: Record<string, unknown>,
): TemplateWidget {
    return { id, kind: "widget", type, placement, config };
}

export function makeContainer(
    id: string,
    styles: ContainerStyles = {},
    children: TemplateNode[] = [],
): TemplateContainer {
    return { id, kind: "container", styles, children };
}

/** Create a blank SectionGridV2 */
export function makeSection(
    id: string,
    options: { height?: number; columns?: number; rows?: number; padding?: number; visible?: boolean } = {},
): SectionGridV2 {
    const { height, columns = 1, rows = 1, padding = 16, visible = true } = options;
    return {
        id,
        visible,
        height,
        grid: { ...makeDefaultGridConfig(columns, rows), padding },
        cells: [],
    };
}

/** Create a blank body grid block */
export function makeBodyGrid(id: string, columns = 1): SectionGridV2 {
    return makeSection(id, { columns, rows: 1, padding: 16 });
}

/** Create a blank BodySectionV2 with one default grid */
export function makeBodySection(firstGridId = "body_grid_0"): BodySectionV2 {
    return { grids: [makeBodyGrid(firstGridId)] };
}

// ── Walk helpers ─────────────────────────────────────────────────────────────

/** Walk a TemplateNode tree and call visitor for every node */
export function walkNodes(nodes: TemplateNode[], visitor: (node: TemplateNode) => void): void {
    for (const node of nodes) {
        visitor(node);
        if (node.kind === "container") {
            walkNodes(node.children, visitor);
        }
    }
}

/** Walk all nodes in a SectionGridV2 */
export function walkSectionNodes(section: SectionGridV2, visitor: (node: TemplateNode) => void): void {
    for (const cell of section.cells) {
        walkNodes(cell.children, visitor);
    }
}

/** Walk all nodes across all body grids */
export function walkBodyNodes(body: BodySectionV2, visitor: (node: TemplateNode) => void): void {
    for (const grid of body.grids) {
        walkSectionNodes(grid, visitor);
    }
}

/** Find a node by id anywhere in a SectionGridV2 */
export function findNodeInSection(section: SectionGridV2, nodeId: string): TemplateNode | null {
    let found: TemplateNode | null = null;
    walkSectionNodes(section, (node) => {
        if (node.id === nodeId) found = node;
    });
    return found;
}

/** Find a node by id in the body (searches all grids) */
export function findNodeInBody(body: BodySectionV2, nodeId: string): TemplateNode | null {
    for (const grid of body.grids) {
        const found = findNodeInSection(grid, nodeId);
        if (found) return found;
    }
    return null;
}

/** Find which cell (directly) contains a node id */
export function findCellContaining(section: SectionGridV2, nodeId: string): TemplateGridCell | null {
    for (const cell of section.cells) {
        if (cell.children.some((n) => n.id === nodeId)) return cell;
    }
    return null;
}

/** Remove a node by id from a TemplateNode list (recursive) */
export function removeNodeById(nodes: TemplateNode[], nodeId: string): TemplateNode[] {
    return nodes
        .filter((n) => n.id !== nodeId)
        .map((n) => {
            if (n.kind === "container") {
                return { ...n, children: removeNodeById(n.children, nodeId) };
            }
            return n;
        });
}

/** Insert a node at a given index into a list */
export function insertNode(nodes: TemplateNode[], node: TemplateNode, index: number): TemplateNode[] {
    const result = [...nodes];
    result.splice(index, 0, node);
    return result;
}

/** Check if a TemplateV2 object (type guard) */
export function isTemplateV2(t: unknown): t is TemplateV2 {
    return typeof t === "object" && t !== null && (t as TemplateV2).version === 2;
}

/** Collect all widgets from a SectionGridV2 (flattened) */
export function collectWidgets(section: SectionGridV2): TemplateWidget[] {
    const widgets: TemplateWidget[] = [];
    walkSectionNodes(section, (node) => {
        if (node.kind === "widget") widgets.push(node);
    });
    return widgets;
}

/** Collect all widgets from all body grids */
export function collectBodyWidgets(body: BodySectionV2): TemplateWidget[] {
    const widgets: TemplateWidget[] = [];
    walkBodyNodes(body, (node) => {
        if (node.kind === "widget") widgets.push(node);
    });
    return widgets;
}

/** Remove a node from all cells across a section */
export function removeNodeFromSection(section: SectionGridV2, nodeId: string): SectionGridV2 {
    return {
        ...section,
        cells: section.cells.map((cell) => ({
            ...cell,
            children: removeNodeById(cell.children, nodeId),
        })),
    };
}

/** Remove a node from all body grids */
export function removeNodeFromBody(body: BodySectionV2, nodeId: string): BodySectionV2 {
    return {
        grids: body.grids.map((g) => removeNodeFromSection(g, nodeId)),
    };
}

/** Get all body placement info: widgets grouped by their placement */
export function getBodyWidgetsByPlacement(body: BodySectionV2): {
    firstPage: TemplateWidget[];
    allPages: TemplateWidget[];
    lastPage: TemplateWidget[];
} {
    const firstPage: TemplateWidget[] = [];
    const allPages: TemplateWidget[] = [];
    const lastPage: TemplateWidget[] = [];
    walkBodyNodes(body, (node) => {
        if (node.kind !== "widget") return;
        const p = node.placement ?? "last-page";
        if (p === "first-page") firstPage.push(node);
        else if (p === "all-pages") allPages.push(node);
        else lastPage.push(node);
    });
    return { firstPage, allPages, lastPage };
}
