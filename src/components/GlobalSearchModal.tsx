'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  X, 
  BookOpen, 
  Sparkles, 
  Layers, 
  ChevronLeft, 
  GraduationCap, 
  Heart,
  Bookmark
} from 'lucide-react';
import { SURAH_LIST } from '../data/quranMetadata';
import { AUTHENTIC_HADITHS } from '../data/hadithData';
import { ADHKAR_DATA } from '../data/adhkarData';
import { ALLAH_NAMES } from '../data/allahNamesData';
import { ACADEMY_LESSONS } from '../data/academyData';
import { matchesArabicQuery } from '../utils/arabicSearch';
import { NavTab } from './Navbar';
import { BrandLogo } from './BrandLogo';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: NavTab) => void;
  onSelectSurah?: (surahNum: number) => void;
  isEnglish: boolean;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onSelectSurah,
  isEnglish
}) => {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'quran' | 'hadith' | 'adhkar' | 'academy' | 'names'>('all');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trimmed = query.trim();

  // Search Results using Arabic-aware normalization
  const matchingSurahs = trimmed && (filterType === 'all' || filterType === 'quran')
    ? SURAH_LIST.filter(s => 
        matchesArabicQuery(s.name, trimmed) || 
        s.englishName.toLowerCase().includes(trimmed.toLowerCase()) || 
        String(s.number) === trimmed
      ).slice(0, 5)
    : [];

  const matchingHadiths = trimmed && (filterType === 'all' || filterType === 'hadith')
    ? AUTHENTIC_HADITHS.filter(h => 
        matchesArabicQuery(h.arabic, trimmed) || 
        matchesArabicQuery(h.narratorAr, trimmed) || 
        matchesArabicQuery(h.source, trimmed)
      ).slice(0, 4)
    : [];

  const matchingAdhkar = trimmed && (filterType === 'all' || filterType === 'adhkar')
    ? ADHKAR_DATA.filter(d => 
        matchesArabicQuery(d.textAr, trimmed) || 
        matchesArabicQuery(d.categoryAr, trimmed)
      ).slice(0, 4)
    : [];

  const matchingAcademy = trimmed && (filterType === 'all' || filterType === 'academy')
    ? ACADEMY_LESSONS.filter(l => 
        matchesArabicQuery(l.titleAr, trimmed) || 
        matchesArabicQuery(l.summaryAr, trimmed)
      ).slice(0, 4)
    : [];

  const matchingNames = trimmed && (filterType === 'all' || filterType === 'names')
    ? ALLAH_NAMES.filter(n => 
        matchesArabicQuery(n.arabic, trimmed) || 
        n.transliteration.toLowerCase().includes(trimmed.toLowerCase())
      ).slice(0, 4)
    : [];

  const totalResults = matchingSurahs.length + matchingHadiths.length + matchingAdhkar.length + matchingAcademy.length + matchingNames.length;

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-label={isEnglish ? "Global Search" : "البحث الشامل"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-start justify-center p-4 pt-16 sm:pt-24 animate-in fade-in duration-200"
    >
      <div className="bg-[var(--bg-card)] border border-[var(--border-gold)] rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[var(--border-color)] flex items-center gap-3">
          <Search className="w-5 h-5 text-[var(--gold)] shrink-0 pointer-events-none" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isEnglish ? 'Search across Quran, Hadith, Academy, Adhkar, and Names of Allah...' : 'ابحث بذكاء في القرآن، الأحاديث، الأكاديمية، الأذكار، وأسماء الله الحسنى...'}
            className="w-full bg-transparent text-sm sm:text-base font-semibold text-[var(--text-main)] focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)] transition-colors cursor-pointer touch-manipulation"
            aria-label="Close search"
          >
            <X className="w-5 h-5 pointer-events-none" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2 border-b border-[var(--border-color)]/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          {[
            { id: 'all', labelAr: 'الكل', labelEn: 'All' },
            { id: 'quran', labelAr: 'القرآن', labelEn: 'Quran' },
            { id: 'hadith', labelAr: 'الحديث', labelEn: 'Hadith' },
            { id: 'academy', labelAr: 'الأكاديمية', labelEn: 'Academy' },
            { id: 'adhkar', labelAr: 'الأذكار', labelEn: 'Adhkar' },
            { id: 'names', labelAr: 'أسماء الله', labelEn: 'Names' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id as any)}
              className={`px-3 py-1.5 min-h-[36px] rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer touch-manipulation ${
                filterType === f.id
                  ? 'bg-[var(--gold)] text-black'
                  : 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              {isEnglish ? f.labelEn : f.labelAr}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {!trimmed && (
            <div className="text-center py-10 text-[var(--text-muted)] text-xs flex flex-col items-center justify-center space-y-2">
              <BrandLogo size="md" className="mx-auto opacity-80" />
              <p className="font-tajawal text-sm">{isEnglish ? 'Type a word to search with Arabic root and diacritics tolerance' : 'بحث فوري متطور يتجاوز التشكيل والهمزات للوصول المباشر للمحتوى'}</p>
            </div>
          )}

          {trimmed && totalResults === 0 && (
            <div className="text-center py-10 text-[var(--text-muted)] text-xs">
              <p>لم يتم العثور على نتائج مطابقة لـ "{query}"</p>
            </div>
          )}

          {/* Surahs Matches */}
          {matchingSurahs.length > 0 && (
            <div>
              <span className="text-[11px] font-bold text-[var(--gold)] uppercase block mb-2">
                سور القرآن الكريم ({matchingSurahs.length})
              </span>
              <div className="space-y-1.5">
                {matchingSurahs.map(s => (
                  <button
                    key={s.number}
                    type="button"
                    onClick={() => {
                      if (onSelectSurah) onSelectSurah(s.number);
                      onSelectTab('quran');
                      onClose();
                    }}
                    className="w-full text-right p-3 min-h-[48px] rounded-xl bg-[var(--bg-card-subtle)] hover:bg-[var(--primary-light)] border border-[var(--border-color)] flex items-center justify-between cursor-pointer touch-manipulation transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-md bg-[var(--primary)] text-white text-xs font-mono font-bold flex items-center justify-center shrink-0">
                        {s.number}
                      </span>
                      <div>
                        <span className="text-sm font-bold text-[var(--text-main)] font-quran block">سورة {s.name}</span>
                        <span className="text-xs text-[var(--text-muted)] block">{s.englishName} • {s.numberOfAyahs} آية</span>
                      </div>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-[var(--text-muted)] shrink-0 pointer-events-none" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Academy Lessons Matches */}
          {matchingAcademy.length > 0 && (
            <div>
              <span className="text-[11px] font-bold text-[var(--gold)] uppercase block mb-2">
                دروس أكاديمية وصل ({matchingAcademy.length})
              </span>
              <div className="space-y-1.5">
                {matchingAcademy.map(l => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => {
                      onSelectTab('discover');
                      onClose();
                    }}
                    className="w-full text-right p-3 min-h-[48px] rounded-xl bg-[var(--bg-card-subtle)] hover:bg-[var(--primary-light)] border border-[var(--border-color)] flex items-center justify-between cursor-pointer touch-manipulation transition-colors"
                  >
                    <div>
                      <span className="text-sm font-bold text-[var(--text-main)] font-amiri block">{l.titleAr}</span>
                      <span className="text-xs text-[var(--text-muted)] line-clamp-1">{l.summaryAr}</span>
                    </div>
                    <GraduationCap className="w-4 h-4 text-[var(--gold)] shrink-0 pointer-events-none" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Hadiths Matches */}
          {matchingHadiths.length > 0 && (
            <div>
              <span className="text-[11px] font-bold text-[var(--gold)] uppercase block mb-2">
                الأحاديث النبوية ({matchingHadiths.length})
              </span>
              <div className="space-y-1.5">
                {matchingHadiths.map(h => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => {
                      onSelectTab('discover');
                      onClose();
                    }}
                    className="w-full text-right p-3 min-h-[48px] rounded-xl bg-[var(--bg-card-subtle)] hover:bg-[var(--primary-light)] border border-[var(--border-color)] cursor-pointer touch-manipulation transition-colors"
                  >
                    <p className="text-xs font-quran font-semibold text-[var(--text-main)] line-clamp-2">
                      «{h.arabic}»
                    </p>
                    <span className="text-[10px] text-[var(--text-muted)] block mt-1">
                      {h.source} • {h.grade}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Adhkar Matches */}
          {matchingAdhkar.length > 0 && (
            <div>
              <span className="text-[11px] font-bold text-[var(--gold)] uppercase block mb-2">
                الأذكار والأدعية ({matchingAdhkar.length})
              </span>
              <div className="space-y-1.5">
                {matchingAdhkar.map(d => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      onSelectTab('discover');
                      onClose();
                    }}
                    className="w-full text-right p-3 min-h-[48px] rounded-xl bg-[var(--bg-card-subtle)] hover:bg-[var(--primary-light)] border border-[var(--border-color)] cursor-pointer touch-manipulation transition-colors"
                  >
                    <p className="text-xs font-quran font-semibold text-[var(--text-main)] line-clamp-2">
                      «{d.textAr}»
                    </p>
                    <span className="text-[10px] text-[var(--text-muted)] block mt-1">
                      {d.categoryAr} • {d.referenceAr}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Names of Allah Matches */}
          {matchingNames.length > 0 && (
            <div>
              <span className="text-[11px] font-bold text-[var(--gold)] uppercase block mb-2">
                أسماء الله الحسنى ({matchingNames.length})
              </span>
              <div className="grid grid-cols-2 gap-2">
                {matchingNames.map(n => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      onSelectTab('discover');
                      onClose();
                    }}
                    className="p-2.5 min-h-[48px] rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-center cursor-pointer touch-manipulation hover:border-[var(--gold)] transition-colors flex flex-col items-center justify-center"
                  >
                    <span className="text-base font-bold font-quran text-[var(--gold)] block">{n.arabic}</span>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">{n.transliteration}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
