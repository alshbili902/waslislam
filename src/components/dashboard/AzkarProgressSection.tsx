import React from 'react';
import { Sun, Moon, ArrowRight, CheckCircle2, Heart } from 'lucide-react';
import { UserAzkarProgress } from '../../types';

interface AzkarProgressSectionProps {
  morningCompleted: boolean;
  eveningCompleted: boolean;
  azkarProgressList: UserAzkarProgress[];
  onNavigate: (tab: string, contextId?: any) => void;
}

export const AzkarProgressSection: React.FC<AzkarProgressSectionProps> = ({
  morningCompleted,
  eveningCompleted,
  azkarProgressList,
  onNavigate,
}) => {
  return (
    <div className="bg-white dark:bg-emerald-950/80 rounded-3xl p-5 sm:p-6 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm relative overflow-hidden backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-amiri">
            <Heart className="w-4 h-4 text-emerald-600 dark:text-amber-400" />
            <span>متابعة أذكار اليوم</span>
          </h3>
          <p className="text-[11px] text-slate-400">حصنك اليومي من الصباح إلى المساء</p>
        </div>
        <button
          onClick={() => onNavigate('azkar')}
          className="text-xs text-emerald-800 dark:text-amber-300 hover:underline font-bold flex items-center gap-1 cursor-pointer"
        >
          <span>تصفح كافة الأذكار</span>
          <ArrowRight className="w-3 h-3 rotate-180" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Morning Azkar */}
        <div
          onClick={() => onNavigate('azkar', 'morning')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
            morningCompleted
              ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-500/40'
              : 'bg-slate-50 dark:bg-emerald-900/30 border-slate-200/80 dark:border-emerald-800/40 hover:border-amber-500/40'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                أذكار الصباح
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {morningCompleted ? 'تمت القراءة بنجاح • جزاك الله خيراً' : 'يبدأ وقتها من طلوع الفجر'}
              </div>
            </div>
          </div>
          <div className="shrink-0">
            {morningCompleted ? (
              <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>مكتملة</span>
              </span>
            ) : (
              <span className="text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline">
                ابدأ الآن ←
              </span>
            )}
          </div>
        </div>

        {/* Evening Azkar */}
        <div
          onClick={() => onNavigate('azkar', 'evening')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
            eveningCompleted
              ? 'bg-indigo-50/70 dark:bg-indigo-950/20 border-indigo-500/40'
              : 'bg-slate-50 dark:bg-emerald-900/30 border-slate-200/80 dark:border-emerald-800/40 hover:border-indigo-500/40'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                أذكار المساء
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {eveningCompleted ? 'تمت القراءة بنجاح • في حفظ الله' : 'يبدأ وقتها من صلاة العصر'}
              </div>
            </div>
          </div>
          <div className="shrink-0">
            {eveningCompleted ? (
              <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>مكتملة</span>
              </span>
            ) : (
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                ابدأ الآن ←
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
