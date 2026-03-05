# Invoice Maker — Implementation Progress

> Last updated: 2026-03-05

---

## Phase 1 — Project Setup
- [x] React 19 + TypeScript + Vite 7
- [x] Tailwind CSS v4
- [x] shadcn/ui components
- [x] Redux Toolkit store
- [x] React Router v7
- [x] LocalStorage auto-save via store.subscribe

---

## Phase 2 — Core Types & Services
- [x] `src/types/common.ts` — page sizes, dimensions
- [x] `src/types/template.ts` — Template, Section, Grid, TemplateElement schema
- [x] `src/types/document.ts` — StoredDocument, LineItem, TotalsConfig, DocumentData
- [x] `src/services/storage.ts` — LocalStorage read/write helpers
- [x] `src/services/calculations.ts` — calculateTotals, formatCurrency
- [x] `src/services/tokenResolver.ts` — token → value resolution

---

## Phase 3 — Document List (Home Screen)
- [x] Document list table (number, client, date, amount, type badge)
- [x] Filter by document type (All / Invoice / Estimate / Receipt)
- [x] Filter by date range (This Month / Last Month / This Year / Custom)
- [x] Search by client name or document number
- [x] Summary bar (total documents count, total amount)
- [x] Open document action
- [x] Download PDF action
- [x] Duplicate document action
- [x] Delete document action (with confirmation dialog)

---

## Phase 4 — Template Picker & Document Creation
- [x] New Document page (`/new/:type`)
- [x] Template picker UI
- [x] Document creation from template (template snapshot frozen at creation)
- [x] Redirect to Fill Mode after creation

---

## Phase 5 — Canvas Renderer

### Element Components
- [x] LogoElement — company logo display + upload in fill mode
- [x] CompanyDetailsElement — name, address, phone, email, tax ID
- [x] InvoiceDetailsElement — number, date, due date, terms, PO#, project
- [x] EstimateDetailsElement — number, date, expiry date, reference
- [x] ReceiptDetailsElement — number, issue date, payment method, related invoice#
- [x] BillToElement — client name, company, address, phone, email, tax ID
- [x] ShipToElement — separate shipping address
- [x] ItemListElement — full item table with configurable columns
- [x] TotalsBlockElement — subtotal, discount, tax1, tax2, shipping, adjustment, total, amount paid, balance due
- [x] NotesElement — free text notes
- [x] TermsElement — terms & conditions text
- [x] PageNumberElement — "Page X of N"
- [x] DividerElement — horizontal line separator
- [x] TextLabelElement — static text / headings
- [x] WatermarkElement — text watermark with opacity and rotation
- [ ] SignatureElement — signature line or image upload
- [ ] PaymentOptionsElement — PayPal / bank logos or icons
- [ ] BankDetailsElement — wire transfer / bank details block
- [ ] QRCodeElement — auto-generated from payment link or invoice URL
- [ ] ShapeElement — rectangle, line, circle for decoration
- [ ] DateStampElement — auto-inserted current or invoice date

### Canvas Infrastructure
- [x] PageCanvas — root canvas, pagination driver
- [x] CanvasPage — renders a single paginated page with header/body/footer
- [x] SectionRenderer — renders a section's grid + elements
- [x] GridLayout — CSS grid from template column/row definitions
- [x] MeasureContainer — hidden off-screen DOM measurement for pagination

---

## Phase 6 — Fill Mode & Preview

### Fill Mode Inline Editing
- [x] FillModeContext — context provider, no prop drilling
- [x] InlineField — click-to-edit input/textarea component
- [x] Company details inline editing
- [x] Client / Bill To inline editing
- [x] Invoice / Estimate / Receipt meta inline editing
- [x] Item list cell editing (inline per-cell input)
- [x] Item list add row / remove row
- [x] Totals config editing (tax rates, labels, shipping, adjustment, amount paid)
- [x] Notes inline editing
- [x] Terms inline editing
- [x] Logo file upload
- [x] Auto-save indicator ("Auto-saved")
- [ ] Tab key navigation between fields in reading order
- [ ] Escape to cancel and revert

### Preview Mode
- [x] Preview page (`/preview/:id`) — read-only canvas
- [x] Print via `window.print()`
- [x] Download PDF from preview

---

## Phase 7 — Pagination Engine
- [x] `usePagination` hook — DOM measurement + page slice calculation
- [x] Available height = page height - header - footer - body padding
- [x] Body content above table (Bill To block) measured via DOM
- [x] Column header height measured via DOM
- [x] Per-row height measurement via DOM
- [x] Totals block height measured via DOM
- [x] Rows never split across pages
- [x] Column header repeats on every new page
- [x] Totals always on last page
- [x] Totals overflow to a new page if they don't fit
- [x] Edge case: single row taller than page — placed on own page
- [x] Edge case: empty item list — single page with totals shown
- [x] Live re-pagination as content changes

---

## Phase 8 — Built-in Templates
- [x] Classic Invoice (`src/data/templates/classicInvoice.ts`)
- [x] Modern Invoice (`src/data/templates/modernInvoice.ts`)
- [x] Classic Estimate (`src/data/templates/classicEstimate.ts`)
- [x] Simple Receipt (`src/data/templates/simpleReceipt.ts`)
- [ ] Corporate Invoice — two-column header, blue theme
- [ ] Proforma Invoice — orange accent, formal

---

## Phase 9 — PDF Export
- [x] `@react-pdf/renderer` installed and integrated
- [x] `downloadPdf()` — generates and downloads PDF blob
- [x] Company block in PDF
- [x] Document meta (title, number, date, due date, terms, PO#)
- [x] Bill To section in PDF
- [x] Ship To section in PDF
- [x] Items table in PDF (alternating row colors)
- [x] Totals section in PDF (subtotal, discount, taxes, shipping, adjustment, total, balance due)
- [x] Notes section in PDF
- [x] Terms & Conditions section in PDF
- [x] Page number footer in PDF (`Page X of Y` via `render` prop — auto multi-page)
- [ ] Logo image in PDF
- [ ] Multi-page PDF matching canvas pagination (currently @react-pdf handles its own flow)
- [ ] Template-faithful PDF layout (current PDF is a simplified fixed layout, not template-driven)
- [ ] Google Fonts in PDF

---

## Editor Mode (Not Yet Implemented)
The visual template editor is **not yet started**. All features below are pending:

- [ ] Editor route (`/template/:id/edit`)
- [ ] Drag components onto canvas
- [ ] Resize components via drag handles
- [ ] Grid column resize (drag divider)
- [ ] Layer panel (reorder by z-index, show/hide, lock)
- [ ] Undo / Redo (history stack)
- [ ] Zoom in / out on canvas
- [ ] Snap to grid
- [ ] Alignment guides (snap to center / edges)
- [ ] Component locking
- [ ] Multi-select components
- [ ] Copy / paste components
- [ ] Right-click context menu
- [ ] Property panel (per-element style overrides)
- [ ] Token placeholder display in editor mode (`[Invoice Number]` etc.)

---

## Theme & Styling System
- [x] Per-template theme (fontFamily, primaryColor, accentColor)
- [ ] Per-component style overrides (font, color, background)
- [ ] Google Fonts support (loaded on demand)
- [ ] User-defined brand color palette
- [ ] RTL language support (`direction: rtl` toggle)

---

## Data / Document Features
- [x] LocalStorage persistence
- [x] Template snapshot embedded in document at creation
- [x] Template versioning (editing template does not update existing documents)
- [x] Document types: Invoice, Estimate, Receipt
- [x] Multi-currency (`Intl.NumberFormat`)
- [x] Item list: per-item discount (flat / %)
- [x] Item list: per-item tax
- [x] Item list: unit column
- [x] Totals: overall discount, tax1, tax2, shipping, adjustment, amount paid, balance due
- [ ] Custom item list column formulas (e.g. `qty * rate - discount`)
- [ ] Document lifecycle / status tracking (Draft, Sent, Paid, etc.)
- [ ] Estimate → Invoice conversion
- [ ] Invoice → Receipt conversion

---

## Summary

| Phase | Status |
|---|---|
| Phase 1 — Project Setup | Complete |
| Phase 2 — Types & Services | Complete |
| Phase 3 — Document List | Complete |
| Phase 4 — Template Picker | Complete |
| Phase 5 — Canvas Renderer | Mostly complete (6 element types missing) |
| Phase 6 — Fill Mode & Preview | Mostly complete (tab navigation pending) |
| Phase 7 — Pagination Engine | Complete |
| Phase 8 — Built-in Templates | Partial (4 of 6 templates done) |
| Phase 9 — PDF Export | Basic (simplified layout, no logo, no template-faithful output) |
| Editor Mode | Not started |
| Theme & Styling System | Partial (global theme only) |
