import { NextResponse } from 'next/server';
import { handleUnsubscribeRequest } from '@/lib/email/notificationService';
import { getSmtpConfig } from '@/lib/email/hostingerSmtp';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const acceptsJson = request.headers.get('accept')?.includes('application/json');

    const result = await handleUnsubscribeRequest(token);
    const cfg = getSmtpConfig();

    if (acceptsJson) {
      return NextResponse.json({
        success: result.success,
        message: result.message
      });
    }

    // Redirect to public preferences/unsubscribe status page
    const redirectUrl = new URL(`${cfg.siteUrl}/notifications/manage`);
    redirectUrl.searchParams.set('unsubscribed', 'true');
    redirectUrl.searchParams.set('message', encodeURIComponent(result.message));
    return NextResponse.redirect(redirectUrl.toString());
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown server error';
    console.error('Error in GET /api/notifications/unsubscribe:', errorMsg);

    const cfg = getSmtpConfig();
    const fallbackUrl = new URL(`${cfg.siteUrl}/notifications/manage`);
    fallbackUrl.searchParams.set('unsubscribed', 'true');
    fallbackUrl.searchParams.set('message', encodeURIComponent('تم استقبال طلب إلغاء الاشتراك.'));
    return NextResponse.redirect(fallbackUrl.toString());
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { token } = body;

    const result = await handleUnsubscribeRequest(token);
    return NextResponse.json({
      success: result.success,
      message: result.message
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown server error';
    console.error('Error in POST /api/notifications/unsubscribe:', errorMsg);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء معالجة إلغاء الاشتراك.' },
      { status: 500 }
    );
  }
}
