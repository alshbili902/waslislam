import React, { createContext, useContext, useState, useEffect } from 'react';
import { ShareItemData, ShareSystemConfig, DEFAULT_SHARE_CONFIG } from '../types/share';

interface ShareContextType {
  isShareModalOpen: boolean;
  currentItem: ShareItemData | null;
  shareConfig: ShareSystemConfig;
  openShareModal: (item: ShareItemData) => void;
  closeShareModal: () => void;
  updateShareConfig: (config: Partial<ShareSystemConfig>) => void;
}

const ShareContext = createContext<ShareContextType | undefined>(undefined);

const STORAGE_KEY = 'wasl_share_system_config';

export const ShareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<ShareItemData | null>(null);
  const [shareConfig, setShareConfig] = useState<ShareSystemConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SHARE_CONFIG, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_SHARE_CONFIG;
  });

  const openShareModal = (item: ShareItemData) => {
    // Check if sharing is enabled
    if (!shareConfig.enabled) {
      console.warn('Share system is currently disabled by administrator.');
      return;
    }
    setCurrentItem(item);
    setIsShareModalOpen(true);
  };

  const closeShareModal = () => {
    setIsShareModalOpen(false);
    setCurrentItem(null);
  };

  const updateShareConfig = (updated: Partial<ShareSystemConfig>) => {
    setShareConfig((prev) => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  return (
    <ShareContext.Provider
      value={{
        isShareModalOpen,
        currentItem,
        shareConfig,
        openShareModal,
        closeShareModal,
        updateShareConfig
      }}
    >
      {children}
    </ShareContext.Provider>
  );
};

export function useShareModal(): ShareContextType {
  const context = useContext(ShareContext);
  if (!context) {
    throw new Error('useShareModal must be used within a ShareProvider');
  }
  return context;
}
