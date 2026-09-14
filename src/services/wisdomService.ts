import { supabase, isSupabaseConfigured, localStore } from './supabase';
import { IslamicWisdom, WisdomFilterOptions, WisdomCategory, WisdomContentType, WisdomVerificationStatus } from '../types/wisdom';
import { VERIFIED_INITIAL_WISDOMS } from '../data/wisdomsData';

const WISDOMS_STORAGE_KEY = 'wasl_islamic_wisdoms_store';

/**
 * Normalizes Arabic text to detect duplicates and near-duplicates accurately.
 * Removes Tashkeel (harakat), tatweel, normalizes hamzas, yaa, and taa marbuta.
 */
export function normalizeArabicText(text: string): string {
  if (!text) return '';
  return text
    // Remove diacritics / Tashkeel
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Remove tatweel (kashida)
    .replace(/\u0640/g, '')
    // Normalize Alefs (أ, إ, آ, ٱ -> ا)
    .replace(/[أإآٱ]/g, 'ا')
    // Normalize Yaa (ى -> ي)
    .replace(/ى/g, 'ي')
    // Normalize Taa Marbuta (ة -> ه)
    .replace(/ة/g, 'ه')
    // Remove Arabic/English punctuation and symbols
    .replace(/[.,/#!$%^&*;:{}=\-_`~()«»""'؟،؛!?:–—]/g, ' ')
    // Collapse consecutive whitespaces
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Checks whether candidate text is a duplicate or near-duplicate of existing wisdoms.
 * Returns duplicate details and similarity score if duplicate is detected.
 */
export function checkDuplicateWisdom(
  candidateText: string,
  existingList: IslamicWisdom[],
  excludeId?: string
): { isDuplicate: boolean; match?: IslamicWisdom; similarityPercentage: number } {
  const normCandidate = normalizeArabicText(candidateText);
  if (!normCandidate || normCandidate.length < 5) {
    return { isDuplicate: false, similarityPercentage: 0 };
  }

  const candidateWords = new Set(normCandidate.split(' '));

  for (const item of existingList) {
    if (excludeId && item.id === excludeId) continue;
    const normExisting = normalizeArabicText(item.content);

    // Exact normalized match
    if (normCandidate === normExisting) {
      return { isDuplicate: true, match: item, similarityPercentage: 100 };
    }

    // Substring containment if length >= 15 characters
    if (normCandidate.length >= 15 && normExisting.length >= 15) {
      if (normCandidate.includes(normExisting) || normExisting.includes(normCandidate)) {
        return { isDuplicate: true, match: item, similarityPercentage: 90 };
      }
    }

    // Word-level overlap analysis
    const existingWords = new Set(normExisting.split(' ').filter(w => w.length > 1));
    const filteredCandidateWords = Array.from(candidateWords).filter(w => w.length > 1);
    
    let intersectionCount = 0;
    filteredCandidateWords.forEach((w) => {
      if (existingWords.has(w)) intersectionCount++;
    });

    const unionCount = new Set([...filteredCandidateWords, ...existingWords]).size;
    const jaccard = unionCount > 0 ? (intersectionCount / unionCount) * 100 : 0;
    const candidateContainment = filteredCandidateWords.length > 0 
      ? (intersectionCount / filteredCandidateWords.length) * 100 
      : 0;

    if (jaccard >= 60 || (candidateContainment >= 80 && filteredCandidateWords.length >= 3)) {
      const bestScore = Math.max(Math.round(jaccard), Math.round(candidateContainment));
      return { isDuplicate: true, match: item, similarityPercentage: bestScore };
    }
  }

  return { isDuplicate: false, similarityPercentage: 0 };
}

/**
 * Initializes local store with verified seeds if empty.
 */
function getStoredWisdoms(): IslamicWisdom[] {
  const saved = localStore.get<IslamicWisdom[]>(WISDOMS_STORAGE_KEY, []);
  if (!saved || saved.length === 0) {
    localStore.set(WISDOMS_STORAGE_KEY, VERIFIED_INITIAL_WISDOMS);
    return VERIFIED_INITIAL_WISDOMS;
  }
  return saved;
}

function saveStoredWisdoms(list: IslamicWisdom[]): void {
  localStore.set(WISDOMS_STORAGE_KEY, list);
}

/**
 * Deterministic hash function for date strings (e.g. '2026-09-14').
 * Ensures identical results on every page refresh for a given date.
 */
function hashDateString(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export const wisdomService = {
  /**
   * Fetches public verified wisdoms with filtering, search, and pagination.
   */
  async getPublicWisdoms(options?: WisdomFilterOptions): Promise<{ items: IslamicWisdom[]; total: number }> {
    const { category, contentType, searchQuery, page = 1, pageSize = 12 } = options || {};

    // First try Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase
          .from('islamic_wisdoms')
          .select('*', { count: 'exact' })
          .eq('verification_status', 'verified');

        if (category && category !== 'الكل') {
          query = query.eq('category', category);
        }

        if (contentType && contentType !== 'all') {
          query = query.eq('content_type', contentType);
        }

        if (searchQuery && searchQuery.trim()) {
          query = query.ilike('content', `%${searchQuery.trim()}%`);
        }

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false }).range(from, to);

        const { data, count, error } = await query;
        if (!error && data && data.length > 0) {
          const mapped: IslamicWisdom[] = data.map((row: any) => ({
            id: row.id,
            content: row.content,
            contentType: row.content_type,
            author: row.author,
            source: row.source,
            reference: row.reference,
            hadithGrade: row.hadith_grade,
            category: row.category,
            verificationStatus: row.verification_status,
            isFeatured: Boolean(row.is_featured),
            isDaily: Boolean(row.is_daily),
            scheduledDate: row.scheduled_date,
            publishedAt: row.published_at,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          }));

          return { items: mapped, total: count || mapped.length };
        }
      } catch (err) {
        console.warn('wisdomService.getPublicWisdoms supabase query fallback:', err);
      }
    }

    // Local / In-memory fallback
    const all = getStoredWisdoms().filter((w) => w.verificationStatus === 'verified');

    let filtered = all;

    if (category && category !== 'الكل') {
      filtered = filtered.filter((w) => w.category === category);
    }

    if (contentType && contentType !== 'all') {
      filtered = filtered.filter((w) => w.contentType === contentType);
    }

    if (searchQuery && searchQuery.trim()) {
      const q = normalizeArabicText(searchQuery);
      filtered = filtered.filter(
        (w) =>
          normalizeArabicText(w.content).includes(q) ||
          normalizeArabicText(w.source).includes(q) ||
          (w.author && normalizeArabicText(w.author).includes(q)) ||
          normalizeArabicText(w.category).includes(q)
      );
    }

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return { items, total };
  },

  /**
   * Deterministic Daily Wisdom:
   * 1. Checks if an administrator scheduled an item for today's date.
   * 2. If not, picks a verified item deterministically based on date hash.
   * Never changes randomly upon refresh.
   */
  async getDailyWisdom(targetDateStr?: string): Promise<IslamicWisdom> {
    const today = targetDateStr || new Date().toISOString().split('T')[0];

    // Check Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        // Scheduled check
        const { data: scheduled } = await supabase
          .from('islamic_wisdoms')
          .select('*')
          .eq('verification_status', 'verified')
          .eq('scheduled_date', today)
          .limit(1)
          .maybeSingle();

        if (scheduled) {
          return {
            id: scheduled.id,
            content: scheduled.content,
            contentType: scheduled.content_type,
            author: scheduled.author,
            source: scheduled.source,
            reference: scheduled.reference,
            hadithGrade: scheduled.hadith_grade,
            category: scheduled.category,
            verificationStatus: scheduled.verification_status,
            isFeatured: Boolean(scheduled.is_featured),
            isDaily: true,
            scheduledDate: scheduled.scheduled_date,
            publishedAt: scheduled.published_at,
            createdAt: scheduled.created_at,
            updatedAt: scheduled.updated_at,
          };
        }
      } catch (err) {
        console.warn('wisdomService.getDailyWisdom supabase fallback:', err);
      }
    }

    // Local check for admin scheduled item
    const all = getStoredWisdoms().filter((w) => w.verificationStatus === 'verified');
    const scheduledLocal = all.find((w) => w.scheduledDate === today || (w.isDaily && w.scheduledDate === today));
    if (scheduledLocal) {
      return scheduledLocal;
    }

    // Deterministic selection based on date string hash
    if (all.length === 0) {
      return VERIFIED_INITIAL_WISDOMS[0];
    }

    const dateHash = hashDateString(today);
    const deterministicIndex = dateHash % all.length;
    return all[deterministicIndex];
  },

  /**
   * Retrieves single wisdom by ID.
   */
  async getWisdomById(id: string): Promise<IslamicWisdom | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('islamic_wisdoms')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) {
          return {
            id: data.id,
            content: data.content,
            contentType: data.content_type,
            author: data.author,
            source: data.source,
            reference: data.reference,
            hadithGrade: data.hadith_grade,
            category: data.category,
            verificationStatus: data.verification_status,
            isFeatured: Boolean(data.is_featured),
            isDaily: Boolean(data.is_daily),
            scheduledDate: data.scheduled_date,
            publishedAt: data.published_at,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
        }
      } catch (err) {
        console.warn('wisdomService.getWisdomById fallback:', err);
      }
    }

    const item = getStoredWisdoms().find((w) => w.id === id);
    return item || null;
  },

  /**
   * Admin: Get all wisdoms with any verification status.
   */
  async adminGetAllWisdoms(options?: WisdomFilterOptions): Promise<{ items: IslamicWisdom[]; total: number }> {
    const { category, contentType, searchQuery, verificationStatus, page = 1, pageSize = 50 } = options || {};

    const all = getStoredWisdoms();
    let filtered = all;

    if (verificationStatus && verificationStatus !== 'all') {
      filtered = filtered.filter((w) => w.verificationStatus === verificationStatus);
    }

    if (category && category !== 'الكل') {
      filtered = filtered.filter((w) => w.category === category);
    }

    if (contentType && contentType !== 'all') {
      filtered = filtered.filter((w) => w.contentType === contentType);
    }

    if (searchQuery && searchQuery.trim()) {
      const q = normalizeArabicText(searchQuery);
      filtered = filtered.filter(
        (w) =>
          normalizeArabicText(w.content).includes(q) ||
          normalizeArabicText(w.source).includes(q) ||
          (w.author && normalizeArabicText(w.author).includes(q)) ||
          normalizeArabicText(w.category).includes(q)
      );
    }

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return { items, total };
  },

  /**
   * Admin: Create a new wisdom item.
   * Performs automatic duplicate check first.
   */
  async adminCreateWisdom(
    data: Omit<IslamicWisdom, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ success: boolean; wisdom?: IslamicWisdom; duplicateWarning?: string }> {
    const existing = getStoredWisdoms();
    const dupCheck = checkDuplicateWisdom(data.content, existing);

    let warning: string | undefined;
    if (dupCheck.isDuplicate && dupCheck.match) {
      warning = `يوجد محتوى مشابه أو مطابق بالفعل (نسبة التشابه: ${dupCheck.similarityPercentage}%) مع الحكمة: "${dupCheck.match.content.substring(0, 50)}..."`;
    }

    const now = new Date().toISOString();
    const newWisdom: IslamicWisdom = {
      ...data,
      id: `wis-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };

    // Save to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('islamic_wisdoms').insert({
          content: newWisdom.content,
          content_type: newWisdom.contentType,
          author: newWisdom.author,
          source: newWisdom.source,
          reference: newWisdom.reference,
          hadith_grade: newWisdom.hadithGrade,
          category: newWisdom.category,
          verification_status: newWisdom.verificationStatus,
          is_featured: newWisdom.isFeatured,
          is_daily: newWisdom.isDaily,
          scheduled_date: newWisdom.scheduledDate,
          created_at: now,
          updated_at: now,
        });
      } catch (err) {
        console.warn('wisdomService.adminCreateWisdom supabase error:', err);
      }
    }

    saveStoredWisdoms([newWisdom, ...existing]);
    return { success: true, wisdom: newWisdom, duplicateWarning: warning };
  },

  /**
   * Admin: Update an existing wisdom item.
   */
  async adminUpdateWisdom(
    id: string,
    updates: Partial<IslamicWisdom>
  ): Promise<{ success: boolean; wisdom?: IslamicWisdom; duplicateWarning?: string }> {
    const existing = getStoredWisdoms();
    const index = existing.findIndex((w) => w.id === id);
    if (index === -1) {
      return { success: false };
    }

    let warning: string | undefined;
    if (updates.content) {
      const dupCheck = checkDuplicateWisdom(updates.content, existing, id);
      if (dupCheck.isDuplicate && dupCheck.match) {
        warning = `يوجد محتوى مشابه أو مطابق بالفعل (نسبة التشابه: ${dupCheck.similarityPercentage}%) مع الحكمة: "${dupCheck.match.content.substring(0, 50)}..."`;
      }
    }

    const updated: IslamicWisdom = {
      ...existing[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    existing[index] = updated;
    saveStoredWisdoms(existing);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('islamic_wisdoms')
          .update({
            content: updated.content,
            content_type: updated.contentType,
            author: updated.author,
            source: updated.source,
            reference: updated.reference,
            hadith_grade: updated.hadithGrade,
            category: updated.category,
            verification_status: updated.verificationStatus,
            is_featured: updated.isFeatured,
            is_daily: updated.isDaily,
            scheduled_date: updated.scheduledDate,
            updated_at: updated.updatedAt,
          })
          .eq('id', id);
      } catch (err) {
        console.warn('wisdomService.adminUpdateWisdom supabase error:', err);
      }
    }

    return { success: true, wisdom: updated, duplicateWarning: warning };
  },

  /**
   * Admin: Delete a wisdom item.
   */
  async adminDeleteWisdom(id: string): Promise<boolean> {
    const existing = getStoredWisdoms();
    const filtered = existing.filter((w) => w.id !== id);
    saveStoredWisdoms(filtered);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('islamic_wisdoms').delete().eq('id', id);
      } catch (err) {
        console.warn('wisdomService.adminDeleteWisdom supabase error:', err);
      }
    }

    return true;
  },

  /**
   * Admin: Schedule a wisdom as "حكمة اليوم" for a specific date.
   */
  async adminScheduleDaily(id: string, dateStr: string): Promise<boolean> {
    const existing = getStoredWisdoms();
    const item = existing.find((w) => w.id === id);
    if (!item) return false;

    // Remove existing scheduled for this date
    existing.forEach((w) => {
      if (w.scheduledDate === dateStr) {
        w.scheduledDate = undefined;
        w.isDaily = false;
      }
    });

    item.scheduledDate = dateStr;
    item.isDaily = true;
    item.updatedAt = new Date().toISOString();

    saveStoredWisdoms(existing);
    return true;
  },
};
