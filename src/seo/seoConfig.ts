import { SURAHS_LIST, RECITERS_LIST } from '../data/quranMetadata';
import { ARTICLES_DATA } from '../data/articlesData';
import { FATWA_DATA } from '../data/fatwaData';
import { LIBRARY_BOOKS_DATA } from '../data/libraryData';
import { VERIFIED_INITIAL_WISDOMS } from '../data/wisdomsData';

export const CANONICAL_DOMAIN = 'https://waslislam.fun';
export const SITE_NAME_AR = 'وصل الإسلامية';
export const SITE_NAME_EN = 'Wasl Islamic';
export const DEFAULT_OG_IMAGE = `${CANONICAL_DOMAIN}/branding/og-image-dark.png`;
export const SITE_LOGO = `${CANONICAL_DOMAIN}/branding/wasl-islamic-icon-dark.png`;

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface RouteSeoConfig {
  path: string;
  title: string;
  description: string;
  priority: number;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  breadcrumbs: BreadcrumbItem[];
  isIndexable: boolean;
  ogType?: 'website' | 'article';
}

// 1. Static Public Indexable Routes
export const STATIC_PUBLIC_ROUTES: RouteSeoConfig[] = [
  {
    path: '/',
    title: 'وصل الإسلامية | طريقك إلى الخير دائماً - القرآن والأذكار والأحاديث ومواقيت الصلاة',
    description: 'منصة وصل الإسلامية تجمع القرآن الكريم وتلاوات القراء، الأذكار، الأدعية، الأحاديث، مواقيت الصلاة، اتجاه القبلة، الختمة والحفظ وتتبع العبادات في تجربة إيمانية متكاملة موثقة.',
    priority: 1.0,
    changefreq: 'daily',
    breadcrumbs: [{ name: 'الرئيسية', url: `${CANONICAL_DOMAIN}/` }],
    isIndexable: true,
  },
  {
    path: '/quran',
    title: 'القرآن الكريم | تلاوة وقراءة بالرسم العثماني المعتمد | وصل الإسلامية',
    description: 'اقرأ القرآن الكريم كاملاً بالرسم العثماني الموثق مع التفسير الميسر، إمكانية البحث الفوري، الاستماع للآيات، ومتابعة القراءة والختمات.',
    priority: 0.95,
    changefreq: 'weekly',
    breadcrumbs: [
      { name: 'الرئيسية', url: `${CANONICAL_DOMAIN}/` },
      { name: 'القرآن الكريم', url: `${CANONICAL_DOMAIN}/quran` },
    ],
    isIndexable: true,
  },
  {
    path: '/quran/listen',
    title: 'استماع القرآن الكريم | تلاوات كبار القراء برواية حفص ومختلف الروايات | وصل الإسلامية',
    description: 'استمع إلى تلاوات القرآن الكريم العطرة بأصوات كبار القراء مثل العفاسي، عبد الباسط، الحصري، المنشاوي، مع جودة صوت عالية وإمكانية التحميل والتشغيل في الخلفية.',
    priority: 0.95,
    changefreq: 'weekly',
    breadcrumbs: [
      { name: 'الرئيسية', url: `${CANONICAL_DOMAIN}/` },
      { name: 'القرآن الكريم', url: `${CANONICAL_DOMAIN}/quran` },
      { name: 'الاستماع للقرآن', url: `${CANONICAL_DOMAIN}/quran/listen` },
    ],
    isIndexable: true,
  },
  {
    path: '/quran/reciters',
    title: 'قراء القرآن الكريم | نخبة قراء العالم الإسلامي ومختلف الروايات | وصل الإسلامية',
    description: 'دليل شامل لكبار قراء القرآن الكريم مع التلاوات المرتلة والمجودة بمختلف الروايات (حفص، ورش، قالون، الدوري).',
    priority: 0.9,
    changefreq: 'monthly',
    breadcrumbs: [
      { name: 'الرئيسية', url: `${CANONICAL_DOMAIN}/` },
      { name: 'الاستماع للقرآن', url: `${CANONICAL_DOMAIN}/quran/listen` },
      { name: 'القراء', url: `${CANONICAL_DOMAIN}/quran/reciters` },
    ],
    isIndexable: true,
  },
  {
    path: '/quran/surahs',
    title: 'سور القرآن الكريم | فهرس الـ 114 سورة كاملة مع معانيها وفضائلها | وصل الإسلامية',
    description: 'فهرس سور القرآن الكريم الـ 114 كاملة مرتبة حسب المصحف الشريف، مع بيان نوع السورة (مكية أو مدنية) وعدد آياتها وترتيب نزولها.',
    priority: 0.9,
    changefreq: 'monthly',
    breadcrumbs: [
      { name: 'الرئيسية', url: `${CANONICAL_DOMAIN}/` },
      { name: 'القرآن الكريم', url: `${CANONICAL_DOMAIN}/quran` },
      { name: 'فهرس السور', url: `${CANONICAL_DOMAIN}/quran/surahs` },
    ],
    isIndexable: true,
  },
  {
    path: '/quran-radio',
    title: 'إذاعات القرآن الكريم المباشرة | بث حي على مدار الساعة | وصل الإسلامية',
    description: 'استمع إلى البث المباشر لإذاعة القرآن الكريم من مكة المكرمة والقاهرة وإذاعات كبار القراء والتفاسير على مدار الساعة دون انقطاع.',
    priority: 0.85,
    changefreq: 'weekly',
    breadcrumbs: [
      { name: 'الرئيسية', url: `${CANONICAL_DOMAIN}/` },
      { name: 'إذاعات القرآن', url: `${CANONICAL_DOMAIN}/quran-radio` },
    ],
    isIndexable: true,
  },
  {
    path: '/hadith',
    title: 'الأحاديث النبوية الشريفة | رياض الصالحين والأربعون النووية | وصل الإسلامية',
    description: 'موسوعة الأحاديث النبوية الشريفة الصحيحة من رياض الصالحين والأربعين النووية مع التخريج والفوائد والشرح المعتمد.',
    priority: 0.9,
    changefreq: 'weekly',
    breadcrumbs: [
      { name: 'الرئيسية', url: `${CANONICAL_DOMAIN}/` },
      { name: 'الأحاديث النبوية', url: `${CANONICAL_DOMAIN}/hadith` },
    ],
    isIndexable: true,
  },
  {
    path: '/azkar',
    title: 'أذكار المسلم | أذكار الصباح والمساء وأذكار النوم والصلاة | وصل الإسلامية',
    description: 'حصن المسلم كاملاً: أذكار الصباح، أذكار المساء، أذكار الاستيقاظ والنوم، أذكار الصلاة، مع فضل كل ذكر والعدد الصحيح المأثور.',
    priority: 0.9,
    changefreq: 'weekly',
    breadcrumbs: [
      { name: 'الرئيسية', url: `${CANONICAL_DOMAIN}/` },
      { name: 'أذكار المسلم', url: `${CANONICAL_DOMAIN}/azkar` },
    ],
    isIndexable: true,
  },
  {
    path: '/dua',
    title: 'الأدعية المأثورة | أدعية من القرآن الكريم والسنة النبوية | وصل الإسلامية',
    description: 'مجموعة مباركة من جوامع الدعاء المأثور عن النبي ﷺ وأدعية الأنبياء في القرآن الكريم المصنفة بحسب الحاجات والأوقات الفاضلة.',
    priority: 0.85,
    changefreq: 'weekly',
    breadcrumbs: [
      { name: 'الرئيسية', url: `${CANONICAL_DOMAIN}/` },
      { name: 'الأدعية المأثورة', url: `${CANONICAL_DOMAIN}/dua` },
    ],
    isIndexable: true,
  },
  {
    path: '/prayer-times',
    title: 'مواقيت الصلاة الدقيقة والعد التنازلي للأذان | وصل الإسلامية',
    description: 'احسب مواقيت الصلاة بدقة فائقة حسب موقعك الجغرافي: الفجر، الشروق، الظهر، العصر، المغرب، العشاء مع تنبيهات الأذان والعد التنازلي.',
    priority: 0.9,
    changefreq: 'daily',
    breadcrumbs: [
      { name: 'الرئيسية', url: `${CANONICAL_DOMAIN}/` },
      { name: 'مواقيت الصلاة', url: `${CANONICAL_DOMAIN}/prayer-times` },
    ],
    isIndexable: true,
  },
  {
    path: '/prayer',
    title: 'اتجاه القبلة | بوصلة تحديد اتجاه الكعبة المشرفة | وصل الإسلامية',
    description: 'حدد اتجاه القبلة نحو الكعبة المشرفة بدقة مباشرة باستخدام بوصلة الهاتف ونظام تحديد المواقع GPS مع زاوية الانحراف.',
    priority: 0.85,
    changefreq: 'monthly',
    breadcrumbs: [
      { name: 'الرئيسية', url: `${CANONICAL_DOMAIN}/` },
      { name: 'اتجاه القبلة', url: `${CANONICAL_DOMAIN}/prayer` },
    ],
    isIndexable: true,
  },
  {
    path: '/calendar',
    title: 'التقويم الهجري والميلادي | تقويم أم القرى ومناسبات العام | وصل الإسلامية',
    description: 'تاريخ اليوم بالتقويم الهجري وتقويم أم القرى، مع مواعيد المناسبات الإسلامية، الأيام البيض، عاشوراء، رمضان وعيد الفطر وعيد الأضحى.',
    priority: 0.85,
    changefreq: 'weekly',
    breadcrumbs: [
      { name: 'الرئيسية', url: `${CANONICAL_DOMAIN}/` },
      { name: 'التقويم الهجري', url: `${CANONICAL_DOMAIN}/calendar` },
    ],
    isIndexable: true,
  },
  {
    path: '/tasbih',
    title: 'المسبحة الإلكترونية الذكية | عداد التسبيح والاستغفار | وصل الإسلامية',
    description: 'مسبحة إلكترونية تفاعلية لحساب الأذكار والتسبيحات مع خيارات الأوراد وسجل الحفظ والأصوات والاهتزاز.',
    priority: 0.8,
    changefreq: 'monthly',
    breadcrumbs: [
      { name: 'الرئيسية', url: `${CANONICAL_DOMAIN}/` },
      { name: 'المسبحة الإلكترونية', url: `${CANONICAL_DOMAIN}/tasbih` },
    ],
    isIndexable: true,
  },
  {
    path: '/fasting',
    title: 'سجل الصيام وتقويم صيام النوافل | وصل الإسلامية',
    description: 'متابعة صيام الفريضة والنوافل: الإثنين والخميس، الأيام البيض، الست من شوال، يوم عرفة، مع إحصائيات الالتزام والتذكير.',
    priority: 0.8,
    changefreq: 'weekly',
    breadcrumbs: [
      { name: 'الرئيسية', url: `${CANONICAL_DOMAIN}/` },
      { name: 'سجل الصيام', url: `${CANONICAL_DOMAIN}/fasting` },
    ],
    isIndexable: true,
  },
  {
    path: '/names-of-allah',
    title: 'أسماء الله الحسنى الـ 99 كاملة مع المعاني والدلالات | وصل الإسلامية',
    description: 'شرح وتأملات في أسماء الله الحسنى الـ 99 الثابتة في الكتاب والسنة النبوية، مع دلالاتها وآثارها الإيمانية على سلوك المسلم.',
    priority: 0.9,
    changefreq: 'monthly',
    breadcrumbs: [
      { name: 'الرئيسية', url: `${CANONICAL_DOMAIN}/` },
      { name: 'أسماء الله الحسنى', url: `${CANONICAL_DOMAIN}/names-of-allah` },
    ],
    isIndexable: true,
  },
  {
    path: '/seerah',
    title: 'السيرة النبوية الشريفة ﷺ | الخط الزمني العطر لخير البشرية | وصل الإسلامية',
    description: 'استعرض السيرة النبوية الشريفة لنبينا محمد ﷺ عبر خط زمني موثق من المولد الشريف والبعثة والهجرة إلى حجة الوداع والوفاة.',
    priority: 0.85,
    changefreq: 'monthly',
    breadcrumbs: [
      { name: 'الرئيسية', url: `${CANONICAL_DOMAIN}/` },
      { name: 'السيرة النبوية', url: `${CANONICAL_DOMAIN}/seerah` },
    ],
    isIndexable: true,
  },
  {
    path: '/library',
    title: 'المكتبة الإسلامية | أمهات كتب الحديث والتفسير والعقيدة | وصل الإسلامية',
    description: 'مكتبة إسلامية كلاسيكية تضم أمهات المصادر المعتمدة في التفسير والحديث والفقه والسيرة المتاحة للقراءة والبحث والتحميل.',
    priority: 0.85,
    changefreq: 'weekly',
    breadcrumbs: [
      { name: 'الرئيسية', url: `${CANONICAL_DOMAIN}/` },
      { name: 'المكتبة الإسلامية', url: `${CANONICAL_DOMAIN}/library` },
    ],
    isIndexable: true,
  },
  {
    path: '/fatwa',
    title: 'الفتاوى والمقالات الإسلامية وقصص الأنبياء | وصل الإسلامية',
    description: 'مقالات إيمانية وبحوث فقهية موثقة وقصص الأنبياء المأثورة للإجابة عن تساؤلات المسلم اليومية بفتاوى كبار العلماء.',
    priority: 0.85,
    changefreq: 'weekly',
    breadcrumbs: [
      { name: 'الرئيسية', url: `${CANONICAL_DOMAIN}/` },
      { name: 'المقالات والفتاوى', url: `${CANONICAL_DOMAIN}/fatwa` },
    ],
    isIndexable: true,
  },
  {
    path: '/wisdoms',
    title: 'الحِكَم والمواعظ الإسلامية | رقائق وتأملات إيمانية موثقة | وصل الإسلامية',
    description: 'موسوعة متجددة من الحِكَم والرقائق والمواعظ الإيمانية المستنبطة من القرآن والسنة وأقوال السلف الصالح لتغذية الروح وإصلاح القلوب.',
    priority: 0.85,
    changefreq: 'daily',
    breadcrumbs: [
      { name: 'الرئيسية', url: `${CANONICAL_DOMAIN}/` },
      { name: 'الحِكَم والمواعظ', url: `${CANONICAL_DOMAIN}/wisdoms` },
    ],
    isIndexable: true,
  },
  {
    path: '/binbaz',
    title: 'موسوعة فتاوى الشيخ ابن باز رحمه الله | وصل الإسلامية',
    description: 'مجموعة مختارة ومفهرسة من فتاوى وأشرطة الإمام عبد العزيز بن عبد الله بن باز رحمه الله في العقيدة والعبادات والمعاملات.',
    priority: 0.8,
    changefreq: 'monthly',
    breadcrumbs: [
      { name: 'الرئيسية', url: `${CANONICAL_DOMAIN}/` },
      { name: 'فتاوى ابن باز', url: `${CANONICAL_DOMAIN}/binbaz` },
    ],
    isIndexable: true,
  },
  {
    path: '/donations',
    title: 'منصات التبرع الخيرية الرسمية والمعتمدة | وصل الإسلامية',
    description: 'دليل المنصات الخيرية الرسمية والمصرح بها في المملكة العربية السعودية والعالم الإسلامي للتبرع الموثوق وإخراج الصدقات والزكاة.',
    priority: 0.75,
    changefreq: 'monthly',
    breadcrumbs: [
      { name: 'الرئيسية', url: `${CANONICAL_DOMAIN}/` },
      { name: 'منصات التبرع', url: `${CANONICAL_DOMAIN}/donations` },
    ],
    isIndexable: true,
  },
  {
    path: '/khatmah',
    title: 'الختمة القرآنية | متابعة خطط ختم القرآن الكريم وتتبع التقدم | وصل الإسلامية',
    description: 'نظام متكامل لتنظيم ومتابعة ختمات القرآن الكريم اليومية والشهرية، مع حساب الصفحات والأجزاء المستهدفة وجداول الإنجاز.',
    priority: 0.85,
    changefreq: 'weekly',
    breadcrumbs: [
      { name: 'الرئيسية', url: `${CANONICAL_DOMAIN}/` },
      { name: 'الختمة القرآنية', url: `${CANONICAL_DOMAIN}/khatmah` },
    ],
    isIndexable: true,
  },
  {
    path: '/khatmah/plan',
    title: 'خطة الختمة القرآنية الميسرة | إنشاء خطة ختم كتاب الله | وصل الإسلامية',
    description: 'حدد خطتك المناسبة لختم القرآن الكريم في 7 أيام، 15 يوماً، شهراً، أو فترات مخصصة مع توزيع آلي للصفحات اليومية.',
    priority: 0.8,
    changefreq: 'monthly',
    breadcrumbs: [
      { name: 'الرئيسية', url: `${CANONICAL_DOMAIN}/` },
      { name: 'الختمة القرآنية', url: `${CANONICAL_DOMAIN}/khatmah` },
      { name: 'خطة الختمة', url: `${CANONICAL_DOMAIN}/khatmah/plan` },
    ],
    isIndexable: true,
  },
  {
    path: '/khatmah/hifz',
    title: 'الحفظ والتسميع الصوتي التفاعلي للقرآن الكريم | وصل الإسلامية',
    description: 'اختبر حفظك للقرآن الكريم عبر نظام التسميع الصوتي التفاعلي الذكي بمطابقة الكلمات لحظياً بالصوت مع الرسم العثماني المعتمد.',
    priority: 0.85,
    changefreq: 'weekly',
    breadcrumbs: [
      { name: 'الرئيسية', url: `${CANONICAL_DOMAIN}/` },
      { name: 'الختمة القرآنية', url: `${CANONICAL_DOMAIN}/khatmah` },
      { name: 'الحفظ والتسميع', url: `${CANONICAL_DOMAIN}/khatmah/hifz` },
    ],
    isIndexable: true,
  },
  {
    path: '/hajj-umrah',
    title: 'دليل الحج والعمرة خطوة بخطوة | المناسك والأركان والسنن | وصل الإسلامية',
    description: 'دليل شامل مفصل لأداء مناسك الحج والعمرة وفق السنة النبوية الصحيحة خطوة بخطوة، مع أدعية الطواف والسعي والمواقيت المكانية.',
    priority: 0.85,
    changefreq: 'monthly',
    breadcrumbs: [
      { name: 'الرئيسية', url: `${CANONICAL_DOMAIN}/` },
      { name: 'الحج والعمرة', url: `${CANONICAL_DOMAIN}/hajj-umrah` },
    ],
    isIndexable: true,
  },
  {
    path: '/discover',
    title: 'اكتشف خدمات وصل الإسلامية | تجربة إيمانية رقمية متكاملة | وصل الإسلامية',
    description: 'استكشف كافة أبواب وخدمات منصة وصل الإسلامية من القرآن والتلاوات والأذكار والقبلة والمواقيت والحفظ والمكتبة والمزيد.',
    priority: 0.75,
    changefreq: 'weekly',
    breadcrumbs: [
      { name: 'الرئيسية', url: `${CANONICAL_DOMAIN}/` },
      { name: 'اكتشف وصل', url: `${CANONICAL_DOMAIN}/discover` },
    ],
    isIndexable: true,
  },
];

// 2. Private Routes (Restricted from Indexing with noindex, nofollow)
export const PRIVATE_RESTRICTED_ROUTES = [
  '/admin',
  '/admin/login',
  '/dashboard',
  '/login',
  '/register',
  '/settings',
  '/khatmah/my',
  '/khatmah/progress',
  '/khatmah/history',
  '/quran/history',
  '/quran/favorites',
];

// Helper to determine if a route is private
export function isPrivateRoute(path: string): boolean {
  const clean = path.replace(/\/+$/, '') || '/';
  return (
    PRIVATE_RESTRICTED_ROUTES.some((pr) => clean === pr || clean.startsWith(`${pr}/`)) ||
    clean.startsWith('/api') ||
    clean.startsWith('/admin')
  );
}

// 3. Dynamic Routes Generator (Quran Surahs, Reciters, Wisdoms, Articles)
export function getDynamicPublicRoutes(): RouteSeoConfig[] {
  const routes: RouteSeoConfig[] = [];

  // A. 114 Quran Surahs Listening Pages
  SURAHS_LIST.forEach((surah) => {
    routes.push({
      path: `/quran/listen/${surah.number}`,
      title: `سورة ${surah.name} | استماع وتلاوة بالروايات المعتمدة | وصل الإسلامية`,
      description: `استمع إلى سورة ${surah.name} (${surah.englishName}) كاملة بأصوات مشاهير القراء. سورة ${surah.revelationTypeAr} وعدد آياتها ${surah.numberOfAyahs} آية، في الجزء ${surah.juz}.`,
      priority: 0.8,
      changefreq: 'monthly',
      breadcrumbs: [
        { name: 'الرئيسية', url: `${CANONICAL_DOMAIN}/` },
        { name: 'الاستماع للقرآن', url: `${CANONICAL_DOMAIN}/quran/listen` },
        { name: `سورة ${surah.name}`, url: `${CANONICAL_DOMAIN}/quran/listen/${surah.number}` },
      ],
      isIndexable: true,
    });
  });

  // B. Verified Quran Reciters Detail Pages
  RECITERS_LIST.forEach((reciter) => {
    routes.push({
      path: `/quran/reciters/${reciter.id}`,
      title: `تلاوات القارئ الشيخ ${reciter.nameAr} | المصحف كاملاً | وصل الإسلامية`,
      description: `استمع وحمّل المصحف الشريف كاملاً بصوت القارئ الشيخ ${reciter.nameAr} بجودة صوتية نقية ${reciter.bitrate}kbps على منصة وصل الإسلامية.`,
      priority: 0.8,
      changefreq: 'monthly',
      breadcrumbs: [
        { name: 'الرئيسية', url: `${CANONICAL_DOMAIN}/` },
        { name: 'القراء', url: `${CANONICAL_DOMAIN}/quran/reciters` },
        { name: reciter.nameAr, url: `${CANONICAL_DOMAIN}/quran/reciters/${reciter.id}` },
      ],
      isIndexable: true,
    });
  });

  // C. Islamic Wisdoms Detail Pages
  VERIFIED_INITIAL_WISDOMS.forEach((wis) => {
    const snippet = wis.content.length > 120 ? `${wis.content.slice(0, 117)}...` : wis.content;
    routes.push({
      path: `/wisdoms/${wis.id}`,
      title: `${wis.category}: ${snippet.slice(0, 50)}... | الحِكَم والمواعظ | وصل الإسلامية`,
      description: `تأمل إيماني في باب ${wis.category}: "${snippet}" — المصدر: ${wis.source} ${wis.reference || ''}. وصل الإسلامية.`,
      priority: 0.7,
      changefreq: 'monthly',
      breadcrumbs: [
        { name: 'الرئيسية', url: `${CANONICAL_DOMAIN}/` },
        { name: 'الحِكَم والمواعظ', url: `${CANONICAL_DOMAIN}/wisdoms` },
        { name: wis.category, url: `${CANONICAL_DOMAIN}/wisdoms/${wis.id}` },
      ],
      isIndexable: true,
      ogType: 'article',
    });
  });

  return routes;
}
