import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  BookOpen,
  Calendar,
  Flame,
  CheckCircle2,
  ChevronLeft,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Bookmark,
  Award,
  Mic,
  Clock,
  PlusCircle,
  HelpCircle,
} from 'lucide-react';
import { KhatmahPlan, HifzProgress } from '../../../types/khatmah';
import { KhatmahPlanModal } from './KhatmahPlanModal';
import { SURAHS_LIST } from '../../../data/quranMetadata';
import { khatmahService } from '../../../services/khatmahService';

interface Props {
  plan: KhatmahPlan;
  onPlanUpdate: (updatedPlan: KhatmahPlan) => void;
  onNavigate: (tab: string, contextId?: any) => void;
  onSelectSubTab: (subTab: string) => void;
  userId?: string;
  hifzList: HifzProgress[];
  weakAyahsCount: number;
}

export const KhatmahDashboard: React.FC<Props> = ({
  plan,
  onPlanUpdate,
  onNavigate,
  onSelectSubTab,
  userId,
  hifzList,
  weakAyahsCount,
}) => {
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [markingDone, setMarkingDone] = useState(false);

  // Quran Metrics calculations
  const totalPages = plan.totalPages || 604;
  const completedPagesCount = plan.completedPages || 0;
  const percentage = Math.min(100, Math.round((completedPagesCount / totalPages) * 100));
  const pagesRemaining = Math.max(0, totalPages - completedPagesCount);

  // Juz calculations (each juz is ~20 pages)
  const currentJuz = Math.min(30, Math.floor((plan.currentPage - 1) / 20) + 1);
  const completedJuz = Math.min(30, Math.floor(completedPagesCount / 20));
  const remainingJuz = Math.max(0, 30 - completedJuz);

  // Today's reading target range
  const todayTargetStartPage = plan.currentPage;
  const todayTargetEndPage = Math.min(totalPages, plan.currentPage + plan.dailyPagesTarget - 1);

  // Find corresponding Surah for current page
  const currentSurahMeta =
    SURAHS_LIST.slice().reverse().find((s) => s.page <= plan.currentPage) || SURAHS_LIST[0];

  const handleMarkTodayDone = async () => {
    setMarkingDone(true);
    try {
      const updated = await khatmahService.markTodayTargetCompleted(userId);
      onPlanUpdate(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setMarkingDone(false);
    }
  };

  const handleContinueReading = () => {
    // Navigate to quran view with exact surah and ayah
    onNavigate('quran', plan.lastSurahNumber || currentSurahMeta.number);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-emerald-900/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-300/40">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{plan.name}</span>
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              بدأت في {plan.startDate}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            لوحة متابعة الختمة القرآنية
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            خطتك لختم كتاب الله ومتابعة تقدمك في القراءة والحفظ والتسميع
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={() => setIsPlanModalOpen(true)}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>ابدأ ختمة جديدة</span>
          </button>
        </div>
      </div>

      {/* 2. Main Hero Progress Card (الختمة الحالية & نسبة الإنجاز) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#063a2f] via-[#042b22] to-[#021b15] text-white p-6 sm:p-8 shadow-xl border border-emerald-600/30">
        <div className="absolute inset-0 bg-islamic-pattern opacity-10 pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Right/Main Info (RTL) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>الختمة الحالية</span>
              </span>
              <span className="text-xs text-emerald-200/80">
                المستهدف: {plan.targetDate}
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-bold font-tajawal text-white">
                {completedJuz} من 30 جزءًا
              </h3>
              <p className="text-xs sm:text-sm text-emerald-200/90 font-medium">
                متبقي {remainingJuz} أجزاء ({pagesRemaining} صفحة) لإتمام الختمة المباركة
              </p>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-emerald-200">نسبة الإنجاز الكلية</span>
                <span className="text-amber-300 font-mono text-sm font-bold">{percentage}%</span>
              </div>
              <div className="h-4 w-full bg-emerald-950/80 rounded-full overflow-hidden p-0.5 border border-emerald-700/50">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-300 rounded-full shadow-sm"
                />
              </div>
            </div>

            {/* Quick Stats Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-emerald-300/80 block mb-0.5">الصفحات المنجزة</span>
                <span className="text-base sm:text-lg font-bold font-mono text-white">
                  {completedPagesCount} / {totalPages}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-emerald-300/80 block mb-0.5">الجزء الحالي</span>
                <span className="text-base sm:text-lg font-bold font-mono text-amber-300">
                  الجزء {currentJuz}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-emerald-300/80 block mb-0.5">الصفحة الحالية</span>
                <span className="text-base sm:text-lg font-bold font-mono text-white">
                  ص {plan.currentPage}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-emerald-300/80 block mb-0.5">أيام الالتزام</span>
                <span className="text-base sm:text-lg font-bold font-mono text-amber-300 flex items-center gap-1">
                  <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{plan.readingStreakDays} أيام</span>
                </span>
              </div>
            </div>
          </div>

          {/* Left: Quick Action Box */}
          <div className="lg:col-span-4 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 flex flex-col justify-between h-full space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2 text-amber-300 text-xs font-bold">
                <Bookmark className="w-4 h-4" />
                <span>آخر موضع قراءة</span>
              </div>
              <h4 className="text-lg font-bold text-white mb-1">
                سورة {plan.lastSurahNameAr || currentSurahMeta.name}
              </h4>
              <p className="text-xs text-emerald-100/80">
                الآية {plan.lastAyahNumber || 1} • صفحة {plan.currentPage}
              </p>
            </div>

            <button
              onClick={handleContinueReading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-xs sm:text-sm shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current ml-1" />
              <span>متابعة القراءة من المصحف</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Daily Target & Plan Card (الهدف اليومي & تم الإنجاز) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Today's Target Card */}
        <div className="lg:col-span-2 bg-white dark:bg-emerald-950/80 rounded-2xl p-5 sm:p-6 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-900/50 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    الهدف القرآني لليوم
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    معدل القراءة اليومي المحسوب بدقة
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                {plan.dailyPagesTarget} صفحة اليوم
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-emerald-900/30 border border-slate-200 dark:border-emerald-800/40 space-y-2 mb-4">
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                المقدار المطلوب قراءته اليوم:
              </div>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="text-base sm:text-lg font-bold text-emerald-900 dark:text-emerald-200">
                  من صفحة {todayTargetStartPage} إلى صفحة {todayTargetEndPage}
                </div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  (يقارب الجزء {currentJuz})
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-emerald-900/40 gap-3">
            <button
              onClick={handleContinueReading}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>فتح صفحات الورد الآن</span>
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleMarkTodayDone}
              disabled={markingDone}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>{markingDone ? 'جاري التحديث...' : 'تم الإنجاز اليوم'}</span>
            </button>
          </div>
        </div>

        {/* Commitment Streak Card */}
        <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 sm:p-6 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Flame className="w-4 h-4 fill-current" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                حماسة الالتزام القرآني
              </h4>
            </div>

            <div className="text-center py-4">
              <span className="text-4xl font-bold font-mono text-amber-500 block mb-1">
                {plan.readingStreakDays}
              </span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">
                أيام متتالية من القراءة المباركة
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center leading-relaxed">
              «أحب الأعمال إلى الله أدومها وإن قل». داوم على وردك القرآني ولا تدع يومك يمر دون نصيبك من كتاب الله.
            </p>
          </div>

          <button
            onClick={() => onSelectSubTab('plan')}
            className="w-full mt-4 py-2 rounded-xl bg-slate-100 dark:bg-emerald-900/40 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-emerald-900/70 transition-colors"
          >
            تعديل خطة الختمة
          </button>
        </div>
      </div>

      {/* 4. Teasers for Hifz & Review (الحفظ والتسميع ومراجعة الحفظ) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Hifz Teaser Card */}
        <div className="bg-gradient-to-br from-white to-emerald-50/50 dark:from-emerald-950/90 dark:to-emerald-900/40 rounded-2xl p-5 sm:p-6 border border-emerald-900/15 dark:border-emerald-800/60 shadow-sm flex flex-col justify-between group hover:border-emerald-500/50 transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    الحفظ والتسميع الصوتي
                  </h4>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    اختبر حفظك بالصوت وتعرف على مواضع التردد
                  </span>
                </div>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 font-bold">
                {hifzList.filter((s) => s.status === 'memorized').length} سور محفوظة
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              نظام ذكي متكامل للاستماع إلى تلاوتك ومقارنتها حرفياً بنص المصحف الشريف المعتمد عبر 3 أوضاع: قراءة مع النص، أو تسميع والنص ظاهر، أو تسميع والنص مخفي.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-emerald-900/40">
            <button
              onClick={() => onSelectSubTab('hifz')}
              className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>ابدأ التسميع الآن</span>
            </button>
            <button
              onClick={() => onSelectSubTab('hifz')}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-emerald-900/40 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 transition-colors"
            >
              اختر سورة
            </button>
          </div>
        </div>

        {/* Review Teaser Card */}
        <div className="bg-gradient-to-br from-white to-amber-50/40 dark:from-emerald-950/90 dark:to-amber-950/20 rounded-2xl p-5 sm:p-6 border border-emerald-900/15 dark:border-emerald-800/60 shadow-sm flex flex-col justify-between group hover:border-amber-500/50 transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500 text-slate-950 shadow-xs">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    مراجعة الحفظ وتثبيت الآيات
                  </h4>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    جدول مراجعة مخصص للآيات التي وقع فيها خطأ سابقاً
                  </span>
                </div>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold">
                {weakAyahsCount} آيات للمراجعة
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              يقوم النظام بتجميع الآيات التي احتوت على كلمات غير دقيقة أثناء جلسات التسميع السابقة وترتيبها تلقائياً لتسهيل تثبيتها وتكرارها.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-emerald-900/40">
            <button
              onClick={() => onSelectSubTab('review')}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ابدأ مراجعة الآيات الضعيفة</span>
            </button>
            <button
              onClick={() => onSelectSubTab('history')}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-emerald-900/40 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 transition-colors"
            >
              سجل التسميع
            </button>
          </div>
        </div>
      </div>

      {/* Plan Modal Component */}
      <KhatmahPlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        onPlanCreated={(newPlan) => onPlanUpdate(newPlan)}
        currentPlan={plan}
        userId={userId}
      />
    </div>
  );
};
