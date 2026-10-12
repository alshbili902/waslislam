import { normalizeArabicText as normalizeArabic } from './arabicSearch.ts';
import { AUTHENTIC_HADITHS } from '../data/hadithData.ts';
import { ADHKAR_DATA } from '../data/adhkarData.ts';
import { VERIFIED_OFFLINE_SURAHS, SURAH_LIST } from '../data/quranMetadata.ts';

export type KnowledgeContentType = 'quran' | 'tafsir' | 'hadith' | 'fatwa' | 'dua';

export interface KnowledgeResult {
  id: string;
  type: KnowledgeContentType;
  typeLabelAr: string;
  typeLabelEn: string;
  title: string;
  quoteText: string;
  sourceInstitution: string;
  referenceId: string;
  url?: string;
  verified: boolean;
  grade?: string; // e.g. "صحيح متفق عليه"
  scholarlyNote?: string;
  relevanceScore: number;
}

export interface SearchQueryResponse {
  query: string;
  hasResults: boolean;
  results: KnowledgeResult[];
  fallbackMessage?: string;
  suggestedRefinements: string[];
}

// Verified institutional Fatwa database for authentic rulings
const VERIFIED_FATWAS: Omit<KnowledgeResult, 'relevanceScore'>[] = [
  {
    id: 'fatwa-zakat-stocks',
    type: 'fatwa',
    typeLabelAr: 'فتوى معتمدة',
    typeLabelEn: 'Verified Fatwa',
    title: 'حكم زكاة الأسهم والصناديق الاستثمارية',
    quoteText: 'الأسهم إن كانت للتجارة والمضاربة، فإنها تُزكّى زكاة عروض التجارة بنسبة 2.5% من قيمتها السوقية يوم تمام الحول. وإن كانت للاستثمار طويل الأجل وقبض الأرباح، فالزكاة تكون على الأرباح المحصلة عند قبضها بعد خصم الأصول الثابتة.',
    sourceInstitution: 'مجمع الفقه الإسلامي الدولي وهيئة كبار العلماء',
    referenceId: 'قرار مجمع الفقه الإسلامي رقم 120 (13/3) • فتوى اللجنة الدائمة رقم 18884',
    url: 'https://alifta.gov.sa',
    verified: true,
    scholarlyNote: 'فتوى مجمعية صادرة بعد دراسة شرعية واقتصادية مستفيضة.'
  },
  {
    id: 'fatwa-witr-prayer',
    type: 'fatwa',
    typeLabelAr: 'فتوى معتمدة',
    typeLabelEn: 'Verified Fatwa',
    title: 'وقت صلاة الوتر وأفضل صفاتها',
    quoteText: 'صلاة الوتر سنة مؤكدة، ووقتها يمتد من بعد صلاة العشاء إلى طلوع الفجر الثاني. وأفضل وقتها ثلث الليل الآخر لمن وثق من الاستيقاظ، وأقلها ركعة واحدة، وأدنى الكمال ثلاث ركعات بسلامين أو سلام واحد دون تشهد أوسط كالمغرب.',
    sourceInstitution: 'اللجنة الدائمة للبحوث العلمية والإفتاء',
    referenceId: 'مجموع فتاوى ابن باز (11/309) • فتاوى اللجنة الدائمة (7/172)',
    url: 'https://alifta.gov.sa',
    verified: true,
    scholarlyNote: 'أجمع العلماء على سنية الوتر وفضله العظيم.'
  },
  {
    id: 'fatwa-travel-prayer',
    type: 'fatwa',
    typeLabelAr: 'فتوى معتمدة',
    typeLabelEn: 'Verified Fatwa',
    title: 'مسافة قصر الصلاة والجمع للمسافر',
    quoteText: 'يجوز للمسافر قصر الصلاة الرباعية إلى ركعتين والجمع بين الظهر والعصر وبين المغرب والعشاء تقديماً أو تأخيراً إذا بلغ مسير سفره ما يُعد سفراً عرفاً (نحو 80 كيلومتراً فأكثر)، ما لم ينوِ الإقامة المطلقة في بلد الوصول.',
    sourceInstitution: 'دار الإفتاء وهيئة كبار العلماء بالمملكة العربية السعودية',
    referenceId: 'فتاوى اللجنة الدائمة (8/99)',
    url: 'https://alifta.gov.sa',
    verified: true,
    scholarlyNote: 'رخصة شرعية ثبتت بالكتاب والسنة وتيسيراً على المسلمين.'
  },
  {
    id: 'fatwa-fasting-drops',
    type: 'fatwa',
    typeLabelAr: 'فتوى معتمدة',
    typeLabelEn: 'Verified Fatwa',
    title: 'أثر قطرة العين والأذن وبخاخ الربو على الصيام',
    quoteText: 'قطرة العين وقطرة الأذن وبخاخ الربو العلاجي لا تفطر الصائم على الصحيح من أقوال أهل العلم؛ لأنها ليست طعاماً ولا شراباً ولا في معناهما، ولا تصل إلى المعدة من منفذ معتاد.',
    sourceInstitution: 'المجمع الفقهي لرابطة العالم الإسلامي ومجموع فتاوى ابن عثيمين',
    referenceId: 'قرار المجمع الفقهي بمكة المكرمة (الدورة العاشرة) • فتاوى ابن عثيمين (19/206)',
    url: 'https://alifta.gov.sa',
    verified: true,
    scholarlyNote: 'صادر بتوافق الأطباء والفقهاء في الندوة الفقهية الطبية.'
  }
];

// Curated Tafsir records from Tafsir Al-Muyassar
const VERIFIED_TAFSIR_RECORDS: Omit<KnowledgeResult, 'relevanceScore'>[] = [
  {
    id: 'tafsir-fatihah-1',
    type: 'tafsir',
    typeLabelAr: 'تفسير معتمد',
    typeLabelEn: 'Verified Tafsir',
    title: 'تفسير قوله تعالى: {إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ}',
    quoteText: 'نخصك وحدك يا ربنا بالعبادة والطاعة والخضوع، ونخصك وحدك بطلب العون والمعونة في جميع أمورنا، فلا نعبد سواك ولا نستعين بأحد غيرك.',
    sourceInstitution: 'التفسير الميسر • مجمع الملك فهد لطباعة المصحف الشريف',
    referenceId: 'سورة الفاتحة (الآية 5)',
    url: 'https://quran.ksu.edu.sa',
    verified: true,
    scholarlyNote: 'أصل التوحيد وإفراد الله بالعبادة والاستعانة.'
  },
  {
    id: 'tafsir-baqarah-kursi',
    type: 'tafsir',
    typeLabelAr: 'تفسير معتمد',
    typeLabelEn: 'Verified Tafsir',
    title: 'تفسير آية الكرسي: {اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ}',
    quoteText: 'الله لا معبود بحق إلا هو وحده، المتصف بالحياة الكاملة الدائمة التي لا يعتريها موت ولا نقص، القائم بنفسه والمقيم لجميع خلقه، لا تأخذه سنة (نعاس) ولا نوم لعظم قيوميته وكماله.',
    sourceInstitution: 'تفسير ابن كثير والتفسير الميسر',
    referenceId: 'سورة البقرة (الآية 255)',
    url: 'https://quran.ksu.edu.sa',
    verified: true,
    scholarlyNote: 'أعظم آية في كتاب الله الكريم، تحرس قائلها من الشياطين.'
  },
  {
    id: 'tafsir-ikhlas',
    type: 'tafsir',
    typeLabelAr: 'تفسير معتمد',
    typeLabelEn: 'Verified Tafsir',
    title: 'تفسير سورة الإخلاص: {قُلْ هُوَ اللَّهُ أَحَدٌ}',
    quoteText: 'قل أيها الرسول للناس: إن ربي هو الله الواحد الأحد، الذي لا شريك له ولا شبيه، الصمد الذي تقصده جميع الخلائق في حوائجها، لم يلد ولم يولد ولم يكن له كفؤاً أحد.',
    sourceInstitution: 'التفسير الميسر • مجمع الملك فهد لطباعة المصحف الشريف',
    referenceId: 'سورة الإخلاص (الآيات 1-4)',
    url: 'https://quran.ksu.edu.sa',
    verified: true,
    scholarlyNote: 'تعدل ثلث القرآن لاشتمالها على صفات الإله التوحيدية الكاملة.'
  }
];

export class KnowledgeSearchEngine {
  static search(
    queryText: string,
    filterType: 'all' | KnowledgeContentType = 'all'
  ): SearchQueryResponse {
    const rawQuery = queryText.trim();
    if (!rawQuery) {
      return {
        query: '',
        hasResults: false,
        results: [],
        suggestedRefinements: ['النية', 'صلاة الوتر', 'آية الكرسي', 'زكاة الأسهم', 'أذكار الصباح']
      };
    }

    const normQuery = normalizeArabic(rawQuery);
    const queryTokens: string[] = normQuery.split(/\s+/).filter((t: string) => t.length > 1);

    const candidates: KnowledgeResult[] = [];

    // 1. Search Hadiths
    if (filterType === 'all' || filterType === 'hadith') {
      AUTHENTIC_HADITHS.forEach(h => {
        const normHadith = normalizeArabic(h.arabic + ' ' + h.narratorAr + ' ' + h.chapterAr + ' ' + h.tags.join(' '));
        const score = this.calculateMatchScore(queryTokens, normHadith);
        if (score > 0) {
          candidates.push({
            id: h.id,
            type: 'hadith',
            typeLabelAr: 'حديث نبوي شريف',
            typeLabelEn: 'Authentic Hadith',
            title: `حديث: ${h.chapterAr} (رواه ${h.narratorAr})`,
            quoteText: h.arabic,
            sourceInstitution: h.source,
            referenceId: `رقم الحديث: ${h.hadithNumber}`,
            verified: true,
            grade: h.grade,
            scholarlyNote: `مخرّج في الأصول الستة بإسناد متصل صحيح.`,
            relevanceScore: score + 10 // priority for authentic Hadith
          });
        }
      });
    }

    // 2. Search Quran Verses & Surahs
    if (filterType === 'all' || filterType === 'quran') {
      SURAH_LIST.forEach(s => {
        const normSurah = normalizeArabic(s.name + ' ' + s.englishName);
        const score = this.calculateMatchScore(queryTokens, normSurah);
        if (score > 0) {
          candidates.push({
            id: `quran-surah-${s.number}`,
            type: 'quran',
            typeLabelAr: 'سورة قرآنية كريمة',
            typeLabelEn: 'Holy Quran Surah',
            title: `سورة ${s.name} (${s.revelationType === 'Meccan' ? 'مكية' : 'مدنية'})`,
            quoteText: `سورة ${s.name}، ترتيبها في المصحف الشريف ${s.number}، وعدد آياتها ${s.numberOfAyahs} آية. مبدوءة في الجزء ${s.juzStart}.`,
            sourceInstitution: 'المصحف الشريف • مجمع الملك فهد لطباعة المصحف الشريف',
            referenceId: `سورة رقم ${s.number}`,
            verified: true,
            relevanceScore: score + 8
          });
        }
      });

      // Search offline verses (Al-Fatihah, Ayah al-Kursi, etc.)
      Object.entries(VERIFIED_OFFLINE_SURAHS).forEach(([surahNum, ayahs]) => {
        ayahs.forEach((ayah, idx) => {
          const normAyah = normalizeArabic(ayah.text + ' ' + ayah.tafsirAr);
          const score = this.calculateMatchScore(queryTokens, normAyah);
          if (score > 0) {
            candidates.push({
              id: `quran-ayah-${surahNum}-${idx + 1}`,
              type: 'quran',
              typeLabelAr: 'آية قرآنية كريمة',
              typeLabelEn: 'Quran Ayah',
              title: `آية من سورة ${SURAH_LIST[parseInt(surahNum) - 1]?.name || surahNum} (الآية ${idx + 1})`,
              quoteText: ayah.text,
              sourceInstitution: 'مصحف المدينة المنورة النبوي المعتمد',
              referenceId: `سورة ${surahNum} • الآية ${idx + 1}`,
              verified: true,
              scholarlyNote: ayah.tafsirAr,
              relevanceScore: score + 12
            });
          }
        });
      });
    }

    // 3. Search Tafsir
    if (filterType === 'all' || filterType === 'tafsir') {
      VERIFIED_TAFSIR_RECORDS.forEach(t => {
        const normText = normalizeArabic(t.title + ' ' + t.quoteText + ' ' + (t.scholarlyNote || ''));
        const score = this.calculateMatchScore(queryTokens, normText);
        if (score > 0) {
          candidates.push({
            ...t,
            relevanceScore: score + 9
          });
        }
      });
    }

    // 4. Search Verified Fatwas
    if (filterType === 'all' || filterType === 'fatwa') {
      VERIFIED_FATWAS.forEach(f => {
        const normText = normalizeArabic(f.title + ' ' + f.quoteText + ' ' + (f.scholarlyNote || ''));
        const score = this.calculateMatchScore(queryTokens, normText);
        if (score > 0) {
          candidates.push({
            ...f,
            relevanceScore: score + 10
          });
        }
      });
    }

    // 5. Search Adhkar & Duas
    if (filterType === 'all' || filterType === 'dua') {
      ADHKAR_DATA.forEach(a => {
        const normText = normalizeArabic(a.categoryAr + ' ' + a.textAr + ' ' + a.virtueAr + ' ' + a.referenceAr);
        const score = this.calculateMatchScore(queryTokens, normText);
        if (score > 0) {
          candidates.push({
            id: a.id,
            type: 'dua',
            typeLabelAr: 'دعاء وذكر مأثور',
            typeLabelEn: 'Supplication & Dhikr',
            title: `${a.categoryAr}: ذكر نبوي مبارك`,
            quoteText: a.textAr,
            sourceInstitution: a.referenceAr,
            referenceId: a.referenceAr,
            verified: true,
            scholarlyNote: a.virtueAr,
            relevanceScore: score + 7
          });
        }
      });
    }

    // Sort by relevance score descending
    candidates.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Dedup by title
    const seenTitles = new Set<string>();
    const uniqueResults = candidates.filter(r => {
      if (seenTitles.has(r.title)) return false;
      seenTitles.add(r.title);
      return true;
    });

    if (uniqueResults.length === 0) {
      return {
        query: rawQuery,
        hasResults: false,
        results: [],
        fallbackMessage: 'لم نعثر على مصدر موثوق كافٍ للإجابة عن هذا السؤال، حرصاً على عدم الإفتاء بغير علم أو نسبة ما لم يثبت.',
        suggestedRefinements: [
          'جرب البحث بكلمات محددة مثل: "النية"، "صلاة الوتر"، "آية الكرسي"',
          'ابحث عن أصل المسألة الفقهية: "زكاة الأسهم" أو "قصر الصلاة للمسافر"',
          'تأكد من كتابة الكلمات بالحروف الأساسية دون اختصارات.'
        ]
      };
    }

    return {
      query: rawQuery,
      hasResults: true,
      results: uniqueResults.slice(0, 15),
      suggestedRefinements: []
    };
  }

  private static calculateMatchScore(queryTokens: string[], targetText: string): number {
    let score = 0;
    for (const token of queryTokens) {
      if (targetText.includes(token)) {
        score += 5;
        // Exact word match bonus
        const regex = new RegExp(`\\b${token}\\b`);
        if (regex.test(targetText)) {
          score += 5;
        }
      }
    }
    return score;
  }
}
