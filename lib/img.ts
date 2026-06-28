/**
 * Poster image helpers — shrink remote poster URLs to the size actually rendered.
 *
 * Covers in this app come from two sources and are stored as full-size URLs:
 *   - TMDB  (image.tmdb.org/t/p/w500/…)  — trending + tmdb-details
 *   - IMDb  (m.media-amazon.com/…)       — IMDb search
 *
 * Loading w500 (or Amazon originals) into a 3–4 column phone grid wastes a lot of
 * bandwidth. These helpers rewrite the URL to request a smaller variant so mobile
 * loads stay light. Anything we don't recognise is returned untouched.
 */

export type TmdbSize = 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original'

/** Rewrite a TMDB image URL to a given width bucket. */
function resizeTmdb(url: string, size: TmdbSize): string {
  // .../t/p/<size>/<path> — swap the size segment.
  return url.replace(/(\/t\/p\/)(w\d+|original)(\/)/, `$1${size}$3`)
}

/** Rewrite an Amazon/IMDb poster URL to a target width (best effort). */
function resizeAmazon(url: string, width: number): string {
  // m.media-amazon.com URLs accept a "._V1_SX<width>_" image-processing token
  // inserted before the extension. Replace any existing token, else add one.
  if (/\._V1_.*?\.(jpg|jpeg|png)$/i.test(url)) {
    return url.replace(/\._V1_.*?(\.(?:jpg|jpeg|png))$/i, `._V1_SX${width}_$1`)
  }
  return url.replace(/(\.(?:jpg|jpeg|png))$/i, `._V1_SX${width}_$1`)
}

/**
 * Return a poster URL sized for the rendered slot.
 * `tmdbSize` is the TMDB bucket; `amazonWidth` is the matching pixel width for
 * Amazon/IMDb posters (defaults to a sensible value derived from the bucket).
 */
export function posterSrc(
  url: string | null | undefined,
  tmdbSize: TmdbSize = 'w342',
  amazonWidth?: number,
): string {
  if (!url) return ''
  if (url.includes('image.tmdb.org')) return resizeTmdb(url, tmdbSize)
  if (url.includes('media-amazon.com')) {
    const w = amazonWidth ?? (Number(tmdbSize.replace('w', '')) || 342)
    return resizeAmazon(url, w)
  }
  return url
}
