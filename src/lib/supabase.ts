import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hzcvukhyjsfjtvllhhew.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6Y3Z1a2h5anNmanR2bGxoaGV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NjM0NjYsImV4cCI6MjEwNzEzOTQ2Nn0.JLIgFUZ97ctj2F-I4I1aoz0wADmvXqyG0om8-zn3PtY';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-id')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const memoryStore = new Map<string, string>();

/**
 * Robust Local Storage fallback for guest mode and offline persistence.
 * Guarantees that progress survives browser reloads even without an active internet connection.
 */
export const localStore = {
  get: <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') {
      const val = memoryStore.get(`wasl_${key}`);
      return val ? (JSON.parse(val) as T) : defaultValue;
    }
    try {
      const item = localStorage.getItem(`wasl_${key}`);
      return item ? (JSON.parse(item) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') {
      memoryStore.set(`wasl_${key}`, JSON.stringify(value));
      return;
    }
    try {
      localStorage.setItem(`wasl_${key}`, JSON.stringify(value));
    } catch (e) {
      console.warn(`Error writing to local storage for key ${key}:`, e);
    }
  },
  remove: (key: string): void => {
    if (typeof window === 'undefined') {
      memoryStore.delete(`wasl_${key}`);
      return;
    }
    try {
      localStorage.removeItem(`wasl_${key}`);
    } catch {}
  }
};

/**
 * Cloud Sync helpers for authenticated users
 */
export async function syncKhatmahToCloud(userId: string, currentPage: number, targetDays: number) {
  if (!supabase) return;
  try {
    const { error } = await supabase.from('khatmah_plans').upsert({
      user_id: userId,
      title: 'ختمة القرآن الكريم',
      target_days: targetDays,
      current_page: currentPage,
      total_pages: 604,
      target_end_date: new Date(Date.now() + targetDays * 86400000).toISOString().split('T')[0]
    });
    if (error) console.warn('Supabase khatmah sync notice:', error.message);
  } catch (e) {
    console.warn('Network sync error:', e);
  }
}

export async function syncReadingPositionToCloud(userId: string, surah: number, ayah: number, page: number = 1) {
  if (!supabase) return;
  try {
    const { error } = await supabase.from('reading_history').upsert({
      user_id: userId,
      surah_number: surah,
      ayah_number: ayah,
      page_number: page,
      updated_at: new Date().toISOString()
    });
    if (error) console.warn('Supabase reading history notice:', error.message);
  } catch (e) {
    console.warn('Network sync error:', e);
  }
}

export async function syncFavoriteToCloud(userId: string, itemType: string, itemId: string, itemTitle: string, payload: any = {}) {
  if (!supabase) return;
  try {
    const { error } = await supabase.from('favorites').upsert({
      user_id: userId,
      item_type: itemType,
      item_id: itemId,
      item_title: itemTitle,
      item_payload: payload
    });
    if (error) console.warn('Supabase favorite notice:', error.message);
  } catch (e) {
    console.warn('Network sync error:', e);
  }
}
