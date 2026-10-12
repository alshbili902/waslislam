import { localStore, supabase } from '../lib/supabase.ts';
import { SURAH_LIST } from '../data/quranMetadata.ts';

export type ReadingUnit = 'pages' | 'ayahs' | 'juz';
export type PlanStatus = 'active' | 'paused' | 'completed';

export interface ReadingPlanHistoryEntry {
  date: string;
  unitsCompleted: number;
  sessionNumber?: number;
  notes?: string;
}

export interface ReadingPlan {
  id: string;
  title: string;
  unitType: ReadingUnit;
  totalUnits: number; // 604 for pages, 6236 for ayahs, 30 for juz
  completedUnits: number;
  startDate: string; // YYYY-MM-DD
  targetEndDate: string; // YYYY-MM-DD
  sessionsPerDay: number; // 1 to 5
  activeDaysOfWeek: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  estimatedMinutesPerSession: number;
  status: PlanStatus;
  startSurah: number;
  startAyah: number;
  startPage: number;
  history: ReadingPlanHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'wasl_reading_plan_v2';
const TOTAL_QURAN_PAGES = 604;
const TOTAL_QURAN_AYAHS = 6236;
const TOTAL_QURAN_JUZ = 30;

// Approximate starting page for each of the 114 Surahs in the standard Medina Mushaf
export const SURAH_START_PAGES: Record<number, number> = {
  1: 1, 2: 2, 3: 50, 4: 77, 5: 106, 6: 128, 7: 151, 8: 177, 9: 187, 10: 208,
  11: 221, 12: 235, 13: 249, 14: 255, 15: 262, 16: 267, 17: 282, 18: 293, 19: 305, 20: 312,
  21: 322, 22: 332, 23: 342, 24: 350, 25: 359, 26: 367, 27: 377, 28: 385, 29: 396, 30: 404,
  31: 411, 32: 415, 33: 418, 34: 428, 35: 434, 36: 440, 37: 446, 38: 453, 39: 458, 40: 467,
  41: 477, 42: 483, 43: 489, 44: 496, 45: 499, 46: 502, 47: 507, 48: 511, 49: 515, 50: 518,
  51: 520, 52: 523, 53: 526, 54: 528, 55: 531, 56: 534, 57: 537, 58: 542, 59: 545, 60: 549,
  61: 651, 62: 553, 63: 554, 64: 556, 65: 558, 66: 560, 67: 562, 68: 564, 69: 566, 70: 568,
  71: 570, 72: 572, 73: 574, 74: 575, 75: 577, 76: 578, 77: 580, 78: 582, 79: 583, 80: 585,
  81: 586, 82: 587, 83: 587, 84: 589, 85: 590, 86: 591, 87: 591, 88: 592, 89: 593, 90: 594,
  91: 595, 92: 595, 93: 596, 94: 596, 95: 597, 96: 597, 97: 598, 98: 598, 99: 599, 100: 599,
  101: 600, 102: 600, 103: 601, 104: 601, 105: 601, 106: 602, 107: 602, 108: 602, 109: 603,
  110: 603, 111: 603, 112: 604, 113: 604, 114: 604
};

// Calculate active days between two ISO dates given active days of week
export function countActiveDaysBetween(startDateStr: string, endDateStr: string, activeDaysOfWeek: number[]): number {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 1;

  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    if (activeDaysOfWeek.includes(cur.getDay())) {
      count++;
    }
    cur.setDate(cur.getDate() + 1);
  }
  return Math.max(1, count);
}

export function getDefaultReadingPlan(): ReadingPlan {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  // Default: 30 days Khatmah
  const end = new Date(today);
  end.setDate(end.getDate() + 30);
  const endStr = end.toISOString().split('T')[0];

  const savedKhatmahPage = localStore.get<number>('khatmah_page', 1);

  return {
    id: 'default_plan',
    title: 'خطة الختمة المباركة (30 يوماً)',
    unitType: 'pages',
    totalUnits: TOTAL_QURAN_PAGES,
    completedUnits: Math.max(0, savedKhatmahPage - 1),
    startDate: todayStr,
    targetEndDate: endStr,
    sessionsPerDay: 5, // 5 sessions (e.g. 4 pages after each prayer = 20 pages/day = 1 juz)
    activeDaysOfWeek: [0, 1, 2, 3, 4, 5, 6], // Every day
    estimatedMinutesPerSession: 8, // ~8 minutes after each prayer
    status: 'active',
    startSurah: 1,
    startAyah: 1,
    startPage: 1,
    history: [],
    createdAt: todayStr,
    updatedAt: todayStr
  };
}

export class ReadingPlannerService {
  static getPlan(): ReadingPlan {
    const plan = localStore.get<ReadingPlan>(STORAGE_KEY, getDefaultReadingPlan());
    // Single source of truth sync: if khatmah_page was updated elsewhere, keep plan in sync
    const khatmahPage = localStore.get<number>('khatmah_page', 1);
    if (plan.unitType === 'pages' && khatmahPage > 1 && plan.completedUnits < khatmahPage - 1) {
      plan.completedUnits = Math.min(plan.totalUnits, khatmahPage - 1);
    }
    return plan;
  }

  static savePlan(plan: ReadingPlan): void {
    plan.updatedAt = new Date().toISOString();
    localStore.set(STORAGE_KEY, plan);

    // Sync to Supabase cloud if logged in
    if (supabase) {
      const client = supabase;
      client.auth.getSession().then(async ({ data }) => {
        if (data.session?.user) {
          try {
            await client.from('quran_reading_plans').upsert({
              id: plan.id,
              user_id: data.session.user.id,
              title: plan.title,
              target_days: countActiveDaysBetween(plan.startDate, plan.targetEndDate, plan.activeDaysOfWeek),
              unit_type: plan.unitType,
              completed_units: plan.completedUnits,
              total_units: plan.totalUnits,
              sessions_per_day: plan.sessionsPerDay,
              active_days: plan.activeDaysOfWeek,
              status: plan.status,
              updated_at: new Date().toISOString()
            }, { onConflict: 'id' });
          } catch (err: any) {
            console.warn('[ReadingPlanner] Cloud sync notice:', err);
          }
        }
      });
    }
  }

  static calculateMetrics(plan: ReadingPlan, referenceDateStr?: string) {
    const todayStr = referenceDateStr || new Date().toISOString().split('T')[0];
    const remainingUnits = Math.max(0, plan.totalUnits - plan.completedUnits);
    const activeDaysRemaining = countActiveDaysBetween(todayStr, plan.targetEndDate, plan.activeDaysOfWeek);
    
    // Daily target
    const dailyTargetUnits = Math.ceil(remainingUnits / Math.max(1, activeDaysRemaining));
    const perSessionTarget = Math.ceil(dailyTargetUnits / Math.max(1, plan.sessionsPerDay));
    
    const percentage = plan.totalUnits > 0 
      ? Math.min(100, Math.round((plan.completedUnits / plan.totalUnits) * 100))
      : 0;

    // Estimated minutes per session based on unit
    // Pages: ~2.5 mins per page
    // Ayahs: ~25 secs per ayah
    // Juz: ~45 mins per juz
    let minutesPerSession = 5;
    if (plan.unitType === 'pages') {
      minutesPerSession = Math.round(perSessionTarget * 2.5);
    } else if (plan.unitType === 'ayahs') {
      minutesPerSession = Math.round((perSessionTarget * 25) / 60);
    } else if (plan.unitType === 'juz') {
      minutesPerSession = Math.round(perSessionTarget * 45);
    }
    minutesPerSession = Math.max(3, minutesPerSession);

    // Current page mapping
    let currentPage = 1;
    if (plan.unitType === 'pages') {
      currentPage = Math.min(TOTAL_QURAN_PAGES, plan.completedUnits + 1);
    } else if (plan.unitType === 'juz') {
      currentPage = Math.min(TOTAL_QURAN_PAGES, (plan.completedUnits * 20) + 1);
    } else {
      // Ayahs approx (6236 ayahs / 604 pages ≈ 10.3 ayahs per page)
      currentPage = Math.min(TOTAL_QURAN_PAGES, Math.floor(plan.completedUnits / 10.3) + 1);
    }

    const currentJuz = Math.min(30, Math.floor((currentPage - 1) / 20) + 1);

    // Identify current surah
    let currentSurah = SURAH_LIST[0];
    for (const s of SURAH_LIST) {
      const sPage = SURAH_START_PAGES[s.number] || 1;
      if (sPage <= currentPage) {
        currentSurah = s;
      } else {
        break;
      }
    }

    return {
      remainingUnits,
      activeDaysRemaining,
      dailyTargetUnits,
      perSessionTarget,
      percentage,
      minutesPerSession,
      currentPage,
      currentJuz,
      currentSurah,
      isCompleted: plan.completedUnits >= plan.totalUnits
    };
  }

  static recordProgress(plan: ReadingPlan, unitsToAdd: number, notes?: string): ReadingPlan {
    const todayStr = new Date().toISOString().split('T')[0];
    const newCompleted = Math.min(plan.totalUnits, plan.completedUnits + unitsToAdd);
    
    // Add to history
    const existingEntryIndex = plan.history.findIndex(h => h.date === todayStr);
    let updatedHistory = [...plan.history];
    if (existingEntryIndex >= 0) {
      updatedHistory[existingEntryIndex] = {
        ...updatedHistory[existingEntryIndex],
        unitsCompleted: updatedHistory[existingEntryIndex].unitsCompleted + unitsToAdd,
        notes: notes || updatedHistory[existingEntryIndex].notes
      };
    } else {
      updatedHistory.push({
        date: todayStr,
        unitsCompleted: unitsToAdd,
        notes
      });
    }

    const updatedPlan: ReadingPlan = {
      ...plan,
      completedUnits: newCompleted,
      status: newCompleted >= plan.totalUnits ? 'completed' : plan.status,
      history: updatedHistory
    };

    // Save and sync single source of truth for Khatmah
    if (plan.unitType === 'pages') {
      localStore.set('khatmah_page', Math.min(TOTAL_QURAN_PAGES, newCompleted + 1));
    }

    this.savePlan(updatedPlan);
    return updatedPlan;
  }

  // Recalculate adaptive planning
  static recalculatePlan(
    plan: ReadingPlan, 
    mode: 'increase_daily' | 'extend_date' | 'redistribute',
    extraDays = 7
  ): ReadingPlan {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (mode === 'extend_date') {
      // Extend the target end date
      const end = new Date(plan.targetEndDate);
      end.setDate(end.getDate() + extraDays);
      const updated: ReadingPlan = {
        ...plan,
        targetEndDate: end.toISOString().split('T')[0]
      };
      this.savePlan(updated);
      return updated;
    }

    if (mode === 'increase_daily') {
      // Keep targetEndDate, simply save plan (daily target formula recalculates automatically based on remaining units)
      this.savePlan(plan);
      return plan;
    }

    if (mode === 'redistribute') {
      // Re-allocate sessions per day if suitable (e.g. increment sessions from 1 to 2 or 5)
      const newSessions = Math.min(5, Math.max(1, plan.sessionsPerDay + 1));
      const updated: ReadingPlan = {
        ...plan,
        sessionsPerDay: newSessions
      };
      this.savePlan(updated);
      return updated;
    }

    return plan;
  }

  static togglePausePlan(plan: ReadingPlan): ReadingPlan {
    const newStatus: PlanStatus = plan.status === 'paused' ? 'active' : 'paused';
    const updated = { ...plan, status: newStatus };
    this.savePlan(updated);
    return updated;
  }

  static resetPlan(plan: ReadingPlan, targetDays = 30): ReadingPlan {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const end = new Date(today);
    end.setDate(end.getDate() + targetDays);

    const reset: ReadingPlan = {
      ...plan,
      completedUnits: 0,
      startDate: todayStr,
      targetEndDate: end.toISOString().split('T')[0],
      status: 'active',
      history: []
    };

    localStore.set('khatmah_page', 1);
    this.savePlan(reset);
    return reset;
  }
}
