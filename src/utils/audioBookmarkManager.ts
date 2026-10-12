import { localStore, supabase } from '../lib/supabase.ts';
import { SURAH_LIST, RECITERS } from '../data/quranMetadata.ts';

export interface AudioBookmark {
  id: string;
  reciterId: string;
  reciterNameAr: string;
  surahNumber: number;
  surahNameAr: string;
  ayahNumber?: number;
  timestampSeconds: number;
  formattedTimestamp: string;
  audioUrl: string;
  label: string;
  note?: string;
  createdAt: string;
}

const STORAGE_KEY = 'wasl_audio_bookmarks_v1';

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const audioBookmarkManager = {
  getBookmarks(): AudioBookmark[] {
    return localStore.get<AudioBookmark[]>(STORAGE_KEY, []);
  },

  saveBookmark(params: {
    reciterId: string;
    surahNumber: number;
    ayahNumber?: number;
    timestampSeconds: number;
    audioUrl: string;
    label?: string;
    note?: string;
  }): AudioBookmark {
    const bookmarks = this.getBookmarks();
    const surah = SURAH_LIST.find(s => s.number === params.surahNumber) || SURAH_LIST[0];
    const reciter = RECITERS.find(r => r.id === params.reciterId) || RECITERS[0];
    const formatted = formatTime(params.timestampSeconds);

    const newBookmark: AudioBookmark = {
      id: `ab_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      reciterId: params.reciterId,
      reciterNameAr: reciter.nameAr,
      surahNumber: params.surahNumber,
      surahNameAr: surah.name,
      ayahNumber: params.ayahNumber,
      timestampSeconds: Math.round(params.timestampSeconds),
      formattedTimestamp: formatted,
      audioUrl: params.audioUrl,
      label: params.label?.trim() || `علامة استماع: سورة ${surah.name} (${formatted})`,
      note: params.note?.trim(),
      createdAt: new Date().toISOString()
    };

    const updated = [newBookmark, ...bookmarks];
    localStore.set(STORAGE_KEY, updated);

    // Sync to Supabase cloud if user is authenticated
    if (supabase) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session?.user && supabase) {
          supabase.from('audio_bookmarks').insert({
            id: newBookmark.id,
            user_id: data.session.user.id,
            reciter_id: newBookmark.reciterId,
            surah_number: newBookmark.surahNumber,
            ayah_number: newBookmark.ayahNumber,
            timestamp_seconds: newBookmark.timestampSeconds,
            label: newBookmark.label,
            note: newBookmark.note,
            created_at: newBookmark.createdAt
          }).then(({ error }) => {
            if (error) console.warn('[AudioBookmarks] Cloud sync fallback:', error);
          });
        }
      });
    }

    return newBookmark;
  },

  deleteBookmark(id: string): void {
    const bookmarks = this.getBookmarks().filter(b => b.id !== id);
    localStore.set(STORAGE_KEY, bookmarks);
  },

  updateBookmark(id: string, updates: { label?: string; note?: string }): void {
    const bookmarks = this.getBookmarks().map(b => {
      if (b.id === id) {
        return {
          ...b,
          label: updates.label !== undefined ? updates.label.trim() : b.label,
          note: updates.note !== undefined ? updates.note.trim() : b.note
        };
      }
      return b;
    });
    localStore.set(STORAGE_KEY, bookmarks);
  }
};
