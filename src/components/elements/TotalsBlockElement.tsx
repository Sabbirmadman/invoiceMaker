import type { TemplateElement } from '@/types/template'
import type { TotalsConfig, TotalsResult } from '@/types/document'
import { formatCurrency } from '@/services/calculations'

interface Props {
  element: TemplateElement
  totals: TotalsResult
  config: TotalsConfig
}

type TotalsKey =
  | 'subTotal'
  | 'discount'
  | 'tax1'
  | 'tax2'
  | 'shipping'
  | 'adjustment'
  | 'total'
  | 'amountPaid'
  | 'balanceDue'

export function TotalsBlockElement({ element, totals, config }: Props) {
  const show = (element.config?.show as TotalsKey[]) ?? [
    'subTotal',
    'tax1',
    'total',
    'balanceDue',
  ]
  const currency = config.currency || 'USD'

  const rows: Array<{ key: TotalsKey; label: string; value: string; bold?: boolean }> = [
    { key: 'subTotal', label: 'Sub Total', value: formatCurrency(totals.subTotal, currency) },
    {
      key: 'discount',
      label: 'Discount',
      value: `− ${formatCurrency(totals.overallDiscount, currency)}`,
    },
    {
      key: 'tax1',
      label: `${config.tax1.label || 'Tax'} (${config.tax1.rate}%)`,
      value: formatCurrency(totals.tax1Amount, currency),
    },
    {
      key: 'tax2',
      label: `${config.tax2.label || 'Tax 2'} (${config.tax2.rate}%)`,
      value: formatCurrency(totals.tax2Amount, currency),
    },
    { key: 'shipping', label: 'Shipping', value: formatCurrency(totals.shipping, currency) },
    { key: 'adjustment', label: 'Adjustment', value: formatCurrency(totals.adjustment, currency) },
    { key: 'total', label: 'Total', value: formatCurrency(totals.total, currency), bold: true },
    { key: 'amountPaid', label: 'Amount Paid', value: formatCurrency(totals.amountPaid, currency) },
    {
      key: 'balanceDue',
      label: 'Balance Due',
      value: formatCurrency(totals.balanceDue, currency),
      bold: true,
    },
  ]

  return (
    <div className="flex justify-end mt-4">
      <div className="min-w-64 text-sm">
        {rows
          .filter((r) => show.includes(r.key))
          .map((row) => (
            <div
              key={row.key}
              className={`flex justify-between gap-8 py-1 border-b last:border-b-0 ${
                row.bold ? 'font-semibold text-base' : 'text-muted-foreground'
              }`}
            >
              <span>{row.label}</span>
              <span>{row.value}</span>
            </div>
          ))}
      </div>
    </div>
  )
}
