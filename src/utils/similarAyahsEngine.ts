/**
 * Wasl Islamic (وصل الإسلامية) - Similar Ayahs Text Comparison & Alignment Engine.
 * Tokenizes Arabic sentences, compares matching segments, highlights differing words
 * with zero corruption of Arabic shaping and RTL text direction.
 */

import { CURATED_SIMILAR_GROUPS, type SimilarAyahGroup, type SimilarAyahItem } from '../data/similarAyahsData.ts';
import { normalizeArabicText } from './arabicSearch.ts';

export interface DiffToken {
  text: string;
  isDiff: boolean;
}

/**
 * Splits Arabic text into words while keeping punctuation separated
 */
export function tokenizeArabicWords(text: string): string[] {
  if (!text) return [];
  return text.trim().split(/\s+/).filter(Boolean);
}

/**
 * Compares two Ayahs and produces highlighted tokens for the target Ayah relative to the comparison Ayah
 */
export function alignAndDiffAyahs(targetText: string, referenceText: string): DiffToken[] {
  const targetWords = tokenizeArabicWords(targetText);
  const refWords = tokenizeArabicWords(referenceText);
  const refNormalizedSet = new Set(refWords.map(w => normalizeArabicText(w)));

  return targetWords.map(word => {
    const norm = normalizeArabicText(word);
    const existsInRef = refNormalizedSet.has(norm);
    return {
      text: word,
      isDiff: !existsInRef
    };
  });
}

/**
 * Finds all similar groups that reference a given surah or ayah
 */
export function findSimilarGroupsForAyah(surahNumber: number, ayahNumber?: number): SimilarAyahGroup[] {
  return CURATED_SIMILAR_GROUPS.filter(group => {
    return group.ayahs.some(a => {
      if (ayahNumber !== undefined && ayahNumber > 0) {
        return a.surahNumber === surahNumber && a.ayahNumber === ayahNumber;
      }
      return a.surahNumber === surahNumber;
    });
  });
}

/**
 * Search similar groups by query or category
 */
export function searchSimilarGroups(query: string, category?: string): SimilarAyahGroup[] {
  let list = CURATED_SIMILAR_GROUPS;
  if (category && category !== 'all') {
    list = list.filter(g => g.category === category);
  }

  const trimmed = query.trim();
  if (!trimmed) return list;

  const normQuery = normalizeArabicText(trimmed);
  return list.filter(group => {
    const titleMatch = normalizeArabicText(group.titleAr).includes(normQuery);
    const analysisMatch = normalizeArabicText(group.scholarlyAnalysisAr).includes(normQuery);
    const ayahMatch = group.ayahs.some(a => 
      normalizeArabicText(a.textAr).includes(normQuery) ||
      normalizeArabicText(a.surahNameAr).includes(normQuery)
    );
    return titleMatch || analysisMatch || ayahMatch;
  });
}
