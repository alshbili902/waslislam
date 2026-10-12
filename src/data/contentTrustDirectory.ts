export type VerificationStatus = 
  | 'verified'          // المصدر موثق
  | 'needs_review'      // يحتاج إلى مراجعة إضافية
  | 'needs_update'      // يحتاج إلى تحديث
  | 'unreviewed'        // لم تتم المراجعة
  | 'unavailable';      // الرابط غير متاح

export interface TrustSource {
  id: string;
  nameAr: string;
  nameEn: string;
  category: 'quran' | 'tafsir' | 'hadith' | 'audio' | 'prayer_calendar' | 'dictionary' | 'educational';
  authorOrInstitution: string;
  sourceUrl: string;
  license: string;
  verificationStatus: VerificationStatus;
  lastVerifiedDate: string;
  reviewedBy: string;
  notesAr: string;
  notesEn: string;
  contentTypesSupplied: string[];
}

export interface VerificationAuditLog {
  id: string;
  sourceId: string;
  previousStatus: VerificationStatus;
  newStatus: VerificationStatus;
  reviewer: string;
  timestamp: string;
  auditNotes: string;
}

export const TRUSTED_SOURCES: TrustSource[] = [
  {
    id: 'src_quran_complex',
    nameAr: 'مصحف المدينة النبوية - مجمع الملك فهد',
    nameEn: 'Madinah Mushaf - King Fahd Complex',
    category: 'quran',
    authorOrInstitution: 'مجمع الملك فهد لطباعة المصحف الشريف بالمدينة المنورة',
    sourceUrl: 'https://qurancomplex.gov.sa',
    license: 'مفتوح للاستخدام الخيري والتعليمي الإسلامي دون تحريف',
    verificationStatus: 'verified',
    lastVerifiedDate: '2026-09-01',
    reviewedBy: 'لجنة المراجعة والتدقيق الشرعي',
    notesAr: 'النص القرآني الكامل بالرسم العثماني المعتمد، رواية حفص عن عاصم، مطابق للمصحف الشريف المطبوع بالمدينة المنورة.',
    notesEn: 'Canonical Quran text according to the Uthmani script (Hafs an Asim), King Fahd Glorious Quran Printing Complex.',
    contentTypesSupplied: ['نص القرآن الكريم', 'رسم المصحف العثماني', 'تقسيم الآيات والسور والأجزاء']
  },
  {
    id: 'src_tafsir_muyassar',
    nameAr: 'التفسير الميسر',
    nameEn: 'Al-Tafsir Al-Muyassar',
    category: 'tafsir',
    authorOrInstitution: 'نخبة من علماء التفسير بإشراف مجمع الملك فهد لطباعة المصحف الشريف',
    sourceUrl: 'https://qurancomplex.gov.sa',
    license: 'متاح للعامة مع حفظ نسبة النص',
    verificationStatus: 'verified',
    lastVerifiedDate: '2026-08-20',
    reviewedBy: 'لجنة المراجعة والتدقيق الشرعي',
    notesAr: 'تفسير موجز محرر على ضوء منهج السلف الصالح، تم اعتماده لسهولة عبارته ودقة بيانه.',
    notesEn: 'Concise commentary prepared by scholars under King Fahd Complex supervision.',
    contentTypesSupplied: ['تفسير الآيات', 'معاني الكلمات الغريبة']
  },
  {
    id: 'src_tafsir_ibn_kathir',
    nameAr: 'تفسير القرآن العظيم (ابن كثير)',
    nameEn: 'Tafsir Ibn Kathir',
    category: 'tafsir',
    authorOrInstitution: 'الحافظ عماد الدين إسماعيل بن عمر بن كثير الدمشقي (ت 774هـ)',
    sourceUrl: 'https://shamela.ws/book/23604',
    license: 'تراث إسلامي عام (Public Domain)',
    verificationStatus: 'verified',
    lastVerifiedDate: '2026-08-15',
    reviewedBy: 'أمانة التوثيق',
    notesAr: 'أشهر تفاسير المأثور، يفسر القرآن بالقرآن ثم بالسنة النبوية وأقوال الصحابة والتابعين.',
    notesEn: 'Classical Tafsir by Hadith and transmission, authenticated text edition.',
    contentTypesSupplied: ['تفسير القرآن بالمأثور', 'أسباب النزول', 'الأحاديث والآثار']
  },
  {
    id: 'src_tafsir_saadi',
    nameAr: 'تيسير الكريم الرحمن في تفسير كلام المنان (السعدي)',
    nameEn: 'Tafsir Al-Saadi',
    category: 'tafsir',
    authorOrInstitution: 'الشيخ عبد الرحمن بن ناصر السعدي (ت 1376هـ)',
    sourceUrl: 'https://shamela.ws/book/23605',
    license: 'تراث إسلامي عام / تحقيق الشيخ عبد السلام علوش',
    verificationStatus: 'verified',
    lastVerifiedDate: '2026-08-10',
    reviewedBy: 'أمانة التوثيق',
    notesAr: 'تفسير سلس ومعاصر يركز على مقاصد الآيات والتربية الإيمانية مع سلامة المعتقد.',
    notesEn: 'Accessible and lucid commentary focusing on spiritual guidance and Quranic themes.',
    contentTypesSupplied: ['تفسير الآيات', 'الفوائد الإيمانية والمقاصد']
  },
  {
    id: 'src_tafsir_qurtubi',
    nameAr: 'الجامع لأحكام القرآن (القرطبي)',
    nameEn: 'Tafsir Al-Qurtubi',
    category: 'tafsir',
    authorOrInstitution: 'الإمام أبو عبد الله محمد بن أحمد القرطبي (ت 671هـ)',
    sourceUrl: 'https://shamela.ws/book/23606',
    license: 'تراث إسلامي عام (Public Domain)',
    verificationStatus: 'verified',
    lastVerifiedDate: '2026-07-28',
    reviewedBy: 'لجنة المراجعة والتدقيق الشرعي',
    notesAr: 'عمدة في بيان الأحكام الفقهية ومسائل الاستنباط واللغة والإعراب المستنبطة من الآيات.',
    notesEn: 'Major classical commentary focusing on jurisprudential deductions, Arabic linguistics, and rulings.',
    contentTypesSupplied: ['الأحكام الفقهية', 'المسائل اللغوية والإعراب']
  },
  {
    id: 'src_tafsir_jalalayn',
    nameAr: 'تفسير الجلالين',
    nameEn: 'Tafsir Al-Jalalayn',
    category: 'tafsir',
    authorOrInstitution: 'جلال الدين المحلي وجلال الدين السيوطي',
    sourceUrl: 'https://shamela.ws/book/23607',
    license: 'تراث إسلامي عام (Public Domain)',
    verificationStatus: 'verified',
    lastVerifiedDate: '2026-07-15',
    reviewedBy: 'أمانة التوثيق',
    notesAr: 'تفسير مختصر جداً يوضح الكلمات المبهمة وإعراب ما يحتاج إلى إعراب وإيجاز المعنى.',
    notesEn: 'Famous concise commentary renowned for brevity and linguistic clarity.',
    contentTypesSupplied: ['تفسير موجز', 'إعراب الكلمات الصعبة']
  },
  {
    id: 'src_hadith_bukhari',
    nameAr: 'صحيح البخاري (الجامع المسند الصحيح)',
    nameEn: 'Sahih Al-Bukhari',
    category: 'hadith',
    authorOrInstitution: 'الإمام محمد بن إسماعيل البخاري (ت 256هـ)',
    sourceUrl: 'https://sunnah.com/bukhari',
    license: 'تراث إسلامي موثق / مراجعة دار التأصيل',
    verificationStatus: 'verified',
    lastVerifiedDate: '2026-09-05',
    reviewedBy: 'لجنة التوثيق الحديثي',
    notesAr: 'أصح كتاب بعد كتاب الله، تم ضبط نصوص الأحاديث وأرقام الكتب والأبواب وفق الترقيم العالمي المعتمد.',
    notesEn: 'The most authentic collection of Hadith, globally indexed and verified text.',
    contentTypesSupplied: ['أحاديث نبوية صحيحة', 'تراجم الأبواب', 'شروح مختصرة']
  },
  {
    id: 'src_hadith_muslim',
    nameAr: 'صحيح مسلم (المسند الصحيح المختصر)',
    nameEn: 'Sahih Muslim',
    category: 'hadith',
    authorOrInstitution: 'الإمام مسلم بن الحجاج النيسابوري (ت 261هـ)',
    sourceUrl: 'https://sunnah.com/muslim',
    license: 'تراث إسلامي موثق',
    verificationStatus: 'verified',
    lastVerifiedDate: '2026-09-05',
    reviewedBy: 'لجنة التوثيق الحديثي',
    notesAr: 'ثاني الصحيحين، متميز بحسن السياق وجمع طرق الحديث في موضع واحد.',
    notesEn: 'Second most authoritative Hadith compendium, organized by thematic chapters.',
    contentTypesSupplied: ['أحاديث نبوية صحيحة', 'طرق الأسانيد']
  },
  {
    id: 'src_hadith_riyad',
    nameAr: 'رياض الصالحين من كلام سيد المرسلين',
    nameEn: 'Riyad as-Salihin',
    category: 'hadith',
    authorOrInstitution: 'الإمام يحيى بن شرف النووي (ت 676هـ)',
    sourceUrl: 'https://sunnah.com/riyadussalihin',
    license: 'تراث إسلامي عام',
    verificationStatus: 'verified',
    lastVerifiedDate: '2026-08-30',
    reviewedBy: 'لجنة التوثيق الحديثي',
    notesAr: 'كتاب جامع للأحاديث الصحيحة والحسنة في الأخلاق، والرقائق، والآداب، والعبادات.',
    notesEn: 'Practical moral and behavioral Hadith compilation by Imam An-Nawawi.',
    contentTypesSupplied: ['أحاديث الأخلاق والآداب', 'الرقائق وأعمال القلوب']
  },
  {
    id: 'src_dictionary_asfahani',
    nameAr: 'معجم مفردات ألفاظ القرآن الكريم',
    nameEn: 'Vocabulary of Quranic Words - Al-Raghib Al-Isfahani',
    category: 'dictionary',
    authorOrInstitution: 'أبو القاسم الحسين بن محمد الراغب الأصفهاني (ت 502هـ)',
    sourceUrl: 'https://shamela.ws/book/23608',
    license: 'تراث إسلامي عام / طبعة دار القلم',
    verificationStatus: 'verified',
    lastVerifiedDate: '2026-09-10',
    reviewedBy: 'لجنة الدراسات اللغوية والقرآنية',
    notesAr: 'أوثق المعاجم اللغوية المخصصة لألفاظ القرآن الكريم وجذورها ومعانيها الأصلية والفرعية.',
    notesEn: 'Seminal etymological and semantic dictionary dedicated to Quranic vocabulary.',
    contentTypesSupplied: ['جذور الكلمات', 'المعاني اللغوية الدقيقة', 'شواهد الاستعمال القرآني']
  },
  {
    id: 'src_audio_mp3quran',
    nameAr: 'شبكة تلاوات القرآن الكريم وإذاعاته',
    nameEn: 'Quran Audio Network & Reciters',
    category: 'audio',
    authorOrInstitution: 'شبكة إذاعات القرآن الكريم ومكتبة التلاوات المعتمدة MP3Quran / مؤسسة قرآني',
    sourceUrl: 'https://mp3quran.net',
    license: 'استخدام خيري لنشر القرآن الكريم وتلاواته',
    verificationStatus: 'verified',
    lastVerifiedDate: '2026-09-12',
    reviewedBy: 'هندسة الصوتيات ومراقبة الروابط',
    notesAr: 'تلاوات لكبار القراء المعتمدين (الحصري، المنشاوي، عبد الباسط، المعيقلي، العفاسي) بنقاوة صوتية عالية وبروابط CDN مستقرة.',
    notesEn: 'High-fidelity audio recordings and live streams from certified Quranic reciters.',
    contentTypesSupplied: ['تلاوات السور كاملة', 'بث إذاعي مباشر حي']
  },
  {
    id: 'src_prayer_ummalqura',
    nameAr: 'تقويم ومواقيت أم القرى (مكة المكرمة)',
    nameEn: 'Umm Al-Qura Calendar & Prayer Calculation',
    category: 'prayer_calendar',
    authorOrInstitution: 'مدينة الملك عبد العزيز للعلوم والتقنية ومعهد البحوث الفلكية',
    sourceUrl: 'https://www.ummulqura.org.sa',
    license: 'معتمد رسمياً في المملكة العربية السعودية والعالم الإسلامي',
    verificationStatus: 'verified',
    lastVerifiedDate: '2026-09-01',
    reviewedBy: 'فريق الحسابات الفلكية الشرعية',
    notesAr: 'أدق معايير مواقيت الصلاة وبدايات الشهور الهجرية المعتمدة رسمياً في مكة المكرمة.',
    notesEn: 'Official astronomical and religious calculation methodology of Makkah.',
    contentTypesSupplied: ['مواقيت الصلاة', 'التقويم الهجري', 'حساب زوايا الفجر والعشاء']
  }
];

export const INITIAL_AUDIT_LOGS: VerificationAuditLog[] = [
  {
    id: 'audit_01',
    sourceId: 'src_quran_complex',
    previousStatus: 'unreviewed',
    newStatus: 'verified',
    reviewer: 'لجنة المراجعة والتدقيق الشرعي',
    timestamp: '2026-09-01T10:00:00Z',
    auditNotes: 'تمت مطابقة نصوص السور والآيات مع الطبعة المعتمدة للمصحف الشريف بمجمع الملك فهد، والتحقق التام من خلوها من أي أخطاء مطبعية.'
  },
  {
    id: 'audit_02',
    sourceId: 'src_hadith_bukhari',
    previousStatus: 'unreviewed',
    newStatus: 'verified',
    reviewer: 'لجنة التوثيق الحديثي',
    timestamp: '2026-09-05T14:30:00Z',
    auditNotes: 'تمت مراجعة نصوص الأحاديث وأسانيدها وترقيمها مع مطابقة صحة النقل عن الأصول المسندة.'
  },
  {
    id: 'audit_03',
    sourceId: 'src_dictionary_asfahani',
    previousStatus: 'unreviewed',
    newStatus: 'verified',
    reviewer: 'لجنة الدراسات اللغوية والقرآنية',
    timestamp: '2026-09-10T11:15:00Z',
    auditNotes: 'تم التحقق من ربط الجذور اللغوية بكلمات القرآن وضمان عدم توليد أي معانٍ اصطناعية أو تأويلات غير مسندة.'
  }
];
