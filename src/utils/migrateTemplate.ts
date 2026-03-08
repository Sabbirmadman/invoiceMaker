/**
 * migrateTemplate.ts
 *
 * Converts a V1 Template to a TemplateV2.
 * Run this when loading an existing template into the new editor.
 * No data is lost — all config/styles/bindings are preserved on TemplateWidget nodes.
 */

import type { Template, Section, BodySection, TemplateElement } from "@/types/template";
import type {
    TemplateV2,
    SectionGridV2,
    BodySectionV2,
    TemplateGridCell,
    TemplateWidget,
} from "@/types/templateV2";
import {
    makeSection,
    makeBodySection,
    makeWidget,
    makeCell,
} from "@/types/templateV2";

let _idCounter = 0;
function uid(prefix = "n"): string {
    return `${prefix}_${Date.now()}_${++_idCounter}`;
}

// ── Header / Footer migration ─────────────────────────────────────────────────

/**
 * Converts a V1 Section (header or footer) to SectionGridV2.
 * Each V1 element already has a gridArea {col, row, colSpan, rowSpan}.
 * We map col/row IDs → 1-based indices using the grid's column/row arrays.
 */
function migrateFixedSection(section: Section, sectionId: string): SectionGridV2 {
    const { columns, rows } = section.grid;

    // Build index maps: id → 1-based position
    const colIndex = new Map(columns.map((c, i) => [c.id, i + 1]));
    const rowIndex = new Map(rows.map((r, i) => [r.id, i + 1]));

    // Derive CSS column widths
    const colWidths = columns.map((c) => c.width || "1fr");
    const rowHeights = rows.map((r) => r.height || "auto");

    const cells: TemplateGridCell[] = [];

    for (const el of section.elements) {
        // Skip background/watermark — they become section-level background later
        if (el.type === "background" || el.type === "watermark") continue;
        if (!el.gridArea) continue;

        const colStart = colIndex.get(el.gridArea.col) ?? 1;
        const rowStart = rowIndex.get(el.gridArea.row) ?? 1;
        const colSpan = el.gridArea.colSpan ?? 1;
        const rowSpan = el.gridArea.rowSpan ?? 1;

        const widget = elementToWidget(el);
        const cellId = uid("cell");
        cells.push(makeCell(cellId, colStart, rowStart, colSpan, rowSpan, [widget]));
    }

    // Extract background from the background element if present
    const bgEl = section.elements.find((e) => e.type === "background");
    const background: SectionGridV2["background"] = bgEl?.styles
        ? {
              color: bgEl.styles.backgroundColor,
              imageUrl: bgEl.styles.backgroundImage
                  ? bgEl.styles.backgroundImage.replace(/^url\(['"]?/, "").replace(/['"]?\)$/, "")
                  : undefined,
              imageSize: bgEl.styles.backgroundSize as "cover" | "contain" | "repeat" | undefined,
          }
        : undefined;

    return {
        id: sectionId,
        visible: section.visible,
        height: section.height,
        grid: {
            columns: columns.length || 1,
            rows: rows.length || 1,
            colWidths,
            rowHeights,
            colGap: 0,
            rowGap: 0,
            padding: 16,
        },
        cells,
        background,
    };
}

// ── Body migration ────────────────────────────────────────────────────────────

/**
 * Converts a V1 BodySection to SectionGridV2.
 *
 * V1 body layout is flex-based with:
 *   - placement: "first-page" | "all-pages" | "last-page"
 *   - gridRowId: groups same-row elements side-by-side
 *
 * We map this to a grid as follows:
 *   - Each unique "row group" becomes one grid row.
 *   - Elements in the same gridRowId share that row, placed in consecutive columns.
 *   - Elements without gridRowId each get their own single-column row.
 *   - Ordering: first-page elements first, then all-pages (itemList), then last-page.
 */
/**
 * Converts a V1 BodySection to BodySectionV2 (multi-grid).
 *
 * Strategy: elements are grouped by placement (first-page / all-pages / last-page)
 * and by gridRowId. Each placement group with at least one element becomes a
 * separate SectionGridV2 grid so they're independently configurable.
 * Groups within the same placement are further split into per-row grids.
 */
function migrateBodySection(body: BodySection): BodySectionV2 {
    const elements = [...body.elements].filter(
        (e) => e.type !== "background" && e.type !== "watermark",
    );

    // Sort into placement groups preserving original order within each group
    const firstPageEls = elements.filter((e) => (e.placement ?? "last-page") === "first-page");
    const allPagesEls = elements.filter((e) => e.placement === "all-pages");
    const lastPageEls = elements.filter((e) => (e.placement ?? "last-page") === "last-page");

    const grids: SectionGridV2[] = [];

    function buildGridsFromGroup(els: TemplateElement[], placementLabel: string) {
        if (els.length === 0) return;

        // Group by gridRowId
        type RowGroup = { rowId: string | null; elements: TemplateElement[] };
        const groups: RowGroup[] = [];
        const seenRowIds = new Set<string>();

        for (const el of els) {
            if (el.gridRowId) {
                if (!seenRowIds.has(el.gridRowId)) {
                    seenRowIds.add(el.gridRowId);
                    groups.push({ rowId: el.gridRowId, elements: [] });
                }
                groups.find((g) => g.rowId === el.gridRowId)!.elements.push(el);
            } else {
                groups.push({ rowId: null, elements: [el] });
            }
        }

        // Each row group → its own SectionGridV2 with N columns
        for (let gi = 0; gi < groups.length; gi++) {
            const group = groups[gi];
            const numCols = group.elements.length;
            const colWidths = Array(numCols).fill(`${(100 / numCols).toFixed(1)}%`);
            const cells: TemplateGridCell[] = [];

            group.elements.forEach((el, colIdx) => {
                const widget = elementToWidget(el);
                const cellId = uid("cell");
                cells.push(makeCell(cellId, colIdx + 1, 1, 1, 1, [widget]));
            });

            const gridId = uid(`body_${placementLabel}_${gi}`);
            grids.push({
                id: gridId,
                visible: true,
                height: undefined,
                grid: {
                    columns: numCols,
                    rows: 1,
                    colWidths,
                    rowHeights: ["auto"],
                    colGap: 0,
                    rowGap: 0,
                    padding: 16,
                },
                cells,
            });
        }
    }

    buildGridsFromGroup(firstPageEls, "first");
    buildGridsFromGroup(allPagesEls, "all");
    buildGridsFromGroup(lastPageEls, "last");

    // If no elements at all, return a single blank grid
    if (grids.length === 0) {
        return makeBodySection();
    }

    return { grids };
}

// ── Element → Widget ──────────────────────────────────────────────────────────

function elementToWidget(el: TemplateElement): TemplateWidget {
    return makeWidget(el.id || uid("w"), el.type, el.placement, el.config) as TemplateWidget & {
        styles?: Record<string, string>;
        bindings?: Record<string, string>;
    };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Convert a V1 Template into TemplateV2.
 * Safe to call on templates that are already V2 (returns them unchanged).
 */
export function migrateToV2(template: Template): TemplateV2 {
    return {
        version: 2,
        id: template.id,
        name: template.name,
        documentType: template.documentType,
        pageSize: template.pageSize,
        orientation: template.orientation,
        theme: template.theme,
        header: migrateFixedSection(template.header, "header"),
        body: migrateBodySection(template.body),  // now returns BodySectionV2
        footer: migrateFixedSection(template.footer, "footer"),
    };
}

/**
 * Create a blank TemplateV2 with sensible defaults.
 * Header: 1 col × 1 row, body: 1 col × 1 row, footer: 1 col × 1 row.
 */
export function createBlankTemplateV2(
    id: string,
    name = "New Template",
    documentType: import("@/types/common").DocumentType = "invoice",
    pageSize: import("@/types/common").PageSize = "Letter",
): TemplateV2 {
    return {
        version: 2,
        id,
        name,
        documentType,
        pageSize,
        orientation: "portrait",
        theme: {
            fontFamily: "Inter, sans-serif",
            primaryColor: "#111827",
            accentColor: "#2563eb",
        },
        header: makeSection("header", { height: 140, columns: 2, rows: 1, padding: 16 }),
        body: makeBodySection("body_grid_0"),
        footer: makeSection("footer", { height: 60, columns: 3, rows: 1, padding: 12 }),
    };
}

/** Helper: given a TemplateV2 or V1 Template, always return TemplateV2 */
export function ensureV2(template: Template | TemplateV2): TemplateV2 {
    if ("version" in template && template.version === 2) return template as TemplateV2;
    return migrateToV2(template as Template);
}

