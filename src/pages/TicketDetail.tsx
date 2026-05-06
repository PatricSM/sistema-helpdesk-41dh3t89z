import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getTicket, updateTicket } from '@/services/tickets'
import { getComments, createComment } from '@/services/comments'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getCategories } from '@/services/categories'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { format } from 'date-fns'
import pb from '@/lib/pocketbase/client'

const statusMap: any = {
  open: { label: 'Aberto', color: 'bg-blue-100 text-blue-800' },
  in_progress: { label: 'Em Andamento', color: 'bg-amber-100 text-amber-800' },
  resolved: { label: 'Resolvido', color: 'bg-green-100 text-green-800' },
  closed: { label: 'Fechado', color: 'bg-gray-100 text-gray-800' },
}

const priorityMap: any = {
  low: { label: 'Baixa', color: 'bg-slate-100 text-slate-800' },
  medium: { label: 'Média', color: 'bg-blue-100 text-blue-800' },
  high: { label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  urgent: { label: 'Urgente', color: 'bg-red-100 text-red-800' },
}

export default function TicketDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { toast } = useToast()

  const [ticket, setTicket] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [agents, setAgents] = useState<any[]>([])

  const [reply, setReply] = useState('')
  const [isInternal, setIsInternal] = useState(false)

  const isAgentOrAdmin = user?.role === 'agent' || user?.role === 'admin'

  const loadData = async () => {
    if (!id) return
    const t = await getTicket(id)
    setTicket(t)
    const c = await getComments(id)
    setComments(c)
  }

  useEffect(() => {
    loadData()
    if (isAgentOrAdmin) {
      getCategories().then(setCategories)
      pb.collection('users').getFullList({ filter: "role='agent' || role='admin'" }).then(setAgents)
    }
  }, [id, isAgentOrAdmin])

  useRealtime('tickets', (e) => {
    if (e.record.id === id) loadData()
  })
  useRealtime('comments', (e) => {
    if (e.record.ticket === id) loadData()
  })

  const handleUpdate = async (field: string, value: string) => {
    if (!id) return
    try {
      await updateTicket(id, { [field]: value })
      toast({ title: 'Sucesso', description: 'Chamado atualizado.' })
    } catch (err) {
      toast({ title: 'Erro', description: 'Falha ao atualizar.', variant: 'destructive' })
    }
  }

  const handleReply = async () => {
    if (!reply.trim() || !id) return
    try {
      await createComment({ ticket: id, author: user.id, body: reply, is_internal: isInternal })
      setReply('')
      setIsInternal(false)
    } catch (err) {
      toast({ title: 'Erro', description: 'Falha ao enviar resposta.', variant: 'destructive' })
    }
  }

  if (!ticket) return <div>Carregando...</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{ticket.title}</h1>
            <span className="text-muted-foreground text-sm">#{ticket.id.slice(0, 8)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={statusMap[ticket.status]?.color}>
              {statusMap[ticket.status]?.label}
            </Badge>
            <Badge variant="secondary" className={priorityMap[ticket.priority]?.color}>
              {priorityMap[ticket.priority]?.label}
            </Badge>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="flex gap-4">
              <Avatar>
                <AvatarFallback>{ticket.expand?.requester?.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {ticket.expand?.requester?.name}{' '}
                    <span className="text-muted-foreground font-normal">(Solicitante)</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(ticket.created), 'dd/MM/yyyy HH:mm')}
                  </p>
                </div>
                <div className="text-sm bg-slate-50 p-3 rounded-md">{ticket.description}</div>
              </div>
            </div>

            {comments.map((c) => (
              <div key={c.id} className={`flex gap-4 ${c.is_internal ? 'opacity-80' : ''}`}>
                <Avatar>
                  <AvatarFallback>{c.expand?.author?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {c.expand?.author?.name}
                      <span className="text-muted-foreground font-normal">
                        {' '}
                        ({c.expand?.author?.role === 'client' ? 'Cliente' : 'Agente'})
                      </span>
                      {c.is_internal && (
                        <Badge
                          variant="outline"
                          className="ml-2 bg-yellow-50 text-yellow-800 border-yellow-200"
                        >
                          Nota Interna
                        </Badge>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(c.created), 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                  <div
                    className={`text-sm p-3 rounded-md ${c.is_internal ? 'bg-yellow-50 border border-yellow-100' : 'bg-slate-50'}`}
                  >
                    {c.body}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <Textarea
              placeholder="Escreva sua resposta..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={4}
            />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {isAgentOrAdmin ? (
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  Nota interna (invisível para o cliente)
                </label>
              ) : (
                <div />
              )}
              <Button onClick={handleReply} className="w-full sm:w-auto">
                Enviar Resposta
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detalhes do Chamado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Status</Label>
              {isAgentOrAdmin ? (
                <Select value={ticket.status} onValueChange={(v) => handleUpdate('status', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Aberto</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="resolved">Resolvido</SelectItem>
                    <SelectItem value="closed">Fechado</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm font-medium">{statusMap[ticket.status]?.label}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Prioridade</Label>
              {isAgentOrAdmin ? (
                <Select value={ticket.priority} onValueChange={(v) => handleUpdate('priority', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm font-medium">{priorityMap[ticket.priority]?.label}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              {isAgentOrAdmin ? (
                <Select value={ticket.category} onValueChange={(v) => handleUpdate('category', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm font-medium">{ticket.expand?.category?.name}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Atribuído a</Label>
              {isAgentOrAdmin ? (
                <Select
                  value={ticket.assignee || 'unassigned'}
                  onValueChange={(v) => handleUpdate('assignee', v === 'unassigned' ? '' : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Não atribuído" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Não atribuído</SelectItem>
                    {agents.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm font-medium">
                  {ticket.expand?.assignee?.name || 'Não atribuído'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
