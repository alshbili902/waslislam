import React from 'react';
import { Compass, ArrowUp, ArrowRight } from 'lucide-react';

interface QiblaWidgetProps {
  onNavigate: (tab: string) => void;
  cityName: string;
}

export const QiblaWidget: React.FC<QiblaWidgetProps> = ({ onNavigate, cityName }) => {
  return (
    <div className="bg-white dark:bg-emerald-950/80 rounded-3xl p-5 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm relative overflow-hidden backdrop-blur-md flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-amiri">
          <Compass className="w-4 h-4 text-emerald-600 dark:text-amber-400" />
          <span>اتِّجَاهُ القِبْلَة</span>
        </h3>
        <span className="text-[10px] text-slate-400">{cityName}</span>
      </div>

      <div className="flex items-center justify-between gap-4 my-2">
        <div className="space-y-1">
          <div className="text-xl sm:text-2xl font-bold text-emerald-800 dark:text-amber-300 font-mono" dir="ltr">
            254° WSW
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            الاتجاه الدقيق نحو الكعبة المشرفة بمكة
          </p>
        </div>

        {/* Mini Compass Visual */}
        <div className="w-14 h-14 rounded-full border-2 border-emerald-600/30 bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center relative shrink-0 shadow-xs">
          <span className="text-[9px] font-bold text-slate-400 absolute top-0.5">ش</span>
          <span className="text-[9px] font-bold text-slate-400 absolute bottom-0.5">ج</span>
          <div
            className="w-8 h-1 bg-gradient-to-r from-emerald-600 to-amber-500 rounded-full transition-transform duration-700 shadow-xs"
            style={{ transform: 'rotate(-45deg)' }}
          />
        </div>
      </div>

      <button
        onClick={() => onNavigate('prayer')}
        className="w-full mt-2 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 hover:bg-emerald-100 text-xs font-bold text-emerald-800 dark:text-emerald-200 flex items-center justify-center gap-1 cursor-pointer transition-colors"
      >
        <span>فتح بوصلة القبلة التفاعلية</span>
        <ArrowRight className="w-3 h-3 rotate-180" />
      </button>
    </div>
  );
};
