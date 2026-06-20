import NextAuth, { type DefaultSession } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

declare module 'next-auth' {
  interface Session {
    userId: string
    user: DefaultSession['user']
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? '').toLowerCase().trim()
        const password = String(credentials?.password ?? '')
        if (!email || !password) return null

        const found = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1)

        const user = found[0]
        if (!user) return null

        const ok = await bcrypt.compare(password, user.passwordHash)
        if (!ok) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id
      return token
    },
    async session({ session, token }) {
      if (token.sub) session.userId = token.sub
      return session
    },
  },
})
