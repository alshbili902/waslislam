-- 005_create_daily_wird.sql
CREATE TABLE IF NOT EXISTS user_daily_wird (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wird_date DATE NOT NULL DEFAULT CURRENT_DATE,
  quran_completed BOOLEAN DEFAULT FALSE,
  quran_pages_read INT DEFAULT 0,
  morning_azkar_completed BOOLEAN DEFAULT FALSE,
  evening_azkar_completed BOOLEAN DEFAULT FALSE,
  hadith_read BOOLEAN DEFAULT FALSE,
  dua_read BOOLEAN DEFAULT FALSE,
  tasbeeh_completed BOOLEAN DEFAULT FALSE,
  tasbeeh_count INT DEFAULT 0,
  completion_percentage INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, wird_date)
);

CREATE INDEX IF NOT EXISTS idx_user_daily_wird_user_date ON user_daily_wird(user_id, wird_date DESC);
