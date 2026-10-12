import { localStore } from '../lib/supabase.ts';
import { audioBookmarkManager, type AudioBookmark } from './audioBookmarkManager.ts';
import { familyModeManager } from './familyModeManager.ts';

export interface BackupMetadata {
  appName: 'Wasl Islamic';
  schemaVersion: 'wasl_backup_v2';
  exportedAt: string;
  appVersion: string;
  checksum: string;
  categories: string[];
}

export interface BackupPayload {
  preferences?: Record<string, any>;
  khatmahProgress?: {
    currentPage: number;
    plan: any;
  };
  savedAyahs?: any[];
  reflections?: any[];
  audioBookmarks?: AudioBookmark[];
  readingPrefs?: Record<string, any>;
  dailyTracker?: Record<string, any>;
  familyData?: any;
}

export interface WaslBackupFile {
  meta: BackupMetadata;
  data: BackupPayload;
}

export interface BackupValidationResult {
  valid: boolean;
  error?: string;
  preview?: {
    categories: string[];
    counts: Record<string, number>;
    exportedAt: string;
    schemaVersion: string;
  };
  backup?: WaslBackupFile;
}

// Simple checksum generator for validation
function computeChecksum(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `chk_${Math.abs(hash).toString(16)}`;
}

export const backupRestoreManager = {
  /**
   * Generates a sanitized, user-controlled backup file.
   * Strictly excludes:
   * - Admin tokens / passwords / API secrets.
   * - Unrelated users' records.
   */
  generateBackup(options: { includeFamily?: boolean } = {}): WaslBackupFile {
    const categories: string[] = [];
    const payload: BackupPayload = {};

    // 1. Preferences & Customization
    const prefs = localStore.get('wasl_custom_prefs_v1', null);
    if (prefs) {
      payload.preferences = prefs;
      categories.push('preferences');
    }

    // 2. Khatmah Progress
    const khatmahPage = localStore.get('khatmah_page', 1);
    const khatmahPlan = localStore.get('khatmah_plan', null);
    if (khatmahPlan || khatmahPage > 1) {
      payload.khatmahProgress = {
        currentPage: khatmahPage,
        plan: khatmahPlan
      };
      categories.push('khatmahProgress');
    }

    // 3. Saved Ayahs & Bookmarks
    const savedAyahs = localStore.get<any[]>('wasl_saved_ayahs_v1', []);
    if (savedAyahs.length > 0) {
      payload.savedAyahs = savedAyahs;
      categories.push('savedAyahs');
    }

    // 4. Quran Reflections Journal
    const reflections = localStore.get<any[]>('wasl_reflections_v1', []);
    if (reflections.length > 0) {
      payload.reflections = reflections;
      categories.push('reflections');
    }

    // 5. Audio Bookmarks
    const audioBookmarks = audioBookmarkManager.getBookmarks();
    if (audioBookmarks.length > 0) {
      payload.audioBookmarks = audioBookmarks;
      categories.push('audioBookmarks');
    }

    // 6. Reading & Focus Mode Preferences
    const readingPrefs = localStore.get('wasl_reading_prefs_v1', null);
    if (readingPrefs) {
      payload.readingPrefs = readingPrefs;
      categories.push('readingPrefs');
    }

    // 7. Daily Tracker
    const dailyTracker = localStore.get('wasl_daily_tracker_v1', null);
    if (dailyTracker) {
      payload.dailyTracker = dailyTracker;
      categories.push('dailyTracker');
    }

    // 8. Family Data (Only with explicit authorization)
    if (options.includeFamily) {
      payload.familyData = familyModeManager.getFamilyGroup();
      categories.push('familyData');
    }

    const jsonString = JSON.stringify(payload);
    const checksum = computeChecksum(jsonString);

    return {
      meta: {
        appName: 'Wasl Islamic',
        schemaVersion: 'wasl_backup_v2',
        exportedAt: new Date().toISOString(),
        appVersion: '2.0.0',
        checksum,
        categories
      },
      data: payload
    };
  },

  /**
   * Validates raw JSON content before importing.
   */
  validateBackup(jsonRaw: string): BackupValidationResult {
    try {
      if (!jsonRaw || typeof jsonRaw !== 'string') {
        return { valid: false, error: 'الملف فارغ أو غير صالح' };
      }

      // Check max size (limit to 10MB to prevent memory exhaustion)
      if (jsonRaw.length > 10 * 1024 * 1024) {
        return { valid: false, error: 'حجم ملف النسخة الاحتياطية يتجاوز الحد المسموح (10 ميجابايت)' };
      }

      const parsed = JSON.parse(jsonRaw);

      if (!parsed || typeof parsed !== 'object') {
        return { valid: false, error: 'صيغة الملف غير متوافقة مع ملفات وصل الاحتياطية' };
      }

      if (parsed.meta?.appName !== 'Wasl Islamic') {
        return { valid: false, error: 'الملف المحدد ليس نسخة احتياطية خاصة بتطبيق وصل الإسلامية' };
      }

      if (parsed.meta?.schemaVersion !== 'wasl_backup_v2' && parsed.meta?.schemaVersion !== 'wasl_backup_v1') {
        return { valid: false, error: `إصدار النسخة الاحتياطية (${parsed.meta?.schemaVersion || 'غير معروف'}) غير مدعوم` };
      }

      if (!parsed.data || typeof parsed.data !== 'object') {
        return { valid: false, error: 'محتوى النسخة الاحتياطية تالف أو مفقود' };
      }

      // Compute counts
      const counts: Record<string, number> = {
        savedAyahs: Array.isArray(parsed.data.savedAyahs) ? parsed.data.savedAyahs.length : 0,
        reflections: Array.isArray(parsed.data.reflections) ? parsed.data.reflections.length : 0,
        audioBookmarks: Array.isArray(parsed.data.audioBookmarks) ? parsed.data.audioBookmarks.length : 0,
        khatmahProgress: parsed.data.khatmahProgress ? 1 : 0,
        preferences: parsed.data.preferences ? 1 : 0,
        readingPrefs: parsed.data.readingPrefs ? 1 : 0,
        dailyTracker: parsed.data.dailyTracker ? 1 : 0,
        familyData: parsed.data.familyData ? 1 : 0
      };

      return {
        valid: true,
        preview: {
          categories: parsed.meta.categories || Object.keys(parsed.data),
          counts,
          exportedAt: parsed.meta.exportedAt || new Date().toISOString(),
          schemaVersion: parsed.meta.schemaVersion
        },
        backup: parsed as WaslBackupFile
      };
    } catch (e: any) {
      return { valid: false, error: `فشل فك تشفير الملف: ${e.message || 'خطأ تنسيق JSON'}` };
    }
  },

  /**
   * Restores data with safe merge or replace strategy.
   */
  restoreBackup(
    backup: WaslBackupFile, 
    mode: 'merge' | 'replace' = 'merge'
  ): { success: boolean; restoredCounts: Record<string, number>; message: string } {
    const data = backup.data;
    const restoredCounts: Record<string, number> = {
      savedAyahs: 0,
      reflections: 0,
      audioBookmarks: 0,
      preferences: 0,
      khatmahProgress: 0,
      readingPrefs: 0,
      familyData: 0
    };

    try {
      // 1. Saved Ayahs
      if (Array.isArray(data.savedAyahs)) {
        if (mode === 'replace') {
          localStore.set('wasl_saved_ayahs_v1', data.savedAyahs);
          restoredCounts.savedAyahs = data.savedAyahs.length;
        } else {
          const current = localStore.get<any[]>('wasl_saved_ayahs_v1', []);
          const mergedMap = new Map();
          current.forEach(item => mergedMap.set(item.id || `${item.surah}_${item.ayah}`, item));
          data.savedAyahs.forEach(item => mergedMap.set(item.id || `${item.surah}_${item.ayah}`, item));
          const merged = Array.from(mergedMap.values());
          localStore.set('wasl_saved_ayahs_v1', merged);
          restoredCounts.savedAyahs = merged.length;
        }
      }

      // 2. Reflections
      if (Array.isArray(data.reflections)) {
        if (mode === 'replace') {
          localStore.set('wasl_reflections_v1', data.reflections);
          restoredCounts.reflections = data.reflections.length;
        } else {
          const current = localStore.get<any[]>('wasl_reflections_v1', []);
          const mergedMap = new Map();
          current.forEach(item => mergedMap.set(item.id, item));
          data.reflections.forEach(item => mergedMap.set(item.id, item));
          const merged = Array.from(mergedMap.values());
          localStore.set('wasl_reflections_v1', merged);
          restoredCounts.reflections = merged.length;
        }
      }

      // 3. Audio Bookmarks
      if (Array.isArray(data.audioBookmarks)) {
        if (mode === 'replace') {
          localStore.set('wasl_audio_bookmarks_v1', data.audioBookmarks);
          restoredCounts.audioBookmarks = data.audioBookmarks.length;
        } else {
          const current = audioBookmarkManager.getBookmarks();
          const mergedMap = new Map();
          current.forEach(item => mergedMap.set(item.id, item));
          data.audioBookmarks.forEach(item => mergedMap.set(item.id, item));
          const merged = Array.from(mergedMap.values());
          localStore.set('wasl_audio_bookmarks_v1', merged);
          restoredCounts.audioBookmarks = merged.length;
        }
      }

      // 4. Preferences
      if (data.preferences) {
        if (mode === 'replace') {
          localStore.set('wasl_custom_prefs_v1', data.preferences);
        } else {
          const current = localStore.get('wasl_custom_prefs_v1', {});
          localStore.set('wasl_custom_prefs_v1', { ...current, ...data.preferences });
        }
        restoredCounts.preferences = 1;
      }

      // 5. Khatmah Progress
      if (data.khatmahProgress) {
        if (data.khatmahProgress.currentPage) {
          localStore.set('khatmah_page', data.khatmahProgress.currentPage);
        }
        if (data.khatmahProgress.plan) {
          localStore.set('khatmah_plan', data.khatmahProgress.plan);
        }
        restoredCounts.khatmahProgress = 1;
      }

      // 6. Reading Mode Prefs
      if (data.readingPrefs) {
        localStore.set('wasl_reading_prefs_v1', data.readingPrefs);
        restoredCounts.readingPrefs = 1;
      }

      // 7. Family Data (if contained)
      if (data.familyData) {
        familyModeManager.saveFamilyGroup(data.familyData);
        restoredCounts.familyData = 1;
      }

      return {
        success: true,
        restoredCounts,
        message: 'تمت استعادة البيانات بنجاح وبأعلى درجات الدقة'
      };
    } catch (e: any) {
      return {
        success: false,
        restoredCounts,
        message: `تعذر إتمام الاستعادة: ${e.message}`
      };
    }
  },

  /**
   * Helper to download JSON backup in browser with UTF-8 encoding.
   */
  downloadBackupFile(backup: WaslBackupFile): void {
    if (typeof window === 'undefined') return;
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `wasl_islamic_backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};
