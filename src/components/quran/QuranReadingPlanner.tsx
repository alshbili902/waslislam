'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  RotateCcw, 
  Plus, 
  Sliders, 
  ChevronLeft, 
  ArrowRight, 
  Pause, 
  Play, 
  Bookmark, 
  TrendingUp, 
  Compass, 
  Award,
  AlertCircle,
  Sunrise,
  Sun,
  SunMedium,
  Sunset,
  Moon,
  X
} from 'lucide-react';
import { 
  ReadingPlan, 
  ReadingPlannerService, 
  ReadingUnit, 
  SURAH_START_PAGES 
} from '../../utils/readingPlannerManager';
import { SURAH_LIST } from '../../data/quranMetadata';

interface QuranReadingPlannerProps {
  isEnglish: boolean;
  onOpenQuranToPage: (page: number) => void;
  onUpdateKhatmah?: (page: number) => void;
}

const DAY_NAMES_AR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const DAY_NAMES_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const QuranReadingPlanner: React.FC<QuranReadingPlannerProps> = ({
  isEnglish,
  onOpenQuranToPage,
  onUpdateKhatmah
}) => {
  const [plan, setPlan] = useState<ReadingPlan>(() => ReadingPlannerService.getPlan());
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isAdaptiveModalOpen, setIsAdaptiveModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Wizard form state
  const [wizardUnit, setWizardUnit] = useState<ReadingUnit>(plan.unitType);
  const [wizardDays, setWizardDays] = useState(30);
  const [wizardSessions, setWizardSessions] = useState(plan.sessionsPerDay);
  const [wizardActiveDays, setWizardActiveDays] = useState<number[]>(plan.activeDaysOfWeek);
  const [wizardStartPage, setWizardStartPage] = useState(plan.startPage || 1);

  // Sync state changes
  const metrics = ReadingPlannerService.calculateMetrics(plan);

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleRecordProgress = (units: number) => {
    const updated = ReadingPlannerService.recordProgress(plan, units);
    setPlan(updated);
    if (onUpdateKhatmah && updated.unitType === 'pages') {
      onUpdateKhatmah(Math.min(604, updated.completedUnits + 1));
    }
    showNotification(
      isEnglish 
        ? `Successfully recorded ${units} ${plan.unitType}!` 
        : `تم تسجيل إنجاز ${units} ${plan.unitType === 'pages' ? 'صفحة' : plan.unitType === 'ayahs' ? 'آية' : 'جزء'} بنجاح!`
    );
  };

  const handleTogglePause = () => {
    const updated = ReadingPlannerService.togglePausePlan(plan);
    setPlan(updated);
    showNotification(
      updated.status === 'paused' 
        ? (isEnglish ? 'Plan paused temporarily.' : 'تم إيقاف الخطة مؤقتاً.')
        : (isEnglish ? 'Plan resumed successfully.' : 'تم استئناف الخطة بنجاح!')
    );
  };

  const handleApplyAdaptive = (mode: 'increase_daily' | 'extend_date' | 'redistribute', extraDays = 7) => {
    const updated = ReadingPlannerService.recalculatePlan(plan, mode, extraDays);
    setPlan(updated);
    setIsAdaptiveModalOpen(false);
    showNotification(
      isEnglish ? 'Plan schedule recalibrated successfully!' : 'تمت إعادة ضبط وتعديل الخطة بمرونة!'
    );
  };

  const handleSaveWizard = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const end = new Date(today);
    end.setDate(end.getDate() + wizardDays);

    let total = 604;
    if (wizardUnit === 'ayahs') total = 6236;
    if (wizardUnit === 'juz') total = 30;

    const newPlan: ReadingPlan = {
      ...plan,
      title: `خطة ختم القرآن الكريم (${wizardDays} يوماً)`,
      unitType: wizardUnit,
      totalUnits: total,
      completedUnits: Math.max(0, wizardStartPage - 1),
      startDate: todayStr,
      targetEndDate: end.toISOString().split('T')[0],
      sessionsPerDay: wizardSessions,
      activeDaysOfWeek: wizardActiveDays,
      startPage: wizardStartPage,
      status: 'active'
    };

    ReadingPlannerService.savePlan(newPlan);
    setPlan(newPlan);
    setIsWizardOpen(false);
    showNotification(isEnglish ? 'New reading plan initialized!' : 'تم إنشاء وتفعيل خطة الورد القرآني بنجاح!');
  };

  const toggleDayOfWeek = (dayIndex: number) => {
    if (wizardActiveDays.includes(dayIndex)) {
      if (wizardActiveDays.length > 1) {
        setWizardActiveDays(wizardActiveDays.filter(d => d !== dayIndex));
      }
    } else {
      setWizardActiveDays([...wizardActiveDays, dayIndex].sort());
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-300" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <section className="bg-[var(--bg-card)] border border-[var(--border-gold)] rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[var(--border-color)]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--gold-light)] text-[var(--gold)] text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>مخطط الورد القرآني التكيفي</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-main)] font-cairo">
              {isEnglish ? 'Quran Reading Planner' : 'مخطط الورد القرآني الذكي'}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1.5 max-w-2xl leading-relaxed">
              {isEnglish
                ? 'An intelligent, transparent reading companion that aligns with your daily prayers, recalculates when life happens, and connects directly to the Holy Quran.'
                : 'جدول قراءة مرن وشفاف يتكامل مع صلواتك الخمس، يتكيف تلقائياً عند فوات ورد، ويرتبط مباشرة بالمصحف الشريف ومتابعة الختمة.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsAdaptiveModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[var(--bg-card-subtle)] text-[var(--text-main)] text-xs font-bold border border-[var(--border-color)] hover:border-[var(--gold)] transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
              <span>{isEnglish ? 'Adjust Plan' : 'إعادة موازنة الخطة'}</span>
            </button>
            <button
              onClick={() => setIsWizardOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-xs font-bold hover:bg-[var(--primary-dark)] transition-colors shadow-sm flex items-center gap-2"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{isEnglish ? 'Plan Settings' : 'تخصيص الخطة'}</span>
            </button>
          </div>
        </div>

        {/* Progress Bar & Status Pill */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <div className="flex items-center gap-2 text-[var(--text-main)]">
              <span>نسبة الإنجاز الإجمالية:</span>
              <span className="text-[var(--gold)] font-mono text-sm">{metrics.percentage}%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                plan.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
              }`}>
                {plan.status === 'active' ? (
                  <span className="inline-flex items-center gap-1">
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>الخطة نشطة</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <Pause className="w-2.5 h-2.5 fill-current" />
                    <span>متوقفة مؤقتاً</span>
                  </span>
                )}
              </span>
              <button 
                onClick={handleTogglePause}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] underline flex items-center gap-1"
              >
                {plan.status === 'active' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{plan.status === 'active' ? 'إيقاف مؤقت' : 'استئناف'}</span>
              </button>
            </div>
          </div>
          <div className="w-full bg-[var(--border-color)] rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[var(--primary)] to-[var(--gold)] h-full transition-all duration-700 rounded-full"
              style={{ width: `${metrics.percentage}%` }}
            />
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          {/* Daily Target */}
          <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium mb-1">
              <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
              <span>الورد اليومي المطلوب</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-[var(--text-main)] font-mono">
              {metrics.dailyTargetUnits}{' '}
              <span className="text-xs font-tajawal text-[var(--text-muted)]">
                {plan.unitType === 'pages' ? 'صفحة' : plan.unitType === 'ayahs' ? 'آية' : 'جزء'}
              </span>
            </div>
            <div className="text-[11px] text-[var(--text-muted)] mt-1">
              بمعدل ~{metrics.perSessionTarget} بعد كل صلاة
            </div>
          </div>

          {/* Session Time Estimate */}
          <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>الوقت التقديري للجلسة</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-[var(--text-main)] font-mono">
              ~{metrics.minutesPerSession}{' '}
              <span className="text-xs font-tajawal text-[var(--text-muted)]">دقيقة</span>
            </div>
            <div className="text-[11px] text-[var(--text-muted)] mt-1">
              موزعة على {plan.sessionsPerDay} جلسات يومياً
            </div>
          </div>

          {/* Current Position */}
          <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium mb-1">
              <Compass className="w-3.5 h-3.5 text-blue-500" />
              <span>الموضع الحالي في المصحف</span>
            </div>
            <div className="text-lg sm:text-xl font-bold text-[var(--text-main)] truncate">
              سورة {metrics.currentSurah.name}
            </div>
            <div className="text-[11px] text-[var(--text-muted)] mt-1">
              صفحة {metrics.currentPage} • الجزء {metrics.currentJuz}
            </div>
          </div>

          {/* Target End Date */}
          <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium mb-1">
              <Calendar className="w-3.5 h-3.5 text-purple-500" />
              <span>تاريخ الختم المستهدف</span>
            </div>
            <div className="text-lg sm:text-xl font-bold text-[var(--text-main)] font-mono">
              {plan.targetEndDate}
            </div>
            <div className="text-[11px] text-[var(--text-muted)] mt-1">
              باقٍ {metrics.activeDaysRemaining} يوم قراءة
            </div>
          </div>
        </div>

        {/* Action Buttons: Start Reading & Quick Record */}
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={() => onOpenQuranToPage(metrics.currentPage)}
            className="flex-1 py-3 px-6 rounded-2xl bg-[var(--primary)] text-white font-bold text-sm hover:bg-[var(--primary-dark)] transition-all shadow-md flex items-center justify-center gap-2.5 group"
          >
            <BookOpen className="w-4 h-4" />
            <span>ابدأ ورد اليوم (صفحة {metrics.currentPage})</span>
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => handleRecordProgress(metrics.perSessionTarget)}
            className="py-3 px-5 rounded-2xl bg-[var(--bg-card-subtle)] text-[var(--text-main)] font-bold text-xs border border-[var(--border-color)] hover:border-[var(--gold)] transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>تسجيل إنجاز جلسة (+{metrics.perSessionTarget} {plan.unitType === 'pages' ? 'صفحات' : 'آيات'})</span>
          </button>

          <button
            onClick={() => handleRecordProgress(metrics.dailyTargetUnits)}
            className="py-3 px-5 rounded-2xl bg-[var(--gold-light)] text-[var(--gold)] font-bold text-xs border border-[var(--border-gold)] hover:bg-opacity-80 transition-colors flex items-center justify-center gap-2"
          >
            <Award className="w-4 h-4" />
            <span>إتمام الورد اليومي كاملاً (+{metrics.dailyTargetUnits})</span>
          </button>
        </div>
      </section>

      {/* 5-Session Distribution */}
      <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 shadow-xs">
        <h3 className="text-base font-bold text-[var(--text-main)] mb-1 font-cairo">
          توزيع الورد على الصلوات الخمس
        </h3>
        <p className="text-xs text-[var(--text-muted)] mb-4">
          قراءة قدر يسير بعد كل صلاة أيسر للدوام وأبعد عن المشقة:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {[
            { label: 'بعد صلاة الفجر', icon: <Sunrise className="w-6 h-6 text-amber-500" />, desc: 'استفتاح اليوم بنور القرآن' },
            { label: 'بعد صلاة الظهر', icon: <Sun className="w-6 h-6 text-amber-500" />, desc: 'سكينة في منتصف اليوم' },
            { label: 'بعد صلاة العصر', icon: <SunMedium className="w-6 h-6 text-amber-600" />, desc: 'حفظ وبركة الوقت' },
            { label: 'بعد صلاة المغرب', icon: <Sunset className="w-6 h-6 text-orange-500" />, desc: 'تثبيت ومراجعة' },
            { label: 'بعد صلاة العشاء', icon: <Moon className="w-6 h-6 text-indigo-400" />, desc: 'ختام اليوم بخشوع' },
          ].map((s, idx) => (
            <div 
              key={idx} 
              className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center mb-2 shadow-xs">
                  {s.icon}
                </div>
                <div className="text-xs font-bold text-[var(--text-main)]">{s.label}</div>
                <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{s.desc}</div>
              </div>
              <div className="mt-3 pt-3 border-t border-[var(--border-color)] flex items-center justify-between">
                <span className="text-xs font-black text-[var(--primary)] font-mono">
                  {metrics.perSessionTarget} {plan.unitType === 'pages' ? 'ص' : 'آية'}
                </span>
                <span className="text-[10px] text-[var(--text-muted)]">~{metrics.minutesPerSession} د</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Adaptive Recalibration Modal */}
      {isAdaptiveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-bold text-[var(--text-main)] font-cairo">
                  إعادة موازنة الخطة بمرونة (دون حرج)
                </h3>
              </div>
              <button 
                onClick={() => setIsAdaptiveModalOpen(false)}
                className="p-1.5 rounded-lg text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              إذا فاتك ورد سابق لأي ظرف، لا تقلق! اختر الخيار الأنسب لك لإعادة توزيع الصفحات المتبقية بسلاسة وشفافية:
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleApplyAdaptive('extend_date', 7)}
                className="w-full p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] hover:border-[var(--primary)] text-right transition-all flex items-start gap-3"
              >
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--text-main)]">تمديد تاريخ الختم (+7 أيام)</div>
                  <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    يحافظ على وردك اليومي خفيفاً دون زيادة، ويمد تاريخ الختم أسبوعاً إضافياً.
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleApplyAdaptive('increase_daily')}
                className="w-full p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] hover:border-[var(--primary)] text-right transition-all flex items-start gap-3"
              >
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0 mt-0.5">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--text-main)]">إعادة حساب الورد اليومي تلقائياً</div>
                  <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    الإبقاء على تاريخ الختم الأصلي وزيادة عدد الصفحات اليومية قليلاً لتعويض ما فات.
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleApplyAdaptive('redistribute')}
                className="w-full p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] hover:border-[var(--primary)] text-right transition-all flex items-start gap-3"
              >
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--text-main)]">توزيع الورد على 5 جلسات</div>
                  <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    زيادة جلسات القراءة لتكون بعد كل صلاة مكتوبة لتخفيف العبء.
                  </div>
                </div>
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsAdaptiveModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-[var(--bg-card-subtle)] text-xs font-bold text-[var(--text-main)] border border-[var(--border-color)]"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Wizard Modal */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[var(--gold)]" />
                <h3 className="text-lg font-bold text-[var(--text-main)] font-cairo">
                  تخصيص خطة الورد القرآني
                </h3>
              </div>
              <button 
                onClick={() => setIsWizardOpen(false)}
                className="p-1.5 rounded-lg text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)]"
                aria-label="إغلاق النافذة"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Days */}
            <div>
              <label className="block text-xs font-bold text-[var(--text-main)] mb-2">
                مدة الختمة المستهدفة:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { d: 15, label: '15 يوماً' },
                  { d: 30, label: '30 يوماً (شهر)' },
                  { d: 60, label: '60 يوماً (شهرين)' },
                  { d: 90, label: '90 يوماً (3 أشهر)' },
                ].map(item => (
                  <button
                    key={item.d}
                    onClick={() => setWizardDays(item.d)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      wizardDays === item.d
                        ? 'bg-[var(--primary)] text-white shadow-sm'
                        : 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)] border border-[var(--border-color)]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Unit Type */}
            <div>
              <label className="block text-xs font-bold text-[var(--text-main)] mb-2">
                وحدة القياس المفضلة:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { u: 'pages' as ReadingUnit, label: 'صفحات (604)' },
                  { u: 'ayahs' as ReadingUnit, label: 'آيات (6236)' },
                  { u: 'juz' as ReadingUnit, label: 'أجزاء (30)' },
                ].map(item => (
                  <button
                    key={item.u}
                    onClick={() => setWizardUnit(item.u)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      wizardUnit === item.u
                        ? 'bg-[var(--primary)] text-white shadow-sm'
                        : 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)] border border-[var(--border-color)]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sessions per day */}
            <div>
              <label className="block text-xs font-bold text-[var(--text-main)] mb-2">
                عدد جلسات القراءة في اليوم:
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map(s => (
                  <button
                    key={s}
                    onClick={() => setWizardSessions(s)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      wizardSessions === s
                        ? 'bg-[var(--gold)] text-black shadow-sm font-black'
                        : 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)] border border-[var(--border-color)]'
                    }`}
                  >
                    {s === 5 ? '5 (كل صلاة)' : `${s} ${s === 1 ? 'جلسة' : 'جلسات'}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Active reading days of week */}
            <div>
              <label className="block text-xs font-bold text-[var(--text-main)] mb-2">
                أيام القراءة النشطة (اختر الأيام المستهدفة):
              </label>
              <div className="grid grid-cols-7 gap-1.5">
                {DAY_NAMES_AR.map((name, idx) => {
                  const active = wizardActiveDays.includes(idx);
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleDayOfWeek(idx)}
                      className={`py-2 rounded-xl text-[11px] font-bold transition-all ${
                        active
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)] border border-[var(--border-color)] opacity-60'
                      }`}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Starting page */}
            <div>
              <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
                البدء من الصفحة:
              </label>
              <input
                type="number"
                min={1}
                max={604}
                value={wizardStartPage}
                onChange={e => setWizardStartPage(Math.max(1, Math.min(604, parseInt(e.target.value) || 1)))}
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-main)] text-sm font-bold font-mono text-center focus:outline-none focus:border-[var(--primary)]"
              />
              <span className="text-[11px] text-[var(--text-muted)] mt-1 block text-center">
                (صفحة 1 = سورة الفاتحة، صفحة 2 = سورة البقرة)
              </span>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-end gap-3">
              <button
                onClick={() => setIsWizardOpen(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveWizard}
                className="px-6 py-2.5 rounded-xl bg-[var(--primary)] text-white text-xs font-bold hover:bg-[var(--primary-dark)] transition-colors shadow-sm"
              >
                حفظ وتطبيق الخطة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
