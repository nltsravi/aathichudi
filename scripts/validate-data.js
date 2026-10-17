/**
 * Data validation script for Aathichudi literary datasets
 * Inspects assets/avvaiyar-aathichudi.json and assets/bharathiyar_aathichudi.json
 */

const fs = require('fs');
const path = require('path');

const AVVAIYAR_PATH = path.resolve(__dirname, '../assets/avvaiyar-aathichudi.json');
const BHARATHIYAR_PATH = path.resolve(__dirname, '../assets/bharathiyar_aathichudi.json');

function validateDataset(name, filePath, poetId) {
  const issues = [];
  const warnings = [];

  if (!fs.existsSync(filePath)) {
    return {
      name,
      exists: false,
      issues: [`File not found at ${filePath}`],
      warnings: [],
      totalVerses: 0,
      missingFields: {},
      duplicateNumbers: [],
      kadavulVaazthu: null,
      passed: false,
    };
  }

  let rawData;
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    rawData = JSON.parse(content);
  } catch (err) {
    return {
      name,
      exists: true,
      issues: [`JSON parse error: ${err.message}`],
      warnings: [],
      totalVerses: 0,
      missingFields: {},
      duplicateNumbers: [],
      kadavulVaazthu: null,
      passed: false,
    };
  }

  // Check kadavul_vaazthu
  let kadavulInfo = null;
  if (!rawData.kadavul_vaazthu) {
    warnings.push('Introductory prayer (kadavul_vaazthu) is missing.');
  } else {
    const kv = rawData.kadavul_vaazthu;
    const kvKeys = Object.keys(kv);
    const hasParaphase = 'paraphase' in kv;
    const hasParaphrase = 'paraphrase' in kv;
    if (hasParaphase && !hasParaphrase) {
      warnings.push("Introductory prayer contains 'paraphase' (variant spelling of paraphrase).");
    }
    const lines = [];
    if (kv.line1) lines.push(kv.line1);
    if (kv.line2) lines.push(kv.line2);
    for (let i = 1; i <= 20; i++) {
      if (kv[`poem${i}`]) lines.push(kv[`poem${i}`]);
    }
    kadavulInfo = {
      lineCount: lines.length,
      hasMeaning: Boolean(kv.meaning),
      hasParaphrase: Boolean(kv.paraphrase || kv.paraphase),
      hasTranslation: Boolean(kv.translation),
      keys: kvKeys,
    };
  }

  // Check aathichoodi array
  if (!Array.isArray(rawData.aathichoodi)) {
    issues.push("Top-level property 'aathichoodi' is not an array.");
    return {
      name,
      exists: true,
      issues,
      warnings,
      totalVerses: 0,
      missingFields: {},
      duplicateNumbers: [],
      kadavulVaazthu: kadavulInfo,
      passed: false,
    };
  }

  const verses = rawData.aathichoodi;
  const totalVerses = verses.length;
  const seenNumbers = new Map();
  const duplicateNumbers = [];
  const missingFields = {
    number: 0,
    poem: 0,
    meaning: 0,
    paraphrase: 0,
    transliteration: 0,
    translation: 0,
  };

  const detailedMissing = [];

  verses.forEach((verse, index) => {
    // 1. Check number
    if (typeof verse.number !== 'number') {
      missingFields.number++;
      issues.push(`Index ${index}: Missing or non-numeric 'number' field.`);
    } else {
      if (seenNumbers.has(verse.number)) {
        duplicateNumbers.push({
          number: verse.number,
          indices: [seenNumbers.get(verse.number), index],
        });
      } else {
        seenNumbers.set(verse.number, index);
      }
    }

    // 2. Check poem (Tamil text)
    if (!verse.poem || typeof verse.poem !== 'string' || verse.poem.trim().length === 0) {
      missingFields.poem++;
      issues.push(`Index ${index} (verse #${verse.number || '?'}): Empty or missing 'poem'.`);
    }

    // 3. Optional fields
    let missingInVerse = [];
    if (!verse.meaning || typeof verse.meaning !== 'string' || verse.meaning.trim().length === 0) {
      missingFields.meaning++;
      missingInVerse.push('meaning');
    }
    const paraText = verse.paraphrase || verse.paraphase;
    if (!paraText || typeof paraText !== 'string' || paraText.trim().length === 0) {
      missingFields.paraphrase++;
      missingInVerse.push('paraphrase');
    }
    if (!verse.transliteration || typeof verse.transliteration !== 'string' || verse.transliteration.trim().length === 0) {
      missingFields.transliteration++;
      missingInVerse.push('transliteration');
    }
    if (!verse.translation || typeof verse.translation !== 'string' || verse.translation.trim().length === 0) {
      missingFields.translation++;
      missingInVerse.push('translation');
    }

    if (missingInVerse.length > 0) {
      detailedMissing.push({
        index,
        number: verse.number,
        poem: verse.poem,
        missing: missingInVerse,
      });
    }
  });

  if (duplicateNumbers.length > 0) {
    issues.push(`Found ${duplicateNumbers.length} duplicate verse numbers: ${JSON.stringify(duplicateNumbers)}`);
  }

  if (detailedMissing.length > 0) {
    warnings.push(
      `${detailedMissing.length} verse(s) have missing optional fields: ` +
      detailedMissing.map(d => `Verse #${d.number} ("${d.poem}") missing [${d.missing.join(', ')}]`).join('; ')
    );
  }

  return {
    name,
    poetId,
    filePath,
    exists: true,
    totalVerses,
    missingFields,
    duplicateNumbers,
    kadavulVaazthu: kadavulInfo,
    detailedMissing,
    issues,
    warnings,
    passed: issues.length === 0,
  };
}

function runValidation() {
  console.log('=================================================================');
  console.log('              AATHICHUDI DATA VALIDATION REPORT                  ');
  console.log('=================================================================');

  const results = [
    validateDataset('Avvaiyar Aathichudi', AVVAIYAR_PATH, 'avvaiyar'),
    validateDataset('Bharathiyar Aathichudi', BHARATHIYAR_PATH, 'bharathiyar'),
  ];

  let overallPassed = true;

  results.forEach(res => {
    console.log(`\nPOET COLLECTION: ${res.name} (id: ${res.poetId})`);
    console.log(`- File Path: ${res.filePath}`);
    console.log(`- File Exists: ${res.exists}`);
    console.log(`- Total Verses: ${res.totalVerses}`);
    console.log(`- Duplicate Numbers: ${res.duplicateNumbers.length === 0 ? 'None (Clean)' : JSON.stringify(res.duplicateNumbers)}`);
    console.log(`- Kadavul Vaazthu: ${res.kadavulVaazthu ? `Present (${res.kadavulVaazthu.lineCount} lines, meaning: ${res.kadavulVaazthu.hasMeaning}, paraphrase: ${res.kadavulVaazthu.hasParaphrase}, translation: ${res.kadavulVaazthu.hasTranslation})` : 'Not present'}`);
    console.log(`- Field Presence Summary:`);
    console.log(`    * poem:            ${res.totalVerses - res.missingFields.poem}/${res.totalVerses}`);
    console.log(`    * meaning:         ${res.totalVerses - res.missingFields.meaning}/${res.totalVerses}`);
    console.log(`    * paraphrase:      ${res.totalVerses - res.missingFields.paraphrase}/${res.totalVerses}`);
    console.log(`    * transliteration: ${res.totalVerses - res.missingFields.transliteration}/${res.totalVerses}`);
    console.log(`    * translation:     ${res.totalVerses - res.missingFields.translation}/${res.totalVerses}`);

    if (res.warnings.length > 0) {
      console.log(`- Warnings (${res.warnings.length}):`);
      res.warnings.forEach(w => console.log(`    [WARN] ${w}`));
    }

    if (res.issues.length > 0) {
      overallPassed = false;
      console.log(`- Issues (${res.issues.length}):`);
      res.issues.forEach(iss => console.log(`    [FAIL] ${iss}`));
    } else {
      console.log(`- Status: PASSED (Source data valid and ready for normalization)`);
    }
  });

  console.log('\n=================================================================');
  console.log(`OVERALL VALIDATION: ${overallPassed ? 'SUCCESSFUL (All criteria satisfied)' : 'FAILED'}`);
  console.log('=================================================================\n');

  return { results, overallPassed };
}

if (require.main === module) {
  const { overallPassed } = runValidation();
  process.exit(overallPassed ? 0 : 1);
}

module.exports = { validateDataset, runValidation };
