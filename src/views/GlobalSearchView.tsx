import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  BookOpen,
  ScrollText,
  Sparkles,
  Heart,
  Lightbulb,
  Award,
  Compass,
  MapPin,
  Library,
  Calendar,
  X,
  Clock,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Filter,
  Tv
} from 'lucide-react';
import {
  performGlobalSearch,
  getRecentSearches,
  addRecentSearch,
  removeRecentSearch,
  clearRecentSearches,
  SEARCH_DOMAINS
} from '../services/searchService';
import { GlobalSearchResult, SearchDomain } from '../types';

interface GlobalSearchViewProps {
  onSelectTab: (tab: string, id?: any) => void;
  initialQuery?: string;
}

export const GlobalSearchView: React.FC<GlobalSearchViewProps> = ({
  onSelectTab,
  initialQuery = ''
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedDomain, setSelectedDomain] = useState<SearchDomain | 'all'>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Perform search
  const { results, groupedCounts, totalCount } = useMemo(() => {
    return performGlobalSearch(
      query,
      selectedDomain === 'all' ? undefined : selectedDomain
    );
  }, [query, selectedDomain]);

  const handleSearchSubmit = (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;
    setQuery(trimmed);
    addRecentSearch(trimmed);
    setRecentSearches(getRecentSearches());
  };

  const handleResultClick = (res: GlobalSearchResult) => {
    if (query.trim()) {
      addRecentSearch(query.trim());
      setRecentSearches(getRecentSearches());
    }
    onSelectTab(res.targetTab, res.targetId);
  };

  const handleRemoveRecent = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    removeRecentSearch(term);
    setRecentSearches(getRecentSearches());
  };

  const handleClearAllRecent = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  const domainIconMap: Record<SearchDomain, any> = {
    quran: BookOpen,
    hadith: ScrollText,
    azkar: Sparkles,
    dua: Heart,
    wisdom: Lightbulb,
    allah_name: Award,
    seerah: Compass,
    hajj_umrah: MapPin,
    library: Library,
    events: Calendar,
    channels: Tv
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Top Search Hero Box */}
      <div className="bg-white dark:bg-emerald-950/80 rounded-3xl p-6 sm:p-8 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-2">
            <Search className="w-3.5 h-3.5" />
            <span>البحث الشامل والموحد</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-amiri text-slate-900 dark:text-white">
            ابحث في وصل الإسلامية
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            محرك بحث شرعي موحد يبحث فورياً في القرآن، الأحاديث، الأذكار، الأدعية، الحِكَم، أسماء الله الحسنى، السيرة النبوية، الحج والعمرة، والمكتبة الإسلامية.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative z-10">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-emerald-600 dark:text-emerald-400 absolute right-4 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearchSubmit(query);
              }}
              placeholder="ابحث في القرآن، السنة، الأذكار، السيرة، والمكتبة..."
              autoFocus
              className="w-full pl-12 pr-12 py-3.5 sm:py-4 rounded-2xl bg-slate-50 dark:bg-emerald-900/40 border border-slate-200 dark:border-emerald-700/60 text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-inner"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute left-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Recent Searches / Fast Suggestions */}
        {!query && recentSearches.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-emerald-900/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>عمليات البحث الأخيرة:</span>
              </span>
              <button
                onClick={handleClearAllRecent}
                className="text-[11px] text-slate-400 hover:text-rose-500 transition-colors"
              >
                مسح السجل
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => handleSearchSubmit(term)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/60 text-xs text-slate-700 dark:text-slate-200 transition-colors border border-slate-200/50 dark:border-emerald-800/40 group"
                >
                  <span>{term}</span>
                  <span
                    onClick={(e) => handleRemoveRecent(e, term)}
                    className="opacity-40 group-hover:opacity-100 hover:text-rose-500 transition-opacity ml-1"
                  >
                    ×
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Domain Filter Pills */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-emerald-900/60 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedDomain('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              selectedDomain === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-emerald-900/30 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <span>جميع الأقسام</span>
            {query && (
              <span className="text-[10px] opacity-80 font-mono">({totalCount})</span>
            )}
          </button>

          {SEARCH_DOMAINS.map(({ domain, labelAr, icon: IconComp }) => {
            const count = groupedCounts[domain] || 0;
            return (
              <button
                key={domain}
                onClick={() => setSelectedDomain(domain)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  selectedDomain === domain
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-emerald-900/30 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <span>{labelAr}</span>
                {query && (
                  <span className="text-[10px] opacity-80 font-mono">({count})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header */}
      {query && (
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2">
          <span>
            نتائج البحث عن: <strong className="text-slate-900 dark:text-white">"{query}"</strong>
          </span>
          <span className="font-bold text-emerald-700 dark:text-emerald-300">
            {totalCount} نتيجة
          </span>
        </div>
      )}

      {/* Results List Grouped or Flat */}
      {query && results.length > 0 && (
        <div className="space-y-3">
          {results.map((res) => {
            const IconComponent = domainIconMap[res.domain] || BookOpen;

            return (
              <div
                key={res.id}
                onClick={() => handleResultClick(res)}
                className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 border border-emerald-900/10 dark:border-emerald-800/50 shadow-xs hover:shadow-md transition-all hover:border-emerald-500/60 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-3.5 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    <IconComponent className="w-5 h-5" />
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                        {res.domainLabelAr}
                      </span>
                      {res.badge && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-emerald-900/20 text-slate-600 dark:text-slate-300">
                          {res.badge}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold font-amiri text-slate-900 dark:text-amber-300 group-hover:text-emerald-700 dark:group-hover:text-amber-200 transition-colors">
                      {res.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                      {res.snippet}
                    </p>

                    {res.source && (
                      <div className="text-[11px] text-slate-400 pt-1 flex items-center gap-1">
                        <span>المصدر: {res.source}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="self-end sm:self-center shrink-0">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1 group-hover:-translate-x-1 transition-transform">
                    <span>عرض المحتوى</span>
                    <ChevronLeft className="w-4 h-4" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State when no matches */}
      {query && results.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-emerald-950/40 rounded-2xl border border-dashed border-slate-300 dark:border-emerald-800">
          <Search className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <h3 className="font-bold text-slate-700 dark:text-slate-200">
            لم نجد نتائج مطابقة لبحثك عن "{query}"
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            تأكد من كتابة الكلمات بدقة، أو جرب مصطلحات عامة مثل: الصبر، التقوى، الإحسان، الفاتحة، مكة.
          </p>
        </div>
      )}

      {/* Suggested Quick Searches when idle */}
      {!query && (
        <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-6 border border-emerald-900/10 dark:border-emerald-800/50 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>موضوعات شائعة مقترحة للبحث السريع</span>
          </h3>

          <div className="flex flex-wrap gap-2 text-xs">
            {[
              'سورة الكهف',
              'أذكار الصباح والمساء',
              'سيد الاستغفار',
              'الرحمن الرحيم',
              'غزوة بدر الكبرى',
              'مناسك العمرة',
              'دعاء يوم عرفة',
              'الأربعون النووية',
              'الصبر عند البلاء',
              'التوبة والاستغفار'
            ].map((topic) => (
              <button
                key={topic}
                onClick={() => handleSearchSubmit(topic)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-emerald-900/30 hover:bg-emerald-50 dark:hover:bg-emerald-900/60 text-slate-700 dark:text-slate-300 font-medium transition-colors border border-slate-200/60 dark:border-emerald-800/40"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
