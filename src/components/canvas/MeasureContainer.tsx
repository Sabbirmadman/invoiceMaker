import { forwardRef } from 'react'
import type { StoredDocument, TotalsResult } from '@/types/document'
import { calculateTotals } from '@/services/calculations'
import type { TemplateWidget } from '@/types/templateV2'
import type { TemplateElement } from '@/types/template'
import { BillToElement } from '@/components/elements/BillToElement'
import { ShipToElement } from '@/components/elements/ShipToElement'
import { InvoiceDetailsElement } from '@/components/elements/InvoiceDetailsElement'
import { EstimateDetailsElement } from '@/components/elements/EstimateDetailsElement'
import { ReceiptDetailsElement } from '@/components/elements/ReceiptDetailsElement'
import { ItemListElement } from '@/components/elements/ItemListElement'
import { TotalsBlockElement } from '@/components/elements/TotalsBlockElement'
import { NotesElement } from '@/components/elements/NotesElement'
import { TermsElement } from '@/components/elements/TermsElement'
import { DividerElement } from '@/components/elements/DividerElement'
import { TextLabelElement } from '@/components/elements/TextLabelElement'
import { PageNumberElement } from '@/components/elements/PageNumberElement'

function widgetToElement(w: TemplateWidget): TemplateElement {
  return { id: w.id, type: w.type, zIndex: 0, placement: w.placement, config: w.config, styles: w.styles, bindings: w.bindings }
}

interface Props {
  doc: StoredDocument
  fillMode?: boolean
}

/**
 * Hidden off-screen container used only for measuring element heights.
 * Reads from V2 BodySectionV2 (body.grids[].cells[].children) instead of flat elements.
 *
 * CRITICAL: DOM structure must mirror BodySectionRenderer exactly:
 *   - Root: padding:16
 *   - Pre-table wrapper: flex-col gap-16
 *   - Post-table wrapper: marginTop:16 flex-col gap-16
 */
export const MeasureContainer = forwardRef<HTMLDivElement, Props>(({ doc, fillMode = false }, ref) => {
  const { data, templateSnapshot } = doc
  const pageWidth = templateSnapshot.pageSize === 'A4' ? 794 : 816
  const totals = calculateTotals(data.items, data.totalsConfig)

  // Collect all widgets from all body grids
  const allWidgets: TemplateWidget[] = []
  for (const grid of templateSnapshot.body.grids) {
    for (const cell of grid.cells) {
      for (const node of cell.children) {
        if (node.kind === 'widget') allWidgets.push(node)
      }
    }
  }

  const aboveTableWidgets = allWidgets.filter(
    (w) => w.type !== 'watermark' && (w.placement ?? 'last-page') === 'first-page',
  )

  const postTableWidgets = allWidgets.filter((w) => {
    if (w.type === 'watermark') return false
    if ((w.placement ?? 'last-page') !== 'last-page') return false
    if (!fillMode && w.type === 'notes' && !data.notes) return false
    if (!fillMode && w.type === 'termsConditions' && !data.terms) return false
    return true
  })

  const itemListWidget = allWidgets.find((w) => w.placement === 'all-pages')

  return (
    <div
      ref={ref}
      aria-hidden
      style={{
        position: 'fixed',
        top: -9999,
        left: -9999,
        width: pageWidth,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        visibility: 'hidden',
        pointerEvents: 'none',
        zIndex: -1,
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {aboveTableWidgets.map((w) => (
          <div key={w.id} data-measure-id={w.id} data-measure-placement="first-page">
            {renderAboveTableWidget(w, doc, totals)}
          </div>
        ))}

        {itemListWidget && (
          <div data-measure-id={itemListWidget.id} data-measure-placement="all-pages">
            <ItemListElement
              element={widgetToElement(itemListWidget)}
              items={data.items}
              currency={data.totalsConfig.currency}
              showHeader={true}
              itemOffset={0}
              isLastPage={true}
            />
          </div>
        )}
      </div>

      {postTableWidgets.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
          {postTableWidgets.map((w, idx) => (
            <div key={w.id} data-measure-id={w.id} data-measure-placement="last-page" data-post-el-index={idx}>
              {renderPostTableWidget(w, doc, totals)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
})

MeasureContainer.displayName = 'MeasureContainer'

function renderAboveTableWidget(w: TemplateWidget, doc: StoredDocument, totals: TotalsResult): React.ReactNode {
  const el = widgetToElement(w)
  const { data } = doc
  const meta = data.meta
  switch (w.type) {
    case 'billTo': return <BillToElement element={el} client={data.client} />
    case 'shipTo': return <ShipToElement element={el} client={data.client} />
    case 'invoiceDetails': return meta.type === 'invoice' ? <InvoiceDetailsElement element={el} meta={meta} /> : null
    case 'estimateDetails': return meta.type === 'estimate' ? <EstimateDetailsElement element={el} meta={meta} /> : null
    case 'receiptDetails': return meta.type === 'receipt' ? <ReceiptDetailsElement element={el} meta={meta} /> : null
    default: return null
  }
}

function renderPostTableWidget(w: TemplateWidget, doc: StoredDocument, totals: TotalsResult): React.ReactNode {
  const el = widgetToElement(w)
  const { data } = doc
  switch (w.type) {
    case 'totalsBlock': return <TotalsBlockElement element={el} totals={totals} config={data.totalsConfig} />
    case 'notes': return <NotesElement element={el} notes={data.notes} />
    case 'termsConditions': return <TermsElement element={el} terms={data.terms} />
    case 'divider': return <DividerElement element={el} />
    case 'textLabel': return <TextLabelElement element={el} />
    case 'pageNumber': return <PageNumberElement element={el} current={1} total={1} />
    default: return null
  }
}
