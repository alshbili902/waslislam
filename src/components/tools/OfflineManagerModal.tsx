'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Wifi, 
  WifiOff, 
  HardDrive, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Trash2, 
  ShieldCheck,
  Radio,
  BookOpen
} from 'lucide-react';
import { checkOfflineCapabilities, OfflineStatus } from '../../utils/offlineStorage';

interface OfflineManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEnglish?: boolean;
}

export const OfflineManagerModal: React.FC<OfflineManagerModalProps> = ({
  isOpen,
  onClose,
  isEnglish = false,
}) => {
  const [status, setStatus] = useState<OfflineStatus | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkOfflineCapabilities().then(setStatus);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      if (typeof window !== 'undefined' && 'caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
    } catch {}
    const updated = await checkOfflineCapabilities();
    setStatus(updated);
    setIsClearing(false);
  };

  const offlineFeatures = [
    { titleAr: 'المصحف الشريف وفهارس السور', titleEn: 'Holy Quran Texts & Surah Index', isOffline: true },
    { titleAr: 'حصن المسلم والأذكار اليومية كاملة', titleEn: 'Daily Adhkar & Hisn al-Muslim', isOffline: true },
    { titleAr: 'الأربعون النووية والأحاديث النبوية', titleEn: 'Hadith Collections & Nawawi 40', isOffline: true },
    { titleAr: 'أكاديمية وصل والمسارات التعليمية', titleEn: 'Wasl Academy Tracks & Quizzes', isOffline: true },
    { titleAr: 'مكتبتي الإسلامية والملاحظات الشخصية', titleEn: 'My Library & Personal Notes', isOffline: true },
    { titleAr: 'المسبحة الإلكترونية وحاسبة الزكاة', titleEn: 'Digital Tasbeeh & Zakat Calculator', isOffline: true },
    { titleAr: 'إذاعات القرآن الكريم المباشرة', titleEn: 'Live Quran Radio Streams', isOffline: false, noteAr: 'تتطلب اتصالاً بالإنترنت' },
  ];

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-label={isEnglish ? 'Offline Storage & Cache Manager' : 'إدارة العمل دون اتصال بالإنترنت'}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div 
        className="relative w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
        dir={isEnglish ? 'ltr' : 'rtl'}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[var(--gold-light)] text-[var(--gold)]">
              <HardDrive className="w-5 h-5 pointer-events-none" />
            </span>
            <div>
              <h3 className="text-lg font-bold font-amiri text-[var(--text-main)]">
                {isEnglish ? 'Offline Storage & Cache Manager' : 'إدارة العمل دون اتصال بالإنترنت (Offline)'}
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                {isEnglish ? 'Storage usage and offline readiness' : 'بيانات التخزين المحلي والجاهزية للعمل دون شبكة'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)] transition-colors cursor-pointer touch-manipulation"
            aria-label="Close"
          >
            <X className="w-5 h-5 pointer-events-none" />
          </button>
        </div>

        {/* Network & Storage Overview */}
        <div className="grid grid-cols-2 gap-3">
          {/* Network status */}
          <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
              {status?.isOnline ? <Wifi className="w-4 h-4 text-emerald-500" /> : <WifiOff className="w-4 h-4 text-red-500" />}
              <span>{isEnglish ? 'Network Status' : 'حالة الاتصال'}</span>
            </div>
            <div className={`text-base font-bold ${status?.isOnline ? 'text-emerald-600' : 'text-red-500'}`}>
              {status?.isOnline ? (isEnglish ? 'Online' : 'متصل بالشبكة') : (isEnglish ? 'Offline' : 'دون اتصال')}
            </div>
          </div>

          {/* Storage usage */}
          <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
              <HardDrive className="w-4 h-4 text-[var(--gold)]" />
              <span>{isEnglish ? 'Local Storage' : 'حجم التخزين المحلي'}</span>
            </div>
            <div className="text-base font-bold text-[var(--text-main)]">
              ~{status?.storageEstimateMb || 4.2} MB
            </div>
          </div>
        </div>

        {/* Feature Readiness Checklist */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-[var(--gold)] uppercase tracking-wider block">
            {isEnglish ? 'Feature Offline Availability' : 'حالة جاهزية المحتوى للعمل دون اتصال:'}
          </span>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {offlineFeatures.map((feat, idx) => (
              <div 
                key={idx}
                className="p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  {feat.isOffline ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <Radio className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                  <span className="font-bold text-[var(--text-main)]">
                    {isEnglish ? feat.titleEn : feat.titleAr}
                  </span>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  feat.isOffline 
                    ? 'bg-emerald-500/10 text-emerald-600' 
                    : 'bg-amber-500/10 text-amber-600'
                }`}>
                  {feat.isOffline ? (isEnglish ? 'Cached' : 'متاح محلياً') : (isEnglish ? 'Online' : 'أونلاين')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Storage Notice */}
        <div className="p-3.5 rounded-2xl bg-[var(--gold-light)]/30 border border-[var(--border-gold)]/50 flex items-start gap-2.5 text-xs text-[var(--text-muted)]">
          <ShieldCheck className="w-4 h-4 text-[var(--gold)] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            تم تضمين النصوص الشرعية الأساسية وقاعدة بيانات الأذكار داخل حزمة التطبيق لتعمل دائماً بسرعة وموثوقية حتى أثناء انقطاع الإنترنت أو وضع الطيران.
          </p>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]">
          <button
            onClick={handleClearCache}
            disabled={isClearing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isClearing ? (isEnglish ? 'Clearing...' : 'جاري التحديث...') : (isEnglish ? 'Clear Cache' : 'تحديث الذاكرة المؤقتة')}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[var(--primary-light)] text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--gold)] text-xs font-bold transition-colors"
          >
            {isEnglish ? 'Close' : 'إغلاق'}
          </button>
        </div>
      </div>
    </div>
  );
};
