'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppHeader from '@/components/AppHeader'
import CoverCard from '@/components/CoverCard'
import { Grid3x3, Rows3, X, Search, ArrowUpDown, CalendarDays } from 'lucide-react'
import type { ShelfItem } from '@/lib/shelf'
import { getStorage, type StorageMode } from '@/lib/storage'
import GuestBanner from '@/components/GuestBanner'
import ImportGuestBanner from '@/components/ImportGuestBanner'

type TypeFilter = 'all' | 'movie' | 'series' | 'anime'
type SortBy = 'recent' | 'watched-desc' | 'watched-asc' | 'rating' | 'title'
type Density = 3 | 4

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'recent', label: 'Recent' },
  { value: 'watched-desc', label: 'Watched ↓' },
  { value: 'watched-asc', label: 'Watched ↑' },
  { value: 'rating', label: 'Rating' },
  { value: 'title', label: 'A–Z' },
]

export default function ShelfClient({
  mode,
  initialItems,
}: {
  mode: StorageMode
  initialItems: ShelfItem[] | null
}) {
  const router = useRouter()
  const storage = useMemo(() => getStorage(mode), [mode])
  const [items, setItems] = useState<ShelfItem[]>(initialItems ?? [])
  const [loaded, setLoaded] = useState(initialItems != null)
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [yearFilter, setYearFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('recent')
  const [density, setDensity] = useState<Density>(3)

  useEffect(() => {
    if (initialItems == null) {
      storage.getShelf().then((data) => {
        setItems(data)
        setLoaded(true)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const years = useMemo(() => {
    const set = new Set<string>()
    for (const item of items) {
      const y = item.entry?.watchedDate?.slice(0, 4)
      if (y && /^\d{4}$/.test(y)) set.add(y)
    }
    return [...set].sort((a, b) => b.localeCompare(a))
  }, [items])

  // Fall back to "all" if the selected year is no longer present in the data
  const activeYear = yearFilter === 'all' || years.includes(yearFilter) ? yearFilter : 'all'

  const filtered = useMemo(() => {
    const result = items.filter((item) => {
      const matchType = typeFilter === 'all' || item.type === typeFilter
      const matchSearch = item.title.toLowerCase().includes(search.toLowerCase())
      const matchYear = activeYear === 'all' || item.entry?.watchedDate?.slice(0, 4) === activeYear
      return matchType && matchSearch && matchYear
    })

    const cmp = (a: ShelfItem, b: ShelfItem) => {
      switch (sortBy) {
        case 'recent':
          return (b.entry?.createdAt ?? b.createdAt ?? '').localeCompare(a.entry?.createdAt ?? a.createdAt ?? '')
        case 'watched-desc':
          return (b.entry?.watchedDate ?? '').localeCompare(a.entry?.watchedDate ?? '')
        case 'watched-asc':
          return (a.entry?.watchedDate ?? '').localeCompare(b.entry?.watchedDate ?? '')
        case 'rating':
          return (b.entry?.rating ?? -1) - (a.entry?.rating ?? -1)
        case 'title':
          return a.title.localeCompare(b.title)
      }
    }

    return result.sort(cmp)
  }, [items, typeFilter, search, sortBy, activeYear])

  const gridCols = density === 3 ? 'grid-cols-3' : 'grid-cols-4'

  return (
    <div>
      <AppHeader />

      {mode === 'guest' && <GuestBanner />}
      {mode === 'signed-in' && <ImportGuestBanner />}

      <div className="relative mb-4">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" color="var(--faint)" />
        <input
          type="text"
          placeholder="Search your shelf..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl pl-11 pr-10 py-3 text-sm outline-none transition-colors focus:border-[#C9A84C]"
          style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border-dim)' }}
        />
        {search && (
          <button type="button" onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[#222]">
            <X size={14} color="var(--dim)" />
          </button>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-3">
        <h2 className="text-2xl font-bold dy-text">My shelf</h2>
        <span className="text-sm" style={{ color: 'var(--faint)' }}>· {filtered.length} {filtered.length === 1 ? 'title' : 'titles'}</span>
      </div>

      <div className="flex gap-2 mb-3 overflow-x-auto -mx-4 px-4 pb-1" style={{ scrollbarWidth: 'none' }}>
        {([
          { value: 'all', label: 'All' },
          { value: 'movie', label: 'Movies' },
          { value: 'series', label: 'Series' },
          { value: 'anime', label: 'Anime' },
        ] as { value: TypeFilter; label: string }[]).map((t) => (
          <button key={t.value} onClick={() => setTypeFilter(t.value)}
            className="px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors"
            style={{
              background: typeFilter === t.value ? '#C9A84C' : 'var(--surface)',
              color: typeFilter === t.value ? '#0D0D0D' : 'var(--dim)',
              border: `1px solid ${typeFilter === t.value ? '#C9A84C' : 'var(--border)'}`,
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {years.length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays size={13} color="var(--faint)" className="shrink-0" />
          <div className="flex-1 flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {(['all', ...years]).map((y) => (
              <button key={y} onClick={() => setYearFilter(y)}
                className="px-3 py-1 rounded-full text-[11px] font-semibold shrink-0 transition-colors"
                style={{
                  background: activeYear === y ? '#C9A84C' : 'var(--surface)',
                  color: activeYear === y ? '#0D0D0D' : 'var(--dim)',
                  border: `1px solid ${activeYear === y ? '#C9A84C' : 'var(--border)'}`,
                }}>
                {y === 'all' ? 'All years' : y}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 mb-4">
        <ArrowUpDown size={13} color="var(--faint)" className="shrink-0" />
        <div className="flex-1 flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {SORT_OPTIONS.map((o) => (
            <button key={o.value} onClick={() => setSortBy(o.value)}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium shrink-0 transition-colors"
              style={{
                background: sortBy === o.value ? 'var(--surface)' : 'transparent',
                color: sortBy === o.value ? '#C9A84C' : 'var(--dim)',
              }}>
              {o.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 shrink-0 pl-2" style={{ borderLeft: '1px solid var(--border-dim)' }}>
          <button onClick={() => setDensity(3)} title="Medium">
            <Grid3x3 size={16} color={density === 3 ? '#C9A84C' : 'var(--faint)'} />
          </button>
          <button onClick={() => setDensity(4)} title="Small">
            <Rows3 size={16} color={density === 4 ? '#C9A84C' : 'var(--faint)'} />
          </button>
        </div>
      </div>

      {loaded && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-2">
          <p className="text-lg font-semibold" style={{ color: 'var(--faintest)' }}>Nothing here yet</p>
          <p className="text-sm" style={{ color: 'var(--border-strong)' }}>Tap Add to log your first title</p>
        </div>
      )}

      {filtered.length > 0 && (
        <div className={`grid ${gridCols} gap-3`}>
          {filtered.map((item) => {
            const entryId = item.entry?.id ?? null
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => router.push(`/title/${item.id}`)}
                className="text-left p-0 m-0 bg-transparent border-0 block w-full"
                style={{ cursor: 'pointer', borderRadius: '1rem' }}
              >
                <CoverCard
                  id={item.id}
                  title={item.title}
                  type={item.type}
                  rating={item.entry?.rating}
                  coverUrl={item.coverUrl}
                  entryId={entryId}
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
