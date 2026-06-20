-- CREATE TABLE IF NOT EXISTS genres (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   name VARCHAR(255) NOT NULL UNIQUE
-- );

-- CREATE TABLE IF NOT EXISTS titles (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   title TEXT NOT NULL,
--   original_title TEXT,
--   type ENUM('movie','series','anime') NOT NULL,
--   release_year INT,
--   cover_url TEXT,
--   description TEXT,
--   total_episodes INT,
--   created_at VARCHAR(30) DEFAULT (NOW())
-- );

-- CREATE TABLE IF NOT EXISTS title_genres (
--   title_id INT NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
--   genre_id INT NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
--   PRIMARY KEY (title_id, genre_id)
-- );

-- CREATE TABLE IF NOT EXISTS watch_entries (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   title_id INT NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
--   rating INT CHECK(rating BETWEEN 1 AND 10),
--   watched_date VARCHAR(10),
--   platform VARCHAR(255),
--   notes TEXT,
--   rewatch TINYINT DEFAULT 0,
--   created_at VARCHAR(30) DEFAULT (NOW())
-- );

-- INSERT IGNORE INTO genres (name) VALUES
--   ('Action'), ('Adventure'), ('Animation'), ('Comedy'), ('Crime'),
--   ('Drama'), ('Fantasy'), ('Horror'), ('Mystery'), ('Romance'),
--   ('Sci-Fi'), ('Thriller');

USE DB_APP;

CREATE TABLE IF NOT EXISTS genres (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS titles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title TEXT NOT NULL,
  original_title TEXT,
  type ENUM('movie','series','anime') NOT NULL,
  release_year INT,
  cover_url TEXT,
  description TEXT,
  total_episodes INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP -- ปรับแก้เป็น DATETIME
);

CREATE TABLE IF NOT EXISTS title_genres (
  title_id INT NOT NULL,
  genre_id INT NOT NULL,
  PRIMARY KEY (title_id, genre_id),
  -- ต้องประกาศ FOREIGN KEY แยกแบบนี้ ถึงจะทำงานครับ
  FOREIGN KEY (title_id) REFERENCES titles(id) ON DELETE CASCADE,
  FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS watch_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title_id INT NOT NULL,
  rating INT CHECK(rating BETWEEN 1 AND 10),
  watched_date DATE, -- ปรับแก้เป็น DATE
  platform VARCHAR(255),
  notes TEXT,
  rewatch TINYINT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- ปรับแก้เป็น DATETIME
  -- ประกาศ FOREIGN KEY แยกแบบนี้
  FOREIGN KEY (title_id) REFERENCES titles(id) ON DELETE CASCADE
);

INSERT IGNORE INTO genres (name) VALUES
  ('Action'), ('Adventure'), ('Animation'), ('Comedy'), ('Crime'),
  ('Drama'), ('Fantasy'), ('Horror'), ('Mystery'), ('Romance'),
  ('Sci-Fi'), ('Thriller');