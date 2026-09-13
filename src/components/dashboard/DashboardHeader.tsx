import React from 'react';
import { motion } from 'motion/react';
import {
  Bell,
  Sun,
  Moon,
  Settings,
  Calendar as CalendarIcon,
  Sparkles,
  LogOut,
  User as UserIcon,
  Flame
} from 'lucide-react';
import { UserProfile, UserStreak } from '../../types';

interface DashboardHeaderProps {
  user: UserProfile | null;
  streak: UserStreak;
  unreadCount: number;
  hijriDateFormatted: string;
  gregorianDateFormatted: string;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onSignOut: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  streak,
  unreadCount,
  hijriDateFormatted,
  gregorianDateFormatted,
  isDarkMode,
  onToggleTheme,
  onOpenNotifications,
  onOpenSettings,
  onOpenProfile,
  onSignOut,
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) return 'صباح الخير والبركة';
    if (hour >= 12 && hour < 17) return 'طاب يومك بذكر الله';
    if (hour >= 17 && hour < 22) return 'مساء الخير والسكينة';
    return 'ليلة مباركة عامرة بالذكر';
  };

  return (
    <div className="bg-white dark:bg-emerald-950/80 rounded-3xl p-5 sm:p-7 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm relative overflow-hidden backdrop-blur-md">
      {/* Decorative Islamic Background Ornament Pattern */}
      <div className="absolute left-0 top-0 bottom-0 w-80 pointer-events-none opacity-5 dark:opacity-10 overflow-hidden">
        <svg viewBox="0 0 200 200" className="w-full h-full fill-current text-emerald-800 dark:text-emerald-400">
          <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="3" />
          <polygon points="100,20 180,100 100,180 20,100" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
        {/* User Profile Info & Greeting */}
        <div className="flex items-center gap-4">
          <div
            onClick={onOpenProfile}
            className="relative cursor-pointer group shrink-0"
            title="انقر لتعديل الملف الشخصي"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 p-0.5 shadow-md shadow-emerald-900/15 group-hover:scale-105 transition-transform">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user?.fullName || 'الصورة الشخصية'}
                  className="w-full h-full rounded-[14px] object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-[14px] bg-emerald-900 flex items-center justify-center text-amber-300 font-bold text-2xl font-amiri" title={user?.fullName || 'الملف الشخصي'}>
                  {user?.fullName ? user.fullName[0] : <UserIcon className="w-6 h-6 sm:w-7 sm:h-7 text-amber-300/80" />}
                </div>
              )}
            </div>
            {/* Streak mini badge */}
            <div className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center gap-0.5 shadow-xs border border-white dark:border-emerald-950">
              <Flame className="w-3 h-3 fill-white" />
              <span>{streak.currentStreak}</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                {getGreeting()}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-bold">
                حساب موثق
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-amiri">
                {user?.fullName ? `مرحبًا ${user.fullName}` : 'مرحبًا بك'}
              </h1>
              {user?.username && (
                <span className="text-xs font-mono text-emerald-700 dark:text-amber-300 font-semibold bg-emerald-50 dark:bg-emerald-900/40 px-2 py-0.5 rounded-lg" dir="ltr">
                  @{user.username}
                </span>
              )}
            </div>

            {/* Date Display */}
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="text-emerald-800 dark:text-amber-300 font-semibold flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-amber-400" />
                {hijriDateFormatted}
              </span>
              <span>•</span>
              <span>{gregorianDateFormatted}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          {/* Notifications button */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onOpenNotifications}
            className="relative p-2.5 rounded-2xl bg-slate-50 dark:bg-emerald-900/40 border border-slate-200 dark:border-emerald-800/60 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-800/50 transition-colors"
            title="التنبيهات والإشعارات"
          >
            <Bell className="w-5 h-5 text-emerald-700 dark:text-emerald-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs border-2 border-white dark:border-emerald-950 animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </motion.button>

          {/* Theme toggle */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onToggleTheme}
            className="p-2.5 rounded-2xl bg-slate-50 dark:bg-emerald-900/40 border border-slate-200 dark:border-emerald-800/60 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-800/50 transition-colors"
            title={isDarkMode ? 'الوضع النهاري' : 'الوضع الليلي'}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-emerald-800" />
            )}
          </motion.button>

          {/* Settings shortcut */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onOpenSettings}
            className="p-2.5 rounded-2xl bg-slate-50 dark:bg-emerald-900/40 border border-slate-200 dark:border-emerald-800/60 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-800/50 transition-colors"
            title="الإعدادات الشخصية"
          >
            <Settings className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </motion.button>

          {/* Sign Out */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onSignOut}
            className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
            title="تسجيل الخروج"
          >
            <LogOut className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};
