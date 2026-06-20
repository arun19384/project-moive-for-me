@AGENTS.md

# Do Young (ดูยัง?) — Project Context

## What is this project?

A personal movie/series/anime tracking web app, similar to Letterboxd. The name "ดูยัง?" means "have you watched it yet?" in Thai.

Tagline: **your watched shelf**

The user (arun19384@gmail.com) is the sole user/developer. UI is mobile-first (max-width lg, bottom navigation).

---

## Tech Stack (as built)

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router) | TypeScript, Turbopack dev |
| Styling | Tailwind CSS v4 | Custom dark gold theme tokens in `app/globals.css` |
| Database | **TiDB Serverless** via Drizzle ORM | Connected through `@tidbcloud/serverless`, env var `DATABASE_URL` |
| ORM | Drizzle (`drizzle-orm/tidb-serverless`) | Schema in `lib/schema.ts`, client in `lib/db.ts` |
| Icons | `lucide-react` | |
| Charts | `recharts` | PieChart on stats page |
| External APIs | IMDb (search) + TMDB (trending + details) | Both proxied via `/api/*` |
| Hosting | Vercel | Project linked in `.vercel/project.json` (`project-doyoung-service`) |

The legacy local SQLite (`do-young.db`) was retired — `lib/db.ts` now connects to TiDB Serverless. `initDb()` remains as a no-op for call-site compatibility.

---

## Design System

| Token | Value |
|---|---|
| Background | `#0D0D0D` |
| Surface | `#1A1A1A` / `#141414` |
| Gold accent | `#C9A84C` |
| Border | `#2A2A2A` / `#222` |
| Text muted | `#888` / `#666` / `#555` |
| Movie color | `#C9A84C` (gold) |
| Series color | `#7FB5FF` (blue) |
| Anime color | `#FF9A7F` (orange) |

Font: system-ui. The "Do young" header uses Georgia serif.

Rarity colors (for badges): common `#888888` · rare `#7FB5FF` · epic `#C97FFF` · legendary `#C9A84C`.

---

## File Structure

```
project-doyoung-service/
├── app/
│   ├── layout.tsx                 # root w/ BottomNav, dark bg, theme script, suppressHydrationWarning
│   ├── page.tsx                   # redirects to /shelf
│   ├── globals.css                # Tailwind + design tokens (dark + light)
│   ├── manifest.ts                # PWA manifest
│   ├── loading.tsx                # global loading
│   ├── shelf/page.tsx             # Cover view + sort + density + multi-select delete
│   ├── trending/page.tsx          # TMDB trending grid → /add
│   ├── add/page.tsx               # IMDb search + manual form (accepts ?q ?type ?poster ?year)
│   ├── watchlist/page.tsx         # Want-to-watch list
│   ├── stats/page.tsx             # Vibe / Hero+milestone / Top 10 of life / streak / heatmap / donut / rating dist
│   ├── collections/page.tsx       # My Shelves + Saga Collections + Badges (mockup)
│   ├── settings/page.tsx          # Profile / Display badge / Theme / Data / About
│   ├── title/[id]/page.tsx        # Detail / edit / delete
│   └── api/
│       ├── titles/route.ts                  # GET (filter-no-entry) | POST
│       ├── titles/[id]/route.ts             # GET / PUT / DELETE
│       ├── entries/[id]/route.ts            # PUT / DELETE
│       ├── watchlist/route.ts               # GET / POST / DELETE
│       ├── stats/route.ts                   # Aggregated (heatmap, milestone, streak, monthly trend, rating dist)
│       ├── genres/route.ts                  # List genres
│       ├── movie-search/route.ts            # IMDb proxy
│       ├── trending/route.ts                # TMDB trending proxy (1h cache)
│       └── tmdb-details/[type]/[id]/route.ts # TMDB detail proxy
├── components/
│   ├── BottomNav.tsx              # 5-tab: Shelf | Trending | + (gold center) | Stats | Watchlist
│   ├── AppHeader.tsx              # client: reads dy:badge → badge chip next to "Do young" + Collections + Settings buttons
│   ├── CoverCard.tsx              # Gradient cover w/ rating badge + select-mode checkbox
│   ├── ShelfSpine.tsx             # legacy (no longer used)
│   ├── RatingInput.tsx            # 1–10 squares
│   └── GenreTag.tsx               # legacy
├── lib/
│   ├── db.ts                      # TiDB Serverless drizzle client
│   ├── schema.ts                  # titles, genres, title_genres, watch_entries, watchlist
│   └── badges.tsx                 # UNLOCKED_BADGES list + RARITY_COLOR + BADGE_STORAGE_KEY
├── public/                        # PWA icons, apple-icon, manifest assets
├── scripts/                       # one-off scripts / migrations
├── .vercel/project.json           # linked Vercel project
├── .env.local                     # DATABASE_URL + TMDB_API_KEY
└── drizzle.config.ts
```

---

## Key Conventions / Decisions

- **Rating scale: 1–10** (not stars, not 0-100)
- **Platform: free text** (Netflix / Cinema / Disney+ / Prime / YouTube / Other quick-pick, stored as string)
- **Genre selector hidden** in Add + Detail — DB tables exist, `/api/genres` works. Re-enable in Phase 2.
- **Type field**: Movie / Series / Anime (default `movie`)
- **No auth** — single user (Phase 1)
- **API filters out titles with no entry** — orphan titles don't appear on shelf
- **Hydration warning suppressed on `<body>`** — browser extensions inject attributes
- **Prefer Drizzle over Prisma**

### Client-side state (localStorage)

| Key | What | Read by |
|---|---|---|
| `dy:theme` | `'dark'` / `'light'` | `app/layout.tsx` inline script + Settings |
| `dy:badge` | Selected badge id shown next to "Do young" header | `AppHeader` + Settings — sync via `dy:badge-change` event |
| `dy:top10` | 10-slot array of title IDs for "Top 10 of life time" | Stats page |

Collections (my shelves, saga progress, badge unlock state) is a **mockup** with hard-coded data in `app/collections/page.tsx` — will move to DB in Phase 2.

---

## Page Notes

### Shelf (`/shelf`)
Single Cover view (3 or 4 col density), sort, type filter, search, multi-select delete. Older DVD Shelf + List views were removed by user request.

### Add (`/add`)
1. Debounced IMDb search → dropdown with poster + year
2. Click result → auto-fill title / cover / year, hide search
3. Form: Type, Rating 1–10, Watched date, Platform, Notes → POST `/api/titles`
4. Accepts URL params `?q ?type ?poster ?year`

### Trending (`/trending`)
TMDB weekly trending (movies + tv + anime). 3-col grid → `/add?...` fully pre-filled.

### Stats (`/stats`)
- Vibe chip (derived "watch DNA": Generous critic / Tough crowd / On a roll / Anime soul / Series binger / Casual watcher)
- Hero card — total watched + hours + avg rating + **milestone progress bar** (10/25/50/100/200/500/1000)
- **Top 10 of life time** — custom: #1 GOAT hero (full-bleed 3:4 poster) + #2/#3 podium + #4–10 list, edit mode + picker modal, persists to `dy:top10`
- 4 quick stats: This month / 🔥 Streak / Top platform / Rated count
- Monthly trend bars (6 months, latest in gold)
- Activity heatmap (90 days, GitHub-style)
- Type donut + per-type bars + avg rating chips
- Rating distribution 1–10 (gold ≥8, brown 5–7, gray <5)
- Recently watched horizontal scroll
- Collections CTA

### Collections (`/collections`) — mockup
- **My Shelves** — emoji + count + preview collage + create-new modal
- **Saga Collections** — 33 franchises (Star Wars, MCU, LOTR, Matrix, John Wick, Pirates, Studio Ghibli, Evangelion, …) across 6 categories: Blockbusters / Sci-fi & Fantasy / Classics / Animation / Anime / Horror. Filter pills, progress bars, lock/unlock state, reward badge name. Tap → modal with full title list + ✓ marks.
- **Badges** — unlocked + locked grid, 4 rarity tiers (common gray / rare blue / epic purple / legendary gold), legendary sparkle ✨, locked has lock overlay.
- Unlock toast banner at top.

### Settings (`/settings`)
- Profile mockup
- **Display badge picker** — 8-column compact circles, sorted by rarity (Legendary → Common), tap to set + "None" option. Writes to `dy:badge` + dispatches `dy:badge-change` so AppHeader updates everywhere.
- Theme toggle (Dark / Light)
- Data export JSON
- About

### AppHeader
Client component. Reads `dy:badge` on mount + listens for `dy:badge-change` and `storage` events. Renders a 28px badge chip (rarity color glow, legendary has gold shadow) next to "Do young" title. Right side: Library (→ /collections) + Settings buttons.

---

## Project Docs

- [README.md](./README.md) — overview and setup
- [TECH_STACK.md](./TECH_STACK.md) — tools, why chosen, free tier details
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) — full SQL schema
- [FEATURES.md](./FEATURES.md) — feature spec (built vs planned)
- [ROADMAP.md](./ROADMAP.md) — step-by-step status

---

## Not Done Yet / Next Up

- Re-enable Genre multi-select on Add + Detail (DB layer is ready)
- User auth (Phase 2) — NextAuth.js or Lucia
- Public profile share (`/u/username`) — Phase 2
- Cloudflare R2 image upload for custom covers
- Persist Collections / Badges / Top 10 to DB (currently localStorage mockup)
- Real badge unlock logic from watch history
- First production deploy on Vercel (project already linked; env vars + push needed)
