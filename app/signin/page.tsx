import { signIn, auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import CinemaBackground from '@/components/CinemaBackground'
import BrandLogo from '@/components/BrandLogo'

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>
}) {
  const session = await auth()
  if (session?.userId) redirect('/shelf')

  const { callbackUrl, error } = await searchParams
  const redirectTo = callbackUrl ?? '/shelf'

  async function login(formData: FormData) {
    'use server'
    const email = String(formData.get('email') ?? '')
    const password = String(formData.get('password') ?? '')
    try {
      await signIn('credentials', { email, password, redirectTo })
    } catch (err) {
      // NextAuth re-throws a NEXT_REDIRECT on success — let it propagate.
      if ((err as { digest?: string })?.digest?.startsWith('NEXT_REDIRECT')) throw err
      redirect(`/signin?error=invalid&callbackUrl=${encodeURIComponent(redirectTo)}`)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 -mt-20 relative">
      <CinemaBackground />
      <BrandLogo subtitle="ดูยัง? — your watched shelf" />

      <form action={login} className="w-full max-w-xs space-y-3 relative z-10">
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          autoComplete="email"
          className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm placeholder:text-[#555] focus:outline-none focus:border-[#C9A84C]"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="Password"
          autoComplete="current-password"
          className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm placeholder:text-[#555] focus:outline-none focus:border-[#C9A84C]"
        />
        {error === 'invalid' && (
          <p className="text-xs text-red-400 text-center">Email หรือ password ไม่ถูกต้อง</p>
        )}
        <button
          type="submit"
          className="w-full bg-[#C9A84C] text-black font-medium py-3 px-4 rounded-xl hover:bg-[#d4b35a] transition-colors"
        >
          Sign in
        </button>
      </form>

      <p className="text-[#888] text-sm mt-6 relative z-10">
        ยังไม่มีบัญชี?{' '}
        <Link href="/signup" className="text-[#C9A84C] hover:underline">
          Sign up
        </Link>
      </p>

      <Link
        href="/shelf"
        className="text-[#666] text-xs mt-4 hover:text-[#888] relative z-10"
      >
        ลองใช้แบบ guest →
      </Link>
    </div>
  )
}
