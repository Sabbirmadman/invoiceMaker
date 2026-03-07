import type { StoredDocument } from '@/types/document'
import type { Template } from '@/types/template'

const DOCUMENTS_KEY = 'invoice_maker_documents'
const CUSTOM_TEMPLATES_KEY = 'invoice_maker_custom_templates'

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

export function loadCustomTemplates(): Template[] {
  try {
    const raw = localStorage.getItem(CUSTOM_TEMPLATES_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Template[]
  } catch {
    return []
  }
}

export function saveCustomTemplates(templates: Template[]): void {
  localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(templates))
}
