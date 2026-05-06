import pb from '@/lib/pocketbase/client'

export const getArticles = (filter = '') =>
  pb
    .collection('knowledge_base')
    .getFullList({ filter, sort: '-created', expand: 'category,author' })

export const getArticle = (id: string) =>
  pb.collection('knowledge_base').getOne(id, { expand: 'category,author' })
