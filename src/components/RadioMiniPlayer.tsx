import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, X, Maximize2, Radio, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { useRadio } from '../context/RadioContext';
import { RadioStationBadge } from './RadioStationBadge';

interface Props {
  currentTab: string;
  onNavigateToRadio: () => void;
}

export const RadioMiniPlayer: React.FC<Props> = ({ currentTab, onNavigateToRadio }) => {
  const {
    currentStation,
    isPlaying,
    isLoading,
    error,
    volume,
    isMuted,
    togglePlay,
    stop,
    toggleMute,
    setIsFullPlayerOpen,
    retryPlayback,
  } = useRadio();

  // If no station selected, don't show
  if (!currentStation) return null;

  // If user is currently on the Quran Radio tab, hide mini-player since full sticky player is visible in that tab
  if (currentTab === 'quran-radio' || currentTab === 'radio') return null;

  return (
    <AnimatePresence>
      <motion.aside
        aria-label="مشغل إذاعة القرآن المصغر"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 350 }}
        className="fixed bottom-[68px] lg:bottom-4 inset-x-3 sm:inset-x-6 max-w-2xl mx-auto z-40 pointer-events-auto"
      >
        <div className="bg-emerald-950/95 dark:bg-emerald-950/95 text-white backdrop-blur-md rounded-2xl p-2.5 sm:p-3 shadow-2xl border border-emerald-500/30 flex items-center justify-between gap-2.5 transition-all">
          {/* Station Info & Artwork */}
          <div
            onClick={onNavigateToRadio}
            className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer group"
          >
            <RadioStationBadge
              size="sm"
              stationName={currentStation.name}
              categorySlug={currentStation.categorySlug}
              isPlaying={isPlaying}
              isLoading={isLoading}
            />

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isPlaying ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isPlaying ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                  {currentStation.name}
                </h4>
              </div>
              <p className="text-[11px] text-emerald-300/90 truncate">
                {currentStation.reciterNameAr || currentStation.categoryNameAr || 'بث مباشر 24/7'}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {error ? (
              <button
                onClick={retryPlayback}
                title="إعادة المحاولة"
                className="px-2 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-bold flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">إعادة المحاولة</span>
              </button>
            ) : (
              <button
                onClick={togglePlay}
                disabled={isLoading}
                title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 flex items-center justify-center shadow-md shadow-emerald-500/30 active:scale-95 transition-transform"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                ) : (
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
                )}
              </button>
            )}

            {/* Mute button (desktop) */}
            <button
              onClick={toggleMute}
              className="hidden sm:flex p-2 rounded-xl text-slate-300 hover:text-white hover:bg-emerald-900/60 transition-colors"
              title={isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Open Full Player */}
            <button
              onClick={() => setIsFullPlayerOpen(true)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-emerald-900/60 transition-colors"
              title="فتح المشغل بالحجم الكامل"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Stop / Close Player */}
            <button
              onClick={stop}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-300 hover:bg-emerald-900/60 transition-colors"
              title="إغلاق المشغل"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
};
