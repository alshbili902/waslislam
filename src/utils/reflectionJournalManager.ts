/**
 * Quran Reflection Journal Engine (دفتر التدبر الشخصي)
 * Manages personal reflection notes linked to canonical Quran Surahs and Ayahs.
 * Features: LocalStore guest fallback, Supabase RLS sync, autosaving drafts, tags, and collections.
 */

import { localStore, supabase } from '../lib/supabase';

export interface ReflectionEntry {
  id: string;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  ayahText: string;
  tafsirSource?: string;
  tafsirText?: string;
  title: string;
  notes: string;
  tags: string[];
  collectionId: string;
  isPinned: boolean;
  revisitReminderDate?: string;
  createdAt: string;
  updatedAt: string;
}

export const SEED_REFLECTIONS: ReflectionEntry[] = [
  {
    id: 'ref-fatihah-5',
    surahNumber: 1,
    surahName: 'الفاتحة',
    ayahNumber: 5,
    ayahText: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
    tafsirSource: 'التفسير الميسر',
    tafsirText: 'نخصك وحدك بالعبادة، ونستعين بك وحدك في جميع أمورنا، فالأمر كله بيدك.',
    title: 'إخلاص العبودية والاستعانة',
    notes: 'تأملت تقديم العبادة على الاستعانة؛ لأن حق الله تعالى مقدم على حاجة العبد، ولأن الاستعانة هي في ذاتها عبادة لله.',
    tags: ['توحيد', 'دعاء', 'فاتحة الكتاب'],
    collectionId: 'default',
    isPinned: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'ref-baqarah-186',
    surahNumber: 2,
    surahName: 'البقرة',
    ayahNumber: 186,
    ayahText: 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ',
    tafsirSource: 'تفسير ابن كثير',
    tafsirText: 'إخبار من الله تعالى بقربه من عباده وإجابته دعاء من دعاه متى ما دعاه بقلب حاضر.',
    title: 'قرب الله ولطفه بالداعي',
    notes: 'جاءت هذه الآية العظيمة في ثنايا آيات الصيام لتشعرنا بمدى ارتباط الصيام بإجابة الدعاء، وأن الله قريب لا يحتاج إلى وسيط.',
    tags: ['دعاء', 'رمضان', 'رجاء'],
    collectionId: 'default',
    isPinned: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  }
];

export function getReflectionEntries(): ReflectionEntry[] {
  return localStore.get<ReflectionEntry[]>('user_reflection_entries', SEED_REFLECTIONS);
}

export function saveReflectionEntry(entry: Omit<ReflectionEntry, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): ReflectionEntry {
  const list = getReflectionEntries();
  const now = new Date().toISOString();
  const id = entry.id || `ref_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const existingIndex = list.findIndex(r => r.id === id);
  let saved: ReflectionEntry;

  if (existingIndex >= 0) {
    saved = {
      ...list[existingIndex],
      ...entry,
      id,
      updatedAt: now,
    };
    list[existingIndex] = saved;
  } else {
    saved = {
      ...entry,
      id,
      createdAt: now,
      updatedAt: now,
    };
    list.unshift(saved);
  }

  localStore.set('user_reflection_entries', list);

  // Sync with Supabase if authenticated
  if (supabase) {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.user && supabase) {
        try {
          await supabase.from('reflection_journal').upsert({
            id: saved.id,
            user_id: data.session.user.id,
            surah_number: saved.surahNumber,
            surah_name: saved.surahName,
            ayah_number: saved.ayahNumber,
            ayah_text: saved.ayahText,
            tafsir_source: saved.tafsirSource,
            tafsir_text: saved.tafsirText,
            title: saved.title,
            notes: saved.notes,
            tags: saved.tags,
            collection_id: saved.collectionId,
            is_pinned: saved.isPinned,
            updated_at: saved.updatedAt,
          });
        } catch (err) {
          console.warn('Supabase reflection journal sync error:', err);
        }
      }
    });
  }

  return saved;
}

export function deleteReflectionEntry(id: string): void {
  const list = getReflectionEntries();
  const nextList = list.filter(r => r.id !== id);
  localStore.set('user_reflection_entries', nextList);

  if (supabase) {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.user && supabase) {
        try {
          await supabase.from('reflection_journal').delete().eq('id', id).eq('user_id', data.session.user.id);
        } catch (err) {
          console.warn('Supabase reflection journal delete error:', err);
        }
      }
    });
  }
}

export function togglePinReflection(id: string): void {
  const list = getReflectionEntries();
  const item = list.find(r => r.id === id);
  if (item) {
    saveReflectionEntry({ ...item, isPinned: !item.isPinned });
  }
}

// Autosave Draft functions
export interface ReflectionDraft {
  surahNumber: number;
  ayahNumber: number;
  title: string;
  notes: string;
  tags: string[];
}

export function getAutosavedDraft(): ReflectionDraft | null {
  return localStore.get<ReflectionDraft | null>('reflection_draft', null);
}

export function setAutosavedDraft(draft: ReflectionDraft | null): void {
  if (draft) {
    localStore.set('reflection_draft', draft);
  } else {
    localStore.remove('reflection_draft');
  }
}
