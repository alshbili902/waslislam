/**
 * Yawmi Ma'a Wasl (يومي مع وصل) - Daily Worship Management & Tracking Engine.
 * Manages daily worship routines, custom goals, streak calculations, weekly activity,
 * and date boundary handling without guilt-based mechanics.
 */

import { localStore, supabase } from '../lib/supabase';

export interface DailyGoalItem {
  id: string;
  titleAr: string;
  category: 'prayer' | 'quran' | 'adhkar' | 'sunnah' | 'learning' | 'custom';
  targetCount?: number;
  currentCount?: number;
  isCompleted: boolean;
  isCustom?: boolean;
  descriptionAr?: string;
}

export interface DailyWorshipRecord {
  dateKey: string; // YYYY-MM-DD
  goals: DailyGoalItem[];
  quranPagesRead: number;
  quranTargetPages: number;
  completedCount: number;
  totalCount: number;
  completionPercentage: number;
  updatedAt: string;
}

export const DEFAULT_DAILY_GOALS: DailyGoalItem[] = [
  {
    id: 'fajr-prayer',
    titleAr: 'صلاة الفجر في وقتها',
    category: 'prayer',
    isCompleted: false,
    descriptionAr: 'ركعتا الفجر خير من الدنيا وما فيها',
  },
  {
    id: 'morning-adhkar',
    titleAr: 'أذكار الصباح كاملة',
    category: 'adhkar',
    isCompleted: false,
    descriptionAr: 'حصن المسلم وبداية اليوم بذكر الله',
  },
  {
    id: 'quran-ward',
    titleAr: 'ورد القرآن الكريم اليومي',
    category: 'quran',
    targetCount: 4, // 4 pages = ~1 Hizb / week Khatmah
    currentCount: 0,
    isCompleted: false,
    descriptionAr: 'قراءة وتدبر صفحات من المصحف الشريف',
  },
  {
    id: 'dhuha-prayer',
    titleAr: 'صلاة الضحى (ركعتان فأكثر)',
    category: 'sunnah',
    isCompleted: false,
    descriptionAr: 'صدقة عن كل مفصل من مفاصل البدن',
  },
  {
    id: 'evening-adhkar',
    titleAr: 'أذكار المساء وحفظ اليوم',
    category: 'adhkar',
    isCompleted: false,
    descriptionAr: 'سكينة المساء والتعوذ من شرور الليل',
  },
  {
    id: 'tasbeeh-istighfar',
    titleAr: 'الاستغفار والتسبيح (100 مرة)',
    category: 'adhkar',
    targetCount: 100,
    currentCount: 0,
    isCompleted: false,
    descriptionAr: 'من لزم الاستغفار جعل الله له من كل هم فرجاً',
  },
  {
    id: 'mulk-sleep',
    titleAr: 'قراءة سورة الملك وأذكار النوم',
    category: 'quran',
    isCompleted: false,
    descriptionAr: 'المانعة والمنجية من عذاب القبر بإذن الله',
  },
  {
    id: 'witr-prayer',
    titleAr: 'صلاة الوتر وقيام الليل',
    category: 'sunnah',
    isCompleted: false,
    descriptionAr: 'إن الله وتر يحب الوتر',
  },
];

export function getTodayDateKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Loads or initializes the daily record for the given date.
 */
export function getDailyWorshipRecord(dateKey: string = getTodayDateKey()): DailyWorshipRecord {
  const saved = localStore.get<DailyWorshipRecord | null>(`yawmi_${dateKey}`, null);
  if (saved && saved.goals && Array.isArray(saved.goals)) {
    return saved;
  }

  // Load custom goals template if defined by user
  const customTemplate = localStore.get<DailyGoalItem[]>('yawmi_user_template', DEFAULT_DAILY_GOALS);
  const initialGoals: DailyGoalItem[] = customTemplate.map(g => ({
    ...g,
    isCompleted: false,
    currentCount: 0,
  }));

  const record: DailyWorshipRecord = {
    dateKey,
    goals: initialGoals,
    quranPagesRead: 0,
    quranTargetPages: localStore.get<number>('yawmi_quran_target', 4),
    completedCount: 0,
    totalCount: initialGoals.length,
    completionPercentage: 0,
    updatedAt: new Date().toISOString(),
  };

  localStore.set(`yawmi_${dateKey}`, record);
  return record;
}

/**
 * Updates a goal's completion state and recalculates percentages.
 */
export function toggleDailyGoal(goalId: string, dateKey: string = getTodayDateKey()): DailyWorshipRecord {
  const record = getDailyWorshipRecord(dateKey);
  const nextGoals = record.goals.map(g => {
    if (g.id === goalId) {
      const nextCompleted = !g.isCompleted;
      return {
        ...g,
        isCompleted: nextCompleted,
        currentCount: nextCompleted && g.targetCount ? g.targetCount : nextCompleted ? 1 : 0,
      };
    }
    return g;
  });

  const completedCount = nextGoals.filter(g => g.isCompleted).length;
  const totalCount = nextGoals.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const updated: DailyWorshipRecord = {
    ...record,
    goals: nextGoals,
    completedCount,
    totalCount,
    completionPercentage,
    updatedAt: new Date().toISOString(),
  };

  localStore.set(`yawmi_${dateKey}`, updated);

  // Update streak in background
  recalculateStreak();

  return updated;
}

/**
 * Adds a new custom goal to today and optionally saves it into the default template.
 */
export function addCustomGoal(titleAr: string, category: DailyGoalItem['category'] = 'custom'): DailyWorshipRecord {
  const dateKey = getTodayDateKey();
  const record = getDailyWorshipRecord(dateKey);

  const newGoal: DailyGoalItem = {
    id: `custom_${Date.now()}`,
    titleAr: titleAr.trim(),
    category,
    isCompleted: false,
    isCustom: true,
  };

  const nextGoals = [...record.goals, newGoal];
  const completedCount = nextGoals.filter(g => g.isCompleted).length;
  const totalCount = nextGoals.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  const updated: DailyWorshipRecord = {
    ...record,
    goals: nextGoals,
    completedCount,
    totalCount,
    completionPercentage,
    updatedAt: new Date().toISOString(),
  };

  localStore.set(`yawmi_${dateKey}`, updated);

  // Also update user's ongoing template
  const currentTemplate = localStore.get<DailyGoalItem[]>('yawmi_user_template', DEFAULT_DAILY_GOALS);
  localStore.set('yawmi_user_template', [...currentTemplate, { ...newGoal, isCompleted: false }]);

  return updated;
}

/**
 * Removes a goal from today's list and template.
 */
export function removeGoal(goalId: string): DailyWorshipRecord {
  const dateKey = getTodayDateKey();
  const record = getDailyWorshipRecord(dateKey);

  const nextGoals = record.goals.filter(g => g.id !== goalId);
  const completedCount = nextGoals.filter(g => g.isCompleted).length;
  const totalCount = nextGoals.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const updated: DailyWorshipRecord = {
    ...record,
    goals: nextGoals,
    completedCount,
    totalCount,
    completionPercentage,
    updatedAt: new Date().toISOString(),
  };

  localStore.set(`yawmi_${dateKey}`, updated);

  // Update template
  const currentTemplate = localStore.get<DailyGoalItem[]>('yawmi_user_template', DEFAULT_DAILY_GOALS);
  localStore.set('yawmi_user_template', currentTemplate.filter(g => g.id !== goalId));

  return updated;
}

/**
 * Calculates current active streak of days with at least 50% completed tasks.
 */
export function recalculateStreak(): number {
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const d = new Date(today.getTime() - i * 86400000);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const rec = localStore.get<DailyWorshipRecord | null>(`yawmi_${key}`, null);

    if (rec && rec.completionPercentage >= 50) {
      streak++;
    } else if (i === 0) {
      // If today is not yet 50%, continue checking backwards from yesterday
      continue;
    } else {
      break;
    }
  }

  localStore.set('yawmi_active_streak', streak);
  return streak;
}

export function getActiveStreak(): number {
  return localStore.get<number>('yawmi_active_streak', 0);
}

/**
 * Returns past 7 days activity status for weekly calendar preview.
 */
export function getWeeklyProgress(): { dateKey: string; dayNameAr: string; percentage: number; isCompleted: boolean }[] {
  const days: { dateKey: string; dayNameAr: string; percentage: number; isCompleted: boolean }[] = [];
  const today = new Date();
  const dayNamesAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const rec = localStore.get<DailyWorshipRecord | null>(`yawmi_${key}`, null);
    const percentage = rec ? rec.completionPercentage : 0;
    days.push({
      dateKey: key,
      dayNameAr: dayNamesAr[d.getDay()],
      percentage,
      isCompleted: percentage >= 50,
    });
  }

  return days;
}

/**
 * Records general progress towards a daily goal category or goal id
 */
export function recordGoalProgress(goalKey: string, delta: number = 1): void {
  const dateKey = getTodayDateKey();
  const record = getDailyWorshipRecord(dateKey);
  const target = record.goals.find(g => g.id.includes(goalKey) || g.category === goalKey || g.id === goalKey);
  if (target && !target.isCompleted) {
    toggleDailyGoal(target.id, dateKey);
  }
}

export const DailyWorshipService = {
  getProfile: () => {
    const todayRec = getDailyWorshipRecord(getTodayDateKey());
    const streak = getActiveStreak();
    const history: Record<string, string[]> = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(Date.now() - i * 86400000);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const rec = localStore.get<DailyWorshipRecord | null>(`yawmi_${key}`, null);
      if (rec) {
        history[key] = rec.goals.filter(g => g.isCompleted).map(g => g.id);
      }
    }
    return {
      activities: todayRec.goals,
      streak,
      history
    };
  },
  getWeeklyProgress,
  getActiveStreak,
  toggleGoal: toggleDailyGoal
};


