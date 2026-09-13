export type DonationPlatformStatus = 'verified' | 'pending_review' | 'rejected' | 'inactive';

export interface DonationPlatform {
  id: string;
  name: string;
  description: string;
  url: string;
  officialEntity: string; // الجهة المالكة أو التابعة لها
  supervisingEntity: string; // الجهة الحكومية المشرفة
  logoUrl?: string;
  categories: string[]; // ['تبرع عام', 'زكاة', 'وقف', 'مساجد', ...]
  features: string[]; // الخدمات المتوفرة في المنصة
  verified: boolean;
  status: DonationPlatformStatus;
  sortOrder: number;
  verificationDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DonationCategory {
  id: string;
  nameAr: string;
  slug: string;
  descriptionAr?: string;
}
