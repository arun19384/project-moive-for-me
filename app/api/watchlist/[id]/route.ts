import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { watchlistItems } from '@/lib/schema'
import { and, eq } from 'drizzle-orm'
import { requireUserId, isUnauthorized } from '@/lib/auth-helpers'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await requireUserId()
  if (isUnauthorized(userId)) return userId

  const { id } = await params
  await db
    .delete(watchlistItems)
    .where(and(eq(watchlistItems.id, Number(id)), eq(watchlistItems.userId, userId)))
  return NextResponse.json({ ok: true })
}
