import type { TemplateElement } from '@/types/template'

interface Props {
  element: TemplateElement
}

export function DividerElement({ element }: Props) {
  return (
    <hr
      className="border-border my-2"
      style={element.styles as React.CSSProperties}
    />
  )
}
