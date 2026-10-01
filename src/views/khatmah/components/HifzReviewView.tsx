import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  RotateCcw,
  BookOpen,
  AlertCircle,
  Play,
  Mic,
  ChevronLeft,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import { khatmahService } from '../../../services/khatmahService';
import { SURAHS_LIST } from '../../../data/quranMetadata';
import { HifzProgress, RecitationMode } from '../../../types/khatmah';

interface Props {
  onLaunchReviewSession: (surahNumber: number, startAyah: number, endAyah: number, mode: RecitationMode) => void;
  onNavigate: (tab: string, contextId?: any) => void;
  userId?: string;
}

export const HifzReviewView: React.FC<Props> = ({
  onLaunchReviewSession,
  onNavigate,
  userId,
}) => {
  const [weakList, setWeakList] = useState<
    { surahNumber: number; surahNameAr: string; weakAyahs: number[]; totalMistakes: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const data = await khatmahService.getWeakAyahsForReview(userId);
      if (mounted) {
        setWeakList(data);
        setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [userId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-emerald-900/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-300/40">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>مراجعة الحفظ وتثبيت المتشابهات</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            آيات تحتاج إلى مراجعة وتكرار
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            نظام ذكي يرتب مواضع التردد والأخطاء من جلسات التسميع السابقة لتعيد مراجعتها وتثبيتها
          </p>
        </div>

        <button
          onClick={() => onNavigate('quran')}
          className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-emerald-900/40 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 transition-colors flex items-center gap-1.5"
        >
          <BookOpen className="w-4 h-4" />
          <span>فتح المصحف الشريف</span>
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400 space-y-3">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">جاري تجميع مواضع المراجعة...</p>
        </div>
      ) : weakList.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-emerald-950/60 rounded-3xl border border-emerald-900/10 dark:border-emerald-800/40 space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            لا توجد آيات متعثرة حالياً، ما شاء الله!
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            جميع جلسات التسميع السابقة حققت دقة عالية. يمكنك بدء جلسة تسميع جديدة لأي سورة لاختبار حفظك.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {weakList.map((item) => {
            const surahMeta = SURAHS_LIST.find((s) => s.number === item.surahNumber);
            const minAyah = Math.min(...item.weakAyahs);
            const maxAyah = Math.max(...item.weakAyahs);

            return (
              <div
                key={item.surahNumber}
                className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 sm:p-6 border border-amber-200/80 dark:border-amber-800/40 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-amber-400 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 text-xs font-bold font-mono">
                      #{item.surahNumber}
                    </span>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                      سورة {item.surahNameAr || surahMeta?.name}
                    </h4>
                    <span className="text-xs text-slate-400">
                      ({item.weakAyahs.length} آيات تحتاج تثبيتاً)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      الآيات:
                    </span>
                    {item.weakAyahs.map((ayahNum) => (
                      <span
                        key={ayahNum}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-emerald-900/40 text-slate-800 dark:text-slate-200 text-xs font-mono font-bold"
                      >
                        الآية {ayahNum}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-stretch md:self-auto shrink-0">
                  <button
                    onClick={() => onNavigate('quran', item.surahNumber)}
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-emerald-900/40 text-slate-700 dark:text-slate-200 hover:text-emerald-700 transition-colors"
                    title="قراءة السورة في المصحف"
                  >
                    <BookOpen className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      onLaunchReviewSession(
                        item.surahNumber,
                        minAyah,
                        maxAyah,
                        'recite_text_visible'
                      )
                    }
                    className="flex-1 md:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>ابدأ المراجعة (الآيات {minAyah} - {maxAyah})</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Teacher Disclaimer */}
      <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40 flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300">
        <Sparkles className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
        <span>
          التسميع الصوتي أداة مساعدة لمراجعة الحفظ، ولا يغني عن التلقي والمراجعة مع أهل الاختصاص.
        </span>
      </div>
    </div>
  );
};
