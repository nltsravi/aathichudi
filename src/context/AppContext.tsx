import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { PoetId, UserSettings, LastReadRecord, ThemeMode } from '../types';
import { ThemeColors, lightColors, darkColors, defaultSettings } from '../theme';
import {
  initDatabase,
  getFavoriteIds,
  addFavorite,
  removeFavorite,
  getReadVerseIds,
  markVerseAsRead,
  unmarkVerseAsRead,
  getLastRead,
  setLastRead,
  getSetting,
  setSetting,
} from '../database/repository';

interface AppContextValue {
  theme: ThemeColors;
  isDark: boolean;
  settings: UserSettings;
  updateSettings: (partial: Partial<UserSettings>) => Promise<void>;
  favoriteIds: Set<string>;
  isFav: (verseId: string) => boolean;
  toggleFav: (verseId: string) => Promise<boolean>;
  readVerseIds: Set<string>;
  isRead: (verseId: string) => boolean;
  toggleRead: (verseId: string) => Promise<boolean>;
  lastRead: LastReadRecord | null;
  recordLastRead: (poetId: PoetId, verseNumber: number, verseId: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
  isLoaded: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isLoaded, setIsLoaded] = useState(false);

  const [settings, setSettings] = useState<UserSettings>({
    themeMode: 'system',
    ...defaultSettings,
  });

  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [readVerseIds, setReadVerseIds] = useState<Set<string>>(new Set());
  const [lastRead, setLastReadState] = useState<LastReadRecord | null>(null);

  const refreshUserData = useCallback(async () => {
    try {
      await initDatabase();
      const [favs, reads, lr, savedSettings] = await Promise.all([
        getFavoriteIds(),
        getReadVerseIds(),
        getLastRead(),
        getSetting<UserSettings>('user_settings', {
          themeMode: 'system',
          ...defaultSettings,
        }),
      ]);

      setFavoriteIds(new Set(favs));
      setReadVerseIds(new Set(reads));
      setLastReadState(lr);
      if (savedSettings) {
        setSettings(savedSettings);
      }
    } catch (e) {
      console.warn('Error refreshing app state:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    refreshUserData();
  }, [refreshUserData]);

  const updateSettings = useCallback(async (partial: Partial<UserSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...partial };
      setSetting('user_settings', next);
      return next;
    });
  }, []);

  const isDark = useMemo(() => {
    if (settings.themeMode === 'dark') return true;
    if (settings.themeMode === 'light') return false;
    return systemColorScheme === 'dark';
  }, [settings.themeMode, systemColorScheme]);

  const theme = useMemo(() => (isDark ? darkColors : lightColors), [isDark]);

  const isFav = useCallback((verseId: string) => favoriteIds.has(verseId), [favoriteIds]);

  const toggleFav = useCallback(async (verseId: string) => {
    const isCurrentlyFav = favoriteIds.has(verseId);
    if (isCurrentlyFav) {
      await removeFavorite(verseId);
      setFavoriteIds(prev => {
        const next = new Set(prev);
        next.delete(verseId);
        return next;
      });
      return false;
    } else {
      await addFavorite(verseId);
      setFavoriteIds(prev => {
        const next = new Set(prev);
        next.add(verseId);
        return next;
      });
      return true;
    }
  }, [favoriteIds]);

  const isRead = useCallback((verseId: string) => readVerseIds.has(verseId), [readVerseIds]);

  const toggleRead = useCallback(async (verseId: string) => {
    const isCurrentlyRead = readVerseIds.has(verseId);
    if (isCurrentlyRead) {
      await unmarkVerseAsRead(verseId);
      setReadVerseIds(prev => {
        const next = new Set(prev);
        next.delete(verseId);
        return next;
      });
      return false;
    } else {
      await markVerseAsRead(verseId);
      setReadVerseIds(prev => {
        const next = new Set(prev);
        next.add(verseId);
        return next;
      });
      return true;
    }
  }, [readVerseIds]);

  const recordLastRead = useCallback(async (poetId: PoetId, verseNumber: number, verseId: string) => {
    await setLastRead(poetId, verseNumber, verseId);
    setLastReadState({
      poetId,
      verseNumber,
      verseId,
      timestamp: new Date().toISOString(),
    });
  }, []);

  const value = useMemo<AppContextValue>(() => ({
    theme,
    isDark,
    settings,
    updateSettings,
    favoriteIds,
    isFav,
    toggleFav,
    readVerseIds,
    isRead,
    toggleRead,
    lastRead,
    recordLastRead,
    refreshUserData,
    isLoaded,
  }), [
    theme,
    isDark,
    settings,
    updateSettings,
    favoriteIds,
    isFav,
    toggleFav,
    readVerseIds,
    isRead,
    toggleRead,
    lastRead,
    recordLastRead,
    refreshUserData,
    isLoaded,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
