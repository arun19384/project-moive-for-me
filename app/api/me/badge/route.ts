import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { requireUserId, isUnauthorized } from '@/lib/auth-helpers'

export async function PUT(req: NextRequest) {
  const userId = await requireUserId()
  if (isUnauthorized(userId)) return userId

  const body = await req.json().catch(() => ({}))
  const raw = body?.badgeId
  const badgeId =
    raw === null || raw === '' ? null : typeof raw === 'string' && raw.length <= 64 ? raw : undefined
  if (badgeId === undefined) {
    return NextResponse.json({ error: 'invalid badgeId' }, { status: 400 })
  }

  await db.update(users).set({ badgeId }).where(eq(users.id, userId))
  return NextResponse.json({ ok: true, badgeId })
}
