'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sliders, 
  Sparkles, 
  Eye, 
  RotateCcw, 
  Check, 
  ShieldCheck,
  Type,
  Sun,
  Moon
} from 'lucide-react';
import { accessibilityManager, AccessibilitySettings } from '../../utils/accessibilityManager';

interface AccessibilitySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEnglish: boolean;
  onSettingsChanged?: (settings: AccessibilitySettings) => void;
}

export const AccessibilitySettingsModal: React.FC<AccessibilitySettingsModalProps> = ({
  isOpen,
  onClose,
  isEnglish,
  onSettingsChanged
}) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => accessibilityManager.getSettings());

  useEffect(() => {
    if (isOpen) {
      setSettings(accessibilityManager.getSettings());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleSeniorMode = () => {
    const nextSenior = !settings.isSeniorMode;
    const updated = accessibilityManager.updateSettings({
      isSeniorMode: nextSenior,
      fontSizeScale: nextSenior ? 1.3 : 1.0,
      isHighContrast: nextSenior,
      isSimplifiedNav: nextSenior
    });
    setSettings(updated);
    if (onSettingsChanged) onSettingsChanged(updated);
  };

  const handleScaleChange = (scale: number) => {
    const updated = accessibilityManager.updateSettings({ fontSizeScale: scale });
    setSettings(updated);
    if (onSettingsChanged) onSettingsChanged(updated);
  };

  const handleToggleHighContrast = () => {
    const updated = accessibilityManager.updateSettings({ isHighContrast: !settings.isHighContrast });
    setSettings(updated);
    if (onSettingsChanged) onSettingsChanged(updated);
  };

  const handleToggleReducedMotion = () => {
    const updated = accessibilityManager.updateSettings({ isReducedMotion: !settings.isReducedMotion });
    setSettings(updated);
    if (onSettingsChanged) onSettingsChanged(updated);
  };

  const handleReset = () => {
    const reset = accessibilityManager.resetDefaults();
    setSettings(reset);
    if (onSettingsChanged) onSettingsChanged(reset);
  };

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-label={isEnglish ? 'Accessibility & Senior Mode' : 'وضع كبار السن وسهولة الاستخدام'}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-[var(--bg-card)] border-2 border-[var(--gold)] rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-[var(--gold)] pointer-events-none" />
            <h2 className="text-xl font-bold text-[var(--text-main)]">
              {isEnglish ? 'Accessibility & Senior Mode' : 'وضع كبار السن وسهولة الاستخدام'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)] transition-colors cursor-pointer touch-manipulation"
            aria-label="Close"
          >
            <X className="w-5 h-5 pointer-events-none" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-5 text-sm">
          {/* Main Toggle */}
          <div className="p-4 rounded-xl bg-[var(--bg-main)] border-2 border-[var(--border-color)] flex items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-[var(--text-main)]">
                تفعيل وضع كبار السن الشامل
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                تكبير الخطوط، توسيع مساحات الأزرار (أكثر من 48 بكسل)، وتفعيل التباين العالي والشريط المبسط.
              </p>
            </div>
            <button
              onClick={handleToggleSeniorMode}
              className={`w-14 h-8 rounded-full transition-colors relative shrink-0 ${
                settings.isSeniorMode ? 'bg-[var(--gold)]' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full bg-white absolute top-1 transition-transform ${
                  settings.isSeniorMode ? 'right-1' : 'right-7'
                }`}
              />
            </button>
          </div>

          {/* Font Scale Control */}
          <div className="space-y-2">
            <label className="font-bold text-xs text-[var(--text-main)] block">
              حجم الخط وتكبير النصوص:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { scale: 1.0, label: 'عادي (100%)' },
                { scale: 1.25, label: 'كبير (125%)' },
                { scale: 1.5, label: 'أكبر (150%)' }
              ].map(item => (
                <button
                  key={item.scale}
                  onClick={() => handleScaleChange(item.scale)}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs border-2 transition-all ${
                    settings.fontSizeScale === item.scale
                      ? 'bg-[var(--gold)] text-black border-[var(--gold)]'
                      : 'bg-[var(--bg-main)] text-[var(--text-main)] border-[var(--border-color)] hover:border-[var(--gold)]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* High Contrast Mode Toggle */}
          <div className="p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xs text-[var(--text-main)]">التباين اللوني العالي (High Contrast)</h4>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">حدود عريضة وواضحة وتباين داكن للنصوص المريحة للعين</p>
            </div>
            <button
              onClick={handleToggleHighContrast}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                settings.isHighContrast ? 'bg-emerald-500 text-white' : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)]'
              }`}
            >
              {settings.isHighContrast ? 'مفعل' : 'معطل'}
            </button>
          </div>

          {/* Reduced Motion Toggle */}
          <div className="p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xs text-[var(--text-main)]">تقليل الحركة والانتقالات السريعة</h4>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">إلغاء المؤثرات الحركية لمن يعانون من الدوار البصري</p>
            </div>
            <button
              onClick={handleToggleReducedMotion}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                settings.isReducedMotion ? 'bg-emerald-500 text-white' : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)]'
              }`}
            >
              {settings.isReducedMotion ? 'مفعل' : 'معطل'}
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)] text-xs">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-[var(--text-muted)] hover:text-rose-500 font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>استعادة الإعدادات الافتراضية</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[var(--gold)] text-black font-bold hover:opacity-90 transition-opacity"
          >
            حفظ وإغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
