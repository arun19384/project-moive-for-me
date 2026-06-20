import { NextRequest, NextResponse } from 'next/server'

const TMDB_BASE = 'https://api.themoviedb.org/3'
const IMG_BASE = 'https://image.tmdb.org/t/p/w500'
const PROFILE_BASE = 'https://image.tmdb.org/t/p/w185'
const PROVIDER_LOGO_BASE = 'https://image.tmdb.org/t/p/w92'

type CastMember = {
  name: string
  character: string
  profile: string | null
}

type Provider = { name: string; logo: string | null }

type WatchProviders = {
  region: string
  link: string | null
  flatrate: Provider[]
  rent: Provider[]
  buy: Provider[]
} | null

type TmdbDetails = {
  tmdbId: number
  overview: string
  genres: string[]
  cast: CastMember[]
  runtime: number | null
  poster: string | null
  rating: number | null
  year: number | null
  trailerKey: string | null
  thaiReleaseDate: string | null
  watchProviders: WatchProviders
}

type TmdbReleaseDate = {
  type: number
  release_date: string
  note?: string
}

function pickThaiRelease(releaseDates: { results?: { iso_3166_1: string; release_dates: TmdbReleaseDate[] }[] } | undefined): string | null {
  const th = releaseDates?.results?.find(r => r.iso_3166_1 === 'TH')
  if (!th?.release_dates?.length) return null
  const theatrical = th.release_dates.find(d => d.type === 3) ?? th.release_dates.find(d => d.type === 2)
  return (theatrical ?? th.release_dates[0])?.release_date ?? null
}

type TmdbVideo = {
  key: string
  site: string
  type: string
  official: boolean
  published_at?: string
}

function pickTrailer(videos: TmdbVideo[] | undefined): string | null {
  if (!videos?.length) return null
  const yt = videos.filter(v => v.site === 'YouTube')
  const trailers = yt.filter(v => v.type === 'Trailer')
  const official = trailers.find(v => v.official)
  return (official ?? trailers[0] ?? yt[0])?.key ?? null
}

type TmdbProvider = { provider_name: string; logo_path: string | null }
type RegionProviders = { link?: string; flatrate?: TmdbProvider[]; rent?: TmdbProvider[]; buy?: TmdbProvider[] }

function mapProviders(list: TmdbProvider[] | undefined): Provider[] {
  return (list ?? []).map((p) => ({
    name: p.provider_name,
    logo: p.logo_path ? PROVIDER_LOGO_BASE + p.logo_path : null,
  }))
}

// Prefer Thailand availability, fall back to US
function pickProviders(wp: { results?: Record<string, RegionProviders> } | undefined): WatchProviders {
  const results = wp?.results
  if (!results) return null
  const region = results.TH ? 'TH' : results.US ? 'US' : null
  if (!region) return null
  const data = results[region]
  const flatrate = mapProviders(data.flatrate)
  const rent = mapProviders(data.rent)
  const buy = mapProviders(data.buy)
  if (!flatrate.length && !rent.length && !buy.length) return null
  return { region, link: data.link ?? null, flatrate, rent, buy }
}

async function fetchJson(url: string) {
  const res = await fetch(url, { next: { revalidate: 60 * 60 * 24 } })
  if (!res.ok) return null
  return res.json()
}

export async function GET(req: NextRequest) {
  const key = process.env.TMDB_API_KEY
  if (!key) return NextResponse.json({ error: 'TMDB_API_KEY not set' }, { status: 500 })

  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title')?.trim()
  const year = searchParams.get('year')
  const type = searchParams.get('type') ?? 'movie'
  if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 })

  const isMovie = type === 'movie'
  const searchPath = isMovie ? 'search/movie' : 'search/tv'
  const yearParam = year ? `&${isMovie ? 'year' : 'first_air_date_year'}=${year}` : ''

  try {
    const search = await fetchJson(
      `${TMDB_BASE}/${searchPath}?api_key=${key}&query=${encodeURIComponent(title)}${yearParam}&include_adult=false`
    )
    const first = search?.results?.[0]
    if (!first) return NextResponse.json(null)

    const detailsPath = isMovie ? `movie/${first.id}` : `tv/${first.id}`
    const details = await fetchJson(
      `${TMDB_BASE}/${detailsPath}?api_key=${key}&append_to_response=credits,videos,release_dates,watch/providers`
    )
    if (!details) return NextResponse.json(null)

    const cast: CastMember[] = (details.credits?.cast ?? []).slice(0, 10).map((c: {
      name: string; character?: string; profile_path: string | null
    }) => ({
      name: c.name,
      character: c.character ?? '',
      profile: c.profile_path ? PROFILE_BASE + c.profile_path : null,
    }))

    const result: TmdbDetails = {
      tmdbId: first.id,
      overview: details.overview ?? '',
      genres: (details.genres ?? []).map((g: { name: string }) => g.name),
      cast,
      runtime: isMovie ? (details.runtime ?? null) : (details.episode_run_time?.[0] ?? null),
      poster: details.poster_path ? IMG_BASE + details.poster_path : null,
      rating: details.vote_average ?? null,
      year: isMovie
        ? Number(details.release_date?.slice(0, 4)) || null
        : Number(details.first_air_date?.slice(0, 4)) || null,
      trailerKey: pickTrailer(details.videos?.results),
      thaiReleaseDate: isMovie ? pickThaiRelease(details.release_dates) : null,
      watchProviders: pickProviders(details['watch/providers']),
    }

    return NextResponse.json(result)
  } catch {
    return NextResponse.json(null)
  }
}
