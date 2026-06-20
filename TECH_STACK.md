# Tech Stack — Do Young (ดูยัง?)

Everything the app actually uses today, why it was chosen, and the free tier.

---

## Framework — Next.js 16 (App Router)

- TypeScript, Turbopack dev server
- File-based routing under `app/`
- API routes co-located: `app/api/*/route.ts`
- Built-in `revalidate` for caching upstream APIs

**Why:** one repo for frontend + backend, zero-config Vercel deploy, App Router gives clean RSC + client component split.

**Free tier:** Vercel Hobby plan — unlimited personal projects, 100GB bandwidth/month.

---

## Styling — Tailwind CSS v4

- Tokens defined in `app/globals.css` via `@theme inline`
- Dark mode by default — no theme switcher needed
- No utility-class bloat — leans on inline `style={{}}` for one-off color combos because the design uses many specific hex values

**Why:** fast to prototype, easy to keep consistent dark gold styling.

---

## Database — SQLite (locally) → TiDB Serverless (planned)

- **Now:** local SQLite file `do-young.db` at project root (gitignored, syncs via OneDrive)
- **Later:** TiDB Serverless (MySQL-compatible) — same Drizzle schema, swap connection string only

**Why SQLite first:** zero setup, single file, perfect for solo development. Schema written to be portable.

**TiDB Serverless free tier:** 5GB row storage, 50M Request Units/month, no credit card.

---

## ORM — Drizzle

- `drizzle-orm` + `better-sqlite3` driver
- Schema in `lib/schema.ts`
- DB init + seed in `lib/db.ts` (called from every API route via `initDb()`)
- `drizzle.config.ts` configured for migrations (not strictly used yet — `initDb()` runs raw `CREATE TABLE IF NOT EXISTS`)

**Why Drizzle (not Prisma):** lighter, no codegen step, works seamlessly with both SQLite and MySQL/TiDB.

---

## Icons — lucide-react

Used throughout: `BookMarked`, `Flame`, `Plus`, `BarChart2`, `Settings`, `LayoutGrid`, `List`, `Library`, `Grid3x3`, `Rows3`, `Search`, `Trash2`, `Check`, `X`, `ChevronRight`, `ArrowLeft`, `ArrowUpDown`, `Film`, `Tv`, `Sparkles`, `Clock`, `Calendar`, `Trophy`, `TrendingUp`, `Star`.

**Free:** open source.

---

## Charts — Recharts

Used on the Stats page for the **type breakdown donut chart** (PieChart + Cell). The activity heatmap and genre bars are pure CSS — Recharts only powers the donut.

**Free:** open source.

---

## External APIs

### TMDB — Trending content

- Endpoint: `https://api.themoviedb.org/3/trending/movie/week`, `/trending/tv/week`, `/discover/tv?with_genres=16&with_original_language=ja` (anime)
- Auth: API key in `.env.local` as `TMDB_API_KEY` (server-side only)
- Images via `https://image.tmdb.org/t/p/w500{poster_path}`
- Proxied through `/api/trending` with 1-hour `revalidate` cache

**Why:** real trending data, generous free tier, no payment required.

**Free tier:** unlimited reasonable use for non-commercial apps.

### IMDb (unofficial) — Title search

- Endpoint: `https://imdb.iamidiotareyoutoo.com/search?q=...`
- No auth, no API key
- Response fields used: `#TITLE`, `#YEAR`, `#IMG_POSTER`, `#IMDB_ID`, `#ACTORS`
- Proxied through `/api/movie-search` with 60s `revalidate` cache

**Why:** free, no signup, returns poster URLs that match what TMDB/IMDb shows.

**Caveat:** community-maintained, no SLA. If it breaks we can swap to TMDB `/search/multi` (we already have the key).

---

## File Storage — Cloudflare R2 (planned, not used yet)

Custom cover uploads not implemented yet. All current covers are external URLs (TMDB or IMDb posters).

**Free tier:** 10GB storage, 10M reads/month, zero egress.

---

## Deployment — Vercel (not deployed yet)

- Auto-deploy from GitHub
- Free Hobby plan
- Env vars: `TMDB_API_KEY`, `DATABASE_URL` (when on TiDB)

---

## Repo — GitHub (not pushed yet)

Single repo, branch `master`. `do-young.db` and `.env.local` are gitignored.

---

## Summary Table

| Tool | Purpose | Cost |
|---|---|---|
| Next.js 16 | Frontend + API | Free |
| Tailwind v4 | Styling | Free |
| Drizzle ORM | DB layer | Free |
| better-sqlite3 | Local DB driver | Free |
| TiDB Serverless (planned) | Production DB | Free (5GB) |
| lucide-react | Icons | Free |
| recharts | Donut chart | Free |
| TMDB API | Trending data | Free with key |
| IMDb unofficial | Title search | Free no auth |
| Cloudflare R2 (planned) | Image storage | Free (10GB) |
| Vercel (planned) | Deploy | Free |
| GitHub | Repo | Free |
