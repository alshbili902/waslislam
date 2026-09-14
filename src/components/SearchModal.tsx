import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, BookOpen, Heart, Sparkles, HelpCircle, ArrowLeft, Radio, HandHeart, Award, Quote } from 'lucide-react';
import { SURAHS_LIST } from '../data/quranMetadata';
import { AZKAR_DATA } from '../data/azkarData';
import { HADITH_DATA } from '../data/hadithData';
import { DUA_DATA } from '../data/duaData';
import { FATWA_DATA } from '../data/fatwaData';
import { DEFAULT_RADIO_STATIONS } from '../data/radioData';
import { INITIAL_DONATION_PLATFORMS } from '../data/donationData';
import { INITIAL_BINBAZ_LINKS } from '../data/binbazData';
import { INITIAL_WISDOMS } from '../data/wisdomsData';
import { normalizeArabicText } from '../services/quranService';
import { useModalScrollLock } from '../hooks/useModalScrollLock';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, contextId?: any) => void;
}

interface SearchResult {
  id: string;
  type: 'quran' | 'azkar' | 'hadith' | 'dua' | 'fatwa' | 'radio' | 'donations' | 'binbaz' | 'wisdom';
  title: string;
  snippet: string;
  badge: string;
  targetTab: string;
  targetId?: any;
}

export const SearchModal: React.FC<Props> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  useModalScrollLock(isOpen, {
    onClose,
    closeOnEsc: true,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      return;
    }

    const norm = normalizeArabicText(query);
    const list: SearchResult[] = [];

    // Search Quran Surahs
    SURAHS_LIST.forEach((s) => {
      if (normalizeArabicText(s.name).includes(norm) || s.englishName.toLowerCase().includes(query.toLowerCase())) {
        list.push({
          id: `surah-${s.number}`,
          type: 'quran',
          title: `سورة ${s.name}`,
          snippet: `${s.revelationTypeAr} • ${s.numberOfAyahs} آية • الجزء ${s.juz} • صفحة ${s.page}`,
          badge: 'قرآن كريم',
          targetTab: 'quran',
          targetId: s.number
        });
      }
    });

    // Search Azkar
    AZKAR_DATA.forEach((a) => {
      if (normalizeArabicText(a.textAr).includes(norm) || normalizeArabicText(a.sourceAr).includes(norm)) {
        list.push({
          id: a.id,
          type: 'azkar',
          title: a.sourceAr,
          snippet: a.textAr.slice(0, 120) + '...',
          badge: 'ذكر مأثور',
          targetTab: 'azkar',
          targetId: a.categoryId
        });
      }
    });

    // Search Hadith
    HADITH_DATA.forEach((h) => {
      if (normalizeArabicText(h.textAr).includes(norm) || normalizeArabicText(h.narratorAr).includes(norm) || normalizeArabicText(h.topicAr).includes(norm)) {
        list.push({
          id: h.id,
          type: 'hadith',
          title: `${h.topicAr} (${h.collectionAr})`,
          snippet: h.textAr.slice(0, 120) + '...',
          badge: 'حديث نبوي',
          targetTab: 'hadith',
          targetId: h.id
        });
      }
    });

    // Search Dua
    DUA_DATA.forEach((d) => {
      if (normalizeArabicText(d.titleAr).includes(norm) || normalizeArabicText(d.textAr).includes(norm)) {
        list.push({
          id: d.id,
          type: 'dua',
          title: d.titleAr,
          snippet: d.textAr.slice(0, 120) + '...',
          badge: 'دعاء',
          targetTab: 'dua',
          targetId: d.id
        });
      }
    });

    // Search Fatwa
    FATWA_DATA.forEach((f) => {
      if (normalizeArabicText(f.titleAr).includes(norm) || normalizeArabicText(f.questionAr).includes(norm) || normalizeArabicText(f.answerAr).includes(norm)) {
        list.push({
          id: f.id,
          type: 'fatwa',
          title: f.titleAr,
          snippet: f.answerAr.slice(0, 120) + '...',
          badge: 'فتوى شرعية',
          targetTab: 'fatwa',
          targetId: f.id
        });
      }
    });

    // Search Quran Radio
    DEFAULT_RADIO_STATIONS.forEach((st) => {
      if (
        normalizeArabicText(st.name).includes(norm) ||
        (st.reciterNameAr && normalizeArabicText(st.reciterNameAr).includes(norm)) ||
        (st.categoryNameAr && normalizeArabicText(st.categoryNameAr).includes(norm))
      ) {
        list.push({
          id: `radio-${st.id}`,
          type: 'radio',
          title: st.name,
          snippet: `${st.reciterNameAr ? `بصوت ${st.reciterNameAr} • ` : ''}${st.description || 'بث مباشر متواصل 24 ساعة'}`,
          badge: 'إذاعة القرآن',
          targetTab: 'quran-radio',
          targetId: st.id
        });
      }
    });

    // Search Donation Platforms
    INITIAL_DONATION_PLATFORMS.forEach((p) => {
      if (
        normalizeArabicText(p.name).includes(norm) ||
        normalizeArabicText(p.description).includes(norm) ||
        normalizeArabicText(p.officialEntity).includes(norm) ||
        p.categories.some((c) => normalizeArabicText(c).includes(norm))
      ) {
        list.push({
          id: p.id,
          type: 'donations',
          title: p.name,
          snippet: `${p.officialEntity} • ${p.description.slice(0, 100)}...`,
          badge: 'الصدقة والتبرع',
          targetTab: 'donations',
        });
      }
    });

    // Search Sheikh Ibn Baz Links
    INITIAL_BINBAZ_LINKS.forEach((b) => {
      if (
        normalizeArabicText(b.title).includes(norm) ||
        normalizeArabicText(b.description).includes(norm) ||
        normalizeArabicText(b.categoryLabelAr).includes(norm) ||
        norm.includes('ابن باز') ||
        norm.includes('بن باز')
      ) {
        list.push({
          id: b.id,
          type: 'binbaz',
          title: b.title,
          snippet: b.description.slice(0, 120) + '...',
          badge: 'موقع ابن باز',
          targetTab: 'binbaz',
        });
      }
    });

    // Search Islamic Wisdoms & Reflections
    INITIAL_WISDOMS.forEach((w) => {
      if (
        normalizeArabicText(w.content).includes(norm) ||
        (w.author && normalizeArabicText(w.author).includes(norm)) ||
        (w.source && normalizeArabicText(w.source).includes(norm)) ||
        normalizeArabicText(w.category).includes(norm) ||
        normalizeArabicText(w.contentType).includes(norm)
      ) {
        list.push({
          id: `wisdom-${w.id}`,
          type: 'wisdom',
          title: `${w.contentType}: في ${w.category}${w.author ? ` (${w.author})` : ''}`,
          snippet: w.content.slice(0, 120) + '...',
          badge: 'حِكمة وموعظة',
          targetTab: 'wisdoms',
          targetId: w.id,
        });
      }
    });

    setResults(list.slice(0, 12));
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-24 px-4 bg-black/60 backdrop-blur-xs wasl-modal-overlay"
          onClick={onClose}
          onTouchMove={(e) => {
            if (e.target === e.currentTarget) e.preventDefault();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-white dark:bg-emerald-950 rounded-2xl shadow-2xl border border-emerald-900/10 dark:border-emerald-700/50 overflow-hidden flex flex-col max-h-[min(85dvh,calc(100dvh-5rem))] wasl-modal-overlay"
          >
            {/* Search Input Bar (Sticky Top) */}
            <div className="sticky top-0 z-20 shrink-0 p-4 border-b border-slate-100 dark:border-emerald-900/60 bg-white/95 dark:bg-emerald-950/95 backdrop-blur-md flex items-center gap-3">
              <Search className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث في القرآن، الأحاديث، الأذكار، الأدعية، الفتاوى..."
                className="w-full bg-transparent text-sm sm:text-base text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-emerald-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              >
                إغلاق
              </button>
            </div>

            {/* Results list */}
            <div className="overflow-y-auto wasl-modal-scrollable p-3 space-y-2 flex-1">
              {query.trim().length >= 2 && results.length === 0 && (
                <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-sm">
                  لم نعثر على نتائج مطابقة لـ "{query}". جرب البحث بكلمات أخرى مثل "الفاتحة"، "النية"، "الاستغفار".
                </div>
              )}

              {query.trim().length < 2 && (
                <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500 space-y-2">
                  <p>اكتب كلمتين أو أكثر للبحث السريع في المصادر الإسلامية الموثقة.</p>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    {['سورة الكهف', 'سيد الاستغفار', 'إنما الأعمال بالنيات', 'آية الكرسي', 'صلاة المسافر'].map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs hover:bg-emerald-100"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.map((r) => {
                const Icon =
                  r.type === 'quran'
                    ? BookOpen
                    : r.type === 'radio'
                    ? Radio
                    : r.type === 'hadith'
                    ? Sparkles
                    : r.type === 'wisdom'
                    ? Quote
                    : r.type === 'fatwa'
                    ? HelpCircle
                    : r.type === 'donations'
                    ? HandHeart
                    : r.type === 'binbaz'
                    ? Award
                    : Heart;

                return (
                  <div
                    key={r.id}
                    onClick={() => {
                      onNavigate(r.targetTab, r.targetId);
                      onClose();
                    }}
                    className="group p-3 rounded-xl border border-slate-100 dark:border-emerald-900/40 bg-slate-50/50 dark:bg-emerald-900/20 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 cursor-pointer transition-all flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-200 mt-0.5 shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {r.title}
                          </h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 shrink-0">
                            {r.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed font-amiri text-base sm:text-xs">
                          {r.snippet}
                        </p>
                      </div>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors shrink-0 mt-2" />
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
