import { auth } from '@/auth'
import { getWatchlistItems } from '@/lib/watchlist'
import WatchlistClient from './WatchlistClient'

export const dynamic = 'force-dynamic'

export default async function WatchlistPage() {
  const session = await auth()
  const userId = session?.userId ?? null
  const initialItems = userId ? await getWatchlistItems(userId) : null
  return <WatchlistClient mode={userId ? 'signed-in' : 'guest'} initialItems={initialItems} />
}
