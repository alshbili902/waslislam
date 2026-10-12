'use client';

import React, { useState } from 'react';
import { 
  BarChart3, 
  Calendar, 
  BookOpen, 
  CheckCircle2, 
  Compass, 
  Printer, 
  Download, 
  X, 
  Sparkles, 
  Clock, 
  Bookmark, 
  Smile, 
  ShieldCheck,
  TrendingUp,
  Award,
  Info
} from 'lucide-react';
import { IconKidsLearning, IconDuaHands } from '../icons/IslamicIcons';
import { localStore } from '../../lib/supabase';
import { DailyWorshipService } from '../../utils/dailyWorshipManager';
import { ReadingPlannerService } from '../../utils/readingPlannerManager';
import { libraryManager } from '../../utils/libraryManager';

interface PersonalReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEnglish: boolean;
}

export const PersonalReportsModal: React.FC<PersonalReportsModalProps> = ({
  isOpen,
  onClose,
  isEnglish
}) => {
  const [reportPeriod, setReportPeriod] = useState<'weekly' | 'monthly'>('weekly');

  if (!isOpen) return null;

  // Real recorded data from managers
  const dailyProfile = DailyWorshipService.getProfile();
  const readingPlan = ReadingPlannerService.getPlan();
  const readingMetrics = ReadingPlannerService.calculateMetrics(readingPlan);
  const libraryItems = libraryManager.getItems();
  const khatmahPage = localStore.get<number>('khatmah_page', 1);
  const kidsStars = localStore.get<number>('wasl_kids_stars', 0);

  // Completion calculation for past 7 days
  const today = new Date();
  const pastDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const dStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('ar-SA', { weekday: 'short' });
    const count = dailyProfile.history[dStr]?.length || (i === 6 ? dailyProfile.activities.filter((a: any) => a.isCompleted).length : 0);
    return {
      date: dStr,
      dayName,
      completedCount: count,
      percent: Math.min(100, Math.round((count / Math.max(1, dailyProfile.activities.length)) * 100))
    };
  });

  const totalCompletionsWeek = pastDays.reduce((acc, d) => acc + d.completedCount, 0);
  const activeStreak = dailyProfile.streak;

  const handlePrint = () => {
    window.print();
  };

  const handleExportDataJSON = () => {
    const exportObject = {
      exportDate: new Date().toISOString(),
      platform: 'Wasl Islamic Platform',
      version: '2.0.0',
      worship: {
        streak: activeStreak,
        activities: dailyProfile.activities,
        history: dailyProfile.history
      },
      quranPlan: {
        unitType: readingPlan.unitType,
        completedUnits: readingPlan.completedUnits,
        totalUnits: readingPlan.totalUnits,
        currentPage: khatmahPage,
        targetEndDate: readingPlan.targetEndDate
      },
      libraryItemsCount: libraryItems.length,
      kidsStars: kidsStars
    };

    const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wasl-islamic-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-label={isEnglish ? 'Personal Progress Report' : 'تقاريرك الإيمانية الشخصية'}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:bg-white print:fixed"
    >
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-up max-h-[90vh] overflow-y-auto print:max-h-none print:shadow-none print:border-none print:p-0">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[var(--gold-light)] text-[var(--gold)] shrink-0">
              <BarChart3 className="w-5 h-5 pointer-events-none" />
            </div>
            <div>
              <h3 className="text-xl font-black text-[var(--text-main)] font-cairo">
                {isEnglish ? 'Personal Progress Report' : 'تقاريرك الإيمانية الشخصية'}
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                ملخص أسبوعي وشهري خاص بأنشطتك وقراءتك للقرآن المسجلة فعلياً
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)] transition-colors cursor-pointer touch-manipulation"
              title="طباعة التقرير"
              aria-label="Print"
            >
              <Printer className="w-4 h-4 pointer-events-none" />
            </button>
            <button
              onClick={handleExportDataJSON}
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)] transition-colors cursor-pointer touch-manipulation"
              title="تصدير كملف JSON"
              aria-label="Export JSON"
            >
              <Download className="w-4 h-4 pointer-events-none" />
            </button>
            <button
              onClick={onClose}
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)] transition-colors cursor-pointer touch-manipulation"
              aria-label="Close"
            >
              <X className="w-5 h-5 pointer-events-none" />
            </button>
          </div>
        </div>

        {/* Respectful Disclaimer */}
        <div className="p-3.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[11px] text-[var(--text-muted)] leading-relaxed flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[var(--gold)] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[var(--text-main)]">تنويه مبارك:</strong> هذه التقارير غايتها المعاونة على تنظيم الوقت وإعانة النفس على الاستمرار في الطاعات، وليست مقياساً للإيمان أو قبول العمل، فالله تعالى عليم بذات الصدور.
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={() => setReportPeriod('weekly')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              reportPeriod === 'weekly'
                ? 'bg-[var(--primary)] text-white shadow-sm'
                : 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)] border border-[var(--border-color)]'
            }`}
          >
            الملخص الأسبوعي (7 أيام)
          </button>
          <button
            onClick={() => setReportPeriod('monthly')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              reportPeriod === 'monthly'
                ? 'bg-[var(--primary)] text-white shadow-sm'
                : 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)] border border-[var(--border-color)]'
            }`}
          >
            ملخص الشهر الحالي
          </button>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-center">
            <span className="text-[11px] text-[var(--text-muted)] block">صفحة الختمة</span>
            <span className="text-xl font-black font-mono text-[var(--primary)] mt-1 block">
              {khatmahPage} / 604
            </span>
            <span className="text-[10px] text-[var(--gold)] font-bold">
              {readingMetrics.percentage}% منجز
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-center">
            <span className="text-[11px] text-[var(--text-muted)] block">أيام الاستمرار</span>
            <span className="text-xl font-black font-mono text-amber-500 mt-1 block">
              {activeStreak} {activeStreak === 1 ? 'يوم' : 'أيام'}
            </span>
            <span className="text-[10px] text-emerald-600 font-bold">عادات مباركة</span>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-center">
            <span className="text-[11px] text-[var(--text-muted)] block">إنجازات الأسبوع</span>
            <span className="text-xl font-black font-mono text-[var(--text-main)] mt-1 block">
              {totalCompletionsWeek}
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">مهمة مسجلة</span>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-center">
            <span className="text-[11px] text-[var(--text-muted)] block">عناصر مكتبتي</span>
            <span className="text-xl font-black font-mono text-purple-600 mt-1 block">
              {libraryItems.length}
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">محفوظات إيمانية</span>
          </div>
        </div>

        {/* 7-Day Activity SVG Bar Chart */}
        <div className="p-5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-4">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[var(--text-main)]">النشاط اليومي خلال الأيام السبعة الأخيرة:</span>
            <span className="text-[var(--text-muted)]">نسبة إتمام الأهداف اليومية</span>
          </div>

          {/* Chart Bars */}
          <div className="flex items-end justify-between gap-2 h-36 pt-4 px-2">
            {pastDays.map((d, idx) => {
              const barHeight = Math.max(10, d.percent);
              const isToday = idx === 6;
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">
                    {d.completedCount}
                  </span>
                  <div className="w-full max-w-[28px] bg-[var(--border-color)] rounded-xl h-full flex items-end overflow-hidden">
                    <div
                      className={`w-full rounded-xl transition-all duration-700 ${
                        isToday 
                          ? 'bg-gradient-to-t from-[var(--primary)] to-[var(--gold)]' 
                          : 'bg-[var(--primary)]/70'
                      }`}
                      style={{ height: `${barHeight}%` }}
                    />
                  </div>
                  <span className={`text-[11px] font-bold ${isToday ? 'text-[var(--gold)]' : 'text-[var(--text-muted)]'}`}>
                    {d.dayName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Breakdown by Domain */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-[var(--text-main)]">تفاصيل الأقسام والأنشطة:</h4>
          
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-500" />
                <span>القرآن الكريم والورد اليومي:</span>
              </div>
              <span className="font-bold text-[var(--text-main)]">
                {readingMetrics.dailyTargetUnits} {readingPlan.unitType === 'pages' ? 'صفحة/يوم' : 'آية/يوم'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconDuaHands className="w-4 h-4 text-blue-500" />
                <span>أذكار الصباح والمساء والسنن:</span>
              </div>
              <span className="font-bold text-emerald-600">
                {dailyProfile.activities.filter((a: any) => a.category === 'adhkar' && a.isCompleted).length} / {dailyProfile.activities.filter((a: any) => a.category === 'adhkar').length} منجز اليوم
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconKidsLearning className="w-4 h-4 text-purple-500" />
                <span>تعلم الصغار والنجوم المكتسبة:</span>
              </div>
              <span className="font-bold text-amber-500 font-mono">
                {kidsStars} نجمة ذهبية
              </span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)] print:hidden">
          <button
            onClick={handleExportDataJSON}
            className="px-4 py-2 rounded-xl bg-[var(--bg-card-subtle)] text-xs font-bold text-[var(--text-main)] border border-[var(--border-color)] flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تصدير البيانات الشخصية (JSON)</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-bold hover:bg-[var(--primary-dark)] transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
