-- 010_create_notifications.sql
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title_ar VARCHAR(200) NOT NULL,
  message_ar TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'general', -- 'prayer', 'azkar', 'daily_ayah', 'event', 'general'
  is_read BOOLEAN DEFAULT FALSE,
  action_url VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_url VARCHAR(255);

CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  fajr_prayer BOOLEAN DEFAULT TRUE,
  dhuhr_prayer BOOLEAN DEFAULT TRUE,
  asr_prayer BOOLEAN DEFAULT TRUE,
  maghrib_prayer BOOLEAN DEFAULT TRUE,
  isha_prayer BOOLEAN DEFAULT TRUE,
  morning_azkar BOOLEAN DEFAULT TRUE,
  evening_azkar BOOLEAN DEFAULT TRUE,
  daily_hadith BOOLEAN DEFAULT TRUE,
  daily_verse BOOLEAN DEFAULT TRUE,
  islamic_occasions BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read, created_at DESC);
