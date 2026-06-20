import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get('q')
  if (!q || q.trim().length < 2) return NextResponse.json([])

  try {
    const res = await fetch(`https://imdb.iamidiotareyoutoo.com/search?q=${encodeURIComponent(q)}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return NextResponse.json([])
    const data = await res.json()
    if (!data.ok || !Array.isArray(data.description)) return NextResponse.json([])

    const results = data.description.slice(0, 8).map((item: Record<string, unknown>) => ({
      imdbId: item['#IMDB_ID'],
      title: item['#TITLE'],
      year: item['#YEAR'],
      poster: item['#IMG_POSTER'] ?? null,
      actors: item['#ACTORS'] ?? null,
    }))

    return NextResponse.json(results)
  } catch {
    return NextResponse.json([])
  }
}
