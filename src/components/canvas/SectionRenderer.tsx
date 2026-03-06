import type { Section, BodySection, TemplateElement } from '@/types/template'
import type { StoredDocument, TotalsResult, LineItem } from '@/types/document'
import { GridLayout, GridCell } from './GridLayout'
import { LogoElement } from '@/components/elements/LogoElement'
import { CompanyDetailsElement } from '@/components/elements/CompanyDetailsElement'
import { BillToElement } from '@/components/elements/BillToElement'
import { ShipToElement } from '@/components/elements/ShipToElement'
import { InvoiceDetailsElement } from '@/components/elements/InvoiceDetailsElement'
import { EstimateDetailsElement } from '@/components/elements/EstimateDetailsElement'
import { ReceiptDetailsElement } from '@/components/elements/ReceiptDetailsElement'
import { ItemListElement } from '@/components/elements/ItemListElement'
import { TotalsBlockElement } from '@/components/elements/TotalsBlockElement'
import { NotesElement } from '@/components/elements/NotesElement'
import { TermsElement } from '@/components/elements/TermsElement'
import { PageNumberElement } from '@/components/elements/PageNumberElement'
import { WatermarkElement } from '@/components/elements/WatermarkElement'
import { DividerElement } from '@/components/elements/DividerElement'
import { TextLabelElement } from '@/components/elements/TextLabelElement'

interface SectionRendererProps {
  section: Section
  doc: StoredDocument
  totals: TotalsResult
  currentPage: number
  totalPages: number
}

export function SectionRenderer({
  section,
  doc,
  totals,
  currentPage,
  totalPages,
}: SectionRendererProps) {
  const sorted = [...section.elements].sort((a, b) => a.zIndex - b.zIndex)

  return (
    <div
      className="relative"
      style={{ height: section.height, width: '100%' }}
    >
      <GridLayout grid={section.grid}>
        {sorted.map((el) => {
          if (el.type === 'background') {
            return (
              <div
                key={el.id}
                className="absolute inset-0"
                style={{ ...el.styles, zIndex: el.zIndex } as React.CSSProperties}
              />
            )
          }

          if (el.type === 'watermark') {
            return <WatermarkElement key={el.id} element={el} />
          }

          if (!el.gridArea) return null

          return (
            <GridCell key={el.id} gridArea={el.gridArea} grid={section.grid}>
              <div
                className="p-3 h-full"
                style={{ zIndex: el.zIndex, position: 'relative' } as React.CSSProperties}
              >
                {renderElement(el, doc, totals, currentPage, totalPages)}
              </div>
            </GridCell>
          )
        })}
      </GridLayout>
    </div>
  )
}

interface BodySectionRendererProps {
  section: BodySection
  doc: StoredDocument
  totals: TotalsResult
  currentPage: number
  totalPages: number
  showTotals?: boolean
  showColumnHeader?: boolean
  isFirstPage?: boolean
  itemOffset?: number
  isLastPage?: boolean
  allItems?: LineItem[]
}

// Elements that flow before/with the item table (not gated to last page only)
const PRE_TABLE_TYPES = new Set(['watermark', 'billTo', 'shipTo', 'itemList'])

export function BodySectionRenderer({
  section,
  doc,
  totals,
  currentPage,
  totalPages,
  showTotals = true,
  showColumnHeader = true,
  isFirstPage = true,
  itemOffset = 0,
  isLastPage = true,
  allItems,
}: BodySectionRendererProps) {
  const sorted = [...section.elements].sort((a, b) => a.zIndex - b.zIndex)

  return (
    <div className="relative flex flex-col p-4 overflow-hidden">
      {/* Watermarks — absolute-positioned, render on every page */}
      {sorted.filter((el) => el.type === 'watermark').map((el) => (
        <WatermarkElement key={el.id} element={el} />
      ))}

      {/* Pre-table group: billTo/shipTo (first page), itemList */}
      <div className="flex flex-col gap-4">
        {sorted.map((el) => {
          if (el.type === 'watermark') return null
          if (!PRE_TABLE_TYPES.has(el.type)) return null
          if ((el.type === 'billTo' || el.type === 'shipTo') && !isFirstPage) return null
          if (el.type === 'itemList' && doc.data.items.length === 0 && !isFirstPage) return null
          return (
            <div key={el.id} style={{ zIndex: el.zIndex, position: 'relative' }}>
              {renderElement(el, doc, totals, currentPage, totalPages, showColumnHeader, itemOffset, isLastPage, allItems)}
            </div>
          )
        })}
      </div>

      {/* Post-table group: totalsBlock, notes, terms, etc. — last page only */}
      {showTotals && (
        <div className="flex flex-col gap-4 mt-4">
          {sorted.map((el) => {
            if (PRE_TABLE_TYPES.has(el.type)) return null
            return (
              <div key={el.id} style={{ zIndex: el.zIndex, position: 'relative' }}>
                {renderElement(el, doc, totals, currentPage, totalPages, showColumnHeader, itemOffset, isLastPage, allItems)}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function renderElement(
  el: TemplateElement,
  doc: StoredDocument,
  totals: TotalsResult,
  currentPage: number,
  totalPages: number,
  showColumnHeader = true,
  itemOffset = 0,
  isLastPage = true,
  allItems?: LineItem[],
): React.ReactNode {
  const { data } = doc
  const meta = data.meta

  switch (el.type) {
    case 'logo':
      return <LogoElement element={el} company={data.company} />

    case 'companyDetails':
      return <CompanyDetailsElement element={el} company={data.company} />

    case 'billTo':
      return <BillToElement element={el} client={data.client} />

    case 'shipTo':
      return <ShipToElement element={el} client={data.client} />

    case 'invoiceDetails':
      if (meta.type !== 'invoice') return null
      return <InvoiceDetailsElement element={el} meta={meta} />

    case 'estimateDetails':
      if (meta.type !== 'estimate') return null
      return <EstimateDetailsElement element={el} meta={meta} />

    case 'receiptDetails':
      if (meta.type !== 'receipt') return null
      return <ReceiptDetailsElement element={el} meta={meta} />

    case 'itemList':
      return (
        <ItemListElement
          element={el}
          items={data.items}
          allItems={allItems}
          currency={data.totalsConfig.currency}
          showHeader={showColumnHeader}
          itemOffset={itemOffset}
          isLastPage={isLastPage}
        />
      )

    case 'totalsBlock':
      return (
        <TotalsBlockElement
          element={el}
          totals={totals}
          config={data.totalsConfig}
        />
      )

    case 'notes':
      return <NotesElement element={el} notes={data.notes} />

    case 'termsConditions':
      return <TermsElement element={el} terms={data.terms} />

    case 'pageNumber':
      return (
        <PageNumberElement element={el} current={currentPage} total={totalPages} />
      )

    case 'divider':
      return <DividerElement element={el} />

    case 'textLabel':
      return <TextLabelElement element={el} />

    default:
      return null
  }
}
