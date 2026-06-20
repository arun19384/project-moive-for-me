import { db } from './db'
import { customShelves, shelfItems, titles, watchEntries } from './schema'
import { and, desc, eq, inArray, sql } from 'drizzle-orm'

export type ShelfPreview = {
  id: number
  name: string
  emoji: string
  accent: string
  count: number
  previews: (string | null)[]
}

export type ShelfDetail = {
  id: number
  name: string
  emoji: string
  accent: string
  items: {
    titleId: number
    title: string
    type: 'movie' | 'series' | 'anime'
    coverUrl: string | null
    addedAt: string | null
  }[]
}

export async function getShelvesWithPreview(userId: string): Promise<ShelfPreview[]> {
  const shelves = await db
    .select()
    .from(customShelves)
    .where(eq(customShelves.userId, userId))
    .orderBy(desc(customShelves.id))

  if (shelves.length === 0) return []

  const shelfIds = shelves.map((s) => s.id)
  const items = await db
    .select({
      shelfId: shelfItems.shelfId,
      titleId: shelfItems.titleId,
      coverUrl: titles.coverUrl,
      addedAt: shelfItems.addedAt,
    })
    .from(shelfItems)
    .innerJoin(titles, eq(shelfItems.titleId, titles.id))
    .where(inArray(shelfItems.shelfId, shelfIds))
    .orderBy(desc(shelfItems.addedAt))

  const grouped = new Map<number, { count: number; previews: (string | null)[] }>()
  for (const it of items) {
    if (!grouped.has(it.shelfId)) grouped.set(it.shelfId, { count: 0, previews: [] })
    const g = grouped.get(it.shelfId)!
    g.count++
    if (g.previews.length < 4) g.previews.push(it.coverUrl)
  }

  return shelves.map((s) => ({
    id: s.id,
    name: s.name,
    emoji: s.emoji,
    accent: s.accent,
    count: grouped.get(s.id)?.count ?? 0,
    previews: grouped.get(s.id)?.previews ?? [],
  }))
}

export async function getShelfDetail(shelfId: number, userId: string): Promise<ShelfDetail | null> {
  const [shelf] = await db
    .select()
    .from(customShelves)
    .where(and(eq(customShelves.id, shelfId), eq(customShelves.userId, userId)))
  if (!shelf) return null

  const items = await db
    .select({
      titleId: shelfItems.titleId,
      title: titles.title,
      type: titles.type,
      coverUrl: titles.coverUrl,
      addedAt: shelfItems.addedAt,
    })
    .from(shelfItems)
    .innerJoin(titles, eq(shelfItems.titleId, titles.id))
    .where(eq(shelfItems.shelfId, shelfId))
    .orderBy(desc(shelfItems.addedAt))

  return {
    id: shelf.id,
    name: shelf.name,
    emoji: shelf.emoji,
    accent: shelf.accent,
    items,
  }
}

export async function getShelvesForTitle(titleId: number, userId: string): Promise<{ id: number; name: string; emoji: string }[]> {
  return db
    .select({ id: customShelves.id, name: customShelves.name, emoji: customShelves.emoji })
    .from(shelfItems)
    .innerJoin(customShelves, eq(shelfItems.shelfId, customShelves.id))
    .where(and(eq(shelfItems.titleId, titleId), eq(customShelves.userId, userId)))
}

export async function userOwnsShelf(shelfId: number, userId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: customShelves.id })
    .from(customShelves)
    .where(and(eq(customShelves.id, shelfId), eq(customShelves.userId, userId)))
  return !!row
}

export async function userOwnsTitle(titleId: number, userId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: watchEntries.id })
    .from(watchEntries)
    .where(and(eq(watchEntries.titleId, titleId), eq(watchEntries.userId, userId)))
  return !!row
}

export { sql }
