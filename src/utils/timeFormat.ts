/**
 * Centralized Date & 12-Hour Time Utilities for Wasl Islamic (منصة وصل الإسلامية).
 * Ensures uniform 12-hour time format with Arabic (ص / م) and English (AM / PM) indicators,
 * robust timezone detection, and accurate countdown calculations.
 */

import { CITIES, type CityCoordinate } from './prayerTimes.ts';

/**
 * Converts any 24-hour time string ("HH:MM" or "HH:MM:SS") or Date instance into
 * a standardized 12-hour format with Arabic ('ص' / 'م') or English ('AM' / 'PM') indicators.
 *
 * Examples:
 * - "14:30" -> "2:30 م" (Arabic) or "2:30 PM" (English)
 * - "09:15" -> "9:15 ص" (Arabic) or "9:15 AM" (English)
 * - "00:00" -> "12:00 ص" (Arabic) or "12:00 AM" (English)
 * - "12:00" -> "12:00 م" (Arabic) or "12:00 PM" (English)
 * - "23:45" -> "11:45 م" (Arabic) or "11:45 PM" (English)
 */
export function format12HourTime(
  input: string | Date | null | undefined,
  isEnglish = false,
  includeSeconds = false
): string {
  if (!input) return '';

  let h = 0;
  let m = 0;
  let s = 0;
  let hasSeconds = false;

  if (input instanceof Date) {
    h = input.getHours();
    m = input.getMinutes();
    s = input.getSeconds();
    hasSeconds = includeSeconds;
  } else if (typeof input === 'string') {
    const trimmed = input.trim();
    // If string already contains AM/PM or ص/م, return as is
    if (trimmed.includes('ص') || trimmed.includes('م') || trimmed.includes('AM') || trimmed.includes('PM')) {
      return trimmed;
    }
    const parts = trimmed.split(':');
    if (parts.length < 2) return input;
    h = parseInt(parts[0], 10);
    m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return input;
    if (parts.length >= 3 && includeSeconds) {
      s = parseInt(parts[2], 10) || 0;
      hasSeconds = true;
    }
  } else {
    return String(input);
  }

  const period = h >= 12 ? (isEnglish ? 'PM' : 'م') : (isEnglish ? 'AM' : 'ص');
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const mStr = String(m).padStart(2, '0');

  if (hasSeconds) {
    const sStr = String(s).padStart(2, '0');
    return `${h12}:${mStr}:${sStr} ${period}`;
  }

  return `${h12}:${mStr} ${period}`;
}

/**
 * Breakdown of a duration in milliseconds into days, hours, minutes, and seconds.
 */
export interface CountdownBreakdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  formatted: string;
}

export function formatCountdownBreakdown(ms: number, isEnglish = false): CountdownBreakdown {
  const safeMs = Math.max(0, ms);
  const totalSeconds = Math.floor(safeMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formatted = isEnglish
    ? `${days}d ${hours}h ${minutes}m ${seconds}s`
    : `${days} يوم و ${hours} س و ${minutes} د و ${seconds} ث`;

  return {
    days,
    hours,
    minutes,
    seconds,
    totalMs: safeMs,
    formatted
  };
}

/**
 * Detect user's local timezone offset and name, and find matching city.
 */
export function detectLocalTimezone(): {
  offsetHours: number;
  timeZoneName: string;
  matchedCity: CityCoordinate;
} {
  let offsetHours = 3; // Default to Makkah/Riyadh UTC+3
  let timeZoneName = 'Asia/Riyadh';

  if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
    try {
      timeZoneName = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Riyadh';
    } catch {
      // fallback
    }
  }

  if (typeof Date !== 'undefined') {
    // getTimezoneOffset returns minutes difference UTC - Local
    offsetHours = -new Date().getTimezoneOffset() / 60;
  }

  // Attempt to match city by timezone name
  const tzMap: Record<string, string> = {
    'Asia/Riyadh': 'riyadh',
    'Asia/Dubai': 'dubai',
    'Africa/Cairo': 'cairo',
    'Asia/Jerusalem': 'jerusalem',
    'Asia/Amman': 'amman',
    'Asia/Kuwait': 'kuwait',
    'Asia/Qatar': 'doha',
    'Asia/Bahrain': 'manama',
    'Asia/Muscat': 'muscat',
    'Asia/Baghdad': 'baghdad',
    'Asia/Beirut': 'beirut',
    'Europe/Istanbul': 'istanbul',
    'Europe/London': 'london'
  };

  const matchedCityId = tzMap[timeZoneName];
  if (matchedCityId) {
    const found = CITIES.find(c => c.id === matchedCityId);
    if (found) {
      return { offsetHours, timeZoneName, matchedCity: found };
    }
  }

  // Match by closest offset
  const cityByOffset = CITIES.find(c => c.timezone === Math.round(offsetHours));
  return {
    offsetHours,
    timeZoneName,
    matchedCity: cityByOffset || CITIES[0]
  };
}

/**
 * Calculate distance between two coordinates in kilometers using Haversine formula.
 */
export function calculateHaversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Find the closest predefined city to given coordinates.
 */
export function findClosestCity(lat: number, lng: number): CityCoordinate {
  let closest = CITIES[0];
  let minDistance = Infinity;

  for (const city of CITIES) {
    const dist = calculateHaversineDistance(lat, lng, city.lat, city.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = city;
    }
  }

  return closest;
}
