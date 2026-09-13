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

    // Read schema.sql
    const schemaPath = path.join(process.cwd(), 'supabase', 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf-8');

    console.log('Executing supabase/schema.sql...');
    await client.query(sql);
    console.log('Schema executed successfully!');

    // Check existing tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('\nCreated tables in public schema:');
    res.rows.forEach(r => console.log(' - ' + r.table_name));

  } catch (err: any) {
    console.error('Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

runMigration();
