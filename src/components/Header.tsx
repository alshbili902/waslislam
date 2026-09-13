import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Menu,
  X,
  Search,
  Moon,
  Sun,
  BookOpen,
  Compass,
  Sparkles,
  Clock,
  Calendar,
  Layers,
  Heart,
  User,
  ShieldCheck,
  Flame,
  HelpCircle,
  Radio,
  LogIn,
  HandHeart,
  Award,
  CheckCircle2
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { BrandLogo } from './brand/BrandLogo';
import { useUser } from '../context/UserContext';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenSearch: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenSearch,
  isDarkMode,
  onToggleTheme
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useUser();

  const navItems = [
    { id: 'home', label: 'الرئيسية', icon: Sparkles },
    { id: 'wird', label: 'ورد اليوم', icon: CheckCircle2 },
    { id: 'quran-radio', label: 'إذاعة القرآن', icon: Radio },
    { id: 'quran', label: 'القرآن الكريم', icon: BookOpen },
    { id: 'azkar', label: 'الأذكار', icon: Heart },
    { id: 'hadith', label: 'الأحاديث', icon: Sparkles },
    { id: 'dua', label: 'الأدعية', icon: Heart },
    { id: 'prayer', label: 'المواقيت والقبلة', icon: Compass },
    { id: 'calendar', label: 'التقويم الهجري', icon: Calendar },
    { id: 'tasbih', label: 'المسبحة', icon: Layers },
    { id: 'fatwa', label: 'الفتاوى والمعرفة', icon: HelpCircle },
    { id: 'donations', label: 'الصدقة والتبرع', icon: HandHeart },
    { id: 'binbaz', label: 'ابن باز', icon: Award },
  ];

  const handleNavClick = (id: string) => {
    onSelectTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-emerald-900/10 dark:border-emerald-500/20 bg-white/90 dark:bg-emerald-950/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2 sm:gap-3">
            <BrandLogo
              variant="responsive"
              size="responsive"
              clickable
              onClick={() => onSelectTab('home')}
            />
            <span className="hidden 2xl:inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
              الإصدار الرقمي
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`relative flex items-center gap-1 xl:gap-1.5 px-2 xl:px-3 py-1.5 xl:py-2 rounded-xl text-[11px] xl:text-xs font-medium transition-colors ${
                    isActive
                      ? 'text-white font-semibold'
                      : 'text-slate-700 dark:text-slate-200 hover:text-emerald-800 dark:hover:text-white hover:bg-emerald-50 dark:hover:bg-emerald-900/40'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeHeaderNav"
                      className="absolute inset-0 bg-emerald-800 dark:bg-emerald-700 rounded-xl shadow-xs"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  <Icon className={`relative z-10 w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-emerald-600 dark:text-emerald-400'}`} />
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Global Search Button */}
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 border border-slate-200 dark:border-emerald-800/60 text-xs transition-colors"
              title="بحث شامل (Ctrl+K)"
            >
              <Search className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span className="hidden xl:inline">بحث شامل...</span>
              <kbd className="hidden xl:inline-block px-1.5 py-0.5 text-[10px] rounded bg-slate-100 dark:bg-emerald-900 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-emerald-700">
                ⌘K
              </kbd>
            </button>

            {/* Dark / Light Toggle */}
            <motion.button
              whileTap={{ scale: 0.88, rotate: 20 }}
              whileHover={{ scale: 1.05 }}
              onClick={onToggleTheme}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 border border-transparent hover:border-slate-200 dark:hover:border-emerald-800/60 transition-colors"
              title={isDarkMode ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي'}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-amber-400 transition-transform duration-300" />
              ) : (
                <Moon className="w-5 h-5 text-emerald-800 transition-transform duration-300" />
              )}
            </motion.button>

            {/* PWA Install Button */}
            <div className="hidden sm:block">
              <PWAInstallButton variant="header" />
            </div>

            {/* User Dashboard / Login Button */}
            {isAuthenticated ? (
              <button
                onClick={() => onSelectTab('dashboard')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  currentTab === 'dashboard'
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm'
                    : 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200 border-emerald-600/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                }`}
                title="لوحة التحكم الشخصية"
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="w-4 h-4 rounded-full object-cover border border-emerald-500/40" />
                ) : (
                  <User className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                )}
                <span className="hidden sm:inline">
                  {user?.fullName ? user.fullName.split(' ')[0] : 'لوحتي'}
                </span>
              </button>
            ) : (
              <button
                onClick={() => onSelectTab('login')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  currentTab === 'login'
                    ? 'bg-emerald-800 text-white border-emerald-900'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white border-emerald-600 shadow-xs'
                }`}
                title="تسجيل الدخول / إنشاء حساب"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>دخول</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 lg:hidden rounded-xl text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/40"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-emerald-900/10 dark:border-emerald-500/20 bg-white/98 dark:bg-emerald-950/98 backdrop-blur-lg px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-2 pt-2 pb-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium text-right transition-colors ${
                    isActive
                      ? 'bg-emerald-800 text-white font-bold'
                      : 'bg-slate-50 dark:bg-emerald-900/40 text-slate-700 dark:text-slate-200 hover:bg-emerald-100 dark:hover:bg-emerald-800/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-300' : 'text-emerald-600 dark:text-emerald-400'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-emerald-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                >
                  <User className="w-4 h-4" />
                  <span>لوحة التحكم الشخصية</span>
                </button>
              ) : (
                <button
                  onClick={() => handleNavClick('login')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-xs font-bold shadow-xs"
                >
                  <LogIn className="w-4 h-4" />
                  <span>تسجيل الدخول / إنشاء حساب</span>
                </button>
              )}
            </div>

            <PWAInstallButton variant="header" />
          </div>
        </div>
      )}
    </header>
  );
};
