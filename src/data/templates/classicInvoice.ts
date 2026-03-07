import type { Template } from '@/types/template'

export const classicInvoice: Template = {
  id: 'tmpl_classic_invoice',
  name: 'Classic Invoice',
  documentType: 'invoice',
  pageSize: 'A4',
  orientation: 'portrait',
  theme: {
    fontFamily: 'system-ui, sans-serif',
    primaryColor: '#111111',
    accentColor: '#2563eb',
  },
  header: {
    height: 180,
    visible: true,
    grid: {
      columns: [
        { id: 'col_left', width: '40%' },
        { id: 'col_right', width: '60%' },
      ],
      rows: [{ id: 'row_1', height: 'auto' }],
    },
    elements: [
      {
        id: 'el_header_bg',
        type: 'background',
        zIndex: 1,
        styles: { backgroundColor: '#ffffff' },
      },
      {
        id: 'el_logo',
        type: 'logo',
        zIndex: 5,
        gridArea: { col: 'col_left', row: 'row_1' },
        styles: { maxHeight: '80px' },
      },
      {
        id: 'el_company',
        type: 'companyDetails',
        zIndex: 3,
        gridArea: { col: 'col_left', row: 'row_1' },
        bindings: {
          name: '{{company.name}}',
          address: '{{company.address}}',
          phone: '{{company.phone}}',
          email: '{{company.email}}',
          website: '{{company.website}}',
          taxId: '{{company.taxId}}',
        },
        styles: { marginTop: '90px' },
      },
      {
        id: 'el_invoice_details',
        type: 'invoiceDetails',
        zIndex: 3,
        gridArea: { col: 'col_right', row: 'row_1' },
        bindings: {
          number: '{{invoice.number}}',
          date: '{{invoice.date}}',
          dueDate: '{{invoice.dueDate}}',
          terms: '{{invoice.terms}}',
          poNumber: '{{invoice.poNumber}}',
        },
        styles: { textAlign: 'right' },
      },
    ],
  },
  body: {
    elements: [
      {
        id: 'el_bill_to',
        type: 'billTo',
        placement: 'first-page',
        zIndex: 3,
        bindings: {
          name: '{{client.name}}',
          company: '{{client.company}}',
          address: '{{client.address}}',
          phone: '{{client.phone}}',
          email: '{{client.email}}',
        },
      },
      {
        id: 'el_items',
        type: 'itemList',
        placement: 'all-pages',
        zIndex: 3,
        config: {
          columns: ['name', 'description', 'qty', 'rate', 'tax', 'amount'],
          columnHeaderRepeat: true,
        },
        styles: {
          headerBackground: '#111111',
          headerColor: '#ffffff',
          alternateRowColor: '#f9fafb',
        },
      },
      {
        id: 'el_totals',
        type: 'totalsBlock',
        placement: 'last-page',
        zIndex: 3,
        config: {
          show: ['subTotal', 'discount', 'tax1', 'total', 'balanceDue'],
        },
      },
    ],
  },
  footer: {
    height: 100,
    visible: true,
    grid: {
      columns: [
        { id: 'col_left', width: '60%' },
        { id: 'col_right', width: '40%' },
      ],
      rows: [{ id: 'row_1', height: 'auto' }],
    },
    elements: [
      {
        id: 'el_footer_bg',
        type: 'background',
        zIndex: 1,
        styles: { backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb' },
      },
      {
        id: 'el_notes',
        type: 'notes',
        zIndex: 2,
        gridArea: { col: 'col_left', row: 'row_1' },
        bindings: { text: '{{document.notes}}' },
      },
      {
        id: 'el_terms',
        type: 'termsConditions',
        zIndex: 2,
        gridArea: { col: 'col_right', row: 'row_1' },
        bindings: { text: '{{document.terms}}' },
      },
      {
        id: 'el_page_num',
        type: 'pageNumber',
        zIndex: 2,
        config: { format: 'Page {{page.current}} of {{page.total}}' },
      },
    ],
  },
}
