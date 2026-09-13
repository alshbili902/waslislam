export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  resource: string;
  resourceId?: string;
  status: 'success' | 'failed' | 'warning';
  details?: string;
  ip?: string;
}

export interface AdminSectionItem {
  id: string;
  name: string;
  type: string; // 'dhikr' | 'hadith' | 'dua' | 'quran' | 'fatwa' | 'article'
  order: number;
  isActive: boolean;
  itemCount: number;
}

export interface AdminContentItem {
  id: string;
  sectionId: string;
  sectionName: string;
  contentType: string; // 'ذكر' | 'حديث' | 'دعاء' | 'آية' | 'فتوى' | 'مقال'
  title?: string;
  text: string;
  source: string;
  narrator?: string;
  status: 'published' | 'draft' | 'needs_review' | 'rejected';
  verification: 'verified' | 'needs_review' | 'rejected';
  createdAt: string;
  updatedAt: string;
}
