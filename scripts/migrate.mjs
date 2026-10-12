import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client } = pg;
const connectionString = 'postgresql://postgres:Alshnili81%40@db.hzcvukhyjsfjtvllhhew.supabase.co:5432/postgres';

async function runMigration() {
  console.log('Connecting to Supabase PostgreSQL database...');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected successfully!');

    const sqlPath = path.join(__dirname, '../supabase/schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Applying database schema and RLS policies...');
    
    // Execute DDL statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const stmt of statements) {
      try {
        await client.query(stmt);
      } catch (e) {
        if (!e.message.includes('already exists')) {
          console.warn('Notice on statement:', e.message);
        }
      }
    }

    console.log('Database migration completed!');

    // Verify created tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('Current public tables:', res.rows.map(r => r.table_name));
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

runMigration();
