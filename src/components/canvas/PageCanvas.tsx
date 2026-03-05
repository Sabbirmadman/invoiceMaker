import type { StoredDocument } from '@/types/document'
import { calculateTotals } from '@/services/calculations'
import { CanvasPage } from './CanvasPage'

interface Props {
  doc: StoredDocument
  zoom?: number
}

export function PageCanvas({ doc, zoom = 1 }: Props) {
  const totals = calculateTotals(doc.data.items, doc.data.totalsConfig)

  // For now: single page. Pagination engine (Phase 7) will split into multiple CanvasPages.
  const totalPages = 1

  return (
    <div className="flex flex-col items-center gap-6 bg-muted/30 p-6">
      <CanvasPage
        doc={doc}
        totals={totals}
        pageNumber={1}
        totalPages={totalPages}
        zoom={zoom}
      />
    </div>
  )
}
