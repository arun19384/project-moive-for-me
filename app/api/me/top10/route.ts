import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { userTop10, watchEntries } from '@/lib/schema'
import { and, eq, inArray } from 'drizzle-orm'
import { requireUserId, isUnauthorized } from '@/lib/auth-helpers'

export async function GET() {
  const userId = await requireUserId()
  if (isUnauthorized(userId)) return userId

  const rows = await db
    .select({ position: userTop10.position, titleId: userTop10.titleId })
    .from(userTop10)
    .where(eq(userTop10.userId, userId))

  const ids: (number | null)[] = Array(10).fill(null)
  for (const r of rows) {
    if (r.position >= 1 && r.position <= 10) ids[r.position - 1] = r.titleId
  }
  return NextResponse.json(ids)
}

export async function PUT(req: NextRequest) {
  const userId = await requireUserId()
  if (isUnauthorized(userId)) return userId

  const body = await req.json().catch(() => ({}))
  const ids = body?.ids
  if (!Array.isArray(ids) || ids.length !== 10) {
    return NextResponse.json({ error: 'ids must be array of length 10' }, { status: 400 })
  }

  const validIds = ids.filter((x): x is number => typeof x === 'number' && Number.isFinite(x))
  if (validIds.length > 0) {
    const owned = await db
      .select({ titleId: watchEntries.titleId })
      .from(watchEntries)
      .where(and(eq(watchEntries.userId, userId), inArray(watchEntries.titleId, validIds)))
    const ownedSet = new Set(owned.map((r) => r.titleId))
    for (const id of validIds) {
      if (!ownedSet.has(id)) {
        return NextResponse.json({ error: `title ${id} not in your shelf` }, { status: 400 })
      }
    }
  }

  await db.delete(userTop10).where(eq(userTop10.userId, userId))

  const inserts = ids
    .map((titleId, i) => ({ userId, position: i + 1, titleId }))
    .filter((r): r is { userId: string; position: number; titleId: number } => typeof r.titleId === 'number')

  if (inserts.length > 0) {
    await db.insert(userTop10).values(inserts)
  }
  return NextResponse.json({ ok: true })
}
