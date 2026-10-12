import { NextResponse } from 'next/server';
import { handleVerifyOtpRequest } from '@/lib/email/notificationService';
import { getSmtpConfig } from '@/lib/email/hostingerSmtp';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, otp } = body;

    const forwardedFor = request.headers.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    const result = await handleVerifyOtpRequest(email, otp, clientIp);

    return NextResponse.json(
      {
        success: result.success,
        status: result.status,
        message: result.message,
        remainingAttempts: result.remainingAttempts
      },
      { status: result.success ? 200 : 400 }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown server error';
    console.error('Error in /api/notifications/verify POST:', errorMsg);
    return NextResponse.json(
      {
        success: false,
        status: 'invalid',
        message: 'حدث خطأ غير متوقع أثناء التحقق من الرمز.'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const cfg = getSmtpConfig();
  const acceptsJson = request.headers.get('accept')?.includes('application/json');

  if (acceptsJson) {
    return NextResponse.json({
      success: false,
      status: 'invalid',
      message: 'تم استبدال روابط التفعيل برمز تحقق رقمي (OTP) يتم إدخاله مباشرة في الموقع.'
    }, { status: 400 });
  }

  // Redirect to homepage where visitor can enter OTP
  return NextResponse.redirect(`${cfg.siteUrl}/#notifications`);
}
