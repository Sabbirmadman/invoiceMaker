# Document Engine — Implementation Plan

A full design analysis, decisions, gaps, and edge cases for the invoice/estimate/receipt engine.

---

## Decisions Made

| Decision | Choice |
|---|---|
| Component positioning | Grid / columns |
| Data storage | LocalStorage first, designed to swap in a backend later |
| PDF export | Client-side library (`@react-pdf/renderer`) |
| Starter templates | Yes — ship with 3-5 built-in templates |
| Custom column formulas | Simple expressions in v1 (e.g. `qty * rate - discount`) |
| Item table column header | Repeats at top of item table on every paginated page |
| Fill mode editing | Inline on canvas — click component to edit directly |
| Document lifecycle/status | Deferred — not in v1 |
| Document List | Required in v1 — see Document List section |

---

## System Architecture

### Main Container
A4 or Letter page canvas (per-template setting). The container is the root "page" unit.

```
┌─────────────────────────────┐
│          HEADER             │  ← optional, fixed height, repeats every page
├─────────────────────────────┤
│                             │
│           BODY              │  ← drives pagination; content flows here
│       (item list,           │
│     totals, etc.)           │
│                             │
├─────────────────────────────┤
│          FOOTER             │  ← optional, fixed height, repeats every page
└─────────────────────────────┘
```

### Multi-Page Behaviour
- Header and footer repeat on every page unchanged
- Body content flows: when it overflows the available height, a new page is created
- Totals (Sub Total / Tax / Total / Balance Due) are always kept together on the last page
- If the last page items + totals overflow → totals move to a new page

### Layer System
Every component placed inside a section (Header / Body / Footer) is its own layer. Layers are ordered by z-index — drag to reorder in the layer panel, exactly like Figma or Photoshop.

```
Layer Panel (Header example):
┌─────────────────────────────┐
│ ▼ Header                    │
│   □ Invoice Details   z:5   │  ← top (renders in front)
│   □ Company Details   z:4   │
│   □ Logo              z:3   │
│   □ Watermark Text    z:2   │  ← semi-transparent, behind content
│   □ Background Image  z:1   │  ← bottom (renders behind everything)
└─────────────────────────────┘
```

Key points:
- Background and watermark are **not special fixed layers** — they are just components placed at a low z-index
- Any component can be moved above or below any other via the layer panel
- Each section (Header / Body / Footer) has its own independent layer stack
- Layers can be hidden (eye icon) or locked (lock icon) in the panel

---

## Component Positioning — Grid / Columns

Components snap to a column grid within each section.

```
┌──────────┬──────────────────┐
│  Logo    │  Invoice Title   │
├──────────┼──────────────────┤
│  Company │  Invoice Meta    │
│  Details │  (date, number)  │
└──────────┴──────────────────┘
```

- Columns are resizable (drag column divider)
- Components fill their grid cell
- Components within a cell can be aligned (left / center / right, top / middle / bottom)

---

## Component Library

### Already Defined by User
| Component | Section | Description |
|---|---|---|
| Logo | Header | Company logo image upload |
| Company Details | Header | Name, address, contact info block |
| Invoice Details | Header | Invoice #, date, terms, due date, PO#, project |
| Item List | Body | Table of line items with qty, rate, tax, amount |

### Additional Components Needed
| Component | Section | Description |
|---|---|---|
| Bill To | Header / Body | Client name, address, contact |
| Ship To | Header / Body | Shipping address (optional) |
| Totals Block | Body (last page) | Sub Total, Discount, Tax 1, Tax 2, Total, Balance Due |
| Notes | Footer | Free text note (e.g. "Thanks for your business.") |
| Terms & Conditions | Footer | Legal/payment terms text |
| Payment Options | Footer | PayPal / bank logos or icons |
| Signature | Footer | Signature line or uploaded signature image |
| Page Number | Footer | Auto `Page X of N` |
| Divider | Any | Horizontal line separator |
| Text Label | Any | Static free text (headings, labels) |
| Shape | Any | Rectangle, line, circle for decoration |
| QR Code | Any | Auto-generated from payment link or invoice URL |
| Watermark | Any (layer) | Text or image watermark behind content |
| Date Stamp | Any | Auto-inserted current or invoice date |

---

## Data Binding — Variable Token System

Templates define layout. Documents provide data. Components bind to data fields using tokens.

### Token Format

**Company (sender)**
```
{{company.name}}
{{company.address}}
{{company.phone}}
{{company.email}}
{{company.website}}
{{company.taxId}}
```

**Client (bill to / ship to)**
```
{{client.name}}
{{client.company}}
{{client.address}}
{{client.phone}}
{{client.email}}
{{client.taxId}}
{{client.shippingAddress}}
```

**Invoice-specific**
```
{{invoice.number}}
{{invoice.date}}
{{invoice.dueDate}}
{{invoice.terms}}
{{invoice.poNumber}}
{{invoice.projectName}}
{{invoice.reference}}
{{invoice.placeOfSupply}}
{{invoice.currency}}
```

**Estimate-specific**
```
{{estimate.number}}
{{estimate.date}}
{{estimate.expiryDate}}
{{estimate.reference}}
```

**Receipt-specific**
```
{{receipt.number}}
{{receipt.issueDate}}
{{receipt.paymentMethod}}
{{receipt.transactionId}}
{{receipt.relatedInvoiceNumber}}
```

**Items (special — drives item list rows)**
```
{{items}}
```

**Totals**
```
{{totals.subTotal}}
{{totals.discount}}
{{totals.tax1.label}}
{{totals.tax1.rate}}
{{totals.tax1.amount}}
{{totals.tax2.label}}
{{totals.tax2.rate}}
{{totals.tax2.amount}}
{{totals.shipping}}
{{totals.adjustment}}
{{totals.total}}
{{totals.amountPaid}}
{{totals.balanceDue}}
```

**Document footer**
```
{{document.notes}}
{{document.terms}}
```

**Page (auto)**
```
{{page.current}}
{{page.total}}
```

### Mode Behaviour
| Mode | Token behaviour |
|---|---|
| Editor mode | Shows token name as placeholder: `[Invoice Number]` |
| Preview mode | Replaces tokens with realistic sample data |
| Fill mode | User types real data; tokens are replaced live |

---

## Item List Component — Internal Specs

The most complex component. Configurable columns:

| Column | Default visible | Configurable |
|---|---|---|
| # | Yes | No |
| Item Name | Yes | No |
| Item Description | Yes | Yes (show/hide) |
| Quantity | Yes | Yes |
| Unit | No | Yes |
| Rate | Yes | Yes |
| Discount (per item) | No | Yes |
| Tax (per item) | Yes | Yes |
| Amount | Yes | No |

Additional settings per template:
- Column widths (drag to resize)
- Header row background color and font
- Alternating row colors
- Custom columns (label + formula — see below)
- Empty row count shown in editor (placeholder rows)

### Custom Column Formulas (v1)
Custom columns support simple arithmetic expressions referencing built-in column names:

```
Available variables: qty, rate, discount, tax, amount
Examples:
  "Subtotal"  →  qty * rate
  "After Disc" →  qty * rate - discount
  "Tax Amt"   →  (qty * rate) * tax / 100
```

Rules:
- Operators: `+`, `-`, `*`, `/`, `(`, `)`
- Reference only built-in column names (no arbitrary JS)
- Result is always formatted as a number
- Invalid expressions show `—` (dash) in the cell, not an error crash

### Column Header Repeat on Pagination
When the item list spans multiple pages, the column header row (`# | Item & Description | Qty | Rate | Tax | Amount`) **must repeat at the top of the item table on every new page**.

The pagination algorithm reserves `columnHeaderHeight` at the start of every new page:
```
On new page creation:
  currentPageUsed = columnHeaderHeight  ← always reserve space for repeated header
```

---

## Pagination Algorithm

### Implementation (`src/hooks/usePagination.ts`)

All measurements are performed via DOM (`offsetHeight`) in a hidden `MeasureContainer`
that is rendered off-screen at the exact page width.

```
Constants:
  BODY_PADDING = 32  (16px top + 16px bottom from BodySectionRenderer's p-4)

availableH = pageHeight - headerHeight - footerHeight - BODY_PADDING

MeasureContainer renders:
  [data-above-table]  — Bill To block (all 7 fields always rendered)
  [data-col-header]   — item table column header row
  [data-row-N]        — each item row
  [data-post-table]   — totals block

Pagination steps:
  1. aboveTableH = measure [data-above-table].offsetHeight
     colHeaderH  = measure [data-col-header].offsetHeight
     rowHeights  = measure each [data-row-N].offsetHeight
     totalsH     = measure [data-post-table].offsetHeight

  2. Page 1 initialisation:
     pageUsed = aboveTableH + colHeaderH
     slice = { pageIndex:0, itemStartIndex:0 }

  3. For each item row i:
     if (pageUsed + rowHeights[i]) <= availableH:
       pageUsed += rowHeights[i]
     else:
       close current slice (itemEndIndex = i, showTotals=false, showColumnHeader depends)
       start new page: pageUsed = colHeaderH
       add row to new page: pageUsed += rowHeights[i]

  4. Close last item page:
     if (pageUsed + totalsH) <= availableH:
       → showTotals = true on last page
     else:
       → close last item page (showTotals=false)
       → add totals-only page (showTotals=true, showColumnHeader=false)

  5. Edge cases:
     - Single row taller than availableH → placed on its own page
     - Empty item list → single page with totals only
     - Totals taller than availableH → rendered on their own page
```

### Reactive Re-pagination

`usePagination` attaches a `ResizeObserver` to `[data-above-table]` and `[data-post-table]`
inside `MeasureContainer`. Any size change (user typing, adding rows, resizing)
triggers an immediate re-computation via `requestAnimationFrame`.

### Boundary Guide Lines

`CanvasPage` renders two dashed blue lines in fill mode only:
- **Header boundary** — at `headerHeight + 16px` from page top
- **Footer boundary** — at `pageHeight - footerHeight - 16px` from page top

These lines correspond exactly to the top and bottom of `availableH`, giving the user
a visual indication of where pagination will break.

### Multi-Page Item Context

To correctly handle item mutations across pages, three props are threaded through
`CanvasPage → BodySectionRenderer → ItemListElement`:

| Prop | Type | Purpose |
|---|---|---|
| `allItems` | `LineItem[]` | Full unsliced item list; mutations always target this |
| `itemOffset` | `number` | Global start index of this page's slice (`itemStartIndex`) |
| `isLastPage` | `boolean` | Whether this slice is the last; controls "Add Row" visibility |

Row numbers display as `itemOffset + localIndex + 1` to remain globally sequential.

---

## Three Modes

| Mode | What the user does | Template editable? | Data editable? |
|---|---|---|---|
| **Editor** | Design the template layout | Yes | No (sample data only) |
| **Preview** | See the template with sample data | No | No |
| **Fill** | Create an actual document (invoice/estimate/receipt) | No | Yes — inline on canvas |

### Fill Mode — Inline Canvas Editing

In Fill mode, the template layout is locked. The user clicks directly on components to edit their data:

| Component | Inline behaviour |
|---|---|
| Logo | Click (input overlay) or drag-and-drop → file upload; hover × button removes logo |
| Company Details | Click → inline text editor per field (name, address, etc.) |
| Bill To / Ship To | Click → inline text editor per field |
| Invoice Details | Click each field (number, date, terms) → inline input |
| Item List | Click cell → inline input; click `+ Add Row` → appends new row; click row delete icon → removes row |
| Totals Block | Read-only — auto-calculated; tax rates are editable inline |
| Notes | Click → inline textarea |
| Terms & Conditions | Click → inline textarea |

Rules for inline editing:
- `InlineField` uses CSS `outline` (not `border`) for focus highlight — does not affect box height, so fill mode layout matches preview exactly
- Enter confirms (single-line fields); Escape blurs
- Item list rows auto-expand height as text grows
- Canvas re-paginates live as content changes (item list grows → new pages appear automatically via ResizeObserver)
- Tab key navigation between fields — not yet implemented
- Escape to revert — not yet implemented

---

## Editor UX Features Required

| Feature | Priority |
|---|---|
| Undo / Redo | High |
| Zoom in / out on canvas | High |
| Snap to grid | High |
| Alignment guides (snap to center/edges) | Medium |
| Component locking | Medium |
| Multi-select | Medium |
| Copy / paste components | Medium |
| Layer panel (reorder, hide, lock) | Medium |
| Component resize handles | High |
| Right-click context menu | Low |

---

## Theme & Styling System

- **Global theme** — base font family, primary color, secondary color, accent color
- **Per-component overrides** — each component can override font, color, background independently
- **Font support** — System fonts + Google Fonts (loaded on demand)
- **Color palette** — User defines a palette of brand colors; used as swatches in editor

---

## Template Schema (JSON)

Each section has a `grid` definition and a flat `elements` array. Every element is its own layer with a `zIndex`. Background and watermark are just elements with low z-index values.

```json
{
  "id": "tmpl_001",
  "name": "Classic Invoice",
  "documentType": "invoice",
  "pageSize": "A4",
  "orientation": "portrait",
  "theme": {
    "fontFamily": "Inter",
    "primaryColor": "#000000",
    "accentColor": "#FF6B00"
  },
  "header": {
    "height": 220,
    "visible": true,
    "grid": {
      "columns": [
        { "id": "col_1", "width": "30%" },
        { "id": "col_2", "width": "70%" }
      ],
      "rows": [
        { "id": "row_1", "height": "auto" },
        { "id": "row_2", "height": "auto" }
      ]
    },
    "elements": [
      {
        "id": "el_bg",
        "type": "background",
        "zIndex": 1,
        "styles": { "backgroundColor": "#ffffff" }
      },
      {
        "id": "el_logo",
        "type": "logo",
        "zIndex": 3,
        "gridArea": { "col": "col_1", "row": "row_1", "colSpan": 1, "rowSpan": 2 },
        "styles": {}
      },
      {
        "id": "el_company",
        "type": "companyDetails",
        "zIndex": 4,
        "gridArea": { "col": "col_1", "row": "row_2", "colSpan": 1, "rowSpan": 1 },
        "bindings": {
          "name": "{{company.name}}",
          "address": "{{company.address}}",
          "phone": "{{company.phone}}",
          "email": "{{company.email}}"
        },
        "styles": {}
      },
      {
        "id": "el_invoice_details",
        "type": "invoiceDetails",
        "zIndex": 4,
        "gridArea": { "col": "col_2", "row": "row_1", "colSpan": 1, "rowSpan": 2 },
        "bindings": {
          "number": "{{invoice.number}}",
          "date": "{{invoice.date}}",
          "dueDate": "{{invoice.dueDate}}",
          "terms": "{{invoice.terms}}"
        },
        "styles": {}
      }
    ]
  },
  "body": {
    "elements": [
      {
        "id": "el_wm",
        "type": "watermark",
        "zIndex": 1,
        "config": { "text": "CONFIDENTIAL", "opacity": 0.08, "rotate": -30 }
      },
      {
        "id": "el_bill_to",
        "type": "billTo",
        "zIndex": 3,
        "bindings": {
          "name": "{{client.name}}",
          "address": "{{client.address}}"
        }
      },
      {
        "id": "el_items",
        "type": "itemList",
        "zIndex": 3,
        "config": {
          "columns": ["name", "description", "qty", "rate", "tax", "amount"],
          "columnHeaderRepeat": true
        },
        "styles": {
          "headerBackground": "#000000",
          "headerColor": "#ffffff",
          "alternateRowColor": "#f9f9f9"
        }
      },
      {
        "id": "el_totals",
        "type": "totalsBlock",
        "zIndex": 3,
        "config": {
          "show": ["subTotal", "tax1", "tax2", "total", "balanceDue"]
        }
      }
    ]
  },
  "footer": {
    "height": 120,
    "visible": true,
    "grid": {
      "columns": [
        { "id": "col_1", "width": "60%" },
        { "id": "col_2", "width": "40%" }
      ],
      "rows": [{ "id": "row_1", "height": "auto" }]
    },
    "elements": [
      {
        "id": "el_notes",
        "type": "notes",
        "zIndex": 2,
        "gridArea": { "col": "col_1", "row": "row_1" },
        "bindings": { "text": "{{document.notes}}" }
      },
      {
        "id": "el_terms",
        "type": "termsConditions",
        "zIndex": 2,
        "gridArea": { "col": "col_2", "row": "row_1" },
        "bindings": { "text": "{{document.terms}}" }
      },
      {
        "id": "el_page_num",
        "type": "pageNumber",
        "zIndex": 2,
        "config": { "format": "Page {{page.current}} of {{page.total}}" }
      }
    ]
  }
}
```

---

## Template Versioning

- Templates and documents are stored **separately**
- When a document is created from a template, the **template snapshot** is embedded in the document
- Editing a template does **not** update existing documents
- Documents always render from their own embedded layout snapshot

---

## PDF Export

**Primary:** `@react-pdf/renderer`
- Renders directly to PDF (no screenshot)
- Multi-page native support
- Custom fonts, consistent cross-browser output
- No print dialog — direct download

**Secondary:** `window.print()` for quick browser print

---

## Page Sizes

| Size | Dimensions | Default |
|---|---|---|
| A4 | 210 × 297 mm | Yes |
| Letter | 215.9 × 279.4 mm | No |

Orientation: Portrait (default) or Landscape (optional, per template).

---

## Edge Cases

| Edge Case | Handling |
|---|---|
| Empty item list | Totals still render; item table shows empty state |
| Single item taller than page | Row is not split; it takes a full page |
| Header + Footer > page height | Editor warns user; enforce minimum body height |
| No header, no footer | Full page height is available for body |
| Watermark on multi-page | Watermark layer repeats on every page with header/footer |
| Multi-currency | Locale-aware number formatting (`Intl.NumberFormat`) |
| RTL languages | CSS `direction: rtl` toggle per template |
| Long text overflow in grid cells | Truncate with ellipsis in editor; wrap in output |
| Zero-value items | Display normally; do not skip |
| 100% discount | Line total = 0; grand total remains correct |
| Negative adjustment | Grand total can be negative; display with minus sign |
| Template with no item list | Valid — used for cover pages or simple receipts |
| Last page: 1 item + totals fit | Do not create a new page unnecessarily |
| Totals block taller than a page | Render on own page; allow scroll; do not loop |

---

## Document List (v1 Required)

The home screen of the app. Shows all created documents across types.

### Layout

```
┌─────────────────────────────────────────────────────────┐
│  [+ New Invoice]  [+ New Estimate]  [+ New Receipt]      │
│                                                           │
│  Filter: [All ▼]  [This Month ▼]   Search: [__________] │
├─────────────────────────────────────────────────────────┤
│  #        Client         Date        Amount    Type      │
├─────────────────────────────────────────────────────────┤
│  INV-001  Acme Corp      01 Mar 26   $1,200    Invoice   │
│  EST-012  Jane Doe       28 Feb 26     $500    Estimate  │
│  REC-005  Acme Corp      25 Feb 26     $800    Receipt   │
└─────────────────────────────────────────────────────────┘
```

### Columns (v1)
| Column | Notes |
|---|---|
| Document Number | INV-001, EST-012, REC-005 |
| Client Name | |
| Issue Date | |
| Amount | Grand Total / Total |
| Document Type | Invoice / Estimate / Receipt — shown as a badge |
| Actions | Open, Download PDF, Duplicate, Delete |

### Filters (v1)
- Document type: All / Invoice / Estimate / Receipt
- Date range: This Month / Last Month / This Year / Custom
- Search: by client name or document number

### Actions per document
- **Open** — opens in Fill mode (or Editor mode if it's a template)
- **Download PDF** — generates and downloads immediately
- **Duplicate** — creates a copy as a new draft
- **Delete** — with confirmation dialog

### Summary Bar (top of list)
Show simple totals for the current filter:
```
Total Documents: 24    |    Total Amount: $18,450
```

---

## Built-in Starter Templates (to ship with app)

| Template Name | Document Types | Style |
|---|---|---|
| Classic | Invoice, Estimate, Receipt | Black & white, minimal |
| Modern | Invoice, Estimate | Dark header, accent color |
| Corporate | Invoice | Two-column header, blue theme |
| Simple Receipt | Receipt | Compact, no header image |
| Proforma | Invoice (proforma) | Orange accent, formal |
