import React, { useEffect, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Moon,
  Info,
  CalendarCheck,
  ShieldCheck,
  Heart
} from 'lucide-react';
import {
  FastingRecord,
  FastingStats,
  fetchUserFastingRecords,
  recordFastingStatus,
  calculateFastingStats,
  getRecommendedFastingType,
  FastingTypeAr
} from '../services/fastingService';
import { HIJRI_MONTHS_AR } from '../data/calendarEvents';

interface FastingViewProps {
  userId?: string;
}

export const FastingView: React.FC<FastingViewProps> = ({ userId }) => {
  const [records, setRecords] = useState<FastingRecord[]>([]);
  const [stats, setStats] = useState<FastingStats>({
    thisMonthCount: 0,
    thisYearCount: 0,
    totalCompleted: 0,
    ramadanCompleted: 0,
    ramadanTotal: 30,
    voluntariesCompleted: 0
  });

  // Active viewing date (year & month navigation)
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDayModal, setSelectedDayModal] = useState<{
    dateStr: string;
    dayNum: number;
    recommendedType: string | null;
    currentRecord?: FastingRecord;
  } | null>(null);

  // Load records
  useEffect(() => {
    async function load() {
      const data = await fetchUserFastingRecords(userId);
      setRecords(data);
      setStats(calculateFastingStats(data));
    }
    load();
  }, [userId]);

  // Fasting fast options
  const FASTING_OPTIONS: FastingTypeAr[] = [
    'صيام رمضان',
    'صيام الاثنين',
    'صيام الخميس',
    'صيام أيام البيض',
    'صيام يوم عرفة',
    'صيام عاشوراء وتاسوعاء',
    'صيام الست من شوال',
    'صيام قضاء',
    'صيام نفل مطلق',
    'صيام نذر'
  ];

  // Calendar month days generation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-11
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun

  const monthNamesAr = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDayClick = (dayNum: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const dayDate = new Date(year, month, dayNum);
    const rec = records.find((r) => r.fasting_date === dateStr);
    const recommended = getRecommendedFastingType(dayDate);

    setSelectedDayModal({
      dateStr,
      dayNum,
      recommendedType: recommended,
      currentRecord: rec
    });
  };

  const handleUpdateStatus = async (
    status: 'completed' | 'missed' | 'none',
    fastingType: string
  ) => {
    if (!selectedDayModal) return;

    const updated = await recordFastingStatus(
      selectedDayModal.dateStr,
      status,
      fastingType,
      '',
      userId
    );
    setRecords(updated);
    setStats(calculateFastingStats(updated));
    setSelectedDayModal(null);
  };

  // Ramadan special detector
  const isRamadanActive = stats.ramadanCompleted > 0;

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-6 sm:p-7 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <span className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
              <Moon className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-amiri text-slate-900 dark:text-white">
                صيامي — سجل العبادة الخاص
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                متابعة شخصية خاصة وخالية من المقارنات لاحتساب أجر صيام الفريضة والنوافل.
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-200/50 dark:border-emerald-800/50">
            <ShieldCheck className="w-4 h-4" />
            <span>سجل خاص ومحمي بالكامل</span>
          </div>
        </div>
      </div>

      {/* Ramadan Mode Highlight (if active or relevant) */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-950 to-teal-950 text-white shadow-lg border border-emerald-700/40 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs text-amber-300 font-bold bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>صيام شهر رمضان المبارك</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-amiri text-white">
              أيام الصيام والاحتساب
            </h3>
            <p className="text-xs text-emerald-200">
              قال رسول الله ﷺ: «مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا، غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ».
            </p>
          </div>

          <div className="flex items-center gap-4 text-center">
            <div className="bg-black/30 px-4 py-2 rounded-xl border border-emerald-600/30">
              <span className="text-[11px] text-emerald-300 block">أيام صمتها</span>
              <strong className="text-2xl font-mono font-bold text-amber-300">
                {stats.ramadanCompleted}
              </strong>
            </div>
            <div className="bg-black/30 px-4 py-2 rounded-xl border border-emerald-600/30">
              <span className="text-[11px] text-emerald-300 block">المتبقي</span>
              <strong className="text-2xl font-mono font-bold text-white">
                {Math.max(0, 30 - stats.ramadanCompleted)}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Private Statistics Cards (No Leaderboards, purely personal) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-emerald-950/80 border border-emerald-900/10 dark:border-emerald-800/50 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">أيام الصيام (هذا الشهر)</span>
          <strong className="text-2xl font-mono font-bold text-emerald-800 dark:text-emerald-300">
            {stats.thisMonthCount} <span className="text-xs font-normal">أيام</span>
          </strong>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-emerald-950/80 border border-emerald-900/10 dark:border-emerald-800/50 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">أيام الصيام (هذا العام)</span>
          <strong className="text-2xl font-mono font-bold text-emerald-800 dark:text-emerald-300">
            {stats.thisYearCount} <span className="text-xs font-normal">أيام</span>
          </strong>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-emerald-950/80 border border-emerald-900/10 dark:border-emerald-800/50 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">صيام النوافل المكتمل</span>
          <strong className="text-2xl font-mono font-bold text-amber-600 dark:text-amber-400">
            {stats.voluntariesCompleted} <span className="text-xs font-normal">أيام</span>
          </strong>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-emerald-950/80 border border-emerald-900/10 dark:border-emerald-800/50 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">إجمالي الأيام المسجلة</span>
          <strong className="text-2xl font-mono font-bold text-slate-900 dark:text-white">
            {stats.totalCompleted} <span className="text-xs font-normal">أيام</span>
          </strong>
        </div>
      </div>

      {/* Fasting Calendar */}
      <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-6 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-emerald-900/60">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl bg-slate-50 dark:bg-emerald-900/40 hover:bg-emerald-100 transition-colors text-slate-700 dark:text-slate-200"
            title="الشهر السابق"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="text-center">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {monthNamesAr[month]} {year}
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              انقر على أي يوم لتسجيل الصيام أو تعديل حالته
            </span>
          </div>

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl bg-slate-50 dark:bg-emerald-900/40 hover:bg-emerald-100 transition-colors text-slate-700 dark:text-slate-200"
            title="الشهر القادم"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-slate-500 dark:text-slate-400">
          <div>الأحد</div>
          <div>الإثنين</div>
          <div>الثلاثاء</div>
          <div>الأربعاء</div>
          <div>الخميس</div>
          <div>الجمعة</div>
          <div>السبت</div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-16 sm:h-20 rounded-xl bg-slate-50/40 dark:bg-emerald-950/20" />
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const record = records.find((r) => r.fasting_date === dateStr);
            const isCompleted = record?.status === 'completed';
            const isMissed = record?.status === 'missed';

            const dayDate = new Date(year, month, dayNum);
            const recommended = getRecommendedFastingType(dayDate);

            return (
              <button
                key={dayNum}
                onClick={() => handleDayClick(dayNum)}
                className={`h-16 sm:h-20 rounded-xl p-2 text-right flex flex-col justify-between border transition-all text-xs relative ${
                  isCompleted
                    ? 'bg-emerald-500/15 border-emerald-500 dark:bg-emerald-900/50 shadow-xs'
                    : isMissed
                    ? 'bg-rose-500/10 border-rose-400 dark:bg-rose-950/30'
                    : 'bg-slate-50 dark:bg-emerald-900/20 border-slate-200/70 dark:border-emerald-800/40 hover:border-emerald-400'
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="font-bold font-mono text-sm text-slate-800 dark:text-slate-200">
                    {dayNum}
                  </span>
                  {isCompleted && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  )}
                  {isMissed && (
                    <XCircle className="w-4 h-4 text-rose-500" />
                  )}
                </div>

                {record ? (
                  <span className="text-[10px] text-emerald-800 dark:text-emerald-300 truncate block font-medium">
                    {record.fasting_type}
                  </span>
                ) : recommended ? (
                  <span className="text-[9px] text-amber-600 dark:text-amber-400 truncate block font-medium">
                    {recommended}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Verified Islamic Fasting Days Guidelines */}
      <div className="bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl p-6 border border-emerald-200/70 dark:border-emerald-800/50 space-y-3 text-xs">
        <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-bold text-sm">
          <Info className="w-4 h-4" />
          <span>أيام الصيام المسنونة الثابتة في السنة النبوية الصحيحة:</span>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
          <li className="flex items-start gap-1.5">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
            <span><strong>صيام الاثنين والخميس:</strong> تُعرض فيهما الأعمال على الله تعالى.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
            <span><strong>أيام البيض (13، 14، 15):</strong> صيامها كصيام الدهر كله.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
            <span><strong>يوم عرفة (9 ذو الحجة):</strong> يُكفّر ذنوب السنة الماضية والسنة الباقية لغير الحاج.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
            <span><strong>عاشوراء وتاسوعاء (9 و 10 المحرم):</strong> كفارة ذنوب سنة ماضية.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
            <span><strong>الست من شوال:</strong> من صام رمضان ثم أتبعه بستاً من شوال كان كصيام الدهر.</span>
          </li>
        </ul>
      </div>

      {/* Day Action Modal */}
      {selectedDayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-emerald-950 rounded-3xl max-w-md w-full p-6 border border-emerald-900/20 dark:border-emerald-800/60 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-900">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                تسجيل صيام يوم: {selectedDayModal.dateStr}
              </h3>
              <button
                onClick={() => setSelectedDayModal(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {selectedDayModal.recommendedType && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>المستحب لهذا اليوم: <strong>{selectedDayModal.recommendedType}</strong></span>
              </div>
            )}

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                نوع الصيام:
              </label>
              <select
                id="fastingTypeSelect"
                defaultValue={
                  selectedDayModal.currentRecord?.fasting_type ||
                  selectedDayModal.recommendedType ||
                  'صيام نفل مطلق'
                }
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-slate-200 dark:border-emerald-700 text-slate-900 dark:text-white text-xs font-medium"
              >
                {FASTING_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  const sel = (document.getElementById('fastingTypeSelect') as HTMLSelectElement)?.value;
                  handleUpdateStatus('completed', sel || 'صيام نفل مطلق');
                }}
                className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>صُمْتُ هذا اليوم</span>
              </button>

              <button
                onClick={() => {
                  const sel = (document.getElementById('fastingTypeSelect') as HTMLSelectElement)?.value;
                  handleUpdateStatus('missed', sel || 'صيام نفل مطلق');
                }}
                className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-emerald-900/40 dark:hover:bg-emerald-900/60 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <XCircle className="w-4 h-4 text-rose-500" />
                <span>لم أصُمْ</span>
              </button>
            </div>

            {selectedDayModal.currentRecord && (
              <button
                onClick={() => handleUpdateStatus('none', '')}
                className="w-full text-center text-xs text-rose-500 hover:text-rose-600 font-medium py-1"
              >
                مسح الحالة وإلغاء التسجيل
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
