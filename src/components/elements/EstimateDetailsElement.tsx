import type { TemplateElement } from '@/types/template'
import type { EstimateMeta } from '@/types/document'

interface Props {
  element: TemplateElement
  meta: EstimateMeta
}

const LABEL_STYLE = 'text-muted-foreground text-xs uppercase tracking-wide'
const VALUE_STYLE = 'font-medium text-sm'

export function EstimateDetailsElement({ element, meta }: Props) {
  return (
    <div className="flex flex-col gap-1" style={element.styles as React.CSSProperties}>
      <div className="text-2xl font-bold uppercase tracking-wide mb-2">ESTIMATE</div>
      <div className="flex flex-col gap-1">
        <div>
          <span className={LABEL_STYLE}>Estimate #</span>
          <div className={VALUE_STYLE}>{meta.number || '—'}</div>
        </div>
        <div>
          <span className={LABEL_STYLE}>Date</span>
          <div className={VALUE_STYLE}>{meta.date || '—'}</div>
        </div>
        {meta.expiryDate && (
          <div>
            <span className={LABEL_STYLE}>Expiry Date</span>
            <div className={VALUE_STYLE}>{meta.expiryDate}</div>
          </div>
        )}
        {meta.reference && (
          <div>
            <span className={LABEL_STYLE}>Reference</span>
            <div className={VALUE_STYLE}>{meta.reference}</div>
          </div>
        )}
      </div>
    </div>
  )
}
