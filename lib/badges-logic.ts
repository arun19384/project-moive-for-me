import type { Rarity } from './badges'
import type { SagaDef } from './sagas'
import { SAGAS, getSagaProgress } from './sagas'

export type BadgeRule = {
  id: string
  name: string
  desc: string
  iconName: string
  rarity: Rarity
  /** linked saga id — completing the saga unlocks the badge */
  sagaId?: string
}

export const BADGE_RULES: BadgeRule[] = [
  { id: 'first-watch', name: 'First Watch', desc: 'Logged your first title', iconName: 'Star', rarity: 'common' },
  { id: 'century-club', name: 'Century Club', desc: 'Logged 100 watched titles', iconName: 'Trophy', rarity: 'legendary' },
  { id: 'fifty-club', name: 'Half Century', desc: 'Logged 50 watched titles', iconName: 'Award', rarity: 'epic' },
  { id: 'critic', name: 'Critic', desc: 'Rated 50 titles', iconName: 'Award', rarity: 'rare' },
  { id: 'on-fire', name: 'On Fire', desc: '7-day watch streak', iconName: 'Flame', rarity: 'rare' },
  { id: 'comfort-soul', name: 'Comfort Soul', desc: 'Rewatched a title 3+ times', iconName: 'Heart', rarity: 'common' },
  { id: 'generous-critic', name: 'Generous Critic', desc: 'Avg rating ≥ 8 across 20+ titles', iconName: 'Sparkles', rarity: 'rare' },
  { id: 'tough-crowd', name: 'Tough Crowd', desc: 'Avg rating ≤ 6 across 20+ titles', iconName: 'Sparkles', rarity: 'rare' },
  { id: 'anime-soul', name: 'Anime Soul', desc: 'Watched 25+ anime', iconName: 'Sparkles', rarity: 'epic' },
  { id: 'series-binger', name: 'Series Binger', desc: 'Watched 25+ series', iconName: 'Sparkles', rarity: 'epic' },
  { id: 'movie-buff', name: 'Movie Buff', desc: 'Watched 50+ movies', iconName: 'Sparkles', rarity: 'epic' },

  // Saga-linked
  ...SAGAS.map<BadgeRule>((s) => ({
    id: `saga-${s.id}`,
    name: s.reward,
    desc: `Completed ${s.title}`,
    iconName: s.iconName,
    rarity: sagaRarity(s),
    sagaId: s.id,
  })),
]

function sagaRarity(s: SagaDef): Rarity {
  if (s.items.length >= 10) return 'legendary'
  if (s.items.length >= 6) return 'epic'
  if (s.items.length >= 3) return 'rare'
  return 'common'
}

export type EntryLite = {
  titleId: number
  rating: number | null
  watchedDate: string | null
  createdAt: string | null
  rewatch: boolean | null
}

export type TitleLite = {
  id: number
  title: string
  type: 'movie' | 'series' | 'anime'
  releaseYear: number | null
}

export type ComputedBadge = {
  id: string
  name: string
  desc: string
  iconName: string
  rarity: Rarity
  unlocked: boolean
  /** ISO date when it unlocked (best estimate) */
  unlockedAt: string | null
  /** for saga-linked badges: { watched, total } */
  progress?: { current: number; target: number }
}

function streakLength(dates: string[]): number {
  if (dates.length === 0) return 0
  const set = new Set(dates)
  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400_000).toISOString().slice(0, 10)
  let cursor: string | null = set.has(today) ? today : set.has(yesterday) ? yesterday : null
  if (!cursor) return 0
  let count = 0
  while (cursor && set.has(cursor)) {
    count++
    const d: Date = new Date(cursor)
    d.setDate(d.getDate() - 1)
    cursor = d.toISOString().slice(0, 10)
  }
  return count
}

export function computeBadges(entries: EntryLite[], titles: TitleLite[]): ComputedBadge[] {
  const titleMap = new Map(titles.map((t) => [t.id, t]))
  const titleCounts = new Map<number, number>()
  for (const e of entries) titleCounts.set(e.titleId, (titleCounts.get(e.titleId) ?? 0) + 1)
  const uniqueWatchedCount = titleCounts.size
  const ratedCount = entries.filter((e) => e.rating != null).length
  const avgRating = ratedCount > 0
    ? entries.filter((e) => e.rating != null).reduce((s, e) => s + (e.rating ?? 0), 0) / ratedCount
    : 0
  const typeCounts = { movie: 0, series: 0, anime: 0 }
  for (const tid of titleCounts.keys()) {
    const t = titleMap.get(tid)
    if (t) typeCounts[t.type]++
  }
  const watchDates = entries.map((e) => e.watchedDate).filter((d): d is string => !!d)
  const streak = streakLength(watchDates)
  const rewatchedTitles = [...titleCounts.values()].filter((c) => c >= 3).length

  const sortedByDate = [...entries]
    .filter((e) => e.watchedDate || e.createdAt)
    .sort((a, b) => (a.watchedDate ?? a.createdAt ?? '').localeCompare(b.watchedDate ?? b.createdAt ?? ''))
  const firstEntryDate = sortedByDate[0]?.watchedDate ?? sortedByDate[0]?.createdAt?.slice(0, 10) ?? null
  const latestEntryDate = sortedByDate[sortedByDate.length - 1]?.watchedDate
    ?? sortedByDate[sortedByDate.length - 1]?.createdAt?.slice(0, 10)
    ?? null

  // Saga progress
  const userTitleRefs = [...titleCounts.keys()].map((id) => {
    const t = titleMap.get(id)
    return { title: t?.title ?? '', year: t?.releaseYear ?? null }
  })
  const sagaProgress = new Map<string, { watched: number; total: number; unlocked: boolean }>()
  for (const s of SAGAS) {
    sagaProgress.set(s.id, getSagaProgress(s, userTitleRefs))
  }

  return BADGE_RULES.map<ComputedBadge>((rule) => {
    let unlocked = false
    let unlockedAt: string | null = null
    let progress: { current: number; target: number } | undefined

    if (rule.sagaId) {
      const p = sagaProgress.get(rule.sagaId)
      if (p) {
        unlocked = p.unlocked
        progress = { current: p.watched, target: p.total }
        unlockedAt = unlocked ? latestEntryDate : null
      }
    } else {
      switch (rule.id) {
        case 'first-watch':
          unlocked = uniqueWatchedCount >= 1
          unlockedAt = firstEntryDate
          progress = { current: Math.min(1, uniqueWatchedCount), target: 1 }
          break
        case 'century-club':
          unlocked = uniqueWatchedCount >= 100
          progress = { current: uniqueWatchedCount, target: 100 }
          break
        case 'fifty-club':
          unlocked = uniqueWatchedCount >= 50
          progress = { current: uniqueWatchedCount, target: 50 }
          break
        case 'critic':
          unlocked = ratedCount >= 50
          progress = { current: ratedCount, target: 50 }
          break
        case 'on-fire':
          unlocked = streak >= 7
          progress = { current: streak, target: 7 }
          break
        case 'comfort-soul':
          unlocked = rewatchedTitles >= 1
          progress = { current: rewatchedTitles >= 1 ? 3 : 0, target: 3 }
          break
        case 'generous-critic':
          unlocked = ratedCount >= 20 && avgRating >= 8
          progress = { current: ratedCount, target: 20 }
          break
        case 'tough-crowd':
          unlocked = ratedCount >= 20 && avgRating <= 6
          progress = { current: ratedCount, target: 20 }
          break
        case 'anime-soul':
          unlocked = typeCounts.anime >= 25
          progress = { current: typeCounts.anime, target: 25 }
          break
        case 'series-binger':
          unlocked = typeCounts.series >= 25
          progress = { current: typeCounts.series, target: 25 }
          break
        case 'movie-buff':
          unlocked = typeCounts.movie >= 50
          progress = { current: typeCounts.movie, target: 50 }
          break
      }
      if (unlocked && !unlockedAt) unlockedAt = latestEntryDate
    }

    return {
      id: rule.id,
      name: rule.name,
      desc: rule.desc,
      iconName: rule.iconName,
      rarity: rule.rarity,
      unlocked,
      unlockedAt,
      progress,
    }
  })
}
