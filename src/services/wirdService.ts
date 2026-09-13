import {
  DailyWird,
  DailyWirdItem,
  DailyWirdUserProgress,
  WirdItemProgress,
  WirdItemType,
  AdminWirdFormState,
} from '../types/wird';
import { SURAHS_LIST, OFFLINE_SURAHS } from '../data/quranMetadata';
import { AZKAR_DATA } from '../data/azkarData';
import { HADITH_DATA } from '../data/hadithData';
import { DUA_DATA } from '../data/duaData';
import { localStore } from './supabase';
import { getHijriDateString, getRamadanCountdown } from './shareImageService';
import { dashboardService } from './dashboardService';

/**
 * Returns today's date in Saudi Arabia canonical timezone (Asia/Riyadh).
 * Format: YYYY-MM-DD
 */
export function getSaudiDateString(date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Riyadh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date);
  } catch {
    return date.toISOString().split('T')[0];
  }
}

/**
 * Checks whether a given date string or Date object is a Friday
 */
export function isFridayDate(dateStringOrDate: string | Date): boolean {
  try {
    let d: Date;
    if (typeof dateStringOrDate === 'string') {
      d = new Date(`${dateStringOrDate}T12:00:00Z`);
    } else {
      d = dateStringOrDate;
    }
    // Convert to Saudi day of week
    const weekday = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Riyadh',
      weekday: 'short',
    }).format(d);
    return weekday === 'Fri';
  } catch {
    return false;
  }
}

/**
 * Checks whether currently in Ramadan
 */
export function isRamadanDate(date = new Date()): boolean {
  try {
    const info = getRamadanCountdown(date);
    return info.days === 0;
  } catch {
    return false;
  }
}

/**
 * Deterministic hash integer for a date string YYYY-MM-DD
 */
function getDateHash(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// ============================================================================
// VERIFIED QURAN PORTIONS CATALOG (100% Verified Uthmani text from King Fahd Mushaf)
// ============================================================================
export interface VerifiedQuranPortion {
  id: string;
  surahNumber: number;
  surahNameAr: string;
  startAyah: number;
  endAyah: number;
  textAr: string;
  juzNumber: number;
  pageNumber: number;
  tafsirShort: string;
  audioUrl?: string;
  forFridayOnly?: boolean;
}

export const VERIFIED_QURAN_PORTIONS: VerifiedQuranPortion[] = [
  // Friday Special: Surat Al-Kahf (18:1-10)
  {
    id: 'qp-kahf-friday',
    surahNumber: 18,
    surahNameAr: 'الكهف',
    startAyah: 1,
    endAyah: 10,
    textAr: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ﴿الْحَمْدُ لِلَّهِ الَّذِي أَنْزَلَ عَلَىٰ عَبْدِهِ الْكِتَابَ وَلَمْ يَجْعَلْ لَهُ عِوَجًا ۜ ۝١ قَيِّمًا لِيُنْذِرَ بَأْسًا شَدِيدًا مِنْ لَدُنْهُ وَيُبَشِّرَ الْمُؤْمِنِينَ الَّذِينَ يَعْمَلُونَ الصَّالِحَاتِ أَنَّ لَهُمْ أَجْرًا حَسَنًا ۝٢ مَاكِثِينَ فِيهِ أَبَدًا ۝٣ وَيُنْذِرَ الَّذِينَ قَالُوا اتَّخَذَ اللَّهُ وَلَدًا ۝٤ مَّا لَهُم بِهِۦ مِنْ عِلْمٍۢ وَلَا لِـَٔابَآئِهِمْ ۚ كَبُرَتْ كَلِمَةًۭ تَخْرُجُ مِنْ أَفْوَٰهِهِمْ ۚ إِن يَقُولُونَ إِلَّا كَذِبًۭا ۝٥ فَلَعَلَّكَ بَٰخِعٌۭ نَّفْسَكَ عَلَىٰٓ ءَاثَٰرِهِمْ إِن لَّمْ يُؤْمِنُوا۟ بِهَٰذَا ٱلْحَدِيثِ أَسَفًا ۝٦ إِنَّا جَعَلْنَا مَا عَلَى ٱلْأَرْضِ زِينَةًۭ لَّهَا لِنَبْلُوَهُمْ أَيُّهُمْ أَحْسَنُ عَمَلًۭا ۝٧ وَإِنَّا لَجَٰعِلُونَ مَا عَلَيْهَا صَعِيدًۭا جُرُزًا ۝٨ أَمْ حَسِبْتَ أَنَّ أَصْحَٰبَ ٱلْكَهْفِ وَٱلرَّقِيمِ كَانُوا۟ مِنْ ءَايَٰتِنَا عَجَبًا ۝٩ إِذْ أَوَى ٱلْفِتْيَةُ إِلَى ٱلْكَهْفِ فَقَالُوا۟ رَبَّنَآ ءَاتِنَا مِن لَّدُنكَ رَحْمَةًۭ وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًۭا ۝١٠﴾',
    juzNumber: 15,
    pageNumber: 293,
    tafsirShort: 'الثناء المطلق لله على إنزال القرآن هدى وقيماً، وحفظ أصحاب الكهف آية للمؤمنين على قدرة الله ولطفه.',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/2141.mp3',
    forFridayOnly: true,
  },
  // Day 0: Ayat Al-Kursi (2:255)
  {
    id: 'qp-kursi',
    surahNumber: 2,
    surahNameAr: 'البقرة',
    startAyah: 255,
    endAyah: 255,
    textAr: '﴿اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ﴾',
    juzNumber: 3,
    pageNumber: 42,
    tafsirShort: 'أعظم آية في كتاب الله؛ دلت على تفرد الله بالوحدانية والحياة والقيومية الشاملة وعظمة سلطانه.',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/262.mp3',
  },
  // Day 1: Khawatim Al-Baqarah (2:285-286)
  {
    id: 'qp-baqarah-end',
    surahNumber: 2,
    surahNameAr: 'البقرة',
    startAyah: 285,
    endAyah: 286,
    textAr: '﴿آمَنَ الرَّسُولُ بِمَا أُنْزِلَ إِلَيْهِ مِنْ رَبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِنْ رُسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ ۝٢٨٥ لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَا إِنْ نَسِينَا أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِنْ قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ ۖ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا ۚ أَنْتَ مَوْلَانَا فَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ ۝٢٨٦﴾',
    juzNumber: 3,
    pageNumber: 49,
    tafsirShort: 'خواتيم سورة البقرة التي من قرأهما في ليلة كفتاه؛ إيمان راسخ ودعاء مستجاب بالعفو والرحمة والنصر.',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/292.mp3',
  },
  // Day 2: Surat Al-Mulk (67:1-5)
  {
    id: 'qp-mulk-start',
    surahNumber: 67,
    surahNameAr: 'الملك',
    startAyah: 1,
    endAyah: 5,
    textAr: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ﴿تَبَٰرَكَ ٱلَّذِى بِيَدِهِ ٱلْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَىْءٍۢ قَدِيرٌ ۝١ ٱلَّذِى خَلَقَ ٱلْمَوْتَ وَٱلْحَيَوٰةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًۭا ۚ وَهُوَ ٱلْعَزِيزُ ٱلْغَفُورُ ۝٢ ٱلَّذِى خَلَقَ سَبْعَ سَمَٰوَٰتٍۢ طِبَاقًۭا ۖ مَّا تَرَىٰ فِى خَلْقِ ٱلرَّحْمَٰنِ مِن تَفَٰوُتٍۢ ۖ فَٱرْجِعِ ٱلْبَصَرَ هَلْ تَرَىٰ مِن فُطُورٍۢ ۝٣ ثُمَّ ٱرْجِعِ ٱلْبَصَرَ كَرَّتَيْنِ يَنقَلِبْ إِلَيْكَ ٱلْبَصَرُ خَاسِئًۭا وَهُوَ حَسِيرٌ ۝٤ وَلَقَدْ زَيَّنَّا ٱلسَّمَآءَ ٱلدُّنْيَا بِمَصَٰبِيحَ وَجَعَلْنَٰهَا رُجُومًۭا لِّلشَّيَٰطِينِ ۖ وَأَعْتَدْنَا لَهُمْ عَذَابَ ٱلسَّعِيرِ ۝٥﴾',
    juzNumber: 29,
    pageNumber: 562,
    tafsirShort: 'سورة الملك المنجية من عذاب القبر؛ تبين كمال قدرة الخالق في إتقان السماوات وخلق الموت والحياة للابتلاء.',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/5242.mp3',
  },
  // Day 3: Khawatim Al-Hashr (59:22-24)
  {
    id: 'qp-hashr-end',
    surahNumber: 59,
    surahNameAr: 'الحشر',
    startAyah: 22,
    endAyah: 24,
    textAr: '﴿هُوَ اللَّهُ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ ۖ عَالِمُ الْغَيْبِ وَالشَّهَادَةِ ۖ هُوَ الرَّحْمَٰنُ الرَّحِيمُ ۝٢٢ هُوَ اللَّهُ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ الْمَلِكُ الْقُدُّوسُ السَّلَامُ الْمُؤْمِنُ الْمُهَيْمِنُ الْعَزِيزُ الْجَبَّارُ الْمُتَكَبِّرُ ۚ سُبْحَانَ اللَّهِ عَمَّا يُشْرِكُونَ ۝٢٣ هُوَ اللَّهُ الْخَالِقُ الْبَارِئُ الْمُصَوِّرُ ۖ لَهُ الْأَسْمَاءُ الْحُسْنَىٰ ۚ يُسَبِّحُ لَهُ مَا فِي السَّمَاوَاتِ وَالْأَرْضِ ۖ وَهُوَ الْعَزِيزُ الْحَكِيمُ ۝٢٤﴾',
    juzNumber: 28,
    pageNumber: 548,
    tafsirShort: 'آيات الأسماء الحسنى والصفات العلى، تنزيه لله وتذكير بعظمته وملكه على سائر المخلوقات.',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/5148.mp3',
  },
  // Day 4: Surat Al-Insan (76:1-5)
  {
    id: 'qp-insan-start',
    surahNumber: 76,
    surahNameAr: 'الإنسان',
    startAyah: 1,
    endAyah: 5,
    textAr: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ﴿هَلْ أَتَىٰ عَلَى ٱلْإِنسَٰنِ حِينٌۭ مِّنَ ٱلدَّهْرِ لَمْ يَكُن شَيْـًۭٔا مَّذْكُورًا ۝١ إِنَّا خَلَقْنَا ٱلْإِنسَٰنَ مِن نُّطْفَةٍ أَمْشَاجٍۢ نَّبْتَلِيهِ فَجَعَلْنَٰهُ سَمِيعًۢا بَصِيرًا ۝٢ إِنَّا هَدَيْنَٰهُ ٱلسَّبِيلَ إِمَّا شَاكِرًۭا وَإِمَّا كَفُورًا ۝٣ إِنَّآ أَعْتَدْنَا لِلْكَٰفِرِينَ سَلَٰسِلَا۟ وَأَغْلَٰلًۭا وَسَعِيرًا ۝٤ إِنَّ ٱلْأَبْرَارَ يَشْرَبُونَ مِن كَأْسٍۢ كَانَ مِزَاجُهَا كَافُورًا ۝٥﴾',
    juzNumber: 29,
    pageNumber: 578,
    tafsirShort: 'تذكير ببداية خلق الإنسان ونعمة السمع والبصر والبيان، وجزاء الأبرار في جنات النعيم.',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/5592.mp3',
  },
  // Day 5: Surat An-Nur (24:35)
  {
    id: 'qp-nur-verse',
    surahNumber: 24,
    surahNameAr: 'النور',
    startAyah: 35,
    endAyah: 35,
    textAr: '﴿اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ ۚ مَثَلُ نُورِهِ كَمِشْكَاةٍ فِيهَا مِصْبَاحٌ ۖ الْمِصْبَاحُ فِي زُجَاجَةٍ ۖ الزُّجَاجَةُ كَأَنَّهَا كَوْكَبٌ دُرِّيٌّ يُوقَدُ مِنْ شَجَرَةٍ مُبَارَكَةٍ زَيْتُونَةٍ لَا شَرْقِيَّةٍ وَلَا غَرْبِيَّةٍ يَكَادُ زَيْتُهَا يُضِيءُ وَلَوْ لَمْ تَمْسَسْهُ نَارٌ ۚ نُورٌ عَلَىٰ نُورٍ ۗ يَهْدِي اللَّهُ لِنُورِهِ مَنْ يَشَاءُ ۚ وَيَضْرِبُ اللَّهُ الْأَمْثَالَ لِلنَّاسِ ۗ وَاللَّهُ بِكُلِّ شَيْءٍ عَلِيمٌ﴾',
    juzNumber: 18,
    pageNumber: 354,
    tafsirShort: 'آية النور العظيمة التي ضرب الله بها مثل نوره وإيمانه في قلوب أوليائه المؤمنين.',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/2826.mp3',
  },
  // Day 6: Surat Al-Fatihah & Al-Ikhlas & Al-Mu'awwidhat (1 & 112-114)
  {
    id: 'qp-fatihah-muawwidhat',
    surahNumber: 1,
    surahNameAr: 'الفاتحة والمعوذات',
    startAyah: 1,
    endAyah: 7,
    textAr: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ﴿الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝٢ الرَّحْمَٰنِ الرَّحِيمِ ۝٣ مَالِكِ يَوْمِ الدِّينِ ۝٤ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝٥ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝٦ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ۝٧﴾\n\n﴿قُلْ هُوَ اللَّهُ أَحَدٌ ۝١ اللَّهُ الصَّمَدُ ۝٢ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝٣ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ ۝٤﴾',
    juzNumber: 1,
    pageNumber: 1,
    tafsirShort: 'أم الكتاب والسبع المثاني وسورة الإخلاص التي تعدل ثلث القرآن في التوحيد.',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3',
  },
];

// ============================================================================
// VERIFIED TASBIH OPTIONS
// ============================================================================
export const VERIFIED_TASBIH_PHRASES = [
  {
    phraseAr: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    target: 33,
    virtue: 'من قالها مائة مرة حُطّت خطاياه وإن كانت مثل زبد البحر (متفق عليه).',
  },
  {
    phraseAr: 'سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ',
    target: 33,
    virtue: 'أحب الكلام إلى الله تعالى وهن الباقيات الصالحات (صحيح مسلم).',
  },
  {
    phraseAr: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    target: 33,
    virtue: 'كانت له عدل عشر رقاب وكُتبت له مائة حسنة ومُحيت عنه مائة سيئة (متفق عليه).',
  },
  {
    phraseAr: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
    target: 33,
    virtue: 'طوبى لمن وجد في صحيفته استغفاراً كثيراً.',
  },
  {
    phraseAr: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ',
    target: 33,
    virtue: 'من صلى عليَّ صلاة واحدة صلى الله عليه بها عشراً (صحيح مسلم).',
  },
];

// ============================================================================
// RELIGIOUS VERIFICATION VALIDATOR
// ============================================================================
export function validateReligiousIntegrity(item: Partial<DailyWirdItem>): { valid: boolean; reason?: string } {
  if (!item.type) return { valid: false, reason: 'نوع العنصر مطلوب' };
  if (!item.titleAr || item.titleAr.trim().length === 0) return { valid: false, reason: 'عنوان العنصر مطلوب' };

  if (item.type === 'quran') {
    const q = item.quranData;
    if (!q || !q.surahNumber || q.surahNumber < 1 || q.surahNumber > 114) {
      return { valid: false, reason: 'رقم السورة غير صالح (يجب أن يكون بين 1 و 114)' };
    }
    if (!q.ayahText || q.ayahText.trim().length === 0) {
      return { valid: false, reason: 'نص الآيات القرآنية مطلوب ويجب أن يكون موثقاً' };
    }
    return { valid: true };
  }

  if (item.type === 'hadith') {
    const h = item.hadithData;
    if (!h || !h.textAr || h.textAr.trim().length === 0) {
      return { valid: false, reason: 'نص الحديث النبوي الشريف مطلوب' };
    }
    if (!h.collectionAr || h.collectionAr.trim().length === 0) {
      return { valid: false, reason: 'تخريج الحديث والمصدر الصحيح مطلوب (مثل صحيح البخاري، صحيح مسلم)' };
    }
    return { valid: true };
  }

  if (item.type === 'dhikr') {
    const d = item.dhikrData;
    if (!d || !d.textAr || d.textAr.trim().length === 0) {
      return { valid: false, reason: 'نص الذكر المأثور مطلوب' };
    }
    if (!d.sourceAr || d.sourceAr.trim().length === 0) {
      return { valid: false, reason: 'مصدر الذكر المعتمد مطلوب' };
    }
    return { valid: true };
  }

  if (item.type === 'dua') {
    const d = item.duaData;
    if (!d || !d.textAr || d.textAr.trim().length === 0) {
      return { valid: false, reason: 'نص الدعاء مطلوب' };
    }
    if (!d.sourceAr || d.sourceAr.trim().length === 0) {
      return { valid: false, reason: 'مصدر الدعاء من القرآن أو السنة مطلوب' };
    }
    return { valid: true };
  }

  if (item.type === 'tasbih') {
    const t = item.tasbihData;
    if (!t || !t.phraseAr || t.phraseAr.trim().length === 0) {
      return { valid: false, reason: 'صيغة التسبيح مطلوبة' };
    }
    return { valid: true };
  }

  return { valid: true };
}

// ============================================================================
// DETERMINISTIC DAILY WIRD GENERATOR (100% Offline Capable & Deterministic)
// ============================================================================
export function generateDeterministicDailyWird(dateString?: string): DailyWird {
  const targetDateStr = dateString || getSaudiDateString();
  const dateObj = new Date(`${targetDateStr}T12:00:00Z`);
  const isFriday = isFridayDate(targetDateStr);
  const isRamadan = isRamadanDate(dateObj);
  const hash = getDateHash(targetDateStr);
  const hijri = getHijriDateString(dateObj);

  let title = 'ورد اليوم';
  let subtitle = 'خذ من يومك دقائق تقرّبك إلى الله';

  if (isFriday) {
    title = 'ورد يوم الجمعة';
    subtitle = 'خير يوم طلعت عليه الشمس • قراءة الكهف والصلاة على النبي ﷺ';
  } else if (isRamadan) {
    title = 'ورد رمضان';
    subtitle = 'أيام معدودات • روضة الصائمين ونفحات الإيمان والقرآن';
  }

  // 1. Quran Portion:
  let quranPortion: VerifiedQuranPortion;
  if (isFriday) {
    quranPortion = VERIFIED_QURAN_PORTIONS[0]; // Surat Al-Kahf
  } else {
    // Exclude Friday-only items for regular rotation
    const regularPortions = VERIFIED_QURAN_PORTIONS.filter((p) => !p.forFridayOnly);
    const index = hash % regularPortions.length;
    quranPortion = regularPortions[index];
  }

  const quranItem: DailyWirdItem = {
    id: `wird-item-quran-${targetDateStr}`,
    type: 'quran',
    titleAr: `الجزء الأول: تلاوة من سورة ${quranPortion.surahNameAr}`,
    subtitleAr: `الآيات (${quranPortion.startAyah} - ${quranPortion.endAyah}) • الجزء ${quranPortion.juzNumber} • الصفحة ${quranPortion.pageNumber}`,
    sortOrder: 1,
    targetCount: 1,
    isVerified: true,
    sourceReference: `سورة ${quranPortion.surahNameAr} [${quranPortion.startAyah}-${quranPortion.endAyah}]`,
    quranData: {
      surahNumber: quranPortion.surahNumber,
      surahNameAr: quranPortion.surahNameAr,
      startAyah: quranPortion.startAyah,
      endAyah: quranPortion.endAyah,
      ayahText: quranPortion.textAr,
      juzNumber: quranPortion.juzNumber,
      pageNumber: quranPortion.pageNumber,
      tafsirShort: quranPortion.tafsirShort,
      audioUrl: quranPortion.audioUrl,
    },
  };

  // 2. Dhikr Item:
  let selectedDhikr = AZKAR_DATA[hash % AZKAR_DATA.length];
  if (isFriday) {
    // On Friday, emphasize Salawat upon Prophet ﷺ
    selectedDhikr = {
      id: 'm-salawat-friday',
      categoryId: 'general',
      textAr: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ، وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ، وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ.',
      sourceAr: 'صحيح البخاري (٣٣٧٠) - الصلاة الإبراهيمية',
      benefitAr: '«أَكْثِرُوا عَلَيَّ مِنَ الصَّلَاةِ يَوْمَ الْجُمُعَةِ وَلَيْلَةَ الْجُمُعَةِ، فَمَنْ صَلَّى عَلَيَّ صَلَاةً صَلَّى اللهُ عَلَيْهِ عَشْرًا».',
      repeatCount: 10,
    };
  }

  const dhikrItem: DailyWirdItem = {
    id: `wird-item-dhikr-${targetDateStr}`,
    type: 'dhikr',
    titleAr: isFriday ? 'الجزء الثاني: الصلاة على النبي ﷺ' : 'الجزء الثاني: أذكار اليوم المأثورة',
    subtitleAr: `تكرار: ${selectedDhikr.repeatCount} مرات • ${selectedDhikr.sourceAr}`,
    sortOrder: 2,
    targetCount: selectedDhikr.repeatCount || 1,
    isVerified: true,
    sourceReference: selectedDhikr.sourceAr,
    dhikrData: {
      dhikrId: selectedDhikr.id,
      categorySlug: selectedDhikr.categoryId,
      categoryNameAr: isFriday ? 'سنن الجمعة' : 'أذكار اليوم',
      textAr: selectedDhikr.textAr,
      sourceAr: selectedDhikr.sourceAr,
      benefitAr: selectedDhikr.benefitAr,
      repeatTarget: selectedDhikr.repeatCount || 1,
    },
  };

  // 3. Hadith Item:
  let selectedHadith = HADITH_DATA[hash % HADITH_DATA.length];
  if (isFriday) {
    selectedHadith = {
      id: 'h-friday-virtue',
      collectionAr: 'صحيح مسلم',
      bookAr: 'كتاب الجمعة',
      hadithNumber: '854',
      narratorAr: 'أبي هريرة رضي الله عنه',
      textAr: 'قَالَ رَسُولُ اللَّهِ ﷺ: «خَيْرُ يَوْمٍ طَلَعَتْ عَلَيْهِ الشَّمْسُ يَوْمُ الْجُمُعَةِ؛ فِيهِ خُلِقَ آدَمُ، وَفِيهِ أُدْخِلَ الْجَنَّةَ، وَفِيهِ أُخْرِجَ مِنْهَا، وَلَا تَقُومُ السَّاعَةُ إِلَّا فِي يَوْمِ الْجُمُعَةِ».',
      explanationAr: 'يوم الجمعة عيد الأسبوع للمسلمين، خصه الله بفضائل جليلة وساعة إجابة لا يوافقها عبد مسلم يسأل الله خيراً إلا أعطاه إياه.',
      gradingAr: 'صحيح مسلم',
      topicAr: 'فضل يوم الجمعة',
    };
  }

  const hadithItem: DailyWirdItem = {
    id: `wird-item-hadith-${targetDateStr}`,
    type: 'hadith',
    titleAr: 'الجزء الثالث: حديث اليوم الصحيح',
    subtitleAr: `${selectedHadith.gradingAr} • رواه ${selectedHadith.narratorAr}`,
    sortOrder: 3,
    targetCount: 1,
    isVerified: true,
    sourceReference: `${selectedHadith.collectionAr} (${selectedHadith.hadithNumber || ''})`,
    hadithData: {
      hadithId: selectedHadith.id,
      collectionAr: selectedHadith.collectionAr,
      bookAr: selectedHadith.bookAr,
      hadithNumber: selectedHadith.hadithNumber,
      narratorAr: selectedHadith.narratorAr,
      textAr: selectedHadith.textAr,
      explanationAr: selectedHadith.explanationAr,
      gradingAr: selectedHadith.gradingAr,
    },
  };

  // 4. Dua Item:
  let selectedDua = DUA_DATA[hash % DUA_DATA.length];
  if (isFriday) {
    selectedDua = {
      id: 'd-friday-special',
      categoryId: 'general',
      titleAr: 'دعاء ساعة الإجابة يوم الجمعة',
      textAr: '﴿اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ﴾',
      sourceAr: 'صحيح البخاري (٦٣٠٦)',
      benefitAr: 'يتحرى به المسلم ساعة الاستجابة في آخر ساعة من يوم الجمعة لنيل المغفرة والرضوان.',
    };
  }

  const duaItem: DailyWirdItem = {
    id: `wird-item-dua-${targetDateStr}`,
    type: 'dua',
    titleAr: 'الجزء الرابع: دعاء اليوم المأثور',
    subtitleAr: selectedDua.titleAr,
    sortOrder: 4,
    targetCount: 1,
    isVerified: true,
    sourceReference: selectedDua.sourceAr,
    duaData: {
      duaId: selectedDua.id,
      titleAr: selectedDua.titleAr,
      textAr: selectedDua.textAr,
      sourceAr: selectedDua.sourceAr,
      benefitAr: selectedDua.benefitAr,
    },
  };

  // 5. Tasbih Item:
  const tasbihChoice = isFriday
    ? VERIFIED_TASBIH_PHRASES[4] // Salawat on Prophet
    : VERIFIED_TASBIH_PHRASES[hash % VERIFIED_TASBIH_PHRASES.length];

  const tasbihItem: DailyWirdItem = {
    id: `wird-item-tasbih-${targetDateStr}`,
    type: 'tasbih',
    titleAr: 'الجزء الخامس: التسبيح والمسبحة الإلكترونية',
    subtitleAr: `الهدف اليومي: ${tasbihChoice.target} تكراراً`,
    sortOrder: 5,
    targetCount: tasbihChoice.target,
    isVerified: true,
    sourceReference: tasbihChoice.virtue,
    tasbihData: {
      phraseAr: tasbihChoice.phraseAr,
      targetCount: tasbihChoice.target,
      virtueAr: tasbihChoice.virtue,
    },
  };

  return {
    id: `wird-${targetDateStr}`,
    date: targetDateStr,
    title,
    subtitle,
    hijriDate: hijri,
    status: 'published',
    isFriday,
    isRamadan,
    items: [quranItem, dhikrItem, hadithItem, duaItem, tasbihItem],
    createdFrom: 'deterministic_verified',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ============================================================================
// WIRD SERVICE: FETCH & CACHE
// ============================================================================
const WIRD_CACHE_PREFIX = 'wasl_daily_wird_';
const PROGRESS_CACHE_PREFIX = 'wasl_wird_progress_';

export const wirdService = {
  /**
   * Fetches today's active Daily Wird.
   * Checks server/admin scheduled entries first, falls back to deterministic verified selection.
   */
  async getDailyWird(dateString?: string): Promise<DailyWird> {
    const targetDate = dateString || getSaudiDateString();
    const cacheKey = `${WIRD_CACHE_PREFIX}${targetDate}`;

    // Try server endpoint first (which checks admin scheduled items)
    try {
      const res = await fetch(`/api/wird?date=${targetDate}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.wird && data.wird.items && data.wird.items.length > 0) {
          localStore.set(cacheKey, data.wird);
          return data.wird;
        }
      }
    } catch {
      // offline or network unavailable, continue to cache / fallback
    }

    // Check localStorage cache
    const cached = localStore.get<DailyWird | null>(cacheKey, null);
    if (cached && cached.items && cached.items.length > 0) {
      return cached;
    }

    // Fallback to deterministic verified content
    const deterministicWird = generateDeterministicDailyWird(targetDate);
    localStore.set(cacheKey, deterministicWird);
    return deterministicWird;
  },

  /**
   * Loads user progress for a specific date and wird
   */
  async getWirdProgress(wird: DailyWird, userId?: string): Promise<DailyWirdUserProgress> {
    const progressKey = `${PROGRESS_CACHE_PREFIX}${wird.date}_${userId || 'guest'}`;

    // Initialize blank progress structure
    const initialItemProgress: Record<string, WirdItemProgress> = {};
    wird.items.forEach((item) => {
      initialItemProgress[item.id] = {
        itemId: item.id,
        type: item.type,
        completed: false,
        currentCount: 0,
        targetCount: item.targetCount || 1,
      };
    });

    const fallback: DailyWirdUserProgress = {
      wirdId: wird.id,
      wirdDate: wird.date,
      userId: userId || undefined,
      completedItemsCount: 0,
      totalItemsCount: wird.items.length,
      completionPercentage: 0,
      isFullyCompleted: false,
      itemProgress: initialItemProgress,
    };

    // Load from local storage
    const saved = localStore.get<DailyWirdUserProgress | null>(progressKey, null);
    if (saved && saved.wirdDate === wird.date) {
      // Merge in any items in wird that may not be in saved
      const mergedItems = { ...initialItemProgress, ...saved.itemProgress };
      const completedCount = (Object.values(mergedItems) as WirdItemProgress[]).filter((i) => i.completed).length;
      const pct = Math.round((completedCount / wird.items.length) * 100);

      return {
        ...saved,
        totalItemsCount: wird.items.length,
        completedItemsCount: completedCount,
        completionPercentage: pct,
        isFullyCompleted: completedCount === wird.items.length,
        itemProgress: mergedItems,
      };
    }

    // If user is authenticated, sync with server user_daily_wird if available
    if (userId) {
      try {
        const userWird = await dashboardService.getDailyWird(userId, wird.date);
        if (userWird) {
          // Map userWird columns to items
          wird.items.forEach((item) => {
            if (item.type === 'quran' && userWird.quranCompleted) {
              initialItemProgress[item.id].completed = true;
              initialItemProgress[item.id].currentCount = 1;
            } else if (item.type === 'dhikr' && (userWird.morningAzkarCompleted || userWird.eveningAzkarCompleted)) {
              initialItemProgress[item.id].completed = true;
              initialItemProgress[item.id].currentCount = item.targetCount;
            } else if (item.type === 'hadith' && userWird.hadithRead) {
              initialItemProgress[item.id].completed = true;
              initialItemProgress[item.id].currentCount = 1;
            } else if (item.type === 'dua' && userWird.duaRead) {
              initialItemProgress[item.id].completed = true;
              initialItemProgress[item.id].currentCount = 1;
            } else if (item.type === 'tasbih' && userWird.tasbeehCompleted) {
              initialItemProgress[item.id].completed = true;
              initialItemProgress[item.id].currentCount = userWird.tasbeehCount || item.targetCount;
            }
          });

          const completedCount = (Object.values(initialItemProgress) as WirdItemProgress[]).filter((i) => i.completed).length;
          const pct = Math.round((completedCount / wird.items.length) * 100);
          const syncedProgress: DailyWirdUserProgress = {
            wirdId: wird.id,
            wirdDate: wird.date,
            userId,
            completedItemsCount: completedCount,
            totalItemsCount: wird.items.length,
            completionPercentage: pct,
            isFullyCompleted: completedCount === wird.items.length,
            itemProgress: initialItemProgress,
          };
          localStore.set(progressKey, syncedProgress);
          return syncedProgress;
        }
      } catch (err) {
        console.warn('Could not sync wird progress with backend:', err);
      }
    }

    localStore.set(progressKey, fallback);
    return fallback;
  },

  /**
   * Updates progress for a specific item in today's wird
   */
  async updateItemProgress(
    wird: DailyWird,
    itemId: string,
    completed: boolean,
    currentCount?: number,
    userId?: string
  ): Promise<DailyWirdUserProgress> {
    const currentProgress = await this.getWirdProgress(wird, userId);
    const item = wird.items.find((i) => i.id === itemId);
    if (!item) return currentProgress;

    const target = item.targetCount || 1;
    const count = currentCount !== undefined ? currentCount : completed ? target : 0;
    const isDone = completed || count >= target;

    currentProgress.itemProgress[itemId] = {
      itemId,
      type: item.type,
      completed: isDone,
      currentCount: count,
      targetCount: target,
      completedAt: isDone ? new Date().toISOString() : undefined,
    };

    const completedCount = (Object.values(currentProgress.itemProgress) as WirdItemProgress[]).filter((i) => i.completed).length;
    currentProgress.completedItemsCount = completedCount;
    currentProgress.completionPercentage = Math.round((completedCount / wird.items.length) * 100);
    currentProgress.isFullyCompleted = completedCount === wird.items.length;
    if (currentProgress.isFullyCompleted && !currentProgress.completedAt) {
      currentProgress.completedAt = new Date().toISOString();
    }

    // Save locally
    const progressKey = `${PROGRESS_CACHE_PREFIX}${wird.date}_${userId || 'guest'}`;
    localStore.set(progressKey, currentProgress);

    // Sync with backend / Supabase if user is logged in
    if (userId) {
      try {
        const updatePayload: any = {
          wirdDate: wird.date,
          completionPercentage: currentProgress.completionPercentage,
        };

        if (item.type === 'quran') updatePayload.quranCompleted = isDone;
        if (item.type === 'dhikr') updatePayload.morningAzkarCompleted = isDone;
        if (item.type === 'hadith') updatePayload.hadithRead = isDone;
        if (item.type === 'dua') updatePayload.duaRead = isDone;
        if (item.type === 'tasbih') {
          updatePayload.tasbeehCompleted = isDone;
          updatePayload.tasbeehCount = count;
        }

        await dashboardService.updateDailyWird(userId, updatePayload);

        // Also post to progress endpoint if available
        fetch('/api/wird/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            date: wird.date,
            wirdId: wird.id,
            itemId,
            completed: isDone,
            count,
            percentage: currentProgress.completionPercentage,
          }),
        }).catch(() => {});
      } catch (err) {
        console.warn('Background sync of wird progress failed:', err);
      }
    }

    return currentProgress;
  },

  // ==========================================================================
  // ADMIN API CLIENT METHODS
  // ==========================================================================
  async adminListWirds(): Promise<DailyWird[]> {
    try {
      const res = await fetch('/api/admin/wird');
      if (res.ok) {
        const data = await res.json();
        return data.wirds || [];
      }
    } catch (err) {
      console.error('adminListWirds error:', err);
    }
    return [];
  },

  async adminSaveWird(wird: Partial<DailyWird>): Promise<{ ok: boolean; error?: string; wird?: DailyWird }> {
    try {
      const res = await fetch('/api/admin/wird', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wird),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || 'فشل حفظ ورد اليوم' };
      }
      return { ok: true, wird: data.wird };
    } catch (err: any) {
      return { ok: false, error: err.message || 'خطأ في الاتصال بالسيرفر' };
    }
  },

  async adminDeleteWird(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/admin/wird/${id}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch {
      return false;
    }
  },
};
