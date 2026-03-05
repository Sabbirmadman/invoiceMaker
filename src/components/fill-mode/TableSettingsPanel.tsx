import type { StoredDocument } from '@/types/document'
import type { ColKey } from '@/components/elements/ItemListElement'

const ALL_COLUMNS: { key: ColKey; label: string; required: boolean }[] = [
  { key: 'name', label: 'Item', required: true },
  { key: 'description', label: 'Description', required: false },
  { key: 'qty', label: 'Qty', required: false },
  { key: 'unit', label: 'Unit', required: false },
  { key: 'rate', label: 'Rate', required: false },
  { key: 'discount', label: 'Discount', required: false },
  { key: 'tax', label: 'Tax %', required: false },
  { key: 'amount', label: 'Amount', required: true },
]

const DEFAULT_COLUMNS: ColKey[] = ['name', 'description', 'qty', 'rate', 'tax', 'amount']

interface Props {
  doc: StoredDocument
  onUpdateConfig: (config: Record<string, unknown>) => void
}

export function TableSettingsPanel({ doc, onUpdateConfig }: Props) {
  const itemListEl = doc.templateSnapshot.body.elements.find((el) => el.type === 'itemList')
  const currentColumns = (itemListEl?.config?.columns as ColKey[]) ?? DEFAULT_COLUMNS
  const maxRowsPerPage = (itemListEl?.config?.maxRowsPerPage as number) ?? 0

  function toggleColumn(key: ColKey, enabled: boolean) {
    let next: ColKey[]
    if (enabled) {
      // Insert at canonical position
      next = ALL_COLUMNS.map((c) => c.key).filter(
        (k) => k === key || currentColumns.includes(k),
      )
    } else {
      next = currentColumns.filter((k) => k !== key)
    }
    onUpdateConfig({ columns: next })
  }

  function setMaxRows(value: string) {
    const n = parseInt(value, 10)
    onUpdateConfig({ maxRowsPerPage: isNaN(n) || n < 0 ? 0 : n })
  }

  return (
    <div className="w-64 shrink-0 border-l bg-card flex flex-col text-sm">
      <div className="px-4 py-3 border-b font-medium text-xs uppercase tracking-wide text-muted-foreground">
        Table Settings
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 border-b space-y-3">
        <p className="font-medium">Pagination</p>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Max rows per page</label>
          <input
            type="number"
            min={0}
            value={maxRowsPerPage === 0 ? '' : maxRowsPerPage}
            placeholder="Auto"
            onChange={(e) => setMaxRows(e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <p className="text-xs text-muted-foreground">
            Leave empty to fill each page automatically
          </p>
        </div>
      </div>

      {/* Column visibility */}
      <div className="px-4 py-3 space-y-2">
        <p className="font-medium">Columns</p>
        {ALL_COLUMNS.map(({ key, label, required }) => (
          <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={currentColumns.includes(key)}
              disabled={required}
              onChange={(e) => toggleColumn(key, e.target.checked)}
              className="rounded"
            />
            <span className={required ? 'text-muted-foreground' : ''}>{label}</span>
            {required && (
              <span className="text-xs text-muted-foreground ml-auto">always</span>
            )}
          </label>
        ))}
      </div>
    </div>
  )
}
