import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  SkipBack,
  Maximize2,
  X,
  Volume2,
  VolumeX,
  Sparkles,
  BookOpen,
  AlertCircle,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { useQuranAudio } from '../../context/QuranAudioContext';

interface Props {
  onExpand?: () => void;
}

export const QuranMiniPlayer: React.FC<Props> = ({ onExpand }) => {
  const {
    currentTrack,
    currentSurah,
    currentReciter,
    playbackStatus,
    isPlaying,
    isLoading,
    isBuffering,
    errorMessage,
    progress,
    currentTime,
    duration,
    togglePlay,
    playNext,
    stop,
    seekPercent,
    isMuted,
    toggleMute,
    retryPlayback,
    setIsFullPlayerOpen,
    openFullPlayer,
    isFullPlayerOpen
  } = useQuranAudio();

  const isVisible = Boolean(currentTrack && currentSurah && currentReciter && !isFullPlayerOpen);

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleOpenFull = () => {
    openFullPlayer();
  };

  // Status subtitle display
  const renderStatusText = () => {
    if (errorMessage) {
      return (
        <span className="text-rose-400 text-[11px] truncate flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{errorMessage}</span>
        </span>
      );
    }
    if (isBuffering) {
      return (
        <span className="text-amber-300 text-[11px] truncate flex items-center gap-1 animate-pulse">
          <Loader2 className="w-3 h-3 animate-spin shrink-0" />
          <span>جاري التخزين المؤقت...</span>
        </span>
      );
    }
    if (isLoading) {
      return (
        <span className="text-teal-300 text-[11px] truncate flex items-center gap-1">
          <Loader2 className="w-3 h-3 animate-spin shrink-0" />
          <span>جاري تحميل التلاوة...</span>
        </span>
      );
    }
    return (
      <div className="flex items-center gap-2 text-[11px] text-slate-300 truncate">
        <span className="truncate">{currentReciter.nameAr}</span>
        <span className="text-emerald-500">•</span>
        <span className="text-[10px] text-emerald-400 truncate">{currentTrack.riwayahName}</span>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.aside
          key="quran-mini-player"
          aria-label="مشغل القرآن المصغر"
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-16 lg:bottom-4 left-0 right-0 z-40 px-3 sm:px-6 pointer-events-none"
        >
          <div className="max-w-4xl mx-auto pointer-events-auto bg-gradient-to-r from-emerald-950 via-slate-950 to-emerald-950 text-white rounded-2xl shadow-2xl border border-emerald-500/30 backdrop-blur-xl p-2.5 sm:p-3.5 transition-all">
            {/* Seekable Progress Bar with hover */}
            <div
              role="slider"
              aria-label="شريط تقدم التلاوة"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              tabIndex={0}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const pct = (clickX / rect.width) * 100;
                seekPercent(Math.min(100, Math.max(0, pct)));
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                  seekPercent(Math.min(100, progress + 5));
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                  seekPercent(Math.max(0, progress - 5));
                }
              }}
              className="w-full h-1.5 bg-emerald-950/80 hover:h-2 rounded-full mb-2.5 cursor-pointer relative overflow-hidden transition-all group"
            >
              <div
                className={`h-full rounded-full transition-all duration-150 ${
                  errorMessage
                    ? 'bg-rose-500'
                    : 'bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between gap-2 sm:gap-4">
              {/* Clickable Info Area that opens Full Player */}
              <div
                onClick={handleOpenFull}
                className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 cursor-pointer group"
                title="اضغط لتكبير مشغل القرآن"
              >
                {/* Surah Number / Islamic Badge */}
                <div className="relative shrink-0">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-emerald-800 to-teal-900 border border-emerald-500/40 flex items-center justify-center text-amber-300 font-bold text-xs sm:text-sm shadow-md group-hover:scale-105 transition-transform">
                    {currentSurah.number.toString().padStart(2, '0')}
                  </div>
                  {isPlaying && (
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
                    </span>
                  )}
                </div>

                {/* Title & Status */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs sm:text-sm text-emerald-100 group-hover:text-amber-300 transition-colors truncate">
                      سورة {currentSurah.name}
                    </h4>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 hidden sm:inline-block">
                      {currentSurah.revelationTypeAr}
                    </span>
                  </div>
                  {renderStatusText()}
                </div>
              </div>

              {/* Time Stamp display on tablet/desktop */}
              <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-400 font-mono shrink-0">
                <span>{formatTime(currentTime)}</span>
                <span>/</span>
                <span>{formatTime(duration)}</span>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                {/* Retry button if error */}
                {errorMessage && (
                  <button
                    type="button"
                    onClick={retryPlayback}
                    className="px-2.5 py-1.5 rounded-xl bg-rose-900/80 hover:bg-rose-800 text-rose-200 text-xs font-bold flex items-center gap-1 border border-rose-600/40 transition-colors cursor-pointer"
                    title="إعادة المحاولة"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">إعادة المحاولة</span>
                  </button>
                )}

                {/* Mute / Unmute */}
                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-emerald-900/40 transition-colors hidden sm:block cursor-pointer"
                  title={isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
                  aria-label={isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                </button>

                {/* Play / Pause Button */}
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل التلاوة'}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 active:scale-95 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
                  title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>

                {/* Next Surah Button */}
                <button
                  type="button"
                  onClick={playNext}
                  className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-emerald-900/40 transition-colors cursor-pointer"
                  title="السورة التالية"
                  aria-label="السورة التالية"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                {/* Expand Full Player Button */}
                <button
                  type="button"
                  onClick={handleOpenFull}
                  className="p-2 rounded-xl text-amber-300 hover:text-amber-200 hover:bg-emerald-900/40 transition-colors cursor-pointer"
                  title="فتح المشغل الكامل"
                  aria-label="فتح المشغل الكامل"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                {/* Close Button: stops playback and makes mini player disappear */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    stop();
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-emerald-900/40 active:scale-95 transition-all cursor-pointer"
                  title="إغلاق المشغل المصغر"
                  aria-label="إغلاق المشغل المصغر"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
