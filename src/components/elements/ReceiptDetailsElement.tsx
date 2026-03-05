import type { TemplateElement } from '@/types/template'
import type { ReceiptMeta } from '@/types/document'

interface Props {
  element: TemplateElement
  meta: ReceiptMeta
}

const LABEL_STYLE = 'text-muted-foreground text-xs uppercase tracking-wide'
const VALUE_STYLE = 'font-medium text-sm'

export function ReceiptDetailsElement({ element, meta }: Props) {
  return (
    <div className="flex flex-col gap-1" style={element.styles as React.CSSProperties}>
      <div className="text-2xl font-bold uppercase tracking-wide mb-2">RECEIPT</div>
      <div className="flex flex-col gap-1">
        <div>
          <span className={LABEL_STYLE}>Receipt #</span>
          <div className={VALUE_STYLE}>{meta.number || '—'}</div>
        </div>
        <div>
          <span className={LABEL_STYLE}>Issue Date</span>
          <div className={VALUE_STYLE}>{meta.issueDate || '—'}</div>
        </div>
        {meta.paymentMethod && (
          <div>
            <span className={LABEL_STYLE}>Payment Method</span>
            <div className={VALUE_STYLE}>{meta.paymentMethod}</div>
          </div>
        )}
        {meta.relatedInvoiceNumber && (
          <div>
            <span className={LABEL_STYLE}>Invoice #</span>
            <div className={VALUE_STYLE}>{meta.relatedInvoiceNumber}</div>
          </div>
        )}
      </div>
    </div>
  )
}
