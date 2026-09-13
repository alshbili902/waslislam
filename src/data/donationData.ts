import { DonationCategory, DonationPlatform } from '../types/donations';

export const DONATION_CATEGORIES: DonationCategory[] = [
  { id: 'all', nameAr: 'جميع المجالات', slug: 'all' },
  { id: 'general', nameAr: 'تبرع عام', slug: 'general', descriptionAr: 'فرص التبرع المفتوحة لمختلف أوجه الخير' },
  { id: 'zakat', nameAr: 'الزكاة', slug: 'zakat', descriptionAr: 'حساب وإخراج زكاة المال وزكاة الفطر لمستحقيها الشرعيين' },
  { id: 'waqf', nameAr: 'الأوقاف', slug: 'waqf', descriptionAr: 'المساهمة في الصناديق والمشاريع الوقفية دائمة الأجر' },
  { id: 'mosques', nameAr: 'عمارة المساجد', slug: 'mosques', descriptionAr: 'بناء وصيانة وتأثيث بيوت الله' },
  { id: 'jariah', nameAr: 'صدقة جارية', slug: 'jariah', descriptionAr: 'صدقات مستمرة النفع والأثر' },
  { id: 'relief', nameAr: 'تفريج الكرب', slug: 'relief', descriptionAr: 'مساعدة الغارمين والمعسرين وتفريج كرب الأسر' },
  { id: 'orphans', nameAr: 'كفالة الأيتام', slug: 'orphans', descriptionAr: 'رعاية الأيتام وتوفير احتياجاتهم المعيشية والتعليمية' },
  { id: 'health', nameAr: 'المرضى والرعاية الصحية', slug: 'health', descriptionAr: 'دعم علاج الحالات الحرجة وشراء الأجهزة الطبية' },
  { id: 'water', nameAr: 'سقيا الماء', slug: 'water', descriptionAr: 'مشاريع حفر الآبار وتوصيل وتوزيع المياه' },
  { id: 'charity_projects', nameAr: 'المشاريع الخيرية', slug: 'charity_projects', descriptionAr: 'المشاريع التنموية والإغاثية المصرحة' },
];

export const INITIAL_DONATION_PLATFORMS: DonationPlatform[] = [
  {
    id: 'plat-ehsan',
    name: 'منصة إحسان',
    description: 'منظومة وطنية غير ربحية رائدة أُطلقت بموجب أمر سامٍ لتعزيز قيم العمل الخيري في المملكة وتسهيل التبرع الموثوق في شتى المجالات الخيرية والاجتماعية بشفافية وحوكمة عالية.',
    url: 'https://ehsan.sa/',
    officialEntity: 'الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا)',
    supervisingEntity: 'لجنة إشرافية تضم 12 جهة حكومية (منها الموارد البشرية، العدل، والداخلية)',
    logoUrl: 'https://ehsan.sa/favicon.ico',
    categories: ['تبرع عام', 'الزكاة', 'الأوقاف', 'عمارة المساجد', 'صدقة جارية', 'تفريج الكرب', 'كفالة الأيتام', 'المرضى والرعاية الصحية', 'سقيا الماء', 'المشاريع الخيرية'],
    features: [
      'خدمة فرص التبرع المباشر والسريع',
      'حاسبة ودفع زكاة المال وزكاة الفطر',
      'منصة وقفي للأصول والصناديق الوقفية',
      'برنامج تيسرت وتفريج كرب الغارمين',
      'عمارة المساجد وسقيا الماء',
      'التبرع الدوري المجدول',
      'إصدار التقارير للمتبرعين وشهادات التبرع الرسمية'
    ],
    verified: true,
    status: 'verified',
    sortOrder: 1,
    verificationDate: '2026-09-13T00:00:00Z',
    notes: 'تم التحقق من النطاق الرسمي ومطابقة شهادة SSL وهيئة الإشراف الحكومية.',
    createdAt: '2026-09-13T00:00:00Z',
    updatedAt: '2026-09-13T00:00:00Z',
  },
  {
    id: 'plat-tabarru',
    name: 'المنصة الوطنية للتبرعات — تبرع',
    description: 'الواجهة الوطنية الرسمية المعتمدة لجمع وإيصال التبرعات الخيرية لمستحقيها بجميع مناطق ومدن المملكة، لربط المتبرع بالجمعيات والمؤسسات الأهلية والحالات الإنسانية المرخصة.',
    url: 'https://donations.sa/',
    officialEntity: 'وزارة الموارد البشرية والتنمية الاجتماعية',
    supervisingEntity: 'المركز الوطني لتنمية القطاع غير الربحي',
    logoUrl: 'https://donations.sa/favicon.ico',
    categories: ['تبرع عام', 'الزكاة', 'كفالة الأيتام', 'المشاريع الخيرية', 'تفريج الكرب', 'سقيا الماء', 'المرضى والرعاية الصحية'],
    features: [
      'دعم الجمعيات الأهلية الخيرية المعتمدة',
      'فرص التبرع المباشرة للحالات الأشد حاجة',
      'إخراج ودفع الزكاة للمستحقين المعتمدين',
      'رعاية الأيتام وتفريج كرب الأسر المتعففة',
      'مشاريع الإطعام وسقيا الماء والكسوة',
      'إشراف ومتابعة حكومية مباشرة على كل تبرع'
    ],
    verified: true,
    status: 'verified',
    sortOrder: 2,
    verificationDate: '2026-09-13T00:00:00Z',
    notes: 'تم التحقق من الرابط والنطاق الحكومي الرسمي لوزارة الموارد البشرية والتنمية الاجتماعية.',
    createdAt: '2026-09-13T00:00:00Z',
    updatedAt: '2026-09-13T00:00:00Z',
  }
];
