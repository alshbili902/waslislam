import React, { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, X, Volume2, ChevronUp, ChevronDown } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { RECITERS_LIST } from '../data/quranMetadata';

export const AudioPlayer: React.FC = () => {
  const {
    isPlaying,
    currentSurah,
    currentAyah,
    selectedReciter,
    progress,
    currentTime,
    duration,
    togglePlay,
    playNextAyah,
    playPrevAyah,
    seek,
    stop,
    setReciter
  } = useAudio();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showReciters, setShowReciters] = useState(false);

  if (!currentAyah || !currentSurah) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed bottom-16 lg:bottom-4 left-0 right-0 z-40 px-3 sm:px-6 pointer-events-none">
      <div className="max-w-4xl mx-auto pointer-events-auto bg-slate-900/95 dark:bg-emerald-950/95 text-white backdrop-blur-md rounded-2xl shadow-2xl border border-emerald-500/20 p-3 sm:p-4 transition-all duration-300">
        {/* Progress bar */}
        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            // In RTL, flip or standard
            seek(Math.min(100, Math.max(0, pos * 100)));
          }}
          className="w-full h-1.5 bg-slate-700/60 rounded-full mb-3 cursor-pointer relative overflow-hidden group"
        >
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-800/60 flex items-center justify-center text-emerald-300 font-bold text-sm shrink-0 border border-emerald-600/30">
              {currentSurah.number}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm sm:text-base truncate text-emerald-100">
                  سورة {currentSurah.name}
                </h4>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-700/40">
                  الآية {currentAyah.numberInSurah}
                </span>
              </div>
              <p className="text-xs text-slate-300 truncate">
                بصوت: {selectedReciter.nameAr}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              onClick={playPrevAyah}
              title="الآية السابقة"
              className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-all"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            <button
              onClick={playNextAyah}
              title="الآية التالية"
              className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Reciter Selector Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowReciters(!showReciters)}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700"
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="truncate max-w-[90px]">{selectedReciter.nameAr.split(' ')[0]}</span>
                <ChevronUp className="w-3 h-3 text-slate-400" />
              </button>

              {showReciters && (
                <div className="absolute bottom-full mb-2 left-0 w-56 rounded-xl bg-slate-900 border border-emerald-500/20 shadow-xl p-1.5 z-50 text-right">
                  <div className="px-2.5 py-1.5 text-xs font-semibold text-emerald-400 border-b border-slate-800">
                    اختر القارئ
                  </div>
                  {RECITERS_LIST.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        setReciter(r);
                        setShowReciters(false);
                      }}
                      className={`w-full text-right px-3 py-2 text-xs rounded-lg transition-colors flex items-center justify-between ${
                        selectedReciter.id === r.id ? 'bg-emerald-800/50 text-emerald-200 font-medium' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{r.nameAr}</span>
                      {selectedReciter.id === r.id && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={stop}
              title="إغلاق المشغل"
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
