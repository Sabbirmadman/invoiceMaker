import type { TemplateElement } from '@/types/template'

interface Props {
  element: TemplateElement
  current: number
  total: number
}

export function PageNumberElement({ element, current, total }: Props) {
  const format = (element.config?.format as string) ?? 'Page {{page.current}} of {{page.total}}'
  const text = format
    .replace('{{page.current}}', String(current))
    .replace('{{page.total}}', String(total))

  return (
    <div
      className="text-xs text-muted-foreground text-right"
      style={element.styles as React.CSSProperties}
    >
      {text}
    </div>
  )
}
