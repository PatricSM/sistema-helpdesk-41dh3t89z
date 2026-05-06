import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Inbox,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  LayoutDashboard,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/PageHeader'
import { PageTitle } from '@/components/PageTitle'
import { TicketCard } from '@/components/TicketCard'
import { TicketDialog } from '@/components/TicketDialog'
import { getTickets, TicketRecord } from '@/services/tickets'
import { getCategories, CategoryRecord } from '@/services/categories'
import { useRealtime } from '@/hooks/use-realtime'

interface Kpi {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  className: string
}

export default function Dashboard() {
  const [tickets, setTickets] = useState<TicketRecord[]>([])
  const [categories, setCategories] = useState<CategoryRecord[]>([])

  const loadData = async () => {
    try {
      const [items, cats] = await Promise.all([getTickets(), getCategories()])
      setTickets(items)
      setCategories(cats)
    } catch {
      // handled
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('tickets', () => {
    loadData()
  })

  const kpis: Kpi[] = useMemo(() => {
    const open = tickets.filter((t) => t.status === 'open').length
    const inProgress = tickets.filter((t) => t.status === 'in_progress').length
    const resolved = tickets.filter((t) => t.status === 'resolved').length
    const urgent = tickets.filter((t) => t.priority === 'urgent' && t.status !== 'closed').length
    return [
      { label: 'Abertos', value: open, icon: Inbox, className: 'text-blue-600 bg-blue-50' },
      {
        label: 'Em andamento',
        value: inProgress,
        icon: Clock,
        className: 'text-amber-600 bg-amber-50',
      },
      {
        label: 'Resolvidos',
        value: resolved,
        icon: CheckCircle2,
        className: 'text-emerald-600 bg-emerald-50',
      },
      {
        label: 'Urgentes',
        value: urgent,
        icon: AlertTriangle,
        className: 'text-rose-600 bg-rose-50',
      },
    ]
  }, [tickets])

  const recent = tickets.slice(0, 6)

  return (
    <>
      <PageHeader>
        <PageTitle
          title="Painel"
          icon={LayoutDashboard}
          rightSlot={<TicketDialog categories={categories} />}
        />
      </PageHeader>
      <div className="space-y-6 animate-fade-in p-5">
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {kpis.map((k) => (
            <Card key={k.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {k.label}
                </CardTitle>
                <div className={`p-2 rounded-lg ${k.className}`}>
                  <k.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{k.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold tracking-tight">Chamados recentes</h2>
            <Link
              to="/tickets"
              className="text-sm text-primary inline-flex items-center gap-1 hover:gap-2 transition-all"
            >
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {recent.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recent.map((t) => (
                <TicketCard key={t.id} ticket={t} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground border rounded-lg border-dashed bg-secondary/10">
              Nenhum chamado ainda. Clique em <span className="font-medium">Novo Chamado</span> para
              começar.
            </div>
          )}
        </div>
      </div>
    </>
  )
}
