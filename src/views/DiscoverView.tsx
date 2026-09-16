import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass,
  Sparkles,
  BookOpen,
  ScrollText,
  Heart,
  Lightbulb,
  Award,
  Calendar,
  Share2,
  CheckCircle2,
  ChevronLeft,
  Bookmark,
  Library,
  ArrowRight,
  ShieldCheck,
  Flame,
  Clock,
  Tv,
  Play,
  Radio
} from 'lucide-react';
import { getDailyDiscoverFeed } from '../services/discoverService';
import { useUser } from '../context/UserContext';
import { useShareModal } from '../context/ShareContext';
import { IslamicChannel } from '../types/channel';
import { channelService } from '../services/channelService';

interface DiscoverViewProps {
  onSelectTab: (tab: string, id?: any) => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({ onSelectTab }) => {
  const { user, isAuthenticated, lastReading, isFavorite, toggleFavorite } = useUser();
  const { openShareModal } = useShareModal();

  // Channels state
  const [channels, setChannels] = useState<IslamicChannel[]>([]);
  const [activeChannelTab, setActiveChannelTab] = useState<'featured' | 'quran' | 'sunnah' | 'recent'>('featured');
  const [isLoadingChannels, setIsLoadingChannels] = useState(true);

  useEffect(() => {
    let isMounted = true;
    channelService.getChannels().then(data => {
      if (isMounted) {
        setChannels(data.filter(ch => ch.isActive));
        setIsLoadingChannels(false);
      }
    }).catch(err => {
      console.warn('Failed to load channels in discover:', err);
      if (isMounted) setIsLoadingChannels(false);
    });
    return () => { isMounted = false; };
  }, []);

  const featuredChannels = useMemo(() => channels.filter(c => c.isFeatured), [channels]);
  const quranChannels = useMemo(() => channels.filter(c => c.categorySlug === 'quran' || c.categoryName?.includes('قرآن') || c.name.includes('قرآن') || c.name.includes('مصحف')), [channels]);
  const sunnahChannels = useMemo(() => channels.filter(c => c.categorySlug === 'sunnah' || c.categorySlug === 'lectures' || c.categoryName?.includes('سنة') || c.name.includes('سنة') || c.name.includes('دروس')), [channels]);
  const recentChannels = useMemo(() => [...channels].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 6), [channels]);

  // Deterministic daily feed based on current date
  const feed = useMemo(() => getDailyDiscoverFeed(new Date()), []);

  // Share handlers
  const handleShareAyah = () => {
    openShareModal({
      type: 'quran',
      title: `آية اليوم — سورة ${feed.ayah.surahName}`,
      text: feed.ayah.text,
      subtext: `التفسير: ${feed.ayah.tafsir}`,
      reference: `سورة ${feed.ayah.surahName} [الآية ${feed.ayah.ayahNumber}]`,
      sourceUrl: typeof window !== 'undefined' ? window.location.href : 'https://waslislam.com/discover'
    });
  };

  const handleShareHadith = () => {
    openShareModal({
      type: 'hadith',
      title: 'حديث اليوم النبوي الشريف',
      text: feed.hadith.text,
      subtext: feed.hadith.explanation,
      reference: `${feed.hadith.source} (${feed.hadith.narrator})`,
      sourceUrl: typeof window !== 'undefined' ? window.location.href : 'https://waslislam.com/discover'
    });
  };

  const handleShareName = () => {
    openShareModal({
      type: 'allah_name',
      title: `اسم الله: ${feed.allahName.nameAr}`,
      text: `${feed.allahName.nameAr} — ${feed.allahName.meaningAr}`,
      subtext: feed.allahName.explanationAr,
      reference: feed.allahName.source,
      sourceUrl: typeof window !== 'undefined' ? window.location.href : 'https://waslislam.com/discover'
    });
  };

  const handleShareWisdom = () => {
    openShareModal({
      type: 'wisdom',
      title: `حكمة اليوم • ${feed.wisdom.category}`,
      text: feed.wisdom.text,
      subtext: feed.wisdom.author ? `القائل: ${feed.wisdom.author}` : undefined,
      reference: feed.wisdom.source,
      sourceUrl: typeof window !== 'undefined' ? window.location.href : 'https://waslislam.com/discover'
    });
  };

  return (
    <div className="space-y-8 pb-24 max-w-7xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-emerald-950/80 rounded-3xl p-6 sm:p-8 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>مختارات اليوم المجدولة والموثقة</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-amiri text-slate-900 dark:text-white">
              اكتشف — نَفَحَاتٌ يَوْمِيَّة
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              محتوى إسلامي منتقى بعناية يتجدد كل فجر تلقائياً بثبات وموثوقية، دون عشوائية في كل تحديث.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/40 px-4 py-2 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/50">
            <Calendar className="w-4 h-4" />
            <span>{feed.date}</span>
          </div>
        </div>
      </div>

      {/* Personalized Welcome & Status (if authenticated) */}
      {isAuthenticated && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-900/90 to-teal-950/90 text-white border border-emerald-700/50 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold">
              {user?.fullName ? user.fullName[0] : 'و'}
            </div>
            <div>
              <span className="text-xs text-emerald-300">أهلاً بك، {user?.fullName || 'عابد الرحمن'}</span>
              <h3 className="font-bold text-sm text-white">
                واصل رحلتك الإيمانية مع ورد اليوم والقرآن الكريم
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectTab('wird')}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs transition-colors shadow-sm"
            >
              متابعة الورد اليومي
            </button>
            {lastReading && (
              <button
                onClick={() => onSelectTab('quran', lastReading.surahNumber)}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors"
              >
                آخر موضع في المصحف ({lastReading.surahName})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Section 1: آية اليوم مع التفسير المعتمد */}
      <div className="bg-white dark:bg-emerald-950/80 rounded-3xl p-6 sm:p-8 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider block">
                تلاوة وتدبر
              </span>
              <h2 className="text-xl font-bold font-amiri text-slate-900 dark:text-white">
                آية اليوم — سورة {feed.ayah.surahName} [الآية {feed.ayah.ayahNumber}]
              </h2>
            </div>
          </div>

          <button
            onClick={handleShareAyah}
            className="p-2 rounded-xl text-slate-400 hover:text-emerald-600 bg-slate-50 dark:bg-emerald-900/30 transition-colors"
            title="مشاركة آية اليوم"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Ayah Quranic Calligraphy Block */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 text-center">
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold font-amiri text-emerald-950 dark:text-amber-200 leading-loose">
            ﴿ {feed.ayah.text} ﴾
          </p>
        </div>

        {/* Tafsir */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-emerald-900/30 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed border border-slate-100 dark:border-emerald-800/40">
          <strong className="text-emerald-900 dark:text-emerald-300 block mb-1">
            التفسير الميسر المعتمد:
          </strong>
          <p>{feed.ayah.tafsir}</p>
        </div>
      </div>

      {/* 2-Column Grid: حديث اليوم & اسم من أسماء الله الحسنى */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* حديث اليوم */}
        <div className="bg-white dark:bg-emerald-950/80 rounded-3xl p-6 sm:p-7 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                  <ScrollText className="w-5 h-5" />
                </span>
                <div>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block">
                    السنة النبوية
                  </span>
                  <h3 className="text-lg font-bold font-amiri text-slate-900 dark:text-white">
                    حديث اليوم
                  </h3>
                </div>
              </div>

              <button
                onClick={handleShareHadith}
                className="p-2 rounded-xl text-slate-400 hover:text-amber-600 bg-slate-50 dark:bg-emerald-900/30 transition-colors"
                title="مشاركة الحديث"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            <p className="text-base sm:text-lg font-amiri font-bold text-slate-800 dark:text-amber-200 leading-relaxed my-2">
              {feed.hadith.text}
            </p>

            {feed.hadith.explanation && (
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-3">
                {feed.hadith.explanation}
              </p>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-emerald-900/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{feed.hadith.source} ({feed.hadith.narrator})</span>
            <button
              onClick={() => onSelectTab('hadith')}
              className="text-emerald-700 dark:text-emerald-300 font-bold hover:underline flex items-center gap-1"
            >
              <span>المزيد في الأحاديث</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* اسم الله اليوم */}
        <div className="bg-white dark:bg-emerald-950/80 rounded-3xl p-6 sm:p-7 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300">
                  <Award className="w-5 h-5" />
                </span>
                <div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                    الأسماء الحسنى
                  </span>
                  <h3 className="text-lg font-bold font-amiri text-slate-900 dark:text-white">
                    اسم الله اليوم
                  </h3>
                </div>
              </div>

              <button
                onClick={handleShareName}
                className="p-2 rounded-xl text-slate-400 hover:text-emerald-600 bg-slate-50 dark:bg-emerald-900/30 transition-colors"
                title="مشاركة الاسم"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center my-3">
              <h4 className="text-3xl sm:text-4xl font-black font-amiri text-emerald-900 dark:text-amber-300">
                {feed.allahName.nameAr}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                {feed.allahName.meaningAr}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-emerald-900/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>الاسم #{feed.allahName.number}</span>
            <button
              onClick={() => onSelectTab('names-of-allah')}
              className="text-emerald-700 dark:text-emerald-300 font-bold hover:underline flex items-center gap-1"
            >
              <span>استكشف 99 اسماً</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3-Column Grid: ذكر اليوم، دعاء اليوم، حكمة اليوم */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ذكر اليوم */}
        <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 border border-emerald-900/10 dark:border-emerald-800/50 shadow-xs flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-2">
              <Sparkles className="w-4 h-4" />
              <span>ذكر اليوم</span>
            </div>
            <p className="font-amiri text-base font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
              «{feed.dhikr.text}»
            </p>
            {feed.dhikr.benefit && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {feed.dhikr.benefit}
              </p>
            )}
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-emerald-900/60 text-[11px] text-slate-400 flex justify-between items-center">
            <span>{feed.dhikr.source}</span>
            <button
              onClick={() => onSelectTab('azkar')}
              className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
            >
              الأذكار
            </button>
          </div>
        </div>

        {/* دعاء اليوم */}
        <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 border border-emerald-900/10 dark:border-emerald-800/50 shadow-xs flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400 mb-2">
              <Heart className="w-4 h-4" />
              <span>دعاء اليوم</span>
            </div>
            <p className="font-amiri text-base font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
              «{feed.dua.text}»
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-emerald-900/60 text-[11px] text-slate-400 flex justify-between items-center">
            <span>{feed.dua.source}</span>
            <button
              onClick={() => onSelectTab('dua')}
              className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
            >
              الأدعية
            </button>
          </div>
        </div>

        {/* حكمة اليوم */}
        <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 border border-emerald-900/10 dark:border-emerald-800/50 shadow-xs flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                <Lightbulb className="w-4 h-4" />
                <span>حكمة اليوم • {feed.wisdom.category}</span>
              </div>
              <button
                onClick={handleShareWisdom}
                className="text-slate-400 hover:text-amber-600"
                title="مشاركة الحكمة"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="font-amiri text-base font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
              «{feed.wisdom.text}»
            </p>
            {feed.wisdom.author && (
              <span className="text-xs text-slate-500 dark:text-slate-400 block mt-2">
                — {feed.wisdom.author}
              </span>
            )}
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-emerald-900/60 text-[11px] text-slate-400 flex justify-between items-center">
            <span>{feed.wisdom.source}</span>
            <button
              onClick={() => onSelectTab('wisdoms')}
              className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
            >
              المواعظ
            </button>
          </div>
        </div>
      </div>

      {/* 2-Column: محتوى من السيرة النبوية & كتاب اليوم من المكتبة */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seerah Highlight */}
        <div className="bg-white dark:bg-emerald-950/80 rounded-3xl p-6 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>محطة من السيرة النبوية ﷺ</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 font-bold">
              {feed.seerahHighlight.eraTitleAr}
            </span>
          </div>

          <h3 className="text-xl font-bold font-amiri text-slate-900 dark:text-amber-300">
            {feed.seerahHighlight.title}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
            {feed.seerahHighlight.summary}
          </p>

          <div className="pt-3 border-t border-slate-100 dark:border-emerald-900/60 flex items-center justify-between text-xs">
            <span className="text-slate-400">{feed.seerahHighlight.source}</span>
            <button
              onClick={() => onSelectTab('seerah')}
              className="text-emerald-700 dark:text-emerald-300 font-bold hover:underline flex items-center gap-1"
            >
              <span>عرض خط السيرة الزمني</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Library Book Pick */}
        {feed.libraryPick && (
          <div className="bg-white dark:bg-emerald-950/80 rounded-3xl p-6 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <Library className="w-4 h-4 text-emerald-600" />
                <span>مختارات من المكتبة الإسلامية</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 font-bold">
                {feed.libraryPick.category}
              </span>
            </div>

            <h3 className="text-xl font-bold font-amiri text-slate-900 dark:text-amber-300">
              {feed.libraryPick.title}
            </h3>
            <span className="text-xs text-slate-500 block">
              {feed.libraryPick.author}
            </span>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
              {feed.libraryPick.description}
            </p>

            <div className="pt-3 border-t border-slate-100 dark:border-emerald-900/60 flex items-center justify-between text-xs">
              <span className="text-slate-400">{feed.libraryPick.license}</span>
              <button
                onClick={() => onSelectTab('library')}
                className="text-emerald-700 dark:text-emerald-300 font-bold hover:underline flex items-center gap-1"
              >
                <span>قراءة الكتاب الآن</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Islamic Channels Discovery Section */}
      <div className="bg-white dark:bg-emerald-950/80 rounded-3xl p-6 sm:p-8 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Tv className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  بث مباشر 24/7
                </span>
                <span className="text-xs text-slate-400">بث عالي الدقة HLS</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-amiri text-slate-900 dark:text-white mt-1">
                القنوات الإسلامية والبث المباشر
              </h2>
            </div>
          </div>

          <button
            onClick={() => onSelectTab('channels')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 font-bold text-xs transition-colors self-start sm:self-center"
          >
            <span>عرض جميع القنوات</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-100 dark:border-emerald-900/40">
          <button
            onClick={() => setActiveChannelTab('featured')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              activeChannelTab === 'featured'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-emerald-900/30'
            }`}
          >
            ⭐ قنوات مميزة ({featuredChannels.length})
          </button>
          <button
            onClick={() => setActiveChannelTab('quran')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              activeChannelTab === 'quran'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-emerald-900/30'
            }`}
          >
            📖 قنوات القرآن ({quranChannels.length})
          </button>
          <button
            onClick={() => setActiveChannelTab('sunnah')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              activeChannelTab === 'sunnah'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-emerald-900/30'
            }`}
          >
            🕌 السنة النبوية والدروس ({sunnahChannels.length})
          </button>
          <button
            onClick={() => setActiveChannelTab('recent')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              activeChannelTab === 'recent'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-emerald-900/30'
            }`}
          >
            ✨ مضاف حديثاً ({recentChannels.length})
          </button>
        </div>

        {/* Channels Grid / Content */}
        {isLoadingChannels ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 rounded-2xl bg-slate-100 dark:bg-emerald-900/30 animate-pulse" />
            ))}
          </div>
        ) : (
          (() => {
            const currentList =
              activeChannelTab === 'featured' ? (featuredChannels.length > 0 ? featuredChannels : channels) :
              activeChannelTab === 'quran' ? quranChannels :
              activeChannelTab === 'sunnah' ? sunnahChannels :
              recentChannels;

            if (currentList.length === 0) {
              return (
                <div className="text-center py-10 bg-slate-50 dark:bg-emerald-900/20 rounded-2xl border border-dashed border-slate-200 dark:border-emerald-800">
                  <Tv className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    لا توجد قنوات في هذا القسم حالياً
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    يمكن للمشرف إضافة قنوات جديدة من لوحة التحكم
                  </p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentList.map(channel => (
                  <div
                    key={channel.id}
                    onClick={() => onSelectTab('channels', channel.slug)}
                    className="group flex items-center justify-between p-4 rounded-2xl bg-slate-50/80 dark:bg-emerald-900/30 border border-slate-100 dark:border-emerald-800/40 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-white dark:bg-emerald-950 border border-slate-200 dark:border-emerald-800 flex items-center justify-center overflow-hidden flex-shrink-0 relative shadow-xs">
                        {channel.logoUrl ? (
                          <img
                            src={channel.logoUrl}
                            alt={channel.name}
                            className="w-full h-full object-contain p-1"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <Tv className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        )}
                        <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-rose-500 border border-white dark:border-slate-900" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-700 dark:group-hover:text-amber-300 transition-colors">
                            {channel.name}
                          </h4>
                          {channel.isFeatured && (
                            <span className="text-[10px] text-amber-500 flex-shrink-0" title="قناة مميزة">★</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {channel.categoryName || 'قناة إسلامية'} {channel.country ? `• ${channel.country}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-800/60 text-emerald-800 dark:text-emerald-200 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-700 group-hover:text-white transition-all shadow-xs mr-2">
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </div>
                  </div>
                ))}
              </div>
            );
          })()
        )}
      </div>

      {/* Featured Platform Capability Callout */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-emerald-950 to-emerald-900 text-white border border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-amber-300 font-bold block mb-1">ميزة منصة وصل المقترحة</span>
          <h3 className="text-xl font-bold font-amiri text-white">
            {feed.featureHighlight.title}
          </h3>
          <p className="text-xs text-emerald-200 mt-1 max-w-xl">
            {feed.featureHighlight.desc}
          </p>
        </div>

        <button
          onClick={() => onSelectTab(feed.featureHighlight.targetTab)}
          className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs transition-colors whitespace-nowrap self-start sm:self-center shadow-sm"
        >
          تجربة الميزة الآن
        </button>
      </div>
    </div>
  );
};
