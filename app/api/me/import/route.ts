import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { titles, watchEntries, watchlistItems } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { requireUserId, isUnauthorized } from '@/lib/auth-helpers'

type GuestTitle = {
  id: number
  title: string
  type: 'movie' | 'series' | 'anime'
  coverUrl: string | null
  releaseYear: number | null
  totalEpisodes: number | null
  description: string | null
  originalTitle: string | null
  createdAt: string
}

type GuestEntry = {
  id: number
  titleId: number
  rating: number | null
  watchedDate: string | null
  platform: string | null
  notes: string | null
  rewatch: boolean
  createdAt: string
}

type GuestWatchlistItem = {
  id: number
  title: string
  type: 'movie' | 'series' | 'anime'
  coverUrl: string | null
  releaseYear: number | null
  addedAt: string
}

function asString(v: unknown, max = 1000): string | null {
  if (typeof v !== 'string') return null
  return v.length > max ? v.slice(0, max) : v
}
function asInt(v: unknown): number | null {
  if (typeof v !== 'number' || !Number.isFinite(v)) return null
  return Math.trunc(v)
}
function asType(v: unknown): 'movie' | 'series' | 'anime' | null {
  if (v === 'movie' || v === 'series' || v === 'anime') return v
  return null
}

export async function POST(req: NextRequest) {
  const userId = await requireUserId()
  if (isUnauthorized(userId)) return userId

  const body = await req.json().catch(() => ({}))
  const guestTitles: GuestTitle[] = Array.isArray(body?.titles) ? body.titles : []
  const guestEntries: GuestEntry[] = Array.isArray(body?.entries) ? body.entries : []
  const guestWatchlist: GuestWatchlistItem[] = Array.isArray(body?.watchlist) ? body.watchlist : []

  // Map guest title id (negative) -> real DB title id
  const guestToRealTitleId = new Map<number, number>()

  // Insert/upsert titles. Match by (title + releaseYear + type) so duplicates aren't recreated.
  for (const gt of guestTitles) {
    const ttitle = asString(gt.title, 500)
    const ttype = asType(gt.type)
    if (!ttitle || !ttype) continue

    const releaseYear = asInt(gt.releaseYear)

    // Look up existing matching title in catalog
    const existing = await db
      .select({ id: titles.id, title: titles.title, releaseYear: titles.releaseYear, type: titles.type })
      .from(titles)
      .where(eq(titles.type, ttype))
      .limit(200)

    const matched = existing.find(
      (t) =>
        t.title.toLowerCase().trim() === ttitle.toLowerCase().trim() &&
        (t.releaseYear ?? null) === releaseYear
    )

    let realId: number
    if (matched) {
      realId = matched.id
    } else {
      const [{ id: newId }] = await db
        .insert(titles)
        .values({
          title: ttitle,
          type: ttype,
          releaseYear,
          coverUrl: asString(gt.coverUrl, 1000),
          description: asString(gt.description, 5000),
          totalEpisodes: asInt(gt.totalEpisodes),
          originalTitle: asString(gt.originalTitle, 500),
        })
        .$returningId()
      realId = newId
    }
    guestToRealTitleId.set(gt.id, realId)
  }

  // Pre-load this user's existing entries for idempotency
  const myEntries = await db
    .select({
      titleId: watchEntries.titleId,
      watchedDate: watchEntries.watchedDate,
      createdAt: watchEntries.createdAt,
    })
    .from(watchEntries)
    .where(eq(watchEntries.userId, userId))
  const entryKey = (titleId: number, watchedDate: string | null, createdAt: string | null) =>
    `${titleId}|${watchedDate ?? ''}|${createdAt ?? ''}`
  const existingEntrySet = new Set(myEntries.map((e) => entryKey(e.titleId, e.watchedDate, e.createdAt)))

  let entriesInserted = 0
  for (const ge of guestEntries) {
    const realTitleId = guestToRealTitleId.get(ge.titleId)
    if (!realTitleId) continue

    const watchedDate = asString(ge.watchedDate, 32)
    const createdAt = asString(ge.createdAt, 32)?.slice(0, 19).replace('T', ' ') ?? null

    if (existingEntrySet.has(entryKey(realTitleId, watchedDate, createdAt))) continue

    await db.insert(watchEntries).values({
      userId,
      titleId: realTitleId,
      rating: asInt(ge.rating),
      watchedDate,
      platform: asString(ge.platform, 255),
      notes: asString(ge.notes, 5000),
      rewatch: Boolean(ge.rewatch),
      createdAt,
    })
    entriesInserted++
  }

  // Watchlist: dedupe by (title + type + releaseYear)
  const myWatchlist = await db
    .select({ title: watchlistItems.title, type: watchlistItems.type, releaseYear: watchlistItems.releaseYear })
    .from(watchlistItems)
    .where(eq(watchlistItems.userId, userId))
  const wlKey = (title: string, type: string, year: number | null) =>
    `${title.toLowerCase().trim()}|${type}|${year ?? ''}`
  const existingWlSet = new Set(myWatchlist.map((w) => wlKey(w.title, w.type, w.releaseYear)))

  let watchlistInserted = 0
  for (const gw of guestWatchlist) {
    const t = asString(gw.title, 500)
    const ty = asType(gw.type)
    if (!t || !ty) continue
    const year = asInt(gw.releaseYear)
    if (existingWlSet.has(wlKey(t, ty, year))) continue

    await db.insert(watchlistItems).values({
      userId,
      title: t,
      type: ty,
      coverUrl: asString(gw.coverUrl, 1000),
      releaseYear: year,
      addedAt: asString(gw.addedAt, 32),
    })
    watchlistInserted++
  }

  return NextResponse.json({
    ok: true,
    titlesProcessed: guestTitles.length,
    entriesInserted,
    watchlistInserted,
  })
}

