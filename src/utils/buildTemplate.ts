import type { Template, TemplateElement, Section, BodySection } from '@/types/template'
import type { DocumentType, PageSize } from '@/types/common'

export type HeaderElementSlot = 'logo' | 'companyDetails' | 'textLabel' | 'detailsBlock' | 'empty'
export type FooterElementSlot = 'notes' | 'termsConditions' | 'pageNumber' | 'empty'

export interface ColumnConfig {
  width: string // e.g. "50%"
  element: HeaderElementSlot | FooterElementSlot
  textLabelText?: string // only when element === 'textLabel'
}

export interface WizardState {
  // Step 1: Basics
  name: string
  documentType: DocumentType
  pageSize: PageSize

  // Step 2: Theme
  primaryColor: string
  accentColor: string
  fontFamily: string

  // Step 3: Header
  headerHeight: number
  headerBackground: string
  headerBackgroundImage: string       // DataURL or empty
  headerBackgroundSize: 'cover' | 'contain' | 'repeat'
  headerColumns: ColumnConfig[]
  logoFit: 'contain' | 'cover' | 'fill'
  logoMaxHeight: string               // e.g. '80px' or '100%'

  // Step 4: Body elements
  showBillTo: boolean
  showShipTo: boolean
  showDetailsBlock: boolean // invoiceDetails / estimateDetails / receiptDetails
  itemColumns: string[]    // e.g. ['name','qty','rate','amount']
  itemHeaderBackground: string
  itemHeaderColor: string
  itemAlternateRowColor: string
  totalsShow: string[]     // e.g. ['subTotal','tax1','total','balanceDue']
  showNotes: boolean
  showTerms: boolean

  // Body background
  bodyBackgroundColor: string
  bodyBackgroundImage: string         // DataURL or empty
  bodyBackgroundSize: 'cover' | 'contain' | 'repeat'

  // Footer
  footerHeight: number
  footerBackground: string
  footerBackgroundImage: string       // DataURL or empty
  footerBackgroundSize: 'cover' | 'contain' | 'repeat'
  footerBorderColor: string
  footerColumns: ColumnConfig[]
}

export function defaultWizardState(): WizardState {
  return {
    name: 'My Template',
    documentType: 'invoice',
    pageSize: 'A4',
    primaryColor: '#111111',
    accentColor: '#2563eb',
    fontFamily: 'system-ui, sans-serif',
    headerHeight: 140,
    headerBackground: '#ffffff',
    headerBackgroundImage: '',
    headerBackgroundSize: 'cover',
    headerColumns: [
      { width: '50%', element: 'companyDetails' },
      { width: '50%', element: 'detailsBlock' },
    ],
    logoFit: 'contain',
    logoMaxHeight: '80px',
    showBillTo: true,
    showShipTo: false,
    showDetailsBlock: false, // already in header by default
    itemColumns: ['name', 'qty', 'rate', 'amount'],
    itemHeaderBackground: '#111111',
    itemHeaderColor: '#ffffff',
    itemAlternateRowColor: '#f9fafb',
    totalsShow: ['subTotal', 'tax1', 'total', 'balanceDue'],
    showNotes: true,
    showTerms: true,
    bodyBackgroundColor: '',
    bodyBackgroundImage: '',
    bodyBackgroundSize: 'cover',
    footerHeight: 80,
    footerBackground: '#f9fafb',
    footerBackgroundImage: '',
    footerBackgroundSize: 'cover',
    footerBorderColor: '#e5e7eb',
    footerColumns: [
      { width: '70%', element: 'notes' },
      { width: '30%', element: 'pageNumber' },
    ],
  }
}

// ──────────────────────────────────────────────────────────────────────
// Internal helpers
// ──────────────────────────────────────────────────────────────────────

let _id = 0
function uid(prefix: string) {
  return `${prefix}_${++_id}_${Date.now()}`
}

function detailsElement(docType: DocumentType, colId: string, rowId: string): TemplateElement {
  if (docType === 'invoice') {
    return {
      id: uid('el_inv_details'),
      type: 'invoiceDetails',
      zIndex: 3,
      gridArea: { col: colId, row: rowId },
      bindings: {
        number: '{{invoice.number}}',
        date: '{{invoice.date}}',
        dueDate: '{{invoice.dueDate}}',
        terms: '{{invoice.terms}}',
        poNumber: '{{invoice.poNumber}}',
      },
    }
  }
  if (docType === 'estimate') {
    return {
      id: uid('el_est_details'),
      type: 'estimateDetails',
      zIndex: 3,
      gridArea: { col: colId, row: rowId },
      bindings: {
        number: '{{estimate.number}}',
        date: '{{estimate.date}}',
        expiryDate: '{{estimate.expiryDate}}',
        reference: '{{estimate.reference}}',
      },
    }
  }
  return {
    id: uid('el_rec_details'),
    type: 'receiptDetails',
    zIndex: 3,
    gridArea: { col: colId, row: rowId },
    bindings: {
      number: '{{receipt.number}}',
      issueDate: '{{receipt.issueDate}}',
      paymentMethod: '{{receipt.paymentMethod}}',
      relatedInvoiceNumber: '{{receipt.relatedInvoiceNumber}}',
    },
  }
}

function headerSlotElement(
  slot: HeaderElementSlot,
  colId: string,
  rowId: string,
  docType: DocumentType,
  textLabelText?: string,
  logoFit?: string,
  logoMaxHeight?: string,
): TemplateElement | null {
  switch (slot) {
    case 'logo':
      return {
        id: uid('el_logo'),
        type: 'logo',
        zIndex: 5,
        gridArea: { col: colId, row: rowId },
        styles: {
          maxHeight: logoMaxHeight ?? '80px',
          objectFit: logoFit ?? 'contain',
          ...(logoFit === 'fill' ? { width: '100%', height: '100%' } : {}),
        },
      }
    case 'companyDetails':
      return {
        id: uid('el_company'),
        type: 'companyDetails',
        zIndex: 3,
        gridArea: { col: colId, row: rowId },
        bindings: {
          name: '{{company.name}}',
          address: '{{company.address}}',
          phone: '{{company.phone}}',
          email: '{{company.email}}',
          website: '{{company.website}}',
          taxId: '{{company.taxId}}',
        },
      }
    case 'textLabel':
      return {
        id: uid('el_label'),
        type: 'textLabel',
        zIndex: 3,
        gridArea: { col: colId, row: rowId },
        config: { text: textLabelText ?? 'INVOICE' },
        styles: { fontSize: '28px', fontWeight: 'bold', letterSpacing: '2px' },
      }
    case 'detailsBlock':
      return detailsElement(docType, colId, rowId)
    case 'empty':
      return null
  }
}

function footerSlotElement(
  slot: FooterElementSlot,
  colId: string,
  rowId: string,
): TemplateElement | null {
  switch (slot) {
    case 'notes':
      return {
        id: uid('el_notes'),
        type: 'notes',
        zIndex: 2,
        gridArea: { col: colId, row: rowId },
        bindings: { text: '{{document.notes}}' },
      }
    case 'termsConditions':
      return {
        id: uid('el_terms'),
        type: 'termsConditions',
        zIndex: 2,
        gridArea: { col: colId, row: rowId },
        bindings: { text: '{{document.terms}}' },
      }
    case 'pageNumber':
      return {
        id: uid('el_page_num'),
        type: 'pageNumber',
        zIndex: 2,
        gridArea: { col: colId, row: rowId },
        config: { format: 'Page {{page.current}} of {{page.total}}' },
        styles: { textAlign: 'right' },
      }
    case 'empty':
      return null
  }
}

// ──────────────────────────────────────────────────────────────────────
// Main builder
// ──────────────────────────────────────────────────────────────────────

export function buildTemplateFromWizard(state: WizardState, templateId?: string): Template {
  const id = templateId ?? `tmpl_custom_${Date.now()}`

  // ── Header ──────────────────────────────────────────────────────────
  const headerColIds = state.headerColumns.map((_, i) => `col_h${i + 1}`)
  const headerRowId = 'row_h1'

  const headerBgStyles: Record<string, string> = {
    backgroundColor: state.headerBackground,
  }
  if (state.headerBackgroundImage) {
    headerBgStyles.backgroundImage = `url('${state.headerBackgroundImage}')`
    headerBgStyles.backgroundSize = state.headerBackgroundSize
    headerBgStyles.backgroundPosition = 'center'
    headerBgStyles.backgroundRepeat = state.headerBackgroundSize === 'repeat' ? 'repeat' : 'no-repeat'
  }

  const headerElements: TemplateElement[] = [
    {
      id: uid('el_hdr_bg'),
      type: 'background',
      zIndex: 1,
      styles: headerBgStyles,
    },
  ]
  state.headerColumns.forEach((col, i) => {
    const el = headerSlotElement(
      col.element as HeaderElementSlot,
      headerColIds[i],
      headerRowId,
      state.documentType,
      col.textLabelText,
      state.logoFit,
      state.logoMaxHeight,
    )
    if (el) headerElements.push(el)
  })

  const header: Section = {
    height: state.headerHeight,
    visible: true,
    grid: {
      columns: state.headerColumns.map((col, i) => ({ id: headerColIds[i], width: col.width })),
      rows: [{ id: headerRowId, height: 'auto' }],
    },
    elements: headerElements,
  }

  // ── Body ─────────────────────────────────────────────────────────────
  const bodyElements: TemplateElement[] = []

  if (state.showBillTo) {
    bodyElements.push({
      id: uid('el_bill_to'),
      type: 'billTo',
      placement: 'first-page',
      zIndex: 3,
      bindings: {
        name: '{{client.name}}',
        company: '{{client.company}}',
        address: '{{client.address}}',
        city: '{{client.city}}',
        state: '{{client.state}}',
        zip: '{{client.zip}}',
        country: '{{client.country}}',
        phone: '{{client.phone}}',
        email: '{{client.email}}',
      },
    })
  }

  if (state.showShipTo) {
    bodyElements.push({
      id: uid('el_ship_to'),
      type: 'shipTo',
      placement: 'first-page',
      zIndex: 3,
      bindings: { shippingAddress: '{{client.shippingAddress}}' },
    })
  }

  if (state.showDetailsBlock) {
    // details block in body (not header)
    const el = detailsElement(state.documentType, 'col_body', 'row_body')
    bodyElements.push({ ...el, placement: 'first-page', gridArea: undefined })
  }

  bodyElements.push({
    id: uid('el_items'),
    type: 'itemList',
    placement: 'all-pages',
    zIndex: 3,
    config: {
      columns: state.itemColumns,
      columnHeaderRepeat: true,
    },
    styles: {
      headerBackground: state.itemHeaderBackground,
      headerColor: state.itemHeaderColor,
      alternateRowColor: state.itemAlternateRowColor,
    },
  })

  bodyElements.push({
    id: uid('el_totals'),
    type: 'totalsBlock',
    placement: 'last-page',
    zIndex: 3,
    config: { show: state.totalsShow },
  })

  if (state.showNotes) {
    bodyElements.push({
      id: uid('el_notes_body'),
      type: 'notes',
      placement: 'last-page',
      zIndex: 3,
      bindings: { text: '{{document.notes}}' },
    })
  }

  if (state.showTerms) {
    bodyElements.push({
      id: uid('el_terms_body'),
      type: 'termsConditions',
      placement: 'last-page',
      zIndex: 3,
      bindings: { text: '{{document.terms}}' },
    })
  }

  const body: BodySection = { elements: bodyElements }

  // ── Footer ────────────────────────────────────────────────────────────
  const footerColIds = state.footerColumns.map((_, i) => `col_f${i + 1}`)
  const footerRowId = 'row_f1'

  const footerBgStyles: Record<string, string> = {
    backgroundColor: state.footerBackground,
    borderTop: `1px solid ${state.footerBorderColor}`,
  }
  if (state.footerBackgroundImage) {
    footerBgStyles.backgroundImage = `url('${state.footerBackgroundImage}')`
    footerBgStyles.backgroundSize = state.footerBackgroundSize
    footerBgStyles.backgroundPosition = 'center'
    footerBgStyles.backgroundRepeat = state.footerBackgroundSize === 'repeat' ? 'repeat' : 'no-repeat'
  }

  const footerElements: TemplateElement[] = [
    {
      id: uid('el_ftr_bg'),
      type: 'background',
      zIndex: 1,
      styles: footerBgStyles,
    },
  ]
  state.footerColumns.forEach((col, i) => {
    const el = footerSlotElement(
      col.element as FooterElementSlot,
      footerColIds[i],
      footerRowId,
    )
    if (el) footerElements.push(el)
  })

  const footer: Section = {
    height: state.footerHeight,
    visible: true,
    grid: {
      columns: state.footerColumns.map((col, i) => ({ id: footerColIds[i], width: col.width })),
      rows: [{ id: footerRowId, height: 'auto' }],
    },
    elements: footerElements,
  }

  return {
    id,
    name: state.name,
    documentType: state.documentType,
    pageSize: state.pageSize,
    orientation: 'portrait',
    theme: {
      fontFamily: state.fontFamily,
      primaryColor: state.primaryColor,
      accentColor: state.accentColor,
      ...(state.bodyBackgroundColor || state.bodyBackgroundImage ? {
        bodyBackground: {
          color: state.bodyBackgroundColor || undefined,
          imageUrl: state.bodyBackgroundImage || undefined,
          imageSize: state.bodyBackgroundSize,
        },
      } : {}),
    },
    header,
    body,
    footer,
  }
}
