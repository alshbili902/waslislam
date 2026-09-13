import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Heart,
  X,
  Radio,
  RotateCcw,
  Sparkles,
  Maximize2,
  Minimize2,
  AlertCircle
} from 'lucide-react';
import { useRadio } from '../context/RadioContext';
import { RadioStationBadge } from './RadioStationBadge';
import { useModalScrollLock } from '../hooks/useModalScrollLock';

export const RadioFullPlayerModal: React.FC = () => {
  const {
    currentStation,
    isPlaying,
    isLoading,
    error,
    volume,
    isMuted,
    elapsedSeconds,
    favorites,
    isFullPlayerOpen,
    togglePlay,
    stop,
    setVolume,
    toggleMute,
    toggleFavorite,
    retryPlayback,
    setIsFullPlayerOpen,
  } = useRadio();

  const isOpen = isFullPlayerOpen && !!currentStation;
  useModalScrollLock(isOpen, {
    onClose: () => setIsFullPlayerOpen(false),
  });

  if (!isOpen) return null;

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
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="wasl-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md overscroll-contain"
        onClick={() => setIsFullPlayerOpen(false)}
      >
        <motion.div
          initial={{ scale: 0.92, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.92, y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg max-h-[min(94dvh,680px)] bg-gradient-to-b from-emerald-950 via-emerald-900 to-slate-950 text-white rounded-3xl shadow-2xl border border-emerald-500/30 overflow-hidden flex flex-col p-6 sm:p-8 overscroll-contain"
        >
          {/* Subtle Islamic Geometry Background Overlay */}
          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Top Bar Controls */}
          <div className="relative z-10 flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isPlaying ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`} />
                <span className={`relative inline-flex rounded-full h-3 w-3 ${isPlaying ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              </span>
              <span className="text-xs font-bold tracking-wide uppercase text-emerald-300">
                {isPlaying ? 'بث مباشر 24/7' : isLoading ? 'جارٍ الاتصال بالبث...' : 'البث متوقف'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleFavorite(currentStation.id)}
                className={`p-2.5 rounded-full transition-colors ${
                  isFav ? 'bg-rose-500/20 text-rose-400' : 'bg-white/10 text-slate-300 hover:text-white'
                }`}
                title={isFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
              >
                <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={() => setIsFullPlayerOpen(false)}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                title="تصغير المشغل"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Station Identity & Visualizer */}
          <div className="relative z-10 flex flex-col items-center text-center my-auto py-2">
            {/* Logo Card with animated glow ring */}
            <div className="relative mb-6">
              <motion.div
                animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                className={`absolute -inset-2 rounded-3xl bg-gradient-to-tr from-emerald-500 to-amber-400 opacity-30 blur-md ${
                  isPlaying ? 'opacity-50' : 'opacity-10'
                }`}
              />
              <RadioStationBadge
                size="xl"
                stationName={currentStation.name}
                categorySlug={currentStation.categorySlug}
                isPlaying={isPlaying}
                isLoading={isLoading}
              />
            </div>

            {/* Station Title & Reciter */}
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5 leading-snug">
              {currentStation.name}
            </h2>
            <p className="text-sm text-emerald-300 font-medium mb-2">
              {currentStation.reciterNameAr || currentStation.categoryNameAr || 'إذاعة القرآن الكريم'}
            </p>
            {currentStation.description && (
              <p className="text-xs text-slate-300/80 max-w-sm line-clamp-2 px-4 leading-relaxed">
                {currentStation.description}
              </p>
            )}

            {/* Duration / Status Info */}
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-900/60 border border-emerald-700/50 text-xs text-emerald-200">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span>مدة الاستماع المباشر:</span>
              <span className="font-mono font-bold text-amber-300">{formatTime(elapsedSeconds)}</span>
              {currentStation.bitrate && (
                <span className="text-slate-400 text-[10px] mr-1">({currentStation.bitrate})</span>
              )}
            </div>

            {/* Error Message if any */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between gap-3 w-full max-w-sm"
              >
                <div className="flex items-center gap-2 text-right">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  onClick={retryPlayback}
                  className="px-2.5 py-1 rounded-lg bg-rose-500 text-white font-bold hover:bg-rose-600 transition-colors shrink-0 flex items-center gap-1 text-[11px]"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>إعادة المحاولة</span>
                </button>
              </motion.div>
            )}
          </div>

          {/* Player Bottom Controls */}
          <div className="relative z-10 mt-6 pt-4 border-t border-emerald-800/60 space-y-5">
            {/* Play/Pause & Actions Row */}
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={retryPlayback}
                title="إعادة تحميل البث"
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all active:scale-95"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={togglePlay}
                disabled={isLoading}
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 flex items-center justify-center shadow-xl shadow-emerald-500/40 transition-transform active:scale-95 disabled:opacity-75"
              >
                {isLoading ? (
                  <div className="w-7 h-7 border-3 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-8 h-8 fill-current" />
                ) : (
                  <Play className="w-8 h-8 fill-current ml-1" />
                )}
              </button>

              <button
                onClick={stop}
                title="إيقاف البث"
                className="p-3 rounded-full bg-white/10 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 transition-all active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Volume Slider Row */}
            <div className="flex items-center justify-center gap-3 max-w-xs mx-auto">
              <button
                onClick={toggleMute}
                className="p-1.5 text-slate-300 hover:text-emerald-300 transition-colors"
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
                className="w-full h-1.5 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />

              <span className="text-[11px] font-mono text-slate-400 w-8 text-left">
                {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
