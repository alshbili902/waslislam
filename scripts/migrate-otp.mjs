import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:Alshnili81%40@db.hzcvukhyjsfjtvllhhew.supabase.co:5432/postgres';

async function runOtpMigration() {
  console.log('Running OTP database migration...');
  const { Client } = pg;
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL database!');

    const sqlPath = path.join(__dirname, '../supabase/migrations/20261012_otp_verification.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Applying OTP verification schema...');
    const cleanedSql = sql
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');

    const statements = cleanedSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const stmt of statements) {
      try {
        await client.query(stmt);
      } catch (err) {
        if (!err.message.includes('already exists')) {
          console.warn('Notice on statement:', stmt.substring(0, 50), '->', err.message);
        }
      }
    }

    console.log('OTP verification schema successfully applied!');

    // Verify created table
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'email_verification_challenges'
      ORDER BY ordinal_position;
    `);

    console.log('Verified email_verification_challenges columns:', res.rows.map(r => `${r.column_name} (${r.data_type})`));
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runOtpMigration();
