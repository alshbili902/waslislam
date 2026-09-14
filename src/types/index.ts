export interface SurahMeta {
  number: number;
  name: string; // Arabic e.g. "الفَاتِحَة"
  englishName: string; // "Al-Faatiha"
  englishNameTranslation: string; // "The Opening"
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
  revelationTypeAr: string; // "مكية" | "مدنية"
  page: number;
  juz: number;
}

export interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean;
  audio?: string;
  tafsir?: string;
}

export interface Reciter {
  id: string;
  nameAr: string;
  nameEn: string;
  subfolder: string;
  bitrate?: string;
}

export interface TafsirSource {
  id: string;
  nameAr: string;
  authorAr: string;
}

export interface AzkarCategory {
  id: string;
  slug: string;
  nameAr: string;
  descriptionAr: string;
  icon: string;
  count?: number;
}

export interface DhikrItem {
  id: string;
  categoryId: string;
  textAr: string;
  sourceAr: string;
  benefitAr?: string;
  repeatCount: number;
  audioUrl?: string;
}

export interface HadithItem {
  id: string;
  collectionAr: string;
  bookAr?: string;
  hadithNumber?: string;
  narratorAr: string;
  textAr: string;
  explanationAr?: string;
  gradingAr: string;
  topicAr: string;
}

export interface DuaCategory {
  id: string;
  slug: string;
  nameAr: string;
  icon: string;
}

export interface DuaItem {
  id: string;
  categoryId: string;
  titleAr: string;
  textAr: string;
  sourceAr: string;
  benefitAr?: string;
}

export interface PrayerTimesData {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  imsak?: string;
  midnight?: string;
  dateGregorian: string;
  dateHijri: {
    day: string;
    monthAr: string;
    monthEn: string;
    year: string;
    weekdayAr: string;
  };
  locationName: string;
}

export interface NextPrayerInfo {
  currentPrayerAr: string;
  nextPrayerAr: string;
  nextPrayerTime: string;
  minutesRemaining: number;
  formattedCountdown: string;
  progressPercent: number;
}

export interface QiblaInfo {
  directionDegrees: number;
  compassBearing: number;
  distanceKm: number;
  kaabaLat: number;
  kaabaLng: number;
}

export interface TasbihPreset {
  id: string;
  textAr: string;
  transliteration?: string;
  targetCount: number;
  fadhilAr?: string;
}

export interface TasbihSession {
  id: string;
  dhikrTextAr: string;
  count: number;
  target: number;
  completed: boolean;
  timestamp: number;
}

export interface FatwaItem {
  id: string;
  titleAr: string;
  questionAr: string;
  answerAr: string;
  scholarOrBodyAr: string;
  sourceReference: string;
  categoryAr: string;
  viewsCount?: number;
  date?: string;
}

export interface ArticleItem {
  id: string;
  slug: string;
  titleAr: string;
  excerptAr: string;
  contentAr: string;
  authorAr: string;
  categoryAr: string;
  readTimeMinutes: number;
  publishedAt: string;
}

export interface IslamicEvent {
  id: string;
  titleAr: string;
  hijriDay: number;
  hijriMonth: number;
  monthNameAr: string;
  descriptionAr: string;
}

export interface QuranBookmark {
  id: string;
  surahNumber: number;
  surahNameAr: string;
  ayahNumber: number;
  note?: string;
  timestamp: number;
}

export interface UserFavorite {
  id: string;
  type: 'ayah' | 'hadith' | 'azkar' | 'dua' | 'fatwa' | 'article' | 'wisdom' | 'allah_name' | 'seerah' | 'hajj_umrah' | 'library_book';
  referenceId: string;
  title: string;
  subtitle?: string;
  contentSnippet?: string;
  timestamp: number;
}

export interface NotificationItem {
  id: string;
  titleAr: string;
  messageAr: string;
  type: 'prayer' | 'azkar' | 'daily_ayah' | 'event';
  time: string;
  read: boolean;
}

export interface NotificationSettings {
  fajr: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
  morningAzkar: boolean;
  eveningAzkar: boolean;
  dailyHadith: boolean;
  dailyAyah: boolean;
  islamicEvents: boolean;
  dailyWird?: boolean;
  wirdReminderTime?: string;
  dailyWisdom?: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  usernameNormalized?: string;
  fullName: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
  city: string;
  country: string;
  preferredReciter?: string;
  prayerCalculationMethod?: string;
  role: 'super_admin' | 'admin' | 'editor' | 'user';
  createdAt: string;
  lastLoginAt?: string;
  khatmahProgress: number; // percentage
  totalAyahsRead: number;
  totalTasbihCount: number;
}

export interface AdminAnalytics {
  totalUsers: number;
  activeUsersToday: number;
  quranReads: number;
  hadithViews: number;
  azkarSessions: number;
  tasbihTaps: number;
  dailyActivity: { day: string; reads: number; azkar: number; tasbih: number }[];
  popularSurahs: { name: string; views: number }[];
}

export interface SearchResultItem {
  type: 'quran' | 'hadith' | 'azkar' | 'dua' | 'fatwa' | 'article' | 'radio' | 'reciter';
  typeLabelAr: string;
  title: string;
  snippet: string;
  link: string;
}

export type RadioStreamStatus = 'working' | 'stopped' | 'unavailable';

export interface RadioCategory {
  id: string;
  nameAr: string;
  slug: string;
  descriptionAr?: string;
  icon?: string;
  sortOrder: number;
}

export interface RadioReciter {
  id: string;
  nameAr: string;
  nameEn: string;
  bioAr: string;
  imageUrl: string;
  availableStationsCount?: number;
  isActive: boolean;
  sortOrder: number;
}

export interface RadioStation {
  id: string;
  name: string;
  description: string;
  streamUrl: string;
  logoUrl: string;
  categoryId: string;
  categoryNameAr?: string;
  reciterId?: string;
  reciterNameAr?: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  status: RadioStreamStatus;
  bitrate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserRadioFavorite {
  id: string;
  stationId: string;
  userId?: string;
  createdAt: string;
}

export interface UserRadioHistory {
  id: string;
  stationId: string;
  playedAt: string;
}

export interface UserDailyWird {
  id: string;
  userId: string;
  wirdDate: string;
  quranCompleted: boolean;
  quranPagesRead: number;
  morningAzkarCompleted: boolean;
  eveningAzkarCompleted: boolean;
  hadithRead: boolean;
  duaRead: boolean;
  tasbeehCompleted: boolean;
  tasbeehCount: number;
  completionPercentage: number;
  updatedAt?: string;
}

export interface UserAzkarProgress {
  id: string;
  userId: string;
  categorySlug: string;
  progressDate: string;
  completedCount: number;
  totalCount: number;
  isCompleted: boolean;
}

export interface UserActivityItem {
  id: string;
  userId: string;
  activityType: 'quran_read' | 'hadith_view' | 'dua_view' | 'dhikr_done' | 'radio_play' | 'tasbeeh_done' | 'search' | 'favorite_add';
  titleAr: string;
  detailsAr?: string;
  metadata?: any;
  createdAt: string;
}

export interface UserSettings {
  id: string;
  userId: string;
  theme: 'light' | 'dark' | 'system';
  preferredReciter: string;
  prayerCalculationMethod: string;
  quranFontSize: 'small' | 'medium' | 'large';
  mushafType: string;
  audioBitrate: string;
  autoPlayAudio: boolean;
  privacyProfilePublic: boolean;
}

export interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
}

export interface QuranProgressData {
  lastSurahNumber: number;
  lastAyahNumber: number;
  lastPageNumber: number;
  totalVersesRead: number;
  completedKhatmahs: number;
  readingStreakDays: number;
  lastReadAt: string;
}
export * from './donations';
export * from './binbaz';
export * from './wird';
export * from './wisdom';

// ==========================================
// 1. FASTING TYPES (صيامي)
// ==========================================
export type FastingType = 'ramadan' | 'monday' | 'thursday' | 'white_days' | 'ashura' | 'arafah' | 'shawwal' | 'qada' | 'nadr' | 'voluntary';
export type FastingStatus = 'completed' | 'planned' | 'missed';

export interface FastingRecord {
  id: string;
  user_id?: string;
  userId?: string;
  fasting_date: string; // YYYY-MM-DD
  gregorianDate?: string;
  hijri_date?: string;
  hijriYear?: number;
  hijriMonth?: number;
  hijriDay?: number;
  fasting_type: string;
  fastingType?: FastingType;
  status: 'completed' | 'planned' | 'missed';
  notes?: string;
  created_at?: string;
  createdAt?: string;
}

// ==========================================
// 2. NAMES OF ALLAH TYPES (أسماء الله الحسنى)
// ==========================================
export interface AllahNameItem {
  id: string;
  number: number;
  nameAr: string;
  nameEn?: string;
  meaningAr: string;
  explanationAr?: string;
  evidenceAr?: string;
  source: string;
  reference?: string;
  category?: string;
  verificationStatus: 'verified' | 'draft' | 'needs_review';
}

// ==========================================
// 3. PROPHETIC BIOGRAPHY TYPES (السيرة النبوية ﷺ)
// ==========================================
export interface SeerahEvent {
  id: string;
  era: 'pre_prophethood' | 'meccan_early' | 'meccan_public' | 'isra_miraj' | 'hijrah' | 'medinan_foundations' | 'major_battles' | 'fath_makkah' | 'farewell_passing';
  eraTitleAr: string;
  title: string;
  hijriYear?: string;
  gregorianYear?: string;
  location?: string;
  orderIndex: number;
  summary: string;
  content: string;
  evidence?: string;
  source: string;
  reference?: string;
  verificationStatus: 'verified' | 'draft' | 'needs_review';
}

// ==========================================
// 4. HAJJ & UMRAH TYPES (الحج والعمرة)
// ==========================================
export interface HajjUmrahStep {
  id: string;
  type: 'umrah' | 'hajj' | 'miqat' | 'manasik' | 'ruling' | 'dua';
  title: string;
  stepNumber?: number;
  dayNumber?: number; // for Hajj (8, 9, 10, 11-13)
  dayNameAr?: string;
  description: string;
  evidence?: string;
  ruling?: 'rukn' | 'wajib' | 'sunnah' | 'prohibition';
  notes?: string;
  checklistItem?: string;
  coordinates?: { lat: number; lng: number; nameAr: string };
  source: string;
  reference?: string;
  verificationStatus: 'verified' | 'draft' | 'needs_review';
}

// ==========================================
// 5. ISLAMIC LIBRARY TYPES (المكتبة الإسلامية)
// ==========================================
export interface LibraryChapter {
  id: string;
  title: string;
  content: string;
  orderIndex: number;
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  category: string;
  coverUrl?: string;
  description: string;
  publisher?: string;
  edition?: string;
  license: string;
  copyrightStatus: string;
  chapters: LibraryChapter[];
  source: string;
  verificationStatus: 'verified' | 'draft' | 'needs_review';
}

export interface LibraryBookProgress {
  bookId: string;
  chapterId?: string;
  scrollPosition?: number;
  completed?: boolean;
  lastReadAt: string;
}

// ==========================================
// 6. GLOBAL SEARCH TYPES (البحث الشامل)
// ==========================================
export type SearchDomain = 'quran' | 'hadith' | 'azkar' | 'dua' | 'wisdom' | 'allah_name' | 'seerah' | 'hajj_umrah' | 'library' | 'events';

export interface GlobalSearchResult {
  id: string;
  domain: SearchDomain;
  domainLabelAr: string;
  title: string;
  snippet: string;
  targetTab: string;
  targetId?: any;
  badge?: string;
  source?: string;
}

// ==========================================
// 7. DISCOVER FEED TYPES (اكتشف)
// ==========================================
export interface DiscoverFeedData {
  date: string;
  hijriDate: string;
  ayah: { text: string; surahName: string; ayahNumber: number; tafsir: string };
  hadith: { text: string; narrator: string; source: string; explanation?: string };
  dhikr: { text: string; source: string; benefit?: string };
  dua: { text: string; source: string };
  wisdom: { text: string; author?: string; source: string; category: string };
  allahName: AllahNameItem;
  seerahHighlight: SeerahEvent;
  libraryPick?: LibraryBook;
  featureHighlight: { title: string; desc: string; targetTab: string; icon: string };
}

