export type BinBazLinkCategory = 'general' | 'fatwas' | 'nur' | 'books' | 'audios' | 'articles';

export type BinBazLinkStatus = 'verified' | 'draft' | 'inactive';

export interface BinBazLinkItem {
  id: string;
  title: string;
  description: string;
  url: string; // Must strictly belong to binbaz.org.sa
  category: BinBazLinkCategory;
  categoryLabelAr: string;
  verified: boolean;
  status: BinBazLinkStatus;
  sortOrder: number;
  highlight?: boolean;
  createdAt: string;
  updatedAt: string;
}
