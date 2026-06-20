'use client'

const SPINE_COLORS: [string, string, string][] = [
  // [light, dark, accent for type label]
  ['#3a2f1f', '#1d1610', '#d4a849'],
  ['#1f2a3a', '#101620', '#7fb5ff'],
  ['#3a1f2a', '#1d1015', '#ff7fb5'],
  ['#1f3a2a', '#101d15', '#7fffb5'],
  ['#3a3a1f', '#1d1d10', '#fff77f'],
  ['#2a1f3a', '#15101d', '#b57fff'],
  ['#3a2f1f', '#1d1610', '#ff9a7f'],
  ['#1f3a3a', '#101d1d', '#7fffff'],
]

function getSpineColors(title: string): [string, string, string] {
  let hash = 0
  for (let i = 0; i < title.length; i++) hash = (hash * 31 + title.charCodeAt(i)) | 0
  const c = SPINE_COLORS[Math.abs(hash) % SPINE_COLORS.length]
  return [c[0], c[1], c[2]]
}

const TYPE_COLOR: Record<string, string> = {
  movie: '#7fb5ff',
  series: '#ff9a7f',
  anime: '#d4a849',
}

interface ShelfSpineProps {
  title: string
  type: string
  rating?: number | null
  isOpen?: boolean
  onClick?: () => void
}

export default function ShelfSpine({ title, type, rating, isOpen, onClick }: ShelfSpineProps) {
  const [light, dark] = getSpineColors(title)

  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 relative flex flex-col items-center"
      style={{
        width: 36,
        height: 180,
        background: `linear-gradient(90deg, ${dark} 0%, ${light} 30%, ${light} 70%, ${dark} 100%)`,
        boxShadow: isOpen
          ? '0 12px 24px rgba(0,0,0,0.6), inset 1px 0 rgba(255,255,255,0.12), inset -1px 0 rgba(0,0,0,0.4)'
          : 'inset 1px 0 rgba(255,255,255,0.08), inset -1px 0 rgba(0,0,0,0.4)',
        borderRadius: '3px 3px 0 0',
        transform: isOpen ? 'translateY(-28px)' : 'translateY(0)',
        transition: 'transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 250ms',
        cursor: 'pointer',
        padding: '6px 3px',
        zIndex: isOpen ? 2 : 1,
      }}
    >
      {/* Rating badge */}
      {rating != null ? (
        <div className="rounded-full flex items-center justify-center font-bold shrink-0"
          style={{ width: 18, height: 18, background: 'rgba(0,0,0,0.85)', color: 'var(--text)', fontSize: 9 }}>
          {rating}
        </div>
      ) : (
        <div style={{ width: 18, height: 18 }} />
      )}

      {/* Vertical title */}
      <div className="flex-1 mt-2 mb-1 overflow-hidden flex items-start justify-center"
        style={{
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          fontSize: 10.5,
          fontWeight: 700,
          color: 'var(--text)',
          letterSpacing: '0.02em',
          textShadow: '0 1px 0 rgba(0,0,0,0.4)',
          maxHeight: '120px',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}>
        {title}
      </div>

      {/* Type label */}
      <div className="shrink-0"
        style={{
          fontSize: 7,
          fontWeight: 800,
          textTransform: 'uppercase',
          color: TYPE_COLOR[type] ?? 'var(--dim)',
          letterSpacing: 0.6,
        }}>
        {type}
      </div>
    </button>
  )
}
