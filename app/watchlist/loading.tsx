import AppHeader from '@/components/AppHeader'

export default function WatchlistLoading() {
  return (
    <div>
      <AppHeader />
      <div className="pt-2 pb-5">
        <h1 className="text-2xl font-bold dy-text">Watchlist</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Save titles to watch later</p>
      </div>
      <div className="flex gap-2 mb-4">
        {['movie', 'series', 'anime'].map((t, i) => (
          <div key={t}
            className="flex-1 py-2 rounded-xl text-sm font-semibold capitalize text-center"
            style={{
              background: i === 0 ? '#C9A84C' : 'var(--surface)',
              color: i === 0 ? 'var(--bg)' : 'var(--muted)',
              border: `1px solid ${i === 0 ? '#C9A84C' : 'var(--border)'}`,
            }}>
            {t}
          </div>
        ))}
      </div>
      <div className="h-12 rounded-xl mb-6 animate-pulse"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }} />
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'var(--surface)' }} />
        ))}
      </div>
    </div>
  )
}
