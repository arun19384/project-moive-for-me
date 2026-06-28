'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import CinemaBackground from '@/components/CinemaBackground'
import BrandLogo from '@/components/BrandLogo'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  if (!token) {
    return (
      <div className="text-center space-y-4 py-8">
        <p className="text-red-400 text-sm">Invalid or missing reset token.</p>
        <Link href="/forgot-password" className="text-[#C9A84C] text-sm hover:underline">
          Request a new link
        </Link>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!password || !confirmPassword) return

    if (password !== confirmPassword) {
      setStatus('error')
      setMessage('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setStatus('error')
      setMessage('Password must be at least 6 characters')
      return
    }

    setStatus('loading')
    setMessage('')

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong')
      }

      setStatus('success')
      setMessage('Your password has been successfully reset.')
    } catch (err: any) {
      setStatus('error')
      setMessage(err.message || 'An error occurred. Please try again.')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="text-[#C9A84C] text-4xl mb-2">✓</div>
        <h3 className="text-white font-medium">Password Reset!</h3>
        <p className="text-[#888] text-sm leading-relaxed">
          {message}
        </p>
        <Link 
          href="/signin" 
          className="block w-full bg-[#C9A84C] text-black text-sm font-medium py-3 px-4 rounded-xl hover:bg-[#d4b35a] transition-colors mt-6"
        >
          Sign In Now
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-[#888] text-sm mb-4 text-center">
          Enter your new password below.
        </p>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New Password"
          disabled={status === 'loading'}
          className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm placeholder:text-[#555] focus:outline-none focus:border-[#C9A84C] disabled:opacity-50 mb-3"
        />
        <input
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm New Password"
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
        className="w-full bg-[#C9A84C] text-black font-medium py-3 px-4 rounded-xl hover:bg-[#d4b35a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center mt-2"
      >
        {status === 'loading' ? (
          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
        ) : (
          'Reset Password'
        )}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 -mt-20 relative">
      <CinemaBackground />
      <BrandLogo subtitle="Set New Password" />

      <div className="w-full max-w-xs space-y-4 relative z-10 bg-[#141414] p-6 rounded-2xl border border-[#2A2A2A] mt-6">
        <Suspense fallback={<div className="text-center text-[#888] text-sm py-8">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
