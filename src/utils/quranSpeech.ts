import { HifzWordResult, HifzAyahResult, WordRecitationStatus, WordErrorType } from '../types/khatmah';

/**
 * Strips diacritics (tashkeel), Quranic pause marks, signs, and tatweel
 * for the INTERNAL comparison layer only.
 * The original displayed Quran text MUST NEVER be altered or modified.
 */
export function normalizeQuranTextForComparison(text: string): string {
  if (!text) return '';
  return text
    // 1. Remove Tashkeel / Harakat (Fatha, Damma, Kasra, Sukun, Tanween, Shadda, etc.)
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // 2. Remove Quranic pause marks, sajda, rub-el-hizb and ornamental marks
    .replace(/[\u06D6-\u06ED\u0600-\u0605\u06DD\u06DE\u06DF]/g, '')
    // 3. Remove Tatweel / Kashida
    .replace(/\u0640/g, '')
    // 4. Normalize Alef variants: أ, إ, آ, ٱ -> ا
    .replace(/[أإآٱ]/g, 'ا')
    // 5. Normalize Taa Marbuta: ة -> ه
    .replace(/ة/g, 'ه')
    // 6. Normalize Alif Maqsura: ى -> ي
    .replace(/ى/g, 'ي')
    // 7. Normalize Hamzas on carriers: ؤ -> و, ئ -> ي, ء (keep uniform)
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    // 8. Remove non-Arabic punctuation, brackets, numbers, ayah brackets
    .replace(/[.,،؛:?!()﴿﴾«»"'\-—_\[\]\d]/g, ' ')
    // 9. Collapse multiple spaces and trim
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Splits Quran verse or transcript into clean words
 */
export function extractWords(text: string): string[] {
  if (!text) return [];
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

/**
 * Levenshtein distance between two normalized words
 */
export function wordSimilarity(word1: string, word2: string): number {
  const s1 = normalizeQuranTextForComparison(word1);
  const s2 = normalizeQuranTextForComparison(word2);

  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;

  const len1 = s1.length;
  const len2 = s2.length;
  const maxLen = Math.max(len1, len2);

  const matrix: number[][] = [];
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  const distance = matrix[len1][len2];
  return Math.max(0, 1 - distance / maxLen);
}

/**
 * Word error classification mapping to Arabic user-facing labels
 */
export function getArabicErrorLabel(errorType?: WordErrorType): string {
  switch (errorType) {
    case 'deletion':
      return 'حذف كلمة أو تخطيها';
    case 'insertion':
      return 'إضافة كلمة غير موجودة';
    case 'substitution':
      return 'استبدال كلمة بأخرى';
    case 'repetition':
      return 'تكرار كلمة';
    case 'unclear':
      return 'لم يُتعرف عليها بوضوح';
    case 'long_pause':
      return 'توقف طويل أثناء التلاوة';
    default:
      return 'تحتاج إلى مراجعة';
  }
}

/**
 * Core alignment algorithm:
 * Aligns recognized words with original verified Quran words
 */
export function alignRecitationWords(
  originalAyahText: string,
  recognizedTranscript: string,
  speechConfidence: number = 0.85,
  isPartial: boolean = false
): HifzWordResult[] {
  const originalWords = extractWords(originalAyahText);
  const recognizedWords = extractWords(recognizedTranscript);

  const normalizedOriginal = originalWords.map(normalizeQuranTextForComparison);
  const normalizedRecognized = recognizedWords.map(normalizeQuranTextForComparison);

  // If no words recognized yet
  if (recognizedWords.length === 0) {
    return originalWords.map((word, idx) => ({
      expectedWord: word,
      normalizedExpected: normalizedOriginal[idx],
      status: isPartial ? 'waiting' : 'waiting',
      confidence: 1.0,
      wordIndex: idx,
    }));
  }

  const results: HifzWordResult[] = [];
  let recIdx = 0;

  for (let origIdx = 0; origIdx < originalWords.length; origIdx++) {
    const origWord = originalWords[origIdx];
    const normOrig = normalizedOriginal[origIdx];

    // If we exhausted recognized words
    if (recIdx >= recognizedWords.length) {
      results.push({
        expectedWord: origWord,
        normalizedExpected: normOrig,
        status: isPartial ? 'waiting' : 'missing',
        confidence: 0,
        errorType: isPartial ? undefined : 'deletion',
        arabicErrorLabel: isPartial ? undefined : getArabicErrorLabel('deletion'),
        wordIndex: origIdx,
      });
      continue;
    }

    const currentRec = recognizedWords[recIdx];
    const normRec = normalizedRecognized[recIdx];

    // Check exact or high similarity with current recognized word
    const simCurrent = wordSimilarity(normOrig, normRec);

    // Look ahead 1 word in recognized (in case of an extra inserted word)
    const nextRec = recognizedWords[recIdx + 1];
    const simNext = nextRec ? wordSimilarity(normOrig, normalizedRecognized[recIdx + 1]) : 0;

    // Look ahead 1 word in original (in case of a skipped/deleted word)
    const nextOrig = normalizedOriginal[origIdx + 1];
    const simSkip = nextOrig ? wordSimilarity(nextOrig, normRec) : 0;

    if (simCurrent >= 0.75) {
      // High match!
      const isUnclear = speechConfidence < 0.60 && simCurrent < 0.90;
      results.push({
        expectedWord: origWord,
        normalizedExpected: normOrig,
        recognizedWord: currentRec,
        normalizedRecognized: normRec,
        status: isUnclear ? 'unclear' : 'correct',
        confidence: isUnclear ? speechConfidence : Math.max(speechConfidence, simCurrent),
        errorType: isUnclear ? 'unclear' : undefined,
        arabicErrorLabel: isUnclear ? getArabicErrorLabel('unclear') : undefined,
        wordIndex: origIdx,
      });
      recIdx++;
    } else if (simNext >= 0.80) {
      // User inserted an extra word before this word
      // Mark current recognized word as extra, then match next
      recIdx++; // skip the extra word
      results.push({
        expectedWord: origWord,
        normalizedExpected: normOrig,
        recognizedWord: nextRec,
        normalizedRecognized: normalizedRecognized[recIdx],
        status: 'correct',
        confidence: simNext,
        wordIndex: origIdx,
      });
      recIdx++;
    } else if (simSkip >= 0.80) {
      // Current expected word was skipped
      results.push({
        expectedWord: origWord,
        normalizedExpected: normOrig,
        status: isPartial ? 'waiting' : 'missing',
        confidence: 0,
        errorType: isPartial ? undefined : 'deletion',
        arabicErrorLabel: isPartial ? undefined : getArabicErrorLabel('deletion'),
        wordIndex: origIdx,
      });
      // Do not increment recIdx so next expected word will match current rec word
    } else {
      // Word mismatch / substitution
      // Safety rule #39: If speech confidence is low, declare unclear rather than false
      const isUnclear = speechConfidence < 0.70;
      results.push({
        expectedWord: origWord,
        normalizedExpected: normOrig,
        recognizedWord: currentRec,
        normalizedRecognized: normRec,
        status: isUnclear ? 'unclear' : 'incorrect',
        confidence: speechConfidence,
        errorType: isUnclear ? 'unclear' : 'substitution',
        arabicErrorLabel: getArabicErrorLabel(isUnclear ? 'unclear' : 'substitution'),
        wordIndex: origIdx,
      });
      recIdx++;
    }
  }

  return results;
}

/**
 * Calculates ayah-level statistics from word alignment results
 */
export function calculateAyahResult(
  ayahNumber: number,
  numberInSurah: number,
  originalText: string,
  words: HifzWordResult[],
  overallConfidence: number = 0.85
): HifzAyahResult {
  const totalWords = words.length;
  if (totalWords === 0) {
    return {
      ayahNumber,
      numberInSurah,
      originalText,
      words: [],
      accuracy: 0,
      correctWords: 0,
      incorrectWords: 0,
      missingWords: 0,
      extraWords: 0,
      confidence: overallConfidence,
      isCompleted: false,
    };
  }

  let correct = 0;
  let incorrect = 0;
  let missing = 0;
  let extra = 0;

  words.forEach((w) => {
    if (w.status === 'correct') correct++;
    else if (w.status === 'incorrect' || w.status === 'unclear') incorrect++;
    else if (w.status === 'missing') missing++;
    else if (w.status === 'extra') extra++;
  });

  const accuracy = Math.round((correct / totalWords) * 100);

  return {
    ayahNumber,
    numberInSurah,
    originalText,
    words,
    accuracy,
    correctWords: correct,
    incorrectWords: incorrect,
    missingWords: missing,
    extraWords: extra,
    confidence: overallConfidence,
    isCompleted: true,
  };
}
