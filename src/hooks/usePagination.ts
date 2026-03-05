import { useState, useEffect, useRef, useCallback } from 'react'
import type { StoredDocument } from '@/types/document'
import { PAGE_DIMENSIONS } from '@/types/common'

export interface PageSlice {
  pageIndex: number          // 0-based
  itemStartIndex: number     // first item row index on this page
  itemEndIndex: number       // exclusive end
  showTotals: boolean        // totals block only on last page
  showColumnHeader: boolean  // always true
}

interface PaginationResult {
  pages: PageSlice[]
  totalPages: number
  measureRef: React.RefObject<HTMLDivElement | null>
  ready: boolean
}

const COLUMN_HEADER_HEIGHT = 36   // px — fallback estimate
const TOTALS_BLOCK_HEIGHT = 196   // px — fallback: content + 16px gap above it
const ABOVE_TABLE_HEIGHT = 140    // px — fallback: bill-to content + 16px gap below it
const BODY_PADDING = 32           // 16px top + 16px bottom from BodySectionRenderer

export function usePagination(doc: StoredDocument): PaginationResult {
  const { templateSnapshot, data } = doc
  const { pageSize, header, footer } = templateSnapshot
  const dims = PAGE_DIMENSIONS[pageSize]

  const headerH = header.visible ? header.height : 0
  const footerH = footer.visible ? footer.height : 0
  const availableH = dims.height - headerH - footerH - BODY_PADDING

  const measureRef = useRef<HTMLDivElement | null>(null)
  const [pages, setPages] = useState<PageSlice[]>([])
  const [ready, setReady] = useState(false)

  const compute = useCallback(() => {
    const container = measureRef.current
    if (!container) return

    const rowEls = Array.from(container.querySelectorAll<HTMLElement>('[data-row-index]'))
    const totalsEl = container.querySelector<HTMLElement>('[data-totals-block]')
    const colHeaderEl = container.querySelector<HTMLElement>('[data-col-header]')
    const aboveTableEl = container.querySelector<HTMLElement>('[data-above-table]')

    const colHeaderH = colHeaderEl?.offsetHeight ?? COLUMN_HEADER_HEIGHT
    // totalsH includes the 16px gap-4 before the totals block (measured via paddingTop on data-totals-block)
    const totalsH = totalsEl?.offsetHeight ?? TOTALS_BLOCK_HEIGHT
    // aboveTableH includes the 16px gap-4 after bill-to (measured via paddingBottom on data-above-table)
    const aboveTableH = aboveTableEl?.offsetHeight ?? ABOVE_TABLE_HEIGHT

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
        // All items placed — now place totals
        const remainingSpace = availableH - used
        if (remainingSpace >= totalsH) {
          // Totals fit on current page
          result.push({
            pageIndex: currentPage,
            itemStartIndex: pageItemStart,
            itemEndIndex: i,
            showTotals: true,
            showColumnHeader: true,
          })
        } else {
          // Push current page without totals, then new page for totals
          result.push({
            pageIndex: currentPage,
            itemStartIndex: pageItemStart,
            itemEndIndex: i,
            showTotals: false,
            showColumnHeader: true,
          })
          currentPage++
          result.push({
            pageIndex: currentPage,
            itemStartIndex: i,
            itemEndIndex: i,
            showTotals: true,
            showColumnHeader: true,
          })
        }
        break
      }

      const rowH = rowHeights[i] ?? 40

      if (used + rowH <= availableH) {
        used += rowH
        i++
      } else {
        // Row doesn't fit — close current page, start new one
        result.push({
          pageIndex: currentPage,
          itemStartIndex: pageItemStart,
          itemEndIndex: i,
          showTotals: false,
          showColumnHeader: true,
        })
        currentPage++
        used = colHeaderH  // new page: itemList is first element, no gap before it
        pageItemStart = i
        // Edge case: single row taller than page — force it through anyway
        if (rowH > availableH) {
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
      })
    }

    setPages(result)
    setReady(true)
  }, [data.items, availableH])

  useEffect(() => {
    // Don't reset ready — keep current layout visible while recomputing to avoid flash
    const frame = requestAnimationFrame(() => {
      compute()
    })
    return () => cancelAnimationFrame(frame)
  }, [compute])

  const totalPages = Math.max(pages.length, 1)

  return { pages, totalPages, measureRef, ready }
}
