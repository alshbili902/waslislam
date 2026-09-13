import React, { useState } from 'react';
import {
  BarChart3,
  Flame,
  BookOpen,
  Heart,
  Sparkles,
  Layers,
  Radio,
  Calendar
} from 'lucide-react';
import { UserStreak, QuranProgressData } from '../../types';

interface PersonalStatsSectionProps {
  streak: UserStreak;
  quranProgress: QuranProgressData | null;
  tasbeehTotal: number;
  favoritesCount: number;
  bookmarksCount: number;
  activityCount: number;
}

export const PersonalStatsSection: React.FC<PersonalStatsSectionProps> = ({
  streak,
  quranProgress,
  tasbeehTotal,
  favoritesCount,
  bookmarksCount,
  activityCount,
}) => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const hasAnyActivity = Boolean(
    streak.currentStreak > 0 ||
    (quranProgress && quranProgress.totalVersesRead > 0) ||
    tasbeehTotal > 0 ||
    favoritesCount > 0 ||
    bookmarksCount > 0 ||
    activityCount > 0
  );

  const stats = [
    {
      title: 'أيام المواظبة النشطة',
      value: `${streak.currentStreak} يوم`,
      sub: streak.longestStreak > 0 ? `أطول سلسلة: ${streak.longestStreak} يوم` : 'ابدأ سلسلتك اليوم',
      icon: Flame,
      color: 'amber',
    },
    {
      title: 'الآيات المقروءة',
      value: `${quranProgress?.totalVersesRead || 0} آية`,
      sub: quranProgress && quranProgress.lastPageNumber > 1 ? `الصفحة الحالية: ${quranProgress.lastPageNumber}` : 'تلاوة المصحف',
      icon: BookOpen,
      color: 'emerald',
    },
    {
      title: 'تسبيحات مسجلة',
      value: `${tasbeehTotal}`,
      sub: 'عبر المسبحة والورد اليومي',
      icon: Layers,
      color: 'cyan',
    },
    {
      title: 'العناصر المحفوظة',
      value: `${favoritesCount + bookmarksCount}`,
      sub: `${bookmarksCount} علامة • ${favoritesCount} مفضلة`,
      icon: Heart,
      color: 'rose',
    },
    {
      title: 'الختمات المكتملة',
      value: `${quranProgress?.completedKhatmahs || 0} ختمة`,
      sub: 'وفقك الله لختم كتابه مراراً',
      icon: Sparkles,
      color: 'teal',
    },
    {
      title: 'الأنشطة المنجزة',
      value: `${activityCount}`,
      sub: 'أعمال مسجلة على المنصة',
      icon: BarChart3,
      color: 'indigo',
    },
  ];

  return (
    <div className="bg-white dark:bg-emerald-950/80 rounded-3xl p-5 sm:p-7 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm relative overflow-hidden backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-amiri flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-amber-400" />
            <span>إِحْصَائِيَّاتُكَ الإِيمَانِيَّة</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            رصد حقيقي ودقيق لمسيرتك في القراءة والذكر والعبادة
          </p>
        </div>

        {/* Period Selector */}
        {hasAnyActivity && (
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-emerald-900/50 rounded-xl self-start sm:self-auto">
            {[
              { id: 'daily', label: 'يومي' },
              { id: 'weekly', label: 'أسبوعي' },
              { id: 'monthly', label: 'شهري' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPeriod(tab.id as any)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  period === tab.id
                    ? 'bg-white dark:bg-emerald-800 text-emerald-900 dark:text-amber-300 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Stats Cards or Empty State */}
      {!hasAnyActivity ? (
        <div className="text-center py-10 px-4 bg-slate-50/60 dark:bg-emerald-900/20 rounded-2xl border border-dashed border-slate-200 dark:border-emerald-800/50">
          <BarChart3 className="w-10 h-10 text-slate-300 dark:text-emerald-800/60 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">
            لا توجد بيانات كافية حتى الآن
          </h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            ابدأ تلاوة القرآن أو التسبيح بالمسبحة أو إتمام وردك اليومي لترصد المنصة إحصائياتك الإيمانية الحقيقية هنا
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {stats.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-emerald-900/25 border border-slate-200/80 dark:border-emerald-800/40 text-center"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 mx-auto flex items-center justify-center mb-2">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-mono">
                  {s.value}
                </div>
                <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 mt-0.5 truncate">
                  {s.title}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 truncate">
                  {s.sub}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
