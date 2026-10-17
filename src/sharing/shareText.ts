import { Share, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Verse } from '../types';
import { getPoetById } from '../data/loader';

export interface FormatOptions {
  includeMeaning?: boolean;
  includeParaphrase?: boolean;
  includeTransliteration?: boolean;
  includeTranslation?: boolean;
  includeAttribution?: boolean;
}

export const APP_ATTRIBUTION = '— பகிர்ந்தது: ஆத்திச்சூடி (Aathichudi App)';

export function formatVerseText(
  verse: Verse,
  options: FormatOptions = {}
): string {
  const {
    includeMeaning = true,
    includeParaphrase = true,
    includeTransliteration = true,
    includeTranslation = true,
    includeAttribution = true,
  } = options;

  const poet = getPoetById(verse.poetId);
  const poetName = poet ? poet.nameTa : (verse.poetId === 'avvaiyar' ? 'ஔவையார்' : 'பாரதியார்');

  const parts: string[] = [];

  // Header
  parts.push(`📖 ${poetName} ஆத்திச்சூடி — பாடல் ${verse.number}`);
  parts.push('');

  // Main poem
  parts.push(`✨ "${verse.poem}"`);

  // Meaning
  if (includeMeaning && verse.meaning) {
    parts.push('');
    parts.push(`பொருள்:\n${verse.meaning}`);
  }

  // Paraphrase
  if (includeParaphrase && verse.paraphrase) {
    parts.push('');
    parts.push(`விளக்கம்:\n${verse.paraphrase}`);
  }

  // Transliteration
  if (includeTransliteration && verse.transliteration) {
    parts.push('');
    parts.push(`Transliteration:\n${verse.transliteration}`);
  }

  // Translation
  if (includeTranslation && verse.translation) {
    parts.push('');
    parts.push(`Translation:\n${verse.translation}`);
  }

  // Attribution
  if (includeAttribution) {
    parts.push('');
    parts.push(APP_ATTRIBUTION);
  }

  return parts.join('\n');
}

export function formatCollectionText(
  collectionName: string,
  verses: Verse[],
  includeAttribution: boolean = true
): string {
  const parts: string[] = [];
  parts.push(`📚 தொகுப்பு: ${collectionName}`);
  parts.push(`மொத்தப் பாடல்கள்: ${verses.length}`);
  parts.push('═══════════════════════════════════════');
  parts.push('');

  verses.forEach((v, index) => {
    const poet = getPoetById(v.poetId);
    const poetName = poet ? poet.nameTa : v.poetId;
    parts.push(`${index + 1}. [${poetName} - ${v.number}] ${v.poem}`);
    if (v.meaning) {
      parts.push(`   பொருள்: ${v.meaning}`);
    }
    if (v.translation) {
      parts.push(`   English: ${v.translation}`);
    }
    parts.push('');
  });

  if (includeAttribution) {
    parts.push(APP_ATTRIBUTION);
  }

  return parts.join('\n');
}

export async function shareText(text: string, title: string = 'ஆத்திச்சூடி பாடல்'): Promise<boolean> {
  try {
    const result = await Share.share(
      {
        message: text,
        title,
      },
      {
        dialogTitle: title,
      }
    );
    return result.action === Share.sharedAction;
  } catch (error) {
    console.warn('Share error:', error);
    return false;
  }
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await Clipboard.setStringAsync(text);
    return true;
  } catch (error) {
    console.warn('Clipboard copy error:', error);
    return false;
  }
}
