import AppHeader from '@/components/AppHeader'

export default function ShelfLoading() {
  return (
    <div>
      <AppHeader
        right={
          <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ color: '#C9A84C', border: '1px solid #C9A84C' }}>
            Select
          </span>
        }
      />

      {/* Search */}
      <div className="rounded-xl mb-4 animate-pulse"
        style={{ background: 'var(--surface-2)', height: 44, border: '1px solid var(--border-dim)' }} />

      {/* Section title */}
      <div className="flex items-baseline gap-2 mb-3">
        <h2 className="text-2xl font-bold dy-text">My shelf</h2>
        <span className="text-sm" style={{ color: 'var(--faint)' }}>· loading…</span>
      </div>

      {/* Type pills */}
      <div className="flex gap-2 mb-3 overflow-hidden pb-1">
        {['All', 'Movies', 'Series', 'Anime'].map((label, i) => (
          <div key={label}
            className="px-4 py-1.5 rounded-full text-xs font-semibold shrink-0"
            style={{
              background: i === 0 ? '#C9A84C' : 'var(--surface)',
              color: i === 0 ? '#0D0D0D' : 'var(--dim)',
              border: `1px solid ${i === 0 ? '#C9A84C' : 'var(--border)'}`,
            }}>
            {label}
          </div>
        ))}
      </div>

      {/* Sort row placeholder */}
      <div className="flex items-center gap-2 mb-4 h-7" />

      {/* Cover grid skeleton */}
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden flex flex-col"
            style={{ background: 'var(--surface)' }}>
            <div className="animate-pulse"
              style={{ background: 'var(--surface-2)', aspectRatio: '3/4' }} />
            <div className="p-3">
              <div className="rounded animate-pulse mb-1.5"
                style={{ background: 'var(--surface-2)', height: 12, width: '80%' }} />
              <div className="rounded animate-pulse"
                style={{ background: 'var(--surface-2)', height: 9, width: '40%' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
