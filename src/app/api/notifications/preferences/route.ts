import { NextResponse } from 'next/server';
import { handleGetPreferences, handleUpdatePreferences } from '@/lib/email/notificationService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    const result = await handleGetPreferences(token);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      subscriber: result.subscriber
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown server error';
    console.error('Error in GET /api/notifications/preferences:', errorMsg);
    return NextResponse.json(
      { success: false, message: 'تعذر جلب تفضيلات الاشتراك في الوقت الحالي.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { token, categories } = body;

    const result = await handleUpdatePreferences(token, categories);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown server error';
    console.error('Error in POST /api/notifications/preferences:', errorMsg);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء حفظ التفضيلات.' },
      { status: 500 }
    );
  }
}
