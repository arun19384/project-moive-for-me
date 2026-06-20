import { connect } from '@tidbcloud/serverless'

const conn = connect({ url: process.env.DATABASE_URL })

async function run() {
  console.log('→ creating users table')
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(255) PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255),
      image VARCHAR(500),
      username VARCHAR(50) UNIQUE,
      bio TEXT,
      badge_id VARCHAR(64),
      theme ENUM('dark', 'light') NOT NULL DEFAULT 'dark',
      created_at DATETIME
    )
  `)

  console.log('→ creating user_top10 table')
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS user_top10 (
      user_id VARCHAR(255) NOT NULL,
      position INT NOT NULL,
      title_id INT NOT NULL,
      PRIMARY KEY (user_id, position),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (title_id) REFERENCES titles(id) ON DELETE CASCADE
    )
  `)

  console.log('→ adding user_id to watch_entries (nullable until claim-orphans runs)')
  const weCols = await conn.execute(`SHOW COLUMNS FROM watch_entries LIKE 'user_id'`)
  if (weCols.length === 0) {
    await conn.execute(`ALTER TABLE watch_entries ADD COLUMN user_id VARCHAR(255)`)
    console.log('  ↳ added')
  } else {
    console.log('  ↳ already exists')
  }

  console.log('→ adding user_id to watchlist_items (nullable until claim-orphans runs)')
  const wlCols = await conn.execute(`SHOW COLUMNS FROM watchlist_items LIKE 'user_id'`)
  if (wlCols.length === 0) {
    await conn.execute(`ALTER TABLE watchlist_items ADD COLUMN user_id VARCHAR(255)`)
    console.log('  ↳ added')
  } else {
    console.log('  ↳ already exists')
  }

  console.log('\n✓ migration complete')
  console.log('  next: sign up at /signup, then run `node --env-file=.env.local scripts/claim-orphans.mjs <user-id>`')
  console.log('  to assign existing watch_entries + watchlist_items to that user.')
}

run().catch((err) => {
  console.error('migration failed:', err)
  process.exit(1)
})
