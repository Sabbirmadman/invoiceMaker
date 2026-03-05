import type { StoredDocument, TotalsResult } from '@/types/document'
import { PAGE_DIMENSIONS } from '@/types/common'
import { SectionRenderer, BodySectionRenderer } from './SectionRenderer'
import type { PageSlice } from '@/hooks/usePagination'

interface Props {
  doc: StoredDocument
  totals: TotalsResult
  pageNumber: number
  totalPages: number
  slice?: PageSlice   // when provided, only render items in this slice
  zoom?: number
}

export function CanvasPage({ doc, totals, pageNumber, totalPages, slice, zoom = 1 }: Props) {
  const { templateSnapshot } = doc
  const { pageSize, header, body, footer } = templateSnapshot
  const dims = PAGE_DIMENSIONS[pageSize]

  // Build a scoped doc for this page that only contains the items for this slice
  const pageDoc: StoredDocument = slice
    ? {
        ...doc,
        data: {
          ...doc.data,
          items: doc.data.items.slice(slice.itemStartIndex, slice.itemEndIndex),
        },
      }
    : doc

  return (
    <div
      className="relative bg-white shadow-md overflow-hidden"
      style={{
        width: dims.width,
        height: dims.height,
        transform: `scale(${zoom})`,
        transformOrigin: 'top center',
        marginBottom: zoom < 1 ? `${dims.height * (zoom - 1)}px` : undefined,
      }}
    >
      {/* Header */}
      {header.visible && (
        <div className="border-b border-border" style={{ height: header.height }}>
          <SectionRenderer
            section={header}
            doc={doc}
            totals={totals}
            currentPage={pageNumber}
            totalPages={totalPages}
          />
        </div>
      )}

      {/* Body */}
      <div
        style={{
          height:
            dims.height -
            (header.visible ? header.height : 0) -
            (footer.visible ? footer.height : 0),
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <BodySectionRenderer
          section={body}
          doc={pageDoc}
          totals={totals}
          currentPage={pageNumber}
          totalPages={totalPages}
          showTotals={slice ? slice.showTotals : true}
          showColumnHeader={slice ? slice.showColumnHeader : true}
          isFirstPage={pageNumber === 1}
        />
      </div>

      {/* Footer */}
      {footer.visible && (
        <div
          className="absolute bottom-0 left-0 right-0 border-t border-border"
          style={{ height: footer.height }}
        >
          <SectionRenderer
            section={footer}
            doc={doc}
            totals={totals}
            currentPage={pageNumber}
            totalPages={totalPages}
          />
        </div>
      )}
    </div>
  )
}
