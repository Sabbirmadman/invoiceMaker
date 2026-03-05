export type DocumentType = 'invoice' | 'estimate' | 'receipt'
export type PageSize = 'A4' | 'Letter'
export type Orientation = 'portrait' | 'landscape'
export type AppMode = 'fill' | 'preview'

export const PAGE_DIMENSIONS = {
  A4: { width: 794, height: 1123 },      // px at 96dpi
  Letter: { width: 816, height: 1056 },
} as const
