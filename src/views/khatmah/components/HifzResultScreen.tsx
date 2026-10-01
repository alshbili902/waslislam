import React from 'react';
import { motion } from 'motion/react';
import {
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Sparkles,
  Share2,
  BookmarkCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { HifzSession, HifzAyahResult } from '../../../types/khatmah';

interface Props {
  session: HifzSession;
  onRetry: () => void;
  onReviewMistakes: () => void;
  onClose: () => void;
  surahNameAr: string;
}

export const HifzResultScreen: React.FC<Props> = ({
  session,
  onRetry,
  onReviewMistakes,
  onClose,
  surahNameAr,
}) => {
  const accuracy = session.accuracy;

  let assessmentMessage = 'أحسنت، واصل المراجعة والتكرار لتثبيت الحفظ.';
  let badgeColor = 'text-emerald-700 bg-emerald-100 dark:bg-emerald-900/60 border-emerald-300';
  if (accuracy >= 95) {
    assessmentMessage = 'ما شاء الله تبارك الله! حفظك ممتاز ومتقن لهذه الآيات الكريمة.';
    badgeColor = 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400';
  } else if (accuracy >= 85) {
    assessmentMessage = 'تلاوة وحفظ متقدمان جداً، مع بعض المواضع اليسيرة التي تحتاج إلى تثبيت.';
    badgeColor = 'text-teal-700 bg-teal-50 dark:bg-teal-950/60 border-teal-300';
  } else if (accuracy >= 70) {
    assessmentMessage = 'بداية جيدة ومبشّرة، ننصحك بالاستماع للشيخ وتكرار الآيات ثم إعادة التسميع.';
    badgeColor = 'text-amber-700 bg-amber-50 dark:bg-amber-950/60 border-amber-300';
  } else {
    assessmentMessage = 'حاول مراجعة الآيات بهدوء مع النظر في المصحف، ثم كرر التسميع مرة أخرى.';
    badgeColor = 'text-rose-700 bg-rose-50 dark:bg-rose-950/60 border-rose-300';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Top Hero Score Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#063b30] via-[#03251e] to-[#011713] text-white p-6 sm:p-10 text-center shadow-xl border border-emerald-600/30">
        <div className="absolute inset-0 bg-islamic-pattern opacity-10 pointer-events-none" />

        <div className="relative z-10 max-w-lg mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>نتيجة التسميع الصوتي</span>
          </div>

          <div className="text-6xl sm:text-7xl font-bold font-mono text-amber-300 tracking-tight">
            {accuracy}%
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-white">
            سورة {surahNameAr} (الآيات {session.startAyah} - {session.endAyah})
          </h3>

          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-medium">
            {assessmentMessage}
          </p>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-4 gap-2 pt-4 border-t border-emerald-800/60">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-emerald-200 block mb-0.5">الآيات</span>
              <span className="text-sm sm:text-base font-bold font-mono text-white">
                {session.totalAyahs}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-emerald-200 block mb-0.5">الكلمات</span>
              <span className="text-sm sm:text-base font-bold font-mono text-white">
                {session.totalWords}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-emerald-200 block mb-0.5">الصحيحة</span>
              <span className="text-sm sm:text-base font-bold font-mono text-emerald-400">
                {session.correctWordsCount}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-emerald-200 block mb-0.5">الأخطاء</span>
              <span className="text-sm sm:text-base font-bold font-mono text-rose-300">
                {session.incorrectWordsCount + session.missingWordsCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Weak Ayahs Alert if any */}
      {session.weakAyahs.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-sm">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>أكثر الآيات التي تحتاج إلى تثبيت ومراجعة:</span>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-bold">
              {session.weakAyahs.length} مواضع
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap pt-1">
            {session.weakAyahs.map((ayahNum) => (
              <span
                key={ayahNum}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-emerald-950 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-bold shadow-xs"
              >
                سورة {surahNameAr} • الآية {ayahNum}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Ayahs Detailed Word-by-Word Review List */}
      <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-6 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-900/50">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>تفاصيل مطابقة الكلمات لكل آية</span>
          </h4>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            النص القرآني الموثق محفوظ كما هو
          </span>
        </div>

        <div className="space-y-4">
          {session.ayahResults.map((ayah) => {
            return (
              <div
                key={ayah.numberInSurah}
                className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-emerald-900/20 border border-slate-200/80 dark:border-emerald-800/40 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    الآية {ayah.numberInSurah}
                  </span>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                      الدقة: <strong className="text-emerald-700 dark:text-amber-400 font-mono">{ayah.accuracy}%</strong>
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      صحيحة: {ayah.correctWords}
                    </span>
                    {(ayah.incorrectWords > 0 || ayah.missingWords > 0) && (
                      <span className="text-rose-600 dark:text-rose-400">
                        مراجعة: {ayah.incorrectWords + ayah.missingWords}
                      </span>
                    )}
                  </div>
                </div>

                {/* Display words with visual feedback */}
                <div className="p-3 bg-white dark:bg-emerald-950 rounded-xl border border-slate-200/60 dark:border-emerald-900/60 leading-loose font-scheherazade text-xl sm:text-2xl text-right">
                  {ayah.words.map((w, idx) => {
                    let wordClass = 'word-recitation-correct';
                    let title = 'نطق صحيح';
                    let mark = '✓';

                    if (w.status === 'incorrect') {
                      wordClass = 'word-recitation-incorrect';
                      title = w.arabicErrorLabel || 'استبدال كلمة';
                      mark = '❌';
                    } else if (w.status === 'missing') {
                      wordClass = 'word-recitation-missing';
                      title = 'حذف كلمة';
                      mark = '⚠️';
                    } else if (w.status === 'unclear') {
                      wordClass = 'word-recitation-unclear';
                      title = 'لم يُتعرف عليها بوضوح';
                      mark = '❓';
                    }

                    return (
                      <span
                        key={idx}
                        title={title}
                        className={`inline-block mx-1 transition-all ${wordClass}`}
                      >
                        {w.expectedWord}
                        <sup className="text-[10px] font-sans mr-0.5 opacity-70">{mark}</sup>
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Teacher Disclaimer (Requirement 40) */}
      <div className="p-3 rounded-xl bg-slate-100 dark:bg-emerald-900/30 text-center text-xs text-slate-500 dark:text-slate-400 leading-relaxed border border-slate-200 dark:border-emerald-800/40">
        <span className="font-semibold text-emerald-800 dark:text-emerald-300">ملاحظة هامة: </span>
        التسميع الصوتي أداة مساعدة لمراجعة الحفظ، ولا يغني عن التلقي والمراجعة مع أهل الاختصاص.
      </div>

      {/* Footer Navigation Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-100 dark:hover:bg-emerald-900/40"
        >
          العودة للوحة الحفظ
        </button>

        <div className="flex items-center gap-2">
          {session.weakAyahs.length > 0 && (
            <button
              onClick={onReviewMistakes}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>مراجعة الأخطاء</span>
            </button>
          )}

          <button
            onClick={onRetry}
            className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة التسميع</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
