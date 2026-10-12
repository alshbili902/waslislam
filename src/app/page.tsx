'use client';

import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from '../components/Navbar';
import { AudioPlayerBar, AudioTrack } from '../components/AudioPlayerBar';
import { HomeDashboard } from '../components/HomeDashboard';
import { QuranPlatform } from '../components/QuranPlatform';
import { DailyWorshipHub } from '../components/worship/DailyWorshipHub';
import { IslamicContentHub } from '../components/IslamicContentHub';
import { MyIslamicLibrary } from '../components/library/MyIslamicLibrary';
import { ZakatCalculator } from '../components/tools/ZakatCalculator';
import { KhatmahTracker } from '../components/KhatmahTracker';
import { QuranReadingPlanner } from '../components/quran/QuranReadingPlanner';
import { QuranReflectionJournal } from '../components/quran/QuranReflectionJournal';
import { WaslKidsHub } from '../components/kids/WaslKidsHub';
import { IslamicKnowledgeSearch } from '../components/discover/IslamicKnowledgeSearch';
import { ShareCardStudio, ShareContent } from '../components/ShareCardStudio';
import { GlobalSearchModal } from '../components/GlobalSearchModal';
import { UserAccountModal } from '../components/UserAccountModal';
import { ReadingPreferencesModal } from '../components/quran/ReadingPreferencesModal';
import { OfflineManagerModal } from '../components/tools/OfflineManagerModal';
import { QuickAccessWidgetModal } from '../components/tools/QuickAccessWidgetModal';
import { PersonalReportsModal } from '../components/worship/PersonalReportsModal';
import { PersonalizationSettingsModal, personalizationManager } from '../components/tools/PersonalizationSettingsModal';
import { QuranDictionaryExplorer } from '../components/quran/QuranDictionaryExplorer';
import { TafsirComparisonWorkspace } from '../components/quran/TafsirComparisonWorkspace';
import { AudioBookmarksLibrary } from '../components/quran/AudioBookmarksLibrary';
import { FamilyModeHub } from '../components/family/FamilyModeHub';
import { ContentTrustCenter } from '../components/trust/ContentTrustCenter';
import { BackupRestoreModal } from '../components/tools/BackupRestoreModal';
import { QuranThematicIndex } from '../components/quran/QuranThematicIndex';
import { SimilarAyahsExplorer } from '../components/quran/SimilarAyahsExplorer';
import { IslamicSeasonsCenter } from '../components/seasons/IslamicSeasonsCenter';
import { GuidedLearningPathsHub } from '../components/education/GuidedLearningPathsHub';
import { SeniorFriendlyNavbar } from '../components/accessibility/SeniorFriendlyNavbar';
import { AccessibilitySettingsModal } from '../components/accessibility/AccessibilitySettingsModal';
import { accessibilityManager, AccessibilitySettings, DEFAULT_SETTINGS as DEFAULT_ACCESSIBILITY_SETTINGS } from '../utils/accessibilityManager';
import { AudioBookmark } from '../utils/audioBookmarkManager';
import { BrandLogo } from '../components/BrandLogo';
import { CITIES, type CityCoordinate } from '../utils/prayerTimes';
import { detectLocalTimezone } from '../utils/timeFormat';
import { localStore, supabase, syncKhatmahToCloud, syncReadingPositionToCloud } from '../lib/supabase';
import { ThemeMode, resolveSafeTheme } from '../utils/theme';
import { CinematicPageTransition } from '../components/motion/CinematicPageTransition';


export default function WaslIslamicApp() {
  const isHydratedRef = React.useRef(false);

  // Deterministic SSR-safe initial state (guarantees server HTML and initial client render match exactly)
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [isEnglish, setIsEnglish] = useState<boolean>(false);
  const [selectedCity, setSelectedCity] = useState<CityCoordinate>(CITIES[0]);

  // Accessibility and Senior-Friendly State
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>(DEFAULT_ACCESSIBILITY_SETTINGS);
  const [isAccessibilityModalOpen, setIsAccessibilityModalOpen] = useState(false);

  // Target navigation states between features
  const [thematicTarget, setThematicTarget] = useState<{ surah: number; ayah: number } | null>(null);
  const [similarAyahsTarget, setSimilarAyahsTarget] = useState<{ surah: number; ayah?: number } | null>(null);

  // Audio track state
  const [currentAudioTrack, setCurrentAudioTrack] = useState<AudioTrack | null>(null);
  const [selectedReciterId, setSelectedReciterId] = useState<string>('alafasy');

  // Khatmah progress state
  const [khatmahProgress, setKhatmahProgress] = useState<{ currentPage: number; totalPages: number; targetDays: number }>({
    currentPage: 1,
    totalPages: 604,
    targetDays: 30
  });

  // Share card modal/direct studio content
  const [shareStudioContent, setShareStudioContent] = useState<ShareContent | undefined>(undefined);
  
  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isReadingPrefsOpen, setIsReadingPrefsOpen] = useState(false);
  const [isOfflineManagerOpen, setIsOfflineManagerOpen] = useState(false);
  const [isQuickAccessOpen, setIsQuickAccessOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isPersonalizationOpen, setIsPersonalizationOpen] = useState(false);
  const [isBackupRestoreOpen, setIsBackupRestoreOpen] = useState(false);

  // Hydrate persisted client preferences after initial mount to eliminate hydration mismatch
  useEffect(() => {
    isHydratedRef.current = true;

    // Restore selected city or detect local timezone
    const savedCityId = localStore.get<string | null>('selected_city_id', null);
    if (savedCityId) {
      const found = CITIES.find(c => c.id === savedCityId);
      if (found) setSelectedCity(found);
    } else {
      const detected = detectLocalTimezone().matchedCity;
      if (detected && detected.id !== CITIES[0].id) {
        setSelectedCity(detected);
      }
    }

    // Restore theme
    const savedTheme = localStore.get<string | null>('theme', null);
    if (savedTheme) {
      const safe = resolveSafeTheme(savedTheme);
      setTheme(safe);
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', safe);
      }
    }

    // Restore language preference
    const savedLang = localStore.get<boolean | null>('is_english', null);
    if (savedLang !== null) {
      setIsEnglish(savedLang);
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('dir', savedLang ? 'ltr' : 'rtl');
        document.documentElement.setAttribute('lang', savedLang ? 'en' : 'ar');
      }
    }

    // Restore reciter
    const savedReciter = localStore.get<string | null>('reciter_id', null);
    if (savedReciter) setSelectedReciterId(savedReciter);

    // Restore khatmah progress
    const savedKhatmahPage = localStore.get<number>('khatmah_page', 1);
    const savedKhatmahDays = localStore.get<number>('khatmah_plan_days', 30);
    if (savedKhatmahPage !== 1 || savedKhatmahDays !== 30) {
      setKhatmahProgress(prev => ({
        ...prev,
        currentPage: savedKhatmahPage,
        targetDays: savedKhatmahDays
      }));
    }

    // Restore default tab
    const prefs = personalizationManager.getPreferences();
    if (prefs.defaultTab && prefs.defaultTab !== 'home') {
      setCurrentTab(prefs.defaultTab as NavTab);
    }

    // Restore accessibility
    setAccessibilitySettings(accessibilityManager.getSettings());
  }, []);

  // Sync theme to DOM (only after initial hydration)
  useEffect(() => {
    if (!isHydratedRef.current) return;
    if (typeof document !== 'undefined') {
      const activeTheme = resolveSafeTheme(theme);
      document.documentElement.setAttribute('data-theme', activeTheme);
      localStore.set('theme', activeTheme);
    }
  }, [theme]);

  // Sync language and dir to DOM (only after initial hydration)
  useEffect(() => {
    if (!isHydratedRef.current) return;
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('dir', isEnglish ? 'ltr' : 'rtl');
      document.documentElement.setAttribute('lang', isEnglish ? 'en' : 'ar');
      localStore.set('is_english', isEnglish);
    }
  }, [isEnglish]);

  // Handlers
  const handleCityChange = (city: CityCoordinate) => {
    setSelectedCity(city);
    localStore.set('selected_city_id', city.id);
  };

  const handleReciterChange = (id: string) => {
    setSelectedReciterId(id);
    localStore.set('reciter_id', id);
  };

  const handleUpdateKhatmahPage = async (page: number) => {
    setKhatmahProgress(prev => {
      const next = { ...prev, currentPage: page };
      localStore.set('khatmah_page', page);
      return next;
    });

    // Sync to Supabase if authenticated
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        await syncKhatmahToCloud(data.session.user.id, page, khatmahProgress.targetDays);
      }
    }
  };

  const handleTabChange = (tab: NavTab) => {
    setCurrentTab(tab);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (tab === 'home') {
        if (window.location.hash) {
          window.history.pushState(null, '', window.location.pathname);
        }
      } else {
        if (window.location.hash !== `#${tab}`) {
          window.history.pushState(null, '', `#${tab}`);
        }
      }
    }
  };

  // Synchronize browser Back / Forward buttons & direct hash access
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncFromHash = () => {
      const hash = window.location.hash.replace('#', '');
      const validTabs: NavTab[] = [
        'home', 'quran', 'worship', 'discover', 'library', 'kids', 'planner',
        'search-sources', 'journal', 'studio', 'zakat', 'khatmah', 'dictionary',
        'tafsir-lab', 'audio-bookmarks', 'family', 'trust-center', 'thematic-index',
        'similar-ayahs', 'seasons', 'learning-paths'
      ];
      if (hash && validTabs.includes(hash as NavTab)) {
        setCurrentTab(hash as NavTab);
      }
    };

    syncFromHash();
    window.addEventListener('popstate', syncFromHash);
    window.addEventListener('hashchange', syncFromHash);

    return () => {
      window.removeEventListener('popstate', syncFromHash);
      window.removeEventListener('hashchange', syncFromHash);
    };
  }, []);

  const handleOpenShareCard = (content: ShareContent) => {
    setShareStudioContent(content);
    handleTabChange('studio');
  };

  return (
    <div suppressHydrationWarning className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300">
      {/* Top Navbar */}
      {accessibilitySettings.isSeniorMode && accessibilitySettings.isSimplifiedNav ? (
        <SeniorFriendlyNavbar
          currentTab={currentTab}
          onSelectTab={handleTabChange}
          theme={theme}
          onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          onOpenSettings={() => setIsAccessibilityModalOpen(true)}
          onDisableSeniorMode={() => {
            const updated = accessibilityManager.updateSettings({ isSeniorMode: false, isSimplifiedNav: false });
            setAccessibilitySettings(updated);
          }}
          isEnglish={isEnglish}
        />
      ) : (
        <Navbar
          currentTab={currentTab}
          onSelectTab={handleTabChange}
          theme={theme}
          onThemeChange={setTheme}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenAccount={() => setIsAccountOpen(true)}
          onOpenReadingPrefs={() => setIsReadingPrefsOpen(true)}
          onOpenOfflineManager={() => setIsOfflineManagerOpen(true)}
          onOpenQuickAccess={() => setIsQuickAccessOpen(true)}
          onOpenReports={() => setIsReportsOpen(true)}
          onOpenPersonalization={() => setIsPersonalizationOpen(true)}
          onOpenBackupRestore={() => setIsBackupRestoreOpen(true)}
          onOpenAccessibility={() => setIsAccessibilityModalOpen(true)}
          isEnglish={isEnglish}
          onToggleLanguage={() => setIsEnglish(!isEnglish)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 pb-24 sm:pb-28 lg:pb-8">
        <CinematicPageTransition activeTab={currentTab}>
          {/* TAB 1: الرئيسية (Home Dashboard) */}
          {currentTab === 'home' && (
            <HomeDashboard
              onSelectTab={handleTabChange}
            onPlayTrack={setCurrentAudioTrack}
            onOpenShareCard={handleOpenShareCard}
            selectedCity={selectedCity}
            onChangeCity={handleCityChange}
            isEnglish={isEnglish}
            khatmahProgress={khatmahProgress}
          />
        )}

        {/* TAB 2: القرآن الكريم (Quran Platform) */}
        {currentTab === 'quran' && (
          <QuranPlatform
            onPlayTrack={setCurrentAudioTrack}
            onOpenShareCard={handleOpenShareCard}
            selectedReciterId={selectedReciterId}
            isEnglish={isEnglish}
            initialSurahNumber={thematicTarget?.surah}
            initialAyahNumber={thematicTarget?.ayah}
            onOpenThematicIndex={(sNum) => {
              if (sNum) setThematicTarget({ surah: sNum, ayah: 1 });
              setCurrentTab('thematic-index');
            }}
            onOpenSimilarAyahs={(sNum) => {
              if (sNum) setSimilarAyahsTarget({ surah: sNum });
              setCurrentTab('similar-ayahs');
            }}
            onSaveReadingPosition={async (surah, ayah) => {
              localStore.set('last_read_surah', surah);
              localStore.set('last_read_ayah', ayah);
              if (supabase) {
                const { data } = await supabase.auth.getSession();
                if (data.session?.user) {
                  await syncReadingPositionToCloud(data.session.user.id, surah, ayah);
                }
              }
            }}
            onOpenReflectionJournal={(s, a) => setCurrentTab('journal')}
          />
        )}

        {/* TAB 3: عبادتي (Unified Daily Worship Hub: Yawmi, Prayer, Tasbeeh, Calendar, Reminders) */}
        {currentTab === 'worship' && (
          <DailyWorshipHub
            selectedCity={selectedCity}
            onChangeCity={handleCityChange}
            isEnglish={isEnglish}
            onOpenQuran={() => setCurrentTab('quran')}
            onOpenShareCard={handleOpenShareCard}
          />
        )}

        {/* TAB 4: عالم وصل للصغار (Wasl Kids Hub) */}
        {currentTab === 'kids' && (
          <WaslKidsHub
            isEnglish={isEnglish}
            onOpenQuran={() => setCurrentTab('quran')}
          />
        )}

        {/* TAB 5: وضع العائلة (Family Mode Hub) */}
        {currentTab === 'family' && (
          <FamilyModeHub
            isEnglish={isEnglish}
            onNavigateToKids={() => setCurrentTab('kids')}
            onNavigateToQuran={() => setCurrentTab('quran')}
          />
        )}

        {/* TAB 6: اكتشف (Wasl Academy, Authentic Hadith, Stories, Names of Allah, Audio, Sources, Hajj) */}
        {currentTab === 'discover' && (
          <IslamicContentHub
            onPlayTrack={setCurrentAudioTrack}
            onOpenShareCard={handleOpenShareCard}
            selectedReciterId={selectedReciterId}
            onChangeReciter={handleReciterChange}
            isEnglish={isEnglish}
          />
        )}

        {/* TAB 7: مكتبتي (My Islamic Library) */}
        {currentTab === 'library' && (
          <MyIslamicLibrary
            isEnglish={isEnglish}
            onOpenShareCard={handleOpenShareCard}
          />
        )}

        {/* TAB 8: معجم القرآن التفاعلي (Interactive Quran Dictionary) */}
        {currentTab === 'dictionary' && (
          <QuranDictionaryExplorer
            isEnglish={isEnglish}
            onOpenAyah={() => setCurrentTab('quran')}
          />
        )}

        {/* TAB 9: مختبر تدبر الآيات ومقارنة التفاسير (Quran Tafsir Comparison) */}
        {currentTab === 'tafsir-lab' && (
          <TafsirComparisonWorkspace
            isEnglish={isEnglish}
            onOpenReflectionJournal={() => setCurrentTab('journal')}
          />
        )}

        {/* TAB 10: علامات الاستماع (Audio Bookmarks Library) */}
        {currentTab === 'audio-bookmarks' && (
          <AudioBookmarksLibrary
            isEnglish={isEnglish}
            onResumeBookmark={(bm: AudioBookmark) => {
              setCurrentAudioTrack({
                id: `ab-track-${bm.surahNumber}-${bm.reciterId}`,
                titleAr: `سورة ${bm.surahNameAr}`,
                titleEn: `Surah ${bm.surahNumber}`,
                subtitleAr: `${bm.reciterNameAr} - موضع ${bm.formattedTimestamp}`,
                subtitleEn: `${bm.reciterId} - at ${bm.formattedTimestamp}`,
                audioUrl: bm.audioUrl,
                surahNumber: bm.surahNumber,
                ayahNumber: bm.ayahNumber,
                seekSeconds: bm.timestampSeconds
              });
              setSelectedReciterId(bm.reciterId);
            }}
            onOpenAyah={() => setCurrentTab('quran')}
          />
        )}

        {/* TAB 11: مركز موثوقية المحتوى (Content Trust Center) */}
        {currentTab === 'trust-center' && (
          <ContentTrustCenter
            isEnglish={isEnglish}
          />
        )}

        {/* TAB 12: مخطط الورد القرآني (Quran Reading Planner) */}
        {currentTab === 'planner' && (
          <QuranReadingPlanner
            isEnglish={isEnglish}
            onOpenQuranToPage={() => setCurrentTab('quran')}
            onUpdateKhatmah={handleUpdateKhatmahPage}
          />
        )}

        {/* TAB 13: دفتر التدبر الشخصي (Quran Reflection Journal) */}
        {currentTab === 'journal' && (
          <QuranReflectionJournal
            isEnglish={isEnglish}
            onOpenQuranToAyah={() => setCurrentTab('quran')}
            onOpenShareCard={handleOpenShareCard}
          />
        )}

        {/* TAB 14: اسأل المصادر الإسلامية (Source-Grounded Search) */}
        {currentTab === 'search-sources' && (
          <IslamicKnowledgeSearch
            isEnglish={isEnglish}
            onOpenShareCard={handleOpenShareCard}
            onOpenQuranToSurah={() => setCurrentTab('quran')}
          />
        )}

        {/* SECONDARY TOOL: استوديو بطاقات وصل (Share Card Studio) */}
        {currentTab === 'studio' && (
          <ShareCardStudio
            initialContent={shareStudioContent}
            isEnglish={isEnglish}
          />
        )}

        {/* SECONDARY TOOL: حاسبة الزكاة (Zakat Calculator) */}
        {currentTab === 'zakat' && (
          <ZakatCalculator
            isEnglish={isEnglish}
          />
        )}

        {/* SECONDARY TOOL: متابعة الختمة (Khatmah Tracker & Reading Planner) */}
        {currentTab === 'khatmah' && (
          <QuranReadingPlanner
            isEnglish={isEnglish}
            onOpenQuranToPage={() => setCurrentTab('quran')}
            onUpdateKhatmah={handleUpdateKhatmahPage}
          />
        )}

        {/* FEATURE 1: الفهرس الموضوعي للقرآن (Quran Thematic Index) */}
        {currentTab === 'thematic-index' && (
          <QuranThematicIndex
            isEnglish={isEnglish}
            onOpenQuranAyah={(s, a) => {
              setThematicTarget({ surah: s, ayah: a });
              setCurrentTab('quran');
            }}
            onOpenTafsir={(s, a) => {
              setThematicTarget({ surah: s, ayah: a });
              setCurrentTab('tafsir-lab');
            }}
            onOpenShareCard={handleOpenShareCard}
            onOpenLearningPath={(id) => setCurrentTab('learning-paths')}
          />
        )}

        {/* FEATURE 3: مستكشف الآيات المتشابهة (Similar Ayahs Explorer) */}
        {currentTab === 'similar-ayahs' && (
          <SimilarAyahsExplorer
            isEnglish={isEnglish}
            initialSurahNumber={similarAyahsTarget?.surah}
            initialAyahNumber={similarAyahsTarget?.ayah}
            onOpenQuranAyah={(s, a) => {
              setThematicTarget({ surah: s, ayah: a });
              setCurrentTab('quran');
            }}
            onOpenTafsir={(s, a) => {
              setThematicTarget({ surah: s, ayah: a });
              setCurrentTab('tafsir-lab');
            }}
            onOpenShareCard={handleOpenShareCard}
          />
        )}

        {/* FEATURE 4: مركز المواسم الإسلامية (Islamic Seasons Center) */}
        {currentTab === 'seasons' && (
          <IslamicSeasonsCenter
            isEnglish={isEnglish}
            onOpenQuran={(s, a) => {
              setThematicTarget({ surah: s, ayah: a || 1 });
              setCurrentTab('quran');
            }}
            onOpenReadingPlanner={() => setCurrentTab('planner')}
            onOpenShareCard={handleOpenShareCard}
          />
        )}

        {/* FEATURE 7: المسارات التعليمية الموجهة (Guided Learning Paths) */}
        {currentTab === 'learning-paths' && (
          <GuidedLearningPathsHub
            isEnglish={isEnglish}
            onOpenQuran={(s, a) => {
              setThematicTarget({ surah: s, ayah: a || 1 });
              setCurrentTab('quran');
            }}
            onOpenShareCard={handleOpenShareCard}
          />
        )}
        </CinematicPageTransition>
      </main>

      {/* Official Wasl Islamic Footer */}
      <footer className="mt-16 border-t border-[var(--border-color)] bg-[var(--bg-card)]/60 backdrop-blur-md py-10 px-4 sm:px-6 pb-28 lg:pb-10 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-right">
          <BrandLogo
            size="md"
            showText={true}
            showSubtitle={true}
            showBadge={true}
            isEnglish={isEnglish}
            onClick={() => handleTabChange('home')}
          />

          <div className="flex flex-wrap justify-center gap-2.5 sm:gap-4 text-xs font-semibold text-[var(--text-muted)]">
            <button onClick={() => handleTabChange('home')} className="hover:text-[var(--gold)] transition-colors wasl-btn-interactive">
              {isEnglish ? 'Home' : 'الرئيسية'}
            </button>
            <button onClick={() => handleTabChange('quran')} className="hover:text-[var(--gold)] transition-colors wasl-btn-interactive">
              {isEnglish ? 'Quran' : 'القرآن الكريم'}
            </button>
            <button onClick={() => handleTabChange('thematic-index')} className="hover:text-[var(--gold)] transition-colors wasl-btn-interactive">
              {isEnglish ? 'Thematic Index' : 'الفهرس الموضوعي'}
            </button>
            <button onClick={() => handleTabChange('similar-ayahs')} className="hover:text-[var(--gold)] transition-colors wasl-btn-interactive">
              {isEnglish ? 'Similar Ayahs' : 'الآيات المتشابهة'}
            </button>
            <button onClick={() => handleTabChange('seasons')} className="hover:text-[var(--gold)] transition-colors wasl-btn-interactive">
              {isEnglish ? 'Islamic Seasons' : 'مركز المواسم'}
            </button>
            <button onClick={() => handleTabChange('learning-paths')} className="hover:text-[var(--gold)] transition-colors wasl-btn-interactive">
              {isEnglish ? 'Learning Paths' : 'المسارات التعليمية'}
            </button>
            <button onClick={() => setIsAccessibilityModalOpen(true)} className="hover:text-[var(--gold)] transition-colors wasl-btn-interactive">
              {isEnglish ? 'Accessibility' : 'وضع كبار السن'}
            </button>
            <button onClick={() => handleTabChange('dictionary')} className="hover:text-[var(--gold)] transition-colors wasl-btn-interactive">
              {isEnglish ? 'Quran Dictionary' : 'معجم القرآن'}
            </button>
            <button onClick={() => handleTabChange('tafsir-lab')} className="hover:text-[var(--gold)] transition-colors wasl-btn-interactive">
              {isEnglish ? 'Tafsir Lab' : 'مختبر التدبر'}
            </button>
            <button onClick={() => handleTabChange('audio-bookmarks')} className="hover:text-[var(--gold)] transition-colors wasl-btn-interactive">
              {isEnglish ? 'Audio Bookmarks' : 'علامات الاستماع'}
            </button>
            <button onClick={() => handleTabChange('family')} className="hover:text-[var(--gold)] transition-colors wasl-btn-interactive">
              {isEnglish ? 'Family Mode' : 'وضع العائلة'}
            </button>
            <button onClick={() => handleTabChange('trust-center')} className="hover:text-[var(--gold)] transition-colors wasl-btn-interactive">
              {isEnglish ? 'Trust Center' : 'مركز الموثوقية'}
            </button>
            <button onClick={() => setIsBackupRestoreOpen(true)} className="hover:text-[var(--gold)] transition-colors wasl-btn-interactive">
              {isEnglish ? 'Backup & Restore' : 'النسخ الاحتياطي'}
            </button>
            <button onClick={() => handleTabChange('planner')} className="hover:text-[var(--gold)] transition-colors wasl-btn-interactive">
              {isEnglish ? 'Planner' : 'مخطط الورد'}
            </button>
            <button onClick={() => handleTabChange('journal')} className="hover:text-[var(--gold)] transition-colors wasl-btn-interactive">
              {isEnglish ? 'Journal' : 'دفتر التدبر'}
            </button>
            <button onClick={() => handleTabChange('worship')} className="hover:text-[var(--gold)] transition-colors wasl-btn-interactive">
              {isEnglish ? 'My Worship' : 'عبادتي'}
            </button>
            <button onClick={() => handleTabChange('kids')} className="hover:text-[var(--gold)] transition-colors wasl-btn-interactive">
              {isEnglish ? 'Kids' : 'عالم الصغار'}
            </button>
            <button onClick={() => handleTabChange('library')} className="hover:text-[var(--gold)] transition-colors wasl-btn-interactive">
              {isEnglish ? 'My Library' : 'مكتبتي'}
            </button>
          </div>

          <div className="text-xs text-[var(--text-muted)] font-tajawal text-center md:text-left">
            <p className="font-bold text-[var(--gold)]">وصل الإسلامية — Wasl Islamic</p>
            <p className="opacity-80 mt-0.5">منصة إسلامية شاملة خالية من الإعلانات والتتبع</p>
          </div>
        </div>
      </footer>

      {/* Global Bottom Audio Player Bar */}
      <AudioPlayerBar
        currentTrack={currentAudioTrack}
        onCloseTrack={() => setCurrentAudioTrack(null)}
        onTrackChange={setCurrentAudioTrack}
        selectedReciterId={selectedReciterId}
        onChangeReciter={handleReciterChange}
        isEnglish={isEnglish}
      />

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTab={setCurrentTab}
        onSelectSurah={(surahNumber) => {
          setCurrentTab('quran');
          setIsSearchOpen(false);
        }}
        isEnglish={isEnglish}
      />

      {/* User Supabase Account & Sync Modal */}
      <UserAccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        isEnglish={isEnglish}
      />

      {/* Reading Preferences Modal */}
      <ReadingPreferencesModal
        isOpen={isReadingPrefsOpen}
        onClose={() => setIsReadingPrefsOpen(false)}
        isEnglish={isEnglish}
      />

      {/* Offline Storage Manager Modal */}
      <OfflineManagerModal
        isOpen={isOfflineManagerOpen}
        onClose={() => setIsOfflineManagerOpen(false)}
        isEnglish={isEnglish}
      />

      {/* Quick Access & Widget Modal */}
      <QuickAccessWidgetModal
        isOpen={isQuickAccessOpen}
        onClose={() => setIsQuickAccessOpen(false)}
        isEnglish={isEnglish}
        onSelectTab={(tab: NavTab) => {
          setCurrentTab(tab);
          setIsQuickAccessOpen(false);
        }}
      />

      {/* Personal Progress Reports Modal */}
      <PersonalReportsModal
        isOpen={isReportsOpen}
        onClose={() => setIsReportsOpen(false)}
        isEnglish={isEnglish}
      />

      {/* Personalization Settings Modal */}
      <PersonalizationSettingsModal
        isOpen={isPersonalizationOpen}
        onClose={() => setIsPersonalizationOpen(false)}
        isEnglish={isEnglish}
        theme={theme}
        onThemeChange={setTheme}
      />

      {/* Backup and Restore Modal */}
      <BackupRestoreModal
        isOpen={isBackupRestoreOpen}
        onClose={() => setIsBackupRestoreOpen(false)}
        isEnglish={isEnglish}
        onRestoreSuccess={() => {
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        }}
      />

      {/* Accessibility & Senior-Friendly Settings Modal */}
      <AccessibilitySettingsModal
        isOpen={isAccessibilityModalOpen}
        onClose={() => setIsAccessibilityModalOpen(false)}
        isEnglish={isEnglish}
        onSettingsChanged={(updated) => setAccessibilitySettings(updated)}
      />
    </div>
  );
}
