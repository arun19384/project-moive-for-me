'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookMarked, Flame, Plus, BarChart2, Bookmark } from 'lucide-react'

const NAV = [
  { href: '/shelf', label: 'Shelf', icon: BookMarked },
  { href: '/trending', label: 'Trending', icon: Flame },
  { href: '/add', label: 'Add', icon: Plus, center: true },
  { href: '/stats', label: 'Stats', icon: BarChart2 },
  { href: '/watchlist', label: 'Watchlist', icon: Bookmark },
]

const HIDDEN_ROUTES = ['/signin', '/signup', '/profile']

export default function BottomNav() {
  const pathname = usePathname()
  if (HIDDEN_ROUTES.includes(pathname)) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center h-16 px-2"
      style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        height: 'calc(4rem + env(safe-area-inset-bottom))',
      }}>
      {NAV.map(({ href, label, icon: Icon, center }) => {
        const active = pathname === href || (href === '/shelf' && pathname === '/')
        if (center) {
          return (
            <Link key={href} href={href} className="flex flex-col items-center justify-center -mt-5">
              <span className="flex items-center justify-center w-14 h-14 rounded-full"
                style={{ background: '#C9A84C', boxShadow: '0 0 0 4px #0D0D0D' }}>
                <Icon size={24} color="#0D0D0D" strokeWidth={2.5} />
              </span>
              <span className="text-[10px] mt-1" style={{ color: '#C9A84C' }}>{label}</span>
            </Link>
          )
        }
        return (
          <Link key={href} href={href} className="flex flex-col items-center justify-center gap-1 flex-1 py-2">
            <Icon size={20} color={active ? '#C9A84C' : 'var(--dim)'} strokeWidth={active ? 2 : 1.5} />
            <span className="text-[10px]" style={{ color: active ? '#C9A84C' : 'var(--dim)' }}>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
