export type PoetId = 'avvaiyar' | 'bharathiyar';

export interface Verse {
  /** Unique stable ID, e.g. "avvaiyar-1", "bharathiyar-43" */
  id: string;
  poetId: PoetId;
  /** Original source number */
  number: number;
  /** Original Tamil poem */
  poem: string;
  /** Meaning in Tamil (optional) */
  meaning?: string;
  /** Expanded explanation in Tamil (optional) */
  paraphrase?: string;
  /** Latin script transliteration (optional) */
  transliteration?: string;
  /** English translation (optional) */
  translation?: string;
  /** 0-indexed position in the original source array */
  sourceIndex: number;
}

export interface IntroductoryPrayer {
  poetId: PoetId;
  title: string;
  lines: string[];
  meaning?: string;
  paraphrase?: string;
  translation?: string;
}

export interface PoetMeta {
  id: PoetId;
  nameTa: string;
  nameEn: string;
  period: string;
  descriptionTa: string;
  descriptionEn: string;
  totalVerses: number;
  kadavulVaazthu: IntroductoryPrayer | null;
}

export interface Collection {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  verseCount?: number;
}

export interface CollectionItem {
  collectionId: string;
  verseId: string;
  orderIndex: number;
  addedAt: string;
}

export interface NotificationSettings {
  enabled: boolean;
  time: string; // "HH:mm", e.g. "07:00"
  source: 'avvaiyar' | 'bharathiyar' | 'both';
}

export type ThemeMode = 'system' | 'light' | 'dark';

export interface UserSettings {
  themeMode: ThemeMode;
  poemFontSize: number;
  meaningFontSize: number;
  lineSpacingMultiplier: number;
  includeAttribution: boolean;
  hapticsEnabled: boolean;
}

export interface LastReadRecord {
  poetId: PoetId;
  verseNumber: number;
  verseId: string;
  timestamp: string;
}

export interface SearchFilters {
  poetId?: PoetId | 'all';
  query: string;
}
