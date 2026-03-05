import { useState, useMemo } from 'react'
import { useAppSelector, useAppDispatch } from '@/hooks/useAppDispatch'
import { duplicateDocument, deleteDocument } from '@/store/slices/documentsSlice'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DocumentListFilters, type DateFilter } from './DocumentListFilters'
import { DocumentListRow } from './DocumentListRow'
import { FileText } from 'lucide-react'
import type { DocumentType } from '@/types/common'
import {
  isThisMonth,
  isThisYear,
  subMonths,
  isWithinInterval,
  startOfMonth,
  endOfMonth,
} from 'date-fns'

function getDocDate(doc: { data: { meta: { type: string; date?: string; issueDate?: string } } }): Date | null {
  const meta = doc.data.meta
  const raw = meta.type === 'receipt' ? (meta as { issueDate?: string }).issueDate : (meta as { date?: string }).date
  if (!raw) return null
  return new Date(raw)
}

export function DocumentList() {
  const dispatch = useAppDispatch()
  const documents = useAppSelector((s) => s.documents.documents)

  const [typeFilter, setTypeFilter] = useState<DocumentType | 'all'>('all')
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return documents.filter((doc) => {
      if (typeFilter !== 'all' && doc.documentType !== typeFilter) return false

      const date = getDocDate(doc)
      if (date) {
        if (dateFilter === 'this-month' && !isThisMonth(date)) return false
        if (dateFilter === 'this-year' && !isThisYear(date)) return false
        if (dateFilter === 'last-month') {
          const lastMonth = subMonths(new Date(), 1)
          const interval = { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) }
          if (!isWithinInterval(date, interval)) return false
        }
      }

      if (search) {
        const q = search.toLowerCase()
        const meta = doc.data.meta
        const docNum =
          meta.type === 'receipt' ? meta.number : meta.number
        const clientName = doc.data.client.name.toLowerCase()
        if (!clientName.includes(q) && !docNum.toLowerCase().includes(q)) return false
      }

      return true
    })
  }, [documents, typeFilter, dateFilter, search])

  return (
    <div className="flex flex-col gap-4">
      <DocumentListFilters
        typeFilter={typeFilter}
        dateFilter={dateFilter}
        search={search}
        onTypeChange={setTypeFilter}
        onDateChange={setDateFilter}
        onSearchChange={setSearch}
      />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
          <FileText className="size-12 mb-4 opacity-30" />
          <p className="text-lg font-medium">No documents yet</p>
          <p className="text-sm mt-1">Create your first invoice, estimate, or receipt above.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">Document #</TableHead>
              <TableHead>Client</TableHead>
              <TableHead className="w-36">Date</TableHead>
              <TableHead className="w-32">Amount</TableHead>
              <TableHead className="w-28">Type</TableHead>
              <TableHead className="w-16 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((doc) => (
              <DocumentListRow
                key={doc.id}
                doc={doc}
                onDuplicate={(id) => dispatch(duplicateDocument(id))}
                onDelete={(id) => dispatch(deleteDocument(id))}
              />
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
