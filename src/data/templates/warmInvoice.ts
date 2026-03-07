import type { Template } from '@/types/template'

export const warmInvoice: Template = {
  id: 'tmpl_warm_invoice',
  name: 'Warm Invoice',
  documentType: 'invoice',
  pageSize: 'A4',
  orientation: 'portrait',
  theme: {
    fontFamily: 'system-ui, sans-serif',
    primaryColor: '#92400e',
    accentColor: '#f59e0b',
  },
  header: {
    height: 160,
    visible: true,
    grid: {
      columns: [
        { id: 'col_logo', width: '20%' },
        { id: 'col_center', width: '40%' },
        { id: 'col_right', width: '40%' },
      ],
      rows: [{ id: 'row_1', height: 'auto' }],
    },
    elements: [
      {
        id: 'el_header_bg',
        type: 'background',
        zIndex: 1,
        styles: { backgroundColor: '#f59e0b' },
      },
      {
        id: 'el_logo',
        type: 'logo',
        zIndex: 5,
        gridArea: { col: 'col_logo', row: 'row_1' },
        styles: { maxHeight: '60px' },
      },
      {
        id: 'el_title',
        type: 'textLabel',
        zIndex: 3,
        gridArea: { col: 'col_center', row: 'row_1' },
        config: { text: 'INVOICE' },
        styles: {
          fontSize: '30px',
          fontWeight: 'bold',
          color: '#ffffff',
          textAlign: 'center',
          letterSpacing: '3px',
        },
      },
      {
        id: 'el_company',
        type: 'companyDetails',
        zIndex: 3,
        gridArea: { col: 'col_right', row: 'row_1' },
        bindings: {
          name: '{{company.name}}',
          address: '{{company.address}}',
          phone: '{{company.phone}}',
          email: '{{company.email}}',
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
      },
      {
        id: 'el_invoice_details',
        type: 'invoiceDetails',
        placement: 'first-page',
        zIndex: 3,
        bindings: {
          number: '{{invoice.number}}',
          date: '{{invoice.date}}',
          dueDate: '{{invoice.dueDate}}',
          terms: '{{invoice.terms}}',
          poNumber: '{{invoice.poNumber}}',
          projectName: '{{invoice.projectName}}',
        },
      },
      {
        id: 'el_items',
        type: 'itemList',
        placement: 'all-pages',
        zIndex: 3,
        config: {
          columns: ['name', 'description', 'qty', 'rate', 'discount', 'amount'],
          columnHeaderRepeat: true,
        },
        styles: {
          headerBackground: '#92400e',
          headerColor: '#ffffff',
          alternateRowColor: '#fffbeb',
        },
      },
      {
        id: 'el_totals',
        type: 'totalsBlock',
        placement: 'last-page',
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
        styles: { backgroundColor: '#fffbeb', borderTop: '2px solid #f59e0b' },
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
    ],
  },
}
