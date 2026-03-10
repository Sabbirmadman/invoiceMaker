/**
 * useDocumentPagination
 *
 * Greedy DOM-measurement algorithm that determines how to split document content
 * across fixed-height pages.
 *
 * Returns an array of PageSliceValue descriptors — one per rendered page —
 * plus a `measureRef` to attach to the hidden measurement container.
 *
 * Algorithm:
 *  1. Reads header/footer heights + page padding from template config.
 *  2. Measures each item row in the hidden container via [data-row-index].
 *  3. Greedy packs rows into pages respecting available body height.
 *  4. Reserves space for post-content (totals, notes, terms) on the last page.
 *  5. If post-content doesn't fit, spills it onto a dedicated extra page.
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
        const pageH = dims.height;

        const headerH = template.header.visible
            ? (template.header.height ?? HEADER_FALLBACK)
            : 0;
        const footerH = template.footer.visible
            ? (template.footer.height ?? FOOTER_FALLBACK)
            : 0;

        // Page padding — use template values, with a minimum bottom padding so
        // content never touches the footer guide line.
        const padTop    = template.pagePadding?.top    ?? 0;
        const padBottom = template.pagePadding?.bottom ?? 0;
        const padLeft   = template.pagePadding?.left   ?? 0;
        const padRight  = template.pagePadding?.right  ?? 0;

        const availableH = pageH - headerH - footerH - padTop - padBottom;

        if (availableH <= 0) {
            setPages([continuousDefault()]);
            return;
        }

        // Measure individual item row heights from the hidden container
        const rowEls = measureRef.current.querySelectorAll<HTMLElement>(
            "[data-row-index]",
        );
        const rowHeights: number[] = [];
        rowEls.forEach((el) => {
            const idx = parseInt(el.getAttribute("data-row-index") ?? "0", 10);
            rowHeights[idx] = el.offsetHeight || FALLBACK_ROW_HEIGHT;
        });

        // Fill missing indices with fallback
        const totalItems = doc.data.items.length;
        for (let i = 0; i < totalItems; i++) {
            if (!rowHeights[i]) rowHeights[i] = FALLBACK_ROW_HEIGHT;
        }

        if (totalItems === 0) {
            setPages([continuousDefault()]);
            return;
        }

        // Measure post-content height (totals + notes + terms) from hidden container.
        // The body el's natural height = col-header + all rows + post-content.
        const bodyEl = measureRef.current.querySelector<HTMLElement>("[data-measure-body]");
        const itemListH =
            COL_HEADER_HEIGHT +
            rowHeights.reduce((sum, h) => sum + (h || FALLBACK_ROW_HEIGHT), 0);
        const postContentH = bodyEl
            ? Math.max(0, bodyEl.offsetHeight - itemListH)
            : 0;

        // ── Greedy packing ─────────────────────────────────────────────────
        const result: PageSliceValue[] = [];
        let itemStart = 0;
        let pageIndex = 0;

        while (itemStart < totalItems) {
            let budget = availableH - COL_HEADER_HEIGHT;

            let itemEnd = itemStart;
            while (itemEnd < totalItems) {
                const rowH = rowHeights[itemEnd] ?? FALLBACK_ROW_HEIGHT;
                if (budget - rowH < 0 && itemEnd > itemStart) break; // doesn't fit
                budget -= rowH;
                itemEnd++;
            }

            // Guard: always advance at least one row to prevent infinite loop
            if (itemEnd === itemStart) itemEnd = itemStart + 1;

            const isLastItemPage = itemEnd >= totalItems;
            // Does post-content fit on this page alongside the items?
            const postContentFits = isLastItemPage && budget >= postContentH;

            result.push({
                itemStartIndex: itemStart,
                itemEndIndex: itemEnd,
                showTotals: postContentFits,
                isLastItemPage,
                showPostContent: postContentFits,
                currentPage: pageIndex + 1,
                totalPages: 0, // filled in below
            });

            itemStart = itemEnd;
            pageIndex++;
        }

        // If the last items page doesn't have room for post-content, add a spill page
        const lastItemsPage = result[result.length - 1];
        if (!lastItemsPage.showPostContent && postContentH > 0) {
            result.push({
                itemStartIndex: totalItems,
                itemEndIndex: totalItems,
                showItemList: false,
                showTotals: true,
                isLastItemPage: false,
                showPostContent: true,
                currentPage: pageIndex + 1,
                totalPages: 0,
            });
        }

        const total = result.length;
        setPages(result.map((p) => ({ ...p, totalPages: total })));

        // Expose effective padding values so PagedCanvas can apply them
        // (stored on the measureRef element as data attributes)
        measureRef.current.dataset.padTop    = String(padTop);
        measureRef.current.dataset.padBottom = String(padBottom);
        measureRef.current.dataset.padLeft   = String(padLeft);
        measureRef.current.dataset.padRight  = String(padRight);
    }, [enabled, doc]);

    // Recompute after layout using double rAF to allow DOM measurement
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
    }, [enabled, doc.data.items, doc.templateSnapshot.pageSize, scheduleCompute]);

    // Watch measure container for size changes
    useEffect(() => {
        if (!enabled || !measureRef.current) return;
        const obs = new ResizeObserver(() => scheduleCompute());
        obs.observe(measureRef.current);
        return () => obs.disconnect();
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
    };
}
