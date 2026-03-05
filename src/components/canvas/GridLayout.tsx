import type { ReactNode } from 'react'
import type { Grid, GridArea } from '@/types/template'

interface GridLayoutProps {
  grid: Grid
  children: ReactNode
  className?: string
}

export function GridLayout({ grid, children, className }: GridLayoutProps) {
  const cols = grid.columns.map((c) => c.width).join(' ')
  const rows = grid.rows.map((r) => r.height).join(' ')

  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: cols,
        gridTemplateRows: rows,
        width: '100%',
        height: '100%',
      }}
    >
      {children}
    </div>
  )
}

interface GridCellProps {
  gridArea: GridArea
  grid: Grid
  children: ReactNode
  className?: string
}

export function GridCell({ gridArea, grid, children, className }: GridCellProps) {
  const colIndex = grid.columns.findIndex((c) => c.id === gridArea.col) + 1
  const rowIndex = grid.rows.findIndex((r) => r.id === gridArea.row) + 1
  const colSpan = gridArea.colSpan ?? 1
  const rowSpan = gridArea.rowSpan ?? 1

  return (
    <div
      className={className}
      style={{
        gridColumn: `${colIndex} / span ${colSpan}`,
        gridRow: `${rowIndex} / span ${rowSpan}`,
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  )
}
