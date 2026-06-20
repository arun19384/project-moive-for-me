import { NextResponse } from 'next/server'

const TMDB_BASE = 'https://api.themoviedb.org/3'
const IMG_BASE = 'https://image.tmdb.org/t/p/w500'

type TrendingItem = {
  tmdbId: number
  title: string
  type: 'movie' | 'series' | 'anime'
  year: number | null
  poster: string | null
  overview: string
  rating: number
}

function yearFromDate(date?: string | null): number | null {
  if (!date) return null
  const y = Number(date.slice(0, 4))
  return Number.isFinite(y) ? y : null
}

async function fetchJson(url: string) {
  const res = await fetch(url, { next: { revalidate: 60 * 60 } }) // cache 1 hour
  if (!res.ok) return null
  return res.json()
}

export async function GET() {
  const key = process.env.TMDB_API_KEY
  if (!key) {
    return NextResponse.json({ error: 'TMDB_API_KEY not set' }, { status: 500 })
  }

  try {
    const [movies, series, anime] = await Promise.all([
      fetchJson(`${TMDB_BASE}/trending/movie/week?api_key=${key}`),
      fetchJson(`${TMDB_BASE}/trending/tv/week?api_key=${key}`),
      // Anime = animated TV with Japanese original language, sorted by popularity
      fetchJson(`${TMDB_BASE}/discover/tv?api_key=${key}&with_genres=16&with_original_language=ja&sort_by=popularity.desc`),
    ])

    const items: TrendingItem[] = []

    for (const m of movies?.results?.slice(0, 12) ?? []) {
      items.push({
        tmdbId: m.id,
        title: m.title,
        type: 'movie',
        year: yearFromDate(m.release_date),
        poster: m.poster_path ? IMG_BASE + m.poster_path : null,
        overview: m.overview ?? '',
        rating: m.vote_average ?? 0,
      })
    }

    // Get anime TMDB IDs to exclude from series list
    const animeIds = new Set<number>((anime?.results ?? []).map((a: { id: number }) => a.id))

    for (const s of series?.results?.slice(0, 12) ?? []) {
      if (animeIds.has(s.id)) continue
      items.push({
        tmdbId: s.id,
        title: s.name,
        type: 'series',
        year: yearFromDate(s.first_air_date),
        poster: s.poster_path ? IMG_BASE + s.poster_path : null,
        overview: s.overview ?? '',
        rating: s.vote_average ?? 0,
      })
    }

    for (const a of anime?.results?.slice(0, 12) ?? []) {
      items.push({
        tmdbId: a.id,
        title: a.name,
        type: 'anime',
        year: yearFromDate(a.first_air_date),
        poster: a.poster_path ? IMG_BASE + a.poster_path : null,
        overview: a.overview ?? '',
        rating: a.vote_average ?? 0,
      })
    }

    return NextResponse.json(items)
  } catch {
    return NextResponse.json([])
  }
}
