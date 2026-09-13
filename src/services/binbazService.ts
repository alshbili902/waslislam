import { BinBazLinkItem } from '../types/binbaz';
import { INITIAL_BINBAZ_LINKS } from '../data/binbazData';
import { isSupabaseConfigured, localStore, supabase } from './supabase';

const BINBAZ_STORAGE_KEY = 'binbaz_links_v1';

export interface BinBazUrlValidationResult {
  isValid: boolean;
  error?: string;
  normalizedUrl?: string;
}

export function validateBinBazUrl(url: string): BinBazUrlValidationResult {
  if (!url || typeof url !== 'string') {
    return { isValid: false, error: 'الرابط مطلوب' };
  }

  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();

  if (!lower.startsWith('https://')) {
    return { isValid: false, error: 'يجب أن يبدأ الرابط بـ HTTPS حصراً' };
  }

  try {
    const parsed = new URL(trimmed);

    if (parsed.protocol !== 'https:') {
      return { isValid: false, error: 'يجب أن يكون الرابط مشفراً بـ HTTPS' };
    }

    const host = parsed.hostname.toLowerCase();

    // Must strictly be binbaz.org.sa
    if (host !== 'binbaz.org.sa' && host !== 'www.binbaz.org.sa') {
      return {
        isValid: false,
        error: 'المصدر المعتمد الوحيد هو الموقع الرسمي للشيخ: binbaz.org.sa ولا يُقبل أي نطاق خارجي آخر',
      };
    }

    return { isValid: true, normalizedUrl: parsed.toString() };
  } catch {
    return { isValid: false, error: 'صيغة الرابط غير صحيحة' };
  }
}

export const binbazService = {
  async getLinks(): Promise<BinBazLinkItem[]> {
    // 1. Try public server API first
    try {
      const res = await fetch('/api/binbaz');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.links) && data.links.length > 0) {
          return data.links;
        }
      }
    } catch {
      // Fallback silently
    }

    // 2. Try Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('binbaz_links')
          .select('*')
          .eq('status', 'verified')
          .order('sort_order', { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map((b: any) => ({
            id: b.id,
            title: b.title,
            description: b.description,
            url: b.url,
            category: b.category,
            categoryLabelAr: b.category_label_ar || 'قسم رسمي',
            verified: b.verified,
            status: b.status,
            sortOrder: b.sort_order,
            highlight: b.highlight,
            createdAt: b.created_at,
            updatedAt: b.updated_at,
          }));
        }
      } catch (e) {
        console.warn('Supabase binbaz error:', e);
      }
    }

    // 3. Fallback to localStore or initial data
    const local = localStore.get<BinBazLinkItem[]>(BINBAZ_STORAGE_KEY, []);
    if (local && local.length > 0) {
      return local.filter((l) => l.status === 'verified');
    }

    return INITIAL_BINBAZ_LINKS;
  },

  async saveLink(link: BinBazLinkItem): Promise<boolean> {
    const valid = validateBinBazUrl(link.url);
    if (!valid.isValid) {
      throw new Error(valid.error || 'الرابط غير صالح');
    }

    const local = localStore.get<BinBazLinkItem[]>(BINBAZ_STORAGE_KEY, [...INITIAL_BINBAZ_LINKS]);
    const index = local.findIndex((l) => l.id === link.id);
    if (index >= 0) {
      local[index] = { ...link, updatedAt: new Date().toISOString() };
    } else {
      local.push({
        ...link,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    localStore.set(BINBAZ_STORAGE_KEY, local);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('binbaz_links').upsert({
          id: link.id,
          title: link.title,
          description: link.description,
          url: link.url,
          category: link.category,
          category_label_ar: link.categoryLabelAr,
          verified: link.verified,
          status: link.status,
          sort_order: link.sortOrder,
          highlight: link.highlight,
          updated_at: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Supabase upsert binbaz error:', e);
      }
    }

    return true;
  },
};
