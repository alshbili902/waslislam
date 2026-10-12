import pg from 'pg';

const connectionString = 'postgresql://postgres:Alshnili81%40@db.hzcvukhyjsfjtvllhhew.supabase.co:5432/postgres';

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL database successfully.');

    const sql = `
      -- 1. Reflection Journal Table
      CREATE TABLE IF NOT EXISTS public.reflection_journal (
        id TEXT PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        surah_number INT NOT NULL,
        surah_name TEXT NOT NULL,
        ayah_number INT NOT NULL,
        ayah_text TEXT NOT NULL,
        tafsir_source TEXT,
        tafsir_text TEXT,
        title TEXT NOT NULL,
        notes TEXT NOT NULL,
        tags TEXT[] DEFAULT '{}',
        collection_id TEXT DEFAULT 'default',
        is_pinned BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_reflection_user ON public.reflection_journal(user_id);
      CREATE INDEX IF NOT EXISTS idx_reflection_surah ON public.reflection_journal(surah_number);

      -- 2. Quran Reading Plans Table
      CREATE TABLE IF NOT EXISTS public.quran_reading_plans (
        id TEXT PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        target_date DATE NOT NULL,
        start_page INT DEFAULT 1,
        current_page INT DEFAULT 1,
        total_pages INT DEFAULT 604,
        reading_days INT[] DEFAULT '{0,1,2,3,4,5,6}', -- 0=Sun to 6=Sat
        sessions_per_day INT DEFAULT 1,
        is_paused BOOLEAN DEFAULT FALSE,
        missed_pages INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_reading_plans_user ON public.quran_reading_plans(user_id);

      -- 3. Wasl Kids Learning Progress Table
      CREATE TABLE IF NOT EXISTS public.kids_learning_progress (
        id TEXT PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        child_name TEXT NOT NULL,
        completed_lessons TEXT[] DEFAULT '{}',
        earned_badges TEXT[] DEFAULT '{}',
        stars_count INT DEFAULT 0,
        settings JSONB DEFAULT '{"dailyMinutes": 15, "soundEnabled": true}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_kids_progress_user ON public.kids_learning_progress(user_id);

      -- 4. Admin Audit Logs Table
      CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        admin_email TEXT NOT NULL,
        action_type TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT,
        details JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_admin_audit_time ON public.admin_audit_logs(created_at DESC);

      -- 5. Content Revisions & Editorial Review Table
      CREATE TABLE IF NOT EXISTS public.content_revisions (
        id TEXT PRIMARY KEY,
        content_type TEXT NOT NULL,
        content_id TEXT NOT NULL,
        title_ar TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft', -- draft, pending_review, approved, published, archived
        submitted_by TEXT,
        reviewed_by TEXT,
        rejection_reason TEXT,
        data_payload JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_content_rev_status ON public.content_revisions(status);

      -- Enable RLS on private user tables
      ALTER TABLE public.reflection_journal ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.quran_reading_plans ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.kids_learning_progress ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.content_revisions ENABLE ROW LEVEL SECURITY;

      -- Policies for reflection_journal
      DO $$ BEGIN
        CREATE POLICY "Users can manage their reflections"
          ON public.reflection_journal
          FOR ALL
          USING (auth.uid() = user_id)
          WITH CHECK (auth.uid() = user_id);
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;

      -- Policies for quran_reading_plans
      DO $$ BEGIN
        CREATE POLICY "Users can manage their reading plans"
          ON public.quran_reading_plans
          FOR ALL
          USING (auth.uid() = user_id)
          WITH CHECK (auth.uid() = user_id);
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;

      -- Policies for kids_learning_progress
      DO $$ BEGIN
        CREATE POLICY "Parents can manage their kids progress"
          ON public.kids_learning_progress
          FOR ALL
          USING (auth.uid() = user_id)
          WITH CHECK (auth.uid() = user_id);
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;

      -- Policies for public reading of published content revisions
      DO $$ BEGIN
        CREATE POLICY "Anyone can view published revisions"
          ON public.content_revisions
          FOR SELECT
          USING (status = 'published');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `;

    await client.query(sql);
    console.log('Schema V2 tables and security policies applied successfully!');
  } catch (err) {
    console.error('Database migration error:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
