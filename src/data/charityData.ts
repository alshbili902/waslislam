/**
 * Verified Official Charitable Platforms Registry for Wasl Islamic.
 * Wasl Islamic does NOT collect, receive, or process financial donations.
 * These are direct informational links to accredited governmental and humanitarian platforms.
 */

export interface CharityPlatform {
  id: string;
  nameAr: string;
  nameEn: string;
  authorityAr: string;
  descriptionAr: string;
  sectorsAr: string[];
  officialUrl: string;
  badgeAr: string;
}

export const VERIFIED_CHARITY_PLATFORMS: CharityPlatform[] = [
  {
    id: 'ehsan',
    nameAr: 'منصة إحسان الوطنية للعمل الخيري',
    nameEn: 'Ehsan National Charity Platform',
    authorityAr: 'تحت إشراف الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا) ولجنة إشرافية من 12 جهة حكومية',
    descriptionAr: 'المنصة الوطنية الموحدة لتسهيل التبرع والمساهمة في المشاريع الخيرية والصحية والإغاثية ورعاية الأيتام وفرجت وتيسرت.',
    sectorsAr: ['الرعاية الاجتماعية', 'الصحة', 'التعليم', 'الإسكان', 'الإغاثة'],
    officialUrl: 'https://ehsan.sa',
    badgeAr: 'منصة وطنية رسمية موثقة',
  },
  {
    id: 'ksrelief',
    nameAr: 'مركز الملك سلمان للإغاثة والأعمال الإنسانية',
    nameEn: 'King Salman Humanitarian Aid & Relief Centre (KSrelief)',
    authorityAr: 'جهة حكومية رسمية مسؤولة عن إغاثة المنكوبين ومساعدة المحتاجين حول العالم',
    descriptionAr: 'الذراع الإنساني الدولي لتقديم المساعدات العاجلة والغذائية والطبية للمتضررين من الكوارث والحروب في شتى بقاع الأرض.',
    sectorsAr: ['الإغاثة العاجلة', 'الأمن الغذائي', 'الصحة العالمية', 'إيواء اللاجئين'],
    officialUrl: 'https://www.ksrelief.org',
    badgeAr: 'إغاثة إنسانية دولية معتمدة',
  },
  {
    id: 'jood-eskan',
    nameAr: 'منصة جود الإسكان',
    nameEn: 'Jood Eskan Social Housing Platform',
    authorityAr: 'مبادرة وطنية تشرف عليها مؤسسة الإسكان التنموي الأهلية (سكن) ووزارة البلديات والإسكان',
    descriptionAr: 'تمكين المجتمع من المساهمة في توفير وتأمين المسكن الملائم للأسر الأشد حاجة والأيتام والأرامل.',
    sectorsAr: ['توفير المسكن', 'سداد الإيجار للمتعثرين'],
    officialUrl: 'https://joodeskan.sa',
    badgeAr: 'إسكان تنموي معتمد',
  },
  {
    id: 'tabarru',
    nameAr: 'منصة تبرع الوطنية',
    nameEn: 'Tabarru National Donation Platform',
    authorityAr: 'تحت إشراف وزارة الموارد البشرية والتنمية الاجتماعية',
    descriptionAr: 'الواجهة الرسمية للجمعيات والمؤسسات الخيرية المرخصة لعرض مشاريعها المعتمدة وضمان وصول التبرعات لمستحقيها.',
    sectorsAr: ['المشاريع الخيرية', 'كفالة الأيتام', 'سقيا الماء'],
    officialUrl: 'https://donations.sa',
    badgeAr: 'إشراف حكومي مباشر',
  },
  {
    id: 'awqaf',
    nameAr: 'الهيئة العامة للأوقاف (الوقف الإلكتروني)',
    nameEn: 'General Authority for Awqaf',
    authorityAr: 'هيئة عامة مستقلة تُعنى بتنظيم وتطوير قطاع الأوقاف وتنميتها',
    descriptionAr: 'المساهمة في الأوقاف الصحية والتعليمية والمساجد والمياه لضمان استدامة الأجر والصدقة الجارية عبر صناديق وقفية مرخصة.',
    sectorsAr: ['أوقاف المساجد', 'الأوقاف الصحية والتعليمية', 'رعاية المحتاجين'],
    officialUrl: 'https://awqaf.gov.sa',
    badgeAr: 'أوقاف رسمية مستدامة',
  }
];
