import type { TemplateElement } from '@/types/template'
import type { LineItem } from '@/types/document'
import { formatCurrency, calculateLineAmount } from '@/services/calculations'
import { useFillMode } from '@/components/fill-mode/FillModeContext'
import { Trash2, Plus } from 'lucide-react'

interface Props {
  element: TemplateElement
  items: LineItem[]
  currency?: string
  showHeader?: boolean
}

const DEFAULT_COLUMNS = ['name', 'description', 'qty', 'rate', 'tax', 'amount']

type ColKey = 'name' | 'description' | 'qty' | 'unit' | 'rate' | 'discount' | 'tax' | 'amount'

const COLUMN_LABELS: Record<ColKey, string> = {
  name: 'Item',
  description: 'Description',
  qty: 'Qty',
  unit: 'Unit',
  rate: 'Rate',
  discount: 'Discount',
  tax: 'Tax %',
  amount: 'Amount',
}

const COLUMN_ALIGN: Record<ColKey, string> = {
  name: 'text-left',
  description: 'text-left',
  qty: 'text-right',
  unit: 'text-right',
  rate: 'text-right',
  discount: 'text-right',
  tax: 'text-right',
  amount: 'text-right',
}

function newItem(): LineItem {
  return {
    id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: '',
    description: '',
    qty: 1,
    unit: '',
    rate: 0,
    discount: 0,
    discountType: 'flat',
    taxRate: 0,
    amount: 0,
  }
}

export function ItemListElement({ element, items, currency = 'USD', showHeader = true }: Props) {
  const { fillMode, onUpdateItems } = useFillMode()
  const columns = (element.config?.columns as ColKey[]) ?? DEFAULT_COLUMNS
  const headerBg = element.styles?.headerBackground ?? '#111111'
  const headerColor = element.styles?.headerColor ?? '#ffffff'
  const altRowColor = element.styles?.alternateRowColor ?? '#f9fafb'

  function updateItem(idx: number, patch: Partial<LineItem>) {
    const updated = items.map((item, i) => {
      if (i !== idx) return item
      const merged = { ...item, ...patch }
      merged.amount = calculateLineAmount(merged)
      return merged
    })
    onUpdateItems(updated)
  }

  function addItem() {
    onUpdateItems([...items, newItem()])
  }

  function removeItem(idx: number) {
    onUpdateItems(items.filter((_, i) => i !== idx))
  }

  return (
    <div className="w-full text-sm">
      {showHeader && (
        <div className="flex w-full" style={{ backgroundColor: headerBg, color: headerColor }}>
          {fillMode && <div className="w-8 shrink-0" />}
          <div className="w-8 px-3 py-2 text-left font-medium shrink-0">#</div>
          {columns.map((col) => (
            <div key={col} className={`flex-1 px-3 py-2 font-medium ${COLUMN_ALIGN[col]}`}>
              {COLUMN_LABELS[col]}
            </div>
          ))}
        </div>
      )}

      {items.length === 0 && !fillMode ? (
        <div className="text-muted-foreground text-center py-6 text-sm border-b">No items yet</div>
      ) : (
        items.map((item, idx) => (
          <div
            key={item.id}
            className="flex w-full border-b items-start group"
            style={{ backgroundColor: idx % 2 === 1 ? altRowColor : '#ffffff' }}
          >
            {fillMode && (
              <button
                onClick={() => removeItem(idx)}
                className="w-8 px-1 py-2 text-muted-foreground hover:text-destructive shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="size-3" />
              </button>
            )}
            <div className="w-8 px-3 py-2 text-muted-foreground shrink-0">{idx + 1}</div>
            {columns.map((col) => (
              <div key={col} className={`flex-1 px-2 py-1 ${COLUMN_ALIGN[col]}`}>
                {fillMode && col !== 'amount'
                  ? renderEditCell(col, item, idx, updateItem)
                  : renderCell(col, item, currency)}
              </div>
            ))}
          </div>
        ))
      )}

      {fillMode && (
        <button
          onClick={addItem}
          className="flex items-center gap-2 mt-2 px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded transition-colors"
        >
          <Plus className="size-3" />
          Add Row
        </button>
      )}
    </div>
  )
}

function renderCell(col: ColKey, item: LineItem, currency: string): string {
  switch (col) {
    case 'name': return item.name
    case 'description': return item.description
    case 'qty': return String(item.qty)
    case 'unit': return item.unit
    case 'rate': return formatCurrency(item.rate, currency)
    case 'discount':
      return item.discountType === 'percent' ? `${item.discount}%` : formatCurrency(item.discount, currency)
    case 'tax': return `${item.taxRate}%`
    case 'amount': return formatCurrency(item.amount, currency)
    default: return ''
  }
}

function renderEditCell(
  col: ColKey,
  item: LineItem,
  idx: number,
  updateItem: (idx: number, patch: Partial<LineItem>) => void,
): React.ReactNode {
  const inputClass = 'w-full bg-transparent border border-transparent hover:border-blue-300 focus:border-blue-500 focus:outline-none rounded px-1 text-sm'

  switch (col) {
    case 'name':
      return <input className={inputClass} value={item.name} onChange={(e) => updateItem(idx, { name: e.target.value })} placeholder="Item name" />
    case 'description':
      return <input className={inputClass} value={item.description} onChange={(e) => updateItem(idx, { description: e.target.value })} placeholder="Description" />
    case 'qty':
      return (
        <input
          className={`${inputClass} text-right`}
          type="number"
          value={item.qty}
          min={0}
          onChange={(e) => updateItem(idx, { qty: parseFloat(e.target.value) || 0 })}
        />
      )
    case 'unit':
      return <input className={inputClass} value={item.unit} onChange={(e) => updateItem(idx, { unit: e.target.value })} placeholder="pcs" />
    case 'rate':
      return (
        <input
          className={`${inputClass} text-right`}
          type="number"
          value={item.rate}
          min={0}
          step={0.01}
          onChange={(e) => updateItem(idx, { rate: parseFloat(e.target.value) || 0 })}
        />
      )
    case 'discount':
      return (
        <input
          className={`${inputClass} text-right`}
          type="number"
          value={item.discount}
          min={0}
          step={0.01}
          onChange={(e) => updateItem(idx, { discount: parseFloat(e.target.value) || 0 })}
        />
      )
    case 'tax':
      return (
        <input
          className={`${inputClass} text-right`}
          type="number"
          value={item.taxRate}
          min={0}
          max={100}
          step={0.1}
          onChange={(e) => updateItem(idx, { taxRate: parseFloat(e.target.value) || 0 })}
        />
      )
    default:
      return null
  }
}
