export interface ReadingPreferences {
  fontSize: number; // 18 to 36
  fontFamily: 'amiri' | 'tajawal' | 'system';
  lineHeight: 'normal' | 'relaxed' | 'loose';
  contentWidth: 'compact' | 'standard' | 'full';
  distractionFree: boolean;
}

export const DEFAULT_READING_PREFS: ReadingPreferences = {
  fontSize: 24,
  fontFamily: 'amiri',
  lineHeight: 'relaxed',
  contentWidth: 'standard',
  distractionFree: false,
};
