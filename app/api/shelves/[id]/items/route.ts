import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { shelfItems } from '@/lib/schema'
import { and, eq } from 'drizzle-orm'
import { requireUserId, isUnauthorized } from '@/lib/auth-helpers'
import { userOwnsShelf, userOwnsTitle } from '@/lib/shelves'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId()
  if (isUnauthorized(userId)) return userId
  const { id } = await params
  const shelfId = Number(id)

  const body = await req.json()
  const titleId = Number(body?.titleId)
  if (!Number.isFinite(titleId) || titleId <= 0) {
    return NextResponse.json({ error: 'titleId required' }, { status: 400 })
  }

  const [owns, hasTitle] = await Promise.all([
    userOwnsShelf(shelfId, userId),
    userOwnsTitle(titleId, userId),
  ])
  if (!owns) return NextResponse.json({ error: 'shelf not found' }, { status: 404 })
  if (!hasTitle) return NextResponse.json({ error: 'title not in your library' }, { status: 400 })

  try {
    await db.insert(shelfItems).values({
      shelfId,
      titleId,
      addedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    if (!/duplicate/i.test(msg)) throw e
  }
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId()
  if (isUnauthorized(userId)) return userId
  const { id } = await params
  const shelfId = Number(id)

  const url = new URL(req.url)
  const titleId = Number(url.searchParams.get('titleId'))
  if (!Number.isFinite(titleId) || titleId <= 0) {
    return NextResponse.json({ error: 'titleId required' }, { status: 400 })
  }
  if (!(await userOwnsShelf(shelfId, userId))) {
    return NextResponse.json({ error: 'shelf not found' }, { status: 404 })
  }
  await db
    .delete(shelfItems)
    .where(and(eq(shelfItems.shelfId, shelfId), eq(shelfItems.titleId, titleId)))
  return NextResponse.json({ ok: true })
}
