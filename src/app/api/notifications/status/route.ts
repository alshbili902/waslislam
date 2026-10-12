import { NextResponse } from 'next/server';
import { getSmtpDiagnostics, verifySmtpConnection } from '@/lib/email/hostingerSmtp';
import { getSubscriptionStats } from '@/lib/email/subscriberDb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const checkConnection = searchParams.get('check') === 'true';

    const diagnostics = getSmtpDiagnostics();
    const stats = await getSubscriptionStats();

    let connectionTest: { success: boolean; message: string } | null = null;
    if (checkConnection && diagnostics.isConfigured) {
      const conn = await verifySmtpConnection();
      connectionTest = {
        success: conn.success,
        message: conn.message
      };
    }

    return NextResponse.json({
      service: 'Wasl Islamic Hostinger Email Notification System',
      status: diagnostics.isConfigured ? 'operational' : 'configuration_required',
      diagnostics: {
        host: diagnostics.host,
        port: diagnostics.port,
        secure: diagnostics.secure,
        userConfigured: diagnostics.userConfigured,
        userEmail: diagnostics.userEmail,
        fromAddress: diagnostics.fromAddress,
        hasAdminEmail: diagnostics.hasAdminEmail,
        missingKeys: diagnostics.missingKeys
      },
      stats,
      connectionTest
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown status check error';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
