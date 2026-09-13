import React from 'react';
import { Compass, Clock, ArrowRight, MapPin } from 'lucide-react';
import { PrayerTimesData } from '../../types';
import { NextPrayerInfo } from '../../services/prayerService';

interface PrayerWidgetProps {
  timings: PrayerTimesData | null;
  nextPrayer: NextPrayerInfo;
  cityName: string;
  onNavigate: (tab: string) => void;
}

export const PrayerWidget: React.FC<PrayerWidgetProps> = ({
  timings,
  nextPrayer,
  cityName,
  onNavigate,
}) => {
  const prayerList = timings
    ? [
        { name: 'الفجر', time: timings.fajr },
        { name: 'الشروق', time: timings.sunrise },
        { name: 'الظهر', time: timings.dhuhr },
        { name: 'العصر', time: timings.asr },
        { name: 'المغرب', time: timings.maghrib },
        { name: 'العشاء', time: timings.isha },
      ]
    : [];

  return (
    <div className="bg-white dark:bg-emerald-950/80 rounded-3xl p-5 sm:p-6 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm relative overflow-hidden backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-amiri">
            <Compass className="w-4 h-4 text-emerald-600 dark:text-amber-400" />
            <span>مَوَاقِيتُ الصَّلَاة</span>
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-600" />
            <span>{cityName} • تقويم أم القرى</span>
          </p>
        </div>
        <button
          onClick={() => onNavigate('prayer')}
          className="text-xs text-emerald-800 dark:text-amber-300 hover:underline font-bold flex items-center gap-1 cursor-pointer"
        >
          <span>جدول الصلوات</span>
          <ArrowRight className="w-3 h-3 rotate-180" />
        </button>
      </div>

      {/* Grid of Prayers */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {prayerList.map((p) => {
          const isCurrent = nextPrayer.currentPrayerAr === p.name;
          const isNext = nextPrayer.nextPrayerAr === p.name;

          return (
            <div
              key={p.name}
              className={`p-2.5 rounded-2xl text-center border transition-all ${
                isNext
                  ? 'bg-amber-500/15 border-amber-500 text-amber-900 dark:text-amber-300 font-bold shadow-xs'
                  : isCurrent
                  ? 'bg-emerald-800 text-white border-emerald-700 font-bold shadow-xs'
                  : 'bg-slate-50 dark:bg-emerald-900/30 border-slate-200/70 dark:border-emerald-800/40 text-slate-700 dark:text-slate-200'
              }`}
            >
              <div className="text-[11px] mb-1">{p.name}</div>
              <div className="text-xs sm:text-sm font-bold font-mono tracking-tight" dir="ltr">
                {p.time}
              </div>
              {isNext && (
                <div className="text-[9px] text-amber-700 dark:text-amber-300 mt-1 font-bold">
                  القادمة
                </div>
              )}
              {isCurrent && !isNext && (
                <div className="text-[9px] text-emerald-200 mt-1 font-semibold">
                  الحالية
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
