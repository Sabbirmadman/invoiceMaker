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

// ── Watermark config ─────────────────────────────────────────────────────────

export interface WatermarkConfig {
    text: string;
    opacity?: number; // default 0.08
    rotate?: number;  // default -30 (degrees)
    color?: string;   // default "currentColor"
}

// ── Page-level layout types ──────────────────────────────────────────────────

export interface PagePadding {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export interface AccentBorder {
    color: string;
    width: number; // px
    enabled: boolean;
}

export interface PageAccentBorders {
    top?: AccentBorder;
    right?: AccentBorder;
    bottom?: AccentBorder;
    left?: AccentBorder;
}

export interface CellFlex {
    direction?: "row" | "column";
    alignItems?: string;
    justifyContent?: string;
    gap?: number;
}

// ── Placement ───────────────────────────────────────────────────────────────

/**
 * Controls which page(s) a widget appears on.
 * - 'first-page' : rendered only on page 1
 * - 'all-pages'  : repeated on every page (used by itemList)
 * - 'last-page'  : rendered only on the final page (default)
 */
export type BodyPlacement = "first-page" | "all-pages" | "last-page";

// ── Node tree ────────────────────────────────────────────────────────────────

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

export type TemplateNode = TemplateWidget;

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
    /** Optional flex layout for positioning children inside the cell */
    flex?: CellFlex;
}

// ── Grid configuration ───────────────────────────────────────────────────────

export interface GridConfig {
    columns: number;
    rows: number;
    /** Column widths — length must equal `columns`. Defaults to "1fr" for each. */
    colWidths: string[];
    /** Row heights — length must equal `rows`. Defaults to "auto" for each. */
    rowHeights: string[];
    colGap: number; // px
    rowGap: number; // px
    /** Uniform padding (used as fallback when per-side values are absent) */
    padding: number; // px
    /** Per-side padding overrides — each defaults to `padding` if unset */
    paddingTop?: number;
    paddingRight?: number;
    paddingBottom?: number;
    paddingLeft?: number;
}

export interface SectionBorder {
    color: string;
    width: number;
    style: "solid" | "dashed" | "dotted";
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
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
    /** Color of the divider line at the bottom of header / top of footer */
    dividerColor?: string;
    /** Optional watermark overlaid on this section */
    watermark?: WatermarkConfig;
    /** Optional border around the section */
    border?: SectionBorder;
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
    /** Optional padding inside the page (around all content) */
    pagePadding?: PagePadding;
    /** Optional decorative accent borders on the page edges */
    accentBorders?: PageAccentBorders;
    /** Optional background color for the entire page */
    pageBackground?: string;
    /** Optional page-level watermarks rendered behind or in front of all content */
    pageWatermarks?: {
        background?: WatermarkConfig;
        foreground?: WatermarkConfig;
    };
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
    // Give textLabel a default text so it renders with visible content
    const defaultConfig: Record<string, unknown> =
        type === "textLabel" ? { text: "Text Label" } : {};
    return {
        id,
        kind: "widget",
        type,
        placement,
        config: config ?? defaultConfig,
    };
}

/** Create a blank SectionGridV2 */
export function makeSection(
    id: string,
    options: {
        height?: number;
        columns?: number;
        rows?: number;
        padding?: number;
        visible?: boolean;
    } = {},
): SectionGridV2 {
    const {
        height,
        columns = 1,
        rows = 1,
        padding = 16,
        visible = true,
    } = options;
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

/** Walk a TemplateNode list and call visitor for every node */
export function walkNodes(
    nodes: TemplateNode[],
    visitor: (node: TemplateNode) => void,
): void {
    for (const node of nodes) {
        visitor(node);
    }
}

/** Walk all nodes in a SectionGridV2 */
export function walkSectionNodes(
    section: SectionGridV2,
    visitor: (node: TemplateNode) => void,
): void {
    for (const cell of section.cells) {
        walkNodes(cell.children, visitor);
    }
}

/** Walk all nodes across all body grids */
export function walkBodyNodes(
    body: BodySectionV2,
    visitor: (node: TemplateNode) => void,
): void {
    for (const grid of body.grids) {
        walkSectionNodes(grid, visitor);
    }
}

/** Find a node by id anywhere in a SectionGridV2 */
export function findNodeInSection(
    section: SectionGridV2,
    nodeId: string,
): TemplateNode | null {
    let found: TemplateNode | null = null;
    walkSectionNodes(section, (node) => {
        if (node.id === nodeId) found = node;
    });
    return found;
}

/** Find a node by id in the body (searches all grids) */
export function findNodeInBody(
    body: BodySectionV2,
    nodeId: string,
): TemplateNode | null {
    for (const grid of body.grids) {
        const found = findNodeInSection(grid, nodeId);
        if (found) return found;
    }
    return null;
}

/** Find which cell (directly) contains a node id */
export function findCellContaining(
    section: SectionGridV2,
    nodeId: string,
): TemplateGridCell | null {
    for (const cell of section.cells) {
        if (cell.children.some((n) => n.id === nodeId)) return cell;
    }
    return null;
}

/** Remove a node by id from a TemplateNode list */
export function removeNodeById(
    nodes: TemplateNode[],
    nodeId: string,
): TemplateNode[] {
    return nodes.filter((n) => n.id !== nodeId);
}

/** Insert a node at a given index into a list */
export function insertNode(
    nodes: TemplateNode[],
    node: TemplateNode,
    index: number,
): TemplateNode[] {
    const result = [...nodes];
    result.splice(index, 0, node);
    return result;
}

/** Check if a TemplateV2 object (type guard) */
export function isTemplateV2(t: unknown): t is TemplateV2 {
    return (
        typeof t === "object" && t !== null && (t as TemplateV2).version === 2
    );
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
export function removeNodeFromSection(
    section: SectionGridV2,
    nodeId: string,
): SectionGridV2 {
    return {
        ...section,
        cells: section.cells.map((cell) => ({
            ...cell,
            children: removeNodeById(cell.children, nodeId),
        })),
    };
}

/** Remove a node from all body grids */
export function removeNodeFromBody(
    body: BodySectionV2,
    nodeId: string,
): BodySectionV2 {
    return {
        grids: body.grids.map((g) => removeNodeFromSection(g, nodeId)),
    };
}

/** Remove cells that have no children from a section (after a delete) */
export function pruneEmptyCells(section: SectionGridV2): SectionGridV2 {
    return { ...section, cells: section.cells.filter((c) => c.children.length > 0) };
}

/** Prune empty cells from every section in the template */
export function pruneEmptyCellsInTemplate(t: TemplateV2): TemplateV2 {
    return {
        ...t,
        header: pruneEmptyCells(t.header),
        footer: pruneEmptyCells(t.footer),
        body: { grids: t.body.grids.map((g) => pruneEmptyCells(g)) },
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
