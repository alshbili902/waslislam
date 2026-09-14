import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Share2,
  Heart,
  Copy,
  Check,
  ShieldCheck,
  BookOpen,
  Sparkles,
  Quote,
  Layers,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { IslamicWisdom, WISDOM_CONTENT_TYPE_LABELS } from '../../types/wisdom';
import { useShareModal } from '../../context/ShareContext';
import { useUser } from '../../context/UserContext';
import { useModalScrollLock } from '../../hooks/useModalScrollLock';

interface WisdomDetailsModalProps {
  wisdom: IslamicWisdom | null;
  isOpen: boolean;
  onClose: () => void;
}

export const WisdomDetailsModal: React.FC<WisdomDetailsModalProps> = ({
  wisdom,
  isOpen,
  onClose,
}) => {
  const { openShareModal } = useShareModal();
  const { toggleFavorite, isFavorite } = useUser();
  const [copied, setCopied] = useState(false);

  useModalScrollLock(isOpen, {
    onClose,
    closeOnEsc: true,
  });

  if (!isOpen || !wisdom) return null;

  const fav = isFavorite('wisdom', wisdom.id);

  const handleCopy = () => {
    let textToCopy = wisdom.content;
    if (wisdom.author) {
      textToCopy += `\nالقائل: ${wisdom.author}`;
    }
    textToCopy += `\nالمصدر: ${wisdom.source}`;
    if (wisdom.reference) {
      textToCopy += ` (${wisdom.reference})`;
    }
    if (wisdom.hadithGrade) {
      textToCopy += ` — ${wisdom.hadithGrade}`;
    }
    textToCopy += `\n\nمنصة وصل الإسلامية: https://waslislam.fun/wisdoms`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = () => {
    let sourceLine = wisdom.source;
    if (wisdom.author) {
      sourceLine = `${wisdom.author} — ${wisdom.source}`;
    }
    if (wisdom.reference) {
      sourceLine += ` (${wisdom.reference})`;
    }

    openShareModal({
      sectionName: 'الحِكَم والمواعظ',
      contentType: WISDOM_CONTENT_TYPE_LABELS[wisdom.contentType] || 'حكمة',
      type: 'wisdom',
      content: wisdom.content,
      text: wisdom.content,
      source: sourceLine,
      title: `حكمة في ${wisdom.category}`,
    });
  };

  const handleFavoriteToggle = () => {
    toggleFavorite({
      type: 'wisdom',
      referenceId: wisdom.id,
      title: `${WISDOM_CONTENT_TYPE_LABELS[wisdom.contentType] || 'حكمة'} في ${wisdom.category}`,
      subtitle: wisdom.author ? `${wisdom.author} • ${wisdom.source}` : wisdom.source,
      contentSnippet: wisdom.content.length > 80 ? wisdom.content.substring(0, 80) + '...' : wisdom.content,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm wasl-modal-overlay animate-in fade-in duration-200"
      dir="rtl"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="w-full max-w-xl bg-white dark:bg-[#04241c] rounded-3xl shadow-2xl border border-emerald-900/15 dark:border-emerald-700/40 overflow-hidden flex flex-col max-h-[min(90dvh,calc(100dvh-2rem))]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-emerald-800/40 bg-gradient-to-l from-emerald-900/10 via-emerald-800/5 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shadow-xs">
              <Quote className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                  {WISDOM_CONTENT_TYPE_LABELS[wisdom.contentType] || wisdom.contentType}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-500/20">
                  {wisdom.category}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white mt-1">
                تفاصيل الحكمة والموعظة
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-emerald-900/40 transition-colors"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Verification Badge */}
          <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/60 px-3.5 py-2 rounded-xl border border-emerald-500/20">
            <div className="flex items-center gap-1.5 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>محتوى شرعي موثق ومعتمد من المصادر الأصلية</span>
            </div>
            {wisdom.hadithGrade && (
              <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 font-bold">
                {wisdom.hadithGrade}
              </span>
            )}
          </div>

          {/* Main Content Area with Islamic Framing */}
          <div className="relative p-6 sm:p-8 rounded-3xl bg-slate-50/80 dark:bg-[#031d16] border border-emerald-900/10 dark:border-emerald-800/50 shadow-inner">
            <div className="text-center font-amiri text-xl sm:text-2xl leading-loose text-slate-900 dark:text-emerald-50 select-text tracking-wide">
              {wisdom.content}
            </div>

            {/* Author / Narrator */}
            {wisdom.author && (
              <div className="mt-5 text-center text-sm font-bold text-emerald-800 dark:text-emerald-300">
                — {wisdom.author} —
              </div>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-emerald-950/40 border border-slate-200/80 dark:border-emerald-800/40">
              <span className="text-slate-400 dark:text-slate-400 block mb-1 font-medium">المصدر الأساسي</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{wisdom.source}</span>
            </div>

            {wisdom.reference && (
              <div className="p-3.5 rounded-2xl bg-white dark:bg-emerald-950/40 border border-slate-200/80 dark:border-emerald-800/40">
                <span className="text-slate-400 dark:text-slate-400 block mb-1 font-medium">المرجع والتخريج</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{wisdom.reference}</span>
              </div>
            )}

            <div className="p-3.5 rounded-2xl bg-white dark:bg-emerald-950/40 border border-slate-200/80 dark:border-emerald-800/40">
              <span className="text-slate-400 dark:text-slate-400 block mb-1 font-medium">نوع المادة</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                {WISDOM_CONTENT_TYPE_LABELS[wisdom.contentType] || wisdom.contentType}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-emerald-950/40 border border-slate-200/80 dark:border-emerald-800/40">
              <span className="text-slate-400 dark:text-slate-400 block mb-1 font-medium">الموضوع والتصنيف</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-300 text-sm">{wisdom.category}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-emerald-800/40 bg-slate-50/80 dark:bg-[#031d16] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleFavoriteToggle}
              className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold ${
                fav
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 border-rose-200 dark:border-rose-900/50'
                  : 'bg-white dark:bg-emerald-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-emerald-800/40 hover:bg-slate-100'
              }`}
            >
              <Heart className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">{fav ? 'في المفضلة' : 'حفظ بالمفضلة'}</span>
            </button>

            <button
              onClick={handleCopy}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-emerald-800/40 bg-white dark:bg-emerald-900/30 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-emerald-800/50 transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="نسخ النص مع المصدر"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400">تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="hidden sm:inline">نسخ النص</span>
                </>
              )}
            </button>
          </div>

          <button
            onClick={handleShare}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>مشاركة كبطاقة فاخرة</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
