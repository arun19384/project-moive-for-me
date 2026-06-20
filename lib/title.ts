import { db } from './db'
import { titles, watchEntries, titleGenres, genres } from './schema'
import { and, desc, eq } from 'drizzle-orm'

export type TitleDetail = {
  id: number
  title: string
  originalTitle: string | null
  type: 'movie' | 'series' | 'anime'
  coverUrl: string | null
  releaseYear: number | null
  totalEpisodes: number | null
  description: string | null
  createdAt: string | null
  entry: {
    id: number
    rating: number | null
    watchedDate: string | null
    platform: string | null
    notes: string | null
    rewatch: boolean | null
    createdAt: string | null
  } | null
  genres: { id: number; name: string }[]
} | null

export async function getTitleDetail(id: number, userId: string): Promise<TitleDetail> {
  const titleRow = await db.select().from(titles).where(eq(titles.id, id))
  const t = titleRow[0]
  if (!t) return null

  const [entries, tgs] = await Promise.all([
    db
      .select()
      .from(watchEntries)
      .where(and(eq(watchEntries.titleId, id), eq(watchEntries.userId, userId)))
      .orderBy(desc(watchEntries.createdAt)),
    db
      .select({ id: genres.id, name: genres.name })
      .from(titleGenres)
      .innerJoin(genres, eq(titleGenres.genreId, genres.id))
      .where(eq(titleGenres.titleId, id)),
  ])

  const e = entries[0] ?? null

  // Hide title from user if they have no entry for it (shared catalog — only "their" titles show)
  if (!e) return null

  return {
    id: t.id,
    title: t.title,
    originalTitle: t.originalTitle,
    type: t.type,
    coverUrl: t.coverUrl,
    releaseYear: t.releaseYear,
    totalEpisodes: t.totalEpisodes,
    description: t.description,
    createdAt: t.createdAt,
    entry: {
      id: e.id,
      rating: e.rating,
      watchedDate: e.watchedDate,
      platform: e.platform,
      notes: e.notes,
      rewatch: e.rewatch,
      createdAt: e.createdAt,
    },
    genres: tgs,
  }
}
