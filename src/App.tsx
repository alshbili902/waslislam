import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { BottomNavigation } from './components/BottomNavigation';
import { AudioPlayer } from './components/AudioPlayer';
import { RadioMiniPlayer } from './components/RadioMiniPlayer';
import { QuranMiniPlayer } from './components/quran/QuranMiniPlayer';
import { QuranFullPlayerModal } from './components/quran/QuranFullPlayerModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { SearchModal } from './components/SearchModal';
import { UserProvider, useUser } from './context/UserContext';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { AudioProvider } from './context/AudioContext';
import { RadioProvider } from './context/RadioContext';
import { QuranAudioProvider } from './context/QuranAudioContext';
import { ShareProvider } from './context/ShareContext';
import { ShareModal } from './components/share/ShareModal';

// Views
import { HomeView } from './views/HomeView';
import { QuranView } from './views/QuranView';
import { QuranListeningView } from './views/QuranListeningView';
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
import { KhatmahView } from './views/khatmah/KhatmahView';

function AppContent() {
  const { isAuthenticated, isLoadingAuth, user } = useUser();
  const { isAdminAuthenticated, isLoadingAdminAuth } = useAdmin();

  const [selectedReciterSlug, setSelectedReciterSlug] = useState<string | null>(null);
  const [selectedListeningSurahNumber, setSelectedListeningSurahNumber] = useState<number | null>(null);
  const [selectedAyahNumber, setSelectedAyahNumber] = useState<number | undefined>(undefined);
  const [khatmahContext, setKhatmahContext] = useState<any>(null);

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
      if (path === 'quran/listen' || path === 'quran-listen') return 'quran-listen';
      if (path.startsWith('quran/listen/')) return 'quran-listen-surah';
      if (path === 'quran/reciters' || path === 'quran-reciters') return 'quran-reciters';
      if (path.startsWith('quran/reciters/')) return 'quran-reciter-detail';
      if (path === 'quran/surahs' || path === 'quran-surahs') return 'quran-surahs';
      if (path === 'quran/history' || path === 'quran-history') return 'quran-history';
      if (path === 'quran/favorites' || path === 'quran-favorites') return 'quran-favorites';
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
      if (path === 'khatmah' || path === 'khatmah/my') return 'khatmah';
      if (path === 'khatmah/plan' || path === 'khatmah-plan') return 'khatmah-plan';
      if (path === 'khatmah/hifz' || path === 'khatmah-hifz') return 'khatmah-hifz';
      if (path === 'khatmah/hifz/review' || path === 'khatmah/review' || path === 'khatmah-review') return 'khatmah-review';
      if (path === 'khatmah/progress' || path === 'khatmah-progress') return 'khatmah-progress';
      if (path === 'khatmah/history' || path === 'khatmah-history') return 'khatmah-history';
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
    if (tab === 'quran') {
      if (typeof contextId === 'number') {
        setSelectedSurahNumber(contextId);
        setSelectedAyahNumber(undefined);
      } else if (contextId && typeof contextId === 'object') {
        if (contextId.surah) setSelectedSurahNumber(contextId.surah);
        if (contextId.ayah) setSelectedAyahNumber(contextId.ayah);
      }
    }
    if (tab.startsWith('khatmah') && contextId) {
      setKhatmahContext(contextId);
    }
    if (tab === 'quran-listen-surah' && typeof contextId === 'number') {
      setSelectedListeningSurahNumber(contextId);
    }
    if (tab === 'quran-reciter-detail' && typeof contextId === 'string') {
      setSelectedReciterSlug(contextId);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (typeof window !== 'undefined') {
      let newPath = tab === 'home' ? '/' : `/${tab}`;
      if (tab === 'quran-listen') newPath = '/quran/listen';
      else if (tab === 'quran-reciters') newPath = '/quran/reciters';
      else if (tab === 'quran-surahs') newPath = '/quran/surahs';
      else if (tab === 'quran-history') newPath = '/quran/history';
      else if (tab === 'quran-favorites') newPath = '/quran/favorites';
      else if (tab === 'quran-reciter-detail' && contextId) newPath = `/quran/reciters/${contextId}`;
      else if (tab === 'quran-listen-surah' && contextId) newPath = `/quran/listen/${contextId}`;
      else if (tab === 'khatmah') newPath = '/khatmah';
      else if (tab === 'khatmah-plan') newPath = '/khatmah/plan';
      else if (tab === 'khatmah-hifz') newPath = '/khatmah/hifz';
      else if (tab === 'khatmah-review') newPath = '/khatmah/hifz/review';
      else if (tab === 'khatmah-progress') newPath = '/khatmah/progress';
      else if (tab === 'khatmah-history') newPath = '/khatmah/history';

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
      if (raw === 'quran/listen' || raw === 'quran-listen') {
        setCurrentTab('quran-listen');
      } else if (raw.startsWith('quran/listen/')) {
        const surahPart = raw.split('/')[2];
        const num = parseInt(surahPart, 10);
        if (!isNaN(num)) setSelectedListeningSurahNumber(num);
        setCurrentTab('quran-listen-surah');
      } else if (raw === 'quran/reciters' || raw === 'quran-reciters') {
        setCurrentTab('quran-reciters');
      } else if (raw.startsWith('quran/reciters/')) {
        const slug = raw.split('/')[2];
        setSelectedReciterSlug(slug);
        setCurrentTab('quran-reciter-detail');
      } else if (raw === 'quran/surahs' || raw === 'quran-surahs') {
        setCurrentTab('quran-surahs');
      } else if (raw === 'quran/history' || raw === 'quran-history') {
        setCurrentTab('quran-history');
      } else if (raw === 'quran/favorites' || raw === 'quran-favorites') {
        setCurrentTab('quran-favorites');
      } else if (raw === 'khatmah' || raw === 'khatmah/my') {
        setCurrentTab('khatmah');
      } else if (raw === 'khatmah/plan' || raw === 'khatmah-plan') {
        setCurrentTab('khatmah-plan');
      } else if (raw === 'khatmah/hifz' || raw === 'khatmah-hifz') {
        setCurrentTab('khatmah-hifz');
      } else if (raw === 'khatmah/hifz/review' || raw === 'khatmah/review' || raw === 'khatmah-review') {
        setCurrentTab('khatmah-review');
      } else if (raw === 'khatmah/progress' || raw === 'khatmah-progress') {
        setCurrentTab('khatmah-progress');
      } else if (raw === 'khatmah/history' || raw === 'khatmah-history') {
        setCurrentTab('khatmah-history');
      } else {
        const path = raw.split('/')[0] || 'home';
        setCurrentTab(path);
      }
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
      case 'quran-listen':
        return <QuranListeningView onNavigate={handleNavigate} initialSubTab="listen" />;
      case 'quran-reciters':
        return <QuranListeningView onNavigate={handleNavigate} initialSubTab="reciters" />;
      case 'quran-reciter-detail':
        return (
          <QuranListeningView
            onNavigate={handleNavigate}
            initialSubTab="reciters"
            initialReciterSlug={selectedReciterSlug || undefined}
          />
        );
      case 'quran-surahs':
        return <QuranListeningView onNavigate={handleNavigate} initialSubTab="surahs" />;
      case 'quran-listen-surah':
        return (
          <QuranListeningView
            onNavigate={handleNavigate}
            initialSubTab="surahs"
            initialSurahNumber={selectedListeningSurahNumber || 1}
          />
        );
      case 'quran-history':
        return <QuranListeningView onNavigate={handleNavigate} initialSubTab="history" />;
      case 'quran-favorites':
        return <QuranListeningView onNavigate={handleNavigate} initialSubTab="favorites" />;
      case 'khatmah':
        return <KhatmahView initialSubTab="my" onNavigate={handleNavigate} contextParams={khatmahContext} />;
      case 'khatmah-plan':
        return <KhatmahView initialSubTab="plan" onNavigate={handleNavigate} contextParams={khatmahContext} />;
      case 'khatmah-hifz':
        return <KhatmahView initialSubTab="hifz" onNavigate={handleNavigate} contextParams={khatmahContext} />;
      case 'khatmah-review':
        return <KhatmahView initialSubTab="review" onNavigate={handleNavigate} contextParams={khatmahContext} />;
      case 'khatmah-progress':
        return <KhatmahView initialSubTab="progress" onNavigate={handleNavigate} contextParams={khatmahContext} />;
      case 'khatmah-history':
        return <KhatmahView initialSubTab="history" onNavigate={handleNavigate} contextParams={khatmahContext} />;
      case 'quran':
        return (
          <QuranView
            initialSurahNumber={selectedSurahNumber}
            initialAyahNumber={selectedAyahNumber}
            onNavigate={handleNavigate}
          />
        );
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

      {/* Quran Streaming Dedicated Mini Player */}
      <QuranMiniPlayer onExpand={() => handleNavigate('quran-listen')} />

      {/* Quran Fullscreen / Expanded Player Modal */}
      <QuranFullPlayerModal />

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
            <QuranAudioProvider>
              <ShareProvider>
                <AppContent />
              </ShareProvider>
            </QuranAudioProvider>
          </RadioProvider>
        </AudioProvider>
      </AdminProvider>
    </UserProvider>
  );
}

