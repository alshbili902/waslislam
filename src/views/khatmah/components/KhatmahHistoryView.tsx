import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  History,
  Calendar,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  BookOpen,
  ChevronLeft,
  X,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { HifzSession } from '../../../types/khatmah';

interface Props {
  sessions: HifzSession[];
  onLaunchSession: (surahNumber: number, startAyah: number, endAyah: number) => void;
}

export const KhatmahHistoryView: React.FC<Props> = ({
  sessions,
  onLaunchSession,
}) => {
  const [selectedSession, setSelectedSession] = useState<HifzSession | null>(null);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-emerald-900/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-300/40">
              <History className="w-3.5 h-3.5" />
              <span>سجل جلسات التسميع والقراءة</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            تاريخ جلسات التسميع الصوتي
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            سجل موثق لجميع جلسات التسميع مع نسب الدقة والآيات التي تم اختبارها
          </p>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-emerald-950/60 rounded-3xl border border-emerald-900/10 dark:border-emerald-800/40 space-y-3">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-emerald-900/50 text-slate-500 dark:text-slate-300 flex items-center justify-center mx-auto shadow-inner">
            <History className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            لا توجد جلسات تسميع مسجلة بعد
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            ابدأ أول جلسة تسميع صوتي الآن لاختبار حفظك وتوثيق نتائجك في السجل.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => {
            const isHighAccuracy = s.accuracy >= 90;
            return (
              <div
                key={s.id}
                onClick={() => setSelectedSession(s)}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-emerald-950/80 border border-slate-200/80 dark:border-emerald-800/40 hover:border-emerald-500 dark:hover:border-emerald-600 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer shadow-xs hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold font-mono text-base shrink-0 ${
                      isHighAccuracy
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200'
                    }`}
                  >
                    {s.accuracy}%
                  </div>

                  <div>
                    <h4 className="font-bold text-base text-slate-900 dark:text-white">
                      سورة {s.surahNameAr} (الآيات {s.startAyah} - {s.endAyah})
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(s.createdAt)}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatDuration(s.durationSeconds)}</span>
                      </span>
                      <span>•</span>
                      <span>
                        الكلمات: {s.correctWordsCount}/{s.totalWords}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <span>عرض التفاصيل</span>
                    <ChevronLeft className="w-4 h-4" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-emerald-950 border border-emerald-900/10 dark:border-emerald-800/60 rounded-3xl p-6 sm:p-8 max-w-2xl w-full text-right space-y-5 shadow-2xl my-8"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-900/50">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      تفاصيل جلسة التسميع
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      سورة {selectedSession.surahNameAr} • الآيات {selectedSession.startAyah} إلى {selectedSession.endAyah}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Stats Strip */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-emerald-900/30">
                  <span className="text-[10px] text-slate-400 block mb-0.5">الدقة</span>
                  <span className="text-lg font-bold font-mono text-emerald-700 dark:text-amber-300">
                    {selectedSession.accuracy}%
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-emerald-900/30">
                  <span className="text-[10px] text-slate-400 block mb-0.5">المدة</span>
                  <span className="text-lg font-bold font-mono text-slate-800 dark:text-slate-200">
                    {formatDuration(selectedSession.durationSeconds)}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-emerald-900/30">
                  <span className="text-[10px] text-slate-400 block mb-0.5">صحيحة</span>
                  <span className="text-lg font-bold font-mono text-emerald-600">
                    {selectedSession.correctWordsCount}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-emerald-900/30">
                  <span className="text-[10px] text-slate-400 block mb-0.5">الأخطاء</span>
                  <span className="text-lg font-bold font-mono text-rose-500">
                    {selectedSession.incorrectWordsCount + selectedSession.missingWordsCount}
                  </span>
                </div>
              </div>

              {/* Weak Ayahs if any */}
              {selectedSession.weakAyahs && selectedSession.weakAyahs.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs">
                  <span className="font-bold text-amber-900 dark:text-amber-200 block mb-1">
                    آيات احتاجت مراجعة في هذه الجلسة:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {selectedSession.weakAyahs.map((a) => (
                      <span
                        key={a}
                        className="px-2 py-0.5 rounded-md bg-white dark:bg-emerald-950 border border-amber-300 dark:border-amber-800 font-bold"
                      >
                        آية {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-emerald-900/50">
                <button
                  onClick={() => setSelectedSession(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50"
                >
                  إغلاق
                </button>
                <button
                  onClick={() => {
                    const s = selectedSession;
                    setSelectedSession(null);
                    onLaunchSession(s.surahNumber, s.startAyah, s.endAyah);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>إعادة تسميع هذه الآيات</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
