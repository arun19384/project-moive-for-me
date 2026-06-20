'use client'

import { useEffect, useState } from 'react'
import { Plus, Check, X, BookmarkPlus } from 'lucide-react'

type ShelfRow = {
  id: number
  name: string
  emoji: string
  accent: string
  count: number
  member: boolean
}

export default function ShelfPicker({ titleId }: { titleId: number }) {
  const [open, setOpen] = useState(false)
  const [shelves, setShelves] = useState<ShelfRow[] | null>(null)
  const [busyId, setBusyId] = useState<number | 'new' | null>(null)
  const [newName, setNewName] = useState('')
  const [showNew, setShowNew] = useState(false)

  useEffect(() => {
    if (!open || shelves !== null) return
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  async function load() {
    const res = await fetch(`/api/titles/${titleId}/shelves`)
    if (!res.ok) return
    const d = await res.json()
    setShelves(d.shelves)
  }

  async function toggle(s: ShelfRow) {
    setBusyId(s.id)
    if (s.member) {
      await fetch(`/api/shelves/${s.id}/items?titleId=${titleId}`, { method: 'DELETE' })
    } else {
      await fetch(`/api/shelves/${s.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titleId }),
      })
    }
    setShelves((prev) =>
      prev?.map((x) => x.id === s.id
        ? { ...x, member: !s.member, count: s.member ? x.count - 1 : x.count + 1 }
        : x,
      ) ?? null,
    )
    setBusyId(null)
  }

  async function createAndAdd() {
    const trimmed = newName.trim()
    if (!trimmed) return
    setBusyId('new')
    const res = await fetch('/api/shelves', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: trimmed, emoji: '📚' }),
    })
    if (res.ok) {
      const created = await res.json()
      await fetch(`/api/shelves/${created.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titleId }),
      })
      setNewName('')
      setShowNew(false)
      await load()
    }
    setBusyId(null)
  }

  const memberCount = shelves?.filter((s) => s.member).length ?? 0

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-between gap-2 py-3 px-4 rounded-xl text-sm font-medium mb-3 transition active:scale-[0.99]"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--soft)',
        }}
      >
        <span className="flex items-center gap-2">
          <BookmarkPlus size={16} color="#C9A84C" />
          Add to shelf
        </span>
        {memberCount > 0 && (
          <span className="text-[11px] px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C' }}>
            in {memberCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={() => setOpen(false)}>
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.7)' }} />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg max-h-[80dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-base font-bold dy-text">Add to shelf</p>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}
              >
                <X size={16} />
              </button>
            </div>

            {shelves === null ? (
              <p className="text-xs text-center py-4" style={{ color: 'var(--dim)' }}>กำลังโหลด…</p>
            ) : (
              <div className="space-y-2 mb-3">
                {shelves.length === 0 && !showNew && (
                  <p className="text-xs text-center py-2" style={{ color: 'var(--dim)' }}>
                    ยังไม่มี shelf — สร้างอันแรก
                  </p>
                )}
                {shelves.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggle(s)}
                    disabled={busyId === s.id}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition"
                    style={{
                      background: s.member ? 'rgba(201,168,76,0.12)' : 'var(--surface-2)',
                      border: `1px solid ${s.member ? '#C9A84C' : 'var(--border)'}`,
                      opacity: busyId === s.id ? 0.5 : 1,
                    }}
                  >
                    <span className="text-2xl">{s.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold dy-text truncate">{s.name}</p>
                      <p className="text-[11px]" style={{ color: 'var(--muted)' }}>
                        {s.count} {s.count === 1 ? 'title' : 'titles'}
                      </p>
                    </div>
                    {s.member ? (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ background: '#C9A84C' }}>
                        <Check size={14} color="#0D0D0D" strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ border: '1.5px solid var(--border-strong)' }}>
                        <Plus size={14} color="var(--muted)" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {showNew ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="ชื่อ shelf ใหม่"
                  maxLength={120}
                  className="flex-1 px-3 py-2.5 rounded-xl text-sm dy-text outline-none"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                  onKeyDown={(e) => { if (e.key === 'Enter') createAndAdd() }}
                />
                <button
                  type="button"
                  onClick={createAndAdd}
                  disabled={busyId === 'new' || !newName.trim()}
                  className="px-4 rounded-xl text-sm font-semibold"
                  style={{ background: '#C9A84C', color: '#0D0D0D', opacity: !newName.trim() || busyId === 'new' ? 0.5 : 1 }}
                >
                  Create
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowNew(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium"
                style={{ background: 'var(--surface-2)', border: '1px dashed var(--border-strong)', color: 'var(--muted)' }}
              >
                <Plus size={14} /> Create new shelf
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
