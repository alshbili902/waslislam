import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  BookOpen,
  RotateCcw,
  History,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronLeft,
  Search,
  Award,
  AlertCircle,
  Eye,
  EyeOff,
  Volume2,
  Plus,
  Play,
  Sliders,
  Filter,
} from 'lucide-react';
import { SURAHS_LIST, RECITERS_LIST } from '../../../data/quranMetadata';
import { HifzProgress, HifzSession, RecitationMode, HifzStatus } from '../../../types/khatmah';
import { HifzSessionRunner } from './HifzSessionRunner';
import { khatmahService } from '../../../services/khatmahService';

interface Props {
  hifzList: HifzProgress[];
  sessions: HifzSession[];
  onHifzUpdate: (updatedList: HifzProgress[]) => void;
  onNavigate: (tab: string, contextId?: any) => void;
  onSelectSubTab: (subTab: string) => void;
  userId?: string;
  preselectedSurahNumber?: number;
  preselectedStartAyah?: number;
  preselectedEndAyah?: number;
}

export const HifzDashboard: React.FC<Props> = ({
  hifzList,
  sessions,
  onHifzUpdate,
  onNavigate,
  onSelectSubTab,
  userId,
  preselectedSurahNumber,
  preselectedStartAyah,
  preselectedEndAyah,
}) => {
  // Modal & Selection State
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(Boolean(preselectedSurahNumber));
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(preselectedSurahNumber || 67); // Al-Mulk default
  const [startAyah, setStartAyah] = useState<number>(preselectedStartAyah || 1);
  const [endAyah, setEndAyah] = useState<number>(preselectedEndAyah || 10);
  const [selectedReciterId, setSelectedReciterId] = useState<string>('ar.alafasy');
  const [recitationMode, setRecitationMode] = useState<RecitationMode>('recite_text_visible');
  const [surahSearchQuery, setSurahSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'memorized' | 'in_progress' | 'needs_review'>('all');

  // Active Runner State
  const [activeSessionParams, setActiveSessionParams] = useState<{
    surahNumber: number;
    startAyah: number;
    endAyah: number;
    mode: RecitationMode;
    reciterId: string;
  } | null>(
    preselectedSurahNumber
      ? {
          surahNumber: preselectedSurahNumber,
          startAyah: preselectedStartAyah || 1,
          endAyah: preselectedEndAyah || 10,
          mode: 'recite_text_visible',
          reciterId: 'ar.alafasy',
        }
      : null
  );

  const selectedSurahMeta =
    SURAHS_LIST.find((s) => s.number === selectedSurahNumber) || SURAHS_LIST[66];

  // Quick stats
  const totalMemorizedSurahs = hifzList.filter((s) => s.status === 'memorized').length;
  const inProgressSurahs = hifzList.filter((s) => s.status === 'in_progress').length;
  const needsReviewSurahs = hifzList.filter((s) => s.status === 'needs_review').length;
  const totalAccuracyAvg =
    sessions.length > 0
      ? Math.round(sessions.reduce((acc, s) => acc + s.accuracy, 0) / sessions.length)
      : 92;

  // Filtered surahs for selector
  const filteredSurahs = SURAHS_LIST.filter(
    (s) =>
      s.name.includes(surahSearchQuery.trim()) ||
      s.number.toString() === surahSearchQuery.trim() ||
      s.englishName.toLowerCase().includes(surahSearchQuery.toLowerCase())
  );

  const handleStartSession = () => {
    setActiveSessionParams({
      surahNumber: selectedSurahNumber,
      startAyah,
      endAyah: Math.min(endAyah, selectedSurahMeta.numberOfAyahs),
      mode: recitationMode,
      reciterId: selectedReciterId,
    });
    setIsSelectModalOpen(false);
  };

  const handleQuickLaunchSurah = (surahNum: number, startA = 1, endA = 10) => {
    setSelectedSurahNumber(surahNum);
    setStartAyah(startA);
    const meta = SURAHS_LIST.find((s) => s.number === surahNum);
    setEndAyah(meta ? Math.min(endA, meta.numberOfAyahs) : endA);
    setIsSelectModalOpen(true);
  };

  const handleStatusChange = async (surahNum: number, newStatus: HifzStatus) => {
    const updated = await khatmahService.updateSurahHifzStatus(surahNum, newStatus, userId);
    onHifzUpdate(updated);
  };

  if (activeSessionParams) {
    const activeSurahMeta =
      SURAHS_LIST.find((s) => s.number === activeSessionParams.surahNumber) || selectedSurahMeta;
    return (
      <HifzSessionRunner
        surah={activeSurahMeta}
        startAyah={activeSessionParams.startAyah}
        endAyah={activeSessionParams.endAyah}
        initialMode={activeSessionParams.mode}
        initialReciterId={activeSessionParams.reciterId}
        userId={userId}
        onExit={() => {
          setActiveSessionParams(null);
          khatmahService.getHifzProgressList(userId).then(onHifzUpdate);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header & Main Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-emerald-900/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-300/40">
              <Mic className="w-3.5 h-3.5" />
              <span>الحفظ والتسميع الصوتي</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            اختبر حفظك وتابع تقدمك في حفظ كتاب الله
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            تسميع تفاعلي بالصوت مع مطابقة دقيقة للنص القرآني الموثق وتحديد مواضع الأخطاء
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-stretch sm:self-auto">
          <button
            onClick={() => setIsSelectModalOpen(true)}
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 cursor-pointer"
          >
            <Mic className="w-4 h-4" />
            <span>ابدأ التسميع</span>
          </button>
          <button
            onClick={() => onSelectSubTab('review')}
            className="px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-100 dark:hover:bg-amber-950/70 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>مراجعة الحفظ</span>
          </button>
          <button
            onClick={() => onSelectSubTab('history')}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-emerald-900/40 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 transition-colors"
            title="سجل جلسات التسميع"
          >
            <History className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Top Stats Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-4 sm:p-5 border border-emerald-900/10 dark:border-emerald-800/50 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              السور المحفوظة
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-800 dark:text-emerald-300">
            {totalMemorizedSurahs}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">من أصل 114 سورة</span>
        </div>

        <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-4 sm:p-5 border border-emerald-900/10 dark:border-emerald-800/50 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              قيد الحفظ والتثبيت
            </span>
            <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {inProgressSurahs}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">سور قيد التكرار</span>
        </div>

        <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-4 sm:p-5 border border-emerald-900/10 dark:border-emerald-800/50 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              تحتاج إلى مراجعة
            </span>
            <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-rose-600 dark:text-rose-400">
            {needsReviewSurahs}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">تحتوي على مواضع ضعف</span>
        </div>

        <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-4 sm:p-5 border border-emerald-900/10 dark:border-emerald-800/50 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              متوسط دقة التسميع
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-800 dark:text-amber-400">
            {totalAccuracyAvg}%
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">عبر جلساتك السابقة</span>
        </div>
      </div>

      {/* 3. Surahs Memorization Progress Grid */}
      <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 sm:p-6 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-emerald-900/40">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              متابعة حفظ السور الكريمة
            </h3>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-emerald-900/40 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filterMode === 'all'
                  ? 'bg-white dark:bg-emerald-800 text-emerald-950 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              الكل ({hifzList.length})
            </button>
            <button
              onClick={() => setFilterMode('memorized')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filterMode === 'memorized'
                  ? 'bg-white dark:bg-emerald-800 text-emerald-950 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              محفوظة ({totalMemorizedSurahs})
            </button>
            <button
              onClick={() => setFilterMode('in_progress')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filterMode === 'in_progress'
                  ? 'bg-white dark:bg-emerald-800 text-emerald-950 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              قيد الحفظ ({inProgressSurahs})
            </button>
            <button
              onClick={() => setFilterMode('needs_review')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filterMode === 'needs_review'
                  ? 'bg-white dark:bg-emerald-800 text-emerald-950 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              تحتاج مراجعة ({needsReviewSurahs})
            </button>
          </div>
        </div>

        {/* Surahs Cards List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {hifzList
            .filter((item) => filterMode === 'all' || item.status === filterMode)
            .map((item) => {
              const meta = SURAHS_LIST.find((s) => s.number === item.surahNumber);
              const isMemorized = item.status === 'memorized';
              const isNeedsReview = item.status === 'needs_review';

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-slate-50/80 dark:bg-emerald-900/20 border border-slate-200/80 dark:border-emerald-800/40 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold font-mono bg-white dark:bg-emerald-950 border border-slate-200 dark:border-emerald-800 text-slate-700 dark:text-slate-200">
                        سورة #{item.surahNumber}
                      </span>

                      {/* Status Dropdown/Selector */}
                      <select
                        value={item.status}
                        onChange={(e) =>
                          handleStatusChange(item.surahNumber, e.target.value as HifzStatus)
                        }
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border cursor-pointer ${
                          isMemorized
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                            : isNeedsReview
                            ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        <option value="memorized">سورة محفوظة</option>
                        <option value="in_progress">قيد الحفظ</option>
                        <option value="needs_review">تحتاج مراجعة</option>
                      </select>
                    </div>

                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                      سورة {item.surahNameAr || meta?.name}
                    </h4>

                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                      <span>{meta?.numberOfAyahs || 7} آية • {meta?.revelationTypeAr}</span>
                      <span>الدقة: <strong className="font-mono text-emerald-700 dark:text-emerald-300">{item.averageAccuracy}%</strong></span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-slate-200 dark:bg-emerald-950 rounded-full overflow-hidden mb-2">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isMemorized
                            ? 'bg-emerald-600'
                            : isNeedsReview
                            ? 'bg-rose-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${item.progressPercentage}%` }}
                      />
                    </div>

                    {item.weakAyahs && item.weakAyahs.length > 0 && (
                      <div className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                        آيات للمراجعة: {item.weakAyahs.join('، ')}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-3 mt-2 border-t border-slate-200/60 dark:border-emerald-900/40">
                    <button
                      onClick={() => handleQuickLaunchSurah(item.surahNumber, 1, Math.min(10, meta?.numberOfAyahs || 10))}
                      className="flex-1 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>بدء التسميع</span>
                    </button>
                    <button
                      onClick={() => onNavigate('quran', item.surahNumber)}
                      className="p-1.5 rounded-xl bg-white dark:bg-emerald-950 border border-slate-200 dark:border-emerald-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600"
                      title="قراءة في المصحف"
                    >
                      <BookOpen className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Teacher Disclaimer */}
      <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40 flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300">
        <Sparkles className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
        <span>
          التسميع الصوتي أداة مساعدة لمراجعة الحفظ، ولا يغني عن التلقي والمراجعة مع أهل الاختصاص.
        </span>
      </div>

      {/* 4. Surah Selection & Ayah Range Modal (Requirement 10 & 11) */}
      <AnimatePresence>
        {isSelectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-emerald-950 border border-emerald-900/10 dark:border-emerald-800/60 rounded-3xl p-6 sm:p-8 max-w-xl w-full text-right space-y-5 shadow-2xl my-8"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-900/50">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                    <Mic className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      إعداد جلسة التسميع الصوتي
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      حدد السورة، نطاق الآيات، ووضع التسميع المناسب لك
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSelectModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* 1. Surah Picker */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    السورة الكريمة
                  </label>
                  {/* Pick from memorized quick action */}
                  {hifzList.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const first = hifzList[0];
                        if (first) {
                          setSelectedSurahNumber(first.surahNumber);
                          setStartAyah(first.startAyah || 1);
                          setEndAyah(first.endAyah || 10);
                        }
                      }}
                      className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                    >
                      اختر من المحفوظ
                    </button>
                  )}
                </div>

                <div className="relative mb-2">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                  <input
                    type="text"
                    value={surahSearchQuery}
                    onChange={(e) => setSurahSearchQuery(e.target.value)}
                    placeholder="ابحث باسم أو رقم السورة..."
                    className="w-full pr-9 pl-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-emerald-900/30 border border-slate-200 dark:border-emerald-800 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <select
                  value={selectedSurahNumber}
                  onChange={(e) => {
                    const num = parseInt(e.target.value, 10);
                    setSelectedSurahNumber(num);
                    setStartAyah(1);
                    const meta = SURAHS_LIST.find((s) => s.number === num);
                    setEndAyah(meta ? Math.min(10, meta.numberOfAyahs) : 10);
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-slate-200 dark:border-emerald-800 text-xs font-bold text-slate-800 dark:text-slate-100"
                >
                  {filteredSurahs.map((s) => (
                    <option key={s.number} value={s.number}>
                      {s.number}. سورة {s.name} ({s.numberOfAyahs} آية - {s.revelationTypeAr})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Ayah Range Picker */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  نطاق الآيات المطلوب تسميعها (من إجمالي {selectedSurahMeta.numberOfAyahs} آية)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                      من آية
                    </span>
                    <input
                      type="number"
                      min={1}
                      max={selectedSurahMeta.numberOfAyahs}
                      value={startAyah}
                      onChange={(e) => setStartAyah(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-slate-200 dark:border-emerald-800 text-xs font-mono font-bold text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                      إلى آية
                    </span>
                    <input
                      type="number"
                      min={startAyah}
                      max={selectedSurahMeta.numberOfAyahs}
                      value={endAyah}
                      onChange={(e) =>
                        setEndAyah(
                          Math.min(
                            selectedSurahMeta.numberOfAyahs,
                            Math.max(startAyah, parseInt(e.target.value) || startAyah)
                          )
                        )
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-slate-200 dark:border-emerald-800 text-xs font-mono font-bold text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Reciter Picker for Listening */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  القارئ المعتمد للاستماع
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {RECITERS_LIST.map((r) => {
                    const isSelected = selectedReciterId === r.id;
                    return (
                      <button
                        type="button"
                        key={r.id}
                        onClick={() => setSelectedReciterId(r.id)}
                        className={`p-2.5 rounded-xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-900/50 border-emerald-600 shadow-xs text-emerald-950 dark:text-white font-bold'
                            : 'bg-white dark:bg-emerald-950/40 border-slate-200 dark:border-emerald-900/40 text-slate-700 dark:text-slate-300 hover:border-emerald-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Volume2 className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-400'}`} />
                          <span className="text-xs">{r.nameAr}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Recitation Modes (Requirement 11) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  اختر وضع التسميع
                </label>
                <div className="space-y-2">
                  {[
                    {
                      id: 'read_with_text' as RecitationMode,
                      title: '1. قراءة مع النص',
                      desc: 'عرض النص القرآني كاملاً، مع إمكانية القراءة ومتابعة الصوت والاستماع للشيخ.',
                      icon: BookOpen,
                    },
                    {
                      id: 'recite_text_visible' as RecitationMode,
                      title: '2. تسميع والنص ظاهر',
                      desc: 'عرض النص ومطابقة تلاوتك بالصوت كلمة بكلمة مع التمييز اللوني الفوري.',
                      icon: Eye,
                    },
                    {
                      id: 'recite_text_hidden' as RecitationMode,
                      title: '3. تسميع والنص مخفي (اختبار الحفظ)',
                      desc: 'إخفاء النص أثناء التلاوة من الذاكرة، ثم كشف المطابقة والنتيجة بعد الانتهاء.',
                      icon: EyeOff,
                    },
                  ].map((m) => {
                    const isSelected = recitationMode === m.id;
                    const IconC = m.icon;
                    return (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => setRecitationMode(m.id)}
                        className={`w-full p-3 rounded-2xl border text-right transition-all flex items-start gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-900/50 border-emerald-600 shadow-xs'
                            : 'bg-white dark:bg-emerald-950/40 border-slate-200 dark:border-emerald-900/40 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                        }`}
                      >
                        <div
                          className={`p-2 rounded-xl shrink-0 ${
                            isSelected
                              ? 'bg-emerald-700 text-white'
                              : 'bg-slate-100 dark:bg-emerald-900/40 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          <IconC className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">
                              {m.title}
                            </span>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                            {m.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-emerald-900/50">
                <button
                  type="button"
                  onClick={() => setIsSelectModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleStartSession}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs shadow-md shadow-emerald-700/20 flex items-center gap-2 cursor-pointer"
                >
                  <Mic className="w-4 h-4" />
                  <span>بدء جلسة التسميع</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
