import React, { useState } from 'react';
import { ShieldCheck, BookOpen, Search, HelpCircle, ChevronDown, ChevronUp, Share2, Check, Clock, Copy } from 'lucide-react';
import { FATWA_CATEGORIES, FATWA_DATA } from '../data/fatwaData';
import { ARTICLES_DATA } from '../data/articlesData';
import { normalizeArabicText } from '../services/quranService';
import { useShareModal } from '../context/ShareContext';
import { useModalScrollLock } from '../hooks/useModalScrollLock';
import { FatwaItem, ArticleItem } from '../types';

export const FatwaArticlesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'fatwa' | 'articles'>('fatwa');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFatwaId, setExpandedFatwaId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);
  const { openShareModal } = useShareModal();

  useModalScrollLock(!!selectedArticle, {
    onClose: () => setSelectedArticle(null),
    closeOnEsc: true,
  });

  const filteredFatwas = FATWA_DATA.filter((f) => {
    const matchesCat = selectedCategory === 'الكل' || f.categoryAr === selectedCategory;
    const norm = normalizeArabicText(searchQuery);
    const matchesSearch =
      !searchQuery.trim() ||
      normalizeArabicText(f.titleAr).includes(norm) ||
      normalizeArabicText(f.questionAr).includes(norm) ||
      normalizeArabicText(f.answerAr).includes(norm);
    return matchesCat && matchesSearch;
  });

  const handleCopyFatwa = (f: FatwaItem) => {
    const text = `سؤال: ${f.questionAr}\n\nجواب: ${f.answerAr}\n\n[المصدر: ${f.scholarOrBodyAr} - ${f.sourceReference}]`;
    navigator.clipboard.writeText(text);
    setCopiedId(f.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 sm:p-6 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              الفتاوى الشرعية والمعرفة الإسلامية
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            إجابات موثقة صادرة عن المجامع الفقهية وهيئات كبار العلماء ودور الإفتاء الرسمية المعتمدة.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-emerald-900/50 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('fatwa')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'fatwa' ? 'bg-white dark:bg-emerald-800 text-emerald-950 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            بنك الفتاوى الموثقة
          </button>
          <button
            onClick={() => setActiveTab('articles')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'articles' ? 'bg-white dark:bg-emerald-800 text-emerald-950 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            المقالات والتوجيهات
          </button>
        </div>
      </div>

      {activeTab === 'fatwa' ? (
        <div className="space-y-4">
          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {FATWA_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-white dark:bg-emerald-950/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-emerald-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في نص الفتوى أو السؤال..."
                className="w-full pr-9 pl-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-slate-200 dark:border-emerald-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Fatwa Cards */}
          <div className="space-y-3">
            {filteredFatwas.map((f) => {
              const isExpanded = expandedFatwaId === f.id;
              return (
                <div
                  key={f.id}
                  className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 border border-slate-200/90 dark:border-emerald-800/40 shadow-xs hover:border-emerald-400 transition-all text-right"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300">
                        {f.categoryAr}
                      </span>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mt-1.5">
                        {f.titleAr}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleCopyFatwa(f)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                        title="نسخ نص الفتوى"
                      >
                        {copiedId === f.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() =>
                          openShareModal({
                            type: 'fatwa',
                            sectionName: 'الفتاوى الشرعية',
                            contentType: 'بيان شرعي',
                            content: f.answerAr.length > 250 ? f.answerAr.slice(0, 240) + '...' : f.answerAr,
                            text: f.answerAr.length > 250 ? f.answerAr.slice(0, 240) + '...' : f.answerAr,
                            source: `${f.scholarOrBodyAr} - ${f.sourceReference}`,
                            title: f.titleAr
                          })
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-800 transition-colors font-medium text-xs"
                        title="مشاركة الفتوى كصورة أو نص"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>مشاركة</span>
                      </button>
                      <button
                        onClick={() => setExpandedFatwaId(isExpanded ? null : f.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-emerald-900"
                        title={isExpanded ? 'طي الفتوى' : 'عرض كامل الفتوى'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Question */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-emerald-900/30 text-xs text-slate-700 dark:text-slate-300 my-2">
                    <strong className="font-bold text-slate-900 dark:text-white block mb-0.5">
                      السؤال:
                    </strong>
                    {f.questionAr}
                  </div>

                  {/* Answer (Preview or Full) */}
                  <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed space-y-2 mt-3">
                    <strong className="font-bold text-emerald-800 dark:text-emerald-300 block">
                      الجواب والبيان الشرعي:
                    </strong>
                    <p className={isExpanded ? '' : 'line-clamp-3'}>
                      {f.answerAr}
                    </p>
                  </div>

                  {/* Source Attribution Box */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-emerald-900/50 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <div>
                      <span>الجهة المفتية: </span>
                      <strong className="text-emerald-800 dark:text-emerald-300">
                        {f.scholarOrBodyAr}
                      </strong>
                    </div>
                    <span>المرجع: {f.sourceReference}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Articles Section */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {ARTICLES_DATA.map((art) => (
            <div
              key={art.id}
              onClick={() => setSelectedArticle(art)}
              className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 border border-slate-200/90 dark:border-emerald-800/40 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all text-right flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                    {art.categoryAr}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{art.readTimeMinutes} دقائق</span>
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-amber-300 transition-colors">
                  {art.titleAr}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2 line-clamp-3">
                  {art.excerptAr}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-emerald-900/50 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>بقلم: {art.authorAr}</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400 group-hover:underline">
                  قراءة المقال ←
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 wasl-modal-overlay animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedArticle(null);
          }}
          onTouchMove={(e) => {
            if (e.target === e.currentTarget) e.preventDefault();
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-white dark:bg-emerald-950 rounded-2xl shadow-2xl border border-emerald-900/20 text-right max-h-[min(88dvh,calc(100dvh-3rem))] overflow-hidden flex flex-col wasl-modal-overlay"
          >
            {/* Modal Header (Sticky Top) */}
            <div className="sticky top-0 z-20 shrink-0 p-5 sm:p-6 border-b border-slate-100 dark:border-emerald-900/60 bg-white/95 dark:bg-emerald-950/95 backdrop-blur-md flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  {selectedArticle.categoryAr} • {selectedArticle.readTimeMinutes} دقائق قراءة
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {selectedArticle.titleAr}
                </h2>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-emerald-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              >
                إغلاق
              </button>
            </div>

            {/* Scrollable Article Body */}
            <div className="p-5 sm:p-8 flex-1 overflow-y-auto wasl-modal-scrollable space-y-4">
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line font-tajawal">
                {selectedArticle.contentAr}
              </p>
            </div>

            {/* Modal Footer (Sticky Bottom) */}
            <div className="sticky bottom-0 z-20 shrink-0 p-4 sm:px-6 border-t border-slate-100 dark:border-emerald-900/60 bg-slate-50/95 dark:bg-emerald-950/95 backdrop-blur-md text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span>الكاتب: {selectedArticle.authorAr}</span>
                <span>•</span>
                <span>تاريخ النشر: {selectedArticle.publishedAt}</span>
              </div>
              <button
                onClick={() =>
                  openShareModal({
                    title: selectedArticle.titleAr,
                    content: selectedArticle.contentAr.slice(0, 300) + '...',
                    source: selectedArticle.authorAr,
                    type: 'article',
                    sectionName: 'فتاوى ومعارف',
                    contentType: 'مقال'
                  })
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>مشاركة كبطاقة</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
