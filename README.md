# Do Young (ดูยัง?) 🎬

> **your watched shelf**

A personal movie, series, and anime tracking web app — like Letterboxd, built mobile-first with a dark gold theme. Log what you've watched, rate it 1–10, browse trending titles, curate your Top 10 of life, hunt for saga collection badges, and see your stats over time.

---

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Redirects to `/shelf`.

---

## Environment Variables

`.env.local` (gitignored):

```env
# TiDB Serverless connection string (mysql:// over HTTP)
DATABASE_URL=mysql://<user>:<password>@<host>:4000/<db>?ssl={"rejectUnauthorized":true}

# TMDB v3 API key
TMDB_API_KEY=<your-tmdb-key>
```

- TiDB Serverless cluster: https://tidbcloud.com → create cluster → Connect → copy serverless driver URL.
- TMDB key: https://themoviedb.org → Settings → API.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 App Router (TypeScript, Turbopack dev) |
| Styling | Tailwind CSS v4 (custom dark gold tokens) |
| Database | **TiDB Serverless** + Drizzle ORM |
| External APIs | IMDb search + TMDB trending / details |
| Icons | lucide-react |
| Charts | recharts |
| Hosting | Vercel |

---

## Pages

| Route | What it does |
|---|---|
| `/shelf` | Your watched shelf — Cover view, sort, filter, search, multi-select delete |
| `/trending` | TMDB weekly trending — movies / series / anime, click to add |
| `/add` | Log a watched title — IMDb autocomplete + manual entry, rating 1–10, platform, notes |
| `/watchlist` | Want-to-watch list (separate from shelf) |
| `/stats` | Vibe chip, milestone, **Top 10 of life time** (custom), streak, monthly trend, heatmap, donut, rating distribution |
| `/collections` | My shelves + 33 saga collections (Star Wars, MCU, LOTR…) + achievement badges |
| `/title/[id]` | Detail / edit / delete a logged title |
| `/settings` | Profile, **display badge picker**, theme toggle, data export |

---

## API Routes

| Method | Path | What |
|---|---|---|
| GET / POST | `/api/titles` | List shelf entries / create title + entry |
| GET / PUT / DELETE | `/api/titles/[id]` | Single title CRUD |
| PUT / DELETE | `/api/entries/[id]` | Watch entry edit / delete |
| GET / POST / DELETE | `/api/watchlist` | Watchlist CRUD |
| GET | `/api/stats` | Aggregated stats (heatmap, milestones, streak, rating dist, monthly trend) |
| GET | `/api/genres` | List seeded genres |
| GET | `/api/movie-search?q=` | IMDb proxy |
| GET | `/api/trending` | TMDB trending (movie + tv + anime) |
| GET | `/api/tmdb-details/[type]/[id]` | TMDB detail proxy |

---

## Project Structure

```
app/
  shelf/  trending/  add/  watchlist/  stats/  collections/  settings/
  title/[id]/
  api/*
components/
  AppHeader.tsx       # client component — reads localStorage.dy:badge → renders badge chip next to "Do young"
  BottomNav.tsx       # 5-tab: Shelf / Trending / + (gold center) / Stats / Watchlist
  CoverCard.tsx       # gradient cover w/ rating badge
  RatingInput.tsx     # 1–10 squares
  ShelfSpine.tsx      # legacy (no longer used after shelf simplification)
  GenreTag.tsx        # legacy (genre UI hidden)
lib/
  db.ts               # TiDB Serverless drizzle client
  schema.ts           # titles / genres / title_genres / watch_entries / watchlist
  badges.tsx          # shared badge list + rarity color map + storage key
scripts/              # one-off scripts / migrations
public/               # PWA icons, manifest assets
```

---

## Client-side State (localStorage)

| Key | What |
|---|---|
| `dy:theme` | `'dark'` / `'light'` |
| `dy:badge` | Selected display badge id (shown next to "Do young" header) |
| `dy:top10` | Array of 10 title IDs for the "Top 10 of life time" section |

The Collections page (my shelves, saga progress, badges) is currently a **mockup** with hard-coded data — Phase 2 will persist these to the DB.

---

## Deploy (Vercel)

The project is already linked to a Vercel project (`.vercel/project.json` — `project-doyoung-service`).

1. Set env vars in the Vercel dashboard: `DATABASE_URL`, `TMDB_API_KEY`
2. Deploy:
   - via Vercel MCP from Claude Code, or
   - via `npx vercel --prod` from the CLI, or
   - by pushing to a connected GitHub remote (not yet set up)

TiDB Serverless and the TMDB / IMDb proxies all work on Vercel's serverless runtime.

---

## Testing on iPhone (PWA install via Cloudflare Tunnel)

The app is a PWA — you can "Add to Home Screen" on iOS to run it standalone (no Safari URL bar).

1. Install `cloudflared` once: `winget install --id Cloudflare.cloudflared` (Windows) or `brew install cloudflared` (macOS)
2. **Terminal A** — start dev server: `npm run dev`
3. **Terminal B** — start tunnel: `cloudflared tunnel --url http://localhost:3000`
4. Open the printed HTTPS URL in **Safari** on iPhone → Share → **Add to Home Screen**
5. Launch the icon — opens standalone with the dark theme blending into the status bar

---

## Docs

- [CLAUDE.md](./CLAUDE.md) — full project context for AI assistants
- [TECH_STACK.md](./TECH_STACK.md) — why each tool was chosen
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) — full SQL schema
- [FEATURES.md](./FEATURES.md) — feature spec (built vs planned)
- [ROADMAP.md](./ROADMAP.md) — milestones and progress

---

## License

MIT
