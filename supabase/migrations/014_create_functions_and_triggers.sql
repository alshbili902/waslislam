-- 014_create_functions_and_triggers.sql

-- 1. Function to maintain updated_at column
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_quran_progress_updated_at ON quran_progress;
CREATE TRIGGER trg_quran_progress_updated_at BEFORE UPDATE ON quran_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_user_daily_wird_updated_at ON user_daily_wird;
CREATE TRIGGER trg_user_daily_wird_updated_at BEFORE UPDATE ON user_daily_wird
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_user_azkar_progress_updated_at ON user_azkar_progress;
CREATE TRIGGER trg_user_azkar_progress_updated_at BEFORE UPDATE ON user_azkar_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_user_settings_updated_at ON user_settings;
CREATE TRIGGER trg_user_settings_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_streaks_updated_at ON streaks;
CREATE TRIGGER trg_streaks_updated_at BEFORE UPDATE ON streaks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- 2. Function to calculate Daily Wird percentage automatically
CREATE OR REPLACE FUNCTION public.calculate_daily_wird_percentage()
RETURNS TRIGGER AS $$
DECLARE
  pct INT := 0;
BEGIN
  IF NEW.quran_completed = TRUE THEN
    pct := pct + 20;
  END IF;
  IF NEW.morning_azkar_completed = TRUE THEN
    pct := pct + 20;
  END IF;
  IF NEW.evening_azkar_completed = TRUE THEN
    pct := pct + 20;
  END IF;
  IF NEW.hadith_read = TRUE THEN
    pct := pct + 15;
  END IF;
  IF NEW.dua_read = TRUE THEN
    pct := pct + 15;
  END IF;
  IF NEW.tasbeeh_completed = TRUE OR NEW.tasbeeh_count >= 33 THEN
    pct := pct + 10;
  END IF;

  NEW.completion_percentage := pct;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calculate_wird_pct ON user_daily_wird;
CREATE TRIGGER trg_calculate_wird_pct
  BEFORE INSERT OR UPDATE ON user_daily_wird
  FOR EACH ROW EXECUTE FUNCTION public.calculate_daily_wird_percentage();


-- 3. Trigger Function on auth.users to create Profile and User Defaults automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_full_name TEXT;
  v_avatar TEXT;
  v_city TEXT;
  v_country TEXT;
BEGIN
  v_full_name := NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), '');
  v_avatar := NULLIF(TRIM(NEW.raw_user_meta_data->>'avatar_url'), '');
  v_city := NULLIF(TRIM(NEW.raw_user_meta_data->>'city'), '');
  v_country := NULLIF(TRIM(NEW.raw_user_meta_data->>'country'), '');

  -- Profile: Only real user metadata, no fake defaults
  INSERT INTO public.profiles (id, email, full_name, avatar_url, city, country)
  VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    v_avatar,
    v_city,
    v_country
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    city = COALESCE(EXCLUDED.city, profiles.city),
    country = COALESCE(EXCLUDED.country, profiles.country);

  -- Streaks: Start strictly from real zero
  INSERT INTO public.streaks (user_id, current_streak, longest_streak, last_activity_date)
  VALUES (NEW.id, 0, 0, NULL)
  ON CONFLICT (user_id) DO NOTHING;

  -- Settings
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Notification Preferences
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Zero fake quran_progress!
  -- Zero fake notifications!
  -- Zero fake wird!

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
