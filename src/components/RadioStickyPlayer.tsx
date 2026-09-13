import React from 'react';
import { motion } from 'motion/react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Heart,
  Maximize2,
  RotateCcw,
  Radio,
  Sparkles,
  AlertCircle,
  Clock,
  X
} from 'lucide-react';
import { useRadio } from '../context/RadioContext';
import { RadioStationBadge } from './RadioStationBadge';

export const RadioStickyPlayer: React.FC = () => {
  const {
    currentStation,
    isPlaying,
    isLoading,
    error,
    volume,
    isMuted,
    elapsedSeconds,
    favorites,
    togglePlay,
    stop,
    setVolume,
    toggleMute,
    toggleFavorite,
    retryPlayback,
    setIsFullPlayerOpen,
  } = useRadio();

  if (!currentStation) return null;

  const isFav = favorites.includes(currentStation.id);

  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hours > 0) {
      return `${hours}:${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="sticky top-16 z-30 mb-8 rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-950 to-teal-950 text-white shadow-xl shadow-emerald-950/20 border border-emerald-500/30 overflow-hidden"
    >
      <div className="p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Station Identity */}
        <div className="flex items-center gap-3.5 w-full md:w-auto min-w-0">
          <RadioStationBadge
            size="md"
            stationName={currentStation.name}
            categorySlug={currentStation.categorySlug}
            isPlaying={isPlaying}
            isLoading={isLoading}
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-800/80 text-[11px] font-bold text-emerald-300 border border-emerald-700/60">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isPlaying ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isPlaying ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                </span>
                {isPlaying ? 'بث مباشر الآن' : isLoading ? 'جارٍ الاتصال...' : 'البث متوقف'}
              </span>

              {currentStation.categoryNameAr && (
                <span className="text-[11px] text-emerald-300/80 bg-black/20 px-2 py-0.5 rounded-full">
                  {currentStation.categoryNameAr}
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white truncate">
              {currentStation.name}
            </h3>
            <p className="text-xs text-emerald-200/80 truncate">
              {currentStation.reciterNameAr || currentStation.description || 'إذاعة القرآن الكريم'}
            </p>
          </div>
        </div>

        {/* Error notification if playback failed */}
        {error ? (
          <div className="flex items-center gap-3 bg-rose-500/20 border border-rose-500/40 px-3.5 py-2 rounded-2xl text-xs text-rose-200 w-full md:w-auto justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={retryPlayback}
              className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shrink-0 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>إعادة المحاولة</span>
            </button>
          </div>
        ) : (
          /* Live broadcast duration indicator */
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-900/50 border border-emerald-800/60 text-xs text-emerald-200">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>مدة البث:</span>
            <span className="font-mono font-bold text-amber-300">{formatTime(elapsedSeconds)}</span>
          </div>
        )}

        {/* Player Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-between md:justify-end shrink-0">
          {/* Volume Control (hidden on mobile, visible on desktop) */}
          <div className="hidden sm:flex items-center gap-2 bg-emerald-900/40 px-3 py-1.5 rounded-xl border border-emerald-800/40">
            <button
              onClick={toggleMute}
              className="p-1 text-slate-300 hover:text-white transition-colors"
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
              step="0.02"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 h-1 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>

          {/* Favorite Button */}
          <button
            onClick={() => toggleFavorite(currentStation.id)}
            className={`p-2.5 rounded-xl transition-colors ${
              isFav ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-900/50 hover:bg-emerald-800 text-slate-300 hover:text-white'
            }`}
            title={isFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
          </button>

          {/* Expand Full Player */}
          <button
            onClick={() => setIsFullPlayerOpen(true)}
            className="p-2.5 rounded-xl bg-emerald-900/50 hover:bg-emerald-800 text-slate-300 hover:text-white transition-colors"
            title="تكبير المشغل"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Play / Pause Primary Button */}
          <button
            onClick={togglePlay}
            disabled={isLoading}
            className="h-11 px-5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition-transform active:scale-95"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>إيقاف مؤقت</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>استماع مباشر</span>
              </>
            )}
          </button>

          {/* Stop / Dismiss */}
          <button
            onClick={stop}
            className="p-2.5 rounded-xl bg-emerald-900/50 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 transition-colors"
            title="إيقاف وإغلاق المشغل"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
