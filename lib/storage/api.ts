import type { Storage, AddInput, TitlePatch, WatchlistAddInput, ShelfItem, TitleDetail, WatchlistItem, StatsData } from './types'

async function jsonOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`)
  return res.json() as Promise<T>
}

export const apiStorage: Storage = {
  mode: 'signed-in',

  async getShelf() {
    return jsonOrThrow<ShelfItem[]>(await fetch('/api/titles'))
  },

  async getTitleDetail(id) {
    const res = await fetch(`/api/titles/${id}`)
    if (res.status === 404) return null
    return jsonOrThrow<TitleDetail>(res)
  },

  async addEntry(input: AddInput) {
    const res = await fetch('/api/titles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...input, genreIds: input.genreIds || [] }),
    })
    if (!res.ok) throw new Error('failed to add entry')
  },

  async updateTitle(titleId, patch: TitlePatch) {
    const res = await fetch(`/api/titles/${titleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    if (!res.ok) throw new Error('update failed')
  },

  async deleteTitle(titleId) {
    await fetch(`/api/titles/${titleId}`, { method: 'DELETE' })
  },

  async deleteEntry(entryId) {
    await fetch(`/api/entries/${entryId}`, { method: 'DELETE' })
  },

  async getWatchlist() {
    return jsonOrThrow<WatchlistItem[]>(await fetch('/api/watchlist'))
  },

  async addToWatchlist(input: WatchlistAddInput) {
    const res = await fetch('/api/watchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    return jsonOrThrow<WatchlistItem>(res)
  },

  async removeFromWatchlist(id) {
    await fetch(`/api/watchlist/${id}`, { method: 'DELETE' })
  },

  async getStats() {
    return jsonOrThrow<StatsData>(await fetch('/api/stats'))
  },
}
