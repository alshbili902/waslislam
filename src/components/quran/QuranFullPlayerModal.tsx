import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Repeat,
  Repeat1,
  ListMusic,
  Clock,
  Download,
  Share2,
  Heart,
  ChevronDown,
  Sparkles,
  BookOpen,
  UserCheck,
  Check,
  Sliders,
  AlertCircle
} from 'lucide-react';
import { useQuranAudio } from '../../context/QuranAudioContext';
import { useShareModal } from '../../context/ShareContext';
import { ReciterService, PlaybackService } from '../../services/quranAudioService';
import { QuranSleepTimerMinutes } from '../../types/quranAudio';
import { useModalScrollLock } from '../../hooks/useModalScrollLock';

export const QuranFullPlayerModal: React.FC = () => {
  const {
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

    togglePlay,
    playNext,
    playPrevious,
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
    removeFromQueue,
    clearQueue,
    playQueueItem,
    setReciter,
    retryPlayback,
    setIsFullPlayerOpen,
    closeFullPlayer
  } = useQuranAudio();

  const { openShareModal } = useShareModal();

  // Local popups
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showSleepMenu, setShowSleepMenu] = useState(false);
  const [showQueueDrawer, setShowQueueDrawer] = useState(false);
  const [showReciterDrawer, setShowReciterDrawer] = useState(false);
  const [isFav, setIsFav] = useState(false);

  // Available reciters for switcher
  const availableReciters = ReciterService.getReciters();

  const isOpen = Boolean(isFullPlayerOpen && currentTrack && currentSurah && currentReciter);

  // Hook handles body scroll lock, backdrop isolation & Escape key press
  useModalScrollLock(isOpen, {
    onClose: closeFullPlayer,
    closeOnEsc: true
  });

  useEffect(() => {
    if (currentTrack && currentSurah) {
      const favId = `recitation:${currentTrack.reciterId}:${currentSurah.number}`;
      setIsFav(PlaybackService.isFavorite(favId));
    }
  }, [currentTrack, currentSurah]);

  // Keyboard navigation for playback
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowRight') {
        skipForward(10);
      } else if (e.key === 'ArrowLeft') {
        skipBackward(10);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, togglePlay, skipForward, skipBackward]);


  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const remainingTime = Math.max(0, duration - currentTime);

  const toggleFavoriteRecitation = async () => {
    const favId = `recitation:${currentTrack.reciterId}:${currentSurah.number}`;
    const added = await PlaybackService.toggleFavorite({
      id: favId,
      type: 'recitation',
      targetId: `${currentTrack.reciterId}:${currentSurah.number}`,
      titleAr: `سورة ${currentSurah.name}`,
      subtitleAr: `بصوت ${currentReciter.nameAr} (${currentTrack.riwayahName})`
    });
    setIsFav(added);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `استمع إلى سورة ${currentSurah.name} بصوت ${currentReciter.nameAr}`,
        text: `استمع إلى سورة ${currentSurah.name} (${currentSurah.revelationTypeAr} - ${currentSurah.numberOfAyahs} آية) بصوت القارئ ${currentReciter.nameAr} عبر منصة وصل الإسلامية.`,
        url: window.location.origin + `/quran/listen/${currentSurah.number}`
      }).catch(() => {
        // Fallback to Share Card Studio
        triggerShareCardStudio();
      });
    } else {
      triggerShareCardStudio();
    }
  };

  const triggerShareCardStudio = () => {
    openShareModal({
      type: 'quran',
      sectionName: 'الاستماع للقرآن',
      contentType: 'تلاوة قرآنية',
      surahName: currentSurah.name,
      title: `سورة ${currentSurah.name}`,
      text: `سورة ${currentSurah.name} • ${currentSurah.revelationTypeAr} • ${currentSurah.numberOfAyahs} آية`,
      subtext: `بصوت القارئ: ${currentReciter.nameAr} (${currentTrack.riwayahName})`,
      reference: `وصل الإسلامية — الاستماع للقرآن الكريم`,
      url: window.location.origin + `/quran/listen/${currentSurah.number}`
    });
  };

  const handleDownload = () => {
    if (!currentTrack.audioUrl) return;
    const a = document.createElement('a');
    a.href = currentTrack.audioUrl;
    a.download = `سورة_${currentSurah.name}_${currentReciter.nameAr}.mp3`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];
  const sleepTimerOptions: { value: QuranSleepTimerMinutes; label: string }[] = [
    { value: 5, label: '5 دقائق' },
    { value: 10, label: '10 دقائق' },
    { value: 15, label: '15 دقيقة' },
    { value: 30, label: '30 دقيقة' },
    { value: 45, label: '45 دقيقة' },
    { value: 60, label: '60 دقيقة' },
    { value: 'end-of-surah', label: 'نهاية السورة' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="quran-full-player-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-label="مشغل القرآن الكريم الكامل"
          className="wasl-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-xl overscroll-contain select-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeFullPlayer();
            }
          }}
        >
          <motion.div
            key="quran-full-player-dialog"
            initial={{ opacity: 0, scale: 0.96, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 30 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-2xl bg-gradient-to-b from-[#031d16] via-[#021812] to-[#01100c] text-white sm:rounded-3xl border border-emerald-500/30 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Top Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-emerald-800/40 bg-emerald-950/40 shrink-0">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-900/60 text-amber-300 border border-emerald-700/50">
                  <BookOpen className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-emerald-100 font-tajawal">
                    مشغل القرآن الكريم
                  </h3>
                  <span className="text-[11px] text-emerald-400">
                    وصل الإسلامية • تلاوة مباركة
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowReciterDrawer(!showReciterDrawer)}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800/70 text-xs font-semibold text-emerald-200 border border-emerald-700/50 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="تغيير القارئ"
                >
                  <UserCheck className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline">تغيير القارئ</span>
                </button>

                {/* X Close Button - Reliable, Accessible, and Priority Z-Index */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    closeFullPlayer();
                  }}
                  className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all z-20 cursor-pointer flex items-center justify-center min-w-[40px] min-h-[40px]"
                  title="إغلاق المشغل الكامل"
                  aria-label="إغلاق المشغل"
                >
                  <X className="w-5 h-5 text-slate-200 hover:text-white" />
                </button>
              </div>
            </div>

          {/* Modal Main Body */}
          <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col items-center justify-center wasl-modal-scrollable">
            {/* Islamic Visual Card */}
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-3xl bg-gradient-to-br from-emerald-800/50 via-teal-900/60 to-emerald-950 border-2 border-emerald-400/30 flex flex-col items-center justify-center shadow-2xl p-4 text-center my-2 overflow-hidden group">
              {/* Subtle background arabesque glow */}
              <div className="absolute inset-0 bg-arabesque-subtle opacity-15" />
              <div className="absolute inset-0 bg-radial from-amber-400/10 via-transparent to-transparent" />

              {/* Animated pulsating ring if playing */}
              {isPlaying && (
                <div className="absolute inset-0 rounded-3xl border border-amber-300/30 animate-pulse pointer-events-none" />
              )}

              <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-emerald-950/80 text-amber-300 border border-emerald-600/40 mb-2 relative z-10">
                السورة {currentSurah.number.toString().padStart(3, '0')}
              </span>

              <h2 className="font-quran text-3xl sm:text-4xl text-emerald-50 font-bold mb-1 relative z-10 drop-shadow-md">
                سورة {currentSurah.name}
              </h2>

              <span className="text-xs text-emerald-300 font-semibold relative z-10">
                {currentSurah.revelationTypeAr} • {currentSurah.numberOfAyahs} آية
              </span>

              <span className="text-[10px] text-slate-300 mt-1 relative z-10">
                الجزء {currentSurah.juz} • صفحة {currentSurah.page}
              </span>
            </div>

            {/* Reciter & Riwayah Info */}
            <div className="text-center mt-4 max-w-md w-full">
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center justify-center gap-2">
                <span>{currentReciter.nameAr}</span>
              </h3>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-900/60 text-amber-300 border border-emerald-600/40 font-medium">
                  {currentTrack.riwayahName}
                </span>
                {/* Explicit Playback Status Badge */}
                {isBuffering && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-950/70 text-amber-300 border border-amber-600/40 font-medium animate-pulse flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    <span>جاري التخزين المؤقت...</span>
                  </span>
                )}
                {isLoading && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-950/70 text-teal-300 border border-teal-600/40 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                    <span>جاري تحميل التلاوة...</span>
                  </span>
                )}
                {playbackStatus === 'ended' && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-600/40 font-medium">
                    انتهت السورة
                  </span>
                )}
              </div>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mt-4 w-full max-w-md p-3 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
                <button
                  onClick={retryPlayback}
                  className="px-2.5 py-1 rounded-lg bg-rose-800 text-white font-bold hover:bg-rose-700 transition-colors shrink-0 cursor-pointer"
                >
                  إعادة المحاولة
                </button>
              </div>
            )}

            {/* Seek Bar with Timestamps */}
            <div className="w-full max-w-md mt-6">
              <div
                role="slider"
                aria-label="شريط تقديم التلاوة"
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
                tabIndex={0}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = ((e.clientX - rect.left) / rect.width) * 100;
                  seekPercent(Math.min(100, Math.max(0, pct)));
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                    seekPercent(Math.min(100, progress + 5));
                  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                    seekPercent(Math.max(0, progress - 5));
                  }
                }}
                className="w-full h-2 sm:h-2.5 bg-emerald-950/90 rounded-full cursor-pointer relative overflow-hidden group shadow-inner border border-emerald-800/40"
              >
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 font-mono mt-2">
                <span>{formatTime(currentTime)}</span>
                <span>-{formatTime(remainingTime)}</span>
              </div>
            </div>

            {/* Primary Controls Row */}
            <div className="flex items-center justify-center gap-3 sm:gap-5 mt-4 w-full max-w-md">
              {/* Skip Back 10s */}
              <button
                onClick={() => skipBackward(10)}
                className="p-2.5 rounded-full text-slate-300 hover:text-white hover:bg-emerald-900/40 transition-colors"
                title="تأخير 10 ثوانٍ"
                aria-label="تأخير 10 ثوانٍ"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              {/* Previous Surah */}
              <button
                onClick={playPrevious}
                className="p-3 rounded-2xl text-slate-200 hover:text-white hover:bg-emerald-900/50 transition-colors active:scale-95"
                title="السورة السابقة"
                aria-label="السورة السابقة"
              >
                <SkipForward className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Large Play / Pause button */}
              <button
                onClick={togglePlay}
                aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل التلاوة'}
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 hover:from-emerald-300 hover:to-amber-200 text-slate-950 flex items-center justify-center shadow-xl shadow-emerald-500/30 active:scale-95 transition-all cursor-pointer"
                title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-3 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-7 h-7 sm:w-8 sm:h-8 fill-current" />
                ) : (
                  <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current ml-1" />
                )}
              </button>

              {/* Next Surah */}
              <button
                onClick={playNext}
                className="p-3 rounded-2xl text-slate-200 hover:text-white hover:bg-emerald-900/50 transition-colors active:scale-95"
                title="السورة التالية"
                aria-label="السورة التالية"
              >
                <SkipBack className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Skip Forward 10s */}
              <button
                onClick={() => skipForward(10)}
                className="p-2.5 rounded-full text-slate-300 hover:text-white hover:bg-emerald-900/40 transition-colors"
                title="تقديم 10 ثوانٍ"
                aria-label="تقديم 10 ثوانٍ"
              >
                <RotateCw className="w-5 h-5" />
              </button>
            </div>

            {/* Secondary Controls Bar */}
            <div className="grid grid-cols-5 gap-1 sm:gap-2 mt-6 w-full max-w-md border-t border-emerald-900/50 pt-4">
              {/* Playback Speed */}
              <div className="relative flex justify-center">
                <button
                  onClick={() => {
                    setShowSpeedMenu(!showSpeedMenu);
                    setShowSleepMenu(false);
                  }}
                  className={`p-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-colors ${
                    playbackSpeed !== 1 ? 'text-amber-300 bg-emerald-900/60' : 'text-slate-300 hover:text-white'
                  }`}
                  title="سرعة التلاوة"
                >
                  <Sliders className="w-4 h-4" />
                  <span>{playbackSpeed}x</span>
                </button>

                {showSpeedMenu && (
                  <div className="absolute bottom-full mb-2 bg-slate-900 border border-emerald-600/40 rounded-2xl p-2 shadow-2xl z-50 w-28 flex flex-col gap-1">
                    <span className="text-[10px] text-emerald-400 font-bold px-2 py-1 border-b border-slate-800">
                      سرعة التلاوة
                    </span>
                    {speedOptions.map((spd) => (
                      <button
                        key={spd}
                        onClick={() => {
                          setPlaybackSpeed(spd);
                          setShowSpeedMenu(false);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-right transition-colors ${
                          playbackSpeed === spd
                            ? 'bg-emerald-700 text-white font-bold'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {spd}x {spd === 1 ? '(الافتراضي)' : ''}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Repeat Mode */}
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    if (repeatMode === 'off') setRepeatMode('surah');
                    else if (repeatMode === 'surah') setRepeatMode('queue');
                    else setRepeatMode('off');
                  }}
                  className={`p-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-colors ${
                    repeatMode !== 'off' ? 'text-amber-300 bg-emerald-900/60' : 'text-slate-300 hover:text-white'
                  }`}
                  title={
                    repeatMode === 'surah'
                      ? 'تكرار السورة مفعل'
                      : repeatMode === 'queue'
                      ? 'تكرار القائمة مفعل'
                      : 'بدون تكرار'
                  }
                >
                  {repeatMode === 'surah' ? (
                    <Repeat1 className="w-4 h-4 text-amber-300" />
                  ) : (
                    <Repeat className="w-4 h-4" />
                  )}
                  <span className="text-[10px]">
                    {repeatMode === 'surah' ? 'السورة' : repeatMode === 'queue' ? 'القائمة' : 'تكرار'}
                  </span>
                </button>
              </div>

              {/* Sleep Timer */}
              <div className="relative flex justify-center">
                <button
                  onClick={() => {
                    setShowSleepMenu(!showSleepMenu);
                    setShowSpeedMenu(false);
                  }}
                  className={`p-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-colors ${
                    sleepTimer ? 'text-amber-300 bg-emerald-900/60' : 'text-slate-300 hover:text-white'
                  }`}
                  title="مؤقت النوم"
                >
                  <Clock className="w-4 h-4" />
                  <span className="text-[10px]">
                    {sleepTimer ? `${Math.ceil(sleepTimer.remainingSeconds / 60)}د` : 'المؤقت'}
                  </span>
                </button>

                {showSleepMenu && (
                  <div className="absolute bottom-full mb-2 bg-slate-900 border border-emerald-600/40 rounded-2xl p-2 shadow-2xl z-50 w-36 flex flex-col gap-1">
                    <span className="text-[10px] text-emerald-400 font-bold px-2 py-1 border-b border-slate-800">
                      مؤقت النوم
                    </span>
                    {sleepTimerOptions.map((opt) => (
                      <button
                        key={String(opt.value)}
                        onClick={() => {
                          setSleepTimer(opt.value);
                          setShowSleepMenu(false);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-right text-slate-300 hover:bg-slate-800 transition-colors"
                      >
                        {opt.label}
                      </button>
                    ))}
                    {sleepTimer && (
                      <button
                        onClick={() => {
                          cancelSleepTimer();
                          setShowSleepMenu(false);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-right text-rose-400 hover:bg-rose-950/60 border-t border-slate-800 transition-colors mt-1"
                      >
                        إلغاء المؤقت
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Playlist Queue */}
              <div className="flex justify-center">
                <button
                  onClick={() => setShowQueueDrawer(!showQueueDrawer)}
                  className={`p-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-colors ${
                    queue.length > 0 ? 'text-amber-300 bg-emerald-900/60' : 'text-slate-300 hover:text-white'
                  }`}
                  title="قائمة التشغيل"
                >
                  <ListMusic className="w-4 h-4" />
                  <span className="text-[10px]">
                    {queue.length > 0 ? `${queue.length}` : 'القائمة'}
                  </span>
                </button>
              </div>

              {/* Favorite Recitation */}
              <div className="flex justify-center">
                <button
                  onClick={toggleFavoriteRecitation}
                  className={`p-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-colors ${
                    isFav ? 'text-rose-400 bg-rose-950/40' : 'text-slate-300 hover:text-white'
                  }`}
                  title={isFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                >
                  <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span className="text-[10px]">المفضلة</span>
                </button>
              </div>
            </div>

            {/* Bottom Actions Row: Volume, Share, Download */}
            <div className="flex items-center justify-between gap-4 mt-5 w-full max-w-md pt-3 border-t border-emerald-900/40">
              {/* Volume Slider */}
              <div className="flex items-center gap-2 flex-1 max-w-[170px]">
                <button
                  onClick={toggleMute}
                  className="text-slate-400 hover:text-white p-1"
                  title={isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  title="مستوى الصوت"
                />
              </div>

              {/* Share & Download buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleShare}
                  className="p-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-emerald-700/50"
                  title="مشاركة التلاوة عبر استوديو البطاقات"
                >
                  <Share2 className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline">مشاركة</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="p-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-emerald-700/50"
                  title="تحميل الملف الصوتي"
                >
                  <Download className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline">تحميل</span>
                </button>
              </div>
            </div>
          </div>

          {/* Queue Drawer Overlay */}
          <AnimatePresence>
            {showQueueDrawer && (
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="absolute inset-x-0 bottom-0 top-16 bg-slate-950/95 backdrop-blur-2xl z-40 p-5 flex flex-col"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <div className="flex items-center gap-2">
                    <ListMusic className="w-4 h-4 text-amber-400" />
                    <h4 className="font-bold text-sm text-white">قائمة التشغيل ({queue.length})</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    {queue.length > 0 && (
                      <button
                        onClick={clearQueue}
                        className="text-xs text-rose-400 hover:underline"
                      >
                        مسح القائمة
                      </button>
                    )}
                    <button
                      onClick={() => setShowQueueDrawer(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-1.5">
                  {queue.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      قائمة التشغيل فارغة حاليًا. يمكنك إضافة أي سورة للقائمة من صفحة الاستماع.
                    </div>
                  ) : (
                    queue.map((item, idx) => (
                      <div
                        key={`${item.surahNumber}-${idx}`}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
                          queueIndex === idx
                            ? 'bg-emerald-900/60 border-emerald-500/50 text-amber-300'
                            : 'bg-slate-900/80 border-slate-800 text-slate-200 hover:border-emerald-700/40'
                        }`}
                      >
                        <button
                          onClick={() => playQueueItem(idx)}
                          className="flex items-center gap-2.5 text-right flex-1 min-w-0"
                        >
                          <span className="w-6 h-6 rounded-md bg-emerald-950 flex items-center justify-center text-xs font-mono text-emerald-400">
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <span className="font-bold text-xs block truncate">سورة {item.surahName}</span>
                            <span className="text-[10px] text-slate-400 block truncate">{item.reciterNameAr}</span>
                          </div>
                        </button>
                        <button
                          onClick={() => removeFromQueue(idx)}
                          className="p-1 text-slate-400 hover:text-rose-400"
                          title="حذف من القائمة"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reciter Selector Drawer */}
          <AnimatePresence>
            {showReciterDrawer && (
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="absolute inset-x-0 bottom-0 top-16 bg-slate-950/95 backdrop-blur-2xl z-40 p-5 flex flex-col"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-amber-400" />
                    <h4 className="font-bold text-sm text-white">اختر القارئ لسورة {currentSurah.name}</h4>
                  </div>
                  <button
                    onClick={() => setShowReciterDrawer(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2">
                  {availableReciters.map((r) => {
                    const isSelected = r.id === currentReciter.id;
                    return (
                      <button
                        key={r.id}
                        onClick={() => {
                          setReciter(r);
                          setShowReciterDrawer(false);
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-2xl border text-right transition-colors ${
                          isSelected
                            ? 'bg-emerald-900/60 border-emerald-500/60 text-amber-300'
                            : 'bg-slate-900/80 border-slate-800 text-slate-200 hover:border-emerald-700/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-950 flex items-center justify-center font-bold text-sm text-emerald-300 border border-emerald-700/40">
                            {r.letter}
                          </div>
                          <div>
                            <span className="font-bold text-xs sm:text-sm block">{r.nameAr}</span>
                            <span className="text-[10px] text-slate-400 block">{r.riwayah}</span>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
};
