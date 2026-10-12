'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Sun, 
  Moon, 
  BookOpen, 
  Maximize2, 
  Minimize2, 
  Sliders, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Edit3, 
  Search, 
  HelpCircle,
  Layers,
  ArrowUp,
  Bookmark,
  ScrollText
} from 'lucide-react';
import { SURAH_LIST, SurahMeta } from '../../data/quranMetadata.ts';
import { Ayah } from '../QuranPlatform.tsx';
import { TAFSIR_COMPARISON_DATA } from '../../data/tafsirComparisonData.ts';

interface QuranFocusModeProps {
  surahNumber: number;
  ayahs: Ayah[];
  initialAyahNumber?: number;
  isEnglish: boolean;
  onClose: () => void;
  onSelectWord?: (word: string, ayahText: string, surah: number, ayah: number) => void;
  onOpenTafsirComparison?: (surah: number, ayah: number) => void;
  onOpenReflectionJournal?: (surah: number, ayah: number) => void;
}

type SurfaceTheme = 'light' | 'dark' | 'sepia';

export const QuranFocusMode: React.FC<QuranFocusModeProps> = ({
  surahNumber,
  ayahs,
  initialAyahNumber = 1,
  isEnglish,
  onClose,
  onSelectWord,
  onOpenTafsirComparison,
  onOpenReflectionJournal
}) => {
  const surah = SURAH_LIST.find(s => s.number === surahNumber) || SURAH_LIST[0];

  // Visual Surface & Reading Preferences
  const [surfaceTheme, setSurfaceTheme] = useState<SurfaceTheme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('wasl_focus_theme') as SurfaceTheme) || 'dark';
    }
    return 'dark';
  });

  const [fontSize, setFontSize] = useState<number>(32);
  const [lineHeight, setLineHeight] = useState<'normal' | 'relaxed' | 'loose'>('relaxed');
  const [readingWidth, setReadingWidth] = useState<'compact' | 'standard' | 'wide'>('standard');
  const [fontFamily, setFontFamily] = useState<'amiri' | 'cairo'>('amiri');

  // UI state
  const [activeAyahNumber, setActiveAyahNumber] = useState<number>(initialAyahNumber);
  const [showSettingsPopover, setShowSettingsPopover] = useState(false);
  const [showTafsirPanel, setShowTafsirPanel] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Persist theme
  useEffect(() => {
    localStorage.setItem('wasl_focus_theme', surfaceTheme);
  }, [surfaceTheme]);

  // Fullscreen sync
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Keyboard navigation & Esc listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showTafsirPanel) {
          setShowTafsirPanel(false);
        } else if (showSettingsPopover) {
          setShowSettingsPopover(false);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowLeft') {
        // Next Ayah in RTL
        setActiveAyahNumber(prev => Math.min(ayahs.length, prev + 1));
      } else if (e.key === 'ArrowRight') {
        // Prev Ayah in RTL
        setActiveAyahNumber(prev => Math.max(1, prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [ayahs.length, onClose, showTafsirPanel, showSettingsPopover]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Theme styling classes
  const getThemeClasses = () => {
    switch (surfaceTheme) {
      case 'light':
        return 'bg-[#faf8f5] text-[#1c1917] border-[#e7e2d9] selection:bg-emerald-200';
      case 'sepia':
        return 'bg-[#f4ecd8] text-[#433422] border-[#dfd2be] selection:bg-amber-200';
      case 'dark':
      default:
        return 'bg-[#0d1412] text-[#f1f5f9] border-[#1e2e28] selection:bg-emerald-900';
    }
  };

  const getWidthClass = () => {
    switch (readingWidth) {
      case 'compact': return 'max-w-2xl';
      case 'wide': return 'max-w-6xl';
      case 'standard': default: return 'max-w-4xl';
    }
  };

  const getLineHeightStyle = () => {
    switch (lineHeight) {
      case 'loose': return '2.6';
      case 'normal': return '1.8';
      case 'relaxed': default: return '2.2';
    }
  };

  // Find active ayah content & its Tafsir
  const activeAyah = ayahs.find(a => a.numberInSurah === activeAyahNumber) || ayahs[0];
  const comparisonData = TAFSIR_COMPARISON_DATA.find((c: any) => c.surahNumber === surahNumber && c.ayahNumber === activeAyahNumber);

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 z-50 overflow-y-auto flex flex-col transition-colors duration-300 font-sans ${getThemeClasses()}`}
      dir="rtl"
    >
      {/* Minimal Distraction-free Header Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-inherit/90 border-b border-inherit px-4 py-3 flex items-center justify-between gap-3 shadow-sm">
        {/* Surah Title & Verse counter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[var(--primary)]/10 text-[var(--gold)] flex items-center justify-center font-bold font-quran text-base border border-[var(--border-gold)]/30">
              ۞
            </span>
            <div>
              <h2 className="text-base font-bold font-cairo flex items-center gap-2">
                <span>سورة {surah.name}</span>
                <span className="text-xs opacity-70 font-tajawal">
                  (الآية {activeAyahNumber} من {surah.numberOfAyahs})
                </span>
              </h2>
            </div>
          </div>
        </div>

        {/* Central Controls: Themes & Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Surface Themes */}
          <div className="flex items-center rounded-xl p-1 bg-black/10 dark:bg-white/10 border border-inherit">
            <button
              onClick={() => setSurfaceTheme('light')}
              className={`p-1.5 rounded-lg text-xs transition-all ${surfaceTheme === 'light' ? 'bg-white text-black shadow-sm font-bold' : 'opacity-60 hover:opacity-100'}`}
              title="الوضع النهاري"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setSurfaceTheme('sepia')}
              className={`p-1.5 rounded-lg text-xs transition-all ${surfaceTheme === 'sepia' ? 'bg-[#ebdcb9] text-[#433422] shadow-sm font-bold' : 'opacity-60 hover:opacity-100'}`}
              title="الوضع الورقي (سبيا)"
              aria-label="الوضع الورقي (سبيا)"
            >
              <ScrollText className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setSurfaceTheme('dark')}
              className={`p-1.5 rounded-lg text-xs transition-all ${surfaceTheme === 'dark' ? 'bg-[#18231e] text-white shadow-sm font-bold' : 'opacity-60 hover:opacity-100'}`}
              title="الوضع الليلي"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Tafsir Drawer Toggle */}
          <button
            onClick={() => setShowTafsirPanel(!showTafsirPanel)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-inherit ${
              showTafsirPanel 
                ? 'bg-[var(--gold)] text-black' 
                : 'bg-black/5 dark:bg-white/5 hover:border-[var(--gold)]'
            }`}
            title="التفسير والتدبر"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">التفسير والتدبر</span>
          </button>

          {/* Reader Settings Popover Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowSettingsPopover(!showSettingsPopover)}
              className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:border-[var(--gold)] border border-inherit text-xs transition-all"
              title="تخصيص الخط والعرض"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {showSettingsPopover && (
              <div className="absolute left-0 mt-2 w-72 rounded-2xl p-4 shadow-2xl border border-inherit bg-inherit z-50 space-y-4 animate-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-inherit">
                  <h3 className="text-xs font-bold font-cairo">خيارات العرض والخط</h3>
                  <button onClick={() => setShowSettingsPopover(false)} className="opacity-70 hover:opacity-100">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Font Size */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="opacity-75">حجم الخط القرآني</span>
                    <span className="font-mono font-bold">{fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min={24}
                    max={48}
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full accent-[var(--primary)]"
                  />
                </div>

                {/* Line Height */}
                <div>
                  <span className="block text-xs opacity-75 mb-1.5">تباعد الأسطر</span>
                  <div className="grid grid-cols-3 gap-1">
                    {(['normal', 'relaxed', 'loose'] as const).map(l => (
                      <button
                        key={l}
                        onClick={() => setLineHeight(l)}
                        className={`py-1 text-xs rounded-lg border border-inherit transition-all ${lineHeight === l ? 'bg-[var(--primary)] text-white font-bold' : 'opacity-70'}`}
                      >
                        {l === 'normal' ? 'متقارب' : l === 'relaxed' ? 'مريح' : 'متسع'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reading Width */}
                <div>
                  <span className="block text-xs opacity-75 mb-1.5">عرض مساحة القراءة</span>
                  <div className="grid grid-cols-3 gap-1">
                    {(['compact', 'standard', 'wide'] as const).map(w => (
                      <button
                        key={w}
                        onClick={() => setReadingWidth(w)}
                        className={`py-1 text-xs rounded-lg border border-inherit transition-all ${readingWidth === w ? 'bg-[var(--primary)] text-white font-bold' : 'opacity-70'}`}
                      >
                        {w === 'compact' ? 'ضيق' : w === 'standard' ? 'متوسط' : 'عريض'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:border-[var(--gold)] border border-inherit text-xs transition-all hidden sm:flex"
            title={isFullscreen ? 'تصغير الشاشة' : 'ملء الشاشة'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Exit Focus Mode Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all text-xs flex items-center gap-1 font-bold"
            title="الخروج من وضع التركيز (Esc)"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">إنهاء</span>
          </button>
        </div>
      </header>

      {/* Main Canvas Area */}
      <main className="flex-1 flex flex-col items-center justify-start p-4 sm:p-8">
        <div className={`w-full ${getWidthClass()} space-y-8 my-auto py-8`}>
          {/* Bismillah (except Surah At-Tawbah) */}
          {surahNumber !== 9 && (
            <div className="text-center py-4">
              <span className="font-quran text-2xl sm:text-3xl text-[var(--gold)] font-bold opacity-90 select-none">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </span>
            </div>
          )}

          {/* Continuous Flow Mushaf Reading View */}
          <div 
            className="text-center sm:text-justify leading-relaxed p-6 sm:p-10 rounded-3xl border border-inherit bg-inherit/40 shadow-inner"
            style={{ 
              lineHeight: getLineHeightStyle(),
              fontFamily: fontFamily === 'amiri' ? 'var(--font-amiri), serif' : 'var(--font-cairo), sans-serif'
            }}
          >
            {ayahs.map((ayah) => {
              const isSelected = ayah.numberInSurah === activeAyahNumber;
              const words = ayah.text.split(' ');

              return (
                <span 
                  key={ayah.numberInSurah}
                  id={`focus-ayah-${ayah.numberInSurah}`}
                  onClick={() => setActiveAyahNumber(ayah.numberInSurah)}
                  className={`inline transition-all duration-200 cursor-pointer rounded-xl px-1 py-0.5 mx-0.5 ${
                    isSelected 
                      ? 'bg-[var(--gold)]/20 ring-1 ring-[var(--gold)] font-semibold' 
                      : 'hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                  style={{ fontSize: `${fontSize}px` }}
                >
                  {/* Clickable Words for Dictionary lookup */}
                  {words.map((word, wIdx) => (
                    <span
                      key={wIdx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveAyahNumber(ayah.numberInSurah);
                        if (onSelectWord) {
                          onSelectWord(word, ayah.text, surahNumber, ayah.numberInSurah);
                        }
                      }}
                      className="hover:text-[var(--gold)] hover:underline decoration-dotted transition-colors"
                      title="انقر للاطلاع على معجم الكلمة"
                    >
                      {word}{' '}
                    </span>
                  ))}

                  {/* Ornamental Ayah End Number */}
                  <span className="inline-flex items-center justify-center font-tajawal font-bold text-xs sm:text-sm text-[var(--gold)] px-1.5 py-0.5 rounded-full border border-[var(--gold)]/40 mx-1 select-none">
                    {ayah.numberInSurah}
                  </span>
                </span>
              );
            })}
          </div>

          {/* Active Ayah Action Ribbon */}
          <div className="p-4 rounded-2xl border border-inherit bg-inherit/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="w-6 h-6 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center font-mono">
                {activeAyahNumber}
              </span>
              <span>الآية المحددة حالياً من سورة {surah.name}</span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setShowTafsirPanel(true)}
                className="px-3 py-1.5 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-all font-bold flex items-center gap-1"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>عرض التفسير الميسر</span>
              </button>

              {onOpenTafsirComparison && (
                <button
                  onClick={() => onOpenTafsirComparison(surahNumber, activeAyahNumber)}
                  className="px-3 py-1.5 rounded-xl bg-[var(--gold)]/10 text-[var(--gold)] hover:bg-[var(--gold)] hover:text-black transition-all font-bold flex items-center gap-1"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>مختبر مقارنة التفاسير</span>
                </button>
              )}

              {onOpenReflectionJournal && (
                <button
                  onClick={() => onOpenReflectionJournal(surahNumber, activeAyahNumber)}
                  className="px-3 py-1.5 rounded-xl border border-inherit hover:border-[var(--gold)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all font-bold flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>تدوين خاطرة</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Slide-in Tafsir Drawer */}
      {showTafsirPanel && (
        <div className="fixed inset-y-0 left-0 w-full sm:w-96 z-50 bg-inherit border-r border-inherit p-6 shadow-2xl flex flex-col space-y-4 animate-in slide-in-from-left duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-inherit">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[var(--gold)]" />
              <h3 className="font-bold text-base font-cairo">تفسير الآية {activeAyahNumber}</h3>
            </div>
            <button
              onClick={() => setShowTafsirPanel(false)}
              className="p-1.5 rounded-lg opacity-70 hover:opacity-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs leading-relaxed font-tajawal">
            {/* Active Ayah Quote */}
            <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-inherit font-quran text-sm font-bold text-center">
              {activeAyah.text}
            </div>

            {/* Sourced Commentary */}
            <div className="space-y-2">
              <span className="font-bold text-[var(--gold)] block font-cairo">
                التفسير الميسر (مجمع الملك فهد):
              </span>
              <p className="opacity-90 leading-loose">
                {comparisonData?.tafsirs?.muyassar?.textAr || activeAyah.tafsirAr || 'تفسير موثق مأخوذ من التفسير الميسر المعتمد.'}
              </p>
            </div>

            {/* Sourced Ibn Kathir excerpt if available */}
            {comparisonData?.tafsirs?.ibn_kathir && (
              <div className="space-y-2 pt-3 border-t border-inherit">
                <span className="font-bold text-[var(--gold)] block font-cairo">
                  تفسير ابن كثير:
                </span>
                <p className="opacity-90 leading-loose">
                  {comparisonData.tafsirs.ibn_kathir.textAr}
                </p>
              </div>
            )}
          </div>

          {/* Drawer Actions */}
          <div className="pt-3 border-t border-inherit flex gap-2">
            {onOpenTafsirComparison && (
              <button
                onClick={() => {
                  setShowTafsirPanel(false);
                  onOpenTafsirComparison(surahNumber, activeAyahNumber);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[var(--gold)] text-black text-xs font-bold text-center shadow-md"
              >
                فتح مختبر المقارنة الكامل
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
