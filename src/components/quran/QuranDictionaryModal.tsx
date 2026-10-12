'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Copy, 
  Bookmark, 
  PenTool, 
  Share2, 
  ExternalLink, 
  X, 
  CheckCircle2, 
  Layers, 
  Hash, 
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';
import { WordLookupResult } from '../../utils/quranDictionaryEngine';
import { libraryManager } from '../../utils/libraryManager';
import { saveReflectionEntry } from '../../utils/reflectionJournalManager';

interface QuranDictionaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  lookupResult: WordLookupResult | null;
  isEnglish: boolean;
  onOpenAyah?: (surah: number, ayah: number) => void;
  onOpenShareCard?: (content: { title: string; text: string; source: string; category: string }) => void;
}

export const QuranDictionaryModal: React.FC<QuranDictionaryModalProps> = ({
  isOpen,
  onClose,
  lookupResult,
  isEnglish,
  onOpenAyah,
  onOpenShareCard
}) => {
  const [copied, setCopied] = useState(false);
  const [savedToLibrary, setSavedToLibrary] = useState(false);
  const [savedToJournal, setSavedToJournal] = useState(false);

  if (!isOpen || !lookupResult) return null;

  const entry = lookupResult.entry;

  const handleCopy = () => {
    if (!entry) return;
    const text = `【معجم مفردات القرآن: ${entry.word}】\nالجذر: ${entry.root}\nالمعنى: ${entry.meaningAr}\nالإعراب والصرف: ${entry.morphologyNote}\nالمصدر: ${entry.lexicalSource}\nعبر منصة وَصْل الإسلامية`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleSaveToLibrary = () => {
    if (!entry) return;
    libraryManager.saveItem({
      title: `معجم القرآن: ${entry.word} (جذر: ${entry.root})`,
      text: entry.meaningAr,
      source: entry.lexicalSource,
      category: 'ayah',
      notes: `${entry.morphologyNote} • وردت في القرآن الكريم ${entry.totalOccurrencesInQuran} مرة.`
    });
    setSavedToLibrary(true);
  };

  const handleAddToJournal = () => {
    if (!entry) return;
    saveReflectionEntry({
      surahNumber: entry.surahNumber,
      surahName: `سورة ${entry.surahNumber}`,
      ayahNumber: entry.ayahNumber,
      ayahText: entry.word,
      tafsirSource: entry.lexicalSource,
      tafsirText: entry.meaningAr,
      title: `تدبر لغوي لكلمة: {${entry.word}}`,
      notes: `جذر الكلمة: (${entry.root})، وردت في القرآن ${entry.totalOccurrencesInQuran} مرة. الفائدة الصرفية: ${entry.morphologyNote}`,
      tags: ['معجم_القرآن', entry.rootArabic, 'لغة_القرآن'],
      collectionId: 'default',
      isPinned: false
    });
    setSavedToJournal(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-scale-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-[var(--gold-light)] text-[var(--gold)]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[var(--text-main)] font-cairo">
                {isEnglish ? 'Quranic Lexical Dictionary' : 'معجم القرآن التفاعلي'}
              </h3>
              <span className="text-[11px] text-[var(--text-muted)]">
                بيان المعنى اللغوي، الجذر الصرفي، والشواهد القرآنية
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Word Display Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[var(--bg-card-subtle)] to-[var(--gold-light)]/20 border border-[var(--border-gold)] text-center space-y-2">
          <span className="text-xs text-[var(--text-muted)] font-bold">اللفظ القرآني الشريف:</span>
          <div className="text-3xl sm:text-4xl font-bold font-quran text-[var(--text-main)] py-1">
            ﴿{lookupResult.originalWord}﴾
          </div>
          {lookupResult.surahNumber && lookupResult.ayahNumber && (
            <div className="text-xs text-[var(--gold)] font-bold">
              [سورة رقم {lookupResult.surahNumber} • الآية {lookupResult.ayahNumber}]
            </div>
          )}
        </div>

        {lookupResult.hasVerifiedLexicon && entry ? (
          /* Verified Entry Content */
          <div className="space-y-4">
            {/* Quick Badges: Root, Part of speech, Occurrences */}
            <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
              <div className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
                <span className="text-[10px] text-[var(--text-muted)] block">جذر الكلمة</span>
                <span className="font-bold text-[var(--primary)] font-mono text-sm mt-0.5 block">
                  {entry.root}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
                <span className="text-[10px] text-[var(--text-muted)] block">القسم الصرفي</span>
                <span className="font-bold text-[var(--text-main)] text-sm mt-0.5 block">
                  {entry.partOfSpeech}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
                <span className="text-[10px] text-[var(--text-muted)] block">ورود الجذر بالقرآن</span>
                <span className="font-bold text-amber-500 font-mono text-sm mt-0.5 block">
                  {entry.totalOccurrencesInQuran} مرة
                </span>
              </div>
            </div>

            {/* Classical Lexical Meaning */}
            <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-2">
              <span className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[var(--gold)]" />
                <span>المعنى والدلالة اللغوية:</span>
              </span>
              <p className="text-sm font-tajawal text-[var(--text-main)] leading-relaxed">
                {entry.meaningAr}
              </p>
              {entry.meaningEn && (
                <p className="text-xs text-[var(--text-muted)] font-mono pt-1 border-t border-[var(--border-color)]/60">
                  {entry.meaningEn}
                </p>
              )}
            </div>

            {/* Morphology Note */}
            <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-1.5">
              <span className="text-xs font-bold text-[var(--text-main)] block">الإعراب والوزن الصرفي:</span>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                {entry.morphologyNote}
              </p>
            </div>

            {/* Related Ayahs sharing the same root */}
            {entry.relatedAyahs && entry.relatedAyahs.length > 0 && (
              <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-2.5">
                <span className="text-xs font-bold text-[var(--text-main)] block">
                  شواهد قرآنية أخرى تشترك في نفس الجذر ({entry.root}):
                </span>
                <div className="space-y-2">
                  {entry.relatedAyahs.map((rel, idx) => (
                    <div 
                      key={idx} 
                      className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <span className="font-quran font-bold text-[var(--text-main)] block truncate">
                          «{rel.textSnippet}»
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)]">
                          سورة {rel.surahName} [الآية: {rel.ayahNumber}]
                        </span>
                      </div>
                      {onOpenAyah && (
                        <button
                          onClick={() => {
                            onOpenAyah(rel.surahNumber, rel.ayahNumber);
                            onClose();
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[var(--bg-card-subtle)] text-[var(--primary)] text-[11px] font-bold shrink-0 hover:bg-[var(--primary-light)]"
                        >
                          عرض
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Source Attribution */}
            <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>المصدر المعجمي: {entry.lexicalSource}</span>
            </div>

            {/* Actions Toolbar */}
            <div className="pt-3 border-t border-[var(--border-color)] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-2 rounded-xl bg-[var(--bg-card-subtle)] text-[var(--text-main)] text-xs font-bold border border-[var(--border-color)] hover:border-[var(--gold)] flex items-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'تم النسخ!' : 'نسخ التعريف'}</span>
                </button>

                <button
                  onClick={handleSaveToLibrary}
                  disabled={savedToLibrary}
                  className="px-3 py-2 rounded-xl bg-[var(--bg-card-subtle)] text-[var(--text-main)] text-xs font-bold border border-[var(--border-color)] hover:border-[var(--gold)] flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Bookmark className={`w-3.5 h-3.5 ${savedToLibrary ? 'fill-[var(--gold)] text-[var(--gold)]' : ''}`} />
                  <span>{savedToLibrary ? 'في المكتبة' : 'حفظ'}</span>
                </button>

                <button
                  onClick={handleAddToJournal}
                  disabled={savedToJournal}
                  className="px-3 py-2 rounded-xl bg-[var(--bg-card-subtle)] text-[var(--text-main)] text-xs font-bold border border-[var(--border-color)] hover:border-[var(--primary)] flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <PenTool className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{savedToJournal ? 'أُضيف للتدبر' : 'تدبر الكلمة'}</span>
                </button>
              </div>

              {onOpenShareCard && (
                <button
                  onClick={() => {
                    onOpenShareCard({
                      title: `معجم القرآن: ${entry.word}`,
                      text: `${entry.meaningAr}\n(الجذر: ${entry.root} • ورودها: ${entry.totalOccurrencesInQuran} مرة)`,
                      source: entry.lexicalSource,
                      category: 'معجم القرآن'
                    });
                    onClose();
                  }}
                  className="px-3 py-2 rounded-xl bg-[var(--gold-light)] text-[var(--gold)] text-xs font-bold border border-[var(--border-gold)] hover:bg-opacity-80 flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>مشاركة كبطاقة</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Honest Fallback (Unverified / missing lexical metadata) */
          <div className="p-6 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-center space-y-3">
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              {lookupResult.unverifiedNotice}
            </p>
            <p className="text-[11px] text-[var(--text-muted)]">
              يمكنك البحث عن جذر الكلمة أو مراجعة التفسير الميسر للآية الكريمة كاملة.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
