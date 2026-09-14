import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  CheckCircle2,
  Quote,
  ChevronDown,
  MapPin,
  Library,
  Flame as FastingIcon
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

interface DropdownGroup {
  id: string;
  label: string;
  icon: any;
  items: {
    id: string;
    label: string;
    icon: any;
    desc?: string;
  }[];
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenSearch,
  isDarkMode,
  onToggleTheme
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated } = useUser();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Desktop Dropdown Groups per User Specifications
  const dropdownGroups: DropdownGroup[] = [
    {
      id: 'prayer_group',
      label: 'المواقيت والقبلة',
      icon: Compass,
      items: [
        { id: 'prayer-times', label: 'مواقيت الصلاة', icon: Clock, desc: 'أوقات الأذان والعد التنازلي' },
        { id: 'prayer', label: 'اتجاه القبلة', icon: Compass, desc: 'بوصلة الكعبة المشرفة المباشرة' },
        { id: 'calendar', label: 'التاريخ الهجري', icon: Calendar, desc: 'تقويم أم القرى والمناسبات' }
      ]
    },
    {
      id: 'ibadah_group',
      label: 'العبادة',
      icon: CheckCircle2,
      items: [
        { id: 'wird', label: 'ورد اليوم', icon: CheckCircle2, desc: 'محاسبة العبادات والأوراد' },
        { id: 'fasting', label: 'صيامي', icon: Calendar, desc: 'سجل الصيام وتقويم النوافل' },
        { id: 'tasbih', label: 'المسبحة الإلكترونية', icon: Layers, desc: 'عداد الأذكار والاستغفار' },
        { id: 'quran', label: 'ختمة القرآن', icon: BookOpen, desc: 'تلاوة المصحف ومتابعة الختمات' },
        { id: 'azkar', label: 'حصن المسلم', icon: Heart, desc: 'أذكار الصباح والمساء' },
        { id: 'dua', label: 'الأدعية المأثورة', icon: Sparkles, desc: 'أدعية الكتاب والسنة' }
      ]
    },
    {
      id: 'knowledge_group',
      label: 'المعرفة الإسلامية',
      icon: BookOpen,
      items: [
        { id: 'names-of-allah', label: 'أسماء الله الحسنى', icon: Award, desc: '99 اسماً موثقاً مع الشرح' },
        { id: 'seerah', label: 'السيرة النبوية ﷺ', icon: Compass, desc: 'الخط الزمني الشامل الموثق' },
        { id: 'library', label: 'المكتبة الإسلامية', icon: Library, desc: 'أمهات الكتب الكلاسيكية والتفاسير' },
        { id: 'wisdoms', label: 'الحِكَم والمواعظ', icon: Quote, desc: 'رقائق وتأملات إيمانية موثقة' },
        { id: 'hadith', label: 'الأحاديث النبوية', icon: Sparkles, desc: 'رياض الصالحين والأربعون النووية' },
        { id: 'fatwa', label: 'الفتاوى وقصص الأنبياء', icon: HelpCircle, desc: 'مقالات وأحكام شرعية' },
        { id: 'binbaz', label: 'فتاوى ابن باز', icon: Award, desc: 'موسوعة الشيخ ابن باز رحمه الله' }
      ]
    },
    {
      id: 'hajj_group',
      label: 'الحج والعمرة',
      icon: MapPin,
      items: [
        { id: 'hajj-umrah', label: 'دليل العمرة خطوة بخطوة', icon: MapPin, desc: 'صفة العمرة وأركانها' },
        { id: 'hajj-umrah', label: 'دليل الحج يوماً بيوم', icon: MapPin, desc: 'أعمال يوم التروية وعرفة والتشريق' },
        { id: 'hajj-umrah', label: 'المواقيت والمناسك', icon: Compass, desc: 'المواقيت المكانية وأحكام الإحرام' }
      ]
    }
  ];

  const handleNavClick = (id: string) => {
    onSelectTab(id);
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  };

  const isTabInGroup = (group: DropdownGroup) => {
    return group.items.some((item) => item.id === currentTab);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-emerald-900/10 dark:border-emerald-500/20 bg-white/95 dark:bg-emerald-950/95 backdrop-blur-md transition-colors">
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
          </div>

          {/* Desktop Dropdown Navigation */}
          <nav ref={dropdownRef} className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            {/* 1. الرئيسية */}
            <button
              onClick={() => onSelectTab('home')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                currentTab === 'home'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-200 hover:text-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/40'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>الرئيسية</span>
            </button>

            {/* 2. اكتشف */}
            <button
              onClick={() => onSelectTab('discover')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                currentTab === 'discover'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-200 hover:text-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/40'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>اكتشف</span>
            </button>

            {/* 3. Dropdown Groups */}
            {dropdownGroups.map((group) => {
              const isOpen = activeDropdown === group.id;
              const hasActiveChild = isTabInGroup(group);

              return (
                <div key={group.id} className="relative">
                  <button
                    onClick={() => setActiveDropdown(isOpen ? null : group.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                      hasActiveChild
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'text-slate-700 dark:text-slate-200 hover:text-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/40'
                    }`}
                  >
                    <span>{group.label}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu Modal */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-72 p-2 rounded-2xl bg-white dark:bg-emerald-950 border border-emerald-900/10 dark:border-emerald-800/60 shadow-xl z-50 space-y-1"
                      >
                        {group.items.map((item, idx) => {
                          const IconComp = item.icon;
                          const isItemActive = currentTab === item.id;

                          return (
                            <button
                              key={`${item.id}-${idx}`}
                              onClick={() => handleNavClick(item.id)}
                              className={`w-full p-2.5 rounded-xl text-right transition-colors flex items-center gap-3 ${
                                isItemActive
                                  ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 font-bold'
                                  : 'hover:bg-slate-50 dark:hover:bg-emerald-900/30 text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              <span className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                                <IconComp className="w-4 h-4" />
                              </span>
                              <div>
                                <span className="text-xs font-bold block">{item.label}</span>
                                {item.desc && (
                                  <span className="text-[10px] text-slate-400 block">{item.desc}</span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {/* إذاعة القرآن */}
            <button
              onClick={() => onSelectTab('quran-radio')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                currentTab === 'quran-radio'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-200 hover:text-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/40'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>الإذاعة</span>
            </button>

            {/* الصدقة والتبرع */}
            <button
              onClick={() => onSelectTab('donations')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                currentTab === 'donations'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-200 hover:text-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/40'
              }`}
            >
              <HandHeart className="w-3.5 h-3.5 text-rose-500" />
              <span>التبرع</span>
            </button>
          </nav>

          {/* Right Controls: Global Search, Theme, User Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Global Search Button */}
            <button
              onClick={() => onSelectTab('search')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 border border-slate-200 dark:border-emerald-800/60 text-xs transition-colors"
              title="البحث الشامل في المنصة"
            >
              <Search className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span className="hidden xl:inline">البحث الشامل</span>
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
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-emerald-800" />
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

      {/* Mobile Drawer Menu (Structured by Section) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-emerald-900/10 dark:border-emerald-500/20 bg-white/98 dark:bg-emerald-950/98 backdrop-blur-lg px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-200 max-h-[85vh] overflow-y-auto">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleNavClick('home')}
              className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200 font-bold text-xs flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>الرئيسية</span>
            </button>
            <button
              onClick={() => handleNavClick('discover')}
              className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold text-xs flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>اكتشف اليوم</span>
            </button>
          </div>

          {/* Grouped Accordions for Mobile */}
          {dropdownGroups.map((group) => (
            <div key={group.id} className="space-y-1.5">
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 block px-1">
                {group.label}
              </span>
              <div className="grid grid-cols-2 gap-2">
                {group.items.map((item, idx) => {
                  const IconComp = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={`${item.id}-${idx}`}
                      onClick={() => handleNavClick(item.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium text-right transition-colors ${
                        isActive
                          ? 'bg-emerald-800 text-white font-bold'
                          : 'bg-slate-50 dark:bg-emerald-900/30 text-slate-700 dark:text-slate-200 hover:bg-emerald-100 dark:hover:bg-emerald-800/40'
                      }`}
                    >
                      <IconComp className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-300' : 'text-emerald-600 dark:text-emerald-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Additional Links */}
          <div className="pt-2 border-t border-slate-100 dark:border-emerald-900 grid grid-cols-2 gap-2">
            <button
              onClick={() => handleNavClick('quran-radio')}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-emerald-900/30 text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2"
            >
              <Radio className="w-4 h-4 text-emerald-600" />
              <span>إذاعة القرآن الكريم</span>
            </button>
            <button
              onClick={() => handleNavClick('donations')}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-emerald-900/30 text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2"
            >
              <HandHeart className="w-4 h-4 text-rose-500" />
              <span>الصدقة والتبرع</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
