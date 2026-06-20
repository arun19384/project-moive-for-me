import {
  Trophy, Award, Star, Swords, Crown, Moon, Hourglass, Sparkles, Ship, Shield, Skull, Snowflake, Triangle, Mountain,
  Flame, Heart, Zap, Wand2, Glasses, Trees, Eye, Rocket, Bomb, Car, Compass, Gem, Hand, Drama, Atom, Sun, Ghost,
  type LucideIcon,
} from 'lucide-react'

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary'

export type DisplayBadge = {
  id: string
  name: string
  icon: LucideIcon
  rarity: Rarity
}

export const RARITY_COLOR: Record<Rarity, string> = {
  common: '#888888',
  rare: '#7FB5FF',
  epic: '#C97FFF',
  legendary: '#C9A84C',
}

export const RARITY_ORDER: Record<Rarity, number> = {
  legendary: 0, epic: 1, rare: 2, common: 3,
}

export const ICON_MAP: Record<string, LucideIcon> = {
  Trophy, Award, Star, Swords, Crown, Moon, Hourglass, Sparkles, Ship, Shield, Skull,
  Snowflake, Triangle, Mountain, Flame, Heart, Zap, Wand2, Glasses, Trees, Eye, Rocket,
  Bomb, Car, Compass, Gem, Hand, Drama, Atom, Sun, Ghost,
}

export function resolveIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Trophy
}

export const BADGE_STORAGE_KEY = 'dy:badge'
