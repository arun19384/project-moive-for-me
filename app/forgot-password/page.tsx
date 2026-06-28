'use client'

import { useState } from 'react'
import Link from 'next/link'
import CinemaBackground from '@/components/CinemaBackground'
import BrandLogo from '@/components/BrandLogo'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return

    setStatus('loading')
    setMessage('')

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong')
      }

      setStatus('success')
      setMessage(data.message || 'If an account exists, a reset link was sent.')
    } catch (err: any) {
      setStatus('error')
      setMessage(err.message || 'An error occurred. Please try again.')
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 -mt-20 relative">
      <CinemaBackground />
      <BrandLogo subtitle="Reset Password" />

      <div className="w-full max-w-xs space-y-4 relative z-10 bg-[#141414] p-6 rounded-2xl border border-[#2A2A2A] mt-6">
        {status === 'success' ? (
          <div className="text-center space-y-4">
            <div className="text-[#C9A84C] text-4xl mb-2">✉️</div>
            <h3 className="text-white font-medium">Check your email</h3>
            <p className="text-[#888] text-sm leading-relaxed">
              {message}
            </p>
            <Link 
              href="/signin" 
              className="block w-full bg-[#2A2A2A] text-white text-sm font-medium py-3 px-4 rounded-xl hover:bg-[#333] transition-colors mt-4"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="text-[#888] text-sm mb-4 text-center">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                disabled={status === 'loading'}
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm placeholder:text-[#555] focus:outline-none focus:border-[#C9A84C] disabled:opacity-50"
              />
            </div>
            
            {status === 'error' && (
              <p className="text-xs text-red-400 text-center">{message}</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-[#C9A84C] text-black font-medium py-3 px-4 rounded-xl hover:bg-[#d4b35a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {status === 'loading' ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                'Send Reset Link'
              )}
            </button>
            
            <div className="text-center mt-4 pt-2 border-t border-[#2A2A2A]">
              <Link href="/signin" className="text-[#888] text-xs hover:text-[#C9A84C] transition-colors mt-2 inline-block">
                Back to Sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
