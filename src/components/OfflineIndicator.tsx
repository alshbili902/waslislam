import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-6 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600/90 backdrop-blur-md px-3.5 py-2 text-xs font-medium text-white shadow-lg border border-amber-400/30 animate-pulse">
      <WifiOff className="w-4 h-4" />
      <span>أنت تعمل الآن في وضع عدم الاتصال (بدون إنترنت)</span>
    </div>
  );
};
