import React, { useState, useMemo } from 'react';
import {
  Search,
  Heart,
  Share2,
  BookOpen,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  X,
  Award
} from 'lucide-react';
import { ALLAH_NAMES_DATA } from '../data/allahNamesData';
import { AllahNameItem } from '../types';
import { useUser } from '../context/UserContext';
import { useShareModal } from '../context/ShareContext';
import { normalizeArabicText } from '../services/searchService';

export const NamesOfAllahView: React.FC = () => {
  const { toggleFavorite, isFavorite } = useUser();
  const { openShareModal } = useShareModal();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [selectedName, setSelectedName] = useState<AllahNameItem | null>(null);

  // Extract distinct categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    ALLAH_NAMES_DATA.forEach((n) => {
      if (n.category) set.add(n.category);
    });
    return ['الكل', ...Array.from(set)];
  }, []);

  // Filtered names
  const filteredNames = useMemo(() => {
    const q = searchQuery.trim();
    const normQ = normalizeArabicText(q);

    return ALLAH_NAMES_DATA.filter((item) => {
      const matchCat =
        selectedCategory === 'الكل' || item.category === selectedCategory;

      if (!matchCat) return false;
      if (!q) return true;

      const normName = normalizeArabicText(item.nameAr);
      const normMeaning = normalizeArabicText(item.meaningAr);
      const normExpl = normalizeArabicText(item.explanationAr || '');
      const matchEn = item.nameEn?.toLowerCase().includes(q.toLowerCase());

      return (
        normName.includes(normQ) ||
        normMeaning.includes(normQ) ||
        normExpl.includes(normQ) ||
        Boolean(matchEn)
      );
    });
  }, [searchQuery, selectedCategory]);

  // Handle Share to existing ShareModal
  const handleShare = (item: AllahNameItem) => {
    openShareModal({
      type: 'allah_name',
      title: `اسم الله: ${item.nameAr}`,
      text: `${item.nameAr} — ${item.meaningAr}`,
      subtext: item.explanationAr || item.evidenceAr,
      reference: item.reference ? `${item.source} (${item.reference})` : item.source,
      sourceUrl: typeof window !== 'undefined' ? window.location.href : 'https://waslislam.com/names-of-allah'
    });
  };

  // Handle Favorite toggle
  const handleFavorite = async (item: AllahNameItem) => {
    await toggleFavorite({
      type: 'allah_name',
      title: item.nameAr,
      subtitle: item.meaningAr,
      reference: item.source
    });
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Top Hero Banner */}
      <div className="bg-white dark:bg-emerald-950/80 rounded-3xl p-6 sm:p-8 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold mb-3 border border-amber-300/50 dark:border-amber-700/50">
            <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ فَادْعُوهُ بِهَا</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black font-amiri text-slate-900 dark:text-white leading-tight">
            أسماء الله الحسنى التسعة والتسعون
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
            قال رسول الله ﷺ: «إِنَّ لِلَّهِ تِسْعَةً وَتِسْعِينَ اسْمًا مِائَةً إِلَّا وَاحِدًا، مَنْ أَحْصَاهَا دَخَلَ الْجَنَّةَ». استكشف المعاني الجليلة والشواهد القرآنية والنبوية الثابتة من مصادر التراث المعتمدة.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-4 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>محتوى موثّق بالكامل من صحيح السنة والتفسير</span>
            </span>
            <span>•</span>
            <span>إجمالي الأسماء: 99 اسماً</span>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-emerald-900/60 flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم، المعنى، أو اللفظ..."
              className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-slate-200 dark:border-emerald-700/60 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="md:w-60">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-slate-200 dark:border-emerald-700/60 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid of 99 Names */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredNames.map((item) => {
          const isFav = isFavorite('allah_name', item.nameAr);

          return (
            <div
              key={item.number}
              className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 border border-emerald-900/10 dark:border-emerald-800/50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group hover:border-emerald-500/50 relative overflow-hidden"
            >
              {/* Top Row: Number & Category Badge */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-mono font-bold text-xs flex items-center justify-center border border-emerald-300/40 dark:border-emerald-700/40">
                  #{item.number}
                </span>

                {item.category && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-emerald-900/30 text-slate-600 dark:text-emerald-300 border border-slate-200 dark:border-emerald-800/40">
                    {item.category}
                  </span>
                )}
              </div>

              {/* Center: Arabic Calligraphy Name */}
              <div className="text-center my-3 cursor-pointer" onClick={() => setSelectedName(item)}>
                <h3 className="text-2xl sm:text-3xl font-bold font-amiri text-emerald-900 dark:text-amber-300 group-hover:scale-105 transition-transform duration-300">
                  {item.nameAr}
                </h3>
                {item.nameEn && (
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-sans block mt-1">
                    {item.nameEn}
                  </span>
                )}
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                  {item.meaningAr}
                </p>
              </div>

              {/* Bottom Actions: Details, Favorite, Share */}
              <div className="pt-3 mt-2 border-t border-slate-100 dark:border-emerald-900/50 flex items-center justify-between text-xs">
                <button
                  onClick={() => setSelectedName(item)}
                  className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-100 font-bold inline-flex items-center gap-1 transition-colors"
                >
                  <span>التفاصيل</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleFavorite(item)}
                    className={`p-2 rounded-xl transition-colors ${
                      isFav
                        ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40'
                        : 'text-slate-400 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-emerald-900/40'
                    }`}
                    title={isFav ? 'محفوظ في المفضلة' : 'حفظ في المفضلة'}
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    onClick={() => handleShare(item)}
                    className="p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-slate-50 dark:hover:bg-emerald-900/40 transition-colors"
                    title="مشاركة الاسم وبطاقة التصميم"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredNames.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-emerald-950/40 rounded-2xl border border-dashed border-slate-300 dark:border-emerald-800">
          <BookOpen className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <h3 className="font-bold text-slate-700 dark:text-slate-200">
            لم يتم العثور على اسم مطابق لبحثك
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            جرب البحث بكلمات أخرى أو اختر "الكل" من قائمة التصنيفات.
          </p>
        </div>
      )}

      {/* Name Details Modal */}
      {selectedName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-emerald-950 rounded-3xl max-w-lg w-full p-6 sm:p-7 border border-emerald-900/20 dark:border-emerald-800/60 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-900">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-mono font-bold text-xs flex items-center justify-center">
                  #{selectedName.number}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-bold">
                  {selectedName.category || 'اسم جليل'}
                </span>
              </div>
              <button
                onClick={() => setSelectedName(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Big Name Calligraphy */}
            <div className="text-center py-4 bg-gradient-to-b from-emerald-500/10 to-transparent rounded-2xl border border-emerald-500/20">
              <h2 className="text-4xl sm:text-5xl font-extrabold font-amiri text-emerald-900 dark:text-amber-300">
                {selectedName.nameAr}
              </h2>
              {selectedName.nameEn && (
                <span className="text-sm text-slate-500 dark:text-slate-400 font-sans block mt-1">
                  {selectedName.nameEn}
                </span>
              )}
            </div>

            {/* Meaning & Classical Explanation */}
            <div className="space-y-3 text-xs leading-relaxed">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-emerald-900/30 border border-slate-100 dark:border-emerald-800/40">
                <strong className="text-slate-900 dark:text-white block text-sm mb-1">
                  المعنى والدلالة:
                </strong>
                <p className="text-slate-700 dark:text-slate-200">
                  {selectedName.meaningAr}
                </p>
              </div>

              {selectedName.explanationAr && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-emerald-900/30 border border-slate-100 dark:border-emerald-800/40">
                  <strong className="text-slate-900 dark:text-white block text-sm mb-1">
                    الشرح والتفصيل العقدي:
                  </strong>
                  <p className="text-slate-700 dark:text-slate-200">
                    {selectedName.explanationAr}
                  </p>
                </div>
              )}

              {selectedName.evidenceAr && (
                <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
                  <strong className="text-amber-900 dark:text-amber-300 block text-sm mb-1">
                    الشاهد من الكتاب والسنة:
                  </strong>
                  <p className="text-amber-950 dark:text-amber-100 font-amiri text-sm">
                    {selectedName.evidenceAr}
                  </p>
                </div>
              )}

              {/* Source & Reference */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-emerald-900/60">
                <span>المصدر: {selectedName.source} {selectedName.reference ? `(${selectedName.reference})` : ''}</span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>موثّق</span>
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-emerald-900 flex items-center justify-between">
              <button
                onClick={() => handleFavorite(selectedName)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-emerald-900/40 dark:hover:bg-emerald-900/60 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-2 transition-colors"
              >
                <Heart className={`w-4 h-4 ${isFavorite('allah_name', selectedName.nameAr) ? 'text-rose-500 fill-current' : ''}`} />
                <span>{isFavorite('allah_name', selectedName.nameAr) ? 'محفوظ في المفضلة' : 'إضافة للمفضلة'}</span>
              </button>

              <button
                onClick={() => {
                  handleShare(selectedName);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-sm"
              >
                <Share2 className="w-4 h-4" />
                <span>مشاركة البطاقة</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
