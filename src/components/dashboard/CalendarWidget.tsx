import React from 'react';
import { Calendar as CalendarIcon, ArrowRight, Sparkles } from 'lucide-react';

interface CalendarWidgetProps {
  hijriDay: string;
  hijriMonth: string;
  hijriYear: string;
  gregorianDate: string;
  onNavigate: (tab: string) => void;
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  hijriDay,
  hijriMonth,
  hijriYear,
  gregorianDate,
  onNavigate,
}) => {
  const upcomingEvent = {
    title: 'شهر رمضان المبارك',
    desc: 'متبقي قرابة 145 يوماً على حلول الشهر الفضيل',
  };

  return (
    <div className="bg-white dark:bg-emerald-950/80 rounded-3xl p-5 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm relative overflow-hidden backdrop-blur-md flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-amiri">
          <CalendarIcon className="w-4 h-4 text-emerald-600 dark:text-amber-400" />
          <span>التَّقْوِيمُ الهِجْرِيّ</span>
        </h3>
        <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/50">
          أم القرى
        </span>
      </div>

      <div className="my-2 p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-900/30 border border-emerald-600/20">
        <div className="text-lg sm:text-xl font-bold text-emerald-900 dark:text-amber-300 font-amiri">
          {hijriDay} {hijriMonth} {hijriYear} هـ
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          الموافق: {gregorianDate}
        </div>
      </div>

      <div className="text-xs text-slate-600 dark:text-slate-300 py-1 flex items-start gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">{upcomingEvent.title}: </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">{upcomingEvent.desc}</span>
        </div>
      </div>

      <button
        onClick={() => onNavigate('calendar')}
        className="w-full mt-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 hover:bg-emerald-100 text-xs font-bold text-emerald-800 dark:text-emerald-200 flex items-center justify-center gap-1 cursor-pointer transition-colors"
      >
        <span>عرض التقويم الهجري والمناسبات</span>
        <ArrowRight className="w-3 h-3 rotate-180" />
      </button>
    </div>
  );
};
