import { int, text, varchar, boolean, datetime, date, mysqlTable, mysqlEnum, primaryKey } from 'drizzle-orm/mysql-core'

// ---------- Users ----------

export const users = mysqlTable('users', {
  id: varchar('id', { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }),
  image: text('image'),
  username: varchar('username', { length: 50 }).unique(),
  bio: text('bio'),
  badgeId: varchar('badge_id', { length: 64 }),
  theme: mysqlEnum('theme', ['dark', 'light']).default('dark').notNull(),
  createdAt: datetime('created_at', { mode: 'string' }),
})

export const userTop10 = mysqlTable('user_top10', {
  userId: varchar('user_id', { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  listType: mysqlEnum('list_type', ['movie', 'series', 'anime']).default('movie').notNull(),
  position: int('position').notNull(),
  titleId: int('title_id').notNull().references(() => titles.id, { onDelete: 'cascade' }),
}, (t) => [primaryKey({ columns: [t.userId, t.listType, t.position] })])

// ---------- Catalog (shared) ----------

export const genres = mysqlTable('genres', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
})

export const titles = mysqlTable('titles', {
  id: int('id').autoincrement().primaryKey(),
  title: text('title').notNull(),
  originalTitle: text('original_title'),
  type: mysqlEnum('type', ['movie', 'series', 'anime']).notNull(),
  releaseYear: int('release_year'),
  coverUrl: text('cover_url'),
  description: text('description'),
  totalEpisodes: int('total_episodes'),
  createdAt: datetime('created_at', { mode: 'string' }),
})

export const titleGenres = mysqlTable('title_genres', {
  titleId: int('title_id').notNull().references(() => titles.id, { onDelete: 'cascade' }),
  genreId: int('genre_id').notNull().references(() => genres.id, { onDelete: 'cascade' }),
}, (t) => [primaryKey({ columns: [t.titleId, t.genreId] })])

// ---------- User-scoped data ----------

export const watchEntries = mysqlTable('watch_entries', {
  id: int('id').autoincrement().primaryKey(),
  userId: varchar('user_id', { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  titleId: int('title_id').notNull().references(() => titles.id, { onDelete: 'cascade' }),
  rating: int('rating'),
  watchedDate: date('watched_date', { mode: 'string' }),
  platform: varchar('platform', { length: 255 }),
  notes: text('notes'),
  rewatch: boolean('rewatch').default(false),
  createdAt: datetime('created_at', { mode: 'string' }),
})

export const customShelves = mysqlTable('custom_shelves', {
  id: int('id').autoincrement().primaryKey(),
  userId: varchar('user_id', { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 120 }).notNull(),
  emoji: varchar('emoji', { length: 16 }).notNull().default('📚'),
  accent: varchar('accent', { length: 16 }).notNull().default('#C9A84C'),
  createdAt: datetime('created_at', { mode: 'string' }),
})

export const shelfItems = mysqlTable('shelf_items', {
  shelfId: int('shelf_id').notNull().references(() => customShelves.id, { onDelete: 'cascade' }),
  titleId: int('title_id').notNull().references(() => titles.id, { onDelete: 'cascade' }),
  addedAt: datetime('added_at', { mode: 'string' }),
}, (t) => [primaryKey({ columns: [t.shelfId, t.titleId] })])

export const watchlistItems = mysqlTable('watchlist_items', {
  id: int('id').autoincrement().primaryKey(),
  userId: varchar('user_id', { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  type: mysqlEnum('type', ['movie', 'series', 'anime']).default('movie').notNull(),
  coverUrl: text('cover_url'),
  releaseYear: int('release_year'),
  addedAt: text('added_at'),
})

// ---------- Types ----------

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Genre = typeof genres.$inferSelect
export type Title = typeof titles.$inferSelect
export type WatchEntry = typeof watchEntries.$inferSelect
export type NewTitle = typeof titles.$inferInsert
export type NewWatchEntry = typeof watchEntries.$inferInsert
export type WatchlistItem = typeof watchlistItems.$inferSelect
export type NewWatchlistItem = typeof watchlistItems.$inferInsert
export type CustomShelf = typeof customShelves.$inferSelect
export type NewCustomShelf = typeof customShelves.$inferInsert
export type ShelfItem = typeof shelfItems.$inferSelect
