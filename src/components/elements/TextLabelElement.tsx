import type { TemplateElement } from '@/types/template'

interface Props {
  element: TemplateElement
}

export function TextLabelElement({ element }: Props) {
  const text = element.config?.text as string | undefined
  return (
    <div
      className="text-sm"
      style={element.styles as React.CSSProperties}
    >
      {text ?? ''}
    </div>
  )
}
