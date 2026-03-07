import { forwardRef } from 'react'
import type { StoredDocument, TotalsResult } from '@/types/document'
import { calculateTotals } from '@/services/calculations'
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

interface Props {
  doc: StoredDocument
}

/**
 * Hidden off-screen container used only for measuring element heights.
 * Renders at actual page width so offsetHeight / offsetTop are accurate.
 *
 * CRITICAL: This container's DOM structure must mirror BodySectionRenderer exactly:
 *   - Root has padding:16 (matches p-4)
 *   - Pre-table wrapper: flex-col gap-16 (matches flex flex-col gap-4)
 *     Contains: first-page elements + ItemListElement (with data-row-index on its rows)
 *   - Post-table wrapper: marginTop:16 flex-col gap-16 (matches mt-4 gap-4)
 *     Contains: post-table elements
 *
 * Data attributes:
 *   data-measure-id        — on every element wrapper (for ResizeObserver)
 *   data-measure-placement — "first-page" | "all-pages" | "last-page"
 *   data-row-index         — on each item row (added by ItemListElement itself)
 *   data-post-el-index     — on each post-table element wrapper
 */
export const MeasureContainer = forwardRef<HTMLDivElement, Props>(({ doc }, ref) => {
  const { data, templateSnapshot } = doc
  const pageWidth = templateSnapshot.pageSize === 'A4' ? 794 : 816
  const totals = calculateTotals(data.items, data.totalsConfig)

  const sortedBody = [...templateSnapshot.body.elements].sort((a, b) => a.zIndex - b.zIndex)

  // first-page elements (BillTo, ShipTo, InvoiceDetails, etc.)
  const aboveTableElements = sortedBody.filter(
    (el) => el.type !== 'watermark' && (el.placement ?? 'last-page') === 'first-page',
  )

  // last-page elements (TotalsBlock, Notes, Terms, etc.)
  const postTableElements = sortedBody.filter(
    (el) => el.type !== 'watermark' && (el.placement ?? 'last-page') === 'last-page',
  )

  // all-pages element (itemList)
  const itemListEl = sortedBody.find((el) => el.placement === 'all-pages')

  return (
    <div
      ref={ref}
      aria-hidden
      style={{
        position: 'fixed',
        top: -9999,
        left: -9999,
        width: pageWidth,
        // Mirror BodySectionRenderer's p-4 exactly
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        visibility: 'hidden',
        pointerEvents: 'none',
        zIndex: -1,
        overflow: 'hidden',
      }}
    >
      {/*
       * Pre-table wrapper — mirrors BodySectionRenderer's "div.flex-col.gap-4"
       * Contains: first-page elements (BillTo, Details…) + itemList
       */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {aboveTableElements.map((el) => (
          <div
            key={el.id}
            data-measure-id={el.id}
            data-measure-placement="first-page"
          >
            {renderAboveTableElement(el, doc, totals)}
          </div>
        ))}

        {/* ItemList — uses actual ItemListElement so row heights are pixel-accurate.
            ItemListElement adds data-row-index to each row, which usePagination reads. */}
        {itemListEl && (
          <div
            data-measure-id={itemListEl.id}
            data-measure-placement="all-pages"
          >
            <ItemListElement
              element={itemListEl}
              items={data.items}
              currency={data.totalsConfig.currency}
              showHeader={true}
              itemOffset={0}
              isLastPage={true}
            />
          </div>
        )}
      </div>

      {/*
       * Post-table wrapper — mirrors BodySectionRenderer's "div.flex-col.gap-4.mt-4"
       * The marginTop:16 matches mt-4, gap:16 matches gap-4.
       */}
      {postTableElements.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
          {postTableElements.map((el, idx) => (
            <div
              key={el.id}
              data-measure-id={el.id}
              data-measure-placement="last-page"
              data-post-el-index={idx}
            >
              {renderPostTableElement(el, doc, totals)}
            </div>
          ))}
        </div>
      )}
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
