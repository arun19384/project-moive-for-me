export default function TitleLoading() {
  return (
    <div>
      <div className="flex items-center justify-between pt-12 pb-4 text-sm" style={{ color: 'var(--muted)' }}>
        <span>← Back</span>
        <span className="px-2 py-1 rounded-lg" style={{ border: '1px solid var(--border-strong)' }}>Delete</span>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="w-28 h-40 rounded-xl shrink-0 animate-pulse" style={{ background: 'var(--surface)' }} />
        <div className="flex-1 flex flex-col justify-center gap-2">
          <div className="h-5 rounded animate-pulse w-3/4" style={{ background: 'var(--surface)' }} />
          <div className="h-3 rounded animate-pulse w-1/3" style={{ background: 'var(--surface)' }} />
        </div>
      </div>

      <div className="mb-6 space-y-2">
        <div className="h-4 rounded animate-pulse w-24" style={{ background: 'var(--surface)' }} />
        <div className="h-16 rounded animate-pulse" style={{ background: 'var(--surface)' }} />
      </div>

      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="mb-5">
          <div className="h-3 rounded animate-pulse w-20 mb-2" style={{ background: 'var(--surface)' }} />
          <div className="h-11 rounded-xl animate-pulse" style={{ background: 'var(--surface)' }} />
        </div>
      ))}
    </div>
  )
}
