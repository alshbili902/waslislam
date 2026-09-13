import { IslamicEvent } from '../types';

export const HIJRI_MONTHS_AR = [
  'المُحَرَّم',
  'صَفَر',
  'رَبِيع الأَوَّل',
  'رَبِيع الآخِر',
  'جُمَادَى الأُولَى',
  'جُمَادَى الآخِرَة',
  'رَجَب',
  'شَعْبَان',
  'رَمَضَان',
  'شَوَّال',
  'ذُو القَعْدَة',
  'ذُو الحِجَّة'
];

export const ISLAMIC_EVENTS: IslamicEvent[] = [
  {
    id: 'ev-1',
    titleAr: 'رأس السنة الهجرية',
    hijriDay: 1,
    hijriMonth: 1,
    monthNameAr: 'المحرم',
    descriptionAr: 'بداية العام الهجري الجديد واستذكار هجرة النبي المصطفى ﷺ من مكة المكرمة إلى المدينة المنورة.'
  },
  {
    id: 'ev-2',
    titleAr: 'يوم عاشوراء',
    hijriDay: 10,
    hijriMonth: 1,
    monthNameAr: 'المحرم',
    descriptionAr: 'اليوم الذي نجى الله فيه موسى وقومه من فرعون وجنوده، ويستحب صيامه وصيام يوم قبله أو بعده.'
  },
  {
    id: 'ev-3',
    titleAr: 'المولد النبوي الشريف',
    hijriDay: 12,
    hijriMonth: 3,
    monthNameAr: 'ربيع الأول',
    descriptionAr: 'ذكرى ميلاد خاتم الأنبياء والمرسلين سيدنا محمد ﷺ والرحمة المهداة للعالمين.'
  },
  {
    id: 'ev-4',
    titleAr: 'ذكرى الإسراء والمعراج',
    hijriDay: 27,
    hijriMonth: 7,
    monthNameAr: 'رجب',
    descriptionAr: 'معجزة إلهية كبرى أُسري فيها بالنبي ﷺ إلى المسجد الأقصى وعُرج به إلى السماوات العلى وفُرضت فيها الصلوات الخمس.'
  },
  {
    id: 'ev-5',
    titleAr: 'ليلة النصف من شعبان',
    hijriDay: 15,
    hijriMonth: 8,
    monthNameAr: 'شعبان',
    descriptionAr: 'ليلة مباركة يتحرى فيها المسلمون الدعاء والاستغفار وذكر الله تعالى.'
  },
  {
    id: 'ev-6',
    titleAr: 'غرة شهر رمضان المبارك',
    hijriDay: 1,
    hijriMonth: 9,
    monthNameAr: 'رمضان',
    descriptionAr: 'أول أيام شهر الصيام والقيام ونزول القرآن والعتق من النيران.'
  },
  {
    id: 'ev-7',
    titleAr: 'غزوة بدر الكبرى',
    hijriDay: 17,
    hijriMonth: 9,
    monthNameAr: 'رمضان',
    descriptionAr: 'يوم الفرقان الذي أعز الله فيه الإسلام وأهله وفرق بين الحق والباطل.'
  },
  {
    id: 'ev-8',
    titleAr: 'فتح مكة الأعظم',
    hijriDay: 20,
    hijriMonth: 9,
    monthNameAr: 'رمضان',
    descriptionAr: 'اليوم الذي دخل فيه رسول الله ﷺ مكة فاتحاً عزيزاً متواضعاً وطهر البيت الحرام من الأصنام.'
  },
  {
    id: 'ev-9',
    titleAr: 'ليالي القدر والعشر الأواخر',
    hijriDay: 21,
    hijriMonth: 9,
    monthNameAr: 'رمضان',
    descriptionAr: 'الليالي الفاضلة التي فيها ليلة القدر خير من ألف شهر، تنزل فيها الملائكة بالرحمات والسلام.'
  },
  {
    id: 'ev-10',
    titleAr: 'عيد الفطر المبارك',
    hijriDay: 1,
    hijriMonth: 10,
    monthNameAr: 'شوال',
    descriptionAr: 'يوم الجائزة والفرح بإتمام صيام شهر رمضان المبارك وصلة الأرحام وإخراج زكاة الفطر.'
  },
  {
    id: 'ev-11',
    titleAr: 'يوم التروية',
    hijriDay: 8,
    hijriMonth: 12,
    monthNameAr: 'ذو الحجة',
    descriptionAr: 'بداية مناسك الحج حيث يتوجه حجاج بيت الله الحرام إلى مشعر منى.'
  },
  {
    id: 'ev-12',
    titleAr: 'يوم عرفة العظيم',
    hijriDay: 9,
    hijriMonth: 12,
    monthNameAr: 'ذو الحجة',
    descriptionAr: 'ركن الحج الأعظم وخير يوم طلعت عليه الشمس، وصيامه لغير الحاج يكفر سنة ماضية وسنة باقية.'
  },
  {
    id: 'ev-13',
    titleAr: 'عيد الأضحى المبارك',
    hijriDay: 10,
    hijriMonth: 12,
    monthNameAr: 'ذو الحجة',
    descriptionAr: 'يوم النحر الأكبر وأيام التشريق المباركة التي هي أيام أكل وشرب وذكر لله تعالى.'
  }
];

// Presets for Digital Tasbeeh
export const TASBIH_PRESETS = [
  { id: 'subhanallah', textAr: 'سُبْحَانَ اللَّهِ', transliteration: 'SubhanAllah', targetCount: 33, fadhilAr: 'شجرة في الجنة ومغفرة للذنوب' },
  { id: 'alhamdulillah', textAr: 'الْحَمْدُ لِلَّهِ', transliteration: 'Alhamdulillah', targetCount: 33, fadhilAr: 'تملأ الميزان وأحب الكلام إلى الله' },
  { id: 'allahuakbar', textAr: 'اللَّهُ أَكْبَرُ', transliteration: 'Allahu Akbar', targetCount: 34, fadhilAr: 'تكبير وتعظيم لشأن الخالق سبحانه' },
  { id: 'la_ilaha', textAr: 'لَا إِلَهَ إِلَّا اللَّهُ', transliteration: 'La ilaha illallah', targetCount: 100, fadhilAr: 'أفضل الذكر ومفتاح الجنة' },
  { id: 'istighfar', textAr: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ', transliteration: 'Astaghfirullah', targetCount: 100, fadhilAr: 'تفريج الهموم وجلب الرزق والرحمة' },
  { id: 'hawqala', textAr: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', transliteration: 'La hawla wa la quwwata...', targetCount: 33, fadhilAr: 'كنز من كنوز الجنة ودواء للهم' },
  { id: 'salawat', textAr: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ', transliteration: 'Allahumma Salli Ala Muhammad', targetCount: 10, fadhilAr: 'صلاة الله عليك عشراً وشفاعة النبي ﷺ' }
];
