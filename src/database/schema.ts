export const CURRENT_SCHEMA_VERSION = 1;

export const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS favorites (
  verse_id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS collection_verses (
  collection_id TEXT NOT NULL,
  verse_id TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  added_at TEXT NOT NULL,
  PRIMARY KEY (collection_id, verse_id),
  FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS read_history (
  verse_id TEXT PRIMARY KEY,
  read_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS last_read (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  poet_id TEXT NOT NULL,
  verse_number INTEGER NOT NULL,
  verse_id TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS notification_history (
  verse_id TEXT NOT NULL,
  delivered_at TEXT NOT NULL,
  PRIMARY KEY (verse_id, delivered_at)
);
`;
