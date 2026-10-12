'use client';

import React from 'react';
import { 
  BookOpen, 
  History, 
  Volume2, 
  Heart, 
  Clock, 
  Bookmark, 
  Settings, 
  Sparkles, 
  Sun, 
  Moon, 
  SlidersHorizontal,
  Home
} from 'lucide-react';
import { NavTab } from '../Navbar';
import { ThemeMode } from '../../utils/theme';
import { accessibilityManager, AccessibilitySettings } from '../../utils/accessibilityManager';

interface SeniorFriendlyNavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onDisableSeniorMode: () => void;
  isEnglish: boolean;
}

export const SeniorFriendlyNavbar: React.FC<SeniorFriendlyNavbarProps> = ({
  currentTab,
  onSelectTab,
  theme,
  onToggleTheme,
  onOpenSettings,
  onDisableSeniorMode,
  isEnglish
}) => {
  const navItems = [
    { tab: 'home' as NavTab, labelAr: 'الرئيسية', icon: Home },
    { tab: 'quran' as NavTab, labelAr: 'المصحف الشريف', icon: BookOpen },
    { tab: 'worship' as NavTab, labelAr: 'الأذكار والصلوات', icon: Heart },
    { tab: 'library' as NavTab, labelAr: 'مكتبتي المحفوظة', icon: Bookmark },
  ];

  return (
    <nav 
      aria-label="شريط تصفح وضع كبار السن وسهولة الاستخدام"
      className="sticky top-0 z-40 bg-[var(--bg-card)] border-b-2 border-[var(--gold)] shadow-lg px-3 sm:px-4 py-2.5 sm:py-3 w-full max-w-full overflow-hidden"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-3 w-full min-w-0">
        {/* Mode Notification Banner */}
        <div className="flex items-center justify-between w-full md:w-auto gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-xs sm:text-sm md:text-base font-extrabold text-[var(--gold)] truncate">
              وضع كبار السن وسهولة القراءة نشط
            </span>
          </div>

          <button
            onClick={onDisableSeniorMode}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[var(--bg-main)] border-2 border-[var(--border-color)] hover:border-[var(--gold)] text-xs md:text-sm font-bold text-[var(--text-main)] transition-colors shrink-0"
          >
            العودة للوضع العادي
          </button>
        </div>

        {/* Big Buttons Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center w-full md:w-auto min-w-0">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => onSelectTab(item.tab)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm md:text-base transition-all ${
                  isActive
                    ? 'bg-[var(--gold)] text-black shadow-md border-2 border-[var(--gold)]'
                    : 'bg-[var(--bg-main)] text-[var(--text-main)] border-2 border-[var(--border-color)] hover:border-[var(--gold)]'
                }`}
                style={{ minHeight: '44px' }}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span className="truncate">{item.labelAr}</span>
              </button>
            );
          })}

          {/* Theme Quick Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2.5 sm:p-3 rounded-xl bg-[var(--bg-main)] border-2 border-[var(--border-color)] text-[var(--text-main)] hover:border-[var(--gold)] transition-colors shrink-0"
            title="تبديل الإضاءة"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />}
          </button>

          {/* Accessibility Settings */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl bg-[var(--bg-main)] border-2 border-[var(--border-color)] text-[var(--text-main)] hover:border-[var(--gold)] text-xs sm:text-sm font-bold transition-colors shrink-0"
            title="خيارات سهولة الاستخدام والخط"
            style={{ minHeight: '44px' }}
          >
            <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span>خيارات العرض</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
