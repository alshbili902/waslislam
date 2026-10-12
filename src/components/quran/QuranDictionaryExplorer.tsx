'use client';

import React, { useState } from 'react';
import { 
  Search, 
  BookOpen, 
  Sparkles, 
  Layers, 
  Copy, 
  Bookmark, 
  Share2, 
  ChevronLeft, 
  ShieldCheck,
  Hash
} from 'lucide-react';
import { QuranDictionaryEngine } from '../../utils/quranDictionaryEngine';
import { QuranDictionaryEntry } from '../../data/quranDictionaryData';
import { libraryManager } from '../../utils/libraryManager';

interface QuranDictionaryExplorerProps {
  isEnglish: boolean;
  onOpenAyah?: (surah: number, ayah: number) => void;
  onOpenShareCard?: (content: { title: string; text: string; source: string; category: string }) => void;
}

export const QuranDictionaryExplorer: React.FC<QuranDictionaryExplorerProps> = ({
  isEnglish,
  onOpenAyah,
  onOpenShareCard
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'root' | 'word'>('all');
  const [selectedEntry, setSelectedEntry] = useState<QuranDictionaryEntry | null>(null);

  const rootsCatalog = QuranDictionaryEngine.getRootsCatalog();
  const searchResults = QuranDictionaryEngine.searchDictionary(searchQuery, filterMode);

  return (
    <div className="space-y-6 pb-24">
      {/* Header Banner */}
      <section className="bg-[var(--bg-card)] border border-[var(--border-gold)] rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--gold-light)] text-[var(--gold)] text-xs font-bold mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            <span>معجم ألفاظ وجذور القرآن الكريم المعتمد</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-main)] font-cairo">
            {isEnglish ? 'Interactive Quran Dictionary' : 'معجم القرآن الكريم التفاعلي'}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-2 leading-relaxed">
            {isEnglish
              ? 'Explore Quranic roots, classical Arabic morphology, lexical definitions, and inter-connected verses across the Holy Quran.'
              : 'محرك لغوي إسنادي لاستكشاف جذور كلمات القرآن الكريم، الإعراب والوزن الصرفي، عدد مرات الورود، وبيان المعنى اللغوي المعتمد من أمهات معاجم التفسير.'}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ابحث بكلمة قرآنية أو جذر لغوي (مثال: نعبد، ع-ب-د، الصراط، نور...)"
              className="w-full pr-11 pl-4 py-3.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-main)] text-sm font-semibold focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
            <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          </div>

          <div className="flex items-center gap-1.5">
            {[
              { id: 'all', label: 'الكل' },
              { id: 'word', label: 'الكلمات' },
              { id: 'root', label: 'الجذور' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterMode(f.id as any)}
                className={`px-4 py-3.5 rounded-2xl text-xs font-bold transition-all ${
                  filterMode === f.id
                    ? 'bg-[var(--primary)] text-white shadow-sm'
                    : 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)] border border-[var(--border-color)]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Roots Catalog Ribbon */}
        <div className="mt-4 pt-4 border-t border-[var(--border-color)] flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] text-[var(--text-muted)] font-bold shrink-0">أشهر الجذور:</span>
          {rootsCatalog.map(r => (
            <button
              key={r.root}
              onClick={() => {
                setSearchQuery(r.root);
                setFilterMode('root');
              }}
              className="text-[11px] px-3 py-1.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] hover:border-[var(--gold)] text-[var(--text-main)] whitespace-nowrap transition-colors flex items-center gap-1.5"
            >
              <span className="font-mono font-bold text-[var(--primary)]">{r.root}</span>
              <span className="text-[10px] text-[var(--text-muted)]">({r.count})</span>
            </button>
          ))}
        </div>
      </section>

      {/* Dictionary Results List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-[var(--text-muted)]">
          <span>نتائج المعجم ({searchResults.length} مادة معجمية):</span>
          <span className="flex items-center gap-1 text-emerald-600">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>بيانات موثقة من مجمع اللغة العربية ومفردات الأصفهاني</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {searchResults.map(entry => (
            <div
              key={entry.id}
              className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-4 hover:border-[var(--gold)] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
                  <span className="text-2xl font-bold font-quran text-[var(--text-main)]">
                    ﴿{entry.word}﴾
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[var(--primary-light)] text-[var(--primary)] text-xs font-mono font-bold">
                      الجذر: {entry.root}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] font-mono">
                      [سورة {entry.surahNumber}:{entry.ayahNumber}]
                    </span>
                  </div>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <p className="text-sm font-tajawal text-[var(--text-main)] leading-relaxed">
                    {entry.meaningAr}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] bg-[var(--bg-card-subtle)] p-2.5 rounded-xl border border-[var(--border-color)]">
                    <strong>الإعراب والصرف:</strong> {entry.morphologyNote}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs">
                <span className="text-[11px] text-amber-500 font-bold">
                  ورود الجذر: {entry.totalOccurrencesInQuran} مرة
                </span>

                <div className="flex items-center gap-2">
                  {onOpenAyah && (
                    <button
                      onClick={() => onOpenAyah(entry.surahNumber, entry.ayahNumber)}
                      className="px-3 py-1.5 rounded-xl bg-[var(--bg-card-subtle)] text-[var(--text-main)] border border-[var(--border-color)] hover:border-[var(--gold)] transition-colors flex items-center gap-1"
                    >
                      <span>عرض بالآية</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {onOpenShareCard && (
                    <button
                      onClick={() => onOpenShareCard({
                        title: `معجم القرآن: ${entry.word}`,
                        text: `${entry.meaningAr}\nجذر: ${entry.root} • ورودها: ${entry.totalOccurrencesInQuran} مرة`,
                        source: entry.lexicalSource,
                        category: 'معجم القرآن'
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
          ))}
        </div>
      </div>
    </div>
  );
};
