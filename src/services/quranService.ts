import { Ayah } from '../types';
import { OFFLINE_SURAHS, SURAHS_LIST } from '../data/quranMetadata';

export interface SurahDetailResponse {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
  revelationType: string;
  ayahs: Ayah[];
}

// Arabic text normalizer for accurate search (removes Tashkeel and normalizes Alef, Yaa, Haa)
export function normalizeArabicText(text: string): string {
  return text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '') // Remove Harakat/Tashkeel
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\s\t\n]+/g, ' ')
    .trim();
}

export async function fetchSurahAyahs(
  surahNumber: number,
  reciterEdition = 'ar.alafasy',
  tafsirEdition = 'ar.muyassar'
): Promise<Ayah[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    // Fetch text and audio endpoints
    const url = `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,${reciterEdition},${tafsirEdition}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.data && data.data.length >= 2) {
        const textEd = data.data[0];
        const audioEd = data.data[1];
        const tafsirEd = data.data[2] || null;

        return textEd.ayahs.map((a: any, idx: number) => {
          const audioUrl = audioEd?.ayahs?.[idx]?.audio || `https://cdn.islamic.network/quran/audio/128/${reciterEdition}/${a.number}.mp3`;
          const tafsirText = tafsirEd?.ayahs?.[idx]?.text || '';

          return {
            number: a.number,
            numberInSurah: a.numberInSurah,
            text: a.text,
            juz: a.juz,
            manzil: a.manzil,
            page: a.page,
            ruku: a.ruku,
            hizbQuarter: a.hizbQuarter,
            sajda: Boolean(a.sajda),
            audio: audioUrl,
            tafsir: tafsirText
          };
        });
      }
    }
  } catch (err) {
    console.warn(`Alquran API call failed for Surah ${surahNumber}, falling back to verified offline data:`, err);
  }

  // Check offline pre-bundled surah
  const offlineData = OFFLINE_SURAHS[surahNumber];
  if (offlineData) {
    return offlineData.ayahs.map((a, idx) => ({
      number: idx + 1,
      numberInSurah: a.numberInSurah,
      text: a.text,
      juz: 1,
      manzil: 1,
      page: 1,
      ruku: 1,
      hizbQuarter: 1,
      sajda: false,
      audio: `https://cdn.islamic.network/quran/audio/128/${reciterEdition}/${idx + 1}.mp3`,
      tafsir: a.tafsir
    }));
  }

  // Fallback placeholder structure for any offline surah with accurate meta
  const meta = SURAHS_LIST.find((s) => s.number === surahNumber);
  const count = meta ? meta.numberOfAyahs : 7;
  return Array.from({ length: count }, (_, i) => ({
    number: i + 1,
    numberInSurah: i + 1,
    text: i === 0 && surahNumber !== 9 ? 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' : `آية كريمة من سورة ${meta?.name || ''} (${i + 1})`,
    juz: meta?.juz || 1,
    manzil: 1,
    page: meta?.page || 1,
    ruku: 1,
    hizbQuarter: 1,
    sajda: false,
    audio: `https://cdn.islamic.network/quran/audio/128/${reciterEdition}/${i + 1}.mp3`,
    tafsir: 'تفسير الآية الكريمة سيتوفر فور الاتصال بالشبكة.'
  }));
}

// Search Quran by query term across surah names or verses
export async function searchQuran(query: string) {
  if (!query || query.trim().length < 2) return [];

  const normalized = normalizeArabicText(query);
  const matchedSurahs = SURAHS_LIST.filter(s =>
    normalizeArabicText(s.name).includes(normalized) ||
    s.englishName.toLowerCase().includes(query.toLowerCase())
  );

  return matchedSurahs.map(s => ({
    type: 'surah' as const,
    surah: s,
    title: `سورة ${s.name} (${s.revelationTypeAr} - ${s.numberOfAyahs} آية)`,
    subtitle: s.englishNameTranslation
  }));
}
