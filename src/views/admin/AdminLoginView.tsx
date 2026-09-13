import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Lock, User, Eye, EyeOff, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { BrandLogo } from '../../components/brand/BrandLogo';
import { useAdmin } from '../../context/AdminContext';

interface AdminLoginViewProps {
  onNavigate: (tab: string, contextId?: any) => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({ onNavigate }) => {
  const { isAdminAuthenticated, loginAdmin, isLoadingAdminAuth } = useAdmin();

  const [username, setUsername] = useState('alshbili');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already authenticated, redirect to /admin immediately
  useEffect(() => {
    if (isAdminAuthenticated && !isLoadingAdminAuth) {
      onNavigate('admin');
    }
  }, [isAdminAuthenticated, isLoadingAdminAuth, onNavigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !password) {
      setErrorMessage('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginAdmin(username.trim(), password);
      if (res.success) {
        onNavigate('admin');
      } else {
        setErrorMessage(res.error || 'بيانات الدخول غير صحيحة');
      }
    } catch {
      setErrorMessage('حدث خطأ أثناء محاولة الاتصال بالخادم');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#021812] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-amber-500 selection:text-slate-950 font-tajawal">
      {/* Subtle Background Glows */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-700/10 dark:bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Brand Card Header */}
        <div className="text-center mb-6 flex flex-col items-center">
          <BrandLogo
            variant="full"
            size="xl"
            clickable
            onClick={() => onNavigate('home')}
            className="mb-3"
          />

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-900/10 dark:bg-emerald-500/15 border border-emerald-800/20 dark:border-emerald-400/30 text-emerald-900 dark:text-emerald-200 text-xs font-bold mb-1">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span>لوحة تحكم الإدارة المركزية</span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            بوابة الإشراف المعتمدة لمنصة وصل الإسلامية • الدخول مقصور للمسؤول
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white dark:bg-emerald-950/90 rounded-3xl p-6 sm:p-8 border border-emerald-900/15 dark:border-emerald-800/60 shadow-2xl shadow-emerald-950/15 backdrop-blur-md">
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-right">
            {/* Username field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                اسم المستخدم
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="alshbili"
                  autoComplete="username"
                  required
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 dark:border-emerald-800/70 bg-slate-50 dark:bg-emerald-900/30 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 font-sans"
                />
                <User className="w-4 h-4 text-slate-400 dark:text-emerald-400 absolute right-3.5 top-3.5" />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-emerald-800/70 bg-slate-50 dark:bg-emerald-900/30 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 font-sans"
                />
                <Lock className="w-4 h-4 text-slate-400 dark:text-emerald-400 absolute right-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-800 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-900/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>جاري التحقق والمصادقة...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  <span>دخول لوحة الإدارة</span>
                </>
              )}
            </button>
          </form>

          {/* Security Notice Footer */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-emerald-900/60 text-center">
            <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>نظام جلسات محمي (HttpOnly Token • Rate-Limited • SSL Encrypted)</span>
            </p>
          </div>
        </div>

        {/* Back to main site */}
        <div className="text-center mt-5">
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-amber-300 transition-colors cursor-pointer"
          >
            <span>العودة إلى المنصة العامة</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
