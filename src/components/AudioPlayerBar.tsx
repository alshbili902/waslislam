'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  X, 
  RotateCcw, 
  Radio, 
  AlertCircle,
  Loader2,
  Bookmark,
  Check
} from 'lucide-react';
import { RECITERS, Reciter } from '../data/quranMetadata';
import { audioBookmarkManager } from '../utils/audioBookmarkManager.ts';
import { audioSyncEngine } from '../utils/audioSyncEngine.ts';

export interface AudioTrack {
  id: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  audioUrl: string;
  isLiveRadio?: boolean;
  surahNumber?: number;
  ayahNumber?: number;
  seekSeconds?: number;
}

interface AudioPlayerBarProps {
  currentTrack: AudioTrack | null;
  onCloseTrack: () => void;
  onNextTrack?: () => void;
  onPrevTrack?: () => void;
  onTrackChange?: (track: AudioTrack) => void;
  selectedReciterId: string;
  onChangeReciter: (id: string) => void;
  isEnglish: boolean;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  currentTrack,
  onCloseTrack,
  onNextTrack,
  onPrevTrack,
  onTrackChange,
  selectedReciterId,
  onChangeReciter,
  isEnglish
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Audio bookmark modal state
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [bookmarkLabel, setBookmarkLabel] = useState('');
  const [bookmarkNote, setBookmarkNote] = useState('');
  const [bookmarkSuccessMsg, setBookmarkSuccessMsg] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!currentTrack || !currentTrack.audioUrl) {
      setIsPlaying(false);
      return;
    }

    setIsError(false);
    setIsLoading(true);

    if (audioRef.current) {
      audioRef.current.src = currentTrack.audioUrl;
      audioRef.current.load();

      const seekIfNeeded = () => {
        if (audioRef.current && currentTrack.seekSeconds && currentTrack.seekSeconds > 0) {
          try {
            audioRef.current.currentTime = currentTrack.seekSeconds;
            setCurrentTime(currentTrack.seekSeconds);
          } catch (e) {
            console.warn('Seek error:', e);
          }
        }
      };

      audioRef.current.addEventListener('loadedmetadata', seekIfNeeded, { once: true });

      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
          seekIfNeeded();
        })
        .catch((e) => {
          console.warn('Auto-play caught:', e);
          setIsPlaying(false);
          setIsLoading(false);
        });
    }
  }, [currentTrack]);

  const openBookmarkModal = () => {
    if (!currentTrack) return;
    const timeFormatted = formatSeconds(currentTime);
    setBookmarkLabel(`${isEnglish ? currentTrack.titleEn : currentTrack.titleAr} (${timeFormatted})`);
    setBookmarkNote('');
    setShowBookmarkModal(true);
  };

  const handleSaveBookmark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTrack) return;
    audioBookmarkManager.saveBookmark({
      reciterId: selectedReciterId,
      surahNumber: currentTrack.surahNumber || 1,
      ayahNumber: currentTrack.ayahNumber,
      timestampSeconds: currentTime,
      audioUrl: currentTrack.audioUrl,
      label: bookmarkLabel,
      note: bookmarkNote
    });
    setBookmarkSuccessMsg(isEnglish ? 'Bookmark saved successfully!' : 'تم حفظ موضع الاستماع بنجاح');
    setTimeout(() => {
      setBookmarkSuccessMsg(null);
      setShowBookmarkModal(false);
    }, 1200);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch(() => {
          setIsError(true);
          setIsLoading(false);
        });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (audioRef.current && !currentTrack?.isLiveRadio) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleLoop = () => {
    if (audioRef.current) {
      audioRef.current.loop = !isLooping;
      setIsLooping(!isLooping);
    }
  };

  const cycleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 0.75];
    const next = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
    setPlaybackSpeed(next);
    if (audioRef.current) {
      audioRef.current.playbackRate = next;
    }
  };

  const formatSeconds = (sec: number) => {
    if (isNaN(sec) || sec <= 0) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleNextTrack = () => {
    if (audioSyncEngine.getState().isSyncActive) {
      const nextTrack = audioSyncEngine.handleAyahEnded();
      if (nextTrack && onTrackChange) {
        onTrackChange(nextTrack);
        return;
      }
    }
    if (onNextTrack) onNextTrack();
  };

  const handlePrevTrack = () => {
    if (audioSyncEngine.getState().isSyncActive) {
      const prevTrack = audioSyncEngine.getPreviousAyah();
      if (prevTrack && onTrackChange) {
        onTrackChange(prevTrack);
        return;
      }
    }
    if (onPrevTrack) onPrevTrack();
  };

  if (!currentTrack) return null;

  const currentReciter = RECITERS.find(r => r.id === selectedReciterId) || RECITERS[0];

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration || 0);
            setIsLoading(false);
          }
        }}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => {
          setIsLoading(false);
          setIsPlaying(true);
        }}
        onError={() => {
          setIsError(true);
          setIsLoading(false);
          setIsPlaying(false);
        }}
        onEnded={() => {
          if (!isLooping && audioSyncEngine.getState().isSyncActive) {
            const nextTrack = audioSyncEngine.handleAyahEnded();
            if (nextTrack && onTrackChange) {
              onTrackChange(nextTrack);
              return;
            }
          }
          if (!isLooping && onNextTrack) {
            onNextTrack();
          } else if (!isLooping) {
            setIsPlaying(false);
          }
        }}
      />

      {/* Mini Player Bar (Fixed above mobile bottom nav) */}
      <aside 
        aria-label="مُشغّل الصوت القرآني"
        className={`fixed left-2 right-2 lg:left-8 lg:right-8 z-40 wasl-audio-bar-entrance ${
          isExpanded ? 'hidden' : 'bottom-16 lg:bottom-4'
        }`}
      >
        <div className="bg-[var(--bg-card)]/95 backdrop-blur-xl border border-[var(--border-gold)] rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-3 wasl-card">
          {/* Track Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--gold)] flex items-center justify-center shrink-0 shadow-md">
              {currentTrack.isLiveRadio ? (
                <Radio className="w-6 h-6 text-white animate-pulse" />
              ) : (
                <span className="text-white font-quran font-bold text-lg">وصل</span>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-[var(--text-main)] truncate font-cairo">
                {isEnglish ? currentTrack.titleEn : currentTrack.titleAr}
              </h2>
              <p className="text-xs text-[var(--text-muted)] truncate font-tajawal">
                {currentTrack.isLiveRadio
                  ? (isEnglish ? 'Live Islamic Stream' : 'بث مباشر حي')
                  : (isEnglish ? currentReciter.nameEn : currentReciter.nameAr)}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {(onPrevTrack || currentTrack.ayahNumber) && !currentTrack.isLiveRadio && (
              <button
                onClick={handlePrevTrack}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-lg transition-colors cursor-pointer touch-manipulation"
                title="السابق"
                aria-label="Previous"
              >
                <SkipBack className="w-4 h-4 pointer-events-none" />
              </button>
            )}

            <button
              onClick={togglePlay}
              disabled={isLoading && !isPlaying}
              className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer touch-manipulation"
              title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 mr-0.5" />
              )}
            </button>

            {(onNextTrack || currentTrack.ayahNumber) && !currentTrack.isLiveRadio && (
              <button
                onClick={handleNextTrack}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-lg transition-colors cursor-pointer touch-manipulation"
                title="التالي"
                aria-label="Next"
              >
                <SkipForward className="w-4 h-4 pointer-events-none" />
              </button>
            )}

            {!currentTrack.isLiveRadio && (
              <button
                onClick={openBookmarkModal}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--gold)] hover:bg-[var(--gold)]/10 rounded-lg transition-colors cursor-pointer touch-manipulation"
                title={isEnglish ? 'Save Audio Bookmark' : 'حفظ موضع الاستماع'}
                aria-label="Save Audio Bookmark"
              >
                <Bookmark className="w-4 h-4 pointer-events-none" />
              </button>
            )}

            <button
              onClick={() => setIsExpanded(true)}
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-lg transition-colors cursor-pointer touch-manipulation"
              title="تكبير المشغل"
              aria-label="Expand Player"
            >
              <Maximize2 className="w-4 h-4 pointer-events-none" />
            </button>

            <button
              onClick={onCloseTrack}
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--text-muted)] hover:text-red-500 rounded-lg transition-colors cursor-pointer touch-manipulation"
              title="إغلاق المشغل"
              aria-label="Close"
            >
              <X className="w-4 h-4 pointer-events-none" />
            </button>
          </div>
        </div>

        {/* Error Alert if stream failed */}
        {isError && (
          <div className="mt-1 bg-red-500/10 border border-red-500/30 text-red-500 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              {isEnglish ? 'Audio stream temporarily unavailable' : 'تعذر تحميل المقطع الصوتي، يرجى التحقق من الاتصال بالإنترنت'}
            </span>
          </div>
        )}
      </aside>

      {/* Full Expanded Player Modal */}
      {isExpanded && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-label={isEnglish ? 'Expanded Audio Player' : 'مشغل الصوت الشامل'}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsExpanded(false);
          }}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 wasl-modal-backdrop"
        >
          <div className="bg-[var(--bg-card)] border border-[var(--border-gold)] rounded-3xl max-w-lg w-full p-6 shadow-2xl relative wasl-modal-dialog">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setIsExpanded(false)}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-[var(--bg-card-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer touch-manipulation"
                title="تصغير"
                aria-label="Minimize"
              >
                <Minimize2 className="w-5 h-5 pointer-events-none" />
              </button>
              <div className="text-center">
                <span className="text-xs uppercase font-bold tracking-widest text-[var(--gold)]">
                  {currentTrack.isLiveRadio ? (isEnglish ? 'Live Radio' : 'بث إذاعي مباشر') : (isEnglish ? 'Quran Audio' : 'تلاوة عطرة')}
                </span>
                <h3 className="font-bold text-base text-[var(--text-main)]">
                  {isEnglish ? 'Wasl Islamic Player' : 'مشغل وصل الإسلامية'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsExpanded(false);
                  onCloseTrack();
                }}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-[var(--bg-card-subtle)] text-[var(--text-muted)] hover:text-red-500 transition-colors cursor-pointer touch-manipulation"
                title="إغلاق"
                aria-label="Close player"
              >
                <X className="w-5 h-5 pointer-events-none" />
              </button>
            </div>

            {/* Artwork / Visualizer */}
            <div className="relative my-6 flex flex-col items-center justify-center">
              <div className="w-40 h-40 rounded-full bg-gradient-to-tr from-[var(--primary)] via-[var(--accent-teal)] to-[var(--gold)] p-1.5 shadow-2xl animate-spin-slow">
                <div className="w-full h-full bg-[var(--bg-card)] rounded-full flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-[var(--primary-light)] flex items-center justify-center mb-2">
                    <Radio className={`w-8 h-8 text-[var(--primary)] ${isPlaying ? 'animate-pulse' : ''}`} />
                  </div>
                  <span className="font-quran text-lg font-bold text-[var(--text-main)]">
                    {isEnglish ? 'Wasl' : 'وَصْل'}
                  </span>
                </div>
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-black text-[var(--text-main)] font-cairo">
                {isEnglish ? currentTrack.titleEn : currentTrack.titleAr}
              </h2>
              <p className="text-sm text-[var(--text-muted)] font-tajawal mt-1">
                {isEnglish ? currentTrack.subtitleEn : currentTrack.subtitleAr}
              </p>
            </div>

            {/* Reciter Selector (When playing Quran) */}
            {!currentTrack.isLiveRadio && (
              <div className="mb-6 bg-[var(--bg-card-subtle)] p-3 rounded-2xl border border-[var(--border-color)]">
                <label className="block text-xs font-bold text-[var(--text-muted)] mb-1.5">
                  {isEnglish ? 'Reciter' : 'القارئ المعتمد:'}
                </label>
                <select
                  value={selectedReciterId}
                  onChange={(e) => onChangeReciter(e.target.value)}
                  className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-sm font-semibold text-[var(--text-main)] focus:outline-none focus:border-[var(--gold)]"
                >
                  {RECITERS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nameAr} ({r.style})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Progress Slider (Non-radio only) */}
            {!currentTrack.isLiveRadio && (
              <div className="mb-6">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full accent-[var(--primary)] cursor-pointer h-1.5 rounded-lg bg-[var(--border-color)]"
                />
                <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1 font-mono">
                  <span>{formatSeconds(currentTime)}</span>
                  <span>{formatSeconds(duration)}</span>
                </div>
              </div>
            )}

            {/* Player Main Controls */}
            <div className="flex items-center justify-center gap-4 mb-6">
              {!currentTrack.isLiveRadio && (
                <button
                  onClick={toggleLoop}
                  className={`p-3 rounded-xl transition-colors ${
                    isLooping ? 'bg-[var(--gold-light)] text-[var(--gold)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                  title="تكرار الآية"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              )}

              {(onPrevTrack || currentTrack.ayahNumber) && !currentTrack.isLiveRadio && (
                <button
                  onClick={handlePrevTrack}
                  className="p-3 text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)] rounded-xl transition-colors"
                  title="السابق"
                >
                  <SkipBack className="w-6 h-6" />
                </button>
              )}

              <button
                onClick={togglePlay}
                disabled={isLoading && !isPlaying}
                className="w-16 h-16 rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--gold)] text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
                title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
              >
                {isLoading ? (
                  <Loader2 className="w-7 h-7 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-7 h-7" />
                ) : (
                  <Play className="w-7 h-7 mr-0.5" />
                )}
              </button>

              {(onNextTrack || currentTrack.ayahNumber) && !currentTrack.isLiveRadio && (
                <button
                  onClick={handleNextTrack}
                  className="p-3 text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)] rounded-xl transition-colors"
                  title="التالي"
                >
                  <SkipForward className="w-6 h-6" />
                </button>
              )}

              {!currentTrack.isLiveRadio && (
                <button
                  onClick={cycleSpeed}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-[var(--bg-card-subtle)] text-[var(--text-main)] hover:border-[var(--gold)] border border-[var(--border-color)] transition-colors"
                  title="سرعة التلاوة"
                >
                  {playbackSpeed}x
                </button>
              )}

              <button
                onClick={toggleMute}
                className="p-3 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                title="كتم الصوت"
              >
                {isMuted ? <VolumeX className="w-5 h-5 text-red-500" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>

            {/* Bookmark action in expanded player */}
            {!currentTrack.isLiveRadio && (
              <div className="pt-4 border-t border-[var(--border-color)] flex items-center justify-between">
                <button
                  onClick={openBookmarkModal}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[var(--gold)]/10 text-[var(--gold)] hover:bg-[var(--gold)]/20 border border-[var(--gold)]/30 transition-all"
                >
                  <Bookmark className="w-4 h-4" />
                  <span>{isEnglish ? 'Save Audio Bookmark' : 'حفظ موضع الاستماع'}</span>
                </button>
                <span className="text-xs text-[var(--text-muted)] font-mono">
                  {formatSeconds(currentTime)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Audio Bookmark Modal */}
      {showBookmarkModal && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-label={isEnglish ? 'Save Audio Bookmark' : 'حفظ موضع الاستماع'}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowBookmarkModal(false);
          }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-[var(--bg-card)] border border-[var(--border-gold)] rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[var(--gold)]/10 flex items-center justify-center text-[var(--gold)]">
                  <Bookmark className="w-5 h-5 pointer-events-none" />
                </div>
                <h3 className="font-bold text-base text-[var(--text-main)] font-cairo">
                  {isEnglish ? 'Save Audio Bookmark' : 'حفظ موضع الاستماع'}
                </h3>
              </div>
              <button
                onClick={() => setShowBookmarkModal(false)}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer touch-manipulation"
                aria-label="Close"
              >
                <X className="w-5 h-5 pointer-events-none" />
              </button>
            </div>

            {bookmarkSuccessMsg ? (
              <div className="py-8 text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <p className="font-bold text-sm text-[var(--text-main)]">{bookmarkSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleSaveBookmark} className="space-y-4">
                <div className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] flex items-center justify-between">
                  <div>
                    <div className="text-xs text-[var(--text-muted)]">{isEnglish ? 'Current Surah' : 'السورة والقارئ'}</div>
                    <div className="text-sm font-bold text-[var(--text-main)]">{isEnglish ? currentTrack?.titleEn : currentTrack?.titleAr}</div>
                  </div>
                  <div className="px-3 py-1 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] font-mono font-bold text-sm">
                    {formatSeconds(currentTime)}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] mb-1.5">
                    {isEnglish ? 'Bookmark Label' : 'عنوان العلامة'}
                  </label>
                  <input
                    type="text"
                    value={bookmarkLabel}
                    onChange={(e) => setBookmarkLabel(e.target.value)}
                    required
                    placeholder={isEnglish ? 'e.g. Beautiful ayah reflection' : 'مثال: موضع تدبر آية الكرسي'}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--gold)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] mb-1.5">
                    {isEnglish ? 'Personal Note (Optional)' : 'ملاحظة شخصية (اختياري)'}
                  </label>
                  <textarea
                    rows={3}
                    value={bookmarkNote}
                    onChange={(e) => setBookmarkNote(e.target.value)}
                    placeholder={isEnglish ? 'Write a reflection or reminder...' : 'اكتب فائدة أو سبب الحفظ...'}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--gold)] resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBookmarkModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-[var(--border-color)] text-sm font-semibold text-[var(--text-muted)] hover:bg-[var(--bg-card-subtle)] transition-colors"
                  >
                    {isEnglish ? 'Cancel' : 'إلغاء'}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--gold)] text-white text-sm font-bold shadow-lg hover:opacity-95 transition-all"
                  >
                    {isEnglish ? 'Save Bookmark' : 'حفظ العلامة'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};
