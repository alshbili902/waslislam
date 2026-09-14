-- ============================================================
-- Migration: 018_create_platform_upgrades.sql
-- Description: Creates tables for:
-- 1. Fasting records (صيامي)
-- 2. 99 Names of Allah (أسماء الله الحسنى)
-- 3. Prophetic Biography events (السيرة النبوية ﷺ)
-- 4. Hajj & Umrah sections (الحج والعمرة)
-- 5. Islamic Library books & reading progress (المكتبة الإسلامية)
-- 6. Discover curated items (اكتشف)
-- ============================================================

-- 1. Fasting Records Table
CREATE TABLE IF NOT EXISTS fasting_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    hijri_year INT NOT NULL,
    hijri_month INT NOT NULL,
    hijri_day INT NOT NULL,
    gregorian_date DATE NOT NULL,
    fasting_type TEXT NOT NULL DEFAULT 'voluntary',
    status TEXT NOT NULL DEFAULT 'completed', -- 'completed', 'planned', 'missed'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, gregorian_date)
);

CREATE INDEX IF NOT EXISTS idx_fasting_user_date ON fasting_records(user_id, gregorian_date);
CREATE INDEX IF NOT EXISTS idx_fasting_user_hijri ON fasting_records(user_id, hijri_year, hijri_month);

-- 2. Names of Allah Table
CREATE TABLE IF NOT EXISTS allah_names (
    id TEXT PRIMARY KEY,
    number INT UNIQUE NOT NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT,
    meaning_ar TEXT NOT NULL,
    explanation_ar TEXT,
    evidence_ar TEXT,
    source TEXT NOT NULL,
    reference TEXT,
    category TEXT,
    verification_status TEXT NOT NULL DEFAULT 'verified',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_allah_names_number ON allah_names(number);
CREATE INDEX IF NOT EXISTS idx_allah_names_status ON allah_names(verification_status);

-- 3. Prophetic Biography Events Table
CREATE TABLE IF NOT EXISTS seerah_events (
    id TEXT PRIMARY KEY,
    era TEXT NOT NULL,
    title TEXT NOT NULL,
    hijri_year TEXT,
    gregorian_year TEXT,
    location TEXT,
    order_index INT NOT NULL DEFAULT 0,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    evidence TEXT,
    source TEXT NOT NULL,
    reference TEXT,
    verification_status TEXT NOT NULL DEFAULT 'verified',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_seerah_era_order ON seerah_events(era, order_index);
CREATE INDEX IF NOT EXISTS idx_seerah_status ON seerah_events(verification_status);

-- 4. Hajj & Umrah Sections Table
CREATE TABLE IF NOT EXISTS hajj_umrah_sections (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL, -- 'umrah', 'hajj', 'miqat', 'manasik', 'ruling', 'dua'
    title TEXT NOT NULL,
    step_number INT,
    description TEXT NOT NULL,
    evidence TEXT,
    ruling TEXT,
    notes TEXT,
    checklist_item TEXT,
    coordinates JSONB,
    source TEXT NOT NULL,
    reference TEXT,
    verification_status TEXT NOT NULL DEFAULT 'verified',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hajj_umrah_type ON hajj_umrah_sections(type, step_number);
CREATE INDEX IF NOT EXISTS idx_hajj_umrah_status ON hajj_umrah_sections(verification_status);

-- 5. Islamic Library Books Table
CREATE TABLE IF NOT EXISTS library_books (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    category TEXT NOT NULL,
    cover_url TEXT,
    description TEXT NOT NULL,
    publisher TEXT,
    edition TEXT,
    license TEXT NOT NULL DEFAULT 'Public Domain (ملك عام)',
    copyright_status TEXT NOT NULL DEFAULT 'free_to_distribute',
    chapters JSONB NOT NULL DEFAULT '[]'::jsonb,
    source TEXT NOT NULL,
    verification_status TEXT NOT NULL DEFAULT 'verified',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_library_books_cat ON library_books(category);
CREATE INDEX IF NOT EXISTS idx_library_books_status ON library_books(verification_status);

-- Library Reading Progress Table
CREATE TABLE IF NOT EXISTS library_book_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id TEXT NOT NULL REFERENCES library_books(id) ON DELETE CASCADE,
    chapter_id TEXT,
    scroll_position NUMERIC DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    last_read_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, book_id)
);

CREATE INDEX IF NOT EXISTS idx_library_progress_user ON library_book_progress(user_id);

-- 6. Discover Items Table
CREATE TABLE IF NOT EXISTS discover_items (
    id TEXT PRIMARY KEY,
    day_of_year INT,
    scheduled_date DATE,
    ayah_data JSONB,
    hadith_data JSONB,
    dhikr_data JSONB,
    dua_data JSONB,
    wisdom_data JSONB,
    allah_name_data JSONB,
    seerah_data JSONB,
    prophet_story_data JSONB,
    feature_highlight JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_discover_day ON discover_items(day_of_year);
CREATE INDEX IF NOT EXISTS idx_discover_date ON discover_items(scheduled_date);

-- ============================================================
-- Row Level Security (RLS) Policies
-- ============================================================

ALTER TABLE fasting_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE allah_names ENABLE ROW LEVEL SECURITY;
ALTER TABLE seerah_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE hajj_umrah_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_book_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE discover_items ENABLE ROW LEVEL SECURITY;

-- Fasting Records: Users manage only their own records
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own fasting records') THEN
        CREATE POLICY "Users can view own fasting records" ON fasting_records FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own fasting records') THEN
        CREATE POLICY "Users can insert own fasting records" ON fasting_records FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own fasting records') THEN
        CREATE POLICY "Users can update own fasting records" ON fasting_records FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own fasting records') THEN
        CREATE POLICY "Users can delete own fasting records" ON fasting_records FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Public Religious Content: Read-only for verified items
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view verified allah names') THEN
        CREATE POLICY "Public can view verified allah names" ON allah_names FOR SELECT USING (verification_status = 'verified');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view verified seerah events') THEN
        CREATE POLICY "Public can view verified seerah events" ON seerah_events FOR SELECT USING (verification_status = 'verified');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view verified hajj umrah') THEN
        CREATE POLICY "Public can view verified hajj umrah" ON hajj_umrah_sections FOR SELECT USING (verification_status = 'verified');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view verified library books') THEN
        CREATE POLICY "Public can view verified library books" ON library_books FOR SELECT USING (verification_status = 'verified');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view active discover items') THEN
        CREATE POLICY "Public can view active discover items" ON discover_items FOR SELECT USING (is_active = true);
    END IF;
END $$;

-- Library Progress: Users manage their own reading progress
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own library progress') THEN
        CREATE POLICY "Users can view own library progress" ON library_book_progress FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own library progress') THEN
        CREATE POLICY "Users can manage own library progress" ON library_book_progress FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;
