export type Provider = { name: string; logo: string | null }

export type WatchProvidersData = {
  region: string
  link: string | null
  flatrate: Provider[]
  rent: Provider[]
  buy: Provider[]
} | null

const REGION_LABEL: Record<string, string> = { TH: 'ในไทย', US: 'ในสหรัฐฯ' }

function Logo({ p }: { p: Provider }) {
  return p.logo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={p.logo} alt={p.name} title={p.name}
      className="w-9 h-9 rounded-lg object-cover shrink-0"
      style={{ border: '1px solid var(--border)' }} />
  ) : (
    <div title={p.name}
      className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-bold"
      style={{ background: 'var(--surface)', color: 'var(--faint)', border: '1px solid var(--border)' }}>
      {p.name.slice(0, 2)}
    </div>
  )
}

/** Wraps a logo in a link to the JustWatch page when one is available. */
function LogoLink({ p, link }: { p: Provider; link: string | null }) {
  if (!link) return <Logo p={p} />
  return (
    <a href={link} target="_blank" rel="noopener noreferrer"
      title={`ดู ${p.name} →`}
      className="shrink-0 transition-opacity hover:opacity-80">
      <Logo p={p} />
    </a>
  )
}

function Row({ label, items, link }: { label: string; items: Provider[]; link: string | null }) {
  if (items.length === 0) return null
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[11px] w-10 shrink-0" style={{ color: 'var(--dim)' }}>{label}</span>
      <div className="flex gap-1.5 flex-wrap">
        {items.map((p) => <LogoLink key={p.name} p={p} link={link} />)}
      </div>
    </div>
  )
}

/**
 * Renders TMDB/JustWatch streaming availability.
 * `compact` shows only streaming logos in a single row (for tight spaces like the random-pick modal).
 */
export default function WhereToWatch({ providers, compact = false }: { providers: WatchProvidersData; compact?: boolean }) {
  if (!providers) return null
  const { flatrate, rent, buy, link, region } = providers

  if (compact) {
    const top = flatrate.length ? flatrate : rent.length ? rent : buy
    if (top.length === 0) return null
    return (
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {top.slice(0, 6).map((p) => <LogoLink key={p.name} p={p} link={link} />)}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>
          ดูได้ที่ {REGION_LABEL[region] ?? region}
        </span>
        {link && (
          <a href={link} target="_blank" rel="noopener noreferrer"
            className="text-[11px]" style={{ color: '#C9A84C' }}>
            ดูทั้งหมด →
          </a>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Row label="สตรีม" items={flatrate} link={link} />
        <Row label="เช่า" items={rent} link={link} />
        <Row label="ซื้อ" items={buy} link={link} />
      </div>
    </div>
  )
}
