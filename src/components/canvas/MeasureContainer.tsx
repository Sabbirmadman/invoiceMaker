import { forwardRef } from 'react'
import type { StoredDocument, TotalsResult } from '@/types/document'
import { formatCurrency, calculateLineAmount, calculateTotals } from '@/services/calculations'
import type { TemplateElement } from '@/types/template'
import { TotalsBlockElement } from '@/components/elements/TotalsBlockElement'
import { NotesElement } from '@/components/elements/NotesElement'
import { TermsElement } from '@/components/elements/TermsElement'
import { DividerElement } from '@/components/elements/DividerElement'
import { TextLabelElement } from '@/components/elements/TextLabelElement'
import { PageNumberElement } from '@/components/elements/PageNumberElement'

// Must match the constant in SectionRenderer
const PRE_TABLE_TYPES = new Set(['watermark', 'billTo', 'shipTo', 'itemList'])

interface Props {
  doc: StoredDocument
}

/**
 * Hidden off-screen container used only for measuring row heights.
 * Renders the item table at actual page width (794px for A4) so
 * getBoundingClientRect gives accurate heights.
 */
export const MeasureContainer = forwardRef<HTMLDivElement, Props>(({ doc }, ref) => {
  const { data, templateSnapshot } = doc
  const pageWidth = templateSnapshot.pageSize === 'A4' ? 794 : 816
  const totals = calculateTotals(data.items, data.totalsConfig)
  const postTableElements = [...templateSnapshot.body.elements]
    .filter((el) => !PRE_TABLE_TYPES.has(el.type))
    .sort((a, b) => a.zIndex - b.zIndex)

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
      {/* Bill-to block — measured to get accurate page 1 pre-table height.
          paddingBottom: 16 captures the gap-4 between billTo and itemList. */}
      <div data-above-table style={{ paddingBottom: 16 }}>
        <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-1">Bill To</div>
        {data.client.name && <div className="font-semibold text-sm">{data.client.name}</div>}
        {data.client.company && <div className="text-sm">{data.client.company}</div>}
        {data.client.address && <div className="text-sm">{data.client.address}</div>}
        {(data.client.city || data.client.state || data.client.zip) && (
          <div className="text-sm">
            {[data.client.city, data.client.state, data.client.zip].filter(Boolean).join(', ')}
          </div>
        )}
        {data.client.country && <div className="text-sm">{data.client.country}</div>}
        {data.client.phone && <div className="text-sm">{data.client.phone}</div>}
        {data.client.email && <div className="text-sm">{data.client.email}</div>}
      </div>

      {/* Column header — measured to know how much space to reserve per new page */}
      <div data-col-header className="flex w-full bg-black text-white text-sm">
        <div className="w-8 px-3 py-2 shrink-0">#</div>
        <div className="flex-1 px-3 py-2">Item</div>
        <div className="flex-1 px-3 py-2 text-right">Qty</div>
        <div className="flex-1 px-3 py-2 text-right">Rate</div>
        <div className="flex-1 px-3 py-2 text-right">Tax %</div>
        <div className="flex-1 px-3 py-2 text-right">Amount</div>
      </div>

      {/* Item rows */}
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
            <div className="flex-1 px-3 py-2 text-right">{item.qty}</div>
            <div className="flex-1 px-3 py-2 text-right">
              {formatCurrency(item.rate, data.totalsConfig.currency)}
            </div>
            <div className="flex-1 px-3 py-2 text-right">{item.taxRate}%</div>
            <div className="flex-1 px-3 py-2 text-right">
              {formatCurrency(amount, data.totalsConfig.currency)}
            </div>
          </div>
        )
      })}

      {/* Post-table elements — measured as a combined unit (paddingTop = gap-4 above first element) */}
      <div data-post-table style={{ paddingTop: 16 }} className="flex flex-col gap-4">
        {postTableElements.map((el) => renderPostTableElement(el, doc, totals))}
      </div>
    </div>
  )
})

MeasureContainer.displayName = 'MeasureContainer'

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
