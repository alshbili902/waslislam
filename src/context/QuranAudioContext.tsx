import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback
} from 'react';
import {
  QuranAudioSurah,
  QuranAudioReciter,
  QuranReciterMoshaf,
  QuranPlaylistItem,
  QuranRepeatMode,
  QuranSleepTimerMinutes,
  QuranSleepTimerState,
  QuranPlaybackStatus,
  QuranAudioSourceResolution
} from '../types/quranAudio';
import {
  QuranService,
  ReciterService,
  AudioSourceService,
  PlaybackService,
  resolveQuranAudioUrl
} from '../services/quranAudioService';
import { useRadio } from './RadioContext';
import { useAudio } from './AudioContext';

// Environment-controlled diagnostic logging (development only)
const isDebugEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  return Boolean(
    import.meta.env.DEV ||
    import.meta.env.VITE_QURAN_AUDIO_DEBUG === 'true' ||
    (window as any).__QURAN_DEBUG__ === true ||
    localStorage.getItem('wasl_quran_debug') === 'true'
  );
};

const devLog = (event: string, details?: any) => {
  if (isDebugEnabled()) {
    console.log(`%c[QuranAudio:${event}]`, 'color: #10b981; font-weight: bold;', details || '');
  }
};

const devWarn = (event: string, details?: any) => {
  if (isDebugEnabled()) {
    console.warn(`%c[QuranAudio:${event}]`, 'color: #f59e0b; font-weight: bold;', details || '');
  }
};

const devError = (event: string, details?: any) => {
  if (isDebugEnabled()) {
    console.error(`%c[QuranAudio:${event}]`, 'color: #ef4444; font-weight: bold;', details || '');
  }
};

export interface QuranAudioContextType {
  // State
  currentTrack: QuranPlaylistItem | null;
  currentSurah: QuranAudioSurah | null;
  currentReciter: QuranAudioReciter | null;
  currentMoshaf: QuranReciterMoshaf | null;
  playbackStatus: QuranPlaybackStatus;
  isPlaying: boolean;
  isLoading: boolean;
  isBuffering: boolean;
  isReady: boolean;
  progress: number; // 0 - 100
  currentTime: number; // seconds
  duration: number; // seconds
  volume: number; // 0 - 1
  isMuted: boolean;
  playbackSpeed: number;
  repeatMode: QuranRepeatMode;
  queue: QuranPlaylistItem[];
  queueIndex: number;
  sleepTimer: QuranSleepTimerState | null;
  isFullPlayerOpen: boolean;
  errorMessage: string | null;

  // Actions
  playSurah: (
    surahNumber: number,
    reciterId?: string,
    moshafId?: number,
    startSeconds?: number
  ) => Promise<void>;
  togglePlay: () => Promise<void>;
  pause: () => void;
  resume: () => Promise<void>;
  stop: () => void;
  seek: (seconds: number) => void;
  seekPercent: (percent: number) => void;
  skipForward: (seconds?: number) => void;
  skipBackward: (seconds?: number) => void;
  setVolume: (level: number) => void;
  toggleMute: () => void;
  setPlaybackSpeed: (speed: number) => void;
  setRepeatMode: (mode: QuranRepeatMode) => void;
  setSleepTimer: (minutes: QuranSleepTimerMinutes) => void;
  cancelSleepTimer: () => void;
  addToQueue: (surahNumber: number, reciterId?: string, moshafId?: number) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  playQueueItem: (index: number) => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  reorderQueue: (newQueue: QuranPlaylistItem[]) => void;
  setReciter: (reciter: QuranAudioReciter, moshafId?: number) => void;
  retryPlayback: () => Promise<void>;
  setIsFullPlayerOpen: (open: boolean) => void;
  openFullPlayer: () => void;
  closeFullPlayer: () => void;
}

const QuranAudioContext = createContext<QuranAudioContextType | undefined>(undefined);

export const QuranAudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // External context hooks to pause conflicting audios
  const radioContext = useRadio();
  const ayahAudioContext = useAudio();

  // Active track and reciter state
  const [currentTrack, setCurrentTrack] = useState<QuranPlaylistItem | null>(null);
  const [currentSurah, setCurrentSurah] = useState<QuranAudioSurah | null>(null);
  const [currentReciter, setCurrentReciter] = useState<QuranAudioReciter | null>(() => {
    return ReciterService.getFeaturedReciters()[0] || ReciterService.getReciters()[0];
  });
  const [currentMoshaf, setCurrentMoshaf] = useState<QuranReciterMoshaf | null>(() => {
    const r = ReciterService.getFeaturedReciters()[0] || ReciterService.getReciters()[0];
    return r?.moshafList[0] || null;
  });

  // Explicit Playback Status
  const [playbackStatus, setPlaybackStatus] = useState<QuranPlaybackStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Time & Progress State
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);

  // Audio Configuration State
  const [volume, setVolumeState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('wasl_quran_volume');
      return saved ? parseFloat(saved) : 1;
    } catch {
      return 1;
    }
  });
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeedState] = useState<number>(1);
  const [repeatMode, setRepeatMode] = useState<QuranRepeatMode>('off');

  // Queue & Sleep Timer State
  const [queue, setQueue] = useState<QuranPlaylistItem[]>([]);
  const [queueIndex, setQueueIndex] = useState<number>(-1);
  const [sleepTimer, setSleepTimerState] = useState<QuranSleepTimerState | null>(null);
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);

  // Persistent Single HTMLAudioElement Reference
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Race condition protection & watchdog refs
  const playbackRequestIdRef = useRef<number>(0);
  const lastSavedPositionRef = useRef<number>(0);
  const sleepTimerIntervalRef = useRef<any>(null);
  const watchdogTimeoutRef = useRef<any>(null);
  const pendingSeekRef = useRef<number | null>(null);

  // Keep references to state values needed inside event listeners
  const currentTrackRef = useRef<QuranPlaylistItem | null>(null);
  currentTrackRef.current = currentTrack;
  const repeatModeRef = useRef<QuranRepeatMode>('off');
  repeatModeRef.current = repeatMode;
  const queueRef = useRef<QuranPlaylistItem[]>([]);
  queueRef.current = queue;
  const queueIndexRef = useRef<number>(-1);
  queueIndexRef.current = queueIndex;
  const sleepTimerRef = useRef<QuranSleepTimerState | null>(null);
  sleepTimerRef.current = sleepTimer;

  // Clear any existing watchdog timer
  const clearWatchdog = useCallback(() => {
    if (watchdogTimeoutRef.current) {
      clearTimeout(watchdogTimeoutRef.current);
      watchdogTimeoutRef.current = null;
    }
  }, []);

  // Set watchdog timer to prevent infinite loading or buffering
  const startWatchdog = useCallback(
    (type: 'loading' | 'buffering', timeoutMs = 15000) => {
      clearWatchdog();
      watchdogTimeoutRef.current = setTimeout(() => {
        devWarn('WatchdogTimeout', { type, timeoutMs });
        if (type === 'loading') {
          setPlaybackStatus('error');
          setErrorMessage('تعذر تحميل ملف التلاوة حاليًا. تحقق من اتصال الإنترنت.');
        } else if (type === 'buffering') {
          setPlaybackStatus('error');
          setErrorMessage('انقطع الاتصال بمصدر التلاوة مؤقتًا.');
        }
      }, timeoutMs);
    },
    [clearWatchdog]
  );

  // Helper to map MediaError codes to user-friendly Arabic text
  const getArabicMediaErrorMessage = (error: MediaError | null): string => {
    if (!error) return 'تعذر تشغيل التلاوة حاليًا.';
    switch (error.code) {
      case MediaError.MEDIA_ERR_ABORTED:
        return 'تم إيقاف تشغيل التلاوة.';
      case MediaError.MEDIA_ERR_NETWORK:
        return 'تعذر الاتصال بمصدر التلاوة. يرجى التحقق من الشبكة.';
      case MediaError.MEDIA_ERR_DECODE:
        return 'تعذر تشغيل ملف التلاوة (خطأ في فك ترميز الصوت).';
      case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
        return 'صيغة الصوت غير مدعومة من المتصفح.';
      default:
        return 'تعذر تشغيل التلاوة حاليًا.';
    }
  };

  // ==============================================================
  // 1. Initialize Single Persistent Audio Element ONCE on Mount
  // ==============================================================
  useEffect(() => {
    devLog('Initializing persistent HTMLAudioElement');
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.volume = volume;
    audio.playbackRate = playbackSpeed;
    audioRef.current = audio;

    // --- Audio Event Listeners ---
    const onLoadedMetadata = () => {
      devLog('loadedmetadata', {
        duration: audio.duration,
        readyState: audio.readyState,
        currentSrc: audio.currentSrc
      });
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
      if (pendingSeekRef.current !== null && pendingSeekRef.current > 0) {
        audio.currentTime = pendingSeekRef.current;
        pendingSeekRef.current = null;
      }
    };

    const onLoadedData = () => {
      devLog('loadeddata', { readyState: audio.readyState });
    };

    const onCanPlay = () => {
      devLog('canplay', { readyState: audio.readyState });
      clearWatchdog();
      setErrorMessage(null);
      setPlaybackStatus((prev) => (prev === 'loading' ? 'ready' : prev));
    };

    const onCanPlayThrough = () => {
      devLog('canplaythrough');
      clearWatchdog();
    };

    const onPlay = () => {
      devLog('play');
    };

    const onPlaying = () => {
      devLog('playing', { currentTime: audio.currentTime, readyState: audio.readyState });
      clearWatchdog();
      setPlaybackStatus('playing');
      setErrorMessage(null);
    };

    const onPause = () => {
      devLog('pause');
      setPlaybackStatus((prev) => (prev === 'playing' ? 'paused' : prev));
    };

    const onWaiting = () => {
      devLog('waiting (buffering)');
      setPlaybackStatus((prev) => (prev === 'playing' ? 'buffering' : prev));
      startWatchdog('buffering', 12000);
    };

    const onStalled = () => {
      devLog('stalled');
    };

    const onTimeUpdate = () => {
      const cur = audio.currentTime;
      const dur = audio.duration;
      if (!dur || isNaN(dur)) return;

      setCurrentTime(cur);
      setProgress((cur / dur) * 100);

      // Periodically persist playback position every 4 seconds
      if (Math.abs(cur - lastSavedPositionRef.current) >= 4) {
        lastSavedPositionRef.current = cur;
        const track = currentTrackRef.current;
        if (track) {
          PlaybackService.savePosition({
            surahNumber: track.surahNumber,
            reciterId: track.reciterId,
            moshafId: track.moshafId,
            positionSeconds: cur,
            updatedAt: new Date().toISOString()
          });
        }
      }
    };

    const onEnded = () => {
      devLog('ended');
      clearWatchdog();
      setPlaybackStatus('ended');

      const st = sleepTimerRef.current;
      if (st && st.isEndOfSurah) {
        cancelSleepTimerInternal();
        stopInternal();
        return;
      }

      const rep = repeatModeRef.current;
      if (rep === 'surah') {
        audio.currentTime = 0;
        audio.play().catch(console.warn);
        return;
      }

      const q = queueRef.current;
      const qIdx = queueIndexRef.current;
      if (q.length > 0 && qIdx < q.length - 1) {
        playQueueItemInternal(qIdx + 1);
        return;
      }

      if (rep === 'queue' && q.length > 0) {
        playQueueItemInternal(0);
        return;
      }

      const track = currentTrackRef.current;
      if (track && track.surahNumber < 114) {
        playSurahInternal(track.surahNumber + 1, track.reciterId, track.moshafId, 0);
        return;
      }

      setCurrentTime(0);
      setProgress(0);
    };

    const onError = () => {
      clearWatchdog();
      const err = audio.error;
      devError('error', {
        code: err?.code,
        message: err?.message,
        networkState: audio.networkState,
        currentSrc: audio.currentSrc
      });
      const arabicMsg = getArabicMediaErrorMessage(err);
      setErrorMessage(arabicMsg);
      setPlaybackStatus('error');
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('loadeddata', onLoadedData);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('canplaythrough', onCanPlayThrough);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('stalled', onStalled);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    // Cleanup on unmount only
    return () => {
      devLog('Cleaning up persistent HTMLAudioElement');
      clearWatchdog();
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('loadeddata', onLoadedData);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('canplaythrough', onCanPlayThrough);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('stalled', onStalled);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, []); // Run ONCE on mount

  // Helper references for handlers invoked inside onEnded
  const cancelSleepTimerInternal = () => {
    if (sleepTimerIntervalRef.current) {
      clearInterval(sleepTimerIntervalRef.current);
      sleepTimerIntervalRef.current = null;
    }
    setSleepTimerState(null);
  };

  const stopInternal = () => {
    clearWatchdog();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
    }
    setPlaybackStatus('idle');
    setCurrentTrack(null);
    setCurrentSurah(null);
    setErrorMessage(null);
    setProgress(0);
    setCurrentTime(0);
    setIsFullPlayerOpen(false);
  };

  // ==============================================================
  // 2. Core Play Surah Implementation
  // ==============================================================
  const playSurah = useCallback(
    async (
      surahNumber: number,
      reciterId?: string,
      moshafId?: number,
      startSeconds?: number
    ): Promise<void> => {
      const audio = audioRef.current;
      if (!audio) {
        devError('playSurah called before audioRef was initialized');
        return;
      }

      // Increment request ID to prevent race conditions on fast switching
      const requestId = ++playbackRequestIdRef.current;
      clearWatchdog();

      // Pause other audio players (Radio and Ayah player)
      try {
        if (radioContext?.isPlaying) radioContext.stop();
        if (ayahAudioContext?.isPlaying) ayahAudioContext.stop();
      } catch (err) {
        devWarn('Could not stop external audio context', err);
      }

      // Retrieve Surah metadata
      const surah = QuranService.getSurahByNumber(surahNumber);
      if (!surah) {
        setErrorMessage('سورة غير صالحة');
        setPlaybackStatus('error');
        return;
      }

      // Retrieve Reciter metadata
      const targetReciterId = reciterId || currentReciter?.id || 'alafasy';
      const reciter =
        ReciterService.getReciterById(targetReciterId) || ReciterService.getReciters()[0];
      if (!reciter) {
        setErrorMessage('القارئ غير متاح');
        setPlaybackStatus('error');
        return;
      }

      const targetMoshafId = moshafId || reciter.moshafList[0]?.id || 1;
      const moshaf =
        reciter.moshafList.find((m) => m.id === targetMoshafId) || reciter.moshafList[0];

      // Centralized Audio Resolution
      const resolution = resolveQuranAudioUrl(reciter.id, surahNumber, targetMoshafId);
      if (!resolution || !resolution.url) {
        devWarn('Audio URL resolution failed', { reciter: reciter.nameAr, surahNumber });
        setErrorMessage(`التسجيل غير متاح حاليًا لسورة ${surah.name} بصوت ${reciter.nameAr}`);
        setPlaybackStatus('error');
        return;
      }

      devLog('Resolved Audio URL', {
        surah: surah.name,
        reciter: reciter.nameAr,
        url: resolution.url,
        provider: resolution.provider
      });

      // Set Loading State
      setPlaybackStatus('loading');
      setErrorMessage(null);
      startWatchdog('loading', 15000);

      const playlistItem: QuranPlaylistItem = {
        surahNumber: surah.number,
        surahName: surah.name,
        surahNameEn: surah.englishName,
        revelationTypeAr: surah.revelationTypeAr,
        numberOfAyahs: surah.numberOfAyahs,
        reciterId: reciter.id,
        reciterNumericId: reciter.numericId,
        reciterNameAr: reciter.nameAr,
        riwayahName: moshaf?.riwayahName || reciter.riwayah,
        moshafId: targetMoshafId,
        audioUrl: resolution.url
      };

      setCurrentTrack(playlistItem);
      setCurrentSurah(surah);
      setCurrentReciter(reciter);
      setCurrentMoshaf(moshaf);

      // Determine starting position
      const resumePos =
        startSeconds !== undefined
          ? startSeconds
          : PlaybackService.getPosition(reciter.id, surahNumber);

      pendingSeekRef.current = resumePos > 0 ? resumePos : null;

      try {
        // Pause any current playback before changing source
        audio.pause();

        // Assign new source and initiate load
        audio.src = resolution.url;
        audio.playbackRate = playbackSpeed;
        audio.volume = isMuted ? 0 : volume;
        audio.load();

        devLog('Attempting audio.play()');
        await audio.play();

        // If a newer track request arrived while we awaited play(), abort this one
        if (requestId !== playbackRequestIdRef.current) {
          devWarn('Superseded track play promise resolved, ignoring');
          return;
        }

        clearWatchdog();
        setPlaybackStatus('playing');
        setErrorMessage(null);

        // Record to recently played
        PlaybackService.addRecentHistory({
          surahNumber: surah.number,
          surahNameAr: surah.name,
          reciterId: reciter.id,
          reciterNameAr: reciter.nameAr,
          riwayahName: moshaf?.riwayahName || reciter.riwayah,
          audioUrl: resolution.url,
          positionSeconds: resumePos,
          durationSeconds: audio.duration || 0
        });
      } catch (err: any) {
        if (requestId !== playbackRequestIdRef.current) return;
        clearWatchdog();

        devWarn('audio.play() error caught', { name: err?.name, message: err?.message });

        if (err?.name === 'NotAllowedError') {
          // Autoplay policy restriction: audio source is loaded and ready, but user gesture is required
          setPlaybackStatus('ready');
          setErrorMessage('اضغط تشغيل لبدء التلاوة');
        } else if (err?.name === 'AbortError') {
          // Play request was aborted by another call, benign
          devLog('Play request aborted cleanly');
        } else {
          // Try fallback URL if configured
          if (resolution.fallbackUrl && resolution.fallbackUrl !== resolution.url) {
            devLog('Attempting fallback audio URL', resolution.fallbackUrl);
            try {
              audio.src = resolution.fallbackUrl;
              audio.load();
              await audio.play();
              if (requestId === playbackRequestIdRef.current) {
                setPlaybackStatus('playing');
                setErrorMessage(null);
                return;
              }
            } catch (fallbackErr) {
              devError('Fallback audio also failed', fallbackErr);
            }
          }

          setPlaybackStatus('error');
          setErrorMessage('تعذر تشغيل التلاوة حاليًا. اضغط إعادة المحاولة.');
        }
      }
    },
    [currentReciter, playbackSpeed, isMuted, volume, radioContext, ayahAudioContext, clearWatchdog, startWatchdog]
  );

  // References for internal triggers
  const playSurahInternal = playSurah;

  // ==============================================================
  // 3. Playback Controls (Toggle, Pause, Resume, Stop)
  // ==============================================================
  const togglePlay = useCallback(async (): Promise<void> => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playbackStatus === 'playing') {
      audio.pause();
      setPlaybackStatus('paused');
    } else if (currentTrack) {
      // Pause conflicting audios
      if (radioContext?.isPlaying) radioContext.stop();
      if (ayahAudioContext?.isPlaying) ayahAudioContext.stop();

      try {
        setErrorMessage(null);
        await audio.play();
        setPlaybackStatus('playing');
      } catch (err: any) {
        devWarn('togglePlay play() rejection', err);
        if (err?.name === 'NotAllowedError') {
          setPlaybackStatus('ready');
          setErrorMessage('اضغط تشغيل لبدء التلاوة');
        } else {
          setPlaybackStatus('error');
          setErrorMessage('تعذر استئناف التلاوة.');
        }
      }
    } else {
      // If no track is loaded, start with Surah Al-Fatihah
      await playSurah(1, currentReciter?.id);
    }
  }, [playbackStatus, currentTrack, radioContext, ayahAudioContext, playSurah, currentReciter]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlaybackStatus('paused');
    }
  }, []);

  const resume = useCallback(async (): Promise<void> => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (radioContext?.isPlaying) radioContext.stop();
    if (ayahAudioContext?.isPlaying) ayahAudioContext.stop();

    try {
      setErrorMessage(null);
      await audio.play();
      setPlaybackStatus('playing');
    } catch (err: any) {
      devWarn('resume play() error', err);
      if (err?.name === 'NotAllowedError') {
        setPlaybackStatus('ready');
        setErrorMessage('اضغط تشغيل لبدء التلاوة');
      } else {
        setPlaybackStatus('error');
        setErrorMessage('تعذر استئناف التلاوة.');
      }
    }
  }, [currentTrack, radioContext, ayahAudioContext]);

  const stop = useCallback(() => {
    stopInternal();
  }, []);

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const dur = audio.duration || 0;
    const target = Math.max(0, Math.min(seconds, dur));
    audio.currentTime = target;
    setCurrentTime(target);
    if (dur > 0) {
      setProgress((target / dur) * 100);
    }
  }, []);

  const seekPercent = useCallback(
    (percent: number) => {
      const audio = audioRef.current;
      if (!audio || !audio.duration) return;
      const bounded = Math.max(0, Math.min(percent, 100));
      const target = (bounded / 100) * audio.duration;
      seek(target);
    },
    [seek]
  );

  const skipForward = useCallback(
    (sec = 10) => {
      if (!audioRef.current) return;
      seek(audioRef.current.currentTime + sec);
    },
    [seek]
  );

  const skipBackward = useCallback(
    (sec = 10) => {
      if (!audioRef.current) return;
      seek(audioRef.current.currentTime - sec);
    },
    [seek]
  );

  const setVolume = useCallback((level: number) => {
    const safe = Math.max(0, Math.min(level, 1));
    setVolumeState(safe);
    setIsMuted(safe === 0);
    if (audioRef.current) {
      audioRef.current.volume = safe;
    }
    try {
      localStorage.setItem('wasl_quran_volume', safe.toString());
    } catch {
      // ignore
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    if (isMuted) {
      const restore = volume > 0 ? volume : 0.85;
      audioRef.current.volume = restore;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const setPlaybackSpeed = useCallback((speed: number) => {
    setPlaybackSpeedState(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, []);

  // ==============================================================
  // 4. Sleep Timer Management
  // ==============================================================
  const cancelSleepTimer = useCallback(() => {
    cancelSleepTimerInternal();
  }, []);

  const setSleepTimer = useCallback(
    (minutes: QuranSleepTimerMinutes) => {
      cancelSleepTimerInternal();
      if (!minutes) return;

      if (minutes === 'end-of-surah') {
        setSleepTimerState({
          totalSeconds: 0,
          remainingSeconds: 0,
          label: 'نهاية السورة',
          isEndOfSurah: true
        });
        return;
      }

      const totalSeconds = minutes * 60;
      setSleepTimerState({
        totalSeconds,
        remainingSeconds: totalSeconds,
        label: `${minutes} دقيقة`,
        isEndOfSurah: false
      });

      sleepTimerIntervalRef.current = setInterval(() => {
        setSleepTimerState((prev) => {
          if (!prev || prev.remainingSeconds <= 1) {
            clearInterval(sleepTimerIntervalRef.current);
            // Smoothly stop playback
            if (audioRef.current) {
              audioRef.current.pause();
              setPlaybackStatus('paused');
            }
            return null;
          }
          return {
            ...prev,
            remainingSeconds: prev.remainingSeconds - 1
          };
        });
      }, 1000);
    },
    []
  );

  // ==============================================================
  // 5. Queue Operations
  // ==============================================================
  const addToQueue = useCallback(
    (surahNumber: number, reciterId?: string, moshafId?: number) => {
      const surah = QuranService.getSurahByNumber(surahNumber);
      if (!surah) return;

      const reciter =
        ReciterService.getReciterById(reciterId || currentReciter?.id || 'alafasy') ||
        ReciterService.getReciters()[0];
      if (!reciter) return;

      const mId = moshafId || reciter.moshafList[0]?.id || 1;
      const moshaf = reciter.moshafList.find((m) => m.id === mId) || reciter.moshafList[0];
      const audioUrl = AudioSourceService.getSurahAudioUrl(reciter, surahNumber, mId);
      if (!audioUrl) return;

      const item: QuranPlaylistItem = {
        surahNumber: surah.number,
        surahName: surah.name,
        surahNameEn: surah.englishName,
        revelationTypeAr: surah.revelationTypeAr,
        numberOfAyahs: surah.numberOfAyahs,
        reciterId: reciter.id,
        reciterNumericId: reciter.numericId,
        reciterNameAr: reciter.nameAr,
        riwayahName: moshaf?.riwayahName || reciter.riwayah,
        moshafId: mId,
        audioUrl
      };

      setQueue((prev) => [...prev, item]);
    },
    [currentReciter]
  );

  const removeFromQueue = useCallback((index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
    setQueueIndex((prev) => (prev > index ? prev - 1 : prev));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setQueueIndex(-1);
  }, []);

  const playQueueItem = useCallback(
    async (index: number): Promise<void> => {
      if (index < 0 || index >= queue.length) return;
      const item = queue[index];
      setQueueIndex(index);
      await playSurah(item.surahNumber, item.reciterId, item.moshafId, 0);
    },
    [queue, playSurah]
  );

  const playQueueItemInternal = playQueueItem;

  const playNext = useCallback(async (): Promise<void> => {
    if (queue.length > 0 && queueIndex < queue.length - 1) {
      await playQueueItem(queueIndex + 1);
      return;
    }
    // Consecutive next surah
    if (currentTrack && currentTrack.surahNumber < 114) {
      await playSurah(currentTrack.surahNumber + 1, currentTrack.reciterId, currentTrack.moshafId, 0);
    }
  }, [queue, queueIndex, currentTrack, playQueueItem, playSurah]);

  const playPrevious = useCallback(async (): Promise<void> => {
    if (audioRef.current && audioRef.current.currentTime > 4) {
      seek(0);
      return;
    }
    if (queue.length > 0 && queueIndex > 0) {
      await playQueueItem(queueIndex - 1);
      return;
    }
    if (currentTrack && currentTrack.surahNumber > 1) {
      await playSurah(currentTrack.surahNumber - 1, currentTrack.reciterId, currentTrack.moshafId, 0);
    }
  }, [queue, queueIndex, currentTrack, seek, playQueueItem, playSurah]);

  const reorderQueue = useCallback((newQueue: QuranPlaylistItem[]) => {
    setQueue(newQueue);
  }, []);

  const setReciter = useCallback(
    (reciter: QuranAudioReciter, moshafId?: number) => {
      setCurrentReciter(reciter);
      const mId = moshafId || reciter.moshafList[0]?.id || 1;
      const moshaf = reciter.moshafList.find((m) => m.id === mId) || reciter.moshafList[0];
      setCurrentMoshaf(moshaf);

      // If active track is playing, switch reciter seamlessly for current surah
      if (currentSurah) {
        const curSeconds = audioRef.current?.currentTime || 0;
        playSurah(currentSurah.number, reciter.id, mId, curSeconds);
      }
    },
    [currentSurah, playSurah]
  );

  const retryPlayback = useCallback(async (): Promise<void> => {
    if (currentTrack) {
      await playSurah(
        currentTrack.surahNumber,
        currentTrack.reciterId,
        currentTrack.moshafId,
        currentTime
      );
    }
  }, [currentTrack, currentTime, playSurah]);

  // ==============================================================
  // 6. Media Session API Integration
  // ==============================================================
  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentTrack) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `سورة ${currentTrack.surahName}`,
        artist: currentTrack.reciterNameAr,
        album: 'وصل الإسلامية — القرآن الكريم',
        artwork: [
          {
            src: '/branding/wasl-islamic-icon-light.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => {
        resume();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        pause();
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        playPrevious();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        playNext();
      });
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          seek(details.seekTime);
        }
      });
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        skipBackward(details.seekOffset || 10);
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        skipForward(details.seekOffset || 10);
      });
    } catch (e) {
      devWarn('MediaSession error', e);
    }

    return () => {
      try {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('previoustrack', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
        navigator.mediaSession.setActionHandler('seekto', null);
        navigator.mediaSession.setActionHandler('seekbackward', null);
        navigator.mediaSession.setActionHandler('seekforward', null);
      } catch {
        // ignore
      }
    };
  }, [currentTrack, resume, pause, playPrevious, playNext, seek, skipBackward, skipForward]);

  const openFullPlayer = useCallback(() => {
    if (isDebugEnabled()) {
      console.debug('[QuranPlayer] Opening full player');
    }
    setIsFullPlayerOpen(true);
  }, []);

  const closeFullPlayer = useCallback(() => {
    if (isDebugEnabled()) {
      console.debug('[QuranPlayer] Close button clicked');
      console.debug('[QuranPlayer] Closing full player');
      console.debug('[QuranPlayer] isFullPlayerOpen:', isFullPlayerOpen);
    }
    setIsFullPlayerOpen(false);
  }, [isFullPlayerOpen]);

  // Derived Boolean Flags
  const isPlaying = playbackStatus === 'playing';
  const isLoading = playbackStatus === 'loading';
  const isBuffering = playbackStatus === 'buffering';
  const isReady = playbackStatus === 'ready';

  return (
    <QuranAudioContext.Provider
      value={{
        currentTrack,
        currentSurah,
        currentReciter,
        currentMoshaf,
        playbackStatus,
        isPlaying,
        isLoading,
        isBuffering,
        isReady,
        progress,
        currentTime,
        duration,
        volume,
        isMuted,
        playbackSpeed,
        repeatMode,
        queue,
        queueIndex,
        sleepTimer,
        isFullPlayerOpen,
        errorMessage,

        playSurah,
        togglePlay,
        pause,
        resume,
        stop,
        seek,
        seekPercent,
        skipForward,
        skipBackward,
        setVolume,
        toggleMute,
        setPlaybackSpeed,
        setRepeatMode,
        setSleepTimer,
        cancelSleepTimer,
        addToQueue,
        removeFromQueue,
        clearQueue,
        playQueueItem,
        playNext,
        playPrevious,
        reorderQueue,
        setReciter,
        retryPlayback,
        setIsFullPlayerOpen,
        openFullPlayer,
        closeFullPlayer
      }}
    >
      {children}
    </QuranAudioContext.Provider>
  );
};

export function useQuranAudio(): QuranAudioContextType {
  const context = useContext(QuranAudioContext);
  if (!context) {
    throw new Error('useQuranAudio must be used within QuranAudioProvider');
  }
  return context;
}
