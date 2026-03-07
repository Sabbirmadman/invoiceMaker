import type { TemplateElement } from '@/types/template'
import type { CompanyData } from '@/types/document'
import { InlineField } from '@/components/fill-mode/InlineField'
import { useFillMode } from '@/components/fill-mode/FillModeContext'

interface Props {
  element: TemplateElement
  company: CompanyData
}

/** Returns true if the given field key is enabled for this element. */
function fieldVisible(element: TemplateElement, field: string): boolean {
  const fields = element.config?.fields as string[] | undefined
  if (!fields) return true           // legacy elements with no config: show all
  return fields.includes(field)
}

export function CompanyDetailsElement({ element, company }: Props) {
  const { fillMode, onUpdateCompany } = useFillMode()
  const f = (field: string) => fieldVisible(element, field)

  if (fillMode) {
    return (
      <div className="text-sm leading-relaxed" style={element.styles as React.CSSProperties}>
        {f('name') && <InlineField value={company.name} onChange={(v) => onUpdateCompany({ name: v })} placeholder="Company Name" className="font-semibold text-base" />}
        {f('address') && <InlineField value={company.address} onChange={(v) => onUpdateCompany({ address: v })} placeholder="Address" />}
        {f('cityStateZip') && (
          <div className="flex gap-1">
            <InlineField value={company.city} onChange={(v) => onUpdateCompany({ city: v })} placeholder="City" />
            <InlineField value={company.state} onChange={(v) => onUpdateCompany({ state: v })} placeholder="State" className="w-16" />
            <InlineField value={company.zip} onChange={(v) => onUpdateCompany({ zip: v })} placeholder="ZIP" className="w-20" />
          </div>
        )}
        {f('country') && <InlineField value={company.country} onChange={(v) => onUpdateCompany({ country: v })} placeholder="Country" />}
        {f('phone') && <InlineField value={company.phone} onChange={(v) => onUpdateCompany({ phone: v })} placeholder="Phone" />}
        {f('email') && <InlineField value={company.email} onChange={(v) => onUpdateCompany({ email: v })} placeholder="Email" />}
        {f('website') && <InlineField value={company.website} onChange={(v) => onUpdateCompany({ website: v })} placeholder="Website" />}
        {f('taxId') && <InlineField value={company.taxId} onChange={(v) => onUpdateCompany({ taxId: v })} placeholder="Tax ID" />}
      </div>
    )
  }

  return (
    <div className="text-sm leading-relaxed" style={element.styles as React.CSSProperties}>
      {f('name') && company.name && <div className="font-semibold text-base">{company.name}</div>}
      {f('address') && company.address && <div>{company.address}</div>}
      {f('cityStateZip') && (company.city || company.state || company.zip) && (
        <div>
          {[company.city, company.state, company.zip].filter(Boolean).join(', ')}
        </div>
      )}
      {f('country') && company.country && <div>{company.country}</div>}
      {f('phone') && company.phone && <div>{company.phone}</div>}
      {f('email') && company.email && <div>{company.email}</div>}
      {f('website') && company.website && <div>{company.website}</div>}
      {f('taxId') && company.taxId && <div>Tax ID: {company.taxId}</div>}
    </div>
  )
}
