import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('--- Connected to PostgreSQL ---');

  const users = await client.query('SELECT id, email, created_at FROM auth.users');
  console.log('auth.users count:', users.rowCount);
  console.log('auth.users:', users.rows);

  const profiles = await client.query('SELECT id, email, full_name, role, city FROM public.profiles');
  console.log('public.profiles count:', profiles.rowCount);
  console.log('public.profiles:', profiles.rows);

  const wird = await client.query('SELECT id, user_id, wird_date, completion_percentage FROM public.user_daily_wird');
  console.log('public.user_daily_wird count:', wird.rowCount);
  console.log('public.user_daily_wird:', wird.rows);

  const notifs = await client.query('SELECT id, user_id, title_ar, type FROM public.notifications');
  console.log('public.notifications count:', notifs.rowCount);
  console.log('public.notifications:', notifs.rows);

  const streaks = await client.query('SELECT user_id, current_streak, longest_streak FROM public.streaks');
  console.log('public.streaks:', streaks.rows);

  const quran = await client.query('SELECT user_id, last_surah_number, last_ayah_number, total_verses_read FROM public.quran_progress');
  console.log('public.quran_progress:', quran.rows);

  const favs = await client.query('SELECT count(*) FROM public.favorites');
  console.log('public.favorites count:', favs.rows[0].count);

  const acts = await client.query('SELECT count(*) FROM public.user_activity');
  console.log('public.user_activity count:', acts.rows[0].count);

  const tasbeeh = await client.query('SELECT count(*) FROM public.tasbeeh_sessions');
  console.log('public.tasbeeh_sessions count:', tasbeeh.rows[0].count);

  await client.end();
}

main().catch(console.error);
