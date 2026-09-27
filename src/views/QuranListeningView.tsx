import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  Headphones,
  Search,
  Filter,
  UserCheck,
  BookOpen,
  History,
  Heart,
  Sparkles,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  ListPlus,
  Share2,
  Clock,
  ArrowRight,
  Check,
  RefreshCw,
  Sliders,
  Layers,
  Award
} from 'lucide-react';
import {
  QuranService,
  ReciterService,
  AudioSourceService,
  PlaybackService
} from '../services/quranAudioService';
import {
  QuranAudioSurah,
  QuranAudioReciter,
  QuranAudioHistoryItem,
  QuranAudioFavorite
} from '../types/quranAudio';
import { useQuranAudio } from '../context/QuranAudioContext';
import { useShareModal } from '../context/ShareContext';
import { VERIFIED_RIWAYAAT_LIST } from '../data/quranAudioData';

interface Props {
  onNavigate: (tab: string, contextId?: any) => void;
  initialSubTab?: 'listen' | 'reciters' | 'surahs' | 'history' | 'favorites';
  initialReciterSlug?: string;
  initialSurahNumber?: number;
}

export const QuranListeningView: React.FC<Props> = ({
  onNavigate,
  initialSubTab = 'listen',
  initialReciterSlug,
  initialSurahNumber
}) => {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    playSurah,
    addToQueue,
    setIsFullPlayerOpen
  } = useQuranAudio();

  const { openShareModal } = useShareModal();

  // Navigation Sub-Tabs
  const [activeTab, setActiveTab] = useState<'listen' | 'reciters' | 'surahs' | 'history' | 'favorites'>(
    initialSubTab
  );

  // Selected views for drill-down
  const [selectedReciterSlug, setSelectedReciterSlug] = useState<string | null>(
    initialReciterSlug || null
  );
  const [selectedSurahNum, setSelectedSurahNum] = useState<number | null>(
    initialSurahNumber || null
  );

  // All surahs and reciters
  const allSurahs = useMemo(() => QuranService.getAllSurahs(), []);
  const allReciters = useMemo(() => ReciterService.getReciters(), []);
  const featuredReciters = useMemo(() => ReciterService.getFeaturedReciters(), []);

  // Last saved playback
  const [lastPlayback, setLastPlayback] = useState(PlaybackService.getLastPlayback());
  const [recentHistory, setRecentHistory] = useState<QuranAudioHistoryItem[]>(
    PlaybackService.getRecentHistory()
  );
  const [favorites, setFavorites] = useState<QuranAudioFavorite[]>(
    PlaybackService.getFavorites()
  );

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [revelationFilter, setRevelationFilter] = useState<'all' | 'Meccan' | 'Medinan'>('all');
  const [selectedJuz, setSelectedJuz] = useState<number>(0);
  const [riwayahFilter, setRiwayahFilter] = useState<string>('الكل');
  const [sortOrder, setSortOrder] = useState<'quran' | 'ayahs' | 'alpha'>('quran');

  // Interactive Quick Selector State
  const [pickerReciterId, setPickerReciterId] = useState<string>(
    featuredReciters[0]?.id || 'alafasy'
  );
  const [pickerSurahNum, setPickerSurahNum] = useState<number>(1);

  // Refresh history/favorites on focus or mount
  useEffect(() => {
    setLastPlayback(PlaybackService.getLastPlayback());
    setRecentHistory(PlaybackService.getRecentHistory());
    setFavorites(PlaybackService.getFavorites());
  }, []);

  // Update selected slug or surah from props if provided
  useEffect(() => {
    if (initialReciterSlug) {
      setSelectedReciterSlug(initialReciterSlug);
      setActiveTab('reciters');
    }
  }, [initialReciterSlug]);

  useEffect(() => {
    if (initialSurahNumber) {
      setSelectedSurahNum(initialSurahNumber);
      setActiveTab('surahs');
    }
  }, [initialSurahNumber]);

  // SEO Page Title Update
  useEffect(() => {
    const defaultTitle = 'الاستماع إلى القرآن الكريم | وصل الإسلامية';
    if (selectedReciterSlug) {
      const rec = ReciterService.getReciterById(selectedReciterSlug);
      document.title = rec
        ? `تلاوات القارئ ${rec.nameAr} | الاستماع للقرآن | وصل الإسلامية`
        : defaultTitle;
    } else if (selectedSurahNum) {
      const sur = QuranService.getSurahByNumber(selectedSurahNum);
      document.title = sur
        ? `الاستماع إلى سورة ${sur.name} | وصل الإسلامية`
        : defaultTitle;
    } else {
      document.title = defaultTitle;
    }

    return () => {
      document.title = 'وصل الإسلامية — خير دائم بين يديك';
    };
  }, [selectedReciterSlug, selectedSurahNum]);

  // Filtered Surahs List
  const filteredSurahs = useMemo(() => {
    let list = QuranService.filterSurahs({
      revelationType: revelationFilter,
      query: searchQuery,
      juz: selectedJuz
    });

    if (sortOrder === 'ayahs') {
      list = [...list].sort((a, b) => b.numberOfAyahs - a.numberOfAyahs);
    } else if (sortOrder === 'alpha') {
      list = [...list].sort((a, b) => a.nameWithoutTashkeel.localeCompare(b.nameWithoutTashkeel, 'ar'));
    }

    return list;
  }, [revelationFilter, searchQuery, selectedJuz, sortOrder]);

  // Filtered Reciters List
  const filteredReciters = useMemo(() => {
    return ReciterService.filterReciters({
      riwayah: riwayahFilter,
      query: searchQuery
    });
  }, [riwayahFilter, searchQuery]);

  // Helpers
  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleToggleFavoriteReciter = async (rec: QuranAudioReciter) => {
    const favId = `reciter:${rec.id}`;
    await PlaybackService.toggleFavorite({
      id: favId,
      type: 'reciter',
      targetId: rec.id,
      titleAr: rec.nameAr,
      subtitleAr: rec.riwayah
    });
    setFavorites(PlaybackService.getFavorites());
  };

  const handleShareSurah = (surah: QuranAudioSurah, reciter?: QuranAudioReciter) => {
    const targetReciter = reciter || ReciterService.getReciterById(pickerReciterId) || allReciters[0];
    openShareModal({
      type: 'quran',
      sectionName: 'الاستماع للقرآن',
      contentType: 'تلاوة قرآنية',
      surahName: surah.name,
      title: `سورة ${surah.name}`,
      text: `سورة ${surah.name} • ${surah.revelationTypeAr} • ${surah.numberOfAyahs} آية`,
      subtext: `بصوت القارئ: ${targetReciter.nameAr} (${targetReciter.riwayah})`,
      reference: 'وصل الإسلامية — منصة القرآن الكريم الشاملة',
      url: window.location.origin + `/quran/listen/${surah.number}`
    });
  };

  // ==========================================
  // VIEW: RECITER DEDICATED PROFILE (/quran/reciters/:id)
  // ==========================================
  if (selectedReciterSlug) {
    const reciter = ReciterService.getReciterById(selectedReciterSlug);
    if (!reciter) {
      return (
        <div className="text-center py-20">
          <p className="text-slate-500">القارئ غير موجود</p>
          <button
            onClick={() => setSelectedReciterSlug(null)}
            className="mt-4 px-4 py-2 bg-emerald-800 text-white rounded-xl"
          >
            العودة للقراء
          </button>
        </div>
      );
    }

    const moshaf = reciter.moshafList[0];
    const reciterSurahs = allSurahs.filter((s) => moshaf.surahList.includes(s.number));
    const isReciterFav = favorites.some((f) => f.id === `reciter:${reciter.id}`);

    const handlePlayAll = () => {
      if (reciterSurahs.length > 0) {
        // Add all to queue and start playing first
        reciterSurahs.slice(1).forEach((s) => addToQueue(s.number, reciter.id, moshaf.id));
        playSurah(reciterSurahs[0].number, reciter.id, moshaf.id, 0);
      }
    };

    const handleShuffle = () => {
      if (reciterSurahs.length > 0) {
        const shuffled = [...reciterSurahs].sort(() => Math.random() - 0.5);
        shuffled.slice(1).forEach((s) => addToQueue(s.number, reciter.id, moshaf.id));
        playSurah(shuffled[0].number, reciter.id, moshaf.id, 0);
      }
    };

    return (
      <div className="space-y-6 pb-20">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <button
            onClick={() => {
              setSelectedReciterSlug(null);
              setActiveTab('reciters');
            }}
            className="hover:text-emerald-700 dark:hover:text-amber-300 transition-colors"
          >
            القراء
          </button>
          <span>/</span>
          <span className="text-emerald-900 dark:text-emerald-200 font-bold">{reciter.nameAr}</span>
        </div>

        {/* Reciter Luxury Profile Card */}
        <div className="rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-950 to-emerald-950 text-white p-6 sm:p-8 shadow-xl border border-emerald-500/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-arabesque-subtle opacity-10" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-right">
            {/* Calligraphic Avatar Badge */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-emerald-800 to-teal-900 border-2 border-emerald-400/50 flex items-center justify-center text-amber-300 font-bold text-4xl shadow-2xl shrink-0">
              {reciter.letter}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-bold">
                  {reciter.riwayah}
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-800/60 text-emerald-200 border border-emerald-700/50 text-xs">
                  {reciterSurahs.length} تلاوة متاحة
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold font-tajawal text-white">
                {reciter.nameAr}
              </h1>
              <p className="text-xs sm:text-sm text-emerald-200/80 mt-2 max-w-2xl leading-relaxed">
                {reciter.bioAr}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-6">
                <button
                  onClick={handlePlayAll}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>تشغيل الكل</span>
                </button>

                <button
                  onClick={handleShuffle}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 flex items-center gap-2 transition-colors active:scale-95"
                >
                  <Shuffle className="w-4 h-4" />
                  <span>تشغيل عشوائي</span>
                </button>

                <button
                  onClick={() => handleToggleFavoriteReciter(reciter)}
                  className={`p-2.5 rounded-xl border transition-colors ${
                    isReciterFav
                      ? 'bg-rose-950/60 border-rose-500 text-rose-400'
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                  }`}
                  title={isReciterFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                >
                  <Heart className={`w-4 h-4 ${isReciterFav ? 'fill-rose-500' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Surahs Recorded by this Reciter */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>السور المتاحة بصوت القارئ ({reciterSurahs.length})</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {reciterSurahs.map((surah) => {
              const isCurrentPlaying =
                currentTrack?.surahNumber === surah.number &&
                currentTrack?.reciterId === reciter.id &&
                isPlaying;

              return (
                <div
                  key={surah.number}
                  className="p-4 rounded-2xl bg-white dark:bg-emerald-950/70 border border-slate-200 dark:border-emerald-800/60 shadow-xs hover:border-emerald-500/50 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/60 text-emerald-800 dark:text-amber-300 font-bold text-xs flex items-center justify-center border border-emerald-200 dark:border-emerald-700/50 shrink-0">
                      {surah.number.toString().padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-amber-300 transition-colors truncate">
                        سورة {surah.name}
                      </h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {surah.revelationTypeAr} • {surah.numberOfAyahs} آية
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => addToQueue(surah.number, reciter.id, moshaf.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-emerald-700 dark:hover:text-amber-300 hover:bg-slate-100 dark:hover:bg-emerald-900/40 transition-colors"
                      title="إضافة إلى قائمة التشغيل"
                    >
                      <ListPlus className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => playSurah(surah.number, reciter.id, moshaf.id)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                        isCurrentPlaying
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-emerald-800 hover:bg-emerald-700 text-white'
                      }`}
                      title={isCurrentPlaying ? 'إيقاف مؤقت' : 'استماع'}
                    >
                      {isCurrentPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: SURAH DEDICATED PAGE (/quran/listen/:surah)
  // ==========================================
  if (selectedSurahNum) {
    const surah = QuranService.getSurahByNumber(selectedSurahNum);
    if (!surah) {
      return (
        <div className="text-center py-20">
          <p className="text-slate-500">السورة غير موجودة</p>
          <button
            onClick={() => setSelectedSurahNum(null)}
            className="mt-4 px-4 py-2 bg-emerald-800 text-white rounded-xl"
          >
            العودة للسور
          </button>
        </div>
      );
    }

    const availableForSurah = allReciters.filter((r) =>
      AudioSourceService.isSurahAvailable(r, surah.number)
    );

    const prevSurahNum = surah.number > 1 ? surah.number - 1 : 114;
    const nextSurahNum = surah.number < 114 ? surah.number + 1 : 1;

    return (
      <div className="space-y-6 pb-20">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <button
            onClick={() => {
              setSelectedSurahNum(null);
              setActiveTab('surahs');
            }}
            className="hover:text-emerald-700 dark:hover:text-amber-300 transition-colors"
          >
            السور
          </button>
          <span>/</span>
          <span className="text-emerald-900 dark:text-emerald-200 font-bold">سورة {surah.name}</span>
        </div>

        {/* Surah Luxury Hero Card */}
        <div className="rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-950 to-emerald-950 text-white p-6 sm:p-8 shadow-xl border border-emerald-500/30 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-arabesque-subtle opacity-10" />

          <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
            <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-mono mb-3">
              السورة {surah.number.toString().padStart(3, '0')}
            </span>

            <h1 className="text-3xl sm:text-5xl font-quran text-white font-bold mb-2">
              سورة {surah.name}
            </h1>

            <p className="text-xs sm:text-sm text-emerald-200/90 mb-4">
              {surah.englishName} • {surah.englishNameTranslation}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 mb-6 text-xs text-slate-300">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-900/60 border border-emerald-700/50">
                {surah.revelationTypeAr}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-900/60 border border-emerald-700/50">
                {surah.numberOfAyahs} آية
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-900/60 border border-emerald-700/50">
                الجزء {surah.juz}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-900/60 border border-emerald-700/50">
                صفحة {surah.page}
              </span>
            </div>

            {/* Prev / Play / Next Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setSelectedSurahNum(prevSurahNum)}
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
                title="السورة السابقة"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => playSurah(surah.number, pickerReciterId)}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-xl shadow-amber-500/25 active:scale-95 transition-all"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>تشغيل السورة الآن</span>
              </button>

              <button
                onClick={() => setSelectedSurahNum(nextSurahNum)}
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
                title="السورة التالية"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Available Reciters for this Surah */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>استمع لسورة {surah.name} بأصوات القراء ({availableForSurah.length})</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableForSurah.map((rec) => {
              const isCurrentPlaying =
                currentTrack?.surahNumber === surah.number &&
                currentTrack?.reciterId === rec.id &&
                isPlaying;

              return (
                <div
                  key={rec.id}
                  className="p-4 rounded-2xl bg-white dark:bg-emerald-950/70 border border-slate-200 dark:border-emerald-800/60 shadow-xs hover:border-emerald-500/50 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/60 text-emerald-800 dark:text-amber-300 font-bold text-xs flex items-center justify-center border border-emerald-200 dark:border-emerald-700/50 shrink-0">
                      {rec.letter}
                    </span>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-amber-300 transition-colors truncate">
                        {rec.nameAr}
                      </h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {rec.riwayah}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleShareSurah(surah, rec)}
                      className="p-2 rounded-xl text-slate-400 hover:text-emerald-700 dark:hover:text-amber-300 hover:bg-slate-100 dark:hover:bg-emerald-900/40 transition-colors"
                      title="مشاركة عبر استوديو البطاقات"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => playSurah(surah.number, rec.id)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                        isCurrentPlaying
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-emerald-800 hover:bg-emerald-700 text-white'
                      }`}
                      title={isCurrentPlaying ? 'إيقاف مؤقت' : 'استماع'}
                    >
                      {isCurrentPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN VIEW: STREAMING HUB WITH TABS
  // ==========================================
  return (
    <div className="space-y-6 pb-24 lg:pb-12">
      {/* Platform Section Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-amber-300 text-xs font-bold border border-emerald-300 dark:border-emerald-700/50">
              <Headphones className="w-3.5 h-3.5" />
              <span>المكتبة الصوتية المتكاملة</span>
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              تلاوات موثقة بأعذب الأصوات
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-tajawal text-slate-900 dark:text-white">
            الاستماع إلى القرآن الكريم
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
            استمع إلى تلاوات القرآن الكريم كاملة بروايات متواترة ونخبة من مشاهير القراء.
          </p>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن قارئ أو سورة..."
            className="w-full pl-3 pr-10 py-2.5 rounded-2xl bg-white dark:bg-emerald-950/80 border border-slate-200 dark:border-emerald-800/60 text-xs focus:outline-hidden focus:border-emerald-500 text-slate-900 dark:text-white shadow-xs"
          />
        </div>
      </div>

      {/* Continue Listening Banner (if user has active history) */}
      {lastPlayback && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-900 to-teal-950 text-white border border-emerald-500/30 shadow-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-amber-300 font-bold block">متابعة الاستماع</span>
              <h3 className="font-bold text-sm text-white truncate">
                سورة {QuranService.getSurahByNumber(lastPlayback.surahNumber)?.name} • {ReciterService.getReciterById(lastPlayback.reciterId)?.nameAr}
              </h3>
              <span className="text-[11px] text-emerald-200/80">
                وصلت إلى الدقيقة {formatTime(lastPlayback.positionSeconds)}
              </span>
            </div>
          </div>

          <button
            onClick={() =>
              playSurah(
                lastPlayback.surahNumber,
                lastPlayback.reciterId,
                lastPlayback.moshafId,
                lastPlayback.positionSeconds
              )
            }
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>متابعة</span>
          </button>
        </div>
      )}

      {/* Main Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-200/70 dark:bg-emerald-950/70 border border-slate-300 dark:border-emerald-800/60 overflow-x-auto">
        <button
          onClick={() => setActiveTab('listen')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'listen'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-700 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-white'
          }`}
        >
          <Headphones className="w-3.5 h-3.5" />
          <span>الرئيسية والاستماع</span>
        </button>

        <button
          onClick={() => setActiveTab('reciters')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'reciters'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-700 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-white'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>القراء ({allReciters.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('surahs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'surahs'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-700 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>السور (114)</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'history'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-700 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>آخر استماع</span>
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'favorites'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-700 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-white'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>المفضلة</span>
        </button>
      </div>

      {/* ==========================================
          TAB 1: MAIN LISTENING HUB (الاستماع للقرآن)
          ========================================== */}
      {activeTab === 'listen' && (
        <div className="space-y-8">
          {/* Interactive Fast Reciter + Surah Selector Box */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-emerald-950/80 border border-emerald-900/10 dark:border-emerald-800/60 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  المشغل السريع المباشر
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  اختر القارئ ثم السورة للبدء فوراً
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Reciter Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  1. اختر القارئ
                </label>
                <select
                  value={pickerReciterId}
                  onChange={(e) => setPickerReciterId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-slate-200 dark:border-emerald-800/60 text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                >
                  {allReciters.map((r) => (
                    <option key={r.id} value={r.id} className="text-slate-900 bg-white dark:bg-slate-900 dark:text-white">
                      {r.nameAr} ({r.riwayah})
                    </option>
                  ))}
                </select>
              </div>

              {/* Surah Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  2. اختر السورة
                </label>
                <select
                  value={pickerSurahNum}
                  onChange={(e) => setPickerSurahNum(parseInt(e.target.value, 10))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-slate-200 dark:border-emerald-800/60 text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                >
                  {allSurahs.map((s) => (
                    <option key={s.number} value={s.number} className="text-slate-900 bg-white dark:bg-slate-900 dark:text-white">
                      {s.number.toString().padStart(2, '0')}. سورة {s.name} ({s.revelationTypeAr} - {s.numberOfAyahs} آية)
                    </option>
                  ))}
                </select>
              </div>

              {/* Play & Queue Action */}
              <div className="flex items-end gap-2">
                <button
                  onClick={() => playSurah(pickerSurahNum, pickerReciterId)}
                  className="flex-1 h-10.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>بدء الاستماع</span>
                </button>

                <button
                  onClick={() => addToQueue(pickerSurahNum, pickerReciterId)}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-emerald-800/60 hover:bg-slate-100 dark:hover:bg-emerald-900/40 text-slate-600 dark:text-slate-300 transition-colors"
                  title="إضافة إلى قائمة التشغيل"
                >
                  <ListPlus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Section 1: Featured Reciters Carousel/Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>نخبة القراء المعتمدين</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  كبار قراء العالم الإسلامي بروايات حفص وورش وقالون
                </p>
              </div>

              <button
                onClick={() => setActiveTab('reciters')}
                className="text-xs font-bold text-emerald-700 dark:text-amber-300 hover:underline flex items-center gap-1"
              >
                <span>عرض جميع القراء</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {featuredReciters.slice(0, 6).map((r) => (
                <div
                  key={r.id}
                  onClick={() => setSelectedReciterSlug(r.id)}
                  className="p-4 rounded-2xl bg-white dark:bg-emerald-950/70 border border-slate-200 dark:border-emerald-800/60 shadow-xs hover:border-emerald-500/50 hover:shadow-md transition-all text-center cursor-pointer group"
                >
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-emerald-800 to-teal-900 text-amber-300 font-bold text-xl flex items-center justify-center border border-emerald-500/40 group-hover:scale-105 transition-transform shadow-sm mb-3">
                    {r.letter}
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-amber-300 transition-colors truncate">
                    {r.nameAr}
                  </h4>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5 truncate">
                    {r.riwayah}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Popular & Short Surahs Quick Play */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>سور يكثر الاستماع إليها</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  الفاتحة، الكهف، يس، الواقعة، الملك، الرحمن
                </p>
              </div>

              <button
                onClick={() => setActiveTab('surahs')}
                className="text-xs font-bold text-emerald-700 dark:text-amber-300 hover:underline flex items-center gap-1"
              >
                <span>عرض جميع الـ 114 سورة</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[1, 18, 36, 55, 56, 67].map((num) => {
                const s = QuranService.getSurahByNumber(num);
                if (!s) return null;
                const isCur = currentTrack?.surahNumber === s.number && isPlaying;

                return (
                  <div
                    key={s.number}
                    className="p-4 rounded-2xl bg-white dark:bg-emerald-950/70 border border-slate-200 dark:border-emerald-800/60 shadow-xs hover:border-emerald-500/50 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div
                      onClick={() => setSelectedSurahNum(s.number)}
                      className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                    >
                      <span className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/60 text-emerald-800 dark:text-amber-300 font-bold text-xs flex items-center justify-center border border-emerald-200 dark:border-emerald-700/50 shrink-0">
                        {s.number.toString().padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-amber-300 transition-colors truncate">
                          سورة {s.name}
                        </h4>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {s.revelationTypeAr} • {s.numberOfAyahs} آية
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleShareSurah(s)}
                        className="p-2 rounded-xl text-slate-400 hover:text-emerald-700 dark:hover:text-amber-300 hover:bg-slate-100 dark:hover:bg-emerald-900/40 transition-colors"
                        title="مشاركة"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => playSurah(s.number, pickerReciterId)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                          isCur
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-emerald-800 hover:bg-emerald-700 text-white'
                        }`}
                        title={isCur ? 'إيقاف مؤقت' : 'استماع'}
                      >
                        {isCur ? (
                          <Pause className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 2: ALL RECITERS (القراء)
          ========================================== */}
      {activeTab === 'reciters' && (
        <div className="space-y-6">
          {/* Riwayah Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {VERIFIED_RIWAYAAT_LIST.map((riw) => (
              <button
                key={riw}
                onClick={() => setRiwayahFilter(riw)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                  riwayahFilter === riw
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-white dark:bg-emerald-950/70 border border-slate-200 dark:border-emerald-800/60 text-slate-700 dark:text-slate-300 hover:border-emerald-600'
                }`}
              >
                {riw}
              </button>
            ))}
          </div>

          {/* Reciters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReciters.map((r) => {
              const isFav = favorites.some((f) => f.id === `reciter:${r.id}`);

              return (
                <div
                  key={r.id}
                  className="p-5 rounded-2xl bg-white dark:bg-emerald-950/70 border border-slate-200 dark:border-emerald-800/60 shadow-xs hover:border-emerald-500/50 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-800 to-teal-900 text-amber-300 font-bold text-lg flex items-center justify-center border border-emerald-500/40 shrink-0">
                          {r.letter}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                            {r.nameAr}
                          </h4>
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block">
                            {r.riwayah}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleFavoriteReciter(r)}
                        className={`p-2 rounded-xl border transition-colors ${
                          isFav
                            ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
                            : 'text-slate-400 hover:text-rose-500 border-slate-200 dark:border-emerald-800/60'
                        }`}
                        title={isFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                      {r.bioAr}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-emerald-900/60">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {r.totalSurahs} سورة كاملة
                    </span>

                    <button
                      onClick={() => setSelectedReciterSlug(r.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <span>تصفح التلاوات</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 3: ALL 114 SURAHS (السور)
          ========================================== */}
      {activeTab === 'surahs' && (
        <div className="space-y-6">
          {/* Filters Bar: Makki/Madani, Juz selector, Sorting */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-emerald-950/70 border border-slate-200 dark:border-emerald-800/60">
            {/* Makki / Madani Chips */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setRevelationFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  revelationFilter === 'all'
                    ? 'bg-emerald-800 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-emerald-900/40'
                }`}
              >
                الكل (114)
              </button>
              <button
                onClick={() => setRevelationFilter('Meccan')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  revelationFilter === 'Meccan'
                    ? 'bg-emerald-800 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-emerald-900/40'
                }`}
              >
                مكية
              </button>
              <button
                onClick={() => setRevelationFilter('Medinan')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  revelationFilter === 'Medinan'
                    ? 'bg-emerald-800 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-emerald-900/40'
                }`}
              >
                مدنية
              </button>
            </div>

            {/* Juz & Sort Selectors */}
            <div className="flex items-center gap-2">
              <select
                value={selectedJuz}
                onChange={(e) => setSelectedJuz(parseInt(e.target.value, 10))}
                className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-slate-200 dark:border-emerald-800/60 text-xs font-semibold text-slate-800 dark:text-white focus:outline-hidden"
              >
                <option value={0}>جميع الأجزاء</option>
                {Array.from({ length: 30 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    الجزء {i + 1}
                  </option>
                ))}
              </select>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-slate-200 dark:border-emerald-800/60 text-xs font-semibold text-slate-800 dark:text-white focus:outline-hidden"
              >
                <option value="quran">ترتيب المصحف</option>
                <option value="ayahs">عدد الآيات</option>
                <option value="alpha">أبجديًا</option>
              </select>
            </div>
          </div>

          {/* 114 Surahs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredSurahs.map((surah) => {
              const isCurrentPlaying =
                currentTrack?.surahNumber === surah.number && isPlaying;

              return (
                <div
                  key={surah.number}
                  className="p-4 rounded-2xl bg-white dark:bg-emerald-950/70 border border-slate-200 dark:border-emerald-800/60 shadow-xs hover:border-emerald-500/50 transition-all flex items-center justify-between gap-3 group"
                >
                  <div
                    onClick={() => setSelectedSurahNum(surah.number)}
                    className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                  >
                    <span className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/60 text-emerald-800 dark:text-amber-300 font-bold text-xs flex items-center justify-center border border-emerald-200 dark:border-emerald-700/50 shrink-0">
                      {surah.number.toString().padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-amber-300 transition-colors truncate">
                          سورة {surah.name}
                        </h4>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-emerald-900/60 text-slate-600 dark:text-emerald-300">
                          {surah.revelationTypeAr}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {surah.numberOfAyahs} آية • جزء {surah.juz}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => addToQueue(surah.number, pickerReciterId)}
                      className="p-2 rounded-xl text-slate-400 hover:text-emerald-700 dark:hover:text-amber-300 hover:bg-slate-100 dark:hover:bg-emerald-900/40 transition-colors"
                      title="إضافة إلى قائمة التشغيل"
                    >
                      <ListPlus className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleShareSurah(surah)}
                      className="p-2 rounded-xl text-slate-400 hover:text-emerald-700 dark:hover:text-amber-300 hover:bg-slate-100 dark:hover:bg-emerald-900/40 transition-colors"
                      title="مشاركة"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => playSurah(surah.number, pickerReciterId)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                        isCurrentPlaying
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-emerald-800 hover:bg-emerald-700 text-white'
                      }`}
                      title={isCurrentPlaying ? 'إيقاف مؤقت' : 'استماع'}
                    >
                      {isCurrentPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 4: RECENTLY PLAYED (آخر استماع)
          ========================================== */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>سجل الاستماع الأخير</span>
            </h3>

            {recentHistory.length > 0 && (
              <button
                onClick={() => {
                  PlaybackService.clearRecentHistory();
                  setRecentHistory([]);
                }}
                className="text-xs text-rose-500 hover:underline"
              >
                مسح السجل
              </button>
            )}
          </div>

          {recentHistory.length === 0 ? (
            <div className="text-center py-16 p-8 rounded-3xl bg-white dark:bg-emerald-950/50 border border-slate-200 dark:border-emerald-800/40">
              <History className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                لا يوجد سجل استماع بعد. ابدأ الاستماع إلى أي سورة وستظهر هنا تلقائيًا.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-white dark:bg-emerald-950/70 border border-slate-200 dark:border-emerald-800/60 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/60 text-emerald-800 dark:text-amber-300 font-bold text-xs flex items-center justify-center border border-emerald-200 dark:border-emerald-700/50 shrink-0">
                      {item.surahNumber.toString().padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        سورة {item.surahNameAr}
                      </h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                        بصوت: {item.reciterNameAr} ({item.riwayahName})
                      </span>
                      {item.positionSeconds > 0 && (
                        <span className="text-[10px] text-amber-600 dark:text-amber-300">
                          توقفت عند: {formatTime(item.positionSeconds)}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => playSurah(item.surahNumber, item.reciterId, 1, item.positionSeconds)}
                    className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>متابعة</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          TAB 5: FAVORITES (المفضلة)
          ========================================== */}
      {activeTab === 'favorites' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>تلاواتك وقراؤك المفضلون ({favorites.length})</span>
            </h3>
          </div>

          {favorites.length === 0 ? (
            <div className="text-center py-16 p-8 rounded-3xl bg-white dark:bg-emerald-950/50 border border-slate-200 dark:border-emerald-800/40">
              <Heart className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                لم تضف أي تلاوة أو قارئ للمفضلة بعد. انقر على رمز القلب في أي تلاوة لحفظها هنا.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {favorites.map((fav) => (
                <div
                  key={fav.id}
                  className="p-4 rounded-2xl bg-white dark:bg-emerald-950/70 border border-slate-200 dark:border-emerald-800/60 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/50 text-emerald-800 dark:text-amber-300 font-bold mb-1 inline-block">
                      {fav.type === 'reciter' ? 'قارئ' : 'تلاوة سورة'}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {fav.titleAr}
                    </h4>
                    {fav.subtitleAr && (
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                        {fav.subtitleAr}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (fav.type === 'reciter') {
                        setSelectedReciterSlug(fav.targetId);
                      } else {
                        const parts = fav.targetId.split(':');
                        const rId = parts[0];
                        const sNum = parseInt(parts[1], 10);
                        playSurah(sNum, rId);
                      }
                    }}
                    className="p-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white transition-colors shrink-0"
                    title="استماع / فتح"
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
