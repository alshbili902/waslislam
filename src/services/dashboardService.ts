import { supabase, isSupabaseConfigured, localStore } from './supabase';
import {
  UserProfile,
  UserDailyWird,
  UserAzkarProgress,
  UserActivityItem,
  UserSettings,
  UserStreak,
  QuranProgressData,
  UserFavorite,
  NotificationItem,
  QuranBookmark,
} from '../types';

export interface DashboardSummary {
  profile: UserProfile | null;
  quranProgress: QuranProgressData | null;
  dailyWird: UserDailyWird | null;
  azkarProgress: UserAzkarProgress[];
  recentActivity: UserActivityItem[];
  favorites: UserFavorite[];
  bookmarks: QuranBookmark[];
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  streak: UserStreak;
  settings: UserSettings | null;
  tasbeehStats: {
    todayCount: number;
    totalCount: number;
    todaySessions: number;
  };
}

export const dashboardService = {
  // 1. Profile
  async getProfile(userId: string): Promise<UserProfile | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (!error && data) {
          return {
            id: data.id,
            username: data.username || '',
            usernameNormalized: data.username_normalized || '',
            email: data.email || undefined,
            fullName: data.full_name || '',
            avatarUrl: data.avatar_url || '',
            bio: data.bio || '',
            city: data.city || '',
            country: data.country || '',
            preferredReciter: data.preferred_reciter || 'ar.alafasy',
            prayerCalculationMethod: data.prayer_calculation_method || 'UmmAlQura',
            role: (data.role as any) || 'user',
            createdAt: data.created_at || new Date().toISOString(),
            lastLoginAt: data.last_login_at,
            khatmahProgress: 0,
            totalAyahsRead: 0,
            totalTasbihCount: 0,
          };
        }
      } catch (e) {
        console.warn('dashboardService.getProfile error:', e);
      }
    }
    return localStore.get<UserProfile | null>(`profile_${userId}`, null);
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: updates.fullName,
            avatar_url: updates.avatarUrl,
            bio: updates.bio,
            city: updates.city,
            country: updates.country,
            preferred_reciter: updates.preferredReciter,
            prayer_calculation_method: updates.prayerCalculationMethod,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (!error) {
          await this.recordActivity(userId, 'search', 'تحديث بيانات الملف الشخصي', 'تم تحديث الإعدادات الشخصية بنجاح');
          return true;
        }
      } catch (e) {
        console.warn('dashboardService.updateProfile error:', e);
      }
    }
    return false;
  },

  // 2. Quran Progress
  async getQuranProgress(userId: string): Promise<QuranProgressData | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('quran_progress')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (!error && data) {
          return {
            lastSurahNumber: data.last_surah_number || 1,
            lastAyahNumber: data.last_ayah_number || 1,
            lastPageNumber: data.last_page_number || 1,
            totalVersesRead: data.total_verses_read || 0,
            completedKhatmahs: data.completed_khatmahs || 0,
            readingStreakDays: data.reading_streak_days || 0,
            lastReadAt: data.last_read_at || data.created_at || new Date().toISOString(),
          };
        }
      } catch (e) {
        console.warn('dashboardService.getQuranProgress error:', e);
      }
    }
    return localStore.get<QuranProgressData | null>(`quran_progress_${userId}`, null);
  },

  async updateQuranProgress(
    userId: string,
    surahNumber: number,
    ayahNumber: number,
    pageNumber = 1,
    surahNameAr = ''
  ): Promise<void> {
    const now = new Date().toISOString();
    if (isSupabaseConfigured && supabase) {
      try {
        const current = await this.getQuranProgress(userId);
        const { error } = await supabase
          .from('quran_progress')
          .upsert({
            user_id: userId,
            last_surah_number: surahNumber,
            last_ayah_number: ayahNumber,
            last_page_number: pageNumber,
            total_verses_read: (current?.totalVersesRead || 0) + 1,
            last_read_at: now,
            updated_at: now,
          });

        if (!error) {
          // Record activity
          await this.recordActivity(
            userId,
            'quran_read',
            `قراءة سورة ${surahNameAr || surahNumber}`,
            `الآية رقم ${ayahNumber} • صفحة ${pageNumber}`,
            { surahNumber, ayahNumber, pageNumber }
          );

          // Update daily wird quran status
          await this.updateDailyWird(userId, { quranCompleted: true, quranPagesRead: pageNumber });
        }
      } catch (e) {
        console.warn('dashboardService.updateQuranProgress error:', e);
      }
    }
  },

  // 3. Daily Wird
  async getDailyWird(userId: string, dateStr?: string): Promise<UserDailyWird> {
    const today = dateStr || new Date().toISOString().split('T')[0];
    const fallback: UserDailyWird = {
      id: `wird_${today}`,
      userId,
      wirdDate: today,
      quranCompleted: false,
      quranPagesRead: 0,
      morningAzkarCompleted: false,
      eveningAzkarCompleted: false,
      hadithRead: false,
      duaRead: false,
      tasbeehCompleted: false,
      tasbeehCount: 0,
      completionPercentage: 0,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        let { data, error } = await supabase
          .from('user_daily_wird')
          .select('*')
          .eq('user_id', userId)
          .eq('wird_date', today)
          .maybeSingle();

        // If no record exists for today, create one
        if (!error && !data) {
          const insertRes = await supabase
            .from('user_daily_wird')
            .insert({ user_id: userId, wird_date: today })
            .select()
            .single();
          data = insertRes.data;
        }

        if (data) {
          return {
            id: data.id,
            userId: data.user_id,
            wirdDate: data.wird_date,
            quranCompleted: Boolean(data.quran_completed),
            quranPagesRead: data.quran_pages_read || 0,
            morningAzkarCompleted: Boolean(data.morning_azkar_completed),
            eveningAzkarCompleted: Boolean(data.evening_azkar_completed),
            hadithRead: Boolean(data.hadith_read),
            duaRead: Boolean(data.dua_read),
            tasbeehCompleted: Boolean(data.tasbeeh_completed),
            tasbeehCount: data.tasbeeh_count || 0,
            completionPercentage: data.completion_percentage || 0,
            updatedAt: data.updated_at,
          };
        }
      } catch (e) {
        console.warn('dashboardService.getDailyWird error:', e);
      }
    }

    return localStore.get<UserDailyWird>(`wird_${userId}_${today}`, fallback);
  },

  async updateDailyWird(userId: string, fields: Partial<UserDailyWird>): Promise<UserDailyWird> {
    const today = fields.wirdDate || new Date().toISOString().split('T')[0];
    if (isSupabaseConfigured && supabase) {
      try {
        const updatePayload: any = {};
        if (fields.quranCompleted !== undefined) updatePayload.quran_completed = fields.quranCompleted;
        if (fields.quranPagesRead !== undefined) updatePayload.quran_pages_read = fields.quranPagesRead;
        if (fields.morningAzkarCompleted !== undefined) updatePayload.morning_azkar_completed = fields.morningAzkarCompleted;
        if (fields.eveningAzkarCompleted !== undefined) updatePayload.evening_azkar_completed = fields.eveningAzkarCompleted;
        if (fields.hadithRead !== undefined) updatePayload.hadith_read = fields.hadithRead;
        if (fields.duaRead !== undefined) updatePayload.dua_read = fields.duaRead;
        if (fields.tasbeehCompleted !== undefined) updatePayload.tasbeeh_completed = fields.tasbeehCompleted;
        if (fields.tasbeehCount !== undefined) updatePayload.tasbeeh_count = fields.tasbeehCount;

        const { data, error } = await supabase
          .from('user_daily_wird')
          .upsert({
            user_id: userId,
            wird_date: today,
            ...updatePayload,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (!error && data) {
          // Check streak on any completion
          await this.touchStreak(userId);

          return {
            id: data.id,
            userId: data.user_id,
            wirdDate: data.wird_date,
            quranCompleted: Boolean(data.quran_completed),
            quranPagesRead: data.quran_pages_read || 0,
            morningAzkarCompleted: Boolean(data.morning_azkar_completed),
            eveningAzkarCompleted: Boolean(data.evening_azkar_completed),
            hadithRead: Boolean(data.hadith_read),
            duaRead: Boolean(data.dua_read),
            tasbeehCompleted: Boolean(data.tasbeeh_completed),
            tasbeehCount: data.tasbeeh_count || 0,
            completionPercentage: data.completion_percentage || 0,
          };
        }
      } catch (e) {
        console.warn('dashboardService.updateDailyWird error:', e);
      }
    }
    return this.getDailyWird(userId, today);
  },

  // 4. Azkar Progress
  async getAzkarProgress(userId: string, dateStr?: string): Promise<UserAzkarProgress[]> {
    const today = dateStr || new Date().toISOString().split('T')[0];
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('user_azkar_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('progress_date', today);

        if (!error && data) {
          return data.map((d: any) => ({
            id: d.id,
            userId: d.user_id,
            categorySlug: d.category_slug,
            progressDate: d.progress_date,
            completedCount: d.completed_count || 0,
            totalCount: d.total_count || 0,
            isCompleted: Boolean(d.is_completed),
          }));
        }
      } catch (e) {
        console.warn('dashboardService.getAzkarProgress error:', e);
      }
    }
    return [];
  },

  async updateAzkarProgress(
    userId: string,
    categorySlug: string,
    completedCount: number,
    totalCount: number,
    isCompleted: boolean
  ): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('user_azkar_progress').upsert({
          user_id: userId,
          category_slug: categorySlug,
          progress_date: today,
          completed_count: completedCount,
          total_count: totalCount,
          is_completed: isCompleted,
          updated_at: new Date().toISOString(),
        });

        // If completed, update daily wird
        if (isCompleted) {
          if (categorySlug === 'morning') {
            await this.updateDailyWird(userId, { morningAzkarCompleted: true });
            await this.recordActivity(userId, 'dhikr_done', 'إتمام أذكار الصباح', 'حفظك الله وبارك في يومك');
          } else if (categorySlug === 'evening') {
            await this.updateDailyWird(userId, { eveningAzkarCompleted: true });
            await this.recordActivity(userId, 'dhikr_done', 'إتمام أذكار المساء', 'أمسينا وأمسى الملك لله');
          }
        }
      } catch (e) {
        console.warn('dashboardService.updateAzkarProgress error:', e);
      }
    }
  },

  // 5. Favorites
  async getFavorites(userId: string, itemType?: string): Promise<UserFavorite[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase
          .from('favorites')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (itemType) {
          query = query.eq('item_type', itemType);
        }

        const { data, error } = await query;
        if (!error && data) {
          return data.map((f: any) => ({
            id: f.id,
            type: f.item_type,
            referenceId: f.item_id,
            title: f.title,
            subtitle: f.subtitle || f.source_reference,
            contentSnippet: f.preview_text,
            timestamp: new Date(f.created_at).getTime(),
          }));
        }
      } catch (e) {
        console.warn('dashboardService.getFavorites error:', e);
      }
    }
    return localStore.get<UserFavorite[]>(`favorites_${userId}`, []);
  },

  async addFavorite(userId: string, item: Omit<UserFavorite, 'id' | 'timestamp'>): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('favorites').upsert({
          user_id: userId,
          item_type: item.type,
          item_id: item.referenceId,
          title: item.title,
          subtitle: item.subtitle,
          preview_text: item.contentSnippet,
          source_reference: item.subtitle,
          created_at: new Date().toISOString(),
        });

        if (!error) {
          await this.recordActivity(userId, 'favorite_add', `إضافة إلى المفضلة: ${item.title}`, item.subtitle);
          return true;
        }
      } catch (e) {
        console.warn('dashboardService.addFavorite error:', e);
      }
    }
    return false;
  },

  async removeFavorite(userId: string, type: string, referenceId: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('item_type', type)
          .eq('item_id', referenceId);

        return !error;
      } catch (e) {
        console.warn('dashboardService.removeFavorite error:', e);
      }
    }
    return false;
  },

  // 6. Bookmarks
  async getBookmarks(userId: string): Promise<QuranBookmark[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('quran_bookmarks')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map((b: any) => ({
            id: b.id,
            surahNumber: b.surah_number,
            surahNameAr: b.surah_name_ar,
            ayahNumber: b.ayah_number,
            note: b.note,
            timestamp: new Date(b.created_at).getTime(),
          }));
        }
      } catch (e) {
        console.warn('dashboardService.getBookmarks error:', e);
      }
    }
    return localStore.get<QuranBookmark[]>(`bookmarks_${userId}`, []);
  },

  async addBookmark(userId: string, surahNumber: number, surahNameAr: string, ayahNumber: number, note?: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('quran_bookmarks').insert({
          user_id: userId,
          surah_number: surahNumber,
          surah_name_ar: surahNameAr,
          ayah_number: ayahNumber,
          note: note || '',
        });
        if (!error) {
          await this.recordActivity(userId, 'quran_read', `حفظ علامة مرجعية: سورة ${surahNameAr}`, `الآية ${ayahNumber}`);
          return true;
        }
      } catch (e) {
        console.warn('dashboardService.addBookmark error:', e);
      }
    }
    return false;
  },

  async removeBookmark(userId: string, bookmarkId: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('quran_bookmarks')
          .delete()
          .eq('id', bookmarkId)
          .eq('user_id', userId);
        return !error;
      } catch (e) {
        console.warn('dashboardService.removeBookmark error:', e);
      }
    }
    return false;
  },

  // 7. Recent Activity
  async getRecentActivity(userId: string, limit = 10): Promise<UserActivityItem[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('user_activity')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (!error && data) {
          return data.map((a: any) => ({
            id: a.id,
            userId: a.user_id,
            activityType: a.activity_type,
            titleAr: a.title_ar,
            detailsAr: a.details_ar,
            metadata: a.metadata,
            createdAt: a.created_at,
          }));
        }
      } catch (e) {
        console.warn('dashboardService.getRecentActivity error:', e);
      }
    }
    return [];
  },

  async recordActivity(
    userId: string,
    activityType: UserActivityItem['activityType'],
    titleAr: string,
    detailsAr?: string,
    metadata = {}
  ): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('user_activity').insert({
          user_id: userId,
          activity_type: activityType,
          title_ar: titleAr,
          details_ar: detailsAr || '',
          metadata,
          created_at: new Date().toISOString(),
        });
        await this.touchStreak(userId);
      } catch (e) {
        console.warn('dashboardService.recordActivity error:', e);
      }
    }
  },

  // 8. Notifications
  async getNotifications(userId: string): Promise<NotificationItem[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(20);

        if (!error && data) {
          return data.map((n: any) => ({
            id: n.id,
            titleAr: n.title_ar,
            messageAr: n.message_ar,
            type: n.type || 'general',
            time: n.created_at,
            read: Boolean(n.is_read),
          }));
        }
      } catch (e) {
        console.warn('dashboardService.getNotifications error:', e);
      }
    }
    return [];
  },

  async markNotificationAsRead(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      } catch (e) {
        console.warn('dashboardService.markNotificationAsRead error:', e);
      }
    }
  },

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);
      } catch (e) {
        console.warn('dashboardService.markAllNotificationsAsRead error:', e);
      }
    }
  },

  async deleteNotification(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('notifications').delete().eq('id', id);
      } catch (e) {
        console.warn('dashboardService.deleteNotification error:', e);
      }
    }
  },

  // 9. Tasbeeh Statistics
  async getTasbeehStats(userId: string): Promise<{ todayCount: number; totalCount: number; todaySessions: number }> {
    const today = new Date().toISOString().split('T')[0];
    let todayCount = 0;
    let totalCount = 0;
    let todaySessions = 0;

    if (isSupabaseConfigured && supabase) {
      try {
        // Today sessions
        const { data: todayData } = await supabase
          .from('tasbeeh_sessions')
          .select('count')
          .eq('user_id', userId)
          .eq('session_date', today);

        if (todayData) {
          todaySessions = todayData.length;
          todayCount = todayData.reduce((acc, curr) => acc + (curr.count || 0), 0);
        }

        // All-time sum
        const { data: allData } = await supabase
          .from('tasbeeh_sessions')
          .select('count')
          .eq('user_id', userId);

        if (allData) {
          totalCount = allData.reduce((acc, curr) => acc + (curr.count || 0), 0);
        }
      } catch (e) {
        console.warn('dashboardService.getTasbeehStats error:', e);
      }
    }
    return { todayCount, totalCount, todaySessions };
  },

  async recordTasbeehSession(userId: string, dhikrTextAr: string, count: number, targetCount = 33): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('tasbeeh_sessions').insert({
          user_id: userId,
          dhikr_text_ar: dhikrTextAr,
          count,
          target_count: targetCount,
          completed: count >= targetCount,
          session_date: today,
        });

        // Update daily wird tasbeeh
        const wird = await this.getDailyWird(userId, today);
        const newCount = (wird.tasbeehCount || 0) + count;
        await this.updateDailyWird(userId, {
          tasbeehCount: newCount,
          tasbeehCompleted: newCount >= 33,
        });

        await this.recordActivity(userId, 'tasbeeh_done', `جلسة تسبيح: ${dhikrTextAr}`, `عدد التسبيحات: ${count}`);
      } catch (e) {
        console.warn('dashboardService.recordTasbeehSession error:', e);
      }
    }
  },

  // 10. Streaks
  async getUserStreak(userId: string): Promise<UserStreak> {
    const fallback: UserStreak = {
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: '',
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('streaks')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (!error && data) {
          return {
            currentStreak: data.current_streak ?? 0,
            longestStreak: data.longest_streak ?? 0,
            lastActivityDate: data.last_activity_date || '',
          };
        }
      } catch (e) {
        console.warn('dashboardService.getUserStreak error:', e);
      }
    }
    return fallback;
  },

  async touchStreak(userId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        const today = new Date().toISOString().split('T')[0];
        const current = await this.getUserStreak(userId);

        if (current.lastActivityDate === today) {
          return; // Already counted today
        }

        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        let newStreak = 1;
        if (current.lastActivityDate === yesterday) {
          newStreak = current.currentStreak + 1;
        }

        const newLongest = Math.max(current.longestStreak, newStreak);

        await supabase.from('streaks').upsert({
          user_id: userId,
          current_streak: newStreak,
          longest_streak: newLongest,
          last_activity_date: today,
          updated_at: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('dashboardService.touchStreak error:', e);
      }
    }
  },

  // 11. Settings
  async getUserSettings(userId: string): Promise<UserSettings> {
    const fallback: UserSettings = {
      id: `set_${userId}`,
      userId,
      theme: 'system',
      preferredReciter: 'ar.alafasy',
      prayerCalculationMethod: 'UmmAlQura',
      quranFontSize: 'medium',
      mushafType: 'hafs',
      audioBitrate: '128kbps',
      autoPlayAudio: true,
      privacyProfilePublic: false,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (!error && data) {
          return {
            id: data.id,
            userId: data.user_id,
            theme: data.theme || 'system',
            preferredReciter: data.preferred_reciter || 'ar.alafasy',
            prayerCalculationMethod: data.prayer_calculation_method || 'UmmAlQura',
            quranFontSize: data.quran_font_size || 'medium',
            mushafType: data.mushaf_type || 'hafs',
            audioBitrate: data.audio_bitrate || '128kbps',
            autoPlayAudio: Boolean(data.auto_play_audio),
            privacyProfilePublic: Boolean(data.privacy_profile_public),
          };
        }
      } catch (e) {
        console.warn('dashboardService.getUserSettings error:', e);
      }
    }
    return fallback;
  },

  async updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        const payload: any = { updated_at: new Date().toISOString() };
        if (settings.theme) payload.theme = settings.theme;
        if (settings.preferredReciter) payload.preferred_reciter = settings.preferredReciter;
        if (settings.prayerCalculationMethod) payload.prayer_calculation_method = settings.prayerCalculationMethod;
        if (settings.quranFontSize) payload.quran_font_size = settings.quranFontSize;
        if (settings.mushafType) payload.mushaf_type = settings.mushafType;
        if (settings.audioBitrate) payload.audio_bitrate = settings.audioBitrate;
        if (settings.autoPlayAudio !== undefined) payload.auto_play_audio = settings.autoPlayAudio;
        if (settings.privacyProfilePublic !== undefined) payload.privacy_profile_public = settings.privacyProfilePublic;

        const { error } = await supabase
          .from('user_settings')
          .upsert({ user_id: userId, ...payload });

        return !error;
      } catch (e) {
        console.warn('dashboardService.updateUserSettings error:', e);
      }
    }
    return false;
  },

  // 12. Complete Dashboard Summary Fetcher
  async getDashboardSummary(userId: string): Promise<DashboardSummary> {
    const today = new Date().toISOString().split('T')[0];

    const [
      profile,
      quranProgress,
      dailyWird,
      azkarProgress,
      recentActivity,
      favorites,
      bookmarks,
      notifications,
      streak,
      settings,
      tasbeehStats,
    ] = await Promise.all([
      this.getProfile(userId),
      this.getQuranProgress(userId),
      this.getDailyWird(userId, today),
      this.getAzkarProgress(userId, today),
      this.getRecentActivity(userId, 8),
      this.getFavorites(userId),
      this.getBookmarks(userId),
      this.getNotifications(userId),
      this.getUserStreak(userId),
      this.getUserSettings(userId),
      this.getTasbeehStats(userId),
    ]);

    const unreadNotificationCount = notifications.filter((n) => !n.read).length;

    return {
      profile,
      quranProgress,
      dailyWird,
      azkarProgress,
      recentActivity,
      favorites,
      bookmarks,
      notifications,
      unreadNotificationCount,
      streak,
      settings,
      tasbeehStats,
    };
  },
};
