import React, { useState } from 'react';
import { Calendar as CalendarIcon, Sparkles, ChevronLeft, ChevronRight, Star, Clock } from 'lucide-react';
import { HIJRI_MONTHS_AR, ISLAMIC_EVENTS } from '../data/calendarEvents';

export const CalendarView: React.FC = () => {
  const [selectedMonthIdx, setSelectedMonthIdx] = useState(2); // 2 = Rabi al-Awwal (current)
  const [currentYear, setCurrentYear] = useState(1448);

  const monthName = HIJRI_MONTHS_AR[selectedMonthIdx];
  const eventsInMonth = ISLAMIC_EVENTS.filter((e) => e.hijriMonth === selectedMonthIdx + 1);

  // Month days generator (29 or 30 days)
  const daysInMonth = [0, 2, 4, 6, 8, 10].includes(selectedMonthIdx) ? 30 : 29;

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 sm:p-6 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              التقويم الهجري والمناسبات الإسلامية
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            متابعة التاريخ الهجري المقترن بالتاريخ الميلادي والمناسبات والمواسم الدينية الفاضلة.
          </p>
        </div>

        {/* Today's Prominent Display */}
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-600/20 text-right min-w-[220px]">
          <span className="text-[11px] font-bold text-emerald-700 dark:text-amber-300 block">
            اليوم الحالي:
          </span>
          <p className="text-base font-bold text-slate-900 dark:text-white font-amiri">
            السبت 20 ربيع الأول 1448 هـ
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            الموافق 12 سبتمبر 2026 م
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Month Calendar Grid */}
        <div className="lg:col-span-8 bg-white dark:bg-emerald-950/80 rounded-2xl p-5 sm:p-6 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm space-y-4">
          {/* Month Navigator */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-900/60">
            <button
              onClick={() => setSelectedMonthIdx((prev) => (prev > 0 ? prev - 1 : 11))}
              className="p-2 rounded-xl border border-slate-200 dark:border-emerald-800 hover:bg-slate-50 dark:hover:bg-emerald-900 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="text-center">
              <h2 className="text-lg font-bold font-amiri text-slate-900 dark:text-white">
                شهر {monthName} {currentYear} هـ
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                الشهر رقم {selectedMonthIdx + 1} من السنة الهجرية
              </span>
            </div>
            <button
              onClick={() => setSelectedMonthIdx((prev) => (prev < 11 ? prev + 1 : 0))}
              className="p-2 rounded-xl border border-slate-200 dark:border-emerald-800 hover:bg-slate-50 dark:hover:bg-emerald-900 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500 dark:text-slate-400 pb-2">
            <span>الأحد</span>
            <span>الإثنين</span>
            <span>الثلاثاء</span>
            <span>الأربعاء</span>
            <span>الخميس</span>
            <span>الجمعة</span>
            <span>السبت</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: daysInMonth }, (_, i) => {
              const dayNum = i + 1;
              const hasEvent = eventsInMonth.some((e) => e.hijriDay === dayNum);
              const isToday = selectedMonthIdx === 2 && dayNum === 20;

              return (
                <div
                  key={dayNum}
                  className={`p-3 rounded-xl border text-center relative transition-all ${
                    isToday
                      ? 'bg-emerald-800 text-white border-emerald-600 shadow-md font-bold'
                      : hasEvent
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800/60'
                      : 'bg-slate-50/50 dark:bg-emerald-900/20 border-slate-100 dark:border-emerald-900/40 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <span className="text-sm sm:text-base font-bold block">{dayNum}</span>
                  {hasEvent && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mx-auto mt-1 block" />
                  )}
                  {isToday && (
                    <span className="text-[9px] text-amber-300 block font-medium">اليوم</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Important Islamic Occasions List */}
        <div className="lg:col-span-4 bg-white dark:bg-emerald-950/80 rounded-2xl p-5 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm flex flex-col h-[650px]">
          <div className="pb-3 border-b border-slate-100 dark:border-emerald-900/60 mb-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>أبرز المناسبات الإسلامية</span>
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              المواسم الفاضلة على مدار العام الهجري
            </span>
          </div>

          <div className="overflow-y-auto flex-1 space-y-3 pr-1">
            {ISLAMIC_EVENTS.map((ev) => (
              <div
                key={ev.id}
                className="p-3.5 rounded-xl border border-slate-100 dark:border-emerald-900/50 bg-slate-50/60 dark:bg-emerald-900/20 text-right space-y-1"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs sm:text-sm text-emerald-900 dark:text-emerald-200">
                    {ev.titleAr}
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 font-bold shrink-0">
                    {ev.hijriDay} {ev.monthNameAr}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {ev.descriptionAr}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
