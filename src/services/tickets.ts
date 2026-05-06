import pb from '@/lib/pocketbase/client'

export const getTickets = (filter = '', sort = '-created') =>
  pb.collection('tickets').getList(1, 50, { filter, sort, expand: 'category,requester,assignee' })

export const getTicket = (id: string) =>
  pb.collection('tickets').getOne(id, { expand: 'category,requester,assignee' })

export const createTicket = (data: any) => pb.collection('tickets').create(data)

export const updateTicket = (id: string, data: any) => pb.collection('tickets').update(id, data)
