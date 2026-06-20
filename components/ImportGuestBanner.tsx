'use client'

import { useEffect, useState } from 'react'
import { hasGuestData, readAllGuestData, clearGuestData } from '@/lib/storage'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'

export default function ImportGuestBanner() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [counts, setCounts] = useState<{ titles: number; watchlist: number }>({ titles: 0, watchlist: 0 })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (hasGuestData()) {
      const data = readAllGuestData()
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCounts({ titles: data.titles.length, watchlist: data.watchlist.length })
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(true)
    }
  }, [])

  if (!open) return null

  async function doImport() {
    setBusy(true)
    setError('')
    try {
      const data = readAllGuestData()
      const res = await fetch('/api/me/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('import failed')
      clearGuestData()
      setOpen(false)
      router.refresh()
    } catch {
      setError('นำเข้าไม่สำเร็จ — ลองใหม่')
      setBusy(false)
    }
  }

  function discard() {
    if (!confirm('ลบข้อมูล guest ในเบราว์เซอร์ทิ้ง?')) return
    clearGuestData()
    setOpen(false)
  }

  function later() {
    setOpen(false)
  }

  return (
    <div
      className="mb-4 p-4 rounded-2xl relative"
      style={{ background: '#C9A84C11', border: '1px solid #C9A84C33' }}
    >
      <button
        type="button"
        onClick={later}
        aria-label="Close"
        className="absolute right-2 top-2 p-1"
      >
        <X size={14} color="var(--faint)" />
      </button>
      <p className="text-sm font-semibold dy-text mb-1">พบข้อมูล guest ในเบราว์เซอร์</p>
      <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}>
        {counts.titles} title{counts.titles === 1 ? '' : 's'} · {counts.watchlist} watchlist item{counts.watchlist === 1 ? '' : 's'} — ย้ายเข้าบัญชีนี้?
      </p>
      {error && <p className="text-xs mb-2" style={{ color: '#ff6b6b' }}>{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={doImport}
          disabled={busy}
          className="flex-1 py-2 rounded-xl text-xs font-semibold transition-opacity"
          style={{ background: '#C9A84C', color: '#0D0D0D', opacity: busy ? 0.6 : 1 }}
        >
          {busy ? 'กำลังย้าย...' : 'Import'}
        </button>
        <button
          type="button"
          onClick={discard}
          disabled={busy}
          className="px-3 py-2 rounded-xl text-xs font-semibold"
          style={{ background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          Discard
        </button>
      </div>
    </div>
  )
}
