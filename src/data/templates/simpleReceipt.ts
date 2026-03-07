import type { Template } from '@/types/template'

export const simpleReceipt: Template = {
  id: 'tmpl_simple_receipt',
  name: 'Simple Receipt',
  documentType: 'receipt',
  pageSize: 'A4',
  orientation: 'portrait',
  theme: {
    fontFamily: 'system-ui, sans-serif',
    primaryColor: '#111111',
    accentColor: '#16a34a',
  },
  header: {
    height: 140,
    visible: true,
    grid: {
      columns: [
        { id: 'col_left', width: '50%' },
        { id: 'col_right', width: '50%' },
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
        id: 'el_company',
        type: 'companyDetails',
        zIndex: 3,
        gridArea: { col: 'col_left', row: 'row_1' },
        bindings: {
          name: '{{company.name}}',
          address: '{{company.address}}',
          phone: '{{company.phone}}',
          email: '{{company.email}}',
        },
      },
      {
        id: 'el_receipt_details',
        type: 'receiptDetails',
        zIndex: 3,
        gridArea: { col: 'col_right', row: 'row_1' },
        bindings: {
          number: '{{receipt.number}}',
          issueDate: '{{receipt.issueDate}}',
          paymentMethod: '{{receipt.paymentMethod}}',
          relatedInvoiceNumber: '{{receipt.relatedInvoiceNumber}}',
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
        },
      },
      {
        id: 'el_items',
        type: 'itemList',
        placement: 'all-pages',
        zIndex: 3,
        config: {
          columns: ['name', 'qty', 'rate', 'amount'],
          columnHeaderRepeat: true,
        },
        styles: {
          headerBackground: '#16a34a',
          headerColor: '#ffffff',
          alternateRowColor: '#f0fdf4',
        },
      },
      {
        id: 'el_totals',
        type: 'totalsBlock',
        placement: 'last-page',
        zIndex: 3,
        config: {
          show: ['subTotal', 'tax1', 'total'],
        },
      },
    ],
  },
  footer: {
    height: 80,
    visible: true,
    grid: {
      columns: [
        { id: 'col_left', width: '70%' },
        { id: 'col_right', width: '30%' },
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
        id: 'el_page_num',
        type: 'pageNumber',
        zIndex: 2,
        gridArea: { col: 'col_right', row: 'row_1' },
        config: { format: 'Page {{page.current}} of {{page.total}}' },
      },
    ],
  },
}
