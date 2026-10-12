import { NextResponse } from 'next/server';
import { executeDailyIslamicDelivery } from '@/lib/email/notificationService';

export async function POST(request: Request) {
  try {
    const cronSecret = process.env.NOTIFICATION_CRON_SECRET || process.env.CRON_SECRET;

    if (cronSecret) {
      const authHeader = request.headers.get('authorization') || '';
      const customSecret = request.headers.get('x-cron-secret') || '';
      const token = authHeader.replace(/^Bearer\s+/i, '');

      if (token !== cronSecret && customSecret !== cronSecret) {
        return NextResponse.json(
          { success: false, message: 'غير مصرح بتنفيذ هذه العملية (Unauthorized cron token).' },
          { status: 401 }
        );
      }
    }

    const report = await executeDailyIslamicDelivery();

    return NextResponse.json({
      success: report.success,
      timestamp: new Date().toISOString(),
      report
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown cron error';
    console.error('Error in /api/notifications/cron/daily:', errorMsg);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}

// Allow GET for simple webhook or cron triggers that only support GET
export async function GET(request: Request) {
  return POST(request);
}
