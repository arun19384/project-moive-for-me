'use client'

import Link from 'next/link'
import { createElement, useEffect, useState } from 'react'
import { User, Sun, Moon, Download, Trash2, Info, ChevronRight, Award, Check, LogIn, LogOut } from 'lucide-react'
import { RARITY_COLOR, BADGE_STORAGE_KEY, resolveIcon, RARITY_ORDER, type Rarity } from '@/lib/badges'
import { signOutAction } from './actions'

type Theme = 'dark' | 'light'

type Me = {
  id: string
  email: string
  name: string | null
  username: string | null
  image: string | null
} | null

type UnlockedBadge = { id: string; name: string; iconName: string; rarity: Rarity }

export default function SettingsPage() {
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)
  const [badgeId, setBadgeId] = useState<string | null>(null)
  const [unlocked, setUnlocked] = useState<UnlockedBadge[]>([])
  const [unlockedLoading, setUnlockedLoading] = useState(true)
  const [me, setMe] = useState<Me>(null)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    const rawTheme = typeof window !== 'undefined' ? localStorage.getItem('dy:theme') : null
    /* eslint-disable react-hooks/set-state-in-effect */
    setTheme(rawTheme === 'light' ? 'light' : 'dark')
    const raw = typeof window !== 'undefined' ? localStorage.getItem(BADGE_STORAGE_KEY) : null
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        setBadgeId(parsed?.id ?? null)
      } catch {
        setBadgeId(raw)
      }
    }
    setMounted(true)
    /* eslint-enable react-hooks/set-state-in-effect */
    fetch('/api/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setMe(data))
      .catch(() => setMe(null))
    fetch('/api/collections')
      .then((r) => (r.ok ? r.json() : { badges: [] }))
      .then((d: { badges: { id: string; name: string; iconName: string; rarity: Rarity; unlocked: boolean }[] }) => {
        setUnlocked(d.badges.filter((b) => b.unlocked))
      })
      .catch(() => setUnlocked([]))
      .finally(() => setUnlockedLoading(false))
  }, [])

  async function handleSignOut() {
    setSigningOut(true)
    await signOutAction()
  }

  useEffect(() => {
    if (!mounted) return
    localStorage.setItem('dy:theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme, mounted])

  function pickBadge(id: string | null) {
    setBadgeId(id)
    if (id) {
      const b = unlocked.find((x) => x.id === id)
      if (b) {
        localStorage.setItem(BADGE_STORAGE_KEY, JSON.stringify({
          id: b.id, name: b.name, iconName: b.iconName, rarity: b.rarity,
        }))
      }
    } else {
      localStorage.removeItem(BADGE_STORAGE_KEY)
    }
    window.dispatchEvent(new Event('dy:badge-change'))
  }

  async function handleExport() {
    try {
      const res = await fetch('/api/titles')
      const data = await res.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const stamp = new Date().toISOString().slice(0, 10)
      a.download = `do-young-backup-${stamp}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Export failed')
    }
  }

  function handleClearAll() {
    if (!confirm('ต้องการล้างข้อมูลทั้งหมด? (ฟีเจอร์นี้ยังไม่พร้อม)')) return
    alert('เร็ว ๆ นี้')
  }

  return (
    <div className="pb-8">
      <div className="pt-12 pb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>ปรับแต่งให้เป็นของคุณ</p>
      </div>

      {/* Profile */}
      <Section title="โปรไฟล์" icon={User}>
        {me ? (
          <>
            <Link
              href="/profile"
              className="flex items-center gap-3 p-4 rounded-2xl mb-2"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border-dim)' }}
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold overflow-hidden"
                style={{ background: '#C9A84C', color: '#0D0D0D' }}>
                {me.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={me.image} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  (me.username ?? me.name ?? me.email)[0]?.toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate" style={{ color: 'var(--text)' }}>
                  {me.username ?? me.name ?? 'user'}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--dim)' }}>{me.email}</p>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--faint)' }} />
            </Link>
            <Row onClick={handleSignOut}>
              <LogOut size={18} style={{ color: 'var(--danger)' }} />
              <span className="flex-1 text-sm" style={{ color: 'var(--danger)' }}>
                {signingOut ? 'กำลังออกจากระบบ...' : 'Sign out'}
              </span>
              <ChevronRight size={16} style={{ color: 'var(--faint)' }} />
            </Row>
          </>
        ) : (
          <Link
            href="/signin"
            className="flex items-center gap-3 p-4 rounded-2xl"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border-dim)' }}
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: 'var(--surface)', color: 'var(--muted)' }}>
              <User size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold" style={{ color: 'var(--text)' }}>Guest</p>
              <p className="text-xs" style={{ color: 'var(--dim)' }}>Sign in เพื่อ sync ข้ามอุปกรณ์</p>
            </div>
            <LogIn size={18} style={{ color: '#C9A84C' }} />
          </Link>
        )}
      </Section>

      {/* Display badge */}
      <Section title="แสดง badge ข้างชื่อ" icon={Award}>
        <div className="grid grid-cols-8 gap-1.5">
          <button
            type="button"
            onClick={() => pickBadge(null)}
            title="None"
            className="aspect-square rounded-full flex items-center justify-center relative"
            style={{
              background: 'var(--surface)',
              border: `1.5px ${badgeId == null ? 'solid #C9A84C' : 'dashed var(--border-strong)'}`,
            }}
          >
            <span className="text-xs" style={{ color: 'var(--faint)' }}>—</span>
            {badgeId == null && (
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full flex items-center justify-center"
                style={{ background: '#C9A84C' }}>
                <Check size={7} color="#0D0D0D" strokeWidth={3.5} />
              </div>
            )}
          </button>
          {[...unlocked].sort((a, b) => RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity]).map(b => {
            const color = RARITY_COLOR[b.rarity]
            const selected = b.id === badgeId
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => pickBadge(b.id)}
                title={b.name}
                className="aspect-square rounded-full flex items-center justify-center relative"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${color}55, ${color}15)`,
                  border: `1.5px solid ${selected ? '#C9A84C' : color}`,
                  boxShadow: selected ? `0 0 0 2px rgba(201,168,76,0.25)` : 'none',
                }}
              >
                {createElement(resolveIcon(b.iconName), { size: 12, color, strokeWidth: 2.2 })}
                {selected && (
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                    style={{ background: '#C9A84C' }}>
                    <Check size={9} color="#0D0D0D" strokeWidth={3} />
                  </div>
                )}
              </button>
            )
          })}
        </div>
        {(() => {
          const b = unlocked.find(x => x.id === badgeId)
          if (unlockedLoading) {
            return <p className="text-[11px] mt-2.5" style={{ color: 'var(--dim)' }}>กำลังโหลด badge ที่ปลดล็อก...</p>
          }
          if (unlocked.length === 0) {
            return <p className="text-[11px] mt-2.5" style={{ color: 'var(--dim)' }}>
              ยังไม่มี badge ที่ปลดล็อก — เริ่มดูซีรีส์/หนังเพื่อปลดล็อก
            </p>
          }
          return (
            <p className="text-[11px] mt-2.5" style={{ color: 'var(--dim)' }}>
              {b ? <>เลือกอยู่: <span style={{ color: RARITY_COLOR[b.rarity] }}>{b.name}</span> · {b.rarity}</> : 'ไม่แสดง badge ข้างชื่อ'}
            </p>
          )
        })()}
      </Section>

      {/* Theme */}
      <Section title="ธีม" icon={theme === 'light' ? Sun : Moon}>
        <div className="grid grid-cols-2 gap-2">
          {([
            { key: 'dark', label: 'Dark', Icon: Moon },
            { key: 'light', label: 'Light', Icon: Sun },
          ] as const).map(({ key, label, Icon }) => (
            <button key={key} type="button" onClick={() => setTheme(key)}
              className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
              style={{
                background: theme === key ? '#C9A84C' : 'var(--surface)',
                color: theme === key ? '#0D0D0D' : 'var(--soft)',
                border: `1px solid ${theme === key ? '#C9A84C' : 'var(--border)'}`,
              }}>
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </Section>

      {/* Data */}
      <Section title="ข้อมูล" icon={Download}>
        <Row onClick={handleExport}>
          <Download size={18} style={{ color: '#C9A84C' }} />
          <span className="flex-1 text-sm" style={{ color: 'var(--text)' }}>ส่งออกข้อมูล (JSON)</span>
          <ChevronRight size={16} style={{ color: 'var(--faint)' }} />
        </Row>
        <Row onClick={handleClearAll} danger>
          <Trash2 size={18} style={{ color: 'var(--danger)' }} />
          <span className="flex-1 text-sm" style={{ color: 'var(--danger)' }}>ล้างข้อมูลทั้งหมด</span>
          <ChevronRight size={16} style={{ color: 'var(--faint)' }} />
        </Row>
      </Section>

      {/* About */}
      <Section title="เกี่ยวกับ" icon={Info}>
        <div className="p-4 rounded-2xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-dim)' }}>
          <p className="text-base font-bold" style={{ color: '#C9A84C', fontFamily: 'Georgia, serif' }}>
            Do young
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>ดูยัง? your watched shelf</p>
          <p className="text-xs mt-3" style={{ color: 'var(--faint)' }}>v0.1.0 · Phase 1</p>
        </div>
      </Section>
    </div>
  )
}

function Section({ title, icon: Icon, children }: {
  title: string
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>
  children: React.ReactNode
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2.5">
        <Icon size={14} style={{ color: 'var(--dim)' }} />
        <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
          {title}
        </h2>
      </div>
      {children}
    </div>
  )
}

function Row({ children, onClick, danger }: {
  children: React.ReactNode
  onClick?: () => void
  danger?: boolean
}) {
  return (
    <button type="button" onClick={onClick}
      className="w-full flex items-center gap-3 p-4 rounded-2xl mb-2 text-left"
      style={{
        background: 'var(--surface-2)',
        border: `1px solid ${danger ? 'var(--danger-border)' : 'var(--border-dim)'}`,
      }}>
      {children}
    </button>
  )
}
