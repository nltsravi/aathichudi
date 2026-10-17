import { PoetId, Verse, IntroductoryPrayer } from '../types';
import { RawAathichudiDataset, RawKadavulVaazthu, RawAathichoodiVerse } from './schemas';

export function normalizeIntroductoryPrayer(
  raw: RawKadavulVaazthu | undefined,
  poetId: PoetId
): IntroductoryPrayer | null {
  if (!raw) return null;

  const lines: string[] = [];
  if (raw.line1 && raw.line1.trim().length > 0) lines.push(raw.line1.trim());
  if (raw.line2 && raw.line2.trim().length > 0) lines.push(raw.line2.trim());

  for (let i = 1; i <= 30; i++) {
    const key = `poem${i}` as `poem${number}`;
    const val = raw[key];
    if (typeof val === 'string' && val.trim().length > 0) {
      lines.push(val.trim());
    }
  }

  if (lines.length === 0) return null;

  const meaning = raw.meaning && raw.meaning.trim().length > 0 ? raw.meaning.trim() : undefined;
  const paraphraseRaw = raw.paraphrase || raw.paraphase;
  const paraphrase = paraphraseRaw && paraphraseRaw.trim().length > 0 ? paraphraseRaw.trim() : undefined;
  const translation = raw.translation && raw.translation.trim().length > 0 ? raw.translation.trim() : undefined;

  return {
    poetId,
    title: 'கடவுள் வாழ்த்து',
    lines,
    meaning,
    paraphrase,
    translation,
  };
}

export function normalizeVerse(
  raw: RawAathichoodiVerse,
  poetId: PoetId,
  sourceIndex: number
): Verse {
  const num = typeof raw.number === 'number' ? raw.number : sourceIndex + 1;
  const poem = (raw.poem || '').trim();

  const meaning = raw.meaning && raw.meaning.trim().length > 0 ? raw.meaning.trim() : undefined;
  const paraphraseRaw = raw.paraphrase || raw.paraphase;
  const paraphrase = paraphraseRaw && paraphraseRaw.trim().length > 0 ? paraphraseRaw.trim() : undefined;
  const transliteration = raw.transliteration && raw.transliteration.trim().length > 0 ? raw.transliteration.trim() : undefined;
  const translation = raw.translation && raw.translation.trim().length > 0 ? raw.translation.trim() : undefined;

  return {
    id: `${poetId}-${num}`,
    poetId,
    number: num,
    poem,
    meaning,
    paraphrase,
    transliteration,
    translation,
    sourceIndex,
  };
}

export function normalizeDataset(raw: RawAathichudiDataset, poetId: PoetId): {
  kadavulVaazthu: IntroductoryPrayer | null;
  verses: Verse[];
} {
  const kadavulVaazthu = normalizeIntroductoryPrayer(raw.kadavul_vaazthu, poetId);
  const verses: Verse[] = [];

  if (Array.isArray(raw.aathichoodi)) {
    raw.aathichoodi.forEach((item, index) => {
      verses.push(normalizeVerse(item, poetId, index));
    });
  }

  return { kadavulVaazthu, verses };
}
