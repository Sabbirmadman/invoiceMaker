import { useNavigate } from 'react-router-dom'
import { Plus, FileText, ClipboardList, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { DocumentList } from '@/components/document-list/DocumentList'
import { SummaryBar } from '@/components/document-list/SummaryBar'
import { useAppSelector } from '@/hooks/useAppDispatch'

export default function HomePage() {
  const navigate = useNavigate()
  const documents = useAppSelector((s) => s.documents.documents)

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">Invoice Maker</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/new/estimate')}>
              <ClipboardList className="size-4 mr-2" />
              New Estimate
            </Button>
            <Button variant="outline" onClick={() => navigate('/new/receipt')}>
              <Receipt className="size-4 mr-2" />
              New Receipt
            </Button>
            <Button onClick={() => navigate('/new/invoice')}>
              <Plus className="size-4 mr-2" />
              New Invoice
            </Button>
          </div>
        </div>
      </header>

      {/* Summary bar */}
      <SummaryBar documents={documents} />

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="size-5 text-muted-foreground" />
          <h2 className="text-lg font-medium">Documents</h2>
          <Separator orientation="vertical" className="h-5" />
          <span className="text-sm text-muted-foreground">{documents.length} total</span>
        </div>

        <DocumentList />
      </main>
    </div>
  )
}
