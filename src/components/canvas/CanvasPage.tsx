import type { StoredDocument, TotalsResult } from '@/types/document'
import { PAGE_DIMENSIONS } from '@/types/common'
import { SectionRenderer, BodySectionRenderer } from './SectionRenderer'
import type { PageSlice } from '@/hooks/usePagination'
import { useFillMode } from '@/components/fill-mode/FillModeContext'

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
  const { fillMode } = useFillMode()

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

  const bodyBg = templateSnapshot.theme.bodyBackground
  const pageBackgroundStyle: React.CSSProperties = {}
  if (bodyBg?.color) pageBackgroundStyle.backgroundColor = bodyBg.color
  if (bodyBg?.imageUrl) {
    pageBackgroundStyle.backgroundImage = `url('${bodyBg.imageUrl}')`
    pageBackgroundStyle.backgroundSize = bodyBg.imageSize === 'repeat' ? 'auto' : (bodyBg.imageSize ?? 'cover')
    pageBackgroundStyle.backgroundPosition = 'center'
    pageBackgroundStyle.backgroundRepeat = bodyBg.imageSize === 'repeat' ? 'repeat' : 'no-repeat'
  }

  return (
    <div
      data-canvas-page="true"
      className="relative bg-white shadow-md overflow-hidden print:transform-none print:shadow-none print:mb-0"
      style={{
        width: dims.width,
        height: dims.height,
        transform: `scale(${zoom})`,
        transformOrigin: 'top center',
        marginBottom: zoom < 1 ? `${dims.height * (zoom - 1)}px` : undefined,
        printColorAdjust: 'exact',
        WebkitPrintColorAdjust: 'exact',
        ...pageBackgroundStyle,
      } as React.CSSProperties}
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
            sectionType="header"
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
          itemOffset={slice ? slice.itemStartIndex : 0}
          isLastPage={slice ? slice.itemEndIndex === doc.data.items.length : true}
          allItems={doc.data.items}
          postTableStartIndex={slice?.postTableStartIndex ?? 0}
          postTableEndIndex={slice?.postTableEndIndex}
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
            sectionType="footer"
          />
        </div>
      )}

      {/* Boundary guide lines — fill mode only, not in preview or PDF.
          Offset by 16px (body p-4 padding) to match the actual content boundary
          that usePagination uses for its availableH calculation. */}
      {fillMode && (
        <>
          {header.visible && (
            <div
              className="absolute left-0 right-0 pointer-events-none"
              style={{ top: header.height + 16, height: 0, borderTop: '1.5px dashed #3b82f6', zIndex: 100 }}
            >
              <span
                className="absolute font-mono"
                style={{ fontSize: '8px', background: '#3b82f6', color: '#fff', padding: '1px 3px', top: -10, left: 0 }}
              >
                x:0 y:{header.height + 16}
              </span>
            </div>
          )}
          {footer.visible && (
            <div
              className="absolute left-0 right-0 pointer-events-none"
              style={{ top: dims.height - footer.height - 16, height: 0, borderTop: '1.5px dashed #3b82f6', zIndex: 100 }}
            >
              <span
                className="absolute font-mono"
                style={{ fontSize: '8px', background: '#3b82f6', color: '#fff', padding: '1px 3px', top: 2, left: 0 }}
              >
                x:0 y:{dims.height - footer.height - 16}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
