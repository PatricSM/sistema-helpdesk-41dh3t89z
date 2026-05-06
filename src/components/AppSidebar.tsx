import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Ticket, BookOpen, MessageSquareQuote, Tag, LifeBuoy } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/use-auth'

const mainItems = [
  { title: 'Painel', url: '/', icon: LayoutDashboard },
  { title: 'Chamados', url: '/tickets', icon: Ticket },
  { title: 'Base de Conhecimento', url: '/knowledge-base', icon: BookOpen },
]

export function AppSidebar() {
  const location = useLocation()
  const { user } = useAuth()
  const isAgentOrAdmin = user?.role === 'agent' || user?.role === 'admin'
  const isAdmin = user?.role === 'admin'

  const settingsItems: { title: string; url: string; icon: typeof Tag }[] = []
  if (isAgentOrAdmin)
    settingsItems.push({
      title: 'Respostas Prontas',
      url: '/canned-responses',
      icon: MessageSquareQuote,
    })
  if (isAdmin) settingsItems.push({ title: 'Categorias', url: '/categories', icon: Tag })

  const isActive = (url: string) =>
    url === '/' ? location.pathname === '/' : location.pathname.startsWith(url)

  return (
    <Sidebar className="border-r border-border bg-sidebar">
      <SidebarHeader className="p-4 pt-6">
        <div className="flex items-center gap-2 mb-2 px-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <LifeBuoy className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">Helpdesk</span>
        </div>
      </SidebarHeader>
      <SidebarSeparator className="mx-4" />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {settingsItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Configurações</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {settingsItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  )
}
