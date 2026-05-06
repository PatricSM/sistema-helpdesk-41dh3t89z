import { Phone, Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/PageHeader'
import { PageTitle } from '@/components/PageTitle'

export default function CallLogs() {
  return (
    <>
      <PageHeader>
        <PageTitle title="Registros de Chamada" icon={Phone} />
      </PageHeader>

      <div className="px-5 py-5 max-w-3xl mx-auto">
        <Card>
          <CardContent className="p-6 flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <Info className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold mb-1">Telefonia não configurada</h3>
              <p className="text-sm text-gray-600 mb-3">
                A integração de telefonia (Twilio) não está habilitada nesta instalação. Para usar
                registros de chamada e fazer ligações pelo helpdesk, configure um provedor de
                telefonia.
              </p>
              <p className="text-xs text-gray-500">
                Esta tela existe como placeholder para manter paridade com o Frappe Helpdesk
                original. As chamadas seriam armazenadas em uma coleção <code>call_logs</code>{' '}
                vinculada a chamados e contatos.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
