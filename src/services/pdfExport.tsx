import { Document, Page, View, Text, StyleSheet, pdf } from '@react-pdf/renderer'
import type { StoredDocument, LineItem, TotalsConfig, TotalsResult } from '@/types/document'
import { calculateTotals, formatCurrency } from './calculations'

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1a1a1a',
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 48,
  },
  // Header row
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  companyBlock: { flex: 1, marginRight: 24 },
  companyName: { fontSize: 14, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  companyLine: { color: '#555', marginBottom: 2 },
  docBlock: { alignItems: 'flex-end', minWidth: 140 },
  docTitle: { fontSize: 22, fontFamily: 'Helvetica-Bold', marginBottom: 8, letterSpacing: 1 },
  detailRow: { flexDirection: 'row', marginBottom: 3 },
  detailLabel: { color: '#888', fontSize: 9, width: 70, textAlign: 'right', marginRight: 6 },
  detailValue: { fontFamily: 'Helvetica-Bold', fontSize: 9 },
  // Divider
  divider: { borderBottomWidth: 1, borderBottomColor: '#e5e7eb', marginBottom: 20 },
  // Bill To
  billToSection: { flexDirection: 'row', marginBottom: 24 },
  billToBlock: { flex: 1 },
  billToLabel: { fontSize: 8, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  billToName: { fontSize: 11, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  billToLine: { color: '#444', marginBottom: 1 },
  // Items table
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#111',
    color: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 0,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tableRowAlt: { backgroundColor: '#f9fafb' },
  colNum: { width: 24 },
  colName: { flex: 2 },
  colDesc: { flex: 3 },
  colQty: { width: 36, textAlign: 'right' },
  colRate: { width: 60, textAlign: 'right' },
  colAmount: { width: 70, textAlign: 'right' },
  thText: { color: '#fff', fontSize: 9, fontFamily: 'Helvetica-Bold' },
  tdText: { fontSize: 9 },
  // Totals
  totalsSection: { marginTop: 16, alignItems: 'flex-end' },
  totalsTable: { width: 220 },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  totalsDueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    marginTop: 4,
    borderTopWidth: 2,
    borderTopColor: '#111',
  },
  totalsLabel: { color: '#555', fontSize: 9 },
  totalsValue: { fontSize: 9 },
  totalsDueLabel: { fontFamily: 'Helvetica-Bold', fontSize: 11 },
  totalsDueValue: { fontFamily: 'Helvetica-Bold', fontSize: 11 },
  // Notes / Terms
  notesSection: { marginTop: 24 },
  notesLabel: { fontSize: 8, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  notesText: { color: '#555', fontSize: 9, lineHeight: 1.5 },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: { color: '#aaa', fontSize: 8 },
})

// ---------------------------------------------------------------------------
// Helper: get doc title and meta fields
// ---------------------------------------------------------------------------
function getDocTitle(doc: StoredDocument): string {
  return doc.documentType.toUpperCase()
}

function getMetaRows(doc: StoredDocument): Array<{ label: string; value: string }> {
  const meta = doc.data.meta
  const rows: Array<{ label: string; value: string }> = []

  if (meta.type === 'invoice') {
    rows.push({ label: 'Invoice #', value: meta.number || '—' })
    rows.push({ label: 'Date', value: meta.date || '—' })
    if (meta.dueDate) rows.push({ label: 'Due Date', value: meta.dueDate })
    if (meta.terms) rows.push({ label: 'Terms', value: meta.terms })
    if (meta.poNumber) rows.push({ label: 'PO Number', value: meta.poNumber })
  } else if (meta.type === 'estimate') {
    rows.push({ label: 'Estimate #', value: meta.number || '—' })
    rows.push({ label: 'Date', value: meta.date || '—' })
    if (meta.expiryDate) rows.push({ label: 'Expiry Date', value: meta.expiryDate })
    if (meta.reference) rows.push({ label: 'Reference', value: meta.reference })
  } else {
    rows.push({ label: 'Receipt #', value: meta.number || '—' })
    rows.push({ label: 'Issue Date', value: meta.issueDate || '—' })
    if (meta.paymentMethod) rows.push({ label: 'Payment', value: meta.paymentMethod })
    if (meta.relatedInvoiceNumber) rows.push({ label: 'Invoice #', value: meta.relatedInvoiceNumber })
  }
  return rows
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function CompanyBlock({ doc }: { doc: StoredDocument }) {
  const c = doc.data.company
  const cityLine = [c.city, c.state, c.zip].filter(Boolean).join(', ')
  return (
    <View style={styles.companyBlock}>
      {c.name ? <Text style={styles.companyName}>{c.name}</Text> : null}
      {c.address ? <Text style={styles.companyLine}>{c.address}</Text> : null}
      {cityLine ? <Text style={styles.companyLine}>{cityLine}</Text> : null}
      {c.country ? <Text style={styles.companyLine}>{c.country}</Text> : null}
      {c.phone ? <Text style={styles.companyLine}>{c.phone}</Text> : null}
      {c.email ? <Text style={styles.companyLine}>{c.email}</Text> : null}
      {c.taxId ? <Text style={styles.companyLine}>Tax ID: {c.taxId}</Text> : null}
    </View>
  )
}

function DocBlock({ doc }: { doc: StoredDocument }) {
  const metaRows = getMetaRows(doc)
  return (
    <View style={styles.docBlock}>
      <Text style={styles.docTitle}>{getDocTitle(doc)}</Text>
      {metaRows.map((row) => (
        <View key={row.label} style={styles.detailRow}>
          <Text style={styles.detailLabel}>{row.label}</Text>
          <Text style={styles.detailValue}>{row.value}</Text>
        </View>
      ))}
    </View>
  )
}

function BillToSection({ doc }: { doc: StoredDocument }) {
  const cl = doc.data.client
  const cityLine = [cl.city, cl.state, cl.zip].filter(Boolean).join(', ')
  const hasShipping = Boolean(cl.shippingAddress)

  return (
    <View style={styles.billToSection}>
      <View style={styles.billToBlock}>
        <Text style={styles.billToLabel}>Bill To</Text>
        {cl.name ? <Text style={styles.billToName}>{cl.name}</Text> : null}
        {cl.company ? <Text style={styles.billToLine}>{cl.company}</Text> : null}
        {cl.address ? <Text style={styles.billToLine}>{cl.address}</Text> : null}
        {cityLine ? <Text style={styles.billToLine}>{cityLine}</Text> : null}
        {cl.country ? <Text style={styles.billToLine}>{cl.country}</Text> : null}
        {cl.email ? <Text style={styles.billToLine}>{cl.email}</Text> : null}
        {cl.phone ? <Text style={styles.billToLine}>{cl.phone}</Text> : null}
      </View>
      {hasShipping && (
        <View style={[styles.billToBlock, { marginLeft: 32 }]}>
          <Text style={styles.billToLabel}>Ship To</Text>
          <Text style={styles.billToLine}>{cl.shippingAddress}</Text>
        </View>
      )}
    </View>
  )
}

function ItemsTable({ items, currency }: { items: LineItem[]; currency: string }) {
  return (
    <View>
      {/* Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.thText, styles.colNum]}>#</Text>
        <Text style={[styles.thText, styles.colName]}>Item</Text>
        <Text style={[styles.thText, styles.colDesc]}>Description</Text>
        <Text style={[styles.thText, styles.colQty]}>Qty</Text>
        <Text style={[styles.thText, styles.colRate]}>Rate</Text>
        <Text style={[styles.thText, styles.colAmount]}>Amount</Text>
      </View>
      {items.map((item, idx) => (
        <View key={item.id} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}>
          <Text style={[styles.tdText, styles.colNum]}>{idx + 1}</Text>
          <Text style={[styles.tdText, styles.colName]}>{item.name}</Text>
          <Text style={[styles.tdText, styles.colDesc]}>{item.description}</Text>
          <Text style={[styles.tdText, styles.colQty]}>{item.qty}</Text>
          <Text style={[styles.tdText, styles.colRate]}>{formatCurrency(item.rate, currency)}</Text>
          <Text style={[styles.tdText, styles.colAmount]}>{formatCurrency(item.amount, currency)}</Text>
        </View>
      ))}
    </View>
  )
}

function TotalsSection({ config, totals }: { config: TotalsConfig; totals: TotalsResult }) {
  const cur = config.currency
  return (
    <View style={styles.totalsSection}>
      <View style={styles.totalsTable}>
        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>Subtotal</Text>
          <Text style={styles.totalsValue}>{formatCurrency(totals.subTotal, cur)}</Text>
        </View>
        {totals.overallDiscount > 0 && (
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Discount</Text>
            <Text style={styles.totalsValue}>-{formatCurrency(totals.overallDiscount, cur)}</Text>
          </View>
        )}
        {config.tax1.enabled && totals.tax1Amount > 0 && (
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>{config.tax1.label} ({config.tax1.rate}%)</Text>
            <Text style={styles.totalsValue}>{formatCurrency(totals.tax1Amount, cur)}</Text>
          </View>
        )}
        {config.tax2.enabled && totals.tax2Amount > 0 && (
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>{config.tax2.label} ({config.tax2.rate}%)</Text>
            <Text style={styles.totalsValue}>{formatCurrency(totals.tax2Amount, cur)}</Text>
          </View>
        )}
        {totals.shipping !== 0 && (
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Shipping</Text>
            <Text style={styles.totalsValue}>{formatCurrency(totals.shipping, cur)}</Text>
          </View>
        )}
        {totals.adjustment !== 0 && (
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Adjustment</Text>
            <Text style={styles.totalsValue}>{formatCurrency(totals.adjustment, cur)}</Text>
          </View>
        )}
        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>Total</Text>
          <Text style={[styles.totalsValue, { fontFamily: 'Helvetica-Bold' }]}>{formatCurrency(totals.total, cur)}</Text>
        </View>
        {totals.amountPaid > 0 && (
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Amount Paid</Text>
            <Text style={styles.totalsValue}>-{formatCurrency(totals.amountPaid, cur)}</Text>
          </View>
        )}
        <View style={styles.totalsDueRow}>
          <Text style={styles.totalsDueLabel}>Balance Due</Text>
          <Text style={styles.totalsDueValue}>{formatCurrency(totals.balanceDue, cur)}</Text>
        </View>
      </View>
    </View>
  )
}

// ---------------------------------------------------------------------------
// PDF Document component
// ---------------------------------------------------------------------------
function PdfDocument({ doc }: { doc: StoredDocument }) {
  const { data } = doc
  const totals = calculateTotals(data.items, data.totalsConfig)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header: company + doc info */}
        <View style={styles.header}>
          <CompanyBlock doc={doc} />
          <DocBlock doc={doc} />
        </View>

        <View style={styles.divider} />

        {/* Bill To */}
        <BillToSection doc={doc} />

        {/* Items */}
        <ItemsTable items={data.items} currency={data.totalsConfig.currency} />

        {/* Totals */}
        <TotalsSection config={data.totalsConfig} totals={totals} />

        {/* Notes */}
        {data.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notesText}>{data.notes}</Text>
          </View>
        )}

        {/* Terms */}
        {data.terms && (
          <View style={[styles.notesSection, { marginTop: 12 }]}>
            <Text style={styles.notesLabel}>Terms & Conditions</Text>
            <Text style={styles.notesText}>{data.terms}</Text>
          </View>
        )}

        {/* Page footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{data.company.name}</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  )
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export async function downloadPdf(doc: StoredDocument): Promise<void> {
  const blob = await pdf(<PdfDocument doc={doc} />).toBlob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${doc.data.meta.number || doc.documentType}-${doc.id.slice(0, 6)}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
