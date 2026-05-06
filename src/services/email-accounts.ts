import pb from '@/lib/pocketbase/client'

export type EmailProvider = 'gmail' | 'outlook' | 'sendgrid' | 'smtp' | 'imap'

export interface EmailAccountRecord {
  id: string
  name: string
  email: string
  provider?: EmailProvider
  smtp_host?: string
  smtp_port?: number
  use_tls?: boolean
  is_default?: boolean
  is_active?: boolean
  enable_outgoing?: boolean
  enable_incoming?: boolean
  created: string
  updated: string
}

export const getEmailAccounts = () =>
  pb.collection('email_accounts').getFullList<EmailAccountRecord>({ sort: '-is_default,name' })

export const createEmailAccount = (data: Partial<EmailAccountRecord>) =>
  pb.collection('email_accounts').create<EmailAccountRecord>(data)

export const updateEmailAccount = (id: string, data: Partial<EmailAccountRecord>) =>
  pb.collection('email_accounts').update<EmailAccountRecord>(id, data)

export const deleteEmailAccount = (id: string) => pb.collection('email_accounts').delete(id)
