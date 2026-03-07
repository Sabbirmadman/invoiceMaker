import { useState, useMemo, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, ImagePlus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CanvasPage } from '@/components/canvas/CanvasPage'
import { FillModeProvider } from '@/components/fill-mode/FillModeContext'
import { calculateTotals } from '@/services/calculations'
import { buildTemplateFromWizard, defaultWizardState } from '@/utils/buildTemplate'
import type { WizardState, ColumnConfig, HeaderElementSlot, FooterElementSlot } from '@/utils/buildTemplate'
import { addCustomTemplate, updateCustomTemplate } from '@/store/slices/templatesSlice'
import { selectAllTemplates } from '@/store'
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch'
import type { StoredDocument, TotalsResult } from '@/types/document'
import type { DocumentType } from '@/types/common'

// ── Sample data for live preview ─────────────────────────────────────
const PREVIEW_DOC_BASE: Omit<StoredDocument, 'templateSnapshot'> = {
  id: 'preview',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  documentType: 'invoice',
  data: {
    company: {
      name: 'Acme Corp',
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'USA',
      phone: '+1 555 000 0000',
      email: 'hello@acme.com',
      website: 'www.acme.com',
      taxId: 'TAX-123456',
      logoUrl: '',
    },
    client: {
      name: 'Jane Smith',
      company: 'Client LLC',
      address: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90001',
      country: 'USA',
      phone: '+1 555 111 2222',
      email: 'jane@client.com',
      taxId: '',
      shippingAddress: '456 Oak Ave, Los Angeles CA 90001',
    },
    meta: {
      type: 'invoice',
      number: 'INV-0001',
      date: '2025-01-15',
      dueDate: '2025-02-15',
      terms: 'Net 30',
      poNumber: 'PO-999',
      projectName: 'Sample Project',
      reference: '',
      placeOfSupply: '',
      currency: 'USD',
    },
    items: [
      { id: 'i1', name: 'Design Services', description: 'UI/UX design', qty: 10, unit: 'hrs', rate: 150, discount: 0, discountType: 'flat', taxRate: 10, amount: 1500 },
      { id: 'i2', name: 'Development', description: 'Frontend build', qty: 20, unit: 'hrs', rate: 120, discount: 0, discountType: 'flat', taxRate: 10, amount: 2400 },
      { id: 'i3', name: 'Consulting', description: '', qty: 5, unit: 'hrs', rate: 200, discount: 0, discountType: 'flat', taxRate: 0, amount: 1000 },
    ],
    totalsConfig: {
      overallDiscount: 0,
      overallDiscountType: 'flat',
      tax1: { label: 'Tax (10%)', rate: 10, enabled: true },
      tax2: { label: 'GST', rate: 0, enabled: false },
      shipping: 0,
      adjustment: 0,
      amountPaid: 0,
      currency: 'USD',
    },
    notes: 'Thank you for your business!',
    terms: 'Payment due within 30 days.',
  },
}

const PREVIEW_TOTALS: TotalsResult = {
  subTotal: 4900,
  itemDiscountTotal: 0,
  overallDiscount: 0,
  tax1Amount: 390,
  tax2Amount: 0,
  shipping: 0,
  adjustment: 0,
  total: 5290,
  amountPaid: 0,
  balanceDue: 5290,
}

// ── Step definitions ─────────────────────────────────────────────────
const STEPS = ['Basics', 'Theme', 'Header', 'Body & Footer']

const HEADER_SLOT_OPTIONS: { value: HeaderElementSlot; label: string }[] = [
  { value: 'empty', label: 'Empty' },
  { value: 'companyDetails', label: 'Company Details' },
  { value: 'logo', label: 'Logo' },
  { value: 'detailsBlock', label: 'Invoice / Estimate / Receipt Details' },
  { value: 'textLabel', label: 'Text Label (e.g. INVOICE)' },
]

const FOOTER_SLOT_OPTIONS: { value: FooterElementSlot; label: string }[] = [
  { value: 'empty', label: 'Empty' },
  { value: 'notes', label: 'Notes' },
  { value: 'termsConditions', label: 'Terms & Conditions' },
  { value: 'pageNumber', label: 'Page Number' },
]

const FONT_OPTIONS = [
  { value: 'system-ui, sans-serif', label: 'System UI (default)' },
  { value: 'Georgia, serif', label: 'Georgia (serif)' },
  { value: '"Courier New", monospace', label: 'Courier New (mono)' },
  { value: 'Arial, sans-serif', label: 'Arial' },
]

const ITEM_COLUMN_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'description', label: 'Description' },
  { value: 'qty', label: 'Qty' },
  { value: 'rate', label: 'Rate' },
  { value: 'tax', label: 'Tax %' },
  { value: 'amount', label: 'Amount' },
]

const TOTALS_ROW_OPTIONS = [
  { value: 'subTotal', label: 'Subtotal' },
  { value: 'tax1', label: 'Tax 1' },
  { value: 'tax2', label: 'Tax 2' },
  { value: 'shipping', label: 'Shipping' },
  { value: 'discount', label: 'Discount' },
  { value: 'total', label: 'Total' },
  { value: 'balanceDue', label: 'Balance Due' },
]

// ── Helpers ──────────────────────────────────────────────────────────
function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="size-8 rounded border cursor-pointer shrink-0 overflow-hidden"
        style={{ backgroundColor: value }}
      >
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="opacity-0 w-full h-full cursor-pointer"
        />
      </div>
      <div className="flex-1">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 text-xs font-mono mt-0.5"
        />
      </div>
    </div>
  )
}

function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-4" />
      <span className="text-sm">{label}</span>
    </label>
  )
}

function ImageUploadInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (dataUrl: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5 MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => onChange(reader.result as string)
    reader.readAsDataURL(file)
  }

  if (value) {
    return (
      <div>
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <div className="mt-1 relative rounded overflow-hidden border" style={{ height: 60 }}>
          <img src={value} alt="background" className="w-full h-full object-cover" />
          <button
            onClick={() => onChange('')}
            className="absolute top-1 right-1 bg-white rounded-full shadow p-0.5"
            title="Remove image"
          >
            <X className="size-3 text-destructive" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <button
        onClick={() => inputRef.current?.click()}
        className="mt-1 flex items-center gap-2 w-full border border-dashed rounded px-3 py-2 text-xs text-muted-foreground hover:border-blue-400 hover:text-blue-500 transition-colors"
      >
        <ImagePlus className="size-4 shrink-0" />
        <span>Upload image…</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
            e.target.value = ''
          }}
        />
      </button>
    </div>
  )
}

function BgSizeSelect({ value, onChange }: { value: string; onChange: (v: 'cover' | 'contain' | 'repeat') => void }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">Image Fit</Label>
      <Select value={value} onValueChange={(v) => onChange(v as 'cover' | 'contain' | 'repeat')}>
        <SelectTrigger className="h-8 mt-1">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="cover">Cover (fill, crop)</SelectItem>
          <SelectItem value="contain">Contain (fit, no crop)</SelectItem>
          <SelectItem value="repeat">Tile (repeat)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

// ── Column configurator (shared for header & footer) ──────────────────
function ColumnConfigurator({
  columns,
  onChange,
  slotOptions,
  sectionType,
}: {
  columns: ColumnConfig[]
  onChange: (cols: ColumnConfig[]) => void
  slotOptions: { value: string; label: string }[]
  sectionType: 'header' | 'footer'
}) {
  const numCols = columns.length

  function setNumCols(n: number) {
    if (n === numCols) return
    if (n > numCols) {
      const remaining = 100 - columns.reduce((sum, c) => sum + parseFloat(c.width), 0)
      const newCols = [...columns]
      for (let i = numCols; i < n; i++) {
        newCols.push({ width: `${Math.max(10, remaining)}%`, element: 'empty' })
      }
      onChange(newCols)
    } else {
      onChange(columns.slice(0, n))
    }
  }

  function updateCol(i: number, patch: Partial<ColumnConfig>) {
    const next = columns.map((c, idx) => (idx === i ? { ...c, ...patch } : c))
    onChange(next)
  }

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs text-muted-foreground">Number of columns</Label>
        <Select value={String(numCols)} onValueChange={(v) => setNumCols(Number(v))}>
          <SelectTrigger className="h-8 mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sectionType === 'header' ? (
              <>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
              </>
            ) : (
              <>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
      </div>

      {columns.map((col, i) => (
        <div key={i} className="border rounded p-3 space-y-2 bg-muted/30">
          <p className="text-xs font-medium text-muted-foreground">Column {i + 1}</p>
          <div>
            <Label className="text-xs text-muted-foreground">Width (e.g. 50%)</Label>
            <Input
              value={col.width}
              onChange={(e) => updateCol(i, { width: e.target.value })}
              className="h-7 text-xs mt-0.5"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Element</Label>
            <Select
              value={col.element}
              onValueChange={(v) => updateCol(i, { element: v as HeaderElementSlot & FooterElementSlot })}
            >
              <SelectTrigger className="h-8 mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {slotOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {col.element === 'textLabel' && (
            <div>
              <Label className="text-xs text-muted-foreground">Label text</Label>
              <Input
                value={col.textLabelText ?? 'INVOICE'}
                onChange={(e) => updateCol(i, { textLabelText: e.target.value })}
                className="h-7 text-xs mt-0.5"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────
export default function TemplateEditorPage() {
  const navigate = useNavigate()
  const { id: editId } = useParams<{ id?: string }>()
  const dispatch = useAppDispatch()
  const allTemplates = useAppSelector(selectAllTemplates)

  const existingTemplate = editId ? allTemplates.find((t) => t.id === editId) : undefined

  const [step, setStep] = useState(0)
  const [state, setState] = useState<WizardState>(() => {
    if (existingTemplate) {
      // Reconstruct wizard state from existing template (best-effort)
      return defaultWizardState()
    }
    return defaultWizardState()
  })

  function patch(partial: Partial<WizardState>) {
    setState((s) => ({ ...s, ...partial }))
  }

  // Build live preview doc
  const previewTemplate = useMemo(() => buildTemplateFromWizard(state, 'preview_tmpl'), [state])
  const previewDoc: StoredDocument = useMemo(() => ({
    ...PREVIEW_DOC_BASE,
    documentType: state.documentType,
    templateSnapshot: previewTemplate,
    data: {
      ...PREVIEW_DOC_BASE.data,
      meta: state.documentType === 'estimate'
        ? { type: 'estimate', number: 'EST-0001', date: '2025-01-15', expiryDate: '2025-02-15', reference: '', poNumber: '', projectName: '', currency: 'USD' }
        : state.documentType === 'receipt'
        ? { type: 'receipt', number: 'REC-0001', issueDate: '2025-01-15', paymentDate: '2025-01-15', paymentMethod: 'Credit Card', transactionId: 'TXN-001', relatedInvoiceNumber: 'INV-001', currency: 'USD' }
        : PREVIEW_DOC_BASE.data.meta,
    },
  }), [previewTemplate, state.documentType])

  const previewTotals: TotalsResult = useMemo(
    () => calculateTotals(previewDoc.data.items, previewDoc.data.totalsConfig),
    [previewDoc],
  )

  function handleSave() {
    const template = buildTemplateFromWizard(state, editId)
    if (editId) {
      dispatch(updateCustomTemplate(template))
    } else {
      dispatch(addCustomTemplate(template))
    }
    navigate('/')
  }

  const canGoNext = step < STEPS.length - 1
  const canGoBack = step > 0

  // ── Step renders ────────────────────────────────────────────────────
  function renderStep() {
    switch (step) {
      case 0:
        return (
          <div className="space-y-5">
            <div>
              <Label>Template Name</Label>
              <Input
                value={state.name}
                onChange={(e) => patch({ name: e.target.value })}
                className="mt-1"
                placeholder="My Invoice Template"
              />
            </div>
            <div>
              <Label>Document Type</Label>
              <div className="flex gap-2 mt-2">
                {(['invoice', 'estimate', 'receipt'] as DocumentType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => patch({ documentType: t })}
                    className={`flex-1 py-2 rounded border text-sm capitalize transition-colors ${
                      state.documentType === t
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background hover:bg-muted'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Page Size</Label>
              <div className="flex gap-2 mt-2">
                {(['A4', 'Letter'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => patch({ pageSize: p })}
                    className={`flex-1 py-2 rounded border text-sm transition-colors ${
                      state.pageSize === p
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background hover:bg-muted'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-5">
            <ColorInput label="Primary Color" value={state.primaryColor} onChange={(v) => patch({ primaryColor: v })} />
            <ColorInput label="Accent Color" value={state.accentColor} onChange={(v) => patch({ accentColor: v })} />
            <div>
              <Label>Font Family</Label>
              <Select value={state.fontFamily} onValueChange={(v) => patch({ fontFamily: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Header Height (px)</Label>
                <Input
                  type="number"
                  min={60}
                  max={300}
                  value={state.headerHeight}
                  onChange={(e) => patch({ headerHeight: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Background Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="size-8 rounded border overflow-hidden shrink-0" style={{ backgroundColor: state.headerBackground }}>
                    <input type="color" value={state.headerBackground} onChange={(e) => patch({ headerBackground: e.target.value })} className="opacity-0 w-full h-full cursor-pointer" />
                  </div>
                  <Input value={state.headerBackground} onChange={(e) => patch({ headerBackground: e.target.value })} className="h-7 text-xs font-mono" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <ImageUploadInput
                label="Header Background Image"
                value={state.headerBackgroundImage}
                onChange={(v) => patch({ headerBackgroundImage: v })}
              />
              {state.headerBackgroundImage && (
                <BgSizeSelect value={state.headerBackgroundSize} onChange={(v) => patch({ headerBackgroundSize: v })} />
              )}
            </div>
            {state.headerColumns.some((c) => c.element === 'logo') && (
              <div className="space-y-3 border rounded p-3 bg-muted/30">
                <p className="text-xs font-medium text-muted-foreground">Logo Options</p>
                <div>
                  <Label className="text-xs text-muted-foreground">Max Height (px)</Label>
                  <Input
                    value={state.logoMaxHeight}
                    onChange={(e) => patch({ logoMaxHeight: e.target.value })}
                    className="h-7 text-xs mt-0.5"
                    placeholder="e.g. 80px"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Fit Mode</Label>
                  <Select value={state.logoFit} onValueChange={(v) => patch({ logoFit: v as typeof state.logoFit })}>
                    <SelectTrigger className="h-8 mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contain">Contain (letterbox)</SelectItem>
                      <SelectItem value="cover">Cover (fill, crop)</SelectItem>
                      <SelectItem value="fill">Stretch (fill cell)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <div>
              <Label className="mb-2 block">Column Layout</Label>
              <ColumnConfigurator
                columns={state.headerColumns}
                onChange={(cols) => patch({ headerColumns: cols })}
                slotOptions={HEADER_SLOT_OPTIONS}
                sectionType="header"
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            {/* Body elements */}
            <div>
              <p className="text-sm font-medium mb-3">Body Elements</p>
              <div className="space-y-2">
                <CheckRow label="Bill To" checked={state.showBillTo} onChange={(v) => patch({ showBillTo: v })} />
                <CheckRow label="Ship To" checked={state.showShipTo} onChange={(v) => patch({ showShipTo: v })} />
                <CheckRow
                  label={`${state.documentType.charAt(0).toUpperCase() + state.documentType.slice(1)} Details (in body)`}
                  checked={state.showDetailsBlock}
                  onChange={(v) => patch({ showDetailsBlock: v })}
                />
                <CheckRow label="Notes" checked={state.showNotes} onChange={(v) => patch({ showNotes: v })} />
                <CheckRow label="Terms & Conditions" checked={state.showTerms} onChange={(v) => patch({ showTerms: v })} />
              </div>
            </div>

            {/* Item list columns */}
            <div>
              <p className="text-sm font-medium mb-2">Item List Columns</p>
              <div className="grid grid-cols-2 gap-1">
                {ITEM_COLUMN_OPTIONS.map((col) => (
                  <label key={col.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={state.itemColumns.includes(col.value)}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...state.itemColumns, col.value]
                          : state.itemColumns.filter((c) => c !== col.value)
                        patch({ itemColumns: next.length > 0 ? next : state.itemColumns })
                      }}
                      className="size-4"
                    />
                    <span className="text-sm">{col.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Item list colors */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Item List Colors</p>
              <ColorInput label="Header Background" value={state.itemHeaderBackground} onChange={(v) => patch({ itemHeaderBackground: v })} />
              <ColorInput label="Header Text" value={state.itemHeaderColor} onChange={(v) => patch({ itemHeaderColor: v })} />
              <ColorInput label="Alternate Row" value={state.itemAlternateRowColor} onChange={(v) => patch({ itemAlternateRowColor: v })} />
            </div>

            {/* Totals rows */}
            <div>
              <p className="text-sm font-medium mb-2">Totals Block Rows</p>
              <div className="grid grid-cols-2 gap-1">
                {TOTALS_ROW_OPTIONS.map((row) => (
                  <label key={row.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={state.totalsShow.includes(row.value)}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...state.totalsShow, row.value]
                          : state.totalsShow.filter((r) => r !== row.value)
                        patch({ totalsShow: next })
                      }}
                      className="size-4"
                    />
                    <span className="text-sm">{row.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Page / body background */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Page Background</p>
              <div className="flex items-center gap-3">
                <div
                  className="size-8 rounded border cursor-pointer shrink-0 overflow-hidden"
                  style={{ backgroundColor: state.bodyBackgroundColor || '#ffffff' }}
                >
                  <input
                    type="color"
                    value={state.bodyBackgroundColor || '#ffffff'}
                    onChange={(e) => patch({ bodyBackgroundColor: e.target.value === '#ffffff' ? '' : e.target.value })}
                    className="opacity-0 w-full h-full cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">Background Color</Label>
                  <Input
                    value={state.bodyBackgroundColor}
                    onChange={(e) => patch({ bodyBackgroundColor: e.target.value })}
                    placeholder="#ffffff (leave blank for white)"
                    className="h-7 text-xs font-mono mt-0.5"
                  />
                </div>
              </div>
              <ImageUploadInput
                label="Page Background Image"
                value={state.bodyBackgroundImage}
                onChange={(v) => patch({ bodyBackgroundImage: v })}
              />
              {state.bodyBackgroundImage && (
                <BgSizeSelect value={state.bodyBackgroundSize} onChange={(v) => patch({ bodyBackgroundSize: v })} />
              )}
            </div>

            {/* Footer */}
            <div>
              <p className="text-sm font-medium mb-3">Footer</p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Height (px)</Label>
                  <Input
                    type="number"
                    min={40}
                    max={200}
                    value={state.footerHeight}
                    onChange={(e) => patch({ footerHeight: Number(e.target.value) })}
                    className="h-8 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Background Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="size-8 rounded border overflow-hidden shrink-0" style={{ backgroundColor: state.footerBackground }}>
                      <input type="color" value={state.footerBackground} onChange={(e) => patch({ footerBackground: e.target.value })} className="opacity-0 w-full h-full cursor-pointer" />
                    </div>
                    <Input value={state.footerBackground} onChange={(e) => patch({ footerBackground: e.target.value })} className="h-7 text-xs font-mono" />
                  </div>
                </div>
              </div>
              <div className="mb-3 space-y-2">
                <ImageUploadInput
                  label="Footer Background Image"
                  value={state.footerBackgroundImage}
                  onChange={(v) => patch({ footerBackgroundImage: v })}
                />
                {state.footerBackgroundImage && (
                  <BgSizeSelect value={state.footerBackgroundSize} onChange={(v) => patch({ footerBackgroundSize: v })} />
                )}
              </div>
              <div className="mb-3">
                <Label className="text-xs text-muted-foreground">Border Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="size-8 rounded border overflow-hidden shrink-0" style={{ backgroundColor: state.footerBorderColor }}>
                    <input type="color" value={state.footerBorderColor} onChange={(e) => patch({ footerBorderColor: e.target.value })} className="opacity-0 w-full h-full cursor-pointer" />
                  </div>
                  <Input value={state.footerBorderColor} onChange={(e) => patch({ footerBorderColor: e.target.value })} className="h-7 text-xs font-mono" />
                </div>
              </div>
              <ColumnConfigurator
                columns={state.footerColumns}
                onChange={(cols) => patch({ footerColumns: cols })}
                slotOptions={FOOTER_SLOT_OPTIONS}
                sectionType="footer"
              />
            </div>
          </div>
        )
    }
  }

  return (
    <FillModeProvider value={{
      fillMode: false,
      showBounds: false,
      docId: 'preview',
      onUpdateCompany: () => {},
      onUpdateClient: () => {},
      onUpdateInvoiceMeta: () => {},
      onUpdateEstimateMeta: () => {},
      onUpdateReceiptMeta: () => {},
      onUpdateItems: () => {},
      onUpdateTotalsConfig: () => {},
      onUpdateNotes: () => {},
      onUpdateTerms: () => {},
      onUpdateData: () => {},
    }}>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Top bar */}
        <header className="border-b bg-card shrink-0">
          <div className="max-w-screen-xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="size-4 mr-1" />
                Back
              </Button>
              <span className="text-muted-foreground">|</span>
              <h1 className="text-base font-semibold">
                {editId ? 'Edit Template' : 'New Template'}
              </h1>
            </div>
            <Button onClick={handleSave} size="sm">
              <Check className="size-4 mr-1" />
              Save Template
            </Button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Left: Wizard panel */}
          <div className="w-[380px] shrink-0 border-r flex flex-col bg-card">
            {/* Step tabs */}
            <div className="flex border-b">
              {STEPS.map((s, i) => (
                <button
                  key={s}
                  onClick={() => setStep(i)}
                  className={`flex-1 py-2.5 text-xs font-medium transition-colors border-b-2 ${
                    i === step
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {i + 1}. {s}
                </button>
              ))}
            </div>

            {/* Step content */}
            <div className="flex-1 overflow-y-auto p-5">
              {renderStep()}
            </div>

            {/* Navigation */}
            <div className="border-t p-4 flex justify-between">
              <Button
                variant="outline"
                size="sm"
                disabled={!canGoBack}
                onClick={() => setStep((s) => s - 1)}
              >
                Back
              </Button>
              {canGoNext ? (
                <Button size="sm" onClick={() => setStep((s) => s + 1)}>
                  Next
                </Button>
              ) : (
                <Button size="sm" onClick={handleSave}>
                  <Check className="size-4 mr-1" />
                  Save
                </Button>
              )}
            </div>
          </div>

          {/* Right: Live preview */}
          <div className="flex-1 overflow-auto bg-muted/30 flex flex-col items-center py-8">
            <p className="text-xs text-muted-foreground mb-4 uppercase tracking-widest">Live Preview</p>
            <div style={{ transform: 'scale(0.55)', transformOrigin: 'top center' }}>
              <CanvasPage
                doc={previewDoc}
                totals={previewTotals}
                pageNumber={1}
                totalPages={1}
                zoom={1}
              />
            </div>
          </div>
        </div>
      </div>
    </FillModeProvider>
  )
}
