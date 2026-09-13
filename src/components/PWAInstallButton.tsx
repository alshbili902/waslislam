import React, { useState } from 'react';
import { Download, Share2, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useModalScrollLock } from '../hooks/useModalScrollLock';

interface Props {
  variant?: 'header' | 'hero' | 'banner' | 'icon';
}

export const PWAInstallButton: React.FC<Props> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useModalScrollLock(showIOSGuide, {
    onClose: () => setShowIOSGuide(false),
  });

  if (isInstalled) {
    return null;
  }

  // Standard Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'icon') {
      return (
        <button
          onClick={install}
          title="تثبيت التطبيق"
          className="p-2 rounded-xl text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
        >
          <Download className="w-5 h-5" />
        </button>
      );
    }

    if (variant === 'hero') {
      return (
        <button
          onClick={install}
          className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-medium text-sm shadow-md hover:shadow-lg hover:brightness-105 active:scale-95 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>تثبيت تطبيق وصل على جهازك</span>
        </button>
      );
    }

    return (
      <button
        onClick={install}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-700 text-white font-medium text-xs hover:bg-emerald-800 active:scale-95 transition-all shadow-sm"
      >
        <Download className="w-3.5 h-3.5" />
        <span>تثبيت التطبيق</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-600/30 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs font-medium hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>تثبيت على آيفون</span>
        </button>

        {showIOSGuide && (
          <div className="wasl-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200 overscroll-contain" onClick={() => setShowIOSGuide(false)}>
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-emerald-950 p-6 shadow-2xl border border-emerald-100 dark:border-emerald-800 text-right overscroll-contain" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-900/60 mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <img src="/brand/logo-icon.webp" alt="وصل الإسلامية" className="w-6 h-6 rounded-lg object-contain shrink-0" />
                  <span>تثبيت تطبيق وصل على آيفون / آيباد</span>
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <ol className="space-y-3.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed list-decimal list-inside">
                <li className="flex items-start gap-2">
                  <Share2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>اضغط على زر <strong>المشاركة (Share)</strong> في أسفل متصفح سفاري.</span>
                </li>
                <li>
                  <span>مرر القائمة للأسفل واضغط على <strong>إضافة إلى الشاشة الرئيسية (Add to Home Screen)</strong>.</span>
                </li>
                <li>
                  <span>اضغط على <strong>إضافة (Add)</strong> في الزاوية العلوية لاستخدام التطبيق دون اتصال.</span>
                </li>
              </ol>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
              >
                حسناً، فهمت
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
