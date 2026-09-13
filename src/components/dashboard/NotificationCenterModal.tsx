import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Trash2,
  Clock,
  Sparkles,
  Heart,
  Compass,
  AlertCircle
} from 'lucide-react';
import { NotificationItem } from '../../types';
import { useModalScrollLock } from '../../hooks/useModalScrollLock';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useModalScrollLock(isOpen, {
    onClose,
    closeOnEsc: true,
  });

  if (!isOpen) return null;

  const filtered = notifications.filter((n) => (filter === 'unread' ? !n.read : true));
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'prayer':
        return <Compass className="w-4 h-4 text-emerald-600" />;
      case 'azkar':
        return <Heart className="w-4 h-4 text-amber-500" />;
      case 'daily_ayah':
        return <Sparkles className="w-4 h-4 text-teal-500" />;
      default:
        return <Bell className="w-4 h-4 text-indigo-500" />;
    }
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    try {
      const d = new Date(timeStr);
      return d.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm wasl-modal-overlay animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onTouchMove={(e) => {
        if (e.target === e.currentTarget) e.preventDefault();
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white dark:bg-emerald-950 rounded-3xl shadow-2xl border border-emerald-900/10 dark:border-emerald-800/60 overflow-hidden flex flex-col max-h-[min(85dvh,calc(100dvh-3rem))] wasl-modal-overlay"
      >
        {/* Modal Header (Sticky Top) */}
        <div className="sticky top-0 z-20 shrink-0 p-5 sm:p-6 border-b border-slate-100 dark:border-emerald-900/60 bg-white/95 dark:bg-emerald-950/95 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-800 dark:text-emerald-200">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white font-amiri">
                مَرْكَزُ التَّنْبِيهَاتِ وَالإِشْعَارَات
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                لديك {unreadCount} تنبيهات غير مقروءة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 dark:text-amber-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 flex items-center gap-1 cursor-pointer transition-colors"
                title="تحديد الكل كمقروء"
              >
                <CheckCheck className="w-4 h-4" />
                <span className="hidden sm:inline">تحديد الكل</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-slate-100 dark:border-emerald-900/40 text-xs font-semibold bg-slate-50/50 dark:bg-emerald-900/20">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filter === 'all'
                ? 'bg-white dark:bg-emerald-800 text-emerald-900 dark:text-white font-bold shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            جميع التنبيهات ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filter === 'unread'
                ? 'bg-white dark:bg-emerald-800 text-emerald-900 dark:text-white font-bold shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            غير المقروءة ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto wasl-modal-scrollable p-4 sm:p-5 space-y-2.5 divide-y divide-slate-100 dark:divide-emerald-900/40">
          {filtered.length > 0 ? (
            filtered.map((n) => (
              <div
                key={n.id}
                className={`p-3.5 rounded-2xl transition-all flex items-start justify-between gap-3 ${
                  !n.read
                    ? 'bg-emerald-50/70 dark:bg-emerald-900/30 border border-emerald-500/30'
                    : 'bg-white dark:bg-emerald-950/40 hover:bg-slate-50 dark:hover:bg-emerald-900/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-white dark:bg-emerald-900/80 shadow-xs shrink-0 mt-0.5">
                    {getNotificationIcon(n.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {n.titleAr}
                      </h4>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {n.messageAr}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1.5 inline-block">
                      {formatTime(n.time)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {!n.read && (
                    <button
                      onClick={() => onMarkAsRead(n.id)}
                      className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                      title="تحديد كمقروء"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteNotification(n.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    title="حذف الإشعار"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-slate-300 dark:text-emerald-900/60 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-600 dark:text-slate-300">
                لا توجد تنبيهات حالياً
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                ستصلك هنا تذكيرات مواقيت الصلاة والأوراد اليومية
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
