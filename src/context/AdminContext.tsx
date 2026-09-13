import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface AdminContextType {
  isAdminAuthenticated: boolean;
  isLoadingAdminAuth: boolean;
  adminUsername: string | null;
  authError: string | null;
  checkAdminAuth: () => Promise<boolean>;
  loginAdmin: (username: string, password: string) => Promise<{ success: boolean; error?: string; locked?: boolean; remainingSeconds?: number }>;
  logoutAdmin: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [isLoadingAdminAuth, setIsLoadingAdminAuth] = useState<boolean>(true);
  const [adminUsername, setAdminUsername] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const checkAdminAuth = useCallback(async (): Promise<boolean> => {
    setIsLoadingAdminAuth(true);
    try {
      const res = await fetch('/api/admin/me', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        credentials: 'include', // sends HttpOnly session cookie
      });

      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setIsAdminAuthenticated(true);
          setAdminUsername(data.username || 'alshbili');
          setAuthError(null);
          return true;
        }
      }
      setIsAdminAuthenticated(false);
      setAdminUsername(null);
      return false;
    } catch {
      setIsAdminAuthenticated(false);
      setAdminUsername(null);
      return false;
    } finally {
      setIsLoadingAdminAuth(false);
    }
  }, []);

  useEffect(() => {
    checkAdminAuth();
  }, [checkAdminAuth]);

  const loginAdmin = async (username: string, password: string) => {
    setAuthError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        setIsAdminAuthenticated(true);
        setAdminUsername(data.username || username);
        setAuthError(null);
        return { success: true };
      }

      const errorMsg = data.error || 'بيانات الدخول غير صحيحة';
      setAuthError(errorMsg);
      setIsAdminAuthenticated(false);
      return {
        success: false,
        error: errorMsg,
        locked: !!data.locked,
        remainingSeconds: data.remainingSeconds,
      };
    } catch {
      const errorMsg = 'تعذر الاتصال بالخادم، يرجى المحاولة لاحقاً';
      setAuthError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const logoutAdmin = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      console.warn('Logout error:', e);
    } finally {
      setIsAdminAuthenticated(false);
      setAdminUsername(null);
      setAuthError(null);
    }
  };

  return (
    <AdminContext.Provider
      value={{
        isAdminAuthenticated,
        isLoadingAdminAuth,
        adminUsername,
        authError,
        checkAdminAuth,
        loginAdmin,
        logoutAdmin,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export function useAdmin(): AdminContextType {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
