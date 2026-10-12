import { NextResponse } from 'next/server';
import { handleSubscribeRequest } from '@/lib/email/notificationService';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, categories } = body;

    const forwardedFor = request.headers.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    const result = await handleSubscribeRequest(email, categories, clientIp);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      isAlreadyActive: result.isAlreadyActive || false,
      email: result.email,
      challengeId: result.challengeId,
      cooldownSeconds: result.cooldownSeconds || 60,
      expiresMinutes: result.expiresMinutes || 10
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown server error';
    console.error('Error in /api/notifications/subscribe:', errorMsg);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ غير متوقع أثناء معالجة الطلب. يرجى المحاولة لاحقًا.' },
      { status: 500 }
    );
  }
}
