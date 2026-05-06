import pb from '@/lib/pocketbase/client'

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface TicketRecord {
  id: string
  title: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  category?: string
  requester: string
  assignee?: string
  created: string
  updated: string
  expand?: {
    requester?: { id: string; name: string; email: string; role?: string }
    assignee?: { id: string; name: string; email: string; role?: string }
    category?: { id: string; name: string; color?: string }
  }
}

export const getTickets = (filter = '', sort = '-created') =>
  pb.collection('tickets').getFullList<TicketRecord>({
    filter,
    sort,
    expand: 'category,requester,assignee',
  })

export const getTicket = (id: string) =>
  pb.collection('tickets').getOne<TicketRecord>(id, { expand: 'category,requester,assignee' })

export const createTicket = (data: Partial<TicketRecord> & Record<string, unknown>) =>
  pb.collection('tickets').create<TicketRecord>(data)

export const updateTicket = (id: string, data: Partial<TicketRecord> & Record<string, unknown>) =>
  pb.collection('tickets').update<TicketRecord>(id, data)

export const deleteTicket = (id: string) => pb.collection('tickets').delete(id)
