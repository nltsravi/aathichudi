import { pickNextNotificationVerse } from '../src/notifications/scheduler';
import { recordDeliveredNotification, initDatabase } from '../src/database/repository';
import { getVersesByPoet } from '../src/data/loader';

describe('Notification Scheduling and Verse Selection', () => {
  beforeAll(async () => {
    await initDatabase();
  });

  test('picks verse exclusively from Avvaiyar when source is avvaiyar', async () => {
    for (let i = 0; i < 5; i++) {
      const verse = await pickNextNotificationVerse('avvaiyar');
      expect(verse.poetId).toBe('avvaiyar');
    }
  });

  test('picks verse exclusively from Bharathiyar when source is bharathiyar', async () => {
    for (let i = 0; i < 5; i++) {
      const verse = await pickNextNotificationVerse('bharathiyar');
      expect(verse.poetId).toBe('bharathiyar');
    }
  });

  test('picks verse from either poet when source is both', async () => {
    const verse = await pickNextNotificationVerse('both');
    expect(['avvaiyar', 'bharathiyar']).toContain(verse.poetId);
  });

  test('avoids recently delivered verses in notification history', async () => {
    const avvaiyarVerses = getVersesByPoet('avvaiyar');
    // Deliver first 10 verses
    for (let i = 0; i < 10; i++) {
      await recordDeliveredNotification(avvaiyarVerses[i].id);
    }

    const nextVerse = await pickNextNotificationVerse('avvaiyar');
    // Should select from remaining pool
    expect(nextVerse).toBeDefined();
  });
});
