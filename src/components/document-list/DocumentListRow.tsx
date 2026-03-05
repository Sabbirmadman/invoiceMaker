import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MoreHorizontal, ExternalLink, Copy, Trash2, Download } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TableCell, TableRow } from '@/components/ui/table'
import type { StoredDocument } from '@/types/document'
import { formatCurrency, calculateTotals } from '@/services/calculations'
import { format } from 'date-fns'

const TYPE_COLORS: Record<string, string> = {
  invoice: 'bg-blue-100 text-blue-800',
  estimate: 'bg-amber-100 text-amber-800',
  receipt: 'bg-green-100 text-green-800',
}

function getDocNumber(doc: StoredDocument): string {
  const meta = doc.data.meta
  if (meta.type === 'invoice') return meta.number
  if (meta.type === 'estimate') return meta.number
  return meta.number
}

function getDocDate(doc: StoredDocument): string {
  const meta = doc.data.meta
  if (meta.type === 'invoice') return meta.date
  if (meta.type === 'estimate') return meta.date
  return meta.issueDate
}

interface Props {
  doc: StoredDocument
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
}

export function DocumentListRow({ doc, onDuplicate, onDelete }: Props) {
  const navigate = useNavigate()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const totals = calculateTotals(doc.data.items, doc.data.totalsConfig)
  const docDate = getDocDate(doc)
  const formattedDate = docDate
    ? format(new Date(docDate), 'dd MMM yyyy')
    : '—'

  return (
    <>
      <TableRow className="cursor-pointer hover:bg-muted/50 group">
        <TableCell className="font-mono text-sm">{getDocNumber(doc)}</TableCell>
        <TableCell>{doc.data.client.name || <span className="text-muted-foreground">—</span>}</TableCell>
        <TableCell className="text-muted-foreground">{formattedDate}</TableCell>
        <TableCell className="font-medium">
          {formatCurrency(totals.total, doc.data.totalsConfig.currency)}
        </TableCell>
        <TableCell>
          <Badge className={`${TYPE_COLORS[doc.documentType]} border-0 capitalize`}>
            {doc.documentType}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/document/${doc.id}`)}>
                <ExternalLink className="size-4 mr-2" />
                Open
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/preview/${doc.id}`)}>
                <Download className="size-4 mr-2" />
                Preview / PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(doc.id)}>
                <Copy className="size-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="size-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete document?</DialogTitle>
            <DialogDescription>
              This will permanently delete {getDocNumber(doc)}. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete(doc.id)
                setConfirmDelete(false)
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
