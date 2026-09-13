import React from 'react';
import { motion } from 'motion/react';
import {
  Radio,
  Play,
  Pause,
  Volume2,
  ExternalLink,
  Sparkles,
  Heart
} from 'lucide-react';
import { useRadio } from '../../context/RadioContext';
import { RadioStationBadge } from '../RadioStationBadge';

interface RadioPlayerWidgetProps {
  onNavigate: (tab: string, contextId?: any) => void;
}

export const RadioPlayerWidget: React.FC<RadioPlayerWidgetProps> = ({ onNavigate }) => {
  const {
    currentStation,
    isPlaying,
    togglePlay,
    playStation,
    stations,
    favorites,
    recentlyPlayed,
  } = useRadio();

  // Find featured or recently played or active station
  const displayStation = currentStation || recentlyPlayed[0] || stations[0] || null;

  return (
    <div className="bg-white dark:bg-emerald-950/80 rounded-3xl p-5 sm:p-6 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm relative overflow-hidden backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-amiri">
          <Radio className="w-4 h-4 text-emerald-600 dark:text-amber-400" />
          <span>{isPlaying ? 'تَسْتَمِعُ الآن' : 'إِذَاعَةُ القُرْآنِ الكَرِيم'}</span>
        </h3>
        <button
          onClick={() => onNavigate('quran-radio')}
          className="text-xs text-emerald-800 dark:text-amber-300 hover:underline font-bold flex items-center gap-1 cursor-pointer"
        >
          <span>تصفح الإذاعات</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {displayStation ? (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-950 to-teal-950 text-white flex items-center justify-between gap-3 shadow-sm border border-emerald-800/40">
            <div className="flex items-center gap-3 min-w-0">
              <RadioStationBadge
                size="sm"
                stationName={displayStation.name}
                categorySlug={displayStation.categorySlug}
                isPlaying={isPlaying && currentStation?.id === displayStation.id}
              />

              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold truncate text-white">
                  {displayStation.name}
                </h4>
                <p className="text-[11px] text-emerald-200/80 truncate mt-0.5">
                  {displayStation.reciterNameAr || displayStation.categoryNameAr || 'بث مباشر متواصل 24 ساعة'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    بث مباشر
                  </span>
                  <span className="text-[10px] text-emerald-400/60">•</span>
                  <span className="text-[10px] text-emerald-400/80">{displayStation.bitrate || '128 kbps'}</span>
                </div>
              </div>
            </div>

            {/* Play/Pause Button connected to persistent player */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => {
                if (currentStation?.id === displayStation.id) {
                  togglePlay();
                } else {
                  playStation(displayStation);
                }
              }}
              className="w-11 h-11 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0 cursor-pointer transition-colors"
              title={isPlaying && currentStation?.id === displayStation.id ? 'إيقاف مؤقت' : 'تشغيل الإذاعة'}
            >
              {isPlaying && currentStation?.id === displayStation.id ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </motion.button>
          </div>

          {/* Quick Stations Row */}
          {stations.length > 1 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2">
                محطات مختارة للاستماع السريع:
              </div>
              <div className="grid grid-cols-2 gap-2">
                {stations.slice(0, 4).map((st) => (
                  <button
                    key={st.id}
                    onClick={() => playStation(st)}
                    className={`p-2 rounded-xl text-right text-xs font-semibold border transition-all truncate flex items-center justify-between gap-1.5 cursor-pointer ${
                      currentStation?.id === st.id
                        ? 'bg-emerald-50 dark:bg-emerald-900/60 border-emerald-600 text-emerald-900 dark:text-amber-300 font-bold'
                        : 'bg-slate-50 dark:bg-emerald-900/20 border-slate-200/80 dark:border-emerald-800/40 text-slate-700 dark:text-slate-200 hover:border-emerald-500/40'
                    }`}
                  >
                    <span className="truncate">{st.name}</span>
                    {currentStation?.id === st.id && isPlaying ? (
                      <Pause className="w-3 h-3 text-emerald-600 dark:text-amber-400 shrink-0" />
                    ) : (
                      <Play className="w-3 h-3 text-slate-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6 text-xs text-slate-400">
          جاري تحميل محطات إذاعة القرآن الكريم...
        </div>
      )}
    </div>
  );
};
