import React from 'react';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse pb-16">
      {/* Header Skeleton */}
      <div className="bg-white/60 dark:bg-emerald-950/40 rounded-3xl p-6 h-28 border border-slate-200/60 dark:border-emerald-800/30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-emerald-900/50" />
          <div className="space-y-2">
            <div className="w-44 h-5 bg-slate-200 dark:bg-emerald-900/50 rounded-lg" />
            <div className="w-32 h-3.5 bg-slate-200 dark:bg-emerald-900/50 rounded-lg" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-emerald-900/50" />
          <div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-emerald-900/50" />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left / Main 2 Cols */}
        <div className="lg:col-span-2 space-y-6">
          <div className="h-48 bg-white/60 dark:bg-emerald-950/40 rounded-3xl border border-slate-200/60 dark:border-emerald-800/30" />
          <div className="h-64 bg-white/60 dark:bg-emerald-950/40 rounded-3xl border border-slate-200/60 dark:border-emerald-800/30" />
          <div className="h-56 bg-white/60 dark:bg-emerald-950/40 rounded-3xl border border-slate-200/60 dark:border-emerald-800/30" />
        </div>

        {/* Right 1 Col */}
        <div className="space-y-6">
          <div className="h-44 bg-white/60 dark:bg-emerald-950/40 rounded-3xl border border-slate-200/60 dark:border-emerald-800/30" />
          <div className="h-40 bg-white/60 dark:bg-emerald-950/40 rounded-3xl border border-slate-200/60 dark:border-emerald-800/30" />
          <div className="h-40 bg-white/60 dark:bg-emerald-950/40 rounded-3xl border border-slate-200/60 dark:border-emerald-800/30" />
        </div>
      </div>
    </div>
  );
};
