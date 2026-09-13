-- 003_create_bookmarks.sql
CREATE TABLE IF NOT EXISTS quran_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  surah_number INT NOT NULL,
  surah_name_ar VARCHAR(100) NOT NULL,
  ayah_number INT NOT NULL,
  page_number INT DEFAULT 1,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE quran_bookmarks ADD COLUMN IF NOT EXISTS page_number INT DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_quran_bookmarks_user ON quran_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_quran_bookmarks_surah_ayah ON quran_bookmarks(user_id, surah_number, ayah_number);
