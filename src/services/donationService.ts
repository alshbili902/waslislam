import { DonationCategory, DonationPlatform } from '../types/donations';
import { DONATION_CATEGORIES, INITIAL_DONATION_PLATFORMS } from '../data/donationData';
import { isSupabaseConfigured, localStore, supabase } from './supabase';

const DONATIONS_STORAGE_KEY = 'donation_platforms_v1';

// Blacklist of known URL shorteners and suspicious redirection services
const SHORTENER_DOMAINS = [
  'bit.ly',
  'tinyurl.com',
  'goo.gl',
  't.co',
  'ow.ly',
  'is.gd',
  'buff.ly',
  'adf.ly',
  'bit.do',
  'cutt.ly',
  'rb.gy',
  'shorturl.at',
];

export interface UrlValidationResult {
  isValid: boolean;
  error?: string;
  normalizedUrl?: string;
}

export function validateDonationUrl(url: string): UrlValidationResult {
  if (!url || typeof url !== 'string') {
    return { isValid: false, error: 'الرابط مطلوب' };
  }

  const trimmed = url.trim();

  // Reject dangerous schemes
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return { isValid: false, error: 'نوع الرابط غير آمن وغير مسموح به' };
  }

  // Must start with HTTPS
  if (!lower.startsWith('https://')) {
    return { isValid: false, error: 'يجب أن يبدأ الرابط ببروتوكول التشفير الآمن HTTPS' };
  }

  try {
    const parsed = new URL(trimmed);

    if (parsed.protocol !== 'https:') {
      return { isValid: false, error: 'يجب أن يكون الرابط مشفراً بـ HTTPS' };
    }

    const host = parsed.hostname.toLowerCase();

    // Prevent IP address targets
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host) || host === 'localhost') {
      return { isValid: false, error: 'غير مسموح باستخدام عناوين IP مباشرة' };
    }

    // Prevent URL shorteners
    if (SHORTENER_DOMAINS.some((d) => host === d || host.endsWith('.' + d))) {
      return { isValid: false, error: 'غير مسموح باستخدام روابط مختصرة حفاظاً على أمان وموثوقية التبرع' };
    }

    // Must have a valid dot and extension
    if (!host.includes('.') || host.endsWith('.')) {
      return { isValid: false, error: 'اسم النطاق غير صالح' };
    }

    return { isValid: true, normalizedUrl: parsed.toString() };
  } catch {
    return { isValid: false, error: 'صيغة الرابط غير صحيحة' };
  }
}

export const donationService = {
  getCategories(): DonationCategory[] {
    return DONATION_CATEGORIES;
  },

  async getPlatforms(): Promise<DonationPlatform[]> {
    // 1. Try public server API first
    try {
      const res = await fetch('/api/donations');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.platforms) && data.platforms.length > 0) {
          return data.platforms;
        }
      }
    } catch {
      // Fallback silently
    }

    // 2. Try Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('donation_platforms')
          .select('*')
          .eq('status', 'verified')
          .order('sort_order', { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            name: d.name,
            description: d.description,
            url: d.url,
            officialEntity: d.official_entity,
            supervisingEntity: d.supervising_entity,
            logoUrl: d.logo_url,
            categories: d.categories || [],
            features: d.features || [],
            verified: d.verified,
            status: d.status,
            sortOrder: d.sort_order,
            verificationDate: d.verification_date,
            createdAt: d.created_at,
            updatedAt: d.updated_at,
          }));
        }
      } catch (e) {
        console.warn('Supabase donation error:', e);
      }
    }

    // 3. Fallback to localStore or initial data
    const local = localStore.get<DonationPlatform[]>(DONATIONS_STORAGE_KEY, []);
    if (local && local.length > 0) {
      return local.filter((p) => p.status === 'verified');
    }

    return INITIAL_DONATION_PLATFORMS;
  },

  async savePlatform(platform: DonationPlatform): Promise<boolean> {
    const valid = validateDonationUrl(platform.url);
    if (!valid.isValid) {
      throw new Error(valid.error || 'الرابط غير صالح');
    }

    // Save to local store
    const local = localStore.get<DonationPlatform[]>(DONATIONS_STORAGE_KEY, [...INITIAL_DONATION_PLATFORMS]);
    const index = local.findIndex((p) => p.id === platform.id);
    if (index >= 0) {
      local[index] = { ...platform, updatedAt: new Date().toISOString() };
    } else {
      local.push({
        ...platform,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    localStore.set(DONATIONS_STORAGE_KEY, local);

    // Sync to Supabase if connected
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('donation_platforms').upsert({
          id: platform.id,
          name: platform.name,
          description: platform.description,
          url: platform.url,
          official_entity: platform.officialEntity,
          supervising_entity: platform.supervisingEntity,
          logo_url: platform.logoUrl,
          categories: platform.categories,
          features: platform.features,
          verified: platform.verified,
          status: platform.status,
          sort_order: platform.sortOrder,
          updated_at: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Supabase upsert platform error:', e);
      }
    }

    return true;
  },
};
