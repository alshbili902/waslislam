import React from 'react';
import { motion } from 'motion/react';
import {
  Award,
  BookOpen,
  Calendar,
  Flame,
  CheckCircle2,
  TrendingUp,
  Clock,
  Sparkles,
  Layers,
  ChevronLeft,
} from 'lucide-react';
import { KhatmahPlan, HifzProgress } from '../../../types/khatmah';
import { SURAHS_LIST, JUZ_LIST } from '../../../data/quranMetadata';

interface Props {
  plan: KhatmahPlan;
  hifzList: HifzProgress[];
  onNavigate: (tab: string, contextId?: any) => void;
}

export const KhatmahProgressView: React.FC<Props> = ({
  plan,
  hifzList,
  onNavigate,
}) => {
  const totalPages = plan.totalPages || 604;
  const completedPagesCount = plan.completedPages || 0;
  const percentage = Math.min(100, Math.round((completedPagesCount / totalPages) * 100));
  const pagesRemaining = Math.max(0, totalPages - completedPagesCount);

  const completedJuzCount = Math.min(30, Math.floor(completedPagesCount / 20));
  const completedSet = new Set(plan.completedPageNumbers || []);

  const memorizedCount = hifzList.filter((s) => s.status === 'memorized').length;
  const inProgressCount = hifzList.filter((s) => s.status === 'in_progress').length;
  const needsReviewCount = hifzList.filter((s) => s.status === 'needs_review').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-emerald-900/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-300/40">
              <Award className="w-3.5 h-3.5" />
              <span>إحصائيات تقدمي القرآني</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            رحلتك في تلاوة وحفظ كتاب الله
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            متابعة شاملة لإنجاز الصفحات، الأجزاء الثلاثين، وسور الحفظ
          </p>
        </div>
      </div>

      {/* Hero Analytics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 border border-emerald-900/10 dark:border-emerald-800/50 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
            نسبة الختمة الكلية
          </span>
          <span className="text-3xl font-bold font-mono text-emerald-800 dark:text-emerald-300">
            {percentage}%
          </span>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-emerald-900 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 border border-emerald-900/10 dark:border-emerald-800/50 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
            الصفحات المنجزة
          </span>
          <span className="text-3xl font-bold font-mono text-slate-900 dark:text-white">
            {completedPagesCount}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">متبقي {pagesRemaining} صفحة</span>
        </div>

        <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 border border-emerald-900/10 dark:border-emerald-800/50 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
            الأجزاء المكتملة
          </span>
          <span className="text-3xl font-bold font-mono text-amber-500">
            {completedJuzCount}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">من أصل 30 جزءًا</span>
        </div>

        <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 border border-emerald-900/10 dark:border-emerald-800/50 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
            أيام الاستمرار
          </span>
          <span className="text-3xl font-bold font-mono text-amber-500 flex items-center gap-1">
            <Flame className="w-5 h-5 fill-amber-500" />
            <span>{plan.readingStreakDays}</span>
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">أيام متتالية دون انقطاع</span>
        </div>
      </div>

      {/* 30 Juz Interactive Grid */}
      <div className="bg-white dark:bg-emerald-950/80 rounded-3xl p-6 sm:p-8 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-900/40">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              خريطة الأجزاء القرآنية (30 جزءًا)
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {completedJuzCount} مكتمل • {30 - completedJuzCount} متبقٍ
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10 gap-2.5">
          {Array.from({ length: 30 }, (_, i) => {
            const juzNum = i + 1;
            const startP = (juzNum - 1) * 20 + 1;
            const endP = Math.min(604, juzNum * 20);
            const isCompleted = completedPagesCount >= endP;
            const isCurrent = plan.currentPage >= startP && plan.currentPage <= endP;

            return (
              <div
                key={juzNum}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  isCompleted
                    ? 'bg-emerald-700 text-white border-emerald-600 shadow-xs'
                    : isCurrent
                    ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-400 text-amber-900 dark:text-amber-200 ring-2 ring-amber-400/40'
                    : 'bg-slate-50 dark:bg-emerald-900/20 border-slate-200 dark:border-emerald-900/40 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span className="text-[10px] block opacity-80 mb-0.5">الجزء</span>
                <span className="text-base font-bold font-mono block">{juzNum}</span>
                <span className="text-[9px] block opacity-75 mt-0.5">
                  {isCompleted ? 'مكتمل ✓' : isCurrent ? 'قيد القراءة' : `ص ${startP}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Memorization Progress Overview */}
      <div className="bg-white dark:bg-emerald-950/80 rounded-3xl p-6 sm:p-8 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-900/40">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              حالة حفظ السور (114 سورة)
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>محفوظة: {memorizedCount}</span>
            </span>
            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>قيد الحفظ: {inProgressCount}</span>
            </span>
            <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>تحتاج مراجعة: {needsReviewCount}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {SURAHS_LIST.map((s) => {
            const hifzItem = hifzList.find((h) => h.surahNumber === s.number);
            const status = hifzItem?.status || 'not_started';

            let bgClass = 'bg-slate-50 dark:bg-emerald-900/20 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-emerald-900/30';
            if (status === 'memorized') {
              bgClass = 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700 font-bold';
            } else if (status === 'needs_review') {
              bgClass = 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800 font-semibold';
            } else if (status === 'in_progress') {
              bgClass = 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 font-semibold';
            }

            return (
              <button
                key={s.number}
                onClick={() => onNavigate('quran', s.number)}
                className={`p-2.5 rounded-xl border text-right transition-colors cursor-pointer ${bgClass}`}
                title={`سورة ${s.name} (${s.numberOfAyahs} آية)`}
              >
                <div className="flex items-center justify-between text-[10px] opacity-75">
                  <span>#{s.number}</span>
                  <span>{s.numberOfAyahs} آية</span>
                </div>
                <span className="text-xs font-bold block truncate mt-0.5">
                  {s.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
