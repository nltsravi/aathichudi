import {
  initDatabase,
  addFavorite,
  removeFavorite,
  isFavorite,
  getFavorites,
  createCollection,
  updateCollectionName,
  deleteCollection,
  getCollections,
  addVerseToCollection,
  removeVerseFromCollection,
  getCollectionVerses,
  reorderCollectionVerses,
  setLastRead,
  getLastRead,
  markVerseAsRead,
  isVerseRead,
  getReadCountByPoet,
  resetReadingProgress,
  getSetting,
  setSetting,
} from '../src/database/repository';

describe('Local Persistence Repository', () => {
  beforeAll(async () => {
    await initDatabase();
  });

  describe('Favorites', () => {
    test('can add and remove favorites', async () => {
      expect(await isFavorite('avvaiyar-1')).toBe(false);
      await addFavorite('avvaiyar-1');
      expect(await isFavorite('avvaiyar-1')).toBe(true);

      const favs = await getFavorites('avvaiyar');
      expect(favs.some(v => v.id === 'avvaiyar-1')).toBe(true);

      await removeFavorite('avvaiyar-1');
      expect(await isFavorite('avvaiyar-1')).toBe(false);
    });
  });

  describe('Collections', () => {
    test('create, update, and manage collection verses', async () => {
      const col = await createCollection('Morning Wisdom');
      expect(col.name).toBe('Morning Wisdom');
      expect(col.id).toBeTruthy();

      // Add verses
      const added1 = await addVerseToCollection(col.id, 'avvaiyar-1');
      const added2 = await addVerseToCollection(col.id, 'bharathiyar-1');
      expect(added1).toBe(true);
      expect(added2).toBe(true);

      // Prevent duplicate membership
      const addedDuplicate = await addVerseToCollection(col.id, 'avvaiyar-1');
      expect(addedDuplicate).toBe(false);

      const verses = await getCollectionVerses(col.id);
      expect(verses.length).toBe(2);
      expect(verses[0].id).toBe('avvaiyar-1');
      expect(verses[1].id).toBe('bharathiyar-1');

      // Reorder verses
      await reorderCollectionVerses(col.id, ['bharathiyar-1', 'avvaiyar-1']);
      const reordered = await getCollectionVerses(col.id);
      expect(reordered[0].id).toBe('bharathiyar-1');
      expect(reordered[1].id).toBe('avvaiyar-1');

      // Remove single verse
      await removeVerseFromCollection(col.id, 'avvaiyar-1');
      const afterRemoval = await getCollectionVerses(col.id);
      expect(afterRemoval.length).toBe(1);
      expect(afterRemoval[0].id).toBe('bharathiyar-1');

      // Update name
      await updateCollectionName(col.id, 'Daily Morning Study');
      const allCols = await getCollections();
      const updated = allCols.find(c => c.id === col.id);
      expect(updated?.name).toBe('Daily Morning Study');

      // Delete collection
      await deleteCollection(col.id);
      const afterDelete = await getCollections();
      expect(afterDelete.some(c => c.id === col.id)).toBe(false);
    });
  });

  describe('Reading Progress & History', () => {
    test('tracks last read and read status', async () => {
      await setLastRead('avvaiyar', 5, 'avvaiyar-5');
      const lastRead = await getLastRead();
      expect(lastRead).not.toBeNull();
      expect(lastRead?.poetId).toBe('avvaiyar');
      expect(lastRead?.verseNumber).toBe(5);
      expect(lastRead?.verseId).toBe('avvaiyar-5');

      await markVerseAsRead('avvaiyar-5');
      expect(await isVerseRead('avvaiyar-5')).toBe(true);

      const count = await getReadCountByPoet('avvaiyar');
      expect(count).toBeGreaterThan(0);

      // Reset reading progress should not affect favorites
      await addFavorite('bharathiyar-10');
      await resetReadingProgress();

      const clearedLastRead = await getLastRead();
      expect(clearedLastRead).toBeNull();
      expect(await isVerseRead('avvaiyar-5')).toBe(false);

      // Favorite must still be preserved!
      expect(await isFavorite('bharathiyar-10')).toBe(true);
      await removeFavorite('bharathiyar-10');
    });
  });

  describe('Settings', () => {
    test('persists user settings with defaults', async () => {
      const defaultTheme = await getSetting('themeMode', 'system');
      expect(defaultTheme).toBe('system');

      await setSetting('themeMode', 'dark');
      const updatedTheme = await getSetting('themeMode', 'system');
      expect(updatedTheme).toBe('dark');
    });
  });
});
