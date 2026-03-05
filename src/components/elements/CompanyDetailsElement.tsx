import type { TemplateElement } from '@/types/template'
import type { CompanyData } from '@/types/document'
import { InlineField } from '@/components/fill-mode/InlineField'
import { useFillMode } from '@/components/fill-mode/FillModeContext'

interface Props {
  element: TemplateElement
  company: CompanyData
}

export function CompanyDetailsElement({ element, company }: Props) {
  const { fillMode, onUpdateCompany } = useFillMode()

  if (fillMode) {
    return (
      <div className="text-sm leading-relaxed" style={element.styles as React.CSSProperties}>
        <InlineField value={company.name} onChange={(v) => onUpdateCompany({ name: v })} placeholder="Company Name" className="font-semibold text-base" />
        <InlineField value={company.address} onChange={(v) => onUpdateCompany({ address: v })} placeholder="Address" />
        <div className="flex gap-1">
          <InlineField value={company.city} onChange={(v) => onUpdateCompany({ city: v })} placeholder="City" />
          <InlineField value={company.state} onChange={(v) => onUpdateCompany({ state: v })} placeholder="State" className="w-16" />
          <InlineField value={company.zip} onChange={(v) => onUpdateCompany({ zip: v })} placeholder="ZIP" className="w-20" />
        </div>
        <InlineField value={company.country} onChange={(v) => onUpdateCompany({ country: v })} placeholder="Country" />
        <InlineField value={company.phone} onChange={(v) => onUpdateCompany({ phone: v })} placeholder="Phone" />
        <InlineField value={company.email} onChange={(v) => onUpdateCompany({ email: v })} placeholder="Email" />
        <InlineField value={company.website} onChange={(v) => onUpdateCompany({ website: v })} placeholder="Website" />
        <InlineField value={company.taxId} onChange={(v) => onUpdateCompany({ taxId: v })} placeholder="Tax ID" />
      </div>
    )
  }

  return (
    <div className="text-sm leading-relaxed" style={element.styles as React.CSSProperties}>
      {company.name && <div className="font-semibold text-base">{company.name}</div>}
      {company.address && <div>{company.address}</div>}
      {(company.city || company.state || company.zip) && (
        <div>
          {[company.city, company.state, company.zip].filter(Boolean).join(', ')}
        </div>
      )}
      {company.country && <div>{company.country}</div>}
      {company.phone && <div>{company.phone}</div>}
      {company.email && <div>{company.email}</div>}
      {company.website && <div>{company.website}</div>}
      {company.taxId && <div>Tax ID: {company.taxId}</div>}
    </div>
  )
}
