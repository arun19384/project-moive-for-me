import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { watchlistItems } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { getWatchlistItems } from '@/lib/watchlist'
import { requireUserId, isUnauthorized } from '@/lib/auth-helpers'

export async function GET() {
  const userId = await requireUserId()
  if (isUnauthorized(userId)) return userId

  const items = await getWatchlistItems(userId)
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const userId = await requireUserId()
  if (isUnauthorized(userId)) return userId

  const body = await req.json()
  const { title, type, coverUrl, releaseYear } = body
  if (!title || !type) {
    return NextResponse.json({ error: 'title and type are required' }, { status: 400 })
  }
  const [{ id }] = await db
    .insert(watchlistItems)
    .values({
      userId,
      title,
      type,
      coverUrl: coverUrl ?? null,
      releaseYear: releaseYear ?? null,
      addedAt: new Date().toISOString().slice(0, 10),
    })
    .$returningId()
  const [created] = await db.select().from(watchlistItems).where(eq(watchlistItems.id, id))
  return NextResponse.json(created, { status: 201 })
}
