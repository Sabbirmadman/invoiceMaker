import { useNavigate } from 'react-router-dom'
import { Plus, ClipboardList, Receipt, LayoutTemplate } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DocumentList } from '@/components/document-list/DocumentList'
import { useAppSelector } from '@/hooks/useAppDispatch'
import { formatCurrency } from '@/services/calculations'

export default function HomePage() {
  const navigate = useNavigate()
  const documents = useAppSelector((s) => s.documents.documents)

  const totalAmount = documents.reduce((sum, doc) => {
    const { items, totalsConfig } = doc.data
    const sub = items.reduce((s, item) => s + item.amount, 0)
    const tax1 = totalsConfig.tax1.enabled ? sub * (totalsConfig.tax1.rate / 100) : 0
    const tax2 = totalsConfig.tax2.enabled ? sub * (totalsConfig.tax2.rate / 100) : 0
    return sum + sub + tax1 + tax2 + totalsConfig.shipping + totalsConfig.adjustment
  }, 0)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between">
          <span className="text-sm font-semibold">InvoiceMaker</span>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="sm" onClick={() => navigate('/template-editor')}>
              <LayoutTemplate className="size-4 mr-1.5" />
              Templates
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/new/estimate')}>
              <ClipboardList className="size-4 mr-1.5" />
              Estimate
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/new/receipt')}>
              <Receipt className="size-4 mr-1.5" />
              Receipt
            </Button>
            <Button size="sm" onClick={() => navigate('/new/invoice')}>
              <Plus className="size-4 mr-1.5" />
              New Invoice
            </Button>
          </div>
        </div>
      </header>

      <div className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-2 flex items-center gap-3 text-sm text-muted-foreground">
          <span>{documents.length} document{documents.length !== 1 ? 's' : ''}</span>
          <span>·</span>
          <span>Total: <span className="text-foreground font-medium">{formatCurrency(totalAmount)}</span></span>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-6">
        <DocumentList />
      </main>
    </div>
  )
}
