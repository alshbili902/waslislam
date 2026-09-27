export type RevelationType = 'Meccan' | 'Medinan';
export type RevelationTypeAr = 'مكية' | 'مدنية';

export interface QuranAudioSurah {
  number: number;
  name: string; // Arabic with Tashkeel e.g. "الفَاتِحَة"
  nameWithoutTashkeel: string; // e.g. "الفاتحة"
  englishName: string; // e.g. "Al-Faatiha"
  englishNameTranslation: string; // e.g. "The Opening"
  numberOfAyahs: number;
  revelationType: RevelationType;
  revelationTypeAr: RevelationTypeAr;
  page: number;
  juz: number;
}

export interface QuranReciterMoshaf {
  id: number;
  nameAr: string; // e.g. "حفص عن عاصم - مرتل"
  riwayahName: string; // e.g. "حفص عن عاصم"
  serverUrl: string; // ending with /
  surahTotal: number;
  surahList: number[]; // e.g. [1, 2, ..., 114]
}

export interface QuranAudioReciter {
  id: string; // slug e.g. "alafasy", "abdulbasit-murattal"
  numericId: number;
  nameAr: string;
  nameEn: string;
  letter: string;
  photoUrl?: string;
  bioAr?: string;
  riwayah: string; // primary riwayah display name
  moshafList: QuranReciterMoshaf[];
  totalSurahs: number;
  isFeatured?: boolean;
  isActive: boolean;
}

export interface QuranPlaylistItem {
  surahNumber: number;
  surahName: string;
  surahNameEn: string;
  revelationTypeAr: RevelationTypeAr;
  numberOfAyahs: number;
  reciterId: string;
  reciterNumericId: number;
  reciterNameAr: string;
  riwayahName: string;
  moshafId: number;
  audioUrl: string;
  duration?: number;
}

export interface QuranAudioPlaybackState {
  surahNumber: number;
  reciterId: string;
  moshafId: number;
  positionSeconds: number;
  updatedAt: string;
}

export interface QuranAudioHistoryItem {
  id: string;
  surahNumber: number;
  surahNameAr: string;
  reciterId: string;
  reciterNameAr: string;
  riwayahName: string;
  audioUrl: string;
  positionSeconds: number;
  durationSeconds: number;
  playedAt: string;
}

export interface QuranAudioFavorite {
  id: string; // e.g. "reciter:alafasy" or "surah:36" or "recitation:alafasy:36"
  type: 'reciter' | 'surah' | 'recitation';
  targetId: string;
  titleAr: string;
  subtitleAr?: string;
  createdAt: string;
}

export type QuranRepeatMode = 'off' | 'surah' | 'queue';
export type QuranSleepTimerMinutes = 5 | 10 | 15 | 30 | 45 | 60 | 'end-of-surah' | null;

export interface QuranSleepTimerState {
  totalSeconds: number;
  remainingSeconds: number;
  label: string;
  isEndOfSurah: boolean;
}

export type QuranPlaybackStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'playing'
  | 'paused'
  | 'buffering'
  | 'ended'
  | 'error';

export interface QuranAudioSourceResolution {
  url: string;
  type: 'mp3';
  provider: string;
  source: string;
  fallbackUrl?: string;
}
