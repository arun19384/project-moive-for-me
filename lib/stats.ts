import { db } from './db'
import { titles, watchEntries } from './schema'
import { eq, inArray } from 'drizzle-orm'

export type StatsTopItem = { id: number; title: string; type: string; coverUrl: string | null; rating: number }
export type StatsRecentItem = { id: number; title: string; type: string; coverUrl: string | null; rating: number | null; watchedDate: string | null }

export type StatsData = {
  totalWatched: number
  avgRating: number
  thisMonthCount: number
  hoursSpent: number
  byGenre: { name: string; count: number }[]
  typeCounts: { movie: number; series: number; anime: number }
  avgRatingByType: { movie: number; series: number; anime: number }
  topRated: StatsTopItem[]
  recent: StatsRecentItem[]
  topPlatform: string | null
  activity: { date: string; count: number }[]
  bestMonth: { month: string; count: number } | null
  month: string
  ratingDist: { rating: number; count: number }[]
  currentStreak: number
  monthlyTrend: { month: string; count: number }[]
  milestone: { current: number; next: number }
}

type EntryLike = {
  id: number
  titleId: number
  rating: number | null
  watchedDate: string | null
  platform: string | null
  createdAt: string | null
}

type TitleLike = {
  id: number
  title: string
  type: 'movie' | 'series' | 'anime'
  coverUrl: string | null
  totalEpisodes: number | null
}

export function computeStats(allEntries: EntryLike[], allTitles: TitleLike[]): StatsData {
  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const totalWatched = allEntries.length
  const rated = allEntries.filter((e) => e.rating != null)
  const avgRating = rated.length > 0
    ? Math.round((rated.reduce((s, e) => s + (e.rating ?? 0), 0) / rated.length) * 10) / 10
    : 0

  const thisMonthCount = allEntries.filter((e) => e.watchedDate?.startsWith(thisMonth)).length

  const titleMap = new Map(allTitles.map((t) => [t.id, t]))

  let hoursSpent = 0
  for (const e of allEntries) {
    const t = titleMap.get(e.titleId)
    if (!t) continue
    if (t.type === 'movie') hoursSpent += 2
    else if (t.type === 'series' || t.type === 'anime') hoursSpent += (t.totalEpisodes ?? 12) * 0.75
  }

  const typeCounts = { movie: 0, series: 0, anime: 0 }
  for (const e of allEntries) {
    const t = titleMap.get(e.titleId)
    if (t && t.type in typeCounts) typeCounts[t.type as keyof typeof typeCounts]++
  }

  const typeRatings: Record<string, { sum: number; count: number }> = {
    movie: { sum: 0, count: 0 }, series: { sum: 0, count: 0 }, anime: { sum: 0, count: 0 },
  }
  for (const e of allEntries) {
    if (e.rating == null) continue
    const t = titleMap.get(e.titleId)
    if (!t) continue
    typeRatings[t.type].sum += e.rating
    typeRatings[t.type].count++
  }
  const avgRatingByType = {
    movie: typeRatings.movie.count > 0 ? Math.round((typeRatings.movie.sum / typeRatings.movie.count) * 10) / 10 : 0,
    series: typeRatings.series.count > 0 ? Math.round((typeRatings.series.sum / typeRatings.series.count) * 10) / 10 : 0,
    anime: typeRatings.anime.count > 0 ? Math.round((typeRatings.anime.sum / typeRatings.anime.count) * 10) / 10 : 0,
  }

  const entryRatings = new Map<number, number>()
  for (const e of allEntries) {
    if (e.rating != null) {
      const prev = entryRatings.get(e.titleId) ?? 0
      if (e.rating > prev) entryRatings.set(e.titleId, e.rating)
    }
  }
  const topRated: StatsTopItem[] = [...entryRatings.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([titleId, rating]) => {
      const t = titleMap.get(titleId)!
      return { id: titleId, title: t.title, type: t.type, coverUrl: t.coverUrl, rating }
    })

  const sortedEntries = [...allEntries].sort((a, b) =>
    (b.watchedDate ?? b.createdAt ?? '').localeCompare(a.watchedDate ?? a.createdAt ?? '')
  )
  const recent: StatsRecentItem[] = sortedEntries.slice(0, 5).map((e) => {
    const t = titleMap.get(e.titleId)!
    return { id: t.id, title: t.title, type: t.type, coverUrl: t.coverUrl, rating: e.rating, watchedDate: e.watchedDate }
  })

  const platformCounts: Record<string, number> = {}
  for (const e of allEntries) {
    if (e.platform) platformCounts[e.platform] = (platformCounts[e.platform] ?? 0) + 1
  }
  const topPlatform = Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  const activity: { date: string; count: number }[] = []
  const dateCounts: Record<string, number> = {}
  for (const e of allEntries) {
    if (e.watchedDate) dateCounts[e.watchedDate] = (dateCounts[e.watchedDate] ?? 0) + 1
  }
  for (let i = 89; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    activity.push({ date: key, count: dateCounts[key] ?? 0 })
  }

  const monthCounts: Record<string, number> = {}
  for (const e of allEntries) {
    if (!e.watchedDate) continue
    const m = e.watchedDate.slice(0, 7)
    monthCounts[m] = (monthCounts[m] ?? 0) + 1
  }
  const bestMonthEntry = Object.entries(monthCounts).sort((a, b) => b[1] - a[1])[0]
  const bestMonth = bestMonthEntry ? { month: bestMonthEntry[0], count: bestMonthEntry[1] } : null

  const ratingBuckets: Record<number, number> = {}
  for (let i = 1; i <= 10; i++) ratingBuckets[i] = 0
  for (const e of allEntries) {
    if (e.rating != null && e.rating >= 1 && e.rating <= 10) ratingBuckets[e.rating]++
  }
  const ratingDist = Array.from({ length: 10 }, (_, i) => ({ rating: i + 1, count: ratingBuckets[i + 1] }))

  const todayStr = now.toISOString().slice(0, 10)
  const yesterdayStr = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString().slice(0, 10)
  const watchedDays = new Set(allEntries.map((e) => e.watchedDate).filter(Boolean) as string[])
  let currentStreak = 0
  const startDay = watchedDays.has(todayStr) ? todayStr : (watchedDays.has(yesterdayStr) ? yesterdayStr : null)
  if (startDay) {
    const cursor = new Date(startDay)
    while (watchedDays.has(cursor.toISOString().slice(0, 10))) {
      currentStreak++
      cursor.setDate(cursor.getDate() - 1)
    }
  }

  const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    return {
      month: d.toLocaleString('en-US', { month: 'short' }),
      count: allEntries.filter((e) => e.watchedDate?.startsWith(key)).length,
    }
  })

  const MILESTONES = [10, 25, 50, 100, 200, 500, 1000]
  const nextMilestone = MILESTONES.find((m) => m > totalWatched) ?? 1000
  const milestone = { current: totalWatched, next: nextMilestone }

  return {
    totalWatched,
    avgRating,
    thisMonthCount,
    hoursSpent: Math.round(hoursSpent),
    byGenre: [],
    typeCounts,
    avgRatingByType,
    topRated,
    recent,
    topPlatform,
    activity,
    bestMonth,
    month: now.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
    ratingDist,
    currentStreak,
    monthlyTrend,
    milestone,
  }
}

export async function getStats(userId: string): Promise<StatsData> {
  const allEntries = await db
    .select()
    .from(watchEntries)
    .where(eq(watchEntries.userId, userId))

  const titleIds = [...new Set(allEntries.map((e) => e.titleId))]
  const allTitles = titleIds.length > 0
    ? await db.select().from(titles).where(inArray(titles.id, titleIds))
    : []

  return computeStats(allEntries, allTitles)
}
