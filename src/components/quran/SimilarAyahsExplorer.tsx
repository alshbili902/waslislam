'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  BookOpen, 
  FileText, 
  Bookmark, 
  BookmarkCheck, 
  Share2, 
  ShieldCheck, 
  Info, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  CURATED_SIMILAR_GROUPS, 
  SimilarAyahGroup, 
  SimilarAyahItem, 
  SimilarityCategory 
} from '../../data/similarAyahsData';
import { 
  alignAndDiffAyahs, 
  searchSimilarGroups, 
  findSimilarGroupsForAyah 
} from '../../utils/similarAyahsEngine';
import { SURAH_LIST } from '../../data/quranMetadata';
import { libraryManager } from '../../utils/libraryManager';

interface SimilarAyahsExplorerProps {
  initialSurahNumber?: number;
  initialAyahNumber?: number;
  onOpenQuranAyah: (surahNumber: number, ayahNumber: number) => void;
  onOpenTafsir?: (surahNumber: number, ayahNumber: number) => void;
  onOpenShareCard?: (content: { title: string; text: string; source: string; category: string }) => void;
  isEnglish: boolean;
}

export const SimilarAyahsExplorer: React.FC<SimilarAyahsExplorerProps> = ({
  initialSurahNumber,
  initialAyahNumber,
  onOpenQuranAyah,
  onOpenTafsir,
  onOpenShareCard,
  isEnglish
}) => {
  const [selectedSurah, setSelectedSurah] = useState<number | 'all'>(initialSurahNumber || 'all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeGroup, setActiveGroup] = useState<SimilarAyahGroup | null>(() => {
    if (initialSurahNumber) {
      const found = findSimilarGroupsForAyah(initialSurahNumber, initialAyahNumber);
      return found.length > 0 ? found[0] : CURATED_SIMILAR_GROUPS[0];
    }
    return CURATED_SIMILAR_GROUPS[0];
  });
  const [savedItems, setSavedItems] = useState<Record<string, boolean>>({});

  const filteredGroups = CURATED_SIMILAR_GROUPS.filter(group => {
    // Surah filter
    if (selectedSurah !== 'all') {
      const hasSurah = group.ayahs.some(a => a.surahNumber === selectedSurah);
      if (!hasSurah) return false;
    }

    // Category filter
    if (selectedCategory !== 'all' && group.category !== selectedCategory) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.trim();
      const inTitle = group.titleAr.includes(q);
      const inAnalysis = group.scholarlyAnalysisAr.includes(q);
      const inAyah = group.ayahs.some(a => a.textAr.includes(q) || a.surahNameAr.includes(q));
      if (!inTitle && !inAnalysis && !inAyah) return false;
    }

    return true;
  });

  const handleSaveToLibrary = (group: SimilarAyahGroup) => {
    libraryManager.saveItem({
      itemType: 'similar_ayahs_study',
      titleAr: `دراسة متشابهات: ${group.titleAr}`,
      subtitleAr: group.categoryNameAr,
      bodyAr: group.ayahs.map(a => `[سورة ${a.surahNameAr} : ${a.ayahNumber}]\n${a.textAr}`).join('\n\n'),
      referenceAr: `${group.sourceAttribution}`,
      collectionId: 'mutashabihat',
      userNote: `التوجيه البلاغي: ${group.scholarlyAnalysisAr}`
    });
    setSavedItems(prev => ({ ...prev, [group.id]: true }));
  };

  const handleShareGroup = (group: SimilarAyahGroup) => {
    if (!onOpenShareCard) return;
    const textFormatted = group.ayahs
      .map(a => `﴿${a.textAr}﴾ [${a.surahNameAr}:${a.ayahNumber}]`)
      .join('\n\n') + `\n\nالتوجيه البلاغي:\n${group.scholarlyAnalysisAr}`;

    onOpenShareCard({
      title: `متشابهات قرآنية — ${group.titleAr}`,
      text: textFormatted,
      source: `${group.sourceAttribution} • وصل الإسلامية`,
      category: 'مستكشف المتشابهات'
    });
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1b3a2b] via-[var(--bg-card)] to-[#152e22] border border-[var(--gold)]/20 p-6 md:p-8 text-white shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--gold)]/20 border border-[var(--gold)]/40 text-[var(--gold-light)] text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isEnglish ? 'Curated Quranic Mutashabihat' : 'علم متشابهات القرآن والتوجيه البلاغي'}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--gold)] mb-2 font-scheherazade">
            {isEnglish ? 'Similar Ayahs Explorer' : 'مستكشف الآيات المتشابهة'}
          </h1>
          <p className="text-sm md:text-base text-gray-200 leading-relaxed">
            {isEnglish 
              ? 'Compare similar Quranic passages, discover subtle word variations, and explore classical rhetorical analyses with token-level highlighting.'
              : 'أداة دراسية متقدمة لمعرفة الفروق الدقيقة بين الآيات المتشابهة لفظياً وتوجيهها البلاغي المعتمد لدى أئمة التفسير.'}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Text Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بلفظ الآية أو عنوان المتشابه..."
              className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg pr-9 pl-4 py-2 text-xs focus:outline-none focus:border-[var(--gold)] text-[var(--text-main)]"
            />
          </div>

          {/* Surah Filter */}
          <div>
            <select
              value={selectedSurah}
              onChange={(e) => setSelectedSurah(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs text-[var(--text-main)] font-semibold focus:outline-none focus:border-[var(--gold)]"
            >
              <option value="all">جميع السور ({SURAH_LIST.length})</option>
              {SURAH_LIST.map(s => (
                <option key={s.number} value={s.number}>
                  {s.number}. سورة {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs text-[var(--text-main)] font-semibold focus:outline-none focus:border-[var(--gold)]"
            >
              <option value="all">جميع أنماط التشابه</option>
              <option value="word_difference">اختلاف بعض الكلمات</option>
              <option value="verbal_mutashabih">متشابهات لفظية</option>
              <option value="repeated_phrase">عبارات قرآنية متكررة</option>
              <option value="structural_syntax">تراكيب نحوية وبلاغية</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Layout: Master-Detail Comparison View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Groups List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="text-xs font-bold text-[var(--text-muted)] px-1 flex items-center justify-between">
            <span>مجموعات المتشابهات المتاحة</span>
            <span className="px-2 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-color)]">
              {filteredGroups.length}
            </span>
          </div>

          <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
            {filteredGroups.map(group => {
              const isSelected = activeGroup?.id === group.id;
              return (
                <div
                  key={group.id}
                  onClick={() => setActiveGroup(group)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[var(--gold)]/10 border-[var(--gold)] shadow-sm'
                      : 'bg-[var(--bg-card)] border-[var(--border-color)] hover:border-[var(--gold)]/40'
                  }`}
                >
                  <span className="text-[11px] px-2 py-0.5 rounded bg-[var(--gold)]/15 text-[var(--gold)] font-medium inline-block mb-1.5">
                    {group.categoryNameAr}
                  </span>
                  <h3 className="font-bold text-xs text-[var(--text-main)] mb-1.5 leading-snug">
                    {group.titleAr}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                    {group.ayahs.map((a, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-[var(--bg-main)] border border-[var(--border-color)]">
                        {a.surahNameAr} [{a.ayahNumber}]
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}

            {filteredGroups.length === 0 && (
              <div className="text-center py-8 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-4">
                <p className="text-xs text-[var(--text-muted)]">لا توجد مواضع مطابقة لخيارات التصفية المحددة.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Active Group Comparative Workspace */}
        <div className="lg:col-span-2">
          {activeGroup ? (
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-md space-y-6">
              {/* Workspace Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-4">
                <div>
                  <div className="flex items-center gap-2 text-xs mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-[var(--gold)]/20 text-[var(--gold)] font-bold">
                      {activeGroup.categoryNameAr}
                    </span>
                    <span className="text-emerald-500 font-semibold flex items-center gap-1 text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>محققة وموثقة علمياً</span>
                    </span>
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-[var(--text-main)]">
                    {activeGroup.titleAr}
                  </h2>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                  <button
                    onClick={() => handleSaveToLibrary(activeGroup)}
                    className="p-2 rounded-lg border border-[var(--border-color)] hover:border-[var(--gold)] text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors"
                    title="حفظ المقارنة في مكتبتي"
                  >
                    {savedItems[activeGroup.id] ? <BookmarkCheck className="w-4 h-4 text-emerald-500" /> : <Bookmark className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleShareGroup(activeGroup)}
                    className="p-2 rounded-lg border border-[var(--border-color)] hover:border-[var(--gold)] text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors"
                    title="مشاركة المقارنة"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Side-by-Side or Stacked Verses Display */}
              <div className="space-y-4">
                <h3 className="font-bold text-xs text-[var(--gold)] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>المواضع القرآنية مع إبراز الفروق اللفظية:</span>
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  {activeGroup.ayahs.map((ayahItem, idx) => {
                    // Align and highlight against other ayah in pair
                    const comparisonReference = activeGroup.ayahs[idx === 0 ? 1 : 0]?.textAr || '';
                    const tokens = alignAndDiffAyahs(ayahItem.textAr, comparisonReference);

                    return (
                      <div
                        key={idx}
                        className="p-5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-3"
                      >
                        {/* Surah Ref and Quick Actions */}
                        <div className="flex items-center justify-between text-xs border-b border-[var(--border-color)]/60 pb-2">
                          <span className="font-bold text-[var(--gold)]">
                            الموضع {idx + 1}: سورة {ayahItem.surahNameAr} — الآية {ayahItem.ayahNumber}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onOpenQuranAyah(ayahItem.surahNumber, ayahItem.ayahNumber)}
                              className="px-2.5 py-1 rounded bg-[var(--gold)] text-black font-bold text-[11px] flex items-center gap-1 hover:opacity-90"
                            >
                              <BookOpen className="w-3 h-3" />
                              <span>المصحف</span>
                            </button>
                            {onOpenTafsir && (
                              <button
                                onClick={() => onOpenTafsir(ayahItem.surahNumber, ayahItem.ayahNumber)}
                                className="px-2.5 py-1 rounded bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] text-[11px] flex items-center gap-1 hover:border-[var(--gold)]"
                              >
                                <FileText className="w-3 h-3" />
                                <span>التفسير</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Verse Text with Colored Diff Tokens */}
                        <div className="text-right py-2">
                          <p className="font-scheherazade text-xl md:text-2xl leading-loose text-[var(--text-main)]">
                            {tokens.map((tok, tIdx) => (
                              <span
                                key={tIdx}
                                className={`inline-block mx-0.5 transition-all ${
                                  tok.isDiff 
                                    ? 'bg-amber-500/20 text-amber-500 dark:text-amber-300 font-bold px-1.5 py-0.5 rounded-md border border-amber-500/30' 
                                    : ''
                                }`}
                              >
                                {tok.text}
                              </span>
                            ))}
                          </p>
                        </div>

                        {/* Note on this specific verse */}
                        <div className="text-xs text-[var(--text-muted)] bg-[var(--bg-card)] p-2.5 rounded-lg border border-[var(--border-color)]/60">
                          <span className="font-bold text-[var(--text-main)]">ملاحظة الموضع: </span>
                          {ayahItem.tafsirNoteAr}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Scholarly Analysis Box */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--emerald-deep)]/10 to-[var(--gold)]/10 border border-[var(--gold)]/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--gold)]">
                  <Info className="w-4 h-4" />
                  <span>التوجيه البلاغي والتحليل العلمي لسر الاختلاف</span>
                </div>
                <p className="text-xs md:text-sm text-[var(--text-main)] leading-relaxed">
                  {activeGroup.scholarlyAnalysisAr}
                </p>
                <div className="pt-2 border-t border-[var(--border-color)]/40 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                  <span>المصدر: {activeGroup.sourceAttribution}</span>
                  <span>المراجع: {activeGroup.reviewerInfo}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)]">
              <Sparkles className="w-12 h-12 mx-auto text-[var(--text-muted)] opacity-50 mb-3" />
              <p className="text-sm font-bold text-[var(--text-main)]">اختر موضعاً من القائمة لعرض المقارنة التفاعلية</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
