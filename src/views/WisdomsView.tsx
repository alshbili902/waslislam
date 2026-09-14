import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Quote,
  Sparkles,
  Search,
  Share2,
  Heart,
  Copy,
  Check,
  ShieldCheck,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  Calendar,
  Layers,
  HelpCircle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import {
  IslamicWisdom,
  WisdomCategory,
  ALL_WISDOM_CATEGORIES,
  WISDOM_CONTENT_TYPE_LABELS,
  WisdomContentType
} from '../types/wisdom';
import { wisdomService, normalizeArabicText } from '../services/wisdomService';
import { useShareModal } from '../context/ShareContext';
import { useUser } from '../context/UserContext';
import { WisdomDetailsModal } from '../components/wisdom/WisdomDetailsModal';

interface WisdomsViewProps {
  onNavigate?: (tab: string, contextId?: any) => void;
  initialWisdomId?: string;
}

export const WisdomsView: React.FC<WisdomsViewProps> = ({ onNavigate, initialWisdomId }) => {
  const { openShareModal } = useShareModal();
  const { toggleFavorite, isFavorite } = useUser();

  // State
  const [selectedCategory, setSelectedCategory] = useState<WisdomCategory | 'الكل'>('الكل');
  const [selectedContentType, setSelectedContentType] = useState<WisdomContentType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;

  const [wisdoms, setWisdoms] = useState<IslamicWisdom[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [dailyWisdom, setDailyWisdom] = useState<IslamicWisdom | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Selected item for details modal
  const [activeWisdomForDetails, setActiveWisdomForDetails] = useState<IslamicWisdom | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Feedback states
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Set document title and SEO description
  useEffect(() => {
    document.title = 'الحِكَم والمواعظ | وصل الإسلامية';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'حِكَم ومواعظ وتذكيرات إسلامية موثوقة من مصادر معتمدة: آيات، أحاديث صحيحة، وأقوال مأثورة بأعلى معايير التوثيق.'
      );
    }
  }, []);

  // Fetch Daily Wisdom (Deterministic)
  useEffect(() => {
    async function loadDaily() {
      try {
        const daily = await wisdomService.getDailyWisdom();
        setDailyWisdom(daily);
      } catch (err) {
        console.warn('Error fetching daily wisdom:', err);
      }
    }
    loadDaily();
  }, []);

  // Fetch Wisdoms based on filters
  useEffect(() => {
    let isMounted = true;
    async function loadWisdoms() {
      setIsLoading(true);
      try {
        const { items, total } = await wisdomService.getPublicWisdoms({
          category: selectedCategory,
          contentType: selectedContentType,
          searchQuery,
          page: currentPage,
          pageSize,
        });

        if (isMounted) {
          setWisdoms(items);
          setTotalItems(total);
        }
      } catch (err) {
        console.warn('Error loading wisdoms:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadWisdoms();
    return () => {
      isMounted = false;
    };
  }, [selectedCategory, selectedContentType, searchQuery, currentPage]);

  // Open initial wisdom if provided in route
  useEffect(() => {
    if (initialWisdomId) {
      wisdomService.getWisdomById(initialWisdomId).then((w) => {
        if (w) {
          setActiveWisdomForDetails(w);
          setIsDetailsOpen(true);
        }
      });
    }
  }, [initialWisdomId]);

  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const handleCopyText = (item: IslamicWisdom) => {
    let text = item.content;
    if (item.author) text += `\nالقائل: ${item.author}`;
    text += `\nالمصدر: ${item.source}`;
    if (item.reference) text += ` (${item.reference})`;
    text += `\n\nمنصة وصل الإسلامية: https://waslislam.fun/wisdoms`;

    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = (item: IslamicWisdom) => {
    let sourceLine = item.source;
    if (item.author) {
      sourceLine = `${item.author} — ${item.source}`;
    }
    if (item.reference) {
      sourceLine += ` (${item.reference})`;
    }

    openShareModal({
      sectionName: 'الحِكَم والمواعظ',
      contentType: WISDOM_CONTENT_TYPE_LABELS[item.contentType] || 'حكمة وموعظة',
      type: 'wisdom',
      content: item.content,
      text: item.content,
      source: sourceLine,
      title: `حكمة في ${item.category}`,
    });
  };

  const handleToggleFav = (item: IslamicWisdom) => {
    toggleFavorite({
      type: 'wisdom',
      referenceId: item.id,
      title: `${WISDOM_CONTENT_TYPE_LABELS[item.contentType] || 'حكمة'} في ${item.category}`,
      subtitle: item.author ? `${item.author} • ${item.source}` : item.source,
      contentSnippet: item.content.length > 75 ? item.content.substring(0, 75) + '...' : item.content,
    });
  };

  const openDetails = (item: IslamicWisdom) => {
    setActiveWisdomForDetails(item);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-16" dir="rtl">
      {/* ============================================================ */}
      {/* 1. HERO INTRODUCTION SECTION (المقدمة الإسلامية الفاخرة) */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#063a2f] via-[#042820] to-[#021813] text-white p-6 sm:p-10 shadow-xl border border-emerald-500/25">
        <div className="absolute inset-0 bg-islamic-pattern opacity-10 pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl text-right space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>بستان الحكمة والتذكرة الإيمانية</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold font-tajawal text-white tracking-tight">
            الحِكَم والمواعظ
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-2xl font-tajawal">
            «كَلِمَاتٌ نَافِعَةٌ تُذَكِّرُ القَلْبَ بِالخَيْرِ» — نصوص منتقاة ومحققة من القرآن الكريم وصحيح السنة النبوية وأقوال الصحابة وكبار أئمة السلف، تعين المسلم على تجديد إيمانه وتزكية نفسه.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-emerald-200/80">
            <span className="flex items-center gap-1 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/60">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>توثيق شرعي معتمد</span>
            </span>
            <span className="flex items-center gap-1 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/60">
              <BookOpen className="w-3.5 h-3.5 text-emerald-300" />
              <span>تخريج دقيق للمصادر</span>
            </span>
            <span className="flex items-center gap-1 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/60">
              <Share2 className="w-3.5 h-3.5 text-teal-300" />
              <span>مشاركة سهلة كبطاقة فاخرة</span>
            </span>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. FEATURED "DAILY WISDOM" SECTION (حكمة اليوم الثابتة حتمياً) */}
      {/* ============================================================ */}
      {dailyWisdom && (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-[#03231a] to-emerald-900 text-white p-6 sm:p-8 shadow-lg border border-amber-500/30">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-emerald-800/60 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wide block">
                  مختارة لليوم • لا تتغير بالتحديث
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-white font-tajawal">
                  حِكْمَةُ اليَوْم
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-bold border border-emerald-700/60">
                {dailyWisdom.category}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                {WISDOM_CONTENT_TYPE_LABELS[dailyWisdom.contentType] || dailyWisdom.contentType}
              </span>
            </div>
          </div>

          {/* Daily Wisdom Text */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white/5 border border-white/10 text-center my-4">
            <p className="font-amiri text-xl sm:text-2xl leading-loose text-amber-50 tracking-wide">
              {dailyWisdom.content}
            </p>
            {dailyWisdom.author && (
              <p className="mt-3 text-sm font-bold text-emerald-300">
                — {dailyWisdom.author} —
              </p>
            )}
            <p className="mt-2 text-xs text-emerald-200/75">
              المصدر: {dailyWisdom.source} {dailyWisdom.reference ? `(${dailyWisdom.reference})` : ''}
              {dailyWisdom.hadithGrade ? ` • ${dailyWisdom.hadithGrade}` : ''}
            </p>
          </div>

          {/* Daily Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => openDetails(dailyWisdom)}
              className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>فتح التفاصيل والتخريج</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyText(dailyWisdom)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="نسخ النص"
              >
                {copiedId === dailyWisdom.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                onClick={() => handleToggleFav(dailyWisdom)}
                className={`p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors ${
                  isFavorite('wisdom', dailyWisdom.id) ? 'text-rose-400' : 'text-white'
                }`}
                title="إضافة للمفضلة"
              >
                <Heart className={`w-4 h-4 ${isFavorite('wisdom', dailyWisdom.id) ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={() => handleShare(dailyWisdom)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-md flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>مشاركة كصورة</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* 3. SEARCH & CATEGORY FILTERING BAR (شريط البحث والتصنيفات الـ 16) */}
      {/* ============================================================ */}
      <section className="bg-white dark:bg-emerald-950/70 rounded-3xl p-5 sm:p-6 border border-emerald-900/10 dark:border-emerald-800/40 shadow-xs space-y-4">
        {/* Search Field */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="ابحث في الحِكَم والمواعظ بالموضوع أو القائل أو المصدر..."
            className="w-full pl-10 pr-11 py-3 text-xs sm:text-sm rounded-2xl bg-slate-50 dark:bg-emerald-900/30 border border-slate-200 dark:border-emerald-800/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-right"
          />
          <Search className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="text-xs text-slate-400 hover:text-slate-600 absolute left-3 top-1/2 -translate-y-1/2 px-2 py-1"
            >
              مسح
            </button>
          )}
        </div>

        {/* 16 Categories Filter Carousel */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>تصفح حسب الموضوع:</span>
            </span>
            <span className="text-[11px] text-slate-400">
              {totalItems} حكمة وموعظة متاحة
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => {
                setSelectedCategory('الكل');
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'الكل'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-emerald-900/30 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-emerald-800/50'
              }`}
            >
              الكل
            </button>

            {ALL_WISDOM_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-emerald-900/30 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-emerald-800/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. MAIN WISDOMS CARDS GRID (شبكة البطاقات الموثقة) */}
      {/* ============================================================ */}
      {isLoading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3 py-12">
          <div className="w-10 h-10 border-3 border-emerald-600 border-t-amber-400 rounded-full animate-spin" />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium animate-pulse">
            جاري تحميل الحِكَم والمواعظ الموثقة...
          </p>
        </div>
      ) : wisdoms.length === 0 ? (
        <div className="bg-white dark:bg-emerald-950/70 rounded-3xl p-12 text-center border border-slate-200 dark:border-emerald-800/40 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <HelpCircle className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            لم يتم العثور على نتائج تطابق بحثك
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            جرّب تغيير كلمات البحث أو اختيار تصنيف آخر من قائمة الموضوعات أعلاه.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('الكل');
              setSearchQuery('');
              setCurrentPage(1);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
          >
            عرض جميع الحِكَم
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {wisdoms.map((item) => {
            const fav = isFavorite('wisdom', item.id);
            return (
              <motion.article
                key={item.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-[#04241c] rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-emerald-800/40 shadow-xs hover:border-emerald-500/50 hover:shadow-md transition-all flex flex-col justify-between text-right group"
              >
                <div>
                  {/* Top Bar: Type, Category, and Actions */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-900/50 mb-3.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold text-[11px]">
                        {WISDOM_CONTENT_TYPE_LABELS[item.contentType] || item.contentType}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 font-bold text-[11px]">
                        {item.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleFav(item)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          fav ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/40' : 'text-slate-400 hover:text-rose-500'
                        }`}
                        title="حفظ في المفضلة"
                      >
                        <Heart className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
                      </button>

                      <button
                        onClick={() => handleCopyText(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors cursor-pointer"
                        title="نسخ النص مع المصدر"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Wisdom Text */}
                  <div
                    onClick={() => openDetails(item)}
                    className="font-amiri text-lg sm:text-xl leading-loose text-slate-900 dark:text-emerald-50 my-2 cursor-pointer hover:text-emerald-800 dark:hover:text-amber-200 transition-colors select-text"
                  >
                    {item.content}
                  </div>

                  {/* Author if exists */}
                  {item.author && (
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-2">
                      — {item.author}
                    </p>
                  )}
                </div>

                {/* Bottom Source & Actions */}
                <div className="pt-4 border-t border-slate-100 dark:border-emerald-900/50 mt-4 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[65%]">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">المصدر: </span>
                    <span>{item.source}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openDetails(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                      title="عرض التفاصيل الكاملة"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleShare(item)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-800 transition-colors font-bold text-xs cursor-pointer"
                      title="مشاركة كصورة عبر قالب المنصة الرسمي"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>مشاركة</span>
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. RESPONSIVE PAGINATION CONTROLS (التنقل بين الصفحات) */}
      {/* ============================================================ */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-xl border border-slate-200 dark:border-emerald-800/60 bg-white dark:bg-emerald-950 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            title="الصفحة السابقة"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-emerald-900/40 text-xs font-bold text-slate-800 dark:text-slate-200">
            صفحة {currentPage} من {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-xl border border-slate-200 dark:border-emerald-800/60 bg-white dark:bg-emerald-950 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            title="الصفحة التالية"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. WISDOM DETAILS MODAL (نافذة التفاصيل) */}
      {/* ============================================================ */}
      <WisdomDetailsModal
        wisdom={activeWisdomForDetails}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setActiveWisdomForDetails(null);
        }}
      />
    </div>
  );
};
