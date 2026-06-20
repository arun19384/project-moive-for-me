import { db } from './db'
import { watchlistItems } from './schema'
import { desc, eq } from 'drizzle-orm'

export type WatchlistItem = {
  id: number
  title: string
  type: 'movie' | 'series' | 'anime'
  coverUrl: string | null
  releaseYear: number | null
  addedAt: string | null
}

export async function getWatchlistItems(userId: string): Promise<WatchlistItem[]> {
  const items = await db
    .select()
    .from(watchlistItems)
    .where(eq(watchlistItems.userId, userId))
    .orderBy(desc(watchlistItems.id))
  return items
}
