import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { titles, watchEntries } from '@/lib/schema'
import { eq, inArray } from 'drizzle-orm'
import { requireUserId, isUnauthorized } from '@/lib/auth-helpers'
import { getShelvesWithPreview } from '@/lib/shelves'
import { SAGAS, getSagaProgress, type SagaCategory } from '@/lib/sagas'
import { computeBadges } from '@/lib/badges-logic'

export type SagaSummary = {
  id: string
  title: string
  category: SagaCategory
  reward: string
  iconName: string
  from: string
  to: string
  total: number
  watched: number
  unlocked: boolean
}

export async function GET() {
  const userId = await requireUserId()
  if (isUnauthorized(userId)) return userId

  const entries = await db
    .select()
    .from(watchEntries)
    .where(eq(watchEntries.userId, userId))

  const titleIds = [...new Set(entries.map((e) => e.titleId))]
  const userTitles = titleIds.length > 0
    ? await db.select().from(titles).where(inArray(titles.id, titleIds))
    : []

  const shelves = await getShelvesWithPreview(userId)

  const userTitleRefs = userTitles.map((t) => ({ title: t.title, year: t.releaseYear }))
  const sagas: SagaSummary[] = SAGAS.map((s) => {
    const p = getSagaProgress(s, userTitleRefs)
    return {
      id: s.id,
      title: s.title,
      category: s.category,
      reward: s.reward,
      iconName: s.iconName,
      from: s.from,
      to: s.to,
      total: p.total,
      watched: p.watched,
      unlocked: p.unlocked,
    }
  })

  const badges = computeBadges(
    entries.map((e) => ({
      titleId: e.titleId,
      rating: e.rating,
      watchedDate: e.watchedDate,
      createdAt: e.createdAt,
      rewatch: e.rewatch,
    })),
    userTitles.map((t) => ({ id: t.id, title: t.title, type: t.type, releaseYear: t.releaseYear })),
  )

  return NextResponse.json({ shelves, sagas, badges })
}
