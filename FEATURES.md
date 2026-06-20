# Features — Do Young (ดูยัง?)

Legend: ✅ built · 🚧 in progress · ⏳ planned (Phase 2)

---

## Shelf Page (`/shelf`) ✅

### View
- ✅ **Cover view** — 3-column or 4-column density toggle
  (DVD shelf + List views were removed — single view kept for simplicity)

### Filters & Sort
- ✅ **Type filter pills**: All / Movies / Series / Anime
- ✅ **Sort**: Recent / Watched ↓↑ / Rating / A–Z
- ✅ Client-side **search** by title
- ✅ Empty state

### Multi-select delete
- ✅ Top-right "Select" enters select mode
- ✅ Bottom fixed red bar — "Delete N items"
- ✅ "Cancel" exits

### Click behavior
- ✅ Card click → `/title/[id]` (when not in select mode)

---

## Add Page (`/add`) ✅

- ✅ **IMDb search bar** with 400ms debounce → dropdown with poster + year
- ✅ Auto-fills title / cover / year on result click, hides search box
- ✅ Manual title input fallback
- ✅ **Type selector** — Movie / Series / Anime
- 🚧 Genre multi-select (DB ready, UI hidden)
- ✅ **1–10 rating** square selector
- ✅ Watched date, Platform quick-pick, Notes
- ✅ **URL prefill** — `?q=` `?type=` `?poster=` `?year=`
- ✅ POST `/api/titles` → redirect

---

## Trending Page (`/trending`) ✅

- ✅ TMDB weekly trending (movie + tv + anime)
- ✅ Tabs: All / Movies / Series / Anime
- ✅ 3-column grid with rank + TMDB rating badge
- ✅ Click → `/add?q=...` fully pre-filled
- ✅ Anime IDs filtered out of series tab (no duplicates)
- ✅ Server cached 1h

---

## Watchlist Page (`/watchlist`) ✅

- ✅ Separate "want to watch" list (not on shelf yet)
- ✅ IMDb search + add to watchlist
- ✅ Type selector (movie / series / anime)
- ✅ Remove / move to shelf

---

## Stats Page (`/stats`) ✅

### Hero & vibes
- ✅ **Vibe chip** — derived "watch DNA" (Generous critic ✨ / Tough crowd 🧊 / On a roll 🔥 / Anime soul 🎌 / Series binger 📺 / Casual watcher 🍿)
- ✅ **Hero card** — total watched (gradient text), hours spent, avg rating
- ✅ **Milestone progress bar** — next 10/25/50/100/200/500/1000 with glow

### Top 10 of life time (custom)
- ✅ **#1 GOAT card** — full-bleed poster (3:4), dark gradient, big title, GOAT crown badge
- ✅ **#2 & #3 podium** — side-by-side cards, silver/bronze medal chips
- ✅ **#4–10 list** — numbered rows with poster + rating
- ✅ **Edit mode** — move ↑↓, change, remove per slot
- ✅ **Picker modal** — search & pick from your shelf, swaps if already used
- ✅ Persists to `localStorage.dy:top10`

### Quick stats (4-card grid)
- ✅ This month + best month
- ✅ 🔥 Current streak (consecutive days)
- ✅ Top platform
- ✅ Rated count + % of total

### Charts
- ✅ **Monthly trend** — last 6 months bar chart (latest month highlighted gold)
- ✅ **Activity heatmap** — 90 days GitHub-style + Mon/Wed/Fri labels + legend
- ✅ **By type** — recharts donut + per-type progress bars + avg rating chip
- ✅ **Rating distribution** — 1–10 bars (gold for ≥8, brown 5–7, gray <5)

### Lists
- ✅ Recently watched (horizontal scroll)
- ✅ Collections teaser CTA → `/collections`
- ❌ "Top rated" auto-list removed (replaced by Top 10 of life time)
- ❌ "By genre" bars removed

---

## Collections Page (`/collections`) ✅

Mockup feature for personal shelves + saga progress + achievements.

### My Shelves
- ✅ User-created custom shelves with emoji + count + preview collage
- ✅ Mock shelves: Comfort movies ☕, Mind-bending 🌀, Rewatch forever 🔁
- ✅ "Create new shelf" modal (name + emoji picker)

### Saga Collections (33 franchises across 6 categories)
- ✅ **Filter pills**: All / Blockbusters / Sci-fi & Fantasy / Classics / Animation / Anime / Horror
- ✅ Sorted by completion %
- ✅ Each card — gradient bg, icon, progress bar, reward badge name, lock if incomplete
- ✅ **Sagas**: Star Wars Skywalker, MCU Infinity, Middle-earth, Harry Potter, Matrix, Dune, Avatar, Planet of the Apes, Star Trek Kelvin, Dark Knight, John Wick, Mission: Impossible, Fast & Furious, Indiana Jones, Pirates of the Caribbean, Jurassic Park/World, James Bond (Craig), Back to the Future, Rocky, Godfather, Alien, Toy Story, Shrek, How to Train Your Dragon, Frozen, Kung Fu Panda, Studio Ghibli, Demon Slayer, Evangelion Rebuild, Makoto Shinkai, Ghost in the Shell, Conjuring Universe, Scream, Halloween Reboot
- ✅ Tap → modal with full title list + ✓ marks for watched + reward chip

### Badges / Achievements
- ✅ Unlocked + locked grid with rarity colors (common gray / rare blue / epic purple / legendary gold)
- ✅ Legendary badges sparkle ✨
- ✅ Locked badges show description + lock overlay
- ✅ Unlock toast banner at top ("Just unlocked: Jedi Master")

### Stats strip
- ✅ Shelves count / Sagas completed / Badges unlocked

---

## Header Badge ✅

- ✅ Pick an unlocked badge in Settings → shows as a chip next to "Do young" title
- ✅ Legendary badges glow gold
- ✅ Click chip → jumps to Settings
- ✅ Persists to `localStorage.dy:badge` and syncs across pages via custom event

---

## Detail / Edit Page (`/title/[id]`) ✅

- ✅ Cover + title + type + year header
- ✅ Edit: Title, Type, Rating, Watched date, Platform, Notes
- 🚧 Genre editor (DB ready, UI hidden)
- ✅ Save → PUT `/api/titles/[id]` → redirect to `/shelf`
- ✅ Delete (confirms) → DELETE → redirect
- ✅ Back button

---

## Settings Page (`/settings`) ✅

- ✅ **Profile** mockup card (name + email + "coming soon" chip)
- ✅ **Display badge** picker — 8-column compact grid sorted by rarity (Legendary → Common), tap to set, "None" option, caption shows current pick + rarity
- ✅ **Theme** — Dark / Light toggle (persists to `localStorage.dy:theme`)
- ✅ **Data** — Export JSON, Clear all (placeholder)
- ✅ **About** — version + tagline

---

## PWA ✅

- ✅ `app/manifest.ts` + icons (`apple-icon.png`, `icon.png`)
- ✅ Apple Web App meta (standalone mode, black-translucent status bar)
- ✅ Custom install banner for iOS Safari (see commit `e12b373`)

---

## Phase 2 — Planned ⏳

- ⏳ **User auth** — NextAuth.js or Lucia
- ⏳ **Public share profile** — `/u/username` read-only shelf
- ⏳ **Real Genre selector** on Add + Detail
- ⏳ **Cloudflare R2 upload** for custom covers
- ⏳ Real Collections (persist to DB, not just localStorage)
- ⏳ Real badge unlock logic from watch history
- ⏳ Push notifications for streak reminders

---

## Conventions

- Rating scale **1–10** (never stars)
- Platform stored as **free text** (not enum)
- API filters out titles with no `watch_entry` (orphan titles don't appear on shelf)
- Top 10 / display badge / theme persist in `localStorage` (client-only state)
