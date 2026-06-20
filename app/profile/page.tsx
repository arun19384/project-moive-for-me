import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import ProfileClient from './ProfileClient'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.userId) redirect('/signin?callbackUrl=/profile')

  const [u] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      image: users.image,
      username: users.username,
      bio: users.bio,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1)

  if (!u) redirect('/signin')

  return <ProfileClient initial={u} />
}
