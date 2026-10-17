import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NotificationSettings, Verse } from '../types';
import { getAllVerses, getVersesByPoet, getPoetById } from '../data/loader';
import { recordDeliveredNotification, getRecentNotificationVerseIds } from '../database/repository';
import { checkNotificationPermission, requestNotificationPermission } from './permissions';

let handlerConfigured = false;

export function setupNotificationHandler() {
  if (handlerConfigured || Platform.OS === 'web') return;

  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    handlerConfigured = true;
  } catch (e) {
    console.warn('Could not set notification handler:', e);
  }
}

export async function cancelAllDailyNotifications(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.warn('Error cancelling scheduled notifications:', error);
  }
}

export async function pickNextNotificationVerse(
  source: 'avvaiyar' | 'bharathiyar' | 'both'
): Promise<Verse> {
  let pool: Verse[];
  if (source === 'avvaiyar') pool = getVersesByPoet('avvaiyar');
  else if (source === 'bharathiyar') pool = getVersesByPoet('bharathiyar');
  else pool = getAllVerses();

  if (pool.length === 0) pool = getAllVerses();

  const recentIds = new Set(await getRecentNotificationVerseIds(pool.length - 1));
  const unreadPool = pool.filter(v => !recentIds.has(v.id));

  // If entire pool exhausted, reset and pick from full pool
  const candidatePool = unreadPool.length > 0 ? unreadPool : pool;
  const randomIndex = Math.floor(Math.random() * candidatePool.length);
  return candidatePool[randomIndex];
}

export async function scheduleDailyVerseNotification(
  settings: NotificationSettings
): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  setupNotificationHandler();

  // Always cancel existing to prevent multiple duplicate daily notifications
  await cancelAllDailyNotifications();

  if (!settings.enabled) {
    return null;
  }

  const hasPermission = await checkNotificationPermission();
  if (!hasPermission) {
    const granted = await requestNotificationPermission();
    if (!granted) {
      return null;
    }
  }

  const [hourStr, minuteStr] = settings.time.split(':');
  const hour = parseInt(hourStr || '7', 10);
  const minute = parseInt(minuteStr || '0', 10);

  const verse = await pickNextNotificationVerse(settings.source);
  const poet = getPoetById(verse.poetId);
  const poetName = poet ? poet.nameTa : verse.poetId;

  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: `📖 இன்றைய ஆத்திச்சூடி (${poetName})`,
        body: `"${verse.poem}" — பாடலின் முழுப் பொருளையும் படிக்கத் தொடவும்.`,
        data: {
          verseId: verse.id,
          poetId: verse.poetId,
          verseNumber: verse.number,
        },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });

    await recordDeliveredNotification(verse.id);
    return identifier;
  } catch (error) {
    console.warn('Error scheduling daily notification:', error);
    return null;
  }
}
