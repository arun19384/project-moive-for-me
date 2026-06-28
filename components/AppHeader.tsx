'use client'

import Link from 'next/link'
import Image from 'next/image'
import { createElement, useEffect, useState } from 'react'
import { Settings, Library } from 'lucide-react'
import { RARITY_COLOR, BADGE_STORAGE_KEY, resolveIcon, type Rarity } from '@/lib/badges'

type StoredBadge = { id: string; name: string; iconName: string; rarity: Rarity }

function readStoredBadge(): StoredBadge | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(BADGE_STORAGE_KEY)
  if (!raw) return null
  try {
    const obj = JSON.parse(raw)
    if (obj && typeof obj === 'object' && obj.id && obj.iconName && obj.rarity) return obj as StoredBadge
  } catch { /* legacy string id — ignore */ }
  return null
}

interface AppHeaderProps {
  right?: React.ReactNode
}

export default function AppHeader({ right }: AppHeaderProps) {
  const [badge, setBadge] = useState<StoredBadge | null>(null)

  useEffect(() => {
    const read = () => setBadge(readStoredBadge())
    read()
    const onChange = () => read()
    window.addEventListener('storage', onChange)
    window.addEventListener('dy:badge-change', onChange)
    return () => {
      window.removeEventListener('storage', onChange)
      window.removeEventListener('dy:badge-change', onChange)
    }
  }, [])

  const badgeColor = badge ? RARITY_COLOR[badge.rarity] : null

  return (
    <div className="flex items-center justify-between pt-12 pb-4">
      <div className="flex items-center gap-3">
        <Image src="/icon.png" alt="Do young" width={44} height={44} className="w-11 h-11 rounded-xl shrink-0"
          style={{ border: '1px solid var(--border)' }} />
        {badge && badgeColor && (
          <Link
            href="/settings"
            aria-label={`Badge: ${badge.name}`}
            title={badge.name}
            className="flex items-center justify-center w-7 h-7 rounded-full shrink-0"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${badgeColor}55, ${badgeColor}15)`,
              border: `1.5px solid ${badgeColor}`,
              boxShadow: badge.rarity === 'legendary' ? `0 0 10px ${badgeColor}66` : 'none',
            }}
          >
            {createElement(resolveIcon(badge.iconName), { size: 14, color: badgeColor, strokeWidth: 2.2 })}
          </Link>
        )}
      </div>
      <div className="flex items-center gap-2">
        {right}
        <Link
          href="/collections"
          aria-label="Collections"
          className="flex items-center justify-center w-9 h-9 rounded-full"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: '#C9A84C' }}
        >
          <Library size={18} />
        </Link>
        <Link
          href="/settings"
          aria-label="Settings"
          className="flex items-center justify-center w-9 h-9 rounded-full"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: '#C9A84C' }}
        >
          <Settings size={18} />
        </Link>
      </div>
    </div>
  )
}
