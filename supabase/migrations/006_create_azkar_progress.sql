-- 006_create_azkar_progress.sql
CREATE TABLE IF NOT EXISTS user_azkar_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_slug VARCHAR(100) NOT NULL, -- 'morning', 'evening', 'after_prayer', 'sleep'
  progress_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_count INT DEFAULT 0,
  total_count INT DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, category_slug, progress_date)
);

CREATE INDEX IF NOT EXISTS idx_azkar_progress_user_date ON user_azkar_progress(user_id, progress_date DESC);
