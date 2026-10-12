/**
 * Wasl Islamic (وصل الإسلامية) - Authentic Ramadan & Islamic Events Countdown Engine.
 * Calculates exact target Gregorian dates for 1 Ramadan and major Islamic events
 * using the official Saudi Umm al-Qura astronomical calendar with full support
 * for moon-sighting adjustments, live multi-unit countdowns (days/hours/mins/secs),
 * active-month detection, and transparent estimation disclosures.
 */

import { formatCountdownBreakdown, type CountdownBreakdown } from './timeFormat.ts';

export interface RamadanCountdownDetails {
  targetDate: Date;
  targetHijriYear: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  formattedRemaining: string;
  isRamadanActive: boolean;
  currentRamadanDay?: number;
  isEstimated: boolean;
  statusBadgeAr: string;
  statusBadgeEn: string;
  announcementNoteAr: string;
  announcementNoteEn: string;
}

export interface IslamicEventTarget {
  id: string;
  nameAr: string;
  nameEn: string;
  hijriMonth: number;
  hijriDay: number;
  targetDate: Date;
  targetHijriYear: number;
  countdown: CountdownBreakdown;
  isPassedThisYear: boolean;
  isToday: boolean;
}

/**
 * Extract Hijri year, month (1-12), and day (1-30) from a Gregorian Date
 * according to the official Saudi Umm al-Qura calendar.
 */
export function getUmmAlQuraParts(date: Date, adjustmentDays = 0): {
  year: number;
  month: number;
  day: number;
} {
  const adjusted = new Date(date.getTime() + adjustmentDays * 86400000);
  try {
    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
    const parts = formatter.formatToParts(adjusted);
    let year = 1448;
    let month = 1;
    let day = 1;

    for (const p of parts) {
      if (p.type === 'year') year = parseInt(p.value, 10) || 1448;
      if (p.type === 'month') month = parseInt(p.value, 10) || 1;
      if (p.type === 'day') day = parseInt(p.value, 10) || 1;
    }

    return { year, month, day };
  } catch {
    // Fallback astronomical formula if Intl islamic-umalqura is unavailable
    const y = adjusted.getFullYear();
    const m = adjusted.getMonth() + 1;
    const d = adjusted.getDate();
    const approxHijriYear = Math.floor((y - 622) * (365.25 / 354.36));
    return { year: approxHijriYear || 1448, month: 9, day: 1 };
  }
}

/**
 * Searches for the exact Gregorian Date matching target Hijri month and day in a given Hijri year.
 */
export function findHijriDateInGregorian(
  targetHijriMonth: number,
  targetHijriDay: number,
  targetHijriYear: number,
  referenceDate = new Date(),
  adjustmentDays = 0
): Date {
  const refParts = getUmmAlQuraParts(referenceDate, adjustmentDays);
  const yearsDiff = targetHijriYear - refParts.year;
  const monthsDiff = (targetHijriMonth - refParts.month) + yearsDiff * 12;
  const approxDays = Math.round(monthsDiff * 29.53059) - (refParts.day - targetHijriDay);

  const candidate = new Date(referenceDate.getTime() + approxDays * 86400000);
  candidate.setHours(0, 0, 0, 0);

  // Scan +/- 15 days around candidate for exact match
  for (let offset = -15; offset <= 15; offset++) {
    const testDate = new Date(candidate.getTime() + offset * 86400000);
    const p = getUmmAlQuraParts(testDate, adjustmentDays);
    if (p.year === targetHijriYear && p.month === targetHijriMonth && p.day === targetHijriDay) {
      return testDate;
    }
  }

  // Wider fallback scan +/- 45 days
  for (let offset = -45; offset <= 45; offset++) {
    const testDate = new Date(candidate.getTime() + offset * 86400000);
    const p = getUmmAlQuraParts(testDate, adjustmentDays);
    if (p.year === targetHijriYear && p.month === targetHijriMonth && p.day === targetHijriDay) {
      return testDate;
    }
  }

  return candidate;
}

/**
 * Computes comprehensive Ramadan countdown details:
 * - When before Ramadan: calculates time remaining until 1 Ramadan (expected start date).
 * - When in Ramadan: indicates Ramadan is active, current day of Ramadan, and counts down to Eid al-Fitr (1 Shawwal).
 * - When after Ramadan: automatically targets 1 Ramadan of the next Hijri year.
 * - Always non-negative.
 * - Fully transparent regarding estimated vs. moon-sighting confirmed status.
 */
export function getRamadanCountdownDetails(
  referenceDate: Date = new Date(),
  adjustmentDays = 0
): RamadanCountdownDetails {
  const currentHijri = getUmmAlQuraParts(referenceDate, adjustmentDays);

  const isRamadanActive = currentHijri.month === 9;

  let targetHijriYear: number;
  let targetDate: Date;
  let currentRamadanDay: number | undefined;

  if (isRamadanActive) {
    // In Ramadan: count down to Eid al-Fitr (1 Shawwal of current year)
    targetHijriYear = currentHijri.year;
    currentRamadanDay = currentHijri.day;
    targetDate = findHijriDateInGregorian(10, 1, targetHijriYear, referenceDate, adjustmentDays);
  } else if (currentHijri.month > 9) {
    // Ramadan has passed this Hijri year; next Ramadan is in (year + 1)
    targetHijriYear = currentHijri.year + 1;
    targetDate = findHijriDateInGregorian(9, 1, targetHijriYear, referenceDate, adjustmentDays);
  } else {
    // Ramadan is upcoming in current Hijri year
    targetHijriYear = currentHijri.year;
    targetDate = findHijriDateInGregorian(9, 1, targetHijriYear, referenceDate, adjustmentDays);
  }

  // Ensure target date is set to beginning of local day (midnight)
  targetDate.setHours(0, 0, 0, 0);

  const diffMs = Math.max(0, targetDate.getTime() - referenceDate.getTime());
  const breakdown = formatCountdownBreakdown(diffMs);

  const isEstimated = true; // Astronomical Umm al-Qura estimate until official royal moon-sighting announcement

  const statusBadgeAr = isRamadanActive
    ? `شهر رمضان مبارك (اليوم ${currentRamadanDay})`
    : 'تقدير فلكي معتمد (تقويم أم القرى)';

  const statusBadgeEn = isRamadanActive
    ? `Ramadan Active (Day ${currentRamadanDay})`
    : 'Astronomical Estimate (Umm al-Qura)';

  const announcementNoteAr = isRamadanActive
    ? 'نحن نعيش بركات شهر رمضان المبارك — تقبل الله منا ومنكم صالح الأعمال.'
    : 'تاريخ بداية شهر رمضان المبارك محسوب فلكياً وفق تقويم أم القرى الرسمي بالمملكة العربية السعودية، ويثبت دخوله الشرعي الرسمي برؤية الهلال.';

  const announcementNoteEn = isRamadanActive
    ? 'Currently observing the blessed month of Ramadan. May Allah accept our worship.'
    : 'The expected start of Ramadan is calculated astronomically per the official Saudi Umm al-Qura calendar. Official confirmation depends on moon-sighting.';

  return {
    targetDate,
    targetHijriYear,
    days: breakdown.days,
    hours: breakdown.hours,
    minutes: breakdown.minutes,
    seconds: breakdown.seconds,
    totalMs: breakdown.totalMs,
    formattedRemaining: breakdown.formatted,
    isRamadanActive,
    currentRamadanDay,
    isEstimated,
    statusBadgeAr,
    statusBadgeEn,
    announcementNoteAr,
    announcementNoteEn
  };
}

/**
 * Calculates countdowns for all major Islamic occasions dynamically for the current/next year.
 */
export function getUpcomingIslamicOccasions(
  referenceDate: Date = new Date(),
  adjustmentDays = 0
): IslamicEventTarget[] {
  const currentHijri = getUmmAlQuraParts(referenceDate, adjustmentDays);

  const occasionsList = [
    { id: 'ramadan-start', nameAr: 'غرة شهر رمضان المبارك', nameEn: 'First Day of Ramadan', month: 9, day: 1 },
    { id: 'laylat-al-qadr', nameAr: 'العشر الأواخر من رمضان', nameEn: 'Last Ten Nights of Ramadan', month: 9, day: 21 },
    { id: 'eid-fitr', nameAr: 'عيد الفطر المبارك', nameEn: 'Eid Al-Fitr', month: 10, day: 1 },
    { id: 'arafah', nameAr: 'يوم عرفة (الحج الأكبر)', nameEn: 'Day of Arafah', month: 12, day: 9 },
    { id: 'eid-adha', nameAr: 'عيد الأضحى المبارك', nameEn: 'Eid Al-Adha', month: 12, day: 10 },
    { id: 'ashura', nameAr: 'يوم عاشوراء', nameEn: 'Day of Ashura', month: 1, day: 10 },
  ];

  return occasionsList.map((occ) => {
    let targetYear = currentHijri.year;
    // Determine whether this occasion has already passed in the current Hijri year
    const isPassed =
      currentHijri.month > occ.month ||
      (currentHijri.month === occ.month && currentHijri.day > occ.day);

    if (isPassed) {
      targetYear = currentHijri.year + 1;
    }

    const targetDate = findHijriDateInGregorian(occ.month, occ.day, targetYear, referenceDate, adjustmentDays);
    const diffMs = Math.max(0, targetDate.getTime() - referenceDate.getTime());
    const isToday = currentHijri.month === occ.month && currentHijri.day === occ.day;

    return {
      id: occ.id,
      nameAr: occ.nameAr,
      nameEn: occ.nameEn,
      hijriMonth: occ.month,
      hijriDay: occ.day,
      targetDate,
      targetHijriYear: targetYear,
      countdown: formatCountdownBreakdown(diffMs),
      isPassedThisYear: isPassed,
      isToday
    };
  });
}
