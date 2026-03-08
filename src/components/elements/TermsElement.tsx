import type { TemplateElement } from '@/types/template'
import { InlineField } from '@/components/fill-mode/InlineField'
import { useFillMode } from '@/components/fill-mode/FillModeContext'

interface Props {
  element: TemplateElement
  terms: string
}

export function TermsElement({ element, terms }: Props) {
  const { fillMode, docId, onUpdateTerms } = useFillMode()

  const isEditorPreview = docId === 'preview'

  // In live preview/export: hide if no content
  if (!fillMode && !terms && !isEditorPreview) return null

  return (
    <div className="text-sm" style={element.styles as React.CSSProperties}>
      <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-1">Terms &amp; Conditions</div>
      {fillMode ? (
        <InlineField value={terms} onChange={onUpdateTerms} placeholder="Add terms &amp; conditions..." multiline className="text-muted-foreground" />
      ) : isEditorPreview && !terms ? (
        <p className="whitespace-pre-wrap text-muted-foreground/50 italic text-xs">Terms &amp; conditions will appear here...</p>
      ) : (
        <p className="whitespace-pre-wrap text-muted-foreground">{terms}</p>
      )}
    </div>
  )
}
