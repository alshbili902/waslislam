/**
 * Smart Islamic Reminders & Notifications Engine for Wasl Islamic.
 * Handles permission flows, categories (Prayers, Adhkar, Quran, Fasting),
 * quiet hours, and safe notifications scheduling.
 */

import { localStore } from '../lib/supabase';

export interface ReminderCategoryConfig {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  isEnabled: boolean;
  scheduledTime?: string; // HH:MM format
}

export interface ReminderPreferences {
  isGlobalEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // HH:MM
  quietHoursEnd: string; // HH:MM
  categories: Record<string, ReminderCategoryConfig>;
}

export const DEFAULT_REMINDER_PREFERENCES: ReminderPreferences = {
  isGlobalEnabled: false,
  quietHoursEnabled: true,
  quietHoursStart: '23:00',
  quietHoursEnd: '04:30',
  categories: {
    prayer: {
      id: 'prayer',
      nameAr: 'تنبيهات دخول أوقات الصلاة',
      nameEn: 'Prayer Times Notifications',
      descriptionAr: 'تنبيه فوري عند دخول وقت كل صلاة مفروضة بحسب مدينتك.',
      isEnabled: true,
    },
    morning_adhkar: {
      id: 'morning_adhkar',
      nameAr: 'أذكار الصباح',
      nameEn: 'Morning Adhkar Reminder',
      descriptionAr: 'تذكير يومي مبارك بعد صلاة الفجر وشروق الشمس.',
      isEnabled: true,
      scheduledTime: '06:30',
    },
    evening_adhkar: {
      id: 'evening_adhkar',
      nameAr: 'أذكار المساء',
      nameEn: 'Evening Adhkar Reminder',
      descriptionAr: 'تذكير يومي بعد صلاة العصر لحفظ النفس والسكينة.',
      isEnabled: true,
      scheduledTime: '17:00',
    },
    quran_goal: {
      id: 'quran_goal',
      nameAr: 'الورد القرآني اليومي',
      nameEn: 'Daily Quran Goal Reminder',
      descriptionAr: 'تذكير لقراءة صفحتين أو أكثر لإتمام خطة الختمة.',
      isEnabled: true,
      scheduledTime: '20:30',
    },
    fasting_reminders: {
      id: 'fasting_reminders',
      nameAr: 'صيام الإثنين والخميس والأيام البيض',
      nameEn: 'Voluntary Fasting Reminders',
      descriptionAr: 'تنبيه في المساء يذكر بسنة صيام الغد واغتنام الأجر.',
      isEnabled: true,
      scheduledTime: '21:00',
    },
    night_prayer: {
      id: 'night_prayer',
      nameAr: 'صلاة الوتر وقيام الليل',
      nameEn: 'Witr & Tahajjud Reminder',
      descriptionAr: 'تذكير قبل النوم أو في الثلث الأخير بركعة الوتر.',
      isEnabled: false,
      scheduledTime: '22:30',
    },
  },
};

export function getReminderPreferences(): ReminderPreferences {
  return localStore.get<ReminderPreferences>('user_reminders_prefs', DEFAULT_REMINDER_PREFERENCES);
}

export function saveReminderPreferences(prefs: ReminderPreferences): void {
  localStore.set('user_reminders_prefs', prefs);
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const prefs = getReminderPreferences();
      saveReminderPreferences({ ...prefs, isGlobalEnabled: true });
    }
    return permission;
  } catch (err) {
    console.warn('Notification permission error:', err);
    return 'denied';
  }
}

export function sendLocalNotification(title: string, body: string): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const prefs = getReminderPreferences();
  if (!prefs.isGlobalEnabled) return;

  // Check quiet hours
  if (prefs.quietHoursEnabled) {
    const now = new Date();
    const currentH = now.getHours();
    const currentM = now.getMinutes();
    const [startH, startM] = prefs.quietHoursStart.split(':').map(Number);
    const [endH, endM] = prefs.quietHoursEnd.split(':').map(Number);

    const currentTimeMin = currentH * 60 + currentM;
    const startTimeMin = startH * 60 + startM;
    const endTimeMin = endH * 60 + endM;

    const inQuietHours = startTimeMin > endTimeMin
      ? (currentTimeMin >= startTimeMin || currentTimeMin <= endTimeMin)
      : (currentTimeMin >= startTimeMin && currentTimeMin <= endTimeMin);

    if (inQuietHours) return;
  }

  try {
    new Notification(title, {
      body,
      icon: '/assets/branding/wasl-logo.png',
      badge: '/favicon-32x32.png',
      dir: 'rtl',
      lang: 'ar',
    });
  } catch (err) {
    console.warn('Notification error:', err);
  }
}
