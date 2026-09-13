import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('--- Connected to PostgreSQL Database ---');

  // 1. Check existing test / demo users
  const testUsers = await client.query(`
    SELECT id, email, created_at FROM auth.users
    WHERE email ILIKE '%demo%'
       OR email ILIKE '%test%'
       OR email = 'user@wasl-islamic.org'
       OR email ILIKE '%example.com'
  `);
  console.log(`Found ${testUsers.rowCount} test/demo users in auth.users:`, testUsers.rows);

  if (testUsers.rowCount && testUsers.rowCount > 0) {
    const userIds = testUsers.rows.map((u) => u.id);
    console.log('Deleting dependent records for test users:', userIds);

    // Explicit cascade cleanup across all user tables
    await client.query('DELETE FROM public.user_activity WHERE user_id = ANY($1)', [userIds]);
    await client.query('DELETE FROM public.tasbeeh_sessions WHERE user_id = ANY($1)', [userIds]);
    await client.query('DELETE FROM public.user_radio_history WHERE user_id = ANY($1)', [userIds]);
    await client.query('DELETE FROM public.user_radio_favorites WHERE user_id = ANY($1)', [userIds]);
    await client.query('DELETE FROM public.favorites WHERE user_id = ANY($1)', [userIds]);
    await client.query('DELETE FROM public.quran_bookmarks WHERE user_id = ANY($1)', [userIds]);
    await client.query('DELETE FROM public.notifications WHERE user_id = ANY($1)', [userIds]);
    await client.query('DELETE FROM public.user_daily_wird WHERE user_id = ANY($1)', [userIds]);
    await client.query('DELETE FROM public.user_azkar_progress WHERE user_id = ANY($1)', [userIds]);
    await client.query('DELETE FROM public.quran_progress WHERE user_id = ANY($1)', [userIds]);
    await client.query('DELETE FROM public.streaks WHERE user_id = ANY($1)', [userIds]);
    await client.query('DELETE FROM public.notification_preferences WHERE user_id = ANY($1)', [userIds]);
    await client.query('DELETE FROM public.user_settings WHERE user_id = ANY($1)', [userIds]);
    await client.query('DELETE FROM public.profiles WHERE id = ANY($1)', [userIds]);

    // Finally delete from auth.users
    const delAuth = await client.query('DELETE FROM auth.users WHERE id = ANY($1)', [userIds]);
    console.log(`Deleted ${delAuth.rowCount} rows from auth.users.`);
  }

  // 2. Also check if there are any orphaned or fake profiles with fake emails/names
  const fakeProfiles = await client.query(`
    SELECT id, email, full_name FROM public.profiles
    WHERE email ILIKE '%demo%'
       OR email ILIKE '%test%'
       OR email = 'user@wasl-islamic.org'
       OR email ILIKE '%example.com'
       OR full_name = 'أحمد بن عبد الله'
       OR full_name = 'عابد الرحمن'
  `);
  if (fakeProfiles.rowCount && fakeProfiles.rowCount > 0) {
    console.log('Cleaning up remaining fake profiles:', fakeProfiles.rows);
    await client.query(`
      DELETE FROM public.profiles
      WHERE email ILIKE '%demo%'
         OR email ILIKE '%test%'
         OR email = 'user@wasl-islamic.org'
         OR email ILIKE '%example.com'
         OR full_name = 'أحمد بن عبد الله'
         OR full_name = 'عابد الرحمن'
    `);
  }

  // 3. Update the handle_new_user() trigger function to enforce 100% clean production data
  console.log('Updating handle_new_user() trigger function in PostgreSQL...');
  await client.query(`
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

      -- 1. Profile: Only real user metadata, no fake defaults
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

      -- 2. Streaks: Start strictly from 0
      INSERT INTO public.streaks (user_id, current_streak, longest_streak, last_activity_date)
      VALUES (NEW.id, 0, 0, NULL)
      ON CONFLICT (user_id) DO NOTHING;

      -- 3. Settings
      INSERT INTO public.user_settings (user_id)
      VALUES (NEW.id)
      ON CONFLICT (user_id) DO NOTHING;

      -- 4. Notification Preferences
      INSERT INTO public.notification_preferences (user_id)
      VALUES (NEW.id)
      ON CONFLICT (user_id) DO NOTHING;

      -- Zero fake progress, zero fake notifications, zero fake wird!
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;
  `);

  console.log('handle_new_user() trigger successfully updated in PostgreSQL.');

  // 4. Audit tables again
  const totalUsers = await client.query('SELECT count(*) FROM auth.users');
  const totalProfiles = await client.query('SELECT count(*) FROM public.profiles');
  const totalQuran = await client.query('SELECT count(*) FROM public.quran_progress');
  const totalStreaks = await client.query('SELECT count(*) FROM public.streaks');
  const totalWird = await client.query('SELECT count(*) FROM public.user_daily_wird');
  const totalNotifs = await client.query('SELECT count(*) FROM public.notifications');

  console.log('\n--- Post-Cleanup Database State ---');
  console.log('auth.users count:', totalUsers.rows[0].count);
  console.log('public.profiles count:', totalProfiles.rows[0].count);
  console.log('public.quran_progress count:', totalQuran.rows[0].count);
  console.log('public.streaks count:', totalStreaks.rows[0].count);
  console.log('public.user_daily_wird count:', totalWird.rows[0].count);
  console.log('public.notifications count:', totalNotifs.rows[0].count);

  await client.end();
  console.log('Done.');
}

main().catch((err) => {
  console.error('Error during database cleanup:', err);
  process.exit(1);
});
