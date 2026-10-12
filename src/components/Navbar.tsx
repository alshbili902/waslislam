'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Home, 
  Compass, 
  Bookmark, 
  Moon, 
  Sun, 
  Search,
  Sparkles,
  Layers,
  User,
  Sliders,
  Smile,
  BarChart3,
  Users,
  Volume2,
  FileCheck2,
  FolderArchive,
  ChevronDown,
  Menu,
  X,
  FileText,
  Calendar,
  Coins,
  BookMarked,
  Flame,
  HelpCircle,
  Clock,
  Heart
} from 'lucide-react';
import { ThemeMode } from '../utils/theme';
import { BrandLogo } from './BrandLogo';

export type NavTab = 
  | 'home' 
  | 'quran' 
  | 'worship' 
  | 'discover' 
  | 'library' 
  | 'kids'
  | 'planner'
  | 'search-sources'
  | 'journal'
  | 'studio' 
  | 'zakat' 
  | 'khatmah'
  | 'dictionary'
  | 'tafsir-lab'
  | 'audio-bookmarks'
  | 'family'
  | 'trust-center'
  | 'thematic-index'
  | 'similar-ayahs'
  | 'seasons'
  | 'learning-paths';

export interface NavDropdownItem {
  id: string;
  tab?: NavTab;
  action?: 'search' | 'backup' | 'reports' | 'accessibility' | 'personalization';
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeAr?: string;
  badgeEn?: string;
}

export interface NavDropdownGroup {
  id: string;
  titleAr: string;
  titleEn: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavDropdownItem[];
}

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  onOpenSearch: () => void;
  onOpenAccount: () => void;
  onOpenReadingPrefs?: () => void;
  onOpenOfflineManager?: () => void;
  onOpenQuickAccess?: () => void;
  onOpenReports?: () => void;
  onOpenPersonalization?: () => void;
  onOpenBackupRestore?: () => void;
  onOpenAccessibility?: () => void;
  isEnglish: boolean;
  onToggleLanguage: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  theme,
  onThemeChange,
  onOpenSearch,
  onOpenAccount,
  onOpenReadingPrefs,
  onOpenOfflineManager,
  onOpenQuickAccess,
  onOpenReports,
  onOpenPersonalization,
  onOpenBackupRestore,
  onOpenAccessibility,
  isEnglish,
  onToggleLanguage
}) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpandedAccordion, setMobileExpandedAccordion] = useState<string | null>('quran');
  
  const navContainerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cycleTheme = () => {
    onThemeChange(theme === 'dark' ? 'light' : 'dark');
  };

  // Structured Dropdown Navigation Catalog according to Platform Features
  const dropdownGroups: NavDropdownGroup[] = [
    {
      id: 'quran',
      titleAr: 'القرآن الكريم',
      titleEn: 'Holy Quran',
      icon: BookOpen,
      items: [
        {
          id: 'quran-reading',
          tab: 'quran',
          titleAr: 'قراءة القرآن الكريم',
          titleEn: 'Read Holy Quran',
          descriptionAr: 'المصحف بالرسم العثماني المعتمد مع التلاوة المتزامنة',
          descriptionEn: 'Canonical Uthmani text with synchronized recitation',
          icon: BookOpen
        },
        {
          id: 'quran-thematic',
          tab: 'thematic-index',
          titleAr: 'الفهرس الموضوعي للقرآن',
          titleEn: 'Thematic Quran Index',
          descriptionAr: 'استكشاف الآيات حسب 14 موضوعاً شرعياً موثقاً',
          descriptionEn: 'Discover passages across 14 verified Islamic themes',
          icon: Layers,
          badgeAr: 'جديد',
          badgeEn: 'New'
        },
        {
          id: 'quran-similar',
          tab: 'similar-ayahs',
          titleAr: 'مستكشف الآيات المتشابهة',
          titleEn: 'Similar Ayahs Explorer',
          descriptionAr: 'دراسة المتشابهات اللفظية وتوجيه الفروق البلاغية',
          descriptionEn: 'Study verbal similarities and classical linguistic nuances',
          icon: Sparkles,
          badgeAr: 'جديد',
          badgeEn: 'New'
        },
        {
          id: 'quran-tafsir-lab',
          tab: 'tafsir-lab',
          titleAr: 'معمل مقارنة التفاسير',
          titleEn: 'Tafsir Comparison Lab',
          descriptionAr: 'مقارنة 5 تفاسير كلاسيكية معتمدة جنباً إلى جنب',
          descriptionEn: 'Compare 5 classical authoritative commentaries',
          icon: FileText
        },
        {
          id: 'quran-planner',
          tab: 'planner',
          titleAr: 'ختمة القرآن ومخطط الورد',
          titleEn: 'Khatmah Planner',
          descriptionAr: 'متابعة خطة الختم وتتبع الصفحات المقروءة والجدول الزمني',
          descriptionEn: 'Track reading schedule and 604 Quran pages',
          icon: BookMarked
        },
        {
          id: 'quran-journal',
          tab: 'journal',
          titleAr: 'دفتر التدبر والخواطر',
          titleEn: 'Reflection Journal',
          descriptionAr: 'سجل تدبراتك وخواطرك الإيمانية حول الآيات',
          descriptionEn: 'Record personal reflection notes on verses',
          icon: Bookmark
        },
        {
          id: 'quran-dictionary',
          tab: 'dictionary',
          titleAr: 'معجم مفردات وغريب القرآن',
          titleEn: 'Quran Dictionary',
          descriptionAr: 'دلالات الألفاظ القرآنية وجذورها اللغوية الكلاسيكية',
          descriptionEn: 'Linguistic meanings of Quranic roots and rare vocabulary',
          icon: HelpCircle
        },
        {
          id: 'quran-audio-bookmarks',
          tab: 'audio-bookmarks',
          titleAr: 'علامات الاستماع المحفوظة',
          titleEn: 'Audio Bookmarks',
          descriptionAr: 'استئناف الاستماع لكبار القراء من آخر موضع تم حفظه',
          descriptionEn: 'Resume recitation playback from saved timestamps',
          icon: Volume2
        }
      ]
    },
    {
      id: 'worship',
      titleAr: 'العبادات والأذكار',
      titleEn: 'Worship & Adhkar',
      icon: Compass,
      items: [
        {
          id: 'worship-adhkar',
          tab: 'worship',
          titleAr: 'أذكار الصباح والمساء واليوم',
          titleEn: 'Daily Adhkar & Duas',
          descriptionAr: 'حصن المسلم مع أذكار الصباح والمساء والنوم والصلاة',
          descriptionEn: 'Fortress of the Muslim: morning, evening, and daily prayers',
          icon: Heart
        },
        {
          id: 'worship-prayer-qibla',
          tab: 'worship',
          titleAr: 'مواقيت الصلاة واتجاه القبلة',
          titleEn: 'Prayer Times & Qibla',
          descriptionAr: 'مواقيت دقيقة بتقويم أم القرى وبوصلة القبلة التفاعلية',
          descriptionEn: 'Accurate prayer schedule and interactive Qibla compass',
          icon: Clock
        },
        {
          id: 'worship-zakat',
          tab: 'zakat',
          titleAr: 'حاسبة الزكاة الشرعية',
          titleEn: 'Zakat Calculator',
          descriptionAr: 'حساب زكاة المال، الذهب، الفضة، والأسهم مع فحص النصاب',
          descriptionEn: 'Calculate Zakat on cash, gold, silver, and business assets',
          icon: Coins
        },
        {
          id: 'worship-planner',
          tab: 'planner',
          titleAr: 'متابعة العبادات والسنن',
          titleEn: 'Daily Worship Tracker',
          descriptionAr: 'خطة يومية للمحافظة على الفرائض والرواتب وصيام التطوع',
          descriptionEn: 'Daily routine for obligatory prayers, Sunnah, and voluntary deeds',
          icon: BookMarked
        }
      ]
    },
    {
      id: 'knowledge',
      titleAr: 'المعرفة الإسلامية',
      titleEn: 'Islamic Knowledge',
      icon: Layers,
      items: [
        {
          id: 'knowledge-paths',
          tab: 'learning-paths',
          titleAr: 'المسارات التعليمية الموجهة',
          titleEn: 'Guided Learning Paths',
          descriptionAr: '10 مناهج تعليمية متسلسلة في القرآن والفقه والسيرة',
          descriptionEn: '10 structured curricula in Quran, Fiqh, and Seerah',
          icon: BookOpen,
          badgeAr: 'جديد',
          badgeEn: 'New'
        },
        {
          id: 'knowledge-hadith',
          tab: 'discover',
          titleAr: 'الأحاديث النبوية الصحيحة',
          titleEn: 'Authentic Hadith',
          descriptionAr: 'رياض السنة من صحيحي البخاري ومسلم مع التخريج والبيان',
          descriptionEn: 'Prophetic traditions from Bukhari and Muslim with scholarly grading',
          icon: Compass
        },
        {
          id: 'knowledge-trust',
          tab: 'trust-center',
          titleAr: 'مركز موثوقية المحتوى والمصادر',
          titleEn: 'Content Trust Center',
          descriptionAr: 'دليل الشفافية والجهات العلمية والمصادر المعتمدة',
          descriptionEn: 'Directory of verified authoritative sources and audit logs',
          icon: FileCheck2
        },
        {
          id: 'knowledge-kids',
          tab: 'kids',
          titleAr: 'ركن أطفال المسلمين (عالم الصغار)',
          titleEn: 'Wasl Kids Corner',
          descriptionAr: 'قصص الأنبياء المصورة، أذكار مبسطة، وتحديات تفاعلية',
          descriptionEn: 'Illustrated prophetic stories, simple Adhkar, and fun quizzes',
          icon: Smile
        },
        {
          id: 'knowledge-family',
          tab: 'family',
          titleAr: 'وضع العائلة والتربية المشتركة',
          titleEn: 'Family Mode Hub',
          descriptionAr: 'متابعة إنجاز الأبناء ومشاركة الأهداف الإيمانية للأسرة',
          descriptionEn: 'Parental dashboard, shared family goals, and progress tracking',
          icon: Users
        },
        {
          id: 'knowledge-search-sources',
          tab: 'search-sources',
          titleAr: 'اسأل المصادر الإسلامية الموثقة',
          titleEn: 'Islamic Source Search',
          descriptionAr: 'بحث دقيق مدعوم بالنصوص والآيات والأحاديث الصحيحة',
          descriptionEn: 'Direct source-grounded answers citing authentic texts',
          icon: Search
        }
      ]
    },
    {
      id: 'tools',
      titleAr: 'الأدوات والخدمات',
      titleEn: 'Tools & Services',
      icon: Sliders,
      items: [
        {
          id: 'tools-library',
          tab: 'library',
          titleAr: 'المكتبة الشخصية (مكتبتي)',
          titleEn: 'Personal Library',
          descriptionAr: 'حفظ الآيات والأحاديث والفوائد مع إمكانية تصنيفها',
          descriptionEn: 'Saved verses, hadiths, lessons, and personal notes',
          icon: Bookmark
        },
        {
          id: 'tools-studio',
          tab: 'studio',
          titleAr: 'استوديو بطاقات شارك الأجر',
          titleEn: 'Share Card Studio',
          descriptionAr: 'تصميم بطاقات دعوية عالية الدقة بمقاسات وقوالب متعددة',
          descriptionEn: 'Generate high-res Islamic quote cards for social sharing',
          icon: Sparkles
        },
        {
          id: 'tools-search-modal',
          action: 'search',
          titleAr: 'البحث الشامل في المنصة',
          titleEn: 'Global Search',
          descriptionAr: 'البحث السريع في القرآن، السور، الأذكار، والمصادر',
          descriptionEn: 'Instant search across Quran, surahs, adhkar, and library',
          icon: Search
        },
        {
          id: 'tools-backup',
          action: 'backup',
          titleAr: 'النسخ الاحتياطي ونقل البيانات',
          titleEn: 'Backup & Restore',
          descriptionAr: 'حفظ واستعادة وتصدير بياناتك وإشاراتك بأمان تام',
          descriptionEn: 'Export and restore your reading progress and personal data',
          icon: FolderArchive
        },
        {
          id: 'tools-accessibility',
          action: 'accessibility',
          titleAr: 'وضع كبار السن وسهولة الاستخدام',
          titleEn: 'Accessibility & Senior Mode',
          descriptionAr: 'تكبير الخطوط، تباين عالي، وتقليل الحركة لراحة العين',
          descriptionEn: 'Large typography, high contrast, and simplified navigation',
          icon: Sparkles
        },
        {
          id: 'tools-personalization',
          action: 'personalization',
          titleAr: 'تخصيص المظهر وتجربة القراءة',
          titleEn: 'Personalization Settings',
          descriptionAr: 'التحكم في الخطوط، سمات القراءة، والراحة البصرية',
          descriptionEn: 'Custom reading fonts, visual themes, and layout prefs',
          icon: Sliders
        },
        {
          id: 'tools-reports',
          action: 'reports',
          titleAr: 'تقارير الإنجاز الإيماني',
          titleEn: 'Faith Progress Reports',
          descriptionAr: 'إحصائيات تلاوة القرآن، الأذكار، وسجل الختمات',
          descriptionEn: 'Personal statistics on Quran reading and adhkar consistency',
          icon: BarChart3
        }
      ]
    },
    {
      id: 'seasons',
      titleAr: 'المواسم والمناسبات',
      titleEn: 'Islamic Seasons',
      icon: Flame,
      items: [
        {
          id: 'seasons-hub',
          tab: 'seasons',
          titleAr: 'مركز المواسم الإسلامية',
          titleEn: 'Islamic Seasons Center',
          descriptionAr: 'بوابة المواسم الحية، العد التنازلي، والخطط الموسمية المعتمدة',
          descriptionEn: 'Seasonal portal, live countdown, and authentic worship guides',
          icon: Flame,
          badgeAr: 'جديد',
          badgeEn: 'New'
        },
        {
          id: 'seasons-ramadan',
          tab: 'seasons',
          titleAr: 'شهر رمضان والعشر الأواخر',
          titleEn: 'Ramadan & Laylat Al-Qadr',
          descriptionAr: 'فضائل الصيام، قيام الليل، ليلة القدر، وأدعية الإفطار المأثورة',
          descriptionEn: 'Virtues of fasting, Taraweeh, Laylat al-Qadr, and authentic duas',
          icon: Moon
        },
        {
          id: 'seasons-hajj',
          tab: 'seasons',
          titleAr: 'عشر ذي الحجة وموسم الحج والعمرة',
          titleEn: 'Dhul Hijjah & Pilgrimage',
          descriptionAr: 'يوم عرفة، الأضحية، أيام التشريق، ومناسك الحج والعمرة',
          descriptionEn: 'Day of Arafah, sacrifice, Eid al-Adha, and pilgrimage rituals',
          icon: Compass
        },
        {
          id: 'seasons-voluntary',
          tab: 'seasons',
          titleAr: 'صيام التطوع والأيام البيض',
          titleEn: 'Voluntary Fasting & White Days',
          descriptionAr: 'سنن صيام الإثنين والخميس، الأيام البيض، ويوم عاشوراء',
          descriptionEn: 'Mondays and Thursdays, 13-15 White Days, and Day of Ashura',
          icon: Calendar
        }
      ]
    }
  ];

  // Close desktop dropdown on outside click or Escape key (only active when dropdown is open)
  useEffect(() => {
    if (!activeDropdown) return;

    const handleOutsideClick = (e: Event) => {
      if (navContainerRef.current && !navContainerRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
      }
    };

    // Use pointerdown so both mouse and tap are captured cleanly without touchstart synthetic event cancellation
    document.addEventListener('pointerdown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeDropdown]);

  // Handle escape key and body scroll lock for mobile menu drawer
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    // Lock body scroll on mobile while drawer is active to prevent scroll chaining
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  const handleDropdownTriggerClick = (groupId: string) => {
    setActiveDropdown(prev => (prev === groupId ? null : groupId));
  };

  const handleDropdownItemSelect = (item: NavDropdownItem) => {
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);

    if (item.tab) {
      onSelectTab(item.tab);
    } else if (item.action) {
      if (item.action === 'search') onOpenSearch();
      else if (item.action === 'backup' && onOpenBackupRestore) onOpenBackupRestore();
      else if (item.action === 'reports' && onOpenReports) onOpenReports();
      else if (item.action === 'accessibility' && onOpenAccessibility) onOpenAccessibility();
      else if (item.action === 'personalization' && onOpenPersonalization) onOpenPersonalization();
    }
  };

  // Determine if a dropdown group has an active item currently visible
  const isGroupActive = (group: NavDropdownGroup): boolean => {
    return group.items.some(item => item.tab === currentTab);
  };

  return (
    <>
      {/* Top Main Navigation Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[var(--bg-card)]/95 border-b border-[var(--border-color)] px-3 sm:px-4 py-2 sm:py-2.5 transition-colors w-full max-w-full overflow-visible">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3 w-full min-w-0">
          {/* Official Brand Logo (Emblem only at top of page) */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
            <BrandLogo
              size="md"
              showText={false}
              showSubtitle={false}
              showBadge={false}
              isEnglish={isEnglish}
              onClick={() => {
                onSelectTab('home');
                setActiveDropdown(null);
              }}
              priority={true}
            />
          </div>

          {/* Desktop Dropdown Menus */}
          <nav 
            ref={navContainerRef}
            aria-label="القائمة الرئيسية"
            className="hidden lg:flex items-center gap-1 xl:gap-1.5 min-w-0 shrink"
          >
            {/* Quick Home Link */}
            <button
              onClick={() => {
                onSelectTab('home');
                setActiveDropdown(null);
              }}
              className={`flex items-center gap-1 xl:gap-1.5 px-2 xl:px-3 py-1.5 xl:py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                currentTab === 'home'
                  ? 'bg-[var(--primary-light)] text-[var(--primary)] border border-[var(--border-color)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)]'
              }`}
            >
              <Home className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" />
              <span>{isEnglish ? 'Home' : 'الرئيسية'}</span>
            </button>

            {/* 5 Main Dropdown Groups */}
            {dropdownGroups.map((group, groupIdx) => {
              const isOpen = activeDropdown === group.id;
              const hasActiveChild = isGroupActive(group);
              const GroupIcon = group.icon;
              // Align dropdown inward: in RTL later groups align left-0; in LTR later groups align right-0
              const dropdownAlignClass = isEnglish
                ? (groupIdx >= 3 ? 'right-0' : 'left-0')
                : (groupIdx >= 3 ? 'left-0' : 'right-0');

              return (
                <div key={group.id} className="relative shrink-0">
                  <button
                    id={`dropdown-btn-${group.id}`}
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    onClick={() => handleDropdownTriggerClick(group.id)}
                    className={`flex items-center gap-1 xl:gap-1.5 px-2 xl:px-3 py-1.5 xl:py-2 rounded-xl text-xs font-bold transition-all border shrink-0 wasl-btn-interactive ${
                      hasActiveChild || isOpen
                        ? 'bg-[var(--primary-light)] text-[var(--text-primary)] border-[var(--border-gold)] shadow-sm'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)] border-transparent'
                    }`}
                  >
                    <GroupIcon className={`w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0 ${hasActiveChild ? 'text-[var(--gold)]' : ''}`} />
                    <span className="whitespace-nowrap">{isEnglish ? group.titleEn : group.titleAr}</span>
                    <ChevronDown className={`w-3 h-3 xl:w-3.5 xl:h-3.5 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[var(--gold)]' : 'opacity-60'}`} />
                  </button>

                  {/* Dropdown Floating Menu */}
                  {isOpen && (
                    <div 
                      role="menu"
                      aria-labelledby={`dropdown-btn-${group.id}`}
                      className={`absolute top-full mt-2 ${dropdownAlignClass} w-72 sm:w-80 md:w-96 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-[var(--bg-card)] border border-[var(--border-gold)]/50 shadow-2xl backdrop-blur-xl p-2 z-50 wasl-dropdown-menu`}
                    >
                      <div className="px-3 py-2 border-b border-[var(--border-color)]/60 mb-1 flex items-center justify-between">
                        <span className="text-xs font-bold text-[var(--gold)] flex items-center gap-1.5 font-cairo">
                          <GroupIcon className="w-3.5 h-3.5" />
                          <span>{isEnglish ? group.titleEn : group.titleAr}</span>
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)]">
                          {group.items.length} {isEnglish ? 'sections' : 'أقسام'}
                        </span>
                      </div>

                      <div className="max-h-[70vh] overflow-y-auto space-y-1 p-0.5 custom-scrollbar">
                        {group.items.map((item) => {
                          const ItemIcon = item.icon;
                          const isItemActive = item.tab && currentTab === item.tab;

                          return (
                            <button
                              key={item.id}
                              role="menuitem"
                              onClick={() => handleDropdownItemSelect(item)}
                              className={`w-full text-right flex items-start gap-3 p-2.5 rounded-xl transition-all text-xs ${
                                isItemActive
                                  ? 'bg-[var(--primary-light)] text-[var(--primary)] font-bold border border-[var(--border-gold)]/40 shadow-xs'
                                  : 'text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)] hover:text-[var(--gold)]'
                              }`}
                            >
                              <div className={`p-2 rounded-lg mt-0.5 shrink-0 transition-colors ${
                                isItemActive
                                  ? 'bg-[var(--gold)] text-white shadow-xs'
                                  : 'bg-[var(--primary)]/10 text-[var(--primary)]'
                              }`}>
                                <ItemIcon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-xs truncate">
                                    {isEnglish ? item.titleEn : item.titleAr}
                                  </span>
                                  {item.badgeAr && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[var(--gold)] text-white font-extrabold shrink-0">
                                      {isEnglish ? item.badgeEn : item.badgeAr}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-[var(--text-muted)] mt-0.5 line-clamp-1 leading-normal font-normal">
                                  {isEnglish ? item.descriptionEn : item.descriptionAr}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0">
            {/* Global Search Button */}
            <button
              onClick={onOpenSearch}
              className="p-1.5 sm:p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)] border border-[var(--border-color)] transition-colors shrink-0"
              title={isEnglish ? 'Search platform' : 'بحث شامل في المنصة'}
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Accessibility and Senior Mode trigger */}
            {onOpenAccessibility && (
              <button
                onClick={onOpenAccessibility}
                className="hidden sm:flex p-1.5 sm:p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--gold)] hover:bg-[var(--bg-card-subtle)] border border-[var(--border-color)] transition-colors shrink-0"
                title={isEnglish ? 'Senior & Accessibility Mode' : 'وضع كبار السن وسهولة الاستخدام'}
                aria-label="Accessibility Mode"
              >
                <Sparkles className="w-4 h-4 text-[var(--gold)]" />
              </button>
            )}

            {/* Personalization Settings trigger */}
            {onOpenPersonalization && (
              <button
                onClick={onOpenPersonalization}
                className="hidden md:flex p-1.5 sm:p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--gold)] hover:bg-[var(--bg-card-subtle)] border border-[var(--border-color)] transition-colors shrink-0"
                title={isEnglish ? 'Personalization Settings' : 'تخصيص المظهر وتجربة القراءة'}
                aria-label="Personalization"
              >
                <Sliders className="w-4 h-4" />
              </button>
            )}

            {/* User Supabase Account */}
            <button
              onClick={onOpenAccount}
              className="hidden sm:flex p-1.5 sm:p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--gold)] hover:bg-[var(--bg-card-subtle)] border border-[var(--border-color)] transition-colors shrink-0"
              title={isEnglish ? 'Account & Cloud Sync' : 'الحساب والمزامنة السحابية'}
              aria-label="Account"
            >
              <User className="w-4 h-4" />
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={cycleTheme}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-semibold border border-[var(--border-color)] bg-[var(--bg-card-subtle)] text-[var(--text-main)] hover:border-[var(--gold)] transition-colors shrink-0"
              title={isEnglish ? 'Toggle Theme' : 'تغيير المظهر'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Moon className="w-3.5 h-3.5 text-blue-400" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-500" />
              )}
              <span className="hidden xl:inline">
                {theme === 'dark' ? (isEnglish ? 'Dark' : 'ليلي') : (isEnglish ? 'Light' : 'نهاري')}
              </span>
            </button>

            {/* Language Toggle Button */}
            <button
              onClick={onToggleLanguage}
              className="px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-bold border border-[var(--border-gold)] bg-[var(--gold-light)] text-[var(--gold)] hover:bg-opacity-80 transition-colors shrink-0"
              title={isEnglish ? 'Switch to Arabic' : 'التحويل للإنجليزية'}
              aria-label="Language Toggle"
            >
              {isEnglish ? 'عربي' : 'EN'}
            </button>

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className="lg:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)] border border-[var(--border-color)] transition-colors shrink-0 cursor-pointer touch-manipulation"
              aria-label={isMobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة الرئيسية'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation-drawer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-[var(--gold)]" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Over Drawer Navigation (Mounted outside header to prevent backdrop-filter stacking trap) */}
      {isMobileMenuOpen && (
        <div 
          id="mobile-navigation-drawer"
          role="dialog"
          aria-modal="true"
          aria-label={isEnglish ? 'Mobile Navigation Menu' : 'قائمة التصفح الرئيسية'}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsMobileMenuOpen(false);
          }}
          className="lg:hidden fixed inset-0 top-[58px] z-50 bg-black/60 backdrop-blur-sm wasl-modal-backdrop"
        >
          <div className="bg-[var(--bg-card)] border-b border-[var(--border-color)] h-full max-h-[calc(100vh-58px)] overflow-y-auto p-4 flex flex-col justify-between shadow-2xl overscroll-contain wasl-page-transition">
            <div className="space-y-3">
              {/* Mobile Search Quick Trigger */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenSearch();
                }}
                className="w-full min-h-[44px] flex items-center justify-between p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs text-[var(--text-muted)] cursor-pointer touch-manipulation hover:border-[var(--gold)] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-[var(--gold)] pointer-events-none" />
                  <span>{isEnglish ? 'Search Quran, Hadith, Topics...' : 'ابحث في القرآن، الأحاديث، الموضوعات...'}</span>
                </span>
                <span className="text-[10px] bg-[var(--gold)]/20 text-[var(--gold)] px-2 py-0.5 rounded-md font-bold">
                  {isEnglish ? 'Search' : 'بحث'}
                </span>
              </button>

              {/* Mobile Accordions for Each Dropdown Group */}
              <div className="space-y-2">
                {dropdownGroups.map((group) => {
                  const isExpanded = mobileExpandedAccordion === group.id;
                  const hasActiveChild = isGroupActive(group);
                  const GroupIcon = group.icon;

                  return (
                    <div 
                      key={group.id} 
                      className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card-subtle)]/50 overflow-hidden"
                    >
                      <button
                        onClick={() => setMobileExpandedAccordion(prev => prev === group.id ? null : group.id)}
                        className="w-full min-h-[48px] flex items-center justify-between p-3.5 text-xs font-bold text-[var(--text-main)] transition-colors hover:text-[var(--gold)] cursor-pointer touch-manipulation"
                        aria-expanded={isExpanded}
                      >
                        <span className="flex items-center gap-2.5">
                          <GroupIcon className={`w-4 h-4 pointer-events-none ${hasActiveChild ? 'text-[var(--gold)]' : 'text-[var(--primary)]'}`} />
                          <span>{isEnglish ? group.titleEn : group.titleAr}</span>
                        </span>
                        <ChevronDown className={`w-4 h-4 pointer-events-none transition-transform duration-200 ${isExpanded ? 'rotate-180 text-[var(--gold)]' : 'opacity-60'}`} />
                      </button>

                      {isExpanded && (
                        <div className="px-3 pb-3 pt-1 space-y-1.5 border-t border-[var(--border-color)]/40 bg-[var(--bg-card)]">
                          {group.items.map((item) => {
                            const ItemIcon = item.icon;
                            const isItemActive = item.tab && currentTab === item.tab;

                            return (
                              <button
                                key={item.id}
                                onClick={() => handleDropdownItemSelect(item)}
                                className={`w-full min-h-[48px] text-right flex items-center justify-between p-2.5 rounded-xl transition-all text-xs cursor-pointer touch-manipulation ${
                                  isItemActive
                                    ? 'bg-[var(--primary-light)] text-[var(--primary)] font-bold border border-[var(--border-gold)]/40'
                                    : 'text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)]'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className={`p-1.5 rounded-lg shrink-0 ${isItemActive ? 'bg-[var(--gold)] text-white' : 'bg-[var(--primary)]/10 text-[var(--primary)]'}`}>
                                    <ItemIcon className="w-3.5 h-3.5 pointer-events-none" />
                                  </div>
                                  <div className="truncate">
                                    <span className="block truncate font-bold text-xs">
                                      {isEnglish ? item.titleEn : item.titleAr}
                                    </span>
                                    <span className="block text-[10px] text-[var(--text-muted)] truncate">
                                      {isEnglish ? item.descriptionEn : item.descriptionAr}
                                    </span>
                                  </div>
                                </div>
                                {item.badgeAr && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[var(--gold)] text-white font-extrabold shrink-0">
                                    {isEnglish ? item.badgeEn : item.badgeAr}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile Drawer Footer Actions */}
            <div className="pt-4 mt-4 border-t border-[var(--border-color)] grid grid-cols-3 gap-2 text-xs text-[var(--text-muted)]">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenAccount();
                }}
                className="flex items-center justify-center gap-1.5 p-2 min-h-[44px] rounded-xl bg-[var(--bg-card-subtle)] hover:text-[var(--gold)] transition-colors text-xs font-bold cursor-pointer touch-manipulation"
              >
                <User className="w-3.5 h-3.5 text-[var(--primary)] shrink-0 pointer-events-none" />
                <span className="truncate">{isEnglish ? 'Account' : 'الحساب'}</span>
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (onOpenAccessibility) onOpenAccessibility();
                }}
                className="flex items-center justify-center gap-1.5 p-2 min-h-[44px] rounded-xl bg-[var(--bg-card-subtle)] hover:text-[var(--gold)] transition-colors text-xs font-bold cursor-pointer touch-manipulation"
              >
                <Sparkles className="w-3.5 h-3.5 text-[var(--gold)] shrink-0 pointer-events-none" />
                <span className="truncate">{isEnglish ? 'Senior' : 'كبار السن'}</span>
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (onOpenBackupRestore) onOpenBackupRestore();
                }}
                className="flex items-center justify-center gap-1.5 p-2 min-h-[44px] rounded-xl bg-[var(--bg-card-subtle)] hover:text-[var(--gold)] transition-colors text-xs font-bold cursor-pointer touch-manipulation"
              >
                <FolderArchive className="w-3.5 h-3.5 text-emerald-500 shrink-0 pointer-events-none" />
                <span className="truncate">{isEnglish ? 'Backup' : 'النسخ'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Streamlined Mobile Bottom Navigation Bar (Quick Anchors) */}
      <nav 
        aria-label={isEnglish ? "Mobile Quick Navigation" : "شريط التنقل السريع للهاتف"}
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-card)]/95 backdrop-blur-md border-t border-[var(--border-color)] py-1 sm:py-1.5 px-1 sm:px-3 safe-area-pb w-full max-w-full shadow-lg"
      >
        <div className="flex items-center justify-between sm:justify-around w-full max-w-md mx-auto gap-0.5">
          <button
            id="mobile-bottom-nav-home"
            onClick={() => {
              onSelectTab('home');
              setIsMobileMenuOpen(false);
            }}
            className={`flex flex-col items-center justify-center py-1 px-1 sm:px-2 rounded-xl text-xs transition-all flex-1 min-w-0 min-h-[48px] cursor-pointer touch-manipulation active:scale-95 ${
              currentTab === 'home'
                ? 'text-[var(--text-primary)] font-bold scale-105'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
            aria-label={isEnglish ? 'Home' : 'الرئيسية'}
            aria-current={currentTab === 'home' ? 'page' : undefined}
          >
            <div className={`p-1 sm:p-1.5 rounded-lg transition-colors ${currentTab === 'home' ? 'bg-[var(--primary-light)] text-[var(--primary)]' : ''}`}>
              <Home className="w-4 h-4 shrink-0 pointer-events-none" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-cairo truncate w-full text-center pointer-events-none">
              {isEnglish ? 'Home' : 'الرئيسية'}
            </span>
          </button>

          <button
            id="mobile-bottom-nav-quran"
            onClick={() => {
              onSelectTab('quran');
              setIsMobileMenuOpen(false);
            }}
            className={`flex flex-col items-center justify-center py-1 px-1 sm:px-2 rounded-xl text-xs transition-all flex-1 min-w-0 min-h-[48px] cursor-pointer touch-manipulation active:scale-95 ${
              currentTab === 'quran'
                ? 'text-[var(--text-primary)] font-bold scale-105'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
            aria-label={isEnglish ? 'Quran' : 'المصحف'}
            aria-current={currentTab === 'quran' ? 'page' : undefined}
          >
            <div className={`p-1 sm:p-1.5 rounded-lg transition-colors ${currentTab === 'quran' ? 'bg-[var(--primary-light)] text-[var(--primary)]' : ''}`}>
              <BookOpen className="w-4 h-4 shrink-0 pointer-events-none" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-cairo truncate w-full text-center pointer-events-none">
              {isEnglish ? 'Quran' : 'المصحف'}
            </span>
          </button>

          <button
            id="mobile-bottom-nav-worship"
            onClick={() => {
              onSelectTab('worship');
              setIsMobileMenuOpen(false);
            }}
            className={`flex flex-col items-center justify-center py-1 px-1 sm:px-2 rounded-xl text-xs transition-all flex-1 min-w-0 min-h-[48px] cursor-pointer touch-manipulation active:scale-95 ${
              currentTab === 'worship'
                ? 'text-[var(--text-primary)] font-bold scale-105'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
            aria-label={isEnglish ? 'Worship' : 'عبادتي'}
            aria-current={currentTab === 'worship' ? 'page' : undefined}
          >
            <div className={`p-1 sm:p-1.5 rounded-lg transition-colors ${currentTab === 'worship' ? 'bg-[var(--primary-light)] text-[var(--primary)]' : ''}`}>
              <Compass className="w-4 h-4 shrink-0 pointer-events-none" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-cairo truncate w-full text-center pointer-events-none">
              {isEnglish ? 'Worship' : 'عبادتي'}
            </span>
          </button>

          <button
            id="mobile-bottom-nav-seasons"
            onClick={() => {
              onSelectTab('seasons');
              setIsMobileMenuOpen(false);
            }}
            className={`flex flex-col items-center justify-center py-1 px-1 sm:px-2 rounded-xl text-xs transition-all flex-1 min-w-0 min-h-[48px] cursor-pointer touch-manipulation active:scale-95 ${
              currentTab === 'seasons'
                ? 'text-[var(--text-primary)] font-bold scale-105'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
            aria-label={isEnglish ? 'Seasons' : 'المواسم'}
            aria-current={currentTab === 'seasons' ? 'page' : undefined}
          >
            <div className={`p-1 sm:p-1.5 rounded-lg transition-colors ${currentTab === 'seasons' ? 'bg-[var(--primary-light)] text-[var(--primary)]' : ''}`}>
              <Flame className="w-4 h-4 shrink-0 pointer-events-none" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-cairo truncate w-full text-center pointer-events-none">
              {isEnglish ? 'Seasons' : 'المواسم'}
            </span>
          </button>

          {/* Quick Menu Button (Opens Accordion Drawer) */}
          <button
            id="mobile-bottom-nav-menu"
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
            className={`flex flex-col items-center justify-center py-1 px-1 sm:px-2 rounded-xl text-xs transition-all flex-1 min-w-0 min-h-[48px] cursor-pointer touch-manipulation active:scale-95 ${
              isMobileMenuOpen
                ? 'text-[var(--gold)] font-bold scale-105'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
            aria-label={isMobileMenuOpen ? (isEnglish ? 'Close Menu' : 'إغلاق القائمة') : (isEnglish ? 'Open Menu' : 'فتح القائمة')}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
          >
            <div className={`p-1 sm:p-1.5 rounded-lg transition-colors ${isMobileMenuOpen ? 'bg-[var(--gold)]/20 text-[var(--gold)]' : ''}`}>
              <Menu className="w-4 h-4 shrink-0 pointer-events-none" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-cairo truncate w-full text-center pointer-events-none">
              {isEnglish ? 'Menu' : 'القائمة'}
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};
