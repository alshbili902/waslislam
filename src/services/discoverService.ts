import { DiscoverFeedData } from '../types';
import { ALLAH_NAMES_DATA } from '../data/allahNamesData';
import { SEERAH_DATA } from '../data/seerahData';
import { HADITH_DATA } from '../data/hadithData';
import { AZKAR_DATA } from '../data/azkarData';
import { DUA_DATA } from '../data/duaData';
import { VERIFIED_INITIAL_WISDOMS } from '../data/wisdomsData';
import { LIBRARY_BOOKS_DATA } from '../data/libraryData';

// Generate a deterministic integer seed from a date string (e.g. "2026-09-14")
export function hashDateString(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Deterministic selection helper
function pickDeterministic<T>(list: T[], seed: number, offset = 0): T {
  if (!list || list.length === 0) throw new Error('Cannot pick from empty list');
  const index = (seed + offset) % list.length;
  return list[index];
}

// Selected verified Ayahs with authentic Tafsir for Daily Discover
const CURATED_DAILY_AYAHS = [
  {
    text: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا * وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ',
    surahName: 'الطلاق',
    ayahNumber: 2,
    tafsir: 'من يتقِ حدود الله ويقف عند أمره ونهيه، يجعل الله له فرجاً ومخرجاً من كل ضيق وكربة، ويرزقه من وجه لا يخطر بباله ولا يرجوه.'
  },
  {
    text: 'إِنَّ اللَّهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ يَا أَيُّهَا الَّذِينَ آمَنُوا صَلُّوا عَلَيْهِ وَسَلِّمُوا تَسْلِيمًا',
    surahName: 'الأحزاب',
    ayahNumber: 56,
    tafsir: 'إن الله تعالى يثني على نبيه عند الملائكة المقربين، وملائكته يدعون له ويثنون عليه، فأكثروا أيها المؤمنون من الصلاة والسلام عليه إجلالاً وتوقيراً.'
  },
  {
    text: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    surahName: 'الرعد',
    ayahNumber: 28,
    tafsir: 'حقيق وجدير بقلوب المؤمنين أن تسكن وتستأنس وترتاح بذكر الله عز وجل وتوحيده وتسبيحه.'
  },
  {
    text: 'وَقُل رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
    surahName: 'الإسراء',
    ayahNumber: 24,
    tafsir: 'دعاء مأمور به للوالدين بالرحمة والمغفرة جزاء ما بذلاه من رعاية وإحسان وتعب في الصغر.'
  },
  {
    text: 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ',
    surahName: 'البقرة',
    ayahNumber: 186,
    tafsir: 'بشارة عظيمة من الله بقربه من السائلين والداعين، وإجابته لمن دعاه بقلب مخلص حاضر.'
  },
  {
    text: 'فَاصْبِرْ إِنَّ وَعْدَ اللَّهِ حَقٌّ وَلَا يَسْتَخِفَّنَّكَ الَّذِينَ لَا يُوقِنُونَ',
    surahName: 'الروم',
    ayahNumber: 60,
    tafsir: 'أمر بالثبات والصبر على طاعة الله ودعوته؛ فإن وعده بالنصر والتمكين واقع لا محالة.'
  }
];

const PLATFORM_FEATURES = [
  {
    title: 'ورد المحاسبة والعبادة اليومي',
    desc: 'تابع أورادك من الصلوات، قراءة القرآن، والأذكار في مكان مريح وسري.',
    targetTab: 'wird',
    icon: 'CheckCircle2'
  },
  {
    title: 'المكتبة الإسلامية الكلاسيكية',
    desc: 'تصفح أمهات الكتب الإسلامية وقواعد الفقه والسيرة في تجربة قراءة فاخرة.',
    targetTab: 'library',
    icon: 'Library'
  },
  {
    title: 'حاسبة وخريطة الحج والعمرة',
    desc: 'دليل عملي تفصيلي خطوة بخطوة لأداء مناسك العمرة والحج وفق السنة النبوية.',
    targetTab: 'hajj-umrah',
    icon: 'MapPin'
  },
  {
    title: 'سجل صيامي والتقويم الهجري',
    desc: 'سجل أيام صيام الفريضة والنوافل وأيام البيض بخصوصية واحتسب الأجر.',
    targetTab: 'fasting',
    icon: 'Calendar'
  },
  {
    title: 'مواقيت الصلاة الدقيقة وبوصلة القبلة',
    desc: 'تحديد دقيق لمواقيت الصلاة والعد التنازلي مع دعم إشعارات الصلاة.',
    targetTab: 'prayer-times',
    icon: 'Compass'
  }
];

// Get Deterministic Daily Discover Feed for a specific date (never random on refresh)
export function getDailyDiscoverFeed(date: Date = new Date()): DiscoverFeedData {
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const seed = hashDateString(dateStr);

  const ayah = pickDeterministic(CURATED_DAILY_AYAHS, seed, 1);
  const hadithItem = pickDeterministic(HADITH_DATA, seed, 3);
  const dhikrItem = pickDeterministic(AZKAR_DATA, seed, 5);
  const duaItem = pickDeterministic(DUA_DATA, seed, 7);
  const wisdomItem = pickDeterministic(VERIFIED_INITIAL_WISDOMS, seed, 9);
  const allahName = pickDeterministic(ALLAH_NAMES_DATA, seed, 11);
  const seerahHighlight = pickDeterministic(SEERAH_DATA, seed, 13);
  const libraryPick = pickDeterministic(LIBRARY_BOOKS_DATA, seed, 15);
  const featureHighlight = pickDeterministic(PLATFORM_FEATURES, seed, 17);

  // Formatted Gregorian Date
  const gregDate = `${date.getDate()} ${['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'][date.getMonth()]} ${date.getFullYear()} م`;

  return {
    date: gregDate,
    hijriDate: '', // Can be populated with active Hijri date
    ayah,
    hadith: {
      text: hadithItem.textAr,
      narrator: hadithItem.narratorAr,
      source: hadithItem.collectionAr,
      explanation: hadithItem.explanationAr
    },
    dhikr: {
      text: dhikrItem.textAr,
      source: dhikrItem.sourceAr,
      benefit: dhikrItem.benefitAr
    },
    dua: {
      text: duaItem.textAr,
      source: duaItem.sourceAr
    },
    wisdom: {
      text: wisdomItem.content,
      author: wisdomItem.author,
      source: wisdomItem.source,
      category: wisdomItem.category
    },
    allahName,
    seerahHighlight,
    libraryPick,
    featureHighlight
  };
}
