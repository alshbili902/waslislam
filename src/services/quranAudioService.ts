import {
  QuranAudioSurah,
  QuranAudioReciter,
  QuranReciterMoshaf,
  QuranAudioPlaybackState,
  QuranAudioHistoryItem,
  QuranAudioFavorite
} from '../types/quranAudio';
import {
  VERIFIED_QURAN_SURAHS,
  INITIAL_VERIFIED_RECITERS,
  ALL_SURAH_NUMBERS
} from '../data/quranAudioData';
import { normalizeArabicText } from './quranService';
import { supabase, isSupabaseConfigured, localStore } from './supabase';

const STORAGE_KEYS = {
  RECITERS_CACHE: 'quran_audio_reciters_cache',
  LAST_PLAYBACK: 'quran_audio_last_playback',
  PLAYBACK_POSITIONS: 'quran_audio_positions',
  RECENT_HISTORY: 'quran_audio_recent_history',
  FAVORITES: 'quran_audio_favorites'
};

// ==========================================
// 1. Quran Metadata Service (QuranService)
// ==========================================
export const QuranService = {
  getAllSurahs(): QuranAudioSurah[] {
    return VERIFIED_QURAN_SURAHS;
  },

  getSurahByNumber(num: number): QuranAudioSurah | undefined {
    return VERIFIED_QURAN_SURAHS.find((s) => s.number === num);
  },

  filterSurahs(options: {
    revelationType?: 'all' | 'Meccan' | 'Medinan';
    query?: string;
    juz?: number;
  }): QuranAudioSurah[] {
    let list = VERIFIED_QURAN_SURAHS;

    if (options.revelationType && options.revelationType !== 'all') {
      list = list.filter((s) => s.revelationType === options.revelationType);
    }

    if (options.juz && options.juz > 0) {
      list = list.filter((s) => s.juz === options.juz);
    }

    if (options.query && options.query.trim()) {
      const q = normalizeArabicText(options.query.trim());
      const lower = options.query.toLowerCase().trim();
      const numQuery = parseInt(options.query.trim(), 10);

      list = list.filter((s) => {
        if (!isNaN(numQuery) && s.number === numQuery) return true;
        if (s.nameWithoutTashkeel.includes(q)) return true;
        if (s.englishName.toLowerCase().includes(lower)) return true;
        if (s.englishNameTranslation.toLowerCase().includes(lower)) return true;
        return false;
      });
    }

    return list;
  }
};

// ==========================================
// 2. Reciters Service (ReciterService)
// ==========================================
export const ReciterService = {
  getReciters(): QuranAudioReciter[] {
    const cached = localStore.get<QuranAudioReciter[]>(STORAGE_KEYS.RECITERS_CACHE, []);
    if (cached && cached.length > 0) {
      // Merge with initial verified list to ensure integrity
      const mergedMap = new Map<string, QuranAudioReciter>();
      INITIAL_VERIFIED_RECITERS.forEach((r) => mergedMap.set(r.id, r));
      cached.forEach((r) => mergedMap.set(r.id, r));
      return Array.from(mergedMap.values());
    }
    return INITIAL_VERIFIED_RECITERS;
  },

  getReciterById(id: string): QuranAudioReciter | undefined {
    const reciters = this.getReciters();
    const cleanId = id.trim().toLowerCase();
    const numId = parseInt(cleanId, 10);

    return reciters.find((r) => {
      if (r.id.toLowerCase() === cleanId) return true;
      if (!isNaN(numId) && r.numericId === numId) return true;
      return false;
    });
  },

  getFeaturedReciters(): QuranAudioReciter[] {
    return this.getReciters().filter((r) => r.isFeatured && r.isActive);
  },

  filterReciters(options: {
    riwayah?: string;
    query?: string;
    letter?: string;
  }): QuranAudioReciter[] {
    let list = this.getReciters().filter((r) => r.isActive);

    if (options.riwayah && options.riwayah !== 'الكل') {
      list = list.filter((r) =>
        r.riwayah === options.riwayah ||
        r.moshafList.some((m) => m.riwayahName === options.riwayah)
      );
    }

    if (options.letter && options.letter !== 'الكل') {
      list = list.filter((r) => r.letter === options.letter);
    }

    if (options.query && options.query.trim()) {
      const q = normalizeArabicText(options.query.trim());
      const lower = options.query.toLowerCase().trim();

      list = list.filter((r) => {
        const normName = normalizeArabicText(r.nameAr);
        if (normName.includes(q)) return true;
        if (r.nameEn.toLowerCase().includes(lower)) return true;
        if (r.riwayah.includes(options.query!)) return true;
        return false;
      });
    }

    return list;
  },

  async syncRecitersFromApi(): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      const res = await fetch('https://mp3quran.net/api/v3/reciters?language=ar');
      if (!res.ok) {
        throw new Error(`API responded with status: ${res.status}`);
      }
      const data = await res.json();
      if (!data || !Array.isArray(data.reciters)) {
        throw new Error('Invalid API response format');
      }

      const existingReciters = this.getReciters();
      const existingMap = new Map<number, QuranAudioReciter>();
      existingReciters.forEach((r) => existingMap.set(r.numericId, r));

      const updatedList: QuranAudioReciter[] = [];

      for (const item of data.reciters) {
        if (!item.moshaf || !Array.isArray(item.moshaf) || item.moshaf.length === 0) continue;

        const moshafList: QuranReciterMoshaf[] = item.moshaf
          .filter((m: any) => m.server && typeof m.server === 'string' && m.server.startsWith('http'))
          .map((m: any) => {
            const surahs = typeof m.surah_list === 'string'
              ? m.surah_list.split(',').map((n: string) => parseInt(n.trim(), 10)).filter((n: number) => !isNaN(n))
              : ALL_SURAH_NUMBERS;

            let riwayahName = 'حفص عن عاصم';
            if (m.name.includes('ورش')) riwayahName = 'ورش عن نافع';
            else if (m.name.includes('قالون')) riwayahName = 'قالون عن نافع';
            else if (m.name.includes('السوسي')) riwayahName = 'السوسي عن أبي عمرو';
            else if (m.name.includes('الدوري')) riwayahName = 'الدوري عن أبي عمرو';
            else if (m.name.includes('خلف')) riwayahName = 'خلف عن حمزة';
            else if (m.name.includes('المجود')) riwayahName = 'المصحف المجود';
            else if (m.name.includes('المعلم')) riwayahName = 'المصحف المعلم';

            return {
              id: m.id || 1,
              nameAr: m.name || riwayahName,
              riwayahName,
              serverUrl: m.server.endsWith('/') ? m.server : `${m.server}/`,
              surahTotal: m.surah_total || surahs.length,
              surahList: surahs
            };
          });

        if (moshafList.length === 0) continue;

        const existing = existingMap.get(item.id);
        const slug = existing ? existing.id : `reciter-${item.id}`;

        updatedList.push({
          id: slug,
          numericId: item.id,
          nameAr: item.name,
          nameEn: existing?.nameEn || item.name,
          letter: item.letter || item.name.charAt(0),
          bioAr: existing?.bioAr || `قارئ معتمد من قراء العالم الإسلامي برواية ${moshafList[0].riwayahName}.`,
          riwayah: moshafList[0].riwayahName,
          moshafList,
          totalSurahs: moshafList[0].surahTotal || 114,
          isFeatured: existing ? existing.isFeatured : false,
          isActive: true
        });
      }

      // Save to cache
      localStore.set(STORAGE_KEYS.RECITERS_CACHE, updatedList);
      return { success: true, count: updatedList.length };
    } catch (e: any) {
      console.warn('Reciters sync failed, using verified bundled data:', e);
      return { success: false, count: INITIAL_VERIFIED_RECITERS.length, error: e?.message || 'Sync failed' };
    }
  }
};

// ==========================================
// 3. Audio Source Service (AudioSourceService)
// ==========================================
export interface StreamDiagnosticResult {
  url: string;
  provider: string;
  httpStatus: number | null;
  contentType: string | null;
  acceptRanges: string | null;
  contentLength: number | null;
  corsSupported: boolean;
  isPlayable: boolean;
  errorCode?: string;
  errorMessage?: string;
  latencyMs: number;
}

export const AudioSourceService = {
  resolveQuranAudioUrl(
    reciterIdOrReciter: string | QuranAudioReciter,
    surahNumber: number,
    moshafId?: number
  ): { url: string; type: 'mp3'; provider: string; source: string; fallbackUrl?: string } | null {
    if (!reciterIdOrReciter || surahNumber < 1 || surahNumber > 114) return null;

    const reciter = typeof reciterIdOrReciter === 'string'
      ? ReciterService.getReciterById(reciterIdOrReciter)
      : reciterIdOrReciter;

    if (!reciter) return null;

    const moshaf = moshafId
      ? reciter.moshafList.find((m) => m.id === moshafId) || reciter.moshafList[0]
      : reciter.moshafList[0];

    if (!moshaf) return null;

    // Check if recording is legitimately available in this moshaf
    if (!moshaf.surahList.includes(surahNumber)) {
      return null;
    }

    const paddedNumber = surahNumber.toString().padStart(3, '0');
    const primaryUrl = `${moshaf.serverUrl}${paddedNumber}.mp3`;

    // Construct secondary fallback if available
    let fallbackUrl: string | undefined = undefined;
    if (reciter.moshafList.length > 1) {
      const altMoshaf = reciter.moshafList.find((m) => m.id !== moshaf.id && m.surahList.includes(surahNumber));
      if (altMoshaf) {
        fallbackUrl = `${altMoshaf.serverUrl}${paddedNumber}.mp3`;
      }
    }

    return {
      url: primaryUrl,
      type: 'mp3',
      provider: 'mp3quran.net official CDN',
      source: 'verified-provider',
      fallbackUrl
    };
  },

  getSurahAudioUrl(
    reciter: QuranAudioReciter,
    surahNumber: number,
    moshafId?: number
  ): string | null {
    const res = this.resolveQuranAudioUrl(reciter, surahNumber, moshafId);
    return res ? res.url : null;
  },

  isSurahAvailable(
    reciter: QuranAudioReciter,
    surahNumber: number,
    moshafId?: number
  ): boolean {
    if (!reciter) return false;
    const moshaf = moshafId
      ? reciter.moshafList.find((m) => m.id === moshafId) || reciter.moshafList[0]
      : reciter.moshafList[0];

    return Boolean(moshaf && moshaf.surahList.includes(surahNumber));
  },

  async validateAudioStream(url: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(url, { method: 'HEAD', signal: controller.signal });
      clearTimeout(timeoutId);
      return res.ok;
    } catch {
      return false;
    }
  },

  async diagnoseAudioStream(url: string, providerName = 'mp3quran.net'): Promise<StreamDiagnosticResult> {
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const latencyMs = Date.now() - start;

      const contentType = res.headers.get('content-type');
      const acceptRanges = res.headers.get('accept-ranges');
      const len = res.headers.get('content-length');
      const contentLength = len ? parseInt(len, 10) : null;
      const cors = res.headers.get('access-control-allow-origin') !== null;

      const isPlayable = res.ok && (contentType ? contentType.includes('audio') || contentType.includes('mpeg') || contentType.includes('octet-stream') : true);

      return {
        url,
        provider: providerName,
        httpStatus: res.status,
        contentType,
        acceptRanges,
        contentLength,
        corsSupported: cors,
        isPlayable,
        latencyMs
      };
    } catch (err: any) {
      const latencyMs = Date.now() - start;
      const isTimeout = err?.name === 'AbortError';
      return {
        url,
        provider: providerName,
        httpStatus: null,
        contentType: null,
        acceptRanges: null,
        contentLength: null,
        corsSupported: false,
        isPlayable: false,
        errorCode: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR',
        errorMessage: isTimeout ? 'انتهت مهلة الاتصال بالخادم' : (err?.message || 'تعذر الاتصال بمصدر البث'),
        latencyMs
      };
    }
  }
};

// Export standalone function as requested in specification
export const resolveQuranAudioUrl = (
  reciterId: string,
  surahNumber: number,
  moshafId?: number
) => {
  return AudioSourceService.resolveQuranAudioUrl(reciterId, surahNumber, moshafId);
};

// ==========================================
// 4. Playback & Storage Service (PlaybackService)
// ==========================================
export const PlaybackService = {
  savePosition(state: QuranAudioPlaybackState): void {
    const key = `${state.reciterId}_${state.surahNumber}`;
    const all = localStore.get<Record<string, QuranAudioPlaybackState>>(STORAGE_KEYS.PLAYBACK_POSITIONS, {});
    all[key] = state;
    localStore.set(STORAGE_KEYS.PLAYBACK_POSITIONS, all);
    localStore.set(STORAGE_KEYS.LAST_PLAYBACK, state);

    // Sync to Supabase if authenticated
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          supabase
            .from('quran_playback_state')
            .upsert({
              user_id: user.id,
              surah_number: state.surahNumber,
              reciter_id: state.reciterId,
              moshaf_id: state.moshafId,
              position_seconds: Math.floor(state.positionSeconds),
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id,surah_number,reciter_id' })
            .then(({ error }) => {
              if (error) console.warn('Supabase playback sync note:', error.message);
            });
        }
      });
    }
  },

  getPosition(reciterId: string, surahNumber: number): number {
    const key = `${reciterId}_${surahNumber}`;
    const all = localStore.get<Record<string, QuranAudioPlaybackState>>(STORAGE_KEYS.PLAYBACK_POSITIONS, {});
    return all[key]?.positionSeconds || 0;
  },

  getLastPlayback(): QuranAudioPlaybackState | null {
    return localStore.get<QuranAudioPlaybackState | null>(STORAGE_KEYS.LAST_PLAYBACK, null);
  },

  getRecentHistory(): QuranAudioHistoryItem[] {
    return localStore.get<QuranAudioHistoryItem[]>(STORAGE_KEYS.RECENT_HISTORY, []);
  },

  addRecentHistory(item: Omit<QuranAudioHistoryItem, 'id' | 'playedAt'>): void {
    const history = this.getRecentHistory();
    const filtered = history.filter(
      (h) => !(h.surahNumber === item.surahNumber && h.reciterId === item.reciterId)
    );
    const newEntry: QuranAudioHistoryItem = {
      ...item,
      id: `${item.reciterId}_${item.surahNumber}_${Date.now()}`,
      playedAt: new Date().toISOString()
    };
    const updated = [newEntry, ...filtered].slice(0, 30); // Max 30 entries
    localStore.set(STORAGE_KEYS.RECENT_HISTORY, updated);

    // Sync to Supabase if authenticated
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          supabase.from('quran_audio_history').insert({
            user_id: user.id,
            surah_number: item.surahNumber,
            reciter_id: item.reciterId,
            position_seconds: Math.floor(item.positionSeconds),
            duration_seconds: Math.floor(item.durationSeconds)
          }).then();
        }
      });
    }
  },

  clearRecentHistory(): void {
    localStore.remove(STORAGE_KEYS.RECENT_HISTORY);
  },

  getFavorites(): QuranAudioFavorite[] {
    return localStore.get<QuranAudioFavorite[]>(STORAGE_KEYS.FAVORITES, []);
  },

  isFavorite(id: string): boolean {
    const favs = this.getFavorites();
    return favs.some((f) => f.id === id);
  },

  async toggleFavorite(fav: Omit<QuranAudioFavorite, 'createdAt'>): Promise<boolean> {
    const favs = this.getFavorites();
    const index = favs.findIndex((f) => f.id === fav.id);
    let isAdded = false;

    let updated: QuranAudioFavorite[];
    if (index >= 0) {
      updated = favs.filter((f) => f.id !== fav.id);
      isAdded = false;
    } else {
      updated = [{ ...fav, createdAt: new Date().toISOString() }, ...favs];
      isAdded = true;
    }

    localStore.set(STORAGE_KEYS.FAVORITES, updated);

    // Sync to Supabase if authenticated
    if (isSupabaseConfigured && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        if (isAdded) {
          await supabase.from('quran_audio_favorites').insert({
            user_id: user.id,
            favorite_id: fav.id,
            item_type: fav.type,
            target_id: fav.targetId,
            title_ar: fav.titleAr,
            subtitle_ar: fav.subtitleAr
          });
        } else {
          await supabase
            .from('quran_audio_favorites')
            .delete()
            .eq('user_id', user.id)
            .eq('favorite_id', fav.id);
        }
      }
    }

    return isAdded;
  }
};
