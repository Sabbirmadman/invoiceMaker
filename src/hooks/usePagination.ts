import { useState, useEffect, useRef, useCallback } from 'react'
import type { StoredDocument } from '@/types/document'
import { PAGE_DIMENSIONS } from '@/types/common'

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * Identifies one body element to render on a page.
 * Reserved for future paragraph-level splitting (splitStart / splitEnd).
 */
export interface PageBodyElement {
  elementId: string
}

/**
 * Describes the content of one rendered page.
 * The legacy itemStartIndex/itemEndIndex/postTable* fields continue to drive
 * BodySectionRenderer. The new bodyElements field is populated for future use.
 */
export interface PageSlice {
  pageIndex: number          // 0-based
  itemStartIndex: number     // first item row index on this page
  itemEndIndex: number       // exclusive end
  showTotals: boolean        // true on pages that carry post-table elements
  showColumnHeader: boolean  // always true
  postTableStartIndex: number  // index into postTableElements for this page
  postTableEndIndex: number    // exclusive end; equal to start means none on this page
  bodyElements?: PageBodyElement[]  // ordered list of element IDs to render on this page
}

interface PaginationResult {
  pages: PageSlice[]
  totalPages: number
  measureRef: React.RefObject<HTMLDivElement | null>
  ready: boolean
}

// ── Constants ─────────────────────────────────────────────────────────────────

const COLUMN_HEADER_HEIGHT = 36   // px — fallback if col-header element not found
const POST_TABLE_EL_HEIGHT = 60   // px — fallback per post-table element
const BODY_PADDING_TOP = 16       // p-4 top padding from BodySectionRenderer
const BODY_PADDING_BOTTOM = 16    // p-4 bottom padding from BodySectionRenderer
const BODY_PADDING = BODY_PADDING_TOP + BODY_PADDING_BOTTOM  // total = 32
const POST_TABLE_MARGIN = 16      // mt-4 on BodySectionRenderer post-table wrapper
const POST_TABLE_GAP = 16         // gap-4 between post-table elements

// ── Hook ──────────────────────────────────────────────────────────────────────

export function usePagination(doc: StoredDocument): PaginationResult {
  const { templateSnapshot, data } = doc
  const { pageSize, header, footer } = templateSnapshot
  const dims = PAGE_DIMENSIONS[pageSize]

  const headerH = header.visible ? header.height : 0
  const footerH = footer.visible ? footer.height : 0
  const availableH = dims.height - headerH - footerH - BODY_PADDING

  const itemListEl = templateSnapshot.body.elements.find((el) => el.type === 'itemList')
  const maxRowsPerPage = (itemListEl?.config?.maxRowsPerPage as number) ?? 0

  // Collect element IDs by placement for bodyElements population
  const sortedBody = [...templateSnapshot.body.elements].sort((a, b) => a.zIndex - b.zIndex)
  const firstPageElIds = sortedBody
    .filter((el) => el.type !== 'watermark' && (el.placement ?? 'last-page') === 'first-page')
    .map((el) => el.id)
  const postTableElIds = sortedBody
    .filter((el) => el.type !== 'watermark' && (el.placement ?? 'last-page') === 'last-page')
    .map((el) => el.id)
  const itemListId = itemListEl?.id ?? 'itemList'

  const measureRef = useRef<HTMLDivElement | null>(null)
  const [pages, setPages] = useState<PageSlice[]>([])
  const [ready, setReady] = useState(false)

  const compute = useCallback(() => {
    const container = measureRef.current
    if (!container) return

    // ── 1. Measure first-page block height via DOM coordinates ──────────────
    // MeasureContainer mirrors BodySectionRenderer exactly (padding:16, pre-table
    // flex-col gap-16, post-table marginTop:16 flex-col gap-16).
    // The offsetTop of the itemList wrapper is the exact Y at which the item table
    // starts on page 1 — includes root padding (16) + first-page element heights +
    // gaps between them. No fallback constant needed.
    const itemListWrapper = container.querySelector<HTMLElement>(
      '[data-measure-placement="all-pages"]',
    )
    const firstPageH = itemListWrapper?.offsetTop ?? 0

    // ── 2. Measure column header ─────────────────────────────────────────────
    const colHeaderEl = container.querySelector<HTMLElement>('[data-col-header]')
    const colHeaderH = colHeaderEl?.offsetHeight ?? COLUMN_HEADER_HEIGHT

    // ── 3. Measure each item row individually ────────────────────────────────
    const rowEls = Array.from(container.querySelectorAll<HTMLElement>('[data-row-index]'))
    const rowHeights: number[] = data.items.map((_, i) => {
      const el = rowEls.find((e) => e.dataset.rowIndex === String(i))
      return el?.offsetHeight ?? 40
    })

    // ── 4. Measure each post-table element individually ──────────────────────
    const postEls = Array.from(container.querySelectorAll<HTMLElement>('[data-post-el-index]'))
    const postElCount = postEls.length
    const postElHeights: number[] = Array.from({ length: postElCount }, (_, i) => {
      const el = postEls.find((e) => e.dataset.postElIndex === String(i))
      return el?.offsetHeight ?? POST_TABLE_EL_HEIGHT
    })

    // ── 5. Greedy item packing ────────────────────────────────────────────────
    // Page 0 starts with measured first-page block + column header.
    // Subsequent pages start with just the column header.
    const result: PageSlice[] = []
    let currentPage = 0
    let used = firstPageH + colHeaderH
    let pageItemStart = 0
    let i = 0

    while (i <= data.items.length) {
      if (i === data.items.length) {
        // ── 6. Greedy post-table element packing ─────────────────────────────
        let postIdx = 0
        let pagePostStart = 0

        while (postIdx <= postElCount) {
          if (postIdx === postElCount) {
            const showAny = postIdx > pagePostStart
            result.push({
              pageIndex: currentPage,
              itemStartIndex: pageItemStart,
              itemEndIndex: i,
              showTotals: showAny || postElCount === 0,
              showColumnHeader: true,
              postTableStartIndex: pagePostStart,
              postTableEndIndex: postIdx,
              bodyElements: buildBodyElements(
                firstPageElIds, itemListId, postTableElIds,
                pagePostStart, postIdx, currentPage === 0 && pageItemStart === 0,
              ),
            })
            break
          }

          const isFirstOnPage = postIdx === pagePostStart
          const addCost = isFirstOnPage ? POST_TABLE_MARGIN : POST_TABLE_GAP
          const elH = postElHeights[postIdx] ?? POST_TABLE_EL_HEIGHT

          if (used + addCost + elH <= availableH) {
            used += addCost + elH
            postIdx++
          } else {
            result.push({
              pageIndex: currentPage,
              itemStartIndex: pageItemStart,
              itemEndIndex: i,
              showTotals: postIdx > pagePostStart,
              showColumnHeader: true,
              postTableStartIndex: pagePostStart,
              postTableEndIndex: postIdx,
              bodyElements: buildBodyElements(
                firstPageElIds, itemListId, postTableElIds,
                pagePostStart, postIdx, currentPage === 0 && pageItemStart === 0,
              ),
            })
            currentPage++
            used = BODY_PADDING_TOP  // top padding is always consumed on every page
            pageItemStart = i
            pagePostStart = postIdx
          }
        }
        break
      }

      const rowH = rowHeights[i] ?? 40
      const rowsOnPage = i - pageItemStart
      const forceBreak = maxRowsPerPage > 0 && rowsOnPage >= maxRowsPerPage

      if (!forceBreak && used + rowH <= availableH) {
        used += rowH
        i++
      } else {
        result.push({
          pageIndex: currentPage,
          itemStartIndex: pageItemStart,
          itemEndIndex: i,
          showTotals: false,
          showColumnHeader: true,
          postTableStartIndex: 0,
          postTableEndIndex: 0,
          bodyElements: buildBodyElements(
            firstPageElIds, itemListId, postTableElIds,
            0, 0, currentPage === 0,
          ),
        })
        currentPage++
        used = BODY_PADDING_TOP + colHeaderH  // top padding + column header on every new page
        pageItemStart = i
        // Edge case: single row taller than page — force it through
        if (!forceBreak && rowH > availableH) {
          used += rowH
          i++
        }
      }
    }

    // Guard: ensure at least one page
    if (result.length === 0) {
      result.push({
        pageIndex: 0,
        itemStartIndex: 0,
        itemEndIndex: 0,
        showTotals: true,
        showColumnHeader: true,
        postTableStartIndex: 0,
        postTableEndIndex: postElCount,
        bodyElements: buildBodyElements(
          firstPageElIds, itemListId, postTableElIds, 0, postElCount, true,
        ),
      })
    }

    setPages(result)
    setReady(true)
  }, [data.items, availableH, maxRowsPerPage, firstPageElIds, postTableElIds, itemListId])

  useEffect(() => {
    // Double-rAF: first frame flushes MeasureContainer re-render,
    // second frame ensures browser has recalculated layout before we measure.
    let innerFrame: number
    const outerFrame = requestAnimationFrame(() => {
      innerFrame = requestAnimationFrame(() => {
        compute()
      })
    })

    const container = measureRef.current
    let observer: ResizeObserver | null = null
    let debounceTimer: ReturnType<typeof setTimeout> | null = null

    if (container && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        // Debounce to avoid running compute() on every keystroke during text editing
        if (debounceTimer) clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => {
          compute()
        }, 50)
      })

      // Watch ALL measured element wrappers (first-page, itemList, post-table)
      container.querySelectorAll<HTMLElement>('[data-measure-id]').forEach((el) => {
        observer!.observe(el)
      })

      // Watch ALL individual item rows — this is the critical fix.
      // Previously only aboveTable and post-table elements were observed,
      // so editing a row's description (making it taller) never triggered recompute.
      container.querySelectorAll<HTMLElement>('[data-row-index]').forEach((el) => {
        observer!.observe(el)
      })
    }

    return () => {
      cancelAnimationFrame(outerFrame)
      cancelAnimationFrame(innerFrame)
      if (debounceTimer) clearTimeout(debounceTimer)
      observer?.disconnect()
    }
  }, [compute])
  // compute depends on [data.items, ...], so when items are added/removed,
  // compute gets a new reference → useEffect re-runs → observer re-registers
  // on the new row elements.

  const totalPages = Math.max(pages.length, 1)

  return { pages, totalPages, measureRef, ready }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Builds the bodyElements list for a PageSlice.
 * On the first page: first-page elements + itemList + assigned post-table elements.
 * On subsequent pages: itemList + assigned post-table elements.
 */
function buildBodyElements(
  firstPageElIds: string[],
  itemListId: string,
  postTableElIds: string[],
  postStart: number,
  postEnd: number,
  isFirstPage: boolean,
): PageBodyElement[] {
  const elements: PageBodyElement[] = []
  if (isFirstPage) {
    firstPageElIds.forEach((id) => elements.push({ elementId: id }))
  }
  elements.push({ elementId: itemListId })
  postTableElIds.slice(postStart, postEnd).forEach((id) => elements.push({ elementId: id }))
  return elements
}
