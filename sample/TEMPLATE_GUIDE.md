# Template Authoring Guide

How to add a new built-in template to the invoice maker.

---

## File location

Create one file per template:

```
src/data/templates/<camelCaseName>.ts
```

Register it in `src/data/templates/index.ts` (or wherever templates are aggregated for the template picker).

---

## Skeleton

```ts
import type { Template } from '@/types/template'

export const myTemplate: Template = {
  id: 'tmpl_<unique_id>',        // snake_case, never reuse an existing id
  name: 'My Template',
  documentType: 'invoice',       // 'invoice' | 'estimate' | 'receipt'
  pageSize: 'A4',                // 'A4' | 'Letter'
  orientation: 'portrait',
  theme: {
    fontFamily: 'system-ui, sans-serif',
    primaryColor: '#111111',
    accentColor: '#2563eb',
  },
  header: { /* see Header section */ },
  body:   { /* see Body section   */ },
  footer: { /* see Footer section */ },
}
```

---

## zIndex rules — READ THIS FIRST

The renderer sorts all elements in a section by `zIndex` ascending and renders them in that order. **Last in DOM = visually on top.**

| Layer type | Required zIndex |
|---|---|
| `background` | `1` |
| `watermark` | `2` |
| All other elements | `3` |
| **`logo`** | **`5`** (must be higher than any element in the same grid cell) |

**Critical:** The `logo` element shares a grid cell with `companyDetails` in all standard layouts. Because the logo renders an invisible `<input type="file">` that covers its upload zone, it **must render after** `companyDetails` in DOM order (i.e. have a higher zIndex) so clicks land on the file input. Using `zIndex: 5` for `logo` while `companyDetails` stays at `zIndex: 3` guarantees this.

The renderer gives the `logo` wrapper `height: auto` (not `h-full`) specifically so it only covers the logo zone height and does not block the company detail fields below it. This is handled automatically by `SectionRenderer` — no template action needed.

---

## Header

Standard two-column header with logo + company on the left, document details on the right:

```ts
header: {
  height: 180,          // px — adjust to fit your content
  visible: true,
  grid: {
    columns: [
      { id: 'col_left',  width: '40%' },
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
      zIndex: 5,                              // ← MUST be > companyDetails zIndex
      gridArea: { col: 'col_left', row: 'row_1' },
      styles: { maxHeight: '80px' },
    },
    {
      id: 'el_company',
      type: 'companyDetails',
      zIndex: 3,
      gridArea: { col: 'col_left', row: 'row_1' },  // same cell as logo
      bindings: {
        name:    '{{company.name}}',
        address: '{{company.address}}',
        phone:   '{{company.phone}}',
        email:   '{{company.email}}',
        website: '{{company.website}}',
        taxId:   '{{company.taxId}}',
      },
      styles: { marginTop: '90px' },          // push below the logo area
    },
    {
      id: 'el_invoice_details',               // or estimateDetails / receiptDetails
      type: 'invoiceDetails',
      zIndex: 3,
      gridArea: { col: 'col_right', row: 'row_1' },
      bindings: {
        number:   '{{invoice.number}}',
        date:     '{{invoice.date}}',
        dueDate:  '{{invoice.dueDate}}',
        terms:    '{{invoice.terms}}',
        poNumber: '{{invoice.poNumber}}',
      },
      styles: { textAlign: 'right' },
    },
  ],
},
```

**`marginTop` on companyDetails:** must be at least `maxHeight` of the logo (e.g. logo `maxHeight: '80px'` → `marginTop: '90px'`). This visually separates logo from company text but both remain in the same grid cell.

---

## Body

The body has no `grid` — elements flow vertically in the order they appear.

```ts
body: {
  elements: [
    {
      id: 'el_bill_to',
      type: 'billTo',
      zIndex: 3,
      bindings: {
        name:    '{{client.name}}',
        company: '{{client.company}}',
        address: '{{client.address}}',
        city:    '{{client.city}}',
        state:   '{{client.state}}',
        zip:     '{{client.zip}}',
        country: '{{client.country}}',
        phone:   '{{client.phone}}',
        email:   '{{client.email}}',
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
        headerBackground: '#111111',
        headerColor: '#ffffff',
        alternateRowColor: '#f9fafb',
      },
    },
    {
      id: 'el_totals',
      type: 'totalsBlock',
      zIndex: 3,
      config: {
        // include only what is relevant:
        show: ['subTotal', 'discount', 'tax1', 'tax2', 'total', 'balanceDue'],
      },
    },
  ],
},
```

Available `totalsBlock` show values: `subTotal` `discount` `tax1` `tax2` `shipping` `adjustment` `total` `amountPaid` `balanceDue`

---

## Footer

Standard footer with notes + page number:

```ts
footer: {
  height: 100,
  visible: true,
  grid: {
    columns: [
      { id: 'col_left',  width: '60%' },
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
```

---

## Element type reference

| type | Section | gridArea required | Notes |
|---|---|---|---|
| `background` | any | no | Full-bleed color/image behind everything. zIndex: 1 |
| `watermark` | any | no | Diagonal text behind content. zIndex: 2 |
| `logo` | header | yes | **zIndex: 5**. File upload zone in fill mode |
| `companyDetails` | header | yes | zIndex: 3. Same cell as logo, marginTop to clear it |
| `invoiceDetails` | header | yes | zIndex: 3. Only renders for `documentType: 'invoice'` |
| `estimateDetails` | header | yes | zIndex: 3. Only renders for `documentType: 'estimate'` |
| `receiptDetails` | header | yes | zIndex: 3. Only renders for `documentType: 'receipt'` |
| `billTo` | body | no | Always include. Measured by pagination engine |
| `shipTo` | body | no | Optional secondary address |
| `itemList` | body | no | Always include. Drives pagination |
| `totalsBlock` | body | no | Always include. Rendered on last page only |
| `notes` | footer | yes | Free text |
| `termsConditions` | footer | yes | Free text |
| `pageNumber` | footer | no (or yes) | Auto `Page X of N` |
| `divider` | any | yes | Horizontal rule |
| `textLabel` | any | yes | Static heading or label |

---

## Available tokens

```
{{company.name}}  {{company.address}}  {{company.phone}}
{{company.email}} {{company.website}}  {{company.taxId}}

{{client.name}}   {{client.company}}   {{client.address}}
{{client.city}}   {{client.state}}     {{client.zip}}
{{client.country}} {{client.phone}}    {{client.email}}

{{invoice.number}} {{invoice.date}}    {{invoice.dueDate}}
{{invoice.terms}}  {{invoice.poNumber}} {{invoice.projectName}}

{{estimate.number}} {{estimate.date}}  {{estimate.expiryDate}}
{{estimate.reference}}

{{receipt.number}}  {{receipt.issueDate}} {{receipt.paymentMethod}}
{{receipt.relatedInvoiceNumber}}

{{document.notes}}  {{document.terms}}
{{page.current}}    {{page.total}}
```

---

## Checklist before shipping a new template

- [ ] `id` is unique across all templates (`tmpl_<name>`)
- [ ] `documentType` matches the details element used (`invoiceDetails` / `estimateDetails` / `receiptDetails`)
- [ ] `logo` element has `zIndex: 5` (not 3)
- [ ] `companyDetails` element has `marginTop` ≥ logo `maxHeight`
- [ ] `billTo` is present in body (required by pagination engine)
- [ ] `itemList` is present in body
- [ ] `totalsBlock` is present in body
- [ ] Template is registered in the template picker so users can select it
- [ ] Manually tested: click logo zone → file picker opens
- [ ] Manually tested: company detail fields are still editable below the logo
