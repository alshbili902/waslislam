'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bookmark, 
  Search, 
  FolderPlus, 
  Trash2, 
  Edit3, 
  Share2, 
  Sparkles, 
  BookOpen, 
  Compass, 
  Radio, 
  Layers, 
  Check, 
  X,
  FileText,
  Clock,
  Tag
} from 'lucide-react';
import { 
  getLibraryCollections, 
  saveLibraryCollection, 
  getLibraryItems, 
  removeLibraryItem, 
  updateItemNote, 
  moveItemToCollection,
  LibraryCollection, 
  LibraryItem 
} from '../../utils/libraryManager';

interface MyIslamicLibraryProps {
  isEnglish?: boolean;
  onOpenShareCard?: (content: any) => void;
  onOpenItem?: (item: LibraryItem) => void;
}

export const MyIslamicLibrary: React.FC<MyIslamicLibraryProps> = ({
  isEnglish = false,
  onOpenShareCard,
  onOpenItem
}) => {
  const [collections, setCollections] = useState<LibraryCollection[]>(() => getLibraryCollections());
  const [items, setItems] = useState<LibraryItem[]>(() => getLibraryItems());
  const [activeCollectionId, setActiveCollectionId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Note editing state: itemId -> editing string
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState<string>('');

  // New collection modal / inline state
  const [showAddCollection, setShowAddCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  const refreshItems = () => {
    setItems(getLibraryItems());
    setCollections(getLibraryCollections());
  };

  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) return;
    saveLibraryCollection(newCollectionName.trim());
    setNewCollectionName('');
    setShowAddCollection(false);
    refreshItems();
  };

  const handleDeleteItem = (id: string) => {
    removeLibraryItem(id);
    refreshItems();
  };

  const handleSaveNote = (id: string) => {
    updateItemNote(id, noteContent.trim());
    setEditingNoteId(null);
    setNoteContent('');
    refreshItems();
  };

  const handleMoveCollection = (itemId: string, colId: string) => {
    moveItemToCollection(itemId, colId);
    refreshItems();
  };

  // Filter items by collection and search query
  const filteredItems = items.filter(item => {
    const matchesCol = activeCollectionId === 'all' || item.collectionId === activeCollectionId;
    const matchesQuery = !searchQuery.trim() || 
      item.titleAr.includes(searchQuery.trim()) || 
      item.bodyAr.includes(searchQuery.trim()) || 
      (item.userNote && item.userNote.includes(searchQuery.trim()));
    return matchesCol && matchesQuery;
  });

  const getItemTypeBadge = (type: string) => {
    switch (type) {
      case 'ayah': return { label: isEnglish ? 'Ayah' : 'آية كريمة', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' };
      case 'hadith': return { label: isEnglish ? 'Hadith' : 'حديث شريف', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30' };
      case 'adhkar': return { label: isEnglish ? 'Dhikr' : 'ذكر ودعاء', color: 'bg-amber-500/10 text-amber-600 border-amber-500/30' };
      case 'lesson': return { label: isEnglish ? 'Lesson' : 'درس علمي', color: 'bg-purple-500/10 text-purple-600 border-purple-500/30' };
      case 'audio': return { label: isEnglish ? 'Audio' : 'تسجيل صوتي', color: 'bg-rose-500/10 text-rose-600 border-rose-500/30' };
      default: return { label: isEnglish ? 'Benefit' : 'فائدة إيمانية', color: 'bg-[var(--gold-light)] text-[var(--gold)] border-[var(--border-gold)]' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2.5 rounded-xl bg-[var(--gold-light)] text-[var(--gold)]">
                <Bookmark className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-amiri text-[var(--text-main)]">
                {isEnglish ? 'My Islamic Library' : 'مكتبتي الإسلامية الخاصة'}
              </h2>
            </div>
            <p className="text-xs text-[var(--text-muted)] font-tajawal">
              {isEnglish 
                ? 'Your personal space for saved verses, beneficial Hadiths, notes, and custom collections' 
                : 'مستودعك الإيماني الشخصي لحفظ الآيات، الأحاديث، الدروس، وتدوين الخواطر الإيمانية'}
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-auto sm:min-w-[240px] flex-1 min-w-0">
            <Search className="absolute right-3.5 top-3 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isEnglish ? 'Search saved items & notes...' : 'ابحث في محفوظاتك وملاحظاتك...'}
              className="w-full pr-10 pl-4 py-2 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs focus:outline-none focus:border-[var(--gold)] text-[var(--text-main)]"
            />
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="grid grid-cols-3 gap-3 pt-5 mt-5 border-t border-[var(--border-color)] text-center text-xs">
          <div className="p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
            <span className="text-[var(--text-muted)] font-semibold">{isEnglish ? 'Total Items' : 'إجمالي المحفوظات'}</span>
            <div className="text-base font-bold text-[var(--gold)] mt-0.5">{items.length}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
            <span className="text-[var(--text-muted)] font-semibold">{isEnglish ? 'Collections' : 'المجموعات'}</span>
            <div className="text-base font-bold text-[var(--text-main)] mt-0.5">{collections.length}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
            <span className="text-[var(--text-muted)] font-semibold">{isEnglish ? 'Personal Notes' : 'الملاحظات والخواطر'}</span>
            <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {items.filter(i => !!i.userNote).length}
            </div>
          </div>
        </div>
      </div>

      {/* Collections Navigation Ribbon */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setActiveCollectionId('all')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap border transition-all ${
            activeCollectionId === 'all'
              ? 'bg-gradient-to-r from-[var(--emerald-deep)] to-[var(--primary-dark)] text-white border-[var(--border-gold)] shadow-sm'
              : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-color)] hover:border-[var(--gold)]'
          }`}
        >
          {isEnglish ? 'All Items' : 'كافة المحفوظات'} ({items.length})
        </button>

        {collections.map((col) => {
          const count = items.filter(i => i.collectionId === col.id).length;
          const isActive = activeCollectionId === col.id;

          return (
            <button
              key={col.id}
              onClick={() => setActiveCollectionId(col.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap border transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[var(--emerald-deep)] to-[var(--primary-dark)] text-white border-[var(--border-gold)] shadow-sm'
                  : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-color)] hover:border-[var(--gold)]'
              }`}
            >
              {isEnglish ? col.nameEn : col.nameAr} ({count})
            </button>
          );
        })}

        {/* Create Collection Button */}
        {!showAddCollection ? (
          <button
            onClick={() => setShowAddCollection(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-dashed border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--gold)] hover:text-[var(--gold)] text-xs font-bold whitespace-nowrap transition-colors"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>{isEnglish ? '+ New Folder' : '+ مجموعة جديدة'}</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 p-1 bg-[var(--bg-card)] border border-[var(--border-gold)] rounded-2xl shrink-0">
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder={isEnglish ? 'Folder name...' : 'اسم المجموعة...'}
              className="px-2.5 py-1 text-xs bg-transparent border-none focus:outline-none text-[var(--text-main)] w-32"
              autoFocus
            />
            <button
              onClick={handleCreateCollection}
              className="p-1 rounded-lg bg-[var(--gold)] text-black hover:opacity-90"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => { setShowAddCollection(false); setNewCollectionName(''); }}
              className="p-1 rounded-lg text-[var(--text-muted)] hover:text-red-500"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-12 text-center space-y-3">
          <Bookmark className="w-12 h-12 text-[var(--text-muted)] mx-auto opacity-40" />
          <h3 className="text-lg font-bold font-amiri text-[var(--text-main)]">
            {isEnglish ? 'No saved items found' : 'لا توجد محفوظات في هذا القسم'}
          </h3>
          <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
            {isEnglish 
              ? 'You can save Ayahs, Hadiths, Duas, and Academy lessons from anywhere in the platform.' 
              : 'يمكنك حفظ الآيات الكريمة، الأحاديث، الأدعية، ودروس الأكاديمية بنقرة واحدة لتظهر هنا مرتبة.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const badge = getItemTypeBadge(item.itemType);
            const isEditingThisNote = editingNoteId === item.id;

            return (
              <div
                key={item.id}
                className="p-5 sm:p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--border-gold)]/60 transition-all shadow-sm flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Card Header: Type Badge & Action Buttons */}
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-lg border text-[10px] font-bold ${badge.color}`}>
                      {badge.label}
                    </span>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      {/* Share Card Studio action */}
                      {onOpenShareCard && (
                        <button
                          onClick={() => onOpenShareCard({
                            title: item.titleAr,
                            text: item.bodyAr,
                            source: item.referenceAr,
                            category: badge.label
                          })}
                          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--gold)] hover:bg-[var(--bg-card-subtle)] transition-colors"
                          title={isEnglish ? 'Share as card' : 'مشاركة كبطاقة'}
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Edit Note action */}
                      <button
                        onClick={() => {
                          setEditingNoteId(item.id);
                          setNoteContent(item.userNote || '');
                        }}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)] transition-colors"
                        title={isEnglish ? 'Edit personal note' : 'تعديل الخاطرة أو الملاحظة'}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete action */}
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        title={isEnglish ? 'Remove item' : 'حذف من المكتبة'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Body */}
                  <h3 className="text-base font-bold font-amiri text-[var(--text-main)] leading-snug">
                    {item.titleAr}
                  </h3>

                  {item.bodyAr && (
                    <p className={`text-xs sm:text-sm text-[var(--text-main)] leading-relaxed text-justify ${
                      item.itemType === 'ayah' ? 'font-quran text-base' : 'font-tajawal'
                    }`}>
                      {item.itemType === 'ayah' ? `﴿ ${item.bodyAr} ﴾` : item.bodyAr}
                    </p>
                  )}

                  {/* Reference Source */}
                  {item.referenceAr && (
                    <div className="text-[11px] text-[var(--text-muted)] font-mono">
                      {item.referenceAr}
                    </div>
                  )}

                  {/* User Reflection Note Display */}
                  {item.userNote && !isEditingThisNote && (
                    <div className="p-3 rounded-2xl bg-[var(--gold-light)]/30 border border-[var(--border-gold)]/50 space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--gold)]">
                        <FileText className="w-3 h-3" />
                        <span>{isEnglish ? 'My Reflection Note' : 'خاطرتي وتدبري:'}</span>
                      </div>
                      <p className="text-xs text-[var(--text-main)] font-tajawal">
                        {item.userNote}
                      </p>
                    </div>
                  )}

                  {/* Note Editing Input */}
                  {isEditingThisNote && (
                    <div className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-gold)] space-y-2">
                      <textarea
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        placeholder={isEnglish ? 'Write your personal reflection or benefit...' : 'اكتب فائدتك وتدبرك الشخصي هنا...'}
                        className="w-full p-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] focus:outline-none focus:border-[var(--gold)] h-20"
                        autoFocus
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingNoteId(null)}
                          className="px-2.5 py-1 text-xs rounded-lg border border-[var(--border-color)] text-[var(--text-muted)]"
                        >
                          {isEnglish ? 'Cancel' : 'إلغاء'}
                        </button>
                        <button
                          onClick={() => handleSaveNote(item.id)}
                          className="px-3 py-1 text-xs font-bold rounded-lg bg-[var(--gold)] text-black"
                        >
                          {isEnglish ? 'Save Note' : 'حفظ الخاطرة'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer: Folder Move & Timestamp */}
                <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                  {/* Move Collection Dropdown */}
                  <div className="flex items-center gap-1">
                    <Tag className="w-3 h-3 text-[var(--gold)]" />
                    <select
                      value={item.collectionId}
                      onChange={(e) => handleMoveCollection(item.id, e.target.value)}
                      className="bg-transparent border-none text-[11px] font-semibold text-[var(--text-muted)] focus:outline-none cursor-pointer"
                    >
                      {collections.map(c => (
                        <option key={c.id} value={c.id} className="bg-[var(--bg-card)] text-[var(--text-main)]">
                          {isEnglish ? c.nameEn : c.nameAr}
                        </option>
                      ))}
                    </select>
                  </div>

                  <span className="font-mono">
                    {new Date(item.savedAt).toLocaleDateString(isEnglish ? 'en-US' : 'ar-SA', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
