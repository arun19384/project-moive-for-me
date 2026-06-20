import type { ShelfItem } from '@/lib/shelf'
import type { TitleDetail } from '@/lib/title'
import type { WatchlistItem } from '@/lib/watchlist'
import type { StatsData } from '@/lib/stats'

export type StorageMode = 'guest' | 'signed-in'

export type AddInput = {
  title: string
  type: 'movie' | 'series' | 'anime'
  rating: number | null
  watchedDate: string | null
  platform: string | null
  notes: string | null
  coverUrl: string | null
  releaseYear: number | null
}

export type TitlePatch = {
  title?: string
  type?: 'movie' | 'series' | 'anime'
  coverUrl?: string | null
  releaseYear?: number | null
  totalEpisodes?: number | null
  entryId?: number | null
  rating?: number | null
  watchedDate?: string | null
  platform?: string | null
  notes?: string | null
}

export type WatchlistAddInput = {
  title: string
  type: 'movie' | 'series' | 'anime'
  coverUrl: string | null
  releaseYear: number | null
}

export interface Storage {
  readonly mode: StorageMode

  getShelf(): Promise<ShelfItem[]>
  getTitleDetail(id: number): Promise<TitleDetail>
  addEntry(input: AddInput): Promise<void>
  updateTitle(titleId: number, patch: TitlePatch): Promise<void>
  deleteTitle(titleId: number): Promise<void>
  deleteEntry(entryId: number): Promise<void>

  getWatchlist(): Promise<WatchlistItem[]>
  addToWatchlist(input: WatchlistAddInput): Promise<WatchlistItem>
  removeFromWatchlist(id: number): Promise<void>

  getStats(): Promise<StatsData>
}

export type { ShelfItem, TitleDetail, WatchlistItem, StatsData }
