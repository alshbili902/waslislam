import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:Alshbili811@db.xxgtgrklrlslyothsitc.supabase.co:5432/postgres';

async function runMigration() {
  console.log('Connecting to PostgreSQL database...');
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL successfully!');

    // Execute individual numbered migrations in sequence
    const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
    if (fs.existsSync(migrationsDir)) {
      const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
      console.log(`Found ${files.length} migration files.`);
      for (const file of files) {
        console.log(`Running migration: ${file}...`);
        const filePath = path.join(migrationsDir, file);
        const migrationSql = fs.readFileSync(filePath, 'utf-8');
        try {
          await client.query(migrationSql);
          console.log(`✓ ${file} applied successfully.`);
        } catch (mErr: any) {
          console.log(`- ${file}: ${mErr.message} (ignoring if already exists)`);
        }
      }
    }

    // Check existing tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('\nExisting tables in public schema:');
    res.rows.forEach(r => console.log(' - ' + r.table_name));

  } catch (err: any) {
    console.error('Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

runMigration();
