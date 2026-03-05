import type { DocumentType, PageSize, Orientation } from './common'

export type ElementType =
  | 'background'
  | 'watermark'
  | 'logo'
  | 'companyDetails'
  | 'billTo'
  | 'shipTo'
  | 'invoiceDetails'
  | 'estimateDetails'
  | 'receiptDetails'
  | 'itemList'
  | 'totalsBlock'
  | 'notes'
  | 'termsConditions'
  | 'pageNumber'
  | 'divider'
  | 'textLabel'
  | 'signature'

export interface GridColumn {
  id: string
  width: string   // e.g. "30%", "1fr", "200px"
}

export interface GridRow {
  id: string
  height: string  // e.g. "auto", "100px"
}

export interface Grid {
  columns: GridColumn[]
  rows: GridRow[]
}

export interface GridArea {
  col: string      // column id
  row: string      // row id
  colSpan?: number
  rowSpan?: number
}

export interface Theme {
  fontFamily: string
  primaryColor: string
  accentColor: string
  secondaryColor?: string
}

export interface TemplateElement {
  id: string
  type: ElementType
  zIndex: number
  gridArea?: GridArea
  bindings?: Record<string, string>     // { fieldName: '{{token}}' }
  config?: Record<string, unknown>
  styles?: Record<string, string>
}

export interface Section {
  height: number
  visible: boolean
  grid: Grid
  elements: TemplateElement[]
}

export interface BodySection {
  // Body has no fixed height — it drives pagination
  elements: TemplateElement[]
}

export interface Template {
  id: string
  name: string
  documentType: DocumentType
  pageSize: PageSize
  orientation: Orientation
  theme: Theme
  header: Section
  body: BodySection
  footer: Section
}
