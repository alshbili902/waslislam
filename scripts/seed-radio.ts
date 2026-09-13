import pg from 'pg';
import dotenv from 'dotenv';
import { RADIO_CATEGORIES, RADIO_RECITERS, INITIAL_RADIO_STATIONS } from '../src/data/radioData';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

async function seed() {
  console.log('Connecting to PostgreSQL to update radio schema and seed data...');
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    // Drop old radio tables if they were empty so we can recreate them with VARCHAR(100)
    await client.query(`
      DROP TABLE IF EXISTS user_radio_history CASCADE;
      DROP TABLE IF EXISTS user_radio_favorites CASCADE;
      DROP TABLE IF EXISTS radio_stations CASCADE;
      DROP TABLE IF EXISTS reciters CASCADE;
      DROP TABLE IF EXISTS radio_categories CASCADE;

      CREATE TABLE radio_categories (
        id VARCHAR(100) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
        name_ar VARCHAR(150) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        description_ar TEXT,
        icon VARCHAR(50),
        sort_order INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE reciters (
        id VARCHAR(100) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
        name_ar VARCHAR(150) NOT NULL,
        name_en VARCHAR(150),
        bio_ar TEXT,
        image_url TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE radio_stations (
        id VARCHAR(100) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        stream_url TEXT NOT NULL,
        logo_url TEXT,
        category_id VARCHAR(100) REFERENCES radio_categories(id) ON DELETE SET NULL,
        reciter_id VARCHAR(100) REFERENCES reciters(id) ON DELETE SET NULL,
        is_active BOOLEAN DEFAULT TRUE,
        is_featured BOOLEAN DEFAULT FALSE,
        sort_order INT DEFAULT 0,
        status VARCHAR(30) DEFAULT 'working',
        bitrate VARCHAR(20) DEFAULT '128kbps',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE user_radio_favorites (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        station_id VARCHAR(100) REFERENCES radio_stations(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE (user_id, station_id)
      );

      CREATE TABLE user_radio_history (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        station_id VARCHAR(100) REFERENCES radio_stations(id) ON DELETE CASCADE,
        played_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX idx_radio_stations_category ON radio_stations(category_id);
      CREATE INDEX idx_radio_stations_reciter ON radio_stations(reciter_id);
      CREATE INDEX idx_radio_stations_status ON radio_stations(is_active, sort_order);

      ALTER TABLE radio_categories ENABLE ROW LEVEL SECURITY;
      ALTER TABLE reciters ENABLE ROW LEVEL SECURITY;
      ALTER TABLE radio_stations ENABLE ROW LEVEL SECURITY;
      ALTER TABLE user_radio_favorites ENABLE ROW LEVEL SECURITY;
      ALTER TABLE user_radio_history ENABLE ROW LEVEL SECURITY;

      CREATE POLICY "Allow all on radio_categories" ON radio_categories FOR ALL USING (true) WITH CHECK (true);
      CREATE POLICY "Allow all on reciters" ON reciters FOR ALL USING (true) WITH CHECK (true);
      CREATE POLICY "Allow all on radio_stations" ON radio_stations FOR ALL USING (true) WITH CHECK (true);
      CREATE POLICY "Users can manage own radio favorites" ON user_radio_favorites FOR ALL USING (auth.uid() = user_id);
      CREATE POLICY "Users can manage own radio history" ON user_radio_history FOR ALL USING (auth.uid() = user_id);
    `);

    console.log('Tables recreated with VARCHAR(100) IDs and permissions successfully!');

    // 1. Seed Categories
    console.log(`Seeding ${RADIO_CATEGORIES.length} categories...`);
    for (const cat of RADIO_CATEGORIES) {
      await client.query(
        `INSERT INTO radio_categories (id, name_ar, slug, description_ar, icon, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET
           name_ar = EXCLUDED.name_ar,
           slug = EXCLUDED.slug,
           description_ar = EXCLUDED.description_ar,
           icon = EXCLUDED.icon,
           sort_order = EXCLUDED.sort_order;`,
        [cat.id, cat.nameAr, cat.slug, cat.descriptionAr || '', cat.icon || '', cat.sortOrder]
      );
    }

    // 2. Seed Reciters
    console.log(`Seeding ${RADIO_RECITERS.length} reciters...`);
    for (const rec of RADIO_RECITERS) {
      await client.query(
        `INSERT INTO reciters (id, name_ar, name_en, bio_ar, image_url, is_active, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET
           name_ar = EXCLUDED.name_ar,
           name_en = EXCLUDED.name_en,
           bio_ar = EXCLUDED.bio_ar,
           image_url = EXCLUDED.image_url,
           is_active = EXCLUDED.is_active,
           sort_order = EXCLUDED.sort_order;`,
        [rec.id, rec.nameAr, rec.nameEn || '', rec.bioAr || '', rec.imageUrl || '', rec.isActive ?? true, rec.sortOrder]
      );
    }

    // 3. Seed Stations
    console.log(`Seeding ${INITIAL_RADIO_STATIONS.length} stations...`);
    for (const st of INITIAL_RADIO_STATIONS) {
      await client.query(
        `INSERT INTO radio_stations (id, name, description, stream_url, logo_url, category_id, reciter_id, is_active, is_featured, sort_order, status, bitrate)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           description = EXCLUDED.description,
           stream_url = EXCLUDED.stream_url,
           logo_url = EXCLUDED.logo_url,
           category_id = EXCLUDED.category_id,
           reciter_id = EXCLUDED.reciter_id,
           is_active = EXCLUDED.is_active,
           is_featured = EXCLUDED.is_featured,
           sort_order = EXCLUDED.sort_order,
           status = EXCLUDED.status,
           bitrate = EXCLUDED.bitrate;`,
        [
          st.id,
          st.name,
          st.description || '',
          st.streamUrl,
          st.logoUrl || '',
          st.categoryId,
          st.reciterId || null,
          st.isActive ?? true,
          st.isFeatured ?? false,
          st.sortOrder ?? 0,
          st.status || 'working',
          st.bitrate || '128kbps',
        ]
      );
    }

    console.log('Seeding completed successfully!');
  } catch (err: any) {
    console.error('Seeding error:', err.message);
  } finally {
    await client.end();
  }
}

seed();
