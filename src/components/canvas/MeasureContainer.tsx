import { forwardRef } from 'react'
import type { StoredDocument, TotalsResult } from '@/types/document'
import { formatCurrency, calculateLineAmount, calculateTotals } from '@/services/calculations'
import type { TemplateElement } from '@/types/template'
import { BillToElement } from '@/components/elements/BillToElement'
import { ShipToElement } from '@/components/elements/ShipToElement'
import { InvoiceDetailsElement } from '@/components/elements/InvoiceDetailsElement'
import { EstimateDetailsElement } from '@/components/elements/EstimateDetailsElement'
import { ReceiptDetailsElement } from '@/components/elements/ReceiptDetailsElement'
import { TotalsBlockElement } from '@/components/elements/TotalsBlockElement'
import { NotesElement } from '@/components/elements/NotesElement'
import { TermsElement } from '@/components/elements/TermsElement'
import { DividerElement } from '@/components/elements/DividerElement'
import { TextLabelElement } from '@/components/elements/TextLabelElement'
import { PageNumberElement } from '@/components/elements/PageNumberElement'

interface Props {
  doc: StoredDocument
}

/**
 * Hidden off-screen container used only for measuring element heights.
 * Renders at actual page width (794px for A4) so offsetHeight is accurate.
 *
 * Uses element.placement to determine grouping:
 *   first-page  → data-above-table  (rendered once on page 1 before itemList)
 *   all-pages   → itemList rows measured individually via data-row-index
 *   last-page   → data-post-table   (totals block etc., must fit on final page)
 */
export const MeasureContainer = forwardRef<HTMLDivElement, Props>(({ doc }, ref) => {
  const { data, templateSnapshot } = doc
  const pageWidth = templateSnapshot.pageSize === 'A4' ? 794 : 816
  const totals = calculateTotals(data.items, data.totalsConfig)

  const sortedBody = [...templateSnapshot.body.elements].sort((a, b) => a.zIndex - b.zIndex)

  // first-page elements: everything with placement === 'first-page'
  const aboveTableElements = sortedBody.filter(
    (el) => el.type !== 'watermark' && (el.placement ?? 'last-page') === 'first-page',
  )

  // last-page elements: everything with placement === 'last-page' (or no placement)
  const postTableElements = sortedBody.filter(
    (el) => el.type !== 'watermark' && (el.placement ?? 'last-page') === 'last-page',
  )

  // The all-pages element (itemList) — find its column config for the header mock
  const itemListEl = sortedBody.find((el) => el.placement === 'all-pages')
  const columns: string[] = (itemListEl?.config?.columns as string[]) ?? ['name', 'qty', 'rate', 'amount']

  return (
    <div
      ref={ref}
      aria-hidden
      style={{
        position: 'fixed',
        top: -9999,
        left: -9999,
        width: pageWidth,
        visibility: 'hidden',
        pointerEvents: 'none',
        zIndex: -1,
      }}
    >
      {/* Above-table elements (first-page placement).
          paddingBottom: 16 captures the gap-4 between last first-page element and itemList. */}
      <div data-above-table className="flex flex-col gap-4" style={{ paddingBottom: 16 }}>
        {aboveTableElements.map((el) => renderAboveTableElement(el, doc, totals))}
      </div>

      {/* Column header — measured to know how much space to reserve per new page.
          Renders a minimal mock matching ItemListElement's header row. */}
      <div data-col-header className="flex w-full text-sm" style={{ background: '#000', color: '#fff' }}>
        <div className="w-8 px-3 py-2 shrink-0">#</div>
        {columns.map((col) => (
          <div key={col} className="flex-1 px-3 py-2">{col}</div>
        ))}
      </div>

      {/* Item rows — each measured individually for row-level pagination */}
      {data.items.map((item, idx) => {
        const amount = calculateLineAmount(item)
        return (
          <div
            key={item.id}
            data-row-index={idx}
            className="flex w-full border-b text-sm"
          >
            <div className="w-8 px-3 py-2 shrink-0">{idx + 1}</div>
            <div className="flex-1 px-3 py-2">
              <div>{item.name}</div>
              {item.description && (
                <div className="text-xs text-muted-foreground">{item.description}</div>
              )}
            </div>
            {columns.includes('qty') && (
              <div className="flex-1 px-3 py-2 text-right">{item.qty}</div>
            )}
            {columns.includes('rate') && (
              <div className="flex-1 px-3 py-2 text-right">
                {formatCurrency(item.rate, data.totalsConfig.currency)}
              </div>
            )}
            {columns.includes('tax') && (
              <div className="flex-1 px-3 py-2 text-right">{item.taxRate}%</div>
            )}
            {(columns.includes('amount') || columns.includes('discount')) && (
              <div className="flex-1 px-3 py-2 text-right">
                {formatCurrency(amount, data.totalsConfig.currency)}
              </div>
            )}
          </div>
        )
      })}

      {/* Post-table elements — each measured individually for per-element pagination.
          No wrapper div — each element gets its own data-post-el-index attribute. */}
      {postTableElements.map((el, idx) => (
        <div key={el.id} data-post-el-index={idx}>
          {renderPostTableElement(el, doc, totals)}
        </div>
      ))}
    </div>
  )
})

MeasureContainer.displayName = 'MeasureContainer'

function renderAboveTableElement(
  el: TemplateElement,
  doc: StoredDocument,
  totals: TotalsResult,
): React.ReactNode {
  const { data } = doc
  const meta = data.meta
  switch (el.type) {
    case 'billTo':
      return <BillToElement key={el.id} element={el} client={data.client} />
    case 'shipTo':
      return <ShipToElement key={el.id} element={el} client={data.client} />
    case 'invoiceDetails':
      if (meta.type !== 'invoice') return null
      return <InvoiceDetailsElement key={el.id} element={el} meta={meta} />
    case 'estimateDetails':
      if (meta.type !== 'estimate') return null
      return <EstimateDetailsElement key={el.id} element={el} meta={meta} />
    case 'receiptDetails':
      if (meta.type !== 'receipt') return null
      return <ReceiptDetailsElement key={el.id} element={el} meta={meta} />
    default:
      return null
  }
}

function renderPostTableElement(
  el: TemplateElement,
  doc: StoredDocument,
  totals: TotalsResult,
): React.ReactNode {
  const { data } = doc
  switch (el.type) {
    case 'totalsBlock':
      return <TotalsBlockElement key={el.id} element={el} totals={totals} config={data.totalsConfig} />
    case 'notes':
      return <NotesElement key={el.id} element={el} notes={data.notes} />
    case 'termsConditions':
      return <TermsElement key={el.id} element={el} terms={data.terms} />
    case 'divider':
      return <DividerElement key={el.id} element={el} />
    case 'textLabel':
      return <TextLabelElement key={el.id} element={el} />
    case 'pageNumber':
      return <PageNumberElement key={el.id} element={el} current={1} total={1} />
    default:
      return null
  }
}
