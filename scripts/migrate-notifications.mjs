import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:Alshnili81%40@db.hzcvukhyjsfjtvllhhew.supabase.co:5432/postgres';

async function runNotificationsMigration() {
  console.log('Running notifications database migration...');
  const { Client } = pg;
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL database!');

    const sqlPath = path.join(__dirname, '../supabase/migrations/20261012_email_notifications.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Applying notifications schema...');
    // Strip line comments
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
          console.warn('Error on statement:', stmt.substring(0, 50), '->', err.message);
        }
      }
    }

    console.log('Notifications schema successfully applied!');

    // Verify created tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name IN ('email_subscribers', 'notification_delivery_logs', 'system_alert_logs')
      ORDER BY table_name;
    `);

    console.log('Verified notification tables:', res.rows.map(r => r.table_name));
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runNotificationsMigration();
