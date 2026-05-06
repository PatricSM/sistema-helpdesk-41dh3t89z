import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Home as HomeIcon,
  Inbox,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  ThumbsUp,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { PageHeader } from '@/components/PageHeader'
import { PageTitle } from '@/components/PageTitle'
import { Pill } from '@/components/Pill'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getTickets, TicketRecord } from '@/services/tickets'

const STATUS_LABEL: Record<string, string> = {
  open: 'Aberto',
  in_progress: 'Em andamento',
  resolved: 'Resolvido',
  closed: 'Fechado',
}
const STATUS_COLOR: Record<string, string> = {
  open: 'red',
  in_progress: 'amber',
  resolved: 'green',
  closed: 'gray',
}

const formatRelative = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d`
  return new Date(iso).toLocaleDateString('pt-BR')
}

interface KpiCardProps {
  label: string
  value: string | number
  trend?: string
  trendUp?: boolean
  icon: React.ComponentType<{ className?: string }>
  iconClass: string
}

function KpiCard({ label, value, trend, trendUp, icon: Icon, iconClass }: KpiCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${iconClass}`}>
            <Icon className="h-5 w-5" />
          </div>
          {trend && (
            <div
              className={`text-xs font-medium inline-flex items-center gap-1 ${
                trendUp ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              <TrendingUp className={`h-3 w-3 ${!trendUp && 'rotate-180'}`} />
              {trend}
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  )
}

export default function Home() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState<TicketRecord[]>([])

  const load = async () => {
    try {
      setTickets(await getTickets())
    } catch {
      // handled
    }
  }

  useEffect(() => {
    load()
  }, [])

  useRealtime('tickets', load)

  const myTickets = useMemo(() => tickets.filter((t) => t.assignee === user?.id), [tickets, user])
  const pending = useMemo(
    () =>
      tickets
        .filter((t) => t.status === 'open' || t.status === 'in_progress')
        .sort((a, b) => (a.created < b.created ? 1 : -1))
        .slice(0, 5),
    [tickets],
  )

  const counts = useMemo(() => {
    return {
      open: tickets.filter((t) => t.status === 'open').length,
      inProgress: tickets.filter((t) => t.status === 'in_progress').length,
      resolved: tickets.filter((t) => t.status === 'resolved').length,
      urgent: tickets.filter((t) => t.priority === 'urgent' && t.status !== 'closed').length,
      myActive: myTickets.filter((t) => t.status !== 'closed' && t.status !== 'resolved').length,
    }
  }, [tickets, myTickets])

  // Avg first response time (mocked: usa created -> first_response_at)
  const avgFirstResponse = useMemo(() => {
    const responded = tickets.filter((t) => t.first_response_at)
    if (responded.length === 0) return '—'
    const totalMs = responded.reduce(
      (sum, t) => sum + (new Date(t.first_response_at!).getTime() - new Date(t.created).getTime()),
      0,
    )
    const avgMins = Math.floor(totalMs / responded.length / 60000)
    if (avgMins < 60) return `${avgMins}min`
    return `${Math.floor(avgMins / 60)}h ${avgMins % 60}min`
  }, [tickets])

  // Chart simples: ticktes criados por dia (últimos 7 dias)
  const last7Days = useMemo(() => {
    const days: { day: string; count: number; resolved: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      const dayLabel = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
      const count = tickets.filter((t) => t.created.slice(0, 10) === key).length
      const resolved = tickets.filter((t) => t.resolution_at?.slice(0, 10) === key).length
      days.push({ day: dayLabel, count, resolved })
    }
    return days
  }, [tickets])

  const maxCount = Math.max(...last7Days.map((d) => Math.max(d.count, d.resolved)), 1)

  return (
    <>
      <PageHeader>
        <PageTitle title="Início" icon={HomeIcon} />
      </PageHeader>

      <div className="px-5 py-5 space-y-5">
        <div>
          <h2 className="text-lg font-semibold mb-1">
            Olá, {user?.name?.split(' ')[0] || 'usuário'} 👋
          </h2>
          <p className="text-sm text-gray-500">Aqui está o panorama do seu helpdesk.</p>
        </div>

        {/* KPI grid */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
          <KpiCard
            label="Meus tickets"
            value={counts.myActive}
            icon={Inbox}
            iconClass="bg-violet-50 text-violet-600"
          />
          <KpiCard
            label="Abertos"
            value={counts.open}
            icon={Inbox}
            iconClass="bg-blue-50 text-blue-600"
          />
          <KpiCard
            label="Em andamento"
            value={counts.inProgress}
            icon={Clock}
            iconClass="bg-amber-50 text-amber-600"
          />
          <KpiCard
            label="Urgentes"
            value={counts.urgent}
            icon={AlertTriangle}
            iconClass="bg-rose-50 text-rose-600"
          />
          <KpiCard
            label="Resolvidos"
            value={counts.resolved}
            icon={CheckCircle2}
            iconClass="bg-emerald-50 text-emerald-600"
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {/* Avg time card */}
          <Card>
            <CardHeader className="border-b py-3">
              <h3 className="text-sm font-semibold">Tempo médio de primeira resposta</h3>
            </CardHeader>
            <CardContent className="p-4">
              <div className="text-3xl font-bold">{avgFirstResponse}</div>
              <p className="text-xs text-gray-500 mt-1">
                Calculado sobre {tickets.filter((t) => t.first_response_at).length} chamados.
              </p>
            </CardContent>
          </Card>

          {/* Pending tickets list */}
          <Card className="lg:col-span-2">
            <CardHeader className="border-b py-3 flex flex-row items-center justify-between">
              <h3 className="text-sm font-semibold">Chamados pendentes</h3>
              <Link
                to="/tickets"
                className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                Ver todos <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {pending.length > 0 ? (
                <ul className="divide-y">
                  {pending.map((t) => (
                    <li
                      key={t.id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => (window.location.href = `/tickets/${t.id}`)}
                    >
                      <Pill bullet color={STATUS_COLOR[t.status]} label={STATUS_LABEL[t.status]} />
                      <span className="flex-1 truncate text-sm font-medium">{t.title}</span>
                      {t.expand?.assignee && (
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={`https://img.usecurling.com/ppl/thumbnail?seed=${t.expand.assignee.id}`}
                          />
                          <AvatarFallback className="text-[10px]">
                            {t.expand.assignee.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <span className="text-xs text-gray-500 w-12 text-right">
                        {formatRelative(t.created)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic p-6 text-center">
                  Sem chamados pendentes.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chart de barras simples - últimos 7 dias */}
        <Card>
          <CardHeader className="border-b py-3">
            <h3 className="text-sm font-semibold">Atividade dos últimos 7 dias</h3>
            <p className="text-xs text-gray-500 mt-0.5">Chamados criados vs resolvidos</p>
          </CardHeader>
          <CardContent className="p-5">
            <div className="flex items-end gap-3 h-48">
              {last7Days.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex-1 flex items-end gap-1">
                    <div
                      className="flex-1 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors relative group"
                      style={{ height: `${(d.count / maxCount) * 100}%` }}
                    >
                      {d.count > 0 && (
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-gray-600 font-medium">
                          {d.count}
                        </span>
                      )}
                    </div>
                    <div
                      className="flex-1 bg-emerald-500 rounded-t hover:bg-emerald-600 transition-colors relative"
                      style={{ height: `${(d.resolved / maxCount) * 100}%` }}
                    >
                      {d.resolved > 0 && (
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-gray-600 font-medium">
                          {d.resolved}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{d.day}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 text-xs">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-blue-500" /> Criados
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-emerald-500" /> Resolvidos
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
