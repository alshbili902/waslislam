import { NextResponse } from 'next/server';
import { handleResendOtpRequest } from '@/lib/email/notificationService';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email } = body;

    const forwardedFor = request.headers.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    const result = await handleResendOtpRequest(email, clientIp);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
          retryAfterSec: result.retryAfterSec,
          cooldownSeconds: result.cooldownSeconds
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      email: result.email,
      challengeId: result.challengeId,
      cooldownSeconds: result.cooldownSeconds || 60,
      expiresMinutes: result.expiresMinutes || 10
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown server error';
    console.error('Error in /api/notifications/resend-otp:', errorMsg);
    return NextResponse.json(
      {
        success: false,
        message: 'حدث خطأ غير متوقع أثناء إعادة إرسال الرمز. يرجى المحاولة لاحقًا.'
      },
      { status: 500 }
    );
  }
}
