'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  BookOpen, 
  Share2, 
  Bookmark, 
  BookmarkCheck, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Layers, 
  ExternalLink, 
  Clock, 
  ShieldCheck, 
  Filter, 
  X,
  FileText,
  Compass,
  ArrowRight
} from 'lucide-react';
import { 
  THEMATIC_CATEGORIES, 
  THEMATIC_TOPICS, 
  ThematicTopic, 
  ThematicCategory, 
  searchThematicTopics 
} from '../../data/thematicIndexData';
import { normalizeArabicText } from '../../utils/arabicSearch';
import { localStore } from '../../lib/supabase';
import { libraryManager } from '../../utils/libraryManager';

interface QuranThematicIndexProps {
  isEnglish: boolean;
  onOpenQuranAyah: (surahNumber: number, ayahNumber: number) => void;
  onOpenTafsir?: (surahNumber: number, ayahNumber: number) => void;
  onOpenShareCard?: (content: { title: string; text: string; source: string; category: string }) => void;
  onOpenLearningPath?: (pathId: string) => void;
}

export const QuranThematicIndex: React.FC<QuranThematicIndexProps> = ({
  isEnglish,
  onOpenQuranAyah,
  onOpenTafsir,
  onOpenShareCard,
  onOpenLearningPath
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTopic, setActiveTopic] = useState<ThematicTopic | null>(null);
  const [savedVerses, setSavedVerses] = useState<Record<string, boolean>>({});
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    return localStore.get<string[]>('thematic_recent_searches', ['التوحيد', 'الصبر', 'بر الوالدين']);
  });

  const handleSelectRecent = (term: string) => {
    setSearchQuery(term);
  };

  const handleSaveSearchTerm = (term: string) => {
    if (!term.trim()) return;
    const clean = term.trim();
    const updated = [clean, ...recentSearches.filter(s => s !== clean)].slice(0, 6);
    setRecentSearches(updated);
    localStore.set('thematic_recent_searches', updated);
  };

  const filteredTopics = THEMATIC_TOPICS.filter(topic => {
    const matchesCategory = selectedCategoryId === 'all' || topic.categoryId === selectedCategoryId;
    if (!matchesCategory) return false;

    if (!searchQuery.trim()) return true;

    const normQuery = normalizeArabicText(searchQuery);
    const normTitle = normalizeArabicText(topic.titleAr);
    const normSummary = normalizeArabicText(topic.summaryAr);
    const hasVerseMatch = topic.verses.some(v => 
      normalizeArabicText(v.textAr).includes(normQuery) ||
      normalizeArabicText(v.surahNameAr).includes(normQuery)
    );

    return normTitle.includes(normQuery) || normSummary.includes(normQuery) || hasVerseMatch;
  });

  const handleSaveToLibrary = (topic: ThematicTopic, verseIndex: number) => {
    const verse = topic.verses[verseIndex];
    const key = `${topic.id}-${verse.surahNumber}-${verse.ayahNumber}`;

    libraryManager.saveItem({
      itemType: 'thematic_ayah',
      titleAr: `${topic.titleAr} • سورة ${verse.surahNameAr} [${verse.ayahNumber}]`,
      subtitleAr: `الفهرس الموضوعي: ${THEMATIC_CATEGORIES.find(c => c.id === topic.categoryId)?.nameAr || ''}`,
      bodyAr: verse.textAr,
      referenceAr: `سورة ${verse.surahNameAr}، الآية ${verse.ayahNumber}`,
      collectionId: 'thematic',
      userNote: `ملاحظة تدبرية: ${verse.tafsirSummaryAr}`
    });

    setSavedVerses(prev => ({ ...prev, [key]: true }));
  };

  const handleSharePassage = (topic: ThematicTopic, verseIndex: number) => {
    if (!onOpenShareCard) return;
    const verse = topic.verses[verseIndex];
    onOpenShareCard({
      title: topic.titleAr,
      text: verse.textAr,
      source: `سورة ${verse.surahNameAr} [${verse.ayahNumber}] - ${topic.sourceAttribution}`,
      category: 'الفهرس الموضوعي للقرآن'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--emerald-deep)] to-[var(--bg-card)] border border-[var(--gold)]/20 p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--gold)]/20 border border-[var(--gold)]/40 text-[var(--gold-light)] text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isEnglish ? 'Verified Quranic Thematic Taxonomy' : 'الفهرس الموضوعي المعتمد والمحقق'}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--gold)] mb-2 font-scheherazade">
            {isEnglish ? 'Quran Thematic Index' : 'الفهرس الموضوعي للقرآن الكريم'}
          </h1>
          <p className="text-sm md:text-base text-gray-200 leading-relaxed">
            {isEnglish 
              ? 'Discover Quranic guidance by topic with scholarly-reviewed classifications, original canonical texts, and direct navigation.'
              : 'استكشف هدايات القرآن الكريم حسب الموضوعات الكبرى مع عزو دقيق للمصادر وتفسير موجز وانتقال مباشر للمصحف.'}
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 shadow-sm space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveSearchTerm(searchQuery);
            }}
            placeholder={isEnglish ? 'Search topics, subjects, or keywords...' : 'ابحث في الموضوعات: التوحيد، الصبر، الوالدين، الجنة، الصلاة...'}
            className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg pr-11 pl-10 py-3 text-sm focus:outline-none focus:border-[var(--gold)] text-[var(--text-main)]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && !searchQuery && (
          <div className="flex items-center gap-2 flex-wrap text-xs text-[var(--text-muted)]">
            <Clock className="w-3.5 h-3.5" />
            <span>{isEnglish ? 'Recent Searches:' : 'عمليات البحث الشائعة:'}</span>
            {recentSearches.map(term => (
              <button
                key={term}
                onClick={() => handleSelectRecent(term)}
                className="px-2.5 py-1 rounded-md bg-[var(--bg-main)] border border-[var(--border-color)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        )}

        {/* Category Horizontal Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-semibold">
          <button
            onClick={() => setSelectedCategoryId('all')}
            className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              selectedCategoryId === 'all'
                ? 'bg-[var(--gold)] text-black font-bold shadow-sm'
                : 'bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-color)]'
            }`}
          >
            {isEnglish ? 'All Categories' : 'جميع الأقسام'} ({THEMATIC_TOPICS.length})
          </button>
          {THEMATIC_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                selectedCategoryId === cat.id
                  ? 'bg-[var(--gold)] text-black font-bold shadow-sm'
                  : 'bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-color)]'
              }`}
            >
              {isEnglish ? cat.nameEn : cat.nameAr}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Topic Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTopics.map(topic => {
          const category = THEMATIC_CATEGORIES.find(c => c.id === topic.categoryId);
          return (
            <div
              key={topic.id}
              onClick={() => setActiveTopic(topic)}
              className="bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--gold)]/50 rounded-xl p-5 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs px-2 py-0.5 rounded bg-[var(--gold)]/10 text-[var(--gold)] font-medium">
                    {category ? (isEnglish ? category.nameEn : category.nameAr) : ''}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{isEnglish ? 'Reviewed' : 'مُحقق'}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-[var(--text-main)] group-hover:text-[var(--gold)] transition-colors mb-2">
                  {isEnglish ? topic.titleEn : topic.titleAr}
                </h3>
                <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed mb-4">
                  {topic.summaryAr}
                </p>
              </div>

              <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span>{topic.verses.length} {isEnglish ? 'Quranic Passages' : 'شواهد قرآنية'}</span>
                <span className="inline-flex items-center gap-1 text-[var(--gold)] font-semibold group-hover:translate-x-[-4px] transition-transform">
                  <span>{isEnglish ? 'Explore' : 'تصفح الموضوع'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTopics.length === 0 && (
        <div className="text-center py-12 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)]">
          <BookOpen className="w-12 h-12 mx-auto text-[var(--text-muted)] opacity-50 mb-3" />
          <h3 className="text-base font-bold text-[var(--text-main)] mb-1">
            {isEnglish ? 'No topics found' : 'لم يتم العثور على موضوعات مطابقة'}
          </h3>
          <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
            {isEnglish ? 'Try using general terms like Tawhid, Patience, or Prayer.' : 'جرّب البحث بكلمات عامة مثل: التوحيد، الصبر، العبادات، أو استعرض الأقسام أعلاه.'}
          </p>
        </div>
      )}

      {/* TOPIC DETAIL MODAL / DRAWER */}
      {activeTopic && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-[var(--border-color)] flex items-start justify-between gap-4 bg-[var(--bg-main)]">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--gold)]/15 text-[var(--gold)] font-semibold">
                    {THEMATIC_CATEGORIES.find(c => c.id === activeTopic.categoryId)?.nameAr}
                  </span>
                  <span className="text-[11px] text-emerald-500 flex items-center gap-1 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{activeTopic.classificationType === 'reviewed_scholarly' ? 'تصنيف علمي محقق' : 'تصنيف تحريري'}</span>
                  </span>
                </div>
                <h2 className="text-xl font-bold text-[var(--text-main)] font-scheherazade">
                  {isEnglish ? activeTopic.titleEn : activeTopic.titleAr}
                </h2>
              </div>
              <button
                onClick={() => setActiveTopic(null)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--border-color)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
              {/* Introduction Note */}
              <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
                <p className="text-[var(--text-main)] leading-relaxed mb-3">
                  {activeTopic.summaryAr}
                </p>
                <div className="text-xs text-[var(--text-muted)] flex items-center justify-between border-t border-[var(--border-color)]/60 pt-2">
                  <span>المصدر: {activeTopic.sourceAttribution}</span>
                  <span>المراجع: {activeTopic.reviewerInfo}</span>
                </div>
              </div>

              {/* Verses Section */}
              <div className="space-y-4">
                <h3 className="font-bold text-[var(--gold)] text-base flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>الشواهد والآيات القرآنية ({activeTopic.verses.length})</span>
                </h3>

                {activeTopic.verses.map((verse, idx) => {
                  const saveKey = `${activeTopic.id}-${verse.surahNumber}-${verse.ayahNumber}`;
                  const isSaved = !!savedVerses[saveKey];

                  return (
                    <div 
                      key={idx}
                      className="p-5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-4"
                    >
                      {/* Quranic Text */}
                      <div className="text-right">
                        <div className="flex items-center justify-between text-xs text-[var(--gold)] font-bold mb-2">
                          <span>سورة {verse.surahNameAr} — الآية {verse.ayahNumber} {verse.ayahEnd ? `إلى ${verse.ayahEnd}` : ''}</span>
                        </div>
                        <p className="font-scheherazade text-xl md:text-2xl text-[var(--text-main)] leading-loose text-right">
                          {verse.textAr}
                        </p>
                      </div>

                      {/* Brief Tafsir */}
                      <div className="p-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-muted)] leading-relaxed">
                        <span className="font-bold text-[var(--text-main)] block mb-1">المعنى الإجمالي والتفسير:</span>
                        {verse.tafsirSummaryAr}
                      </div>

                      {/* Action Buttons for this Passage */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-color)]">
                        <button
                          onClick={() => {
                            setActiveTopic(null);
                            onOpenQuranAyah(verse.surahNumber, verse.ayahNumber);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[var(--gold)] text-black font-bold text-xs flex items-center gap-1.5 hover:opacity-90 transition-opacity"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>اقرأ في المصحف</span>
                        </button>

                        {onOpenTafsir && (
                          <button
                            onClick={() => {
                              setActiveTopic(null);
                              onOpenTafsir(verse.surahNumber, verse.ayahNumber);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] hover:border-[var(--gold)] text-xs flex items-center gap-1.5 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>مقارنة التفاسير</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleSaveToLibrary(activeTopic, idx)}
                          className="p-1.5 rounded-lg border border-[var(--border-color)] hover:border-[var(--gold)] text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors"
                          title="حفظ الآية في مكتبتي"
                        >
                          {isSaved ? <BookmarkCheck className="w-4 h-4 text-emerald-500" /> : <Bookmark className="w-4 h-4" />}
                        </button>

                        {onOpenShareCard && (
                          <button
                            onClick={() => handleSharePassage(activeTopic, idx)}
                            className="p-1.5 rounded-lg border border-[var(--border-color)] hover:border-[var(--gold)] text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors"
                            title="مشاركة بطاقة الآية"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Related Learning Path link if available */}
              {activeTopic.relatedLessonId && onOpenLearningPath && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-[var(--emerald-deep)]/20 to-[var(--gold)]/10 border border-[var(--gold)]/30 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-[var(--gold)]">مسار تعليمي مرتبط بهذا الموضوع</h4>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">تابع دراسة هذا المحور عبر المسارات التعليمية الموجهة بأكاديمية وصل</p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTopic(null);
                      onOpenLearningPath(activeTopic.relatedLessonId!);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[var(--gold)] text-black font-bold text-xs"
                  >
                    انتقل للمسار
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
