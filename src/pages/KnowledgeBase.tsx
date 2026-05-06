import { useEffect, useState } from 'react'
import { getArticles } from '@/services/knowledge_base'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Search, Book } from 'lucide-react'

export default function KnowledgeBase() {
  const [articles, setArticles] = useState<any[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    getArticles().then(setArticles)
  }, [])

  const filtered = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.expand?.category?.name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full">
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl font-bold">Como podemos ajudar?</h1>
        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            className="pl-10 h-12 text-lg"
            placeholder="Busque por artigos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((a) => (
          <Link key={a.id} to={`/knowledge-base/${a.id}`}>
            <Card className="hover:shadow-md transition-shadow h-full cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg flex gap-2 items-start">
                  <Book className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>{a.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-2">{a.expand?.category?.name}</div>
                <p className="text-sm text-muted-foreground line-clamp-3">{a.content}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            Nenhum artigo encontrado.
          </div>
        )}
      </div>
    </div>
  )
}
