import pb from '@/lib/pocketbase/client'

export const getCategories = () => pb.collection('categories').getFullList({ sort: 'name' })
