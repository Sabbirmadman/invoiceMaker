import type { TemplateElement } from '@/types/template'
import type { ClientData } from '@/types/document'
import { InlineField } from '@/components/fill-mode/InlineField'
import { useFillMode } from '@/components/fill-mode/FillModeContext'

interface Props {
  element: TemplateElement
  client: ClientData
}

export function BillToElement({ element, client }: Props) {
  const { fillMode, onUpdateClient } = useFillMode()

  if (fillMode) {
    return (
      <div className="text-sm leading-relaxed" style={element.styles as React.CSSProperties}>
        <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-1">Bill To</div>
        <InlineField value={client.name} onChange={(v) => onUpdateClient({ name: v })} placeholder="Client Name" className="font-semibold" />
        <InlineField value={client.company} onChange={(v) => onUpdateClient({ company: v })} placeholder="Company" />
        <InlineField value={client.address} onChange={(v) => onUpdateClient({ address: v })} placeholder="Address" />
        <div className="flex gap-1">
          <InlineField value={client.city} onChange={(v) => onUpdateClient({ city: v })} placeholder="City" />
          <InlineField value={client.state} onChange={(v) => onUpdateClient({ state: v })} placeholder="State" className="w-16" />
          <InlineField value={client.zip} onChange={(v) => onUpdateClient({ zip: v })} placeholder="ZIP" className="w-20" />
        </div>
        <InlineField value={client.country} onChange={(v) => onUpdateClient({ country: v })} placeholder="Country" />
        <InlineField value={client.phone} onChange={(v) => onUpdateClient({ phone: v })} placeholder="Phone" />
        <InlineField value={client.email} onChange={(v) => onUpdateClient({ email: v })} placeholder="Email" />
      </div>
    )
  }

  return (
    <div className="text-sm leading-relaxed" style={element.styles as React.CSSProperties}>
      <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-1">Bill To</div>
      {client.name && <div className="font-semibold">{client.name}</div>}
      {client.company && <div>{client.company}</div>}
      {client.address && <div>{client.address}</div>}
      {(client.city || client.state || client.zip) && (
        <div>{[client.city, client.state, client.zip].filter(Boolean).join(', ')}</div>
      )}
      {client.country && <div>{client.country}</div>}
      {client.phone && <div>{client.phone}</div>}
      {client.email && <div>{client.email}</div>}
    </div>
  )
}
