'use client';

import React, { useState } from 'react';
import { 
  Bookmark, 
  Volume2, 
  Play, 
  Clock, 
  Search, 
  Trash2, 
  Edit3, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  X,
  ChevronLeft
} from 'lucide-react';
import { audioBookmarkManager, AudioBookmark } from '../../utils/audioBookmarkManager';
import { AudioTrack } from '../AudioPlayerBar';
import { RECITERS } from '../../data/quranMetadata';

interface AudioBookmarksLibraryProps {
  isEnglish: boolean;
  onResumeBookmark: (bookmark: AudioBookmark) => void;
  onOpenAyah?: (surah: number, ayah: number) => void;
}

export const AudioBookmarksLibrary: React.FC<AudioBookmarksLibraryProps> = ({
  isEnglish,
  onResumeBookmark,
  onOpenAyah
}) => {
  const [bookmarks, setBookmarks] = useState<AudioBookmark[]>(() => audioBookmarkManager.getBookmarks());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReciterFilter, setSelectedReciterFilter] = useState('all');

  // Edit modal state
  const [editingBookmark, setEditingBookmark] = useState<AudioBookmark | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editNote, setEditNote] = useState('');

  const handleDelete = (id: string) => {
    if (confirm(isEnglish ? 'Delete this audio bookmark?' : 'هل أنت متأكد من حذف علامة الاستماع هذه؟')) {
      audioBookmarkManager.deleteBookmark(id);
      setBookmarks(audioBookmarkManager.getBookmarks());
    }
  };

  const openEditModal = (b: AudioBookmark) => {
    setEditingBookmark(b);
    setEditLabel(b.label);
    setEditNote(b.note || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBookmark) return;
    audioBookmarkManager.updateBookmark(editingBookmark.id, {
      label: editLabel,
      note: editNote
    });
    setBookmarks(audioBookmarkManager.getBookmarks());
    setEditingBookmark(null);
  };

  // Filtered bookmarks
  const filteredBookmarks = bookmarks.filter(b => {
    if (selectedReciterFilter !== 'all' && b.reciterId !== selectedReciterFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      return (
        b.label.toLowerCase().includes(q) ||
        b.surahNameAr.toLowerCase().includes(q) ||
        (b.note && b.note.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-24">
      {/* Header Banner */}
      <section className="bg-[var(--bg-card)] border border-[var(--border-gold)] rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--gold-light)] text-[var(--gold)] text-xs font-bold mb-3">
            <Bookmark className="w-3.5 h-3.5" />
            <span>علامات الاستماع وحفظ المواضع الصوتية</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-main)] font-cairo">
            {isEnglish ? 'Audio Bookmarks Library' : 'علامات الاستماع الصوتية'}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-2 leading-relaxed">
            {isEnglish
              ? 'Save exact listening positions with personal timestamps, notes, and reciters, then resume playback seamlessly anytime.'
              : 'احفظ مواضع استماعك الدقيقة في تلاوات القرآن الكريم مع التوقيت والقارئ والملاحظات الشخصية، واستأنف الاستماع من الموضع المحفوظ بضغطة واحدة.'}
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ابحث في علامات الاستماع بالاسم أو السورة أو الملاحظات..."
              className="w-full pr-11 pl-4 py-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-main)] text-xs font-semibold focus:outline-none focus:border-[var(--primary)]"
            />
            <Search className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          </div>

          <select
            value={selectedReciterFilter}
            onChange={e => setSelectedReciterFilter(e.target.value)}
            className="px-4 py-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-main)] text-xs font-bold focus:outline-none focus:border-[var(--primary)]"
          >
            <option value="all">جميع القراء</option>
            {RECITERS.map(r => (
              <option key={r.id} value={r.id}>{r.nameAr}</option>
            ))}
          </select>
        </div>
      </section>

      {/* Bookmarks List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-[var(--text-muted)]">
          <span>العلامات المحفوظة ({filteredBookmarks.length}):</span>
          <span className="text-[11px]">يتم حفظ وتحديث المواضع تلقائياً</span>
        </div>

        {filteredBookmarks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBookmarks.map(b => (
              <div
                key={b.id}
                className="p-5 sm:p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-4 hover:border-[var(--gold)] transition-colors flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Surah, Reciter, Timestamp */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-[var(--border-color)]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-[var(--text-main)] font-cairo">
                          سورة {b.surahNameAr}
                        </span>
                        {b.ayahNumber && (
                          <span className="text-xs text-[var(--gold)] font-bold">
                            [آية {b.ayahNumber}]
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[var(--text-muted)] block mt-0.5">
                        القارئ: {b.reciterNameAr}
                      </span>
                    </div>

                    <div className="px-3 py-1 rounded-full bg-[var(--primary-light)] text-[var(--primary)] font-mono font-bold text-xs flex items-center gap-1.5 shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{b.formattedTimestamp}</span>
                    </div>
                  </div>

                  {/* Label & Note */}
                  <div className="mt-3 space-y-1.5 text-xs">
                    <h4 className="font-bold text-[var(--text-main)]">{b.label}</h4>
                    {b.note && (
                      <p className="text-[11px] text-[var(--text-muted)] bg-[var(--bg-card-subtle)] p-2.5 rounded-xl border border-[var(--border-color)] leading-relaxed">
                        {b.note}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(b)}
                      className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)] transition-colors"
                      title="تعديل التسمية والملاحظة"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="p-2 rounded-xl text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      title="حذف العلامة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {onOpenAyah && b.ayahNumber && (
                      <button
                        onClick={() => onOpenAyah(b.surahNumber, b.ayahNumber!)}
                        className="px-2.5 py-1.5 rounded-xl bg-[var(--bg-card-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] text-[11px] font-bold"
                        title="عرض الآية في المصحف"
                      >
                        المصحف
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => onResumeBookmark(b)}
                    className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-bold hover:bg-[var(--primary-dark)] transition-colors shadow-sm flex items-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>استئناف الاستماع ({b.formattedTimestamp})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[var(--gold-light)] text-[var(--gold)] flex items-center justify-center text-2xl">
              <Bookmark className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-[var(--text-main)] font-cairo">
              لا توجد علامات استماع محفوظة بعد
            </h3>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
              أثناء استماعك لتلاوة أي سورة في مشغل الصوت، اضغط على زر (حفظ موضع الاستماع) لحفظ الدقيقة والثانية والرجوع إليها لاحقاً.
            </p>
          </div>
        )}
      </div>

      {/* Edit Bookmark Modal */}
      {editingBookmark && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-label="تعديل علامة الاستماع"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingBookmark(null);
          }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <h3 className="text-base font-bold text-[var(--text-main)] font-cairo">
                تعديل علامة الاستماع
              </h3>
              <button 
                onClick={() => setEditingBookmark(null)}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-xl cursor-pointer touch-manipulation"
                aria-label="إغلاق النافذة"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[var(--text-main)] block mb-1">تسمية العلامة:</label>
                <input
                  type="text"
                  required
                  value={editLabel}
                  onChange={e => setEditLabel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-main)] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[var(--text-main)] block mb-1">ملاحظة شخصية:</label>
                <textarea
                  rows={3}
                  value={editNote}
                  onChange={e => setEditNote(e.target.value)}
                  placeholder="مثال: وقفت عند تدبر هذه الآية..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-main)] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingBookmark(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--text-muted)]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-bold hover:bg-[var(--primary-dark)]"
                >
                  حفظ التعديل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
