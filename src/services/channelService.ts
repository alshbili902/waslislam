import {
  ChannelCategory,
  IslamicChannel,
  M3UParsedItem,
  StreamValidationReport,
  ChannelLiveStatus
} from '../types/channel';
import { isSupabaseConfigured, localStore, supabase } from './supabase';
import { dashboardService } from './dashboardService';

const CHANNELS_STORAGE_KEY = 'wasl_islamic_channels_v1';
const CATEGORIES_STORAGE_KEY = 'wasl_channel_categories_v1';
const FAVORITES_STORAGE_KEY = 'wasl_channel_favorites_v1';
const HEALTH_CACHE_KEY = 'wasl_stream_health_cache_v1';

// Initial verified fallback categories
export const INITIAL_CHANNEL_CATEGORIES: ChannelCategory[] = [
  { id: 'cat-quran', name: 'قرآن', slug: 'quran', description: 'بث مباشر لتلاوات القرآن الكريم من الحرمين الشريفين', icon: 'BookOpen', sortOrder: 1, isActive: true },
  { id: 'cat-sunnah', name: 'السنة النبوية', slug: 'sunnah', description: 'بث مباشر للحديث النبوي الشريف والمسجد النبوي', icon: 'Sparkles', sortOrder: 2, isActive: true },
  { id: 'cat-tilawat', name: 'تلاوات', slug: 'tilawat', description: 'تلاوات خاشعة وتراويح بأصوات كبار القراء', icon: 'Volume2', sortOrder: 3, isActive: true },
  { id: 'cat-lectures', name: 'دروس ومحاضرات', slug: 'lectures', description: 'محاضرات علمية ودروس شرعية موثقة', icon: 'Library', sortOrder: 4, isActive: true },
  { id: 'cat-islamic', name: 'قنوات إسلامية', slug: 'islamic-channels', description: 'قنوات فضائية إسلامية منوعة وهادفة', icon: 'Tv', sortOrder: 5, isActive: true },
  { id: 'cat-live', name: 'بث مباشر', slug: 'live-broadcast', description: 'بثوث حية مباشرة للمناسبات والمشاعر المقدسة', icon: 'Radio', sortOrder: 6, isActive: true },
  { id: 'cat-visual', name: 'إذاعات مرئية', slug: 'visual-radio', description: 'إذاعات قرآنية مصورة وتبث على مدار الساعة', icon: 'Video', sortOrder: 7, isActive: true },
  { id: 'cat-others', name: 'أخرى', slug: 'others', description: 'قنوات وتسجيلات دينية عامة', icon: 'FolderTree', sortOrder: 8, isActive: true },
];

// Initial verified public channels (Real, active streams with authentic metadata)
export const INITIAL_CHANNELS: IslamicChannel[] = [
  {
    id: 'ch-saudi-quran',
    name: 'قناة القرآن الكريم (مكة المكرمة)',
    slug: 'saudi-quran',
    description: 'البث المباشر الحي من المسجد الحرام بمكة المكرمة على مدار 24 ساعة بأعذب التلاوات وأندى الأصوات من أطهر بقاع الأرض.',
    logoUrl: 'https://raw.githubusercontent.com/iptv-org/epg/master/sites/tvguide.com/saudi-quran.png',
    streamUrl: 'https://win.holol.com/live/quran/playlist.m3u8',
    streamType: 'hls',
    categoryId: 'cat-quran',
    categoryName: 'قرآن',
    categorySlug: 'quran',
    country: 'SA',
    language: 'ar',
    isActive: true,
    isFeatured: true,
    sortOrder: 1,
    sourceName: 'هيئة الإذاعة والتلفزيون السعودية (SBA)',
    sourceUrl: 'https://sba.sa',
    licenseNote: 'بث عام رسمي متاح ومصرح للجمهور عبر الأقمار والإنترنت',
    rightsStatus: 'public_broadcast',
  },
  {
    id: 'ch-saudi-sunnah',
    name: 'قناة السنة النبوية (المدينة المنورة)',
    slug: 'saudi-sunnah',
    description: 'البث المباشر الحي من المسجد النبوي الشريف بالمدينة المنورة لنقل الصلوات وأحاديث النبي المصطفى ﷺ على مدار الساعة.',
    logoUrl: 'https://raw.githubusercontent.com/iptv-org/epg/master/sites/tvguide.com/saudi-sunnah.png',
    streamUrl: 'https://win.holol.com/live/sunnah/playlist.m3u8',
    streamType: 'hls',
    categoryId: 'cat-sunnah',
    categoryName: 'السنة النبوية',
    categorySlug: 'sunnah',
    country: 'SA',
    language: 'ar',
    isActive: true,
    isFeatured: true,
    sortOrder: 2,
    sourceName: 'هيئة الإذاعة والتلفزيون السعودية (SBA)',
    sourceUrl: 'https://sba.sa',
    licenseNote: 'بث عام رسمي متاح ومصرح للجمهور عبر الأقمار والإنترنت',
    rightsStatus: 'public_broadcast',
  },
];

// In-memory stream health cache (TTL: 5 minutes)
interface CachedHealth {
  report: StreamValidationReport;
  timestamp: number;
}
const memoryHealthCache = new Map<string, CachedHealth>();
const HEALTH_CACHE_TTL_MS = 5 * 60 * 1000;

export const channelService = {
  // ==========================================
  // 1. Categories
  // ==========================================
  async getCategories(): Promise<ChannelCategory[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('channel_categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (!error && data && data.length > 0) {
          const categories: ChannelCategory[] = data.map((c: any) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description,
            icon: c.icon || 'Tv',
            sortOrder: c.sort_order,
            isActive: c.is_active,
          }));
          localStore.set(CATEGORIES_STORAGE_KEY, categories);
          return categories;
        }
      } catch (e) {
        console.warn('channelService.getCategories supabase error:', e);
      }
    }

    // Try API endpoint
    try {
      const res = await fetch('/api/channels/categories');
      if (res.ok) {
        const json = await res.json();
        if (json.categories && json.categories.length > 0) {
          const cats = json.categories.map((c: any) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description,
            icon: c.icon || 'Tv',
            sortOrder: c.sort_order,
            isActive: c.is_active,
          }));
          localStore.set(CATEGORIES_STORAGE_KEY, cats);
          return cats;
        }
      }
    } catch {}

    return localStore.get<ChannelCategory[]>(CATEGORIES_STORAGE_KEY, INITIAL_CHANNEL_CATEGORIES);
  },

  getCachedChannels(): IslamicChannel[] {
    return localStore.get<IslamicChannel[]>(CHANNELS_STORAGE_KEY, INITIAL_CHANNELS);
  },

  // ==========================================
  // 2. Channels
  // ==========================================
  async getChannels(categoryId?: string): Promise<IslamicChannel[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase
          .from('channels')
          .select(`
            *,
            channel_categories (
              id, name, slug, icon
            )
          `)
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false });

        if (categoryId && categoryId !== 'all') {
          query = query.eq('category_id', categoryId);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          const channels: IslamicChannel[] = data.map((c: any) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description,
            logoUrl: c.logo_url,
            streamUrl: c.stream_url,
            streamType: c.stream_type || 'hls',
            playlistUrl: c.playlist_url,
            categoryId: c.category_id,
            categoryName: c.channel_categories?.name || 'قنوات إسلامية',
            categorySlug: c.channel_categories?.slug || 'islamic-channels',
            categoryIcon: c.channel_categories?.icon || 'Tv',
            country: c.country || 'SA',
            language: c.language || 'ar',
            isActive: c.is_active,
            isFeatured: c.is_featured,
            sortOrder: c.sort_order,
            sourceName: c.source_name,
            sourceUrl: c.source_url,
            licenseNote: c.license_note,
            rightsStatus: c.rights_status,
            createdAt: c.created_at,
          }));
          localStore.set(CHANNELS_STORAGE_KEY, channels);
          return channels;
        }
      } catch (e) {
        console.warn('channelService.getChannels supabase error:', e);
      }
    }

    // Try API endpoint
    try {
      const url = categoryId && categoryId !== 'all' ? `/api/channels?category=${categoryId}` : '/api/channels';
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.channels && json.channels.length > 0) {
          const channels: IslamicChannel[] = json.channels.map((c: any) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description,
            logoUrl: c.logo_url,
            streamUrl: c.stream_url,
            streamType: c.stream_type || 'hls',
            playlistUrl: c.playlist_url,
            categoryId: c.category_id,
            categoryName: c.category_name || 'قنوات إسلامية',
            categorySlug: c.category_slug || 'islamic-channels',
            categoryIcon: c.category_icon || 'Tv',
            country: c.country || 'SA',
            language: c.language || 'ar',
            isActive: c.is_active,
            isFeatured: c.is_featured,
            sortOrder: c.sort_order,
            sourceName: c.source_name,
            sourceUrl: c.source_url,
            licenseNote: c.license_note,
            rightsStatus: c.rights_status,
            createdAt: c.created_at,
          }));
          localStore.set(CHANNELS_STORAGE_KEY, channels);
          return channels;
        }
      }
    } catch {}

    const stored = localStore.get<IslamicChannel[]>(CHANNELS_STORAGE_KEY, INITIAL_CHANNELS);
    if (categoryId && categoryId !== 'all') {
      return stored.filter((c) => c.categoryId === categoryId || c.categorySlug === categoryId);
    }
    return stored;
  },

  async getChannelBySlug(slug: string): Promise<IslamicChannel | null> {
    const channels = await this.getChannels();
    const found = channels.find((c) => c.slug === slug || c.id === slug);
    if (found) return found;

    try {
      const res = await fetch(`/api/channels/${encodeURIComponent(slug)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.channel) {
          const c = json.channel;
          return {
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description,
            logoUrl: c.logo_url,
            streamUrl: c.stream_url,
            streamType: c.stream_type || 'hls',
            playlistUrl: c.playlist_url,
            categoryId: c.category_id,
            categoryName: c.category_name,
            categorySlug: c.category_slug,
            country: c.country,
            language: c.language,
            isActive: c.is_active,
            isFeatured: c.is_featured,
            sortOrder: c.sort_order,
            sourceName: c.source_name,
            sourceUrl: c.source_url,
            licenseNote: c.license_note,
            rightsStatus: c.rights_status,
          };
        }
      }
    } catch {}

    return null;
  },

  // ==========================================
  // 3. Safe Stream Health Check with Caching
  // ==========================================
  async checkStreamHealth(url: string, force = false): Promise<StreamValidationReport> {
    if (!url) {
      return {
        reachable: false,
        status: 'unavailable',
        message: 'رابط البث غير محدد',
      };
    }

    const now = Date.now();
    if (!force && memoryHealthCache.has(url)) {
      const cached = memoryHealthCache.get(url)!;
      if (now - cached.timestamp < HEALTH_CACHE_TTL_MS) {
        return cached.report;
      }
    }

    try {
      const res = await fetch('/api/channels/validate-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (res.ok) {
        const report: StreamValidationReport = await res.json();
        memoryHealthCache.set(url, { report, timestamp: now });
        return report;
      }
    } catch (e: any) {
      console.warn('Stream health check request failed:', e);
    }

    const fallbackReport: StreamValidationReport = {
      reachable: false,
      status: 'unavailable',
      message: 'تعذر التحقق من البث حالياً',
    };
    return fallbackReport;
  },

  // ==========================================
  // 4. Favorites (Authenticated & Guest)
  // ==========================================
  async getFavoriteChannelIds(userId?: string): Promise<string[]> {
    if (userId && isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('user_channel_favorites')
          .select('channel_id')
          .eq('user_id', userId);

        if (!error && data) {
          const ids = data.map((d: any) => d.channel_id);
          localStore.set(FAVORITES_STORAGE_KEY, ids);
          return ids;
        }
      } catch (e) {
        console.warn('getFavoriteChannelIds supabase error:', e);
      }
    }
    return localStore.get<string[]>(FAVORITES_STORAGE_KEY, []);
  },

  async isChannelFavorite(channelId: string, userId?: string): Promise<boolean> {
    const favs = await this.getFavoriteChannelIds(userId);
    return favs.includes(channelId);
  },

  async toggleFavoriteChannel(
    channelId: string,
    channelData: IslamicChannel,
    userId?: string
  ): Promise<boolean> {
    const currentFavs = await this.getFavoriteChannelIds(userId);
    const exists = currentFavs.includes(channelId);
    const nextFavs = exists ? currentFavs.filter((id) => id !== channelId) : [...currentFavs, channelId];
    localStore.set(FAVORITES_STORAGE_KEY, nextFavs);

    if (userId && isSupabaseConfigured && supabase) {
      try {
        if (exists) {
          // Remove from user_channel_favorites
          await supabase
            .from('user_channel_favorites')
            .delete()
            .eq('user_id', userId)
            .eq('channel_id', channelId);

          // Also remove from general favorites table
          await supabase
            .from('favorites')
            .delete()
            .eq('user_id', userId)
            .eq('item_type', 'channel')
            .eq('item_id', channelId);

          this.trackChannelEvent('favorite_removed', channelId, channelData.name);
        } else {
          // Insert into user_channel_favorites
          await supabase
            .from('user_channel_favorites')
            .insert({ user_id: userId, channel_id: channelId });

          // Also insert into general favorites table for unified dashboard display
          await supabase
            .from('favorites')
            .insert({
              user_id: userId,
              item_type: 'channel',
              item_id: channelId,
              title: channelData.name,
              subtitle: channelData.categoryName || 'بث مباشر',
              preview_text: channelData.description || 'قناة إسلامية مباشرة',
              source_reference: channelData.sourceName || 'وصل الإسلامية',
              metadata: {
                slug: channelData.slug,
                logoUrl: channelData.logoUrl,
                streamUrl: channelData.streamUrl,
              },
            });

          // Record in user activity
          await dashboardService.recordActivity(
            userId,
            'favorite_add',
            `إضافة قناة إلى المفضلة: ${channelData.name}`,
            channelData.categoryName || 'قنوات إسلامية'
          );

          this.trackChannelEvent('favorite_added', channelId, channelData.name);
        }
      } catch (e) {
        console.warn('toggleFavoriteChannel supabase error:', e);
      }
    }

    return !exists;
  },

  // ==========================================
  // 5. M3U Parser & Importer API Bridge
  // ==========================================
  async parseM3U(input: { url?: string; content?: string }): Promise<{
    totalFound: number;
    validCount: number;
    duplicateCount: number;
    categories: string[];
    channels: (M3UParsedItem & { isDuplicate?: boolean })[];
  }> {
    const res = await fetch('/api/channels/parse-m3u', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || 'فشل تحليل قائمة التشغيل');
    }

    return res.json();
  },

  async batchImportChannels(
    channels: M3UParsedItem[],
    categoryMapping?: Record<string, string>
  ): Promise<{ success: boolean; importedCount: number }> {
    const res = await fetch('/api/channels/batch-import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channels, categoryMapping }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || 'فشل استيراد القنوات');
    }

    // Invalidate cached channels
    localStore.remove(CHANNELS_STORAGE_KEY);
    return res.json();
  },

  // ==========================================
  // 6. Channel CRUD for Admin
  // ==========================================
  async saveChannel(channel: Partial<IslamicChannel> & { name: string; streamUrl: string }): Promise<IslamicChannel> {
    const isEdit = Boolean(channel.id);
    const url = isEdit ? `/api/channels/${channel.id}` : '/api/channels';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(channel),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || 'فشل حفظ بيانات القناة');
    }

    localStore.remove(CHANNELS_STORAGE_KEY);
    const data = await res.json();
    return data.channel;
  },

  async deleteChannel(id: string): Promise<boolean> {
    const res = await fetch(`/api/channels/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || 'فشل حذف القناة');
    }

    localStore.remove(CHANNELS_STORAGE_KEY);
    return true;
  },

  async saveCategory(cat: Partial<ChannelCategory> & { name: string }): Promise<ChannelCategory> {
    const isEdit = Boolean(cat.id);
    const url = isEdit ? `/api/channels/categories/${cat.id}` : '/api/channels/categories';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cat),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || 'فشل حفظ التصنيف');
    }

    localStore.remove(CATEGORIES_STORAGE_KEY);
    const data = await res.json();
    return data.category;
  },

  async deleteCategory(id: string): Promise<boolean> {
    const res = await fetch(`/api/channels/categories/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || 'فشل حذف التصنيف');
    }

    localStore.remove(CATEGORIES_STORAGE_KEY);
    return true;
  },

  // ==========================================
  // 7. Channel Analytics Tracker
  // ==========================================
  trackChannelEvent(
    event: 'channel_opened' | 'playback_started' | 'playback_error' | 'favorite_added' | 'favorite_removed' | 'channel_switched',
    channelId: string,
    channelName: string,
    details?: any
  ): void {
    try {
      const entry = {
        event,
        channelId,
        channelName,
        timestamp: new Date().toISOString(),
        details,
      };

      // In-memory debug log
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[Channel Analytics] ${event}: ${channelName}`, details || '');
      }

      // Store last 30 events in localStorage for diagnostics
      const storedLogs = localStore.get<any[]>('wasl_channel_analytics_v1', []);
      storedLogs.unshift(entry);
      if (storedLogs.length > 30) storedLogs.length = 30;
      localStore.set('wasl_channel_analytics_v1', storedLogs);
    } catch {}
  },
};
