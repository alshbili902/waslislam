-- 004_create_favorites.sql
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type VARCHAR(50) NOT NULL, -- 'ayah', 'hadith', 'azkar', 'dua', 'fatwa', 'article'
  item_id VARCHAR(100) NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  preview_text TEXT,
  source_reference VARCHAR(255),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, item_type, item_id)
);

ALTER TABLE favorites ADD COLUMN IF NOT EXISTS subtitle TEXT;
ALTER TABLE favorites ADD COLUMN IF NOT EXISTS preview_text TEXT;
ALTER TABLE favorites ADD COLUMN IF NOT EXISTS source_reference VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_favorites_user_type ON favorites(user_id, item_type);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(user_id, created_at DESC);
