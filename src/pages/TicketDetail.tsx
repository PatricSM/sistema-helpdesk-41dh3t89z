import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Lock,
  Mail,
  MessageSquare,
  Pencil,
  Send,
  Trash,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { StatusBadge } from '@/components/StatusBadge'
import { PriorityBadge } from '@/components/PriorityBadge'
import { TicketDialog } from '@/components/TicketDialog'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import {
  getTicket,
  updateTicket,
  deleteTicket,
  TicketRecord,
  TicketStatus,
  TicketPriority,
} from '@/services/tickets'
import { getComments, createComment } from '@/services/comments'
import { getCategories, CategoryRecord } from '@/services/categories'
import { getCannedResponses, CannedResponseRecord } from '@/services/canned_responses'
import { extractFieldErrors, getErrorMessage } from '@/lib/pocketbase/errors'
import pb from '@/lib/pocketbase/client'

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

interface CommentRecord {
  id: string
  ticket: string
  author: string
  body: string
  is_internal?: boolean
  created: string
  expand?: { author?: { id: string; name: string; role?: string } }
}

interface AgentUser {
  id: string
  name: string
  email: string
  role: string
}

export default function TicketDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()
  const isAgentOrAdmin = user?.role === 'admin' || user?.role === 'agent'
  const isAdmin = user?.role === 'admin'

  const [ticket, setTicket] = useState<TicketRecord | null>(null)
  const [comments, setComments] = useState<CommentRecord[]>([])
  const [categories, setCategories] = useState<CategoryRecord[]>([])
  const [agents, setAgents] = useState<AgentUser[]>([])
  const [canned, setCanned] = useState<CannedResponseRecord[]>([])

  const [reply, setReply] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const load = async () => {
    if (!id) return
    try {
      const [t, c, cats] = await Promise.all([
        getTicket(id),
        getComments(id) as Promise<CommentRecord[]>,
        getCategories(),
      ])
      setTicket(t)
      setComments(c)
      setCategories(cats)
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao carregar chamado' })
      navigate('/tickets')
    }
  }

  useEffect(() => {
    load()
  }, [id])

  useEffect(() => {
    if (!isAgentOrAdmin) return
    pb.collection('users')
      .getFullList({ filter: "role='agent' || role='admin'" })
      .then((list) => setAgents(list as unknown as AgentUser[]))
      .catch(() => {})
    getCannedResponses()
      .then(setCanned)
      .catch(() => {})
  }, [isAgentOrAdmin])

  useRealtime('tickets', (e) => {
    if (e.record.id === id) load()
  })
  useRealtime('comments', (e) => {
    if (e.record.ticket === id) load()
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments])

  if (!ticket) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        Carregando…
      </div>
    )
  }

  const handleStatusChange = async (status: TicketStatus) => {
    try {
      await updateTicket(ticket.id, { status })
      toast({ title: 'Status atualizado!' })
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Falha ao atualizar status',
        description: getErrorMessage(err),
      })
    }
  }

  const handlePriorityChange = async (priority: TicketPriority) => {
    try {
      await updateTicket(ticket.id, { priority })
      toast({ title: 'Prioridade atualizada!' })
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Falha ao atualizar prioridade',
        description: getErrorMessage(err),
      })
    }
  }

  const handleAssigneeChange = async (assigneeId: string) => {
    try {
      await updateTicket(ticket.id, { assignee: assigneeId === 'unassigned' ? '' : assigneeId })
      toast({ title: 'Atribuição atualizada!' })
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Falha ao atribuir',
        description: getErrorMessage(err),
      })
    }
  }

  const handleCategoryChange = async (categoryId: string) => {
    try {
      await updateTicket(ticket.id, { category: categoryId })
      toast({ title: 'Categoria atualizada!' })
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Falha ao atualizar categoria',
        description: getErrorMessage(err),
      })
    }
  }

  const handleDelete = async () => {
    try {
      await deleteTicket(ticket.id)
      toast({ title: 'Chamado excluído!' })
      navigate('/tickets')
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Falha ao excluir',
        description: getErrorMessage(err),
      })
    }
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reply.trim() || !user) return
    setSubmitting(true)
    try {
      await createComment({
        ticket: ticket.id,
        author: user.id,
        body: reply,
        is_internal: isInternal,
      })
      setReply('')
      setIsInternal(false)
      toast({ title: 'Comentário enviado!' })
    } catch (err) {
      const f = extractFieldErrors(err)
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar',
        description: Object.values(f).join(' ') || getErrorMessage(err),
      })
    } finally {
      setSubmitting(false)
    }
  }

  const insertCanned = (text: string) => {
    setReply((prev) => (prev ? `${prev}\n\n${text}` : text))
  }

  const visibleComments = comments.filter((c) => isAgentOrAdmin || !c.is_internal)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link to="/tickets">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight line-clamp-1">{ticket.title}</h1>
            <p className="text-xs text-muted-foreground">#{ticket.id.slice(-6)}</p>
          </div>
        </div>
        {isAgentOrAdmin && (
          <div className="flex items-center gap-2">
            <TicketDialog ticket={ticket} categories={categories}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Pencil className="h-3.5 w-3.5" /> Editar
              </Button>
            </TicketDialog>
            {isAdmin && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 text-destructive">
                    <Trash className="h-3.5 w-3.5" /> Excluir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir chamado?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação é irreversível. Comentários relacionados também serão removidos.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Descrição</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{ticket.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> Conversa ({visibleComments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {visibleComments.length === 0 && (
                <p className="text-sm text-muted-foreground italic">
                  Sem comentários ainda. Seja o primeiro a responder.
                </p>
              )}
              {visibleComments.map((c) => (
                <div
                  key={c.id}
                  className={`rounded-lg border p-4 ${
                    c.is_internal ? 'bg-amber-50 border-amber-200' : 'bg-background'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span className="font-medium text-foreground">
                        {c.expand?.author?.name || 'Usuário'}
                      </span>
                      <Calendar className="h-3 w-3" />
                      {formatDate(c.created)}
                      {c.is_internal && (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                          <Lock className="h-3 w-3" /> Nota interna
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{c.body}</p>
                </div>
              ))}
              <div ref={messagesEndRef} />

              <form onSubmit={handleReply} className="space-y-3 pt-2 border-t">
                {isAgentOrAdmin && canned.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">Resposta pronta:</Label>
                    <Select onValueChange={(v) => insertCanned(v)}>
                      <SelectTrigger className="h-8 w-[260px] text-xs">
                        <SelectValue placeholder="Inserir..." />
                      </SelectTrigger>
                      <SelectContent>
                        {canned.map((cr) => (
                          <SelectItem key={cr.id} value={cr.body}>
                            {cr.title}
                            {cr.shortcut ? ` (${cr.shortcut})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Escreva uma resposta..."
                  rows={4}
                  className={`resize-none ${isInternal ? 'bg-amber-50 border-amber-200' : ''}`}
                />
                <div className="flex items-center justify-between">
                  {isAgentOrAdmin ? (
                    <div className="flex items-center gap-2">
                      <Switch
                        id="is_internal"
                        checked={isInternal}
                        onCheckedChange={setIsInternal}
                      />
                      <Label htmlFor="is_internal" className="text-sm cursor-pointer">
                        Nota interna
                      </Label>
                    </div>
                  ) : (
                    <span />
                  )}
                  <Button type="submit" disabled={!reply.trim() || submitting} className="gap-1.5">
                    <Send className="h-3.5 w-3.5" /> Enviar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detalhes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Status</Label>
                {isAgentOrAdmin ? (
                  <Select
                    value={ticket.status}
                    onValueChange={(v) => handleStatusChange(v as TicketStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Aberto</SelectItem>
                      <SelectItem value="in_progress">Em andamento</SelectItem>
                      <SelectItem value="resolved">Resolvido</SelectItem>
                      <SelectItem value="closed">Fechado</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <StatusBadge status={ticket.status} />
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Prioridade</Label>
                {isAgentOrAdmin ? (
                  <Select
                    value={ticket.priority}
                    onValueChange={(v) => handlePriorityChange(v as TicketPriority)}
                  >
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
                  <PriorityBadge priority={ticket.priority} />
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Categoria</Label>
                {isAgentOrAdmin ? (
                  <Select value={ticket.category || ''} onValueChange={handleCategoryChange}>
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
                  <p className="text-sm font-medium">{ticket.expand?.category?.name || '—'}</p>
                )}
              </div>
              {isAgentOrAdmin && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Atribuído a</Label>
                  <Select
                    value={ticket.assignee || 'unassigned'}
                    onValueChange={handleAssigneeChange}
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
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Solicitante</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {ticket.expand?.requester ? (
                <>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {ticket.expand.requester.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`mailto:${ticket.expand.requester.email}`}
                      className="text-primary hover:underline"
                    >
                      {ticket.expand.requester.email}
                    </a>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground italic">Sem informações</p>
              )}
              <p className="text-xs text-muted-foreground pt-2 border-t mt-3">
                Criado em {formatDate(ticket.created)}
              </p>
              <p className="text-xs text-muted-foreground">
                Atualizado em {formatDate(ticket.updated)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
