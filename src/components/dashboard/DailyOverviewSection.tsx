import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Compass,
  BookOpen,
  Sparkles,
  Heart,
  Clock,
  ArrowRight,
  Copy,
  Check,
  Share2,
  Volume2
} from 'lucide-react';
import { NextPrayerInfo } from '../../services/prayerService';

interface DailyOverviewSectionProps {
  nextPrayer: NextPrayerInfo;
  onNavigate: (tab: string, contextId?: any) => void;
}

export const DailyOverviewSection: React.FC<DailyOverviewSectionProps> = ({
  nextPrayer,
  onNavigate,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Curated Daily Islamic Content
  const dailyAyah = {
    surahNumber: 2,
    ayahNumber: 152,
    surahNameAr: 'البقرة',
    text: 'فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ',
    tafsirSnippet: 'أي: اذكروني بطاعتي وشكري، أذكركم بثوابي ومغفرتي وفضلي العظيم.',
  };

  const dailyHadith = {
    text: 'مَنْ سَلَكَ طَرِيقاً يَلْتَمِسُ فِيهِ عِلْماً، سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقاً إِلَى الْجَنَّةِ',
    source: 'صحيح مسلم • كتاب الذكر والدعاء',
  };

  const dailyDhikr = {
    text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ',
    virtue: 'كلمتان خفيفتان على اللسان، ثقيلتان في الميزان، حبيبتان إلى الرحمن',
  };

  const dailyDua = {
    title: 'دعاء تفريج الهم والكرَب',
    text: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ، وَغَلَبَةِ الرِّجَالِ',
    source: 'صحيح البخاري',
  };

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 font-amiri">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-amber-400" />
          <span>يومك في وَصْل</span>
        </h2>
        <span className="text-[11px] text-slate-400">نفحات إيمانية متجددة يومياً</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* 1. Next Prayer Card */}
        <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-emerald-200">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>الصلاة القادمة: <strong className="text-amber-300">{nextPrayer.nextPrayerAr}</strong></span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-700/80 border border-emerald-600/40">
              الوقت: {nextPrayer.nextPrayerTime}
            </span>
          </div>

          <div className="my-3">
            <div className="text-[11px] text-emerald-200/80">الوقت المتبقي للأذان:</div>
            <div className="text-2xl sm:text-3xl font-bold tracking-wider text-amber-300 font-mono mt-0.5" dir="ltr">
              {nextPrayer.formattedCountdown}
            </div>
            <div className="w-full bg-emerald-950/60 rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${nextPrayer.progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-emerald-700/60 text-xs">
            <span className="text-[11px] text-emerald-200">الصلاة الحالية: {nextPrayer.currentPrayerAr}</span>
            <button
              onClick={() => onNavigate('prayer')}
              className="text-amber-300 hover:text-white flex items-center gap-1 text-[11px] font-bold cursor-pointer transition-colors"
            >
              <span>جدول المواقيت والقبلة</span>
              <ArrowRight className="w-3 h-3 rotate-180" />
            </button>
          </div>
        </div>

        {/* 2. Daily Ayah Card */}
        <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 mb-2">
              <span className="flex items-center gap-1.5 font-bold">
                <BookOpen className="w-3.5 h-3.5" />
                <span>آية اليوم • سورة {dailyAyah.surahNameAr} ({dailyAyah.ayahNumber})</span>
              </span>
              <button
                onClick={() => copyText(`${dailyAyah.text} [سورة ${dailyAyah.surahNameAr}: ${dailyAyah.ayahNumber}]`, 'ayah')}
                className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-300 p-1"
                title="نسخ الآية الكريمة"
              >
                {copiedKey === 'ayah' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="font-amiri text-base sm:text-lg text-slate-900 dark:text-white leading-relaxed text-right font-medium">
              «{dailyAyah.text}»
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
              {dailyAyah.tafsirSnippet}
            </p>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-emerald-900/50 flex items-center justify-between">
            <button
              onClick={() => onNavigate('quran', dailyAyah.surahNumber)}
              className="text-emerald-800 dark:text-amber-300 hover:underline text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>فتح السورة في المصحف</span>
              <ArrowRight className="w-3 h-3 rotate-180" />
            </button>
          </div>
        </div>

        {/* 3. Daily Hadith Card */}
        <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 mb-2">
              <span className="flex items-center gap-1.5 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>الحديث النبوي الشريف</span>
              </span>
              <button
                onClick={() => copyText(`${dailyHadith.text} [${dailyHadith.source}]`, 'hadith')}
                className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-300 p-1"
                title="نسخ الحديث"
              >
                {copiedKey === 'hadith' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="font-amiri text-sm sm:text-base text-slate-900 dark:text-white leading-relaxed">
              قال ﷺ: «{dailyHadith.text}»
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              {dailyHadith.source}
            </p>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-emerald-900/50">
            <button
              onClick={() => onNavigate('hadith')}
              className="text-emerald-800 dark:text-amber-300 hover:underline text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>تصفح موسوعة الأحاديث</span>
              <ArrowRight className="w-3 h-3 rotate-180" />
            </button>
          </div>
        </div>

        {/* 4. Daily Dua Card */}
        <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 mb-2">
              <span className="flex items-center gap-1.5 font-bold">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>{dailyDua.title}</span>
              </span>
              <button
                onClick={() => copyText(`${dailyDua.text} [${dailyDua.source}]`, 'dua')}
                className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-300 p-1"
                title="نسخ الدعاء"
              >
                {copiedKey === 'dua' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="font-amiri text-sm sm:text-base text-slate-900 dark:text-white leading-relaxed">
              «{dailyDua.text}»
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              المصدر: {dailyDua.source}
            </p>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-emerald-900/50">
            <button
              onClick={() => onNavigate('dua')}
              className="text-emerald-800 dark:text-amber-300 hover:underline text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>تصفح أدعية الكتاب والسنة</span>
              <ArrowRight className="w-3 h-3 rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
