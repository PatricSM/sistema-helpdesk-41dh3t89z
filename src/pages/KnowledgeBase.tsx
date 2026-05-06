import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, BookOpen, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getArticles, KnowledgeBaseRecord } from '@/services/knowledge_base'
import { getCategories, CategoryRecord } from '@/services/categories'

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })

export default function KnowledgeBase() {
  const { user } = useAuth()
  const isAgentOrAdmin = user?.role === 'admin' || user?.role === 'agent'

  const [articles, setArticles] = useState<KnowledgeBaseRecord[]>([])
  const [categories, setCategories] = useState<CategoryRecord[]>([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const load = async () => {
    try {
      const [arts, cats] = await Promise.all([getArticles(), getCategories()])
      setArticles(arts)
      setCategories(cats)
    } catch {
      // handled
    }
  }

  useEffect(() => {
    load()
  }, [])

  useRealtime('knowledge_base', load)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return articles.filter((a) => {
      const matchesSearch =
        !q || a.title.toLowerCase().includes(q) || (a.content || '').toLowerCase().includes(q)
      const matchesCategory = categoryFilter === 'all' || a.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [articles, search, categoryFilter])

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Base de Conhecimento</h1>
          <p className="text-muted-foreground mt-1">Artigos, tutoriais e respostas frequentes.</p>
        </div>
        {isAgentOrAdmin && (
          <Button asChild className="gap-2">
            <Link to="/knowledge-base/new">
              <Plus className="h-4 w-4" /> Novo Artigo
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar artigos..."
            className="pl-9 bg-secondary/30 focus-visible:bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length > 0 ? (
          filtered.map((a) => (
            <Card key={a.id} className="hover:shadow-md transition-all hover:-translate-y-1 group">
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                  <BookOpen className="h-5 w-5 text-primary" />
                  {a.expand?.category && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: `${a.expand.category.color || '#64748b'}20`,
                        color: a.expand.category.color || '#64748b',
                      }}
                    >
                      {a.expand.category.name}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold leading-tight line-clamp-2">{a.title}</h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">{a.content}</p>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t pt-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FileText className="h-3 w-3" />
                  {a.expand?.author?.name || '—'}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{formatDate(a.updated)}</span>
                  <Button asChild size="sm" variant="secondary" className="h-7 text-xs">
                    <Link to={`/knowledge-base/${a.id}`}>Abrir</Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-muted-foreground border rounded-lg border-dashed bg-secondary/10">
            Nenhum artigo encontrado.
          </div>
        )}
      </div>
    </div>
  )
}
