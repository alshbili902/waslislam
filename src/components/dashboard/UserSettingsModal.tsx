import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Settings,
  X,
  User,
  Shield,
  Bell,
  Palette,
  Compass,
  Volume2,
  Check,
  Save
} from 'lucide-react';
import { UserProfile, UserSettings, NotificationSettings } from '../../types';
import { useModalScrollLock } from '../../hooks/useModalScrollLock';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  settings: UserSettings | null;
  notificationSettings: NotificationSettings;
  onSaveProfile: (updates: Partial<UserProfile>) => Promise<void>;
  onSaveSettings: (updates: Partial<UserSettings>) => Promise<void>;
  onSaveNotificationSettings: (updates: Partial<NotificationSettings>) => void;
}

export const UserSettingsModal: React.FC<UserSettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  settings,
  notificationSettings,
  onSaveProfile,
  onSaveSettings,
  onSaveNotificationSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'appearance' | 'prayer' | 'audio'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile fields state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [city, setCity] = useState(user?.city || 'مكة المكرمة');
  const [country, setCountry] = useState(user?.country || 'المملكة العربية السعودية');
  const [bio, setBio] = useState(user?.bio || '');

  // Preferences state
  const [theme, setTheme] = useState(settings?.theme || 'system');
  const [quranFontSize, setQuranFontSize] = useState(settings?.quranFontSize || 'medium');
  const [preferredReciter, setPreferredReciter] = useState(settings?.preferredReciter || 'ar.alafasy');
  const [prayerMethod, setPrayerMethod] = useState(settings?.prayerCalculationMethod || 'UmmAlQura');
  const [autoPlayAudio, setAutoPlayAudio] = useState(settings?.autoPlayAudio ?? true);

  useModalScrollLock(isOpen, {
    onClose,
    closeOnEsc: true,
  });

  if (!isOpen) return null;

  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await onSaveProfile({
        fullName,
        avatarUrl,
        city,
        country,
        bio,
        preferredReciter,
        prayerCalculationMethod: prayerMethod,
      });

      await onSaveSettings({
        theme,
        quranFontSize,
        preferredReciter,
        prayerCalculationMethod: prayerMethod,
        autoPlayAudio,
      });

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 700);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'الملف الشخصي', icon: User },
    { id: 'notifications', label: 'التنبيهات', icon: Bell },
    { id: 'appearance', label: 'المظهر والخط', icon: Palette },
    { id: 'prayer', label: 'مواقيت الصلاة', icon: Compass },
    { id: 'audio', label: 'الصوت والتلاوة', icon: Volume2 },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm wasl-modal-overlay animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onTouchMove={(e) => {
        if (e.target === e.currentTarget) e.preventDefault();
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white dark:bg-emerald-950 rounded-3xl shadow-2xl border border-emerald-900/10 dark:border-emerald-800/60 overflow-hidden flex flex-col max-h-[min(88dvh,calc(100dvh-3rem))] wasl-modal-overlay"
      >
        {/* Header (Sticky Top) */}
        <div className="sticky top-0 z-20 shrink-0 p-5 sm:p-6 border-b border-slate-100 dark:border-emerald-900/60 bg-white/95 dark:bg-emerald-950/95 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-800 dark:text-emerald-200">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white font-amiri">
                إِعْدَادَاتُ الحِسَابِ وَالمَنْصَّة
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                تخصيص تجربتك الشخصية في منصة وصل الإسلامية
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation (Sticky below Header) */}
        <div className="sticky top-[81px] z-10 shrink-0 flex items-center gap-1 px-5 py-2 border-b border-slate-100 dark:border-emerald-900/40 bg-slate-50/95 dark:bg-emerald-900/40 backdrop-blur-md overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto wasl-modal-scrollable p-5 sm:p-7 space-y-5">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-emerald-900/30 border border-slate-200 dark:border-emerald-800/60 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  رابط الصورة الرمزية (Avatar URL)
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  dir="ltr"
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-emerald-900/30 border border-slate-200 dark:border-emerald-800/60 text-slate-900 dark:text-white text-right"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    المدينة
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-emerald-900/30 border border-slate-200 dark:border-emerald-800/60 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    الدولة
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-emerald-900/30 border border-slate-200 dark:border-emerald-800/60 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  نبذة تعريفية (Bio)
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="اكتب نبذة قصيرة عن اهتماماتك وتلاوتك المفضلة..."
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-emerald-900/30 border border-slate-200 dark:border-emerald-800/60 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                حدد التنبيهات التي ترغب في تفعيلها يومياً:
              </p>
              {[
                { key: 'fajr', label: 'تنبيه أذان الفجر' },
                { key: 'dhuhr', label: 'تنبيه أذان الظهر' },
                { key: 'asr', label: 'تنبيه أذان العصر' },
                { key: 'maghrib', label: 'تنبيه أذان المغرب' },
                { key: 'isha', label: 'تنبيه أذان العشاء' },
                { key: 'morningAzkar', label: 'تذكير أذكار الصباح' },
                { key: 'eveningAzkar', label: 'تذكير أذكار المساء' },
                { key: 'dailyHadith', label: 'إشعار الحديث اليومي' },
                { key: 'dailyAyah', label: 'إشعار الآية اليومية' },
                { key: 'dailyWisdom', label: 'تذكير الحكمة اليومية (الحِكَم والمواعظ)' },
                { key: 'islamicEvents', label: 'المناسبات والشهور الهجرية' },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-emerald-900/25 border border-slate-200/80 dark:border-emerald-800/40 cursor-pointer"
                >
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {item.label}
                  </span>
                  <input
                    type="checkbox"
                    checked={Boolean((notificationSettings as any)[item.key])}
                    onChange={(e) =>
                      onSaveNotificationSettings({ [item.key]: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                </label>
              ))}
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                  المظهر العام
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'light', label: 'نهاري' },
                    { id: 'dark', label: 'ليلي' },
                    { id: 'system', label: 'تلقائي' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTheme(t.id as any)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        theme === t.id
                          ? 'bg-emerald-800 text-white border-emerald-700 shadow-xs'
                          : 'bg-slate-50 dark:bg-emerald-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-emerald-800/40'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                  حجم خط المصحف الشريف
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'small', label: 'صغير' },
                    { id: 'medium', label: 'متوسط' },
                    { id: 'large', label: 'كبير ومريح' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setQuranFontSize(s.id as any)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        quranFontSize === s.id
                          ? 'bg-emerald-800 text-white border-emerald-700 shadow-xs'
                          : 'bg-slate-50 dark:bg-emerald-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-emerald-800/40'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'prayer' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  طريقة حساب مواقيت الصلاة
                </label>
                <select
                  value={prayerMethod}
                  onChange={(e) => setPrayerMethod(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-emerald-900/30 border border-slate-200 dark:border-emerald-800/60 text-slate-900 dark:text-white"
                >
                  <option value="UmmAlQura">جامعة أم القرى، مكة المكرمة (الرسمي للمملكة)</option>
                  <option value="MWL">رابطة العالم الإسلامي (Muslim World League)</option>
                  <option value="Egyptian">الهيئة العامة المصرية للمساحة</option>
                  <option value="Karachi">جامعة العلوم الإسلامية بكراتشي</option>
                  <option value="ISNA">الجمعية الإسلامية لأمريكا الشمالية (ISNA)</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  المعيار المعتمد تلقائياً هو تقويم أم القرى بمكة المكرمة
                </p>
              </div>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  القارئ المفضل لتلاوة القرآن
                </label>
                <select
                  value={preferredReciter}
                  onChange={(e) => setPreferredReciter(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-emerald-900/30 border border-slate-200 dark:border-emerald-800/60 text-slate-900 dark:text-white"
                >
                  <option value="ar.alafasy">الشيخ مشاري راشد العفاسي</option>
                  <option value="ar.abdulbasitmurattal">الشيخ عبد الباسط عبد الصمد (مرتل)</option>
                  <option value="ar.minshawi">الشيخ محمد صديق المنشاوي</option>
                  <option value="ar.husary">الشيخ محمود خليل الحصري</option>
                  <option value="ar.mahermuaiqly">الشيخ ماهر المعيقلي</option>
                  <option value="ar.saadalghamidi">الشيخ سعد الغامدي</option>
                </select>
              </div>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-emerald-900/25 border border-slate-200/80 dark:border-emerald-800/40 cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    التشغيل التلقائي للآية التالية
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    متابعة التلاوة آلياً دون توقف أثناء الاستماع
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoPlayAudio}
                  onChange={(e) => setAutoPlayAudio(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </label>
            </div>
          )}
        </div>

        {/* Footer (Sticky Bottom) */}
        <div className="sticky bottom-0 z-20 shrink-0 p-4 sm:p-5 border-t border-slate-100 dark:border-emerald-900/60 flex items-center justify-between bg-slate-50/95 dark:bg-emerald-950/95 backdrop-blur-md">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            إلغاء
          </button>

          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-900/20 disabled:opacity-50 cursor-pointer transition-all"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : saveSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>تم الحفظ بنجاح!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>حفظ التعديلات</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
