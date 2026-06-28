'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowLeft, Trash2, Pencil, X, Check } from 'lucide-react'
import type { ShelfDetail } from '@/lib/shelves'
import { posterSrc } from '@/lib/img'

export default function ShelfDetailClient({ initial }: { initial: ShelfDetail }) {
  const router = useRouter()
  const [shelf, setShelf] = useState(initial)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(initial.name)
  const [emoji, setEmoji] = useState(initial.emoji)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    const res = await fetch(`/api/shelves/${shelf.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), emoji }),
    })
    if (res.ok) {
      setShelf({ ...shelf, name: name.trim(), emoji })
      setEditing(false)
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!confirm(`ลบ shelf "${shelf.name}"? (titles ในชั้นนี้จะไม่ถูกลบ)`)) return
    await fetch(`/api/shelves/${shelf.id}`, { method: 'DELETE' })
    router.push('/collections')
  }

  async function removeItem(titleId: number) {
    const res = await fetch(`/api/shelves/${shelf.id}/items?titleId=${titleId}`, { method: 'DELETE' })
    if (res.ok) {
      setShelf({ ...shelf, items: shelf.items.filter((i) => i.titleId !== titleId) })
    }
  }

  return (
    <div className="pb-8">
      <div className="flex items-center justify-between pt-12 pb-4">
        <Link href="/collections" className="flex items-center gap-1 text-sm" style={{ color: 'var(--muted)' }}>
          <ArrowLeft size={18} /> Collections
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditing((v) => !v)}
            className="flex items-center gap-1 text-sm px-2 py-1 rounded-lg"
            style={{ color: 'var(--muted)', border: '1px solid var(--border-strong)' }}
          >
            {editing ? <X size={14} /> : <Pencil size={14} />}
            {editing ? 'Cancel' : 'Edit'}
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 text-sm px-2 py-1 rounded-lg"
            style={{ color: '#ff6b6b', border: '1px solid var(--border-strong)' }}
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      <div className="mb-6">
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              value={emoji}
              onChange={(e) => setEmoji(e.target.value.slice(0, 4))}
              className="w-14 text-center text-3xl rounded-xl px-2 py-2 outline-none"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 text-2xl font-bold rounded-xl px-3 py-2 outline-none dy-text"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              maxLength={120}
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-1"
              style={{ background: '#C9A84C', color: '#0D0D0D' }}
            >
              <Check size={14} /> Save
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span className="text-3xl">{shelf.emoji}</span>
              <h1 className="text-2xl font-bold dy-text">{shelf.name}</h1>
            </div>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
              {shelf.items.length} {shelf.items.length === 1 ? 'title' : 'titles'}
            </p>
          </>
        )}
      </div>

      {shelf.items.length === 0 ? (
        <div className="text-center mt-12">
          <p className="text-sm" style={{ color: 'var(--muted)' }}>ยังไม่มี title ใน shelf นี้</p>
          <p className="text-xs mt-1" style={{ color: 'var(--dim)' }}>
            เปิดหน้า title แล้วกด &quot;Add to shelf&quot;
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {shelf.items.map((it) => (
            <div key={it.titleId} className="relative group">
              <Link href={`/title/${it.titleId}`}>
                {it.coverUrl ? (
                  <Image src={posterSrc(it.coverUrl, 'w342')} alt={it.title} width={342} height={513}
                    className="w-full aspect-[2/3] object-cover rounded-xl"
                    style={{ border: '1px solid var(--border)' }} />
                ) : (
                  <div className="w-full aspect-[2/3] rounded-xl flex items-center justify-center text-2xl font-bold"
                    style={{ background: 'var(--surface)', color: 'var(--faintest)', border: '1px solid var(--border)' }}>
                    {it.title[0]?.toUpperCase()}
                  </div>
                )}
                <p className="text-xs mt-1.5 dy-text line-clamp-2">{it.title}</p>
              </Link>
              <button
                onClick={() => removeItem(it.titleId)}
                aria-label="Remove from shelf"
                className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
