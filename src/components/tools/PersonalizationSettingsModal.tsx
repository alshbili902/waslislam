'use client';

import React, { useState } from 'react';
import { 
  Sliders, 
  Eye, 
  RotateCcw, 
  CheckCircle2, 
  Type, 
  Layout, 
  Sparkles, 
  X, 
  Volume2, 
  Sun, 
  Moon, 
  Layers,
  Compass
} from 'lucide-react';
import { localStore } from '../../lib/supabase';
import { RECITERS } from '../../data/quranMetadata';
import { ThemeMode, resolveSafeTheme } from '../../utils/theme';

import { 
  PersonalizationPreferences, 
  DEFAULT_PREFERENCES, 
  personalizationManager 
} from '../../utils/personalizationManager';
export type { PersonalizationPreferences };
export { personalizationManager };

interface PersonalizationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEnglish: boolean;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

export const PersonalizationSettingsModal: React.FC<PersonalizationSettingsModalProps> = ({
  isOpen,
  onClose,
  isEnglish,
  theme,
  onThemeChange
}) => {
  const [prefs, setPrefs] = useState<PersonalizationPreferences>(() => personalizationManager.getPreferences());
  const [savedFeedback, setSavedFeedback] = useState(false);

  if (!isOpen) return null;

  const handleUpdate = <K extends keyof PersonalizationPreferences>(key: K, val: PersonalizationPreferences[K]) => {
    const updated = { ...prefs, [key]: val };
    setPrefs(updated);
    personalizationManager.savePreferences(updated);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const handleResetDefaults = () => {
    if (confirm(isEnglish ? 'Are you sure you want to reset appearance settings to default?' : 'هل أنت متأكد من رغبتك في إعادة ضبط تفضيلات المظهر إلى الإعدادات الافتراضية؟ (لن يتم المساس بتقدمك في القرآن أو ملاحظاتك)')) {
      const reset = personalizationManager.resetPreferences();
      setPrefs(reset);
      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 2000);
    }
  };

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-label={isEnglish ? 'Personalize Wasl Experience' : 'خصّص تجربة وَصْل'}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[var(--gold-light)] text-[var(--gold)]">
              <Sliders className="w-5 h-5 pointer-events-none" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[var(--text-main)] font-cairo">
                {isEnglish ? 'Personalize Wasl Experience' : 'خصّص تجربة وَصْل'}
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                تكييف واجهة التطبيق والخطوط والصفحة الرئيسية وفق احتياجاتك
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {savedFeedback && (
              <span className="text-xs text-emerald-600 font-bold animate-fade-in flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 pointer-events-none" />
                <span>تم الحفظ</span>
              </span>
            )}
            <button
              onClick={onClose}
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)] transition-colors cursor-pointer touch-manipulation"
              aria-label="Close"
            >
              <X className="w-5 h-5 pointer-events-none" />
            </button>
          </div>
        </div>

        {/* 1. Dashboard Sections Toggles */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-[var(--text-main)] flex items-center gap-2">
            <Layout className="w-4 h-4 text-[var(--gold)]" />
            <span>تخصيص أقسام الصفحة الرئيسية (الظهور والإخفاء):</span>
          </h4>

          <div className="space-y-2 text-xs">
            {[
              { key: 'showRamadanCountdown' as const, label: 'عداد الأيام المتبقية على شهر رمضان المبارك' },
              { key: 'showPrayerTimesWidget' as const, label: 'بطاقة مواقيت الصلاة والعد التنازلي للأذان' },
              { key: 'showDailyHadith' as const, label: 'بطاقة الحديث النبوي الشريف اليومي' },
              { key: 'showDailyDhikr' as const, label: 'بطاقة الذكر المأثور اليومي' },
              { key: 'showKhatmahBanner' as const, label: 'شريط متابعة الختمة القرآنية السريع' },
            ].map(item => (
              <label 
                key={item.key}
                className="flex items-center justify-between p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] cursor-pointer hover:border-[var(--primary)] transition-colors"
              >
                <span className="text-[var(--text-main)]">{item.label}</span>
                <input
                  type="checkbox"
                  checked={prefs[item.key]}
                  onChange={e => handleUpdate(item.key, e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
              </label>
            ))}
          </div>
        </div>

        {/* 2. Default Landing Tab */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[var(--text-main)] block">
            القسم الافتراضي عند فتح التطبيق:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {[
              { id: 'home', label: 'الرئيسية' },
              { id: 'quran', label: 'المصحف الشريف' },
              { id: 'worship', label: 'عبادتي والأذكار' },
              { id: 'kids', label: 'عالم الصغار' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => handleUpdate('defaultTab', t.id)}
                className={`py-2 px-3 rounded-xl font-bold transition-all ${
                  prefs.defaultTab === t.id
                    ? 'bg-[var(--primary)] text-white shadow-sm'
                    : 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)] border border-[var(--border-color)]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Quran Typography Preferences */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-[var(--text-main)] flex items-center gap-2">
            <Type className="w-4 h-4 text-emerald-500" />
            <span>تخصيص خط وحجم المصحف الشريف:</span>
          </h4>

          {/* Font Family */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[
              { id: 'amiri' as const, label: 'خط أميري قرآني' },
              { id: 'scheherazade' as const, label: 'خط شهرزاد المعتمد' },
              { id: 'cairo' as const, label: 'خط كايرو الحديث' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => handleUpdate('quranFontFamily', f.id)}
                className={`py-2 px-3 rounded-xl font-bold transition-all ${
                  prefs.quranFontFamily === f.id
                    ? 'bg-[var(--gold)] text-black font-black shadow-sm'
                    : 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)] border border-[var(--border-color)]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Font Size Slider */}
          <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span>حجم الخط القرآني:</span>
              <span className="font-mono text-[var(--primary)]">{prefs.quranFontSize}px</span>
            </div>
            <input
              type="range"
              min={20}
              max={38}
              value={prefs.quranFontSize}
              onChange={e => handleUpdate('quranFontSize', parseInt(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />

            {/* Live Preview */}
            <div className="mt-3 p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-center">
              <p 
                style={{ 
                  fontSize: `${prefs.quranFontSize}px`, 
                  lineHeight: prefs.quranLineHeight,
                  fontFamily: prefs.quranFontFamily === 'amiri' ? 'var(--font-amiri), serif' : 'var(--font-cairo), sans-serif'
                }}
                className="text-[var(--text-main)] font-bold transition-all"
              >
                ﴿إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ﴾
              </p>
            </div>
          </div>
        </div>

        {/* 4. Preferred Quran Reciter */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[var(--text-main)] flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-purple-500" />
            <span>القارئ المفضل لتلاوة الآيات:</span>
          </label>
          <select
            value={prefs.preferredReciterId}
            onChange={e => handleUpdate('preferredReciterId', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-main)] text-xs font-bold focus:outline-none focus:border-[var(--primary)]"
          >
            {RECITERS.map(r => (
              <option key={r.id} value={r.id}>
                {r.nameAr} ({r.style})
              </option>
            ))}
          </select>
        </div>

        {/* 5. Theme & Accessibility */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-[var(--text-main)] flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-500" />
            <span>المظهر وإمكانية الوصول:</span>
          </h4>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onThemeChange('light')}
              className={`p-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                theme === 'light'
                  ? 'bg-amber-500/10 border-amber-500 text-amber-700'
                  : 'bg-[var(--bg-card-subtle)] border-[var(--border-color)] text-[var(--text-muted)]'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <span>الوضع النهاري الفاتح</span>
            </button>

            <button
              onClick={() => onThemeChange('dark')}
              className={`p-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                theme === 'dark'
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                  : 'bg-[var(--bg-card-subtle)] border-[var(--border-color)] text-[var(--text-muted)]'
              }`}
            >
              <Moon className="w-4 h-4 text-blue-400" />
              <span>الوضع الليلي الداكن</span>
            </button>
          </div>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] cursor-pointer text-xs">
            <span className="text-[var(--text-main)]">تقليل الحركة والانتقالات (Reduced Motion)</span>
            <input
              type="checkbox"
              checked={prefs.reducedMotion}
              onChange={e => handleUpdate('reducedMotion', e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
            />
          </label>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
          <button
            onClick={handleResetDefaults}
            className="px-4 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>استعادة الإعدادات الأصلية</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[var(--primary)] text-white text-xs font-bold hover:bg-[var(--primary-dark)] transition-colors shadow-sm"
          >
            تم
          </button>
        </div>
      </div>
    </div>
  );
};
