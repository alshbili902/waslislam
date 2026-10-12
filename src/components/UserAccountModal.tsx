'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Cloud, 
  CloudCheck, 
  Lock, 
  Mail, 
  LogOut, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { BrandLogo } from './BrandLogo';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEnglish: boolean;
}

export const UserAccountModal: React.FC<UserAccountModalProps> = ({
  isOpen,
  onClose,
  isEnglish
}) => {
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check auth state
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setCurrentUser(data.session?.user || null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password
        });
        if (error) throw error;
        setSuccessMessage(isEnglish 
          ? 'Account created successfully! Check your email to confirm registration or sign in.' 
          : 'تم إنشاء الحساب بنجاح! تفقد بريدك الإلكتروني للتأكيد أو سجل الدخول مباشرة.');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        setCurrentUser(data.user);
        setSuccessMessage(isEnglish ? 'Logged in successfully!' : 'تم تسجيل الدخول بنجاح! تم تفعيل المزامنة السحابية.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ أثناء الاتصال بقاعدة البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    setIsLoading(true);
    await supabase.auth.signOut();
    setCurrentUser(null);
    setIsLoading(false);
  };

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-label={currentUser ? (isEnglish ? 'User Profile' : 'الملف الشخصي والمزامنة') : (isEnglish ? 'Sign In / Account' : 'الحساب والمزامنة السحابية')}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-[var(--bg-card)] border border-[var(--border-gold)] rounded-3xl max-w-md w-full shadow-2xl p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2.5">
            <BrandLogo size="xs" />
            <div>
              <h3 className="font-bold text-base text-[var(--text-main)] font-cairo">
                {currentUser ? (isEnglish ? 'User Profile' : 'الملف الشخصي والمزامنة') : (isEnglish ? 'Sign In / Account' : 'الحساب والمزامنة السحابية')}
              </h3>
              <span className="text-[11px] text-[var(--text-muted)]">
                {currentUser ? 'متصل بقاعدة بيانات Supabase' : 'وضع الزائر (محلي) مع إمكانية المزامنة'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)] transition-colors cursor-pointer touch-manipulation"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 pointer-events-none" />
          </button>
        </div>

        {/* Content */}
        {currentUser ? (
          /* Authenticated User View */
          <div className="py-6 space-y-5 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--primary-light)] text-[var(--primary)] mx-auto flex items-center justify-center">
              <CloudCheck className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-sm font-bold text-[var(--text-main)]">{currentUser.email}</h4>
              <span className="text-[11px] text-emerald-600 font-bold block mt-0.5">
                المزامنة السحابية نشطة (Active Cloud Sync)
              </span>
            </div>

            <div className="bg-[var(--bg-card-subtle)] p-4 rounded-2xl border border-[var(--border-color)] text-xs text-right space-y-2 text-[var(--text-muted)]">
              <div className="flex justify-between">
                <span>حالة قاعدة البيانات:</span>
                <strong className="text-emerald-600 font-mono">متصل (PostgreSQL)</strong>
              </div>
              <div className="flex justify-between">
                <span>مزامنة الختمة:</span>
                <strong className="text-[var(--text-main)]">مفعلة تلقائياً</strong>
              </div>
              <div className="flex justify-between">
                <span>حفظ العلامات والمفضلة:</span>
                <strong className="text-[var(--text-main)]">مفعلة تلقائياً</strong>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold border border-red-500/30 flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        ) : (
          /* Guest / Login Form */
          <div className="py-4 space-y-4">
            <div className="p-3 rounded-2xl bg-[var(--gold-light)]/40 border border-[var(--border-gold)] text-xs text-[var(--gold)] flex items-start gap-2">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                {isEnglish
                  ? 'All Islamic features work 100% offline without mandatory login. Sign in only if you want to sync Khatmah and bookmarks across your devices.'
                  : 'جميع مميزات التطبيق تعمل 100% بدون اشتراط تسجيل الدخول. يمكنك تسجيل الدخول فقط لمزامنة تقدم الختمة والمفضلة بين أجهزتك.'}
              </span>
            </div>

            {/* Toggle Login / Signup */}
            <div className="flex rounded-xl bg-[var(--bg-card-subtle)] p-1 border border-[var(--border-color)] text-xs font-bold">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${mode === 'login' ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-[var(--text-muted)]'}`}
              >
                تسجيل الدخول
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${mode === 'signup' ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-[var(--text-muted)]'}`}
              >
                إنشاء حساب جديد
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[var(--text-main)] mb-1">البريد الإلكتروني:</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-[var(--bg-card-subtle)] border border-[var(--border-color)] rounded-xl pr-9 pl-3 py-2 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--gold)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-main)] mb-1">كلمة المرور:</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[var(--bg-card-subtle)] border border-[var(--border-color)] rounded-xl pr-9 pl-3 py-2 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--gold)]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 min-h-[44px] rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--gold)] text-white text-xs font-bold shadow-md hover:opacity-95 flex items-center justify-center gap-2 mt-4 cursor-pointer touch-manipulation"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>{mode === 'login' ? 'دخول وتفعيل المزامنة' : 'تسجيل حساب سحابي'}</span>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
