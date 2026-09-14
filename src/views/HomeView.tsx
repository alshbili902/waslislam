import React, { useEffect, useState, useMemo } from 'react';
import {
  BookOpen,
  Heart,
  Sparkles,
  Compass,
  Calendar,
  Layers,
  Play,
  Pause,
  Share2,
  Bookmark,
  ChevronLeft,
  Volume2,
  Clock,
  Flame,
  ArrowRight,
  ShieldCheck,
  Check,
  Radio,
  Copy,
  HandHeart,
  Award,
  Quote,
  MapPin,
  Library
} from 'lucide-react';
import { fetchPrayerTimes, calculateNextPrayer, POPULAR_CITIES, SAUDI_REGIONS } from '../services/prayerService';
import { PrayerTimesData, NextPrayerInfo } from '../types';
import { IslamicWisdom } from '../types/wisdom';
import { wisdomService } from '../services/wisdomService';
import { HADITH_DATA } from '../data/hadithData';
import { DUA_DATA } from '../data/duaData';
import { SURAHS_LIST } from '../data/quranMetadata';
import { ALLAH_NAMES_DATA } from '../data/allahNamesData';
import { getDailyDiscoverFeed } from '../services/discoverService';
import { useAudio } from '../context/AudioContext';
import { useRadio } from '../context/RadioContext';
import { useUser } from '../context/UserContext';
import { useShareModal } from '../context/ShareContext';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { RadioStationBadge } from '../components/RadioStationBadge';

interface Props {
  onNavigate: (tab: string, contextId?: any) => void;
}

export const HomeView: React.FC<Props> = ({ onNavigate }) => {
  const { playAyah } = useAudio();
  const {
    currentStation,
    isPlaying: isRadioPlaying,
    togglePlay: toggleRadioPlay,
    playStation,
    stations
  } = useRadio();
  const { lastReading, toggleFavorite, isFavorite } = useUser();


  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesData | null>(null);
  const [nextPrayer, setNextPrayer] = useState<NextPrayerInfo | null>(null);
  const [selectedCity, setSelectedCity] = useState(POPULAR_CITIES[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { openShareModal } = useShareModal();
  const [dailyWisdom, setDailyWisdom] = useState<IslamicWisdom | null>(null);
  const dailyFeed = useMemo(() => getDailyDiscoverFeed(new Date()), []);

  // Daily Ayah: Ayat Al-Kursi (Al-Baqarah 255)
  const dailyAyah = {
    surahNumber: 2,
    surahNameAr: 'البقرة',
    ayahNumber: 255,
    textAr: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    tafsirAr: 'الله الذي لا يستحق الألوهية والعبودية إلا هو، الحي القيوم القائم على كل شيء، لا يعتريه نعاس ولا نوم، وسع سلطانه وعلمه السماوات والأرض.'
  };

  // Daily Hadith
  const dailyHadith = HADITH_DATA[0];

  useEffect(() => {
    wisdomService.getDailyWisdom().then((w) => setDailyWisdom(w));
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadTimes() {
      const data = await fetchPrayerTimes(selectedCity.lat, selectedCity.lng, selectedCity.method, selectedCity.nameAr);
      if (isMounted) {
        setPrayerTimes(data);
        setNextPrayer(calculateNextPrayer(data));
      }
    }

    loadTimes();

    const interval = setInterval(() => {
      if (prayerTimes) {
        setNextPrayer(calculateNextPrayer(prayerTimes));
      }
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedCity]);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePlayDailyAyah = () => {
    const meta = SURAHS_LIST.find((s) => s.number === 2) || SURAHS_LIST[1];
    playAyah(meta, {
      number: 262, // Global Ayah number for 2:255
      numberInSurah: 255,
      text: dailyAyah.textAr,
      juz: 3,
      manzil: 1,
      page: 42,
      ruku: 35,
      hizbQuarter: 9,
      sajda: false,
      audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/262.mp3',
      tafsir: dailyAyah.tafsirAr
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-950 to-teal-950 text-white p-6 sm:p-10 shadow-xl border border-emerald-800/40">
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/60 border border-emerald-600/40 text-emerald-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>مرحباً بك في منصة وصل الإسلامية</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold font-amiri leading-snug">
              ﴿أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ﴾
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
              منصتك الرقمية المتكاملة للقرآن الكريم، الأذكار الصحيحة، الأحاديث النبوية الموثقة، ومواقيت الصلاة الدقيقة.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('quran')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
              >
                <BookOpen className="w-4 h-4" />
                <span>تلاوة القرآن الكريم</span>
              </button>
              <button
                onClick={() => onNavigate('azkar')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm border border-emerald-600/50 transition-all"
              >
                <Heart className="w-4 h-4 text-amber-300" />
                <span>أذكار اليوم والليلة</span>
              </button>
              <PWAInstallButton variant="hero" />
            </div>
          </div>

          {/* Quick Last Reading Card */}
          {lastReading && (
            <div className="bg-emerald-800/50 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-emerald-600/30 text-right min-w-[240px] shrink-0">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs text-emerald-300 font-medium">متابعة القراءة السابقة</span>
                <Bookmark className="w-4 h-4 text-amber-300" />
              </div>
              <h3 className="font-bold text-base text-white">
                سورة {lastReading.surahNameAr}
              </h3>
              <p className="text-xs text-emerald-200 mt-0.5">
                توقفت عند الآية {lastReading.ayahNumber}
              </p>
              <button
                onClick={() => onNavigate('quran', lastReading.surahNumber)}
                className="mt-3 w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>مواصلة التلاوة</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Prayer Times & Next Prayer Strip */}
      <section className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 sm:p-6 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-emerald-900/60">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                مواقيت الصلاة في السعودية
              </h2>
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/40 px-2.5 py-0.5 rounded-full border border-emerald-600/20">
                {selectedCity.nameAr}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {prayerTimes ? `${prayerTimes.dateHijri.weekdayAr} ${prayerTimes.dateHijri.day} ${prayerTimes.dateHijri.monthAr} ${prayerTimes.dateHijri.year} هـ • ${prayerTimes.dateGregorian} • توقيت أم القرى` : 'جاري جلب المواقيت...'}
            </p>
          </div>

          {/* City Quick Picker */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCity.nameEn}
              onChange={(e) => {
                const found = POPULAR_CITIES.find((c) => c.nameEn === e.target.value);
                if (found) setSelectedCity(found);
              }}
              className="text-xs font-medium bg-slate-50 dark:bg-emerald-900/50 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-emerald-700/60 focus:outline-hidden cursor-pointer"
            >
              {SAUDI_REGIONS.map((region) => (
                <optgroup key={region} label={region}>
                  {POPULAR_CITIES.filter((c) => c.regionAr === region).map((c) => (
                    <option key={c.nameEn} value={c.nameEn}>
                      {c.nameAr}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <button
              onClick={() => onNavigate('prayer')}
              className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>القبلة والتفاصيل</span>
              <ChevronLeft className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Countdown Banner */}
        {nextPrayer && (
          <div className="my-4 p-3.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/40 dark:to-teal-900/30 border border-emerald-100 dark:border-emerald-800/40 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs sm:text-sm font-semibold text-emerald-950 dark:text-emerald-100">
                الصلاة القادمة: <strong className="text-emerald-700 dark:text-amber-400">{nextPrayer.nextPrayerAr}</strong> في تمام الساعة {nextPrayer.nextPrayerTime}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 dark:text-slate-300">متبقي للأذان:</span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-800 text-amber-300 font-mono text-xs sm:text-sm font-bold tracking-wider">
                {nextPrayer.formattedCountdown}
              </span>
            </div>
          </div>
        )}

        {/* Prayer Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 mt-4">
          {[
            { key: 'fajr', name: 'الفجر', time: prayerTimes?.fajr || '--:--' },
            { key: 'sunrise', name: 'الشروق', time: prayerTimes?.sunrise || '--:--' },
            { key: 'dhuhr', name: 'الظهر', time: prayerTimes?.dhuhr || '--:--' },
            { key: 'asr', name: 'العصر', time: prayerTimes?.asr || '--:--' },
            { key: 'maghrib', name: 'المغرب', time: prayerTimes?.maghrib || '--:--' },
            { key: 'isha', name: 'العشاء', time: prayerTimes?.isha || '--:--' }
          ].map((item) => {
            const isNext = nextPrayer?.nextPrayerAr === item.name;
            return (
              <div
                key={item.key}
                className={`p-3 rounded-xl text-center border transition-all ${
                  isNext
                    ? 'bg-emerald-800 text-white border-emerald-600 shadow-md scale-102'
                    : 'bg-slate-50 dark:bg-emerald-900/30 text-slate-800 dark:text-slate-200 border-slate-100 dark:border-emerald-900/40'
                }`}
              >
                <span className={`text-xs block mb-1 font-medium ${isNext ? 'text-amber-300' : 'text-slate-500 dark:text-slate-400'}`}>
                  {item.name}
                </span>
                <span className="text-base sm:text-lg font-bold font-mono">
                  {item.time}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Daily Wird Feature Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#073c30] via-[#042820] to-[#021813] text-white p-5 sm:p-7 shadow-lg border border-emerald-500/25">
        <div className="absolute inset-0 bg-islamic-pattern opacity-10 pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5 text-right w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>برنامجك الإيماني اليومي</span>
              </span>
              <span className="text-xs text-emerald-200/80">٥ أجزاء ميسرة وموثقة</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-tajawal text-white">
              ورد اليوم
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl">
              خذ من يومك دقائق تقرّبك إلى الله: آيات مباركة، أذكار مأثورة، حديث صحيح، دعاء مأثور، وتسبيح.
            </p>
          </div>

          <div className="w-full sm:w-auto flex items-center justify-end shrink-0">
            <button
              onClick={() => onNavigate('wird')}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm shadow-xl transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>ابدأ وردك الآن</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Selected Platform Highlights (اسم الله اليوم، اكتشف نفحات اليوم، صيامي، المكتبة) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Highlight 1: اسم الله اليوم */}
        <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 border border-emerald-900/10 dark:border-emerald-800/50 shadow-xs flex flex-col justify-between group hover:border-emerald-500/50 transition-all">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800">
                اسم الله اليوم
              </span>
              <span className="text-[10px] text-slate-400 font-mono">#{dailyFeed.allahName.number}</span>
            </div>
            <h3 className="text-2xl font-bold font-amiri text-emerald-900 dark:text-amber-300 group-hover:scale-105 transition-transform origin-right">
              {dailyFeed.allahName.nameAr}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
              {dailyFeed.allahName.meaningAr}
            </p>
          </div>
          <button
            onClick={() => onNavigate('names-of-allah')}
            className="mt-3 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1 self-start"
          >
            <span>استكشف 99 اسماً</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Highlight 2: اكتشف نفحات اليوم */}
        <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 border border-emerald-900/10 dark:border-emerald-800/50 shadow-xs flex flex-col justify-between group hover:border-emerald-500/50 transition-all">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                نفحات اليوم
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              اكتشف مختارات اليوم
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
              آية اليوم، حديث نبوي، أذكار مأثورة، ومقتطف من السيرة النبوية يتجدد كل فجر.
            </p>
          </div>
          <button
            onClick={() => onNavigate('discover')}
            className="mt-3 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1 self-start"
          >
            <span>عرض مختارات اليوم</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Highlight 3: سجل صيامي */}
        <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 border border-emerald-900/10 dark:border-emerald-800/50 shadow-xs flex flex-col justify-between group hover:border-emerald-500/50 transition-all">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                صيامي
              </span>
              <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              سجل الصيام والتقويم
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
              تابع صيام الفريضة والقضاء والنوافل وأيام البيض بخصوصية واحتسب الأجر.
            </p>
          </div>
          <button
            onClick={() => onNavigate('fasting')}
            className="mt-3 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1 self-start"
          >
            <span>فتح سجل الصيام</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Highlight 4: المكتبة الإسلامية */}
        <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 border border-emerald-900/10 dark:border-emerald-800/50 shadow-xs flex flex-col justify-between group hover:border-emerald-500/50 transition-all">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                المكتبة
              </span>
              <Library className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              المكتبة الإسلامية الجامعة
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
              قراءة مريحة لأمهات الكتب في التفسير والحديث والفقه والعقيدة والسيرة.
            </p>
          </div>
          <button
            onClick={() => onNavigate('library')}
            className="mt-3 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1 self-start"
          >
            <span>تصفح الكتب</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>


      {/* Quran Radio Live Banner Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-950 to-teal-950 text-white p-5 sm:p-7 shadow-lg border border-emerald-700/50">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <RadioStationBadge
              size="lg"
              stationName={currentStation?.name || 'إذاعة القرآن الكريم'}
              categorySlug={currentStation?.categorySlug}
              isPlaying={isRadioPlaying}
            />

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-800/80 text-[11px] font-bold text-emerald-300 border border-emerald-700/60">
                  <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isRadioPlaying ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`} />
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isRadioPlaying ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  </span>
                  <span>إذاعة القرآن الكريم</span>
                </span>
                <span className="text-[11px] text-emerald-200/80 font-medium">
                  {stations.filter((s) => s.isActive).length}+ محطة وإذاعة مباشرة
                </span>
              </div>

              <h2 className="text-base sm:text-xl font-bold text-white truncate">
                {currentStation ? currentStation.name : 'إذاعة القرآن الكريم العامة'}
              </h2>
              <p className="text-xs text-emerald-200/80 line-clamp-1">
                {currentStation?.reciterNameAr || 'استمع إلى تلاوات القرآن الكريم مباشرة على مدار الساعة بأعذب الأصوات'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end shrink-0">
            <button
              onClick={() => {
                if (currentStation) {
                  toggleRadioPlay();
                } else if (stations.length > 0) {
                  playStation(stations[0]);
                }
              }}
              className="h-11 px-5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
            >
              {isRadioPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>إيقاف مؤقت</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>استماع مباشر</span>
                </>
              )}
            </button>

            <button
              onClick={() => onNavigate('quran-radio')}
              className="h-11 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 flex items-center gap-1.5 transition-colors"
            >
              <span>جميع الإذاعات</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Daily Spiritual Cards (Daily Ayah & Daily Hadith) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Ayah */}
        <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 sm:p-6 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-900/60 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  آية اليوم الكريمة
                </h3>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-medium">
                سورة {dailyAyah.surahNameAr} • الآية {dailyAyah.ayahNumber}
              </span>
            </div>

            <p className="font-scheherazade text-xl sm:text-2xl leading-loose text-slate-900 dark:text-emerald-50 my-4 text-center">
              {dailyAyah.textAr}
            </p>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-emerald-900/30 border border-slate-100 dark:border-emerald-900/50 text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              <strong className="text-emerald-800 dark:text-emerald-300 block mb-1">المعنى والتفسير الميسر:</strong>
              {dailyAyah.tafsirAr}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-emerald-900/60">
            <button
              onClick={handlePlayDailyAyah}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800 text-white text-xs font-medium hover:bg-emerald-700 transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>استماع للتلاوة</span>
            </button>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleCopyText('daily-ayah', dailyAyah.textAr)}
                className="p-2 rounded-xl text-slate-500 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-emerald-900/40 transition-colors"
                title="نسخ نص الآية"
              >
                {copiedId === 'daily-ayah' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={() =>
                  openShareModal({
                    type: 'quran',
                    sectionName: 'القرآن الكريم',
                    contentType: 'آية',
                    content: dailyAyah.textAr,
                    text: dailyAyah.textAr,
                    surahName: dailyAyah.surahNameAr,
                    ayahNumber: dailyAyah.ayahNumber,
                    source: `سورة ${dailyAyah.surahNameAr} • الآية ${dailyAyah.ayahNumber}`,
                    title: `آية اليوم: سورة ${dailyAyah.surahNameAr}`
                  })
                }
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-800 transition-colors font-medium text-xs"
                title="مشاركة الآية كصورة"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>مشاركة كصورة</span>
              </button>
              <button
                onClick={() => onNavigate('quran', 2)}
                className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>المصحف</span>
                <ChevronLeft className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Daily Hadith */}
        <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 sm:p-6 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-900/60 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  الحديث النبوي الشريف
                </h3>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 font-medium">
                {dailyHadith.gradingAr}
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              عن {dailyHadith.narratorAr}
            </p>

            <p className="font-amiri text-base sm:text-lg leading-relaxed text-slate-900 dark:text-emerald-50 my-3">
              {dailyHadith.textAr}
            </p>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-emerald-900/30 border border-slate-100 dark:border-emerald-900/50 text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              <strong className="text-amber-800 dark:text-amber-300 block mb-1">الشرح والفائدة:</strong>
              {dailyHadith.explanationAr}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-emerald-900/60">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              المصدر: {dailyHadith.collectionAr}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleCopyText('daily-hadith', dailyHadith.textAr)}
                className="p-2 rounded-xl text-slate-500 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-emerald-900/40 transition-colors"
                title="نسخ نص الحديث"
              >
                {copiedId === 'daily-hadith' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={() =>
                  openShareModal({
                    type: 'hadith',
                    sectionName: 'الأحاديث النبوية',
                    contentType: 'حديث',
                    content: dailyHadith.textAr,
                    text: dailyHadith.textAr,
                    source: `${dailyHadith.collectionAr} (${dailyHadith.gradingAr})`,
                    narrator: dailyHadith.narratorAr,
                    title: 'حديث اليوم الشريف'
                  })
                }
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-900/50 text-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-800 transition-colors font-medium text-xs"
                title="مشاركة الحديث كصورة"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>مشاركة كصورة</span>
              </button>
              <button
                onClick={() => onNavigate('hadith')}
                className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>الأحاديث</span>
                <ChevronLeft className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Daily Wisdom Section */}
      {dailyWisdom && (
        <section className="bg-gradient-to-l from-emerald-950/90 via-emerald-900/60 to-emerald-950/90 rounded-2xl p-5 sm:p-6 border border-amber-500/25 shadow-sm text-right text-white">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-400/20 text-amber-300">
                <Quote className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                حِكْمَةُ اليَوْم
              </h3>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-800 text-emerald-200 font-bold border border-emerald-700">
              {dailyWisdom.category}
            </span>
          </div>

          <p className="font-amiri text-base sm:text-lg leading-relaxed text-amber-50 my-2 select-text">
            {dailyWisdom.content}
          </p>

          {dailyWisdom.author && (
            <p className="text-xs text-emerald-300 font-bold mb-1">
              — {dailyWisdom.author}
            </p>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs mt-2">
            <span className="text-slate-300 text-[11px] truncate max-w-[60%]">
              المصدر: {dailyWisdom.source} {dailyWisdom.reference ? `(${dailyWisdom.reference})` : ''}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  openShareModal({
                    type: 'wisdom',
                    sectionName: 'الحِكَم والمواعظ',
                    contentType: 'حكمة',
                    content: dailyWisdom.content,
                    text: dailyWisdom.content,
                    source: dailyWisdom.author ? `${dailyWisdom.author} — ${dailyWisdom.source}` : dailyWisdom.source,
                    title: `حكمة اليوم في ${dailyWisdom.category}`
                  })
                }
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/30 transition-colors font-bold text-xs cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>مشاركة</span>
              </button>

              <button
                onClick={() => onNavigate('wisdoms')}
                className="inline-flex items-center gap-1 text-emerald-300 hover:text-white font-bold text-xs"
              >
                <span>المزيد</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Quick Navigation Modules Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>خدمات وصل الإسلامية</span>
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            جميع الأقسام مدعومة بالعمل دون اتصال
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {[
            { id: 'quran', title: 'القرآن الكريم', desc: 'تلاوة، تفسير، واستماع', icon: BookOpen, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/40' },
            { id: 'wisdoms', title: 'الحِكَم والمواعظ', desc: 'كلمات نافعة وتذكير إيماني', icon: Quote, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30' },
            { id: 'quran-radio', title: 'إذاعة القرآن', desc: 'بث مباشر متواصل 24 ساعة', icon: Radio, color: 'text-teal-600 bg-teal-50 dark:bg-teal-900/40' },
            { id: 'azkar', title: 'حصن المسلم', desc: 'أذكار الصباح والمساء', icon: Heart, color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/30' },
            { id: 'hadith', title: 'السنة المطهرة', desc: 'أحاديث نبوية موثقة', icon: Sparkles, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30' },
            { id: 'dua', title: 'أدعية مأثورة', desc: 'جوامع الكلم من الكتاب والسنة', icon: Heart, color: 'text-teal-600 bg-teal-50 dark:bg-teal-900/30' },
            { id: 'tasbih', title: 'المسبحة الذكية', desc: 'عداد الأذكار والاستغفار', icon: Layers, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30' },
            { id: 'fatwa', title: 'الفتاوى والمعرفة', desc: 'فتاوى ومقالات معتمدة', icon: ShieldCheck, color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/30' },
            { id: 'donations', title: 'الصدقة والتبرع', desc: 'منصات وطنية رسمية موثقة', icon: HandHeart, color: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/40' },
            { id: 'binbaz', title: 'موقع ابن باز', desc: 'الموقع الرسمي للشيخ رحمه الله', icon: Award, color: 'text-amber-700 bg-amber-50 dark:bg-amber-900/40' }
          ].map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                onClick={() => onNavigate(mod.id)}
                className="group p-4 rounded-2xl bg-white dark:bg-emerald-950/80 border border-slate-200/80 dark:border-emerald-800/40 hover:border-emerald-600/40 hover:shadow-md transition-all cursor-pointer text-right flex flex-col justify-between"
              >
                <div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${mod.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-amber-300 transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {mod.desc}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mt-3 pt-2 border-t border-slate-100 dark:border-emerald-900/50">
                  <span>تصفح</span>
                  <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
