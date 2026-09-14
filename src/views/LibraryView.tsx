import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Heart,
  Share2,
  Bookmark,
  ChevronRight,
  ChevronLeft,
  Sliders,
  Sun,
  Moon,
  Type,
  FileText,
  ShieldCheck,
  CheckCircle2,
  X,
  Sparkles,
  Info
} from 'lucide-react';
import { LIBRARY_BOOKS_DATA, LIBRARY_CATEGORIES } from '../data/libraryData';
import { LibraryBook, LibraryChapter, LibraryBookProgress } from '../types';
import { useUser } from '../context/UserContext';
import { useShareModal } from '../context/ShareContext';
import { normalizeArabicText } from '../services/searchService';

const LIBRARY_PROGRESS_KEY = 'wasl_library_progress_v1';

export const LibraryView: React.FC = () => {
  const { toggleFavorite, isFavorite } = useUser();
  const { openShareModal } = useShareModal();

  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBook, setActiveBook] = useState<LibraryBook | null>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);

  // Reader Customization Preferences
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [readerTheme, setReaderTheme] = useState<'default' | 'sepia' | 'dark'>('default');
  const [lineHeight, setLineHeight] = useState<'normal' | 'relaxed' | 'loose'>('relaxed');

  // Reading progress
  const [progressMap, setProgressMap] = useState<Record<string, LibraryBookProgress>>(() => {
    try {
      const raw = localStorage.getItem(LIBRARY_PROGRESS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  // Filter books
  const filteredBooks = useMemo(() => {
    const q = searchQuery.trim();
    const normQ = normalizeArabicText(q);

    return LIBRARY_BOOKS_DATA.filter((b) => {
      const matchCat =
        selectedCategory === 'الكل' || b.category === selectedCategory;
      if (!matchCat) return false;
      if (!q) return true;

      const normTitle = normalizeArabicText(b.title);
      const normAuthor = normalizeArabicText(b.author);
      const normDesc = normalizeArabicText(b.description);

      return (
        normTitle.includes(normQ) ||
        normAuthor.includes(normQ) ||
        normDesc.includes(normQ)
      );
    });
  }, [searchQuery, selectedCategory]);

  // Open a book to read
  const handleOpenBook = (book: LibraryBook, chapterIdx = 0) => {
    setActiveBook(book);
    const savedProg = progressMap[book.id];
    if (savedProg && savedProg.chapterId) {
      const foundIdx = book.chapters.findIndex((c) => c.id === savedProg.chapterId);
      setActiveChapterIndex(foundIdx >= 0 ? foundIdx : chapterIdx);
    } else {
      setActiveChapterIndex(chapterIdx);
    }
  };

  // Save progress when changing chapters
  const handleChapterChange = (newIdx: number) => {
    if (!activeBook) return;
    setActiveChapterIndex(newIdx);
    const chap = activeBook.chapters[newIdx];
    const newProg: LibraryBookProgress = {
      bookId: activeBook.id,
      chapterId: chap?.id,
      completed: newIdx === activeBook.chapters.length - 1,
      lastReadAt: new Date().toISOString()
    };
    const updated = { ...progressMap, [activeBook.id]: newProg };
    setProgressMap(updated);
    try {
      localStorage.setItem(LIBRARY_PROGRESS_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Share book excerpt or details
  const handleShare = (book: LibraryBook, chapter?: LibraryChapter) => {
    openShareModal({
      type: 'library',
      title: chapter ? `${chapter.title} — ${book.title}` : book.title,
      text: chapter ? chapter.content.substring(0, 180) : book.description,
      subtext: `المؤلف: ${book.author} • التصنيف: ${book.category}`,
      reference: `${book.publisher || book.license}`,
      sourceUrl: typeof window !== 'undefined' ? window.location.href : 'https://waslislam.com/library'
    });
  };

  // Favorite toggle
  const handleFavorite = async (book: LibraryBook) => {
    await toggleFavorite({
      type: 'library_book',
      title: book.title,
      subtitle: `${book.author} • ${book.category}`,
      reference: book.license
    });
  };

  const currentChapter = activeBook ? activeBook.chapters[activeChapterIndex] : null;

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Top Hero Banner */}
      {!activeBook && (
        <div className="bg-white dark:bg-emerald-950/80 rounded-3xl p-6 sm:p-8 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-3 border border-emerald-300/40 dark:border-emerald-700/50">
              <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black font-amiri text-slate-900 dark:text-white leading-tight">
              المكتبة الإسلامية الجامعة
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              مكتبة إسلامية موثقة تقدم نصوص أمهات الكتب في التفسير، الحديث، العقيدة، الفقه والسيرة والآداب، متاحة للقراءة الحرة والانتفاع العلمي في الملك العام والوقف الخيري.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>كتب وتفاسير متواترة محققة بالكامل وموثقة الحقوق</span>
              </span>
              <span>•</span>
              <span>{LIBRARY_BOOKS_DATA.length} مؤلفات كلاسيكية معتمدة</span>
            </div>
          </div>

          {/* Search & Category Tabs */}
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-emerald-900/60 space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بعنوان الكتاب، المؤلف، أو الفن الشرعي..."
                className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-slate-200 dark:border-emerald-700/60 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {LIBRARY_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-emerald-900/30 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-emerald-900/50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 1: BOOKS CATALOG GRID */}
      {!activeBook ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredBooks.map((book) => {
            const isFav = isFavorite('library_book', book.title);
            const prog = progressMap[book.id];

            return (
              <div
                key={book.id}
                className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 border border-emerald-900/10 dark:border-emerald-800/50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group hover:border-emerald-500/50"
              >
                <div>
                  {/* Category & Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                      {book.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {book.chapters.length} فصول
                    </span>
                  </div>

                  {/* Book Title & Author */}
                  <h3
                    onClick={() => handleOpenBook(book)}
                    className="text-lg font-bold font-amiri text-slate-900 dark:text-amber-300 hover:text-emerald-700 cursor-pointer transition-colors leading-snug"
                  >
                    {book.title}
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">
                    {book.author}
                  </span>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 line-clamp-3 leading-relaxed">
                    {book.description}
                  </p>

                  {/* Copyright & License Notice */}
                  <div className="mt-3 p-2 rounded-lg bg-slate-50 dark:bg-emerald-900/20 text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{book.license}</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-emerald-900/50 flex items-center justify-between">
                  <button
                    onClick={() => handleOpenBook(book)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{prog ? 'متابعة القراءة' : 'بدء القراءة'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleFavorite(book)}
                      className={`p-2 rounded-xl transition-colors ${
                        isFav
                          ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40'
                          : 'text-slate-400 hover:text-rose-500'
                      }`}
                      title="إضافة للمفضلة"
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      onClick={() => handleShare(book)}
                      className="p-2 rounded-xl text-slate-400 hover:text-emerald-600"
                      title="مشاركة الكتاب"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* VIEW 2: DEDICATED ELEGANT READER INTERFACE */
        <div className="space-y-6">
          {/* Reader Top Bar (Back, Theme, Font Size, Book Info) */}
          <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-4 sm:p-5 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={() => setActiveBook(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-emerald-900/40 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
              <span>العودة للمكتبة</span>
            </button>

            <div>
              <h2 className="text-base sm:text-lg font-bold font-amiri text-slate-900 dark:text-white text-center">
                {activeBook.title}
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400 block text-center">
                {activeBook.author}
              </span>
            </div>

            {/* Reader Controls (Theme, Font Size) */}
            <div className="flex items-center gap-2 text-xs">
              {/* Theme Toggles */}
              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-emerald-900/40 border border-slate-200 dark:border-emerald-800">
                <button
                  onClick={() => setReaderTheme('default')}
                  className={`px-2 py-1 rounded-lg font-medium transition-colors ${
                    readerTheme === 'default' ? 'bg-white dark:bg-emerald-800 text-emerald-900 dark:text-white shadow-xs' : 'text-slate-500'
                  }`}
                  title="الوضع الافتراضي"
                >
                  <Sun className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setReaderTheme('sepia')}
                  className={`px-2 py-1 rounded-lg font-medium transition-colors ${
                    readerTheme === 'sepia' ? 'bg-[#fbf0d9] text-[#5f4b32] font-bold shadow-xs' : 'text-slate-500'
                  }`}
                  title="وضع القراءة الهادئ (سيبيا)"
                >
                  سيبيا
                </button>
                <button
                  onClick={() => setReaderTheme('dark')}
                  className={`px-2 py-1 rounded-lg font-medium transition-colors ${
                    readerTheme === 'dark' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500'
                  }`}
                  title="الوضع الليلي"
                >
                  <Moon className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Font Size Selector */}
              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-emerald-900/40 border border-slate-200 dark:border-emerald-800">
                {(['sm', 'base', 'lg', 'xl'] as const).map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setFontSize(sz)}
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-colors ${
                      fontSize === sz ? 'bg-white dark:bg-emerald-800 text-emerald-900 dark:text-white shadow-xs' : 'text-slate-400'
                    }`}
                  >
                    {sz === 'sm' ? 'أ' : sz === 'base' ? 'أ+' : sz === 'lg' ? 'أ++' : 'أ+++'}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleShare(activeBook, currentChapter || undefined)}
                className="p-2 rounded-xl text-slate-500 hover:text-emerald-600 bg-slate-100 dark:bg-emerald-900/40"
                title="مشاركة الفصل"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Reader Body Grid (TOC Sidebar + Chapter Text) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Table of Contents Sidebar */}
            <div className="lg:col-span-4 bg-white dark:bg-emerald-950/80 rounded-2xl p-5 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm space-y-3 max-h-[75vh] overflow-y-auto">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-emerald-900/50 flex items-center justify-between">
                <span>فهرس المحتويات</span>
                <span className="text-xs text-slate-400 font-mono">
                  {activeBook.chapters.length} فصول
                </span>
              </h3>

              <div className="space-y-1.5">
                {activeBook.chapters.map((chap, idx) => (
                  <button
                    key={chap.id}
                    onClick={() => handleChapterChange(idx)}
                    className={`w-full text-right p-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${
                      activeChapterIndex === idx
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-50 dark:bg-emerald-900/20 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-emerald-900/40'
                    }`}
                  >
                    <span className="truncate">{chap.title}</span>
                    <span className="text-[10px] opacity-70 font-mono">#{idx + 1}</span>
                  </button>
                ))}
              </div>

              {/* Book License Info */}
              <div className="pt-4 border-t border-slate-100 dark:border-emerald-900/50 text-[11px] text-slate-400 space-y-1">
                <div>الناشر/المصدر: {activeBook.publisher || 'التراث الإسلامي'}</div>
                <div>الترخيص: {activeBook.license}</div>
              </div>
            </div>

            {/* Reading Pane */}
            <div className="lg:col-span-8">
              {currentChapter ? (
                <div
                  className={`rounded-3xl p-6 sm:p-10 border shadow-sm transition-colors ${
                    readerTheme === 'sepia'
                      ? 'bg-[#fbf0d9] border-[#e7d8bc] text-[#3d2f1d]'
                      : readerTheme === 'dark'
                      ? 'bg-slate-950 border-slate-800 text-slate-100'
                      : 'bg-white dark:bg-emerald-950/80 border-emerald-900/10 dark:border-emerald-800/50 text-slate-900 dark:text-slate-100'
                  }`}
                >
                  {/* Chapter Title */}
                  <div className="border-b pb-4 mb-6 border-current/10">
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold block mb-1">
                      الفصل {activeChapterIndex + 1} من {activeBook.chapters.length}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold font-amiri leading-tight">
                      {currentChapter.title}
                    </h2>
                  </div>

                  {/* Chapter Content */}
                  <div
                    className={`font-amiri whitespace-pre-line leading-loose ${
                      fontSize === 'sm'
                        ? 'text-base'
                        : fontSize === 'base'
                        ? 'text-lg sm:text-xl'
                        : fontSize === 'lg'
                        ? 'text-xl sm:text-2xl'
                        : 'text-2xl sm:text-3xl'
                    }`}
                  >
                    {currentChapter.content}
                  </div>

                  {/* Chapter Navigation Buttons */}
                  <div className="mt-10 pt-6 border-t border-current/10 flex items-center justify-between">
                    <button
                      disabled={activeChapterIndex === 0}
                      onClick={() => handleChapterChange(activeChapterIndex - 1)}
                      className="px-4 py-2 rounded-xl border border-current/20 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold flex items-center gap-1.5 transition-colors hover:bg-current/5"
                    >
                      <ChevronRight className="w-4 h-4" />
                      <span>الفصل السابق</span>
                    </button>

                    <button
                      disabled={activeChapterIndex === activeBook.chapters.length - 1}
                      onClick={() => handleChapterChange(activeChapterIndex + 1)}
                      className="px-4 py-2 rounded-xl border border-current/20 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold flex items-center gap-1.5 transition-colors hover:bg-current/5"
                    >
                      <span>الفصل التالي</span>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
