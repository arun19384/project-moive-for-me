import { connect } from '@tidbcloud/serverless'

const conn = connect({ url: process.env.DATABASE_URL })

await conn.execute(`
  CREATE TABLE IF NOT EXISTS watchlist_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title TEXT NOT NULL,
    type ENUM('movie', 'series', 'anime') NOT NULL DEFAULT 'movie',
    cover_url TEXT,
    release_year INT,
    added_at TEXT
  )
`)

console.log('watchlist_items table created (or already exists)')
