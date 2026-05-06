import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import {
  Settings as SettingsIcon,
  Cog,
  Mail,
  Timer,
  UserPlus,
  Users,
  Tag,
  GitFork,
  Phone,
  LayoutTemplate,
  Sparkles,
  MessageSquareQuote,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/PageHeader'
import { PageTitle } from '@/components/PageTitle'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

import { SettingsGeneral } from './settings/SettingsGeneral'
import { SettingsEmail } from './settings/SettingsEmail'
import { SettingsSLA } from './settings/SettingsSLA'
import { SettingsInviteAgents } from './settings/SettingsInviteAgents'
import { SettingsAssignmentRules } from './settings/SettingsAssignmentRules'
import { SettingsTeams } from './settings/SettingsTeams'
import { SettingsCategories } from './settings/SettingsCategories'
import { SettingsCannedResponses } from './settings/SettingsCannedResponses'
import { SettingsTelephony } from './settings/SettingsTelephony'
import { SettingsFormLayouts } from './settings/SettingsFormLayouts'
import { SettingsCustomActions } from './settings/SettingsCustomActions'

interface Tab {
  key: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  group: string
  component: React.ComponentType
}

const TABS: Tab[] = [
  { key: 'general', label: 'Geral', icon: Cog, group: 'Conta', component: SettingsGeneral },
  { key: 'email', label: 'E-mail', icon: Mail, group: 'Conta', component: SettingsEmail },

  { key: 'sla', label: 'Políticas de SLA', icon: Timer, group: 'Operação', component: SettingsSLA },
  {
    key: 'assignment',
    label: 'Regras de Atribuição',
    icon: GitFork,
    group: 'Operação',
    component: SettingsAssignmentRules,
  },

  { key: 'teams', label: 'Times', icon: Users, group: 'Pessoas', component: SettingsTeams },
  {
    key: 'invite',
    label: 'Convidar Agentes',
    icon: UserPlus,
    group: 'Pessoas',
    component: SettingsInviteAgents,
  },

  {
    key: 'categories',
    label: 'Categorias',
    icon: Tag,
    group: 'Domínio',
    component: SettingsCategories,
  },
  {
    key: 'canned',
    label: 'Respostas Prontas',
    icon: MessageSquareQuote,
    group: 'Domínio',
    component: SettingsCannedResponses,
  },

  {
    key: 'layouts',
    label: 'Layouts de Formulário',
    icon: LayoutTemplate,
    group: 'Customização',
    component: SettingsFormLayouts,
  },
  {
    key: 'actions',
    label: 'Ações Customizadas',
    icon: Sparkles,
    group: 'Customização',
    component: SettingsCustomActions,
  },

  {
    key: 'telephony',
    label: 'Telefonia',
    icon: Phone,
    group: 'Integrações',
    component: SettingsTelephony,
  },
]

export default function Settings() {
  const { user } = useAuth()
  const [activeKey, setActiveKey] = useState<string>(TABS[0].key)

  if (user?.role !== 'admin') return <Navigate to="/" replace />

  const grouped = TABS.reduce<Record<string, Tab[]>>((acc, t) => {
    acc[t.group] = acc[t.group] || []
    acc[t.group].push(t)
    return acc
  }, {})

  const ActiveComponent = TABS.find((t) => t.key === activeKey)?.component || SettingsGeneral

  return (
    <>
      <PageHeader>
        <PageTitle title="Configurações" icon={SettingsIcon} />
      </PageHeader>

      <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
        {/* Sidebar de tabs estilo Frappe Settings */}
        <aside className="w-56 shrink-0 bg-gray-50 border-r overflow-y-auto p-1">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group} className="mb-3">
              <h3 className="h-7 px-2 py-[7px] my-[3px] flex items-center text-xs font-medium text-gray-500 uppercase tracking-wide">
                {group}
              </h3>
              <nav className="space-y-[2px]">
                {items.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setActiveKey(t.key)}
                    className={cn(
                      'flex h-7 w-full items-center gap-2 rounded px-2 py-[7px] text-left',
                      activeKey === t.key ? 'bg-white shadow-sm' : 'hover:bg-gray-100',
                    )}
                  >
                    <t.icon className="h-4 w-4 text-gray-700 shrink-0" />
                    <span className="text-sm text-gray-800 truncate">{t.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          ))}
        </aside>

        {/* Conteúdo da subseção */}
        <main className="flex-1 overflow-hidden bg-background">
          <ActiveComponent />
        </main>
      </div>
    </>
  )
}
