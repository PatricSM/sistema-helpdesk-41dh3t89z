import { Link } from 'react-router-dom'
import { ArrowRight, Calendar, User } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { StatusBadge } from './StatusBadge'
import { PriorityBadge } from './PriorityBadge'

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

interface TicketLike {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  created: string
  expand?: {
    requester?: { id: string; name: string }
    assignee?: { id: string; name: string }
    category?: { id: string; name: string; color?: string }
  }
}

export function TicketCard({ ticket }: { ticket: TicketLike }) {
  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-all hover:-translate-y-1 animate-fade-in group">
      <CardHeader className="space-y-2 p-4 pb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
          {ticket.expand?.category && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: `${ticket.expand.category.color || '#64748b'}20`,
                color: ticket.expand.category.color || '#64748b',
              }}
            >
              {ticket.expand.category.name}
            </span>
          )}
        </div>
        <h3 className="font-semibold leading-tight line-clamp-2" title={ticket.title}>
          {ticket.title}
        </h3>
      </CardHeader>
      <CardContent className="p-4 pt-2 flex-grow">
        {ticket.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">{ticket.description}</p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between border-t mt-auto">
        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          {ticket.expand?.requester?.name && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {ticket.expand.requester.name}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(ticket.created)}
          </span>
        </div>
        <Link
          to={`/tickets/${ticket.id}`}
          className="text-xs font-medium text-primary inline-flex items-center gap-1 group-hover:gap-2 transition-all"
        >
          Abrir <ArrowRight className="h-3 w-3" />
        </Link>
      </CardFooter>
    </Card>
  )
}
