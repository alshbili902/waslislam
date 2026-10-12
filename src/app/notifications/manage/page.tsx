'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  HeartHandshake, 
  Calendar, 
  BookOpen, 
  UserX, 
  Home, 
  ArrowRight 
} from 'lucide-react';
import { NOTIFICATION_CATEGORIES, type NotificationCategoryId } from '@/lib/email/tokens';

interface ManagePageProps {
  searchParams: Promise<{
    token?: string;
    unsubscribed?: string;
    message?: string;
  }>;
}

export default function ManageNotificationPreferencesPage({ searchParams }: ManagePageProps) {
  const resolvedParams = use(searchParams);
  const token = resolvedParams.token || '';
  const isUnsubscribedParam = resolvedParams.unsubscribed === 'true';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [categories, setCategories] = useState<NotificationCategoryId[]>(['daily_islamic']);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isUnsubscribed, setIsUnsubscribed] = useState(isUnsubscribedParam);

  useEffect(() => {
    if (isUnsubscribedParam) {
      setLoading(false);
      setIsUnsubscribed(true);
      return;
    }

    if (!token) {
      setLoading(false);
      setFeedback({
        type: 'info',
        message: 'يرجى فتح هذا الرابط من البريد الإلكتروني الذي استلمته من منصة وصل لإدارة تفضيلاتك.'
      });
      return;
    }

    // Fetch current subscriber categories
    fetch(`/api/notifications/preferences?token=${encodeURIComponent(token)}`)
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        if (data.success && data.subscriber) {
          setMaskedEmail(data.subscriber.maskedEmail || '');
          setCategories(data.subscriber.categories || ['daily_islamic']);
          if (data.subscriber.status === 'unsubscribed') {
            setIsUnsubscribed(true);
          }
        } else {
          setFeedback({
            type: 'error',
            message: data.message || 'تعذر العثور على اشتراك نشط مرتبط بهذا الرابط.'
          });
        }
      })
      .catch(() => {
        setLoading(false);
        setFeedback({
          type: 'error',
          message: 'حدث خطأ أثناء تحميل التفضيلات. يرجى المحاولة لاحقًا.'
        });
      });
  }, [token, isUnsubscribedParam]);

  const toggleCategory = (id: NotificationCategoryId) => {
    setCategories(prev => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev;
        return prev.filter(c => c !== id);
      }
      return [...prev, id];
    });
  };

  const handleSavePreferences = async () => {
    if (!token) return;
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, categories })
      });
      const data = await res.json();
      setSubmitting(false);

      if (data.success) {
        setFeedback({ type: 'success', message: data.message || 'تم حفظ تفضيلاتك بنجاح.' });
      } else {
        setFeedback({ type: 'error', message: data.message || 'تعذر حفظ التفضيلات.' });
      }
    } catch {
      setSubmitting(false);
      setFeedback({ type: 'error', message: 'تعذر الاتصال بالخادم.' });
    }
  };

  const handleUnsubscribe = async () => {
    if (!token && !isUnsubscribed) return;
    if (!confirm('هل أنت متأكد من رغبتك في إلغاء الاشتراك في كافة الإشعارات البريدية؟')) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      const data = await res.json();
      setSubmitting(false);

      if (data.success) {
        setIsUnsubscribed(true);
        setFeedback({ type: 'info', message: data.message || 'تم إلغاء الاشتراك بنجاح.' });
      } else {
        setFeedback({ type: 'error', message: data.message || 'تعذر إلغاء الاشتراك.' });
      }
    } catch {
      setSubmitting(false);
      setFeedback({ type: 'error', message: 'تعذر الاتصال بالخادم.' });
    }
  };

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'daily_islamic':
        return <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'worship_reminders':
        return <HeartHandshake className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'seasonal_updates':
        return <Calendar className="w-4 h-4 text-amber-600 shrink-0" />;
      case 'educational_content':
        return <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />;
      default:
        return <Bell className="w-4 h-4 text-emerald-500 shrink-0" />;
    }
  };

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 bg-[var(--bg-main)] text-[var(--text-main)] font-cairo flex items-center justify-center">
      <div className="w-full max-w-xl bg-[var(--bg-card)] border border-[var(--border-gold)] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center mx-auto shadow-sm border border-[var(--primary)]/20">
            <Bell className="w-6 h-6 text-[var(--primary)]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[var(--text-main)]">
            إدارة تفضيلات الإشعارات البريدية
          </h1>
          {maskedEmail && (
            <p className="text-xs text-[var(--text-muted)] font-mono">
              المشترك: <span className="text-[var(--text-main)] font-bold">{maskedEmail}</span>
            </p>
          )}
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
            <span className="text-xs text-[var(--text-muted)]">جاري جلب تفضيلاتك...</span>
          </div>
        )}

        {/* Unsubscribed Confirmation View */}
        {!loading && isUnsubscribed && (
          <div className="text-center space-y-4 py-4">
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100 text-sm">
              تم إلغاء اشتراكك في إشعارات وصل الإسلامية بنجاح. لن تستلم أي رسائل بريدية إضافية.
            </div>
            <p className="text-xs text-[var(--text-muted)] font-tajawal">
              إذا رغبت في إعادة تفعيل الإشعارات مستقبلاً، يمكنك الاشتراك مجددًا في أي وقت عبر المنصة.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold text-xs sm:text-sm shadow-md"
              >
                <Home className="w-4 h-4" />
                <span>العودة للمنصة الرئيسية</span>
              </Link>
            </div>
          </div>
        )}

        {/* Active Preference Editor View */}
        {!loading && !isUnsubscribed && token && (
          <div className="space-y-5">
            {feedback && (
              <div
                className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200'
                    : feedback.type === 'error'
                    ? 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200'
                    : 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-main)] block">
                حدد فئات الإشعارات التي ترغب في استلامها:
              </label>
              <div className="space-y-2.5">
                {NOTIFICATION_CATEGORIES.map(cat => {
                  const isChecked = categories.includes(cat.id);
                  return (
                    <label
                      key={cat.id}
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer select-none text-right ${
                        isChecked
                          ? 'bg-[var(--primary-light)] border-[var(--primary)] ring-1 ring-[var(--primary)]/30'
                          : 'bg-[var(--bg-card-subtle)] border-[var(--border-color)] hover:border-[var(--primary)]/40'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCategory(cat.id)}
                        className="mt-1 w-4 h-4 rounded text-[var(--primary)] focus:ring-[var(--primary)] shrink-0 accent-[var(--primary)]"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          {getCategoryIcon(cat.id)}
                          <span className="text-xs sm:text-sm font-bold text-[var(--text-main)]">
                            {cat.titleAr}
                          </span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-[var(--text-muted)] mt-1 font-tajawal leading-relaxed">
                          {cat.descAr}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[var(--border-color)]">
              <button
                onClick={handleSavePreferences}
                disabled={submitting}
                className="w-full sm:w-auto px-6 py-2.5 sm:py-3 rounded-2xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>حفظ التفضيلات</span>
              </button>

              <button
                onClick={handleUnsubscribe}
                disabled={submitting}
                className="w-full sm:w-auto px-4 py-2.5 rounded-2xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border border-transparent hover:border-red-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>إلغاء الاشتراك نهائياً</span>
              </button>
            </div>
          </div>
        )}

        {/* Fallback View when no token is present */}
        {!loading && !isUnsubscribed && !token && (
          <div className="text-center space-y-4 py-4">
            {feedback && (
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100 text-xs sm:text-sm">
                {feedback.message}
              </div>
            )}
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold text-xs sm:text-sm shadow-md"
            >
              <Home className="w-4 h-4" />
              <span>الذهاب لمنصة وصل الإسلامية للاشتراك</span>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
