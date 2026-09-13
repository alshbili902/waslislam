import React, { createContext, useContext, useEffect, useState } from 'react';
import { localStore } from '../services/supabase';
import { NotificationSettings, QuranBookmark, UserFavorite, UserProfile } from '../types';
import { dashboardService } from '../services/dashboardService';

interface UserContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  isAdmin: boolean;
  bookmarks: QuranBookmark[];
  favorites: UserFavorite[];
  lastReading: { surahNumber: number; ayahNumber: number; surahNameAr: string; timestamp: number } | null;
  tasbihTotal: number;
  notificationSettings: NotificationSettings;
  signIn: (username: string, password: string) => Promise<{ error?: string }>;
  signUp: (
    clientName: string,
    username: string,
    password: string,
    confirmPassword?: string
  ) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  login: (username: string, fullName?: string, role?: 'super_admin' | 'user') => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  addBookmark: (surahNumber: number, surahNameAr: string, ayahNumber: number, note?: string) => Promise<void>;
  removeBookmark: (id: string) => Promise<void>;
  toggleFavorite: (item: Omit<UserFavorite, 'id' | 'timestamp'>) => Promise<boolean>;
  isFavorite: (type: string, referenceId: string) => boolean;
  updateLastReading: (surahNumber: number, ayahNumber: number, surahNameAr: string) => Promise<void>;
  incrementTasbihTotal: (count?: number) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
}

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  fajr: true,
  dhuhr: true,
  asr: true,
  maghrib: true,
  isha: true,
  morningAzkar: true,
  eveningAzkar: true,
  dailyHadith: true,
  dailyAyah: true,
  islamicEvents: true,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => localStore.get('current_user', null));
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [bookmarks, setBookmarks] = useState<QuranBookmark[]>(() => localStore.get('bookmarks', []));
  const [favorites, setFavorites] = useState<UserFavorite[]>(() => localStore.get('favorites', []));
  const [lastReading, setLastReading] = useState<{ surahNumber: number; ayahNumber: number; surahNameAr: string; timestamp: number } | null>(() =>
    localStore.get('last_reading', null)
  );
  const [tasbihTotal, setTasbihTotal] = useState<number>(() => localStore.get('tasbih_total', 0));
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() =>
    localStore.get('notification_settings', DEFAULT_NOTIFICATION_SETTINGS)
  );

  // Load user data (bookmarks, favorites, etc.)
  const loadUserData = async (userId: string, initialProfile?: Partial<UserProfile>) => {
    try {
      const profile = await dashboardService.getProfile(userId);
      if (profile) {
        setUser(profile);
        localStore.set('current_user', profile);
      } else if (initialProfile) {
        const fallback: UserProfile = {
          id: userId,
          username: initialProfile.username || 'user',
          usernameNormalized: initialProfile.usernameNormalized || (initialProfile.username ? initialProfile.username.toLowerCase() : 'user'),
          fullName: initialProfile.fullName || '',
          city: initialProfile.city || 'مكة المكرمة',
          country: initialProfile.country || 'المملكة العربية السعودية',
          role: 'user',
          createdAt: new Date().toISOString(),
          khatmahProgress: 0,
          totalAyahsRead: 0,
          totalTasbihCount: 0,
        };
        setUser(fallback);
        localStore.set('current_user', fallback);
      }

      // Load user bookmarks & favorites
      const [userBookmarks, userFavorites, quranProg, tasbeehData] = await Promise.all([
        dashboardService.getBookmarks(userId),
        dashboardService.getFavorites(userId),
        dashboardService.getQuranProgress(userId),
        dashboardService.getTasbeehStats(userId),
      ]);

      if (userBookmarks && userBookmarks.length > 0) setBookmarks(userBookmarks);
      if (userFavorites && userFavorites.length > 0) setFavorites(userFavorites);
      if (quranProg) {
        setLastReading({
          surahNumber: quranProg.lastSurahNumber,
          ayahNumber: quranProg.lastAyahNumber,
          surahNameAr: '',
          timestamp: new Date(quranProg.lastReadAt).getTime(),
        });
      }
      if (tasbeehData) {
        setTasbihTotal(tasbeehData.totalCount);
      }
    } catch (e) {
      console.warn('loadUserData error:', e);
    }
  };

  // Check HttpOnly server session on mount
  useEffect(() => {
    let mounted = true;

    async function checkCurrentSession() {
      try {
        const res = await fetch('/api/auth/me', {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user && mounted) {
            setUser(data.user);
            localStore.set('current_user', data.user);
            await loadUserData(data.user.id, data.user);
            if (mounted) setIsLoadingAuth(false);
            return;
          }
        }
      } catch (e) {
        console.warn('Server session check error:', e);
      }

      if (mounted) {
        // Clear local user cache if session is not valid on server
        const cached = localStore.get<UserProfile | null>('current_user', null);
        if (cached) {
          // If offline and server not reachable, keep cached user
          setUser(cached);
        } else {
          setUser(null);
        }
        setIsLoadingAuth(false);
      }
    }

    checkCurrentSession();

    return () => {
      mounted = false;
    };
  }, []);

  // Save changes to local storage as fallback
  useEffect(() => {
    if (user) localStore.set('current_user', user);
  }, [user]);

  useEffect(() => {
    localStore.set('bookmarks', bookmarks);
  }, [bookmarks]);

  useEffect(() => {
    localStore.set('favorites', favorites);
  }, [favorites]);

  useEffect(() => {
    localStore.set('last_reading', lastReading);
  }, [lastReading]);

  useEffect(() => {
    localStore.set('tasbih_total', tasbihTotal);
  }, [tasbihTotal]);

  useEffect(() => {
    localStore.set('notification_settings', notificationSettings);
  }, [notificationSettings]);

  // Sign In with username & password via secure server endpoint
  const signIn = async (username: string, password: string): Promise<{ error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return { error: data.error || 'اسم المستخدم أو كلمة المرور غير صحيحة.' };
      }

      if (data.user) {
        setUser(data.user);
        localStore.set('current_user', data.user);
        await loadUserData(data.user.id, data.user);
      }

      return {};
    } catch (err: any) {
      return { error: err?.message || 'تعذر الاتصال بالخادم، يرجى المحاولة لاحقاً.' };
    }
  };

  // Sign Up with clientName, username, password, confirmPassword via secure server endpoint
  const signUp = async (
    clientName: string,
    username: string,
    password: string,
    confirmPassword?: string
  ): Promise<{ error?: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          clientName,
          username,
          password,
          confirmPassword: confirmPassword || password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return { error: data.error || 'حدث خطأ أثناء إنشاء الحساب.' };
      }

      if (data.user) {
        setUser(data.user);
        localStore.set('current_user', data.user);
        await loadUserData(data.user.id, data.user);
      }

      return {};
    } catch (err: any) {
      return { error: err?.message || 'تعذر الاتصال بالخادم، يرجى المحاولة لاحقاً.' };
    }
  };

  // Sign out: destroys server session, clears cookie & resets local store
  const signOut = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      console.warn('signOut error:', e);
    }
    setUser(null);
    localStore.remove('current_user');
  };

  // Backward compatibility alias
  const login = async (username: string, fullName = '', role: 'super_admin' | 'user' = 'user') => {
    if (user && user.username === username) {
      setUser({ ...user, role });
      return;
    }
  };

  const logout = () => {
    signOut();
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await loadUserData(user.id, user);
    }
  };

  // Bookmarks
  const addBookmark = async (surahNumber: number, surahNameAr: string, ayahNumber: number, note?: string) => {
    const newBookmark: QuranBookmark = {
      id: `bm_${Date.now()}`,
      surahNumber,
      surahNameAr,
      ayahNumber,
      note,
      timestamp: Date.now(),
    };
    setBookmarks((prev) => [newBookmark, ...prev]);

    if (user?.id) {
      await dashboardService.addBookmark(user.id, surahNumber, surahNameAr, ayahNumber, note);
    }
  };

  const removeBookmark = async (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
    if (user?.id) {
      await dashboardService.removeBookmark(user.id, id);
    }
  };

  // Favorites
  const toggleFavorite = async (item: Omit<UserFavorite, 'id' | 'timestamp'>): Promise<boolean> => {
    const exists = favorites.some((f) => f.type === item.type && f.referenceId === item.referenceId);
    if (exists) {
      setFavorites((prev) => prev.filter((f) => !(f.type === item.type && f.referenceId === item.referenceId)));
      if (user?.id) {
        await dashboardService.removeFavorite(user.id, item.type, item.referenceId);
      }
      return false;
    } else {
      const newFav: UserFavorite = {
        ...item,
        id: `fav_${Date.now()}`,
        timestamp: Date.now(),
      };
      setFavorites((prev) => [newFav, ...prev]);
      if (user?.id) {
        await dashboardService.addFavorite(user.id, item);
      }
      return true;
    }
  };

  const isFavorite = (type: string, referenceId: string): boolean => {
    return favorites.some((f) => f.type === type && f.referenceId === referenceId);
  };

  // Quran Reading Progress
  const updateLastReading = async (surahNumber: number, ayahNumber: number, surahNameAr: string) => {
    setLastReading({
      surahNumber,
      ayahNumber,
      surahNameAr,
      timestamp: Date.now(),
    });

    if (user) {
      setUser((prev) => (prev ? { ...prev, totalAyahsRead: prev.totalAyahsRead + 1 } : null));
      await dashboardService.updateQuranProgress(user.id, surahNumber, ayahNumber, 1, surahNameAr);
    }
  };

  const incrementTasbihTotal = (count = 1) => {
    setTasbihTotal((prev) => prev + count);
    if (user?.id) {
      dashboardService.recordTasbeehSession(user.id, 'سبحان الله وبحمده', count);
    }
  };

  const updateNotificationSettings = (settings: Partial<NotificationSettings>) => {
    setNotificationSettings((prev) => ({ ...prev, ...settings }));
  };

  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoadingAuth,
        isAdmin,
        bookmarks,
        favorites,
        lastReading,
        tasbihTotal,
        notificationSettings,
        signIn,
        signUp,
        signOut,
        login,
        logout,
        refreshProfile,
        addBookmark,
        removeBookmark,
        toggleFavorite,
        isFavorite,
        updateLastReading,
        incrementTasbihTotal,
        updateNotificationSettings,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
}
