import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { customShelves } from '@/lib/schema'
import { and, eq } from 'drizzle-orm'
import { requireUserId, isUnauthorized } from '@/lib/auth-helpers'
import { getShelfDetail } from '@/lib/shelves'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId()
  if (isUnauthorized(userId)) return userId
  const { id } = await params
  const detail = await getShelfDetail(Number(id), userId)
  if (!detail) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json(detail)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId()
  if (isUnauthorized(userId)) return userId
  const { id } = await params
  const shelfId = Number(id)

  const body = await req.json()
  const patch: { name?: string; emoji?: string; accent?: string } = {}
  if (typeof body?.name === 'string') patch.name = body.name.trim().slice(0, 120)
  if (typeof body?.emoji === 'string') patch.emoji = body.emoji.slice(0, 16)
  if (typeof body?.accent === 'string') patch.accent = body.accent.slice(0, 16)

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'nothing to update' }, { status: 400 })
  }

  const result = await db
    .update(customShelves)
    .set(patch)
    .where(and(eq(customShelves.id, shelfId), eq(customShelves.userId, userId)))
  return NextResponse.json({ ok: true, result })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId()
  if (isUnauthorized(userId)) return userId
  const { id } = await params
  await db
    .delete(customShelves)
    .where(and(eq(customShelves.id, Number(id)), eq(customShelves.userId, userId)))
  return NextResponse.json({ ok: true })
}
