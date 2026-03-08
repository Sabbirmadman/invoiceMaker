import type { TemplateElement } from '@/types/template'
import { InlineField } from '@/components/fill-mode/InlineField'
import { useFillMode } from '@/components/fill-mode/FillModeContext'

interface Props {
  element: TemplateElement
  notes: string
}

export function NotesElement({ element, notes }: Props) {
  const { fillMode, docId, onUpdateNotes } = useFillMode()

  const isEditorPreview = docId === 'preview'

  // In live preview/export: hide if no content
  if (!fillMode && !notes && !isEditorPreview) return null

  return (
    <div className="text-sm" style={element.styles as React.CSSProperties}>
      <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-1">Notes</div>
      {fillMode ? (
        <InlineField value={notes} onChange={onUpdateNotes} placeholder="Add notes..." multiline />
      ) : isEditorPreview && !notes ? (
        <p className="whitespace-pre-wrap text-muted-foreground/50 italic text-xs">Notes will appear here...</p>
      ) : (
        <p className="whitespace-pre-wrap">{notes}</p>
      )}
    </div>
  )
}
