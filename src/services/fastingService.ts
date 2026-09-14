import { FastingRecord } from '../types';
export type { FastingRecord };
import { supabase } from './supabase';

const FASTING_STORAGE_KEY = 'wasl_fasting_records_v1';

export type FastingTypeAr =
  | 'صيام رمضان'
  | 'صيام الاثنين'
  | 'صيام الخميس'
  | 'صيام أيام البيض'
  | 'صيام يوم عرفة'
  | 'صيام عاشوراء وتاسوعاء'
  | 'صيام الست من شوال'
  | 'صيام قضاء'
  | 'صيام نفل مطلق'
  | 'صيام نذر';

export interface FastingStats {
  thisMonthCount: number;
  thisYearCount: number;
  totalCompleted: number;
  ramadanCompleted: number;
  ramadanTotal: number;
  voluntariesCompleted: number;
}

// Get all records from local storage
export function getLocalFastingRecords(): FastingRecord[] {
  try {
    const raw = localStorage.getItem(FASTING_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error reading fasting records:', err);
    return [];
  }
}

// Save all records to local storage
export function setLocalFastingRecords(records: FastingRecord[]): void {
  try {
    localStorage.setItem(FASTING_STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('Error saving fasting records:', err);
  }
}

// Fetch all records (Supabase if authenticated, else localStorage)
export async function fetchUserFastingRecords(userId?: string): Promise<FastingRecord[]> {
  const local = getLocalFastingRecords();
  if (!userId) return local;

  try {
    const { data, error } = await supabase
      .from('fasting_records')
      .select('*')
      .eq('user_id', userId)
      .order('fasting_date', { ascending: false });

    if (error) {
      console.warn('Supabase fetch fasting_records error, fallback to local:', error.message);
      return local;
    }

    if (data && data.length > 0) {
      // Merge records
      const mergedMap = new Map<string, FastingRecord>();
      local.forEach(r => mergedMap.set(r.fasting_date, r));
      data.forEach(r => mergedMap.set(r.fasting_date, r));
      const merged = Array.from(mergedMap.values());
      setLocalFastingRecords(merged);
      return merged;
    }
  } catch (e) {
    console.warn('Network error fetching fasting records:', e);
  }

  return local;
}

// Update or set status for a specific date (YYYY-MM-DD)
export async function recordFastingStatus(
  dateStr: string,
  status: 'completed' | 'missed' | 'none',
  fastingType: string,
  hijriDate?: string,
  userId?: string,
  notes?: string
): Promise<FastingRecord[]> {
  let records = getLocalFastingRecords();

  if (status === 'none') {
    // Remove record
    records = records.filter(r => r.fasting_date !== dateStr);
    setLocalFastingRecords(records);

    if (userId) {
      try {
        await supabase
          .from('fasting_records')
          .delete()
          .match({ user_id: userId, fasting_date: dateStr });
      } catch (err) {
        console.warn('Failed to delete fasting record on server:', err);
      }
    }
    return records;
  }

  const existingIdx = records.findIndex(r => r.fasting_date === dateStr);
  const updatedRecord: FastingRecord = {
    id: existingIdx >= 0 ? records[existingIdx].id : `fast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    user_id: userId,
    fasting_date: dateStr,
    hijri_date: hijriDate || '',
    fasting_type: fastingType,
    status: status === 'completed' ? 'completed' : 'missed',
    notes: notes || '',
    created_at: existingIdx >= 0 ? records[existingIdx].created_at : new Date().toISOString()
  };

  if (existingIdx >= 0) {
    records[existingIdx] = updatedRecord;
  } else {
    records.push(updatedRecord);
  }

  setLocalFastingRecords(records);

  if (userId) {
    try {
      await supabase.from('fasting_records').upsert({
        user_id: userId,
        fasting_date: dateStr,
        hijri_date: updatedRecord.hijri_date,
        fasting_type: updatedRecord.fasting_type,
        status: updatedRecord.status,
        notes: updatedRecord.notes
      }, { onConflict: 'user_id,fasting_date' });
    } catch (err) {
      console.warn('Failed to upsert fasting record to Supabase:', err);
    }
  }

  return records;
}

// Calculate private statistics
export function calculateFastingStats(records: FastingRecord[], currentHijriMonth = '', currentHijriYear = ''): FastingStats {
  const completed = records.filter(r => r.status === 'completed');

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentYearStr = `${now.getFullYear()}`;

  const thisMonthCount = completed.filter(r => {
    if (currentHijriMonth && r.hijri_date) {
      return r.hijri_date.includes(currentHijriMonth);
    }
    return r.fasting_date.startsWith(currentMonthStr);
  }).length;

  const thisYearCount = completed.filter(r => {
    if (currentHijriYear && r.hijri_date) {
      return r.hijri_date.includes(currentHijriYear);
    }
    return r.fasting_date.startsWith(currentYearStr);
  }).length;

  const ramadanCompleted = completed.filter(r =>
    r.fasting_type === 'صيام رمضان' || (r.hijri_date && r.hijri_date.includes('رمضان'))
  ).length;

  const voluntariesCompleted = completed.filter(r =>
    r.fasting_type !== 'صيام رمضان' && r.fasting_type !== 'صيام قضاء'
  ).length;

  return {
    thisMonthCount,
    thisYearCount,
    totalCompleted: completed.length,
    ramadanCompleted,
    ramadanTotal: 30,
    voluntariesCompleted
  };
}

// Check voluntary fasting recommendation for a Gregorian date & day of week
export function getRecommendedFastingType(date: Date, hijriDay?: number, hijriMonthName?: string): string | null {
  const dayOfWeek = date.getDay(); // 0 = Sun, 1 = Mon, 4 = Thu

  if (hijriMonthName === 'رمضان') {
    return 'صيام رمضان';
  }

  if (hijriMonthName === 'ذو الحجة' && hijriDay === 9) {
    return 'صيام يوم عرفة';
  }

  if (hijriMonthName === 'المحرم' && (hijriDay === 9 || hijriDay === 10)) {
    return 'صيام عاشوراء وتاسوعاء';
  }

  if (hijriDay && [13, 14, 15].includes(hijriDay)) {
    return 'صيام أيام البيض';
  }

  if (dayOfWeek === 1) {
    return 'صيام الاثنين';
  }

  if (dayOfWeek === 4) {
    return 'صيام الخميس';
  }

  if (hijriMonthName === 'شوال' && hijriDay && hijriDay > 1 && hijriDay <= 30) {
    return 'صيام الست من شوال';
  }

  return null;
}
