import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Search,
  Play,
  Pause,
  Bookmark,
  Share2,
  Book,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Sliders,
  Check,
  RotateCcw,
  Copy
} from 'lucide-react';
import { SURAHS_LIST, RECITERS_LIST } from '../data/quranMetadata';
import { fetchSurahAyahs, normalizeArabicText } from '../services/quranService';
import { Ayah, SurahMeta } from '../types';
import { useAudio } from '../context/AudioContext';
import { useUser } from '../context/UserContext';
import { useShareModal } from '../context/ShareContext';
import { useModalScrollLock } from '../hooks/useModalScrollLock';

interface Props {
  initialSurahNumber?: number;
}

export const QuranView: React.FC<Props> = ({ initialSurahNumber = 1 }) => {
  const { playAyah, playSurah, isPlaying, currentAyah } = useAudio();
  const { addBookmark, updateLastReading } = useUser();
  const { openShareModal } = useShareModal();

  const [activeSurahNumber, setActiveSurahNumber] = useState<number>(initialSurahNumber);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Meccan' | 'Medinan'>('all');
  const [fontSize, setFontSize] = useState<number>(26); // in px
  const [showTafsir, setShowTafsir] = useState(false);
  const [selectedAyahForTafsir, setSelectedAyahForTafsir] = useState<Ayah | null>(null);

  useModalScrollLock(showTafsir && !!selectedAyahForTafsir, {
    onClose: () => setShowTafsir(false),
    closeOnEsc: true,
  });

  const [copiedAyahNumber, setCopiedAyahNumber] = useState<number | null>(null);
  const [bookmarkedAyahNumber, setBookmarkedAyahNumber] = useState<number | null>(null);
  const [readingMode, setReadingMode] = useState<'list' | 'continuous'>('list');

  const currentSurah = SURAHS_LIST.find((s) => s.number === activeSurahNumber) || SURAHS_LIST[0];

  useEffect(() => {
    if (initialSurahNumber) {
      setActiveSurahNumber(initialSurahNumber);
    }
  }, [initialSurahNumber]);

  useEffect(() => {
    let isCancelled = false;
    async function loadSurah() {
      setLoading(true);
      const data = await fetchSurahAyahs(activeSurahNumber);
      if (!isCancelled) {
        setAyahs(data);
        setLoading(false);
        updateLastReading(activeSurahNumber, 1, currentSurah.name);
      }
    }
    loadSurah();
    return () => {
      isCancelled = true;
    };
  }, [activeSurahNumber]);

  const filteredSurahs = SURAHS_LIST.filter((s) => {
    const matchesFilter = filterType === 'all' || s.revelationType === filterType;
    const matchesSearch =
      !searchQuery.trim() ||
      normalizeArabicText(s.name).includes(normalizeArabicText(searchQuery)) ||
      s.number.toString() === searchQuery.trim();
    return matchesFilter && matchesSearch;
  });

  const handleCopyAyah = (ayah: Ayah) => {
    const fullText = `﴿${ayah.text}﴾ [سورة ${currentSurah.name}: ${ayah.numberInSurah}]`;
    navigator.clipboard.writeText(fullText);
    setCopiedAyahNumber(ayah.numberInSurah);
    setTimeout(() => setCopiedAyahNumber(null), 2000);
  };

  const handleBookmarkAyah = (ayah: Ayah) => {
    addBookmark(currentSurah.number, currentSurah.name, ayah.numberInSurah);
    setBookmarkedAyahNumber(ayah.numberInSurah);
    setTimeout(() => setBookmarkedAyahNumber(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-16">
      {/* Sidebar: Surah Directory */}
      <div className="lg:col-span-4 bg-white dark:bg-emerald-950/80 rounded-2xl p-4 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm flex flex-col h-[78vh]">
        {/* Header & Filter */}
        <div className="space-y-3 pb-3 border-b border-slate-100 dark:border-emerald-900/60">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>فهرس السور الكريمة</span>
            </h3>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              114 سورة
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث برقم أو اسم السورة..."
              className="w-full pr-9 pl-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-slate-200 dark:border-emerald-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden"
            />
          </div>

          {/* Type Filter */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-emerald-900/50 rounded-xl text-xs font-medium">
            <button
              onClick={() => setFilterType('all')}
              className={`py-1 rounded-lg transition-colors ${filterType === 'all' ? 'bg-white dark:bg-emerald-800 text-emerald-950 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'}`}
            >
              الكل
            </button>
            <button
              onClick={() => setFilterType('Meccan')}
              className={`py-1 rounded-lg transition-colors ${filterType === 'Meccan' ? 'bg-white dark:bg-emerald-800 text-emerald-950 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'}`}
            >
              مكية
            </button>
            <button
              onClick={() => setFilterType('Medinan')}
              className={`py-1 rounded-lg transition-colors ${filterType === 'Medinan' ? 'bg-white dark:bg-emerald-800 text-emerald-950 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'}`}
            >
              مدنية
            </button>
          </div>
        </div>

        {/* Surahs Scrollable List */}
        <div className="overflow-y-auto flex-1 mt-2 space-y-1.5 pr-1">
          {filteredSurahs.map((s) => {
            const isSelected = s.number === activeSurahNumber;
            return (
              <button
                key={s.number}
                onClick={() => setActiveSurahNumber(s.number)}
                className={`w-full p-2.5 rounded-xl text-right flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-emerald-800 text-white font-bold shadow-sm'
                    : 'hover:bg-emerald-50 dark:hover:bg-emerald-900/40 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-100 dark:bg-emerald-900 text-slate-600 dark:text-emerald-300'
                    }`}
                  >
                    {s.number}
                  </span>
                  <div>
                    <span className="text-sm font-amiri block">سورة {s.name}</span>
                    <span className={`text-[10px] block ${isSelected ? 'text-emerald-200' : 'text-slate-400 dark:text-slate-500'}`}>
                      {s.numberOfAyahs} آية • {s.revelationTypeAr}
                    </span>
                  </div>
                </div>

                <span className={`text-[11px] font-sans ${isSelected ? 'text-amber-300' : 'text-slate-400'}`}>
                  ص {s.page}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Quran Reader Area */}
      <div className="lg:col-span-8 space-y-4">
        {/* Controls Toolbar */}
        <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-4 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm flex flex-wrap items-center justify-between gap-3">
          {/* Navigation between surahs */}
          <div className="flex items-center gap-2">
            <button
              disabled={activeSurahNumber <= 1}
              onClick={() => setActiveSurahNumber((prev) => Math.max(1, prev - 1))}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-emerald-800 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-emerald-900"
              title="السورة السابقة"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="text-center px-2">
              <h2 className="font-amiri font-bold text-lg text-emerald-950 dark:text-white">
                سورة {currentSurah.name}
              </h2>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                {currentSurah.revelationTypeAr} • {currentSurah.numberOfAyahs} آية • الجزء {currentSurah.juz}
              </span>
            </div>
            <button
              disabled={activeSurahNumber >= 114}
              onClick={() => setActiveSurahNumber((prev) => Math.min(114, prev + 1))}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-emerald-800 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-emerald-900"
              title="السورة التالية"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Play & Display Options */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => playSurah(currentSurah, ayahs)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800 text-white font-medium text-xs hover:bg-emerald-700 transition-all shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>استماع للسورة</span>
            </button>

            {/* Font Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-emerald-900/60 p-1 rounded-xl text-xs">
              <button
                onClick={() => setFontSize((s) => Math.max(18, s - 2))}
                className="p-1 rounded text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-emerald-800"
                title="تصغير الخط"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1 text-[11px] font-mono">{fontSize}px</span>
              <button
                onClick={() => setFontSize((s) => Math.min(42, s + 2))}
                className="p-1 rounded text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-emerald-800"
                title="تكبير الخط"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Reading Mode Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-emerald-900/60 p-1 rounded-xl text-xs">
              <button
                onClick={() => setReadingMode('list')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${readingMode === 'list' ? 'bg-white dark:bg-emerald-800 font-semibold shadow-xs' : 'text-slate-500'}`}
              >
                آية بآية
              </button>
              <button
                onClick={() => setReadingMode('continuous')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${readingMode === 'continuous' ? 'bg-white dark:bg-emerald-800 font-semibold shadow-xs' : 'text-slate-500'}`}
              >
                مصحف متصل
              </button>
            </div>
          </div>
        </div>

        {/* Quran Mushaf Display Area */}
        <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-6 sm:p-10 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm min-h-[60vh]">
          {/* Basmala Header (Except Surah At-Tawbah #9) */}
          {activeSurahNumber !== 9 && (
            <div className="text-center pb-8 pt-2">
              <div className="inline-block px-8 py-2.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-900/40 border border-emerald-100 dark:border-emerald-800/60">
                <span className="font-scheherazade text-2xl sm:text-3xl text-emerald-950 dark:text-amber-200">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </span>
              </div>
            </div>
          )}

          {loading ? (
            <div className="py-24 text-center text-slate-400 space-y-3">
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm">جاري تحميل آيات سورة {currentSurah.name} وتفسيرها الميسر...</p>
            </div>
          ) : readingMode === 'list' ? (
            /* Ayah-by-Ayah Mode with Full Action Bar & Tafsir button */
            <div className="space-y-6">
              {ayahs.map((ayah) => {
                const isCurrentlyPlaying = currentAyah?.number === ayah.number && isPlaying;
                return (
                  <div
                    key={ayah.number}
                    id={`ayah-${ayah.numberInSurah}`}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      isCurrentlyPlaying
                        ? 'bg-emerald-50/80 dark:bg-emerald-900/40 border-emerald-500 shadow-sm'
                        : 'border-slate-100 dark:border-emerald-900/40 hover:border-emerald-300 dark:hover:border-emerald-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      {/* Ayah Badge */}
                      <span className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-center shrink-0 border border-emerald-300/40">
                        {ayah.numberInSurah}
                      </span>

                      {/* Ayah Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => playAyah(currentSurah, ayah)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/50"
                          title="استماع للآية"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAyahForTafsir(ayah);
                            setShowTafsir(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/50"
                          title="التفسير الميسر"
                        >
                          <Book className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleBookmarkAyah(ayah)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                          title="حفظ علامة مرجعية"
                        >
                          {bookmarkedAyahNumber === ayah.numberInSurah ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleCopyAyah(ayah)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/50"
                          title="نسخ الآية الكريمة"
                        >
                          {copiedAyahNumber === ayah.numberInSurah ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() =>
                            openShareModal({
                              sectionName: 'القرآن الكريم',
                              contentType: 'آية',
                              type: 'quran',
                              content: ayah.text,
                              text: ayah.text,
                              surahName: currentSurah.name,
                              ayahNumber: ayah.numberInSurah,
                              source: `سورة ${currentSurah.name} • الآية ${ayah.numberInSurah}`,
                              title: `سورة ${currentSurah.name} • الآية ${ayah.numberInSurah}`
                            })
                          }
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-800 transition-colors font-medium text-xs"
                          title="مشاركة الآية كصورة أو نص"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">مشاركة</span>
                        </button>
                      </div>
                    </div>

                    {/* Ayah Text */}
                    <p
                      className="font-scheherazade text-slate-900 dark:text-emerald-50 leading-loose text-right"
                      style={{ fontSize: `${fontSize}px` }}
                    >
                      {ayah.text}
                      <span className="inline-block mx-2 text-amber-600 dark:text-amber-400 text-sm font-sans">
                        ﴿{ayah.numberInSurah}﴾
                      </span>
                    </p>

                    {/* Inline Quick Tafsir Toggle if chosen */}
                    {ayah.tafsir && (
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-emerald-900/60 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-tajawal">
                        <span className="font-bold text-emerald-800 dark:text-emerald-300 ml-1">
                          التفسير الميسر:
                        </span>
                        {ayah.tafsir}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Continuous Mushaf Paragraph Reading Mode */
            <div
              className="font-scheherazade leading-loose text-justify text-slate-900 dark:text-emerald-50"
              style={{ fontSize: `${fontSize + 2}px` }}
            >
              {ayahs.map((ayah) => (
                <span key={ayah.number} className="inline">
                  <span>{ayah.text}</span>
                  <span
                    onClick={() => playAyah(currentSurah, ayah)}
                    title={`الآية ${ayah.numberInSurah} - انقر للاستماع`}
                    className="inline-flex items-center justify-center w-7 h-7 mx-1.5 rounded-full bg-emerald-100/70 dark:bg-emerald-900/70 text-emerald-900 dark:text-amber-300 text-xs font-sans font-bold cursor-pointer hover:bg-emerald-600 hover:text-white transition-colors"
                  >
                    {ayah.numberInSurah}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tafsir Modal */}
      {showTafsir && selectedAyahForTafsir && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 wasl-modal-overlay animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowTafsir(false);
          }}
          onTouchMove={(e) => {
            if (e.target === e.currentTarget) e.preventDefault();
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white dark:bg-emerald-950 rounded-2xl p-6 shadow-2xl border border-emerald-900/20 text-right max-h-[min(85dvh,calc(100dvh-3rem))] overflow-y-auto wasl-modal-scrollable"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-900/60 mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Book className="w-4 h-4 text-emerald-600" />
                <span>
                  تفسير الآية {selectedAyahForTafsir.numberInSurah} من سورة {currentSurah.name}
                </span>
              </h3>
              <button
                onClick={() => setShowTafsir(false)}
                className="px-2 py-1 text-xs rounded-lg bg-slate-100 dark:bg-emerald-900 text-slate-600 dark:text-slate-300"
              >
                إغلاق
              </button>
            </div>

            <p className="font-scheherazade text-xl text-emerald-900 dark:text-emerald-100 mb-4 p-3 rounded-xl bg-slate-50 dark:bg-emerald-900/30 text-center leading-loose">
              {selectedAyahForTafsir.text}
            </p>

            <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed space-y-2">
              <h4 className="font-bold text-emerald-800 dark:text-emerald-300">
                التفسير الميسر (مجمع الملك فهد لطباعة المصحف الشريف):
              </h4>
              <p>{selectedAyahForTafsir.tafsir || 'التفسير المعتمد متوفر كاملاً للمطالعة.'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
