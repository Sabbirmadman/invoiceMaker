import type { Template } from '@/types/template'

export const classicEstimate: Template = {
  id: 'tmpl_classic_estimate',
  name: 'Classic Estimate',
  documentType: 'estimate',
  pageSize: 'A4',
  orientation: 'portrait',
  theme: {
    fontFamily: 'system-ui, sans-serif',
    primaryColor: '#111111',
    accentColor: '#059669',
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
        },
        styles: { marginTop: '90px' },
      },
      {
        id: 'el_estimate_details',
        type: 'estimateDetails',
        zIndex: 3,
        gridArea: { col: 'col_right', row: 'row_1' },
        bindings: {
          number: '{{estimate.number}}',
          date: '{{estimate.date}}',
          expiryDate: '{{estimate.expiryDate}}',
          reference: '{{estimate.reference}}',
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
          columns: ['name', 'description', 'qty', 'rate', 'amount'],
          columnHeaderRepeat: true,
        },
        styles: {
          headerBackground: '#059669',
          headerColor: '#ffffff',
          alternateRowColor: '#f0fdf4',
        },
      },
      {
        id: 'el_totals',
        type: 'totalsBlock',
        zIndex: 3,
        config: {
          show: ['subTotal', 'discount', 'tax1', 'tax2', 'total'],
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
        styles: { backgroundColor: '#f0fdf4', borderTop: '1px solid #bbf7d0' },
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
