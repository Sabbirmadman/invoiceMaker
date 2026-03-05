import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Printer, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { downloadPdf } from '@/services/pdfExport'
import { PageCanvas } from '@/components/canvas/PageCanvas'
import { FillModeProvider } from '@/components/fill-mode/FillModeContext'
import { useAppSelector } from '@/hooks/useAppDispatch'
import type { CompanyData, ClientData, InvoiceMeta, EstimateMeta, ReceiptMeta, LineItem, TotalsConfig, DocumentData } from '@/types/document'

// Preview mode uses a no-op FillModeContext (fillMode=false)
const previewCtx = {
  fillMode: false,
  docId: '',
  onUpdateCompany: (_p: Partial<CompanyData>) => {},
  onUpdateClient: (_p: Partial<ClientData>) => {},
  onUpdateInvoiceMeta: (_p: Partial<InvoiceMeta>) => {},
  onUpdateEstimateMeta: (_p: Partial<EstimateMeta>) => {},
  onUpdateReceiptMeta: (_p: Partial<ReceiptMeta>) => {},
  onUpdateItems: (_items: LineItem[]) => {},
  onUpdateTotalsConfig: (_p: Partial<TotalsConfig>) => {},
  onUpdateNotes: (_n: string) => {},
  onUpdateTerms: (_t: string) => {},
  onUpdateData: (_p: Partial<DocumentData>) => {},
}

export default function PreviewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const doc = useAppSelector((s) => s.documents.documents.find((d) => d.id === id))

  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">Document not found.</p>
        <Button variant="outline" onClick={() => navigate('/')}>Back to Documents</Button>
      </div>
    )
  }

  return (
    <FillModeProvider value={previewCtx}>
      <div className="min-h-screen bg-muted/20 flex flex-col">
        <header className="border-b bg-card sticky top-0 z-10 print:hidden">
          <div className="px-4 py-2 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/document/${id}`)}>
              <ArrowLeft className="size-4" />
            </Button>
            <span className="font-medium text-sm">{doc.data.meta.number}</span>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => downloadPdf(doc)}>
                <Download className="size-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="size-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto print:overflow-visible print:p-0">
          <PageCanvas doc={doc} zoom={0.9} />
        </div>
      </div>
    </FillModeProvider>
  )
}
