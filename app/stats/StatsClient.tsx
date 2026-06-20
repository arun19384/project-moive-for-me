'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AppHeader from '@/components/AppHeader'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { getStorage, type StorageMode } from '@/lib/storage'
import GuestBanner from '@/components/GuestBanner'
import { posterSrc } from '@/lib/img'
import {
  Film, Tv, Sparkles, Clock, Calendar, Flame, Trophy, TrendingUp, Star,
  Target, Zap, BarChart3, Award, ChevronRight, Activity as ActivityIcon,
  Pencil, Plus, X, Search, Check, Heart, Crown, Medal,
} from 'lucide-react'

type TopItem = { id: number; title: string; type: string; coverUrl: string | null; rating: number }
type RecentItem = { id: number; title: string; type: string; coverUrl: string | null; rating: number | null; watchedDate: string | null }
type Activity = { date: string; count: number }

type ShelfTitle = {
  id: number
  title: string
  type: 'movie' | 'series' | 'anime'
  coverUrl: string | null
  entry: { rating: number | null } | null
}

const TOP10_KEY = 'dy:top10'

type Stats = {
  totalWatched: number
  avgRating: number
  thisMonthCount: number
  hoursSpent: number
  byGenre: { name: string; count: number }[]
  typeCounts: { movie: number; series: number; anime: number }
  avgRatingByType: { movie: number; series: number; anime: number }
  topRated: TopItem[]
  recent: RecentItem[]
  topPlatform: string | null
  activity: Activity[]
  bestMonth: { month: string; count: number } | null
  month: string
  ratingDist: { rating: number; count: number }[]
  currentStreak: number
  monthlyTrend: { month: string; count: number }[]
  milestone: { current: number; next: number }
}

const TYPE_COLORS = { movie: '#C9A84C', series: '#7FB5FF', anime: '#FF9A7F' } as const
const TYPE_ICON = { movie: Film, series: Tv, anime: Sparkles } as const

const DAY_LABELS = ['Mon', 'Wed', 'Fri']

export default function StatsClient({
  mode, initialStats, initialTitles,
}: {
  mode: StorageMode
  initialStats: Stats | null
  initialTitles: ShelfTitle[] | null
}) {
  const router = useRouter()
  const storage = useMemo(() => getStorage(mode), [mode])
  const [stats, setStats] = useState<Stats | null>(initialStats)
  const [titles, setTitles] = useState<ShelfTitle[]>(initialTitles ?? [])
  const [loading, setLoading] = useState(initialStats == null)
  const [top10, setTop10] = useState<(number | null)[]>(() => Array(10).fill(null))
  const [picking, setPicking] = useState<number | null>(null)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    if (initialStats == null) {
      Promise.all([storage.getStats(), storage.getShelf()]).then(([s, items]) => {
        setStats(s)
        setTitles(items.map((i) => ({
          id: i.id,
          title: i.title,
          type: i.type,
          coverUrl: i.coverUrl,
          entry: i.entry ? { rating: i.entry.rating } : null,
        })))
        setLoading(false)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(TOP10_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (Array.isArray(parsed) && parsed.length === 10) setTop10(parsed)
      }
    } catch {}
  }, [])

  if (loading || !stats) {
    return (
      <div>
        <AppHeader />
        {mode === 'guest' && <GuestBanner />}
        <p className="text-sm" style={{ color: 'var(--muted)' }}>Loading stats...</p>
      </div>
    )
  }

  if (stats.totalWatched === 0) {
    return (
      <div>
        <AppHeader />
        {mode === 'guest' && <GuestBanner />}
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Trophy size={40} color="var(--border-strong)" />
          <p className="text-lg font-semibold" style={{ color: 'var(--faintest)' }}>No stats yet</p>
          <p className="text-sm" style={{ color: 'var(--border-strong)' }}>Add titles to your shelf to see your stats</p>
        </div>
      </div>
    )
  }

  const totalTypes = stats.typeCounts.movie + stats.typeCounts.series + stats.typeCounts.anime
  const pieData = [
    { name: 'Movies', value: stats.typeCounts.movie, color: TYPE_COLORS.movie },
    { name: 'Series', value: stats.typeCounts.series, color: TYPE_COLORS.series },
    { name: 'Anime', value: stats.typeCounts.anime, color: TYPE_COLORS.anime },
  ].filter(d => d.value > 0)

  const weeks: Activity[][] = []
  for (let i = 0; i < stats.activity.length; i += 7) {
    weeks.push(stats.activity.slice(i, i + 7))
  }
  const activityMax = Math.max(...stats.activity.map(a => a.count), 1)

  const milestonePct = Math.min(100, Math.round((stats.milestone.current / stats.milestone.next) * 100))
  const milestoneRemaining = Math.max(0, stats.milestone.next - stats.milestone.current)

  const trendMax = Math.max(...stats.monthlyTrend.map(m => m.count), 1)
  const ratingMax = Math.max(...stats.ratingDist.map(r => r.count), 1)
  const ratedTotal = stats.ratingDist.reduce((s, r) => s + r.count, 0)

  const titleMap = new Map(titles.map(t => [t.id, t]))
  const top10Filled = top10.filter(Boolean).length

  function saveTop10(arr: (number | null)[]) {
    setTop10(arr)
    try { localStorage.setItem(TOP10_KEY, JSON.stringify(arr)) } catch {}
  }
  function setSlot(slot: number, titleId: number | null) {
    const next = [...top10]
    if (titleId != null) {
      for (let i = 0; i < next.length; i++) {
        if (i !== slot && next[i] === titleId) next[i] = null
      }
    }
    next[slot] = titleId
    saveTop10(next)
  }
  function moveSlot(from: number, dir: -1 | 1) {
    const to = from + dir
    if (to < 0 || to >= 10) return
    const next = [...top10]
    ;[next[from], next[to]] = [next[to], next[from]]
    saveTop10(next)
  }

  // Vibe — derived "watch DNA"
  const dominantType = (['movie', 'series', 'anime'] as const)
    .map(t => ({ t, c: stats.typeCounts[t] }))
    .sort((a, b) => b.c - a.c)[0]?.t

  const vibe = (() => {
    if (stats.avgRating >= 8) return { label: 'Generous critic', emoji: '✨' }
    if (stats.avgRating > 0 && stats.avgRating < 6) return { label: 'Tough crowd', emoji: '🧊' }
    if (stats.currentStreak >= 5) return { label: 'On a roll', emoji: '🔥' }
    if (dominantType === 'anime') return { label: 'Anime soul', emoji: '🎌' }
    if (dominantType === 'series') return { label: 'Series binger', emoji: '📺' }
    return { label: 'Casual watcher', emoji: '🍿' }
  })()

  return (
    <div>
      <AppHeader />

      {mode === 'guest' && <GuestBanner />}

      <div className="flex items-baseline justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold dy-text leading-none">Your stats</h2>
          <p className="text-xs mt-1.5" style={{ color: 'var(--muted)' }}>{stats.month}</p>
        </div>
        <div
          className="text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1"
          style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C' }}
        >
          <span>{vibe.emoji}</span> {vibe.label}
        </div>
      </div>

      {/* Hero card with milestone */}
      <div
        className="rounded-3xl p-5 mb-3 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #3a2a14 0%, #1a1410 60%, #0d0d0d 100%)',
          border: '1px solid #3a2a18',
        }}
      >
        <div className="absolute -right-6 -top-6 opacity-10">
          <Trophy size={120} color="#C9A84C" />
        </div>
        <div className="relative">
          <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: '#C9A84C' }}>
            Total watched
          </p>
          <div className="flex items-end gap-3 mt-1">
            <p
              className="text-6xl font-bold leading-none"
              style={{
                background: 'linear-gradient(180deg, #fff, #C9A84C)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {stats.totalWatched}
            </p>
            <div className="flex items-center gap-2 pb-1.5 text-xs" style={{ color: 'var(--muted)' }}>
              <Clock size={11} /> {stats.hoursSpent}h
              {stats.avgRating > 0 && (
                <>
                  <span style={{ color: 'var(--faintest)' }}>·</span>
                  <Star size={11} fill="#C9A84C" color="#C9A84C" />
                  <span className="tabular-nums">{stats.avgRating}</span>
                </>
              )}
            </div>
          </div>

          {/* Milestone bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Target size={11} color="#C9A84C" />
                <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--soft)' }}>
                  Next milestone · {stats.milestone.next}
                </p>
              </div>
              <p className="text-[10px] tabular-nums" style={{ color: 'var(--muted)' }}>
                {milestoneRemaining > 0 ? `${milestoneRemaining} to go` : 'reached!'}
              </p>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.4)' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${milestonePct}%`,
                  background: 'linear-gradient(90deg, #C9A84C, #F5D77A)',
                  boxShadow: '0 0 12px rgba(201,168,76,0.5)',
                  transition: 'width 700ms ease-out',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Top 10 of life time — custom */}
      <div className="mb-6 mt-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <Heart size={13} color="#C9A84C" fill="#C9A84C" />
              <p className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: '#C9A84C' }}>
                Top 10 of life time
              </p>
            </div>
            <p className="text-[10px] mt-1 ml-[21px]" style={{ color: 'var(--faint)' }}>
              {top10Filled}/10 picked · your all-time favorites
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditMode(v => !v)}
            className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1"
            style={{
              background: editMode ? '#C9A84C' : 'transparent',
              color: editMode ? '#0D0D0D' : '#C9A84C',
              border: `1px solid ${editMode ? '#C9A84C' : 'rgba(201,168,76,0.4)'}`,
            }}
          >
            {editMode ? <><Check size={12} strokeWidth={3} /> Done</> : <><Pencil size={11} /> Edit</>}
          </button>
        </div>

        {/* #1 hero */}
        <TopHeroSlot
          slot={0}
          title={top10[0] != null ? titleMap.get(top10[0]!) ?? null : null}
          editMode={editMode}
          onPick={() => setPicking(0)}
          onOpen={(id) => router.push(`/title/${id}`)}
          onRemove={() => setSlot(0, null)}
          onMoveDown={() => moveSlot(0, 1)}
        />

        {/* #2 & #3 side-by-side */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          {[1, 2].map(i => (
            <TopPodiumSlot
              key={i}
              slot={i}
              title={top10[i] != null ? titleMap.get(top10[i]!) ?? null : null}
              editMode={editMode}
              onPick={() => setPicking(i)}
              onOpen={(id) => router.push(`/title/${id}`)}
              onRemove={() => setSlot(i, null)}
              onMoveUp={() => moveSlot(i, -1)}
              onMoveDown={() => moveSlot(i, 1)}
            />
          ))}
        </div>

        {/* #4–10 list */}
        <div className="flex flex-col gap-2 mt-4">
          {top10.slice(3).map((titleId, idx) => {
            const i = idx + 3
            const t = titleId != null ? titleMap.get(titleId) : null

            if (!t) {
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPicking(i)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left w-full"
                  style={{
                    background: 'transparent',
                    border: '1px dashed var(--border-strong)',
                  }}
                >
                  <span className="text-base font-bold w-6 shrink-0 tabular-nums text-center" style={{ color: 'var(--faintest)' }}>
                    {i + 1}
                  </span>
                  <div className="w-9 h-12 rounded-lg shrink-0 flex items-center justify-center"
                    style={{ background: 'var(--surface-2)', border: '1px dashed var(--border-strong)' }}>
                    <Plus size={14} color="var(--faint)" />
                  </div>
                  <span className="flex-1 text-sm" style={{ color: 'var(--faint)' }}>
                    Pick a title for #{i + 1}
                  </span>
                  <ChevronRight size={14} color="var(--faint)" className="shrink-0" />
                </button>
              )
            }

            return (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 w-full"
                style={{ background: 'var(--surface)' }}
              >
                <span
                  className="text-base font-bold w-6 shrink-0 tabular-nums text-center"
                  style={{ color: 'var(--faintest)' }}
                >
                  {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => !editMode && router.push(`/title/${t.id}`)}
                  className="flex items-center gap-3 flex-1 min-w-0 bg-transparent border-0 p-0 text-left"
                >
                  {t.coverUrl ? (
                    <img src={posterSrc(t.coverUrl, 'w185')} alt={t.title} loading="lazy" decoding="async" className="w-9 h-12 object-cover rounded-lg shrink-0" />
                  ) : (
                    <div className="w-9 h-12 rounded-lg shrink-0 flex items-center justify-center text-sm font-bold"
                      style={{ background: 'var(--border)', color: 'var(--faint)' }}>
                      {t.title[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold dy-text truncate">{t.title}</p>
                    <p className="text-xs capitalize mt-0.5" style={{ color: 'var(--dim)' }}>{t.type}</p>
                  </div>
                  {t.entry?.rating != null && !editMode && (
                    <div className="flex items-center gap-1 shrink-0 px-2 py-1 rounded-lg"
                      style={{ background: 'rgba(201,168,76,0.1)' }}>
                      <Star size={11} fill="#C9A84C" color="#C9A84C" />
                      <span className="text-xs font-bold tabular-nums" style={{ color: '#C9A84C' }}>{t.entry.rating}</span>
                    </div>
                  )}
                </button>
                {editMode && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button type="button" onClick={() => moveSlot(i, -1)} disabled={i === 0}
                      className="w-7 h-7 rounded-md flex items-center justify-center disabled:opacity-30"
                      style={{ background: 'var(--surface-2)', color: 'var(--soft)' }} aria-label="Move up">
                      <ChevronRight size={14} style={{ transform: 'rotate(-90deg)' }} />
                    </button>
                    <button type="button" onClick={() => moveSlot(i, 1)} disabled={i === 9}
                      className="w-7 h-7 rounded-md flex items-center justify-center disabled:opacity-30"
                      style={{ background: 'var(--surface-2)', color: 'var(--soft)' }} aria-label="Move down">
                      <ChevronRight size={14} style={{ transform: 'rotate(90deg)' }} />
                    </button>
                    <button type="button" onClick={() => setPicking(i)}
                      className="w-7 h-7 rounded-md flex items-center justify-center"
                      style={{ background: 'var(--surface-2)', color: '#C9A84C' }} aria-label="Change">
                      <Pencil size={12} />
                    </button>
                    <button type="button" onClick={() => setSlot(i, null)}
                      className="w-7 h-7 rounded-md flex items-center justify-center"
                      style={{ background: 'var(--surface-2)', color: 'var(--danger)' }} aria-label="Remove">
                      <X size={13} />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick stat grid — 4 */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <QuickStat
          icon={Calendar}
          label="This month"
          value={stats.thisMonthCount}
          sub={stats.bestMonth ? `Best ${stats.bestMonth.count} · ${stats.bestMonth.month}` : undefined}
          accent="#C9A84C"
        />
        <QuickStat
          icon={Flame}
          label="Streak"
          value={stats.currentStreak}
          unit={stats.currentStreak === 1 ? 'day' : 'days'}
          sub={stats.currentStreak === 0 ? 'Log today to start' : 'Keep it going'}
          accent={stats.currentStreak > 0 ? '#FF7F50' : 'var(--faint)'}
        />
        <QuickStat
          icon={TrendingUp}
          label="Top platform"
          value={stats.topPlatform ?? '—'}
          big={!!stats.topPlatform}
          accent="#7FB5FF"
        />
        <QuickStat
          icon={Star}
          label="Rated"
          value={ratedTotal}
          sub={ratedTotal > 0 ? `${Math.round((ratedTotal / stats.totalWatched) * 100)}% of watched` : 'Rate to track'}
          accent="#FF9A7F"
        />
      </div>

      {/* Monthly trend */}
      <SectionHeader title="Last 6 months" icon={BarChart3} />
      <div className="rounded-2xl p-4 mb-6" style={{ background: 'var(--surface)' }}>
        <div className="flex items-end gap-2 h-28">
          {stats.monthlyTrend.map((m, i) => {
            const isLast = i === stats.monthlyTrend.length - 1
            const h = m.count === 0 ? 4 : Math.max(8, Math.round((m.count / trendMax) * 100))
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 justify-end h-full">
                <span
                  className="text-[10px] tabular-nums leading-none"
                  style={{ color: m.count > 0 ? (isLast ? '#C9A84C' : 'var(--soft)') : 'var(--faintest)' }}
                >
                  {m.count}
                </span>
                <div
                  className="w-full rounded-md"
                  style={{
                    height: `${h}%`,
                    background: isLast
                      ? 'linear-gradient(180deg, #F5D77A, #C9A84C)'
                      : m.count > 0
                        ? 'linear-gradient(180deg, #4a3a1a, #2a2010)'
                        : 'var(--border-dim)',
                    boxShadow: isLast ? '0 0 10px rgba(201,168,76,0.3)' : 'none',
                    transition: 'height 600ms ease-out',
                  }}
                />
                <span className="text-[10px] uppercase tracking-wider" style={{ color: isLast ? '#C9A84C' : 'var(--dim)' }}>
                  {m.month}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Activity heatmap */}
      <SectionHeader title="Activity · last 90 days" icon={ActivityIcon} />
      <div className="rounded-2xl p-3 mb-6" style={{ background: 'var(--surface-2)' }}>
        <div className="flex gap-2">
          <div className="flex flex-col gap-1 justify-around py-0.5">
            {[0, 2, 4].map(i => (
              <span key={i} className="text-[9px] leading-none" style={{ color: 'var(--faint)' }}>
                {DAY_LABELS[i / 2]}
              </span>
            ))}
          </div>
          <div className="flex-1 flex gap-1 justify-between">
            {weeks.map((week, i) => (
              <div key={i} className="flex flex-col gap-1">
                {week.map(day => {
                  const intensity = day.count === 0 ? 0 : Math.min(1, day.count / activityMax)
                  const alpha = day.count === 0 ? 0 : 0.25 + intensity * 0.75
                  return (
                    <div
                      key={day.date}
                      title={`${day.date}: ${day.count} watched`}
                      style={{
                        width: 13,
                        height: 13,
                        borderRadius: 3,
                        background: day.count > 0 ? `rgba(201, 168, 76, ${alpha})` : 'rgba(255,255,255,0.04)',
                      }}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-3 justify-end">
          <span className="text-[9px]" style={{ color: 'var(--faint)' }}>Less</span>
          {[0.15, 0.4, 0.65, 1].map(a => (
            <div key={a} style={{ width: 10, height: 10, borderRadius: 2, background: `rgba(201,168,76,${a})` }} />
          ))}
          <span className="text-[9px]" style={{ color: 'var(--faint)' }}>More</span>
        </div>
      </div>

      {/* Type breakdown */}
      {totalTypes > 0 && (
        <>
          <SectionHeader title="By type" icon={Film} />
          <div className="rounded-2xl p-4 mb-6 flex items-center gap-4" style={{ background: 'var(--surface)' }}>
            <div className="w-28 h-28 shrink-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" innerRadius={32} outerRadius={50} paddingAngle={3}>
                    {pieData.map((d, i) => (
                      <Cell key={i} fill={d.color} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-xl font-bold dy-text leading-none">{totalTypes}</p>
                <p className="text-[10px]" style={{ color: 'var(--dim)' }}>total</p>
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-2.5">
              {(['movie', 'series', 'anime'] as const).map(t => {
                const Icon = TYPE_ICON[t]
                const count = stats.typeCounts[t]
                const avg = stats.avgRatingByType[t]
                if (count === 0) return null
                const pct = Math.round((count / totalTypes) * 100)
                return (
                  <div key={t}>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon size={13} color={TYPE_COLORS[t]} />
                      <span className="text-xs capitalize" style={{ color: 'var(--soft)' }}>{t}s</span>
                      <span className="ml-auto text-sm font-bold tabular-nums dy-text">{count}</span>
                      {avg > 0 && (
                        <span className="text-[10px] tabular-nums px-1.5 py-0.5 rounded-md"
                          style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C' }}>
                          ★ {avg}
                        </span>
                      )}
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--border-dim)' }}>
                      <div className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: TYPE_COLORS[t], transition: 'width 600ms ease-out' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* Rating distribution */}
      {ratedTotal > 0 && (
        <>
          <SectionHeader title="Rating distribution" icon={Star} />
          <div className="rounded-2xl p-4 mb-6" style={{ background: 'var(--surface)' }}>
            <div className="flex items-end gap-1 h-24 mb-2">
              {stats.ratingDist.map(r => {
                const h = r.count === 0 ? 4 : Math.max(6, Math.round((r.count / ratingMax) * 100))
                const isHigh = r.rating >= 8
                const isMid = r.rating >= 5 && r.rating < 8
                return (
                  <div key={r.rating} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
                    {r.count > 0 && (
                      <span className="text-[9px] tabular-nums leading-none" style={{ color: 'var(--muted)' }}>{r.count}</span>
                    )}
                    <div
                      className="w-full rounded-sm"
                      style={{
                        height: `${h}%`,
                        background: isHigh
                          ? 'linear-gradient(180deg, #F5D77A, #C9A84C)'
                          : isMid
                            ? 'linear-gradient(180deg, #5a4a2a, #3a2e18)'
                            : 'var(--border-strong)',
                        transition: 'height 600ms ease-out',
                      }}
                    />
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between px-0.5">
              {stats.ratingDist.map(r => (
                <span key={r.rating} className="text-[10px] tabular-nums w-full text-center" style={{ color: 'var(--faint)' }}>
                  {r.rating}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 text-[11px]" style={{ borderTop: '1px solid var(--border-dim)' }}>
              <span style={{ color: 'var(--dim)' }}>
                Most given: <span style={{ color: '#C9A84C' }} className="font-semibold">
                  {stats.ratingDist.reduce((a, b) => (a.count >= b.count ? a : b)).rating}/10
                </span>
              </span>
              <span style={{ color: 'var(--dim)' }}>
                ★ avg <span className="font-semibold" style={{ color: 'var(--text)' }}>{stats.avgRating}</span>
              </span>
            </div>
          </div>
        </>
      )}

      {/* Collections teaser */}
      <Link
        href="/collections"
        className="rounded-2xl p-4 mb-6 flex items-center gap-3 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(201,168,76,0.12), rgba(127,181,255,0.06))',
          border: '1px solid rgba(201,168,76,0.25)',
        }}
      >
        <div className="absolute -right-3 -bottom-3 opacity-10">
          <Award size={70} color="#C9A84C" />
        </div>
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(201,168,76,0.18)', border: '1px solid rgba(201,168,76,0.4)' }}
        >
          <Zap size={20} color="#C9A84C" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold dy-text">Hunt for saga badges</p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
            Complete franchises to unlock collection badges
          </p>
        </div>
        <ChevronRight size={18} color="#C9A84C" className="shrink-0" />
      </Link>

      {/* Recently watched */}
      {stats.recent.length > 0 && (
        <>
          <SectionHeader title="Recently watched" />
          <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-2 mb-6" style={{ scrollbarWidth: 'none' }}>
            {stats.recent.map(item => (
              <button key={item.id} type="button" onClick={() => router.push(`/title/${item.id}`)}
                className="shrink-0 w-24 text-left p-0 bg-transparent border-0">
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden" style={{ background: 'var(--surface)' }}>
                  {item.coverUrl ? (
                    <img src={posterSrc(item.coverUrl, 'w185')} alt={item.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl font-bold" style={{ color: 'var(--faint)' }}>
                      {item.title[0]?.toUpperCase()}
                    </div>
                  )}
                  {item.rating != null && (
                    <div className="absolute top-1 right-1 rounded-full text-[10px] font-bold px-1.5 py-0.5"
                      style={{ background: 'rgba(0,0,0,0.8)', color: '#C9A84C' }}>
                      {item.rating}
                    </div>
                  )}
                </div>
                <p className="text-xs font-semibold dy-text mt-1.5 truncate">{item.title}</p>
                {item.watchedDate && (
                  <p className="text-[10px]" style={{ color: 'var(--faint)' }}>{item.watchedDate}</p>
                )}
              </button>
            ))}
          </div>
        </>
      )}

      {picking != null && (
        <TitlePickerModal
          slot={picking}
          titles={titles}
          alreadyPicked={new Set(top10.filter((x): x is number => x != null))}
          onPick={(id) => { setSlot(picking, id); setPicking(null) }}
          onClose={() => setPicking(null)}
        />
      )}
    </div>
  )
}

function TitlePickerModal({
  slot, titles, alreadyPicked, onPick, onClose,
}: {
  slot: number
  titles: ShelfTitle[]
  alreadyPicked: Set<number>
  onPick: (id: number) => void
  onClose: () => void
}) {
  const [q, setQ] = useState('')
  const filtered = titles.filter(t => t.title.toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.75)' }} />
      <div
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[85dvh] rounded-t-3xl sm:rounded-3xl flex flex-col"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-dim)' }}>
          <div>
            <p className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Pick for</p>
            <p className="text-lg font-bold dy-text">#{slot + 1} of life time</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-4 pt-3 pb-2 relative">
          <Search size={14} className="absolute left-7 top-1/2 -translate-y-1/2 pointer-events-none" color="var(--faint)" />
          <input
            autoFocus
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search your shelf…"
            className="w-full rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border-dim)', color: 'var(--text)' }}
          />
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {filtered.length === 0 ? (
            <p className="text-center text-sm py-10" style={{ color: 'var(--muted)' }}>
              No titles match
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2.5">
              {filtered.map(t => {
                const picked = alreadyPicked.has(t.id)
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onPick(t.id)}
                    className="text-left rounded-xl overflow-hidden relative"
                    style={{ background: 'var(--surface-2)', border: `1px solid ${picked ? '#C9A84C' : 'transparent'}` }}
                  >
                    <div className="aspect-[2/3] relative">
                      {t.coverUrl ? (
                        <img src={posterSrc(t.coverUrl, 'w185')} alt={t.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl font-bold"
                          style={{ background: 'var(--border)', color: 'var(--faint)' }}>
                          {t.title[0]?.toUpperCase()}
                        </div>
                      )}
                      {picked && (
                        <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ background: '#C9A84C' }}>
                          <Check size={13} color="#0D0D0D" strokeWidth={3} />
                        </div>
                      )}
                      {t.entry?.rating != null && (
                        <div className="absolute bottom-1.5 left-1.5 rounded text-[10px] font-bold px-1.5 py-0.5"
                          style={{ background: 'rgba(0,0,0,0.75)', color: '#C9A84C' }}>
                          ★ {t.entry.rating}
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] font-semibold dy-text px-2 py-1.5 truncate">{t.title}</p>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TopHeroSlot({
  slot, title: t, editMode, onPick, onOpen, onRemove, onMoveDown,
}: {
  slot: number
  title: ShelfTitle | null
  editMode: boolean
  onPick: () => void
  onOpen: (id: number) => void
  onRemove: () => void
  onMoveDown: () => void
}) {
  if (!t) {
    return (
      <button
        type="button"
        onClick={onPick}
        className="w-full rounded-3xl relative overflow-hidden flex flex-col items-center justify-center gap-3"
        style={{
          aspectRatio: '3/4',
          background: 'linear-gradient(135deg, rgba(201,168,76,0.12), rgba(201,168,76,0.03))',
          border: '2px dashed rgba(201,168,76,0.4)',
        }}
      >
        <div className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(201,168,76,0.2)', border: '1px solid rgba(201,168,76,0.5)' }}>
          <Crown size={30} color="#C9A84C" />
        </div>
        <div className="text-center">
          <p className="text-base font-bold" style={{ color: '#C9A84C' }}>Pick your #1 of life</p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>The one you&apos;d rewatch forever</p>
        </div>
      </button>
    )
  }

  return (
    <div
      className="w-full rounded-3xl relative overflow-hidden"
      style={{
        aspectRatio: '3/4',
        background: 'var(--surface)',
        border: '1px solid rgba(201,168,76,0.5)',
        boxShadow: '0 0 0 1px rgba(201,168,76,0.15), 0 12px 40px rgba(201,168,76,0.2)',
      }}
    >
      {t.coverUrl ? (
        <img src={posterSrc(t.coverUrl, 'w500')} alt={t.title} decoding="async" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-6xl font-bold"
          style={{ background: 'var(--border)', color: 'var(--faint)' }}>
          {t.title[0]?.toUpperCase()}
        </div>
      )}

      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 30%, transparent 50%, rgba(0,0,0,0.6) 75%, rgba(0,0,0,0.95) 100%)',
      }} />

      <button
        type="button"
        onClick={() => !editMode && onOpen(t.id)}
        className="absolute inset-0 flex flex-col justify-end p-5 text-left bg-transparent border-0"
      >
        <div className="flex items-center gap-1.5 mb-2">
          <Crown size={16} color="#C9A84C" fill="#C9A84C" />
          <span className="text-[11px] uppercase tracking-[0.2em] font-bold" style={{ color: '#C9A84C' }}>
            #1 of life
          </span>
        </div>
        <p className="text-3xl font-bold dy-text leading-tight" style={{
          textShadow: '0 3px 12px rgba(0,0,0,0.8)',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {t.title}
        </p>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[11px] capitalize px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(8px)' }}>
            {t.type}
          </span>
          {t.entry?.rating != null && (
            <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(201,168,76,0.3)', color: '#FFF', backdropFilter: 'blur(8px)', border: '1px solid rgba(201,168,76,0.5)' }}>
              <Star size={11} fill="#C9A84C" color="#C9A84C" /> {t.entry.rating}/10
            </span>
          )}
        </div>
      </button>

      <div className="absolute top-4 right-4 flex items-center gap-1.5"
        style={{
          background: 'linear-gradient(135deg, #F5D77A, #C9A84C 50%, #8A6E20)',
          padding: '7px 14px',
          borderRadius: 999,
          boxShadow: '0 4px 16px rgba(201,168,76,0.5), inset 0 1px 0 rgba(255,255,255,0.3)',
        }}>
        <Crown size={13} color="#0D0D0D" fill="#0D0D0D" />
        <span className="text-xs font-bold tracking-wider" style={{ color: '#0D0D0D' }}>GOAT</span>
      </div>

      {editMode && (
        <div className="absolute top-4 left-4 flex items-center gap-1.5">
          <button type="button" onClick={onPick}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.7)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.5)', backdropFilter: 'blur(8px)' }}
            aria-label="Change">
            <Pencil size={14} />
          </button>
          <button type="button" onClick={onMoveDown}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.7)', color: 'var(--soft)', border: '1px solid var(--border-strong)', backdropFilter: 'blur(8px)' }}
            aria-label="Move down">
            <ChevronRight size={15} style={{ transform: 'rotate(90deg)' }} />
          </button>
          <button type="button" onClick={onRemove}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.7)', color: 'var(--danger)', border: '1px solid var(--danger-border)', backdropFilter: 'blur(8px)' }}
            aria-label="Remove">
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  )
}

function TopPodiumSlot({
  slot, title: t, editMode, onPick, onOpen, onRemove, onMoveUp, onMoveDown,
}: {
  slot: number
  title: ShelfTitle | null
  editMode: boolean
  onPick: () => void
  onOpen: (id: number) => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  const isSilver = slot === 1
  const medalColor = isSilver ? '#D9D9D9' : '#D88B5C'
  const medalDark = isSilver ? '#8A8A8A' : '#A05E2C'
  const label = isSilver ? '#2 Silver' : '#3 Bronze'

  if (!t) {
    return (
      <button
        type="button"
        onClick={onPick}
        className="w-full rounded-2xl relative overflow-hidden flex flex-col items-center justify-center p-4 gap-2"
        style={{
          aspectRatio: '3/4',
          background: `linear-gradient(135deg, ${medalColor}1A, transparent)`,
          border: `2px dashed ${medalColor}66`,
        }}
      >
        <Medal size={22} color={medalColor} />
        <p className="text-[11px] font-bold" style={{ color: medalColor }}>{label}</p>
        <p className="text-[10px] text-center" style={{ color: 'var(--muted)' }}>Tap to pick</p>
      </button>
    )
  }

  return (
    <div
      className="w-full rounded-2xl relative overflow-hidden"
      style={{
        aspectRatio: '3/4',
        background: 'var(--surface)',
        border: `1px solid ${medalColor}66`,
      }}
    >
      {t.coverUrl ? (
        <img src={posterSrc(t.coverUrl, 'w342')} alt={t.title} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold"
          style={{ background: 'var(--border)', color: 'var(--faint)' }}>
          {t.title[0]?.toUpperCase()}
        </div>
      )}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.9) 100%)',
      }} />

      <button
        type="button"
        onClick={() => !editMode && onOpen(t.id)}
        className="absolute inset-0 flex flex-col justify-end p-3 text-left bg-transparent border-0"
      >
        <p className="text-sm font-bold dy-text leading-tight" style={{
          textShadow: '0 2px 6px rgba(0,0,0,0.7)',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {t.title}
        </p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="text-[9px] capitalize" style={{ color: 'rgba(255,255,255,0.7)' }}>{t.type}</span>
          {t.entry?.rating != null && (
            <span className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 rounded ml-auto"
              style={{ background: 'rgba(0,0,0,0.6)', color: '#C9A84C' }}>
              ★ {t.entry.rating}
            </span>
          )}
        </div>
      </button>

      <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full"
        style={{
          background: `linear-gradient(135deg, ${medalColor}, ${medalDark})`,
          boxShadow: `0 2px 8px ${medalColor}66`,
        }}>
        <Medal size={10} color="#0D0D0D" />
        <span className="text-[10px] font-bold tabular-nums" style={{ color: '#0D0D0D' }}>{slot + 1}</span>
      </div>

      {editMode && (
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <button type="button" onClick={onPick}
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.7)', color: '#C9A84C' }} aria-label="Change">
            <Pencil size={11} />
          </button>
          <button type="button" onClick={onMoveUp}
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.7)', color: 'var(--soft)' }} aria-label="Move up">
            <ChevronRight size={12} style={{ transform: 'rotate(-90deg)' }} />
          </button>
          <button type="button" onClick={onMoveDown}
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.7)', color: 'var(--soft)' }} aria-label="Move down">
            <ChevronRight size={12} style={{ transform: 'rotate(90deg)' }} />
          </button>
          <button type="button" onClick={onRemove}
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.7)', color: 'var(--danger)' }} aria-label="Remove">
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  )
}

function SectionHeader({ title, icon: Icon }: { title: string; icon?: typeof Trophy }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {Icon && <Icon size={13} color="var(--dim)" />}
      <p className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: 'var(--muted)' }}>{title}</p>
    </div>
  )
}

function QuickStat({
  icon: Icon, label, value, unit, sub, accent, big,
}: {
  icon: typeof Trophy
  label: string
  value: number | string
  unit?: string
  sub?: string
  accent: string
  big?: boolean
}) {
  return (
    <div className="rounded-2xl p-3.5 relative overflow-hidden" style={{ background: 'var(--surface)' }}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon size={12} color={accent} />
        <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{label}</p>
      </div>
      <div className="flex items-baseline gap-1">
        <p className={big ? 'text-base font-bold truncate' : 'text-2xl font-bold leading-none tabular-nums'}
           style={{ color: 'var(--text)' }}>
          {value}
        </p>
        {unit && (
          <span className="text-[10px]" style={{ color: 'var(--dim)' }}>{unit}</span>
        )}
      </div>
      {sub && (
        <p className="text-[10px] mt-1 truncate" style={{ color: 'var(--faint)' }}>{sub}</p>
      )}
      <div
        className="absolute right-0 top-0 bottom-0 w-1 rounded-l-full"
        style={{ background: accent, opacity: 0.6 }}
      />
    </div>
  )
}
