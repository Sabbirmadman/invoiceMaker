import type { Template } from '@/types/template'

export const minimalInvoice: Template = {
  id: 'tmpl_minimal_invoice',
  name: 'Minimal Invoice',
  documentType: 'invoice',
  pageSize: 'A4',
  orientation: 'portrait',
  theme: {
    fontFamily: 'system-ui, sans-serif',
    primaryColor: '#111111',
    accentColor: '#f97316',
  },
  header: {
    height: 220,
    visible: true,
    grid: {
      columns: [
        { id: 'col_center', width: '100%' },
      ],
      rows: [
        { id: 'row_1', height: 'auto' },
        { id: 'row_2', height: 'auto' },
      ],
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
        gridArea: { col: 'col_center', row: 'row_1' },
        styles: { maxHeight: '72px' },
      },
      {
        id: 'el_company',
        type: 'companyDetails',
        zIndex: 3,
        gridArea: { col: 'col_center', row: 'row_1' },
        bindings: {
          name: '{{company.name}}',
          address: '{{company.address}}',
          phone: '{{company.phone}}',
          email: '{{company.email}}',
        },
        styles: { marginTop: '80px', textAlign: 'center' },
      },
      {
        id: 'el_title',
        type: 'textLabel',
        zIndex: 3,
        gridArea: { col: 'col_center', row: 'row_2' },
        config: { text: 'INVOICE' },
        styles: {
          fontSize: '40px',
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#f97316',
          paddingTop: '8px',
          letterSpacing: '4px',
        },
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
        styles: { textAlign: 'center' },
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
        },
        styles: { textAlign: 'center' },
      },
      {
        id: 'el_items',
        type: 'itemList',
        placement: 'all-pages',
        zIndex: 3,
        config: {
          columns: ['name', 'description', 'qty', 'rate', 'amount'],
          columnHeaderRepeat: true,
        },
        styles: {
          headerBackground: '#111111',
          headerColor: '#ffffff',
          alternateRowColor: '#fafafa',
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
        styles: { backgroundColor: '#ffffff', borderTop: '2px solid #f97316' },
      },
      {
        id: 'el_terms',
        type: 'termsConditions',
        zIndex: 2,
        gridArea: { col: 'col_left', row: 'row_1' },
        bindings: { text: '{{document.terms}}' },
      },
      {
        id: 'el_page_num',
        type: 'pageNumber',
        zIndex: 2,
        gridArea: { col: 'col_right', row: 'row_1' },
        config: { format: 'Page {{page.current}} of {{page.total}}' },
        styles: { textAlign: 'right', color: '#888888' },
      },
    ],
  },
}
