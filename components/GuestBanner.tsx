'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

const DISMISS_KEY = 'dy:guest:cta-dismissed'

export default function GuestBanner() {
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    // Sync to localStorage (external system) after mount — initial state defaults to dismissed=true
    // to avoid flicker on SSR/hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDismissed(window.localStorage.getItem(DISMISS_KEY) === '1')
  }, [])

  if (dismissed) return null

  function dismiss() {
    window.localStorage.setItem(DISMISS_KEY, '1')
    setDismissed(true)
  }

  return (
    <div
      className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl text-xs"
      style={{ background: '#C9A84C11', border: '1px solid #C9A84C33', color: 'var(--soft)' }}
    >
      <span className="flex-1">
        ตอนนี้คุณใช้แบบ guest — ข้อมูลเก็บในเบราว์เซอร์เท่านั้น.{' '}
        <Link href="/signup" className="font-semibold" style={{ color: '#C9A84C' }}>
          Sign up
        </Link>{' '}
        เพื่อ sync ข้ามอุปกรณ์
      </span>
      <button type="button" onClick={dismiss} aria-label="Dismiss">
        <X size={14} color="var(--faint)" />
      </button>
    </div>
  )
}
