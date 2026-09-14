import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bookmark,
  Heart,
  BookOpen,
  Sparkles,
  HelpCircle,
  Trash2,
  ExternalLink,
  ChevronLeft,
  Quote
} from 'lucide-react';
import { UserFavorite, QuranBookmark } from '../../types';

interface SavedContentSectionProps {
  favorites: UserFavorite[];
  bookmarks: QuranBookmark[];
  onRemoveFavorite: (type: string, referenceId: string) => void;
  onRemoveBookmark: (id: string) => void;
  onNavigate: (tab: string, contextId?: any) => void;
}

export const SavedContentSection: React.FC<SavedContentSectionProps> = ({
  favorites,
  bookmarks,
  onRemoveFavorite,
  onRemoveBookmark,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'ayah' | 'hadith' | 'dua' | 'azkar' | 'article' | 'wisdom' | 'allah_name' | 'seerah' | 'hajj_umrah' | 'library_book'>('ayah');

  // Filter items by type
  const filteredFavorites = favorites.filter((f) => f.type === activeTab);

  const tabs = [
    { id: 'ayah', label: `الآيات (${bookmarks.length + favorites.filter(f => f.type === 'ayah').length})`, icon: BookOpen },
    { id: 'hadith', label: `الأحاديث (${favorites.filter(f => f.type === 'hadith').length})`, icon: Sparkles },
    { id: 'allah_name', label: `أسماء الله (${favorites.filter(f => f.type === 'allah_name').length})`, icon: Sparkles },
    { id: 'seerah', label: `السيرة (${favorites.filter(f => f.type === 'seerah').length})`, icon: Bookmark },
    { id: 'hajj_umrah', label: `الحج والعمرة (${favorites.filter(f => f.type === 'hajj_umrah').length})`, icon: Bookmark },
    { id: 'library_book', label: `المكتبة (${favorites.filter(f => f.type === 'library_book').length})`, icon: BookOpen },
    { id: 'wisdom', label: `الحِكَم (${favorites.filter(f => f.type === 'wisdom').length})`, icon: Quote },
    { id: 'dua', label: `الأدعية (${favorites.filter(f => f.type === 'dua').length})`, icon: Heart },
    { id: 'azkar', label: `الأذكار (${favorites.filter(f => f.type === 'azkar').length})`, icon: Bookmark },
    { id: 'article', label: `المقالات (${favorites.filter(f => f.type === 'article').length})`, icon: HelpCircle },
  ];

  const handleOpenItem = (item: UserFavorite) => {
    if (item.type === 'ayah') {
      const surahNum = parseInt(item.referenceId, 10) || 1;
      onNavigate('quran', surahNum);
    } else if (item.type === 'hadith') {
      onNavigate('hadith');
    } else if (item.type === 'allah_name') {
      onNavigate('names-of-allah');
    } else if (item.type === 'seerah') {
      onNavigate('seerah');
    } else if (item.type === 'hajj_umrah') {
      onNavigate('hajj-umrah');
    } else if (item.type === 'library_book') {
      onNavigate('library');
    } else if (item.type === 'wisdom') {
      onNavigate('wisdoms', item.referenceId);
    } else if (item.type === 'dua') {
      onNavigate('dua');
    } else if (item.type === 'azkar') {
      onNavigate('azkar');
    } else if (item.type === 'article' || item.type === 'fatwa') {
      onNavigate('fatwa');
    }
  };


  return (
    <div className="bg-white dark:bg-emerald-950/80 rounded-3xl p-5 sm:p-7 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm relative overflow-hidden backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-amiri flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" />
            <span>المَحْفُوظَاتُ وَالمُفَضَّلَة</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            آياتك الكريمة، أدعيتك المختارة، وأحاديثك المحفوظة للرجوع إليها
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-slate-100 dark:border-emerald-900/50 mb-5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-emerald-900/40'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content List */}
      <div className="space-y-3">
        {activeTab === 'ayah' && (
          <>
            {/* Display bookmarks first if any */}
            {bookmarks.map((bm) => (
              <div
                key={bm.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-emerald-900/25 border border-slate-200/80 dark:border-emerald-800/40 flex items-start justify-between gap-4 hover:border-emerald-600/40 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Bookmark className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>سورة {bm.surahNameAr}</span>
                      <span className="text-emerald-700 dark:text-amber-300 text-xs font-normal">
                        (الآية {bm.ayahNumber})
                      </span>
                    </h4>
                    {bm.note && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 italic">
                        «{bm.note}»
                      </p>
                    )}
                    <span className="text-[10px] text-slate-400 mt-1 inline-block">
                      علامة مرجعية محفوظة
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onNavigate('quran', bm.surahNumber)}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-800/50 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>قراءة</span>
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onRemoveBookmark(bm.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                    title="حذف العلامة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Regular Favorites */}
        {filteredFavorites.map((fav) => (
          <div
            key={fav.id}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-emerald-900/25 border border-slate-200/80 dark:border-emerald-800/40 flex items-start justify-between gap-4 hover:border-emerald-600/40 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  {fav.title}
                </h4>
                {fav.contentSnippet && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                    {fav.contentSnippet}
                  </p>
                )}
                {fav.subtitle && (
                  <span className="text-[10px] text-slate-400 mt-1 inline-block">
                    {fav.subtitle}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => handleOpenItem(fav)}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-800/50 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>فتح</span>
                <ExternalLink className="w-3 h-3" />
              </button>
              <button
                onClick={() => onRemoveFavorite(fav.type, fav.referenceId)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                title="إزالة من المحفوظات"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {/* Empty States */}
        {activeTab === 'ayah' && bookmarks.length === 0 && filteredFavorites.length === 0 && (
          <div className="text-center py-10 px-4">
            <BookOpen className="w-12 h-12 text-slate-300 dark:text-emerald-800/60 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              لم تحفظ أي آية بعد
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              أثناء تلاوتك في المصحف، يمكنك حفظ أي آية أو وضع علامة مرجعية لتجدها هنا دائماً
            </p>
            <button
              onClick={() => onNavigate('quran')}
              className="mt-4 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer transition-colors"
            >
              فتح المصحف الشريف
            </button>
          </div>
        )}

        {activeTab !== 'ayah' && filteredFavorites.length === 0 && (
          <div className="text-center py-10 px-4">
            <Heart className="w-12 h-12 text-slate-300 dark:text-emerald-800/60 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              لا توجد عناصر محفوظة في هذا القسم
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              يمكنك النقر على أيقونة الإعجاب في أي ذكر أو حديث أو دعاء لإضافته إلى محفوظاتك الخاصة
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
