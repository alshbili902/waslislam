-- 002_create_quran_progress.sql
CREATE TABLE IF NOT EXISTS quran_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  last_surah_number INT NOT NULL DEFAULT 1,
  last_ayah_number INT NOT NULL DEFAULT 1,
  last_page_number INT NOT NULL DEFAULT 1,
  total_verses_read INT DEFAULT 0,
  completed_khatmahs INT DEFAULT 0,
  reading_streak_days INT DEFAULT 1,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE quran_progress ADD COLUMN IF NOT EXISTS last_page_number INT DEFAULT 1;
ALTER TABLE quran_progress ADD COLUMN IF NOT EXISTS reading_streak_days INT DEFAULT 1;
ALTER TABLE quran_progress ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_quran_progress_user ON quran_progress(user_id);
