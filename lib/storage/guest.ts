import type { Storage, AddInput, TitlePatch, WatchlistAddInput, ShelfItem, TitleDetail, WatchlistItem, StatsData } from './types'
import { computeStats } from '@/lib/stats'

const KEY = {
  titles: 'dy:guest:titles',
  entries: 'dy:guest:entries',
  watchlist: 'dy:guest:watchlist',
} as const

type GuestTitle = {
  id: number
  title: string
  type: 'movie' | 'series' | 'anime'
  coverUrl: string | null
  releaseYear: number | null
  totalEpisodes: number | null
  description: string | null
  originalTitle: string | null
  createdAt: string
}

type GuestEntry = {
  id: number
  titleId: number
  rating: number | null
  watchedDate: string | null
  platform: string | null
  notes: string | null
  rewatch: boolean
  createdAt: string
}

type GuestWatchlistItem = {
  id: number
  title: string
  type: 'movie' | 'series' | 'anime'
  coverUrl: string | null
  releaseYear: number | null
  addedAt: string
}

function read<T>(key: string): T[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T[]) : []
  } catch {
    return []
  }
}

function write<T>(key: string, data: T[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(data))
}

function nextId(existing: { id: number }[]): number {
  // Negative IDs so they never collide with server autoincrement IDs after migration
  const min = existing.reduce((m, x) => Math.min(m, x.id), 0)
  return min < 0 ? min - 1 : -1
}

export const guestStorage: Storage = {
  mode: 'guest',

  async getShelf(): Promise<ShelfItem[]> {
    const titles = read<GuestTitle>(KEY.titles)
    const entries = read<GuestEntry>(KEY.entries)

    const entryMap = new Map<number, GuestEntry>()
    for (const e of entries) {
      const existing = entryMap.get(e.titleId)
      if (!existing || e.createdAt > existing.createdAt) entryMap.set(e.titleId, e)
    }

    return titles
      .filter((t) => entryMap.has(t.id))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((t) => {
        const e = entryMap.get(t.id)!
        return {
          id: t.id,
          title: t.title,
          type: t.type,
          coverUrl: t.coverUrl,
          createdAt: t.createdAt,
          genres: [],
          entry: {
            id: e.id,
            rating: e.rating,
            watchedDate: e.watchedDate,
            platform: e.platform,
            createdAt: e.createdAt,
          },
        }
      })
  },

  async getTitleDetail(id): Promise<TitleDetail> {
    const titles = read<GuestTitle>(KEY.titles)
    const entries = read<GuestEntry>(KEY.entries)
    const t = titles.find((x) => x.id === id)
    if (!t) return null
    const e = entries
      .filter((x) => x.titleId === id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null
    if (!e) return null
    return {
      id: t.id,
      title: t.title,
      originalTitle: t.originalTitle,
      type: t.type,
      coverUrl: t.coverUrl,
      releaseYear: t.releaseYear,
      totalEpisodes: t.totalEpisodes,
      description: t.description,
      createdAt: t.createdAt,
      entry: {
        id: e.id,
        rating: e.rating,
        watchedDate: e.watchedDate,
        platform: e.platform,
        notes: e.notes,
        rewatch: e.rewatch,
        createdAt: e.createdAt,
      },
      genres: [],
    }
  },

  async addEntry(input: AddInput) {
    const titles = read<GuestTitle>(KEY.titles)
    const entries = read<GuestEntry>(KEY.entries)
    const now = new Date().toISOString()

    const titleId = nextId(titles)
    titles.push({
      id: titleId,
      title: input.title,
      type: input.type,
      coverUrl: input.coverUrl,
      releaseYear: input.releaseYear,
      totalEpisodes: null,
      description: null,
      originalTitle: null,
      createdAt: now,
    })

    const entryId = nextId(entries)
    entries.push({
      id: entryId,
      titleId,
      rating: input.rating,
      watchedDate: input.watchedDate,
      platform: input.platform,
      notes: input.notes,
      rewatch: false,
      createdAt: now,
    })

    write(KEY.titles, titles)
    write(KEY.entries, entries)
  },

  async updateTitle(titleId, patch: TitlePatch) {
    const titles = read<GuestTitle>(KEY.titles)
    const entries = read<GuestEntry>(KEY.entries)
    const t = titles.find((x) => x.id === titleId)
    if (t) {
      if (patch.title !== undefined) t.title = patch.title
      if (patch.type !== undefined) t.type = patch.type
      if (patch.coverUrl !== undefined) t.coverUrl = patch.coverUrl
      if (patch.releaseYear !== undefined) t.releaseYear = patch.releaseYear
      if (patch.totalEpisodes !== undefined) t.totalEpisodes = patch.totalEpisodes
    }
    if (patch.entryId != null) {
      const e = entries.find((x) => x.id === patch.entryId)
      if (e) {
        if (patch.rating !== undefined) e.rating = patch.rating
        if (patch.watchedDate !== undefined) e.watchedDate = patch.watchedDate
        if (patch.platform !== undefined) e.platform = patch.platform
        if (patch.notes !== undefined) e.notes = patch.notes
      }
    }
    write(KEY.titles, titles)
    write(KEY.entries, entries)
  },

  async deleteTitle(titleId) {
    // Guest mode: delete the title and all its entries (no shared catalog locally).
    const titles = read<GuestTitle>(KEY.titles).filter((t) => t.id !== titleId)
    const entries = read<GuestEntry>(KEY.entries).filter((e) => e.titleId !== titleId)
    write(KEY.titles, titles)
    write(KEY.entries, entries)
  },

  async deleteEntry(entryId) {
    const entries = read<GuestEntry>(KEY.entries)
    const entry = entries.find((e) => e.id === entryId)
    const remaining = entries.filter((e) => e.id !== entryId)
    write(KEY.entries, remaining)
    // If no more entries reference this title, drop the title too (guest only)
    if (entry && !remaining.some((e) => e.titleId === entry.titleId)) {
      const titles = read<GuestTitle>(KEY.titles).filter((t) => t.id !== entry.titleId)
      write(KEY.titles, titles)
    }
  },

  async getWatchlist(): Promise<WatchlistItem[]> {
    const items = read<GuestWatchlistItem>(KEY.watchlist)
    // Guest IDs are negative and decrement, so the newest item has the smallest id.
    // Sort ascending by id to keep newest-first, matching the signed-in ordering.
    return [...items].sort((a, b) => a.id - b.id || b.addedAt.localeCompare(a.addedAt))
  },

  async addToWatchlist(input: WatchlistAddInput): Promise<WatchlistItem> {
    const items = read<GuestWatchlistItem>(KEY.watchlist)
    const id = nextId(items)
    const item: GuestWatchlistItem = {
      id,
      title: input.title,
      type: input.type,
      coverUrl: input.coverUrl,
      releaseYear: input.releaseYear,
      addedAt: new Date().toISOString().slice(0, 10),
    }
    items.unshift(item)
    write(KEY.watchlist, items)
    return item
  },

  async removeFromWatchlist(id) {
    const items = read<GuestWatchlistItem>(KEY.watchlist).filter((i) => i.id !== id)
    write(KEY.watchlist, items)
  },

  async getStats(): Promise<StatsData> {
    const titles = read<GuestTitle>(KEY.titles)
    const entries = read<GuestEntry>(KEY.entries)
    return computeStats(entries, titles)
  },
}

export const GUEST_KEYS = KEY

export function hasGuestData(): boolean {
  if (typeof window === 'undefined') return false
  return (
    read<GuestTitle>(KEY.titles).length > 0 ||
    read<GuestWatchlistItem>(KEY.watchlist).length > 0
  )
}

export function readAllGuestData() {
  return {
    titles: read<GuestTitle>(KEY.titles),
    entries: read<GuestEntry>(KEY.entries),
    watchlist: read<GuestWatchlistItem>(KEY.watchlist),
  }
}

export function clearGuestData() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(KEY.titles)
  window.localStorage.removeItem(KEY.entries)
  window.localStorage.removeItem(KEY.watchlist)
}
