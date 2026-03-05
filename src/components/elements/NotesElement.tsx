import type { TemplateElement } from '@/types/template'
import { InlineField } from '@/components/fill-mode/InlineField'
import { useFillMode } from '@/components/fill-mode/FillModeContext'

interface Props {
  element: TemplateElement
  notes: string
}

export function NotesElement({ element, notes }: Props) {
  const { fillMode, onUpdateNotes } = useFillMode()

  return (
    <div className="text-sm" style={element.styles as React.CSSProperties}>
      <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-1">Notes</div>
      {fillMode ? (
        <InlineField value={notes} onChange={onUpdateNotes} placeholder="Add notes..." multiline />
      ) : notes ? (
        <p className="whitespace-pre-wrap">{notes}</p>
      ) : null}
    </div>
  )
}
