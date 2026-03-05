import type { TemplateElement } from '@/types/template'
import { InlineField } from '@/components/fill-mode/InlineField'
import { useFillMode } from '@/components/fill-mode/FillModeContext'

interface Props {
  element: TemplateElement
  terms: string
}

export function TermsElement({ element, terms }: Props) {
  const { fillMode, onUpdateTerms } = useFillMode()

  return (
    <div className="text-sm" style={element.styles as React.CSSProperties}>
      <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-1">Terms & Conditions</div>
      {fillMode ? (
        <InlineField value={terms} onChange={onUpdateTerms} placeholder="Add terms & conditions..." multiline className="text-muted-foreground" />
      ) : terms ? (
        <p className="whitespace-pre-wrap text-muted-foreground">{terms}</p>
      ) : null}
    </div>
  )
}
