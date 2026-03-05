import { forwardRef } from 'react'
import type { StoredDocument } from '@/types/document'
import { formatCurrency, calculateLineAmount } from '@/services/calculations'

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

      {/* Totals block — paddingTop: 16 captures the gap-4 between itemList and totalsBlock */}
      <div data-totals-block style={{ paddingTop: 16 }} className="flex justify-end min-w-64">
        <div className="min-w-64 text-sm">
          <div className="flex justify-between gap-8 py-1 border-b">
            <span>Sub Total</span><span>$0.00</span>
          </div>
          <div className="flex justify-between gap-8 py-1 border-b">
            <span>Tax</span><span>$0.00</span>
          </div>
          <div className="flex justify-between gap-8 py-1 border-b font-semibold text-base">
            <span>Total</span><span>$0.00</span>
          </div>
          <div className="flex justify-between gap-8 py-1 font-semibold text-base">
            <span>Balance Due</span><span>$0.00</span>
          </div>
        </div>
      </div>
    </div>
  )
})

MeasureContainer.displayName = 'MeasureContainer'
