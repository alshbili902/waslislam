/**
 * My Islamic Library (مكتبتي الإسلامية) - Central Personal Storage & Collection Engine.
 * Allows saving Ayahs, Hadith, Adhkar, Lessons, Names of Allah, and audio tracks
 * into organized collections with personal reflection notes and search capabilities.
 */

import { localStore, supabase } from '../lib/supabase';

export type LibraryItemType = 
  | 'ayah' 
  | 'surah' 
  | 'hadith' 
  | 'adhkar' 
  | 'dua' 
  | 'lesson' 
  | 'article' 
  | 'name_of_allah' 
  | 'audio'
  | 'benefits'
  | 'thematic_ayah'
  | 'similar_ayah';


export interface LibraryCollection {
  id: string;
  nameAr: string;
  nameEn: string;
  iconName: string;
  isDefault?: boolean;
}

export interface LibraryItem {
  id: string;
  itemType: LibraryItemType;
  titleAr: string;
  subtitleAr?: string;
  bodyAr: string;
  referenceAr: string;
  collectionId: string;
  userNote?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  savedAt: string;
}

export const DEFAULT_COLLECTIONS: LibraryCollection[] = [
  { id: 'tadabbur', nameAr: 'آيات للتدبر', nameEn: 'Verses for Reflection', iconName: 'BookOpen', isDefault: true },
  { id: 'hadiths', nameAr: 'أحاديث نافعة', nameEn: 'Beneficial Hadiths', iconName: 'Compass', isDefault: true },
  { id: 'adhkar', nameAr: 'أذكار يومية', nameEn: 'Daily Adhkar', iconName: 'Sparkles', isDefault: true },
  { id: 'benefits', nameAr: 'فوائد علمية', nameEn: 'Scholarly Benefits', iconName: 'Layers', isDefault: true },
  { id: 'lessons', nameAr: 'دروس لاحقاً', nameEn: 'Saved Lessons', iconName: 'Bookmark', isDefault: true },
  { id: 'audio', nameAr: 'قائمتي الصوتية', nameEn: 'Audio Playlist', iconName: 'Radio', isDefault: true },
];

export const INITIAL_LIBRARY_SEEDS: LibraryItem[] = [
  {
    id: 'seed-ayah-1',
    itemType: 'ayah',
    titleAr: 'سورة الفاتحة [آية: 5]',
    subtitleAr: 'أعظم دعاء في القرآن',
    bodyAr: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
    referenceAr: 'القرآن الكريم — سورة الفاتحة',
    collectionId: 'tadabbur',
    userNote: 'التبرؤ من الحول والقوة وإخلاص العبادة والاستعانة بالله وحده.',
    savedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'seed-hadith-1',
    itemType: 'hadith',
    titleAr: 'حديث إنما الأعمال بالنيات',
    subtitleAr: 'مدار الإسلام وقبول العمل',
    bodyAr: 'إنَّما الأعْمالُ بالنِّيّاتِ، وإنَّما لِكُلِّ امْرِئٍ ما نَوَى، فمَن كانَتْ هِجْرَتُهُ إلى دُنْيا يُصِيبُها، أوْ إلى امْرَأَةٍ يَنْكِحُها، فَهِجْرَتُهُ إلى ما هاجَرَ إلَيْهِ.',
    referenceAr: 'صحيح البخاري (1) وصحيح مسلم (1907)',
    collectionId: 'hadiths',
    userNote: 'تجديد النية في كل خطوة وعمل صالح.',
    savedAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'seed-dhikr-1',
    itemType: 'adhkar',
    titleAr: 'سيد الاستغفار',
    subtitleAr: 'دعاء المغفرة الأعظم',
    bodyAr: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.',
    referenceAr: 'صحيح البخاري — كتاب الدعوات',
    collectionId: 'adhkar',
    userNote: 'يُقال صباحاً ومساءً بيقين.',
    savedAt: new Date(Date.now() - 259200000).toISOString(),
  }
];

export function getLibraryCollections(): LibraryCollection[] {
  return localStore.get<LibraryCollection[]>('user_library_collections', DEFAULT_COLLECTIONS);
}

export function saveLibraryCollection(nameAr: string): LibraryCollection {
  const collections = getLibraryCollections();
  const newCol: LibraryCollection = {
    id: `col_${Date.now()}`,
    nameAr: nameAr.trim(),
    nameEn: nameAr.trim(),
    iconName: 'Bookmark',
  };
  const updated = [...collections, newCol];
  localStore.set('user_library_collections', updated);
  return newCol;
}

export function getLibraryItems(): LibraryItem[] {
  return localStore.get<LibraryItem[]>('user_library_items', INITIAL_LIBRARY_SEEDS);
}

export function isItemInLibrary(id: string): boolean {
  const items = getLibraryItems();
  return items.some(i => i.id === id);
}

export function addLibraryItem(item: Omit<LibraryItem, 'savedAt'>): LibraryItem {
  const items = getLibraryItems();
  const existingIndex = items.findIndex(i => i.id === item.id);

  const fullItem: LibraryItem = {
    ...item,
    savedAt: new Date().toISOString(),
  };

  let nextItems: LibraryItem[];
  if (existingIndex >= 0) {
    nextItems = items.map((it, idx) => idx === existingIndex ? fullItem : it);
  } else {
    nextItems = [fullItem, ...items];
  }

  localStore.set('user_library_items', nextItems);

  // Sync to Supabase if authenticated
  if (supabase) {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.user && supabase) {
        try {
          await supabase.from('favorites').upsert({
            user_id: data.session.user.id,
            item_type: fullItem.itemType,
            item_id: fullItem.id,
            item_title: fullItem.titleAr,
            item_payload: fullItem,
          });
        } catch (err) {
          console.warn('Supabase favorite sync error:', err);
        }
      }
    });
  }

  return fullItem;
}

export function removeLibraryItem(id: string): void {
  const items = getLibraryItems();
  const nextItems = items.filter(i => i.id !== id);
  localStore.set('user_library_items', nextItems);

  // Sync delete to Supabase if authenticated
  if (supabase) {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.user && supabase) {
        try {
          await supabase.from('favorites').delete().eq('user_id', data.session.user.id).eq('item_id', id);
        } catch (err) {
          console.warn('Supabase favorite delete error:', err);
        }
      }
    });
  }
}


export function updateItemNote(id: string, note: string): void {
  const items = getLibraryItems();
  const nextItems = items.map(i => i.id === id ? { ...i, userNote: note } : i);
  localStore.set('user_library_items', nextItems);
}

export function moveItemToCollection(id: string, collectionId: string): void {
  const items = getLibraryItems();
  const nextItems = items.map(i => i.id === id ? { ...i, collectionId } : i);
  localStore.set('user_library_items', nextItems);
}

export function saveItemToLibrary(data: {
  id: string;
  type?: string;
  titleAr: string;
  titleEn?: string;
  contentAr?: string;
  categoryAr?: string;
  sourceAttribution?: string;
}): LibraryItem {
  const mappedType = (data.type === 'audio' || data.type === 'lesson' || data.type === 'hadith' || data.type === 'ayah' || data.type === 'adhkar')
    ? (data.type as LibraryItemType)
    : 'benefits';

  let defaultCol = 'tadabbur';
  if (mappedType === 'audio') defaultCol = 'audio';
  else if (mappedType === 'lesson') defaultCol = 'lessons';
  else if (mappedType === 'hadith') defaultCol = 'hadiths';
  else if (mappedType === 'adhkar') defaultCol = 'adhkar';

  return addLibraryItem({
    id: data.id,
    itemType: mappedType,
    titleAr: data.titleAr,
    subtitleAr: data.titleEn || data.categoryAr,
    bodyAr: data.contentAr || '',
    referenceAr: data.sourceAttribution || 'منصة وصل الإسلامية',
    collectionId: defaultCol,
  });
}

export const isItemSaved = isItemInLibrary;
export const removeItemFromLibrary = removeLibraryItem;

export const libraryManager = {
  getItems: getLibraryItems,
  saveItem: (item: any) => {
    if (item.titleAr && item.bodyAr) {
      return addLibraryItem({
        id: item.id || `lib_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        itemType: item.itemType || 'benefits',
        titleAr: item.titleAr,
        subtitleAr: item.subtitleAr,
        bodyAr: item.bodyAr,
        referenceAr: item.referenceAr || 'منصة وصل الإسلامية',
        collectionId: item.collectionId || 'tadabbur',
        userNote: item.userNote
      });
    }
    return addLibraryItem({
      id: item.id || `lib_${Date.now()}`,
      itemType: (item.category as any) || 'benefits',
      titleAr: item.title,
      bodyAr: item.text,
      referenceAr: item.source || 'منصة وصل الإسلامية',
      collectionId: item.collectionId || 'tadabbur',
      userNote: item.notes
    });
  },
  deleteItem: removeLibraryItem
};

