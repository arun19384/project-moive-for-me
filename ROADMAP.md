# Roadmap — Do Young (ดูยัง?)

Status of each milestone. ✅ = done · 🚧 = partial · ⏳ = pending.

---

## ✅ Stage 1 — Project Setup

- ✅ Next.js 16 TypeScript scaffold
- ✅ Tailwind v4 with custom dark gold theme tokens in `app/globals.css`
- ✅ Removed old Expo/RN frontend and Go backend (one-time migration)

## ✅ Stage 2 — Database

- ✅ **TiDB Serverless** via `@tidbcloud/serverless` + Drizzle (`lib/db.ts`)
- ✅ Schema: `titles`, `genres`, `title_genres`, `watch_entries`, `watchlist` in `lib/schema.ts`
- ✅ Migrated from local SQLite → TiDB Serverless for production
- ✅ Drizzle Kit migrations under `scripts/` and `drizzle.config.ts`

## 🚧 Stage 3 — File Storage

- ⏳ Cloudflare R2 (not started — using TMDB / IMDb poster URLs for now)

## ✅ Stage 4 — API Routes

- ✅ `GET /api/titles` (filters out titles without an entry)
- ✅ `POST /api/titles`
- ✅ `GET / PUT / DELETE /api/titles/[id]`
- ✅ `PUT / DELETE /api/entries/[id]`
- ✅ `GET /api/stats` (full aggregations + rating dist + streak + monthly trend + milestone)
- ✅ `GET /api/genres`
- ✅ `GET /api/movie-search?q=` (IMDb proxy)
- ✅ `GET /api/trending` (TMDB proxy, 1h cache)
- ✅ `GET /api/tmdb-details/[type]/[id]` (TMDB detail proxy)
- ✅ `GET/POST/DELETE /api/watchlist`

## ✅ Stage 5 — Shelf Page

- ✅ Cover view + density 3 / 4 columns
- ✅ Sort: Recent / Watched ↓↑ / Rating / A–Z
- ✅ Type filter: All / Movies / Series / Anime
- ✅ Search filter
- ✅ Multi-select delete
- ❌ DVD Shelf view & List view removed (single view per user preference)

## ✅ Stage 6 — Add to Shelf

- ✅ IMDb live search with debounce + autocomplete
- ✅ Manual entry fallback
- ✅ All fields: Type, Rating 1–10, Watched date, Platform, Notes, Cover, Year
- ✅ URL pre-fill via `?q ?type ?poster ?year`
- 🚧 Genre selector (DB ready, UI hidden)

## ✅ Stage 7 — Stats Page (v2)

- ✅ Vibe chip (Generous critic / Tough crowd / On a roll / Anime soul / Series binger / Casual watcher)
- ✅ Hero card with milestone progress bar + glow
- ✅ **Top 10 of life time** — customizable, #1 hero card + #2/#3 podium + #4–10 list, edit mode, picker modal, localStorage persistence
- ✅ 4 quick stats (this month / streak 🔥 / top platform / rated)
- ✅ Monthly trend bars (last 6 months)
- ✅ Activity heatmap (90 days) with day labels + legend
- ✅ Type donut + per-type bars + avg rating chips
- ✅ Rating distribution (1–10 gradient bars)
- ✅ Collections CTA card
- ✅ Recently watched (horizontal scroll)

## ✅ Stage 8 — Detail/Edit Page

- ✅ Cover + meta header
- ✅ Edit form (title, type, rating, date, platform, notes)
- ✅ Save → PUT API → redirect
- ✅ Delete title → DELETE API → redirect

## ✅ Stage 9 — Trending Page

- ✅ TMDB-powered weekly trending
- ✅ Movie / Series / Anime tabs
- ✅ Click → pre-filled Add page

## ✅ Stage 10 — Watchlist

- ✅ Bottom-nav tab `/watchlist`
- ✅ IMDb search + add to "want to watch"
- ✅ Move-to-shelf flow

## ✅ Stage 11 — Collections (mockup)

- ✅ My Shelves (custom user-created shelves)
- ✅ Saga Collections — 33 franchises across 6 categories with progress + filter pills
- ✅ Badges / Achievements grid (unlocked / locked, 4 rarity tiers)
- ✅ Unlock toast banner
- ✅ Saga detail modal with full title list

## ✅ Stage 12 — Settings

- ✅ Profile mockup
- ✅ Display badge picker (sorted by rarity)
- ✅ Theme toggle (dark / light)
- ✅ Data export JSON
- ✅ About section

## ✅ Stage 13 — Header Badge

- ✅ Picked badge shows next to "Do young" header on every page
- ✅ Rarity-colored glow ring, legendary has gold glow
- ✅ Click → jump to Settings to change

## ✅ Stage 14 — Polish & PWA

- ✅ Mobile-first responsive (max-width lg, bottom nav)
- ✅ Dark / Light theme tokens
- ✅ Loading skeletons + empty states
- ✅ Hydration warning suppression
- ✅ PWA manifest + Apple Web App meta
- ✅ iOS install banner (commit `e12b373`)
- ✅ Bottom nav: Shelf / Trending / **+** / Stats / Watchlist
- ✅ Header right: Library (Collections) + Settings buttons
- ⏳ Keyboard accessibility audit

## 🚧 Stage 15 — Deployment

- ✅ Vercel project linked (`project-doyoung-service` in `.vercel/project.json`)
- ✅ Switched to TiDB Serverless (env-driven, serverless-friendly)
- ⏳ Add `DATABASE_URL` + `TMDB_API_KEY` env vars on Vercel
- ⏳ First production deploy
- ⏳ Set up GitHub remote (currently no `origin`)
- ⏳ Custom domain (optional)

## ⏳ Stage 16 — Phase 2 (Post-MVP)

- ⏳ User auth (NextAuth.js or Lucia)
- ⏳ Public profile share (`/u/username`)
- ⏳ Re-enable Genre selector on Add + Detail
- ⏳ R2 image upload for custom covers
- ⏳ Real Collections / Badges (persist to DB instead of localStorage mockup)
- ⏳ Automatic badge unlock logic from watch history

---

## Milestone Summary

| Milestone | Status |
|---|---|
| Stages 1–2 (infra + DB on TiDB) | ✅ Done |
| Stage 3 (R2 storage) | ⏳ Skipped — using external poster URLs |
| Stage 4 (APIs) | ✅ Done |
| Stages 5–9 (core pages) | ✅ Done |
| Stage 10 (Watchlist) | ✅ Done |
| Stage 11 (Collections mockup) | ✅ Done |
| Stages 12–14 (Settings + Header Badge + PWA polish) | ✅ Done |
| Stage 15 (Deploy) | 🚧 Vercel linked, awaiting first push + env vars |
| Stage 16 (Phase 2) | ⏳ Not started |
