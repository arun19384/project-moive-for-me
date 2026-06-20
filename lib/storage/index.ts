import { apiStorage } from './api'
import { guestStorage } from './guest'
import type { Storage, StorageMode } from './types'

export function getStorage(mode: StorageMode): Storage {
  return mode === 'guest' ? guestStorage : apiStorage
}

export { apiStorage, guestStorage }
export type { Storage, StorageMode } from './types'
export type { AddInput, TitlePatch, WatchlistAddInput } from './types'
export { hasGuestData, readAllGuestData, clearGuestData, GUEST_KEYS } from './guest'
