import type { StoredDocument } from '@/types/document'
import { formatCurrency } from '@/services/calculations'

interface Props {
  documents: StoredDocument[]
}

export function SummaryBar({ documents }: Props) {
  const totalAmount = documents.reduce((sum, doc) => {
    const totalsConfig = doc.data.totalsConfig
    const items = doc.data.items
    const subTotal = items.reduce((s, item) => s + item.amount, 0)
    // simplified total for display
    const tax1 = totalsConfig.tax1.enabled ? subTotal * (totalsConfig.tax1.rate / 100) : 0
    const tax2 = totalsConfig.tax2.enabled ? subTotal * (totalsConfig.tax2.rate / 100) : 0
    return sum + subTotal + tax1 + tax2 + totalsConfig.shipping + totalsConfig.adjustment
  }, 0)

  return (
    <div className="flex items-center gap-6 px-4 py-2 bg-muted/50 border-b text-sm text-muted-foreground">
      <span>
        Total Documents: <strong className="text-foreground">{documents.length}</strong>
      </span>
      <span className="text-border">|</span>
      <span>
        Total Amount:{' '}
        <strong className="text-foreground">{formatCurrency(totalAmount)}</strong>
      </span>
    </div>
  )
}
