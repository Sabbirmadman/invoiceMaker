import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { DocumentType } from '@/types/common'

export type DateFilter = 'all' | 'this-month' | 'last-month' | 'this-year'

interface Props {
  typeFilter: DocumentType | 'all'
  dateFilter: DateFilter
  search: string
  onTypeChange: (v: DocumentType | 'all') => void
  onDateChange: (v: DateFilter) => void
  onSearchChange: (v: string) => void
}

export function DocumentListFilters({
  typeFilter,
  dateFilter,
  search,
  onTypeChange,
  onDateChange,
  onSearchChange,
}: Props) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Select value={typeFilter} onValueChange={(v) => onTypeChange(v as DocumentType | 'all')}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="invoice">Invoice</SelectItem>
          <SelectItem value="estimate">Estimate</SelectItem>
          <SelectItem value="receipt">Receipt</SelectItem>
        </SelectContent>
      </Select>

      <Select value={dateFilter} onValueChange={(v) => onDateChange(v as DateFilter)}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Date" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Time</SelectItem>
          <SelectItem value="this-month">This Month</SelectItem>
          <SelectItem value="last-month">Last Month</SelectItem>
          <SelectItem value="this-year">This Year</SelectItem>
        </SelectContent>
      </Select>

      <div className="relative flex-1 min-w-48">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by client or document #"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  )
}
