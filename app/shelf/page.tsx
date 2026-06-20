import { auth } from '@/auth'
import { getShelfItems } from '@/lib/shelf'
import ShelfClient from './ShelfClient'

export const dynamic = 'force-dynamic'

export default async function ShelfPage() {
  const session = await auth()
  const userId = session?.userId ?? null
  const initialItems = userId ? await getShelfItems(userId) : null
  return <ShelfClient mode={userId ? 'signed-in' : 'guest'} initialItems={initialItems} />
}
