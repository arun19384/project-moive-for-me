import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { titles, watchEntries, titleGenres } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { getShelfItems } from '@/lib/shelf'
import { requireUserId, isUnauthorized } from '@/lib/auth-helpers'

export async function GET(req: NextRequest) {
  const userId = await requireUserId()
  if (isUnauthorized(userId)) return userId

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')

  const all = await getShelfItems(userId)
  const filtered = type && type !== 'all' ? all.filter((t) => t.type === type) : all
  return NextResponse.json(filtered)
}

export async function POST(req: NextRequest) {
  const userId = await requireUserId()
  if (isUnauthorized(userId)) return userId

  const body = await req.json()
  const {
    title,
    originalTitle,
    type,
    releaseYear,
    coverUrl,
    description,
    totalEpisodes,
    rating,
    watchedDate,
    platform,
    notes,
    rewatch,
    genreIds,
  } = body

  if (!title || !type) {
    return NextResponse.json({ error: 'title and type are required' }, { status: 400 })
  }

  const [{ id: newTitleId }] = await db
    .insert(titles)
    .values({
      title,
      originalTitle: originalTitle || null,
      type,
      releaseYear: releaseYear || null,
      coverUrl: coverUrl || null,
      description: description || null,
      totalEpisodes: totalEpisodes || null,
    })
    .$returningId()

  if (genreIds && genreIds.length > 0) {
    await db.insert(titleGenres).values(
      genreIds.map((gid: number) => ({ titleId: newTitleId, genreId: gid }))
    )
  }

  const [{ id: newEntryId }] = await db
    .insert(watchEntries)
    .values({
      userId,
      titleId: newTitleId,
      rating: rating || null,
      watchedDate: watchedDate || null,
      platform: platform || null,
      notes: notes || null,
      rewatch: rewatch ?? false,
    })
    .$returningId()

  const [newTitle] = await db.select().from(titles).where(eq(titles.id, newTitleId))
  const [entry] = await db.select().from(watchEntries).where(eq(watchEntries.id, newEntryId))

  return NextResponse.json({ title: newTitle, entry }, { status: 201 })
}
