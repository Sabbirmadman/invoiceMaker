/**
 * useDocumentPagination
 *
 * Two-level greedy DOM-measurement algorithm that splits document content
 * across fixed-height pages.
 *
 * Level 1 — Grid packing:
 *   Each body SectionGridV2 is treated as an atomic block and greedily packed
 *   into pages by measured height. Non-fitting grids start a new page.
 *
 * Level 2 — Row packing (item-list grid only):
 *   The grid that contains the `itemList` widget is split at the row level so
 *   individual item rows flow across pages. The column header is re-charged on
 *   every continuation page, mirroring the old system's behaviour.
 *
 * Strategy:
 *   - Grids before the item-list grid accumulate on page 1.
 *   - The item-list grid's rows are packed into as many pages as needed.
 *     The first item page shares the accumulated budget with the pre-item grids.
 *     Non-last item pages are flushed immediately.
 *     The last item page is kept open so post-item grids can be appended.
 *   - Grids after the item-list grid (totals, notes, terms …) are packed
 *     atomically onto the last item page; if one doesn't fit it starts a new page.
 *   - At the end the remaining accumulator is flushed as the final page.
 *
 * Returns `pages` — one PageSliceValue per rendered page — and `measureRef`
 * to attach to the hidden off-screen measurement container.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import type { StoredDocument } from "@/types/document";
import type { PageSliceValue } from "@/context/PageSliceContext";
import { PAGE_DIMENSIONS } from "@/types/common";

const FALLBACK_ROW_HEIGHT = 40;
const HEADER_FALLBACK = 120;
const FOOTER_FALLBACK = 60;
const COL_HEADER_HEIGHT = 36;

export function useDocumentPagination(
    doc: StoredDocument,
    enabled: boolean,
): {
    pages: PageSliceValue[];
    measureRef: React.RefObject<HTMLDivElement | null>;
} {
    const measureRef = useRef<HTMLDivElement | null>(null);
    const [pages, setPages] = useState<PageSliceValue[]>([continuousDefault()]);

    const compute = useCallback(() => {
        if (!enabled || !measureRef.current) return;

        const template = doc.templateSnapshot;
        const dims = PAGE_DIMENSIONS[template.pageSize ?? "A4"];

        const headerH = template.header.visible
            ? (template.header.height ?? HEADER_FALLBACK)
            : 0;
        const footerH = template.footer.visible
            ? (template.footer.height ?? FOOTER_FALLBACK)
            : 0;

        const padTop    = template.pagePadding?.top    ?? 0;
        const padBottom = template.pagePadding?.bottom ?? 0;
        const padLeft   = template.pagePadding?.left   ?? 0;
        const padRight  = template.pagePadding?.right  ?? 0;

        const availableH = dims.height - headerH - footerH - padTop - padBottom;

        if (availableH <= 0) {
            setPages([continuousDefault()]);
            return;
        }

        // ── Identify the item-list grid ───────────────────────────────────────
        let itemListGridId: string | null = null;
        outer: for (const grid of template.body.grids) {
            for (const cell of grid.cells) {
                for (const node of cell.children) {
                    if (node.kind === "widget" && node.type === "itemList") {
                        itemListGridId = grid.id;
                        break outer;
                    }
                }
            }
        }

        // ── Measure each body grid's height via data-grid-id ─────────────────
        const gridHeightMap: Record<string, number> = {};
        measureRef.current
            .querySelectorAll<HTMLElement>("[data-grid-id]")
            .forEach((el) => {
                const id = el.getAttribute("data-grid-id");
                if (id) gridHeightMap[id] = el.offsetHeight || 0;
            });

        // ── Measure individual item row heights ───────────────────────────────
        const totalItems = doc.data.items.length;
        const rowHeights: number[] = [];
        measureRef.current
            .querySelectorAll<HTMLElement>("[data-row-index]")
            .forEach((el) => {
                const idx = parseInt(el.getAttribute("data-row-index") ?? "0", 10);
                rowHeights[idx] = el.offsetHeight || FALLBACK_ROW_HEIGHT;
            });
        for (let i = 0; i < totalItems; i++) {
            if (!rowHeights[i]) rowHeights[i] = FALLBACK_ROW_HEIGHT;
        }

        // ── Expose padding so PagedCanvas can read it ─────────────────────────
        measureRef.current.dataset.padTop    = String(padTop);
        measureRef.current.dataset.padBottom = String(padBottom);
        measureRef.current.dataset.padLeft   = String(padLeft);
        measureRef.current.dataset.padRight  = String(padRight);

        // ── Two-level greedy packing ──────────────────────────────────────────
        const result: PageSliceValue[] = [];
        let pageIndex = 0;

        function pushPage(
            gridIds: string[],
            itemStart: number,
            itemEnd: number,
            showTotals: boolean,
            showPostContent: boolean,
            isLastItemPage: boolean,
        ): void {
            result.push({
                visibleGridIds: [...gridIds],
                itemStartIndex: itemStart,
                itemEndIndex: itemEnd,
                showTotals,
                showPostContent,
                isLastItemPage,
                showItemList: gridIds.includes(itemListGridId ?? ""),
                currentPage: pageIndex + 1,
                totalPages: 0, // filled in below
            });
            pageIndex++;
        }

        // Accumulator — grids packed so far on the current (not-yet-flushed) page
        let pendingGridIds: string[] = [];
        let pendingBudget = availableH;
        // Item range for the pending page (only meaningful once item-list grid is packed)
        let pendingItemStart = 0;
        let pendingItemEnd = 0;

        let itemStart = 0;
        let itemListFound = false;

        for (const grid of template.body.grids) {
            if (grid.id !== itemListGridId) {
                // ── Atomic grid ───────────────────────────────────────────────
                const gridH = gridHeightMap[grid.id] ?? 0;

                if (!itemListFound) {
                    // Before item list: always accumulate (allow overflow rather
                    // than creating an empty page before items).
                    pendingGridIds.push(grid.id);
                    pendingBudget = Math.max(0, pendingBudget - gridH);
                } else {
                    // After item list: flush if it doesn't fit on current page.
                    if (pendingBudget >= gridH) {
                        pendingGridIds.push(grid.id);
                        pendingBudget -= gridH;
                    } else {
                        // Flush the last-item page (or previous post-item page).
                        if (pendingGridIds.length > 0) {
                            pushPage(
                                pendingGridIds,
                                pendingItemStart,
                                pendingItemEnd,
                                true,
                                true,
                                true,
                            );
                        }
                        pendingGridIds = [grid.id];
                        pendingBudget = Math.max(0, availableH - gridH);
                        pendingItemStart = totalItems;
                        pendingItemEnd = totalItems;
                    }
                }
            } else {
                // ── Item-list grid — row-level packing ────────────────────────
                itemListFound = true;

                if (totalItems === 0) {
                    // Empty item list — just add the grid to the current page.
                    pendingGridIds.push(grid.id);
                    continue;
                }

                let isFirstItemPage = true;

                while (itemStart < totalItems) {
                    const pageBudget = isFirstItemPage ? pendingBudget : availableH;
                    let rowBudget = pageBudget - COL_HEADER_HEIGHT;

                    // Pack as many rows as fit.
                    let itemEnd = itemStart;
                    while (itemEnd < totalItems) {
                        const rowH = rowHeights[itemEnd] ?? FALLBACK_ROW_HEIGHT;
                        // Stop if row doesn't fit — but always advance at least one row.
                        if (rowBudget - rowH < 0 && itemEnd > itemStart) break;
                        rowBudget -= rowH;
                        itemEnd++;
                    }
                    // Guard: never produce an infinite loop on an oversized row.
                    if (itemEnd === itemStart) itemEnd++;

                    const hasMore = itemEnd < totalItems;

                    if (!hasMore) {
                        // ── Last item page — keep accumulator open ────────────
                        // Post-item grids will be appended in subsequent iterations.
                        if (isFirstItemPage) {
                            pendingGridIds.push(grid.id);
                        } else {
                            pendingGridIds = [grid.id];
                            pendingBudget = availableH;
                        }
                        pendingBudget = rowBudget; // remaining after rows
                        pendingItemStart = itemStart;
                        pendingItemEnd = itemEnd;
                        itemStart = itemEnd;
                        break;
                    } else {
                        // ── Non-last item page — flush immediately ────────────
                        const pageGridIds = isFirstItemPage
                            ? [...pendingGridIds, grid.id]
                            : [grid.id];

                        pushPage(pageGridIds, itemStart, itemEnd, false, false, false);

                        itemStart = itemEnd;
                        isFirstItemPage = false;
                        // Reset accumulator for the next item page.
                        pendingGridIds = [];
                        pendingBudget = availableH;
                        pendingItemStart = itemEnd;
                        pendingItemEnd = itemEnd;
                    }
                }
            }
        }

        // ── Final flush ───────────────────────────────────────────────────────
        if (pendingGridIds.length > 0 || result.length === 0) {
            pushPage(
                pendingGridIds,
                pendingItemStart,
                pendingItemEnd,
                true,
                true,
                true,
            );
        }

        // Guard: ensure at least one page
        if (result.length === 0) {
            setPages([continuousDefault()]);
            return;
        }

        // Backfill totalPages
        const total = result.length;
        setPages(result.map((p) => ({ ...p, totalPages: total })));
    }, [enabled, doc]);

    // Recompute after layout using double rAF to allow DOM measurement.
    const scheduleCompute = useCallback(() => {
        requestAnimationFrame(() => {
            requestAnimationFrame(compute);
        });
    }, [compute]);

    useEffect(() => {
        if (!enabled) {
            setPages([continuousDefault()]);
            return;
        }
        scheduleCompute();
    }, [enabled, doc.data.items, doc.templateSnapshot, scheduleCompute]);

    // Watch measure container for size changes (e.g. row text edits).
    useEffect(() => {
        if (!enabled || !measureRef.current) return;
        const container = measureRef.current;
        let debounce: ReturnType<typeof setTimeout> | null = null;
        const obs = new ResizeObserver(() => {
            if (debounce) clearTimeout(debounce);
            debounce = setTimeout(scheduleCompute, 50);
        });
        // Observe every measured element so row-height changes trigger recompute.
        container.querySelectorAll<HTMLElement>("[data-grid-id], [data-row-index]").forEach((el) => {
            obs.observe(el);
        });
        return () => {
            if (debounce) clearTimeout(debounce);
            obs.disconnect();
        };
    }, [enabled, scheduleCompute]);

    return { pages, measureRef };
}

function continuousDefault(): PageSliceValue {
    return {
        itemStartIndex: 0,
        itemEndIndex: -1,
        showTotals: true,
        isLastItemPage: true,
        showPostContent: true,
        currentPage: 1,
        totalPages: 1,
        visibleGridIds: null,
    };
}
