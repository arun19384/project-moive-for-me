'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Play, Plus, X, Star } from 'lucide-react'
import WhereToWatch, { type WatchProvidersData } from '@/components/WhereToWatch'
import { posterSrc } from '@/lib/img'

export type TrendingItem = {
  tmdbId: number
  title: string
  type: 'movie' | 'series' | 'anime'
  year: number | null
  poster: string | null
  overview: string
  rating: number
}

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

const TH_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
function formatThaiDate(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return `${d.getDate()} ${TH_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`
}

/**
 * Full-screen detail preview for a trending item — overview, cast, where-to-watch,
 * trailer — with an "Add to shelf" CTA. Shown before the user commits to logging it.
 */
export default function TrendingDetail({
  item,
  onClose,
  onAdd,
}: {
  item: TrendingItem
  onClose: () => void
  onAdd: (item: TrendingItem) => void
}) {
  const [tmdb, setTmdb] = useState<TmdbDetails>(null)
  const [tmdbLoading, setTmdbLoading] = useState(true)
  const [trailerOpen, setTrailerOpen] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams({ title: item.title, type: item.type })
    if (item.year) params.set('year', String(item.year))
    fetch(`/api/tmdb-details?${params.toString()}`)
      .then((r) => r.json())
      .then((d: TmdbDetails) => setTmdb(d))
      .catch(() => setTmdb(null))
      .finally(() => setTmdbLoading(false))
  }, [item.title, item.type, item.year])

  return (
    <div
      className="fixed inset-0 z-[60] overflow-y-auto"
      style={{ background: 'var(--bg)' }}
    >
      <div className="max-w-lg mx-auto px-4 pb-[calc(6rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between pt-12 pb-4">
          <button type="button" onClick={onClose}
            className="flex items-center gap-1 text-sm" style={{ color: 'var(--muted)' }}>
            <ArrowLeft size={18} /> Back
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          {item.poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={posterSrc(item.poster, 'w342')} alt={item.title} decoding="async" className="w-28 h-40 object-cover rounded-xl shrink-0" />
          ) : (
            <div className="w-28 h-40 rounded-xl shrink-0 flex items-center justify-center text-3xl font-bold"
              style={{ background: 'var(--surface)', color: 'var(--faintest)' }}>
              {item.title[0]?.toUpperCase()}
            </div>
          )}
          <div className="flex flex-col justify-center min-w-0">
            <h1 className="text-xl font-bold dy-text leading-tight">{item.title}</h1>
            <p className="text-sm capitalize mt-1" style={{ color: 'var(--muted)' }}>{item.type}</p>
            {item.year && <p className="text-xs mt-0.5" style={{ color: 'var(--dim)' }}>{item.year}</p>}
            {item.rating > 0 && (
              <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#C9A84C' }}>
                <Star size={12} fill="#C9A84C" /> {item.rating.toFixed(1)}
                <span style={{ color: 'var(--faint)' }}>/10 TMDB</span>
              </p>
            )}
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
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
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
        ) : (
          <>
            {tmdb && (tmdb.overview || tmdb.cast.length > 0 || tmdb.genres.length > 0 || item.overview) ? (
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
                    {tmdb.runtime} min{item.type !== 'movie' ? ' / ep' : ''}
                  </p>
                ) : null}
                {tmdb.thaiReleaseDate && (
                  <p className="text-xs mb-2" style={{ color: '#C9A84C' }}>
                    ฉายในไทย: {formatThaiDate(tmdb.thaiReleaseDate)}
                  </p>
                )}
                {(tmdb.overview || item.overview) && (
                  <>
                    <div className="text-xs font-semibold mb-1.5" style={{ color: 'var(--muted)' }}>เนื้อเรื่อง</div>
                    <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--soft)' }}>{tmdb.overview || item.overview}</p>
                  </>
                )}
                {tmdb.cast.length > 0 && (
                  <>
                    <div className="text-xs font-semibold mb-2" style={{ color: 'var(--muted)' }}>นักแสดง</div>
                    <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-1">
                      {tmdb.cast.map((c) => (
                        <div key={c.name + c.character} className="shrink-0 w-20">
                          {c.profile ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={c.profile} alt={c.name} loading="lazy" decoding="async"
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
          </>
        )}
      </div>

      {/* Sticky add-to-shelf CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3"
        style={{ background: 'linear-gradient(to top, var(--bg) 70%, transparent)' }}>
        <div className="max-w-lg mx-auto">
          <button type="button" onClick={() => onAdd(item)}
            className="w-full py-4 rounded-xl text-base font-bold flex items-center justify-center gap-2"
            style={{ background: '#C9A84C', color: '#0D0D0D' }}>
            <Plus size={18} strokeWidth={2.5} /> เพิ่มเข้า shelf
          </button>
        </div>
      </div>
    </div>
  )
}
