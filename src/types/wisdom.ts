/**
 * Types and interfaces for the "Islamic Wisdom & Reflections" (الحِكَم والمواعظ) feature.
 * Strictly adheres to verified Islamic sources, attribution, and verification workflows.
 */

export type WisdomContentType =
  | 'ayah'           // آية قرآنية
  | 'hadith'          // حديث
  | 'scholar_quote'   // قول عالم
  | 'sahaba_quote'    // قول صحابي
  | 'sermon'          // موعظة
  | 'wisdom'          // حكمة
  | 'reminder'        // تذكير
  | 'faith_benefit';  // فائدة إيمانية

export const WISDOM_CONTENT_TYPE_LABELS: Record<WisdomContentType, string> = {
  ayah: 'آية قرآنية',
  hadith: 'حديث',
  scholar_quote: 'قول عالم',
  sahaba_quote: 'قول صحابي',
  sermon: 'موعظة',
  wisdom: 'حكمة',
  reminder: 'تذكير',
  faith_benefit: 'فائدة إيمانية',
};

export type WisdomCategory =
  | 'الصبر'
  | 'التوبة'
  | 'التوكل'
  | 'الإخلاص'
  | 'الرضا'
  | 'الشكر'
  | 'الاستغفار'
  | 'حسن الخلق'
  | 'بر الوالدين'
  | 'الصدق'
  | 'طلب العلم'
  | 'الدنيا والآخرة'
  | 'الأمل'
  | 'الرحمة'
  | 'العفو'
  | 'التقوى';

export const ALL_WISDOM_CATEGORIES: WisdomCategory[] = [
  'الصبر',
  'التوبة',
  'التوكل',
  'الإخلاص',
  'الرضا',
  'الشكر',
  'الاستغفار',
  'حسن الخلق',
  'بر الوالدين',
  'الصدق',
  'طلب العلم',
  'الدنيا والآخرة',
  'الأمل',
  'الرحمة',
  'العفو',
  'التقوى',
];

export type WisdomVerificationStatus =
  | 'draft'          // مسودة
  | 'needs_review'   // قيد المراجعة
  | 'verified'       // موثّق
  | 'rejected';      // مرفوض

export const WISDOM_STATUS_LABELS: Record<WisdomVerificationStatus, string> = {
  draft: 'مسودة',
  needs_review: 'قيد المراجعة',
  verified: 'موثّق',
  rejected: 'مرفوض',
};

export interface IslamicWisdom {
  id: string;
  content: string; // نص الحكمة أو الموعظة
  contentType: WisdomContentType;
  contentTypeLabelAr?: string;
  author?: string; // القائل أو الراوي إن وجد
  source: string; // المصدر الأساسي (مثل: صحيح البخاري، الزهد، حلية الأولياء)
  reference?: string; // المرجع الدقيق (رقم الحديث أو الجزء والصفحة)
  hadithGrade?: string; // درجة الحديث إن كان حديثاً
  category: WisdomCategory;
  verificationStatus: WisdomVerificationStatus;
  isFeatured?: boolean;
  isDaily?: boolean;
  scheduledDate?: string; // YYYY-MM-DD
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WisdomFilterOptions {
  category?: WisdomCategory | 'الكل';
  contentType?: WisdomContentType | 'all';
  searchQuery?: string;
  verificationStatus?: WisdomVerificationStatus | 'all';
  page?: number;
  pageSize?: number;
}
