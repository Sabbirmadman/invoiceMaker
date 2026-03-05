import type { StoredDocument } from '@/types/document'

const DOCUMENTS_KEY = 'invoice_maker_documents'

export function loadDocuments(): StoredDocument[] {
  try {
    const raw = localStorage.getItem(DOCUMENTS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as StoredDocument[]
  } catch {
    return []
  }
}

export function saveDocuments(documents: StoredDocument[]): void {
  localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(documents))
}
