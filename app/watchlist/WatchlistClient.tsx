'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Trash2, Play, Bookmark, Dices } from 'lucide-react'
import AppHeader from '@/components/AppHeader'
import WhereToWatch, { type WatchProvidersData } from '@/components/WhereToWatch'
import type { WatchlistItem } from '@/lib/watchlist'
import { getStorage, type StorageMode } from '@/lib/storage'
import GuestBanner from '@/components/GuestBanner'
import { posterSrc } from '@/lib/img'

type SearchResult = {
  imdbId: string
  title: string
  year: number | null
  poster: string | null
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

const TYPE_COLOR: Record<string, string> = {
  movie: '#C9A84C',
  series: '#7FB5FF',
  anime: '#FF9A7F',
}

export default function WatchlistClient({
  mode,
  initialItems,
}: {
  mode: StorageMode
  initialItems: WatchlistItem[] | null
}) {
  const router = useRouter()
  const storage = useMemo(() => getStorage(mode), [mode])
  const [items, setItems] = useState<WatchlistItem[]>(initialItems ?? [])
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedType, setSelectedType] = useState<'movie' | 'series' | 'anime'>('movie')
  const debouncedQuery = useDebounce(query, 400)
  const searchRef = useRef<HTMLDivElement>(null)

  // Random "what to watch tonight" picker
  const [pickOpen, setPickOpen] = useState(false)
  const [picked, setPicked] = useState<WatchlistItem | null>(null)
  const [flashItem, setFlashItem] = useState<WatchlistItem | null>(null)
  const [rolling, setRolling] = useState(false)
  const [providers, setProviders] = useState<WatchProvidersData>(null)
  const [provLoading, setProvLoading] = useState(false)
  const rollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => () => { if (rollRef.current) clearInterval(rollRef.current) }, [])

  function randomItem(exclude?: WatchlistItem | null): WatchlistItem {
    if (items.length === 1) return items[0]
    let pick = items[Math.floor(Math.random() * items.length)]
    let guard = 0
    while (exclude && pick.id === exclude.id && guard < 12) {
      pick = items[Math.floor(Math.random() * items.length)]
      guard++
    }
    return pick
  }

  async function loadProviders(item: WatchlistItem) {
    setProvLoading(true)
    setProviders(null)
    try {
      const params = new URLSearchParams({ title: item.title, type: item.type })
      if (item.releaseYear) params.set('year', String(item.releaseYear))
      const r = await fetch(`/api/tmdb-details?${params.toString()}`)
      const d = await r.json()
      setProviders(d?.watchProviders ?? null)
    } catch {
      setProviders(null)
    } finally {
      setProvLoading(false)
    }
  }

  function spin() {
    if (items.length === 0) return
    if (rollRef.current) clearInterval(rollRef.current)
    setPickOpen(true)
    setProviders(null)
    setRolling(true)
    const final = randomItem(picked)
    let count = 0
    const total = items.length > 1 ? 11 : 1
    rollRef.current = setInterval(() => {
      count++
      setFlashItem(items[Math.floor(Math.random() * items.length)])
      if (count >= total) {
        if (rollRef.current) clearInterval(rollRef.current)
        rollRef.current = null
        setFlashItem(final)
        setPicked(final)
        setRolling(false)
        loadProviders(final)
      }
    }, 75)
  }

  function closePick() {
    if (rollRef.current) clearInterval(rollRef.current)
    rollRef.current = null
    setPickOpen(false)
    setRolling(false)
  }

  useEffect(() => {
    if (initialItems == null) {
      storage.getWatchlist().then(setItems)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults([])
      setShowResults(false)
      return
    }
    setSearching(true)
    fetch(`/api/movie-search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((r) => r.json())
      .then((data) => {
        setResults(data)
        setShowResults(true)
      })
      .finally(() => setSearching(false))
  }, [debouncedQuery])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function addItem(result: SearchResult) {
    setQuery('')
    setResults([])
    setShowResults(false)
    const created = await storage.addToWatchlist({
      title: result.title,
      type: selectedType,
      coverUrl: result.poster ?? null,
      releaseYear: result.year ?? null,
    })
    setItems((prev) => [created, ...prev])
  }

  async function deleteItem(id: number) {
    await storage.removeFromWatchlist(id)
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  function markWatched(item: WatchlistItem) {
    const params = new URLSearchParams({ q: item.title, type: item.type })
    if (item.coverUrl) params.set('poster', item.coverUrl)
    if (item.releaseYear) params.set('year', String(item.releaseYear))
    router.push(`/add?${params.toString()}`)
  }

  return (
    <div>
      <AppHeader />

      {mode === 'guest' && <GuestBanner />}

      <div className="pt-2 pb-5">
        <h1 className="text-2xl font-bold dy-text">Watchlist</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Save titles to watch later</p>
      </div>

      <div className="flex gap-2 mb-4">
        {(['movie', 'series', 'anime'] as const).map((t) => (
          <button key={t} type="button" onClick={() => setSelectedType(t)}
            className="flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition-colors"
            style={{
              background: selectedType === t ? TYPE_COLOR[t] : 'var(--surface)',
              color: selectedType === t ? 'var(--bg)' : 'var(--muted)',
              border: `1px solid ${selectedType === t ? TYPE_COLOR[t] : 'var(--border)'}`,
            }}>
            {t}
          </button>
        ))}
      </div>

      <div className="mb-6 relative" ref={searchRef}>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" color="var(--faint)" />
          <input
            type="text"
            placeholder="Search to add to watchlist..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl pl-9 pr-9 py-3 text-sm dy-text outline-none"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            autoComplete="off"
          />
          {query && (
            <button type="button" onClick={() => { setQuery(''); setResults([]); setShowResults(false) }}
              className="absolute right-3 top-1/2 -translate-y-1/2">
              <X size={15} color="var(--faint)" />
            </button>
          )}

          {showResults && results.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 rounded-xl overflow-y-auto z-50"
              style={{ border: '1px solid var(--border)', background: 'var(--surface-2)', maxHeight: '60vh', overscrollBehavior: 'contain' }}>
              {results.map((r) => (
                <button key={r.imdbId} type="button" onClick={() => addItem(r)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-left transition-colors"
                  style={{ borderBottom: '1px solid var(--border-dim)' }}>
                  {r.poster
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={posterSrc(r.poster, 'w185')} alt={r.title} loading="lazy" decoding="async" className="w-9 h-12 object-cover rounded-lg shrink-0" />
                    : <div className="w-9 h-12 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold"
                        style={{ background: 'var(--border)', color: 'var(--faint)' }}>{r.title[0]}</div>
                  }
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold dy-text truncate">{r.title}</p>
                    {r.year && <p className="text-xs mt-0.5" style={{ color: 'var(--dim)' }}>{r.year}</p>}
                  </div>
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full shrink-0 font-semibold"
                    style={{ background: TYPE_COLOR[selectedType] + '22', color: TYPE_COLOR[selectedType] }}>
                    + add
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        {searching && <p className="text-xs mt-2" style={{ color: 'var(--faint)' }}>Searching...</p>}
      </div>

      {items.length > 0 && (
        <button type="button" onClick={spin}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold mb-5 transition-transform active:scale-[0.98]"
          style={{ background: '#C9A84C', color: '#0D0D0D', boxShadow: '0 4px 16px rgba(201,168,76,0.25)' }}>
          <Dices size={18} />
          ดูอะไรดีคืนนี้?
        </button>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Bookmark size={40} color="var(--border-strong)" />
          <p className="text-base font-semibold" style={{ color: 'var(--faintest)' }}>Watchlist is empty</p>
          <p className="text-sm text-center" style={{ color: 'var(--border-strong)' }}>Search above to save titles you want to watch</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-2xl p-3"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="w-12 h-16 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
                style={{ background: 'var(--border)' }}>
                {item.coverUrl
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={posterSrc(item.coverUrl, 'w185')} alt={item.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  : <span className="text-lg font-bold" style={{ color: 'var(--faint)' }}>{item.title[0]?.toUpperCase()}</span>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold dy-text truncate">{item.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize"
                    style={{ background: TYPE_COLOR[item.type] + '22', color: TYPE_COLOR[item.type] }}>
                    {item.type}
                  </span>
                  {item.releaseYear && (
                    <span className="text-xs" style={{ color: 'var(--dim)' }}>{item.releaseYear}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button type="button" onClick={() => markWatched(item)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold"
                  style={{ background: '#C9A84C22', color: '#C9A84C', border: '1px solid #C9A84C44' }}>
                  <Play size={10} fill="#C9A84C" />
                  Watched
                </button>
                <button type="button" onClick={() => deleteItem(item.id)}
                  className="p-1.5 rounded-xl"
                  style={{ background: 'var(--border)' }}>
                  <Trash2 size={14} color="var(--dim)" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {pickOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center px-6"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={closePick}>
          <div className="w-full max-w-xs rounded-3xl p-5 relative"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={closePick}
              className="absolute top-3 right-3 p-1.5 rounded-full" style={{ background: 'var(--border)' }}>
              <X size={15} color="var(--dim)" />
            </button>

            <p className="text-xs font-semibold text-center mb-4" style={{ color: 'var(--muted)' }}>
              {rolling ? 'กำลังสุ่ม...' : '🍿 คืนนี้ดูเรื่องนี้!'}
            </p>

            {flashItem && (
              <div className="flex flex-col items-center">
                <div className="w-32 h-48 rounded-2xl overflow-hidden flex items-center justify-center mb-3"
                  style={{
                    background: 'var(--border)',
                    border: '1px solid var(--border)',
                    transition: 'transform 0.15s ease',
                    transform: rolling ? 'scale(0.94)' : 'scale(1)',
                    opacity: rolling ? 0.7 : 1,
                  }}>
                  {flashItem.coverUrl
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={posterSrc(flashItem.coverUrl, 'w342')} alt={flashItem.title} decoding="async" className="w-full h-full object-cover" />
                    : <span className="text-3xl font-bold" style={{ color: 'var(--faint)' }}>{flashItem.title[0]?.toUpperCase()}</span>
                  }
                </div>
                <p className="text-base font-bold text-center dy-text leading-tight">{flashItem.title}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize"
                    style={{ background: TYPE_COLOR[flashItem.type] + '22', color: TYPE_COLOR[flashItem.type] }}>
                    {flashItem.type}
                  </span>
                  {flashItem.releaseYear && (
                    <span className="text-xs" style={{ color: 'var(--dim)' }}>{flashItem.releaseYear}</span>
                  )}
                </div>
              </div>
            )}

            {!rolling && picked && (
              <div className="mt-4 min-h-[44px] flex items-center justify-center">
                {provLoading ? (
                  <p className="text-xs" style={{ color: 'var(--faint)' }}>กำลังหาที่ดู...</p>
                ) : providers ? (
                  <WhereToWatch providers={providers} compact />
                ) : (
                  <p className="text-xs text-center" style={{ color: 'var(--faint)' }}>ไม่พบข้อมูลสตรีมมิ่ง</p>
                )}
              </div>
            )}

            {!rolling && (
              <div className="flex gap-2 mt-5">
                <button type="button" onClick={spin}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-semibold"
                  style={{ background: 'var(--surface-2)', color: 'var(--soft)', border: '1px solid var(--border)' }}>
                  <Dices size={15} />
                  สุ่มใหม่
                </button>
                {picked && (
                  <button type="button" onClick={() => markWatched(picked)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-bold"
                    style={{ background: '#C9A84C', color: '#0D0D0D' }}>
                    <Play size={13} fill="#0D0D0D" />
                    ดูแล้ว
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
