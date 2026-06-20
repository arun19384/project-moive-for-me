import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { requireUserId, isUnauthorized } from '@/lib/auth-helpers'

export async function PUT(req: NextRequest) {
  const userId = await requireUserId()
  if (isUnauthorized(userId)) return userId

  const body = await req.json().catch(() => ({}))
  const theme = body?.theme
  if (theme !== 'dark' && theme !== 'light') {
    return NextResponse.json({ error: 'invalid theme' }, { status: 400 })
  }

  await db.update(users).set({ theme }).where(eq(users.id, userId))
  return NextResponse.json({ ok: true, theme })
}
