import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppSelector, useAppDispatch } from '@/hooks/useAppDispatch'
import { createDocument } from '@/store/slices/documentsSlice'
import type { DocumentType } from '@/types/common'

export default function NewDocumentPage() {
  const { type } = useParams<{ type: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const allTemplates = useAppSelector((s) => s.templates.templates)

  const docType = type as DocumentType
  const templates = allTemplates.filter((t) => t.documentType === docType)

  function handlePick(templateId: string) {
    const template = allTemplates.find((t) => t.id === templateId)
    if (!template) return
    const newId = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    dispatch(createDocument({ template, type: docType, id: newId }))
    navigate(`/document/${newId}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold capitalize">New {docType}</h1>
            <p className="text-sm text-muted-foreground">Choose a template to get started</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {templates.length === 0 ? (
          <p className="text-muted-foreground">No templates available for this document type yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((t) => (
              <Card
                key={t.id}
                className="cursor-pointer hover:ring-2 hover:ring-primary transition-shadow"
                onClick={() => handlePick(t.id)}
              >
                <CardHeader>
                  <div className="aspect-[3/4] bg-muted rounded-md mb-3 flex items-center justify-center text-muted-foreground text-xs">
                    {t.name}
                  </div>
                  <CardTitle className="text-base">{t.name}</CardTitle>
                  <CardDescription className="capitalize">{t.documentType}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
