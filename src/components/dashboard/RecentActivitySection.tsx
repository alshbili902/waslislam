import React from 'react';
import {
  Clock,
  BookOpen,
  Sparkles,
  Heart,
  Radio,
  Layers,
  Search,
  Activity
} from 'lucide-react';
import { UserActivityItem } from '../../types';

interface RecentActivitySectionProps {
  activities: UserActivityItem[];
}

export const RecentActivitySection: React.FC<RecentActivitySectionProps> = ({ activities }) => {
  const getActivityIcon = (type: UserActivityItem['activityType']) => {
    switch (type) {
      case 'quran_read':
        return <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      case 'hadith_view':
        return <Sparkles className="w-3.5 h-3.5 text-amber-500" />;
      case 'dua_view':
      case 'favorite_add':
        return <Heart className="w-3.5 h-3.5 text-rose-500" />;
      case 'radio_play':
        return <Radio className="w-3.5 h-3.5 text-teal-500" />;
      case 'tasbeeh_done':
      case 'dhikr_done':
        return <Layers className="w-3.5 h-3.5 text-cyan-500" />;
      case 'search':
        return <Search className="w-3.5 h-3.5 text-indigo-500" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return 'الآن';
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return 'الآن';
      if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `منذ ${diffHours} ساعة`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'أمس';
      return `منذ ${diffDays} أيام`;
    } catch {
      return 'مؤخراً';
    }
  };

  return (
    <div className="bg-white dark:bg-emerald-950/80 rounded-3xl p-5 sm:p-7 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm relative overflow-hidden backdrop-blur-md">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-amiri flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600 dark:text-amber-400" />
            <span>نَشَاطُكَ الأَخِير</span>
          </h3>
          <p className="text-[11px] text-slate-400">سجل تسلسل أعمالك وعباداتك على المنصة</p>
        </div>
      </div>

      {activities.length > 0 ? (
        <div className="relative border-r border-slate-200 dark:border-emerald-900/60 pr-4 mr-2 space-y-4">
          {activities.map((act) => (
            <div key={act.id} className="relative group">
              {/* Bullet node on timeline */}
              <div className="absolute -right-[23px] top-1.5 w-3 h-3 rounded-full bg-emerald-600 border-2 border-white dark:border-emerald-950 shadow-xs group-hover:scale-125 transition-transform" />

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-emerald-900/40 shrink-0 mt-0.5">
                    {getActivityIcon(act.activityType)}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {act.titleAr}
                    </h4>
                    {act.detailsAr && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {act.detailsAr}
                      </p>
                    )}
                  </div>
                </div>

                <span className="text-[10px] text-slate-400 shrink-0 font-medium whitespace-nowrap">
                  {formatRelativeTime(act.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Clock className="w-10 h-10 text-slate-300 dark:text-emerald-900/50 mx-auto mb-2" />
          <h4 className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">
            لا توجد نشاطات حتى الآن
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            ابدأ تلاوة القرآن أو قراءة الأذكار أو الاستماع لإذاعات القرآن لتظهر تفاصيل نشاطك الإيماني هنا تلقائياً
          </p>
        </div>
      )}
    </div>
  );
};
