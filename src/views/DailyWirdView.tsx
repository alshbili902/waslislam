import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Sparkles,
  Heart,
  Layers,
  CheckCircle2,
  Circle,
  Share2,
  Bookmark,
  Volume2,
  RotateCcw,
  Calendar,
  Clock,
  ChevronLeft,
  Award,
  Bell,
  Check,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Flame,
  VolumeX,
  Play,
  Pause,
} from 'lucide-react';
import { DailyWird, DailyWirdItem, DailyWirdUserProgress } from '../types/wird';
import { wirdService, getSaudiDateString, VERIFIED_TASBIH_PHRASES } from '../services/wirdService';
import { useUser } from '../context/UserContext';
import { useShareModal } from '../context/ShareContext';
import { useAudio } from '../context/AudioContext';

interface DailyWirdViewProps {
  onNavigate: (tab: string, contextId?: any) => void;
}

export const DailyWirdView: React.FC<DailyWirdViewProps> = ({ onNavigate }) => {
  const { user, isAuthenticated, toggleFavorite, isFavorite } = useUser();
  const { openShareModal } = useShareModal();
  const { playAyah, isPlaying: isAyahPlaying } = useAudio();

  const [wird, setWird] = useState<DailyWird | null>(null);
  const [progress, setProgress] = useState<DailyWirdUserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTasbihIndex, setActiveTasbihIndex] = useState(0);
  const [tasbihLocalCount, setTasbihLocalCount] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(() => {
    return localStorage.getItem('wasl_wird_reminder_enabled') === 'true';
  });
  const [reminderTime, setReminderTime] = useState<string>(() => {
    return localStorage.getItem('wasl_wird_reminder_time') || '07:00';
  });

  // Set document title and SEO
  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'ورد اليوم | وصل الإسلامية';
    return () => {
      document.title = prevTitle;
    };
  }, []);

  // Load today's wird and user progress
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const todayDate = getSaudiDateString();
        const loadedWird = await wirdService.getDailyWird(todayDate);
        if (!isMounted) return;
        setWird(loadedWird);

        const loadedProgress = await wirdService.getWirdProgress(loadedWird, user?.id);
        if (!isMounted) return;
        setProgress(loadedProgress);

        // Sync local tasbih count from progress if exists
        const tasbihItem = loadedWird.items.find((i) => i.type === 'tasbih');
        if (tasbihItem && loadedProgress.itemProgress[tasbihItem.id]) {
          setTasbihLocalCount(loadedProgress.itemProgress[tasbihItem.id].currentCount || 0);
        }
      } catch (err) {
        console.error('Error loading daily wird:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Handle item completion toggle
  const handleToggleItem = async (item: DailyWirdItem) => {
    if (!wird || !progress) return;
    const currentItemProgress = progress.itemProgress[item.id];
    const newCompleted = !currentItemProgress?.completed;
    const newCount = newCompleted ? item.targetCount : 0;

    const updated = await wirdService.updateItemProgress(
      wird,
      item.id,
      newCompleted,
      newCount,
      user?.id
    );
    setProgress(updated);
  };

  // Handle Dhikr repetition step
  const handleDhikrStep = async (item: DailyWirdItem) => {
    if (!wird || !progress) return;
    const current = progress.itemProgress[item.id]?.currentCount || 0;
    const target = item.targetCount || 1;

    let nextCount = current + 1;
    let completed = false;
    if (nextCount >= target) {
      nextCount = target;
      completed = true;
    }

    const updated = await wirdService.updateItemProgress(
      wird,
      item.id,
      completed,
      nextCount,
      user?.id
    );
    setProgress(updated);
  };

  // Handle Tasbih tap
  const handleTasbihTap = async (item: DailyWirdItem) => {
    if (!wird || !progress) return;
    const currentTarget = VERIFIED_TASBIH_PHRASES[activeTasbihIndex].target;
    const nextCount = tasbihLocalCount + 1;
    setTasbihLocalCount(nextCount);

    const isDone = nextCount >= currentTarget;
    const updated = await wirdService.updateItemProgress(
      wird,
      item.id,
      isDone,
      nextCount,
      user?.id
    );
    setProgress(updated);
  };

  // Reset Tasbih
  const handleTasbihReset = async (item: DailyWirdItem) => {
    if (!wird || !progress) return;
    setTasbihLocalCount(0);
    const updated = await wirdService.updateItemProgress(
      wird,
      item.id,
      false,
      0,
      user?.id
    );
    setProgress(updated);
  };

  // Switch Tasbih Phrase
  const handleSelectTasbihPhrase = (index: number) => {
    setActiveTasbihIndex(index);
    setTasbihLocalCount(0);
  };

  // Save Reminder Settings
  const handleSaveReminder = () => {
    localStorage.setItem('wasl_wird_reminder_enabled', String(reminderEnabled));
    localStorage.setItem('wasl_wird_reminder_time', reminderTime);
    setIsReminderOpen(false);
  };

  // Copy text helper
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 py-16" dir="rtl">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-amber-400 rounded-full animate-spin" />
        <p className="text-emerald-800 dark:text-emerald-300 font-medium text-sm animate-pulse">
          جاري إعداد ورد اليوم الموثق...
        </p>
      </div>
    );
  }

  if (!wird || !wird.items || wird.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center" dir="rtl">
        <div className="w-16 h-16 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
          لم يتم إعداد ورد اليوم بعد
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
          سيتم تحديث الورد الموثق تلقائياً فور توفره من قِبل المشرف أو النظام.
        </p>
        <button
          onClick={() => onNavigate('home')}
          className="px-6 py-2.5 bg-emerald-800 text-white rounded-xl font-semibold hover:bg-emerald-900 transition-colors shadow-md"
        >
          العودة للرئيسية
        </button>
      </div>
    );
  }

  const completedCount = progress?.completedItemsCount || 0;
  const totalCount = wird.items.length;
  const completionPercentage = progress?.completionPercentage || 0;
  const isFullyCompleted = progress?.isFullyCompleted || completedCount === totalCount;

  // Extract sections
  const quranItem = wird.items.find((i) => i.type === 'quran');
  const dhikrItem = wird.items.find((i) => i.type === 'dhikr');
  const hadithItem = wird.items.find((i) => i.type === 'hadith');
  const duaItem = wird.items.find((i) => i.type === 'dua');
  const tasbihItem = wird.items.find((i) => i.type === 'tasbih');

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-12" dir="rtl">
      {/* ================================================================ */}
      {/* 1. TOP HERO SUMMARY CARD (بطاقة الملخص الفاخرة لورد اليوم) */}
      {/* ================================================================ */}
      <section
        aria-label="ملخص ورد اليوم"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#063a2f] via-[#042820] to-[#021813] text-white p-6 sm:p-8 shadow-xl border border-emerald-500/20"
      >
        {/* Background Islamic Geometric Pattern Accent */}
        <div className="absolute inset-0 bg-islamic-pattern opacity-10 pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <Sparkles className="w-3.5 h-3.5" />
                {wird.isFriday ? 'يوم الجمعة المبارك' : wird.isRamadan ? 'شهر رمضان المبارك' : 'الورد اليومي'}
              </span>

              <span className="text-xs text-emerald-200/90 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {wird.hijriDate}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-tajawal tracking-tight text-white flex items-center gap-2.5">
              <span>{wird.title}</span>
              {isFullyCompleted && (
                <CheckCircle2 className="w-7 h-7 text-amber-400 inline-block animate-bounce" />
              )}
            </h1>

            <p className="text-sm sm:text-base text-emerald-100/90 font-medium max-w-xl">
              {wird.subtitle}
            </p>
          </div>

          {/* Progress Circular Badge & Reminder Button */}
          <div className="flex items-center gap-4 sm:gap-6 bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl self-start md:self-auto">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/15"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-amber-400 transition-all duration-700 ease-out"
                  strokeDasharray={`${completionPercentage}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-sm font-black font-tajawal text-amber-300">
                  {completionPercentage}%
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-emerald-200">إنجازك اليوم:</div>
              <div className="text-lg font-bold text-white font-tajawal">
                {completedCount} <span className="text-sm text-emerald-300">من</span> {totalCount}
              </div>
              <button
                onClick={() => setIsReminderOpen(true)}
                className="text-[11px] text-amber-300 hover:text-amber-200 flex items-center gap-1 transition-colors underline underline-offset-2"
                title="تخصيص تنبيه الورد"
              >
                <Bell className="w-3 h-3" />
                {reminderEnabled ? `تنبيه عند ${reminderTime}` : 'تفعيل التذكير'}
              </button>
            </div>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="mt-6 pt-5 border-t border-emerald-500/20">
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-400 to-amber-400 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-emerald-200/80 mt-2">
            <span>البداية</span>
            <span className="font-semibold text-white">
              {isFullyCompleted ? 'تم إتمام جميع أجزاء ورد اليوم تقبّل الله' : `${totalCount - completedCount} أجزاء متبقية`}
            </span>
            <span>الختام</span>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* FULL COMPLETION CELEBRATION CARD (عند إتمام جميع الأجزاء 5 من 5) */}
      {/* ================================================================ */}
      <AnimatePresence>
        {isFullyCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.35 }}
            className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-emerald-900/90 to-[#022a1f] border-2 border-amber-400/40 shadow-2xl text-center space-y-3 relative overflow-hidden"
          >
            <div className="w-14 h-14 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center mx-auto border border-amber-400/30">
              <Award className="w-7 h-7" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white font-tajawal">
              أحسنت، أتممت وردك اليوم
            </h3>
            <p className="text-emerald-100 text-sm sm:text-base font-medium max-w-lg mx-auto">
              تقبّل الله منك طاعتك وجعلها خالصة لوجهه الكريم ورفعة في درجاتك.
            </p>
            <p className="text-xs text-amber-300/90 font-amiri italic">
              «أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ»
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================ */}
      {/* 2. SECTION 1: QURAN (الجزء الأول: القرآن الكريم) */}
      {/* ================================================================ */}
      {quranItem && quranItem.quranData && (
        <section
          aria-labelledby="section-quran-title"
          className={`rounded-3xl p-6 sm:p-7 transition-all duration-300 border ${
            progress?.itemProgress[quranItem.id]?.completed
              ? 'bg-white dark:bg-emerald-950/40 border-emerald-500/40 shadow-md'
              : 'bg-white dark:bg-emerald-950/20 border-slate-200/80 dark:border-emerald-800/30 shadow-sm hover:border-emerald-500/30'
          }`}
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-700/10 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block">
                  الجزء الأول
                </span>
                <h2
                  id="section-quran-title"
                  className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white"
                >
                  القرآن الكريم: سورة {quranItem.quranData.surahNameAr}
                </h2>
              </div>
            </div>

            <button
              onClick={() => handleToggleItem(quranItem)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                progress?.itemProgress[quranItem.id]?.completed
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-emerald-900/40 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-800'
              }`}
            >
              {progress?.itemProgress[quranItem.id]?.completed ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  مكتمل ✓
                </>
              ) : (
                <>
                  <Circle className="w-3.5 h-3.5" />
                  لم يبدأ
                </>
              )}
            </button>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-3 flex-wrap">
            <span>الآيات: {quranItem.quranData.startAyah} - {quranItem.quranData.endAyah}</span>
            <span>•</span>
            <span>الجزء: {quranItem.quranData.juzNumber}</span>
            <span>•</span>
            <span>الصفحة: {quranItem.quranData.pageNumber}</span>
          </div>

          {/* Ayah text in verified Uthmani calligraphy */}
          <div className="p-5 sm:p-6 rounded-2xl bg-amber-500/[0.04] dark:bg-emerald-900/20 border border-amber-900/10 dark:border-amber-500/20 text-slate-900 dark:text-slate-100 font-amiri text-lg sm:text-xl leading-loose text-center tracking-wide my-4 select-text">
            {quranItem.quranData.ayahText}
          </div>

          {quranItem.quranData.tafsirShort && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-emerald-950/60 text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4 border border-slate-200/50 dark:border-emerald-800/20">
              <span className="font-bold text-emerald-800 dark:text-emerald-400">التفسير الميسر: </span>
              {quranItem.quranData.tafsirShort}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-emerald-900/30 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('quran', quranItem.quranData?.surahNumber)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-800 text-white hover:bg-emerald-900 transition-colors shadow-sm"
              >
                <BookOpen className="w-3.5 h-3.5" />
                اقرأ في المصحف
              </button>

              <button
                onClick={() =>
                  openShareModal({
                    type: 'quran',
                    contentType: 'آية',
                    surahName: quranItem.quranData?.surahNameAr,
                    ayahNumber: quranItem.quranData?.startAyah,
                    text: quranItem.quranData?.ayahText,
                    source: `سورة ${quranItem.quranData?.surahNameAr} [${quranItem.quranData?.startAyah}-${quranItem.quranData?.endAyah}]`,
                  })
                }
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-emerald-900/40 transition-colors"
                title="مشاركة كصورة"
              >
                <Share2 className="w-3.5 h-3.5" />
                مشاركة
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  toggleFavorite({
                    type: 'ayah',
                    referenceId: `ayah-${quranItem.quranData?.surahNumber}-${quranItem.quranData?.startAyah}`,
                    titleAr: `سورة ${quranItem.quranData?.surahNameAr}`,
                    subtitleAr: `الآية ${quranItem.quranData?.startAyah}`,
                    textAr: quranItem.quranData?.ayahText || '',
                  })
                }
                className={`p-2 rounded-xl transition-colors ${
                  isFavorite('ayah', `ayah-${quranItem.quranData?.surahNumber}-${quranItem.quranData?.startAyah}`)
                    ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40'
                    : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-emerald-900/30'
                }`}
                title="إضافة للمفضلة"
              >
                <Heart className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ================================================================ */}
      {/* 3. SECTION 2: ADHKAR (الجزء الثاني: أذكار اليوم بعداد تفاعلي) */}
      {/* ================================================================ */}
      {dhikrItem && dhikrItem.dhikrData && (
        <section
          aria-labelledby="section-dhikr-title"
          className={`rounded-3xl p-6 sm:p-7 transition-all duration-300 border ${
            progress?.itemProgress[dhikrItem.id]?.completed
              ? 'bg-white dark:bg-emerald-950/40 border-emerald-500/40 shadow-md'
              : 'bg-white dark:bg-emerald-950/20 border-slate-200/80 dark:border-emerald-800/30 shadow-sm hover:border-emerald-500/30'
          }`}
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block">
                  الجزء الثاني
                </span>
                <h2
                  id="section-dhikr-title"
                  className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white"
                >
                  {dhikrItem.dhikrData.categoryNameAr || 'أذكار اليوم المأثورة'}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-xl text-xs font-bold font-tajawal ${
                  progress?.itemProgress[dhikrItem.id]?.completed
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                }`}
              >
                {progress?.itemProgress[dhikrItem.id]?.currentCount || 0} / {dhikrItem.targetCount}
                {progress?.itemProgress[dhikrItem.id]?.completed && ' ✓'}
              </span>
            </div>
          </div>

          {/* Exact Dhikr text */}
          <div className="p-5 sm:p-6 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-800/10 dark:border-emerald-500/20 text-slate-900 dark:text-slate-100 font-amiri text-lg sm:text-xl leading-relaxed text-center tracking-wide my-4 select-text">
            {dhikrItem.dhikrData.textAr}
          </div>

          <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 mb-5">
            <p>
              <strong className="text-slate-700 dark:text-slate-300">المصدر: </strong>
              {dhikrItem.dhikrData.sourceAr}
            </p>
            {dhikrItem.dhikrData.benefitAr && (
              <p>
                <strong className="text-emerald-700 dark:text-emerald-400">الفضل: </strong>
                {dhikrItem.dhikrData.benefitAr}
              </p>
            )}
          </div>

          {/* Interactive Tap Counter Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-emerald-900/30">
            <button
              onClick={() => handleDhikrStep(dhikrItem)}
              className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-bold font-tajawal text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all active:scale-95 shadow-md ${
                progress?.itemProgress[dhikrItem.id]?.completed
                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                  : 'bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-900 hover:to-emerald-800 text-white ring-2 ring-emerald-500/20'
              }`}
            >
              {progress?.itemProgress[dhikrItem.id]?.completed ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-amber-300" />
                  أتممت قراءة الذكر ({dhikrItem.targetCount} مرات)
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  انقر للتكرار ({progress?.itemProgress[dhikrItem.id]?.currentCount || 0} / {dhikrItem.targetCount})
                </>
              )}
            </button>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() =>
                  openShareModal({
                    type: 'dhikr',
                    contentType: 'ذكر',
                    title: dhikrItem.titleAr,
                    text: dhikrItem.dhikrData?.textAr,
                    source: dhikrItem.dhikrData?.sourceAr,
                  })
                }
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-emerald-900/40 transition-colors"
                title="مشاركة كصورة"
              >
                <Share2 className="w-3.5 h-3.5" />
                مشاركة
              </button>

              <button
                onClick={() =>
                  toggleFavorite({
                    type: 'dhikr',
                    referenceId: dhikrItem.dhikrData?.dhikrId || dhikrItem.id,
                    titleAr: 'أذكار اليوم',
                    subtitleAr: dhikrItem.dhikrData?.sourceAr,
                    textAr: dhikrItem.dhikrData?.textAr || '',
                  })
                }
                className={`p-2 rounded-xl transition-colors ${
                  isFavorite('dhikr', dhikrItem.dhikrData?.dhikrId || dhikrItem.id)
                    ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40'
                    : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-emerald-900/30'
                }`}
                title="إضافة للمفضلة"
              >
                <Heart className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ================================================================ */}
      {/* 4. SECTION 3: HADITH (الجزء الثالث: حديث اليوم الصحيح) */}
      {/* ================================================================ */}
      {hadithItem && hadithItem.hadithData && (
        <section
          aria-labelledby="section-hadith-title"
          className={`rounded-3xl p-6 sm:p-7 transition-all duration-300 border ${
            progress?.itemProgress[hadithItem.id]?.completed
              ? 'bg-white dark:bg-emerald-950/40 border-emerald-500/40 shadow-md'
              : 'bg-white dark:bg-emerald-950/20 border-slate-200/80 dark:border-emerald-800/30 shadow-sm hover:border-emerald-500/30'
          }`}
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-600/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block">
                  الجزء الثالث
                </span>
                <h2
                  id="section-hadith-title"
                  className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white"
                >
                  حديث اليوم النبوي الشريف
                </h2>
              </div>
            </div>

            <button
              onClick={() => handleToggleItem(hadithItem)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                progress?.itemProgress[hadithItem.id]?.completed
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-emerald-900/40 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-800'
              }`}
            >
              {progress?.itemProgress[hadithItem.id]?.completed ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  تمت القراءة ✓
                </>
              ) : (
                <>
                  <Circle className="w-3.5 h-3.5" />
                  لم يبدأ
                </>
              )}
            </button>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-semibold">
              {hadithItem.hadithData.gradingAr}
            </span>
            <span>•</span>
            <span>الراوي: {hadithItem.hadithData.narratorAr}</span>
            {hadithItem.hadithData.bookAr && (
              <>
                <span>•</span>
                <span>{hadithItem.hadithData.bookAr}</span>
              </>
            )}
          </div>

          {/* Hadith Text */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-emerald-900/20 border border-slate-200/60 dark:border-emerald-800/30 text-slate-900 dark:text-slate-100 font-amiri text-lg sm:text-xl leading-relaxed text-right tracking-wide my-4 select-text">
            {hadithItem.hadithData.textAr}
          </div>

          {hadithItem.hadithData.explanationAr && (
            <div className="p-3.5 rounded-xl bg-amber-500/[0.05] dark:bg-emerald-950/60 text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-4 border border-amber-500/20">
              <span className="font-bold text-amber-800 dark:text-amber-400">الشرح والبيان: </span>
              {hadithItem.hadithData.explanationAr}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-emerald-900/30">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              المصدر: {hadithItem.hadithData.collectionAr}{' '}
              {hadithItem.hadithData.hadithNumber ? `(رقم ${hadithItem.hadithData.hadithNumber})` : ''}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  openShareModal({
                    type: 'hadith',
                    contentType: 'حديث',
                    narrator: hadithItem.hadithData?.narratorAr,
                    text: hadithItem.hadithData?.textAr,
                    source: `${hadithItem.hadithData?.collectionAr} • ${hadithItem.hadithData?.gradingAr}`,
                  })
                }
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-emerald-900/40 transition-colors"
                title="مشاركة كصورة"
              >
                <Share2 className="w-3.5 h-3.5" />
                مشاركة
              </button>

              <button
                onClick={() =>
                  toggleFavorite({
                    type: 'hadith',
                    referenceId: hadithItem.hadithData?.hadithId || hadithItem.id,
                    titleAr: 'حديث نبوي',
                    subtitleAr: hadithItem.hadithData?.collectionAr,
                    textAr: hadithItem.hadithData?.textAr || '',
                  })
                }
                className={`p-2 rounded-xl transition-colors ${
                  isFavorite('hadith', hadithItem.hadithData?.hadithId || hadithItem.id)
                    ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40'
                    : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-emerald-900/30'
                }`}
                title="إضافة للمفضلة"
              >
                <Heart className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ================================================================ */}
      {/* 5. SECTION 4: DUA (الجزء الرابع: دعاء اليوم المأثور) */}
      {/* ================================================================ */}
      {duaItem && duaItem.duaData && (
        <section
          aria-labelledby="section-dua-title"
          className={`rounded-3xl p-6 sm:p-7 transition-all duration-300 border ${
            progress?.itemProgress[duaItem.id]?.completed
              ? 'bg-white dark:bg-emerald-950/40 border-emerald-500/40 shadow-md'
              : 'bg-white dark:bg-emerald-950/20 border-slate-200/80 dark:border-emerald-800/30 shadow-sm hover:border-emerald-500/30'
          }`}
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400 flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block">
                  الجزء الرابع
                </span>
                <h2
                  id="section-dua-title"
                  className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white"
                >
                  {duaItem.duaData.titleAr || 'دعاء اليوم المأثور'}
                </h2>
              </div>
            </div>

            <button
              onClick={() => handleToggleItem(duaItem)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                progress?.itemProgress[duaItem.id]?.completed
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-emerald-900/40 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-800'
              }`}
            >
              {progress?.itemProgress[duaItem.id]?.completed ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  دعوت به ✓
                </>
              ) : (
                <>
                  <Circle className="w-3.5 h-3.5" />
                  لم يبدأ
                </>
              )}
            </button>
          </div>

          {/* Dua Text */}
          <div className="p-5 sm:p-6 rounded-2xl bg-teal-50/40 dark:bg-teal-950/20 border border-teal-800/10 dark:border-teal-500/20 text-slate-900 dark:text-slate-100 font-amiri text-lg sm:text-xl leading-relaxed text-center tracking-wide my-4 select-text">
            {duaItem.duaData.textAr}
          </div>

          <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 mb-4">
            <p>
              <strong className="text-slate-700 dark:text-slate-300">المصدر: </strong>
              {duaItem.duaData.sourceAr}
            </p>
            {duaItem.duaData.benefitAr && (
              <p>
                <strong className="text-teal-700 dark:text-teal-400">الفضل: </strong>
                {duaItem.duaData.benefitAr}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-emerald-900/30">
            <button
              onClick={() =>
                openShareModal({
                  type: 'dua',
                  contentType: 'دعاء',
                  title: duaItem.duaData?.titleAr,
                  text: duaItem.duaData?.textAr,
                  source: duaItem.duaData?.sourceAr,
                })
              }
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-emerald-900/40 transition-colors"
              title="مشاركة كصورة"
            >
              <Share2 className="w-3.5 h-3.5" />
              مشاركة
            </button>

            <button
              onClick={() =>
                toggleFavorite({
                  type: 'dua',
                  referenceId: duaItem.duaData?.duaId || duaItem.id,
                  titleAr: duaItem.duaData?.titleAr || 'دعاء مأثور',
                  subtitleAr: duaItem.duaData?.sourceAr,
                  textAr: duaItem.duaData?.textAr || '',
                })
              }
              className={`p-2 rounded-xl transition-colors ${
                isFavorite('dua', duaItem.duaData?.duaId || duaItem.id)
                  ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40'
                  : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-emerald-900/30'
              }`}
              title="إضافة للمفضلة"
            >
              <Heart className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* ================================================================ */}
      {/* 6. SECTION 5: TASBIH (الجزء الخامس: التسبيح والمسبحة الإلكترونية) */}
      {/* ================================================================ */}
      {tasbihItem && (
        <section
          aria-labelledby="section-tasbih-title"
          className={`rounded-3xl p-6 sm:p-7 transition-all duration-300 border ${
            progress?.itemProgress[tasbihItem.id]?.completed
              ? 'bg-white dark:bg-emerald-950/40 border-emerald-500/40 shadow-md'
              : 'bg-white dark:bg-emerald-950/20 border-slate-200/80 dark:border-emerald-800/30 shadow-sm hover:border-emerald-500/30'
          }`}
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-700 dark:bg-amber-400/20 dark:text-amber-300 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block">
                  الجزء الخامس
                </span>
                <h2
                  id="section-tasbih-title"
                  className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white"
                >
                  التسبيح والمسبحة
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-xl text-xs font-bold font-tajawal ${
                  progress?.itemProgress[tasbihItem.id]?.completed
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                }`}
              >
                {tasbihLocalCount} / {VERIFIED_TASBIH_PHRASES[activeTasbihIndex].target}
                {progress?.itemProgress[tasbihItem.id]?.completed && ' ✓'}
              </span>
            </div>
          </div>

          {/* Quick Phrase Switcher */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-4">
            {VERIFIED_TASBIH_PHRASES.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectTasbihPhrase(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                  activeTasbihIndex === idx
                    ? 'bg-emerald-800 text-white font-bold shadow-sm'
                    : 'bg-slate-100 dark:bg-emerald-900/40 text-slate-700 dark:text-slate-300 hover:bg-emerald-50'
                }`}
              >
                {p.phraseAr}
              </button>
            ))}
          </div>

          {/* Current selected phrase display */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-emerald-900/20 text-center border border-slate-200/50 dark:border-emerald-800/30 mb-6">
            <div className="text-lg sm:text-xl font-amiri font-bold text-emerald-900 dark:text-emerald-100">
              {VERIFIED_TASBIH_PHRASES[activeTasbihIndex].phraseAr}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {VERIFIED_TASBIH_PHRASES[activeTasbihIndex].virtue}
            </p>
          </div>

          {/* Large touch interactive counter */}
          <div className="flex flex-col items-center justify-center py-4 space-y-4">
            <button
              onClick={() => handleTasbihTap(tasbihItem)}
              className="group relative w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-b from-emerald-700 to-emerald-900 text-white shadow-xl hover:shadow-2xl flex flex-col items-center justify-center transition-transform active:scale-95 border-4 border-amber-400/40 select-none touch-manipulation"
              aria-label="تسبيح"
            >
              <span className="text-3xl sm:text-4xl font-black font-tajawal text-white tracking-wider">
                {tasbihLocalCount}
              </span>
              <span className="text-[11px] font-medium text-emerald-200 mt-1">
                الهدف: {VERIFIED_TASBIH_PHRASES[activeTasbihIndex].target}
              </span>
              <span className="text-[10px] text-amber-300 mt-0.5">اضغط للتسبيح</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleTasbihReset(tasbihItem)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-emerald-900/40 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                تصفير العداد
              </button>

              <button
                onClick={() => onNavigate('tasbih')}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
              >
                <span>المسبحة الشاملة</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ================================================================ */}
      {/* 7. REMINDER SETTINGS MODAL */}
      {/* ================================================================ */}
      <AnimatePresence>
        {isReminderOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-emerald-950 border border-emerald-900/10 dark:border-emerald-500/20 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-right"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-500" />
                  تذكير وردك اليومي
                </h3>
                <button
                  onClick={() => setIsReminderOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                تذكير اختياري هادئ لمساعدتك على أداء ورد اليوم بانتظام ودون انقطاع.
              </p>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-emerald-900/30 cursor-pointer">
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    تفعيل التذكير اليومي
                  </span>
                  <input
                    type="checkbox"
                    checked={reminderEnabled}
                    onChange={(e) => setReminderEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                </label>

                {reminderEnabled && (
                  <div>
                    <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1.5">
                      الوقت المفضل للتذكير:
                    </label>
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-white dark:bg-emerald-900/60 text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsReminderOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleSaveReminder}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-800 text-white hover:bg-emerald-900 transition-colors shadow-md"
                  >
                    حفظ
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
