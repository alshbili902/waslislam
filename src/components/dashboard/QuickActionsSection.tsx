import React from 'react';
import { motion } from 'motion/react';
import {
  BookOpen,
  Heart,
  Sparkles,
  Radio,
  Compass,
  Layers,
  Clock,
  Calendar,
  Search,
  HelpCircle,
  Zap
} from 'lucide-react';

interface QuickActionsSectionProps {
  onNavigate: (tab: string, contextId?: any) => void;
}

export const QuickActionsSection: React.FC<QuickActionsSectionProps> = ({ onNavigate }) => {
  const actions = [
    { id: 'quran', label: 'المصحف الشريف', icon: BookOpen, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
    { id: 'azkar', label: 'الأذكار اليومية', icon: Heart, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
    { id: 'hadith', label: 'رياض الصالحين', icon: Sparkles, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-500/10' },
    { id: 'dua', label: 'أدعية وأذكار', icon: Heart, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10' },
    { id: 'quran-radio', label: 'إذاعة القرآن', icon: Radio, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-500/10' },
    { id: 'prayer', label: 'مواقيت الصلاة', icon: Clock, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500/10' },
    { id: 'prayer', label: 'اتجاه القبلة', icon: Compass, color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-500/10' },
    { id: 'tasbih', label: 'المسبحة الذكية', icon: Layers, color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-500/10' },
    { id: 'calendar', label: 'التقويم الهجري', icon: Calendar, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/10' },
    { id: 'fatwa', label: 'الفتاوى والمعرفة', icon: HelpCircle, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
  ];

  return (
    <div className="bg-white dark:bg-emerald-950/80 rounded-3xl p-5 sm:p-7 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm relative overflow-hidden backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-amiri flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-600 dark:text-amber-400" />
          <span>اخْتِصَارَاتٌ سَرِيعَة</span>
        </h3>
        <span className="text-[11px] text-slate-400">انتقال فوري لأقسام المنصة</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {actions.map((act, i) => {
          const Icon = act.icon;
          return (
            <motion.button
              key={i}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onNavigate(act.id)}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-emerald-900/25 border border-slate-200/80 dark:border-emerald-800/40 hover:border-emerald-600/40 flex items-center gap-2.5 text-right transition-colors cursor-pointer"
            >
              <div className={`w-8 h-8 rounded-xl ${act.bg} ${act.color} flex items-center justify-center shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {act.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
