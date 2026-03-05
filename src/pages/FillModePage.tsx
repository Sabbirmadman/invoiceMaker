import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, CheckCircle, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { downloadPdf } from '@/services/pdfExport'
import { PageCanvas } from '@/components/canvas/PageCanvas'
import { useAppSelector, useAppDispatch } from '@/hooks/useAppDispatch'
import { updateDocument } from '@/store/slices/documentsSlice'
import { FillModeProvider } from '@/components/fill-mode/FillModeContext'
import type { CompanyData, ClientData, InvoiceMeta, EstimateMeta, ReceiptMeta, LineItem, TotalsConfig, DocumentData } from '@/types/document'

export default function FillModePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const doc = useAppSelector((s) => s.documents.documents.find((d) => d.id === id))

  if (!doc || !id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">Document not found.</p>
        <Button variant="outline" onClick={() => navigate('/')}>
          <ArrowLeft className="size-4 mr-2" />
          Back to Documents
        </Button>
      </div>
    )
  }

  function patch(data: Partial<DocumentData>) {
    dispatch(updateDocument({ id: id!, data }))
  }

  const fillModeCtx = {
    fillMode: true,
    docId: id,
    onUpdateCompany: (p: Partial<CompanyData>) => patch({ company: { ...doc!.data.company, ...p } }),
    onUpdateClient: (p: Partial<ClientData>) => patch({ client: { ...doc!.data.client, ...p } }),
    onUpdateInvoiceMeta: (p: Partial<InvoiceMeta>) =>
      doc!.data.meta.type === 'invoice'
        ? patch({ meta: { ...doc!.data.meta, ...p } })
        : undefined,
    onUpdateEstimateMeta: (p: Partial<EstimateMeta>) =>
      doc!.data.meta.type === 'estimate'
        ? patch({ meta: { ...doc!.data.meta, ...p } })
        : undefined,
    onUpdateReceiptMeta: (p: Partial<ReceiptMeta>) =>
      doc!.data.meta.type === 'receipt'
        ? patch({ meta: { ...doc!.data.meta, ...p } })
        : undefined,
    onUpdateItems: (items: LineItem[]) => patch({ items }),
    onUpdateTotalsConfig: (p: Partial<TotalsConfig>) =>
      patch({ totalsConfig: { ...doc!.data.totalsConfig, ...p } }),
    onUpdateNotes: (notes: string) => patch({ notes }),
    onUpdateTerms: (terms: string) => patch({ terms }),
    onUpdateData: patch,
  }

  return (
    <FillModeProvider value={fillModeCtx}>
      <div className="min-h-screen bg-muted/20 flex flex-col">
        {/* Toolbar */}
        <header className="border-b bg-card sticky top-0 z-10">
          <div className="px-4 py-2 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="size-4" />
            </Button>
            <span className="font-medium text-sm">{doc.data.meta.number}</span>
            <span className="text-xs text-muted-foreground capitalize bg-muted px-2 py-0.5 rounded">
              {doc.documentType}
            </span>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle className="size-3" />
                Auto-saved
              </span>
              <Button variant="outline" size="sm" onClick={() => downloadPdf(doc!)}>
                <Download className="size-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate(`/preview/${id}`)}>
                <Eye className="size-4 mr-2" />
                Preview
              </Button>
            </div>
          </div>
        </header>

        {/* Canvas */}
        <div className="flex-1 overflow-auto">
          <PageCanvas doc={doc} zoom={0.9} />
        </div>
      </div>
    </FillModeProvider>
  )
}
