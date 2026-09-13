import React, { useState } from 'react';
import {
  Heart,
  Sunrise,
  Sunset,
  Moon,
  Sun,
  Sparkles,
  Home,
  Compass,
  Utensils,
  Share2,
  Check,
  RotateCcw,
  Info,
  ChevronDown,
  ChevronUp,
  Copy
} from 'lucide-react';
import { AZKAR_CATEGORIES, AZKAR_DATA } from '../data/azkarData';
import { DhikrItem } from '../types';
import { useUser } from '../context/UserContext';
import { useShareModal } from '../context/ShareContext';

const ICON_MAP: Record<string, any> = {
  Sunrise,
  Sunset,
  Moon,
  Sun,
  Sparkles,
  Home,
  Compass,
  Utensils,
  Heart
};

export const AzkarView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('morning');
  const [counters, setCounters] = useState<Record<string, number>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedBenefitId, setExpandedBenefitId] = useState<string | null>(null);

  const { incrementTasbihTotal } = useUser();
  const { openShareModal } = useShareModal();

  const currentCategoryData = AZKAR_CATEGORIES.find((c) => c.id === selectedCategory) || AZKAR_CATEGORIES[0];
  const dhikrs = AZKAR_DATA.filter((d) => d.categoryId === selectedCategory);

  const handleIncrement = (d: DhikrItem) => {
    const current = counters[d.id] || 0;
    if (current < d.repeatCount) {
      const next = current + 1;
      setCounters((prev) => ({ ...prev, [d.id]: next }));
      incrementTasbihTotal(1);

      // Trigger soft vibration on supported mobile devices
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate(20);
        } catch {
          // ignore
        }
      }
    }
  };

  const handleReset = (dId?: string) => {
    if (dId) {
      setCounters((prev) => ({ ...prev, [dId]: 0 }));
    } else {
      // Reset all in current category
      const resetObj = { ...counters };
      dhikrs.forEach((d) => {
        resetObj[d.id] = 0;
      });
      setCounters(resetObj);
    }
  };

  const handleCopy = (d: DhikrItem) => {
    const text = `${d.textAr}\n[المصدر: ${d.sourceAr}]`;
    navigator.clipboard.writeText(text);
    setCopiedId(d.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 sm:p-6 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              حصن المسلم وأذكار اليوم والليلة
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            أذكار نبوية صحيحة ومأثورة مع ضبط التشكيل الكامل وبيان الفضل والمصدر.
          </p>
        </div>

        <button
          onClick={() => handleReset()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-emerald-900/50 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-200 dark:hover:bg-emerald-800 transition-colors shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>تصفير عدادات القسم</span>
        </button>
      </div>

      {/* Category Pills Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {AZKAR_CATEGORIES.map((cat) => {
          const Icon = ICON_MAP[cat.icon] || Heart;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                isActive
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-white dark:bg-emerald-950/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-emerald-800 hover:border-emerald-500'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-emerald-600 dark:text-emerald-400'}`} />
              <span>{cat.nameAr}</span>
            </button>
          );
        })}
      </div>

      {/* Category Header */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {currentCategoryData.nameAr} ({dhikrs.length})
        </h2>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {currentCategoryData.descriptionAr}
        </span>
      </div>

      {/* Dhikr Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dhikrs.map((d) => {
          const count = counters[d.id] || 0;
          const isCompleted = count >= d.repeatCount;
          const isBenefitExpanded = expandedBenefitId === d.id;

          return (
            <div
              key={d.id}
              className={`bg-white dark:bg-emerald-950/80 rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                isCompleted
                  ? 'border-emerald-500/60 bg-emerald-50/20 dark:bg-emerald-900/20 shadow-xs'
                  : 'border-slate-200/90 dark:border-emerald-800/40 hover:border-emerald-400'
              }`}
            >
              <div>
                {/* Card Header: Source & Action Icons */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-900/50 mb-3 text-xs">
                  <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                    {d.sourceAr}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopy(d)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                      title="نسخ نص الذكر"
                    >
                      {copiedId === d.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() =>
                        openShareModal({
                          sectionName: currentCategoryData.nameAr,
                          contentType: 'ذكر',
                          type: 'dhikr',
                          content: d.textAr,
                          text: d.textAr,
                          source: d.sourceAr,
                          title: currentCategoryData.nameAr
                        })
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-800 transition-colors font-medium text-xs"
                      title="مشاركة الذكر كصورة أو نص"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>مشاركة</span>
                    </button>
                    {d.benefitAr && (
                      <button
                        onClick={() => setExpandedBenefitId(isBenefitExpanded ? null : d.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isBenefitExpanded ? 'text-emerald-700 dark:text-amber-300' : 'text-slate-400 hover:text-slate-600'
                        }`}
                        title="فضل الذكر"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Dhikr Text with Tashkeel */}
                <p className="font-amiri text-lg sm:text-xl leading-relaxed text-slate-900 dark:text-emerald-50 my-2 text-right">
                  {d.textAr}
                </p>

                {/* Expandable Benefit */}
                {isBenefitExpanded && d.benefitAr && (
                  <div className="mt-3 p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 leading-relaxed animate-in fade-in duration-150">
                    <strong className="block mb-1 font-bold">فضل هذا الذكر المأثور:</strong>
                    {d.benefitAr}
                  </div>
                )}
              </div>

              {/* Repetition Counter Button & Progress Bar */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-emerald-900/50 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>التكرار المستحب: {d.repeatCount} مرات</span>
                  <span>{isCompleted ? 'اكتمل الذكر ✓' : `المتبقي: ${d.repeatCount - count}`}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleIncrement(d)}
                    disabled={isCompleted}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-98 ${
                      isCompleted
                        ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 cursor-default'
                        : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm'
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>تم بحمد الله ({d.repeatCount}/{d.repeatCount})</span>
                      </>
                    ) : (
                      <>
                        <span>اضغط للتسبيح</span>
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-900/50 text-amber-300 font-mono text-xs">
                          {count} / {d.repeatCount}
                        </span>
                      </>
                    )}
                  </button>

                  {count > 0 && (
                    <button
                      onClick={() => handleReset(d.id)}
                      className="p-3 rounded-xl border border-slate-200 dark:border-emerald-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                      title="إعادة تعيين العداد"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
