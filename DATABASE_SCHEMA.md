# Database Schema — Do Young (ดูยัง?)

**Current:** local SQLite (`do-young.db`) via Drizzle ORM. Schema is MySQL-portable so it'll move to TiDB Serverless with only a connection-string change.

Schema source of truth: [`lib/schema.ts`](./lib/schema.ts).
Auto-init + seed: [`lib/db.ts`](./lib/db.ts) `initDb()` runs `CREATE TABLE IF NOT EXISTS` + seeds 12 genres on first DB access.

---

## Tables

| Table | Purpose |
|---|---|
| `titles` | The movie/series/anime catalog |
| `genres` | Lookup table of genres |
| `title_genres` | Many-to-many join |
| `watch_entries` | A user's "I watched this" log entry |

(`users` table from the original spec is **not created yet** — single-user mode, Phase 1.)

---

## `genres`

Seeded with: Action, Adventure, Animation, Comedy, Crime, Drama, Fantasy, Horror, Mystery, Romance, Sci-Fi, Thriller.

```sql
CREATE TABLE genres (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);
```

---

## `titles`

```sql
CREATE TABLE titles (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  title           TEXT NOT NULL,
  original_title  TEXT,
  type            TEXT NOT NULL CHECK(type IN ('movie','series','anime')),
  release_year    INTEGER,
  cover_url       TEXT,                         -- external URL (TMDB / IMDb poster)
  description     TEXT,
  total_episodes  INTEGER,                      -- NULL for movies
  created_at      TEXT DEFAULT (datetime('now'))
);
```

---

## `title_genres`

```sql
CREATE TABLE title_genres (
  title_id  INTEGER NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
  genre_id  INTEGER NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
  PRIMARY KEY (title_id, genre_id)
);
```

The Add and Detail forms currently do **not** populate this table (Genre UI was disabled by the user). The table is ready for re-enabling.

---

## `watch_entries`

```sql
CREATE TABLE watch_entries (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  title_id      INTEGER NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
  rating        INTEGER CHECK(rating BETWEEN 1 AND 10),
  watched_date  TEXT,           -- ISO date 'YYYY-MM-DD'
  platform      TEXT,           -- free text: 'Netflix' | 'Cinema' | …
  notes         TEXT,
  rewatch       INTEGER DEFAULT 0,
  created_at    TEXT DEFAULT (datetime('now'))
);
```

A title may have 0..N entries (rewatches). The shelf API filters out titles with **zero** entries — they don't show up.

---

## Relationships

```
titles ─── 1:N ─── watch_entries
   │
   │ N:M (via title_genres)
   ▼
genres
```

---

## Notes / Quirks

- **Rating is 1–10** (not 0–10, not stars). Enforced by CHECK constraint.
- **`platform` is free text** (no enum) — easy to type "Cinema" or "MX Player" etc.
- **`cover_url` is always an external URL** — we don't host images. Future: Cloudflare R2 for custom uploads.
- **`rewatch` boolean** exists in schema but not exposed in the UI yet.
- **No `users` table** — single user mode. Add in Phase 2 with auth.
- **Foreign-key cascades on DELETE** — deleting a title kills its entries and genre links.
- **The Shelf API (`/api/titles` GET) filters out titles that have no watch_entry** — this prevents orphan titles (where you deleted an entry but the title row still exists) from showing on the shelf.

---

## Sample Data

```sql
INSERT INTO titles (title, type, release_year, cover_url)
VALUES ('Dune: Part Two', 'movie', 2024, 'https://image.tmdb.org/t/p/w500/...');

INSERT INTO watch_entries (title_id, rating, watched_date, platform, notes)
VALUES (1, 9, '2026-05-15', 'Cinema', 'IMAX was worth it');
```
