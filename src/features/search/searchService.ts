import { Verse, PoetId } from '../../types';
import { getAllVerses } from '../../data/loader';

export interface SearchResult {
  verse: Verse;
  matchedFields: ('poem' | 'meaning' | 'paraphrase' | 'transliteration' | 'translation' | 'number')[];
  matchSnippet?: string;
}

export interface SearchOptions {
  poetId?: PoetId | 'all';
  limit?: number;
}

/**
 * Normalizes input for search comparison without destroying Tamil vowel signs or compound characters.
 */
function cleanQuery(text: string): string {
  return text.trim().toLowerCase();
}

export function searchVerses(
  query: string,
  options: SearchOptions = {}
): SearchResult[] {
  const { poetId = 'all', limit } = options;
  const rawQ = query.trim();

  if (!rawQ) return [];

  const q = cleanQuery(rawQ);
  const qIsNumeric = /^\d+$/.test(q);
  const qNum = qIsNumeric ? parseInt(q, 10) : null;

  const pool = getAllVerses().filter(v => {
    if (poetId !== 'all' && v.poetId !== poetId) return false;
    return true;
  });

  const results: SearchResult[] = [];

  for (const verse of pool) {
    const matchedFields: SearchResult['matchedFields'] = [];
    let matchSnippet: string | undefined;

    // 1. Number match
    if (qNum !== null && verse.number === qNum) {
      matchedFields.push('number');
      matchSnippet = `பாடல் எண்: ${verse.number}`;
    }

    // 2. Poem Tamil text match
    if (verse.poem.toLowerCase().includes(q)) {
      matchedFields.push('poem');
      if (!matchSnippet) matchSnippet = verse.poem;
    }

    // 3. Meaning match
    if (verse.meaning && verse.meaning.toLowerCase().includes(q)) {
      matchedFields.push('meaning');
      if (!matchSnippet) matchSnippet = verse.meaning;
    }

    // 4. Paraphrase match
    if (verse.paraphrase && verse.paraphrase.toLowerCase().includes(q)) {
      matchedFields.push('paraphrase');
      if (!matchSnippet) matchSnippet = verse.paraphrase;
    }

    // 5. Transliteration match
    if (verse.transliteration && verse.transliteration.toLowerCase().includes(q)) {
      matchedFields.push('transliteration');
      if (!matchSnippet) matchSnippet = verse.transliteration;
    }

    // 6. English translation match
    if (verse.translation && verse.translation.toLowerCase().includes(q)) {
      matchedFields.push('translation');
      if (!matchSnippet) matchSnippet = verse.translation;
    }

    if (matchedFields.length > 0) {
      results.push({ verse, matchedFields, matchSnippet });
    }

    if (limit && results.length >= limit) break;
  }

  return results;
}
