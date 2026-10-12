'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  Copy, 
  Bookmark, 
  Share2, 
  ExternalLink, 
  AlertCircle, 
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  BookCheck,
  Layers
} from 'lucide-react';
import { 
  KnowledgeSearchEngine, 
  KnowledgeResult, 
  KnowledgeContentType, 
  SearchQueryResponse 
} from '../../utils/knowledgeSearchEngine';
import { libraryManager } from '../../utils/libraryManager';

interface IslamicKnowledgeSearchProps {
  isEnglish: boolean;
  onOpenShareCard?: (content: { title: string; text: string; source: string; category: string }) => void;
  onOpenQuranToSurah?: (surah: number) => void;
}

const PRESET_QUERIES = [
  'ما معنى إياك نعبد وإياك نستعين؟',
  'ما مصدر حديث إنما الأعمال بالنيات؟',
  'ما حكم زكاة الأسهم الاستثمارية؟',
  'ما وقت صلاة الوتر وصفتها؟',
  'ما تفسير آية الكرسي؟',
  'ما أثر بخاخ الربو على الصيام؟'
];

export const IslamicKnowledgeSearch: React.FC<IslamicKnowledgeSearchProps> = ({
  isEnglish,
  onOpenShareCard,
  onOpenQuranToSurah
}) => {
  const [queryInput, setQueryInput] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | KnowledgeContentType>('all');
  const [searchResponse, setSearchResponse] = useState<SearchQueryResponse | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const handleSearch = (textToSearch?: string) => {
    const q = textToSearch !== undefined ? textToSearch : queryInput;
    if (!q.trim()) return;
    const res = KnowledgeSearchEngine.search(q, activeFilter);
    setSearchResponse(res);
  };

  const handleFilterChange = (filter: 'all' | KnowledgeContentType) => {
    setActiveFilter(filter);
    if (queryInput.trim()) {
      const res = KnowledgeSearchEngine.search(queryInput, filter);
      setSearchResponse(res);
    }
  };

  const handleCopyCitation = (res: KnowledgeResult) => {
    const citation = `【${res.title}】\n"${res.quoteText}"\nالمصدر: ${res.sourceInstitution} (${res.referenceId})\nعبر منصة وَصْل الإسلامية`;
    navigator.clipboard.writeText(citation).then(() => {
      setCopiedId(res.id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  const handleSaveToLibrary = (res: KnowledgeResult) => {
    libraryManager.saveItem({
      title: res.title,
      text: res.quoteText,
      source: `${res.sourceInstitution} • ${res.referenceId}`,
      category: res.type === 'hadith' ? 'hadith' : res.type === 'quran' ? 'quran' : 'tafsir',
      notes: res.scholarlyNote
    });
    setSavedIds(prev => [...prev, res.id]);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header Banner */}
      <section className="bg-[var(--bg-card)] border border-[var(--border-gold)] rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--gold-light)] text-[var(--gold)] text-xs font-bold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>محرك البحث الإسنادي والمصادر المعتمدة</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-main)] font-cairo">
            {isEnglish ? 'Source-Grounded Islamic Search' : 'اسأل المصادر الإسلامية'}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-2 leading-relaxed">
            {isEnglish
              ? 'Evidence-based discovery linking your questions directly to verified Quran texts, authentic Hadiths, and recognized Fatwa councils without speculation or generative hallucination.'
              : 'منظومة بحث إسنادية ترتكز حصراً على المصادر المعتمدة الموثقة (القرآن العظيم، صحيح السنة النبوية، تفاسير أئمة السلف، وقرارات المجامع الفقهية وهيئة كبار العلماء) وتلتزم الصدق بعدم اختلاق أي حكم ديني.'}
          </p>
        </div>

        {/* Search Input Box */}
        <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              value={queryInput}
              onChange={e => setQueryInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="اكتب سؤالك أو مسألتك الشرعية (مثال: ما معنى هذه الآية، ما حكم زكاة الأسهم...)"
              className="w-full pr-11 pl-4 py-3.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-main)] text-sm font-semibold placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
            <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          </div>

          <button
            onClick={() => handleSearch()}
            className="py-3.5 px-7 rounded-2xl bg-[var(--primary)] text-white text-xs font-bold hover:bg-[var(--primary-dark)] transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <span>بحث في المصادر</span>
          </button>
        </div>

        {/* Preset Query Chips */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] text-[var(--text-muted)] shrink-0 font-bold">جرّب البحث:</span>
          {PRESET_QUERIES.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQueryInput(q);
                handleSearch(q);
              }}
              className="text-[11px] px-3 py-1.5 rounded-xl bg-[var(--bg-card-subtle)] text-[var(--text-main)] hover:border-[var(--gold)] border border-[var(--border-color)] whitespace-nowrap transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'جميع المصادر المعتمدة' },
          { id: 'quran', label: 'القرآن الكريم' },
          { id: 'hadith', label: 'الحديث النبوي الشريف' },
          { id: 'tafsir', label: 'التفاسير المعتمدة' },
          { id: 'fatwa', label: 'الفتاوى والقرارات المجمعية' },
          { id: 'dua', label: 'الأذكار والأدعية' },
        ].map(f => {
          const active = activeFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => handleFilterChange(f.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                active
                  ? 'bg-[var(--primary)] text-white shadow-sm'
                  : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-color)] hover:text-[var(--text-main)]'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Results View */}
      {searchResponse && (
        <div className="space-y-4">
          {searchResponse.hasResults ? (
            /* Results Grid */
            <div className="space-y-4">
              <div className="text-xs font-bold text-[var(--text-muted)] flex items-center justify-between">
                <span>تم العثور على {searchResponse.results.length} مصدر موثق:</span>
                <span className="text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>جميع النتائج مخرجة ومدققة إسنادياً</span>
                </span>
              </div>

              {searchResponse.results.map((item) => {
                const isSaved = savedIds.includes(item.id);
                const isCopied = copiedId === item.id;

                return (
                  <div
                    key={item.id}
                    className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-4 hover:border-[var(--gold)] transition-colors"
                  >
                    {/* Header: Type, Institution, Grade */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--border-color)]">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          item.type === 'quran' ? 'bg-emerald-500/10 text-emerald-600' :
                          item.type === 'hadith' ? 'bg-amber-500/10 text-amber-600' :
                          item.type === 'tafsir' ? 'bg-blue-500/10 text-blue-600' :
                          item.type === 'fatwa' ? 'bg-purple-500/10 text-purple-600' :
                          'bg-teal-500/10 text-teal-600'
                        }`}>
                          {item.typeLabelAr}
                        </span>

                        {item.grade && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 text-[11px] font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{item.grade}</span>
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-[var(--text-muted)] font-mono">
                        {item.referenceId}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-[var(--text-main)] font-cairo">
                      {item.title}
                    </h3>

                    {/* Exact Quote Block */}
                    <div className="p-5 rounded-2xl bg-[var(--bg-card-subtle)] border-r-4 border-r-[var(--gold)] border border-[var(--border-color)]">
                      <p className="text-base sm:text-lg text-[var(--text-main)] font-amiri leading-loose font-bold text-right">
                        «{item.quoteText}»
                      </p>
                    </div>

                    {/* Scholarly Explanation / Note */}
                    {item.scholarlyNote && (
                      <div className="text-xs text-[var(--text-muted)] leading-relaxed bg-[var(--bg-card)] p-3 rounded-xl border border-[var(--border-color)]">
                        <strong className="text-[var(--text-main)]">البيان والشرح: </strong>
                        {item.scholarlyNote}
                      </div>
                    )}

                    {/* Footer: Source institution & Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[var(--border-color)] text-xs">
                      <div className="text-[var(--text-muted)]">
                        <strong>جهة التوثيق:</strong> {item.sourceInstitution}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyCitation(item)}
                          className="px-3 py-1.5 rounded-xl bg-[var(--bg-card-subtle)] text-[var(--text-main)] border border-[var(--border-color)] hover:border-[var(--gold)] transition-colors flex items-center gap-1.5"
                          title="نسخ الإسناد"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{isCopied ? 'تم النسخ!' : 'نسخ الإسناد'}</span>
                        </button>

                        <button
                          onClick={() => handleSaveToLibrary(item)}
                          disabled={isSaved}
                          className="px-3 py-1.5 rounded-xl bg-[var(--bg-card-subtle)] text-[var(--text-main)] border border-[var(--border-color)] hover:border-[var(--gold)] transition-colors flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-[var(--gold)] text-[var(--gold)]' : ''}`} />
                          <span>{isSaved ? 'محفوظ في مكتبتي' : 'حفظ'}</span>
                        </button>

                        {onOpenShareCard && (
                          <button
                            onClick={() => onOpenShareCard({
                              title: item.title,
                              text: item.quoteText,
                              source: `${item.sourceInstitution} • ${item.referenceId}`,
                              category: item.typeLabelAr
                            })}
                            className="px-3 py-1.5 rounded-xl bg-[var(--gold-light)] text-[var(--gold)] font-bold border border-[var(--border-gold)] hover:bg-opacity-80 transition-colors flex items-center gap-1.5"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>مشاركة</span>
                          </button>
                        )}

                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)]"
                            title="رابط المصدر الأصلي"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Honest Fallback (No fabricated text) */
            <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl text-amber-600">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-main)] font-cairo">
                {searchResponse.fallbackMessage}
              </h3>
              <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
                في منصة وصل الإسلامية، نلتزم بالأمانة العلمية التامة؛ لا نقوم بتوليد فتاوى آلية أو التكهن بأحكام غير موثقة من مصادرها الأصلية.
              </p>

              {searchResponse.suggestedRefinements.length > 0 && (
                <div className="pt-3 max-w-lg mx-auto text-right bg-[var(--bg-card-subtle)] p-4 rounded-2xl border border-[var(--border-color)] space-y-2">
                  <span className="text-xs font-bold text-[var(--text-main)] block">مقترحات لتحسين البحث:</span>
                  <ul className="text-xs text-[var(--text-muted)] space-y-1">
                    {searchResponse.suggestedRefinements.map((s, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="text-[var(--gold)]">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
