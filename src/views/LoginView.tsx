import React, { useState, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  User,
  AtSign,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { BrandLogo } from '../components/brand/BrandLogo';

interface LoginViewProps {
  onNavigate: (tab: string, contextId?: any) => void;
  initialMode?: 'signin' | 'signup';
}

function getPasswordStrength(pass: string): {
  level: 'weak' | 'medium' | 'strong';
  label: string;
  barColor: string;
  textColor: string;
  width: string;
} {
  if (!pass) {
    return { level: 'weak', label: '', barColor: 'bg-slate-200', textColor: 'text-slate-400', width: '0%' };
  }
  let score = 0;
  if (pass.length >= 6) score += 1;
  if (pass.length >= 8) score += 1;
  if (/[0-9]/.test(pass)) score += 1;
  if (/[a-zA-Z]/.test(pass)) score += 1;
  if (/[^a-zA-Z0-9]/.test(pass)) score += 1;

  if (score <= 2) {
    return { level: 'weak', label: 'ضعيفة', barColor: 'bg-rose-500', textColor: 'text-rose-600 dark:text-rose-400', width: '33%' };
  } else if (score <= 4) {
    return { level: 'medium', label: 'متوسطة', barColor: 'bg-amber-500', textColor: 'text-amber-600 dark:text-amber-400', width: '66%' };
  } else {
    return { level: 'strong', label: 'قوية', barColor: 'bg-emerald-500', textColor: 'text-emerald-600 dark:text-emerald-400', width: '100%' };
  }
}

export const LoginView: React.FC<LoginViewProps> = ({ onNavigate, initialMode = 'signin' }) => {
  const { isAuthenticated, signIn, signUp } = useUser();

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);

  // Form fields
  const [clientName, setClientName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Eye toggles for passwords
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Live username availability state
  const [usernameCheck, setUsernameCheck] = useState<{
    checking: boolean;
    available?: boolean;
    reason?: string;
  }>({ checking: false });

  // Unique field IDs for accessibility
  const clientNameId = useId();
  const usernameId = useId();
  const passwordId = useId();
  const confirmPasswordId = useId();

  // If already authenticated, redirect automatically to /dashboard
  useEffect(() => {
    if (isAuthenticated) {
      onNavigate('dashboard');
    }
  }, [isAuthenticated, onNavigate]);

  // Sync mode when initialMode changes
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Real-time username check with debouncing
  useEffect(() => {
    if (mode !== 'signup') {
      setUsernameCheck({ checking: false });
      return;
    }

    const trimmed = username.trim();
    if (!trimmed || trimmed.length < 3) {
      setUsernameCheck({ checking: false });
      return;
    }

    setUsernameCheck({ checking: true });
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          setUsernameCheck({
            checking: false,
            available: data.available,
            reason: data.reason,
          });
        } else {
          setUsernameCheck({ checking: false });
        }
      } catch {
        setUsernameCheck({ checking: false });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [username, mode]);

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        // Sign in: username + password only
        if (!username.trim()) {
          setErrorMsg('اسم المستخدم مطلوب.');
          setIsLoading(false);
          return;
        }
        if (!password) {
          setErrorMsg('كلمة المرور مطلوبة.');
          setIsLoading(false);
          return;
        }

        const res = await signIn(username.trim(), password);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          setSuccessMsg('تم تسجيل الدخول بنجاح! جاري توجيهك إلى لوحة التحكم...');
          setTimeout(() => onNavigate('dashboard'), 600);
        }
      } else {
        // Sign up: clientName, username, password, confirmPassword
        if (!clientName.trim()) {
          setErrorMsg('اسم العميل مطلوب.');
          setIsLoading(false);
          return;
        }
        if (!username.trim()) {
          setErrorMsg('اسم المستخدم مطلوب.');
          setIsLoading(false);
          return;
        }
        if (!/^[a-zA-Z0-9_]{3,30}$/.test(username.trim())) {
          setErrorMsg('اسم المستخدم غير صالح. يجب أن يتكون من 3 إلى 30 حرفاً (أحرف إنجليزية وأرقام وشرطة سفلية _ فقط).');
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMsg('كلمة المرور يجب ألا تقل عن 6 أحرف أو أرقام.');
          setIsLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setErrorMsg('كلمتا المرور غير متطابقتين.');
          setIsLoading(false);
          return;
        }

        const res = await signUp(clientName.trim(), username.trim(), password, confirmPassword);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          setSuccessMsg('تم إنشاء الحساب بنجاح! مرحباً بك في وصل الإسلامية.');
          setTimeout(() => onNavigate('dashboard'), 600);
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'حدث خطأ غير متوقع، يرجى المحاولة لاحقاً');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Brand Header */}
        <div className="text-center mb-6 flex flex-col items-center">
          <BrandLogo
            variant="full"
            size="xl"
            clickable
            onClick={() => onNavigate('home')}
            className="mb-2"
          />
          <p className="text-xs sm:text-sm text-slate-500 dark:text-emerald-300/80 mt-1 font-medium">
            مركزك الإيماني الشامل • متابعة الورد، القرآن الكريم، والتلاوات
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-emerald-950/80 rounded-3xl p-6 sm:p-8 border border-emerald-900/10 dark:border-emerald-800/50 shadow-xl shadow-emerald-950/5 backdrop-blur-md">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-emerald-900/50 rounded-2xl mb-6">
            <button
              type="button"
              id="tab-signin-btn"
              onClick={() => {
                setMode('signin');
                setErrorMsg(null);
                setSuccessMsg(null);
                if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                  window.history.pushState({}, '', '/login');
                }
              }}
              className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-white dark:bg-emerald-800 text-emerald-900 dark:text-amber-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-300'
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              id="tab-signup-btn"
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
                setSuccessMsg(null);
                if (typeof window !== 'undefined' && window.location.pathname !== '/register') {
                  window.history.pushState({}, '', '/register');
                }
              }}
              className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white dark:bg-emerald-800 text-emerald-900 dark:text-amber-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-300'
              }`}
            >
              إنشاء حساب جديد
            </button>
          </div>

          {/* Feedback Messages */}
          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 flex items-start gap-2.5 text-xs font-semibold text-rose-700 dark:text-rose-300 shadow-xs"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-2.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-amber-300" />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Field 1: اسم العميل (Signup only) */}
            {mode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label
                  htmlFor={clientNameId}
                  className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5"
                >
                  اسم العميل
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id={clientNameId}
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="مثال: عبدالرحمن الشبيلي"
                    className="w-full pr-10 pl-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-emerald-900/30 border border-slate-200 dark:border-emerald-800/60 focus:outline-none focus:border-emerald-600 dark:focus:border-amber-400 text-slate-900 dark:text-white"
                  />
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  الاسم الذي سيظهر لك داخل المنصة وفي لوحة التحكم
                </p>
              </motion.div>
            )}

            {/* Field 2: اسم المستخدم (Both Signin & Signup) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor={usernameId}
                  className="block text-xs font-bold text-slate-700 dark:text-slate-200"
                >
                  اسم المستخدم
                </label>
                {mode === 'signup' && usernameCheck.checking && (
                  <span className="text-[10px] text-slate-400 animate-pulse">جاري التحقق من التوفر...</span>
                )}
                {mode === 'signup' && !usernameCheck.checking && usernameCheck.available === true && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> متاح
                  </span>
                )}
                {mode === 'signup' && !usernameCheck.checking && usernameCheck.available === false && (
                  <span className="text-[10px] text-rose-500 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {usernameCheck.reason || 'غير متاح'}
                  </span>
                )}
              </div>
              <div className="relative">
                <AtSign className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id={usernameId}
                  type="text"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="alshbili"
                  dir="ltr"
                  className={`w-full pr-10 pl-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-emerald-900/30 border text-slate-900 dark:text-white text-right focus:outline-none transition-colors ${
                    mode === 'signup' && usernameCheck.available === false
                      ? 'border-rose-400 focus:border-rose-500'
                      : mode === 'signup' && usernameCheck.available === true
                      ? 'border-emerald-500 focus:border-emerald-600'
                      : 'border-slate-200 dark:border-emerald-800/60 focus:border-emerald-600 dark:focus:border-amber-400'
                  }`}
                />
              </div>
              {mode === 'signup' && (
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  حروف إنجليزية، أرقام، وشرطة سفلية (من 3 إلى 30 حرفاً)
                </p>
              )}
            </div>

            {/* Field 3: كلمة المرور (Both Signin & Signup) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor={passwordId}
                  className="block text-xs font-bold text-slate-700 dark:text-slate-200"
                >
                  كلمة المرور
                </label>
                {mode === 'signup' && password && (
                  <span className={`text-[10px] font-bold ${strength.textColor}`}>
                    قوة كلمة المرور: {strength.label}
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id={passwordId}
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  dir="ltr"
                  className="w-full pr-10 pl-10 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-emerald-900/30 border border-slate-200 dark:border-emerald-800/60 focus:outline-none focus:border-emerald-600 dark:focus:border-amber-400 text-slate-900 dark:text-white text-right"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={(e) => {
                    e.preventDefault();
                    setShowPassword((prev) => !prev);
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer transition-colors"
                  title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength meter bar (Signup only) */}
              {mode === 'signup' && password && (
                <div className="mt-1.5 w-full bg-slate-100 dark:bg-emerald-900/40 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${strength.barColor}`}
                    style={{ width: strength.width }}
                  />
                </div>
              )}
            </div>

            {/* Field 4: إعادة كتابة كلمة المرور (Signup only) */}
            {mode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor={confirmPasswordId}
                    className="block text-xs font-bold text-slate-700 dark:text-slate-200"
                  >
                    إعادة كتابة كلمة المرور
                  </label>
                  {confirmPassword && (
                    <span
                      className={`text-[10px] font-bold ${
                        password === confirmPassword ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                      }`}
                    >
                      {password === confirmPassword ? 'متطابقة ✓' : 'غير متطابقة ✕'}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id={confirmPasswordId}
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    dir="ltr"
                    className={`w-full pr-10 pl-10 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-emerald-900/30 border text-slate-900 dark:text-white text-right focus:outline-none transition-colors ${
                      confirmPassword && password !== confirmPassword
                        ? 'border-rose-400 focus:border-rose-500'
                        : confirmPassword && password === confirmPassword
                        ? 'border-emerald-500 focus:border-emerald-600'
                        : 'border-slate-200 dark:border-emerald-800/60 focus:border-emerald-600 dark:focus:border-amber-400'
                    }`}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={(e) => {
                      e.preventDefault();
                      setShowConfirmPassword((prev) => !prev);
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer transition-colors"
                    title={showConfirmPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                    aria-label={showConfirmPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              id="auth-submit-btn"
              disabled={isLoading}
              className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'signin' ? 'تسجيل الدخول' : 'إنشاء الحساب'}</span>
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </>
              )}
            </button>
          </form>

          {/* Privacy & Direct Flow Guarantee */}
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-emerald-900/50 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-emerald-300/60">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-amber-400 shrink-0" />
            <span>تسجيل مباشر وآمن بجلسة مشفرة بدون بريد إلكتروني أو OTP</span>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-amber-300 font-medium transition-colors cursor-pointer"
          >
            ← العودة إلى الصفحة الرئيسية للمنصة
          </button>
        </div>
      </motion.div>
    </div>
  );
};
