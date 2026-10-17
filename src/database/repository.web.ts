import { PoetId, Verse, Collection, LastReadRecord } from '../types';
import { getVerseById, getVersesByPoet } from '../data/loader';

const STORAGE_KEYS = {
  FAVORITES: 'aathichudi_favs',
  COLLECTIONS: 'aathichudi_cols',
  COLLECTION_VERSES: 'aathichudi_col_verses',
  READ_HISTORY: 'aathichudi_reads',
  LAST_READ: 'aathichudi_last_read',
  SETTINGS: 'aathichudi_settings',
  NOTIFICATIONS: 'aathichudi_notifs',
};

function getLocal<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        return JSON.parse(item);
      }
    }
  } catch (e) {
    console.warn('localStorage get error:', e);
  }
  return defaultValue;
}

function setLocal<T>(key: string, value: T): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (e) {
    console.warn('localStorage set error:', e);
  }
}

export async function initDatabase(): Promise<boolean> {
  return true;
}

// ---------------- FAVORITES ----------------

export async function addFavorite(verseId: string): Promise<void> {
  const favs = new Set(getLocal<string[]>(STORAGE_KEYS.FAVORITES, []));
  favs.add(verseId);
  setLocal(STORAGE_KEYS.FAVORITES, Array.from(favs));
}

export async function removeFavorite(verseId: string): Promise<void> {
  const favs = new Set(getLocal<string[]>(STORAGE_KEYS.FAVORITES, []));
  favs.delete(verseId);
  setLocal(STORAGE_KEYS.FAVORITES, Array.from(favs));
}

export async function isFavorite(verseId: string): Promise<boolean> {
  const favs = new Set(getLocal<string[]>(STORAGE_KEYS.FAVORITES, []));
  return favs.has(verseId);
}

export async function getFavoriteIds(): Promise<string[]> {
  return getLocal<string[]>(STORAGE_KEYS.FAVORITES, []);
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
  const cols = getLocal<Collection[]>(STORAGE_KEYS.COLLECTIONS, []);
  const colVerses = getLocal<Record<string, string[]>>(STORAGE_KEYS.COLLECTION_VERSES, {});
  return cols.map(c => ({
    ...c,
    verseCount: (colVerses[c.id] || []).length,
  }));
}

export async function createCollection(name: string): Promise<Collection> {
  const cols = getLocal<Collection[]>(STORAGE_KEYS.COLLECTIONS, []);
  const id = `col-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const newCol: Collection = {
    id,
    name: name.trim(),
    createdAt: now,
    updatedAt: now,
    verseCount: 0,
  };
  cols.unshift(newCol);
  setLocal(STORAGE_KEYS.COLLECTIONS, cols);

  const colVerses = getLocal<Record<string, string[]>>(STORAGE_KEYS.COLLECTION_VERSES, {});
  colVerses[id] = [];
  setLocal(STORAGE_KEYS.COLLECTION_VERSES, colVerses);

  return newCol;
}

export async function updateCollectionName(id: string, name: string): Promise<void> {
  const cols = getLocal<Collection[]>(STORAGE_KEYS.COLLECTIONS, []);
  const target = cols.find(c => c.id === id);
  if (target) {
    target.name = name.trim();
    target.updatedAt = new Date().toISOString();
    setLocal(STORAGE_KEYS.COLLECTIONS, cols);
  }
}

export async function deleteCollection(id: string): Promise<void> {
  const cols = getLocal<Collection[]>(STORAGE_KEYS.COLLECTIONS, []);
  setLocal(STORAGE_KEYS.COLLECTIONS, cols.filter(c => c.id !== id));

  const colVerses = getLocal<Record<string, string[]>>(STORAGE_KEYS.COLLECTION_VERSES, {});
  delete colVerses[id];
  setLocal(STORAGE_KEYS.COLLECTION_VERSES, colVerses);
}

export async function getCollectionVerses(collectionId: string): Promise<Verse[]> {
  const colVerses = getLocal<Record<string, string[]>>(STORAGE_KEYS.COLLECTION_VERSES, {});
  const ids = colVerses[collectionId] || [];
  const verses: Verse[] = [];
  for (const id of ids) {
    const v = getVerseById(id);
    if (v) verses.push(v);
  }
  return verses;
}

export async function addVerseToCollection(collectionId: string, verseId: string): Promise<boolean> {
  const colVerses = getLocal<Record<string, string[]>>(STORAGE_KEYS.COLLECTION_VERSES, {});
  const ids = colVerses[collectionId] || [];
  if (ids.includes(verseId)) return false;

  ids.push(verseId);
  colVerses[collectionId] = ids;
  setLocal(STORAGE_KEYS.COLLECTION_VERSES, colVerses);

  const cols = getLocal<Collection[]>(STORAGE_KEYS.COLLECTIONS, []);
  const col = cols.find(c => c.id === collectionId);
  if (col) {
    col.updatedAt = new Date().toISOString();
    setLocal(STORAGE_KEYS.COLLECTIONS, cols);
  }
  return true;
}

export async function removeVerseFromCollection(collectionId: string, verseId: string): Promise<void> {
  const colVerses = getLocal<Record<string, string[]>>(STORAGE_KEYS.COLLECTION_VERSES, {});
  const ids = colVerses[collectionId] || [];
  colVerses[collectionId] = ids.filter(id => id !== verseId);
  setLocal(STORAGE_KEYS.COLLECTION_VERSES, colVerses);
}

export async function reorderCollectionVerses(collectionId: string, verseIds: string[]): Promise<void> {
  const colVerses = getLocal<Record<string, string[]>>(STORAGE_KEYS.COLLECTION_VERSES, {});
  colVerses[collectionId] = verseIds;
  setLocal(STORAGE_KEYS.COLLECTION_VERSES, colVerses);
}

// ---------------- READING PROGRESS ----------------

export async function setLastRead(poetId: PoetId, verseNumber: number, verseId: string): Promise<void> {
  setLocal(STORAGE_KEYS.LAST_READ, {
    poetId,
    verseNumber,
    verseId,
    timestamp: new Date().toISOString(),
  });
}

export async function getLastRead(): Promise<LastReadRecord | null> {
  return getLocal<LastReadRecord | null>(STORAGE_KEYS.LAST_READ, null);
}

export async function markVerseAsRead(verseId: string): Promise<void> {
  const reads = new Set(getLocal<string[]>(STORAGE_KEYS.READ_HISTORY, []));
  reads.add(verseId);
  setLocal(STORAGE_KEYS.READ_HISTORY, Array.from(reads));
}

export async function unmarkVerseAsRead(verseId: string): Promise<void> {
  const reads = new Set(getLocal<string[]>(STORAGE_KEYS.READ_HISTORY, []));
  reads.delete(verseId);
  setLocal(STORAGE_KEYS.READ_HISTORY, Array.from(reads));
}

export async function isVerseRead(verseId: string): Promise<boolean> {
  const reads = new Set(getLocal<string[]>(STORAGE_KEYS.READ_HISTORY, []));
  return reads.has(verseId);
}

export async function getReadVerseIds(): Promise<string[]> {
  return getLocal<string[]>(STORAGE_KEYS.READ_HISTORY, []);
}

export async function getReadCountByPoet(poetId: PoetId): Promise<number> {
  const readIds = new Set(await getReadVerseIds());
  const verses = getVersesByPoet(poetId);
  return verses.filter(v => readIds.has(v.id)).length;
}

export async function resetReadingProgress(): Promise<void> {
  setLocal(STORAGE_KEYS.READ_HISTORY, []);
  setLocal(STORAGE_KEYS.LAST_READ, null);
}

// ---------------- SETTINGS ----------------

export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  const settings = getLocal<Record<string, any>>(STORAGE_KEYS.SETTINGS, {});
  return settings[key] !== undefined ? settings[key] : defaultValue;
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  const settings = getLocal<Record<string, any>>(STORAGE_KEYS.SETTINGS, {});
  settings[key] = value;
  setLocal(STORAGE_KEYS.SETTINGS, settings);
}

// ---------------- NOTIFICATIONS ----------------

export async function recordDeliveredNotification(verseId: string): Promise<void> {
  const history = getLocal<{ verseId: string; deliveredAt: string }[]>(STORAGE_KEYS.NOTIFICATIONS, []);
  history.push({ verseId, deliveredAt: new Date().toISOString() });
  setLocal(STORAGE_KEYS.NOTIFICATIONS, history);
}

export async function getRecentNotificationVerseIds(limit: number = 30): Promise<string[]> {
  const history = getLocal<{ verseId: string; deliveredAt: string }[]>(STORAGE_KEYS.NOTIFICATIONS, []);
  return history.slice(-limit).map(h => h.verseId);
}
