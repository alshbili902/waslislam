'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Layers, 
  Columns, 
  Rows, 
  Copy, 
  Bookmark, 
  PenTool, 
  Share2, 
  CheckCircle2, 
  ShieldCheck, 
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { 
  AVAILABLE_TAFSIR_SOURCES, 
  TAFSIR_COMPARISON_DATA, 
  TafsirSourceInfo 
} from '../../data/tafsirComparisonData';
import { SURAH_LIST } from '../../data/quranMetadata';
import { saveReflectionEntry } from '../../utils/reflectionJournalManager';

interface TafsirComparisonWorkspaceProps {
  isEnglish: boolean;
  initialSurah?: number;
  initialAyah?: number;
  onOpenQuranToAyah?: (surah: number, ayah: number) => void;
  onOpenShareCard?: (content: { title: string; text: string; source: string; category: string }) => void;
  onOpenReflectionJournal?: (surah: number, ayah: number) => void;
}

export const TafsirComparisonWorkspace: React.FC<TafsirComparisonWorkspaceProps> = ({
  isEnglish,
  initialSurah = 1,
  initialAyah = 5,
  onOpenQuranToAyah,
  onOpenShareCard,
  onOpenReflectionJournal
}) => {
  const [selectedSurah, setSelectedSurah] = useState<number>(initialSurah);
  const [selectedAyah, setSelectedAyah] = useState<number>(initialAyah);
  const [activeSources, setActiveSources] = useState<string[]>(['muyassar', 'ibn_kathir', 'saadi']);
  const [layoutMode, setLayoutMode] = useState<'side-by-side' | 'stacked'>('side-by-side');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Reflection Note State
  const [personalNote, setPersonalNote] = useState('');
  const [noteSavedFeedback, setNoteSavedFeedback] = useState(false);

  // Find record in dataset or provide verified default
  const record = TAFSIR_COMPARISON_DATA.find(r => r.surahNumber === selectedSurah && r.ayahNumber === selectedAyah) || TAFSIR_COMPARISON_DATA[0];
  const curSurahMeta = SURAH_LIST.find(s => s.number === selectedSurah) || SURAH_LIST[0];

  const toggleSource = (sourceId: string) => {
    if (activeSources.includes(sourceId)) {
      if (activeSources.length > 1) {
        setActiveSources(activeSources.filter(id => id !== sourceId));
      }
    } else {
      setActiveSources([...activeSources, sourceId]);
    }
  };

  const handleCopyTafsir = (sourceInfo: TafsirSourceInfo, text: string, ref?: string) => {
    const citation = `【${sourceInfo.nameAr}】\nسورة ${curSurahMeta.name} [الآية: ${record.ayahNumber}]\n"${text}"\nالمرجع: ${ref || sourceInfo.institutionAr}\nعبر منصة وَصْل الإسلامية`;
    navigator.clipboard.writeText(citation).then(() => {
      setCopiedId(sourceInfo.id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  const handleSaveReflection = () => {
    if (!personalNote.trim()) return;
    saveReflectionEntry({
      surahNumber: selectedSurah,
      surahName: curSurahMeta.name,
      ayahNumber: record.ayahNumber,
      ayahText: record.ayahText,
      tafsirSource: 'مختبر مقارنة التفاسير',
      tafsirText: `مقارنة بين: ${activeSources.map(s => AVAILABLE_TAFSIR_SOURCES.find(a => a.id === s)?.nameAr).join(' و ')}`,
      title: `تدبر مقارن في سورة ${curSurahMeta.name} (آية ${record.ayahNumber})`,
      notes: personalNote.trim(),
      tags: ['مقارنة_تفاسير', curSurahMeta.name, 'تدبر'],
      collectionId: 'default',
      isPinned: false
    });
    setNoteSavedFeedback(true);
    setTimeout(() => setNoteSavedFeedback(false), 3000);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header Banner */}
      <section className="bg-[var(--bg-card)] border border-[var(--border-gold)] rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--gold-light)] text-[var(--gold)] text-xs font-bold mb-3">
              <Layers className="w-3.5 h-3.5" />
              <span>مختبر مقارنة التفاسير والتدبر المعمق</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-main)] font-cairo">
              {isEnglish ? 'Tafsir Comparison Workspace' : 'مختبر تدبر الآيات ومقارنة التفاسير'}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1.5 leading-relaxed max-w-2xl">
              اقرأ الآية الكريمة وقارن بين أقوال أئمة التفسير المعتمدين (الميسر، ابن كثير، السعدي، القرطبي، الجلالين) جنباً إلى جنب مع حفظ ملاحظاتك وتدبراتك الشخصية.
            </p>
          </div>

          {/* Layout Mode Switcher */}
          <div className="flex items-center gap-2 bg-[var(--bg-card-subtle)] p-1.5 rounded-2xl border border-[var(--border-color)]">
            <button
              onClick={() => setLayoutMode('side-by-side')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                layoutMode === 'side-by-side'
                  ? 'bg-[var(--primary)] text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">مقارنة متجاورة</span>
            </button>
            <button
              onClick={() => setLayoutMode('stacked')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                layoutMode === 'stacked'
                  ? 'bg-[var(--primary)] text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <Rows className="w-3.5 h-3.5" />
              <span>قائمة رأسية</span>
            </button>
          </div>
        </div>

        {/* Surah & Ayah Selectors */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[var(--text-main)] mb-1.5">
              اختر السورة الكريمة:
            </label>
            <select
              value={selectedSurah}
              onChange={e => {
                const sNum = parseInt(e.target.value);
                setSelectedSurah(sNum);
                setSelectedAyah(sNum === 1 ? 5 : 255);
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
            >
              {SURAH_LIST.slice(0, 2).map(s => (
                <option key={s.number} value={s.number}>
                  سورة {s.name} ({s.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} - {s.numberOfAyahs} آية)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-main)] mb-1.5">
              اختر الآية الكريمة للمقارنة:
            </label>
            <select
              value={selectedAyah}
              onChange={e => setSelectedAyah(parseInt(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
            >
              {selectedSurah === 1 ? (
                <option value={5}>الآية 5: {`{إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ}`}</option>
              ) : (
                <option value={255}>الآية 255: {`{اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ}`}</option>
              )}
            </select>
          </div>
        </div>

        {/* Active Sources Toggle Filter */}
        <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
          <span className="text-xs font-bold text-[var(--text-muted)] block mb-2">
            حدد كتب التفسير المقارنة (اختر للتفعيل أو الإلغاء):
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {AVAILABLE_TAFSIR_SOURCES.map(source => {
              const active = activeSources.includes(source.id);
              return (
                <button
                  key={source.id}
                  onClick={() => toggleSource(source.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-[var(--gold-light)] text-[var(--gold)] border border-[var(--border-gold)] shadow-sm'
                      : 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)] border border-[var(--border-color)] opacity-60'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${active ? 'bg-[var(--gold)]' : 'bg-gray-400'}`} />
                  <span>{source.nameAr}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Prominent Canonical Quran Verse Display */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-gold)] text-center shadow-sm space-y-3">
        <span className="text-xs text-[var(--gold)] font-bold font-tajawal">
          النص القرآني الشريف • سورة {curSurahMeta.name} [الآية {record.ayahNumber}]
        </span>
        <div className="text-2xl sm:text-3xl lg:text-4xl font-bold font-quran text-[var(--text-main)] leading-relaxed py-2">
          ﴿{record.ayahText}﴾
        </div>
        <div className="pt-2 flex justify-center">
          {onOpenQuranToAyah && (
            <button
              onClick={() => onOpenQuranToAyah(selectedSurah, record.ayahNumber)}
              className="px-4 py-1.5 rounded-xl bg-[var(--bg-card-subtle)] text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1 border border-[var(--border-color)]"
            >
              <span>فتح الآية في المصحف الشريف</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </section>

      {/* Comparison Grid / Stacked Area */}
      <section className={`grid gap-4 ${
        layoutMode === 'side-by-side' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
      }`}>
        {activeSources.map(sourceId => {
          const sourceInfo = AVAILABLE_TAFSIR_SOURCES.find(s => s.id === sourceId);
          const tafsirEntry = record.tafsirs[sourceId];
          if (!sourceInfo || !tafsirEntry) return null;

          const isCopied = copiedId === sourceInfo.id;

          return (
            <div
              key={sourceId}
              className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-4 flex flex-col justify-between hover:border-[var(--gold)] transition-colors"
            >
              <div>
                {/* Source Header */}
                <div className="pb-3 border-b border-[var(--border-color)] flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-main)] font-cairo">
                      {sourceInfo.nameAr}
                    </h3>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      {sourceInfo.authorAr}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold shrink-0">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>معتمد</span>
                  </span>
                </div>

                {/* Scholarly Focus Badge */}
                <div className="my-3 px-3 py-1.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[11px] text-[var(--gold)] font-bold">
                  المنهج: {tafsirEntry.scholarlyFocusAr}
                </div>

                {/* Explanatory Text */}
                <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]/60 text-right">
                  <p className="text-sm sm:text-base font-amiri leading-loose font-bold text-[var(--text-main)]">
                    {tafsirEntry.textAr}
                  </p>
                </div>
              </div>

              {/* Card Footer: Reference & Actions */}
              <div className="pt-3 border-t border-[var(--border-color)] space-y-3">
                <div className="text-[11px] text-[var(--text-muted)] font-mono">
                  {tafsirEntry.volumePageRef || sourceInfo.institutionAr}
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleCopyTafsir(sourceInfo, tafsirEntry.textAr, tafsirEntry.volumePageRef)}
                    className="px-3 py-1.5 rounded-xl bg-[var(--bg-card-subtle)] text-[var(--text-main)] text-xs font-bold border border-[var(--border-color)] hover:border-[var(--gold)] flex items-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{isCopied ? 'تم النسخ!' : 'نسخ التفسير'}</span>
                  </button>

                  {onOpenShareCard && (
                    <button
                      onClick={() => onOpenShareCard({
                        title: `${sourceInfo.nameAr}: سورة ${curSurahMeta.name} [${record.ayahNumber}]`,
                        text: tafsirEntry.textAr,
                        source: `${sourceInfo.nameAr} (${tafsirEntry.volumePageRef || sourceInfo.institutionAr})`,
                        category: 'مقارنة التفاسير'
                      })}
                      className="p-1.5 rounded-xl text-[var(--gold)] hover:bg-[var(--gold-light)] transition-colors"
                      title="مشاركة كبطاقة"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Personal Research & Reflection Workspace */}
      <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <PenTool className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-[var(--text-main)] font-cairo">
              تدوين خواطرك وملاحظاتك المقارنة (دفتر التدبر)
            </h3>
          </div>
          {noteSavedFeedback && (
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 animate-fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>تم الحفظ في دفتر التدبر الشخصي!</span>
            </span>
          )}
        </div>

        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          دوّن ما فتح الله به عليك من معانٍ وهدايات أثناء قراءة التفاسير المقارنة، وتُحفظ ملاحظاتك بشكل خاص في دفتر تدبرك الشخصي.
        </p>

        <textarea
          rows={3}
          value={personalNote}
          onChange={e => setPersonalNote(e.target.value)}
          placeholder="اكتب خواطرك الإيمانية هنا (مثلاً: لاحظت اتفاق ابن كثير والسعدي على تقديم العبادة على الاستعانة لبيان الغاية والوسيلة...)"
          className="w-full p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-colors"
        />

        <div className="flex justify-end">
          <button
            onClick={handleSaveReflection}
            disabled={!personalNote.trim()}
            className="px-6 py-2.5 rounded-xl bg-[var(--primary)] text-white text-xs font-bold hover:bg-[var(--primary-dark)] transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            <Bookmark className="w-4 h-4" />
            <span>حفظ الخاطرة في دفتر التدبر</span>
          </button>
        </div>
      </section>
    </div>
  );
};
