/**
 * Types and interfaces for the "Daily Wird" (ورد اليوم) feature.
 */

export type WirdItemType = 'quran' | 'dhikr' | 'hadith' | 'dua' | 'tasbih' | 'wisdom';

export interface QuranWirdData {
  surahNumber: number;
  surahNameAr: string;
  startAyah: number;
  endAyah: number;
  ayahText: string;
  juzNumber: number;
  pageNumber: number;
  tafsirShort?: string;
  audioUrl?: string;
}

export interface DhikrWirdData {
  dhikrId: string;
  categorySlug: string;
  categoryNameAr: string;
  textAr: string;
  sourceAr: string;
  benefitAr?: string;
  repeatTarget: number;
}

export interface HadithWirdData {
  hadithId: string;
  collectionAr: string;
  bookAr?: string;
  hadithNumber?: string;
  narratorAr: string;
  textAr: string;
  explanationAr?: string;
  gradingAr: string;
}

export interface DuaWirdData {
  duaId: string;
  titleAr: string;
  textAr: string;
  sourceAr: string;
  benefitAr?: string;
}

export interface TasbihWirdData {
  phraseAr: string;
  targetCount: number;
  virtueAr?: string;
}

export interface WisdomWirdData {
  wisdomId: string;
  contentType: string; // e.g. "حكمة", "موعظة", "تذكير", "فائدة إيمانية"
  content: string;
  author?: string;
  source: string;
  reference?: string;
  category: string;
}

export interface DailyWirdItem {
  id: string;
  type: WirdItemType;
  titleAr: string;
  subtitleAr?: string;
  sortOrder: number;
  targetCount: number;
  isVerified: boolean;
  sourceReference: string;
  // Specific data payloads based on type
  quranData?: QuranWirdData;
  dhikrData?: DhikrWirdData;
  hadithData?: HadithWirdData;
  duaData?: DuaWirdData;
  tasbihData?: TasbihWirdData;
  wisdomData?: WisdomWirdData;
}

export interface DailyWird {
  id: string;
  date: string; // YYYY-MM-DD (Saudi timezone canonical)
  title: string; // e.g. "ورد اليوم" or "ورد يوم الجمعة" or "ورد رمضان"
  subtitle: string; // e.g. "خذ من يومك دقائق تقرّبك إلى الله"
  hijriDate: string; // e.g. "٢١ ربيع الأول ١٤٤٨ هـ"
  status: 'published' | 'draft' | 'archived';
  isFriday: boolean;
  isRamadan: boolean;
  items: DailyWirdItem[];
  createdFrom: 'admin_scheduled' | 'deterministic_verified';
  createdAt?: string;
  updatedAt?: string;
}

export interface WirdItemProgress {
  itemId: string;
  type: WirdItemType;
  completed: boolean;
  currentCount: number;
  targetCount: number;
  completedAt?: string;
}

export interface DailyWirdUserProgress {
  wirdId: string;
  wirdDate: string;
  userId?: string;
  completedItemsCount: number;
  totalItemsCount: number;
  completionPercentage: number;
  isFullyCompleted: boolean;
  completedAt?: string;
  itemProgress: Record<string, WirdItemProgress>;
}

export interface AdminWirdFormState {
  date: string;
  title: string;
  subtitle: string;
  status: 'published' | 'draft';
  // Quran selection
  quranSurahNumber: number;
  quranStartAyah: number;
  quranEndAyah: number;
  // Dhikr selection
  dhikrId: string;
  // Hadith selection
  hadithId: string;
  // Dua selection
  duaId: string;
  // Tasbih
  tasbihPhrase: string;
  tasbihTarget: number;
}
