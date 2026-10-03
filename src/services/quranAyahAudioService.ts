import { Ayah, Reciter, SurahMeta } from '../types';
import { RECITERS_LIST, SURAHS_LIST } from '../data/quranMetadata';

// EveryAyah verified folder mappings for the verified reciters
export const EVERY_AYAH_FOLDERS: Record<string, string> = {
  'ar.alafasy': 'Alafasy_128kbps',
  'ar.abdulbasitmurattal': 'Abdul_Basit_Murattal_192kbps',
  'ar.husary': 'Husary_128kbps',
  'ar.minshawi': 'Minshawy_Murattal_128kbps',
  'ar.saadalghamdi': 'Ghamadi_40kbps',
};

export type AyahAudioUIState =
  | 'IDLE' // ابدأ التسميع
  | 'PREPARING' // جاري تجهيز التلاوة...
  | 'LOADING' // جاري تحميل التلاوة...
  | 'READY' // تشغيل التلاوة
  | 'PLAYING' // جاري الاستماع...
  | 'PAUSED' // متوقف مؤقتًا
  | 'ERROR' // تعذر تشغيل التلاوة
  | 'COMPLETED'; // تم الاستماع للمقطع

export interface AyahAudioSourceResolution {
  valid: boolean;
  surahNumber: number;
  ayahNumberInSurah: number;
  globalAyahNumber: number;
  surahMeta?: SurahMeta;
  reciter: Reciter;
  primaryUrl: string;
  fallbackUrl: string;
  primaryProvider: string;
  fallbackProvider: string;
  error?: string;
}

export interface AyahAudioDiagnostic {
  reciter?: string;
  surah?: number;
  ayah?: number;
  globalAyah?: number;
  url?: string;
  provider?: string;
  status?: string;
  readyState?: number;
  networkState?: number;
  errorCode?: number | string;
  errorMessage?: string;
  playRejection?: string;
  [key: string]: any;
}

/**
 * Calculates the exact 1-based global Ayah number (1 to 6236)
 * across the entire Quran according to the verified Hafs reading.
 */
export function calculateGlobalAyahNumber(surahNumber: number, ayahNumberInSurah: number): number {
  if (surahNumber < 1 || surahNumber > 114) return 1;
  let count = 0;
  for (let s = 1; s < surahNumber; s++) {
    const meta = SURAHS_LIST.find((item) => item.number === s);
    if (meta) {
      count += meta.numberOfAyahs;
    }
  }
  return count + Math.max(1, ayahNumberInSurah);
}

/**
 * Validates and resolves verified Quran Ayah audio URLs
 * with automatic fallback between Islamic Network CDN and EveryAyah repository.
 */
export function resolveAyahAudioSource(params: {
  surahNumber: number;
  ayahNumberInSurah: number;
  reciterId?: string;
}): AyahAudioSourceResolution {
  const { surahNumber, ayahNumberInSurah, reciterId } = params;

  const surahMeta = SURAHS_LIST.find((s) => s.number === surahNumber);
  if (!surahMeta || surahNumber < 1 || surahNumber > 114) {
    const defaultReciter = RECITERS_LIST[0];
    return {
      valid: false,
      surahNumber,
      ayahNumberInSurah,
      globalAyahNumber: 1,
      reciter: defaultReciter,
      primaryUrl: '',
      fallbackUrl: '',
      primaryProvider: 'cdn.islamic.network',
      fallbackProvider: 'everyayah.com',
      error: 'رقم السورة غير صالح (يجب أن يكون بين 1 و 114).',
    };
  }

  if (ayahNumberInSurah < 1 || ayahNumberInSurah > surahMeta.numberOfAyahs) {
    const defaultReciter = RECITERS_LIST[0];
    return {
      valid: false,
      surahNumber,
      ayahNumberInSurah,
      globalAyahNumber: 1,
      surahMeta,
      reciter: defaultReciter,
      primaryUrl: '',
      fallbackUrl: '',
      primaryProvider: 'cdn.islamic.network',
      fallbackProvider: 'everyayah.com',
      error: `رقم الآية غير صالح (سورة ${surahMeta.name} تحتوي على ${surahMeta.numberOfAyahs} آية).`,
    };
  }

  const reciter =
    RECITERS_LIST.find((r) => r.id === reciterId) ||
    RECITERS_LIST[0]; // Default to Mishary Alafasy

  const globalAyahNumber = calculateGlobalAyahNumber(surahNumber, ayahNumberInSurah);

  // 1. Primary verified provider: Islamic Network CDN
  const bitrate = reciter.bitrate || '128';
  const primaryUrl = `https://cdn.islamic.network/quran/audio/${bitrate}/${reciter.id}/${globalAyahNumber}.mp3`;

  // 2. Secondary verified fallback: EveryAyah CDN
  const folder = EVERY_AYAH_FOLDERS[reciter.id] || EVERY_AYAH_FOLDERS['ar.alafasy'];
  const paddedSurah = surahNumber.toString().padStart(3, '0');
  const paddedAyah = ayahNumberInSurah.toString().padStart(3, '0');
  const fallbackUrl = `https://everyayah.com/data/${folder}/${paddedSurah}${paddedAyah}.mp3`;

  return {
    valid: true,
    surahNumber,
    ayahNumberInSurah,
    globalAyahNumber,
    surahMeta,
    reciter,
    primaryUrl,
    fallbackUrl,
    primaryProvider: 'cdn.islamic.network',
    fallbackProvider: 'everyayah.com',
  };
}

/**
 * Diagnostic logging in development mode
 */
export function logHifzAudioDebug(event: string, diagnostic: Partial<AyahAudioDiagnostic>) {
  if (typeof window === 'undefined') return;
  const isDev =
    Boolean(typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') ||
    (window as any).__WASL_DEBUG__ === true ||
    localStorage.getItem('wasl_debug') === 'true';

  if (isDev) {
    console.log(
      `%c[HIFZ_AUDIO] ${event}`,
      'background: #064e3b; color: #6ee7b7; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
      diagnostic
    );
  }
}

/**
 * Translates error conditions to friendly Arabic messages with action guidance.
 */
export function getArabicAudioErrorMessage(
  reason: 'network' | 'unavailable' | 'not_allowed' | 'provider' | 'timeout' | 'unknown',
  customMsg?: string
): string {
  switch (reason) {
    case 'network':
      return 'تعذر تحميل التلاوة. تحقق من اتصال الإنترنت ثم حاول مرة أخرى.';
    case 'unavailable':
      return 'التلاوة غير متاحة حاليًا لهذا المقطع.';
    case 'not_allowed':
      return 'اضغط تشغيل لبدء التلاوة.';
    case 'provider':
      return 'تعذر الوصول إلى مصدر التلاوة حاليًا.';
    case 'timeout':
      return 'استغرق تحميل التلاوة وقتًا طويلًا. حاول مرة أخرى.';
    case 'unknown':
    default:
      return customMsg || 'تعذر تشغيل التلاوة حاليًا. حاول مرة أخرى.';
  }
}

export interface PlayAyahCallbacks {
  onStateChange: (state: AyahAudioUIState) => void;
  onTimeUpdate: (currentTime: number, duration: number, progress: number) => void;
  onEnded: () => void;
  onError: (errorMessage: string, canRetry: boolean) => void;
  onUserActionRequired?: (prompt: string) => void;
}

/**
 * Robust Ayah Audio Player Controller.
 * Manages persistent HTMLAudioElement, event listeners, timeouts,
 * request IDs to prevent race conditions, and automatic fallback.
 */
export class AyahAudioPlayerController {
  private audio: HTMLAudioElement | null = null;
  private currentRequestId: number = 0;
  private currentResolution: AyahAudioSourceResolution | null = null;
  private usingFallback: boolean = false;
  private loadTimeoutId: any = null;
  private callbacks: PlayAyahCallbacks | null = null;
  private state: AyahAudioUIState = 'IDLE';

  constructor() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio();
      this.audio.preload = 'auto';
      this.attachListeners();
    }
  }

  private attachListeners() {
    if (!this.audio) return;

    this.audio.addEventListener('loadedmetadata', () => {
      if (this.audio && this.callbacks) {
        this.callbacks.onTimeUpdate(
          this.audio.currentTime || 0,
          this.audio.duration || 0,
          0
        );
      }
    });

    this.audio.addEventListener('canplay', () => {
      this.clearLoadTimeout();
      if (this.state === 'LOADING' || this.state === 'PREPARING') {
        this.setState('READY');
      }
    });

    this.audio.addEventListener('timeupdate', () => {
      if (!this.audio || !this.callbacks) return;
      const cur = this.audio.currentTime || 0;
      const dur = this.audio.duration || 0;
      const prog = dur > 0 ? Math.min(100, (cur / dur) * 100) : 0;
      this.callbacks.onTimeUpdate(cur, dur, prog);
    });

    this.audio.addEventListener('play', () => {
      this.setState('PLAYING');
    });

    this.audio.addEventListener('pause', () => {
      if (this.state === 'PLAYING') {
        this.setState('PAUSED');
      }
    });

    this.audio.addEventListener('ended', () => {
      this.setState('COMPLETED');
      this.callbacks?.onEnded();
    });

    this.audio.addEventListener('error', (e) => {
      this.handleAudioError(e);
    });

    this.audio.addEventListener('stalled', () => {
      logHifzAudioDebug('STALLED', {
        readyState: this.audio?.readyState,
        networkState: this.audio?.networkState,
      });
    });

    this.audio.addEventListener('waiting', () => {
      logHifzAudioDebug('WAITING', {
        readyState: this.audio?.readyState,
      });
    });
  }

  private setState(newState: AyahAudioUIState) {
    this.state = newState;
    this.callbacks?.onStateChange(newState);
  }

  private clearLoadTimeout() {
    if (this.loadTimeoutId) {
      clearTimeout(this.loadTimeoutId);
      this.loadTimeoutId = null;
    }
  }

  private handleAudioError(e: any) {
    this.clearLoadTimeout();
    const mediaErr = this.audio?.error;

    logHifzAudioDebug('AUDIO_ELEMENT_ERROR', {
      code: mediaErr?.code,
      message: mediaErr?.message,
      usingFallback: this.usingFallback,
      currentUrl: this.audio?.src,
    });

    // If primary provider failed and fallback hasn't been tried yet, try fallback
    if (!this.usingFallback && this.currentResolution?.fallbackUrl) {
      logHifzAudioDebug('ATTEMPTING_FALLBACK_SOURCE', {
        fallbackUrl: this.currentResolution.fallbackUrl,
      });
      this.usingFallback = true;
      this.loadAndPlayCurrent(this.currentRequestId, true);
      return;
    }

    // Both primary and fallback failed or no fallback
    this.setState('ERROR');
    const msg = getArabicAudioErrorMessage(
      mediaErr?.code === 2 ? 'network' : mediaErr?.code === 4 ? 'unavailable' : 'provider'
    );
    this.callbacks?.onError(msg, true);
  }

  public async loadAndPlayAyah(
    params: {
      surahNumber: number;
      ayahNumberInSurah: number;
      reciterId?: string;
      autoPlay?: boolean;
    },
    callbacks: PlayAyahCallbacks
  ): Promise<boolean> {
    this.callbacks = callbacks;
    this.currentRequestId += 1;
    const reqId = this.currentRequestId;

    this.setState('PREPARING');

    // 1. Resolve verified audio sources
    const resolution = resolveAyahAudioSource({
      surahNumber: params.surahNumber,
      ayahNumberInSurah: params.ayahNumberInSurah,
      reciterId: params.reciterId,
    });

    if (!resolution.valid) {
      this.setState('ERROR');
      callbacks.onError(resolution.error || 'تعذر تحديد الآية الكريمة المطلوبة.', false);
      return false;
    }

    this.currentResolution = resolution;
    this.usingFallback = false;

    return this.loadAndPlayCurrent(reqId, params.autoPlay !== false);
  }

  private async loadAndPlayCurrent(reqId: number, attemptAutoPlay: boolean): Promise<boolean> {
    if (!this.audio || !this.currentResolution) return false;

    // Check race condition
    if (reqId !== this.currentRequestId) {
      logHifzAudioDebug('CANCELLED_STALE_REQUEST', { reqId, current: this.currentRequestId });
      return false;
    }

    const activeUrl = this.usingFallback
      ? this.currentResolution.fallbackUrl
      : this.currentResolution.primaryUrl;
    const activeProvider = this.usingFallback
      ? this.currentResolution.fallbackProvider
      : this.currentResolution.primaryProvider;

    logHifzAudioDebug('PREPARING_PLAYBACK', {
      reciter: this.currentResolution.reciter.nameAr,
      surah: this.currentResolution.surahNumber,
      ayah: this.currentResolution.ayahNumberInSurah,
      globalAyah: this.currentResolution.globalAyahNumber,
      url: activeUrl,
      provider: activeProvider,
      usingFallback: this.usingFallback,
      attemptAutoPlay,
    });

    this.setState('LOADING');

    // Timeout protection: 12 seconds timeout to avoid infinite loading
    this.clearLoadTimeout();
    this.loadTimeoutId = setTimeout(() => {
      if (reqId === this.currentRequestId && (this.state === 'LOADING' || this.state === 'PREPARING')) {
        logHifzAudioDebug('LOAD_TIMEOUT', { url: activeUrl });
        if (!this.usingFallback && this.currentResolution?.fallbackUrl) {
          this.usingFallback = true;
          this.loadAndPlayCurrent(reqId, attemptAutoPlay);
        } else {
          this.setState('ERROR');
          this.callbacks?.onError(getArabicAudioErrorMessage('timeout'), true);
        }
      }
    }, 12000);

    try {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio.src = activeUrl;
      this.audio.load();

      if (attemptAutoPlay) {
        const playPromise = this.audio.play();
        if (playPromise !== undefined) {
          try {
            await playPromise;
            this.clearLoadTimeout();
            this.setState('PLAYING');
            return true;
          } catch (playErr: any) {
            this.clearLoadTimeout();
            logHifzAudioDebug('PLAY_PROMISE_REJECTED', {
              name: playErr.name,
              message: playErr.message,
            });

            if (playErr.name === 'NotAllowedError') {
              // Browser autoplay policy blocked audio - NOT a fatal error!
              this.setState('READY');
              this.callbacks?.onUserActionRequired?.('اضغط تشغيل لبدء التلاوة');
              return false;
            } else if (playErr.name === 'AbortError') {
              // Aborted by subsequent action, ignore
              return false;
            } else {
              // Real playback failure, try fallback if available
              if (!this.usingFallback && this.currentResolution.fallbackUrl) {
                this.usingFallback = true;
                return this.loadAndPlayCurrent(reqId, true);
              }
              this.setState('ERROR');
              this.callbacks?.onError(getArabicAudioErrorMessage('unknown', playErr.message), true);
              return false;
            }
          }
        }
      } else {
        this.setState('READY');
        return true;
      }
    } catch (err: any) {
      this.clearLoadTimeout();
      logHifzAudioDebug('LOAD_ERROR', { error: err });
      if (!this.usingFallback && this.currentResolution?.fallbackUrl) {
        this.usingFallback = true;
        return this.loadAndPlayCurrent(reqId, attemptAutoPlay);
      }
      this.setState('ERROR');
      this.callbacks?.onError(getArabicAudioErrorMessage('unknown', err?.message), true);
      return false;
    }

    return true;
  }

  public async play(): Promise<boolean> {
    if (!this.audio) return false;
    try {
      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        await playPromise;
        this.setState('PLAYING');
        return true;
      }
    } catch (err: any) {
      logHifzAudioDebug('PLAY_CLICK_REJECTED', { name: err.name, message: err.message });
      if (err.name === 'NotAllowedError') {
        this.setState('READY');
        this.callbacks?.onUserActionRequired?.('اضغط تشغيل لبدء التلاوة');
      } else {
        this.setState('ERROR');
        this.callbacks?.onError(getArabicAudioErrorMessage('unknown', err?.message), true);
      }
      return false;
    }
    return true;
  }

  public pause(): void {
    if (this.audio) {
      this.audio.pause();
      this.setState('PAUSED');
    }
  }

  public async resume(): Promise<boolean> {
    return this.play();
  }

  public async replay(): Promise<boolean> {
    if (!this.audio) return false;
    this.audio.currentTime = 0;
    return this.play();
  }

  public seek(percentage: number): void {
    if (!this.audio || !this.audio.duration) return;
    const target = (percentage / 100) * this.audio.duration;
    this.audio.currentTime = Math.max(0, Math.min(target, this.audio.duration));
  }

  public stop(): void {
    this.clearLoadTimeout();
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    this.setState('IDLE');
  }

  public getCurrentState(): AyahAudioUIState {
    return this.state;
  }

  public getResolution(): AyahAudioSourceResolution | null {
    return this.currentResolution;
  }

  public destroy(): void {
    this.clearLoadTimeout();
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
    this.callbacks = null;
    this.state = 'IDLE';
  }
}
