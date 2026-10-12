import { localStore } from '../lib/supabase.ts';

export interface PersonalizationPreferences {
  defaultTab: string;
  showRamadanCountdown: boolean;
  showPrayerTimesWidget: boolean;
  showDailyHadith: boolean;
  showDailyDhikr: boolean;
  showKhatmahBanner: boolean;
  quranFontSize: number; // 20 to 38
  quranLineHeight: number; // 1.6 to 2.4
  quranFontFamily: 'amiri' | 'scheherazade' | 'cairo' | 'tajawal';
  preferredReciterId: string;
  reducedMotion: boolean;
  highContrast: boolean;
}

export const DEFAULT_PREFERENCES: PersonalizationPreferences = {
  defaultTab: 'home',
  showRamadanCountdown: true,
  showPrayerTimesWidget: true,
  showDailyHadith: true,
  showDailyDhikr: true,
  showKhatmahBanner: true,
  quranFontSize: 26,
  quranLineHeight: 2.0,
  quranFontFamily: 'amiri',
  preferredReciterId: 'alafasy',
  reducedMotion: false,
  highContrast: false
};

const STORAGE_KEY = 'wasl_personalization_prefs_v2';

export const personalizationManager = {
  getPreferences(): PersonalizationPreferences {
    return localStore.get<PersonalizationPreferences>(STORAGE_KEY, DEFAULT_PREFERENCES);
  },
  savePreferences(prefs: PersonalizationPreferences): void {
    localStore.set(STORAGE_KEY, prefs);
    if (typeof document !== 'undefined') {
      if (prefs.reducedMotion) {
        document.documentElement.classList.add('reduce-motion');
      } else {
        document.documentElement.classList.remove('reduce-motion');
      }
    }
  },
  resetPreferences(): PersonalizationPreferences {
    localStore.set(STORAGE_KEY, DEFAULT_PREFERENCES);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('reduce-motion');
    }
    return DEFAULT_PREFERENCES;
  }
};
