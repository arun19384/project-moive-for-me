'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppHeader from '@/components/AppHeader'
import TrendingDetail, { type TrendingItem } from '@/components/TrendingDetail'
import { Flame } from 'lucide-react'
import { posterSrc } from '@/lib/img'

type Category = 'all' | 'movie' | 'series' | 'anime'

export default function TrendingPage() {
  const router = useRouter()
  const [category, setCategory] = useState<Category>('all')
  const [items, setItems] = useState<TrendingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<TrendingItem | null>(null)

  useEffect(() => {
    fetch('/api/trending')
      .then(r => r.json())
      .then(data => { setItems(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = category === 'all' ? items : items.filter(i => i.type === category)

  function pickItem(item: TrendingItem) {
    const params = new URLSearchParams({
      q: item.title,
      type: item.type,
    })
    if (item.poster) params.set('poster', item.poster)
    if (item.year) params.set('year', String(item.year))
    router.push(`/add?${params.toString()}`)
  }

  const tabs: { value: Category; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'movie', label: 'Movies' },
    { value: 'series', label: 'Series' },
    { value: 'anime', label: 'Anime' },
  ]

  return (
    <div>
      <AppHeader />

      <div className="flex items-center gap-2 mb-2">
        <Flame size={22} color="#C9A84C" />
        <h2 className="text-xl font-bold dy-text">Trending</h2>
      </div>
      <p className="text-sm mb-5" style={{ color: 'var(--muted)' }}>What people are watching this week</p>

      {/* Category tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto -mx-4 px-4 pb-1" style={{ scrollbarWidth: 'none' }}>
        {tabs.map(t => (
          <button key={t.value} onClick={() => setCategory(t.value)}
            className="px-3 py-1.5 rounded-full text-xs font-medium shrink-0"
            style={{
              background: category === t.value ? '#C9A84C' : 'var(--surface)',
              color: category === t.value ? '#0D0D0D' : 'var(--muted)',
              border: `1px solid ${category === t.value ? '#C9A84C' : 'var(--border)'}`,
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="rounded-xl animate-pulse" style={{ background: 'var(--surface)', aspectRatio: '2/3' }} />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-2">
          <p className="text-lg font-semibold" style={{ color: 'var(--faintest)' }}>Nothing here</p>
        </div>
      )}

      {/* Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {filtered.map((item, i) => (
            <button key={item.tmdbId + '-' + item.type} type="button" onClick={() => setSelected(item)}
              className="text-left p-0 m-0 border-0 bg-transparent">
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden"
                style={{ background: 'var(--surface)' }}>
                {item.poster ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={posterSrc(item.poster, 'w342')} alt={item.title} loading="lazy" decoding="async"
                    className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold"
                    style={{ color: 'var(--faint)' }}>
                    {item.title[0]?.toUpperCase()}
                  </div>
                )}
                {/* Rank badge */}
                <div className="absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: 'rgba(0,0,0,0.8)', color: '#C9A84C' }}>
                  {i + 1}
                </div>
                {/* TMDB rating */}
                {item.rating > 0 && (
                  <div className="absolute top-2 right-2 rounded-full flex items-center px-1.5 py-0.5 text-[10px] font-bold"
                    style={{ background: 'rgba(0,0,0,0.8)', color: 'var(--text)' }}>
                    ★ {item.rating.toFixed(1)}
                  </div>
                )}
              </div>
              <p className="text-xs font-semibold dy-text mt-1.5 truncate">{item.title}</p>
              <p className="text-[10px] capitalize" style={{ color: 'var(--dim)' }}>
                {item.type}{item.year ? ` · ${item.year}` : ''}
              </p>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <TrendingDetail
          key={selected.tmdbId + '-' + selected.type}
          item={selected}
          onClose={() => setSelected(null)}
          onAdd={pickItem}
        />
      )}
    </div>
  )
}
