'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Clock, 
  Calendar, 
  Heart, 
  Bell, 
  Compass, 
  CheckCircle2, 
  ShieldCheck, 
  Volume2, 
  Sliders
} from 'lucide-react';
import { IconTasbeeh, IconPrayerMihrab } from '../icons/IslamicIcons';
import { YawmiDashboard } from './YawmiDashboard';
import { DigitalTasbeeh } from './DigitalTasbeeh';
import { SmartIslamicCalendar } from './SmartIslamicCalendar';
import { DailyWorshipTools } from '../DailyWorshipTools';
import { type CityCoordinate } from '../../utils/prayerTimes';
import { format12HourTime } from '../../utils/timeFormat';
import { 
  getReminderPreferences, 
  saveReminderPreferences, 
  requestNotificationPermission,
  ReminderPreferences 
} from '../../utils/reminderService';

interface DailyWorshipHubProps {
  selectedCity: CityCoordinate;
  onChangeCity: (city: CityCoordinate) => void;
  isEnglish: boolean;
  onOpenQuran?: () => void;
  onOpenShareCard?: (content: any) => void;
}

export type WorshipSubTab = 'yawmi' | 'prayer' | 'tasbeeh' | 'calendar' | 'reminders';

export const DailyWorshipHub: React.FC<DailyWorshipHubProps> = ({
  selectedCity,
  onChangeCity,
  isEnglish,
  onOpenQuran,
  onOpenShareCard
}) => {
  const [activeTab, setActiveTab] = useState<WorshipSubTab>('yawmi');
  const [reminderPrefs, setReminderPrefs] = useState<ReminderPreferences>(() => getReminderPreferences());
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unknown'>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unknown';
  });

  const handleToggleGlobalReminders = async () => {
    if (!reminderPrefs.isGlobalEnabled) {
      const granted = await requestNotificationPermission();
      if (typeof window !== 'undefined' && 'Notification' in window) {
        setPermissionStatus(Notification.permission);
      }
      if (!granted) {
        alert(isEnglish 
          ? 'Notification permission is required to receive reminders.' 
          : 'يتطلب تفعيل التنبيهات منح الإذن من المتصفح أو التطبيق.');
        return;
      }
    }
    
    const updated = {
      ...reminderPrefs,
      isGlobalEnabled: !reminderPrefs.isGlobalEnabled
    };
    setReminderPrefs(updated);
    saveReminderPreferences(updated);
  };

  const handleToggleCategory = (catId: string) => {
    const updated = {
      ...reminderPrefs,
      categories: {
        ...reminderPrefs.categories,
        [catId]: {
          ...reminderPrefs.categories[catId],
          isEnabled: !reminderPrefs.categories[catId]?.isEnabled
        }
      }
    };
    setReminderPrefs(updated);
    saveReminderPreferences(updated);
  };

  const tabs: { id: WorshipSubTab; labelAr: string; labelEn: string; icon: React.ReactNode }[] = [
    { id: 'yawmi', labelAr: 'يومي مع وصل', labelEn: 'Daily Worship', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'prayer', labelAr: 'الصلاة والقبلة', labelEn: 'Prayer & Qibla', icon: <IconPrayerMihrab className="w-4 h-4" /> },
    { id: 'tasbeeh', labelAr: 'المسبحة الذكية', labelEn: 'Digital Tasbeeh', icon: <IconTasbeeh className="w-4 h-4" /> },
    { id: 'calendar', labelAr: 'التقويم وصيام التطوع', labelEn: 'Calendar & Fasting', icon: <Calendar className="w-4 h-4" /> },
    { id: 'reminders', labelAr: 'التذكيرات والإشعارات', labelEn: 'Reminders', icon: <Bell className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-navigation Ribbon */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-[var(--border-color)]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-[var(--emerald-deep)] to-[var(--primary-dark)] text-white border-[var(--border-gold)] shadow-sm'
                  : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-color)] hover:border-[var(--gold)] hover:text-[var(--text-main)]'
              }`}
            >
              {tab.icon}
              <span>{isEnglish ? tab.labelEn : tab.labelAr}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: يومي مع وصل (Yawmi Ma'a Wasl) */}
      {activeTab === 'yawmi' && (
        <YawmiDashboard
          selectedCity={selectedCity}
          isEnglish={isEnglish}
          onOpenQuran={onOpenQuran}
        />
      )}

      {/* Tab 2: الصلاة والقبلة (Prayer & Qibla) */}
      {activeTab === 'prayer' && (
        <DailyWorshipTools
          selectedCity={selectedCity}
          onChangeCity={onChangeCity}
          isEnglish={isEnglish}
        />
      )}

      {/* Tab 3: المسبحة الإلكترونية (Digital Tasbeeh) */}
      {activeTab === 'tasbeeh' && (
        <DigitalTasbeeh isEnglish={isEnglish} />
      )}

      {/* Tab 4: التقويم وصيام التطوع (Smart Islamic Calendar) */}
      {activeTab === 'calendar' && (
        <SmartIslamicCalendar isEnglish={isEnglish} />
      )}

      {/* Tab 5: التذكيرات والإشعارات (Smart Reminders) */}
      {activeTab === 'reminders' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            {/* Title & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-2.5 rounded-xl bg-[var(--gold-light)] text-[var(--gold)]">
                    <Bell className="w-5 h-5" />
                  </span>
                  <h3 className="text-xl font-bold font-amiri text-[var(--text-main)]">
                    {isEnglish ? 'Smart Islamic Reminders' : 'التذكيرات والإشعارات الذكية'}
                  </h3>
                </div>
                <p className="text-xs text-[var(--text-muted)] font-tajawal">
                  {isEnglish 
                    ? 'Configure prayer notifications, Adhkar reminders, and voluntary fasting alerts' 
                    : 'اضبط تنبيهات الصلوات، أذكار الصباح والمساء، والورد القرآني وصيام التطوع بدقة وأمان'}
                </p>
              </div>

              {/* Master Toggle */}
              <button
                onClick={handleToggleGlobalReminders}
                className={`px-5 py-2.5 rounded-2xl text-xs font-bold border transition-all flex items-center gap-2 shadow-sm ${
                  reminderPrefs.isGlobalEnabled
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)] border-[var(--border-color)] hover:border-[var(--gold)]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {reminderPrefs.isGlobalEnabled
                    ? (isEnglish ? 'Reminders Active' : 'التذكيرات مفعلة')
                    : (isEnglish ? 'Enable Reminders' : 'تفعيل التذكيرات')}
                </span>
              </button>
            </div>

            {/* Permission banner */}
            {permissionStatus === 'denied' && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-medium">
                {isEnglish 
                  ? 'Notifications are blocked in your browser settings. Please allow notifications for this site to receive timely alerts.' 
                  : 'تنبيه: الإشعارات محظورة في إعدادات المتصفح لديك. يرجى السماح بالإشعارات من شريط العنوان لتصلك التذكيرات في وقتها.'}
              </div>
            )}

            {/* Categories List */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--gold)]">
                {isEnglish ? 'Reminder Categories' : 'أقسام التذكيرات المتاحة'}
              </h4>

              {Object.values(reminderPrefs.categories).map((cat) => (
                <div
                  key={cat.id}
                  className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] flex items-center justify-between gap-4 transition-all hover:border-[var(--border-gold)]/40"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[var(--text-main)]">
                        {isEnglish ? cat.nameEn : cat.nameAr}
                      </span>
                      {cat.scheduledTime && (
                        <span className="px-2 py-0.5 rounded-md bg-[var(--bg-card)] border border-[var(--border-color)] text-[10px] font-mono text-[var(--text-muted)]">
                          {format12HourTime(cat.scheduledTime, isEnglish)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-muted)] font-tajawal">
                      {cat.descriptionAr}
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={cat.isEnabled && reminderPrefs.isGlobalEnabled}
                    disabled={!reminderPrefs.isGlobalEnabled}
                    onChange={() => handleToggleCategory(cat.id)}
                    className="w-5 h-5 accent-[var(--gold)] rounded cursor-pointer disabled:opacity-40"
                    aria-label={`Toggle ${cat.nameAr}`}
                  />
                </div>
              ))}
            </div>

            {/* Quiet Hours Settings */}
            <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-[var(--text-main)]">
                    {isEnglish ? 'Quiet Hours' : 'ساعات الهدوء والسكينة (عدم الإزعاج)'}
                  </span>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {isEnglish ? 'Silence non-urgent alerts during sleep' : 'إيقاف التنبيهات غير العاجلة أثناء ساعات النوم والراحة'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={reminderPrefs.quietHoursEnabled}
                  onChange={(e) => {
                    const updated = { ...reminderPrefs, quietHoursEnabled: e.target.checked };
                    setReminderPrefs(updated);
                    saveReminderPreferences(updated);
                  }}
                  className="w-5 h-5 accent-[var(--gold)] rounded cursor-pointer"
                />
              </div>

              {reminderPrefs.quietHoursEnabled && (
                <div className="flex items-center gap-4 text-xs font-semibold text-[var(--text-muted)] pt-2 border-t border-[var(--border-color)]">
                  <span>{isEnglish ? 'From:' : 'من:'} {format12HourTime(reminderPrefs.quietHoursStart, isEnglish)}</span>
                  <span>{isEnglish ? 'To:' : 'إلى:'} {format12HourTime(reminderPrefs.quietHoursEnd, isEnglish)}</span>
                </div>
              )}
            </div>

            {/* Privacy & Technical Notice */}
            <div className="flex items-start gap-2.5 text-xs text-[var(--text-muted)] pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                {isEnglish 
                  ? 'All reminder calculations run privately on your device. We do not track your location or share your notifications with third parties.' 
                  : 'تتم كافة حسابات التنبيهات محلياً على جهازك دون إرسال بياناتك أو موقعك إلى أي خوادم خارجية.'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
