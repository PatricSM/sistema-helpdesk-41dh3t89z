import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash, Copy, MessageSquareQuote } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import {
  getCannedResponses,
  createCannedResponse,
  updateCannedResponse,
  deleteCannedResponse,
  CannedResponseRecord,
} from '@/services/canned_responses'
import { extractFieldErrors, getErrorMessage } from '@/lib/pocketbase/errors'

function ResponseDialog({
  response,
  children,
}: {
  response?: CannedResponseRecord
  children?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [shortcut, setShortcut] = useState('')
  const [body, setBody] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      setTitle(response?.title || '')
      setShortcut(response?.shortcut || '')
      setBody(response?.body || '')
      setErrors({})
    }
  }, [open, response])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    try {
      if (response) {
        await updateCannedResponse(response.id, { title, shortcut: shortcut || undefined, body })
        toast({ title: 'Resposta atualizada!' })
      } else {
        await createCannedResponse({ title, shortcut: shortcut || undefined, body })
        toast({ title: 'Resposta criada!' })
      }
      setOpen(false)
    } catch (err) {
      const f = extractFieldErrors(err)
      if (Object.keys(f).length > 0) setErrors(f)
      else
        toast({
          variant: 'destructive',
          title: 'Erro ao salvar',
          description: getErrorMessage(err),
        })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Nova resposta
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{response ? 'Editar resposta' : 'Nova resposta pronta'}</DialogTitle>
            <DialogDescription>
              Modelos reutilizáveis para responder rapidamente nos chamados.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Saudação inicial"
                required
              />
              {errors.title && <span className="text-xs text-destructive">{errors.title}</span>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="shortcut">Atalho</Label>
              <Input
                id="shortcut"
                value={shortcut}
                onChange={(e) => setShortcut(e.target.value)}
                placeholder="/oi"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="body">Mensagem *</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Texto que será inserido no comentário..."
                rows={6}
                className="resize-none"
                required
              />
              {errors.body && <span className="text-xs text-destructive">{errors.body}</span>}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function CannedResponses() {
  const { user } = useAuth()
  const isAgentOrAdmin = user?.role === 'admin' || user?.role === 'agent'

  const [responses, setResponses] = useState<CannedResponseRecord[]>([])
  const { toast } = useToast()

  const load = async () => {
    try {
      setResponses(await getCannedResponses())
    } catch {
      // handled
    }
  }

  useEffect(() => {
    load()
  }, [])

  useRealtime('canned_responses', load)

  if (!isAgentOrAdmin) return <Navigate to="/" replace />

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({ title: 'Copiado!' })
    } catch {
      toast({ variant: 'destructive', title: 'Não foi possível copiar' })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteCannedResponse(id)
      toast({ title: 'Resposta removida!' })
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Falha ao remover',
        description: getErrorMessage(err),
      })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Respostas prontas</h1>
          <p className="text-muted-foreground mt-1">
            Modelos reutilizáveis de mensagens para os chamados.
          </p>
        </div>
        <ResponseDialog />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {responses.length > 0 ? (
          responses.map((r) => (
            <Card key={r.id} className="group">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <MessageSquareQuote className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">{r.title}</CardTitle>
                </div>
                {r.shortcut && (
                  <Badge variant="outline" className="font-mono text-xs">
                    {r.shortcut}
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">
                  {r.body}
                </p>
                <div className="flex items-center gap-2 mt-4 pt-3 border-t opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => copy(r.body)}
                  >
                    <Copy className="h-3 w-3" /> Copiar
                  </Button>
                  <ResponseDialog response={r}>
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                      <Pencil className="h-3 w-3" /> Editar
                    </Button>
                  </ResponseDialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1 text-destructive"
                      >
                        <Trash className="h-3 w-3" /> Excluir
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir resposta?</AlertDialogTitle>
                        <AlertDialogDescription>Esta ação é irreversível.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(r.id)}>
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-muted-foreground border rounded-lg border-dashed bg-muted/10">
            Nenhuma resposta pronta cadastrada.
          </div>
        )}
      </div>
    </div>
  )
}
