import { Phone, AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { SettingsLayoutBase } from '@/components/SettingsLayoutBase'

export function SettingsTelephony() {
  return (
    <SettingsLayoutBase
      title="Telefonia"
      description="Integração com Twilio/Exotel para chamadas dentro do helpdesk."
    >
      <Card>
        <CardContent className="p-5 flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <Phone className="h-4 w-4" /> Não configurado
            </h3>
            <p className="text-sm text-gray-600">
              Esta integração requer credenciais de Twilio/Exotel e workers de chamadas que não
              estão presentes nesta instalação. Para habilitar:
            </p>
            <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1 ml-1">
              <li>Configure uma conta Twilio (ou Exotel) e obtenha SID/Token</li>
              <li>Crie a coleção PocketBase `call_logs` com hooks server-side</li>
              <li>Adicione um worker que escuta webhooks do provedor</li>
              <li>Implemente o discador no front via Twilio Voice SDK</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </SettingsLayoutBase>
  )
}
