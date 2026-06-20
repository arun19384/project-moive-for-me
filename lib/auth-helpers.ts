import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export async function requireUserId(): Promise<string | NextResponse> {
  const session = await auth()
  if (!session?.userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  return session.userId
}

export function isUnauthorized(value: string | NextResponse): value is NextResponse {
  return value instanceof NextResponse
}
