import { supabase, isSupabaseConfigured, localStore } from './supabase';
import {
  KhatmahPlan,
  KhatmahPreset,
  HifzProgress,
  HifzSession,
  HifzStatus,
} from '../types/khatmah';
import { SURAHS_LIST } from '../data/quranMetadata';

const TOTAL_QURAN_PAGES = 604;
const TOTAL_QURAN_JUZ = 30;

export const KHATMAH_PRESET_DAYS: Record<Exclude<KhatmahPreset, 'custom'>, number> = {
  '7_days': 7,
  '15_days': 15,
  '30_days': 30,
  '60_days': 60,
  '90_days': 90,
};

function formatIsoDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function addDaysToDate(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return formatIsoDate(d);
}

function getDaysDifference(startDateStr: string, endDateStr: string): number {
  const start = new Date(startDateStr).getTime();
  const end = new Date(endDateStr).getTime();
  const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
}

function createDefaultPlan(userId?: string): KhatmahPlan {
  const today = formatIsoDate(new Date());
  const targetDate = addDaysToDate(today, 30);
  return {
    id: 'khatmah_default',
    userId,
    name: 'ختمة شهرية مباركة',
    presetType: '30_days',
    startDate: today,
    targetDate,
    durationDays: 30,
    totalPages: TOTAL_QURAN_PAGES,
    totalJuz: TOTAL_QURAN_JUZ,
    currentPage: 1,
    completedPages: 0,
    dailyPagesTarget: Math.ceil(TOTAL_QURAN_PAGES / 30), // ~21 pages (1 Juz per day)
    status: 'active',
    readingStreakDays: 1,
    lastReadDate: today,
    lastSurahNumber: 1,
    lastSurahNameAr: 'الفاتحة',
    lastAyahNumber: 1,
    completedPageNumbers: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export const khatmahService = {
  TOTAL_QURAN_PAGES,
  TOTAL_QURAN_JUZ,

  /**
   * Calculate plan details from a duration or date range
   */
  calculatePlanMetrics(
    preset: KhatmahPreset,
    startDateStr: string = formatIsoDate(new Date()),
    customEndDateStr?: string,
    customDuration?: number
  ) {
    let durationDays = 30;
    if (preset !== 'custom') {
      durationDays = KHATMAH_PRESET_DAYS[preset] || 30;
    } else if (customEndDateStr) {
      durationDays = getDaysDifference(startDateStr, customEndDateStr);
    } else if (customDuration) {
      durationDays = customDuration;
    }

    const pagesPerDay = Math.ceil(TOTAL_QURAN_PAGES / durationDays);
    const juzPerDay = Number((TOTAL_QURAN_JUZ / durationDays).toFixed(2));
    const targetDate = customEndDateStr || addDaysToDate(startDateStr, durationDays);

    return {
      durationDays,
      pagesPerDay,
      juzPerDay,
      targetDate,
    };
  },

  /**
   * Get the active Khatmah plan for current user or guest
   */
  async getActivePlan(userId?: string): Promise<KhatmahPlan> {
    const storageKey = userId ? `wasl_khatmah_plan_${userId}` : 'wasl_khatmah_plan';

    if (userId && isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('khatmah_plans')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .maybeSingle();

        if (!error && data) {
          const plan: KhatmahPlan = {
            id: data.id,
            userId: data.user_id,
            name: data.name,
            presetType: data.preset_type || '30_days',
            startDate: data.start_date,
            targetDate: data.target_date,
            durationDays: data.duration_days || 30,
            totalPages: TOTAL_QURAN_PAGES,
            totalJuz: TOTAL_QURAN_JUZ,
            currentPage: data.current_page || 1,
            completedPages: data.completed_pages || 0,
            dailyPagesTarget: data.daily_pages_target || 20,
            status: data.status || 'active',
            readingStreakDays: data.reading_streak_days || 1,
            lastReadDate: data.last_read_date,
            lastSurahNumber: data.last_surah_number || 1,
            lastSurahNameAr: data.last_surah_name_ar || 'الفاتحة',
            lastAyahNumber: data.last_ayah_number || 1,
            completedPageNumbers: data.completed_page_numbers || [],
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
          localStore.set(storageKey, plan);
          return plan;
        }
      } catch (err) {
        console.warn('getActivePlan supabase error:', err);
      }
    }

    const cached = localStore.get<KhatmahPlan | null>(storageKey, null);
    if (cached) return cached;

    const defaultPlan = createDefaultPlan(userId);
    localStore.set(storageKey, defaultPlan);
    return defaultPlan;
  },

  /**
   * Create or replace the current active plan
   */
  async createPlan(
    params: {
      name: string;
      presetType: KhatmahPreset;
      startDate: string;
      targetDate?: string;
      customDuration?: number;
    },
    userId?: string
  ): Promise<KhatmahPlan> {
    const metrics = this.calculatePlanMetrics(
      params.presetType,
      params.startDate,
      params.targetDate,
      params.customDuration
    );

    const planId = 'khatmah_' + Date.now();
    const newPlan: KhatmahPlan = {
      id: planId,
      userId,
      name: params.name || (params.presetType === '30_days' ? 'ختمة الشهر الفضيل' : 'ختمة القرآن الكريم'),
      presetType: params.presetType,
      startDate: params.startDate,
      targetDate: metrics.targetDate,
      durationDays: metrics.durationDays,
      totalPages: TOTAL_QURAN_PAGES,
      totalJuz: TOTAL_QURAN_JUZ,
      currentPage: 1,
      completedPages: 0,
      dailyPagesTarget: metrics.pagesPerDay,
      status: 'active',
      readingStreakDays: 1,
      lastReadDate: params.startDate,
      lastSurahNumber: 1,
      lastSurahNameAr: 'الفاتحة',
      lastAyahNumber: 1,
      completedPageNumbers: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const storageKey = userId ? `wasl_khatmah_plan_${userId}` : 'wasl_khatmah_plan';
    localStore.set(storageKey, newPlan);

    if (userId && isSupabaseConfigured && supabase) {
      try {
        await supabase.from('khatmah_plans').insert({
          id: planId,
          user_id: userId,
          name: newPlan.name,
          preset_type: newPlan.presetType,
          start_date: newPlan.startDate,
          target_date: newPlan.targetDate,
          duration_days: newPlan.durationDays,
          current_page: newPlan.currentPage,
          completed_pages: newPlan.completedPages,
          daily_pages_target: newPlan.dailyPagesTarget,
          status: newPlan.status,
          reading_streak_days: newPlan.readingStreakDays,
          last_read_date: newPlan.lastReadDate,
          last_surah_number: newPlan.lastSurahNumber,
          last_surah_name_ar: newPlan.lastSurahNameAr,
          last_ayah_number: newPlan.lastAyahNumber,
          completed_page_numbers: newPlan.completedPageNumbers,
        });
      } catch (err) {
        console.warn('createPlan supabase insert failed:', err);
      }
    }

    return newPlan;
  },

  /**
   * Update reading position (page/surah/ayah) in the active plan
   */
  async updateReadingPosition(
    position: {
      pageNumber: number;
      surahNumber: number;
      surahNameAr: string;
      ayahNumber: number;
    },
    userId?: string
  ): Promise<KhatmahPlan> {
    const plan = await this.getActivePlan(userId);
    const today = formatIsoDate(new Date());

    const pageSet = new Set<number>(plan.completedPageNumbers || []);
    pageSet.add(position.pageNumber);
    const completedPagesList = Array.from(pageSet).sort((a: number, b: number) => Number(a) - Number(b));

    // Calculate streak
    let streak = plan.readingStreakDays;
    if (plan.lastReadDate && plan.lastReadDate !== today) {
      const dayDiff = getDaysDifference(plan.lastReadDate, today);
      if (dayDiff === 1) streak += 1;
      else if (dayDiff > 1) streak = 1;
    }

    const updatedPlan: KhatmahPlan = {
      ...plan,
      currentPage: position.pageNumber,
      completedPages: completedPagesList.length,
      completedPageNumbers: completedPagesList,
      lastSurahNumber: position.surahNumber,
      lastSurahNameAr: position.surahNameAr,
      lastAyahNumber: position.ayahNumber,
      lastReadDate: today,
      readingStreakDays: streak,
      status: completedPagesList.length >= TOTAL_QURAN_PAGES ? 'completed' : 'active',
      updatedAt: new Date().toISOString(),
    };

    const storageKey = userId ? `wasl_khatmah_plan_${userId}` : 'wasl_khatmah_plan';
    localStore.set(storageKey, updatedPlan);

    if (userId && isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('khatmah_plans')
          .update({
            current_page: updatedPlan.currentPage,
            completed_pages: updatedPlan.completedPages,
            completed_page_numbers: updatedPlan.completedPageNumbers,
            last_surah_number: updatedPlan.lastSurahNumber,
            last_surah_name_ar: updatedPlan.lastSurahNameAr,
            last_ayah_number: updatedPlan.lastAyahNumber,
            last_read_date: updatedPlan.lastReadDate,
            reading_streak_days: updatedPlan.readingStreakDays,
            status: updatedPlan.status,
            updated_at: updatedPlan.updatedAt,
          })
          .eq('id', updatedPlan.id);
      } catch (err) {
        console.warn('updateReadingPosition supabase error:', err);
      }
    }

    return updatedPlan;
  },

  /**
   * Mark today's target as explicitly completed
   */
  async markTodayTargetCompleted(userId?: string): Promise<KhatmahPlan> {
    const plan = await this.getActivePlan(userId);
    const targetCount = plan.dailyPagesTarget;
    const startP = plan.currentPage;
    const endP = Math.min(TOTAL_QURAN_PAGES, startP + targetCount);

    const pageSet = new Set<number>(plan.completedPageNumbers || []);
    for (let p = startP; p <= endP; p++) {
      pageSet.add(p);
    }
    const completedPagesList = Array.from(pageSet).sort((a: number, b: number) => Number(a) - Number(b));

    // Find surah corresponding to end page
    const matchedSurah = SURAHS_LIST.slice().reverse().find((s) => s.page <= endP) || SURAHS_LIST[0];

    const today = formatIsoDate(new Date());
    let streak = plan.readingStreakDays;
    if (plan.lastReadDate && plan.lastReadDate !== today) {
      const dayDiff = getDaysDifference(plan.lastReadDate, today);
      if (dayDiff === 1) streak += 1;
      else if (dayDiff > 1) streak = 1;
    }

    const updatedPlan: KhatmahPlan = {
      ...plan,
      currentPage: Math.min(TOTAL_QURAN_PAGES, endP),
      completedPages: completedPagesList.length,
      completedPageNumbers: completedPagesList,
      lastSurahNumber: matchedSurah.number,
      lastSurahNameAr: matchedSurah.name,
      lastAyahNumber: 1,
      lastReadDate: today,
      readingStreakDays: streak,
      status: completedPagesList.length >= TOTAL_QURAN_PAGES ? 'completed' : 'active',
      updatedAt: new Date().toISOString(),
    };

    const storageKey = userId ? `wasl_khatmah_plan_${userId}` : 'wasl_khatmah_plan';
    localStore.set(storageKey, updatedPlan);

    if (userId && isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('khatmah_plans')
          .update({
            current_page: updatedPlan.currentPage,
            completed_pages: updatedPlan.completedPages,
            completed_page_numbers: updatedPlan.completedPageNumbers,
            last_surah_number: updatedPlan.lastSurahNumber,
            last_surah_name_ar: updatedPlan.lastSurahNameAr,
            last_read_date: updatedPlan.lastReadDate,
            reading_streak_days: updatedPlan.readingStreakDays,
            status: updatedPlan.status,
            updated_at: updatedPlan.updatedAt,
          })
          .eq('id', updatedPlan.id);
      } catch (err) {}
    }

    return updatedPlan;
  },

  /**
   * HIFZ PROGRESS MANAGEMENT
   */
  async getHifzProgressList(userId?: string): Promise<HifzProgress[]> {
    const storageKey = userId ? `wasl_hifz_progress_${userId}` : 'wasl_hifz_progress';

    if (userId && isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('hifz_progress')
          .select('*')
          .eq('user_id', userId)
          .order('surah_number', { ascending: true });

        if (!error && data && data.length > 0) {
          const list: HifzProgress[] = data.map((d: any) => ({
            id: d.id,
            userId: d.user_id,
            surahNumber: d.surah_number,
            surahNameAr: d.surah_name_ar || SURAHS_LIST.find((s) => s.number === d.surah_number)?.name || '',
            startAyah: d.start_ayah || 1,
            endAyah: d.end_ayah || 1,
            status: d.status || 'in_progress',
            progressPercentage: d.progress_percentage || 0,
            lastReviewedAt: d.last_reviewed_at,
            totalSessions: d.total_sessions || 0,
            averageAccuracy: d.average_accuracy || 0,
            weakAyahs: d.weak_ayahs || [],
            createdAt: d.created_at,
            updatedAt: d.updated_at,
          }));
          localStore.set(storageKey, list);
          return list;
        }
      } catch (e) {
        console.warn('getHifzProgressList supabase error:', e);
      }
    }

    const cached = localStore.get<HifzProgress[]>(storageKey, []);
    if (cached.length > 0) return cached;

    // Seed initial progress for Al-Mulk, Al-Kahf, Al-Fatiha
    const initialList: HifzProgress[] = [
      {
        id: 'hifz_1',
        surahNumber: 1,
        surahNameAr: 'الفَاتِحَة',
        startAyah: 1,
        endAyah: 7,
        status: 'memorized',
        progressPercentage: 100,
        lastReviewedAt: formatIsoDate(new Date()),
        totalSessions: 5,
        averageAccuracy: 98,
        weakAyahs: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'hifz_67',
        surahNumber: 67,
        surahNameAr: 'المُلْك',
        startAyah: 1,
        endAyah: 30,
        status: 'in_progress',
        progressPercentage: 70,
        lastReviewedAt: formatIsoDate(new Date()),
        totalSessions: 4,
        averageAccuracy: 92,
        weakAyahs: [4, 7, 12],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'hifz_18',
        surahNumber: 18,
        surahNameAr: 'الكَهْف',
        startAyah: 1,
        endAyah: 10,
        status: 'needs_review',
        progressPercentage: 50,
        lastReviewedAt: addDaysToDate(formatIsoDate(new Date()), -3),
        totalSessions: 3,
        averageAccuracy: 84,
        weakAyahs: [5, 8],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    localStore.set(storageKey, initialList);
    return initialList;
  },

  async updateSurahHifzStatus(
    surahNumber: number,
    status: HifzStatus,
    userId?: string
  ): Promise<HifzProgress[]> {
    const list = await this.getHifzProgressList(userId);
    const surahMeta = SURAHS_LIST.find((s) => s.number === surahNumber);
    const existingIndex = list.findIndex((item) => item.surahNumber === surahNumber);

    if (existingIndex >= 0) {
      list[existingIndex] = {
        ...list[existingIndex],
        status,
        progressPercentage: status === 'memorized' ? 100 : list[existingIndex].progressPercentage,
        updatedAt: new Date().toISOString(),
      };
    } else {
      list.push({
        id: 'hifz_' + surahNumber,
        userId,
        surahNumber,
        surahNameAr: surahMeta?.name || `سورة ${surahNumber}`,
        startAyah: 1,
        endAyah: surahMeta?.numberOfAyahs || 7,
        status,
        progressPercentage: status === 'memorized' ? 100 : 20,
        totalSessions: 0,
        averageAccuracy: 0,
        weakAyahs: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    const storageKey = userId ? `wasl_hifz_progress_${userId}` : 'wasl_hifz_progress';
    localStore.set(storageKey, list);

    if (userId && isSupabaseConfigured && supabase) {
      try {
        const item = list.find((i) => i.surahNumber === surahNumber);
        if (item) {
          await supabase.from('hifz_progress').upsert({
            user_id: userId,
            surah_number: item.surahNumber,
            surah_name_ar: item.surahNameAr,
            start_ayah: item.startAyah,
            end_ayah: item.endAyah,
            status: item.status,
            progress_percentage: item.progressPercentage,
            updated_at: item.updatedAt,
          });
        }
      } catch (err) {}
    }

    return list;
  },

  /**
   * Save a completed Hifz Recitation session and automatically update surah progress
   */
  async saveHifzSession(
    sessionData: Omit<HifzSession, 'id' | 'createdAt'>,
    userId?: string
  ): Promise<HifzSession> {
    const newSession: HifzSession = {
      ...sessionData,
      id: 'session_' + Date.now(),
      userId,
      createdAt: new Date().toISOString(),
    };

    // 1. Save session to localStore
    const sessionsKey = userId ? `wasl_hifz_sessions_${userId}` : 'wasl_hifz_sessions';
    const existingSessions = localStore.get<HifzSession[]>(sessionsKey, []);
    existingSessions.unshift(newSession);
    localStore.set(sessionsKey, existingSessions);

    // 2. Update Surah progress
    const progressList = await this.getHifzProgressList(userId);
    const surahIndex = progressList.findIndex((p) => p.surahNumber === sessionData.surahNumber);
    const today = formatIsoDate(new Date());

    if (surahIndex >= 0) {
      const current = progressList[surahIndex];
      const newTotalSessions = current.totalSessions + 1;
      const newAvgAccuracy = Math.round(
        (current.averageAccuracy * current.totalSessions + sessionData.accuracy) / newTotalSessions
      );

      // Merge weak ayahs
      const weakSet = new Set([...current.weakAyahs, ...sessionData.weakAyahs]);

      progressList[surahIndex] = {
        ...current,
        totalSessions: newTotalSessions,
        averageAccuracy: newAvgAccuracy,
        lastAttemptAccuracy: sessionData.accuracy,
        lastReviewedAt: today,
        weakAyahs: Array.from(weakSet),
        status: newAvgAccuracy >= 95 ? 'memorized' : newAvgAccuracy < 80 ? 'needs_review' : 'in_progress',
        progressPercentage: Math.min(100, Math.max(current.progressPercentage, sessionData.accuracy)),
        updatedAt: new Date().toISOString(),
      };
    } else {
      const surahMeta = SURAHS_LIST.find((s) => s.number === sessionData.surahNumber);
      progressList.push({
        id: 'hifz_' + sessionData.surahNumber,
        userId,
        surahNumber: sessionData.surahNumber,
        surahNameAr: sessionData.surahNameAr || surahMeta?.name || '',
        startAyah: sessionData.startAyah,
        endAyah: sessionData.endAyah,
        status: sessionData.accuracy >= 95 ? 'memorized' : 'in_progress',
        progressPercentage: sessionData.accuracy,
        lastReviewedAt: today,
        totalSessions: 1,
        averageAccuracy: sessionData.accuracy,
        lastAttemptAccuracy: sessionData.accuracy,
        weakAyahs: sessionData.weakAyahs,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    const progressKey = userId ? `wasl_hifz_progress_${userId}` : 'wasl_hifz_progress';
    localStore.set(progressKey, progressList);

    // 3. Sync to Supabase if authenticated
    if (userId && isSupabaseConfigured && supabase) {
      try {
        await supabase.from('hifz_sessions').insert({
          id: newSession.id,
          user_id: userId,
          surah_number: newSession.surahNumber,
          surah_name_ar: newSession.surahNameAr,
          start_ayah: newSession.startAyah,
          end_ayah: newSession.endAyah,
          mode: newSession.mode,
          accuracy: newSession.accuracy,
          duration_seconds: newSession.durationSeconds,
          total_ayahs: newSession.totalAyahs,
          total_words: newSession.totalWords,
          correct_words_count: newSession.correctWordsCount,
          incorrect_words_count: newSession.incorrectWordsCount,
          missing_words_count: newSession.missingWordsCount,
          extra_words_count: newSession.extraWordsCount,
          weak_ayahs: newSession.weakAyahs,
          ayah_results: newSession.ayahResults,
        });

        // Upsert progress
        const targetProgress = progressList.find((p) => p.surahNumber === sessionData.surahNumber);
        if (targetProgress) {
          await supabase.from('hifz_progress').upsert({
            user_id: userId,
            surah_number: targetProgress.surahNumber,
            surah_name_ar: targetProgress.surahNameAr,
            start_ayah: targetProgress.startAyah,
            end_ayah: targetProgress.endAyah,
            status: targetProgress.status,
            progress_percentage: targetProgress.progressPercentage,
            total_sessions: targetProgress.totalSessions,
            average_accuracy: targetProgress.averageAccuracy,
            weak_ayahs: targetProgress.weakAyahs,
            last_reviewed_at: targetProgress.lastReviewedAt,
            updated_at: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.warn('saveHifzSession supabase error:', err);
      }
    }

    return newSession;
  },

  async getHifzSessions(userId?: string): Promise<HifzSession[]> {
    const sessionsKey = userId ? `wasl_hifz_sessions_${userId}` : 'wasl_hifz_sessions';

    if (userId && isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('hifz_sessions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const list: HifzSession[] = data.map((d: any) => ({
            id: d.id,
            userId: d.user_id,
            surahNumber: d.surah_number,
            surahNameAr: d.surah_name_ar,
            startAyah: d.start_ayah,
            endAyah: d.end_ayah,
            mode: d.mode,
            accuracy: d.accuracy,
            durationSeconds: d.duration_seconds,
            totalAyahs: d.total_ayahs,
            totalWords: d.total_words,
            correctWordsCount: d.correct_words_count,
            incorrectWordsCount: d.incorrect_words_count,
            missingWordsCount: d.missing_words_count,
            extraWordsCount: d.extra_words_count,
            weakAyahs: d.weak_ayahs || [],
            ayahResults: d.ayah_results || [],
            createdAt: d.created_at,
          }));
          localStore.set(sessionsKey, list);
          return list;
        }
      } catch (err) {
        console.warn('getHifzSessions supabase error:', err);
      }
    }

    const cached = localStore.get<HifzSession[]>(sessionsKey, []);
    if (cached.length > 0) return cached;

    // Seed sample sessions for rich UX
    const sampleSessions: HifzSession[] = [
      {
        id: 'session_demo_1',
        surahNumber: 67,
        surahNameAr: 'المُلْك',
        startAyah: 1,
        endAyah: 10,
        mode: 'recite_text_hidden',
        accuracy: 94,
        durationSeconds: 154,
        totalAyahs: 10,
        totalWords: 78,
        correctWordsCount: 73,
        incorrectWordsCount: 3,
        missingWordsCount: 2,
        extraWordsCount: 0,
        weakAyahs: [4, 7],
        ayahResults: [],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'session_demo_2',
        surahNumber: 1,
        surahNameAr: 'الفَاتِحَة',
        startAyah: 1,
        endAyah: 7,
        mode: 'recite_text_visible',
        accuracy: 100,
        durationSeconds: 45,
        totalAyahs: 7,
        totalWords: 29,
        correctWordsCount: 29,
        incorrectWordsCount: 0,
        missingWordsCount: 0,
        extraWordsCount: 0,
        weakAyahs: [],
        ayahResults: [],
        createdAt: addDaysToDate(formatIsoDate(new Date()), -1),
      },
    ];

    localStore.set(sessionsKey, sampleSessions);
    return sampleSessions;
  },

  /**
   * Pull all weak ayahs that need review across all past sessions & progress
   */
  async getWeakAyahsForReview(
    userId?: string
  ): Promise<{ surahNumber: number; surahNameAr: string; weakAyahs: number[]; totalMistakes: number }[]> {
    const progressList = await this.getHifzProgressList(userId);
    const sessions = await this.getHifzSessions(userId);

    const map = new Map<number, { surahNameAr: string; ayahs: Set<number>; errorCount: number }>();

    // Collect from progress
    progressList.forEach((p) => {
      if (p.weakAyahs && p.weakAyahs.length > 0) {
        if (!map.has(p.surahNumber)) {
          map.set(p.surahNumber, {
            surahNameAr: p.surahNameAr,
            ayahs: new Set(p.weakAyahs),
            errorCount: p.weakAyahs.length * 2,
          });
        } else {
          p.weakAyahs.forEach((a) => map.get(p.surahNumber)!.ayahs.add(a));
        }
      }
    });

    // Collect from session results
    sessions.forEach((s) => {
      if (s.weakAyahs && s.weakAyahs.length > 0) {
        if (!map.has(s.surahNumber)) {
          map.set(s.surahNumber, {
            surahNameAr: s.surahNameAr,
            ayahs: new Set(s.weakAyahs),
            errorCount: s.weakAyahs.length,
          });
        } else {
          const entry = map.get(s.surahNumber)!;
          s.weakAyahs.forEach((a) => entry.ayahs.add(a));
          entry.errorCount += s.weakAyahs.length;
        }
      }
    });

    const result = Array.from(map.entries()).map(([surahNumber, data]) => ({
      surahNumber,
      surahNameAr: data.surahNameAr,
      weakAyahs: Array.from(data.ayahs).sort((a, b) => a - b),
      totalMistakes: data.errorCount,
    }));

    // Prioritize by highest mistakes
    return result.sort((a, b) => b.totalMistakes - a.totalMistakes);
  },
};
