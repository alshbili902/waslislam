/**
 * Wasl Islamic (وصل الإسلامية) - Seasons Manager & Countdown Engine.
 * Accurately determines current or upcoming seasons based on Hijri date,
 * allows user moon-sighting adjustments, and integrates with reminders.
 */

import { ISLAMIC_SEASONS_DATA, type IslamicSeason } from '../data/seasonsData.ts';
import { getDetailedHijriDate } from './islamicCalendar.ts';
import { localStore } from '../lib/supabase.ts';

export type DetailedHijriDate = ReturnType<typeof getDetailedHijriDate>;

export interface SeasonStatusResult {
  currentSeason: IslamicSeason | null;
  upcomingSeason: IslamicSeason;
  daysRemainingToUpcoming: number;
  hijriDate: DetailedHijriDate;
  adjustmentDays: number;
}

export const seasonsManager = {
  /**
   * Get user-configured moon-sighting adjustment (-2, -1, 0, +1, +2 days)
   */
  getAdjustmentDays(): number {
    return localStore.get<number>('hijri_adjustment_days', 0);
  },

  /**
   * Set user-configured moon-sighting adjustment
   */
  setAdjustmentDays(days: number): void {
    localStore.set('hijri_adjustment_days', days);
  },

  /**
   * Evaluate active and upcoming seasons for today
   */
  getSeasonsStatus(customDate: Date = new Date()): SeasonStatusResult {
    const adjustment = this.getAdjustmentDays();
    const adjustedDate = new Date(customDate.getTime() + adjustment * 24 * 60 * 60 * 1000);
    const hijri = getDetailedHijriDate(adjustedDate);

    // 1. Check if we are currently inside any season
    let active: IslamicSeason | null = null;
    for (const season of ISLAMIC_SEASONS_DATA) {
      if (season.hijriMonth === 0) {
        // Recurring monthly (like White Days 13, 14, 15)
        if (hijri.day >= season.startDay && hijri.day <= season.endDay) {
          active = season;
          break;
        }
      } else if (season.hijriMonth === hijri.month) {
        if (hijri.day >= season.startDay && hijri.day <= season.endDay) {
          active = season;
          break;
        }
      }
    }

    // 2. Find closest upcoming season
    let closestUpcoming: IslamicSeason = ISLAMIC_SEASONS_DATA[0];
    let minDays = 999;

    for (const season of ISLAMIC_SEASONS_DATA) {
      let targetMonth = season.hijriMonth === 0 ? hijri.month : season.hijriMonth;
      let targetDay = season.startDay;

      // If recurring monthly and already passed this month, target next month
      if (season.hijriMonth === 0 && hijri.day > season.endDay) {
        targetMonth = (hijri.month % 12) + 1;
      }

      // Calculate approximate days difference in Hijri calendar (29.5 days/month)
      let monthDiff = targetMonth - hijri.month;
      if (monthDiff < 0 || (monthDiff === 0 && targetDay < hijri.day)) {
        monthDiff += 12;
      }

      const estimatedDays = Math.round(monthDiff * 29.53) + (targetDay - hijri.day);
      if (estimatedDays > 0 && estimatedDays < minDays) {
        minDays = estimatedDays;
        closestUpcoming = season;
      }
    }

    return {
      currentSeason: active,
      upcomingSeason: closestUpcoming,
      daysRemainingToUpcoming: Math.max(1, minDays),
      hijriDate: hijri,
      adjustmentDays: adjustment
    };
  }
};
