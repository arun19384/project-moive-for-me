'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Trash2, Play, X } from 'lucide-react'
import RatingInput from '@/components/RatingInput'
import ShelfPicker from '@/components/ShelfPicker'
import WhereToWatch, { type WatchProvidersData } from '@/components/WhereToWatch'
import { getStorage, type StorageMode } from '@/lib/storage'
import type { TitleDetail } from '@/lib/title'
import { posterSrc } from '@/lib/img'

type CastMember = { name: string; character: string; profile: string | null }
type TmdbDetails = {
  overview: string
  genres: string[]
  cast: CastMember[]
  runtime: number | null
  trailerKey: string | null
  thaiReleaseDate: string | null
  watchProviders: WatchProvidersData
} | null

const PLATFORMS = ['Netflix', 'Cinema', 'Disney+', 'Prime', 'YouTube', 'Other']
const TYPES = ['movie', 'series', 'anime'] as const

const TH_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
function formatThaiDate(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return `${d.getDate()} ${TH_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`
}

export default function TitleDetailClient({
  mode,
  initial,
  titleId,
}: {
  mode: StorageMode
  initial: TitleDetail
  titleId: number
}) {
  const router = useRouter()
  const storage = useMemo(() => getStorage(mode), [mode])
  const [data, setData] = useState<TitleDetail>(initial)
  const [loading, setLoading] = useState(initial == null)

  const [tmdb, setTmdb] = useState<TmdbDetails>(null)
  const [tmdbLoading, setTmdbLoading] = useState(true)
  const [trailerOpen, setTrailerOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState(initial?.title ?? '')
  const [type, setType] = useState<'movie' | 'series' | 'anime'>(initial?.type ?? 'movie')
  const [rating, setRating] = useState(initial?.entry?.rating ?? 0)
  const [watchedDate, setWatchedDate] = useState(initial?.entry?.watchedDate ?? '')
  const [platform, setPlatform] = useState(initial?.entry?.platform ?? '')
  const [notes, setNotes] = useState(initial?.entry?.notes ?? '')
  const [selectedGenres, setSelectedGenres] = useState<number[]>(initial?.genres?.map(g => g.id) ?? [])
  const [allGenres, setAllGenres] = useState<{id: number, name: string}[]>([])

  useEffect(() => {
    if (initial == null) {
      storage.getTitleDetail(titleId).then((d) => {
        setData(d)
        if (d) {
          setTitle(d.title)
          setType(d.type)
          setRating(d.entry?.rating ?? 0)
          setWatchedDate(d.entry?.watchedDate ?? '')
          setPlatform(d.entry?.platform ?? '')
          setNotes(d.entry?.notes ?? '')
          setSelectedGenres(d.genres?.map(g => g.id) ?? [])
        }
        setLoading(false)
      })
    }
    
    fetch('/api/genres').then(r => r.json()).then(setAllGenres).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!data) return
    const params = new URLSearchParams({ title: data.title, type: data.type })
    if (data.releaseYear) params.set('year', String(data.releaseYear))
    fetch(`/api/tmdb-details?${params.toString()}`)
      .then((r) => r.json())
      .then((d: TmdbDetails) => setTmdb(d))
      .catch(() => setTmdb(null))
      .finally(() => setTmdbLoading(false))
  }, [data])

  async function handleSave() {
    if (!title.trim()) {
      setError('Title is required')
      return
    }
    setSaving(true)
    setError('')
    try {
      await storage.updateTitle(titleId, {
        title: title.trim(),
        type,
        entryId: data?.entry?.id ?? null,
        rating: rating > 0 ? rating : null,
        watchedDate: watchedDate || null,
        platform: platform || null,
        notes: notes || null,
        genreIds: selectedGenres,
      })
      router.push('/shelf')
    } catch {
      setError('Something went wrong')
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this title from your shelf?')) return
    setDeleting(true)
    await storage.deleteTitle(titleId)
    router.push('/shelf')
  }

  const label = (text: string, optional?: boolean) => (
    <span style={{ color: 'var(--soft)', fontSize: 14, fontWeight: 600 }}>
      {text}{optional && <span style={{ color: 'var(--faint)', fontWeight: 400 }}> (optional)</span>}
    </span>
  )

  if (loading) {
    return (
      <div className="pt-12 pb-4">
        <p className="text-sm" style={{ color: 'var(--muted)' }}>Loading...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="pt-12 pb-4">
        <button type="button" onClick={() => router.back()}
          className="flex items-center gap-1 text-sm mb-4" style={{ color: 'var(--muted)' }}>
          <ArrowLeft size={18} /> Back
        </button>
        <p className="text-base font-semibold dy-text">Title not found</p>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          This title isn&apos;t in your shelf.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between pt-12 pb-4">
        <button type="button" onClick={() => router.back()}
          className="flex items-center gap-1 text-sm" style={{ color: 'var(--muted)' }}>
          <ArrowLeft size={18} /> Back
        </button>
        <button type="button" onClick={handleDelete} disabled={deleting}
          className="flex items-center gap-1 text-sm px-2 py-1 rounded-lg"
          style={{ color: '#ff6b6b', border: '1px solid var(--border-strong)' }}>
          <Trash2 size={14} /> Delete
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        {data.coverUrl ? (
          <Image src={posterSrc(data.coverUrl, 'w342')} alt={data.title} width={112} height={160} className="w-28 h-40 object-cover rounded-xl shrink-0" />
        ) : (
          <div className="w-28 h-40 rounded-xl shrink-0 flex items-center justify-center text-3xl font-bold"
            style={{ background: 'var(--surface)', color: 'var(--faintest)' }}>
            {data.title[0]?.toUpperCase()}
          </div>
        )}
        <div className="flex flex-col justify-center min-w-0">
          <h1 className="text-xl font-bold dy-text leading-tight">{data.title}</h1>
          <p className="text-sm capitalize mt-1" style={{ color: 'var(--muted)' }}>{data.type}</p>
          {data.releaseYear && <p className="text-xs mt-0.5" style={{ color: 'var(--dim)' }}>{data.releaseYear}</p>}
          {tmdb?.trailerKey && (
            <button type="button" onClick={() => setTrailerOpen(true)}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold w-fit"
              style={{ background: '#C9A84C', color: '#0D0D0D' }}>
              <Play size={12} fill="#0D0D0D" /> ดูตัวอย่าง
            </button>
          )}
        </div>
      </div>

      {trailerOpen && tmdb?.trailerKey && (
        <div
          onClick={() => setTrailerOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)' }}
        >
          <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-2xl">
            <button type="button" onClick={() => setTrailerOpen(false)}
              className="absolute -top-10 right-0 p-1.5 rounded-full"
              style={{ background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)' }}>
              <X size={18} />
            </button>
            <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
              <iframe
                src={`https://www.youtube.com/embed/${tmdb.trailerKey}?autoplay=1`}
                title="Trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full rounded-xl"
                style={{ border: 0 }}
              />
            </div>
          </div>
        </div>
      )}

      {tmdbLoading ? (
        <div className="mb-6 space-y-2">
          <div className="animate-pulse rounded-lg h-4 w-24" style={{ background: 'var(--surface)' }} />
          <div className="animate-pulse rounded-lg h-16" style={{ background: 'var(--surface)' }} />
        </div>
      ) : tmdb && (tmdb.overview || tmdb.cast.length > 0 || tmdb.genres.length > 0) ? (
        <div className="mb-6 rounded-2xl p-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-dim)' }}>
          {tmdb.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {tmdb.genres.map((g) => (
                <span key={g} className="px-2.5 py-1 rounded-full text-xs"
                  style={{ background: 'var(--surface)', color: '#C9A84C', border: '1px solid var(--border)' }}>
                  {g}
                </span>
              ))}
            </div>
          )}
          {tmdb.runtime ? (
            <p className="text-xs mb-1" style={{ color: 'var(--dim)' }}>
              {tmdb.runtime} min{data.type !== 'movie' ? ' / ep' : ''}
            </p>
          ) : null}
          {tmdb.thaiReleaseDate && (
            <p className="text-xs mb-2" style={{ color: '#C9A84C' }}>
              ฉายในไทย: {formatThaiDate(tmdb.thaiReleaseDate)}
            </p>
          )}
          {tmdb.overview && (
            <>
              <div className="text-xs font-semibold mb-1.5" style={{ color: 'var(--muted)' }}>เนื้อเรื่อง</div>
              <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--soft)' }}>{tmdb.overview}</p>
            </>
          )}
          {tmdb.cast.length > 0 && (
            <>
              <div className="text-xs font-semibold mb-2" style={{ color: 'var(--muted)' }}>นักแสดง</div>
              <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-1">
                {tmdb.cast.map((c) => (
                  <div key={c.name + c.character} className="shrink-0 w-20">
                    {c.profile ? (
                      <Image src={c.profile} alt={c.name} width={80} height={80}
                        className="w-20 h-20 rounded-full object-cover mb-1.5"
                        style={{ border: '1px solid var(--border)' }} />
                    ) : (
                      <div className="w-20 h-20 rounded-full mb-1.5 flex items-center justify-center text-lg font-bold"
                        style={{ background: 'var(--surface)', color: 'var(--faintest)', border: '1px solid var(--border)' }}>
                        {c.name[0]?.toUpperCase()}
                      </div>
                    )}
                    <p className="text-xs leading-tight dy-text truncate">{c.name}</p>
                    {c.character && (
                      <p className="text-[10px] leading-tight truncate" style={{ color: 'var(--dim)' }}>{c.character}</p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ) : null}

      {tmdb?.watchProviders && (
        <div className="mb-6 rounded-2xl p-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-dim)' }}>
          <WhereToWatch providers={tmdb.watchProviders} />
        </div>
      )}

      {mode === 'signed-in' && data?.entry && (
        <ShelfPicker titleId={titleId} />
      )}

      <div className="mb-5">
        <div className="mb-2">{label('Title')}</div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl px-4 py-3 text-sm dy-text outline-none"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        />
      </div>

      <div className="mb-5">
        <div className="mb-2">{label('Type')}</div>
        <div className="flex gap-2">
          {TYPES.map((t) => (
            <button key={t} type="button" onClick={() => setType(t)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize"
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
        <div className="mb-2">{label('Genres', true)}</div>
        <div className="flex flex-wrap gap-2">
          {allGenres.map((g) => {
            const isSelected = selectedGenres.includes(g.id)
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => setSelectedGenres(prev => 
                  isSelected ? prev.filter(id => id !== g.id) : [...prev, g.id]
                )}
                className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                style={{
                  background: isSelected ? '#C9A84C' : 'var(--surface)',
                  color: isSelected ? '#0D0D0D' : 'var(--muted)',
                  border: `1px solid ${isSelected ? '#C9A84C' : 'var(--border-strong)'}`,
                }}>
                {g.name}
              </button>
            )
          })}
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
              className="px-3 py-1.5 rounded-full text-sm font-medium"
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

      <div className="mb-6">
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

      <button type="button" onClick={handleSave} disabled={saving}
        className="w-full py-4 rounded-xl text-base font-bold mb-2 transition-opacity"
        style={{ background: '#C9A84C', color: '#0D0D0D', opacity: saving ? 0.6 : 1 }}>
        {saving ? 'Saving...' : 'Save changes'}
      </button>
    </div>
  )
}
