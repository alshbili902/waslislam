import pg from 'pg';

const { Client } = pg;
const connectionString = 'postgresql://postgres:Alshnili81%40@db.hzcvukhyjsfjtvllhhew.supabase.co:5432/postgres';

async function main() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('Connected to Supabase PostgreSQL!');

  const tables = [
    `CREATE TABLE IF NOT EXISTS public.user_daily_goals (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
      date_key DATE NOT NULL DEFAULT CURRENT_DATE,
      goals_data JSONB NOT NULL DEFAULT '[]'::jsonb,
      completion_percentage INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
      UNIQUE(user_id, date_key)
    )`,
    `ALTER TABLE public.user_daily_goals ENABLE ROW LEVEL SECURITY`,
    `DO $$ BEGIN
      CREATE POLICY "Users can manage their daily goals" ON public.user_daily_goals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;`,

    `CREATE TABLE IF NOT EXISTS public.user_library_items (
      id TEXT PRIMARY KEY,
      user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
      item_type TEXT NOT NULL,
      title_ar TEXT NOT NULL,
      subtitle_ar TEXT,
      body_ar TEXT NOT NULL,
      reference_ar TEXT NOT NULL,
      collection_id TEXT DEFAULT 'tadabbur',
      user_note TEXT,
      metadata JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
    )`,
    `ALTER TABLE public.user_library_items ENABLE ROW LEVEL SECURITY`,
    `DO $$ BEGIN
      CREATE POLICY "Users can manage their library items" ON public.user_library_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;`,

    `CREATE TABLE IF NOT EXISTS public.user_academy_progress (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
      lesson_id TEXT NOT NULL,
      track_id TEXT NOT NULL,
      is_completed BOOLEAN DEFAULT TRUE,
      quiz_score INTEGER,
      completed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
      UNIQUE(user_id, lesson_id)
    )`,
    `ALTER TABLE public.user_academy_progress ENABLE ROW LEVEL SECURITY`,
    `DO $$ BEGIN
      CREATE POLICY "Users can manage their academy progress" ON public.user_academy_progress FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;`,

    `CREATE TABLE IF NOT EXISTS public.user_reminders_settings (
      user_id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
      settings JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
    )`,
    `ALTER TABLE public.user_reminders_settings ENABLE ROW LEVEL SECURITY`,
    `DO $$ BEGIN
      CREATE POLICY "Users can manage their reminders settings" ON public.user_reminders_settings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;`
  ];

  for (const sql of tables) {
    try {
      await client.query(sql);
    } catch (e) {
      console.warn('Notice:', e.message);
    }
  }

  const res = await client.query(`
    SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
  `);
  console.log('Public tables in Supabase:', res.rows.map(r => r.table_name));

  await client.end();
}

main().catch(console.error);
