/**
 * Arabic Text Normalization and Search Utilities for Wasl Islamic.
 * Provides high-accuracy matching across Quranic verses, Hadiths, and Islamic content
 * by stripping tashkeel, normalizing alef/hamza forms, taa marbuta, and common orthographic variations.
 */

export function normalizeArabicText(text: string): string {
  if (!text) return '';

  return text
    // 1. Remove all Arabic diacritics (Tashkeel: Fathah, Dammah, Kasrah, Sukun, Shaddah, Tanween, Tatweel/Kashida)
    .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
    // 2. Normalize all Alef variations (أ, إ, آ, ٱ -> ا)
    .replace(/[أإآٱ]/g, 'ا')
    // 3. Normalize Taa Marbuta (ة -> ه)
    .replace(/ة/g, 'ه')
    // 4. Normalize Alif Maqsura (ى -> ي)
    .replace(/ى/g, 'ي')
    // 5. Normalize Hamza on Waw and Yaa (ؤ, ئ -> ء) or common forms
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    // 6. Clean excess whitespace and trim
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if search query is contained within the target Arabic text,
 * using normalized representations of both.
 */
export function matchesArabicQuery(target: string, query: string): boolean {
  if (!target || !query) return false;
  const normTarget = normalizeArabicText(target);
  const normQuery = normalizeArabicText(query);
  return normTarget.includes(normQuery);
}

/**
 * Highlights matched terms in Arabic text while preserving original text styling.
 */
export function highlightArabicMatch(text: string, query: string): { before: string; match: string; after: string } | null {
  if (!text || !query.trim()) return null;
  const normText = normalizeArabicText(text);
  const normQuery = normalizeArabicText(query);
  const idx = normText.indexOf(normQuery);
  if (idx === -1) return null;

  // Approximate slice
  const approxStart = Math.max(0, idx);
  const approxEnd = Math.min(text.length, idx + query.length);

  return {
    before: text.substring(0, approxStart),
    match: text.substring(approxStart, approxEnd),
    after: text.substring(approxEnd),
  };
}
