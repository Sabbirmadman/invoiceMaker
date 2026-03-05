import type { TemplateElement } from '@/types/template'

interface Props {
  element: TemplateElement
}

export function WatermarkElement({ element }: Props) {
  const text = element.config?.text as string | undefined
  const opacity = (element.config?.opacity as number) ?? 0.08
  const rotate = (element.config?.rotate as number) ?? -30

  if (!text) return null

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
      style={{ zIndex: element.zIndex, opacity }}
      aria-hidden
    >
      <span
        className="text-6xl font-black uppercase select-none whitespace-nowrap"
        style={{ transform: `rotate(${rotate}deg)` }}
      >
        {text}
      </span>
    </div>
  )
}
