'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  BookOpen, 
  Play, 
  Bookmark, 
  BookmarkCheck, 
  Share2, 
  Eye, 
  EyeOff, 
  Mic, 
  MicOff, 
  RotateCcw, 
  Volume2, 
  Sparkles, 
  Sliders, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  ChevronLeft,
  Maximize2,
  Layers,
  Edit3,
  X
} from 'lucide-react';
import { 
  SURAH_LIST, 
  SurahMeta, 
  Ayah, 
  VERIFIED_OFFLINE_SURAHS, 
  RECITERS, 
  getAyahAudioUrl 
} from '../data/quranMetadata';
import { AudioTrack } from './AudioPlayerBar';
import { localStore } from '../lib/supabase';
import { QuranDictionaryModal } from './quran/QuranDictionaryModal.tsx';
import { QuranFocusMode } from './quran/QuranFocusMode.tsx';
import { TafsirComparisonWorkspace } from './quran/TafsirComparisonWorkspace.tsx';
import { SurahInformationCard } from './quran/SurahInformationCard.tsx';
import { QuranDictionaryEngine } from '../utils/quranDictionaryEngine.ts';
import { audioSyncEngine } from '../utils/audioSyncEngine.ts';

export type { Ayah };

interface QuranPlatformProps {
  onPlayTrack: (track: AudioTrack) => void;
  onOpenShareCard: (content: { title: string; text: string; source: string; category: string }) => void;
  selectedReciterId: string;
  isEnglish: boolean;
  onSaveReadingPosition: (surahNum: number, ayahNum: number) => void;
  onOpenReflectionJournal?: (surah?: number, ayah?: number) => void;
  onOpenThematicIndex?: (surahNumber?: number) => void;
  onOpenSimilarAyahs?: (surahNumber?: number) => void;
  initialSurahNumber?: number;
  initialAyahNumber?: number;
}

export const QuranPlatform: React.FC<QuranPlatformProps> = ({
  onPlayTrack,
  onOpenShareCard,
  selectedReciterId,
  isEnglish,
  onSaveReadingPosition,
  onOpenReflectionJournal,
  onOpenThematicIndex,
  onOpenSimilarAyahs,
  initialSurahNumber,
  initialAyahNumber
}) => {
  // Navigation & selection state
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(initialSurahNumber || 1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Meccan' | 'Medinan'>('all');
  
  // Surah Information Card Modal State
  const [isSurahCardOpen, setIsSurahCardOpen] = useState(false);

  // Audio Synchronization State
  const [activeSyncedAyah, setActiveSyncedAyah] = useState<number | null>(null);
  const [isAudioSyncActive, setIsAudioSyncActive] = useState<boolean>(false);
  
  // Surah Content state
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [isLoadingAyahs, setIsLoadingAyahs] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Reader Settings
  const [fontSize, setFontSize] = useState<number>(() => localStore.get('quran_font_size', 26));
  const [showTafsir, setShowTafsir] = useState<boolean>(false);
  const [showTranslation, setShowTranslation] = useState<boolean>(false);
  const [bookmarkedAyahs, setBookmarkedAyahs] = useState<number[]>(() => localStore.get('bookmarked_ayahs', []));

  // Advanced Mode Overlays
  const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);
  const [isTafsirWorkspaceOpen, setIsTafsirWorkspaceOpen] = useState(false);
  const [tafsirWorkspaceAyah, setTafsirWorkspaceAyah] = useState<number>(1);

  // Quran Dictionary State
  const [isDictModalOpen, setIsDictModalOpen] = useState(false);
  const [dictWord, setDictWord] = useState('');
  const [dictAyahText, setDictAyahText] = useState('');
  const [dictSurahNum, setDictSurahNum] = useState(1);
  const [dictAyahNum, setDictAyahNum] = useState(1);

  // Memorization / Tasmee' Mode State
  const [isMemorizationMode, setIsMemorizationMode] = useState(false);
  const [hiddenAyahs, setHiddenAyahs] = useState<Record<number, boolean>>({});
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Current selected surah metadata
  const currentSurah = SURAH_LIST.find(s => s.number === selectedSurahNumber) || SURAH_LIST[0];

  // Load Ayahs when selectedSurahNumber changes
  useEffect(() => {
    // 1. Check local verified offline dataset first
    if (VERIFIED_OFFLINE_SURAHS[selectedSurahNumber]) {
      setAyahs(VERIFIED_OFFLINE_SURAHS[selectedSurahNumber]);
      setIsLoadingAyahs(false);
      setApiError(null);
      return;
    }

    // 2. Fetch from reliable Quran API with graceful timeout
    setIsLoadingAyahs(true);
    setApiError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    fetch(`https://api.alquran.cloud/v1/surah/${selectedSurahNumber}/editions/quran-uthmani,en.sahih`, {
      signal: controller.signal
    })
      .then(res => res.json())
      .then(data => {
        clearTimeout(timeoutId);
        if (data.code === 200 && data.data && data.data.length >= 2) {
          const arEdition = data.data[0];
          const enEdition = data.data[1];

          const loadedAyahs: Ayah[] = arEdition.ayahs.map((a: any, idx: number) => ({
            number: a.number,
            numberInSurah: a.numberInSurah,
            text: a.text,
            translationEn: enEdition.ayahs[idx]?.text || '',
            tafsirAr: 'تفسير ميسر مستفاد من كتب التفسير المعتمدة لبيان المعنى الإجمالي للآية الكريمة.'
          }));
          setAyahs(loadedAyahs);
        } else {
          throw new Error('API invalid response format');
        }
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        console.warn('API fallback trigger:', err);
        // Offline Fallback Template for graceful operation
        const fallbackAyahs: Ayah[] = Array.from({ length: Math.min(currentSurah.numberOfAyahs, 10) }, (_, i) => ({
          number: i + 1,
          numberInSurah: i + 1,
          text: i === 0 ? "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ" : `آية كريمة رقم ${i + 1} من ${currentSurah.name}`,
          translationEn: `Verse ${i + 1} of Surah ${currentSurah.englishName}`,
          tafsirAr: "يرجى الاتصال بالإنترنت لتحميل كامل نص وتفسير السورة."
        }));
        setAyahs(fallbackAyahs);
        setApiError('تم تشغيل الوضع غير المتصل بالإنترنت لهذه السورة.');
      })
      .finally(() => {
        setIsLoadingAyahs(false);
      });

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [selectedSurahNumber, currentSurah]);

  // Audio Synchronization Subscription
  useEffect(() => {
    const unsubscribe = audioSyncEngine.subscribe((syncState) => {
      setIsAudioSyncActive(syncState.isSyncActive);
      if (syncState.isSyncActive && syncState.currentSurahNumber === selectedSurahNumber) {
        setActiveSyncedAyah(syncState.currentAyahNumber);
        const node = document.getElementById(`ayah-node-${syncState.currentAyahNumber}`);
        if (node) {
          node.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        setActiveSyncedAyah(null);
      }
    });
    return unsubscribe;
  }, [selectedSurahNumber]);

  // Scroll to initialAyahNumber when loaded if provided
  useEffect(() => {
    if (initialAyahNumber && ayahs.length >= initialAyahNumber) {
      setTimeout(() => {
        const node = document.getElementById(`ayah-node-${initialAyahNumber}`);
        if (node) {
          node.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [initialAyahNumber, ayahs]);

  // Play Synced Ayah handler
  const handleStartSyncedAyah = (ayahNum: number) => {
    const track = audioSyncEngine.startSync(selectedSurahNumber, ayahNum, selectedReciterId);
    onPlayTrack(track);
  };

  // Handle font size change
  const handleFontSizeChange = (newSize: number) => {
    setFontSize(newSize);
    localStore.set('quran_font_size', newSize);
  };

  // Toggle Bookmark
  const toggleBookmark = (ayahNumber: number, numberInSurah: number) => {
    let updated: number[];
    if (bookmarkedAyahs.includes(ayahNumber)) {
      updated = bookmarkedAyahs.filter(id => id !== ayahNumber);
    } else {
      updated = [...bookmarkedAyahs, ayahNumber];
      onSaveReadingPosition(selectedSurahNumber, numberInSurah);
    }
    setBookmarkedAyahs(updated);
    localStore.set('bookmarked_ayahs', updated);
  };

  // Word selection for interactive Quran dictionary
  const handleWordClick = (word: string, ayahText: string, surahNum: number, ayahNum: number) => {
    const cleanWord = word.replace(/[ۖ-۩،.؛:؟!]/g, '').trim();
    if (!cleanWord) return;
    setDictWord(cleanWord);
    setDictAyahText(ayahText);
    setDictSurahNum(surahNum);
    setDictAyahNum(ayahNum);
    setIsDictModalOpen(true);
  };

  // Toggle Ayah Hidden State in Memorization Mode
  const toggleAyahVisibility = (numberInSurah: number) => {
    setHiddenAyahs(prev => ({
      ...prev,
      [numberInSurah]: !prev[numberInSurah]
    }));
  };

  // Audio Recording (Self-Tasmee')
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      alert(isEnglish ? 'Microphone permission denied or not available.' : 'تعذر الوصول إلى الميكروفون، يرجى منح الإذن للتسجيل.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Filter Surahs
  const filteredSurahs = SURAH_LIST.filter(s => {
    const matchesSearch = s.name.includes(searchQuery) || 
      s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(s.number) === searchQuery;
    const matchesFilter = filterType === 'all' || s.revelationType === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 pb-24">
      {/* Surah List & Quick Switcher Strip */}
      <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-black text-[var(--text-main)] font-cairo flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[var(--gold)]" />
              <span>{isEnglish ? 'The Noble Quran' : 'المصحف الشريف وتلاوته'}</span>
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {isEnglish ? 'Read, listen, and memorize the 114 Surahs' : 'تلاوة عطرة، وتدبر معاني، وحفظ متقن لجميع السور الـ 114'}
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <div className="relative w-full sm:w-auto sm:min-w-[200px] flex-1 min-w-0">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
              <input
                type="text"
                placeholder={isEnglish ? 'Search surah by name or number...' : 'ابحث باسم السورة أو رقمها...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--bg-card-subtle)] border border-[var(--border-color)] rounded-xl pr-9 pl-3 py-1.5 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--gold)]"
              />
            </div>

            <div className="flex items-center bg-[var(--bg-card-subtle)] border border-[var(--border-color)] rounded-xl p-1 text-xs">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2 py-1 rounded-lg font-bold transition-colors ${filterType === 'all' ? 'bg-[var(--primary)] text-white' : 'text-[var(--text-muted)]'}`}
              >
                {isEnglish ? 'All' : 'الكل'}
              </button>
              <button
                onClick={() => setFilterType('Meccan')}
                className={`px-2 py-1 rounded-lg font-bold transition-colors ${filterType === 'Meccan' ? 'bg-[var(--primary)] text-white' : 'text-[var(--text-muted)]'}`}
              >
                {isEnglish ? 'Meccan' : 'مكية'}
              </button>
              <button
                onClick={() => setFilterType('Medinan')}
                className={`px-2 py-1 rounded-lg font-bold transition-colors ${filterType === 'Medinan' ? 'bg-[var(--primary)] text-white' : 'text-[var(--text-muted)]'}`}
              >
                {isEnglish ? 'Medinan' : 'مدنية'}
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Surahs Scrollable Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {filteredSurahs.map(s => {
            const isSelected = s.number === selectedSurahNumber;
            return (
              <button
                key={s.number}
                onClick={() => setSelectedSurahNumber(s.number)}
                className={`shrink-0 px-3.5 py-2 rounded-2xl border text-right transition-all flex items-center gap-2.5 ${
                  isSelected
                    ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] text-white border-transparent shadow-md scale-105'
                    : 'bg-[var(--bg-card-subtle)] border-[var(--border-color)] text-[var(--text-main)] hover:border-[var(--gold)]'
                }`}
              >
                <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center font-mono ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-[var(--bg-card)] text-[var(--gold)] border border-[var(--border-gold)]'
                }`}>
                  {s.number}
                </span>
                <div>
                  <span className="text-xs font-bold block">{s.name}</span>
                  <span className={`text-[10px] block ${isSelected ? 'text-emerald-100' : 'text-[var(--text-muted)]'}`}>
                    {s.numberOfAyahs} آية
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Quran Reader & Memorization Studio Toolbar */}
      <section className="bg-[var(--bg-card)] border border-[var(--border-gold)] rounded-3xl p-5 sm:p-6 shadow-sm">
        {/* Surah Header Card */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-5 border-b border-[var(--border-color)] text-center md:text-right">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--gold-light)] text-[var(--gold)] text-xs font-bold mb-2">
              <span>{currentSurah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</span>
              <span>•</span>
              <span>{currentSurah.numberOfAyahs} آية</span>
              <span>•</span>
              <span>الجزء {currentSurah.juzStart}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-quran font-bold text-[var(--text-main)]">
              سُورَةُ {currentSurah.name}
            </h1>
            <p className="text-xs text-[var(--text-muted)] font-tajawal mt-1">
              {currentSurah.englishName} ({currentSurah.englishNameTranslation})
            </p>
          </div>

          {/* Quick Surah Audio Play & Mode Toggles */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <button
              onClick={() => onPlayTrack({
                id: `surah-${currentSurah.number}`,
                titleAr: `سورة ${currentSurah.name}`,
                titleEn: `Surah ${currentSurah.englishName}`,
                subtitleAr: `تلاوة الشيخ مشاري راشد العفاسي`,
                subtitleEn: `Mishary Alafasy Recitation`,
                audioUrl: getAyahAudioUrl('alafasy', currentSurah.number, 1),
                surahNumber: currentSurah.number
              })}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] text-white text-xs font-bold shadow-md hover:scale-105 transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{isEnglish ? 'Listen to Surah' : 'استمع للسورة كاملة'}</span>
            </button>

            {/* Surah Information Card Button */}
            <button
              onClick={() => setIsSurahCardOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[var(--gold)]/15 text-[var(--gold)] hover:bg-[var(--gold)]/25 border border-[var(--gold)]/30 transition-all shadow-sm"
              title="بطاقة تعريف بالسورة ومقاصدها"
            >
              <BookOpen className="w-4 h-4" />
              <span>بطاقة السورة</span>
            </button>

            {/* Thematic Index Link */}
            {onOpenThematicIndex && (
              <button
                onClick={() => onOpenThematicIndex(currentSurah.number)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[var(--bg-card-subtle)] text-[var(--text-main)] hover:border-[var(--gold)] border border-[var(--border-color)] transition-colors"
                title="موضوعات السورة في الفهرس الموضوعي"
              >
                <Layers className="w-4 h-4 text-[var(--gold)]" />
                <span>الفهرس الموضوعي</span>
              </button>
            )}

            {/* Similar Ayahs Explorer Link */}
            {onOpenSimilarAyahs && (
              <button
                onClick={() => onOpenSimilarAyahs(currentSurah.number)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[var(--bg-card-subtle)] text-[var(--text-main)] hover:border-[var(--gold)] border border-[var(--border-color)] transition-colors"
                title="مستكشف الآيات المتشابهة"
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>الآيات المتشابهة</span>
              </button>
            )}

            {/* Audio Sync Live Indicator */}
            {isAudioSyncActive && activeSyncedAyah && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--gold)]/20 border border-[var(--gold)] text-[var(--gold)] text-xs font-bold animate-pulse">
                <Volume2 className="w-3.5 h-3.5" />
                <span>تلاوة متزامنة: آية {activeSyncedAyah}</span>
              </div>
            )}

            {/* Focus Mode Action */}
            <button
              onClick={() => setIsFocusModeOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-700 to-[var(--primary)] text-white shadow-md hover:scale-105 transition-all"
              title="وضع القراءة الخالي من المشتتات"
            >
              <Maximize2 className="w-4 h-4" />
              <span>{isEnglish ? 'Focus Mode' : 'وضع التركيز'}</span>
            </button>

            {/* Tafsir Comparison Lab Shortcut */}
            <button
              onClick={() => {
                setTafsirWorkspaceAyah(1);
                setIsTafsirWorkspaceOpen(true);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[var(--gold)]/10 text-[var(--gold)] hover:bg-[var(--gold)]/20 border border-[var(--gold)]/30 transition-all"
              title="مقارنة التفاسير الخمسة المعتمدة"
            >
              <Layers className="w-4 h-4" />
              <span>{isEnglish ? 'Tafsir Lab' : 'مختبر التدبر'}</span>
            </button>

            {/* Memorization Mode Toggle */}
            <button
              onClick={() => setIsMemorizationMode(!isMemorizationMode)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                isMemorizationMode 
                  ? 'bg-amber-500 text-white border-amber-600 shadow-sm' 
                  : 'bg-[var(--bg-card-subtle)] text-[var(--text-main)] border-[var(--border-color)] hover:border-[var(--gold)]'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{isEnglish ? 'Memorization Mode' : 'وضع التحفيظ'}</span>
            </button>

            {/* Tafsir Toggle */}
            <button
              onClick={() => setShowTafsir(!showTafsir)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                showTafsir ? 'bg-[var(--gold)] text-white border-[var(--gold)]' : 'bg-[var(--bg-card-subtle)] text-[var(--text-main)] border-[var(--border-color)]'
              }`}
            >
              {isEnglish ? 'Tafsir' : 'التفسير الميسر'}
            </button>

            {/* English Translation Toggle */}
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                showTranslation ? 'bg-[var(--gold)] text-white border-[var(--gold)]' : 'bg-[var(--bg-card-subtle)] text-[var(--text-main)] border-[var(--border-color)]'
              }`}
            >
              EN Translation
            </button>
          </div>
        </div>

        {/* Font Size Adjuster Bar & Dictionary Hint */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 border-b border-[var(--border-color)] text-xs text-[var(--text-muted)] gap-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4" />
            <span>حجم خط المصحف:</span>
            <input
              type="range"
              min={20}
              max={44}
              value={fontSize}
              onChange={(e) => handleFontSizeChange(Number(e.target.value))}
              className="accent-[var(--primary)] cursor-pointer w-28"
            />
            <span className="font-mono font-bold text-[var(--text-main)]">{fontSize}px</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-[var(--gold)] font-medium">
            <BookOpen className="w-3.5 h-3.5" />
            <span>انقر على أي كلمة في الآيات لفتح معجم القرآن التفاعلي وجذرها اللغوي</span>
          </div>
        </div>

        {/* Memorization Audio Recording Studio (When Memorization Mode Active) */}
        {isMemorizationMode && (
          <div className="my-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[var(--text-main)]">
                  {isEnglish ? 'Self-Tasmee Voice Recorder' : 'استوديو التسجيل والتسميع الذاتي'}
                </h4>
                <p className="text-xs text-[var(--text-muted)]">
                  {isEnglish ? 'Record your recitation to review your memorization' : 'سجّل صوتك أثناء التلاوة واستمع إليه للتأكد من صحة حفظك'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isRecording ? (
                <button
                  onClick={stopRecording}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 animate-pulse shadow-md"
                >
                  <MicOff className="w-4 h-4" />
                  <span>إيقاف التسجيل</span>
                </button>
              ) : (
                <button
                  onClick={startRecording}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-2 shadow-md"
                >
                  <Mic className="w-4 h-4" />
                  <span>بدء تسجيل التسميع</span>
                </button>
              )}

              {recordedAudioUrl && (
                <audio controls src={recordedAudioUrl} className="h-9 max-w-[200px]" />
              )}
            </div>
          </div>
        )}

        {/* Basmalah (For all surahs except Surah At-Tawbah #9) */}
        {currentSurah.number !== 9 && (
          <div className="text-center py-6">
            <p className="font-quran text-3xl font-bold text-[var(--gold)]">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
          </div>
        )}

        {/* Ayahs Display Area */}
        {isLoadingAyahs ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-[var(--gold)] animate-spin mx-auto mb-2" />
            <p className="text-sm text-[var(--text-muted)]">جاري تحميل آيات السورة الكريمة...</p>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {apiError && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            {ayahs.map((ayah) => {
              const isHidden = Boolean(hiddenAyahs[ayah.numberInSurah]);
              const isBookmarked = bookmarkedAyahs.includes(ayah.number);
              const isCurrentlySynced = activeSyncedAyah === ayah.numberInSurah;
              const words = ayah.text.split(' ');

              return (
                <div
                  key={ayah.number}
                  id={`ayah-node-${ayah.numberInSurah}`}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    isCurrentlySynced
                      ? 'active-synced-ayah border-2 border-[var(--gold)] shadow-xl'
                      : isBookmarked
                      ? 'bg-[var(--gold-light)]/40 border-[var(--gold)] shadow-sm'
                      : 'bg-[var(--bg-card-subtle)] border-[var(--border-color)] hover:border-[var(--primary)]'
                  }`}
                >
                  {/* Top Bar for Ayah actions */}
                  <div className="flex items-center justify-between mb-3 text-xs text-[var(--text-muted)]">
                    <div className="flex items-center gap-2">
                      <span className={`w-7 h-7 rounded-lg border font-bold flex items-center justify-center font-mono ${
                        isCurrentlySynced 
                          ? 'bg-[var(--gold)] text-black border-[var(--gold)]' 
                          : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--gold)]'
                      }`}>
                        {ayah.numberInSurah}
                      </span>
                      <span>آية {ayah.numberInSurah}</span>
                      {isCurrentlySynced && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--gold)]/20 text-[var(--gold)] font-bold animate-pulse">
                          يُتلى الآن
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Synchronized Recitation from this Ayah */}
                      <button
                        onClick={() => handleStartSyncedAyah(ayah.numberInSurah)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isCurrentlySynced 
                            ? 'text-[var(--gold)] bg-[var(--gold)]/20' 
                            : 'text-[var(--text-muted)] hover:text-emerald-500 hover:bg-[var(--bg-card)]'
                        }`}
                        title="بدء التلاوة المتزامنة من هذه الآية"
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </button>

                      {/* Audio Play this Ayah Only */}
                      <button
                        onClick={() => onPlayTrack({
                          id: `ayah-${currentSurah.number}-${ayah.numberInSurah}`,
                          titleAr: `سورة ${currentSurah.name}: آية ${ayah.numberInSurah}`,
                          titleEn: `${currentSurah.englishName}: Ayah ${ayah.numberInSurah}`,
                          subtitleAr: `تلاوة الآية الكريمة`,
                          subtitleEn: `Ayah Recitation`,
                          audioUrl: getAyahAudioUrl(selectedReciterId, currentSurah.number, ayah.numberInSurah),
                          surahNumber: currentSurah.number,
                          ayahNumber: ayah.numberInSurah
                        })}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--bg-card)] transition-colors"
                        title="استماع لهذه الآية منفردة"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>

                      {/* Bookmark this Ayah */}
                      <button
                        onClick={() => toggleBookmark(ayah.number, ayah.numberInSurah)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isBookmarked 
                            ? 'text-[var(--gold)] bg-[var(--gold-light)]' 
                            : 'text-[var(--text-muted)] hover:text-[var(--gold)] hover:bg-[var(--bg-card)]'
                        }`}
                        title={isBookmarked ? 'إزالة العلامة' : 'حفظ كعلامة للقراءة'}
                      >
                        {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                      </button>

                      {/* Tafsir Comparison Lab Shortcut */}
                      <button
                        onClick={() => {
                          setTafsirWorkspaceAyah(ayah.numberInSurah);
                          setIsTafsirWorkspaceOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--gold)] hover:bg-[var(--bg-card)] transition-colors"
                        title="مقارنة التفاسير الخمسة"
                      >
                        <Layers className="w-4 h-4" />
                      </button>

                      {/* Quran Dictionary for first word of Ayah */}
                      <button
                        onClick={() => {
                          const w = words[0] || '';
                          handleWordClick(w, ayah.text, currentSurah.number, ayah.numberInSurah);
                        }}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--gold)] hover:bg-[var(--bg-card)] transition-colors"
                        title="معجم مفردات الآية"
                      >
                        <BookOpen className="w-4 h-4" />
                      </button>

                      {/* Reflection Journal Action */}
                      {onOpenReflectionJournal && (
                        <button
                          onClick={() => onOpenReflectionJournal(currentSurah.number, ayah.numberInSurah)}
                          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--gold)] hover:bg-[var(--bg-card)] transition-colors"
                          title="تدوين تدبر لهذه الآية"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}

                      {/* Share as Card */}
                      <button
                        onClick={() => onOpenShareCard({
                          title: `سورة ${currentSurah.name}`,
                          text: ayah.text,
                          source: `سورة ${currentSurah.name} [الآية: ${ayah.numberInSurah}]`,
                          category: 'quran'
                        })}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--gold)] hover:bg-[var(--bg-card)] transition-colors"
                        title="مشاركة كبطاقة دعوية"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      {/* Memorization Mode Eye Toggle */}
                      {isMemorizationMode && (
                        <button
                          onClick={() => toggleAyahVisibility(ayah.numberInSurah)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isHidden ? 'bg-amber-500 text-white' : 'text-amber-600 bg-amber-100'
                          }`}
                          title={isHidden ? 'إظهار الآية' : 'إخفاء الآية للاختبار'}
                        >
                          {isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Quran Ayah Text with Interactive Clickable Words */}
                  <div
                    className={`transition-all ${
                      isHidden ? 'bg-gray-200/50 dark:bg-gray-800/50 rounded-xl p-4 text-center filter blur-sm select-none cursor-pointer' : ''
                    }`}
                    onClick={() => isMemorizationMode && isHidden && toggleAyahVisibility(ayah.numberInSurah)}
                  >
                    <p
                      className="font-quran font-bold text-[var(--text-main)] leading-loose text-center md:text-right"
                      style={{ fontSize: `${fontSize}px` }}
                    >
                      {words.map((word, wIdx) => (
                        <span
                          key={wIdx}
                          onClick={() => !isMemorizationMode && handleWordClick(word, ayah.text, currentSurah.number, ayah.numberInSurah)}
                          className="hover:text-[var(--gold)] hover:underline decoration-dotted transition-colors cursor-pointer rounded px-0.5"
                          title="انقر للاطلاع على معجم الكلمة وجذرها"
                        >
                          {word}{' '}
                        </span>
                      ))}
                      <span className="ayah-end-symbol">{ayah.numberInSurah}</span>
                    </p>
                  </div>

                  {/* Hidden Overlay Hint */}
                  {isMemorizationMode && isHidden && (
                    <div 
                      onClick={() => toggleAyahVisibility(ayah.numberInSurah)}
                      className="text-center text-xs text-amber-600 font-bold py-2 cursor-pointer hover:underline"
                    >
                      [الآية مخفية — اضغط هنا لإظهارها والتحقق من حفظك]
                    </div>
                  )}

                  {/* Tafsir Al-Muyassar Section */}
                  {showTafsir && ayah.tafsirAr && !isHidden && (
                    <div className="mt-3 pt-3 border-t border-[var(--border-color)] bg-[var(--bg-card)] p-3 rounded-xl">
                      <span className="text-[11px] font-bold text-[var(--gold)] block mb-1">
                        التفسير الميسر:
                      </span>
                      <p className="text-xs text-[var(--text-muted)] font-tajawal leading-relaxed">
                        {ayah.tafsirAr}
                      </p>
                    </div>
                  )}

                  {/* English Translation Section */}
                  {showTranslation && ayah.translationEn && !isHidden && (
                    <div className="mt-2 p-3 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)]">
                      <span className="text-[11px] font-bold text-[var(--text-primary)] block mb-1">
                        English Translation (Saheeh International):
                      </span>
                      <p className="text-xs text-[var(--text-muted)] font-sans italic leading-relaxed">
                        {ayah.translationEn}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Focus Mode Fullscreen Canvas */}
      {isFocusModeOpen && (
        <QuranFocusMode
          surahNumber={selectedSurahNumber}
          ayahs={ayahs}
          initialAyahNumber={1}
          isEnglish={isEnglish}
          onClose={() => setIsFocusModeOpen(false)}
          onSelectWord={(word, ayahText, sNum, aNum) => handleWordClick(word, ayahText, sNum, aNum)}
          onOpenTafsirComparison={(sNum, aNum) => {
            setTafsirWorkspaceAyah(aNum);
            setIsTafsirWorkspaceOpen(true);
          }}
          onOpenReflectionJournal={onOpenReflectionJournal}
        />
      )}

      {/* Interactive Quran Dictionary Modal */}
      {isDictModalOpen && (
        <QuranDictionaryModal
          isOpen={isDictModalOpen}
          lookupResult={QuranDictionaryEngine.lookupWord(dictWord, dictSurahNum, dictAyahNum)}
          isEnglish={isEnglish}
          onClose={() => setIsDictModalOpen(false)}
          onOpenAyah={(s, a) => {
            setSelectedSurahNumber(s);
            setIsDictModalOpen(false);
          }}
          onOpenShareCard={onOpenShareCard}
        />
      )}

      {/* Tafsir Comparison Lab Modal */}
      {isTafsirWorkspaceOpen && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-label="مختبر تدبر الآيات ومقارنة التفاسير"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsTafsirWorkspaceOpen(false);
          }}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md overflow-y-auto p-4 sm:p-6 flex items-start justify-center"
        >
          <div className="bg-[var(--bg-card)] border border-[var(--border-gold)] rounded-3xl max-w-5xl w-full p-6 my-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)] mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[var(--gold)]" />
                <h2 className="text-lg font-bold text-[var(--text-main)] font-cairo">
                  مختبر تدبر الآيات ومقارنة التفاسير
                </h2>
              </div>
              <button
                onClick={() => setIsTafsirWorkspaceOpen(false)}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer touch-manipulation"
                aria-label="Close"
              >
                <X className="w-5 h-5 pointer-events-none" />
              </button>
            </div>

            <TafsirComparisonWorkspace
              initialSurah={selectedSurahNumber}
              initialAyah={tafsirWorkspaceAyah}
              isEnglish={isEnglish}
              onOpenReflectionJournal={(s, a) => {
                setIsTafsirWorkspaceOpen(false);
                if (onOpenReflectionJournal) {
                  onOpenReflectionJournal(s, a);
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Surah Information Card Modal */}
      {isSurahCardOpen && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-label="بطاقة تعريف السورة"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsSurahCardOpen(false);
          }}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md overflow-y-auto p-4 sm:p-6 flex items-start justify-center"
        >
          <div className="max-w-4xl w-full my-6 relative animate-in zoom-in-95 duration-200">
            <SurahInformationCard
              surahNumber={selectedSurahNumber}
              onClose={() => setIsSurahCardOpen(false)}
              onReadSurah={(sNum, aNum) => {
                setSelectedSurahNumber(sNum);
                setIsSurahCardOpen(false);
                if (aNum) {
                  setTimeout(() => {
                    document.getElementById(`ayah-node-${aNum}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }, 300);
                }
              }}
              onPlaySurah={(sNum, reciter) => {
                const track = audioSyncEngine.startSync(sNum, 1, reciter);
                onPlayTrack(track);
                setIsSurahCardOpen(false);
              }}
              onOpenTafsir={(sNum, aNum) => {
                setIsSurahCardOpen(false);
                setTafsirWorkspaceAyah(aNum);
                setIsTafsirWorkspaceOpen(true);
              }}
              onOpenSimilarAyahs={(sNum) => {
                setIsSurahCardOpen(false);
                if (onOpenSimilarAyahs) onOpenSimilarAyahs(sNum);
              }}
              onOpenThematicIndex={(sNum) => {
                setIsSurahCardOpen(false);
                if (onOpenThematicIndex) onOpenThematicIndex(sNum);
              }}
              onOpenShareCard={onOpenShareCard}
              selectedReciterId={selectedReciterId}
              onChangeReciter={() => {}}
              isEnglish={isEnglish}
            />
          </div>
        </div>
      )}
    </div>
  );
};
