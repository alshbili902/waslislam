import { RadioCategory, RadioReciter, RadioStation, RadioStreamStatus } from '../types';
import { INITIAL_RADIO_STATIONS, RADIO_CATEGORIES, RADIO_RECITERS } from '../data/radioData';
import { isSupabaseConfigured, localStore, supabase } from './supabase';

const STATIONS_STORAGE_KEY = 'radio_stations_v1';
const RECITERS_STORAGE_KEY = 'radio_reciters_v1';
const FAVORITES_STORAGE_KEY = 'radio_favorites_v1';
const HISTORY_STORAGE_KEY = 'radio_history_v1';

export interface StreamValidationResult {
  reachable: boolean;
  status: RadioStreamStatus;
  statusCode?: number;
  contentType?: string;
  latencyMs?: number;
  message: string;
}

export const radioService = {
  // 1. Categories
  async getCategories(): Promise<RadioCategory[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('radio_categories')
          .select('*')
          .order('sort_order', { ascending: true });
        if (!error && data && data.length > 0) {
          return data.map((c: any) => ({
            id: c.id,
            nameAr: c.name_ar,
            slug: c.slug,
            descriptionAr: c.description_ar,
            icon: c.icon,
            sortOrder: c.sort_order,
          }));
        }
      } catch (e) {
        console.warn('Supabase getCategories error:', e);
      }
    }
    return RADIO_CATEGORIES;
  },

  // 2. Reciters
  async getReciters(): Promise<RadioReciter[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('reciters')
          .select('*')
          .order('sort_order', { ascending: true });
        if (!error && data && data.length > 0) {
          return data.map((r: any) => ({
            id: r.id,
            nameAr: r.name_ar,
            nameEn: r.name_en,
            bioAr: r.bio_ar,
            imageUrl: r.image_url,
            isActive: r.is_active,
            sortOrder: r.sort_order,
          }));
        }
      } catch (e) {
        console.warn('Supabase getReciters error:', e);
      }
    }
    return localStore.get<RadioReciter[]>(RECITERS_STORAGE_KEY, RADIO_RECITERS);
  },

  async saveReciter(reciter: Partial<RadioReciter> & { nameAr: string }): Promise<RadioReciter> {
    const reciters = await this.getReciters();
    let updated: RadioReciter;

    if (reciter.id) {
      const index = reciters.findIndex((r) => r.id === reciter.id);
      if (index >= 0) {
        updated = { ...reciters[index], ...reciter } as RadioReciter;
        reciters[index] = updated;
      } else {
        updated = {
          id: reciter.id,
          nameAr: reciter.nameAr,
          nameEn: reciter.nameEn || '',
          bioAr: reciter.bioAr || '',
          imageUrl: reciter.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
          isActive: reciter.isActive ?? true,
          sortOrder: reciter.sortOrder ?? reciters.length + 1,
        };
        reciters.push(updated);
      }
    } else {
      updated = {
        id: 'rec-' + Date.now().toString(36),
        nameAr: reciter.nameAr,
        nameEn: reciter.nameEn || '',
        bioAr: reciter.bioAr || '',
        imageUrl: reciter.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
        isActive: reciter.isActive ?? true,
        sortOrder: reciter.sortOrder ?? reciters.length + 1,
      };
      reciters.push(updated);
    }

    localStore.set(RECITERS_STORAGE_KEY, reciters);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('reciters').upsert({
          id: updated.id,
          name_ar: updated.nameAr,
          name_en: updated.nameEn,
          bio_ar: updated.bioAr,
          image_url: updated.imageUrl,
          is_active: updated.isActive,
          sort_order: updated.sortOrder,
        });
      } catch (e) {
        console.warn('Supabase saveReciter error:', e);
      }
    }

    return updated;
  },

  async deleteReciter(id: string): Promise<void> {
    const reciters = await this.getReciters();
    const filtered = reciters.filter((r) => r.id !== id);
    localStore.set(RECITERS_STORAGE_KEY, filtered);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('reciters').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteReciter error:', e);
      }
    }
  },

  // 3. Stations
  async getStations(): Promise<RadioStation[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('radio_stations')
          .select('*, radio_categories(name_ar), reciters(name_ar)')
          .order('sort_order', { ascending: true });
        if (!error && data && data.length > 0) {
          return data.map((s: any) => ({
            id: s.id,
            name: s.name,
            description: s.description,
            streamUrl: s.stream_url,
            logoUrl: s.logo_url,
            categoryId: s.category_id,
            categoryNameAr: s.radio_categories?.name_ar,
            reciterId: s.reciter_id,
            reciterNameAr: s.reciters?.name_ar,
            isActive: s.is_active,
            isFeatured: s.is_featured,
            sortOrder: s.sort_order,
            status: (s.status as RadioStreamStatus) || 'working',
            bitrate: s.bitrate || '128 kbps',
            createdAt: s.created_at,
            updatedAt: s.updated_at,
          }));
        }
      } catch (e) {
        console.warn('Supabase getStations error:', e);
      }
    }
    return localStore.get<RadioStation[]>(STATIONS_STORAGE_KEY, INITIAL_RADIO_STATIONS);
  },

  async saveStation(station: Partial<RadioStation> & { name: string; streamUrl: string; categoryId: string }): Promise<RadioStation> {
    const stations = await this.getStations();
    let updated: RadioStation;

    const now = new Date().toISOString();

    if (station.id) {
      const idx = stations.findIndex((s) => s.id === station.id);
      if (idx >= 0) {
        updated = {
          ...stations[idx],
          ...station,
          updatedAt: now,
        } as RadioStation;
        stations[idx] = updated;
      } else {
        updated = {
          id: station.id,
          name: station.name,
          description: station.description || '',
          streamUrl: station.streamUrl,
          logoUrl: station.logoUrl || 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=300&q=80',
          categoryId: station.categoryId,
          categoryNameAr: station.categoryNameAr,
          reciterId: station.reciterId,
          reciterNameAr: station.reciterNameAr,
          isActive: station.isActive ?? true,
          isFeatured: station.isFeatured ?? false,
          sortOrder: station.sortOrder ?? stations.length + 1,
          status: station.status || 'working',
          bitrate: station.bitrate || '128 kbps',
          createdAt: now,
          updatedAt: now,
        };
        stations.push(updated);
      }
    } else {
      updated = {
        id: 'st-' + Date.now().toString(36),
        name: station.name,
        description: station.description || '',
        streamUrl: station.streamUrl,
        logoUrl: station.logoUrl || 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=300&q=80',
        categoryId: station.categoryId,
        categoryNameAr: station.categoryNameAr,
        reciterId: station.reciterId,
        reciterNameAr: station.reciterNameAr,
        isActive: station.isActive ?? true,
        isFeatured: station.isFeatured ?? false,
        sortOrder: station.sortOrder ?? stations.length + 1,
        status: station.status || 'working',
        bitrate: station.bitrate || '128 kbps',
        createdAt: now,
        updatedAt: now,
      };
      stations.push(updated);
    }

    localStore.set(STATIONS_STORAGE_KEY, stations);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('radio_stations').upsert({
          id: updated.id,
          name: updated.name,
          description: updated.description,
          stream_url: updated.streamUrl,
          logo_url: updated.logoUrl,
          category_id: updated.categoryId,
          reciter_id: updated.reciterId,
          is_active: updated.isActive,
          is_featured: updated.isFeatured,
          sort_order: updated.sortOrder,
          status: updated.status,
          bitrate: updated.bitrate,
          updated_at: now,
        });
      } catch (e) {
        console.warn('Supabase saveStation error:', e);
      }
    }

    return updated;
  },

  async deleteStation(id: string): Promise<void> {
    const stations = await this.getStations();
    const filtered = stations.filter((s) => s.id !== id);
    localStore.set(STATIONS_STORAGE_KEY, filtered);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('radio_stations').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteStation error:', e);
      }
    }
  },

  async toggleStationActive(id: string, isActive: boolean): Promise<void> {
    const stations = await this.getStations();
    const st = stations.find((s) => s.id === id);
    if (st) {
      st.isActive = isActive;
      localStore.set(STATIONS_STORAGE_KEY, stations);

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('radio_stations').update({ is_active: isActive }).eq('id', id);
        } catch (e) {
          console.warn('Supabase toggleStationActive error:', e);
        }
      }
    }
  },

  async setStationStatus(id: string, status: RadioStreamStatus): Promise<void> {
    const stations = await this.getStations();
    const st = stations.find((s) => s.id === id);
    if (st) {
      st.status = status;
      localStore.set(STATIONS_STORAGE_KEY, stations);

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('radio_stations').update({ status }).eq('id', id);
        } catch (e) {
          console.warn('Supabase setStationStatus error:', e);
        }
      }
    }
  },

  async reorderStations(reorderedIds: string[]): Promise<void> {
    const stations = await this.getStations();
    const idMap = new Map<string, RadioStation>(stations.map((s) => [s.id, s]));
    const newStations: RadioStation[] = [];

    reorderedIds.forEach((id, index) => {
      const st = idMap.get(id);
      if (st) {
        st.sortOrder = index + 1;
        newStations.push(st);
        idMap.delete(id);
      }
    });

    // Append remaining
    idMap.forEach((st) => {
      st.sortOrder = newStations.length + 1;
      newStations.push(st);
    });

    localStore.set(STATIONS_STORAGE_KEY, newStations);

    if (isSupabaseConfigured && supabase) {
      try {
        for (const st of newStations) {
          await supabase.from('radio_stations').update({ sort_order: st.sortOrder }).eq('id', st.id);
        }
      } catch (e) {
        console.warn('Supabase reorderStations error:', e);
      }
    }
  },

  // 4. Favorites
  async getFavorites(): Promise<string[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user?.id) {
          const { data, error } = await supabase
            .from('user_radio_favorites')
            .select('station_id')
            .eq('user_id', userData.user.id);
          if (!error && data) {
            return data.map((d: any) => d.station_id);
          }
        }
      } catch (e) {
        console.warn('Supabase getFavorites error:', e);
      }
    }
    return localStore.get<string[]>(FAVORITES_STORAGE_KEY, []);
  },

  async toggleFavorite(stationId: string): Promise<boolean> {
    const current = await this.getFavorites();
    const exists = current.includes(stationId);
    let next: string[];

    if (exists) {
      next = current.filter((id) => id !== stationId);
    } else {
      next = [...current, stationId];
    }

    localStore.set(FAVORITES_STORAGE_KEY, next);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user?.id) {
          if (exists) {
            await supabase
              .from('user_radio_favorites')
              .delete()
              .eq('user_id', userData.user.id)
              .eq('station_id', stationId);
          } else {
            await supabase.from('user_radio_favorites').insert({
              user_id: userData.user.id,
              station_id: stationId,
            });
          }
        }
      } catch (e) {
        console.warn('Supabase toggleFavorite error:', e);
      }
    }

    return !exists;
  },

  // 5. Recently Played History
  getRecentHistory(): string[] {
    return localStore.get<string[]>(HISTORY_STORAGE_KEY, []);
  },

  recordPlay(stationId: string): void {
    const current = this.getRecentHistory().filter((id) => id !== stationId);
    const updated = [stationId, ...current].slice(0, 10);
    localStore.set(HISTORY_STORAGE_KEY, updated);

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          const { data: userData } = await supabase.auth.getUser();
          if (userData?.user?.id) {
            await supabase.from('user_radio_history').insert({
              user_id: userData.user.id,
              station_id: stationId,
              played_at: new Date().toISOString(),
            });
          }
        } catch (e) {
          console.warn('Supabase recordPlay error:', e);
        }
      })();
    }
  },

  clearRecentHistory(): void {
    localStore.remove(HISTORY_STORAGE_KEY);
  },

  // 6. Backend Stream Validation
  async validateStream(url: string): Promise<StreamValidationResult> {
    const startTime = performance.now();
    try {
      // 1. Try server-side validation endpoint
      const res = await fetch('/api/radio/validate-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (res.ok) {
        const data = await res.json();
        const latency = Math.round(performance.now() - startTime);
        return {
          reachable: data.reachable ?? true,
          status: data.status || (data.reachable ? 'working' : 'unavailable'),
          statusCode: data.statusCode || 200,
          contentType: data.contentType,
          latencyMs: latency,
          message: data.message || (data.reachable ? 'البث المباشر متاح ويعمل بصورة ممتازة' : 'تعذر الاتصال بالبث المباشر'),
        };
      }
    } catch (err) {
      // Fall through to client probe
    }

    // 2. Client-side audio element probe fallback
    return new Promise((resolve) => {
      const audio = new Audio();
      let finished = false;
      const timeout = setTimeout(() => {
        if (!finished) {
          finished = true;
          audio.src = '';
          resolve({
            reachable: false,
            status: 'unavailable',
            latencyMs: Math.round(performance.now() - startTime),
            message: 'انتهت مهلة انتظار استجابة البث (تجاوز 6 ثوان)',
          });
        }
      }, 6000);

      audio.oncanplay = () => {
        if (!finished) {
          finished = true;
          clearTimeout(timeout);
          audio.src = '';
          resolve({
            reachable: true,
            status: 'working',
            latencyMs: Math.round(performance.now() - startTime),
            message: 'البث المباشر يعمل بشكل سليم وجاهز للاستماع',
          });
        }
      };

      audio.onerror = () => {
        if (!finished) {
          finished = true;
          clearTimeout(timeout);
          audio.src = '';
          resolve({
            reachable: false,
            status: 'unavailable',
            latencyMs: Math.round(performance.now() - startTime),
            message: 'تعذر تشغيل البث المباشر، تحقق من صحة الرابط',
          });
        }
      };

      try {
        audio.preload = 'metadata';
        audio.src = url;
      } catch (e: any) {
        clearTimeout(timeout);
        resolve({
          reachable: false,
          status: 'unavailable',
          message: 'صيغة الرابط غير مدعومة: ' + (e?.message || ''),
        });
      }
    });
  },
};
