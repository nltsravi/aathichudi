import { searchVerses } from '../src/features/search/searchService';

describe('Search Functionality', () => {
  test('empty query returns empty array', () => {
    expect(searchVerses('')).toEqual([]);
    expect(searchVerses('   ')).toEqual([]);
  });

  test('searches by Tamil poem text', () => {
    const results = searchVerses('அறஞ்செய விரும்பு');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].verse.id).toBe('avvaiyar-1');
    expect(results[0].matchedFields).toContain('poem');
  });

  test('searches by Latin transliteration', () => {
    const results = searchVerses('Acham thavir');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].verse.id).toBe('bharathiyar-1');
    expect(results[0].matchedFields).toContain('transliteration');
  });

  test('searches by English translation', () => {
    const results = searchVerses('Anger is temporary');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].verse.id).toBe('avvaiyar-2');
    expect(results[0].matchedFields).toContain('translation');
  });

  test('searches by Tamil meaning', () => {
    const results = searchVerses('தருமத்தை');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].matchedFields).toContain('meaning');
  });

  test('searches by verse number', () => {
    const results = searchVerses('43', { poetId: 'avvaiyar' });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].verse.number).toBe(43);
    expect(results[0].matchedFields).toContain('number');
  });

  test('filters accurately by poet', () => {
    const avvaiyarResults = searchVerses('அ', { poetId: 'avvaiyar' });
    avvaiyarResults.forEach(r => expect(r.verse.poetId).toBe('avvaiyar'));

    const bharathiyarResults = searchVerses('அ', { poetId: 'bharathiyar' });
    bharathiyarResults.forEach(r => expect(r.verse.poetId).toBe('bharathiyar'));
  });

  test('handles no-results query gracefully', () => {
    const results = searchVerses('xyznonexistentterm12345');
    expect(results).toEqual([]);
  });
});
