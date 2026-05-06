import { LayoutTemplate, Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { SettingsLayoutBase } from '@/components/SettingsLayoutBase'

export function SettingsFormLayouts() {
  return (
    <SettingsLayoutBase
      title="Layouts de Formulário"
      description="Customize quais campos aparecem no formulário de chamado e na sidebar."
    >
      <Card>
        <CardContent className="p-5 flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <Info className="h-5 w-5 text-blue-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <LayoutTemplate className="h-4 w-4" /> Não implementado
            </h3>
            <p className="text-sm text-gray-600">
              No Frappe original (`HD Form Layout` doctype), administradores podem reordenar seções,
              esconder campos e adicionar campos customizados. Como nosso modelo é fixo
              (TicketDialog/CreateTicket têm campos hardcoded), essa customização teria que evoluir
              a coleção <code>tickets</code> para campos dinâmicos via JSON e o dialog para
              renderização data-driven.
            </p>
            <p className="text-xs text-gray-500 italic">
              Sugestão de evolução: criar coleção <code>form_layouts</code> com{' '}
              <code>doctype + fields[]</code> e renderizar TicketDialog dinamicamente.
            </p>
          </div>
        </CardContent>
      </Card>
    </SettingsLayoutBase>
  )
}
