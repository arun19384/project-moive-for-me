'use client'

import Link from 'next/link'
import Image from 'next/image'
import { createElement, useEffect, useMemo, useState } from 'react'
import AppHeader from '@/components/AppHeader'
import {
  Plus, Lock, Sparkles, Trophy,
  CheckCircle2, ChevronRight, X, Trash2,
} from 'lucide-react'
import { resolveIcon, RARITY_COLOR, type Rarity } from '@/lib/badges'
import { CATEGORY_LABEL, CATEGORY_ORDER, type SagaCategory } from '@/lib/sagas'
import { posterSrc } from '@/lib/img'

type Tab = 'shelves' | 'sagas' | 'badges'

type ShelfDTO = {
  id: number
  name: string
  emoji: string
  accent: string
  count: number
  previews: (string | null)[]
}

type SagaDTO = {
  id: string
  title: string
  category: SagaCategory
  reward: string
  iconName: string
  from: string
  to: string
  total: number
  watched: number
  unlocked: boolean
}

type BadgeDTO = {
  id: string
  name: string
  desc: string
  iconName: string
  rarity: Rarity
  unlocked: boolean
  unlockedAt: string | null
  progress?: { current: number; target: number }
}

type CollectionsData = {
  shelves: ShelfDTO[]
  sagas: SagaDTO[]
  badges: BadgeDTO[]
}

type SagaItemFlag = { title: string; year: number; done: boolean }
type SagaDetail = SagaDTO & { items: SagaItemFlag[] }

export default function CollectionsPage() {
  const [tab, setTab] = useState<Tab>('shelves')
  const [data, setData] = useState<CollectionsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [openSaga, setOpenSaga] = useState<SagaDTO | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [sagaFilter, setSagaFilter] = useState<'all' | SagaCategory>('all')
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    try {
      const res = await fetch('/api/collections')
      if (!res.ok) {
        if (res.status === 401) setError('signin')
        else setError('error')
        return
      }
      setData(await res.json())
      setError(null)
    } catch {
      setError('error')
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh().finally(() => setLoading(false))
  }, [])

  const unlockedBadges = data ? data.badges.filter((b) => b.unlocked).length : 0
  const completedSagas = data ? data.sagas.filter((s) => s.unlocked).length : 0
  const newlyUnlocked = useMemo(() => {
    if (!data) return null
    const u = data.badges.filter((b) => b.unlocked && b.unlockedAt)
    u.sort((a, b) => (b.unlockedAt ?? '').localeCompare(a.unlockedAt ?? ''))
    return u[0] ?? null
  }, [data])
  const [dismissUnlock, setDismissUnlock] = useState(false)

  const filteredSagas = useMemo(() => {
    if (!data) return []
    return (sagaFilter === 'all' ? data.sagas : data.sagas.filter((s) => s.category === sagaFilter))
      .slice()
      .sort((a, b) => (b.watched / Math.max(1, b.total)) - (a.watched / Math.max(1, a.total)))
  }, [data, sagaFilter])

  if (loading) {
    return (
      <div>
        <AppHeader />
        <div className="grid grid-cols-3 gap-2 mb-5">
          {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
        </div>
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <SkeletonRow key={i} />)}
        </div>
      </div>
    )
  }

  if (error === 'signin') {
    return (
      <div>
        <AppHeader />
        <div className="mt-12 text-center">
          <p className="text-base font-semibold dy-text">Sign in เพื่อใช้ Collections</p>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            สร้าง shelves, ปลดล็อก saga และ badge
          </p>
          <Link href="/signin" className="inline-block mt-5 px-5 py-2.5 rounded-full text-sm font-semibold"
            style={{ background: '#C9A84C', color: '#0D0D0D' }}>
            Sign in
          </Link>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div>
        <AppHeader />
        <p className="mt-12 text-sm" style={{ color: 'var(--muted)' }}>โหลดข้อมูลไม่สำเร็จ</p>
      </div>
    )
  }

  return (
    <div>
      <AppHeader />

      {newlyUnlocked && !dismissUnlock && (
        <div
          className="mb-4 rounded-2xl p-3 flex items-center gap-3 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(201,168,76,0.18), rgba(201,168,76,0.04))',
            border: '1px solid rgba(201,168,76,0.35)',
          }}
        >
          <div className="absolute -right-4 -top-4 opacity-10">
            <Sparkles size={80} color="#C9A84C" />
          </div>
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
            style={{ background: '#C9A84C' }}
          >
            <Trophy size={22} color="#0D0D0D" strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-wider" style={{ color: '#C9A84C' }}>
              Just unlocked
            </p>
            <p className="text-sm font-semibold dy-text leading-snug">
              {newlyUnlocked.name}
              {newlyUnlocked.unlockedAt && (
                <span style={{ color: 'var(--muted)' }}> · {newlyUnlocked.unlockedAt}</span>
              )}
            </p>
          </div>
          <button
            onClick={() => setDismissUnlock(true)}
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'rgba(0,0,0,0.3)', color: 'var(--muted)' }}
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 mb-5">
        <StatCard label="Shelves" value={data.shelves.length} />
        <StatCard label="Sagas" value={`${completedSagas}/${data.sagas.length}`} accent />
        <StatCard label="Badges" value={`${unlockedBadges}/${data.badges.length}`} />
      </div>

      <div
        className="flex rounded-full p-1 mb-5"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {(['shelves', 'sagas', 'badges'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2 text-xs font-medium rounded-full capitalize transition"
            style={{
              background: tab === t ? '#C9A84C' : 'transparent',
              color: tab === t ? '#0D0D0D' : 'var(--muted)',
            }}
          >
            {t === 'shelves' ? 'My shelves' : t === 'sagas' ? 'Sagas' : 'Badges'}
          </button>
        ))}
      </div>

      {tab === 'shelves' && (
        <div className="space-y-3 mb-8">
          <button
            onClick={() => setShowCreate(true)}
            className="w-full rounded-2xl p-4 flex items-center gap-3 transition active:scale-[0.98]"
            style={{
              background: 'var(--surface)',
              border: '1px dashed var(--border-strong)',
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)' }}
            >
              <Plus size={22} color="#C9A84C" strokeWidth={2.5} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold dy-text">Create new shelf</p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                Group titles your way — by mood, year, vibe…
              </p>
            </div>
            <ChevronRight size={18} color="var(--dim)" />
          </button>

          {data.shelves.length === 0 ? (
            <p className="text-xs mt-4 text-center" style={{ color: 'var(--dim)' }}>
              ยังไม่มี shelf — กดด้านบนเพื่อสร้างอันแรก
            </p>
          ) : (
            data.shelves.map(s => (
              <ShelfRow key={s.id} shelf={s} onDelete={refresh} />
            ))
          )}
        </div>
      )}

      {tab === 'sagas' && (
        <>
          <div className="flex gap-2 mb-4 overflow-x-auto -mx-4 px-4 pb-1" style={{ scrollbarWidth: 'none' }}>
            {(['all', ...CATEGORY_ORDER] as const).map(c => {
              const active = sagaFilter === c
              const count = c === 'all' ? data.sagas.length : data.sagas.filter(s => s.category === c).length
              return (
                <button
                  key={c}
                  onClick={() => setSagaFilter(c)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors"
                  style={{
                    background: active ? '#C9A84C' : 'var(--surface)',
                    color: active ? '#0D0D0D' : 'var(--muted)',
                    border: `1px solid ${active ? '#C9A84C' : 'var(--border)'}`,
                  }}
                >
                  {c === 'all' ? 'All' : CATEGORY_LABEL[c]}
                  <span className="ml-1.5 opacity-70">{count}</span>
                </button>
              )
            })}
          </div>

        <div className="space-y-3 mb-8">
          {filteredSagas.map(s => {
            const pct = Math.round((s.watched / s.total) * 100)
            return (
              <button
                key={s.id}
                onClick={() => setOpenSaga(s)}
                className="w-full rounded-2xl overflow-hidden relative text-left active:scale-[0.99] transition"
                style={{
                  background: `linear-gradient(135deg, ${s.from}, ${s.to})`,
                  border: s.unlocked ? '1px solid rgba(201,168,76,0.4)' : '1px solid var(--border)',
                }}
              >
                <div className="p-4 flex items-center gap-3 relative">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: s.unlocked ? '#C9A84C' : 'rgba(0,0,0,0.35)',
                      border: s.unlocked ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    {createElement(resolveIcon(s.iconName), { size: 22, color: s.unlocked ? '#0D0D0D' : '#fff', strokeWidth: 2 })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold leading-tight truncate" style={{ color: '#fff' }}>
                        {s.title}
                      </p>
                      {s.unlocked && (
                        <CheckCircle2 size={14} color="#C9A84C" strokeWidth={2.5} className="shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      {s.watched}/{s.total} watched · Reward: {s.reward}
                    </p>
                    <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.35)' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          background: s.unlocked
                            ? 'linear-gradient(90deg, #C9A84C, #F5D77A)'
                            : 'rgba(255,255,255,0.7)',
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold leading-none" style={{ color: '#fff' }}>{pct}%</p>
                    {!s.unlocked && (
                      <Lock size={12} color="rgba(255,255,255,0.5)" className="mt-1 ml-auto" />
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
        </>
      )}

      {tab === 'badges' && (
        <div className="mb-8">
          <p className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--muted)' }}>
            Unlocked · {unlockedBadges}
          </p>
          {unlockedBadges === 0 ? (
            <p className="text-xs mb-6" style={{ color: 'var(--dim)' }}>
              ยังไม่มี badge ที่ปลดล็อก — เริ่มดูเลย!
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3 mb-6">
              {data.badges.filter(b => b.unlocked).map(b => {
                const color = RARITY_COLOR[b.rarity]
                return (
                  <div
                    key={b.id}
                    className="rounded-2xl p-3 flex flex-col items-center text-center"
                    style={{
                      background: 'var(--surface)',
                      border: `1px solid ${color}40`,
                    }}
                  >
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center mb-2 relative"
                      style={{
                        background: `radial-gradient(circle at 30% 30%, ${color}55, ${color}15)`,
                        border: `1.5px solid ${color}`,
                      }}
                    >
                      {createElement(resolveIcon(b.iconName), { size: 24, color, strokeWidth: 2 })}
                      {b.rarity === 'legendary' && (
                        <Sparkles size={10} className="absolute -top-0.5 -right-0.5" color="#C9A84C" />
                      )}
                    </div>
                    <p className="text-xs font-semibold dy-text leading-tight">{b.name}</p>
                    <p className="text-[10px] mt-0.5 capitalize" style={{ color }}>{b.rarity}</p>
                  </div>
                )
              })}
            </div>
          )}

          <p className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--muted)' }}>
            Locked · {data.badges.length - unlockedBadges}
          </p>
          <div className="grid grid-cols-3 gap-3">
            {data.badges.filter(b => !b.unlocked).map(b => {
              const pct = b.progress ? Math.min(100, Math.round((b.progress.current / b.progress.target) * 100)) : 0
              return (
                <div
                  key={b.id}
                  className="rounded-2xl p-3 flex flex-col items-center text-center opacity-80"
                  style={{ background: 'var(--surface)', border: '1px dashed var(--border-strong)' }}
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mb-2 relative"
                    style={{ background: 'var(--surface-2)', border: '1.5px solid var(--border-strong)' }}
                  >
                    {createElement(resolveIcon(b.iconName), { size: 22, color: 'var(--faint)', strokeWidth: 1.5 })}
                    <div
                      className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: 'var(--bg)', border: '1px solid var(--border-strong)' }}
                    >
                      <Lock size={9} color="var(--muted)" />
                    </div>
                  </div>
                  <p className="text-xs font-semibold leading-tight" style={{ color: 'var(--soft)' }}>{b.name}</p>
                  <p className="text-[10px] mt-0.5 leading-snug line-clamp-2" style={{ color: 'var(--dim)' }}>{b.desc}</p>
                  {b.progress && b.progress.target > 1 && (
                    <div className="w-full mt-1.5 h-1 rounded-full overflow-hidden" style={{ background: 'var(--border-dim)' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--faint)' }} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {openSaga && <SagaModal saga={openSaga} onClose={() => setOpenSaga(null)} />}
      {showCreate && <CreateShelfModal onClose={() => setShowCreate(false)} onCreated={refresh} />}
    </div>
  )
}

function ShelfRow({ shelf, onDelete }: { shelf: ShelfDTO; onDelete: () => void }) {
  const [deleting, setDeleting] = useState(false)
  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm(`ลบ shelf "${shelf.name}"? (titles ในชั้นนี้จะไม่ถูกลบ)`)) return
    setDeleting(true)
    await fetch(`/api/shelves/${shelf.id}`, { method: 'DELETE' })
    onDelete()
  }
  const previews = [...shelf.previews]
  while (previews.length < 4) previews.push(null)
  return (
    <Link
      href={`/collections/shelf/${shelf.id}`}
      className="rounded-2xl p-3 flex items-center gap-3 active:scale-[0.99] transition"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)', opacity: deleting ? 0.5 : 1 }}
    >
      <div className="grid grid-cols-2 gap-0.5 w-16 h-16 rounded-lg overflow-hidden shrink-0">
        {previews.slice(0, 4).map((cover, i) => (
          cover ? (
            <Image key={i} src={posterSrc(cover, 'w185')} alt="" width={32} height={32} className="w-full h-full object-cover" />
          ) : (
            <div key={i} style={{ background: 'var(--surface-2)' }} />
          )
        ))}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">{shelf.emoji}</span>
          <p className="text-sm font-semibold dy-text truncate">{shelf.name}</p>
        </div>
        <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
          {shelf.count} {shelf.count === 1 ? 'title' : 'titles'}
        </p>
        <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ background: 'var(--border-dim)' }}>
          <div
            className="h-full rounded-full"
            style={{ width: `${Math.min(100, shelf.count * 4)}%`, background: shelf.accent }}
          />
        </div>
      </div>
      <button
        onClick={handleDelete}
        className="p-2 rounded-full"
        aria-label="Delete shelf"
        style={{ color: 'var(--dim)' }}
      >
        <Trash2 size={14} />
      </button>
    </Link>
  )
}

function StatCard({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div
      className="rounded-xl p-3 text-center"
      style={{
        background: 'var(--surface)',
        border: accent ? '1px solid rgba(201,168,76,0.35)' : '1px solid var(--border)',
      }}
    >
      <p className="text-xl font-bold" style={{ color: accent ? '#C9A84C' : 'var(--text)' }}>{value}</p>
      <p className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: 'var(--muted)' }}>{label}</p>
    </div>
  )
}

function SkeletonCard() {
  return <div className="rounded-xl h-16 animate-pulse" style={{ background: 'var(--surface)' }} />
}

function SkeletonRow() {
  return <div className="rounded-2xl h-20 animate-pulse" style={{ background: 'var(--surface)' }} />
}

function SagaModal({ saga, onClose }: { saga: SagaDTO; onClose: () => void }) {
  const [detail, setDetail] = useState<SagaDetail | null>(null)

  useEffect(() => {
    fetch(`/api/collections/sagas/${saga.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setDetail(d))
  }, [saga.id])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.7)' }} />
      <div
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[85dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div
          className="p-5 relative"
          style={{ background: `linear-gradient(135deg, ${saga.from}, ${saga.to})` }}
        >
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.4)', color: '#fff' }}
          >
            <X size={16} />
          </button>
          <div className="flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: saga.unlocked ? '#C9A84C' : 'rgba(0,0,0,0.4)',
                boxShadow: saga.unlocked ? '0 0 24px rgba(201,168,76,0.5)' : 'none',
              }}
            >
              {createElement(resolveIcon(saga.iconName), { size: 26, color: saga.unlocked ? '#0D0D0D' : '#fff', strokeWidth: 2 })}
            </div>
            <div>
              <p className="text-base font-bold" style={{ color: '#fff' }}>{saga.title}</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {saga.watched} of {saga.total} watched
              </p>
            </div>
          </div>
          <div
            className="mt-4 rounded-xl p-3 flex items-center gap-2"
            style={{
              background: saga.unlocked ? 'rgba(201,168,76,0.18)' : 'rgba(0,0,0,0.35)',
              border: saga.unlocked ? '1px solid rgba(201,168,76,0.5)' : '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {saga.unlocked ? (
              <Trophy size={16} color="#C9A84C" />
            ) : (
              <Lock size={14} color="rgba(255,255,255,0.6)" />
            )}
            <p className="text-xs" style={{ color: saga.unlocked ? '#F5D77A' : 'rgba(255,255,255,0.75)' }}>
              {saga.unlocked ? `Unlocked: ${saga.reward}` : `Reward: ${saga.reward} badge`}
            </p>
          </div>
        </div>

        <div className="p-4 space-y-1.5">
          {!detail ? (
            <p className="text-xs text-center py-4" style={{ color: 'var(--dim)' }}>กำลังโหลด…</p>
          ) : detail.items.map((it, i) => (
            <div
              key={i}
              className="flex items-center gap-3 py-2 px-1"
              style={{ borderBottom: i < detail.items.length - 1 ? '1px solid var(--border-dim)' : 'none' }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: it.done ? '#C9A84C' : 'transparent',
                  border: it.done ? 'none' : '1.5px solid var(--border-strong)',
                }}
              >
                {it.done && <CheckCircle2 size={12} color="#0D0D0D" strokeWidth={3} />}
              </div>
              <p className="text-sm flex-1 truncate" style={{ color: it.done ? 'var(--text)' : 'var(--muted)' }}>
                {it.title}
              </p>
              {it.year > 0 && (
                <p className="text-[11px]" style={{ color: 'var(--dim)' }}>{it.year}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CreateShelfModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('')
  const emojis = [
    '📚', '🌙', '🔥', '💀', '🎬', '🍿', '☕', '🌀', '✨', '💔', '🌊', '🎭',
    '❤️', '😱', '😂', '🥹', '🤯', '🧠', '👻', '🎃', '🗡️', '⚔️', '🛸', '🚀',
    '🦸', '🧙', '🐉', '🌌', '⭐', '🌟', '💫', '🌈', '🍂', '❄️', '🌸', '🌴',
    '🎉', '🏆', '👑', '💎', '🎯', '🕹️', '🎮', '📺', '🎞️', '🎨', '🎵', '🎸',
    '🐱', '🐶', '🦊', '🐻', '🐼', '🦁', '🌵', '🍕', '🍷', '🧋', '⚡', '💥',
  ]
  const [picked, setPicked] = useState('📚')
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState('')

  async function handleCreate() {
    const trimmed = name.trim()
    if (!trimmed) {
      setErr('กรอกชื่อ shelf')
      return
    }
    setSubmitting(true)
    setErr('')
    const res = await fetch('/api/shelves', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: trimmed, emoji: picked }),
    })
    if (!res.ok) {
      setErr('สร้างไม่สำเร็จ')
      setSubmitting(false)
      return
    }
    onCreated()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.7)' }} />
      <div
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[88dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-5"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-base font-bold dy-text">New shelf</p>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}
          >
            <X size={16} />
          </button>
        </div>

        <label className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Name</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Rainy Sunday picks"
          maxLength={120}
          className="w-full mt-1 mb-4 px-3 py-2.5 rounded-xl text-sm dy-text outline-none"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
        />

        <label className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Icon</label>
        <div
          className="grid grid-cols-6 gap-2 mt-2 mb-5 overflow-y-auto pr-1"
          style={{ maxHeight: '11rem', overscrollBehavior: 'contain' }}
        >
          {emojis.map(e => (
            <button
              key={e}
              onClick={() => setPicked(e)}
              className="aspect-square rounded-xl text-2xl flex items-center justify-center transition"
              style={{
                background: picked === e ? 'rgba(201,168,76,0.15)' : 'var(--surface-2)',
                border: `1px solid ${picked === e ? '#C9A84C' : 'var(--border)'}`,
              }}
            >
              {e}
            </button>
          ))}
        </div>

        {err && <p className="text-xs mb-2" style={{ color: '#ff6b6b' }}>{err}</p>}

        <button
          onClick={handleCreate}
          disabled={submitting}
          className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity"
          style={{ background: '#C9A84C', color: '#0D0D0D', opacity: submitting ? 0.6 : 1 }}
        >
          {submitting ? 'กำลังสร้าง…' : 'Create shelf'}
        </button>
      </div>
    </div>
  )
}
