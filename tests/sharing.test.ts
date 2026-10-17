import { formatVerseText, formatCollectionText, APP_ATTRIBUTION } from '../src/sharing/shareText';
import { generateHtmlForExport } from '../src/sharing/sharePdf';
import { getVerseById, getVersesByPoet } from '../src/data/loader';

describe('Sharing and Export Formatting', () => {
  const v1 = getVerseById('avvaiyar-1')!;
  const v2 = getVerseById('bharathiyar-1')!;

  test('formats poem text only when optional sections excluded', () => {
    const formatted = formatVerseText(v1, {
      includeMeaning: false,
      includeParaphrase: false,
      includeTransliteration: false,
      includeTranslation: false,
      includeAttribution: false,
    });

    expect(formatted).toContain('அறஞ்செய விரும்பு');
    expect(formatted).not.toContain('பொருள்:');
    expect(formatted).not.toContain('Transliteration:');
    expect(formatted).not.toContain(APP_ATTRIBUTION);
  });

  test('formats poem with meaning and paraphrase', () => {
    const formatted = formatVerseText(v1, {
      includeMeaning: true,
      includeParaphrase: true,
      includeTransliteration: false,
      includeTranslation: false,
      includeAttribution: true,
    });

    expect(formatted).toContain('அறஞ்செய விரும்பு');
    expect(formatted).toContain('பொருள்:');
    expect(formatted).toContain('விளக்கம்:');
    expect(formatted).toContain(APP_ATTRIBUTION);
  });

  test('formats poem with transliteration and English translation', () => {
    const formatted = formatVerseText(v2, {
      includeMeaning: false,
      includeParaphrase: false,
      includeTransliteration: true,
      includeTranslation: true,
      includeAttribution: false,
    });

    expect(formatted).toContain('அச்சம் தவிர்');
    expect(formatted).toContain('Transliteration:\nAcham thavir');
    expect(formatted).toContain('Translation:\nAvoid fear.');
  });

  test('formats collection text with multiple verses', () => {
    const formatted = formatCollectionText('காலைப் பாடம்', [v1, v2], true);
    expect(formatted).toContain('தொகுப்பு: காலைப் பாடம்');
    expect(formatted).toContain('மொத்தப் பாடல்கள்: 2');
    expect(formatted).toContain('அறஞ்செய விரும்பு');
    expect(formatted).toContain('அச்சம் தவிர்');
    expect(formatted).toContain(APP_ATTRIBUTION);
  });

  test('generates valid HTML for PDF export with Tamil characters and page formatting', () => {
    const html = generateHtmlForExport({
      title: 'தேர்ந்தெடுத்த ஆத்திச்சூடிப் பாடல்கள்',
      subtitle: 'மாணவர்களுக்கான நற்பண்புகள்',
      verses: [v1, v2],
    });

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('lang="ta"');
    expect(html).toContain('தேர்ந்தெடுத்த ஆத்திச்சூடிப் பாடல்கள்');
    expect(html).toContain('அறஞ்செய விரும்பு');
    expect(html).toContain('அச்சம் தவிர்');
    expect(html).toContain('Tamil Sangam MN'); // Tamil font family stack
    expect(html).toContain('page-break-inside: avoid');
  });
});
