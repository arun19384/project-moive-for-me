import { db } from './db'
import { titles, watchEntries, titleGenres, genres } from './schema'
import { desc, eq, inArray } from 'drizzle-orm'

export type ShelfItem = {
  id: number
  title: string
  type: 'movie' | 'series' | 'anime'
  coverUrl: string | null
  createdAt: string | null
  genres: string[]
  entry: {
    id: number
    rating: number | null
    watchedDate: string | null
    platform: string | null
    createdAt: string | null
  } | null
}

export async function getShelfItems(userId: string): Promise<ShelfItem[]> {
  const entries = await db
    .select()
    .from(watchEntries)
    .where(eq(watchEntries.userId, userId))
    .orderBy(desc(watchEntries.createdAt))

  if (entries.length === 0) return []

  const titleIds = [...new Set(entries.map((e) => e.titleId))]

  const [allTitles, tgs] = await Promise.all([
    db.select().from(titles).where(inArray(titles.id, titleIds)),
    db
      .select({
        titleId: titleGenres.titleId,
        genreId: titleGenres.genreId,
        name: genres.name,
      })
      .from(titleGenres)
      .innerJoin(genres, eq(titleGenres.genreId, genres.id))
      .where(inArray(titleGenres.titleId, titleIds)),
  ])

  const entryMap = new Map<number, typeof entries[0]>()
  for (const e of entries) {
    const existing = entryMap.get(e.titleId)
    if (!existing || (e.createdAt ?? '') > (existing.createdAt ?? '')) {
      entryMap.set(e.titleId, e)
    }
  }

  const genreMap = new Map<number, string[]>()
  for (const tg of tgs) {
    if (!genreMap.has(tg.titleId)) genreMap.set(tg.titleId, [])
    genreMap.get(tg.titleId)!.push(tg.name)
  }

  return allTitles
    .filter((t) => entryMap.has(t.id))
    .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
    .map((t) => {
      const e = entryMap.get(t.id)!
      return {
        id: t.id,
        title: t.title,
        type: t.type,
        coverUrl: t.coverUrl,
        createdAt: t.createdAt,
        genres: genreMap.get(t.id) ?? [],
        entry: {
          id: e.id,
          rating: e.rating,
          watchedDate: e.watchedDate,
          platform: e.platform,
          createdAt: e.createdAt,
        },
      }
    })
}
