import React, { useState } from 'react';
import { Sparkles, Search, Bookmark, Share2, Check, BookOpen, Heart, Copy } from 'lucide-react';
import { HADITH_DATA, HADITH_TOPICS } from '../data/hadithData';
import { normalizeArabicText } from '../services/quranService';
import { useUser } from '../context/UserContext';
import { useShareModal } from '../context/ShareContext';
import { HadithItem } from '../types';

export const HadithView: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { toggleFavorite, isFavorite } = useUser();
  const { openShareModal } = useShareModal();

  const filteredHadiths = HADITH_DATA.filter((h) => {
    const matchesTopic = selectedTopic === 'الكل' || h.topicAr === selectedTopic;
    const normSearch = normalizeArabicText(searchQuery);
    const matchesSearch =
      !searchQuery.trim() ||
      normalizeArabicText(h.textAr).includes(normSearch) ||
      normalizeArabicText(h.narratorAr).includes(normSearch) ||
      normalizeArabicText(h.collectionAr).includes(normSearch);
    return matchesTopic && matchesSearch;
  });

  const handleCopy = (h: HadithItem) => {
    const text = `عن ${h.narratorAr}:\n${h.textAr}\n[المصدر: ${h.collectionAr} - ${h.bookAr} (${h.gradingAr})]`;
    navigator.clipboard.writeText(text);
    setCopiedId(h.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleFavorite = (h: HadithItem) => {
    toggleFavorite({
      type: 'hadith',
      referenceId: h.id,
      title: h.topicAr,
      subtitle: `${h.collectionAr} (${h.hadithNumber})`
    });
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 sm:p-6 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                موسوعة الحديث النبوي الشريف
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              أحاديث صحيحة متفق عليها من صحيح البخاري وصحيح مسلم والأربعين النووية مع التخريج والشرح.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في المتن، الراوي، أو المصدر..."
              className="w-full pr-9 pl-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-slate-200 dark:border-emerald-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Topics Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 pb-1 scrollbar-none">
          {HADITH_TOPICS.map((topic) => (
            <button
              key={topic}
              onClick={() => setSelectedTopic(topic)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedTopic === topic
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-emerald-900/40 text-slate-700 dark:text-slate-300 hover:bg-emerald-100'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Hadiths List */}
      <div className="space-y-4">
        {filteredHadiths.map((h) => {
          const fav = isFavorite('hadith', h.id);
          return (
            <div
              key={h.id}
              className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 sm:p-6 border border-slate-200/90 dark:border-emerald-800/40 shadow-xs hover:border-emerald-500/40 transition-all text-right"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-900/50 mb-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 font-bold">
                    {h.topicAr}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">
                    {h.collectionAr} • {h.bookAr}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 font-medium">
                    {h.gradingAr}
                  </span>
                  <button
                    onClick={() => handleToggleFavorite(h)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      fav ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/40' : 'text-slate-400 hover:text-slate-600'
                    }`}
                    title="إضافة للمفضلة"
                  >
                    <Heart className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => handleCopy(h)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                    title="نسخ نص الحديث"
                  >
                    {copiedId === h.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() =>
                      openShareModal({
                        sectionName: selectedTopic !== 'الكل' ? `الأحاديث - ${selectedTopic}` : 'الأحاديث',
                        contentType: 'حديث',
                        type: 'hadith',
                        content: h.textAr,
                        text: h.textAr,
                        source: `${h.collectionAr} (${h.gradingAr})`,
                        narrator: h.narratorAr,
                        title: h.topicAr
                      })
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-800 transition-colors font-medium text-xs"
                    title="مشاركة الحديث كصورة أو نص"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>مشاركة</span>
                  </button>
                </div>
              </div>

              {/* Narrator */}
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                عن {h.narratorAr}:
              </p>

              {/* Hadith Matn */}
              <p className="font-amiri text-lg sm:text-xl leading-relaxed text-slate-900 dark:text-emerald-50 my-2">
                {h.textAr}
              </p>

              {/* Explanation */}
              {h.explanationAr && (
                <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-emerald-900/30 border border-slate-100 dark:border-emerald-900/50 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <strong className="block mb-1 text-emerald-800 dark:text-emerald-300 font-bold">
                    فوائد ودلالات الحديث:
                  </strong>
                  {h.explanationAr}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
