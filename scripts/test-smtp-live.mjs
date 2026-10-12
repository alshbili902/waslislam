import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Manually parse .env.local to load fresh credentials
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const host = process.env.SMTP_HOST || 'smtp.hostinger.com';
const port = parseInt(process.env.SMTP_PORT || '465', 10);
const secure = process.env.SMTP_SECURE === 'true' || port === 465;
const user = process.env.SMTP_USER || 'noreply@wasal.fun';
const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS || '';

console.log('Testing live connection to Hostinger SMTP...');
console.log(`Host: ${host}`);
console.log(`Port: ${port}`);
console.log(`Secure (SSL/TLS): ${secure}`);
console.log(`Mailbox User: ${user}`);
console.log(`Password Configured: ${pass ? 'YES (length ' + pass.length + ')' : 'NO'}`);

const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: { user, pass },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
  tls: {
    rejectUnauthorized: true,
    minVersion: 'TLSv1.2'
  }
});

async function runTest() {
  try {
    await transporter.verify();
    console.log('========================================================');
    console.log('SUCCESS: Hostinger SMTP Authentication Verified Successfully!');
    console.log('The mailbox is active and ready to deliver real emails.');
    console.log('========================================================');
  } catch (err) {
    console.error('========================================================');
    console.error('FAILED to verify Hostinger SMTP:', err.message);
    console.error('Code:', err.code, 'Response Code:', err.responseCode);
    console.error('========================================================');
    process.exit(1);
  }
}

runTest();
