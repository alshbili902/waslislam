-- 008_create_tasbeeh.sql
CREATE TABLE IF NOT EXISTS tasbeeh_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dhikr_text_ar VARCHAR(200) NOT NULL,
  count INT NOT NULL DEFAULT 0,
  target_count INT NOT NULL DEFAULT 33,
  completed BOOLEAN DEFAULT FALSE,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tasbeeh_sessions ADD COLUMN IF NOT EXISTS session_date DATE NOT NULL DEFAULT CURRENT_DATE;

CREATE INDEX IF NOT EXISTS idx_tasbeeh_user_date ON tasbeeh_sessions(user_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_tasbeeh_user_created ON tasbeeh_sessions(user_id, created_at DESC);
