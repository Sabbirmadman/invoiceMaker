import { createContext, useContext } from "react";

/**
 * PageSliceContext
 *
 * Passed down to each page's render in paged mode so widgets know
 * which data slice to display and what to show/hide per page.
 *
 * In continuous mode (default): all defaults are "show everything".
 */
export interface PageSliceValue {
    /** First item index to display on this page (inclusive) */
    itemStartIndex: number;
    /** Last item index (exclusive). -1 = show all remaining items. */
    itemEndIndex: number;
    /** Whether to render the totals block on this page */
    showTotals: boolean;
    /** Whether this is the last page that shows items (enables Add Row button) */
    isLastItemPage: boolean;
    /** Whether to render post-item content (notes, terms) on this page */
    showPostContent: boolean;
    /** Whether to render the item list widget on this page (false for post-content-only pages) */
    showItemList?: boolean;
    /** 1-based current page number */
    currentPage: number;
    /** Total number of pages */
    totalPages: number;
}

const defaultSlice: PageSliceValue = {
    itemStartIndex: 0,
    itemEndIndex: -1,
    showTotals: true,
    isLastItemPage: true,
    showPostContent: true,
    currentPage: 1,
    totalPages: 1,
};

const PageSliceContext = createContext<PageSliceValue>(defaultSlice);

export const PageSliceProvider = PageSliceContext.Provider;
export const usePageSlice = () => useContext(PageSliceContext);
