'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import RatingInput from '@/components/RatingInput'
import { Search, X } from 'lucide-react'
import { getStorage, type StorageMode } from '@/lib/storage'
import { posterSrc } from '@/lib/img'

type SearchResult = { imdbId: string; title: string; year: number | null; poster: string | null; actors: string | null }

const PLATFORMS = ['Netflix', 'Cinema', 'Disney+', 'Prime', 'YouTube', 'Other']
const TYPES = ['movie', 'series', 'anime'] as const

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export default function AddClient({ mode }: { mode: StorageMode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const storage = useMemo(() => getStorage(mode), [mode])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const debouncedQuery = useDebounce(searchQuery, 400)

  const [title, setTitle] = useState('')
  const [type, setType] = useState<'movie' | 'series' | 'anime'>('movie')
  const [rating, setRating] = useState(0)
  const [watchedDate, setWatchedDate] = useState(new Date().toISOString().split('T')[0])
  const [platform, setPlatform] = useState('')
  const [notes, setNotes] = useState('')
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [releaseYear, setReleaseYear] = useState<number | null>(null)

  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const q = searchParams.get('q')
    const t = searchParams.get('type')
    const poster = searchParams.get('poster')
    const year = searchParams.get('year')
    /* eslint-disable react-hooks/set-state-in-effect */
    if (t === 'movie' || t === 'series' || t === 'anime') setType(t)
    if (q && poster) {
      setTitle(q)
      setCoverUrl(poster)
      if (year) setReleaseYear(Number(year))
    } else if (q) {
      setSearchQuery(q)
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchResults([])
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowResults(false)
      return
    }
    setSearching(true)
    fetch(`/api/movie-search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((r) => r.json())
      .then((data) => {
        setSearchResults(data)
        setShowResults(true)
      })
      .finally(() => setSearching(false))
  }, [debouncedQuery])

  function selectResult(result: SearchResult) {
    setTitle(result.title)
    setCoverUrl(result.poster)
    setReleaseYear(result.year)
    setSearchQuery('')
    setSearchResults([])
    setShowResults(false)
  }

  function clearSearch() {
    setSearchQuery('')
    setTitle('')
    setCoverUrl(null)
    setReleaseYear(null)
    setSearchResults([])
    setShowResults(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setError('Title is required')
      return
    }
    setLoading(true)
    setError('')
    try {
      await storage.addEntry({
        title: title.trim(),
        type,
        rating: rating > 0 ? rating : null,
        watchedDate: watchedDate || null,
        platform: platform || null,
        notes: notes || null,
        coverUrl: coverUrl || null,
        releaseYear: releaseYear || null,
      })
      router.push('/shelf')
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const label = (text: string, optional?: boolean) => (
    <span style={{ color: 'var(--soft)', fontSize: 14, fontWeight: 600 }}>
      {text}{optional && <span style={{ color: 'var(--faint)', fontWeight: 400 }}> (optional)</span>}
    </span>
  )

  return (
    <form onSubmit={handleSubmit}>
      <div className="pt-12 pb-6">
        <h1 className="text-2xl font-bold dy-text">Add to shelf</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Log what you watched</p>
      </div>

      {!coverUrl && (
      <div className="mb-5" ref={searchRef}>
        <div className="mb-2">{label('Search title')}</div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" color="var(--faint)" />
          <input
            type="text"
            placeholder="e.g. Spirited Away, Attack on Titan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl pl-9 pr-9 py-3 text-sm dy-text outline-none"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            autoComplete="off"
          />
          {searchQuery && (
            <button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X size={15} color="var(--faint)" />
            </button>
          )}
        </div>

        {showResults && searchResults.length > 0 && (
          <div className="mt-1 rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--surface-2)' }}>
            {searchResults.map((r) => (
              <button
                key={r.imdbId}
                type="button"
                onClick={() => selectResult(r)}
                className="flex items-center gap-3 w-full px-3 py-2.5 text-left transition-colors hover:bg-[#1E1E1E]"
                style={{ borderBottom: '1px solid var(--border-dim)' }}
              >
                {r.poster ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={posterSrc(r.poster, 'w185')} alt={r.title} loading="lazy" decoding="async" className="w-9 h-12 object-cover rounded-lg shrink-0" />
                ) : (
                  <div className="w-9 h-12 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold"
                    style={{ background: 'var(--border)', color: 'var(--faint)' }}>
                    {r.title[0]}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold dy-text truncate">{r.title}</p>
                  {r.year && <p className="text-xs mt-0.5" style={{ color: 'var(--dim)' }}>{r.year}</p>}
                </div>
              </button>
            ))}
          </div>
        )}
        {searching && (
          <p className="text-xs mt-2" style={{ color: 'var(--faint)' }}>Searching...</p>
        )}
      </div>
      )}

      {coverUrl && (
        <div className="flex gap-3 mb-5 p-3 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={posterSrc(coverUrl, 'w185')} alt={title} decoding="async" className="w-14 h-20 object-cover rounded-lg shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-bold dy-text truncate">{title}</p>
            {releaseYear && <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{releaseYear}</p>}
            <button type="button" onClick={clearSearch} className="text-xs mt-2" style={{ color: '#C9A84C' }}>
              Change
            </button>
          </div>
        </div>
      )}

      {!coverUrl && (
        <div className="mb-5">
          <div className="mb-2">{label('Or enter title manually')}</div>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-sm dy-text outline-none"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          />
        </div>
      )}

      <div className="mb-5">
        <div className="mb-2">{label('Type')}</div>
        <div className="flex gap-2">
          {TYPES.map((t) => (
            <button key={t} type="button" onClick={() => setType(t)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-colors"
              style={{
                background: type === t ? '#C9A84C' : 'var(--surface)',
                color: type === t ? '#0D0D0D' : 'var(--muted)',
                border: `1px solid ${type === t ? '#C9A84C' : 'var(--border)'}`,
              }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <div className="mb-2">{label('Your rating', true)}</div>
        <RatingInput value={rating} onChange={setRating} />
      </div>

      <div className="mb-5">
        <div className="mb-2">{label('Watched on', true)}</div>
        <input
          type="date"
          value={watchedDate}
          onChange={(e) => setWatchedDate(e.target.value)}
          className="w-full rounded-xl px-4 py-3 text-sm dy-text outline-none"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', colorScheme: 'dark' }}
        />
      </div>

      <div className="mb-5">
        <div className="mb-2">{label('Where did you watch?', true)}</div>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <button key={p} type="button" onClick={() => setPlatform((prev) => prev === p ? '' : p)}
              className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
              style={{
                background: platform === p ? '#C9A84C' : 'var(--surface)',
                color: platform === p ? '#0D0D0D' : 'var(--muted)',
                border: `1px solid ${platform === p ? '#C9A84C' : 'var(--border-strong)'}`,
              }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <div className="mb-2">{label('Notes', true)}</div>
        <textarea
          placeholder="What did you think?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full rounded-xl px-4 py-3 text-sm dy-text outline-none resize-none"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        />
      </div>

      {error && <p className="text-sm mb-4" style={{ color: '#ff6b6b' }}>{error}</p>}

      <button type="submit" disabled={loading}
        className="w-full py-4 rounded-xl text-base font-bold transition-opacity mb-2"
        style={{ background: '#C9A84C', color: '#0D0D0D', opacity: loading ? 0.7 : 1 }}>
        {loading ? 'Saving...' : 'Add to shelf'}
      </button>
    </form>
  )
}
