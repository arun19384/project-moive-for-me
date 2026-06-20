import { connect } from '@tidbcloud/serverless'

const conn = connect({ url: process.env.DATABASE_URL })

await conn.execute(`
  CREATE TABLE IF NOT EXISTS custom_shelves (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(120) NOT NULL,
    emoji VARCHAR(16) NOT NULL DEFAULT '📚',
    accent VARCHAR(16) NOT NULL DEFAULT '#C9A84C',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`)
console.log('custom_shelves table ready')

await conn.execute(`
  CREATE TABLE IF NOT EXISTS shelf_items (
    shelf_id INT NOT NULL,
    title_id INT NOT NULL,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (shelf_id, title_id),
    FOREIGN KEY (shelf_id) REFERENCES custom_shelves(id) ON DELETE CASCADE,
    FOREIGN KEY (title_id) REFERENCES titles(id) ON DELETE CASCADE
  )
`)
console.log('shelf_items table ready')
