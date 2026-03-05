import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { loadDocuments } from '@/services/storage'
import type { StoredDocument, DocumentData } from '@/types/document'
import type { Template } from '@/types/template'
import type { DocumentType } from '@/types/common'

interface DocumentsState {
  documents: StoredDocument[]
}

function generateId(): string {
  return `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function generateDocNumber(type: DocumentType, existingDocs: StoredDocument[]): string {
  const prefix = type === 'invoice' ? 'INV' : type === 'estimate' ? 'EST' : 'REC'
  const count = existingDocs.filter((d) => d.documentType === type).length + 1
  return `${prefix}-${String(count).padStart(3, '0')}`
}

function createEmptyData(type: DocumentType, docNumber: string): DocumentData {
  const now = new Date().toISOString().split('T')[0]

  const company = {
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    phone: '',
    email: '',
    website: '',
    taxId: '',
    logoUrl: '',
  }

  const client = {
    name: '',
    company: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    phone: '',
    email: '',
    taxId: '',
    shippingAddress: '',
  }

  const defaultTotalsConfig = {
    overallDiscount: 0,
    overallDiscountType: 'flat' as const,
    tax1: { label: 'Tax', rate: 0, enabled: false },
    tax2: { label: 'Tax 2', rate: 0, enabled: false },
    shipping: 0,
    adjustment: 0,
    amountPaid: 0,
    currency: 'USD',
  }

  if (type === 'invoice') {
    return {
      company,
      client,
      meta: {
        type: 'invoice',
        number: docNumber,
        date: now,
        dueDate: now,
        terms: '',
        poNumber: '',
        projectName: '',
        reference: '',
        placeOfSupply: '',
        currency: 'USD',
      },
      items: [],
      totalsConfig: defaultTotalsConfig,
      notes: '',
      terms: '',
    }
  } else if (type === 'estimate') {
    return {
      company,
      client,
      meta: {
        type: 'estimate',
        number: docNumber,
        date: now,
        expiryDate: now,
        reference: '',
        poNumber: '',
        projectName: '',
        currency: 'USD',
      },
      items: [],
      totalsConfig: defaultTotalsConfig,
      notes: '',
      terms: '',
    }
  } else {
    return {
      company,
      client,
      meta: {
        type: 'receipt',
        number: docNumber,
        issueDate: now,
        paymentDate: now,
        paymentMethod: '',
        transactionId: '',
        relatedInvoiceNumber: '',
        currency: 'USD',
      },
      items: [],
      totalsConfig: defaultTotalsConfig,
      notes: '',
      terms: '',
    }
  }
}

const initialState: DocumentsState = {
  documents: loadDocuments(),
}

const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    createDocument(
      state,
      action: PayloadAction<{ template: Template; type: DocumentType; id?: string }>,
    ) {
      const { template, type } = action.payload
      const id = action.payload.id ?? generateId()
      const docNumber = generateDocNumber(type, state.documents)
      const now = new Date().toISOString()
      const doc: StoredDocument = {
        id,
        createdAt: now,
        updatedAt: now,
        documentType: type,
        templateSnapshot: structuredClone(template),
        data: createEmptyData(type, docNumber),
      }
      state.documents.unshift(doc)
    },

    updateDocument(
      state,
      action: PayloadAction<{ id: string; data: Partial<DocumentData> }>,
    ) {
      const doc = state.documents.find((d) => d.id === action.payload.id)
      if (doc) {
        Object.assign(doc.data, action.payload.data)
        doc.updatedAt = new Date().toISOString()
      }
    },

    duplicateDocument(state, action: PayloadAction<string>) {
      const original = state.documents.find((d) => d.id === action.payload)
      if (!original) return
      const newId = generateId()
      const docNumber = generateDocNumber(original.documentType, state.documents)
      const now = new Date().toISOString()
      const copy: StoredDocument = {
        ...structuredClone(original),
        id: newId,
        createdAt: now,
        updatedAt: now,
      }
      // Update the doc number in the copy
      if (copy.data.meta.type === 'invoice') copy.data.meta.number = docNumber
      else if (copy.data.meta.type === 'estimate') copy.data.meta.number = docNumber
      else if (copy.data.meta.type === 'receipt') copy.data.meta.number = docNumber
      state.documents.unshift(copy)
    },

    deleteDocument(state, action: PayloadAction<string>) {
      state.documents = state.documents.filter((d) => d.id !== action.payload)
    },

    updateItemListConfig(
      state,
      action: PayloadAction<{ id: string; config: Record<string, unknown> }>,
    ) {
      const doc = state.documents.find((d) => d.id === action.payload.id)
      if (!doc) return
      const itemListEl = doc.templateSnapshot.body.elements.find((el) => el.type === 'itemList')
      if (!itemListEl) return
      itemListEl.config = { ...itemListEl.config, ...action.payload.config }
      doc.updatedAt = new Date().toISOString()
    },
  },
})

export const { createDocument, updateDocument, duplicateDocument, deleteDocument, updateItemListConfig } =
  documentsSlice.actions

export default documentsSlice.reducer
