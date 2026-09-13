import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

async function runAllMigrations() {
  console.log('Connecting to PostgreSQL to run migrations...');
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('Connected!');

  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`Found ${files.length} migration files:`);
  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');
    console.log(`\nExecuting: ${file}...`);
    try {
      await client.query(sql);
      console.log(`✓ ${file} succeeded.`);
    } catch (err: any) {
      console.error(`✗ Error executing ${file}:`, err.message);
      throw err;
    }
  }

  console.log('\nAll migrations executed successfully!');
  await client.end();
}

runAllMigrations().catch(e => {
  console.error('Migration runner failed:', e);
  process.exit(1);
});
