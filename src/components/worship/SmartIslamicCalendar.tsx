'use client';

import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronRight, 
  ChevronLeft, 
  Moon, 
  Sparkles, 
  Info, 
  Sliders, 
  CheckCircle2, 
  Bell,
  Clock
} from 'lucide-react';
import { 
  getDetailedHijriDate, 
  checkFastingRecommendation, 
  getOccasionForHijriDay, 
  ISLAMIC_OCCASIONS, 
  HIJRI_MONTHS_NAMES,
  IslamicOccasion
} from '../../utils/islamicCalendar';
import { localStore } from '../../lib/supabase';

interface SmartIslamicCalendarProps {
  isEnglish?: boolean;
}

export const SmartIslamicCalendar: React.FC<SmartIslamicCalendarProps> = ({ isEnglish = false }) => {
  // Adjustment in days (-2 to +2)
  const [adjustment, setAdjustment] = useState<number>(() => 
    localStore.get('hijri_calendar_adjustment', 0)
  );
  
  // Current viewing month (Gregorian anchor for calendar grid)
  const [viewDate, setViewDate] = useState<Date>(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  const handleAdjustmentChange = (delta: number) => {
    setAdjustment(delta);
    localStore.set('hijri_calendar_adjustment', delta);
  };

  const handlePrevMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleGoToday = () => {
    const now = new Date();
    setViewDate(now);
    setSelectedDate(now);
  };

  // Generate grid days for viewing month
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

  // Selected date details
  const selectedHijri = getDetailedHijriDate(selectedDate, adjustment);
  const selectedFasting = checkFastingRecommendation(selectedDate, adjustment);
  const selectedOccasion = getOccasionForHijriDay(selectedHijri.month, selectedHijri.day);

  // Month Hijri range (start and end Hijri dates in current viewed Gregorian month)
  const startHijri = getDetailedHijriDate(firstDayOfMonth, adjustment);
  const endHijri = getDetailedHijriDate(lastDayOfMonth, adjustment);

  const weekDayHeaders = isEnglish 
    ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    : ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  const gregorianMonthNamesAr = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  return (
    <div className="space-y-6">
      {/* Header & Moon-Sighting Controls */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[var(--gold-light)] text-[var(--gold)]">
                <CalendarIcon className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-amiri text-[var(--text-main)]">
                {isEnglish ? 'Smart Islamic Calendar' : 'التقويم الإسلامي الذكي'}
              </h2>
            </div>
            <p className="text-xs text-[var(--text-muted)] font-tajawal">
              {isEnglish 
                ? 'Accurate Umm al-Qura calendar with voluntary fasting reminders'
                : 'تقويم هجري وميلادي متزامن مع تنبيهات صيام التطوع والمناسبات الإسلامية'}
            </p>
          </div>

          {/* Adjustment Selector */}
          <div className="flex items-center gap-2 bg-[var(--bg-card-subtle)] border border-[var(--border-color)] rounded-2xl px-3 py-2 text-xs">
            <Sliders className="w-4 h-4 text-[var(--gold)] shrink-0" />
            <span className="font-semibold text-[var(--text-muted)]">
              {isEnglish ? 'Moon Sighting Adj:' : 'ضبط الرؤية الشرعية:'}
            </span>
            <div className="flex items-center gap-1">
              {[-2, -1, 0, 1, 2].map((adj) => (
                <button
                  key={adj}
                  onClick={() => handleAdjustmentChange(adj)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                    adjustment === adj
                      ? 'bg-[var(--gold)] text-black font-extrabold shadow-sm'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)]'
                  }`}
                  title={`${adj >= 0 ? '+' : ''}${adj} ${isEnglish ? 'days' : 'يوم'}`}
                >
                  {adj >= 0 ? `+${adj}` : adj}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calendar Month Navigation Header */}
        <div className="flex items-center justify-between mt-6 pt-5 border-t border-[var(--border-color)]">
          <button
            onClick={isEnglish ? handlePrevMonth : handleNextMonth}
            className="p-2 rounded-xl border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)] transition-colors"
            aria-label="Previous month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="text-center">
            <div className="text-lg sm:text-xl font-bold font-amiri text-[var(--text-main)]">
              {startHijri.monthNameAr === endHijri.monthNameAr 
                ? `${startHijri.monthNameAr} ${startHijri.year} هـ` 
                : `${startHijri.monthNameAr} / ${endHijri.monthNameAr} ${endHijri.year} هـ`}
            </div>
            <div className="text-xs font-semibold text-[var(--text-muted)] mt-0.5">
              {gregorianMonthNamesAr[month]} {year} م
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGoToday}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--primary-light)] text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--gold)] transition-colors"
            >
              {isEnglish ? 'Today' : 'اليوم'}
            </button>
            <button
              onClick={isEnglish ? handleNextMonth : handlePrevMonth}
              className="p-2 rounded-xl border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)] transition-colors"
              aria-label="Next month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid + Selected Day Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (2 cols on large screen) */}
        <div className="lg:col-span-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-4 sm:p-6 shadow-sm space-y-3">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-[var(--text-muted)] pb-2 border-b border-[var(--border-color)]">
            {weekDayHeaders.map((header, idx) => (
              <div key={idx} className="py-1">
                {header}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* Empty prefix cells */}
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-16 sm:h-20 rounded-2xl bg-transparent" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const date = new Date(year, month, dayNum);
              const hijri = getDetailedHijriDate(date, adjustment);
              const fasting = checkFastingRecommendation(date, adjustment);
              const occasion = getOccasionForHijriDay(hijri.month, hijri.day);
              
              const isToday = 
                date.getDate() === new Date().getDate() &&
                date.getMonth() === new Date().getMonth() &&
                date.getFullYear() === new Date().getFullYear();

              const isSelected = 
                date.getDate() === selectedDate.getDate() &&
                date.getMonth() === selectedDate.getMonth() &&
                date.getFullYear() === selectedDate.getFullYear();

              return (
                <button
                  key={dayNum}
                  onClick={() => setSelectedDate(date)}
                  className={`h-16 sm:h-20 p-1.5 sm:p-2 rounded-2xl border text-right flex flex-col justify-between transition-all relative group ${
                    isSelected
                      ? 'border-[var(--gold)] bg-[var(--gold-light)]/40 shadow-md ring-1 ring-[var(--gold)]'
                      : isToday
                      ? 'border-[var(--border-gold)] bg-[var(--primary-light)]'
                      : 'border-[var(--border-color)]/60 bg-[var(--bg-card-subtle)] hover:border-[var(--gold)]/60'
                  }`}
                >
                  {/* Top indicators */}
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-[11px] sm:text-xs font-bold ${
                      isToday ? 'text-[var(--gold)]' : 'text-[var(--text-main)]'
                    }`}>
                      {dayNum}
                    </span>

                    {/* Occasion / Fasting Badges */}
                    <div className="flex items-center gap-0.5">
                      {occasion && (
                        <span className="w-2 h-2 rounded-full bg-[var(--gold)] animate-pulse" title={occasion.nameAr} />
                      )}
                      {fasting.isRecommended && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title={fasting.reasonAr} />
                      )}
                    </div>
                  </div>

                  {/* Bottom Hijri Date */}
                  <div className="text-left w-full">
                    <span className="text-[10px] sm:text-xs font-amiri font-bold text-[var(--gold)]">
                      {hijri.day}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-[var(--border-color)] text-xs text-[var(--text-muted)] font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>{isEnglish ? 'Voluntary Fasting' : 'صيام تطوع (إثنين/خميس/البيض)'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--gold)]" />
              <span>{isEnglish ? 'Islamic Occasion' : 'مناسبة إسلامية جليلة'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-md bg-[var(--primary-light)] border border-[var(--border-gold)]" />
              <span>{isEnglish ? 'Today' : 'اليوم الحالي'}</span>
            </div>
          </div>
        </div>

        {/* Selected Day Details Panel */}
        <div className="space-y-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[var(--gold)] tracking-wide">
                {isEnglish ? 'Day Details' : 'تفاصيل اليوم المحدد'}
              </span>
              <h3 className="text-2xl font-bold font-amiri text-[var(--text-main)]">
                {selectedHijri.formattedAr}
              </h3>
              <p className="text-xs font-medium text-[var(--text-muted)]">
                {selectedDate.toLocaleDateString(isEnglish ? 'en-US' : 'ar-SA', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            {/* Islamic Occasion Info if present */}
            {selectedOccasion && (
              <div className="p-4 rounded-2xl bg-[var(--gold-light)] border border-[var(--border-gold)] space-y-1.5 animate-in fade-in">
                <div className="flex items-center gap-2 text-[var(--gold)] font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>{isEnglish ? selectedOccasion.nameEn : selectedOccasion.nameAr}</span>
                </div>
                <p className="text-xs text-[var(--text-main)] font-tajawal leading-relaxed">
                  {selectedOccasion.descriptionAr}
                </p>
              </div>
            )}

            {/* Fasting Recommendation */}
            {selectedFasting.isRecommended ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                  <Moon className="w-4 h-4" />
                  <span>{isEnglish ? 'Recommended Fasting Day' : 'يوم مستحب صيامه'}</span>
                </div>
                <p className="text-xs text-[var(--text-main)] font-tajawal">
                  {selectedFasting.reasonAr}
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs text-[var(--text-muted)]">
                {isEnglish ? 'Ordinary day — maintain daily Adhkar and worship.' : 'يوم اعتيادي — استثمر وقتك في الورد القرآني والأذكار.'}
              </div>
            )}

            {/* Voluntary Fasting Reminder Advice */}
            <div className="pt-2 text-xs text-[var(--text-muted)] leading-relaxed space-y-2 border-t border-[var(--border-color)]">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-[var(--gold)] shrink-0 mt-0.5" />
                <span>
                  {isEnglish 
                    ? 'White Days are the 13th, 14th, and 15th of each Hijri month. Fasting them is like fasting the entire year.'
                    : 'الأيام البيض هي 13 و 14 و 15 من كل شهر هجري، وصيامها كصيام الدهر كما ورد في السنة الصحيحة.'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick List of Major Annual Occasions */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-5 shadow-sm space-y-3">
            <h4 className="text-sm font-bold font-amiri text-[var(--text-main)] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--gold)]" />
              <span>{isEnglish ? 'Major Islamic Occasions' : 'أبرز المحطات والمناسبات السنوية'}</span>
            </h4>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {ISLAMIC_OCCASIONS.slice(0, 5).map((occ) => (
                <div 
                  key={occ.id}
                  className="p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] flex items-center justify-between text-xs"
                >
                  <span className="font-bold text-[var(--text-main)]">
                    {isEnglish ? occ.nameEn : occ.nameAr}
                  </span>
                  <span className="text-[var(--gold)] font-amiri font-bold">
                    {occ.hijriDay} {HIJRI_MONTHS_NAMES[occ.hijriMonth - 1]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
