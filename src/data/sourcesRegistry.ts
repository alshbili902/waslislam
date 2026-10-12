/**
 * Central Verified Islamic Sources Registry for Wasl Islamic.
 * Provides transparent attribution, scholarly verification, and institution credentials
 * for all religious content rendered across the platform.
 */

export interface ContentSource {
  id: string;
  nameAr: string;
  nameEn: string;
  category: 'quran' | 'hadith' | 'tafsir' | 'adhkar' | 'prayer' | 'fatwa' | 'audio' | 'calendar';
  institutionAr: string;
  institutionEn: string;
  descriptionAr: string;
  verificationMethodAr: string;
  referenceUrl: string;
  licenseAr: string;
  lastVerifiedYear: number;
}

export const ISLAMIC_SOURCES_REGISTRY: ContentSource[] = [
  {
    id: 'king-fahd-quran',
    nameAr: 'مصحف المدينة النبوية الشريفة',
    nameEn: 'King Fahd Glorious Quran Printing Complex',
    category: 'quran',
    institutionAr: 'مجمع الملك فهد لطباعة المصحف الشريف بالمدينة المنورة',
    institutionEn: 'King Fahd Complex for Printing the Holy Quran',
    descriptionAr: 'النص القرآني الكامل برواية حفص عن عاصم، مطابق للمصحف المطبوع بالمجمع بالرسم العثماني المعتمد دولياً.',
    verificationMethodAr: 'مراجعة وتدقيق اللجان العلمية بمجمع الملك فهد وبإشراف نخبة من كبار علماء القراءات في العالم الإسلامي.',
    referenceUrl: 'https://qurancomplex.gov.sa',
    licenseAr: 'متاح للانتفاع العام والدعوة الإسلامية دون تحريف أو تغيير',
    lastVerifiedYear: 2026,
  },
  {
    id: 'kutub-tisah-hadith',
    nameAr: 'موسوعة السنة النبوية والكتب التسعة',
    nameEn: 'Nine Books of Authentic Hadith',
    category: 'hadith',
    institutionAr: 'أمهات كتب الحديث (صحيح البخاري، صحيح مسلم، السنن الأربعة، ومسند الإمام أحمد)',
    institutionEn: 'Major Classical Hadith Compilations',
    descriptionAr: 'متون الأحاديث النبوية مخرجة بأرقامها وأبوابها مع بيان درجة الصحة والضعف استناداً لأحكام أئمة الحديث المعتمدين.',
    verificationMethodAr: 'التخريج الدقيق مع عزو كل حديث إلى بابه ورقمه في كتب السنن الأصلية ومطابقته مع شروح الأئمة.',
    referenceUrl: 'https://dorar.net/hadith',
    licenseAr: 'تراث إسلامي مفتوح للعموم',
    lastVerifiedYear: 2026,
  },
  {
    id: 'hisn-al-muslim',
    nameAr: 'حصن المسلم من أذكار الكتاب والسنة',
    nameEn: 'Hisn Al-Muslim (Fortress of the Muslim)',
    category: 'adhkar',
    institutionAr: 'مؤلفه الشيخ الدكتور سعيد بن علي بن وهف القحطاني رحمه الله',
    institutionEn: 'Dr. Saeed bin Ali bin Wahf Al-Qahtani',
    descriptionAr: 'المصدر المعتمد لأذكار الصباح والمساء، أذكار الصلاة، النوم والاستيقاظ، والأدعية المأثورة عن رسول الله ﷺ.',
    verificationMethodAr: 'تحقيق الأحاديث النبوية الواردة في الأذكار وعزوها لأصولها في الصحيحين والسنن.',
    referenceUrl: 'https://islamhouse.com/ar/books/2895/',
    licenseAr: 'وقف إسلامي متاح لعموم المسلمين',
    lastVerifiedYear: 2026,
  },
  {
    id: 'tafsir-al-muyassar',
    nameAr: 'التفسير الميسر',
    nameEn: 'Al-Tafsir Al-Muyassar',
    category: 'tafsir',
    institutionAr: 'مجمع الملك فهد لطباعة المصحف الشريف بالمدينة المنورة',
    institutionEn: 'King Fahd Complex for Printing the Holy Quran',
    descriptionAr: 'تفسير وجيز وموثوق لآيات القرآن الكريم صاغه نخبة من كبار أساتذة التفسير وفق منهج أهل السنة والجماعة.',
    verificationMethodAr: 'صادر بإشراف ومراجعة الهيئة العلمية لمجمع الملك فهد.',
    referenceUrl: 'https://qurancomplex.gov.sa/tafsir/',
    licenseAr: 'متاح للانتفاع الخيري والدعوي',
    lastVerifiedYear: 2026,
  },
  {
    id: 'umm-al-qura-calendar',
    nameAr: 'تقويم أم القرى ومواقيت الصلاة',
    nameEn: 'Umm Al-Qura Astronomical & Prayer Timing System',
    category: 'prayer',
    institutionAr: 'مدينة الملك عبد العزيز للعلوم والتقنية ومعهد البحوث الفلكية',
    institutionEn: 'KACST & Umm Al-Qura Astronomical Observatory',
    descriptionAr: 'الحسابات الفلكية الشرعية المعتمدة لخطوط الطول والعرض وزوايا ميلان الشمس (فجر 18.5° / عشاء 90 دقيقة).',
    verificationMethodAr: 'معادلات الحساب الفلكي المعتمدة رسمياً ومطابقة أوقات الصلوات مع التقاويم الشرعية العالمية.',
    referenceUrl: 'https://www.ummulqura.org.sa',
    licenseAr: 'بيانات فلكية عامة',
    lastVerifiedYear: 2026,
  },
  {
    id: 'everyayah-audio-network',
    nameAr: 'شبكة التلاوات المعتمدة (EveryAyah)',
    nameEn: 'EveryAyah Official Audio Repository',
    category: 'audio',
    institutionAr: 'مشروع التلاوات القرآنية المفتوحة برعاية نخبة من القراء المعتمدين',
    institutionEn: 'EveryAyah Quran Audio Project',
    descriptionAr: 'تلاوات مجودة كاملة ومقطعة آية بآية بأعلى جودة صوتية مسجلة في الإذاعات والمجمعات القرآنية الرسمية.',
    verificationMethodAr: 'تلاوات مسجلة بإجازات متصلة السند ومجازة من لجان مراجعة المصاحف الصوتية.',
    referenceUrl: 'https://everyayah.com',
    licenseAr: 'ترخيص الاستخدام الخيري غير التجاري (Non-commercial Islamic distribution)',
    lastVerifiedYear: 2026,
  },
  {
    id: 'fatawa-official-councils',
    nameAr: 'المجامع الفقهية وهيئات الفتوى الرسمية',
    nameEn: 'Official Islamic Fiqh Academies & Fatwa Councils',
    category: 'fatwa',
    institutionAr: 'مجمع الفقه الإسلامي الدولي، وهيئة كبار العلماء، ودور الإفتاء المعتمدة',
    institutionEn: 'International Islamic Fiqh Academy & Senior Scholars Boards',
    descriptionAr: 'مرجعية الأحكام الفقهية المتعلقة بالزكاة، الحج والعمرة، الصيام، والمسائل المعاصرة.',
    verificationMethodAr: 'القرارات والفتاوى المعتمدة الصادرة رسمياً عن المجالس الفقهية العليا دون استنتاجات فردية أو فتاوى ذكاء اصطناعي.',
    referenceUrl: 'https://iifa-aifi.org',
    licenseAr: 'أحكام وقرارات فقهية عامة',
    lastVerifiedYear: 2026,
  }
];

export function getSourceById(id: string): ContentSource | undefined {
  return ISLAMIC_SOURCES_REGISTRY.find(s => s.id === id);
}
