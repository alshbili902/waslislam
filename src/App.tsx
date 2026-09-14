import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { BottomNavigation } from './components/BottomNavigation';
import { AudioPlayer } from './components/AudioPlayer';
import { RadioMiniPlayer } from './components/RadioMiniPlayer';
import { OfflineIndicator } from './components/OfflineIndicator';
import { SearchModal } from './components/SearchModal';
import { UserProvider, useUser } from './context/UserContext';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { AudioProvider } from './context/AudioContext';
import { RadioProvider } from './context/RadioContext';
import { ShareProvider } from './context/ShareContext';
import { ShareModal } from './components/share/ShareModal';

// Views
import { HomeView } from './views/HomeView';
import { QuranView } from './views/QuranView';
import { QuranRadioView } from './views/QuranRadioView';
import { AzkarView } from './views/AzkarView';
import { HadithView } from './views/HadithView';
import { DuaView } from './views/DuaView';
import { PrayerQiblaView } from './views/PrayerQiblaView';
import { CalendarView } from './views/CalendarView';
import { TasbihView } from './views/TasbihView';
import { FatwaArticlesView } from './views/FatwaArticlesView';
import { DonationsView } from './views/DonationsView';
import { BinBazView } from './views/BinBazView';
import { WisdomsView } from './views/WisdomsView';
import { DailyWirdView } from './views/DailyWirdView';
import { UserDashboardView } from './views/UserDashboardView';
import { LoginView } from './views/LoginView';
import { AdminView } from './views/AdminView';
import { AdminLoginView } from './views/admin/AdminLoginView';
import { FastingView } from './views/FastingView';
import { NamesOfAllahView } from './views/NamesOfAllahView';
import { SeerahView } from './views/SeerahView';
import { HajjUmrahView } from './views/HajjUmrahView';
import { LibraryView } from './views/LibraryView';
import { GlobalSearchView } from './views/GlobalSearchView';
import { DiscoverView } from './views/DiscoverView';

function AppContent() {
  const { isAuthenticated, isLoadingAuth, user } = useUser();
  const { isAdminAuthenticated, isLoadingAdminAuth } = useAdmin();

  const [currentTab, setCurrentTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.replace(/^\/+/, '');
      if (path === 'admin/login') return 'admin/login';
      if (path === 'admin') return 'admin';
      if (path === 'dashboard') return 'dashboard';
      if (path === 'login') return 'login';
      if (path === 'register') return 'register';
      if (path === 'wird') return 'wird';
      if (path === 'wisdoms' || path.startsWith('wisdoms/')) return 'wisdoms';
      if (path === 'quran-radio') return 'quran-radio';
      if (path === 'quran') return 'quran';
      if (path === 'azkar') return 'azkar';
      if (path === 'hadith') return 'hadith';
      if (path === 'dua') return 'dua';
      if (path === 'prayer' || path === 'prayer-times') return 'prayer-times';
      if (path === 'fasting') return 'fasting';
      if (path === 'names-of-allah') return 'names-of-allah';
      if (path === 'seerah') return 'seerah';
      if (path === 'hajj-umrah') return 'hajj-umrah';
      if (path === 'library') return 'library';
      if (path === 'search') return 'search';
      if (path === 'discover') return 'discover';
      if (path === 'calendar') return 'calendar';
      if (path === 'tasbih') return 'tasbih';
      if (path === 'fatwa') return 'fatwa';
      if (path === 'donations') return 'donations';
      if (path === 'binbaz') return 'binbaz';
    }
    return 'home';
  });

  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(1);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wasl_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (isDarkMode) {
      root.classList.add('dark');
      body.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
      localStorage.setItem('wasl_theme', 'dark');
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', '#031f18');
      const favicon = document.querySelector('link[rel="icon"][type="image/png"]');
      if (favicon) favicon.setAttribute('href', '/branding/favicon-dark.png');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
      localStorage.setItem('wasl_theme', 'light');
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', '#062e24');
      const favicon = document.querySelector('link[rel="icon"][type="image/png"]');
      if (favicon) favicon.setAttribute('href', '/branding/favicon-light.png');
    }
  }, [isDarkMode]);

  const handleNavigate = useCallback((tab: string, contextId?: any) => {
    if (tab === 'quran' && typeof contextId === 'number') {
      setSelectedSurahNumber(contextId);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (typeof window !== 'undefined') {
      const newPath = tab === 'home' ? '/' : `/${tab}`;
      if (window.location.pathname !== newPath) {
        window.history.pushState({ tab, contextId }, '', newPath);
      }
    }
  }, []);

  // Normal User Auth Guard
  useEffect(() => {
    if (!isLoadingAuth) {
      if (currentTab === 'dashboard' && !isAuthenticated) {
        handleNavigate('login');
      } else if ((currentTab === 'login' || currentTab === 'register') && isAuthenticated) {
        handleNavigate('dashboard');
      }
    }
  }, [currentTab, isAuthenticated, isLoadingAuth, handleNavigate]);

  // Admin Auth Guard: Protect /admin and redirect to /admin/login if not authenticated
  useEffect(() => {
    if (!isLoadingAdminAuth) {
      if (currentTab === 'admin' && !isAdminAuthenticated) {
        handleNavigate('admin/login');
      } else if (currentTab === 'admin/login' && isAdminAuthenticated) {
        handleNavigate('admin');
      }
    }
  }, [currentTab, isAdminAuthenticated, isLoadingAdminAuth, handleNavigate]);

  useEffect(() => {
    const handlePopState = () => {
      const raw = window.location.pathname.replace(/^\/+/, '') || 'home';
      const path = raw.split('/')[0] || 'home';
      setCurrentTab(path);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // ==========================================
  // ISOLATED ADMIN PORTAL RENDERING
  // Completely separate from regular user layout
  // ==========================================
  if (currentTab === 'admin/login') {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
        <AdminLoginView onNavigate={handleNavigate} />
      </div>
    );
  }

  if (currentTab === 'admin') {
    if (isLoadingAdminAuth) {
      return (
        <div className="min-h-screen bg-[#021812] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }
    if (!isAdminAuthenticated) {
      return (
        <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
          <AdminLoginView onNavigate={handleNavigate} />
        </div>
      );
    }
    return (
      <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
        <AdminView onNavigate={handleNavigate} />
      </div>
    );
  }

  // ==========================================
  // REGULAR PUBLIC / USER PORTAL RENDERING
  // ==========================================
  const renderUserView = () => {
    switch (currentTab) {
      case 'home':
        return <HomeView onNavigate={handleNavigate} />;
      case 'dashboard':
        return (
          <UserDashboardView
            onNavigate={handleNavigate}
            isDarkMode={isDarkMode}
            onToggleTheme={() => setIsDarkMode(!isDarkMode)}
          />
        );
      case 'login':
        return <LoginView onNavigate={handleNavigate} initialMode="signin" />;
      case 'register':
        return <LoginView onNavigate={handleNavigate} initialMode="signup" />;
      case 'wird':
        return <DailyWirdView onNavigate={handleNavigate} />;
      case 'wisdoms':
        return <WisdomsView onNavigate={handleNavigate} />;
      case 'quran-radio':
        return <QuranRadioView onNavigate={handleNavigate} />;
      case 'quran':
        return <QuranView initialSurahNumber={selectedSurahNumber} />;
      case 'azkar':
        return <AzkarView />;
      case 'hadith':
        return <HadithView />;
      case 'dua':
        return <DuaView />;
      case 'prayer':
      case 'prayer-times':
        return <PrayerQiblaView />;
      case 'fasting':
        return <FastingView userId={user?.id} />;
      case 'names-of-allah':
        return <NamesOfAllahView />;
      case 'seerah':
        return <SeerahView />;
      case 'hajj-umrah':
        return <HajjUmrahView />;
      case 'library':
        return <LibraryView />;
      case 'search':
        return <GlobalSearchView onSelectTab={handleNavigate} />;
      case 'discover':
        return <DiscoverView onSelectTab={handleNavigate} />;
      case 'calendar':
        return <CalendarView />;
      case 'tasbih':
        return <TasbihView />;
      case 'fatwa':
        return <FatwaArticlesView />;
      case 'donations':
        return <DonationsView />;
      case 'binbaz':
        return <BinBazView />;
      default:
        return <HomeView onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#031c15] text-slate-900 dark:text-slate-100 flex flex-col font-tajawal selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      {/* Main App Navigation Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={handleNavigate}
        onOpenSearch={() => setIsSearchOpen(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Body Content Container with Smooth Page Transitions */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 lg:pb-8 overflow-x-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentTab === 'quran' ? `quran-${selectedSurahNumber}` : currentTab}
            initial={{ opacity: 0, y: 14, scale: 0.995 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.995 }}
            transition={{
              duration: 0.26,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="w-full"
          >
            {renderUserView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Mobile Bottom Navigation */}
      <BottomNavigation currentTab={currentTab} onSelectTab={handleNavigate} />

      {/* Radio Floating Mini Player (visible during navigation when playing radio) */}
      <RadioMiniPlayer onExpand={() => handleNavigate('quran-radio')} />

      {/* Quran Ayah Recitation Audio Player Widget */}
      <AudioPlayer />

      {/* Offline Status Badge */}
      <OfflineIndicator />

      {/* Global Search Dialog Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Global Share As Image Modal */}
      <ShareModal />
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <AdminProvider>
        <AudioProvider>
          <RadioProvider>
            <ShareProvider>
              <AppContent />
            </ShareProvider>
          </RadioProvider>
        </AudioProvider>
      </AdminProvider>
    </UserProvider>
  );
}
