import { normalizeArabicText } from './arabicSearch.ts';
import { QURAN_DICTIONARY_ENTRIES, type QuranDictionaryEntry } from '../data/quranDictionaryData.ts';

export interface WordLookupResult {
  originalWord: string;
  hasVerifiedLexicon: boolean;
  entry?: QuranDictionaryEntry;
  surahNumber?: number;
  ayahNumber?: number;
  unverifiedNotice?: string;
}

export class QuranDictionaryEngine {
  static lookupWord(
    rawWord: string,
    surahNum?: number,
    ayahNum?: number
  ): WordLookupResult {
    const clean = normalizeArabicText(rawWord.trim());
    if (!clean) {
      return {
        originalWord: rawWord,
        hasVerifiedLexicon: false,
        unverifiedNotice: 'كلمة فارغة أو غير محددة.'
      };
    }

    // 1. Try exact or normalized match
    let match = QURAN_DICTIONARY_ENTRIES.find(e => {
      if (surahNum && ayahNum && e.surahNumber === surahNum && e.ayahNumber === ayahNum) {
        return normalizeArabicText(e.word) === clean || clean.includes(e.cleanWord);
      }
      return normalizeArabicText(e.word) === clean || e.cleanWord === clean;
    });

    // 2. Try substring root or cleanWord match
    if (!match) {
      match = QURAN_DICTIONARY_ENTRIES.find(e => clean.includes(e.cleanWord) || e.cleanWord.includes(clean));
    }

    if (match) {
      return {
        originalWord: rawWord,
        hasVerifiedLexicon: true,
        entry: match,
        surahNumber: surahNum || match.surahNumber,
        ayahNumber: ayahNum || match.ayahNumber
      };
    }

    // Honest non-fabrication fallback
    return {
      originalWord: rawWord,
      hasVerifiedLexicon: false,
      surahNumber: surahNum,
      ayahNumber: ayahNum,
      unverifiedNotice: 'لم تُدرج بيانات معجمية موثقة لهذه الكلمة بعد، التزاماً بالأمانة العلمية وعدم استنباط جذور أو معانٍ لغوية دون إسناد معجمي محقق.'
    };
  }

  static searchDictionary(
    query: string,
    filterBy: 'all' | 'root' | 'word' = 'all'
  ): QuranDictionaryEntry[] {
    const norm = normalizeArabicText(query.trim());
    if (!norm) return QURAN_DICTIONARY_ENTRIES;

    return QURAN_DICTIONARY_ENTRIES.filter(e => {
      const matchWord = normalizeArabicText(e.word).includes(norm) || e.cleanWord.includes(norm);
      const matchRoot = normalizeArabicText(e.rootArabic).includes(norm) || e.root.includes(norm);
      const matchMeaning = normalizeArabicText(e.meaningAr).includes(norm);

      if (filterBy === 'root') return matchRoot;
      if (filterBy === 'word') return matchWord;
      return matchWord || matchRoot || matchMeaning;
    });
  }

  static getRootsCatalog(): { root: string; rootArabic: string; count: number }[] {
    const map = new Map<string, { root: string; rootArabic: string; count: number }>();
    QURAN_DICTIONARY_ENTRIES.forEach(e => {
      const existing = map.get(e.root);
      if (existing) {
        existing.count += e.totalOccurrencesInQuran;
      } else {
        map.set(e.root, { root: e.root, rootArabic: e.rootArabic, count: e.totalOccurrencesInQuran });
      }
    });
    return Array.from(map.values());
  }
}
