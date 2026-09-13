import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Radio,
  Sparkles,
  Search,
  Play,
  Pause,
  Heart,
  Volume2,
  Clock,
  Compass,
  BookOpen,
  Award,
  Users,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  SlidersHorizontal,
  ChevronLeft,
  X
} from 'lucide-react';
import { useRadio } from '../context/RadioContext';
import { RadioStation, RadioReciter } from '../types';
import { RadioStickyPlayer } from '../components/RadioStickyPlayer';
import { RadioStationBadge } from '../components/RadioStationBadge';

export const QuranRadioView: React.FC = () => {
  const {
    stations,
    categories,
    reciters,
    currentStation,
    isPlaying,
    isLoading,
    favorites,
    recentlyPlayed,
    playStation,
    togglePlay,
    toggleFavorite,
    setIsFullPlayerOpen,
  } = useRadio();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('cat-all');
  const [selectedReciterId, setSelectedReciterId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'recent' | 'reciters'>('all');

  // Filter stations based on search query, category, reciter, or tab
  const filteredStations = useMemo(() => {
    return stations.filter((station) => {
      // Must be active
      if (!station.isActive) return false;

      // Tab filter
      if (activeTab === 'favorites') {
        if (!favorites.includes(station.id)) return false;
      }

      // Reciter filter
      if (selectedReciterId && station.reciterId !== selectedReciterId) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'cat-all') {
        if (station.categoryId !== selectedCategory) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesName = station.name.toLowerCase().includes(query);
        const matchesDesc = station.description.toLowerCase().includes(query);
        const matchesReciter = station.reciterNameAr?.toLowerCase().includes(query);
        const matchesCategory = station.categoryNameAr?.toLowerCase().includes(query);
        return matchesName || matchesDesc || matchesReciter || matchesCategory;
      }

      return true;
    });
  }, [stations, searchQuery, selectedCategory, selectedReciterId, activeTab, favorites]);

  // Featured station for the hero banner (defaults to general mix or first featured)
  const featuredStation = useMemo(() => {
    return stations.find((s) => s.isFeatured && s.isActive) || stations[0];
  }, [stations]);

  // Get category icon
  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'general':
        return <Sparkles className="w-4 h-4" />;
      case 'haramain':
        return <Compass className="w-4 h-4" />;
      case 'murattal':
        return <BookOpen className="w-4 h-4" />;
      case 'mojawwad':
        return <Award className="w-4 h-4" />;
      case 'reciters':
        return <Users className="w-4 h-4" />;
      case 'rare':
        return <Heart className="w-4 h-4" />;
      default:
        return <Radio className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Sticky Player (Shown when a station is active) */}
      <RadioStickyPlayer />

      {/* Page Header */}
      <header className="relative rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-900 to-teal-900 text-white p-6 sm:p-8 overflow-hidden shadow-xl border border-emerald-700/40">
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/40 text-xs font-semibold text-emerald-200 mb-3">
            <Radio className="w-3.5 h-3.5 text-amber-300" />
            <span>بث حي ومباشر بدون انقطاع</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight mb-2">
            إذاعة القرآن الكريم
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-2xl">
            استمع إلى تلاوات القرآن الكريم مباشرة على مدار الساعة بأصوات كبار قراء العالم الإسلامي وتلاوات الحرمين الشريفين
          </p>

          {/* Quick Search Bar */}
          <div className="mt-6 flex items-center gap-2 bg-white/10 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-1.5 border border-emerald-400/30 shadow-inner max-w-xl">
            <div className="p-2 text-emerald-200">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن محطة، قارئ، أو نوع التلاوة..."
              className="bg-transparent text-white placeholder-emerald-200/60 text-sm focus:outline-none flex-1 pr-1"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-2 text-emerald-200 hover:text-white transition-colors"
                title="مسح البحث"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Featured Station Banner (Only when not searching) */}
      {!searchQuery && featuredStation && (
        <section aria-label="الإذاعة المميزة">
          <div className="rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative shrink-0">
                <RadioStationBadge
                  size="lg"
                  stationName={featuredStation.name}
                  categorySlug={featuredStation.categorySlug}
                  isPlaying={currentStation?.id === featuredStation.id && isPlaying}
                  isLoading={currentStation?.id === featuredStation.id && isLoading}
                />
                <div className="absolute top-1 right-1 bg-amber-500 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm z-20">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>مميزة</span>
                </div>
              </div>

              <div className="min-w-0">
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                  {featuredStation.categoryNameAr || 'البث المباشر الرئيسي'}
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-1">
                  {featuredStation.name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {featuredStation.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end shrink-0">
              <button
                onClick={() => toggleFavorite(featuredStation.id)}
                className={`p-3 rounded-2xl transition-colors ${
                  favorites.includes(featuredStation.id)
                    ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-500'
                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-500'
                }`}
                title="إضافة للمفضلة"
              >
                <Heart
                  className={`w-5 h-5 ${
                    favorites.includes(featuredStation.id) ? 'fill-current' : ''
                  }`}
                />
              </button>

              <button
                onClick={() => {
                  if (currentStation?.id === featuredStation.id) {
                    togglePlay();
                  } else {
                    playStation(featuredStation);
                  }
                }}
                className="h-12 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center gap-2.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
              >
                {currentStation?.id === featuredStation.id && isPlaying ? (
                  <>
                    <Pause className="w-5 h-5 fill-current" />
                    <span>إيقاف البث</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                    <span>استمع الآن مباشرة</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Navigation Tabs (All, Favorites, Recently Played, Reciters) */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => {
            setActiveTab('all');
            setSelectedReciterId(null);
          }}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'all'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>كافة الإذاعات</span>
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/20">
            {stations.filter((s) => s.isActive).length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('favorites');
            setSelectedReciterId(null);
          }}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'favorites'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>المفضلة</span>
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/20">
            {favorites.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('recent');
            setSelectedReciterId(null);
          }}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'recent'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>استمعت إليها مؤخراً</span>
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/20">
            {recentlyPlayed.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('reciters');
          }}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'reciters'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>كبار القراء</span>
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/20">
            {reciters.length}
          </span>
        </button>
      </div>

      {/* Categories Filter Pills (Visible when in 'all' view) */}
      {activeTab === 'all' && !selectedReciterId && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
                  isSelected
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-400/50 shadow-sm'
                    : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60 hover:border-emerald-300'
                }`}
              >
                {getCategoryIcon(cat.slug)}
                <span>{cat.nameAr}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Reciter filter active indicator */}
      {selectedReciterId && (
        <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-300/60">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs text-slate-700 dark:text-slate-300">
              عرض محطات القارئ:
            </span>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
              {reciters.find((r) => r.id === selectedReciterId)?.nameAr}
            </span>
          </div>
          <button
            onClick={() => setSelectedReciterId(null)}
            className="text-xs text-rose-500 hover:underline flex items-center gap-1 font-semibold"
          >
            <X className="w-3.5 h-3.5" />
            <span>إلغاء التصفية</span>
          </button>
        </div>
      )}

      {/* Content based on Active Tab */}
      {activeTab === 'reciters' ? (
        /* Reciters Section */
        <section aria-label="قائمة القراء">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reciters.map((reciter) => {
              const reciterStations = stations.filter(
                (s) => s.reciterId === reciter.id && s.isActive
              );
              return (
                <motion.div
                  key={reciter.id}
                  whileHover={{ y: -3 }}
                  className="bg-white dark:bg-slate-800/80 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col justify-between"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <RadioStationBadge
                      size="md"
                      type="reciter"
                      stationName={reciter.nameAr}
                      isPlaying={reciterStations.some((s) => s.id === currentStation?.id && isPlaying)}
                      className="w-16 h-16"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight mb-1">
                        {reciter.nameAr}
                      </h3>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mb-1.5">
                        {reciter.nameEn}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded-full">
                        <Radio className="w-3 h-3 text-emerald-500" />
                        <span>{reciterStations.length} محطة متاحة</span>
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-4">
                    {reciter.bioAr}
                  </p>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setSelectedReciterId(reciter.id);
                        setActiveTab('all');
                      }}
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <span>عرض المحطات</span>
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {reciterStations.length > 0 && (
                      <button
                        onClick={() => {
                          playStation(reciterStations[0]);
                        }}
                        className="h-9 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                      >
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        <span>استماع فوري</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      ) : activeTab === 'recent' ? (
        /* Recently Played Tab */
        <section aria-label="استمعت إليها مؤخراً">
          {recentlyPlayed.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
              <Clock className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-1">
                سجل الاستماع فارغ
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                ابدأ بالاستماع إلى أي إذاعة قرآنية وستظهر هنا تلقائياً لسهولة الرجوع إليها.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentlyPlayed.map((station) => (
                <StationCard
                  key={station.id}
                  station={station}
                  isCurrent={currentStation?.id === station.id}
                  isPlaying={currentStation?.id === station.id && isPlaying}
                  isLoading={currentStation?.id === station.id && isLoading}
                  isFavorite={favorites.includes(station.id)}
                  onPlay={() => {
                    if (currentStation?.id === station.id) {
                      togglePlay();
                    } else {
                      playStation(station);
                    }
                  }}
                  onToggleFavorite={() => toggleFavorite(station.id)}
                  onOpenFull={() => setIsFullPlayerOpen(true)}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        /* Main Stations Grid (All or Favorites) */
        <section aria-label="إذاعات القرآن الكريم">
          {filteredStations.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-1">
                {activeTab === 'favorites'
                  ? 'لا توجد إذاعات في المفضلة بعد'
                  : 'لا توجد إذاعات تطابق خيارات البحث'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
                {activeTab === 'favorites'
                  ? 'يمكنك إضافة أي إذاعة إلى مفضلتك عبر النقر على رمز القلب في بطاقة المحطة.'
                  : 'جرب البحث بكلمات أخرى أو اختر تصنيفاً مختلفاً.'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
                >
                  إعادة ضبط البحث
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStations.map((station) => (
                <StationCard
                  key={station.id}
                  station={station}
                  isCurrent={currentStation?.id === station.id}
                  isPlaying={currentStation?.id === station.id && isPlaying}
                  isLoading={currentStation?.id === station.id && isLoading}
                  isFavorite={favorites.includes(station.id)}
                  onPlay={() => {
                    if (currentStation?.id === station.id) {
                      togglePlay();
                    } else {
                      playStation(station);
                    }
                  }}
                  onToggleFavorite={() => toggleFavorite(station.id)}
                  onOpenFull={() => setIsFullPlayerOpen(true)}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

// Reusable Station Card Component
interface StationCardProps {
  station: RadioStation;
  isCurrent: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  isFavorite: boolean;
  onPlay: () => void;
  onToggleFavorite: () => void;
  onOpenFull: () => void;
}

const StationCard: React.FC<StationCardProps> = ({
  station,
  isCurrent,
  isPlaying,
  isLoading,
  isFavorite,
  onPlay,
  onToggleFavorite,
  onOpenFull,
}) => {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className={`relative rounded-3xl p-5 border transition-all duration-200 flex flex-col justify-between ${
        isCurrent
          ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-500/10'
          : 'bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md'
      }`}
    >
      <div>
        {/* Top Header: Station Badge + Live Pulse + Favorite */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <RadioStationBadge
            size="md"
            stationName={station.name}
            categorySlug={station.categorySlug}
            isPlaying={isCurrent && isPlaying}
            isLoading={isCurrent && isLoading}
          />

          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
              <span className="relative flex h-1.5 w-1.5">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                    isCurrent && isPlaying ? 'bg-emerald-400' : 'bg-emerald-600'
                  } opacity-75`}
                />
                <span
                  className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                    isCurrent && isPlaying ? 'bg-emerald-400' : 'bg-emerald-600'
                  }`}
                />
              </span>
              <span>بث مباشر</span>
            </span>

            <button
              onClick={onToggleFavorite}
              className={`p-2 rounded-xl transition-colors ${
                isFavorite
                  ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40'
                  : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title={isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Category & Reciter badge */}
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          {station.categoryNameAr && (
            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/40 px-2 py-0.5 rounded-md">
              {station.categoryNameAr}
            </span>
          )}
          {station.reciterNameAr && (
            <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded-md">
              {station.reciterNameAr}
            </span>
          )}
        </div>

        {/* Title & Description */}
        <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug mb-1">
          {station.name}
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-4">
          {station.description}
        </p>
      </div>

      {/* Bottom Action Footer */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-3">
        <span className="text-[10px] font-mono text-slate-400">
          {station.bitrate || '128 kbps'}
        </span>

        <div className="flex items-center gap-2">
          {isCurrent && (
            <button
              onClick={onOpenFull}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold px-2 py-1"
              title="تكبير المشغل"
            >
              عرض المشغل
            </button>
          )}

          <button
            onClick={onPlay}
            disabled={isLoading}
            className={`h-9 px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95 ${
              isCurrent && isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isCurrent && isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>إيقاف مؤقت</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                <span>استماع مباشر</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
