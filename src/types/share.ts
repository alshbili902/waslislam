export type ShareContentType = 'hadith' | 'dhikr' | 'dua' | 'quran' | 'article' | 'fatwa' | 'wisdom' | 'allah_name' | 'seerah' | 'hajj_umrah' | 'library';

export interface ShareItemData {
  sectionName?: string; // e.g. "أذكار الصباح", "القرآن الكريم", "الأحاديث النبوية"
  contentType?: string; // e.g. "ذكر", "آية", "حديث", "دعاء", "فتوى", "مقال"
  content?: string;     // verified text
  text?: string;        // verified text (compatible with either text or content)
  subtext?: string;     // contextual or location/meaning text
  type?: ShareContentType;
  source?: string;
  reference?: string;
  sourceUrl?: string;
  hijriDate?: string;
  ramadanCountdown?: string;
  title?: string;
  surahName?: string;
  ayahNumber?: number;
  narrator?: string;
  url?: string;
}

/**
 * Fixed original template dimensions
 * 1364 x 2048 px (exact 2x Retina resolution of 682 x 1024 px, 2:3 aspect ratio)
 * Unchangeable and strictly uniform across the entire platform
 */
export const SHARE_TEMPLATE_WIDTH = 1364;
export const SHARE_TEMPLATE_HEIGHT = 2048;
export const SHARE_TEMPLATE_RATIO = '2 / 3';
export const SHARE_TEMPLATE_ASPECT = 1364 / 2048;

export interface ShareSystemConfig {
  enabled: boolean;
  supportedTypes: ShareContentType[];
  primaryFont: 'Amiri' | 'Tajawal' | 'Scheherazade New';
  maxChars: number;
  platformUrl: string;
}

export const DEFAULT_SHARE_CONFIG: ShareSystemConfig = {
  enabled: true,
  supportedTypes: ['hadith', 'dhikr', 'dua', 'quran', 'article', 'fatwa', 'wisdom', 'allah_name', 'seerah', 'hajj_umrah', 'library'],
  primaryFont: 'Amiri',
  maxChars: 450,
  platformUrl: 'https://waslislam.fun'
};
