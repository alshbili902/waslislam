import React, { useState } from 'react';
import { Heart, Search, BookOpen, Sparkles, Share2, Check, Copy } from 'lucide-react';
import { DUA_CATEGORIES, DUA_DATA } from '../data/duaData';
import { normalizeArabicText } from '../services/quranService';
import { useUser } from '../context/UserContext';
import { useShareModal } from '../context/ShareContext';
import { DuaItem } from '../types';

export const DuaView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('quran');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { toggleFavorite, isFavorite } = useUser();
  const { openShareModal } = useShareModal();

  const filteredDuas = DUA_DATA.filter((d) => {
    const matchesCategory = selectedCategory === 'all' || d.categoryId === selectedCategory;
    const norm = normalizeArabicText(searchQuery);
    const matchesSearch =
      !searchQuery.trim() ||
      normalizeArabicText(d.titleAr).includes(norm) ||
      normalizeArabicText(d.textAr).includes(norm) ||
      normalizeArabicText(d.sourceAr).includes(norm);
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (d: DuaItem) => {
    const full = `${d.titleAr}\n${d.textAr}\n[المصدر: ${d.sourceAr}]`;
    navigator.clipboard.writeText(full);
    setCopiedId(d.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleFavorite = (d: DuaItem) => {
    toggleFavorite({
      type: 'dua',
      referenceId: d.id,
      title: d.titleAr,
      subtitle: d.sourceAr
    });
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 sm:p-6 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              الأدعية المأثورة وجوامع الكلم
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            أدعية القرآن الكريم وأدعية النبي ﷺ الصحيحة لمختلف الأحوال والأوقات.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في الأدعية..."
            className="w-full pr-9 pl-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-slate-200 dark:border-emerald-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedCategory === 'all'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white dark:bg-emerald-950/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-emerald-800'
          }`}
        >
          جميع الأدعية ({DUA_DATA.length})
        </button>
        {DUA_CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white dark:bg-emerald-950/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-emerald-800'
              }`}
            >
              {cat.nameAr}
            </button>
          );
        })}
      </div>

      {/* Duas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDuas.map((d) => {
          const fav = isFavorite('dua', d.id);
          return (
            <div
              key={d.id}
              className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 border border-slate-200/90 dark:border-emerald-800/40 shadow-xs hover:border-emerald-400 transition-all text-right flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-900/50 mb-3 text-xs">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {d.titleAr}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleFavorite(d)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        fav ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/40' : 'text-slate-400 hover:text-slate-600'
                      }`}
                      title="إضافة للمفضلة"
                    >
                      <Heart className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={() => handleCopy(d)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                      title="نسخ نص الدعاء"
                    >
                      {copiedId === d.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => {
                        const currentCat = DUA_CATEGORIES.find((c) => c.id === d.categoryId);
                        openShareModal({
                          sectionName: currentCat ? currentCat.nameAr : 'الأدعية',
                          contentType: 'دعاء',
                          type: 'dua',
                          content: d.textAr,
                          text: d.textAr,
                          source: d.sourceAr,
                          title: d.titleAr
                        });
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-800 transition-colors font-medium text-xs"
                      title="مشاركة الدعاء كصورة أو نص"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>مشاركة</span>
                    </button>
                  </div>
                </div>

                {/* Dua Text with Tashkeel */}
                <p className="font-amiri text-lg sm:text-xl leading-relaxed text-slate-900 dark:text-emerald-50 my-2">
                  {d.textAr}
                </p>

                {d.benefitAr && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2 bg-slate-50 dark:bg-emerald-900/30 p-2.5 rounded-xl border border-slate-100 dark:border-emerald-900/40">
                    {d.benefitAr}
                  </p>
                )}
              </div>

              <div className="pt-3 mt-4 border-t border-slate-100 dark:border-emerald-900/50 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>المصدر: {d.sourceAr}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
