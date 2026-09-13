import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

async function run() {
  if (!connectionString) {
    console.log('No DATABASE_URL found.');
    return;
  }
  console.log('Connecting to PostgreSQL database to execute migration 016...');
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL successfully.');

    const sqlPath = path.join(process.cwd(), 'supabase', 'migrations', '016_username_authentication.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    await client.query(sql);
    console.log('Migration 016 executed successfully!');

    // Verify columns
    const res = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'profiles' 
      ORDER BY ordinal_position;
    `);
    console.log('Updated profiles columns:');
    res.rows.forEach(r => console.log(` - ${r.column_name} (${r.data_type}, nullable: ${r.is_nullable})`));

  } catch (err: any) {
    console.error('Migration error:', err.message);
  } finally {
    await client.end();
  }
}

run();
