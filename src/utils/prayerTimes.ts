export interface CityCoordinate {
  id: string;
  nameAr: string;
  nameEn: string;
  countryAr: string;
  lat: number;
  lng: number;
  timezone: number; // offset in hours from UTC
}

export const CITIES: CityCoordinate[] = [
  { id: 'riyadh', nameAr: 'الرياض', nameEn: 'Riyadh', countryAr: 'المملكة العربية السعودية', lat: 24.7136, lng: 46.6753, timezone: 3 },
  { id: 'makkah', nameAr: 'مكة المكرمة', nameEn: 'Makkah', countryAr: 'المملكة العربية السعودية', lat: 21.4225, lng: 39.8262, timezone: 3 },
  { id: 'madinah', nameAr: 'المدينة المنورة', nameEn: 'Madinah', countryAr: 'المملكة العربية السعودية', lat: 24.4672, lng: 39.6111, timezone: 3 },
  { id: 'jeddah', nameAr: 'جدة', nameEn: 'Jeddah', countryAr: 'المملكة العربية السعودية', lat: 21.5433, lng: 39.1728, timezone: 3 },
  { id: 'cairo', nameAr: 'القاهرة', nameEn: 'Cairo', countryAr: 'مصر', lat: 30.0444, lng: 31.2357, timezone: 2 },
  { id: 'dubai', nameAr: 'دبي', nameEn: 'Dubai', countryAr: 'الإمارات العربية المتحدة', lat: 25.2048, lng: 55.2708, timezone: 4 },
  { id: 'jerusalem', nameAr: 'القدس الشريف', nameEn: 'Jerusalem', countryAr: 'فلسطين', lat: 31.7683, lng: 35.2137, timezone: 2 },
  { id: 'amman', nameAr: 'عَمّان', nameEn: 'Amman', countryAr: 'الأردن', lat: 31.9454, lng: 35.9284, timezone: 3 },
  { id: 'kuwait', nameAr: 'الكويت', nameEn: 'Kuwait City', countryAr: 'الكويت', lat: 29.3759, lng: 47.9774, timezone: 3 },
  { id: 'doha', nameAr: 'الدوحة', nameEn: 'Doha', countryAr: 'قطر', lat: 25.2854, lng: 51.5310, timezone: 3 },
  { id: 'manama', nameAr: 'المنامة', nameEn: 'Manama', countryAr: 'البحرين', lat: 26.2285, lng: 50.5860, timezone: 3 },
  { id: 'muscat', nameAr: 'مسقط', nameEn: 'Muscat', countryAr: 'عُمان', lat: 23.5880, lng: 58.3829, timezone: 4 },
  { id: 'baghdad', nameAr: 'بغداد', nameEn: 'Baghdad', countryAr: 'العراق', lat: 33.3152, lng: 44.3661, timezone: 3 },
  { id: 'beirut', nameAr: 'بيروت', nameEn: 'Beirut', countryAr: 'لبنان', lat: 33.8938, lng: 35.5018, timezone: 2 },
  { id: 'istanbul', nameAr: 'إسطنبول', nameEn: 'Istanbul', countryAr: 'تركيا', lat: 41.0082, lng: 28.9784, timezone: 3 },
  { id: 'london', nameAr: 'لندن', nameEn: 'London', countryAr: 'المملكة المتحدة', lat: 51.5074, lng: -0.1278, timezone: 0 }
];

import { format12HourTime } from './timeFormat.ts';
import { getRamadanCountdownDetails } from './ramadanCountdown.ts';

export interface PrayerTimesResult {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  // 12-hour formatted representations with Arabic indicator (ص / م)
  fajr12: string;
  sunrise12: string;
  dhuhr12: string;
  asr12: string;
  maghrib12: string;
  isha12: string;
  nextPrayer: {
    nameAr: string;
    nameEn: string;
    time: string;
    time12: string;
    remainingMs: number;
    remainingFormatted: string;
  };
}

// Convert degrees to radians and back
const d2r = (d: number) => (d * Math.PI) / 180.0;
const r2d = (r: number) => (r * 180.0) / Math.PI;

/**
 * Calculate accurate prayer times for a given coordinate and date
 */
export function calculatePrayerTimes(
  lat: number,
  lng: number,
  timeZoneOffset: number = 3,
  date: Date = new Date()
): PrayerTimesResult {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Julian date calculation
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  const jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  const d = jd - 2451545.0;

  // Sun's position
  const g = 357.529 + 0.98560028 * d;
  const q = 280.459 + 0.98564736 * d;
  const L = q + 1.915 * Math.sin(d2r(g)) + 0.02 * Math.sin(d2r(2 * g));
  const e = 23.439 - 0.00000036 * d;
  const RA = r2d(Math.atan2(Math.cos(d2r(e)) * Math.sin(d2r(L)), Math.cos(d2r(L)))) / 15.0;
  const decl = r2d(Math.asin(Math.sin(d2r(e)) * Math.sin(d2r(L))));
  const EqT = q / 15.0 - (RA < 0 ? RA + 24 : RA);

  // Solar noon
  const noon = 12 + timeZoneOffset - lng / 15.0 - EqT;

  // Fajr and Isha angles (Umm Al-Qura standard: Fajr 18.5 deg, Isha 90 mins after Maghrib or 18.5 deg)
  const fajrAngle = 18.5;
  const ishaAngle = 18.5;

  const sunAngleTime = (angle: number) => {
    const cosHA = (Math.sin(d2r(-angle)) - Math.sin(d2r(lat)) * Math.sin(d2r(decl))) / (Math.cos(d2r(lat)) * Math.cos(d2r(decl)));
    if (cosHA > 1 || cosHA < -1) return 0;
    return r2d(Math.acos(cosHA)) / 15.0;
  };

  const asrAngleTime = (factor: number = 1) => {
    // factor 1 = Shafi'i / Hanbali / Maliki (shadow = height)
    const cotAngle = factor + Math.tan(d2r(Math.abs(lat - decl)));
    const angle = r2d(Math.atan(1 / cotAngle));
    const cosHA = (Math.sin(d2r(angle)) - Math.sin(d2r(lat)) * Math.sin(d2r(decl))) / (Math.cos(d2r(lat)) * Math.cos(d2r(decl)));
    if (cosHA > 1 || cosHA < -1) return 0;
    return r2d(Math.acos(cosHA)) / 15.0;
  };

  const sunriseDiff = sunAngleTime(0.833);
  const fajrDiff = sunAngleTime(fajrAngle);
  const asrDiff = asrAngleTime(1);
  const maghribDiff = sunAngleTime(0.833);
  const ishaDiff = sunAngleTime(ishaAngle);

  const fajrDec = noon - fajrDiff;
  const sunriseDec = noon - sunriseDiff;
  const dhuhrDec = noon;
  const asrDec = noon + asrDiff;
  const maghribDec = noon + maghribDiff;
  const ishaDec = noon + (ishaDiff > 0 ? ishaDiff : maghribDiff + 1.5);

  const formatHours = (dec: number) => {
    let normalized = dec;
    while (normalized < 0) normalized += 24;
    while (normalized >= 24) normalized -= 24;
    const h = Math.floor(normalized);
    const m = Math.floor((normalized - h) * 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const times = {
    fajr: formatHours(fajrDec),
    sunrise: formatHours(sunriseDec),
    dhuhr: formatHours(dhuhrDec),
    asr: formatHours(asrDec),
    maghrib: formatHours(maghribDec),
    isha: formatHours(ishaDec)
  };

  // Determine next prayer and remaining time
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

  const prayerSchedule = [
    { nameAr: 'الفجر', nameEn: 'Fajr', time: times.fajr, dec: fajrDec },
    { nameAr: 'الشروق', nameEn: 'Sunrise', time: times.sunrise, dec: sunriseDec },
    { nameAr: 'الظهر', nameEn: 'Dhuhr', time: times.dhuhr, dec: dhuhrDec },
    { nameAr: 'العصر', nameEn: 'Asr', time: times.asr, dec: asrDec },
    { nameAr: 'المغرب', nameEn: 'Maghrib', time: times.maghrib, dec: maghribDec },
    { nameAr: 'العشاء', nameEn: 'Isha', time: times.isha, dec: ishaDec }
  ];

  let nextP = prayerSchedule[0];
  let found = false;
  for (const p of prayerSchedule) {
    const [h, m] = p.time.split(':').map(Number);
    const prayerMin = h * 60 + m;
    if (prayerMin > currentMinutes) {
      nextP = p;
      found = true;
      break;
    }
  }

  // If all prayers passed today, next is tomorrow's Fajr
  let remainingMs = 0;
  const [nh, nm] = nextP.time.split(':').map(Number);
  const targetDate = new Date(now);
  targetDate.setHours(nh, nm, 0, 0);
  if (!found) {
    targetDate.setDate(targetDate.getDate() + 1);
  }
  remainingMs = Math.max(0, targetDate.getTime() - now.getTime());

  const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
  const remainingMins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
  const remainingSeconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

  const remainingFormatted = `${remainingHours} س ${remainingMins} د ${remainingSeconds} ث`;

  return {
    ...times,
    fajr12: format12HourTime(times.fajr),
    sunrise12: format12HourTime(times.sunrise),
    dhuhr12: format12HourTime(times.dhuhr),
    asr12: format12HourTime(times.asr),
    maghrib12: format12HourTime(times.maghrib),
    isha12: format12HourTime(times.isha),
    nextPrayer: {
      nameAr: nextP.nameAr,
      nameEn: nextP.nameEn,
      time: nextP.time,
      time12: format12HourTime(nextP.time),
      remainingMs,
      remainingFormatted
    }
  };
}

/**
 * Calculate Qibla angle relative to True North from given coordinates
 * Kaaba Coordinates: 21.4225° N, 39.8262° E
 */
export function calculateQiblaDirection(lat: number, lng: number): number {
  const kaabaLat = d2r(21.4225);
  const kaabaLng = d2r(39.8262);
  const userLat = d2r(lat);
  const userLng = d2r(lng);

  const deltaLng = kaabaLng - userLng;
  const y = Math.sin(deltaLng);
  const x = Math.cos(userLat) * Math.tan(kaabaLat) - Math.sin(userLat) * Math.cos(deltaLng);

  let qibla = r2d(Math.atan2(y, x));
  if (qibla < 0) qibla += 360;
  return Math.round(qibla);
}

/**
 * Approximate accurate Hijri date calculation based on Umm al-Qura reference
 */
export function getHijriDate(date: Date = new Date()): {
  day: number;
  monthAr: string;
  monthEn: string;
  year: number;
  formattedAr: string;
  formattedEn: string;
} {
  // Using Intl with Islamic Umm al-Qura calendar
  try {
    const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const parts = formatter.formatToParts(date);
    const day = parts.find(p => p.type === 'day')?.value || '1';
    const month = parts.find(p => p.type === 'month')?.value || 'رمضان';
    const calcYear = String(Math.floor((date.getFullYear() - 622) * (365.25 / 354.36)));
    const year = parts.find(p => p.type === 'year')?.value || calcYear;

    let monthEn = 'Hijri';
    try {
      const enFormatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { month: 'long' });
      monthEn = enFormatter.format(date);
    } catch {
      monthEn = 'Hijri';
    }

    return {
      day: parseInt(day, 10) || 1,
      monthAr: month,
      monthEn,
      year: parseInt(year, 10) || 1448,
      formattedAr: `${day} ${month} ${year} هـ`,
      formattedEn: `${day} ${monthEn} ${year} AH`
    };
  } catch {
    const approxYear = Math.floor((date.getFullYear() - 622) * (365.25 / 354.36)) || 1448;
    return {
      day: date.getDate(),
      monthAr: 'شعبان',
      monthEn: 'Sha\'ban',
      year: approxYear,
      formattedAr: `${date.getDate()} شعبان ${approxYear} هـ`,
      formattedEn: `${date.getDate()} Sha'ban ${approxYear} AH`
    };
  }
}

/**
 * Days remaining until Ramadan calculated dynamically per Umm al-Qura calendar
 */
export function getRamadanCountdown(): number {
  return getRamadanCountdownDetails(new Date()).days;
}

export { getRamadanCountdownDetails } from './ramadanCountdown.ts';
