import { calculateTotals } from '@/services/calculations'
import type { StoredDocument } from '@/types/document'
import { usePagination } from '@/hooks/usePagination'
import { CanvasPage } from './CanvasPage'
import { MeasureContainer } from './MeasureContainer'

interface Props {
  doc: StoredDocument
  zoom?: number
}

export function PageCanvas({ doc, zoom = 1 }: Props) {
  const totals = calculateTotals(doc.data.items, doc.data.totalsConfig)
  const { pages, totalPages, measureRef, ready } = usePagination(doc)

  const pagesToRender = ready && pages.length > 0 ? pages : null

  return (
    <>
      {/* Hidden measurement container — off-screen, no zoom */}
      <MeasureContainer ref={measureRef} doc={doc} />

      <div className="flex flex-col items-center gap-6 bg-muted/30 p-6">
        {pagesToRender ? (
          pagesToRender.map((slice) => (
            <CanvasPage
              key={slice.pageIndex}
              doc={doc}
              totals={totals}
              pageNumber={slice.pageIndex + 1}
              totalPages={totalPages}
              slice={slice}
              zoom={zoom}
            />
          ))
        ) : (
          // While measuring (first render), show a single un-paginated page
          <CanvasPage
            doc={doc}
            totals={totals}
            pageNumber={1}
            totalPages={1}
            zoom={zoom}
          />
        )}
      </div>
    </>
  )
}
