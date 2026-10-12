'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Clock, 
  Compass, 
  Sparkles, 
  Share2, 
  Bookmark, 
  CheckCircle2, 
  Volume2, 
  Calendar, 
  Layers, 
  ChevronLeft,
  MapPin,
  Navigation,
  Calculator
} from 'lucide-react';
import { IconKidsLearning, IconDuaHands } from './icons/IslamicIcons';
import { calculatePrayerTimes, getHijriDate, CITIES, type CityCoordinate } from '../utils/prayerTimes';
import { getRamadanCountdownDetails, type RamadanCountdownDetails } from '../utils/ramadanCountdown';
import { format12HourTime, findClosestCity } from '../utils/timeFormat';
import { NavTab } from './Navbar';
import { AudioTrack } from './AudioPlayerBar';
import { VERIFIED_OFFLINE_SURAHS, getAyahAudioUrl } from '../data/quranMetadata';
import { AUTHENTIC_HADITHS } from '../data/hadithData';
import { ADHKAR_DATA } from '../data/adhkarData';
import { BrandLogo } from './BrandLogo';
import { EmailSubscriptionCard } from './notifications/EmailSubscriptionCard';
import { ScrollReveal } from './motion/ScrollReveal';

interface HomeDashboardProps {
  onSelectTab: (tab: NavTab) => void;
  onPlayTrack: (track: AudioTrack) => void;
  onOpenShareCard: (content: { title: string; text: string; source: string; category: string }) => void;
  selectedCity: CityCoordinate;
  onChangeCity: (city: CityCoordinate) => void;
  isEnglish: boolean;
  khatmahProgress: { currentPage: number; totalPages: number; targetDays: number };
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onSelectTab,
  onPlayTrack,
  onOpenShareCard,
  selectedCity,
  onChangeCity,
  isEnglish,
  khatmahProgress
}) => {
  const [mounted, setMounted] = useState(false);
  const [prayerData, setPrayerData] = useState(() => calculatePrayerTimes(selectedCity.lat, selectedCity.lng, selectedCity.timezone));
  const [hijriInfo, setHijriInfo] = useState(() => getHijriDate());
  const [ramadanInfo, setRamadanInfo] = useState<RamadanCountdownDetails>(() => getRamadanCountdownDetails());
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Live second-by-second updates for prayer countdown, clock times, and Ramadan countdown
  useEffect(() => {
    if (!mounted) return;
    const updateTick = () => {
      const now = new Date();
      setPrayerData(calculatePrayerTimes(selectedCity.lat, selectedCity.lng, selectedCity.timezone, now));
      setRamadanInfo(getRamadanCountdownDetails(now));
      setHijriInfo(getHijriDate(now));
    };

    updateTick();
    const timer = setInterval(updateTick, 1000);
    return () => clearInterval(timer);
  }, [selectedCity, mounted]);

  // Geolocation handler to detect closest city
  const handleDetectLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      alert(isEnglish ? 'Geolocation is not supported by your browser.' : 'خاصية تحديد الموقع غير مدعومة في متصفحك.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const closest = findClosestCity(pos.coords.latitude, pos.coords.longitude);
        onChangeCity(closest);
      },
      (err) => {
        setIsLocating(false);
        alert(isEnglish ? 'Location access was denied or timed out.' : 'تعذر الوصول إلى الموقع الجغرافي. يرجى اختيار مدينتك يدوياً.');
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  // Daily Quran Verse, Authentic Hadith, and Dhikr rotation derived from calendar day of year
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);

  const verifiedAyahsPool = [
    ...(VERIFIED_OFFLINE_SURAHS[1] || []).map(a => ({ surah: 1, surahNameAr: 'الفاتحة', surahNameEn: 'Al-Faatiha', ayah: a })),
    ...(VERIFIED_OFFLINE_SURAHS[112] || []).map(a => ({ surah: 112, surahNameAr: 'الإخلاص', surahNameEn: 'Al-Ikhlas', ayah: a })),
    ...(VERIFIED_OFFLINE_SURAHS[113] || []).map(a => ({ surah: 113, surahNameAr: 'الفلق', surahNameEn: 'Al-Falaq', ayah: a })),
    ...(VERIFIED_OFFLINE_SURAHS[114] || []).map(a => ({ surah: 114, surahNameAr: 'الناس', surahNameEn: 'An-Naas', ayah: a })),
  ];

  const dailyAyahObj = verifiedAyahsPool.length > 0
    ? verifiedAyahsPool[Math.abs(dayOfYear) % verifiedAyahsPool.length]
    : { surah: 1, surahNameAr: 'الفاتحة', surahNameEn: 'Al-Faatiha', ayah: VERIFIED_OFFLINE_SURAHS[1][0] };

  const dailyAyah = dailyAyahObj.ayah;
  const dailyHadith = AUTHENTIC_HADITHS[Math.abs(dayOfYear) % AUTHENTIC_HADITHS.length];
  const dailyDhikr = ADHKAR_DATA[Math.abs(dayOfYear) % ADHKAR_DATA.length];

  const khatmahPercentage = Math.round((khatmahProgress.currentPage / khatmahProgress.totalPages) * 100);

  return (
    <div className="space-y-6 pb-20 w-full max-w-full min-w-0">
      {/* Hero Welcome & Dates Banner */}
      <ScrollReveal variant="scale">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--primary)] via-[#064e3b] to-[var(--gold-hover)] text-white p-5 sm:p-8 shadow-xl max-w-full wasl-card wasl-card-hover">
        <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 max-w-full max-h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_70%)] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6 min-w-0 w-full">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <BrandLogo size="lg" className="hidden sm:flex shrink-0 drop-shadow-xl" />
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] sm:text-xs font-semibold mb-3 max-w-full flex-wrap">
                <Calendar className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span suppressHydrationWarning className="truncate">{hijriInfo.formattedAr}</span>
                <span className="text-white/40 hidden sm:inline">|</span>
                <span suppressHydrationWarning className="text-emerald-100 hidden sm:inline truncate">
                  {mounted ? new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black font-cairo tracking-tight truncate">
                {isEnglish ? 'Welcome to Wasl Islamic' : 'مرحباً بك في وَصْل الإسلامية'}
              </h1>
              <p className="text-emerald-100/90 text-xs sm:text-sm md:text-base font-tajawal max-w-xl mt-1 leading-relaxed">
                {isEnglish 
                  ? 'Your all-in-one companion for the Noble Quran, authentic Hadith, worship tracking, and daily remembrance.' 
                  : 'منصتك الموثوقة لتلاوة وتدبر القرآن الكريم، وتتبع الصلوات والختمة، والاستزادة من العلوم الشرعية الأصيلة.'}
              </p>
            </div>
          </div>

          {/* Authentic Live Ramadan Multi-Unit Countdown Badge */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 sm:p-4 text-center shrink-0 w-full sm:w-auto sm:min-w-[260px] flex flex-col justify-between shadow-lg">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-xs text-amber-200 font-bold block truncate">
                {isEnglish ? 'Ramadan Countdown' : 'العد التنازلي لشهر رمضان'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/20 text-amber-300 font-bold shrink-0 border border-white/10">
                {mounted ? (isEnglish ? ramadanInfo.statusBadgeEn : ramadanInfo.statusBadgeAr) : '...'}
              </span>
            </div>

            {/* Live 4-box Countdown Grid: Days / Hours / Mins / Secs */}
            <div className="grid grid-cols-4 gap-1.5 my-1.5 font-mono">
              <div className="bg-black/30 rounded-xl p-1.5 border border-white/10">
                <span className="text-xl sm:text-2xl font-black text-amber-300 block leading-tight">
                  {mounted ? ramadanInfo.days : '--'}
                </span>
                <span className="text-[9px] text-emerald-100 uppercase block font-tajawal">
                  {isEnglish ? 'Days' : 'يوم'}
                </span>
              </div>
              <div className="bg-black/30 rounded-xl p-1.5 border border-white/10">
                <span className="text-xl sm:text-2xl font-black text-amber-300 block leading-tight">
                  {mounted ? String(ramadanInfo.hours).padStart(2, '0') : '--'}
                </span>
                <span className="text-[9px] text-emerald-100 uppercase block font-tajawal">
                  {isEnglish ? 'Hours' : 'ساعة'}
                </span>
              </div>
              <div className="bg-black/30 rounded-xl p-1.5 border border-white/10">
                <span className="text-xl sm:text-2xl font-black text-amber-300 block leading-tight">
                  {mounted ? String(ramadanInfo.minutes).padStart(2, '0') : '--'}
                </span>
                <span className="text-[9px] text-emerald-100 uppercase block font-tajawal">
                  {isEnglish ? 'Mins' : 'دقيقة'}
                </span>
              </div>
              <div className="bg-black/30 rounded-xl p-1.5 border border-white/10">
                <span className="text-xl sm:text-2xl font-black text-amber-300 block leading-tight">
                  {mounted ? String(ramadanInfo.seconds).padStart(2, '0') : '--'}
                </span>
                <span className="text-[9px] text-emerald-100 uppercase block font-tajawal">
                  {isEnglish ? 'Secs' : 'ثانية'}
                </span>
              </div>
            </div>

            <span className="text-[10px] text-emerald-100/90 block mt-1 truncate">
              {isEnglish
                ? (ramadanInfo.isRamadanActive ? 'Ramadan is active • Countdown to Eid' : `Target: 1 Ramadan ${ramadanInfo.targetHijriYear} AH`)
                : (ramadanInfo.isRamadanActive ? 'رمضان نشط حالياً • المتبقي لعيد الفطر' : `الموعد المتوقع: 1 رمضان ${ramadanInfo.targetHijriYear} هـ`)}
            </span>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* Prayer Times Live Dashboard Widget */}
      <ScrollReveal>
        <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-4 sm:p-6 shadow-sm max-w-full wasl-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 pb-4 border-b border-[var(--border-color)] min-w-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h3 className="font-bold text-sm sm:text-base text-[var(--text-main)] truncate">
                  {isEnglish ? 'Prayer Times & Countdown' : 'مواقيت الصلاة والعد التنازلي'}
                </h3>
                <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-[var(--gold-light)] text-[var(--gold)] font-bold shrink-0">
                  {isEnglish ? '12-Hour Umm al-Qura' : 'نظام 12 ساعة • تقويم أم القرى'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[var(--text-muted)] mt-0.5 truncate" suppressHydrationWarning>
                {isEnglish ? 'Next Prayer:' : 'الصلاة القادمة:'}{' '}
                <strong className="text-[var(--text-primary)]" suppressHydrationWarning>
                  {isEnglish ? prayerData.nextPrayer.nameEn : prayerData.nextPrayer.nameAr}
                </strong>{' '}
                {isEnglish ? 'at' : 'في'}{' '}
                <strong className="text-[var(--text-main)] font-mono" suppressHydrationWarning>
                  {format12HourTime(prayerData.nextPrayer.time, isEnglish)}
                </strong>{' '}
                {isEnglish ? '— in' : '— متبقٍ'}{' '}
                <span suppressHydrationWarning className="font-mono font-bold text-[var(--gold)]">
                  {mounted ? prayerData.nextPrayer.remainingFormatted : '--:--:--'}
                </span>
              </p>
            </div>
          </div>

          {/* City Selector & Geolocation */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 flex-wrap">
            <button
              onClick={handleDetectLocation}
              disabled={isLocating}
              className="p-2 rounded-xl bg-[var(--bg-card-subtle)] hover:bg-[var(--primary-light)] text-[var(--primary)] border border-[var(--border-color)] transition-colors flex items-center gap-1 text-xs font-bold"
              title={isEnglish ? 'Detect current location' : 'تحديد الموقع تلقائياً'}
            >
              <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isEnglish ? 'Locate' : 'موقعي'}</span>
            </button>
            <label className="text-xs font-semibold text-[var(--text-muted)] shrink-0">
              {isEnglish ? 'City:' : 'المدينة:'}
            </label>
            <select
              suppressHydrationWarning
              value={selectedCity.id}
              onChange={(e) => {
                const found = CITIES.find(c => c.id === e.target.value);
                if (found) onChangeCity(found);
              }}
              className="bg-[var(--bg-card-subtle)] border border-[var(--border-color)] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[var(--text-main)] focus:outline-none focus:border-[var(--gold)] w-full sm:w-auto max-w-full"
            >
              {CITIES.map(c => (
                <option key={c.id} value={c.id}>
                  {isEnglish ? c.nameEn : `${c.nameAr} (${c.countryAr})`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 6 Prayer Pills Grid with 12-Hour Format */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5" suppressHydrationWarning>
          {[
            { id: 'fajr', nameAr: 'الفجر', nameEn: 'Fajr', time: prayerData.fajr },
            { id: 'sunrise', nameAr: 'الشروق', nameEn: 'Sunrise', time: prayerData.sunrise },
            { id: 'dhuhr', nameAr: 'الظهر', nameEn: 'Dhuhr', time: prayerData.dhuhr },
            { id: 'asr', nameAr: 'العصر', nameEn: 'Asr', time: prayerData.asr },
            { id: 'maghrib', nameAr: 'المغرب', nameEn: 'Maghrib', time: prayerData.maghrib },
            { id: 'isha', nameAr: 'العشاء', nameEn: 'Isha', time: prayerData.isha },
          ].map((item, idx) => {
            const isNext = prayerData.nextPrayer.nameAr === item.nameAr;
            const time12 = format12HourTime(item.time, isEnglish);
            return (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border text-center transition-all wasl-card wasl-card-hover wasl-touch-press wasl-stagger-${idx + 1} ${
                  isNext
                    ? 'bg-gradient-to-b from-[var(--primary-light)] to-[var(--bg-card)] border-[var(--primary)] shadow-md ring-2 ring-[var(--primary)]/20'
                    : 'bg-[var(--bg-card-subtle)] border-[var(--border-color)]'
                }`}
              >
                <span className={`text-xs block font-bold ${isNext ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
                  {isEnglish ? item.nameEn : item.nameAr}
                </span>
                <span className="text-base sm:text-lg font-black font-mono text-[var(--text-main)] block mt-1" suppressHydrationWarning>
                  {time12}
                </span>
                {isNext && (
                  <span className="inline-block mt-1 text-[10px] bg-[var(--primary)] text-white px-2 py-0.5 rounded-full font-bold">
                    {isEnglish ? 'Next' : 'القادمة'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>
      </ScrollReveal>

      {/* 2-Column: Daily Quran Ayah + Daily Hadith */}
      <ScrollReveal>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Quran Ayah Card */}
          <section className="bg-[var(--bg-card)] border border-[var(--border-gold)] rounded-3xl p-6 shadow-sm flex flex-col justify-between wasl-card wasl-card-hover">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-[var(--gold-light)] text-[var(--gold)] flex items-center justify-center font-bold text-xs">
                  آية
                </span>
                <div>
                  <h3 className="font-bold text-sm text-[var(--text-main)]">
                    {isEnglish ? 'Daily Quranic Verse' : 'آية اليوم وتدبّرها'}
                  </h3>
                  <span className="text-xs text-[var(--text-muted)]">
                    سورة {dailyAyahObj.surahNameAr} [آية: {dailyAyah.numberInSurah}]
                  </span>
                </div>
              </div>
              <button
                onClick={() => onPlayTrack({
                  id: `daily-verse-${dailyAyahObj.surah}-${dailyAyah.numberInSurah}`,
                  titleAr: `سورة ${dailyAyahObj.surahNameAr}: آية ${dailyAyah.numberInSurah}`,
                  titleEn: `${dailyAyahObj.surahNameEn}: Verse ${dailyAyah.numberInSurah}`,
                  subtitleAr: 'تلاوة الشيخ مشاري راشد العفاسي',
                  subtitleEn: 'Mishary Alafasy Recitation',
                  audioUrl: getAyahAudioUrl('alafasy', dailyAyahObj.surah, dailyAyah.numberInSurah)
                })}
                className="p-2 rounded-xl bg-[var(--primary-light)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-colors"
                title="استمع للآية"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Ayah Text */}
            <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-center my-3">
              <p className="text-2xl sm:text-3xl font-quran font-bold text-[var(--text-main)] leading-relaxed">
                {dailyAyah.text}
                <span className="ayah-end-symbol">{dailyAyah.numberInSurah}</span>
              </p>
              <p className="text-xs text-[var(--text-muted)] font-tajawal mt-3 pt-3 border-t border-[var(--border-color)]">
                {dailyAyah.tafsirAr}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)] mt-2">
            <button
              onClick={() => onSelectTab('quran')}
              className="text-xs font-bold text-[var(--text-primary)] hover:underline flex items-center gap-1"
            >
              <span>{isEnglish ? `Browse Surah ${dailyAyahObj.surahNameEn}` : `تصفح سورة ${dailyAyahObj.surahNameAr}`}</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onOpenShareCard({
                title: 'آية وتدبر',
                text: dailyAyah.text,
                source: `سورة ${dailyAyahObj.surahNameAr} [آية: ${dailyAyah.numberInSurah}]`,
                category: 'quran'
              })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--gold-light)] text-[var(--gold)] text-xs font-bold hover:bg-opacity-80 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isEnglish ? 'Share as Card' : 'مشاركة كبطاقة'}</span>
            </button>
          </div>
        </section>

        {/* Daily Authentic Hadith Card */}
        <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm flex flex-col justify-between wasl-card wasl-card-hover">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center font-bold text-xs">
                  حديث
                </span>
                <div>
                  <h3 className="font-bold text-sm text-[var(--text-main)]">
                    {isEnglish ? 'Daily Authentic Hadith' : 'حديث اليوم الشريف'}
                  </h3>
                  <span className="text-xs text-emerald-600 font-semibold">{dailyHadith.grade}</span>
                </div>
              </div>
              <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-card-subtle)] px-2.5 py-1 rounded-full border border-[var(--border-color)]">
                {dailyHadith.source}
              </span>
            </div>

            {/* Hadith Text */}
            <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] my-3">
              <p className="text-base sm:text-lg font-quran font-semibold text-[var(--text-main)] leading-loose">
                «{dailyHadith.arabic}»
              </p>
              <div className="text-xs text-[var(--text-muted)] font-tajawal mt-2">
                <span>رواه: <strong>{dailyHadith.narratorAr}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)] mt-2">
            <button
              onClick={() => onSelectTab('discover')}
              className="text-xs font-bold text-[var(--text-primary)] hover:underline flex items-center gap-1"
            >
              <span>{isEnglish ? 'Open Hadith Library' : 'تصفح الأحاديث الشريفة'}</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onOpenShareCard({
                title: 'حديث نبوي شريف',
                text: dailyHadith.arabic,
                source: `${dailyHadith.source} • رواه ${dailyHadith.narratorAr}`,
                category: 'hadith'
              })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--primary-light)] text-[var(--primary)] text-xs font-bold hover:bg-opacity-80 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isEnglish ? 'Share as Card' : 'مشاركة كبطاقة'}</span>
            </button>
          </div>
        </section>
      </div>
      </ScrollReveal>

      {/* Khatmah Progress & Quick Daily Adhkar */}
      <ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Khatmah Card */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-5 shadow-sm md:col-span-1 flex flex-col justify-between wasl-card wasl-card-hover">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-[var(--gold)]" />
                <h4 className="font-bold text-sm text-[var(--text-main)]">
                  {isEnglish ? 'Khatmah Progress' : 'متابعة الختمة الحالية'}
                </h4>
              </div>
              <span className="text-xs font-black font-mono text-[var(--gold)] bg-[var(--gold-light)] px-2 py-0.5 rounded-full">
                {khatmahPercentage}%
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              {isEnglish ? 'Target: 30 Days' : `وصلت للصفحة ${khatmahProgress.currentPage} من أصل ${khatmahProgress.totalPages}`}
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-[var(--border-color)] h-2.5 rounded-full overflow-hidden mb-3">
              <div 
                className="bg-gradient-to-r from-[var(--primary)] to-[var(--gold)] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(4, khatmahPercentage)}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => onSelectTab('khatmah')}
            className="w-full py-2 px-3 rounded-xl bg-[var(--bg-card-subtle)] hover:bg-[var(--primary-light)] text-[var(--text-primary)] text-xs font-bold text-center border border-[var(--border-color)] transition-colors"
          >
            {isEnglish ? 'Continue Reading' : 'متابعة القراءة والختمة'}
          </button>
        </div>

        {/* Dynamic Daily Dhikr */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-5 shadow-sm md:col-span-2 flex flex-col justify-between wasl-card wasl-card-hover">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h4 className="font-bold text-sm text-[var(--text-main)]">
                  {isEnglish ? (dailyDhikr.category || 'Featured Daily Dhikr') : `ذكر اليوم المستحب: ${dailyDhikr.category || 'أذكار اليوم'}`}
                </h4>
              </div>
              <span className="text-[11px] text-[var(--text-muted)] bg-[var(--bg-card-subtle)] px-2.5 py-0.5 rounded-full">
                {dailyDhikr.referenceAr}
              </span>
            </div>

            <p className="text-sm font-quran font-semibold text-[var(--text-main)] leading-relaxed my-2 p-3 bg-[var(--bg-card-subtle)] rounded-xl">
              «{dailyDhikr.textAr}»
            </p>
            <p className="text-[11px] text-[var(--text-muted)]">
              <strong>فضله:</strong> {dailyDhikr.virtueAr}
            </p>
          </div>

          <div className="flex items-center justify-between pt-3 mt-2 border-t border-[var(--border-color)]">
            <button
              onClick={() => onSelectTab('discover')}
              className="text-xs font-bold text-[var(--text-primary)] hover:underline"
            >
              {isEnglish ? 'Open All Adhkar (Hisn al-Muslim)' : 'تصفح جميع الأذكار (حصن المسلم)'}
            </button>
            <button
              onClick={() => onOpenShareCard({
                title: dailyDhikr.category || 'ذكر مبارك',
                text: dailyDhikr.textAr,
                source: dailyDhikr.referenceAr,
                category: 'dhikr'
              })}
              className="text-xs text-[var(--gold)] font-bold flex items-center gap-1 hover:underline"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>مشاركة</span>
            </button>
          </div>
        </div>
      </div>
      </ScrollReveal>

      {/* Yawmi Ma'a Wasl Spotlight Banner */}
      <ScrollReveal variant="scale">
        <section className="bg-gradient-to-r from-[var(--emerald-deep)] via-[var(--primary-dark)] to-[#07251a] border border-[var(--border-gold)]/60 rounded-3xl p-5 sm:p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg wasl-card wasl-card-gold">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[var(--gold)]/20 text-[var(--gold)]">
                <Sparkles className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-bold font-amiri">
                {isEnglish ? 'Yawmi Ma\'a Wasl — Your Daily Worship Hub' : 'يومي مع وصل — جدولك الإيماني اليومي'}
              </h3>
            </div>
            <p className="text-xs text-emerald-100/90 font-tajawal max-w-xl">
              {isEnglish 
                ? 'Track your daily Quran reading, morning and evening Adhkar, and personal worship routine.' 
                : 'تابع وردك القرآني اليومي، أذكار الصباح والمساء، والسنن الرواتب مع تتبع الإنجاز الأسبوعي وسلسلة الأيام المباركة.'}
            </p>
          </div>
          <button
            onClick={() => onSelectTab('worship')}
            className="px-5 py-2.5 rounded-2xl bg-[var(--gold)] text-black font-bold text-xs hover:opacity-95 shadow-md whitespace-nowrap self-start sm:self-auto cursor-pointer wasl-btn-interactive wasl-touch-press"
          >
            {isEnglish ? 'Open Daily Worship' : 'ابدأ ورد اليوم'}
          </button>
        </section>
      </ScrollReveal>

      {/* Quick Launchpad to Worship & Knowledge Tools */}
      <ScrollReveal>
        <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm wasl-card">
          <h3 className="font-bold text-base text-[var(--text-main)] mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-[var(--gold)]" />
            <span>{isEnglish ? 'Quick Worship & Learning Tools' : 'أدوات العبادة والمعرفة السريعة'}</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {[
              { id: 'planner', nameAr: 'مخطط الورد', icon: <Sparkles className="w-5 h-5 text-amber-500" />, tab: 'planner' as NavTab },
              { id: 'journal', nameAr: 'دفتر التدبر', icon: <BookOpen className="w-5 h-5 text-emerald-600" />, tab: 'journal' as NavTab },
              { id: 'kids', nameAr: 'عالم الصغار', icon: <IconKidsLearning className="w-5 h-5 text-purple-500" />, tab: 'kids' as NavTab },
              { id: 'search-sources', nameAr: 'اسأل المصادر', icon: <Layers className="w-5 h-5 text-teal-600" />, tab: 'search-sources' as NavTab },
              { id: 'worship', nameAr: 'يومي مع وصل', icon: <IconDuaHands className="w-5 h-5 text-blue-600" />, tab: 'worship' as NavTab },
              { id: 'library', nameAr: 'مكتبتي', icon: <Bookmark className="w-5 h-5 text-indigo-600" />, tab: 'library' as NavTab },
              { id: 'zakat', nameAr: 'حاسبة الزكاة', icon: <Calculator className="w-5 h-5 text-emerald-600" />, tab: 'zakat' as NavTab },
              { id: 'studio', nameAr: 'استوديو البطاقات', icon: <Share2 className="w-5 h-5 text-rose-500" />, tab: 'studio' as NavTab },
            ].map((tool, idx) => (
              <button
                key={tool.id}
                onClick={() => onSelectTab(tool.tab)}
                className={`p-3.5 rounded-2xl bg-[var(--bg-card-subtle)] hover:bg-[var(--primary-light)] border border-[var(--border-color)] text-center transition-all group wasl-card wasl-card-hover wasl-btn-interactive wasl-touch-press cursor-pointer wasl-stagger-${(idx % 8) + 1}`}
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] shadow-sm flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  {tool.icon}
                </div>
                <span className="text-[11px] font-bold text-[var(--text-main)] block truncate">
                  {tool.nameAr}
                </span>
              </button>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* Hostinger Email Notification Subscription Component */}
      <ScrollReveal>
        <EmailSubscriptionCard />
      </ScrollReveal>

    </div>
  );
};
