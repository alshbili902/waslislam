/**
 * Smart Islamic & Hijri Calendar Utilities for Wasl Islamic.
 * Provides dual Hijri/Gregorian date calculation, moon-sighting adjustment,
 * Islamic religious occasions, White Days (الأيام البيض), and voluntary fasting reminders.
 */

export interface IslamicOccasion {
  id: string;
  nameAr: string;
  nameEn: string;
  hijriMonth: number; // 1-12
  hijriDay: number; // 1-30
  descriptionAr: string;
  isFastingRecommended?: boolean;
}

export const ISLAMIC_OCCASIONS: IslamicOccasion[] = [
  {
    id: 'hijri-new-year',
    nameAr: 'رأس السنة الهجرية',
    nameEn: 'Islamic New Year',
    hijriMonth: 1,
    hijriDay: 1,
    descriptionAr: 'ذكرى ابتداء التقويم الهجري المبارك من هجرة النبي ﷺ إلى المدينة المنورة.',
  },
  {
    id: 'ashura',
    nameAr: 'يوم عاشوراء',
    nameEn: 'Day of Ashura',
    hijriMonth: 1,
    hijriDay: 10,
    descriptionAr: 'اليوم الذي نجى الله فيه موسى عليه السلام وقومه من فرعون، وصيامه يكفر ذنوب السنة الماضية.',
    isFastingRecommended: true,
  },
  {
    id: 'isra-miraj',
    nameAr: 'ذكرى الإسراء والمعراج',
    nameEn: 'Isra & Mi\'raj',
    hijriMonth: 7,
    hijriDay: 27,
    descriptionAr: 'معجزة إبراء رسول الله ﷺ من المسجد الحرام إلى المسجد الأقصى وعروجه إلى السماوات العلا.',
  },
  {
    id: 'nisf-shaban',
    nameAr: 'ليلة النصف من شعبان',
    nameEn: 'Middle of Sha\'ban',
    hijriMonth: 8,
    hijriDay: 15,
    descriptionAr: 'ليلة مباركة يرجى فيها مغفرة الله وفضله ورحمته بالعباد.',
  },
  {
    id: 'ramadan-start',
    nameAr: 'غرة شهر رمضان المبارك',
    nameEn: 'First Day of Ramadan',
    hijriMonth: 9,
    hijriDay: 1,
    descriptionAr: 'ابتداء فريضة صيام شهر رمضان المبارك شهر القرآن والرحمة والمغفرة.',
    isFastingRecommended: true,
  },
  {
    id: 'laylat-al-qadr',
    nameAr: 'ليالي العشر الأواخر وتحري ليلة القدر',
    nameEn: 'Last Ten Nights of Ramadan',
    hijriMonth: 9,
    hijriDay: 21,
    descriptionAr: 'العشر الأواخر من رمضان وتحري ليلة القدر التي هي خير من ألف شهر.',
  },
  {
    id: 'eid-fitr',
    nameAr: 'عيد الفطر المبارك',
    nameEn: 'Eid Al-Fitr',
    hijriMonth: 10,
    hijriDay: 1,
    descriptionAr: 'يوم الجائزة والفرح بإتمام صيام شهر رمضان وزكاة الفطر.',
  },
  {
    id: 'arafah',
    nameAr: 'يوم عرفة',
    nameEn: 'Day of Arafah',
    hijriMonth: 12,
    hijriDay: 9,
    descriptionAr: 'أعظم أيام العام وركن الحج الأكبر، وصيامه لغير الحاج يكفر سنتين (ماضية ومقبلة).',
    isFastingRecommended: true,
  },
  {
    id: 'eid-adha',
    nameAr: 'عيد الأضحى المبارك',
    nameEn: 'Eid Al-Adha',
    hijriMonth: 12,
    hijriDay: 10,
    descriptionAr: 'يوم النحر الأكبر وتكبيرات العيد وإحياء سنة الخليل إبراهيم عليه السلام.',
  },
  {
    id: 'tashreeq-days',
    nameAr: 'أيام التشريق',
    nameEn: 'Days of Tashreeq',
    hijriMonth: 12,
    hijriDay: 11,
    descriptionAr: 'أيام أكل وشرب وذكر لله تعالى في منى بعد يوم النحر.',
  },
];

export const HIJRI_MONTHS_NAMES = [
  'المحرم',
  'صفر',
  'ربيع الأول',
  'ربيع الآخر',
  'جمادى الأولى',
  'جمادى الآخرة',
  'رجب',
  'شعبان',
  'رمضان',
  'شوال',
  'ذو القعدة',
  'ذو الحجة',
];

/**
 * Calculates accurate Hijri day, month, and year for a given Gregorian date with manual adjustment.
 */
export function getDetailedHijriDate(date: Date, adjustmentDays: number = 0): {
  year: number;
  month: number;
  day: number;
  monthNameAr: string;
  formattedAr: string;
} {
  const adjusted = new Date(date.getTime() + adjustmentDays * 86400000);
  
  // Use Intl.DateTimeFormat with islamic-umalqura calendar
  const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
  });

  const parts = formatter.formatToParts(adjusted);
  let day = 1;
  let month = 1;
  let year = 1447;

  for (const part of parts) {
    if (part.type === 'day') day = parseInt(part.value, 10) || 1;
    if (part.type === 'month') month = parseInt(part.value, 10) || 1;
    if (part.type === 'year') year = parseInt(part.value, 10) || 1447;
  }

  const monthNameAr = HIJRI_MONTHS_NAMES[month - 1] || 'رمضان';
  const formattedAr = `${day} ${monthNameAr} ${year} هـ`;

  return { year, month, day, monthNameAr, formattedAr };
}

/**
 * Checks whether a given Gregorian date is a recommended voluntary fasting day:
 * 1. Mondays & Thursdays (الإثنين والخميس)
 * 2. White Days (الأيام البيض: 13، 14، 15 من الشهر الهجري)
 * 3. Day of Arafah or Ashura
 */
export function checkFastingRecommendation(date: Date, adjustmentDays: number = 0): {
  isRecommended: boolean;
  reasonAr?: string;
} {
  const dayOfWeek = date.getDay(); // 1 = Monday, 4 = Thursday
  const hijri = getDetailedHijriDate(date, adjustmentDays);

  if (hijri.month === 9) {
    return { isRecommended: true, reasonAr: 'صيام فريضة شهر رمضان المبارك' };
  }

  if (hijri.month === 1 && (hijri.day === 9 || hijri.day === 10)) {
    return { isRecommended: true, reasonAr: 'صيام تاسوعاء وعاشوراء (كفارة سنة)' };
  }

  if (hijri.month === 12 && hijri.day === 9) {
    return { isRecommended: true, reasonAr: 'صيام يوم عرفة لغير الحاج (كفارة سنتين)' };
  }

  if (hijri.day === 13 || hijri.day === 14 || hijri.day === 15) {
    return { isRecommended: true, reasonAr: `الأيام البيض لشهر ${hijri.monthNameAr} (اليوم ${hijri.day})` };
  }

  if (dayOfWeek === 1) {
    return { isRecommended: true, reasonAr: 'سنة صيام يوم الإثنين (تُعرض فيه الأعمال)' };
  }

  if (dayOfWeek === 4) {
    return { isRecommended: true, reasonAr: 'سنة صيام يوم الخميس (تُعرض فيه الأعمال)' };
  }

  return { isRecommended: false };
}

/**
 * Checks if a specific Hijri day has a major Islamic occasion.
 */
export function getOccasionForHijriDay(month: number, day: number): IslamicOccasion | undefined {
  return ISLAMIC_OCCASIONS.find(o => o.hijriMonth === month && o.hijriDay === day);
}
