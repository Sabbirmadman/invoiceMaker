import type { TemplateElement } from '@/types/template'
import type { CompanyData } from '@/types/document'

interface Props {
  element: TemplateElement
  company: CompanyData
}

export function LogoElement({ element, company }: Props) {
  if (!company.logoUrl) {
    return (
      <div
        className="flex items-center justify-center border-2 border-dashed border-muted-foreground/30 rounded text-muted-foreground text-xs"
        style={{ height: element.styles?.maxHeight ?? '80px', ...element.styles }}
      >
        Logo
      </div>
    )
  }
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
