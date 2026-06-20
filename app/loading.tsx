export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* Header placeholder (icon + actions) */}
      <div className="flex items-center justify-between pt-12 pb-4">
        <div className="w-11 h-11 rounded-xl" style={{ background: 'var(--surface)' }} />
        <div className="flex gap-2">
          <div className="w-9 h-9 rounded-full" style={{ background: 'var(--surface)' }} />
          <div className="w-9 h-9 rounded-full" style={{ background: 'var(--surface)' }} />
        </div>
      </div>

      {/* Search / title bar placeholder */}
      <div className="h-11 rounded-xl mb-4" style={{ background: 'var(--surface)' }} />
      <div className="h-7 w-40 rounded-lg mb-3" style={{ background: 'var(--surface)' }} />

      {/* Filter chips placeholder */}
      <div className="flex gap-2 mb-4">
        {[64, 72, 64, 64].map((w, i) => (
          <div key={i} className="h-7 rounded-full" style={{ width: w, background: 'var(--surface)' }} />
        ))}
      </div>

      {/* Poster grid placeholder */}
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="rounded-2xl" style={{ background: 'var(--surface)', aspectRatio: '3/4' }} />
        ))}
      </div>
    </div>
  )
}
