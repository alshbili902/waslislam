export type KhatmahPreset = '7_days' | '15_days' | '30_days' | '60_days' | '90_days' | 'custom';

export interface KhatmahPlan {
  id: string;
  userId?: string;
  name: string;
  presetType: KhatmahPreset;
  startDate: string; // YYYY-MM-DD
  targetDate: string; // YYYY-MM-DD
  durationDays: number;
  totalPages: number; // 604
  totalJuz: number; // 30
  currentPage: number; // 1-604
  completedPages: number; // Count of completed pages
  dailyPagesTarget: number;
  status: 'active' | 'completed' | 'paused';
  readingStreakDays: number;
  lastReadDate?: string;
  lastSurahNumber: number;
  lastSurahNameAr: string;
  lastAyahNumber: number;
  completedPageNumbers: number[];
  createdAt: string;
  updatedAt: string;
}

export type HifzStatus = 'memorized' | 'in_progress' | 'needs_review';

export interface HifzProgress {
  id: string;
  userId?: string;
  surahNumber: number;
  surahNameAr: string;
  startAyah: number;
  endAyah: number;
  status: HifzStatus;
  progressPercentage: number;
  lastReviewedAt?: string;
  totalSessions: number;
  averageAccuracy: number;
  weakAyahs: number[];
  lastAttemptAccuracy?: number;
  createdAt: string;
  updatedAt: string;
}

export type RecitationMode = 'read_with_text' | 'recite_text_visible' | 'recite_text_hidden';

export type WordRecitationStatus =
  | 'correct'
  | 'incorrect'
  | 'missing'
  | 'extra'
  | 'repeated'
  | 'unclear'
  | 'waiting'
  | 'current';

export type WordErrorType =
  | 'deletion' // حذف كلمة
  | 'insertion' // إضافة كلمة
  | 'substitution' // استبدال كلمة
  | 'repetition' // تكرار كلمة
  | 'unclear' // نطق غير واضح
  | 'long_pause'; // توقف طويل

export interface HifzWordResult {
  expectedWord: string;
  normalizedExpected: string;
  recognizedWord?: string;
  normalizedRecognized?: string;
  status: WordRecitationStatus;
  confidence: number;
  errorType?: WordErrorType;
  arabicErrorLabel?: string;
  wordIndex: number;
}

export interface HifzAyahResult {
  ayahNumber: number;
  numberInSurah: number;
  originalText: string;
  words: HifzWordResult[];
  accuracy: number;
  correctWords: number;
  incorrectWords: number;
  missingWords: number;
  extraWords: number;
  confidence: number;
  isCompleted: boolean;
}

export interface HifzSession {
  id: string;
  userId?: string;
  surahNumber: number;
  surahNameAr: string;
  startAyah: number;
  endAyah: number;
  mode: RecitationMode;
  accuracy: number;
  durationSeconds: number;
  totalAyahs: number;
  totalWords: number;
  correctWordsCount: number;
  incorrectWordsCount: number;
  missingWordsCount: number;
  extraWordsCount: number;
  weakAyahs: number[];
  ayahResults: HifzAyahResult[];
  createdAt: string;
}

export interface SpeechCapabilities {
  isSupported: boolean;
  hasMicrophonePermission: boolean;
  permissionState: 'prompt' | 'granted' | 'denied' | 'unsupported';
  isContinuousSupported: boolean;
  supportedBrowsersNotice: string;
}
