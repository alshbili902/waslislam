import React from 'react';
import { motion } from 'motion/react';
import {
  User,
  AtSign,
  MapPin,
  Calendar,
  Flame,
  BookOpen,
  Heart,
  Edit3,
  Settings,
  ShieldCheck
} from 'lucide-react';
import { UserProfile, UserStreak } from '../../types';

interface ProfileCardProps {
  user: UserProfile | null;
  streak: UserStreak;
  totalVersesRead: number;
  totalFavoritesCount: number;
  onEditProfile: () => void;
  onOpenSettings: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  user,
  streak,
  totalVersesRead,
  totalFavoritesCount,
  onEditProfile,
  onOpenSettings,
}) => {
  const formatJoinDate = (dateStr?: string) => {
    if (!dateStr) return 'منذ فترة قريبة';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' });
    } catch {
      return '2026';
    }
  };

  return (
    <div className="bg-white dark:bg-emerald-950/80 rounded-3xl p-5 sm:p-6 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm relative overflow-hidden backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-emerald-900/50">
        <div className="flex items-center gap-3.5">
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-0.5 shadow-md shrink-0">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName || 'الصورة الشخصية'}
                className="w-full h-full rounded-[14px] object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-[14px] bg-emerald-900 flex items-center justify-center text-amber-300 font-bold text-2xl font-amiri" title={user?.fullName ? user.fullName : 'لم تتم إضافة صورة شخصية'}>
                {user?.fullName ? user.fullName[0] : <User className="w-6 h-6 text-emerald-300/70" />}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-amiri">
                {user?.fullName || 'لم تتم إضافة الاسم بعد'}
              </h2>
              {streak.currentStreak > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                  {streak.currentStreak >= 7 ? 'مواظب متميز' : 'مواظب نشط'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5" dir="ltr">
              <AtSign className="w-3.5 h-3.5 text-emerald-600 dark:text-amber-300" />
              <span className="font-mono font-medium">{user?.username ? `@${user.username}` : '@user'}</span>
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-600" />
              <span>
                {user?.city && user?.country
                  ? `${user.city}، ${user.country}`
                  : user?.city || user?.country || 'لم يتم تحديد الموقع بعد'}
              </span>
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={onEditProfile}
            className="px-3 py-1.5 rounded-xl border border-emerald-600/30 bg-emerald-50 dark:bg-emerald-900/40 hover:bg-emerald-100 text-xs font-semibold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>تعديل الملف</span>
          </button>
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-emerald-800/60 hover:bg-slate-50 dark:hover:bg-emerald-900/40 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="الإعدادات"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3 Quick User Metrics */}
      <div className="grid grid-cols-3 gap-2.5 pt-4">
        {/* Streak */}
        <div className="bg-slate-50 dark:bg-emerald-900/30 rounded-2xl p-3 text-center border border-slate-100 dark:border-emerald-800/40">
          <div className="w-7 h-7 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center mb-1.5">
            <Flame className="w-4 h-4 fill-current" />
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-white">
            {streak.currentStreak} <span className="text-[10px] font-normal text-slate-500">يوم</span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">سلسلة الاستمرار</div>
        </div>

        {/* Quran Verses */}
        <div className="bg-slate-50 dark:bg-emerald-900/30 rounded-2xl p-3 text-center border border-slate-100 dark:border-emerald-800/40">
          <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-1.5">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-white">
            {totalVersesRead} <span className="text-[10px] font-normal text-slate-500">آية</span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">تلاوات مسجلة</div>
        </div>

        {/* Favorites */}
        <div className="bg-slate-50 dark:bg-emerald-900/30 rounded-2xl p-3 text-center border border-slate-100 dark:border-emerald-800/40">
          <div className="w-7 h-7 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center mb-1.5">
            <Heart className="w-4 h-4" />
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-white">
            {totalFavoritesCount} <span className="text-[10px] font-normal text-slate-500">عنصر</span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">المحفوظات</div>
        </div>
      </div>
    </div>
  );
};
