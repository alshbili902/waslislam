-- Migration 015: Create donation_platforms and binbaz_links tables

-- 1. Table: donation_platforms
CREATE TABLE IF NOT EXISTS public.donation_platforms (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  url VARCHAR(500) NOT NULL,
  official_entity VARCHAR(255) NOT NULL,
  supervising_entity VARCHAR(255) NOT NULL,
  logo_url VARCHAR(500),
  categories TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  verified BOOLEAN DEFAULT true,
  status VARCHAR(32) DEFAULT 'verified',
  sort_order INT DEFAULT 0,
  verification_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table: binbaz_links
CREATE TABLE IF NOT EXISTS public.binbaz_links (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  url VARCHAR(500) NOT NULL,
  category VARCHAR(64) NOT NULL,
  category_label_ar VARCHAR(100) DEFAULT 'قسم رسمي',
  verified BOOLEAN DEFAULT true,
  status VARCHAR(32) DEFAULT 'verified',
  sort_order INT DEFAULT 0,
  highlight BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.donation_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.binbaz_links ENABLE ROW LEVEL SECURITY;

-- Public read policies: Anyone can read verified + active records
CREATE POLICY "Public read verified donation platforms"
  ON public.donation_platforms
  FOR SELECT
  USING (status = 'verified');

CREATE POLICY "Public read verified binbaz links"
  ON public.binbaz_links
  FOR SELECT
  USING (status = 'verified');

-- Admin write policies: Service role or authorized admin
CREATE POLICY "Admins full access donation platforms"
  ON public.donation_platforms
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins full access binbaz links"
  ON public.binbaz_links
  FOR ALL
  USING (true)
  WITH CHECK (true);
