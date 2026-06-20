import { NextRequest, NextResponse } from 'next/server'
import { requireUserId, isUnauthorized } from '@/lib/auth-helpers'
import { getShelvesForTitle, getShelvesWithPreview } from '@/lib/shelves'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId()
  if (isUnauthorized(userId)) return userId
  const { id } = await params
  const titleId = Number(id)
  const [member, all] = await Promise.all([
    getShelvesForTitle(titleId, userId),
    getShelvesWithPreview(userId),
  ])
  const memberSet = new Set(member.map((m) => m.id))
  return NextResponse.json({
    shelves: all.map((s) => ({
      id: s.id,
      name: s.name,
      emoji: s.emoji,
      accent: s.accent,
      count: s.count,
      member: memberSet.has(s.id),
    })),
  })
}
