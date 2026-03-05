import type { Template } from '@/types/template'

export const modernInvoice: Template = {
  id: 'tmpl_modern_invoice',
  name: 'Modern Invoice',
  documentType: 'invoice',
  pageSize: 'A4',
  orientation: 'portrait',
  theme: {
    fontFamily: 'system-ui, sans-serif',
    primaryColor: '#1e293b',
    accentColor: '#6366f1',
  },
  header: {
    height: 200,
    visible: true,
    grid: {
      columns: [
        { id: 'col_left', width: '55%' },
        { id: 'col_right', width: '45%' },
      ],
      rows: [{ id: 'row_1', height: 'auto' }],
    },
    elements: [
      {
        id: 'el_header_bg',
        type: 'background',
        zIndex: 1,
        styles: { backgroundColor: '#1e293b' },
      },
      {
        id: 'el_logo',
        type: 'logo',
        zIndex: 3,
        gridArea: { col: 'col_left', row: 'row_1' },
        styles: { maxHeight: '60px' },
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
        styles: { color: '#ffffff', marginTop: '72px' },
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
        },
        styles: { color: '#ffffff', textAlign: 'right' },
      },
    ],
  },
  body: {
    elements: [
      {
        id: 'el_bill_to',
        type: 'billTo',
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
        zIndex: 3,
        config: {
          columns: ['name', 'description', 'qty', 'rate', 'tax', 'amount'],
          columnHeaderRepeat: true,
        },
        styles: {
          headerBackground: '#6366f1',
          headerColor: '#ffffff',
          alternateRowColor: '#f8fafc',
        },
      },
      {
        id: 'el_totals',
        type: 'totalsBlock',
        zIndex: 3,
        config: {
          show: ['subTotal', 'tax1', 'tax2', 'total', 'balanceDue'],
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
        styles: { backgroundColor: '#1e293b' },
      },
      {
        id: 'el_notes',
        type: 'notes',
        zIndex: 2,
        gridArea: { col: 'col_left', row: 'row_1' },
        bindings: { text: '{{document.notes}}' },
        styles: { color: '#94a3b8' },
      },
      {
        id: 'el_page_num',
        type: 'pageNumber',
        zIndex: 2,
        gridArea: { col: 'col_right', row: 'row_1' },
        config: { format: 'Page {{page.current}} of {{page.total}}' },
        styles: { color: '#94a3b8', textAlign: 'right' },
      },
    ],
  },
}
