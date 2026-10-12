/**
 * Wasl Islamic (منصة وصل الإسلامية) - Notification Scheduler Runner
 *
 * Can be run in two modes:
 * 1. As a standard cron job task:
 *    node scripts/notification-scheduler.mjs --once
 *
 * 2. As a persistent daemon background process:
 *    node scripts/notification-scheduler.mjs --daemon
 */

import { executeDailyIslamicDelivery } from '../src/lib/email/notificationService.ts';

const args = process.argv.slice(2);
const isOnce = args.includes('--once') || !args.includes('--daemon');

console.log('====================================================');
console.log('Wasl Islamic - Hostinger Email Notification Scheduler');
console.log(`Execution Mode: ${isOnce ? 'One-time Execution (--once)' : 'Persistent Daemon (--daemon)'}`);
console.log('Timezone: Asia/Riyadh (UTC+3)');
console.log('====================================================');

async function runScheduledDelivery() {
  const startTime = new Date();
  console.log(`[${startTime.toISOString()}] Starting scheduled daily delivery job...`);

  try {
    const report = await executeDailyIslamicDelivery(startTime);
    console.log(`[${new Date().toISOString()}] Daily delivery completed successfully:`);
    console.log(`- Total Active Subscribers in Category: ${report.totalSubscribers}`);
    console.log(`- Sent: ${report.sentCount}`);
    console.log(`- Skipped (Idempotent): ${report.skippedCount}`);
    console.log(`- Failed: ${report.failedCount}`);

    if (report.errors.length > 0) {
      console.warn('Errors encountered:');
      report.errors.forEach(e => console.warn(`  * ${e}`));
    }
    return report.success;
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Critical error in scheduled delivery:`, err.message);
    return false;
  }
}

if (isOnce) {
  runScheduledDelivery().then((success) => {
    process.exit(success ? 0 : 1);
  });
} else {
  // Daemon mode: check every minute if current time in Asia/Riyadh is 05:00 AM
  let lastRanDate = '';

  console.log('Scheduler daemon is active. Target dispatch time: 05:00 AM (Asia/Riyadh).');

  setInterval(async () => {
    const now = new Date();
    // Format to Asia/Riyadh hour and minute
    const riyadhTimeStr = now.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Riyadh',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });

    const riyadhDateStr = now.toLocaleDateString('en-CA', {
      timeZone: 'Asia/Riyadh'
    });

    // Check if 05:00 AM in Riyadh and has not run today
    if (riyadhTimeStr === '05:00' && lastRanDate !== riyadhDateStr) {
      lastRanDate = riyadhDateStr;
      console.log(`Triggering daily dispatch for ${riyadhDateStr} at ${riyadhTimeStr}...`);
      await runScheduledDelivery();
    }
  }, 30000);
}
