import { VERIFIED_OFFLINE_SURAHS, SURAH_LIST } from '../../data/quranMetadata.ts';
import { AUTHENTIC_HADITHS, type HadithItem } from '../../data/hadithData.ts';
import { ADHKAR_DATA, type DhikrItem } from '../../data/adhkarData.ts';
import { getHijriDate } from '../../utils/prayerTimes.ts';

export interface DailySelectedContent {
  dateStr: string;
  dateFormatted: string;
  hijriFormatted: string;
  ayah: {
    surahNameAr: string;
    surahNumber: number;
    ayahNumber: number;
    textAr: string;
    surahUrl: string;
  };
  hadith: {
    textAr: string;
    sourceAr: string;
    narratorAr?: string;
  };
  dhikr: {
    titleAr: string;
    textAr: string;
    virtueAr?: string;
  };
}

/**
 * Returns deterministic verified Quranic, Hadith, and Adhkar content for any date.
 */
export function getDailyEmailContent(date: Date = new Date(), siteUrl = 'https://waslislam.fun'): DailySelectedContent {
  const year = date.getFullYear();
  const startOfYear = new Date(year, 0, 0);
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));

  // 1. Curated pool of verified Quranic Ayahs with authentic text
  const ayahPool = [
    ...(VERIFIED_OFFLINE_SURAHS[1] || []).map(a => ({ surahNumber: 1, ayahNumber: a.numberInSurah, text: a.text })),
    ...(VERIFIED_OFFLINE_SURAHS[112] || []).map(a => ({ surahNumber: 112, ayahNumber: a.numberInSurah, text: a.text })),
    ...(VERIFIED_OFFLINE_SURAHS[113] || []).map(a => ({ surahNumber: 113, ayahNumber: a.numberInSurah, text: a.text })),
    ...(VERIFIED_OFFLINE_SURAHS[114] || []).map(a => ({ surahNumber: 114, ayahNumber: a.numberInSurah, text: a.text })),
  ];

  const selectedAyah = ayahPool.length > 0
    ? ayahPool[Math.abs(dayOfYear) % ayahPool.length]
    : { surahNumber: 1, ayahNumber: 1, text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' };

  const surahMeta = SURAH_LIST.find(s => s.number === selectedAyah.surahNumber) || SURAH_LIST[0];

  // 2. Verified Authentic Hadith
  const hadithIndex = Math.abs(dayOfYear) % AUTHENTIC_HADITHS.length;
  const selectedHadith: HadithItem = AUTHENTIC_HADITHS[hadithIndex];

  // 3. Authentic Dhikr (prefer morning adhkar)
  const morningAdhkar = ADHKAR_DATA.filter(d => d.category === 'morning');
  const dhikrPool = morningAdhkar.length > 0 ? morningAdhkar : ADHKAR_DATA;
  const dhikrIndex = Math.abs(dayOfYear) % dhikrPool.length;
  const selectedDhikr: DhikrItem = dhikrPool[dhikrIndex];

  // 4. Formatted dates
  const hijri = getHijriDate(date);
  const dateFormatted = date.toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const cleanSiteUrl = siteUrl.replace(/\/$/, '');
  const surahUrl = `${cleanSiteUrl}/#quran?surah=${selectedAyah.surahNumber}`;

  return {
    dateStr: date.toISOString().split('T')[0],
    dateFormatted,
    hijriFormatted: hijri.formattedAr,
    ayah: {
      surahNameAr: surahMeta.name,
      surahNumber: selectedAyah.surahNumber,
      ayahNumber: selectedAyah.ayahNumber,
      textAr: selectedAyah.text,
      surahUrl
    },
    hadith: {
      textAr: selectedHadith.arabic,
      sourceAr: selectedHadith.source,
      narratorAr: selectedHadith.narratorAr
    },
    dhikr: {
      titleAr: selectedDhikr.categoryAr,
      textAr: selectedDhikr.textAr,
      virtueAr: selectedDhikr.virtueAr
    }
  };
}
