import { GlobalSearchResult, SearchDomain } from '../types';
import { SURAHS_LIST } from '../data/quranMetadata';
import { HADITH_DATA } from '../data/hadithData';
import { AZKAR_DATA, AZKAR_CATEGORIES } from '../data/azkarData';
import { DUA_DATA, DUA_CATEGORIES } from '../data/duaData';
import { VERIFIED_INITIAL_WISDOMS } from '../data/wisdomsData';
import { ALLAH_NAMES_DATA } from '../data/allahNamesData';
import { SEERAH_DATA } from '../data/seerahData';
import { HAJJ_UMRAH_DATA } from '../data/hajjUmrahData';
import { LIBRARY_BOOKS_DATA } from '../data/libraryData';
import { ISLAMIC_EVENTS } from '../data/calendarEvents';

const RECENT_SEARCHES_KEY = 'wasl_recent_searches_v1';

export const SEARCH_DOMAINS: { domain: SearchDomain; labelAr: string; icon: string }[] = [
  { domain: 'quran', labelAr: 'القرآن الكريم', icon: 'BookOpen' },
  { domain: 'hadith', labelAr: 'الأحاديث النبوية', icon: 'ScrollText' },
  { domain: 'azkar', labelAr: 'الأذكار', icon: 'Sparkles' },
  { domain: 'dua', labelAr: 'الأدعية المأثورة', icon: 'Heart' },
  { domain: 'wisdom', labelAr: 'الحِكَم والمواعظ', icon: 'Lightbulb' },
  { domain: 'allah_name', labelAr: 'أسماء الله الحسنى', icon: 'Award' },
  { domain: 'seerah', labelAr: 'السيرة النبوية ﷺ', icon: 'Compass' },
  { domain: 'hajj_umrah', labelAr: 'الحج والعمرة', icon: 'MapPin' },
  { domain: 'library', labelAr: 'المكتبة الإسلامية', icon: 'Library' },
  { domain: 'events', labelAr: 'المناسبات الإسلامية', icon: 'Calendar' }
];

// Normalize Arabic text for robust searching (strip tashkeel, harmonize alef, taa marbuta, yaa)
export function normalizeArabicText(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u065F\u0670]/g, '') // Remove tashkeel / harakat
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/[ة]/g, 'ه')
    .replace(/[ى]/g, 'ي')
    .replace(/[\u0610-\u061A\u06D6-\u06ED]/g, '') // Quranic annotations
    .toLowerCase()
    .trim();
}

// Manage Recent Searches
export function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? JSON.parse(raw) : ['سورة الفاتحة', 'الصبر', 'الرحمن', 'يوم عرفة', 'أذكار الصباح'];
  } catch {
    return [];
  }
}

export function addRecentSearch(term: string): void {
  const trimmed = term.trim();
  if (!trimmed) return;
  try {
    let searches = getRecentSearches().filter(s => s !== trimmed);
    searches.unshift(trimmed);
    if (searches.length > 10) searches = searches.slice(0, 10);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
  } catch {}
}

export function clearRecentSearches(): void {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {}
}

export function removeRecentSearch(term: string): void {
  try {
    const searches = getRecentSearches().filter(s => s !== term);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
  } catch {}
}

// Perform Global Unified Search across verified contents
export function performGlobalSearch(query: string, domainFilter?: SearchDomain): {
  results: GlobalSearchResult[];
  groupedCounts: Record<SearchDomain, number>;
  totalCount: number;
} {
  const rawQuery = query.trim();
  if (!rawQuery) {
    return { results: [], groupedCounts: {} as Record<SearchDomain, number>, totalCount: 0 };
  }

  const normQuery = normalizeArabicText(rawQuery);
  const terms = normQuery.split(/\s+/).filter(Boolean);

  const results: GlobalSearchResult[] = [];

  const matches = (text: string): boolean => {
    if (!text) return false;
    const norm = normalizeArabicText(text);
    return terms.every(t => norm.includes(t));
  };

  // 1. القرآن الكريم (السور)
  if (!domainFilter || domainFilter === 'quran') {
    SURAHS_LIST.forEach(surah => {
      if (matches(surah.name) || matches(surah.englishName) || matches(surah.englishNameTranslation) || matches(`سورة ${surah.name}`)) {
        results.push({
          id: `quran-surah-${surah.number}`,
          domain: 'quran',
          domainLabelAr: 'القرآن الكريم',
          title: `سورة ${surah.name}`,
          snippet: `سورة ${surah.revelationTypeAr} • عدد آياتها: ${surah.numberOfAyahs} • الجزء: ${surah.juz} • الصفحة: ${surah.page}`,
          targetTab: 'quran',
          targetId: surah.number,
          badge: `${surah.numberOfAyahs} آية`,
          source: 'المصحف الشريف'
        });
      }
    });
  }

  // 2. الأحاديث النبوية
  if (!domainFilter || domainFilter === 'hadith') {
    HADITH_DATA.forEach(h => {
      if (matches(h.textAr) || matches(h.narratorAr) || matches(h.topicAr) || matches(h.collectionAr) || matches(h.explanationAr)) {
        results.push({
          id: `hadith-${h.id}`,
          domain: 'hadith',
          domainLabelAr: 'الأحاديث النبوية',
          title: `${h.collectionAr} • ${h.topicAr}`,
          snippet: h.textAr.length > 180 ? h.textAr.substring(0, 180) + '...' : h.textAr,
          targetTab: 'hadith',
          targetId: h.id,
          badge: h.gradingAr,
          source: `${h.collectionAr} (${h.narratorAr})`
        });
      }
    });
  }

  // 3. الأذكار
  if (!domainFilter || domainFilter === 'azkar') {
    AZKAR_DATA.forEach(d => {
      const cat = AZKAR_CATEGORIES.find(c => c.id === d.categoryId);
      if (matches(d.textAr) || matches(d.benefitAr || '') || matches(d.sourceAr) || (cat && matches(cat.nameAr))) {
        results.push({
          id: `azkar-${d.id}`,
          domain: 'azkar',
          domainLabelAr: 'الأذكار',
          title: cat ? cat.nameAr : 'ذكر مأثور',
          snippet: d.textAr.length > 160 ? d.textAr.substring(0, 160) + '...' : d.textAr,
          targetTab: 'azkar',
          targetId: d.categoryId,
          badge: `تكرار: ${d.repeatCount}x`,
          source: d.sourceAr
        });
      }
    });
  }

  // 4. الأدعية المأثورة
  if (!domainFilter || domainFilter === 'dua') {
    DUA_DATA.forEach(dua => {
      const cat = DUA_CATEGORIES.find(c => c.id === dua.categoryId);
      if (matches(dua.titleAr) || matches(dua.textAr) || matches(dua.benefitAr || '') || matches(dua.sourceAr)) {
        results.push({
          id: `dua-${dua.id}`,
          domain: 'dua',
          domainLabelAr: 'الأدعية المأثورة',
          title: dua.titleAr,
          snippet: dua.textAr,
          targetTab: 'dua',
          targetId: dua.id,
          badge: cat?.nameAr,
          source: dua.sourceAr
        });
      }
    });
  }

  // 5. الحِكَم والمواعظ
  if (!domainFilter || domainFilter === 'wisdom') {
    VERIFIED_INITIAL_WISDOMS.forEach(w => {
      if (matches(w.content) || matches(w.category) || matches(w.author || '') || matches(w.source)) {
        results.push({
          id: `wisdom-${w.id}`,
          domain: 'wisdom',
          domainLabelAr: 'الحِكَم والمواعظ',
          title: `موعظة في ${w.category}${w.author ? ` • ${w.author}` : ''}`,
          snippet: w.content,
          targetTab: 'wisdom',
          targetId: w.id,
          badge: w.category,
          source: w.source
        });
      }
    });
  }

  // 6. أسماء الله الحسنى
  if (!domainFilter || domainFilter === 'allah_name') {
    ALLAH_NAMES_DATA.forEach(n => {
      if (matches(n.nameAr) || (n.nameEn && matches(n.nameEn)) || matches(n.meaningAr) || (n.explanationAr && matches(n.explanationAr)) || (n.evidenceAr && matches(n.evidenceAr))) {
        results.push({
          id: `allah-name-${n.number}`,
          domain: 'allah_name',
          domainLabelAr: 'أسماء الله الحسنى',
          title: `اسم الله: ${n.nameAr}${n.nameEn ? ` (${n.nameEn})` : ''}`,
          snippet: `${n.meaningAr} — ${n.explanationAr?.substring(0, 120) || ''}...`,
          targetTab: 'names-of-allah',
          targetId: n.number,
          badge: `#${n.number}`,
          source: n.source
        });
      }
    });
  }

  // 7. السيرة النبوية ﷺ
  if (!domainFilter || domainFilter === 'seerah') {
    SEERAH_DATA.forEach(ev => {
      if (matches(ev.title) || matches(ev.summary) || matches(ev.content) || matches(ev.eraTitleAr) || (ev.location && matches(ev.location))) {
        results.push({
          id: `seerah-${ev.id}`,
          domain: 'seerah',
          domainLabelAr: 'السيرة النبوية ﷺ',
          title: ev.title,
          snippet: ev.summary || ev.content.substring(0, 160) + '...',
          targetTab: 'seerah',
          targetId: ev.id,
          badge: ev.eraTitleAr,
          source: `${ev.source} - ${ev.reference || ''}`
        });
      }
    });
  }

  // 8. الحج والعمرة
  if (!domainFilter || domainFilter === 'hajj_umrah') {
    HAJJ_UMRAH_DATA.forEach(step => {
      if (matches(step.title) || matches(step.description) || (step.notes && matches(step.notes)) || (step.evidence && matches(step.evidence))) {
        results.push({
          id: `hajj-umrah-${step.id}`,
          domain: 'hajj_umrah',
          domainLabelAr: 'الحج والعمرة',
          title: step.title,
          snippet: step.description.substring(0, 160) + '...',
          targetTab: 'hajj-umrah',
          targetId: step.id,
          badge: step.type === 'umrah' ? 'مناسك العمرة' : step.type === 'hajj' ? 'مناسك الحج' : step.type === 'miqat' ? 'المواقيت' : 'الأحكام والأدعية',
          source: step.source
        });
      }
    });
  }

  // 9. المكتبة الإسلامية
  if (!domainFilter || domainFilter === 'library') {
    LIBRARY_BOOKS_DATA.forEach(book => {
      if (matches(book.title) || matches(book.author) || matches(book.category) || matches(book.description)) {
        results.push({
          id: `lib-book-${book.id}`,
          domain: 'library',
          domainLabelAr: 'المكتبة الإسلامية',
          title: book.title,
          snippet: `${book.author} • ${book.description.substring(0, 140)}...`,
          targetTab: 'library',
          targetId: book.id,
          badge: book.category,
          source: book.publisher || book.license
        });
      }

      // Check chapters
      book.chapters.forEach(ch => {
        if (matches(ch.title) || matches(ch.content)) {
          results.push({
            id: `lib-chapter-${book.id}-${ch.id}`,
            domain: 'library',
            domainLabelAr: 'المكتبة الإسلامية',
            title: `${ch.title} (${book.title})`,
            snippet: ch.content.substring(0, 160) + '...',
            targetTab: 'library',
            targetId: `${book.id}:${ch.id}`,
            badge: book.title,
            source: book.author
          });
        }
      });
    });
  }

  // 10. المناسبات الإسلامية
  if (!domainFilter || domainFilter === 'events') {
    ISLAMIC_EVENTS.forEach(ev => {
      if (matches(ev.titleAr) || matches(ev.descriptionAr) || matches(ev.monthNameAr)) {
        results.push({
          id: `event-${ev.id}`,
          domain: 'events',
          domainLabelAr: 'المناسبات الإسلامية',
          title: ev.titleAr,
          snippet: `${ev.hijriDay} ${ev.monthNameAr} — ${ev.descriptionAr}`,
          targetTab: 'events',
          targetId: ev.id,
          badge: `${ev.hijriDay} ${ev.monthNameAr}`,
          source: 'التقويم الهجري المعتمد'
        });
      }
    });
  }

  // Compute counts per domain
  const groupedCounts: Record<SearchDomain, number> = {
    quran: 0,
    hadith: 0,
    azkar: 0,
    dua: 0,
    wisdom: 0,
    allah_name: 0,
    seerah: 0,
    hajj_umrah: 0,
    library: 0,
    events: 0
  };

  results.forEach(r => {
    groupedCounts[r.domain] = (groupedCounts[r.domain] || 0) + 1;
  });

  return {
    results,
    groupedCounts,
    totalCount: results.length
  };
}
