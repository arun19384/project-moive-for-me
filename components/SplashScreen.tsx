'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

type Phase = 'show' | 'hiding' | 'done'

export default function SplashScreen() {
  const [phase, setPhase] = useState<Phase>('show')

  useEffect(() => {
    // Only show the splash on a genuine cold start, not on every reload within a session.
    if (typeof window !== 'undefined' && sessionStorage.getItem('dy:splash-shown')) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase('done')
      return
    }
    try { sessionStorage.setItem('dy:splash-shown', '1') } catch { /* private mode */ }
    const hide = setTimeout(() => setPhase('hiding'), 450)
    const done = setTimeout(() => setPhase('done'), 800)
    return () => {
      clearTimeout(hide)
      clearTimeout(done)
    }
  }, [])

  if (phase === 'done') return null

  return (
    <div
      aria-hidden
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{
        zIndex: 100,
        background: 'var(--bg)',
        opacity: phase === 'hiding' ? 0 : 1,
        transition: 'opacity 0.55s ease',
        pointerEvents: phase === 'hiding' ? 'none' : 'auto',
      }}
    >
      <Image
        src="/icon.png"
        alt=""
        width={96}
        height={96}
        className="dy-splash-logo w-24 h-24 rounded-3xl"
        style={{
          border: '1px solid var(--border)',
          animation: 'dy-splash-pop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        }}
      />
      <h1
        className="dy-splash-text text-3xl font-bold mt-5 leading-none"
        style={{ color: '#C9A84C', fontFamily: 'Georgia, serif', animation: 'dy-splash-rise 0.6s ease-out 0.28s both' }}
      >
        Do young
      </h1>
      <p
        className="dy-splash-text text-sm mt-2"
        style={{ color: 'var(--muted)', animation: 'dy-splash-rise 0.6s ease-out 0.42s both' }}
      >
        ดูยัง? your watched shelf
      </p>
    </div>
  )
}
