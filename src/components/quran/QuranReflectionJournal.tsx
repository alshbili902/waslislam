'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  PenTool, 
  Pin, 
  Trash2, 
  Edit3, 
  Search, 
  Tag, 
  Plus, 
  X, 
  Check, 
  Share2, 
  Sparkles, 
  Printer, 
  Calendar, 
  ShieldCheck, 
  Info,
  Clock,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { 
  getReflectionEntries, 
  saveReflectionEntry, 
  deleteReflectionEntry, 
  togglePinReflection, 
  getAutosavedDraft, 
  setAutosavedDraft,
  ReflectionEntry 
} from '../../utils/reflectionJournalManager';
import { SURAH_LIST, VERIFIED_OFFLINE_SURAHS } from '../../data/quranMetadata';

interface QuranReflectionJournalProps {
  isEnglish?: boolean;
  onOpenQuranToAyah?: (surah: number, ayah: number) => void;
  onOpenShareCard?: (content: any) => void;
}

export const QuranReflectionJournal: React.FC<QuranReflectionJournalProps> = ({
  isEnglish = false,
  onOpenQuranToAyah,
  onOpenShareCard
}) => {
  const [entries, setEntries] = useState<ReflectionEntry[]>(() => getReflectionEntries());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSurahFilter, setSelectedSurahFilter] = useState<number | 'all'>('all');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | 'all'>('all');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Editor Form State
  const [formSurah, setFormSurah] = useState<number>(1);
  const [formAyah, setFormAyah] = useState<number>(1);
  const [formTitle, setFormTitle] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formTagInput, setFormTagInput] = useState('');
  const [formTags, setFormTags] = useState<string[]>([]);
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<string>('');

  const refreshEntries = () => {
    setEntries(getReflectionEntries());
  };

  // Resolve Quran Text & Tafsir preview for selected Surah/Ayah
  const selectedSurahMeta = SURAH_LIST.find(s => s.number === formSurah) || SURAH_LIST[0];
  const maxAyahsInSurah = selectedSurahMeta.numberOfAyahs;
  
  const getAyahTextPreview = (surahNum: number, ayahNum: number): string => {
    const surahAyahs = VERIFIED_OFFLINE_SURAHS[surahNum];
    if (surahAyahs && surahAyahs[ayahNum - 1]) {
      return surahAyahs[ayahNum - 1].text;
    }
    return `آية ${ayahNum} من سورة ${selectedSurahMeta.name}`;
  };

  const getTafsirPreview = (surahNum: number, ayahNum: number): string => {
    const surahAyahs = VERIFIED_OFFLINE_SURAHS[surahNum];
    if (surahAyahs && surahAyahs[ayahNum - 1]) {
      return surahAyahs[ayahNum - 1].tafsirAr;
    }
    return 'التفسير الميسر: مأخوذ من المصحف الميسر المعتمد بمجمع الملك فهد لطباعة المصحف الشريف.';
  };

  // Draft autosave effect
  useEffect(() => {
    if (!isEditorOpen || editingId) return;
    const timer = setTimeout(() => {
      if (formTitle.trim() || formNotes.trim()) {
        setAutosavedDraft({
          surahNumber: formSurah,
          ayahNumber: formAyah,
          title: formTitle,
          notes: formNotes,
          tags: formTags
        });
        setAutosaveStatus(isEnglish ? 'Draft saved' : 'تم حفظ المسودة تلقائياً');
        setTimeout(() => setAutosaveStatus(''), 2500);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [formSurah, formAyah, formTitle, formNotes, formTags, isEditorOpen, editingId, isEnglish]);

  const handleOpenNew = () => {
    const draft = getAutosavedDraft();
    if (draft) {
      setFormSurah(draft.surahNumber || 1);
      setFormAyah(draft.ayahNumber || 1);
      setFormTitle(draft.title || '');
      setFormNotes(draft.notes || '');
      setFormTags(draft.tags || []);
    } else {
      setFormSurah(1);
      setFormAyah(1);
      setFormTitle('');
      setFormNotes('');
      setFormTags([]);
    }
    setEditingId(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (entry: ReflectionEntry) => {
    setEditingId(entry.id);
    setFormSurah(entry.surahNumber);
    setFormAyah(entry.ayahNumber);
    setFormTitle(entry.title);
    setFormNotes(entry.notes);
    setFormTags(entry.tags);
    setFormIsPinned(entry.isPinned);
    setIsEditorOpen(true);
  };

  const handleSave = () => {
    if (!formTitle.trim() || !formNotes.trim()) {
      alert(isEnglish ? 'Please enter a title and notes.' : 'يرجى كتابة عنوان للخاطرة وتدوين الملاحظات.');
      return;
    }

    const ayahText = getAyahTextPreview(formSurah, formAyah);
    const tafsirText = getTafsirPreview(formSurah, formAyah);

    saveReflectionEntry({
      id: editingId || undefined,
      surahNumber: formSurah,
      surahName: selectedSurahMeta.name,
      ayahNumber: formAyah,
      ayahText,
      tafsirSource: 'التفسير الميسر',
      tafsirText,
      title: formTitle.trim(),
      notes: formNotes.trim(),
      tags: formTags,
      collectionId: 'default',
      isPinned: formIsPinned
    });

    setAutosavedDraft(null);
    setIsEditorOpen(false);
    refreshEntries();
  };

  const handleDelete = (id: string) => {
    if (confirm(isEnglish ? 'Delete this reflection entry?' : 'هل أنت متأكد من حذف هذه الخاطرة من دفتر التدبر؟')) {
      deleteReflectionEntry(id);
      refreshEntries();
    }
  };

  const handleAddTag = () => {
    const trimmed = formTagInput.trim().replace(/^#/, '');
    if (trimmed && !formTags.includes(trimmed)) {
      setFormTags([...formTags, trimmed]);
      setFormTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormTags(formTags.filter(t => t !== tagToRemove));
  };

  // Collect all unique tags
  const allTags = Array.from(new Set(entries.flatMap(e => e.tags)));

  // Filtered entries
  const filteredEntries = entries.filter(e => {
    const matchesQuery = !searchQuery.trim() || 
      e.title.includes(searchQuery.trim()) || 
      e.notes.includes(searchQuery.trim()) || 
      e.ayahText.includes(searchQuery.trim());
    const matchesSurah = selectedSurahFilter === 'all' || e.surahNumber === selectedSurahFilter;
    const matchesTag = selectedTagFilter === 'all' || e.tags.includes(selectedTagFilter);
    return matchesQuery && matchesSurah && matchesTag;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2.5 rounded-xl bg-[var(--gold-light)] text-[var(--gold)]">
                <PenTool className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-amiri text-[var(--text-main)]">
                {isEnglish ? 'Quran Reflection Journal' : 'دفتر التدبر القرآني الشخصي'}
              </h2>
            </div>
            <p className="text-xs text-[var(--text-muted)] font-tajawal max-w-xl">
              {isEnglish 
                ? 'Your private space to reflect on the words of Allah, record personal lessons, and revisit questions.' 
                : 'مساحتك الخاصة الخالصة لتدوين الخواطر والفوائد عند تلاوة آيات الذكر الحكيم والربط بالتفاسير المعتمدة.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenNew}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[var(--emerald-deep)] to-[var(--primary-dark)] text-white text-xs font-bold hover:shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isEnglish ? 'New Reflection' : '+ خاطرة جديدة'}</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 pt-5 mt-5 border-t border-[var(--border-color)] text-center text-xs">
          <div className="p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
            <span className="text-[var(--text-muted)] font-semibold">{isEnglish ? 'Total Entries' : 'إجمالي الخواطر'}</span>
            <div className="text-base font-bold text-[var(--gold)] mt-0.5">{entries.length}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
            <span className="text-[var(--text-muted)] font-semibold">{isEnglish ? 'Pinned' : 'المثبتة في الصدارة'}</span>
            <div className="text-base font-bold text-emerald-600 mt-0.5">{entries.filter(e => e.isPinned).length}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
            <span className="text-[var(--text-muted)] font-semibold">{isEnglish ? 'Topics & Tags' : 'الموضوعات والوسوم'}</span>
            <div className="text-base font-bold text-[var(--text-main)] mt-0.5">{allTags.length}</div>
          </div>
        </div>
      </div>

      {/* Filter Ribbon & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Tag & Surah Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
          <button
            onClick={() => setSelectedTagFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap border transition-all ${
              selectedTagFilter === 'all'
                ? 'bg-[var(--gold)] text-black border-[var(--gold)]'
                : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-color)] hover:border-[var(--gold)]'
            }`}
          >
            {isEnglish ? 'All Tags' : 'كافة الوسوم'}
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTagFilter(tag)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap border transition-all ${
                selectedTagFilter === tag
                  ? 'bg-[var(--gold)] text-black border-[var(--gold)]'
                  : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-color)] hover:border-[var(--gold)]'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-auto sm:min-w-[220px] flex-1 min-w-0">
          <Search className="absolute right-3.5 top-2.5 w-3.5 h-3.5 text-[var(--text-muted)] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isEnglish ? 'Search reflections...' : 'ابحث في خواطرك وتدبراتك...'}
            className="w-full pr-9 pl-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs focus:outline-none focus:border-[var(--gold)] text-[var(--text-main)]"
          />
        </div>
      </div>

      {/* Reflections Grid */}
      {filteredEntries.length === 0 ? (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-12 text-center space-y-3">
          <BookOpen className="w-12 h-12 text-[var(--text-muted)] mx-auto opacity-40" />
          <h3 className="text-lg font-bold font-amiri text-[var(--text-main)]">
            {isEnglish ? 'No reflections found' : 'لا توجد خواطر مسجلة بعد'}
          </h3>
          <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
            {isEnglish 
              ? 'Start recording your Quran reflections by clicking the New Reflection button.' 
              : 'ابدأ بتسجيل أولى خواطرك وتأملاتك الإيمانية لترتبط الآيات بوجدانك وحياتك اليومية.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className={`p-6 rounded-3xl border transition-all shadow-sm flex flex-col justify-between space-y-4 group ${
                entry.isPinned
                  ? 'bg-gradient-to-b from-[var(--gold-light)]/20 via-[var(--bg-card)] to-[var(--bg-card)] border-[var(--border-gold)]/70'
                  : 'bg-[var(--bg-card)] border-[var(--border-color)] hover:border-[var(--gold)]/60'
              }`}
            >
              <div className="space-y-3">
                {/* Header: Surah & Ayah Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-[var(--primary-light)] text-[var(--text-primary)] border border-[var(--border-color)] text-xs font-bold font-amiri">
                      سورة {entry.surahName} [آية {entry.ayahNumber}]
                    </span>
                    {entry.isPinned && (
                      <span className="flex items-center gap-1 text-[10px] text-[var(--gold)] font-bold">
                        <Pin className="w-3 h-3 fill-current" />
                        مثبت
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        togglePinReflection(entry.id);
                        refreshEntries();
                      }}
                      className={`p-1.5 rounded-lg border text-xs transition-colors ${
                        entry.isPinned ? 'text-[var(--gold)] border-[var(--border-gold)]' : 'text-[var(--text-muted)] border-transparent hover:border-[var(--border-color)]'
                      }`}
                      title={isEnglish ? 'Pin entry' : 'تثبيت في الصدارة'}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>

                    {onOpenShareCard && (
                      <button
                        onClick={() => onOpenShareCard({
                          title: entry.title,
                          text: `﴿ ${entry.ayahText} ﴾\n\nخاطرة: ${entry.notes}`,
                          source: `سورة ${entry.surahName} — آية ${entry.ayahNumber}`,
                          category: 'تدبر قرآني'
                        })}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--gold)] border border-transparent hover:border-[var(--border-color)] transition-colors"
                        title={isEnglish ? 'Share card' : 'مشاركة كبطاقة'}
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => handleEdit(entry)}
                      className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] border border-transparent hover:border-[var(--border-color)] transition-colors"
                      title={isEnglish ? 'Edit' : 'تعديل'}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-500 border border-transparent hover:border-red-500/20 transition-colors"
                      title={isEnglish ? 'Delete' : 'حذف'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Canonical Ayah Text Box */}
                <div className="p-4 rounded-2xl bg-[var(--gold-light)]/30 border border-[var(--border-gold)]/40 text-center space-y-1">
                  <p className="font-quran text-lg sm:text-xl font-bold text-[var(--text-main)] leading-relaxed">
                    ﴿ {entry.ayahText} ﴾
                  </p>
                </div>

                {/* Reflection Title & Personal Notes */}
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold font-amiri text-[var(--text-main)]">
                    {entry.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-main)] font-tajawal leading-relaxed text-justify">
                    {entry.notes}
                  </p>
                </div>

                {/* Tafsir Reference Snippet */}
                {entry.tafsirText && (
                  <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs text-[var(--text-muted)] space-y-1">
                    <span className="font-bold text-[var(--text-primary)] block text-[10px]">
                      {entry.tafsirSource || 'التفسير الميسر'}:
                    </span>
                    <p className="line-clamp-2 leading-relaxed">
                      {entry.tafsirText}
                    </p>
                  </div>
                )}

                {/* Tags list */}
                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {entry.tags.map(t => (
                      <span key={t} className="px-2 py-0.5 rounded-md bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[10px] text-[var(--text-muted)] font-mono">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer: Quran Reader Jump & Date */}
              <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                {onOpenQuranToAyah ? (
                  <button
                    onClick={() => onOpenQuranToAyah(entry.surahNumber, entry.ayahNumber)}
                    className="flex items-center gap-1 text-[var(--gold)] hover:underline font-bold"
                  >
                    <span>{isEnglish ? 'View in Quran Reader' : 'فتح الموضع في المصحف'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span>سورة {entry.surahName}</span>
                )}

                <span className="font-mono">
                  {new Date(entry.createdAt).toLocaleDateString(isEnglish ? 'en-US' : 'ar-SA', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {isEditorOpen && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-label={editingId ? (isEnglish ? 'Edit Reflection' : 'تعديل الخاطرة القرآنية') : (isEnglish ? 'New Quran Reflection' : 'تدوين تدبر قرآني جديد')}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsEditorOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border-gold)] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[var(--gold-light)] text-[var(--gold)]">
                  <PenTool className="w-5 h-5 pointer-events-none" />
                </span>
                <div>
                  <h3 className="text-lg font-bold font-amiri text-[var(--text-main)]">
                    {editingId ? (isEnglish ? 'Edit Reflection' : 'تعديل الخاطرة القرآنية') : (isEnglish ? 'New Quran Reflection' : 'تدوين تدبر قرآني جديد')}
                  </h3>
                  {autosaveStatus && (
                    <span className="text-[10px] text-emerald-500 font-bold block animate-pulse">
                      {autosaveStatus}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)] transition-colors cursor-pointer touch-manipulation"
                aria-label="Close"
              >
                <X className="w-5 h-5 pointer-events-none" />
              </button>
            </div>

            {/* Surah & Ayah Pickers */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-main)]">
                  {isEnglish ? 'Surah:' : 'السورة الكريمة:'}
                </label>
                <select
                  value={formSurah}
                  onChange={(e) => {
                    const next = parseInt(e.target.value, 10);
                    setFormSurah(next);
                    setFormAyah(1);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-main)] focus:outline-none focus:border-[var(--gold)]"
                >
                  {SURAH_LIST.map(s => (
                    <option key={s.number} value={s.number} className="bg-[var(--bg-card)]">
                      {s.number}. {s.name} ({s.numberOfAyahs} آية)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-main)]">
                  {isEnglish ? 'Ayah Number:' : 'رقم الآية:'} (1 - {maxAyahsInSurah})
                </label>
                <input
                  type="number"
                  min="1"
                  max={maxAyahsInSurah}
                  value={formAyah}
                  onChange={(e) => setFormAyah(Math.max(1, Math.min(maxAyahsInSurah, parseInt(e.target.value, 10) || 1)))}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-main)] focus:outline-none focus:border-[var(--gold)]"
                />
              </div>
            </div>

            {/* Live Canonical Ayah Preview Box */}
            <div className="p-4 rounded-2xl bg-[var(--gold-light)]/40 border border-[var(--border-gold)]/60 text-center space-y-1">
              <span className="text-[10px] text-[var(--gold)] font-bold block">
                النص القرآني المعتمد (برسم المصحف الشريف):
              </span>
              <p className="font-quran text-lg font-bold text-[var(--text-main)] leading-relaxed">
                ﴿ {getAyahTextPreview(formSurah, formAyah)} ﴾
              </p>
            </div>

            {/* Reflection Title */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-main)]">
                {isEnglish ? 'Reflection Title / Main Insight:' : 'عنوان الخاطرة أو الفائدة المحورية:'}
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder={isEnglish ? 'e.g., Sincerity in Dua and reliance on Allah' : 'مثال: ثمرة إخلاص التوكل في الآية الكريمة'}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-main)] focus:outline-none focus:border-[var(--gold)]"
              />
            </div>

            {/* Reflection Notes Textarea */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-main)]">
                {isEnglish ? 'Personal Reflections & Contemplation:' : 'خواطرك وتدبرك الشخصي:'}
              </label>
              <textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder={isEnglish ? 'Write your thoughts, feelings, questions, and personal commitments...' : 'اكتب ما وقر في قلبك، وكيف تترجم هذه الآية في سلوكك وعبادتك اليومية...'}
                rows={5}
                className="w-full p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs sm:text-sm text-[var(--text-main)] font-tajawal focus:outline-none focus:border-[var(--gold)] leading-relaxed"
              />
            </div>

            {/* Tags Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-main)]">
                {isEnglish ? 'Tags & Topics:' : 'الوسوم والموضوعات:'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formTagInput}
                  onChange={(e) => setFormTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                  placeholder={isEnglish ? 'Add tag (e.g. patience, gratitude)...' : 'أضف وسماً (مثال: صبر، شكر، توكل)...'}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--gold)]"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-1.5 rounded-xl bg-[var(--gold)] text-black text-xs font-bold hover:opacity-90"
                >
                  {isEnglish ? 'Add' : 'إضافة'}
                </button>
              </div>

              {formTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {formTags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--gold-light)] border border-[var(--border-gold)] text-xs text-[var(--gold)] font-bold"
                    >
                      #{tag}
                      <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Pin Toggle */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="pinCheckbox"
                checked={formIsPinned}
                onChange={(e) => setFormIsPinned(e.target.checked)}
                className="w-4 h-4 accent-[var(--gold)] rounded cursor-pointer"
              />
              <label htmlFor="pinCheckbox" className="text-xs font-semibold text-[var(--text-main)] cursor-pointer">
                {isEnglish ? 'Pin this reflection to top' : 'تثبيت هذه الخاطرة في صدارة الدفتر'}
              </label>
            </div>

            {/* Religious Distinction Disclaimer */}
            <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] flex items-start gap-2.5 text-xs text-[var(--text-muted)]">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                تنبيه: الخواطر المدونة هي تأملات شخصية للعبد في حياته، ولا تمثل تفسيراً شرعياً مستقلاً أو حكماً فقهياً. التفسير الشرعي المعتمد مستقى من كتب أهل العلم.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-[var(--border-color)] text-[var(--text-muted)] hover:bg-[var(--bg-card-subtle)]"
              >
                {isEnglish ? 'Cancel' : 'إلغاء'}
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[var(--emerald-deep)] to-[var(--primary-dark)] text-white shadow-md hover:opacity-95"
              >
                {isEnglish ? 'Save Entry' : 'حفظ الخاطرة'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
