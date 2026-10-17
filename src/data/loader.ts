import { PoetId, Verse, PoetMeta } from '../types';
import { normalizeDataset } from './normalize';
import avvaiyarJson from '../../assets/avvaiyar-aathichudi.json';
import bharathiyarJson from '../../assets/bharathiyar_aathichudi.json';

// Normalize both datasets
const avvaiyarNormalized = normalizeDataset(avvaiyarJson, 'avvaiyar');
const bharathiyarNormalized = normalizeDataset(bharathiyarJson, 'bharathiyar');

const ALL_VERSES: Verse[] = [
  ...avvaiyarNormalized.verses,
  ...bharathiyarNormalized.verses,
];

const VERSE_BY_ID = new Map<string, Verse>();
const VERSE_BY_POET_AND_NUM = new Map<string, Verse>();

ALL_VERSES.forEach(v => {
  VERSE_BY_ID.set(v.id, v);
  VERSE_BY_POET_AND_NUM.set(`${v.poetId}:${v.number}`, v);
});

export const POET_METAS: Record<PoetId, PoetMeta> = {
  avvaiyar: {
    id: 'avvaiyar',
    nameTa: 'ஔவையார்',
    nameEn: 'Avvaiyar',
    period: '12th Century CE',
    descriptionTa: 'ஔவையார் இயற்றிய ஆத்திச்சூடி, தமிழ் மொழியின் அகர வரிசையில் அமைந்த முதல் நீதி நூல். வாழ்வியல் நற்பண்புகளையும் அறநெறிகளையும் எளிய இருவரிப் பாடல்களில் போதிக்கிறது.',
    descriptionEn: "Avvaiyar's Aathichudi is a foundational collection of moral aphorisms in alphabetical Tamil order, imparting timeless ethical principles with poetic brevity.",
    totalVerses: avvaiyarNormalized.verses.length,
    kadavulVaazthu: avvaiyarNormalized.kadavulVaazthu,
  },
  bharathiyar: {
    id: 'bharathiyar',
    nameTa: 'மகாகவி பாரதியார்',
    nameEn: 'Mahakavi Bharathiyar',
    period: 'Early 20th Century (1882–1921)',
    descriptionTa: 'மகாகவி சுப்பிரமணிய பாரதியார் இயற்றிய புதிய ஆத்திச்சூடி, நவீன காலத்திற்கேற்ப துணிவும் வீரமும் அறிவியலும் சமூக விழிப்புணர்வும் கொண்ட புதிய தலைமுறையை உருவாக்கும் வழிகாட்டியாகும்.',
    descriptionEn: "Mahakavi Bharati's Puthiya Aathichudi revitalizes traditional wisdom for the modern era, inspiring courage, physical vitality, scientific curiosity, and fearlessness.",
    totalVerses: bharathiyarNormalized.verses.length,
    kadavulVaazthu: bharathiyarNormalized.kadavulVaazthu,
  },
};

export function getAllVerses(): Verse[] {
  return ALL_VERSES;
}

export function getVersesByPoet(poetId: PoetId): Verse[] {
  if (poetId === 'avvaiyar') return avvaiyarNormalized.verses;
  if (poetId === 'bharathiyar') return bharathiyarNormalized.verses;
  return [];
}

export function getVerseById(id: string): Verse | undefined {
  return VERSE_BY_ID.get(id);
}

export function getVerseByPoetAndNumber(poetId: PoetId, number: number): Verse | undefined {
  return VERSE_BY_POET_AND_NUM.get(`${poetId}:${number}`);
}

export function getAdjacentVerses(poetId: PoetId, currentNumber: number): {
  prevVerse: Verse | null;
  nextVerse: Verse | null;
  currentIndex: number;
  total: number;
} {
  const list = getVersesByPoet(poetId);
  const currentIndex = list.findIndex(v => v.number === currentNumber);

  if (currentIndex === -1) {
    return { prevVerse: null, nextVerse: null, currentIndex: -1, total: list.length };
  }

  const prevVerse = currentIndex > 0 ? list[currentIndex - 1] : null;
  const nextVerse = currentIndex < list.length - 1 ? list[currentIndex + 1] : null;

  return {
    prevVerse,
    nextVerse,
    currentIndex,
    total: list.length,
  };
}

export function getPoets(): PoetMeta[] {
  return [POET_METAS.avvaiyar, POET_METAS.bharathiyar];
}

export function getPoetById(poetId: PoetId): PoetMeta | undefined {
  return POET_METAS[poetId];
}

/**
 * Deterministically generates a daily verse based on calendar date
 * Ensures all verses cycle fairly without repeats before full exhaustion.
 */
export function getDailyVerse(
  date: Date = new Date(),
  source: 'avvaiyar' | 'bharathiyar' | 'both' = 'both'
): Verse {
  let pool: Verse[];
  if (source === 'avvaiyar') pool = avvaiyarNormalized.verses;
  else if (source === 'bharathiyar') pool = bharathiyarNormalized.verses;
  else pool = ALL_VERSES;

  if (pool.length === 0) return ALL_VERSES[0];

  // Calculate day of the year: epoch day
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diffTime = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const yearSalt = date.getFullYear() * 365;

  const index = (dayOfYear + yearSalt) % pool.length;
  return pool[index];
}
