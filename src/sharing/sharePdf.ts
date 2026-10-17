import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Verse } from '../types';
import { getPoetById } from '../data/loader';

export interface PdfExportOptions {
  title: string;
  subtitle?: string;
  verses: Verse[];
}

export function generateHtmlForExport(options: PdfExportOptions): string {
  const { title, subtitle, verses } = options;
  const now = new Date().toLocaleDateString('ta-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const versesHtml = verses
    .map((v, index) => {
      const poet = getPoetById(v.poetId);
      const poetName = poet ? poet.nameTa : v.poetId;

      return `
      <div class="verse-card">
        <div class="verse-header">
          <span class="verse-badge">${poetName} — பாடல் #${v.number}</span>
          <span class="verse-index">#${index + 1}</span>
        </div>
        <div class="verse-poem">${v.poem}</div>
        ${
          v.meaning
            ? `<div class="verse-section"><span class="section-label">பொருள்:</span> <span class="section-text">${v.meaning}</span></div>`
            : ''
        }
        ${
          v.paraphrase
            ? `<div class="verse-section"><span class="section-label">விளக்கம்:</span> <span class="section-text">${v.paraphrase}</span></div>`
            : ''
        }
        ${
          v.transliteration
            ? `<div class="verse-section-en"><span class="section-label-en">Transliteration:</span> <span class="section-text-en">${v.transliteration}</span></div>`
            : ''
        }
        ${
          v.translation
            ? `<div class="verse-section-en"><span class="section-label-en">Translation:</span> <span class="section-text-en">${v.translation}</span></div>`
            : ''
        }
      </div>
    `;
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="ta">
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        @page {
          size: A4;
          margin: 1.5cm;
          @bottom-center {
            content: counter(page);
            font-size: 9pt;
            color: #8A766F;
          }
        }
        body {
          font-family: 'Tamil Sangam MN', 'Tamil MN', 'Noto Sans Tamil', 'Latha', 'Mukta Malar', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #FFFFFF;
          color: #241816;
          margin: 0;
          padding: 0;
          font-size: 13pt;
          line-height: 1.6;
        }
        .header {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 2px solid #C59B27;
          margin-bottom: 25px;
        }
        .app-brand {
          font-size: 12pt;
          letter-spacing: 2px;
          color: #6B1420;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 6px;
        }
        .doc-title {
          font-size: 24pt;
          color: #4A0E17;
          font-weight: bold;
          margin: 0;
        }
        .doc-subtitle {
          font-size: 13pt;
          color: #5C4842;
          margin-top: 6px;
        }
        .doc-meta {
          font-size: 9.5pt;
          color: #8A766F;
          margin-top: 8px;
        }
        .verse-card {
          border: 1px solid #E8DFD1;
          border-radius: 8px;
          background-color: #FBF9F4;
          padding: 18px 22px;
          margin-bottom: 18px;
          page-break-inside: avoid;
        }
        .verse-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .verse-badge {
          font-size: 9.5pt;
          font-weight: bold;
          background-color: #6B1420;
          color: #FFFFFF;
          padding: 3px 8px;
          border-radius: 4px;
        }
        .verse-index {
          font-size: 10pt;
          color: #C59B27;
          font-weight: bold;
        }
        .verse-poem {
          font-size: 18pt;
          font-weight: bold;
          color: #4A0E17;
          margin-bottom: 12px;
          line-height: 1.4;
        }
        .verse-section {
          margin-top: 8px;
          font-size: 11pt;
          color: #241816;
        }
        .verse-section-en {
          margin-top: 6px;
          font-size: 10pt;
          color: #4A3E3D;
          font-style: italic;
        }
        .section-label {
          font-weight: bold;
          color: #6B1420;
        }
        .section-label-en {
          font-weight: 600;
          color: #7A6058;
        }
        .footer {
          margin-top: 35px;
          text-align: center;
          font-size: 9pt;
          color: #8A766F;
          border-top: 1px solid #E8DFD1;
          padding-top: 15px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="app-brand">ஆத்திச்சூடி — AATHICHUDI</div>
        <h1 class="doc-title">${title}</h1>
        ${subtitle ? `<div class="doc-subtitle">${subtitle}</div>` : ''}
        <div class="doc-meta">உருவாக்கிய நாள்: ${now} • மொத்தப் பாடல்கள்: ${verses.length}</div>
      </div>

      <div class="content">
        ${versesHtml}
      </div>

      <div class="footer">
        ஆத்திச்சூடி செயலியில் இருந்து உருவாக்கப்பட்டது (Aathichudi Mobile Application)
      </div>
    </body>
    </html>
  `;
}

export async function exportVersesToPdf(options: PdfExportOptions): Promise<string | null> {
  try {
    const html = generateHtmlForExport(options);
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
        dialogTitle: options.title,
      });
    }

    return uri;
  } catch (error) {
    console.warn('PDF export error:', error);
    return null;
  }
}
