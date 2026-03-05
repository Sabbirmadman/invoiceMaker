# Document Behaviour

Notes on how invoice/estimate/receipt documents should behave when rendered, printed, or exported as PDF.

---

## Multi-Page Pagination

### Visual Concept

```
┌─────────────────────────────┐
│  HEADER (logo, company,     │  ← repeated on every page
│  bill to, invoice meta)     │
├─────────────────────────────┤
│  item 1                     │
│  item 2                     │
│  item 3                     │
│  item 4                     │
│  item 5                     │
├─────────────────────────────┤
│  FOOTER (notes, T&C)        │  ← repeated on every page
└─────────────────────────────┘
         Page 1 of 2

┌─────────────────────────────┐
│  HEADER (same)              │  ← repeated
├─────────────────────────────┤
│  item 6                     │
│  item 7                     │
│  item 8                     │
│                             │
│  Sub Total  $xxx            │
│  Tax        $xxx            │
│  Balance Due $xxx           │  ← totals only on LAST page
├─────────────────────────────┤
│  FOOTER (same)              │  ← repeated
└─────────────────────────────┘
         Page 2 of 2
```

### Rules

| Rule | Behaviour |
|---|---|
| Header | Repeats on every page (`position: fixed; top: 0`) |
| Footer | Repeats on every page (`position: fixed; bottom: 0`) |
| Line item rows | Never split across pages (`page-break-inside: avoid`) |
| Totals section | Always kept together, only appears on the last page |
| Notes / T&C | Kept together in the footer, repeated on every page |
| Page numbers | Shown in footer: "Page 1 of N" |

---

