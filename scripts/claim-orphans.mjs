import { connect } from '@tidbcloud/serverless'

const userId = process.argv[2]
if (!userId) {
  console.error('usage: node --env-file=.env.local scripts/claim-orphans.mjs <user-id>')
  console.error('  find the user-id by signing up first then checking users table:')
  console.error('  → SELECT id, email FROM users;')
  process.exit(1)
}

const conn = connect({ url: process.env.DATABASE_URL })

async function run() {
  const userCheck = await conn.execute('SELECT email FROM users WHERE id = ?', [userId])
  if (userCheck.length === 0) {
    console.error(`user id ${userId} not found in users table`)
    process.exit(1)
  }
  console.log(`→ claiming orphan rows for ${userCheck[0].email} (${userId})`)

  // @tidbcloud/serverless: row count is on rowsAffected from an UPDATE; query the count instead.
  const weBefore = await conn.execute(
    `SELECT COUNT(*) AS n FROM watch_entries WHERE user_id IS NULL`
  )
  await conn.execute('UPDATE watch_entries SET user_id = ? WHERE user_id IS NULL', [userId])
  console.log(`  ↳ watch_entries: ${weBefore[0].n} rows claimed`)

  const wlBefore = await conn.execute(
    `SELECT COUNT(*) AS n FROM watchlist_items WHERE user_id IS NULL`
  )
  await conn.execute('UPDATE watchlist_items SET user_id = ? WHERE user_id IS NULL', [userId])
  console.log(`  ↳ watchlist_items: ${wlBefore[0].n} rows claimed`)

  const weNull = await conn.execute(`SELECT COUNT(*) AS n FROM watch_entries WHERE user_id IS NULL`)
  const wlNull = await conn.execute(`SELECT COUNT(*) AS n FROM watchlist_items WHERE user_id IS NULL`)
  if (Number(weNull[0].n) === 0 && Number(wlNull[0].n) === 0) {
    console.log('→ no NULL user_id rows remain — enforcing NOT NULL')
    await conn.execute(`ALTER TABLE watch_entries MODIFY user_id VARCHAR(255) NOT NULL`)
    await conn.execute(`ALTER TABLE watchlist_items MODIFY user_id VARCHAR(255) NOT NULL`)
    console.log('  ↳ done')
  } else {
    console.log(`→ ${weNull[0].n} watch_entries + ${wlNull[0].n} watchlist_items still NULL — skipping NOT NULL enforcement`)
  }

  console.log('\n✓ claim complete')
}

run().catch((err) => {
  console.error('claim failed:', err)
  process.exit(1)
})
