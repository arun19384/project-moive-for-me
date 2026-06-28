import { Check } from 'lucide-react'
import Image from 'next/image'
import { posterSrc } from '@/lib/img'

const GRADIENTS = [
  ['#1a1a3e', '#2d2d6b'],
  ['#0d2137', '#1a4a6b'],
  ['#1e0d37', '#4a1a6b'],
  ['#0d2b1e', '#1a6b4a'],
  ['#2b1a0d', '#6b4a1a'],
  ['#1e2b0d', '#4a6b1a'],
  ['#2b0d1e', '#6b1a4a'],
  ['#0d1e2b', '#1a4a6b'],
]

function getGradient(title: string): [string, string] {
  let hash = 0
  for (let i = 0; i < title.length; i++) hash = (hash * 31 + title.charCodeAt(i)) | 0
  const g = GRADIENTS[Math.abs(hash) % GRADIENTS.length]
  return [g[0], g[1]]
}

function getInitials(title: string): string {
  return title
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')
}

interface CoverCardProps {
  id: number
  title: string
  type: string
  rating?: number | null
  coverUrl?: string | null
  entryId?: number | null
  selectMode?: boolean
  selected?: boolean
}

export default function CoverCard({ title, type, rating, coverUrl, selectMode, selected }: CoverCardProps) {
  const [from, to] = getGradient(title)
  const initials = getInitials(title)

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{ background: 'var(--surface)' }}
    >
      <div className="relative aspect-[3/4]" style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
        {coverUrl ? (
          <Image src={posterSrc(coverUrl, 'w342')} alt={title} fill sizes="(max-width: 768px) 33vw, 25vw" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold opacity-40" style={{ color: '#ffffff' }}>{initials}</span>
          </div>
        )}
        {selectMode && (
          <>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: selected ? 'rgba(201,168,76,0.15)' : 'transparent' }} />
            <div className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center pointer-events-none"
              style={{ background: selected ? '#C9A84C' : 'rgba(0,0,0,0.6)', border: `2px solid ${selected ? '#C9A84C' : 'var(--dim)'}` }}>
              {selected && <Check size={14} color="#0D0D0D" strokeWidth={3} />}
            </div>
          </>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold leading-snug dy-text truncate">{title}</p>
        <p className="text-xs mt-0.5 capitalize" style={{ color: 'var(--muted)' }}>{type}</p>
        {rating != null && (
          <p className="text-xs mt-1" style={{ color: '#C9A84C' }}>
            ★ <span className="font-semibold">{rating}</span>
            <span style={{ color: 'var(--faint)' }}>/10</span>
          </p>
        )}
      </div>
    </div>
  )
}
