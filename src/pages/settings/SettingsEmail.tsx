import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash, Mail, AlertTriangle } from 'lucide-react' // eslint-disable-line
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SettingsLayoutBase } from '@/components/SettingsLayoutBase'
import { Pill } from '@/components/Pill'
import { EmptyState } from '@/components/EmptyState'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import {
  getEmailAccounts,
  createEmailAccount,
  updateEmailAccount,
  deleteEmailAccount,
  EmailAccountRecord,
  EmailProvider,
} from '@/services/email-accounts'
import { extractFieldErrors, getErrorMessage } from '@/lib/pocketbase/errors'

const PROVIDER_LABEL: Record<EmailProvider, string> = {
  gmail: 'Gmail',
  outlook: 'Outlook',
  sendgrid: 'SendGrid',
  smtp: 'SMTP',
  imap: 'IMAP',
}

function EmailAccountDialog({
  account,
  children,
}: {
  account?: EmailAccountRecord
  children?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [provider, setProvider] = useState<EmailProvider>('smtp')
  const [smtpHost, setSmtpHost] = useState('')
  const [smtpPort, setSmtpPort] = useState<number | ''>(587)
  const [useTls, setUseTls] = useState(true)
  const [enableOutgoing, setEnableOutgoing] = useState(true)
  const [enableIncoming, setEnableIncoming] = useState(false)
  const [isDefault, setIsDefault] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      setName(account?.name || '')
      setEmail(account?.email || '')
      setProvider(account?.provider || 'smtp')
      setSmtpHost(account?.smtp_host || '')
      setSmtpPort(account?.smtp_port || 587)
      setUseTls(account?.use_tls ?? true)
      setEnableOutgoing(account?.enable_outgoing ?? true)
      setEnableIncoming(account?.enable_incoming ?? false)
      setIsDefault(account?.is_default ?? false)
      setIsActive(account?.is_active ?? true)
      setErrors({})
    }
  }, [open, account])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    try {
      const payload = {
        name,
        email,
        provider,
        smtp_host: smtpHost || undefined,
        smtp_port: typeof smtpPort === 'number' ? smtpPort : undefined,
        use_tls: useTls,
        enable_outgoing: enableOutgoing,
        enable_incoming: enableIncoming,
        is_default: isDefault,
        is_active: isActive,
      }
      if (account) {
        await updateEmailAccount(account.id, payload)
        toast({ title: 'Conta atualizada!' })
      } else {
        await createEmailAccount(payload)
        toast({ title: 'Conta criada!' })
      }
      setOpen(false)
    } catch (err) {
      const f = extractFieldErrors(err)
      if (Object.keys(f).length > 0) setErrors(f)
      else
        toast({
          variant: 'destructive',
          title: 'Erro ao salvar',
          description: getErrorMessage(err),
        })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-1.5" size="sm">
            <Plus className="h-4 w-4" /> Nova conta
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{account ? 'Editar conta de e-mail' : 'Nova conta de e-mail'}</DialogTitle>
            <DialogDescription>
              Configure provedores SMTP/IMAP. Senhas devem ser configuradas no servidor PocketBase.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Suporte"
                  required
                />
                {errors.name && <span className="text-xs text-destructive">{errors.name}</span>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                {errors.email && <span className="text-xs text-destructive">{errors.email}</span>}
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Provedor</Label>
              <Select value={provider} onValueChange={(v) => setProvider(v as EmailProvider)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PROVIDER_LABEL) as EmailProvider[]).map((p) => (
                    <SelectItem key={p} value={p}>
                      {PROVIDER_LABEL[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-2 col-span-2">
                <Label htmlFor="smtp_host">SMTP Host</Label>
                <Input
                  id="smtp_host"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="smtp_port">Porta</Label>
                <Input
                  id="smtp_port"
                  type="number"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(parseInt(e.target.value) || '')}
                  placeholder="587"
                />
              </div>
            </div>
            <div className="space-y-3 pt-1">
              <SwitchRow
                label="TLS/SSL"
                description="Usar conexão criptografada"
                checked={useTls}
                onChange={setUseTls}
              />
              <SwitchRow
                label="Envio (Outgoing)"
                description="Esta conta pode enviar e-mails"
                checked={enableOutgoing}
                onChange={setEnableOutgoing}
              />
              <SwitchRow
                label="Recebimento (Incoming)"
                description="Esta conta pode receber e-mails como chamados"
                checked={enableIncoming}
                onChange={setEnableIncoming}
              />
              <SwitchRow
                label="Conta padrão"
                description="Usar esta como conta padrão para envio"
                checked={isDefault}
                onChange={setIsDefault}
              />
              <SwitchRow
                label="Ativa"
                description="Conta habilitada para uso"
                checked={isActive}
                onChange={setIsActive}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function SwitchRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

export function SettingsEmail() {
  const [accounts, setAccounts] = useState<EmailAccountRecord[]>([])
  const { toast } = useToast()

  const load = async () => {
    try {
      setAccounts(await getEmailAccounts())
    } catch {
      // handled
    }
  }

  useEffect(() => {
    load()
  }, [])

  useRealtime('email_accounts', load)

  const handleDelete = async (id: string) => {
    try {
      await deleteEmailAccount(id)
      toast({ title: 'Conta removida!' })
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Falha ao remover',
        description: getErrorMessage(err),
      })
    }
  }

  return (
    <SettingsLayoutBase
      title="Contas de E-mail"
      description="Configure as contas para envio e recebimento de e-mails dos chamados."
      headerActions={<EmailAccountDialog />}
      headerBottom={
        <div className="flex items-start gap-2 p-3 rounded-md bg-amber-50 border border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">
            Esta UI permite cadastrar metadados das contas. O envio/recebimento real depende de uma
            configuração de servidor (workers SMTP/IMAP) que precisa ser implementada separadamente.
          </p>
        </div>
      }
    >
      {accounts.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 mt-4">
          {accounts.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-md bg-violet-100 flex items-center justify-center">
                      <Mail className="h-4 w-4 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{a.name}</p>
                      <p className="text-xs text-gray-500">{a.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    {a.is_default && <Pill color="violet" label="Padrão" />}
                    {a.is_active ? (
                      <Pill color="green" label="Ativa" bullet />
                    ) : (
                      <Pill color="gray" label="Inativa" />
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {a.provider && <Pill color="blue" label={PROVIDER_LABEL[a.provider]} />}
                  {a.enable_outgoing && <Pill color="gray" label="Envio" />}
                  {a.enable_incoming && <Pill color="gray" label="Recebimento" />}
                </div>
                <div className="flex items-center gap-1 mt-3 pt-3 border-t">
                  <EmailAccountDialog account={a}>
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                      <Pencil className="h-3 w-3" /> Editar
                    </Button>
                  </EmailAccountDialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1 text-destructive"
                      >
                        <Trash className="h-3 w-3" /> Excluir
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir conta?</AlertDialogTitle>
                        <AlertDialogDescription>Esta ação é irreversível.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(a.id)}>
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Mail}
          title="Nenhuma conta de e-mail"
          description="Cadastre contas para enviar respostas e receber chamados por e-mail."
          action={<EmailAccountDialog />}
        />
      )}
    </SettingsLayoutBase>
  )
}
