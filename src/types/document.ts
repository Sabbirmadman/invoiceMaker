import type { DocumentType } from './common'
import type { Template } from './template'

export interface CompanyData {
  name: string
  address: string
  city: string
  state: string
  zip: string
  country: string
  phone: string
  email: string
  website: string
  taxId: string
  logoUrl: string
}

export interface ClientData {
  name: string
  company: string
  address: string
  city: string
  state: string
  zip: string
  country: string
  phone: string
  email: string
  taxId: string
  shippingAddress: string
}

export interface InvoiceMeta {
  type: 'invoice'
  number: string
  date: string
  dueDate: string
  terms: string
  poNumber: string
  projectName: string
  reference: string
  placeOfSupply: string
  currency: string
}

export interface EstimateMeta {
  type: 'estimate'
  number: string
  date: string
  expiryDate: string
  reference: string
  poNumber: string
  projectName: string
  currency: string
}

export interface ReceiptMeta {
  type: 'receipt'
  number: string
  issueDate: string
  paymentDate: string
  paymentMethod: string
  transactionId: string
  relatedInvoiceNumber: string
  currency: string
}

export type DocumentMeta = InvoiceMeta | EstimateMeta | ReceiptMeta

export interface LineItem {
  id: string
  name: string
  description: string
  qty: number
  unit: string
  rate: number
  discount: number
  discountType: 'flat' | 'percent'
  taxRate: number     // percent e.g. 10 = 10%
  amount: number      // computed
}

export interface TotalsConfig {
  overallDiscount: number
  overallDiscountType: 'flat' | 'percent'
  tax1: { label: string; rate: number; enabled: boolean }
  tax2: { label: string; rate: number; enabled: boolean }
  shipping: number
  adjustment: number
  amountPaid: number
  currency: string
}

export interface TotalsResult {
  subTotal: number
  itemDiscountTotal: number
  overallDiscount: number
  tax1Amount: number
  tax2Amount: number
  shipping: number
  adjustment: number
  total: number
  amountPaid: number
  balanceDue: number
}

export interface DocumentData {
  company: CompanyData
  client: ClientData
  meta: DocumentMeta
  items: LineItem[]
  totalsConfig: TotalsConfig
  notes: string
  terms: string
}

export interface StoredDocument {
  id: string
  createdAt: string
  updatedAt: string
  documentType: DocumentType
  templateSnapshot: Template
  data: DocumentData
}
