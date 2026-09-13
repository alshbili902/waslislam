import React from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  Circle,
  BookOpen,
  Sun,
  Moon,
  Sparkles,
  Heart,
  Layers,
  ArrowRight
} from 'lucide-react';
import { UserDailyWird } from '../../types';

interface DailyWirdSectionProps {
  wird: UserDailyWird;
  onToggleItem: (key: keyof UserDailyWird, currentValue: boolean) => void;
  onNavigate: (tab: string, contextId?: any) => void;
}

export const DailyWirdSection: React.FC<DailyWirdSectionProps> = ({
  wird,
  onToggleItem,
  onNavigate,
}) => {
  const items = [
    {
      key: 'quranCompleted' as keyof UserDailyWird,
      title: 'ورد القرآن الكريم',
      desc: 'قراءة جزء أو صفحة من كتاب الله',
      completed: wird.quranCompleted,
      icon: BookOpen,
      color: 'emerald',
      targetTab: 'quran',
    },
    {
      key: 'morningAzkarCompleted' as keyof UserDailyWird,
      title: 'أذكار الصباح',
      desc: 'حصن المسلم وأذكار البكور',
      completed: wird.morningAzkarCompleted,
      icon: Sun,
      color: 'amber',
      targetTab: 'azkar',
    },
    {
      key: 'eveningAzkarCompleted' as keyof UserDailyWird,
      title: 'أذكار المساء',
      desc: 'حفظ وسكينة المساء',
      completed: wird.eveningAzkarCompleted,
      icon: Moon,
      color: 'indigo',
      targetTab: 'azkar',
    },
    {
      key: 'hadithRead' as keyof UserDailyWird,
      title: 'الحديث الشريف',
      desc: 'قراءة حديث وتدبر معناه',
      completed: wird.hadithRead,
      icon: Sparkles,
      color: 'teal',
      targetTab: 'hadith',
    },
    {
      key: 'duaRead' as keyof UserDailyWird,
      title: 'الدعاء والمناجاة',
      desc: 'سؤال الله من خيري الدنيا والآخرة',
      completed: wird.duaRead,
      icon: Heart,
      color: 'rose',
      targetTab: 'dua',
    },
    {
      key: 'tasbeehCompleted' as keyof UserDailyWird,
      title: 'التسبيح والاستغفار',
      desc: `33 تسبيحة على الأقل (${wird.tasbeehCount || 0} مُنجزة)`,
      completed: wird.tasbeehCompleted || wird.tasbeehCount >= 33,
      icon: Layers,
      color: 'cyan',
      targetTab: 'tasbih',
    },
  ];

  const completedCount = items.filter((i) => i.completed).length;

  return (
    <div className="bg-white dark:bg-emerald-950/80 rounded-3xl p-5 sm:p-7 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm relative overflow-hidden backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-amiri">
              وِرْدُكَ اليَوْمِي
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300">
              {completedCount} من 6 أوراد
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            احرص على إتمام أورادك اليومية لتثبيت الأجر ونيل البركة
          </p>
        </div>

        {/* Circular / Badge Progress */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className="text-left sm:text-right">
            <div className="text-xs font-bold text-emerald-800 dark:text-amber-300">
              {wird.completionPercentage}% مكتمل
            </div>
            <div className="text-[10px] text-slate-400">إنجاز اليوم</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-600/30 flex items-center justify-center font-bold text-sm text-emerald-800 dark:text-amber-300 shadow-xs">
            {wird.completionPercentage}%
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-emerald-900/40 rounded-full h-2 mb-6 overflow-hidden">
        <div
          className="bg-gradient-to-r from-emerald-600 to-teal-500 h-full rounded-full transition-all duration-500"
          style={{ width: `${wird.completionPercentage}%` }}
        />
      </div>

      {/* 6 Wird Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.key}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                item.completed
                  ? 'bg-emerald-50/70 dark:bg-emerald-900/30 border-emerald-600/30'
                  : 'bg-slate-50 dark:bg-emerald-950/40 border-slate-200/80 dark:border-emerald-800/40 hover:border-emerald-600/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    item.completed
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-200 dark:bg-emerald-900/60 text-slate-600 dark:text-emerald-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className={`text-xs sm:text-sm font-bold ${item.completed ? 'text-emerald-900 dark:text-emerald-200 line-through opacity-85' : 'text-slate-900 dark:text-white'}`}>
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {item.desc}
                  </p>
                  <button
                    onClick={() => onNavigate(item.targetTab)}
                    className="text-[10px] text-emerald-700 dark:text-amber-300 font-bold hover:underline mt-2 inline-flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>فتح القسم</span>
                    <ArrowRight className="w-2.5 h-2.5 rotate-180" />
                  </button>
                </div>
              </div>

              {/* Checkbox Toggle Button */}
              <button
                onClick={() => onToggleItem(item.key, item.completed)}
                className={`p-1.5 rounded-xl transition-transform active:scale-90 cursor-pointer ${
                  item.completed
                    ? 'text-emerald-600 dark:text-emerald-400 hover:text-rose-600'
                    : 'text-slate-400 hover:text-emerald-600'
                }`}
                title={item.completed ? 'إلغاء الإتمام' : 'تحديد كمكتمل'}
              >
                {item.completed ? (
                  <CheckCircle2 className="w-6 h-6 fill-emerald-600 text-white dark:text-emerald-950" />
                ) : (
                  <Circle className="w-6 h-6" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
