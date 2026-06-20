import { auth } from '@/auth'
import { getStats } from '@/lib/stats'
import { getShelfItems } from '@/lib/shelf'
import StatsClient from './StatsClient'

export const dynamic = 'force-dynamic'

export default async function StatsPage() {
  const session = await auth()
  const userId = session?.userId ?? null

  if (!userId) {
    return <StatsClient mode="guest" initialStats={null} initialTitles={null} />
  }

  const [stats, items] = await Promise.all([
    getStats(userId),
    getShelfItems(userId),
  ])
  const titles = items.map((i) => ({
    id: i.id,
    title: i.title,
    type: i.type,
    coverUrl: i.coverUrl,
    entry: i.entry ? { rating: i.entry.rating } : null,
  }))
  return <StatsClient mode="signed-in" initialStats={stats} initialTitles={titles} />
}
