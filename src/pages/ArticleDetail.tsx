import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Calendar, ThumbsUp, ThumbsDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { getArticle, KnowledgeBaseRecord } from '@/services/knowledge_base'

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })

export default function ArticleDetail() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()
  const isAgentOrAdmin = user?.role === 'admin' || user?.role === 'agent'

  const [article, setArticle] = useState<KnowledgeBaseRecord | null>(null)
  const [feedback, setFeedback] = useState<boolean | null>(null)

  useEffect(() => {
    if (!id) return
    getArticle(id)
      .then(setArticle)
      .catch(() => {
        toast({ variant: 'destructive', title: 'Artigo não encontrado' })
        navigate('/knowledge-base')
      })
  }, [id, navigate, toast])

  if (!article) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        Carregando…
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="icon">
          <Link to="/knowledge-base">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        {isAgentOrAdmin && (
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link to={`/knowledge-base/${article.id}/edit`}>
              <Pencil className="h-3.5 w-3.5" /> Editar
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="space-y-3">
          {article.expand?.category && (
            <Badge variant="outline" className="self-start">
              {article.expand.category.name}
            </Badge>
          )}
          <h1 className="text-3xl font-bold tracking-tight">{article.title}</h1>
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
            <Calendar className="h-3 w-3" />
            Atualizado em {formatDate(article.updated)}
            {article.expand?.author && <span>· por {article.expand.author.name}</span>}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <article className="prose prose-slate max-w-none text-sm leading-relaxed">
            {article.content.split('\n').map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </article>

          <div className="flex items-center justify-between pt-6 border-t">
            <span className="text-sm font-medium">Este artigo foi útil?</span>
            <div className="flex gap-2">
              <Button
                variant={feedback === true ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFeedback(true)}
              >
                <ThumbsUp className="mr-2 h-4 w-4" /> Sim
              </Button>
              <Button
                variant={feedback === false ? 'destructive' : 'outline'}
                size="sm"
                onClick={() => setFeedback(false)}
              >
                <ThumbsDown className="mr-2 h-4 w-4" /> Não
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
