import { useEffect, useState } from 'react'
import { getTickets } from '@/services/tickets'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Ticket, Clock, CheckCircle, Search } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ open: 0, inProgress: 0, resolved: 0 })
  const [recent, setRecent] = useState<any[]>([])

  useEffect(() => {
    const fetchStats = async () => {
      const filter = user?.role === 'client' ? `requester = "${user.id}"` : ''
      const res = await getTickets(filter)

      const open = res.items.filter((t) => t.status === 'open').length
      const inProgress = res.items.filter((t) => t.status === 'in_progress').length
      const resolved = res.items.filter((t) => t.status === 'resolved').length

      setStats({ open, inProgress, resolved })
      setRecent(res.items.slice(0, 5))
    }
    fetchStats()
  }, [user])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel de Controle</h1>
          <p className="text-muted-foreground">Bem-vindo de volta, {user?.name}</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/knowledge-base">
              <Search className="mr-2 h-4 w-4" /> Buscar Ajuda
            </Link>
          </Button>
          <Button asChild>
            <Link to="/tickets/new">
              <Ticket className="mr-2 h-4 w-4" /> Novo Chamado
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chamados Abertos</CardTitle>
            <Ticket className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.open}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolvidos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolved}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chamados Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum chamado recente.</p>
            ) : (
              recent.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <Link to={`/tickets/${t.id}`} className="font-medium hover:underline">
                      {t.title}
                    </Link>
                    <div className="text-xs text-muted-foreground mt-1">
                      {t.expand?.category?.name} • Criado em{' '}
                      {new Date(t.created).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${t.status === 'open' ? 'bg-blue-100 text-blue-800' : t.status === 'in_progress' ? 'bg-amber-100 text-amber-800' : t.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                    >
                      {t.status === 'open'
                        ? 'Aberto'
                        : t.status === 'in_progress'
                          ? 'Em andamento'
                          : t.status === 'resolved'
                            ? 'Resolvido'
                            : 'Fechado'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
