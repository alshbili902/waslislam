import React from 'react';
import { motion } from 'motion/react';
import {
  BookOpen,
  Bookmark,
  Heart,
  ChevronLeft,
  Clock,
  Award,
  Sparkles,
  Flame
} from 'lucide-react';
import { QuranProgressData } from '../../types';
import { SURAHS_LIST } from '../../data/quranMetadata';

interface QuranProgressCardProps {
  progress: QuranProgressData | null;
  bookmarksCount: number;
  favoriteAyahsCount: number;
  onContinueReading: (surahNumber: number) => void;
}

export const QuranProgressCard: React.FC<QuranProgressCardProps> = ({
  progress,
  bookmarksCount,
  favoriteAyahsCount,
  onContinueReading,
}) => {
  const hasStartedReading = Boolean(progress && (progress.totalVersesRead > 0 || progress.lastReadAt));
  const currentSurah = hasStartedReading && progress
    ? SURAHS_LIST.find((s) => s.number === progress.lastSurahNumber) || SURAHS_LIST[0]
    : null;

  // Calculate approximate Quran completion based on 604 pages
  const completionPercentage = hasStartedReading && progress
    ? Math.min(100, Math.max(0, Math.round((progress.lastPageNumber / 604) * 100)))
    : 0;

  const formatLastRead = (isoString?: string) => {
    if (!isoString) return 'اليوم';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'اليوم';
    }
  };

  return (
    <div className="bg-gradient-to-br from-emerald-900 via-emerald-950 to-teal-950 text-white rounded-3xl p-6 sm:p-7 border border-emerald-700/30 shadow-lg relative overflow-hidden">
      {/* Background Islamic Watermark */}
      <div className="absolute left-[-20px] bottom-[-20px] w-64 h-64 opacity-10 pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-full h-full fill-white">
          <path d="M50,0 L61.8,38.2 L100,50 L61.8,61.8 L50,100 L38.2,61.8 L0,50 L38.2,38.2 Z" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left/Main Column */}
        <div className="space-y-4 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <BookOpen className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              إنجاز قراءة القرآن الكريم
            </span>
            {hasStartedReading && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-200 border border-emerald-700">
                ختمة جارية
              </span>
            )}
          </div>

          {hasStartedReading && progress && currentSurah ? (
            <>
              <div>
                <div className="text-xs text-emerald-200/80">آخر موضع قراءة محفوظ:</div>
                <h3 className="text-2xl sm:text-3xl font-bold font-amiri text-amber-300 mt-1 flex items-center gap-2">
                  <span>سورة {currentSurah.name}</span>
                  <span className="text-sm sm:text-base font-sans font-normal text-emerald-200">
                    (الآية {progress.lastAyahNumber})
                  </span>
                </h3>
                <p className="text-xs text-emerald-200/70 mt-1 flex items-center gap-3">
                  <span>صفحة {progress.lastPageNumber} من 604</span>
                  <span>•</span>
                  <span>الجزء {currentSurah.juz}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    آخر تلاوة: {formatLastRead(progress.lastReadAt)}
                  </span>
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs">
                  <span className="text-emerald-200">نسبة التقدم في الختمة:</span>
                  <span className="font-bold text-amber-300">{completionPercentage}%</span>
                </div>
                <div className="w-full bg-emerald-950/80 rounded-full h-2.5 p-0.5 border border-emerald-800/40">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-amber-300 h-full rounded-full transition-all duration-700 shadow-xs"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="py-2">
              <h3 className="text-2xl sm:text-3xl font-bold font-amiri text-amber-300 mt-1">
                لم تبدأ القراءة بعد
              </h3>
              <p className="text-xs sm:text-sm text-emerald-200/80 mt-2 leading-relaxed">
                ابدأ بتلاوة آيات الذكر الحكيم عبر المصحف الإلكتروني الموثق، وسيتم تتبع موضع قراءتك ونسبة تقدمك في الختمة تلقائياً وربطها بحسابك.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: CTA & Stats Badges */}
        <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-3 shrink-0">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onContinueReading(progress?.lastSurahNumber || 1)}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>{hasStartedReading ? 'متابعة القراءة' : 'ابدأ القراءة'}</span>
            <ChevronLeft className="w-4 h-4" />
          </motion.button>

          {/* Micro Stats */}
          <div className="flex items-center gap-2 justify-center text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-emerald-900/60 border border-emerald-800/50 flex items-center gap-1.5 text-emerald-200">
              <Bookmark className="w-3.5 h-3.5 text-amber-300" />
              <span>{bookmarksCount} علامات</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-emerald-900/60 border border-emerald-800/50 flex items-center gap-1.5 text-emerald-200">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <span>{favoriteAyahsCount} مفضلة</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-emerald-900/60 border border-emerald-800/50 flex items-center gap-1.5 text-emerald-200">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>{progress?.completedKhatmahs || 0} ختمات</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
