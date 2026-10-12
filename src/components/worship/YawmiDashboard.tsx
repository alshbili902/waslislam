'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Flame, 
  BookOpen, 
  Clock, 
  Sparkles, 
  Calendar, 
  Share2, 
  ArrowLeft,
  HeartHandshake,
  Layers,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { 
  getDailyWorshipRecord, 
  toggleDailyGoal, 
  addCustomGoal, 
  removeGoal, 
  getActiveStreak, 
  getWeeklyProgress,
  DailyWorshipRecord,
  DailyGoalItem,
  getTodayDateKey
} from '../../utils/dailyWorshipManager';
import { type CityCoordinate, calculatePrayerTimes } from '../../utils/prayerTimes';
import { format12HourTime } from '../../utils/timeFormat';
import { getDetailedHijriDate, checkFastingRecommendation } from '../../utils/islamicCalendar';
import { AudioTrack } from '../AudioPlayerBar';
import { NavTab } from '../Navbar';

interface YawmiDashboardProps {
  selectedCity: CityCoordinate;
  onSelectTab?: (tab: NavTab) => void;
  onOpenQuran?: () => void;
  onOpenQuranPage?: (page: number) => void;
  onPlayTrack?: (track: AudioTrack) => void;
  isEnglish: boolean;
}

export const YawmiDashboard: React.FC<YawmiDashboardProps> = ({
  selectedCity,
  onSelectTab,
  onOpenQuran,
  onOpenQuranPage,
  onPlayTrack,
  isEnglish,

}) => {
  const [record, setRecord] = useState<DailyWorshipRecord>(() => getDailyWorshipRecord());
  const [streak, setStreak] = useState<number>(() => getActiveStreak());
  const [weeklyProgress, setWeeklyProgress] = useState(() => getWeeklyProgress());
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const today = new Date();
  const hijri = getDetailedHijriDate(today);
  const fastingInfo = checkFastingRecommendation(today);
  const prayerTimes = calculatePrayerTimes(selectedCity.lat, selectedCity.lng, selectedCity.timezone, today);

  const refreshData = () => {
    const updated = getDailyWorshipRecord();
    setRecord(updated);
    setStreak(getActiveStreak());
    setWeeklyProgress(getWeeklyProgress());
  };

  const handleToggle = (id: string) => {
    const updated = toggleDailyGoal(id);
    setRecord(updated);
    setStreak(getActiveStreak());
    setWeeklyProgress(getWeeklyProgress());
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    const updated = addCustomGoal(newGoalTitle.trim());
    setRecord(updated);
    setNewGoalTitle('');
    setIsAddingGoal(false);
    refreshData();
  };

  const handleRemove = (id: string) => {
    const updated = removeGoal(id);
    setRecord(updated);
    refreshData();
  };

  const filteredGoals = filterCategory === 'all'
    ? record.goals
    : record.goals.filter(g => g.category === filterCategory);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 w-full max-w-full min-w-0">
      {/* 1. Header Banner & Streak Counter */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--primary)] via-[#064e3b] to-[var(--gold-hover)] text-white p-5 sm:p-8 shadow-xl max-w-full">
        <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 max-w-full max-h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_70%)] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6 min-w-0 w-full">
          <div className="space-y-2 min-w-0 flex-1">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] sm:text-xs font-semibold max-w-full flex-wrap">
              <Calendar className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="truncate">{hijri.formattedAr}</span>
              <span className="text-white/40 hidden sm:inline">|</span>
              <span className="text-emerald-100 hidden sm:inline truncate">
                {today.toLocaleDateString(isEnglish ? 'en-US' : 'ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-black font-cairo tracking-tight truncate">
              {isEnglish ? 'My Day with Wasl' : 'يومي مع وصل — جدول العبادات اليومي'}
            </h2>
            <p className="text-emerald-100/90 text-xs sm:text-sm font-tajawal max-w-xl leading-relaxed">
              {isEnglish 
                ? 'Your mindful personal companion for daily prayers, Adhkar, Quran targets, and consistent spiritual habits.'
                : 'جدولك الروحي اليومي الميسر لتنظيم صلواتك، وأذكارك، ووردك القرآني بثبات وسكينة دون مشقة.'}
            </p>
          </div>

          {/* Streak & Completion Badge */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap sm:flex-nowrap w-full sm:w-auto">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 sm:p-4 text-center shrink-0 flex-1 sm:flex-initial min-w-[120px]">
              <div className="flex items-center justify-center gap-1.5 text-amber-300 font-bold text-xs mb-1">
                <Flame className="w-4 h-4 fill-amber-300" />
                <span>{isEnglish ? 'Active Streak' : 'أيام متتالية'}</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                {streak}
              </div>
              <span className="text-[10px] text-emerald-100">
                {streak > 0 ? (isEnglish ? 'Consistent Days' : 'أيام ثبات مباركة') : (isEnglish ? 'Start today' : 'ابدأ اليوم بركة')}
              </span>
            </div>

            {/* Circular Progress Meter */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 sm:p-4 text-center shrink-0 flex-1 sm:flex-initial min-w-[120px]">
              <span className="text-xs text-emerald-100 font-bold block mb-1">
                {isEnglish ? 'Completion' : 'إنجاز اليوم'}
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                {record.completionPercentage}%
              </div>
              <span className="text-[10px] text-amber-200">
                {record.completedCount} من {record.totalCount} مهام
              </span>
            </div>
          </div>
        </div>

        {/* Fasting Recommendation Banner if applicable */}
        {fastingInfo.isRecommended && (
          <div className="mt-5 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span className="font-bold">{fastingInfo.reasonAr}</span>
            </div>
            <span className="hidden sm:inline text-emerald-100/80">«من صام يوماً في سبيل الله باعد الله وجهه عن النار سبعين خريفاً»</span>
          </div>
        )}
      </section>

      {/* 2. Today's Key Targets: Prayer Countdown & Quran Ward */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Next Prayer Card */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[var(--text-muted)] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[var(--gold)]" />
              <span>الصلاة القادمة ({prayerTimes.nextPrayer?.nameAr})</span>
            </span>
            <div className="text-2xl font-black text-[var(--primary)] font-cairo">
              {format12HourTime(prayerTimes.nextPrayer?.time, isEnglish)}
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">
              في {selectedCity.nameAr} • متبقٍ {prayerTimes.nextPrayer?.remainingFormatted}
            </p>
          </div>
          <button 
            onClick={() => onSelectTab && onSelectTab('worship')}
            className="p-2.5 rounded-xl bg-[var(--bg-card-subtle)] hover:bg-[var(--primary-light)] text-[var(--primary)] border border-[var(--border-color)] text-xs font-bold transition-colors"
          >
            المواقيت
          </button>
        </div>


        {/* Daily Quran Target Card */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[var(--text-muted)] flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[var(--gold)]" />
              <span>ورد القرآن اليومي</span>
            </span>
            <div className="text-2xl font-black text-[var(--gold)] font-cairo">
              {record.quranTargetPages} صفحات
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">
              مقدار الحزب اليومي لإتمام ختمة مباركة
            </p>
          </div>
          <button 
            onClick={() => {
              if (onOpenQuran) onOpenQuran();
              else if (onSelectTab) onSelectTab('quran');
            }}
            className="px-3.5 py-2.5 rounded-xl bg-[var(--gold-light)] hover:bg-opacity-80 text-[var(--gold)] border border-[var(--border-gold)] text-xs font-bold transition-colors"
          >
            فتح المصحف
          </button>
        </div>

        {/* Suggested Academy Lesson */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[var(--text-muted)] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>فائدة علمية مقترحة اليوم</span>
            </span>
            <div className="text-base font-bold text-[var(--text-main)] truncate max-w-[180px]">
              أركان الإسلام ودلالاتها
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">
              أكاديمية وصل • قراءة في ٤ دقائق
            </p>
          </div>
          <button 
            onClick={() => onSelectTab && onSelectTab('discover')}
            className="px-3 py-2 rounded-xl bg-[var(--bg-card-subtle)] hover:bg-[var(--primary-light)] text-[var(--text-primary)] border border-[var(--border-color)] text-xs font-bold transition-colors"
          >
            اقرأ الآن
          </button>

        </div>
      </div>

      {/* 3. Weekly Progress Ribbon */}
      <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-bold text-[var(--text-main)] flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[var(--gold)]" />
            <span>نشاط الأيام السبعة الماضية</span>
          </span>
          <span className="text-[var(--text-muted)]">الهدف: إتمام أكثر من 50% يومياً</span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weeklyProgress.map((wp, i) => (
            <div 
              key={wp.dateKey} 
              className={`p-2.5 rounded-xl border text-center transition-all ${
                wp.isCompleted 
                  ? 'bg-[var(--primary-light)] border-[var(--border-color)] text-[var(--primary)] font-bold'
                  : 'bg-[var(--bg-card-subtle)] border-transparent text-[var(--text-muted)]'
              }`}
            >
              <div className="text-[11px] mb-1">{wp.dayNameAr}</div>
              <div className="text-xs font-mono font-bold">
                {wp.percentage}%
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Daily Routine Checklist */}
      <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-color)]">
          <div>
            <h3 className="font-black text-lg text-[var(--text-main)] font-cairo">
              قائمة العبادات والمهام اليومية
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              انقر على أي مهمة عند إتمامها لحساب الإنجاز ومزامنة تقدمك
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {/* Category Filter */}
            <div className="flex items-center gap-1 bg-[var(--bg-card-subtle)] p-1 rounded-xl text-xs font-semibold">
              <button 
                onClick={() => setFilterCategory('all')} 
                className={`px-2.5 py-1 rounded-lg transition-colors ${filterCategory === 'all' ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs' : 'text-[var(--text-muted)]'}`}
              >
                الكل
              </button>
              <button 
                onClick={() => setFilterCategory('prayer')} 
                className={`px-2.5 py-1 rounded-lg transition-colors ${filterCategory === 'prayer' ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs' : 'text-[var(--text-muted)]'}`}
              >
                الصلاة
              </button>
              <button 
                onClick={() => setFilterCategory('adhkar')} 
                className={`px-2.5 py-1 rounded-lg transition-colors ${filterCategory === 'adhkar' ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs' : 'text-[var(--text-muted)]'}`}
              >
                الأذكار
              </button>
              <button 
                onClick={() => setFilterCategory('quran')} 
                className={`px-2.5 py-1 rounded-lg transition-colors ${filterCategory === 'quran' ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs' : 'text-[var(--text-muted)]'}`}
              >
                القرآن
              </button>
            </div>

            <button
              onClick={() => setIsAddingGoal(!isAddingGoal)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--primary)] text-white text-xs font-bold hover:bg-[var(--primary-hover)] transition-colors shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة عادة</span>
            </button>
          </div>
        </div>

        {/* Add Custom Goal Input */}
        {isAddingGoal && (
          <form onSubmit={handleAddGoal} className="bg-[var(--bg-card-subtle)] p-4 rounded-2xl border border-[var(--border-gold)] flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              autoFocus
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              placeholder="اكتب عادة أو هدف عبادة مخصص (مثال: صلاة ركعتين قبل الظهر، قراءة تفسير آية)..."
              className="flex-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--gold)]"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-[var(--gold)] text-white rounded-xl text-xs font-bold hover:bg-[var(--gold-hover)] transition-colors"
              >
                حفظ العادة
              </button>
              <button
                type="button"
                onClick={() => setIsAddingGoal(false)}
                className="px-4 py-2 bg-[var(--bg-card)] text-[var(--text-muted)] rounded-xl text-xs font-bold hover:text-[var(--text-main)]"
              >
                إلغاء
              </button>
            </div>
          </form>
        )}

        {/* Task Cards List */}
        <div className="space-y-2.5">
          {filteredGoals.map((goal) => {
            return (
              <div
                key={goal.id}
                onClick={() => handleToggle(goal.id)}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  goal.isCompleted
                    ? 'bg-[var(--primary-light)]/40 border-[var(--border-color)] text-[var(--text-main)]'
                    : 'bg-[var(--bg-card-subtle)]/70 hover:bg-[var(--bg-card-subtle)] border-transparent text-[var(--text-main)]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(goal.id);
                    }}
                    className="shrink-0 text-xl"
                  >
                    {goal.isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Circle className="w-6 h-6 text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <span className={`text-sm sm:text-base font-bold block truncate font-cairo ${goal.isCompleted ? 'line-through text-[var(--text-muted)]' : ''}`}>
                      {goal.titleAr}
                    </span>
                    {goal.descriptionAr && (
                      <span className="text-[11px] text-[var(--text-muted)] block truncate">
                        {goal.descriptionAr}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {goal.targetCount && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] font-mono font-bold">
                      {goal.currentCount || 0} / {goal.targetCount}
                    </span>
                  )}

                  {goal.isCustom && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(goal.id);
                      }}
                      className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-500 transition-colors"
                      title="حذف هذا الهدف المخصص"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
