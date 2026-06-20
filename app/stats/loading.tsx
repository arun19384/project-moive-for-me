import AppHeader from '@/components/AppHeader'

export default function StatsLoading() {
  return (
    <div>
      <AppHeader />
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold dy-text leading-none">Your stats</h2>
          <p className="text-xs mt-1.5" style={{ color: 'var(--muted)' }}>loading…</p>
        </div>
      </div>
      <div className="rounded-3xl animate-pulse h-44 mb-3" style={{ background: 'var(--surface)' }} />
      <div className="rounded-3xl animate-pulse mb-3" style={{ background: 'var(--surface)', aspectRatio: '3/4' }} />
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="rounded-2xl animate-pulse" style={{ background: 'var(--surface)', aspectRatio: '3/4' }} />
        <div className="rounded-2xl animate-pulse" style={{ background: 'var(--surface)', aspectRatio: '3/4' }} />
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded-2xl animate-pulse h-20" style={{ background: 'var(--surface)' }} />
        ))}
      </div>
      <div className="rounded-2xl animate-pulse h-32 mb-3" style={{ background: 'var(--surface)' }} />
      <div className="rounded-2xl animate-pulse h-32" style={{ background: 'var(--surface-2)' }} />
    </div>
  )
}
