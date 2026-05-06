import pb from '@/lib/pocketbase/client'

export const getComments = (ticketId: string) =>
  pb
    .collection('comments')
    .getFullList({ filter: `ticket = "${ticketId}"`, sort: 'created', expand: 'author' })

export const createComment = (data: any) => pb.collection('comments').create(data)
