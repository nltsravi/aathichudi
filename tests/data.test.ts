import {
  getAllVerses,
  getVersesByPoet,
  getVerseById,
  getVerseByPoetAndNumber,
  getAdjacentVerses,
  getPoets,
  getDailyVerse,
} from '../src/data/loader';

describe('Aathichudi Data Layer', () => {
  test('both poet collections load with correct verse counts', () => {
    const avvaiyarVerses = getVersesByPoet('avvaiyar');
    const bharathiyarVerses = getVersesByPoet('bharathiyar');
    const allVerses = getAllVerses();

    expect(avvaiyarVerses.length).toBe(109);
    expect(bharathiyarVerses.length).toBe(110);
    expect(allVerses.length).toBe(219);
  });

  test('stable IDs are unique and well-formed', () => {
    const allVerses = getAllVerses();
    const ids = new Set<string>();

    allVerses.forEach(v => {
      expect(v.id).toMatch(/^(avvaiyar|bharathiyar)-\d+$/);
      expect(ids.has(v.id)).toBe(false);
      ids.add(v.id);
    });

    expect(ids.size).toBe(219);
  });

  test('source array ordering is strictly preserved', () => {
    const avvaiyar = getVersesByPoet('avvaiyar');
    avvaiyar.forEach((v, idx) => {
      expect(v.sourceIndex).toBe(idx);
    });

    const bharathiyar = getVersesByPoet('bharathiyar');
    bharathiyar.forEach((v, idx) => {
      expect(v.sourceIndex).toBe(idx);
    });
  });

  test('introductory prayers (kadavul_vaazthu) are preserved and correctly normalized', () => {
    const poets = getPoets();
    const avvaiyar = poets.find(p => p.id === 'avvaiyar');
    const bharathiyar = poets.find(p => p.id === 'bharathiyar');

    expect(avvaiyar).toBeDefined();
    expect(avvaiyar?.kadavulVaazthu).not.toBeNull();
    expect(avvaiyar?.kadavulVaazthu?.lines.length).toBe(2);
    expect(avvaiyar?.kadavulVaazthu?.meaning).toBeTruthy();
    expect(avvaiyar?.kadavulVaazthu?.paraphrase).toBeTruthy();

    expect(bharathiyar).toBeDefined();
    expect(bharathiyar?.kadavulVaazthu).not.toBeNull();
    expect(bharathiyar?.kadavulVaazthu?.lines.length).toBe(10);
    expect(bharathiyar?.kadavulVaazthu?.meaning).toBeTruthy();
    expect(bharathiyar?.kadavulVaazthu?.paraphrase).toBeTruthy();
    expect(bharathiyar?.kadavulVaazthu?.translation).toBeTruthy();
  });

  test('handles missing optional fields safely (Avvaiyar #43)', () => {
    const verse43 = getVerseByPoetAndNumber('avvaiyar', 43);
    expect(verse43).toBeDefined();
    expect(verse43?.poem).toBe('கெளவை அகற்று');
    expect(verse43?.meaning).toBeUndefined();
    expect(verse43?.paraphrase).toBeUndefined();
    expect(verse43?.transliteration).toBe('Kavvai agatru');
    expect(verse43?.translation).toBe("Don't vilify.");
  });

  test('lookup by ID works correctly', () => {
    const v1 = getVerseById('avvaiyar-1');
    expect(v1).toBeDefined();
    expect(v1?.poem).toBe('அறஞ்செய விரும்பு');
    expect(v1?.number).toBe(1);

    const b1 = getVerseById('bharathiyar-1');
    expect(b1).toBeDefined();
    expect(b1?.poem).toBe('அச்சம் தவிர்');
    expect(b1?.number).toBe(1);
  });

  test('adjacent verses navigation handles bounds and source order', () => {
    // First verse bounds
    const first = getAdjacentVerses('avvaiyar', 1);
    expect(first.prevVerse).toBeNull();
    expect(first.nextVerse).not.toBeNull();
    expect(first.nextVerse?.number).toBe(2);

    // Last verse bounds
    const last = getAdjacentVerses('avvaiyar', 109);
    expect(last.prevVerse).not.toBeNull();
    expect(last.prevVerse?.number).toBe(108);
    expect(last.nextVerse).toBeNull();

    // Middle verse
    const mid = getAdjacentVerses('bharathiyar', 50);
    expect(mid.prevVerse?.number).toBe(49);
    expect(mid.nextVerse?.number).toBe(51);
  });

  test('deterministic daily verse generation produces valid verse', () => {
    const date1 = new Date(2026, 9, 17);
    const date2 = new Date(2026, 9, 18);

    const v1 = getDailyVerse(date1, 'both');
    const v2 = getDailyVerse(date2, 'both');

    expect(v1).toBeDefined();
    expect(v2).toBeDefined();
    expect(v1.id).not.toBe(v2.id); // Different days produce different verses
  });
});
