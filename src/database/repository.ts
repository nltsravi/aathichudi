import { PoetId, Verse, Collection, LastReadRecord, UserSettings, NotificationSettings } from '../types';
import { getVerseById, getVersesByPoet } from '../data/loader';
import { CREATE_TABLES_SQL, CURRENT_SCHEMA_VERSION } from './schema';

let sqliteDb: any = null;
let isInitialized = false;

// In-memory fallback if SQLite native module is not present (e.g. testing or unsupported web environment)
const memoryStore = {
  favorites: new Set<string>(),
  collections: new Map<string, { id: string; name: string; createdAt: string; updatedAt: string }>(),
  collectionVerses: new Map<string, { verseId: string; orderIndex: number; addedAt: string }[]>(),
  readHistory: new Set<string>(),
  lastRead: null as LastReadRecord | null,
  settings: new Map<string, string>(),
  notificationHistory: [] as { verseId: string; deliveredAt: string }[],
};

export async function initDatabase(): Promise<boolean> {
  if (isInitialized) return true;

  try {
    let SQLite: any;
    try {
      SQLite = require('expo-sqlite');
    } catch {
      SQLite = null;
    }

    if (!SQLite || typeof SQLite.openDatabaseSync !== 'function') {
      isInitialized = true;
      return false;
    }

    sqliteDb = SQLite.openDatabaseSync('aathichudi.db');

    // Run schema migrations
    sqliteDb.execSync('PRAGMA foreign_keys = ON;');
    sqliteDb.execSync(CREATE_TABLES_SQL);

    const versionRow = sqliteDb.getFirstSync(
      'SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1;'
    ) as { version: number } | null;

    if (!versionRow) {
      sqliteDb.runSync(
        'INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?);',
        [CURRENT_SCHEMA_VERSION, new Date().toISOString()]
      );
    }

    isInitialized = true;
    return true;
  } catch (error) {
    isInitialized = true;
    return false;
  }
}

// ---------------- FAVORITES ----------------

export async function addFavorite(verseId: string): Promise<void> {
  await initDatabase();
  const now = new Date().toISOString();

  if (sqliteDb) {
    try {
      sqliteDb.runSync(
        'INSERT OR IGNORE INTO favorites (verse_id, created_at) VALUES (?, ?);',
        [verseId, now]
      );
      return;
    } catch (e) {
      console.warn('DB addFavorite error, falling back to memory:', e);
    }
  }
  memoryStore.favorites.add(verseId);
}

export async function removeFavorite(verseId: string): Promise<void> {
  await initDatabase();
  if (sqliteDb) {
    try {
      sqliteDb.runSync('DELETE FROM favorites WHERE verse_id = ?;', [verseId]);
      return;
    } catch (e) {
      console.warn('DB removeFavorite error:', e);
    }
  }
  memoryStore.favorites.delete(verseId);
}

export async function isFavorite(verseId: string): Promise<boolean> {
  await initDatabase();
  if (sqliteDb) {
    try {
      const row = sqliteDb.getFirstSync(
        'SELECT verse_id FROM favorites WHERE verse_id = ?;',
        [verseId]
      );
      return Boolean(row);
    } catch (e) {
      console.warn('DB isFavorite error:', e);
    }
  }
  return memoryStore.favorites.has(verseId);
}

export async function getFavoriteIds(): Promise<string[]> {
  await initDatabase();
  if (sqliteDb) {
    try {
      const rows = sqliteDb.getAllSync(
        'SELECT verse_id FROM favorites ORDER BY created_at DESC;'
      ) as { verse_id: string }[];
      return rows.map(r => r.verse_id);
    } catch (e) {
      console.warn('DB getFavoriteIds error:', e);
    }
  }
  return Array.from(memoryStore.favorites);
}

export async function getFavorites(poetId?: PoetId | 'all'): Promise<Verse[]> {
  const ids = await getFavoriteIds();
  const verses: Verse[] = [];
  for (const id of ids) {
    const v = getVerseById(id);
    if (v) {
      if (!poetId || poetId === 'all' || v.poetId === poetId) {
        verses.push(v);
      }
    }
  }
  return verses;
}

// ---------------- COLLECTIONS ----------------

export async function getCollections(): Promise<Collection[]> {
  await initDatabase();
  if (sqliteDb) {
    try {
      const rows = sqliteDb.getAllSync(
        `SELECT c.id, c.name, c.created_at, c.updated_at, COUNT(cv.verse_id) as verse_count
         FROM collections c
         LEFT JOIN collection_verses cv ON c.id = cv.collection_id
         GROUP BY c.id
         ORDER BY c.created_at DESC;`
      ) as any[];

      return rows.map(r => ({
        id: r.id,
        name: r.name,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        verseCount: Number(r.verse_count || 0),
      }));
    } catch (e) {
      console.warn('DB getCollections error:', e);
    }
  }

  const list: Collection[] = [];
  memoryStore.collections.forEach(c => {
    const items = memoryStore.collectionVerses.get(c.id) || [];
    list.push({ ...c, verseCount: items.length });
  });
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createCollection(name: string): Promise<Collection> {
  await initDatabase();
  const id = `col-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const trimmedName = name.trim();

  if (sqliteDb) {
    try {
      sqliteDb.runSync(
        'INSERT INTO collections (id, name, created_at, updated_at) VALUES (?, ?, ?, ?);',
        [id, trimmedName, now, now]
      );
      return { id, name: trimmedName, createdAt: now, updatedAt: now, verseCount: 0 };
    } catch (e) {
      console.warn('DB createCollection error:', e);
    }
  }

  const col = { id, name: trimmedName, createdAt: now, updatedAt: now, verseCount: 0 };
  memoryStore.collections.set(id, col);
  memoryStore.collectionVerses.set(id, []);
  return col;
}

export async function updateCollectionName(id: string, name: string): Promise<void> {
  await initDatabase();
  const now = new Date().toISOString();
  const trimmedName = name.trim();

  if (sqliteDb) {
    try {
      sqliteDb.runSync(
        'UPDATE collections SET name = ?, updated_at = ? WHERE id = ?;',
        [trimmedName, now, id]
      );
      return;
    } catch (e) {
      console.warn('DB updateCollectionName error:', e);
    }
  }

  const col = memoryStore.collections.get(id);
  if (col) {
    col.name = trimmedName;
    col.updatedAt = now;
  }
}

export async function deleteCollection(id: string): Promise<void> {
  await initDatabase();
  if (sqliteDb) {
    try {
      sqliteDb.runSync('DELETE FROM collection_verses WHERE collection_id = ?;', [id]);
      sqliteDb.runSync('DELETE FROM collections WHERE id = ?;', [id]);
      return;
    } catch (e) {
      console.warn('DB deleteCollection error:', e);
    }
  }

  memoryStore.collections.delete(id);
  memoryStore.collectionVerses.delete(id);
}

export async function getCollectionVerses(collectionId: string): Promise<Verse[]> {
  await initDatabase();
  if (sqliteDb) {
    try {
      const rows = sqliteDb.getAllSync(
        'SELECT verse_id FROM collection_verses WHERE collection_id = ? ORDER BY order_index ASC;',
        [collectionId]
      ) as { verse_id: string }[];

      const verses: Verse[] = [];
      for (const r of rows) {
        const v = getVerseById(r.verse_id);
        if (v) verses.push(v);
      }
      return verses;
    } catch (e) {
      console.warn('DB getCollectionVerses error:', e);
    }
  }

  const items = memoryStore.collectionVerses.get(collectionId) || [];
  const sorted = [...items].sort((a, b) => a.orderIndex - b.orderIndex);
  const verses: Verse[] = [];
  for (const item of sorted) {
    const v = getVerseById(item.verseId);
    if (v) verses.push(v);
  }
  return verses;
}

export async function addVerseToCollection(collectionId: string, verseId: string): Promise<boolean> {
  await initDatabase();
  const now = new Date().toISOString();

  if (sqliteDb) {
    try {
      // Check existing to prevent accidental duplicates
      const existing = sqliteDb.getFirstSync(
        'SELECT 1 FROM collection_verses WHERE collection_id = ? AND verse_id = ?;',
        [collectionId, verseId]
      );
      if (existing) return false;

      const maxOrder = sqliteDb.getFirstSync(
        'SELECT MAX(order_index) as max_idx FROM collection_verses WHERE collection_id = ?;',
        [collectionId]
      ) as { max_idx: number | null };

      const nextOrder = (maxOrder?.max_idx !== null && maxOrder?.max_idx !== undefined)
        ? maxOrder.max_idx + 1
        : 0;

      sqliteDb.runSync(
        'INSERT INTO collection_verses (collection_id, verse_id, order_index, added_at) VALUES (?, ?, ?, ?);',
        [collectionId, verseId, nextOrder, now]
      );
      sqliteDb.runSync('UPDATE collections SET updated_at = ? WHERE id = ?;', [now, collectionId]);
      return true;
    } catch (e) {
      console.warn('DB addVerseToCollection error:', e);
    }
  }

  const items = memoryStore.collectionVerses.get(collectionId) || [];
  if (items.some(i => i.verseId === verseId)) return false;

  const nextOrder = items.length;
  items.push({ verseId, orderIndex: nextOrder, addedAt: now });
  memoryStore.collectionVerses.set(collectionId, items);
  return true;
}

export async function removeVerseFromCollection(collectionId: string, verseId: string): Promise<void> {
  await initDatabase();
  if (sqliteDb) {
    try {
      sqliteDb.runSync(
        'DELETE FROM collection_verses WHERE collection_id = ? AND verse_id = ?;',
        [collectionId, verseId]
      );
      return;
    } catch (e) {
      console.warn('DB removeVerseFromCollection error:', e);
    }
  }

  const items = memoryStore.collectionVerses.get(collectionId) || [];
  memoryStore.collectionVerses.set(collectionId, items.filter(i => i.verseId !== verseId));
}

export async function reorderCollectionVerses(collectionId: string, verseIds: string[]): Promise<void> {
  await initDatabase();
  if (sqliteDb) {
    try {
      for (let i = 0; i < verseIds.length; i++) {
        sqliteDb.runSync(
          'UPDATE collection_verses SET order_index = ? WHERE collection_id = ? AND verse_id = ?;',
          [i, collectionId, verseIds[i]]
        );
      }
      return;
    } catch (e) {
      console.warn('DB reorderCollectionVerses error:', e);
    }
  }

  const now = new Date().toISOString();
  const items = verseIds.map((vId, idx) => ({
    verseId: vId,
    orderIndex: idx,
    addedAt: now,
  }));
  memoryStore.collectionVerses.set(collectionId, items);
}

// ---------------- READING PROGRESS & LAST READ ----------------

export async function setLastRead(poetId: PoetId, verseNumber: number, verseId: string): Promise<void> {
  await initDatabase();
  const now = new Date().toISOString();

  if (sqliteDb) {
    try {
      sqliteDb.runSync(
        `INSERT INTO last_read (id, poet_id, verse_number, verse_id, updated_at)
         VALUES (1, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           poet_id = excluded.poet_id,
           verse_number = excluded.verse_number,
           verse_id = excluded.verse_id,
           updated_at = excluded.updated_at;`,
        [poetId, verseNumber, verseId, now]
      );
      return;
    } catch (e) {
      console.warn('DB setLastRead error:', e);
    }
  }

  memoryStore.lastRead = { poetId, verseNumber, verseId, timestamp: now };
}

export async function getLastRead(): Promise<LastReadRecord | null> {
  await initDatabase();
  if (sqliteDb) {
    try {
      const row = sqliteDb.getFirstSync(
        'SELECT poet_id, verse_number, verse_id, updated_at FROM last_read WHERE id = 1;'
      ) as any;
      if (row) {
        return {
          poetId: row.poet_id as PoetId,
          verseNumber: row.verse_number,
          verseId: row.verse_id,
          timestamp: row.updated_at,
        };
      }
      return null;
    } catch (e) {
      console.warn('DB getLastRead error:', e);
    }
  }
  return memoryStore.lastRead;
}

export async function markVerseAsRead(verseId: string): Promise<void> {
  await initDatabase();
  const now = new Date().toISOString();
  if (sqliteDb) {
    try {
      sqliteDb.runSync(
        'INSERT OR IGNORE INTO read_history (verse_id, read_at) VALUES (?, ?);',
        [verseId, now]
      );
      return;
    } catch (e) {
      console.warn('DB markVerseAsRead error:', e);
    }
  }
  memoryStore.readHistory.add(verseId);
}

export async function unmarkVerseAsRead(verseId: string): Promise<void> {
  await initDatabase();
  if (sqliteDb) {
    try {
      sqliteDb.runSync('DELETE FROM read_history WHERE verse_id = ?;', [verseId]);
      return;
    } catch (e) {
      console.warn('DB unmarkVerseAsRead error:', e);
    }
  }
  memoryStore.readHistory.delete(verseId);
}

export async function isVerseRead(verseId: string): Promise<boolean> {
  await initDatabase();
  if (sqliteDb) {
    try {
      const row = sqliteDb.getFirstSync(
        'SELECT 1 FROM read_history WHERE verse_id = ?;',
        [verseId]
      );
      return Boolean(row);
    } catch (e) {
      console.warn('DB isVerseRead error:', e);
    }
  }
  return memoryStore.readHistory.has(verseId);
}

export async function getReadVerseIds(): Promise<string[]> {
  await initDatabase();
  if (sqliteDb) {
    try {
      const rows = sqliteDb.getAllSync(
        'SELECT verse_id FROM read_history;'
      ) as { verse_id: string }[];
      return rows.map(r => r.verse_id);
    } catch (e) {
      console.warn('DB getReadVerseIds error:', e);
    }
  }
  return Array.from(memoryStore.readHistory);
}

export async function getReadCountByPoet(poetId: PoetId): Promise<number> {
  const readIds = new Set(await getReadVerseIds());
  const verses = getVersesByPoet(poetId);
  return verses.filter(v => readIds.has(v.id)).length;
}

export async function resetReadingProgress(): Promise<void> {
  await initDatabase();
  if (sqliteDb) {
    try {
      sqliteDb.runSync('DELETE FROM read_history;');
      sqliteDb.runSync('DELETE FROM last_read;');
      return;
    } catch (e) {
      console.warn('DB resetReadingProgress error:', e);
    }
  }
  memoryStore.readHistory.clear();
  memoryStore.lastRead = null;
}

// ---------------- SETTINGS ----------------

export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  await initDatabase();
  if (sqliteDb) {
    try {
      const row = sqliteDb.getFirstSync(
        'SELECT value FROM user_settings WHERE key = ?;',
        [key]
      ) as { value: string } | null;
      if (row) {
        return JSON.parse(row.value) as T;
      }
      return defaultValue;
    } catch (e) {
      console.warn('DB getSetting error:', e);
    }
  }

  const raw = memoryStore.settings.get(key);
  if (raw !== undefined) {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  }
  return defaultValue;
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  await initDatabase();
  const serialized = JSON.stringify(value);
  if (sqliteDb) {
    try {
      sqliteDb.runSync(
        `INSERT INTO user_settings (key, value) VALUES (?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value;`,
        [key, serialized]
      );
      return;
    } catch (e) {
      console.warn('DB setSetting error:', e);
    }
  }
  memoryStore.settings.set(key, serialized);
}

// ---------------- NOTIFICATION HISTORY ----------------

export async function recordDeliveredNotification(verseId: string): Promise<void> {
  await initDatabase();
  const now = new Date().toISOString();
  if (sqliteDb) {
    try {
      sqliteDb.runSync(
        'INSERT INTO notification_history (verse_id, delivered_at) VALUES (?, ?);',
        [verseId, now]
      );
      return;
    } catch (e) {
      console.warn('DB recordDeliveredNotification error:', e);
    }
  }
  memoryStore.notificationHistory.push({ verseId, deliveredAt: now });
}

export async function getRecentNotificationVerseIds(limit: number = 30): Promise<string[]> {
  await initDatabase();
  if (sqliteDb) {
    try {
      const rows = sqliteDb.getAllSync(
        'SELECT verse_id FROM notification_history ORDER BY delivered_at DESC LIMIT ?;',
        [limit]
      ) as { verse_id: string }[];
      return rows.map(r => r.verse_id);
    } catch (e) {
      console.warn('DB getRecentNotificationVerseIds error:', e);
    }
  }
  return memoryStore.notificationHistory.slice(-limit).map(h => h.verseId);
}
