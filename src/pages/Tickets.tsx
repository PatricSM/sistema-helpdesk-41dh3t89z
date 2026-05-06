import { useEffect, useState } from 'react'
import { getTickets } from '@/services/tickets'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const statusMap: any = {
  open: { label: 'Aberto', color: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
  in_progress: { label: 'Em Andamento', color: 'bg-amber-100 text-amber-800 hover:bg-amber-100' },
  resolved: { label: 'Resolvido', color: 'bg-green-100 text-green-800 hover:bg-green-100' },
  closed: { label: 'Fechado', color: 'bg-gray-100 text-gray-800 hover:bg-gray-100' },
}

const priorityMap: any = {
  low: { label: 'Baixa', color: 'bg-slate-100 text-slate-800 hover:bg-slate-100' },
  medium: { label: 'Média', color: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
  high: { label: 'Alta', color: 'bg-orange-100 text-orange-800 hover:bg-orange-100' },
  urgent: { label: 'Urgente', color: 'bg-red-100 text-red-800 hover:bg-red-100' },
}

export default function Tickets() {
  const [tickets, setTickets] = useState<any[]>([])
  const { user } = useAuth()

  const loadData = async () => {
    const filter = user?.role === 'client' ? `requester = "${user.id}"` : ''
    const res = await getTickets(filter)
    setTickets(res.items)
  }

  useEffect(() => {
    loadData()
  }, [user])
  useRealtime('tickets', () => {
    loadData()
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Chamados</h1>
        <Button asChild>
          <Link to="/tickets/new">Novo Chamado</Link>
        </Button>
      </div>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Criado em</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  Nenhum chamado encontrado.
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium text-xs">{t.id.slice(0, 8)}</TableCell>
                  <TableCell>
                    <Link to={`/tickets/${t.id}`} className="hover:underline">
                      {t.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusMap[t.status]?.color}>
                      {statusMap[t.status]?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={priorityMap[t.priority]?.color}>
                      {priorityMap[t.priority]?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(t.created).toLocaleDateString('pt-BR')}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
