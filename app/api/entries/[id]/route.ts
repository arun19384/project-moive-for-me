import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { watchEntries } from '@/lib/schema'
import { and, eq } from 'drizzle-orm'
import { requireUserId, isUnauthorized } from '@/lib/auth-helpers'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId()
  if (isUnauthorized(userId)) return userId

  const { id } = await params
  const entryId = Number(id)
  const body = await req.json()
  const { rating, watchedDate, platform, notes, rewatch } = body

  const existing = await db
    .select({ id: watchEntries.id })
    .from(watchEntries)
    .where(and(eq(watchEntries.id, entryId), eq(watchEntries.userId, userId)))
    .limit(1)
  if (existing.length === 0) return NextResponse.json({ error: 'not found' }, { status: 404 })

  await db
    .update(watchEntries)
    .set({ rating, watchedDate, platform, notes, rewatch })
    .where(and(eq(watchEntries.id, entryId), eq(watchEntries.userId, userId)))

  const [updated] = await db
    .select()
    .from(watchEntries)
    .where(eq(watchEntries.id, entryId))
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId()
  if (isUnauthorized(userId)) return userId

  const { id } = await params
  await db
    .delete(watchEntries)
    .where(and(eq(watchEntries.id, Number(id)), eq(watchEntries.userId, userId)))
  return NextResponse.json({ ok: true })
}
