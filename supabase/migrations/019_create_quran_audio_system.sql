-- ============================================================
-- Migration: 019_create_quran_audio_system.sql
-- Description: Creates verified schema for:
-- 1. Quran reciters directory (quran_reciters)
-- 2. User playback position persistence (quran_playback_state)
-- 3. Quran listening history (quran_audio_history)
-- 4. Quran favorites for reciters & surahs (quran_audio_favorites)
-- ============================================================

-- 1. Quran Reciters Table
CREATE TABLE IF NOT EXISTS quran_reciters (
    id TEXT PRIMARY KEY,
    numeric_id INT UNIQUE NOT NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT,
    letter TEXT,
    riwayah TEXT NOT NULL DEFAULT 'حفص عن عاصم',
    bio_ar TEXT,
    moshaf_list JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_surahs INT NOT NULL DEFAULT 114,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    verification_status TEXT NOT NULL DEFAULT 'verified',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quran_reciters_featured ON quran_reciters(is_featured);
CREATE INDEX IF NOT EXISTS idx_quran_reciters_active ON quran_reciters(is_active);

-- 2. User Quran Playback State (for cross-device resume position)
CREATE TABLE IF NOT EXISTS quran_playback_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    surah_number INT NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
    reciter_id TEXT NOT NULL,
    moshaf_id INT DEFAULT 1,
    position_seconds NUMERIC NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, surah_number, reciter_id)
);

CREATE INDEX IF NOT EXISTS idx_quran_playback_user ON quran_playback_state(user_id);
CREATE INDEX IF NOT EXISTS idx_quran_playback_updated ON quran_playback_state(user_id, updated_at DESC);

-- 3. Quran Audio History
CREATE TABLE IF NOT EXISTS quran_audio_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    surah_number INT NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
    reciter_id TEXT NOT NULL,
    position_seconds NUMERIC DEFAULT 0,
    duration_seconds NUMERIC DEFAULT 0,
    played_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quran_history_user ON quran_audio_history(user_id, played_at DESC);

-- 4. Quran Audio Favorites
CREATE TABLE IF NOT EXISTS quran_audio_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    favorite_id TEXT NOT NULL, -- e.g. "reciter:alafasy" or "recitation:alafasy:36"
    item_type TEXT NOT NULL,   -- 'reciter', 'surah', 'recitation'
    target_id TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    subtitle_ar TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, favorite_id)
);

CREATE INDEX IF NOT EXISTS idx_quran_favorites_user ON quran_audio_favorites(user_id);

-- ============================================================
-- Row Level Security (RLS) Policies
-- ============================================================

ALTER TABLE quran_reciters ENABLE ROW LEVEL SECURITY;
ALTER TABLE quran_playback_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE quran_audio_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE quran_audio_favorites ENABLE ROW LEVEL SECURITY;

-- Reciters: Public can view active verified reciters
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view active reciters') THEN
        CREATE POLICY "Public can view active reciters" ON quran_reciters FOR SELECT USING (is_active = true);
    END IF;
END $$;

-- Playback State: Users manage only their own state
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own playback state') THEN
        CREATE POLICY "Users can view own playback state" ON quran_playback_state FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own playback state') THEN
        CREATE POLICY "Users can manage own playback state" ON quran_playback_state FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- History: Users manage only their own listening history
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own quran history') THEN
        CREATE POLICY "Users can view own quran history" ON quran_audio_history FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own quran history') THEN
        CREATE POLICY "Users can insert own quran history" ON quran_audio_history FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own quran history') THEN
        CREATE POLICY "Users can delete own quran history" ON quran_audio_history FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Favorites: Users manage only their own favorites
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own quran favorites') THEN
        CREATE POLICY "Users can view own quran favorites" ON quran_audio_favorites FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own quran favorites') THEN
        CREATE POLICY "Users can manage own quran favorites" ON quran_audio_favorites FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;
