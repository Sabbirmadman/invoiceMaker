import type { StoredDocument, TotalsResult } from '@/types/document'
import { PAGE_DIMENSIONS } from '@/types/common'
import { SectionRenderer, BodySectionRenderer } from './SectionRenderer'

interface Props {
  doc: StoredDocument
  totals: TotalsResult
  pageNumber: number
  totalPages: number
  zoom?: number
}

export function CanvasPage({ doc, totals, pageNumber, totalPages, zoom = 1 }: Props) {
  const { templateSnapshot } = doc
  const { pageSize, header, body, footer } = templateSnapshot
  const dims = PAGE_DIMENSIONS[pageSize]

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
        <div
          className="border-b border-border"
          style={{ height: header.height }}
        >
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
          minHeight: dims.height - (header.visible ? header.height : 0) - (footer.visible ? footer.height : 0),
        }}
      >
        <BodySectionRenderer
          section={body}
          doc={doc}
          totals={totals}
          currentPage={pageNumber}
          totalPages={totalPages}
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
