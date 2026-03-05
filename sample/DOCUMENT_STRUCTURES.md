# Document Structures: Invoice, Estimate & Receipt

A reference guide covering all possible fields for each document type.

---

## Quick Comparison

| Feature | Invoice | Estimate | Receipt |
|---|---|---|---|
| **Purpose** | Request payment for goods/services | Provide a cost quote before work begins | Confirm payment has been received |
| **Legally binding** | Yes | No (until accepted by client) | Yes |
| **Document #** | INV-000001 | EST-12 | REC-12 |
| **Expiry Date** | No | Yes | No |
| **Due Date** | Yes | No | No |
| **Balance Due** | Yes | No | No |
| **Amount Paid** | Optional | No | Yes |
| **Payment Method** | Optional | No | Yes |
| **Multi-tax support** | Yes | Yes | Yes |
| **Discount** | Yes | Yes | No |
| **Payment Options** | Yes | No | No |

---

## 1. Invoice

**Purpose:** A formal request for payment sent to a client after goods/services are delivered (or during delivery).

### Header Section
| Field | Required | Notes |
|---|---|---|
| Business Logo | Optional | Image upload |
| Business Name | Required | |
| Business Address | Required | Street, City, State, ZIP, Country |
| Business Phone | Optional | |
| Business Email | Optional | |
| Business Website | Optional | |
| Business Tax ID / GST / VAT Number | Optional | |
| Document Title | Required | "INVOICE" or "PROFORMA INVOICE" |

### Invoice Meta Fields
| Field | Required | Notes |
|---|---|---|
| Invoice Number | Required | e.g. INV-000001 |
| Invoice Date | Required | Date the invoice was issued |
| Due Date | Required | Payment deadline |
| Terms | Optional | e.g. "Due on Receipt", "Net 30" |
| P.O. Number | Optional | Purchase Order reference |
| Project Name | Optional | |
| Reference Number | Optional | |
| Place of Supply | Optional | Jurisdiction/state for tax |
| Currency | Optional | Default: USD |

### Bill To / Ship To Section
| Field | Required | Notes |
|---|---|---|
| Client Name | Required | |
| Client Company | Optional | |
| Client Address | Optional | Street, City, State, ZIP, Country |
| Client Phone | Optional | |
| Client Email | Optional | |
| Client Tax ID / GST Number | Optional | |
| Ship To (separate address) | Optional | If different from billing address |

### Line Items Table
| Column | Required | Notes |
|---|---|---|
| # (Item number) | Required | Row index |
| Item Name | Required | |
| Item Description | Optional | Sub-text below name |
| Quantity (Qty) | Required | |
| Unit | Optional | e.g. "Piece", "Hour", "kg" |
| Rate (Unit Price) | Required | |
| Discount (per item) | Optional | Flat or % |
| Tax (per item) | Optional | One or multiple tax rates per item |
| Amount | Required | Qty × Rate − Discount + Tax |

### Summary / Totals Section
| Field | Notes |
|---|---|
| Sub Total | Sum of all line item amounts before tax/discount |
| Discount (overall) | Optional flat or % discount on subtotal |
| Tax 1 (e.g. GST, VAT, Sample Tax 1) | Named tax with rate % |
| Tax 2 (e.g. Sample Tax 2) | Optional second tax |
| Shipping Charges | Optional |
| Adjustment | Optional miscellaneous +/− |
| Grand Total / Total | Final computed total |
| Amount Paid | Optional — if partial payment made |
| Balance Due | Grand Total − Amount Paid |

### Footer Section
| Field | Required | Notes |
|---|---|---|
| Notes | Optional | e.g. "Thanks for your business." |
| Payment Options | Optional | PayPal, bank transfer, etc. (logos/icons) |
| Terms & Conditions | Optional | Free text |
| Signature | Optional | |
| Bank Details | Optional | For wire/bank transfer |

---

## 2. Estimate

**Purpose:** A cost quote sent to a client *before* work begins. Not a payment request — becomes an invoice once accepted.

### Header Section
| Field | Required | Notes |
|---|---|---|
| Business Logo | Optional | Image upload |
| Business Name | Required | |
| Business Address | Required | Street, City, State, ZIP, Country |
| Business Phone | Optional | |
| Business Email | Optional | |
| Document Title | Required | "ESTIMATE" or "QUOTE" |

### Estimate Meta Fields
| Field | Required | Notes |
|---|---|---|
| Estimate Number | Required | e.g. EST-12 |
| Estimate Date | Required | Date the estimate was created |
| Expiry Date | Required | After this date the estimate is invalid |
| Reference Number | Optional | |
| P.O. Number | Optional | |
| Project Name | Optional | |
| Currency | Optional | |

### Bill To Section
| Field | Required | Notes |
|---|---|---|
| Client Name | Required | |
| Client Company | Optional | |
| Client Address | Optional | |
| Client Phone | Optional | |
| Client Email | Optional | |

> No "Ship To" in estimates — delivery details are confirmed on the invoice.

### Line Items Table
| Column | Required | Notes |
|---|---|---|
| # (Item number) | Required | |
| Item Name / Description | Required | |
| Quantity | Required | |
| Unit | Optional | |
| Rate | Required | |
| Discount (per item) | Optional | |
| Tax (per item) | Optional | |
| Amount | Required | |

### Summary / Totals Section
| Field | Notes |
|---|---|
| Sub Total | |
| Discount | Optional |
| Tax 1 | Optional |
| Tax 2 | Optional |
| Shipping | Optional |
| Adjustment | Optional |
| Total | Final estimated amount |

> No "Balance Due" — this is not a payment request.

### Footer Section
| Field | Required | Notes |
|---|---|---|
| Notes | Optional | e.g. "Looking forward to your business." |
| Terms & Conditions | Optional | e.g. "Valid only if accepted before expiry date." |
| Signature | Optional | Client acceptance signature |

---

## 3. Receipt

**Purpose:** Proof of payment. Issued *after* the client has paid — confirms the transaction is complete.

### Header Section
| Field | Required | Notes |
|---|---|---|
| Business Logo | Optional | |
| Business Name | Required | |
| Business Address | Required | |
| Business Phone | Optional | |
| Business Email | Optional | |
| Document Title | Required | "RECEIPT" |

### Receipt Meta Fields
| Field | Required | Notes |
|---|---|---|
| Receipt Number | Required | e.g. REC-12 |
| Issue Date | Required | Date payment was received |
| Payment Date | Optional | May differ from issue date |
| Payment Method | Optional | Cash, Card, Bank Transfer, PayPal, etc. |
| Reference / Transaction ID | Optional | |
| Related Invoice Number | Optional | Links back to the original invoice |
| Currency | Optional | |

### Bill To Section
| Field | Required | Notes |
|---|---|---|
| Client Name | Required | |
| Client Company | Optional | |
| Client Address | Optional | |

> No "Ship To", no "Due Date", no "Expiry Date" on receipts.

### Line Items Table
| Column | Required | Notes |
|---|---|---|
| # | Required | |
| Item Name / Description | Required | |
| Quantity | Required | |
| Rate | Required | |
| Tax (per item) | Optional | |
| Amount | Required | |

> Receipts typically do NOT have per-item discounts — discounts were already applied on the invoice.

### Summary / Totals Section
| Field | Notes |
|---|---|
| Sub Total | |
| Tax | |
| Total | Amount paid in full |

> No "Balance Due" row — payment is complete.
> No "Amount Paid" row — the Total IS the amount paid.

### Footer Section
| Field | Required | Notes |
|---|---|---|
| Notes | Optional | e.g. "It was great doing business with you." |
| Terms & Conditions | Optional | |

---

## Field-by-Field Master Reference

Fields sorted by where they appear and which documents support them.

| Field | Invoice | Estimate | Receipt |
|---|---|---|---|
| Logo | Yes | Yes | Yes |
| Business Name | Yes | Yes | Yes |
| Business Address | Yes | Yes | Yes |
| Business Phone | Yes | Yes | Yes |
| Business Email | Yes | Yes | Yes |
| Business Tax ID / VAT | Yes | Yes | No |
| Document Title | Yes | Yes | Yes |
| Document Number | Yes (INV) | Yes (EST) | Yes (REC) |
| Issue / Document Date | Yes | Yes | Yes |
| Due Date | Yes | No | No |
| Expiry Date | No | Yes | No |
| Payment Date | No | No | Yes |
| Payment Method | Optional | No | Yes |
| Terms (Net 30 etc.) | Yes | No | No |
| P.O. Number | Yes | Yes | No |
| Project Name | Yes | Yes | No |
| Reference Number | Yes | Yes | Yes |
| Place of Supply | Yes | No | No |
| Currency | Yes | Yes | Yes |
| Bill To | Yes | Yes | Yes |
| Ship To | Yes | No | No |
| Client Tax ID | Yes | Yes | No |
| Line Item: Name | Yes | Yes | Yes |
| Line Item: Description | Yes | Yes | Yes |
| Line Item: Qty | Yes | Yes | Yes |
| Line Item: Unit | Yes | Yes | Yes |
| Line Item: Rate | Yes | Yes | Yes |
| Line Item: Per-item Discount | Yes | Yes | No |
| Line Item: Per-item Tax | Yes | Yes | Yes |
| Line Item: Amount | Yes | Yes | Yes |
| Sub Total | Yes | Yes | Yes |
| Overall Discount | Yes | Yes | No |
| Tax 1 | Yes | Yes | Yes |
| Tax 2 | Yes | Yes | No |
| Shipping Charges | Yes | Yes | No |
| Adjustment | Yes | Yes | No |
| Grand Total / Total | Yes | Yes | Yes |
| Amount Paid | Yes (optional) | No | No |
| Balance Due | Yes | No | No |
| Notes | Yes | Yes | Yes |
| Terms & Conditions | Yes | Yes | Yes |
| Payment Options (icons) | Yes | No | No |
| Bank Details | Yes | No | No |
| Signature | Yes | Yes | No |
| Related Invoice # | No | No | Yes |
| Transaction ID | No | No | Yes |

---

## Document Lifecycle

```
Estimate  →  (client accepts)  →  Invoice  →  (client pays)  →  Receipt
  EST-12                           INV-0001                       REC-12
"Here's what                    "Please pay                    "Payment
 it will cost"                   this amount"                   confirmed"
```
