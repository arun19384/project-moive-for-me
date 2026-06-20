import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { titles, watchEntries } from '@/lib/schema'
import { eq, inArray } from 'drizzle-orm'
import { requireUserId, isUnauthorized } from '@/lib/auth-helpers'
import { SAGAS, getWatchedSagaFlags } from '@/lib/sagas'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId()
  if (isUnauthorized(userId)) return userId
  const { id } = await params

  const saga = SAGAS.find((s) => s.id === id)
  if (!saga) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const entries = await db
    .select({ titleId: watchEntries.titleId })
    .from(watchEntries)
    .where(eq(watchEntries.userId, userId))
  const titleIds = [...new Set(entries.map((e) => e.titleId))]
  const userTitles = titleIds.length > 0
    ? await db.select().from(titles).where(inArray(titles.id, titleIds))
    : []

  const flags = getWatchedSagaFlags(
    saga,
    userTitles.map((t) => ({ title: t.title, year: t.releaseYear })),
  )

  return NextResponse.json({
    id: saga.id,
    title: saga.title,
    reward: saga.reward,
    iconName: saga.iconName,
    from: saga.from,
    to: saga.to,
    watched: flags.filter(Boolean).length,
    total: saga.items.length,
    unlocked: flags.every(Boolean),
    items: saga.items.map((it, i) => ({ title: it.title, year: it.year, done: flags[i] })),
  })
}
