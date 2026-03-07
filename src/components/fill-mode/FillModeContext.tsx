import { createContext, useContext } from 'react'
import type { DocumentData, CompanyData, ClientData, InvoiceMeta, EstimateMeta, ReceiptMeta, LineItem, TotalsConfig } from '@/types/document'

interface FillModeContextValue {
  fillMode: boolean
  showBounds: boolean
  docId: string
  onUpdateCompany: (patch: Partial<CompanyData>) => void
  onUpdateClient: (patch: Partial<ClientData>) => void
  onUpdateInvoiceMeta: (patch: Partial<InvoiceMeta>) => void
  onUpdateEstimateMeta: (patch: Partial<EstimateMeta>) => void
  onUpdateReceiptMeta: (patch: Partial<ReceiptMeta>) => void
  onUpdateItems: (items: LineItem[]) => void
  onUpdateTotalsConfig: (patch: Partial<TotalsConfig>) => void
  onUpdateNotes: (notes: string) => void
  onUpdateTerms: (terms: string) => void
  onUpdateData: (patch: Partial<DocumentData>) => void
}

const FillModeContext = createContext<FillModeContextValue>({
  fillMode: false,
  showBounds: false,
  docId: '',
  onUpdateCompany: () => {},
  onUpdateClient: () => {},
  onUpdateInvoiceMeta: () => {},
  onUpdateEstimateMeta: () => {},
  onUpdateReceiptMeta: () => {},
  onUpdateItems: () => {},
  onUpdateTotalsConfig: () => {},
  onUpdateNotes: () => {},
  onUpdateTerms: () => {},
  onUpdateData: () => {},
})

export const FillModeProvider = FillModeContext.Provider
export const useFillMode = () => useContext(FillModeContext)
