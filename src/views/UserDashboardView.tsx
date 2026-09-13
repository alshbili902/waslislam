import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useUser } from '../context/UserContext';
import { dashboardService, DashboardSummary } from '../services/dashboardService';
import { fetchPrayerTimes, calculateNextPrayer, NextPrayerInfo, POPULAR_CITIES } from '../services/prayerService';
import { PrayerTimesData } from '../types';

// Dashboard Components
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { ProfileCard } from '../components/dashboard/ProfileCard';
import { DailyOverviewSection } from '../components/dashboard/DailyOverviewSection';
import { QuranProgressCard } from '../components/dashboard/QuranProgressCard';
import { DailyWirdSection } from '../components/dashboard/DailyWirdSection';
import { AzkarProgressSection } from '../components/dashboard/AzkarProgressSection';
import { SavedContentSection } from '../components/dashboard/SavedContentSection';
import { RecentActivitySection } from '../components/dashboard/RecentActivitySection';
import { RadioPlayerWidget } from '../components/dashboard/RadioPlayerWidget';
import { PrayerWidget } from '../components/dashboard/PrayerWidget';
import { QiblaWidget } from '../components/dashboard/QiblaWidget';
import { CalendarWidget } from '../components/dashboard/CalendarWidget';
import { TasbeehWidget } from '../components/dashboard/TasbeehWidget';
import { PersonalStatsSection } from '../components/dashboard/PersonalStatsSection';
import { QuickActionsSection } from '../components/dashboard/QuickActionsSection';
import { NotificationCenterModal } from '../components/dashboard/NotificationCenterModal';
import { UserSettingsModal } from '../components/dashboard/UserSettingsModal';
import { ProfileEditModal } from '../components/dashboard/ProfileEditModal';
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton';
import { DashboardError } from '../components/dashboard/DashboardError';

interface UserDashboardViewProps {
  onNavigate: (tab: string, contextId?: any) => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export const UserDashboardView: React.FC<UserDashboardViewProps> = ({
  onNavigate,
  isDarkMode = false,
  onToggleTheme = () => {},
}) => {
  const {
    user,
    isAuthenticated,
    isLoadingAuth,
    signOut,
    refreshProfile,
    notificationSettings,
    updateNotificationSettings,
  } = useUser();

  // Dashboard Data State
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Prayer Timings State
  const [prayerTimings, setPrayerTimings] = useState<PrayerTimesData | null>(null);
  const [nextPrayer, setNextPrayer] = useState<NextPrayerInfo>({
    currentPrayerAr: 'الظهر',
    nextPrayerAr: 'العصر',
    nextPrayerTime: '15:30',
    remainingMinutes: 45,
    remainingSeconds: 2700,
    formattedCountdown: '00:45:00',
    progressPercent: 65,
  });

  // Modal Dialog States
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);

  // 1. Auth Guard: If not authenticated, redirect to /login
  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      onNavigate('login');
    }
  }, [isLoadingAuth, isAuthenticated, onNavigate]);

  // 2. Fetch Dashboard Data
  const loadDashboardData = useCallback(async () => {
    if (!user?.id) return;
    setIsLoadingData(true);
    setDataError(null);
    try {
      const summary = await dashboardService.getDashboardSummary(user.id);
      setData(summary);
    } catch (err: any) {
      console.error('Failed to load dashboard summary:', err);
      setDataError(err?.message || 'تعذر جلب البيانات من الخادم');
    } finally {
      setIsLoadingData(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id, loadDashboardData]);

  // 3. Fetch Prayer Times for User's City
  useEffect(() => {
    async function loadPrayers() {
      const cityName = user?.city || 'مكة المكرمة';
      const city = POPULAR_CITIES.find((c) => c.nameAr === cityName) || POPULAR_CITIES[0];
      const timings = await fetchPrayerTimes(city.lat, city.lng, city.method, city.nameAr);
      setPrayerTimings(timings);
      const next = calculateNextPrayer(timings);
      setNextPrayer(next);
    }
    loadPrayers();

    // Live countdown timer update every second
    const timer = setInterval(() => {
      setPrayerTimings((prev) => {
        if (prev) {
          const next = calculateNextPrayer(prev);
          setNextPrayer(next);
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [user?.city]);

  // Handle Wird Toggle
  const handleToggleWirdItem = async (key: keyof any, currentValue: boolean) => {
    if (!user?.id || !data?.dailyWird) return;
    const nextVal = !currentValue;

    // Optimistic UI update
    setData((prev) => {
      if (!prev || !prev.dailyWird) return prev;
      const updatedWird = { ...prev.dailyWird, [key]: nextVal };
      return { ...prev, dailyWird: updatedWird };
    });

    try {
      const updated = await dashboardService.updateDailyWird(user.id, { [key]: nextVal });
      setData((prev) => (prev ? { ...prev, dailyWird: updated } : null));
    } catch (e) {
      console.error('Error toggling wird item:', e);
    }
  };

  // Handle Tasbeeh tap from widget
  const handleTasbeehIncrement = async () => {
    if (!user?.id) return;
    setData((prev) => {
      if (!prev) return prev;
      const newToday = prev.tasbeehStats.todayCount + 1;
      const newTotal = prev.tasbeehStats.totalCount + 1;
      return {
        ...prev,
        tasbeehStats: { ...prev.tasbeehStats, todayCount: newToday, totalCount: newTotal },
      };
    });

    try {
      await dashboardService.recordTasbeehSession(user.id, 'سبحان الله وبحمده', 1);
    } catch (e) {
      console.error(e);
    }
  };

  // Notification handlers
  const handleMarkAsRead = async (id: string) => {
    setData((prev) => {
      if (!prev) return prev;
      const updated = prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
      const unreadCount = updated.filter((n) => !n.read).length;
      return { ...prev, notifications: updated, unreadNotificationCount: unreadCount };
    });
    await dashboardService.markNotificationAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    setData((prev) => {
      if (!prev) return prev;
      const updated = prev.notifications.map((n) => ({ ...n, read: true }));
      return { ...prev, notifications: updated, unreadNotificationCount: 0 };
    });
    await dashboardService.markAllNotificationsAsRead(user.id);
  };

  const handleDeleteNotification = async (id: string) => {
    setData((prev) => {
      if (!prev) return prev;
      const updated = prev.notifications.filter((n) => n.id !== id);
      const unreadCount = updated.filter((n) => !n.read).length;
      return { ...prev, notifications: updated, unreadNotificationCount: unreadCount };
    });
    await dashboardService.deleteNotification(id);
  };

  // Favorite & Bookmark removal
  const handleRemoveFavorite = async (type: string, referenceId: string) => {
    if (!user?.id) return;
    setData((prev) => {
      if (!prev) return prev;
      const updated = prev.favorites.filter((f) => !(f.type === type && f.referenceId === referenceId));
      return { ...prev, favorites: updated };
    });
    await dashboardService.removeFavorite(user.id, type, referenceId);
  };

  const handleRemoveBookmark = async (bookmarkId: string) => {
    if (!user?.id) return;
    setData((prev) => {
      if (!prev) return prev;
      const updated = prev.bookmarks.filter((b) => b.id !== bookmarkId);
      return { ...prev, bookmarks: updated };
    });
    await dashboardService.removeBookmark(user.id, bookmarkId);
  };

  // Settings Save
  const handleSaveProfile = async (updates: any) => {
    if (!user?.id) return;
    await dashboardService.updateProfile(user.id, updates);
    await refreshProfile();
    await loadDashboardData();
  };

  const handleSaveSettings = async (updates: any) => {
    if (!user?.id) return;
    await dashboardService.updateUserSettings(user.id, updates);
    await loadDashboardData();
  };

  // Hijri & Gregorian Formatted Dates
  const hijriDateFormatted = prayerTimings
    ? `${prayerTimings.dateHijri.day} ${prayerTimings.dateHijri.monthAr} ${prayerTimings.dateHijri.year} هـ`
    : '19 ربيع الأول 1448 هـ';

  const gregorianDateFormatted = prayerTimings
    ? prayerTimings.dateGregorian
    : new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  if (isLoadingAuth || (!data && isLoadingData)) {
    return <DashboardSkeleton />;
  }

  if (dataError) {
    return <DashboardError message={dataError} onRetry={loadDashboardData} />;
  }

  // Safe defaults if offline
  const safeData = data || {
    profile: user,
    quranProgress: null,
    dailyWird: {
      id: 'wird_today',
      userId: user?.id || '',
      wirdDate: new Date().toISOString().split('T')[0],
      quranCompleted: false,
      quranPagesRead: 0,
      morningAzkarCompleted: false,
      eveningAzkarCompleted: false,
      hadithRead: false,
      duaRead: false,
      tasbeehCompleted: false,
      tasbeehCount: 0,
      completionPercentage: 0,
    },
    azkarProgress: [],
    recentActivity: [],
    favorites: [],
    bookmarks: [],
    notifications: [],
    unreadNotificationCount: 0,
    streak: { currentStreak: 0, longestStreak: 0, lastActivityDate: '' },
    settings: null,
    tasbeehStats: { todayCount: 0, totalCount: 0, todaySessions: 0 },
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header (Greeting, Hijri/Gregorian Date, Notifications, Theme, Settings) */}
      <DashboardHeader
        user={safeData.profile || user}
        streak={safeData.streak}
        unreadCount={safeData.unreadNotificationCount}
        hijriDateFormatted={hijriDateFormatted}
        gregorianDateFormatted={gregorianDateFormatted}
        isDarkMode={isDarkMode}
        onToggleTheme={onToggleTheme}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenProfile={() => setIsProfileEditOpen(true)}
        onSignOut={signOut}
      />

      {/* Responsive Layout: Desktop Multi-Column vs Mobile Prioritized Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Area (8 Columns on Desktop) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Daily Overview ("يومك في وصل") */}
          <DailyOverviewSection
            nextPrayer={nextPrayer}
            onNavigate={onNavigate}
          />

          {/* Quran Progress Card ("متابعة القراءة") */}
          <QuranProgressCard
            progress={safeData.quranProgress}
            bookmarksCount={safeData.bookmarks.length}
            favoriteAyahsCount={safeData.favorites.filter((f) => f.type === 'ayah').length}
            onContinueReading={(surahNum) => onNavigate('quran', surahNum)}
          />

          {/* Daily Wird Section ("وردك اليومي") */}
          <DailyWirdSection
            wird={safeData.dailyWird}
            onToggleItem={handleToggleWirdItem}
            onNavigate={onNavigate}
          />

          {/* Azkar Progress Section */}
          <AzkarProgressSection
            morningCompleted={safeData.dailyWird.morningAzkarCompleted}
            eveningCompleted={safeData.dailyWird.eveningAzkarCompleted}
            azkarProgressList={safeData.azkarProgress}
            onNavigate={onNavigate}
          />

          {/* Saved Content Section ("المحفوظات") */}
          <SavedContentSection
            favorites={safeData.favorites}
            bookmarks={safeData.bookmarks}
            onRemoveFavorite={handleRemoveFavorite}
            onRemoveBookmark={handleRemoveBookmark}
            onNavigate={onNavigate}
          />

          {/* Recent Activity Section ("نشاطك الأخير") */}
          <RecentActivitySection activities={safeData.recentActivity} />
        </div>

        {/* Secondary Sidebar (4 Columns on Desktop) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Profile Card */}
          <ProfileCard
            user={safeData.profile || user}
            streak={safeData.streak}
            totalVersesRead={safeData.quranProgress ? safeData.quranProgress.totalVersesRead : 0}
            totalFavoritesCount={safeData.favorites.length + safeData.bookmarks.length}
            onEditProfile={() => setIsProfileEditOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />

          {/* Radio Player Widget ("تستمع الآن / إذاعة القرآن") */}
          <RadioPlayerWidget onNavigate={onNavigate} />

          {/* Prayer Widget */}
          <PrayerWidget
            timings={prayerTimings}
            nextPrayer={nextPrayer}
            cityName={user?.city || 'مكة المكرمة'}
            onNavigate={onNavigate}
          />

          {/* Qibla & Calendar Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            <QiblaWidget
              onNavigate={onNavigate}
              cityName={user?.city || 'مكة المكرمة'}
            />
            <CalendarWidget
              hijriDay={prayerTimings?.dateHijri.day || '19'}
              hijriMonth={prayerTimings?.dateHijri.monthAr || 'ربيع الأول'}
              hijriYear={prayerTimings?.dateHijri.year || '1448'}
              gregorianDate={prayerTimings?.dateGregorian || ''}
              onNavigate={onNavigate}
            />
          </div>

          {/* Tasbeeh Widget */}
          <TasbeehWidget
            todayCount={safeData.tasbeehStats.todayCount}
            totalCount={safeData.tasbeehStats.totalCount}
            onIncrement={handleTasbeehIncrement}
            onNavigate={onNavigate}
          />

          {/* Quick Actions Shortcuts */}
          <QuickActionsSection onNavigate={onNavigate} />
        </div>
      </div>

      {/* Personal Statistics Section */}
      <PersonalStatsSection
        streak={safeData.streak}
        quranProgress={safeData.quranProgress}
        tasbeehTotal={safeData.tasbeehStats.totalCount}
        favoritesCount={safeData.favorites.length}
        bookmarksCount={safeData.bookmarks.length}
        activityCount={safeData.recentActivity.length}
      />

      {/* Modals & Dialogs */}
      <NotificationCenterModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={safeData.notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onDeleteNotification={handleDeleteNotification}
      />

      <UserSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={safeData.profile || user}
        settings={safeData.settings}
        notificationSettings={notificationSettings}
        onSaveProfile={handleSaveProfile}
        onSaveSettings={handleSaveSettings}
        onSaveNotificationSettings={updateNotificationSettings}
      />

      <ProfileEditModal
        isOpen={isProfileEditOpen}
        onClose={() => setIsProfileEditOpen(false)}
        user={safeData.profile || user}
        onSave={handleSaveProfile}
      />
    </div>
  );
};
