import React from 'react';
import { motion } from 'motion/react';
import { Layers, Plus, ArrowRight, Sparkles } from 'lucide-react';

interface TasbeehWidgetProps {
  todayCount: number;
  totalCount: number;
  onIncrement: () => void;
  onNavigate: (tab: string) => void;
}

export const TasbeehWidget: React.FC<TasbeehWidgetProps> = ({
  todayCount,
  totalCount,
  onIncrement,
  onNavigate,
}) => {
  const dailyGoal = 100;
  const progressPercent = Math.min(100, Math.round((todayCount / dailyGoal) * 100));

  return (
    <div className="bg-white dark:bg-emerald-950/80 rounded-3xl p-5 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm relative overflow-hidden backdrop-blur-md flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-amiri">
          <Layers className="w-4 h-4 text-emerald-600 dark:text-amber-400" />
          <span>المِسْبَحَةُ الإلِكْتُرُونِيَّة</span>
        </h3>
        <span className="text-[10px] text-slate-400">الهدف: {dailyGoal}</span>
      </div>

      <div className="my-2 flex items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400">تسبيحات اليوم:</div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-800 dark:text-amber-300 font-mono mt-0.5">
            {todayCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            الإجمالي الكلي: {totalCount} تسبيحة
          </div>
        </div>

        {/* Big Tap Button */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={onIncrement}
          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white flex flex-col items-center justify-center shadow-md shadow-emerald-900/20 cursor-pointer"
          title="تسبيح +1"
        >
          <Plus className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-0.5">سَبِّح</span>
        </motion.button>
      </div>

      {/* Progress towards goal */}
      <div className="w-full bg-slate-100 dark:bg-emerald-900/40 rounded-full h-1.5 overflow-hidden my-2">
        <div
          className="bg-emerald-600 dark:bg-amber-400 h-full rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <button
        onClick={() => onNavigate('tasbih')}
        className="w-full mt-2 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 hover:bg-emerald-100 text-xs font-bold text-emerald-800 dark:text-emerald-200 flex items-center justify-center gap-1 cursor-pointer transition-colors"
      >
        <span>فتح المسبحة الذكية والأذكار</span>
        <ArrowRight className="w-3 h-3 rotate-180" />
      </button>
    </div>
  );
};
