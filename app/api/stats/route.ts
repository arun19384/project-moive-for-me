import { getStats } from '@/lib/stats'
import { requireUserId, isUnauthorized } from '@/lib/auth-helpers'
import { NextResponse } from 'next/server'

export async function GET() {
  const userId = await requireUserId()
  if (isUnauthorized(userId)) return userId

  const data = await getStats(userId)
  return NextResponse.json(data)
}
