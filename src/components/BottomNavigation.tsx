import React from 'react';
import { motion } from 'motion/react';
import { Home, BookOpen, Heart, Compass, Radio } from 'lucide-react';

interface Props {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const BottomNavigation: React.FC<Props> = ({ currentTab, onSelectTab }) => {
  const tabs = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'quran-radio', label: 'الإذاعة', icon: Radio },
    { id: 'quran', label: 'المصحف', icon: BookOpen },
    { id: 'azkar', label: 'الأذكار', icon: Heart },
    { id: 'prayer', label: 'المواقيت', icon: Compass }
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-emerald-950/95 border-t border-emerald-900/10 dark:border-emerald-500/20 backdrop-blur-md px-2 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] shadow-lg transition-colors">
      <div className="grid grid-cols-5 gap-1 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.92 }}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 rounded-xl transition-colors ${
                isActive
                  ? 'text-emerald-800 dark:text-amber-300 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-emerald-600'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeBottomTab"
                  className="absolute inset-x-2 inset-y-1 bg-emerald-100/90 dark:bg-emerald-800/60 rounded-xl -z-0"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <div className="relative z-10 p-1">
                <Icon className="w-5 h-5" />
              </div>
              <span className="relative z-10 text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
