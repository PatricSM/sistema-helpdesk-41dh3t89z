import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getArticle } from '@/services/knowledge_base'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ThumbsUp, ThumbsDown } from 'lucide-react'

export default function ArticleDetail() {
  const { id } = useParams()
  const [article, setArticle] = useState<any>(null)
  const [feedback, setFeedback] = useState<boolean | null>(null)

  useEffect(() => {
    if (id) getArticle(id).then(setArticle)
  }, [id])

  if (!article) return <div>Carregando...</div>

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6">
      <Button variant="ghost" asChild className="-ml-4 text-muted-foreground">
        <Link to="/knowledge-base">
          <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
        </Link>
      </Button>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm text-primary font-medium">{article.expand?.category?.name}</div>
          <h1 className="text-4xl font-bold">{article.title}</h1>
          <div className="text-sm text-muted-foreground">
            Escrito por {article.expand?.author?.name} • Atualizado em{' '}
            {new Date(article.updated).toLocaleDateString('pt-BR')}
          </div>
        </div>

        <div className="prose max-w-none pt-6 pb-8 border-b">
          {article.content.split('\n').map((p: string, i: number) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4">
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
      </div>
    </div>
  )
}
