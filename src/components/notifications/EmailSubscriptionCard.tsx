'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Bell, 
  ShieldCheck, 
  BookOpen, 
  Calendar, 
  Sparkles,
  HeartHandshake,
  RotateCcw,
  ArrowRight,
  Clock,
  KeyRound,
  Edit3
} from 'lucide-react';
import { NOTIFICATION_CATEGORIES, type NotificationCategoryId } from '@/lib/email/tokens';

interface EmailSubscriptionCardProps {
  className?: string;
  compact?: boolean;
}

type SubscriptionStep = 'form' | 'otp' | 'success';

export const EmailSubscriptionCard: React.FC<EmailSubscriptionCardProps> = ({
  className = '',
  compact = false
}) => {
  const [step, setStep] = useState<SubscriptionStep>('form');
  const [email, setEmail] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<NotificationCategoryId[]>([
    'daily_islamic',
    'seasonal_updates'
  ]);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Focus first digit box when opening OTP step
  useEffect(() => {
    if (step === 'otp') {
      const timeout = setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [step]);

  const toggleCategory = (id: NotificationCategoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev;
        return prev.filter(c => c !== id);
      }
      return [...prev, id];
    });
  };

  const normalizeChar = (char: string): string => {
    const arabicIndic: Record<string, string> = {
      '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
      '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
      '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
      '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
    };
    return arabicIndic[char] || char;
  };

  const handleDigitChange = (index: number, val: string) => {
    const normalized = Array.from(val)
      .map(normalizeChar)
      .filter(c => /[0-9]/.test(c));

    if (normalized.length > 1) {
      const nextDigits = [...otpDigits];
      normalized.slice(0, 6).forEach((d, idx) => {
        if (idx < 6) nextDigits[idx] = d;
      });
      setOtpDigits(nextDigits);
      setErrorMessage('');
      const targetIdx = Math.min(5, normalized.length - 1);
      inputRefs.current[targetIdx]?.focus();
      return;
    }

    const single = normalized[0] || '';
    const nextDigits = [...otpDigits];
    nextDigits[index] = single;
    setOtpDigits(nextDigits);
    setErrorMessage('');

    if (single && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        const nextDigits = [...otpDigits];
        nextDigits[index - 1] = '';
        setOtpDigits(nextDigits);
        inputRefs.current[index - 1]?.focus();
      } else {
        const nextDigits = [...otpDigits];
        nextDigits[index] = '';
        setOtpDigits(nextDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text');
    const normalized = Array.from(pasteData)
      .map(normalizeChar)
      .filter(c => /[0-9]/.test(c))
      .slice(0, 6);

    if (normalized.length > 0) {
      const nextDigits = [...otpDigits];
      normalized.forEach((d, idx) => {
        nextDigits[idx] = d;
      });
      setOtpDigits(nextDigits);
      setErrorMessage('');
      const focusIdx = Math.min(5, normalized.length);
      inputRefs.current[focusIdx]?.focus();
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    setErrorMessage('');
    setRemainingAttempts(null);

    try {
      const res = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          categories: selectedCategories
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatus('error');
        setErrorMessage(data.message || 'تعذر إرسال رمز التحقق، يرجى المحاولة لاحقًا.');
        return;
      }

      if (data.isAlreadyActive) {
        setStep('success');
        setSuccessMessage('هذا البريد الإلكتروني مشترك ومفعل بالفعل في إشعارات وصل الإسلامية.');
        setStatus('idle');
        return;
      }

      setSubmittedEmail(data.email || email.trim());
      setCooldown(data.cooldownSeconds || 60);
      setOtpDigits(['', '', '', '', '', '']);
      setStep('otp');
      setStatus('idle');
    } catch {
      setStatus('error');
      setErrorMessage('تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت والمحاولة لاحقًا.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join('');
    if (code.length !== 6) {
      setErrorMessage('يرجى إدخال رمز التحقق المكوّن من 6 أرقام كاملة.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/notifications/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: submittedEmail,
          otp: code
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatus('error');
        setErrorMessage(data.message || 'رمز التحقق غير صحيح أو منتهي الصلاحية.');
        if (typeof data.remainingAttempts === 'number') {
          setRemainingAttempts(data.remainingAttempts);
        }
        return;
      }

      setStep('success');
      setSuccessMessage('تم التحقق من بريدك الإلكتروني بنجاح، وتم تفعيل الإشعارات البريدية.');
      setStatus('idle');
      setEmail('');
      setOtpDigits(['', '', '', '', '', '']);
    } catch {
      setStatus('error');
      setErrorMessage('تعذر الاتصال بالخادم أثناء التحقق من الرمز.');
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/notifications/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: submittedEmail })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'تعذر إعادة إرسال الرمز حاليًا.');
        if (data.retryAfterSec) {
          setCooldown(data.retryAfterSec);
        }
      } else {
        setCooldown(data.cooldownSeconds || 60);
        setOtpDigits(['', '', '', '', '', '']);
        setRemainingAttempts(null);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setErrorMessage('حدث خطأ في الاتصال أثناء إعادة إرسال الرمز.');
    } finally {
      setResending(false);
    }
  };

  const handleChangeEmail = () => {
    setStep('form');
    setErrorMessage('');
    setStatus('idle');
    setRemainingAttempts(null);
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
    <section 
      id="notifications"
      aria-label="الاشتراك في إشعارات وصل الإسلامية"
      className={`relative overflow-hidden rounded-3xl bg-[var(--bg-card)] border border-[var(--border-gold)] p-5 sm:p-7 shadow-sm transition-all ${className}`}
    >
      {/* Decorative background glow */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-[var(--primary)]/10 via-[var(--gold)]/5 to-transparent rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />

      <div className="relative z-10">
        {/* Step A: Subscription Form */}
        {step === 'form' && (
          <div>
            {/* Header Title & Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center shrink-0 shadow-sm border border-[var(--primary)]/20">
                  <Mail className="w-5 h-5 text-[var(--primary)]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-black text-[var(--text-main)] font-cairo">
                      اشترك في إشعارات وصل الإسلامية
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--gold-light)] text-[var(--gold)] border border-[var(--border-gold)]">
                      بدون حساب أو كلمة مرور
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 font-tajawal">
                    تصلك رسائل إيمانية وتذكيرات بالمحتوى الإسلامي الذي تختاره عبر بريدك الإلكتروني.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleRequestOtp} className="space-y-4">
              {/* Notification Categories Grid */}
              {!compact && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-main)] block">
                    اختر المحتوى الذي ترغب في استلامه:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {NOTIFICATION_CATEGORIES.map(cat => {
                      const isChecked = selectedCategories.includes(cat.id);
                      return (
                        <label
                          key={cat.id}
                          className={`flex items-start gap-2.5 p-3 rounded-2xl border transition-all cursor-pointer select-none text-right ${
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
                              <span className="text-xs font-bold text-[var(--text-main)] truncate">
                                {cat.titleAr}
                              </span>
                            </div>
                            <p className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-snug line-clamp-2">
                              {cat.descAr}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Email Input Field & Submit Button */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      dir="ltr"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      aria-label="البريد الإلكتروني"
                      disabled={status === 'loading'}
                      className="w-full pl-3 pr-10 py-2.5 sm:py-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-main)] placeholder-[var(--text-muted)] text-sm font-sans focus:outline-none focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all text-left"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'loading' || !email.trim()}
                    className="px-5 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[#064e3b] hover:from-[var(--primary-hover)] hover:to-[#047857] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جاري إرسال الرمز...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4 text-amber-300" />
                        <span>طلب رمز التحقق والتفعيل</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Error Alert */}
                {status === 'error' && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>

              {/* Privacy Footnote */}
              <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] pt-1 flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>خصوصيتك مضمونة: لا نشارك بريدك أبداً، وبدون أي إعلانات تجارية.</span>
                </div>
                <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">
                  إلغاء الاشتراك متاح بنقرة واحدة دائماً
                </span>
              </div>
            </form>
          </div>
        )}

        {/* Step B: OTP Verification Screen */}
        {step === 'otp' && (
          <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-[var(--border-color)]">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20 shadow-sm mt-0.5">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-[var(--text-main)] font-cairo">
                    تأكيد البريد الإلكتروني
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 font-tajawal leading-relaxed">
                    أرسلنا رمز تحقق إلى بريدك الإلكتروني (
                    <strong className="text-[var(--text-main)] font-sans dir-ltr inline-block">
                      {submittedEmail}
                    </strong>
                    ). أدخل الرمز المكوّن من 6 أرقام لتفعيل الإشعارات البريدية.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleChangeEmail}
                className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1 shrink-0 self-start sm:self-center"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>تغيير البريد الإلكتروني</span>
              </button>
            </div>

            {/* OTP Verification Form */}
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-main)] block text-center">
                  رمز التحقق (6 أرقام):
                </label>

                {/* 6 Individual Digit Boxes */}
                <div 
                  className="flex items-center justify-center gap-2 sm:gap-3 dir-ltr" 
                  onPaste={handlePaste}
                >
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={el => { inputRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="one-time-code"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleDigitChange(idx, e.target.value)}
                      onKeyDown={e => handleKeyDown(idx, e)}
                      aria-label={`الرقم ${idx + 1}`}
                      disabled={status === 'loading'}
                      className="w-10 h-13 sm:w-12 sm:h-14 text-center font-mono text-xl sm:text-2xl font-black rounded-2xl bg-[var(--bg-card-subtle)] border-2 border-[var(--border-color)] text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all shadow-xs"
                    />
                  ))}
                </div>

                {/* Expiry Message */}
                <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--text-muted)] pt-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>تنتهي صلاحية الرمز خلال 10 دقائق.</span>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2 justify-center text-center">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={status === 'loading' || otpDigits.join('').length !== 6}
                  className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[#064e3b] hover:from-[var(--primary-hover)] hover:to-[#047857] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري التحقق من الرمز...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-amber-300" />
                      <span>تأكيد الرمز</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={cooldown > 0 || resending || status === 'loading'}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[var(--bg-card-subtle)] hover:bg-[var(--border-color)] border border-[var(--border-color)] text-[var(--text-main)] font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري الإرسال...</span>
                    </>
                  ) : cooldown > 0 ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      <span>إعادة إرسال الرمز بعد ({cooldown} ث)</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 text-[var(--primary)]" />
                      <span>إعادة إرسال الرمز</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step C: Successful Activation Confirmation */}
        {step === 'success' && (
          <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 flex items-start gap-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h4 className="font-black text-base sm:text-lg text-emerald-900 dark:text-emerald-100 font-cairo">
                تم التحقق من بريدك الإلكتروني بنجاح، وتم تفعيل الإشعارات البريدية.
              </h4>
              <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-200 font-tajawal leading-relaxed">
                {successMessage || 'مرحبًا بك في منصة وصل الإسلامية! ستصلك الرسائل الإيمانية والتذكيرات الموثوقة وفق تفضيلاتك المختارة.'}
              </p>
              <div className="pt-2 flex items-center gap-4 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setStep('form');
                    setEmail('');
                    setStatus('idle');
                  }}
                  className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1"
                >
                  <span>الاشتراك ببريد إلكتروني آخر</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
