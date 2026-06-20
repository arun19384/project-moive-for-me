import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { titles, watchEntries, titleGenres } from '@/lib/schema'
import { and, eq } from 'drizzle-orm'
import { getTitleDetail } from '@/lib/title'
import { requireUserId, isUnauthorized } from '@/lib/auth-helpers'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId()
  if (isUnauthorized(userId)) return userId

  const { id } = await params
  const detail = await getTitleDetail(Number(id), userId)
  if (!detail) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json(detail)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId()
  if (isUnauthorized(userId)) return userId

  const { id } = await params
  const titleId = Number(id)
  const body = await req.json()
  const {
    title,
    type,
    totalEpisodes,
    coverUrl,
    releaseYear,
    genreIds,
    entryId,
    rating,
    watchedDate,
    platform,
    notes,
  } = body

  // Ensure the user owns at least one entry for this title before allowing edits
  const ownEntry = await db
    .select({ id: watchEntries.id })
    .from(watchEntries)
    .where(and(eq(watchEntries.titleId, titleId), eq(watchEntries.userId, userId)))
    .limit(1)
  if (ownEntry.length === 0) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  await db
    .update(titles)
    .set({
      ...(title !== undefined && { title }),
      ...(type !== undefined && { type }),
      ...(totalEpisodes !== undefined && { totalEpisodes }),
      ...(coverUrl !== undefined && { coverUrl }),
      ...(releaseYear !== undefined && { releaseYear }),
    })
    .where(eq(titles.id, titleId))

  if (Array.isArray(genreIds)) {
    await db.delete(titleGenres).where(eq(titleGenres.titleId, titleId))
    if (genreIds.length > 0) {
      await db.insert(titleGenres).values(
        genreIds.map((gid: number) => ({ titleId, genreId: gid }))
      )
    }
  }

  if (entryId) {
    await db
      .update(watchEntries)
      .set({
        ...(rating !== undefined && { rating }),
        ...(watchedDate !== undefined && { watchedDate }),
        ...(platform !== undefined && { platform }),
        ...(notes !== undefined && { notes }),
      })
      .where(and(eq(watchEntries.id, Number(entryId)), eq(watchEntries.userId, userId)))
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId()
  if (isUnauthorized(userId)) return userId

  const { id } = await params
  const titleId = Number(id)

  // Shared catalog: only delete THIS user's entries, never the title row itself.
  await db
    .delete(watchEntries)
    .where(and(eq(watchEntries.titleId, titleId), eq(watchEntries.userId, userId)))

  return NextResponse.json({ ok: true })
}
