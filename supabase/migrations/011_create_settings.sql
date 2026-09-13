-- 011_create_settings.sql
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  theme VARCHAR(20) DEFAULT 'system',
  preferred_reciter VARCHAR(100) DEFAULT 'ar.alafasy',
  prayer_calculation_method VARCHAR(50) DEFAULT 'UmmAlQura',
  quran_font_size VARCHAR(20) DEFAULT 'medium',
  mushaf_type VARCHAR(50) DEFAULT 'hafs',
  audio_bitrate VARCHAR(20) DEFAULT '128kbps',
  auto_play_audio BOOLEAN DEFAULT TRUE,
  privacy_profile_public BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_settings_user ON user_settings(user_id);
