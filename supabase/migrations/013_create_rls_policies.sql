-- 013_create_rls_policies.sql
-- Enable Row Level Security on all private user tables

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quran_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quran_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_wird ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_azkar_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasbeeh_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_radio_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_radio_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

-- 1. Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Quran Progress
DROP POLICY IF EXISTS "Users can view own quran_progress" ON quran_progress;
DROP POLICY IF EXISTS "Users can update own quran_progress" ON quran_progress;
DROP POLICY IF EXISTS "Users can insert own quran_progress" ON quran_progress;
CREATE POLICY "Users can view own quran_progress" ON quran_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own quran_progress" ON quran_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quran_progress" ON quran_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Bookmarks
DROP POLICY IF EXISTS "Users can view own bookmarks" ON quran_bookmarks;
DROP POLICY IF EXISTS "Users can insert own bookmarks" ON quran_bookmarks;
DROP POLICY IF EXISTS "Users can update own bookmarks" ON quran_bookmarks;
DROP POLICY IF EXISTS "Users can delete own bookmarks" ON quran_bookmarks;
CREATE POLICY "Users can view own bookmarks" ON quran_bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bookmarks" ON quran_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bookmarks" ON quran_bookmarks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookmarks" ON quran_bookmarks FOR DELETE USING (auth.uid() = user_id);

-- 4. Favorites
DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can update own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON favorites;
CREATE POLICY "Users can view own favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own favorites" ON favorites FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON favorites FOR DELETE USING (auth.uid() = user_id);

-- 5. Daily Wird
DROP POLICY IF EXISTS "Users can view own daily_wird" ON user_daily_wird;
DROP POLICY IF EXISTS "Users can insert own daily_wird" ON user_daily_wird;
DROP POLICY IF EXISTS "Users can update own daily_wird" ON user_daily_wird;
CREATE POLICY "Users can view own daily_wird" ON user_daily_wird FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily_wird" ON user_daily_wird FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own daily_wird" ON user_daily_wird FOR UPDATE USING (auth.uid() = user_id);

-- 6. Azkar Progress
DROP POLICY IF EXISTS "Users can view own azkar_progress" ON user_azkar_progress;
DROP POLICY IF EXISTS "Users can insert own azkar_progress" ON user_azkar_progress;
DROP POLICY IF EXISTS "Users can update own azkar_progress" ON user_azkar_progress;
CREATE POLICY "Users can view own azkar_progress" ON user_azkar_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own azkar_progress" ON user_azkar_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own azkar_progress" ON user_azkar_progress FOR UPDATE USING (auth.uid() = user_id);

-- 7. Activity
DROP POLICY IF EXISTS "Users can view own activity" ON user_activity;
DROP POLICY IF EXISTS "Users can insert own activity" ON user_activity;
CREATE POLICY "Users can view own activity" ON user_activity FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activity" ON user_activity FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8. Tasbeeh Sessions
DROP POLICY IF EXISTS "Users can view own tasbeeh" ON tasbeeh_sessions;
DROP POLICY IF EXISTS "Users can insert own tasbeeh" ON tasbeeh_sessions;
CREATE POLICY "Users can view own tasbeeh" ON tasbeeh_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasbeeh" ON tasbeeh_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 9. Radio History & Favorites
DROP POLICY IF EXISTS "Users can view own radio_history" ON user_radio_history;
DROP POLICY IF EXISTS "Users can insert own radio_history" ON user_radio_history;
CREATE POLICY "Users can view own radio_history" ON user_radio_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own radio_history" ON user_radio_history FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own radio_favorites" ON user_radio_favorites;
DROP POLICY IF EXISTS "Users can insert own radio_favorites" ON user_radio_favorites;
DROP POLICY IF EXISTS "Users can delete own radio_favorites" ON user_radio_favorites;
CREATE POLICY "Users can view own radio_favorites" ON user_radio_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own radio_favorites" ON user_radio_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own radio_favorites" ON user_radio_favorites FOR DELETE USING (auth.uid() = user_id);

-- 10. Notifications & Preferences
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON notifications FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own notification_preferences" ON notification_preferences;
DROP POLICY IF EXISTS "Users can update own notification_preferences" ON notification_preferences;
DROP POLICY IF EXISTS "Users can insert own notification_preferences" ON notification_preferences;
CREATE POLICY "Users can view own notification_preferences" ON notification_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notification_preferences" ON notification_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notification_preferences" ON notification_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 11. User Settings
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 12. Streaks
DROP POLICY IF EXISTS "Users can view own streaks" ON streaks;
DROP POLICY IF EXISTS "Users can update own streaks" ON streaks;
DROP POLICY IF EXISTS "Users can insert own streaks" ON streaks;
CREATE POLICY "Users can view own streaks" ON streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own streaks" ON streaks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own streaks" ON streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
