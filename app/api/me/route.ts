import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { requireUserId, isUnauthorized } from '@/lib/auth-helpers'

export async function GET() {
  const userId = await requireUserId()
  if (isUnauthorized(userId)) return userId

  const [u] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      image: users.image,
      username: users.username,
      bio: users.bio,
      badgeId: users.badgeId,
      theme: users.theme,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!u) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json(u)
}
