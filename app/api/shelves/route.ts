import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { customShelves } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { requireUserId, isUnauthorized } from '@/lib/auth-helpers'
import { getShelvesWithPreview } from '@/lib/shelves'

export async function GET() {
  const userId = await requireUserId()
  if (isUnauthorized(userId)) return userId
  const shelves = await getShelvesWithPreview(userId)
  return NextResponse.json(shelves)
}

export async function POST(req: NextRequest) {
  const userId = await requireUserId()
  if (isUnauthorized(userId)) return userId

  const body = await req.json()
  const name = String(body?.name ?? '').trim()
  const emoji = String(body?.emoji ?? '📚').slice(0, 16)
  const accent = String(body?.accent ?? '#C9A84C').slice(0, 16)
  if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 })

  const [{ id }] = await db
    .insert(customShelves)
    .values({ userId, name, emoji, accent, createdAt: new Date().toISOString().slice(0, 19).replace('T', ' ') })
    .$returningId()
  const [created] = await db.select().from(customShelves).where(eq(customShelves.id, id))
  return NextResponse.json({ ...created, count: 0, previews: [] }, { status: 201 })
}
