import type { TemplateElement } from '@/types/template'
import type { ClientData } from '@/types/document'

interface Props {
  element: TemplateElement
  client: ClientData
}

export function ShipToElement({ element, client }: Props) {
  if (!client.shippingAddress) return null
  return (
    <div className="text-sm leading-relaxed" style={element.styles as React.CSSProperties}>
      <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-1">
        Ship To
      </div>
      <div>{client.shippingAddress}</div>
    </div>
  )
}
