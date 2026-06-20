import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { and, eq, ne } from 'drizzle-orm'
import { requireUserId, isUnauthorized } from '@/lib/auth-helpers'

const USERNAME_RE = /^[a-z0-9_-]{3,30}$/

export async function PUT(req: NextRequest) {
  const userId = await requireUserId()
  if (isUnauthorized(userId)) return userId

  const body = await req.json().catch(() => ({}))
  const patch: { name?: string | null; username?: string; bio?: string | null } = {}

  if ('name' in body) {
    const name = body.name
    if (name !== null && (typeof name !== 'string' || name.length > 255)) {
      return NextResponse.json({ error: 'invalid name' }, { status: 400 })
    }
    patch.name = name
  }

  if ('bio' in body) {
    const bio = body.bio
    if (bio !== null && typeof bio !== 'string') {
      return NextResponse.json({ error: 'invalid bio' }, { status: 400 })
    }
    patch.bio = bio
  }

  if ('username' in body) {
    const username = String(body.username ?? '').toLowerCase().trim()
    if (!USERNAME_RE.test(username)) {
      return NextResponse.json({ error: 'username must match [a-z0-9_-]{3,30}' }, { status: 400 })
    }
    const clash = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.username, username), ne(users.id, userId)))
      .limit(1)
    if (clash.length > 0) {
      return NextResponse.json({ error: 'username taken' }, { status: 409 })
    }
    patch.username = username
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'no fields to update' }, { status: 400 })
  }

  await db.update(users).set(patch).where(eq(users.id, userId))
  return NextResponse.json({ ok: true })
}
