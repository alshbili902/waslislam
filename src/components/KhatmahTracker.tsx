'use client';

import React, { useState } from 'react';
import { 
  Bookmark, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Award, 
  RotateCcw, 
  BookOpen, 
  Plus, 
  ChevronLeft,
  Sparkles
} from 'lucide-react';
import { localStore } from '../lib/supabase';

interface KhatmahTrackerProps {
  khatmahProgress: { currentPage: number; totalPages: number; targetDays: number };
  onUpdateProgress: (newPage: number) => void;
  isEnglish: boolean;
  onOpenQuranToPage: (page: number) => void;
}

export const KhatmahTracker: React.FC<KhatmahTrackerProps> = ({
  khatmahProgress,
  onUpdateProgress,
  isEnglish,
  onOpenQuranToPage
}) => {
  const [currentPage, setCurrentPage] = useState(khatmahProgress.currentPage);
  const [targetDays, setTargetDays] = useState(khatmahProgress.targetDays);
  const [isEditingPlan, setIsEditingPlan] = useState(false);

  const totalPages = 604; // Standard Medina Mushaf
  const remainingPages = Math.max(0, totalPages - currentPage);
  const percentage = Math.round((currentPage / totalPages) * 100);
  const dailyTargetPages = Math.ceil(totalPages / targetDays);

  const handleSavePage = (page: number) => {
    const valid = Math.max(1, Math.min(totalPages, page));
    setCurrentPage(valid);
    onUpdateProgress(valid);
  };

  const handleUpdatePlanDays = (days: number) => {
    setTargetDays(days);
    localStore.set('khatmah_plan_days', days);
    setIsEditingPlan(false);
  };

  const currentJuz = Math.min(30, Math.floor((currentPage - 1) / 20) + 1);

  return (
    <div className="space-y-6 pb-24">
      {/* Header Banner */}
      <section className="bg-[var(--bg-card)] border border-[var(--border-gold)] rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--gold-light)] text-[var(--gold)] text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>مخطط ختم القرآن الكريم</span>
            </div>
            <h2 className="text-2xl font-black text-[var(--text-main)] font-cairo">
              {isEnglish ? 'Khatmah Reading Plan' : 'متابعة الختمة القرآنية المباركة'}
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {isEnglish
                ? 'Track your reading, calculate daily targets, and complete the Quran smoothly'
                : 'تتبع تقدمك في صفحات المصحف الشريف بدقة، مع حساب الورد اليومي التلقائي لتحقيق هدف الختم'}
            </p>
          </div>

          <button
            onClick={() => setIsEditingPlan(!isEditingPlan)}
            className="px-4 py-2 rounded-xl bg-[var(--bg-card-subtle)] text-[var(--text-main)] text-xs font-bold border border-[var(--border-color)] hover:border-[var(--gold)] transition-colors"
          >
            {isEnglish ? 'Change Duration' : 'تعديل مدة الختمة'}
          </button>
        </div>

        {/* Change Plan Modal / Strip */}
        {isEditingPlan && (
          <div className="my-4 p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-[var(--text-main)]">اختر مدة الختمة المستهدفة:</span>
            {[
              { days: 30, label: '30 يوماً (ختمة شهرية / رمضان)' },
              { days: 60, label: '60 يوماً (شهرين)' },
              { days: 90, label: '90 يوماً (3 أشهر)' },
              { days: 15, label: '15 يوماً (نصف شهر)' },
            ].map(p => (
              <button
                key={p.days}
                onClick={() => handleUpdatePlanDays(p.days)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  targetDays === p.days ? 'bg-[var(--primary)] text-white shadow-sm' : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-color)]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        {/* Big Progress Circle / Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-6">
          <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-center">
            <span className="text-xs text-[var(--text-muted)] block mb-1">نسبة الإنجاز</span>
            <div className="text-3xl font-black font-mono text-[var(--gold)]">
              {percentage}%
            </div>
            <span className="text-[11px] text-[var(--text-muted)]">من المصحف الشريف</span>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-center">
            <span className="text-xs text-[var(--text-muted)] block mb-1">الصفحة الحالية</span>
            <div className="text-3xl font-black font-mono text-[var(--text-primary)]">
              {currentPage}
            </div>
            <span className="text-[11px] text-[var(--text-muted)]">من أصل 604 صفحة</span>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-center">
            <span className="text-xs text-[var(--text-muted)] block mb-1">الجزء الحالي</span>
            <div className="text-3xl font-black font-mono text-[var(--text-main)]">
              {currentJuz}
            </div>
            <span className="text-[11px] text-[var(--text-muted)]">من أصل 30 جزءاً</span>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-center">
            <span className="text-xs text-[var(--text-muted)] block mb-1">الورد اليومي المطلوب</span>
            <div className="text-3xl font-black font-mono text-emerald-600">
              {dailyTargetPages}
            </div>
            <span className="text-[11px] text-[var(--text-muted)]">صفحة يومياً لإنهاء الختمة</span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full bg-[var(--border-color)] h-3 rounded-full overflow-hidden mb-6">
          <div 
            className="bg-gradient-to-r from-[var(--primary)] via-[var(--accent-teal)] to-[var(--gold)] h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.max(2, percentage)}%` }}
          />
        </div>

        {/* Interactive Page Stepper */}
        <div className="bg-[var(--bg-card-subtle)] p-6 rounded-2xl border border-[var(--border-color)] max-w-lg mx-auto text-center space-y-4">
          <h4 className="text-sm font-bold text-[var(--text-main)]">
            تحديث موضع القراءة الحالي:
          </h4>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => handleSavePage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="w-10 h-10 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] font-bold text-lg text-[var(--text-main)] hover:border-[var(--gold)] disabled:opacity-40"
            >
              -
            </button>

            <div className="flex items-center gap-1 bg-[var(--bg-card)] px-4 py-2 rounded-xl border border-[var(--border-gold)]">
              <span className="text-xs text-[var(--text-muted)]">صفحة</span>
              <input
                type="number"
                min={1}
                max={604}
                value={currentPage}
                onChange={(e) => handleSavePage(Number(e.target.value))}
                className="w-16 font-mono font-black text-center text-lg text-[var(--text-primary)] focus:outline-none"
              />
            </div>

            <button
              onClick={() => handleSavePage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="w-10 h-10 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] font-bold text-lg text-[var(--text-main)] hover:border-[var(--gold)] disabled:opacity-40"
            >
              +
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => handleSavePage(currentPage + 10)}
              className="px-3 py-1 rounded-lg text-xs bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
            >
              +10 صفحات
            </button>
            <button
              onClick={() => handleSavePage(currentPage + 20)}
              className="px-3 py-1 rounded-lg text-xs bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
            >
              +20 صفحة (جزء كامل)
            </button>
          </div>
        </div>

        {/* Completion Celebration if 100% */}
        {percentage >= 100 && (
          <div className="my-6 p-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-center shadow-lg space-y-2">
            <Award className="w-12 h-12 mx-auto text-amber-300" />
            <h3 className="text-xl font-black font-cairo">هنيئاً لك ختم القرآن الكريم!</h3>
            <p className="text-xs text-emerald-100 max-w-md mx-auto">
              «يقال لصاحب القرآن: اقرأ وارتق ورتل كما كنت ترتل في الدنيا فإن منزلتك عند آخر آية تقرأ بها».
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
