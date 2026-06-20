import { signIn, auth } from '@/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq, or } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import CinemaBackground from '@/components/CinemaBackground'
import BrandLogo from '@/components/BrandLogo'

const USERNAME_RE = /^[a-z0-9_-]{3,30}$/

function slugifyEmail(email: string): string {
  const local = email.split('@')[0] ?? ''
  return local.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 30) || 'user'
}

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const session = await auth()
  if (session?.userId) redirect('/shelf')

  const { error } = await searchParams

  async function signup(formData: FormData) {
    'use server'
    const email = String(formData.get('email') ?? '').toLowerCase().trim()
    const password = String(formData.get('password') ?? '')
    const usernameInput = String(formData.get('username') ?? '').toLowerCase().trim()

    if (!email || !password) {
      redirect('/signup?error=missing')
    }
    if (password.length < 8) {
      redirect('/signup?error=short')
    }

    const username = usernameInput || slugifyEmail(email)
    if (!USERNAME_RE.test(username)) {
      redirect('/signup?error=username')
    }

    const existing = await db
      .select({ email: users.email, username: users.username })
      .from(users)
      .where(or(eq(users.email, email), eq(users.username, username)))
      .limit(1)

    if (existing.length > 0) {
      const reason = existing[0].email === email ? 'email-taken' : 'username-taken'
      redirect(`/signup?error=${reason}`)
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ')

    await db.insert(users).values({
      email,
      passwordHash,
      username,
      createdAt: now,
    })

    await signIn('credentials', { email, password, redirectTo: '/shelf' })
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 -mt-20 relative">
      <CinemaBackground />
      <BrandLogo subtitle="create your shelf" />

      <form action={signup} className="w-full max-w-xs space-y-3 relative z-10">
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          autoComplete="email"
          className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm placeholder:text-[#555] focus:outline-none focus:border-[#C9A84C]"
        />
        <input
          name="username"
          type="text"
          placeholder="Username (optional)"
          autoComplete="username"
          pattern="[a-z0-9_\-]{3,30}"
          className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm placeholder:text-[#555] focus:outline-none focus:border-[#C9A84C]"
        />
        <input
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="Password (min 8 chars)"
          autoComplete="new-password"
          className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm placeholder:text-[#555] focus:outline-none focus:border-[#C9A84C]"
        />

        {error && <ErrorMessage code={error} />}

        <button
          type="submit"
          className="w-full bg-[#C9A84C] text-black font-medium py-3 px-4 rounded-xl hover:bg-[#d4b35a] transition-colors"
        >
          Sign up
        </button>
      </form>

      <p className="text-[#888] text-sm mt-6 relative z-10">
        มีบัญชีอยู่แล้ว?{' '}
        <Link href="/signin" className="text-[#C9A84C] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}

function ErrorMessage({ code }: { code: string }) {
  const msg: Record<string, string> = {
    missing: 'กรอก email และ password ให้ครบ',
    short: 'Password ต้องอย่างน้อย 8 ตัวอักษร',
    username: 'Username ต้องเป็น a-z, 0-9, _, - ความยาว 3-30 ตัว',
    'email-taken': 'Email นี้ถูกใช้ไปแล้ว',
    'username-taken': 'Username นี้ถูกใช้ไปแล้ว',
  }
  return <p className="text-xs text-red-400 text-center">{msg[code] ?? 'เกิดข้อผิดพลาด'}</p>
}
