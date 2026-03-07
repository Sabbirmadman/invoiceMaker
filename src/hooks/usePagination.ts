import { useState, useEffect, useRef, useCallback } from 'react'
import type { StoredDocument } from '@/types/document'
import { PAGE_DIMENSIONS } from '@/types/common'

export interface PageSlice {
  pageIndex: number          // 0-based
  itemStartIndex: number     // first item row index on this page
  itemEndIndex: number       // exclusive end
  showTotals: boolean        // true on pages that carry post-table elements
  showColumnHeader: boolean  // always true
  postTableStartIndex: number  // index into postTableElements for this page (0 = first)
  postTableEndIndex: number    // exclusive end; equal to start means none on this page
}

interface PaginationResult {
  pages: PageSlice[]
  totalPages: number
  measureRef: React.RefObject<HTMLDivElement | null>
  ready: boolean
}

const COLUMN_HEADER_HEIGHT = 36   // px — fallback estimate
const POST_TABLE_EL_HEIGHT = 60   // px — fallback per post-table element
const ABOVE_TABLE_HEIGHT = 140    // px — fallback: all first-page elements + gap below
const BODY_PADDING = 32           // 16px top + 16px bottom from BodySectionRenderer p-4
const POST_TABLE_MARGIN = 16      // mt-4 on BodySectionRenderer's post-table wrapper (margin not in offsetHeight)
const POST_TABLE_GAP = 16         // gap-4 between post-table elements

export function usePagination(doc: StoredDocument): PaginationResult {
  const { templateSnapshot, data } = doc
  const { pageSize, header, footer } = templateSnapshot
  const dims = PAGE_DIMENSIONS[pageSize]

  const headerH = header.visible ? header.height : 0
  const footerH = footer.visible ? footer.height : 0
  const availableH = dims.height - headerH - footerH - BODY_PADDING

  const itemListEl = templateSnapshot.body.elements.find((el) => el.type === 'itemList')
  const maxRowsPerPage = (itemListEl?.config?.maxRowsPerPage as number) ?? 0

  const measureRef = useRef<HTMLDivElement | null>(null)
  const [pages, setPages] = useState<PageSlice[]>([])
  const [ready, setReady] = useState(false)

  const compute = useCallback(() => {
    const container = measureRef.current
    if (!container) return

    const rowEls = Array.from(container.querySelectorAll<HTMLElement>('[data-row-index]'))
    const colHeaderEl = container.querySelector<HTMLElement>('[data-col-header]')
    const aboveTableEl = container.querySelector<HTMLElement>('[data-above-table]')

    const colHeaderH = colHeaderEl?.offsetHeight ?? COLUMN_HEADER_HEIGHT
    // aboveTableH includes the 16px gap-4 after bill-to (measured via paddingBottom on data-above-table)
    const aboveTableH = aboveTableEl?.offsetHeight ?? ABOVE_TABLE_HEIGHT

    // Measure each post-table element individually
    const postEls = Array.from(container.querySelectorAll<HTMLElement>('[data-post-el-index]'))
    const postElCount = postEls.length
    const postElHeights: number[] = Array.from({ length: postElCount }, (_, i) => {
      const el = postEls.find((e) => e.dataset.postElIndex === String(i))
      return el?.offsetHeight ?? POST_TABLE_EL_HEIGHT
    })

    // Build height map: rowIndex → measured px height
    const rowHeights: number[] = data.items.map((_, i) => {
      const el = rowEls.find((e) => e.dataset.rowIndex === String(i))
      return el?.offsetHeight ?? 40
    })

    const result: PageSlice[] = []
    let currentPage = 0
    // Page 1: measured bill-to section (+ gap) + column header
    let used = aboveTableH + colHeaderH
    let pageItemStart = 0
    let i = 0

    while (i <= data.items.length) {
      if (i === data.items.length) {
        // All items placed — now greedily pack post-table elements onto pages
        let postIdx = 0
        let pagePostStart = 0

        while (postIdx <= postElCount) {
          if (postIdx === postElCount) {
            // All post-table elements placed — close the current page
            const showAny = postIdx > pagePostStart
            result.push({
              pageIndex: currentPage,
              itemStartIndex: pageItemStart,
              itemEndIndex: i,
              showTotals: showAny || postElCount === 0,
              showColumnHeader: true,
              postTableStartIndex: pagePostStart,
              postTableEndIndex: postIdx,
            })
            break
          }

          // Cost to add this element: margin before first (POST_TABLE_MARGIN) or gap between (POST_TABLE_GAP)
          const isFirstOnPage = postIdx === pagePostStart
          const addCost = isFirstOnPage ? POST_TABLE_MARGIN : POST_TABLE_GAP
          const elH = postElHeights[postIdx] ?? POST_TABLE_EL_HEIGHT

          if (used + addCost + elH <= availableH) {
            used += addCost + elH
            postIdx++
          } else {
            // This element doesn't fit — close current page, start a new one
            result.push({
              pageIndex: currentPage,
              itemStartIndex: pageItemStart,
              itemEndIndex: i,
              showTotals: postIdx > pagePostStart,
              showColumnHeader: true,
              postTableStartIndex: pagePostStart,
              postTableEndIndex: postIdx,
            })
            currentPage++
            // New page has no items and no above-table — starts empty
            used = 0
            pageItemStart = i  // no new items on overflow pages
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
        // Row doesn't fit (or max rows per page reached) — close current page, start new one
        result.push({
          pageIndex: currentPage,
          itemStartIndex: pageItemStart,
          itemEndIndex: i,
          showTotals: false,
          showColumnHeader: true,
          postTableStartIndex: 0,
          postTableEndIndex: 0,
        })
        currentPage++
        used = colHeaderH  // new page: itemList is first element, no gap before it
        pageItemStart = i
        // Edge case: single row taller than page — force it through anyway (size overflow only)
        if (!forceBreak && rowH > availableH) {
          used += rowH
          i++
        }
      }
    }

    // If no items at all, ensure at least one page with totals
    if (result.length === 0) {
      result.push({
        pageIndex: 0,
        itemStartIndex: 0,
        itemEndIndex: 0,
        showTotals: true,
        showColumnHeader: true,
        postTableStartIndex: 0,
        postTableEndIndex: postElCount,
      })
    }

    setPages(result)
    setReady(true)
  }, [data.items, availableH, maxRowsPerPage])

  useEffect(() => {
    // Double-rAF: first frame lets React flush MeasureContainer re-render,
    // second frame ensures layout has been recalculated before we measure.
    let innerFrame: number
    const outerFrame = requestAnimationFrame(() => {
      innerFrame = requestAnimationFrame(() => {
        compute()
      })
    })

    // Watch all measured sections for size changes so pagination stays accurate:
    // - data-above-table: bill-to content changes height as client fields are filled
    // - data-post-el-index elements: individual post-table element heights change
    const container = measureRef.current
    let observer: ResizeObserver | null = null
    if (container && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        compute()
      })
      const aboveTableEl = container.querySelector<HTMLElement>('[data-above-table]')
      if (aboveTableEl) observer.observe(aboveTableEl)
      container.querySelectorAll<HTMLElement>('[data-post-el-index]').forEach((el) => {
        observer!.observe(el)
      })
    }

    return () => {
      cancelAnimationFrame(outerFrame)
      cancelAnimationFrame(innerFrame)
      observer?.disconnect()
    }
  }, [compute])

  const totalPages = Math.max(pages.length, 1)

  return { pages, totalPages, measureRef, ready }
}
