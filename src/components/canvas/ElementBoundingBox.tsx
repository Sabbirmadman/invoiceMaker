import { useEffect, useRef, useState } from 'react'

interface Bounds {
  x: number
  y: number
  w: number
  h: number
}

interface Props {
  elementRef: React.RefObject<HTMLElement | null>
  color: string
}

export function ElementBoundingBox({ elementRef, color }: Props) {
  const [bounds, setBounds] = useState<Bounds | null>(null)
  const observerRef = useRef<ResizeObserver | null>(null)

  useEffect(() => {
    const el = elementRef.current
    if (!el) return

    function measure() {
      const el = elementRef.current
      if (!el) return
      const page = el.closest<HTMLElement>('[data-canvas-page]')
      if (!page) return
      const elRect = el.getBoundingClientRect()
      const pageRect = page.getBoundingClientRect()
      setBounds({
        x: Math.round(elRect.left - pageRect.left),
        y: Math.round(elRect.top - pageRect.top),
        w: Math.round(elRect.width),
        h: Math.round(elRect.height),
      })
    }

    observerRef.current = new ResizeObserver(measure)
    observerRef.current.observe(el)
    measure()

    return () => {
      observerRef.current?.disconnect()
    }
  }, [elementRef])

  if (!bounds) return null

  return (
    <div
      className="absolute inset-0 pointer-events-none print:hidden"
      style={{ zIndex: 999, border: `1.5px dashed ${color}` }}
    >
      <span
        className="absolute top-0 left-0 font-mono leading-none"
        style={{
          fontSize: '8px',
          background: color,
          color: '#fff',
          padding: '1px 3px',
          borderBottomRightRadius: '3px',
          whiteSpace: 'nowrap',
        }}
      >
        x:{bounds.x} y:{bounds.y} | {bounds.w}×{bounds.h}
      </span>
    </div>
  )
}
