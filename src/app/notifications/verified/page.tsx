import React from 'react';
import Link from 'next/link';
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight, BookOpen, Home } from 'lucide-react';

interface PageProps {
  searchParams: Promise<{
    status?: string;
    message?: string;
  }>;
}

export default async function VerifiedPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = params.status || 'active';
  const decodedMessage = params.message ? decodeURIComponent(params.message) : '';

  const isSuccess = status === 'active' || status === 'already_verified';
  const isExpired = status === 'expired';

  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[var(--bg-main)] text-[var(--text-main)] font-cairo">
      <div className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-gold)] rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6">
        {/* Status Icon */}
        <div className="flex justify-center">
          {isSuccess ? (
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg border border-emerald-300 dark:border-emerald-700 animate-in zoom-in-75 duration-300">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          ) : isExpired ? (
            <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-lg border border-amber-300 dark:border-amber-700">
              <AlertTriangle className="w-10 h-10" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center shadow-lg border border-red-300 dark:border-red-700">
              <XCircle className="w-10 h-10" />
            </div>
          )}
        </div>

        {/* Heading & Details */}
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-[var(--text-main)]">
            {isSuccess
              ? 'تم تفعيل اشتراكك بنجاح!'
              : isExpired
              ? 'انتهت صلاحية رمز التحقق'
              : 'تعذر التحقق من الاشتراك'}
          </h1>
          <p className="text-sm text-[var(--text-muted)] font-tajawal leading-relaxed">
            {decodedMessage ||
              (isSuccess
                ? 'مرحبًا بك في إشعارات وصل الإسلامية. ستصلك الرسائل والتذكيرات الإيمانية الموثوقة وفق تفضيلاتك المختارة.'
                : 'الرابط غير صالح أو تم استخدامه مسبقًا. يمكنك طلب الاشتراك من جديد عبر المنصة.')}
          </p>
        </div>

        {/* Features Reminder */}
        {isSuccess && (
          <div className="p-4 rounded-2xl bg-[var(--primary-light)] border border-[var(--primary)]/20 text-right space-y-2">
            <h4 className="text-xs font-bold text-[var(--primary)]">ماذا بعد؟</h4>
            <ul className="text-xs text-[var(--text-main)] space-y-1 list-disc list-inside">
              <li>ستصلك رسائل قرآنية وأحاديث نبوية وأذكار صحيحة.</li>
              <li>يمكنك تعديل تفضيلاتك أو إلغاء الاشتراك في أي وقت بنقرة واحدة من أسفل أي رسالة.</li>
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>الصفحة الرئيسية</span>
          </Link>
          <Link
            href="/#quran"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[var(--bg-card-subtle)] hover:bg-[var(--border-color)] border border-[var(--border-color)] text-[var(--text-main)] font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>تصفح المصحف الشريف</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
