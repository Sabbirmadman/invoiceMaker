import { useState } from 'react'
import { Upload, X } from 'lucide-react'
import type { TemplateElement } from '@/types/template'
import type { CompanyData } from '@/types/document'
import { useFillMode } from '@/components/fill-mode/FillModeContext'

interface Props {
  element: TemplateElement
  company: CompanyData
}

export function LogoElement({ element, company }: Props) {
  const { fillMode, onUpdateCompany } = useFillMode()
  const [isDragOver, setIsDragOver] = useState(false)

  function readFile(file: File) {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => onUpdateCompany({ logoUrl: reader.result as string })
    reader.readAsDataURL(file)
  }

  if (fillMode) {
    if (company.logoUrl) {
      return (
        <div className="relative group inline-block">
          <img
            src={company.logoUrl}
            alt="Company logo"
            style={{ maxHeight: element.styles?.maxHeight ?? '80px', objectFit: 'contain' }}
          />
          <button
            onClick={() => onUpdateCompany({ logoUrl: '' })}
            className="absolute top-0 right-0 bg-white rounded-full shadow p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Remove logo"
          >
            <X className="size-3 text-destructive" />
          </button>
        </div>
      )
    }

    return (
      <div
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setIsDragOver(true)}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragOver(false)
          const file = e.dataTransfer.files?.[0]
          if (file) readFile(file)
        }}
        className={`relative flex flex-col items-center justify-center gap-1 border-2 border-dashed rounded text-muted-foreground text-xs transition-colors cursor-pointer ${
          isDragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-muted-foreground/30 hover:border-blue-400 hover:bg-blue-50/50'
        }`}
        style={{ height: element.styles?.maxHeight ?? '80px' }}
      >
        {/* Invisible file input overlays the entire zone so click lands directly on it */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) readFile(file)
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <Upload className="size-4" />
        <span>{isDragOver ? 'Drop image here' : 'Upload Logo'}</span>
      </div>
    )
  }

  if (!company.logoUrl) return null

  return (
    <img
      src={company.logoUrl}
      alt="Company logo"
      style={{
        maxHeight: element.styles?.maxHeight ?? '80px',
        objectFit: 'contain',
        ...element.styles,
      }}
    />
  )
}
