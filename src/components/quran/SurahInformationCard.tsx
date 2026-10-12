'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  Play, 
  Share2, 
  Bookmark, 
  BookmarkCheck, 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  Sparkles, 
  Layers, 
  FileText, 
  Compass, 
  History, 
  ShieldCheck, 
  Copy, 
  Check, 
  X,
  ExternalLink,
  Info
} from 'lucide-react';
import { SURAH_LIST, RECITERS, Reciter } from '../../data/quranMetadata';
import { getSurahInformation, SurahInformation } from '../../data/surahInformationData';
import { libraryManager } from '../../utils/libraryManager';
import { localStore } from '../../lib/supabase';

interface SurahInformationCardProps {
  surahNumber: number;
  onClose?: () => void;
  onReadSurah: (surahNumber: number, ayahNumber?: number) => void;
  onPlaySurah: (surahNumber: number, reciterId: string) => void;
  onOpenTafsir: (surahNumber: number, ayahNumber: number) => void;
  onOpenSimilarAyahs?: (surahNumber: number) => void;
  onOpenThematicIndex?: (surahNumber: number) => void;
  onOpenShareCard?: (content: { title: string; text: string; source: string; category: string }) => void;
  selectedReciterId: string;
  onChangeReciter: (id: string) => void;
  isEnglish: boolean;
}

export const SurahInformationCard: React.FC<SurahInformationCardProps> = ({
  surahNumber: initialSurahNumber,
  onClose,
  onReadSurah,
  onPlaySurah,
  onOpenTafsir,
  onOpenSimilarAyahs,
  onOpenThematicIndex,
  onOpenShareCard,
  selectedReciterId,
  onChangeReciter,
  isEnglish
}) => {
  const [currentSurahNum, setCurrentSurahNum] = useState<number>(initialSurahNumber || 1);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const surahInfo: SurahInformation = getSurahInformation(currentSurahNum);
  const currentReciter = RECITERS.find(r => r.id === selectedReciterId) || RECITERS[0];

  const lastReadAyah = localStore.get<number>(`last_read_ayah_surah_${currentSurahNum}`, 1);

  const handleNextSurah = () => {
    if (currentSurahNum < 114) {
      setCurrentSurahNum(prev => prev + 1);
      setIsSaved(false);
    }
  };

  const handlePrevSurah = () => {
    if (currentSurahNum > 1) {
      setCurrentSurahNum(prev => prev - 1);
      setIsSaved(false);
    }
  };

  const handleSaveToLibrary = () => {
    libraryManager.saveItem({
      itemType: 'surah_card',
      titleAr: `بطاقة تعريف سورة ${surahInfo.nameAr}`,
      subtitleAr: `${surahInfo.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • ${surahInfo.numberOfAyahs} آية • الجزء ${surahInfo.juzStart}`,
      bodyAr: surahInfo.overviewSummaryAr,
      referenceAr: `المصحف الشريف — سورة ${surahInfo.nameAr} [رقم ${surahInfo.surahNumber}]`,
      collectionId: 'surah_cards',
      userNote: `مقاصد السورة: ${surahInfo.coreObjectivesAr.join('، ')}`
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleShareCard = () => {
    if (!onOpenShareCard) return;
    onOpenShareCard({
      title: `بطاقة تعريف سورة ${surahInfo.nameAr}`,
      text: `${surahInfo.overviewSummaryAr}\n\nأبرز المقاصد:\n- ${surahInfo.coreObjectivesAr.slice(0, 3).join('\n- ')}`,
      source: `${surahInfo.sourceAttribution} • وصل الإسلامية`,
      category: 'بطاقة السورة'
    });
  };

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-xl overflow-hidden flex flex-col max-w-4xl mx-auto">
      {/* Top Navigation & Header */}
      <div className="p-5 md:p-6 bg-gradient-to-br from-[var(--emerald-deep)] to-[var(--bg-card)] border-b border-[var(--gold)]/20 text-white relative">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevSurah}
              disabled={currentSurahNum <= 1}
              className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="السورة السابقة"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <select
              value={currentSurahNum}
              onChange={(e) => setCurrentSurahNum(Number(e.target.value))}
              className="bg-black/30 border border-white/20 rounded-lg px-3 py-1 text-xs md:text-sm font-bold text-white focus:outline-none"
            >
              {SURAH_LIST.map(s => (
                <option key={s.number} value={s.number} className="bg-[var(--bg-card)] text-[var(--text-main)]">
                  {s.number}. سورة {s.name} ({s.numberOfAyahs} آية)
                </option>
              ))}
            </select>
            <button
              onClick={handleNextSurah}
              disabled={currentSurahNum >= 114}
              className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="السورة التالية"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveToLibrary}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
              title="أضف إلى مكتبتي"
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4 text-[var(--gold)]" /> : <Bookmark className="w-4 h-4" />}
            </button>
            <button
              onClick={handleShareCard}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
              title="مشاركة البطاقة"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Surah Name & Badges */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap text-xs font-semibold mb-2 text-[var(--gold-light)]">
              <span className="px-2.5 py-0.5 rounded-md bg-[var(--gold)]/20 border border-[var(--gold)]/30">
                سورة رقم {surahInfo.surahNumber}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-white/10">
                {surahInfo.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-white/10">
                ترتيب النزول: {surahInfo.revelationOrder}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-white/10">
                الجزء: {surahInfo.juzStart}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--gold)] font-scheherazade">
              سورة {surahInfo.nameAr}
            </h1>
            <p className="text-xs md:text-sm text-gray-200 mt-1">
              {surahInfo.titleMeaningAr}
              {surahInfo.otherNames && surahInfo.otherNames.length > 0 && (
                <span className="opacity-80"> — ومن أسمائها: ({surahInfo.otherNames.join('، ')})</span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-white font-bold">
              {surahInfo.numberOfAyahs} آية
            </span>
          </div>
        </div>
      </div>

      {/* Main Actions Bar */}
      <div className="p-4 bg-[var(--bg-main)] border-b border-[var(--border-color)] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Read Surah */}
          <button
            onClick={() => onReadSurah(currentSurahNum, 1)}
            className="px-4 py-2 rounded-lg bg-[var(--gold)] text-black font-bold flex items-center gap-2 hover:opacity-90 shadow-sm transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span>اقرأ السورة</span>
          </button>

          {/* Resume last read ayah if recorded */}
          {lastReadAyah > 1 && (
            <button
              onClick={() => onReadSurah(currentSurahNum, lastReadAyah)}
              className="px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--gold)] text-[var(--text-main)] font-semibold flex items-center gap-1.5 transition-colors"
            >
              <History className="w-3.5 h-3.5 text-[var(--gold)]" />
              <span>استكمل من الآية {lastReadAyah}</span>
            </button>
          )}

          {/* Listen to Surah */}
          <button
            onClick={() => onPlaySurah(currentSurahNum, selectedReciterId)}
            className="px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--gold)] text-[var(--text-main)] font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>استمع للسورة</span>
          </button>

          {/* Open Tafsir */}
          <button
            onClick={() => onOpenTafsir(currentSurahNum, 1)}
            className="px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--gold)] text-[var(--text-main)] font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-amber-500" />
            <span>افتح التفسير</span>
          </button>
        </div>

        {/* Reciter selector */}
        <div className="flex items-center gap-2">
          <span className="text-[var(--text-muted)]">القارئ:</span>
          <select
            value={selectedReciterId}
            onChange={(e) => onChangeReciter(e.target.value)}
            className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-main)] font-semibold focus:outline-none focus:border-[var(--gold)]"
          >
            {RECITERS.map(r => (
              <option key={r.id} value={r.id}>{r.nameAr}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Body Content Sections */}
      <div className="p-6 overflow-y-auto space-y-6 text-sm">
        {/* Section 1: نظرة عامة ومقاصد السورة */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-[var(--text-main)] flex items-center gap-2">
            <Info className="w-4 h-4 text-[var(--gold)]" />
            <span>نظرة عامة ومقاصد السورة</span>
          </h2>
          <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-main)] leading-relaxed">
            {surahInfo.overviewSummaryAr}
          </div>
        </div>

        {/* Section 2: الموضوعات والمحاور الرئيسية */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-[var(--text-main)] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--gold)]" />
            <span>المحاور الكبرى والأهداف الموضوعية</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {surahInfo.coreObjectivesAr.map((obj, i) => (
              <div 
                key={i}
                className="p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] flex items-start gap-2.5"
              >
                <div className="w-5 h-5 rounded-full bg-[var(--gold)]/20 text-[var(--gold)] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-xs md:text-sm text-[var(--text-main)] leading-relaxed">
                  {obj}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: التقسيم الموضوعي لآيات السورة */}
        {surahInfo.keySections && surahInfo.keySections.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-base font-bold text-[var(--text-main)] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[var(--gold)]" />
              <span>التقسيم الموضوعي للآيات والمحاور</span>
            </h2>
            <div className="space-y-2.5">
              {surahInfo.keySections.map((sec, i) => (
                <div 
                  key={i}
                  className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded bg-[var(--gold)]/15 text-[var(--gold)] font-bold">
                        الآيات {sec.ayahRange}
                      </span>
                      <h4 className="font-bold text-sm text-[var(--text-main)]">{sec.themeTitle}</h4>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      {sec.description}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const startAyah = Number(sec.ayahRange.split('-')[0]) || 1;
                      onReadSurah(currentSurahNum, startAyah);
                    }}
                    className="self-end md:self-center px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--gold)] text-xs text-[var(--gold)] font-bold whitespace-nowrap transition-colors"
                  >
                    اقرأ هذا المقطع
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 4: مفاهيم لغوية وبلاغية مختارة */}
        {surahInfo.linguisticInsights && surahInfo.linguisticInsights.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-base font-bold text-[var(--text-main)] flex items-center gap-2">
              <Compass className="w-4 h-4 text-[var(--gold)]" />
              <span>مفاهيم لغوية وغريب الألفاظ</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {surahInfo.linguisticInsights.map((term, i) => (
                <div 
                  key={i}
                  className="p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-scheherazade text-lg text-[var(--gold)] font-bold">{term.word}</span>
                    <span className="px-2 py-0.5 rounded bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-color)]">
                      جذر: {term.root} • آية {term.ayahNumber}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {term.meaning}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 5: روابط الاستكشاف المتقدم */}
        <div className="pt-4 border-t border-[var(--border-color)] flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            {onOpenThematicIndex && (
              <button
                onClick={() => onOpenThematicIndex(currentSurahNum)}
                className="px-3 py-1.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] hover:border-[var(--gold)] text-[var(--text-main)] font-semibold transition-colors flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5 text-[var(--gold)]" />
                <span>موضوعات السورة في الفهرس</span>
              </button>
            )}

            {onOpenSimilarAyahs && (
              <button
                onClick={() => onOpenSimilarAyahs(currentSurahNum)}
                className="px-3 py-1.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] hover:border-[var(--gold)] text-[var(--text-main)] font-semibold transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>الآيات المتشابهة في السورة</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>المصدر: {surahInfo.sourceAttribution}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
