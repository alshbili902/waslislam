'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Type, 
  Maximize, 
  Minimize, 
  Eye, 
  AlignJustify, 
  Check, 
  Sparkles,
  Sliders
} from 'lucide-react';
import { localStore } from '../../lib/supabase';

import { 
  ReadingPreferences, 
  DEFAULT_READING_PREFS 
} from '../../utils/readingPreferences.ts';
export type { ReadingPreferences };
export { DEFAULT_READING_PREFS };

interface ReadingPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEnglish?: boolean;
}

export const ReadingPreferencesModal: React.FC<ReadingPreferencesModalProps> = ({
  isOpen,
  onClose,
  isEnglish = false,
}) => {
  const [prefs, setPrefs] = useState<ReadingPreferences>(() => 
    localStore.get('user_reading_preferences', DEFAULT_READING_PREFS)
  );
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    localStore.set('user_reading_preferences', prefs);
  }, [prefs]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!isOpen) return null;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-label={isEnglish ? 'Reading Preferences' : 'تفضيلات القراءة والمصحف'}
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
              <Sliders className="w-5 h-5 pointer-events-none" />
            </span>
            <div>
              <h3 className="text-lg font-bold font-amiri text-[var(--text-main)]">
                {isEnglish ? 'Reading Preferences' : 'تفضيلات القراءة والمصحف'}
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                {isEnglish ? 'Customize font size, family, and layout' : 'تخصيص الخط، الحجم، وتباعد الأسطر لراحة العين'}
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

        {/* Font Size Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-main)]">
            <span className="flex items-center gap-1.5">
              <Type className="w-4 h-4 text-[var(--gold)]" />
              {isEnglish ? 'Font Size:' : 'حجم خط الآيات والمحتوى:'}
            </span>
            <span className="text-[var(--gold)] font-mono">{prefs.fontSize}px</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--text-muted)]">أ</span>
            <input
              type="range"
              min="18"
              max="36"
              step="2"
              value={prefs.fontSize}
              onChange={(e) => setPrefs(prev => ({ ...prev, fontSize: parseInt(e.target.value, 10) }))}
              className="flex-1 accent-[var(--gold)] cursor-pointer"
            />
            <span className="text-xl font-bold text-[var(--text-main)]">أ</span>
          </div>
        </div>

        {/* Font Family Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[var(--text-main)]">
            {isEnglish ? 'Arabic Typeface:' : 'نوع الخط العربي:'}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'amiri', nameAr: 'الخط الأميري (عثماني)', nameEn: 'Amiri' },
              { id: 'tajawal', nameAr: 'خط تجوال (عصري)', nameEn: 'Tajawal' },
              { id: 'system', nameAr: 'خط النظام الافتراضي', nameEn: 'System' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setPrefs(prev => ({ ...prev, fontFamily: f.id as any }))}
                className={`p-3 rounded-2xl border text-xs font-bold transition-all text-center ${
                  prefs.fontFamily === f.id
                    ? 'bg-[var(--gold-light)] border-[var(--border-gold)] text-[var(--gold)] shadow-sm'
                    : 'bg-[var(--bg-card-subtle)] border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--gold)]'
                }`}
              >
                {isEnglish ? f.nameEn : f.nameAr}
              </button>
            ))}
          </div>
        </div>

        {/* Line Height Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[var(--text-main)]">
            {isEnglish ? 'Line Spacing:' : 'تباعد الأسطر:'}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'normal', nameAr: 'عادي (متماسك)' },
              { id: 'relaxed', nameAr: 'مريح (مستحسن)' },
              { id: 'loose', nameAr: 'واسع (فسيح)' },
            ].map(l => (
              <button
                key={l.id}
                onClick={() => setPrefs(prev => ({ ...prev, lineHeight: l.id as any }))}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  prefs.lineHeight === l.id
                    ? 'bg-[var(--primary-light)] border-[var(--border-color)] text-[var(--text-primary)]'
                    : 'border-[var(--border-color)] text-[var(--text-muted)] hover:bg-[var(--bg-card-subtle)]'
                }`}
              >
                {l.nameAr}
              </button>
            ))}
          </div>
        </div>

        {/* Reading Width */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[var(--text-main)]">
            {isEnglish ? 'Reading Column Width:' : 'عرض عمود القراءة:'}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'compact', nameAr: 'ضيق (تركيز)' },
              { id: 'standard', nameAr: 'متوازن (موصى به)' },
              { id: 'full', nameAr: 'كامل العرض' },
            ].map(w => (
              <button
                key={w.id}
                onClick={() => setPrefs(prev => ({ ...prev, contentWidth: w.id as any }))}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  prefs.contentWidth === w.id
                    ? 'bg-[var(--primary-light)] border-[var(--border-color)] text-[var(--text-primary)]'
                    : 'border-[var(--border-color)] text-[var(--text-muted)] hover:bg-[var(--bg-card-subtle)]'
                }`}
              >
                {w.nameAr}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles: Distraction-free & Fullscreen */}
        <div className="pt-2 border-t border-[var(--border-color)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-bold text-[var(--text-main)]">
              <Eye className="w-4 h-4 text-[var(--gold)]" />
              {isEnglish ? 'Distraction-free mode' : 'وضع القراءة الخالي من المشتتات'}
            </span>
            <input
              type="checkbox"
              checked={prefs.distractionFree}
              onChange={(e) => setPrefs(prev => ({ ...prev, distractionFree: e.target.checked }))}
              className="w-5 h-5 accent-[var(--gold)] rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-bold text-[var(--text-main)]">
              {isFullscreen ? <Minimize className="w-4 h-4 text-[var(--gold)]" /> : <Maximize className="w-4 h-4 text-[var(--gold)]" />}
              {isEnglish ? 'Full-screen Reading' : 'القراءة في وضع ملء الشاشة'}
            </span>
            <button
              onClick={toggleFullscreen}
              className="px-3 py-1 rounded-xl text-xs font-bold border border-[var(--border-color)] hover:border-[var(--gold)] bg-[var(--bg-card-subtle)] text-[var(--text-main)]"
            >
              {isFullscreen ? (isEnglish ? 'Exit' : 'خروج') : (isEnglish ? 'Enter' : 'تفعيل')}
            </button>
          </div>
        </div>

        {/* Preview box */}
        <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-center space-y-1">
          <span className="text-[10px] text-[var(--text-muted)] block">معاينة الخط والحجم المختارين:</span>
          <p 
            className="font-amiri font-bold text-[var(--text-main)] transition-all leading-relaxed"
            style={{ fontSize: `${prefs.fontSize}px` }}
          >
            ﴿ وَقُل رَّبِّ زِدْنِي عِلْمًا ﴾
          </p>
        </div>

        {/* Footer Done button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-[var(--emerald-deep)] to-[var(--primary-dark)] text-white text-xs font-bold shadow-md hover:opacity-95 transition-all"
        >
          {isEnglish ? 'Done & Save Preferences' : 'حفظ التفضيلات واعتمادها'}
        </button>
      </div>
    </div>
  );
};
