import { Sparkles, Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { SettingsLayoutBase } from '@/components/SettingsLayoutBase'

export function SettingsCustomActions() {
  return (
    <SettingsLayoutBase
      title="Ações Customizadas"
      description="Botões customizados que executam scripts no chamado."
    >
      <Card>
        <CardContent className="p-5 flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
            <Info className="h-5 w-5 text-violet-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Não implementado
            </h3>
            <p className="text-sm text-gray-600">
              Esta seção permitiria cadastrar scripts e botões customizados que executam lógica
              arbitrária na barra do chamado. Em PocketBase, isso pode ser implementado via JS hooks
              server-side ou edge functions — fora do escopo desta primeira versão.
            </p>
            <p className="text-xs text-gray-500 italic">
              Como evoluir: criar coleção <code>custom_actions</code> com{' '}
              <code>label + url + icon + condition</code> e renderizar botões na PageTitle do
              TicketDetail conforme as condições.
            </p>
          </div>
        </CardContent>
      </Card>
    </SettingsLayoutBase>
  )
}
