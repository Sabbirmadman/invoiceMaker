import type { TemplateElement } from '@/types/template'
import type { ClientData } from '@/types/document'
import { InlineField } from '@/components/fill-mode/InlineField'
import { useFillMode } from '@/components/fill-mode/FillModeContext'

interface Props {
  element: TemplateElement
  client: ClientData
}

function useFieldConfig(element: TemplateElement) {
  const f = (field: string) => {
    const fields = element.config?.fields as string[] | undefined
    return !fields || fields.includes(field)
  }
  const layout = (element.config?.layout as string | undefined) ?? 'vertical'
  const justify = (element.config?.justify as string | undefined) ?? 'stretch'
  const outerStyle: React.CSSProperties =
    layout === 'horizontal'
      ? { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '2px 20px', alignItems: 'baseline', justifyContent: justify === 'stretch' ? 'flex-start' : justify }
      : {}
  return { f, layout, outerStyle }
}

export function BillToElement({ element, client }: Props) {
  const { fillMode, onUpdateClient } = useFillMode()
  const { f, outerStyle } = useFieldConfig(element)

  if (fillMode) {
    return (
      <div className="text-sm leading-relaxed" style={element.styles as React.CSSProperties}>
        {f('label') && <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-1">Bill To</div>}
        <div style={outerStyle}>
          {f('name') && <InlineField value={client.name} onChange={(v) => onUpdateClient({ name: v })} placeholder="Client Name" className="font-semibold" />}
          {f('company') && <InlineField value={client.company} onChange={(v) => onUpdateClient({ company: v })} placeholder="Company" />}
          {f('address') && <InlineField value={client.address} onChange={(v) => onUpdateClient({ address: v })} placeholder="Address" />}
          {f('cityStateZip') && (
            <div className="flex gap-1">
              <InlineField value={client.city} onChange={(v) => onUpdateClient({ city: v })} placeholder="City" />
              <InlineField value={client.state} onChange={(v) => onUpdateClient({ state: v })} placeholder="State" className="w-16" />
              <InlineField value={client.zip} onChange={(v) => onUpdateClient({ zip: v })} placeholder="ZIP" className="w-20" />
            </div>
          )}
          {f('country') && <InlineField value={client.country} onChange={(v) => onUpdateClient({ country: v })} placeholder="Country" />}
          {f('phone') && <InlineField value={client.phone} onChange={(v) => onUpdateClient({ phone: v })} placeholder="Phone" />}
          {f('email') && <InlineField value={client.email} onChange={(v) => onUpdateClient({ email: v })} placeholder="Email" />}
        </div>
      </div>
    )
  }

  return (
    <div className="text-sm leading-relaxed" style={element.styles as React.CSSProperties}>
      {f('label') && <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-1">Bill To</div>}
      <div style={outerStyle}>
        {f('name') && client.name && <div className="font-semibold">{client.name}</div>}
        {f('company') && client.company && <div>{client.company}</div>}
        {f('address') && client.address && <div>{client.address}</div>}
        {f('cityStateZip') && (client.city || client.state || client.zip) && (
          <div className="flex gap-1 flex-wrap">
            {client.city && <span>{client.city}</span>}
            {client.state && <span>{client.state}</span>}
            {client.zip && <span>{client.zip}</span>}
          </div>
        )}
        {f('country') && client.country && <div>{client.country}</div>}
        {f('phone') && client.phone && <div>{client.phone}</div>}
        {f('email') && client.email && <div>{client.email}</div>}
      </div>
    </div>
  )
}
