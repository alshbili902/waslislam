'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Clock, 
  Compass, 
  Bookmark, 
  Volume2, 
  Radio, 
  Search, 
  PenTool, 
  Smile, 
  Layers, 
  CheckCircle2, 
  Smartphone,
  ChevronLeft,
  X,
  SlidersHorizontal,
  Star
} from 'lucide-react';
import { IconKidsLearning, IconDuaHands } from '../icons/IslamicIcons';
import { NavTab } from '../Navbar';
import { localStore } from '../../lib/supabase';

interface QuickAccessWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: NavTab) => void;
  isEnglish: boolean;
  onOpenQuranPage?: (page: number) => void;
}

export const QuickAccessWidgetModal: React.FC<QuickAccessWidgetModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  isEnglish,
  onOpenQuranPage
}) => {
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => {
    return localStore.get<string[]>('wasl_quick_pinned', ['quran', 'planner', 'worship', 'kids']);
  });

  if (!isOpen) return null;

  const lastReadPage = localStore.get<number>('khatmah_page', 1);

  const allShortcuts = [
    {
      id: 'quran',
      title: 'متابعة قراءة المصحف',
      subtitle: `صفحة ${lastReadPage} من المصحف الشريف`,
      icon: <BookOpen className="w-5 h-5 text-emerald-500" />,
      color: 'bg-emerald-500/10 border-emerald-500/30',
      action: () => {
        onSelectTab('quran');
        onClose();
      }
    },
    {
      id: 'planner',
      title: 'مخطط الورد القرآني',
      subtitle: 'جدول الورد اليومي التكيفي وحساب الجلسات',
      icon: <Sparkles className="w-5 h-5 text-amber-500" />,
      color: 'bg-amber-500/10 border-amber-500/30',
      action: () => {
        onSelectTab('khatmah');
        onClose();
      }
    },
    {
      id: 'worship',
      title: 'أذكار الصباح والمساء',
      subtitle: 'حصن المسلم والأذكار المأثورة',
      icon: <IconDuaHands className="w-5 h-5 text-blue-500" />,
      color: 'bg-blue-500/10 border-blue-500/30',
      action: () => {
        onSelectTab('worship');
        onClose();
      }
    },
    {
      id: 'kids',
      title: 'عالم وصل للصغار',
      subtitle: 'قصص الأنبياء، تعلم الوضوء والصلاة، ومسابقات',
      icon: <IconKidsLearning className="w-5 h-5 text-purple-500" />,
      color: 'bg-purple-500/10 border-purple-500/30',
      action: () => {
        onSelectTab('kids' as any);
        onClose();
      }
    },
    {
      id: 'search-sources',
      title: 'اسأل المصادر الإسلامية',
      subtitle: 'بحث إسنادي موثق في القرآن والسنة والفتاوى',
      icon: <Search className="w-5 h-5 text-teal-500" />,
      color: 'bg-teal-500/10 border-teal-500/30',
      action: () => {
        onSelectTab('search-sources' as any);
        onClose();
      }
    },
    {
      id: 'library',
      title: 'مكتبتي والمحفوظات',
      subtitle: 'مراجعة الآيات والأحاديث والبطاقات المحفوظة',
      icon: <Bookmark className="w-5 h-5 text-indigo-500" />,
      color: 'bg-indigo-500/10 border-indigo-500/30',
      action: () => {
        onSelectTab('library');
        onClose();
      }
    },
    {
      id: 'zakat',
      title: 'حاسبة الزكاة الذكية',
      subtitle: 'حساب زكاة المال والذهب والفضة والأسهم بدقة',
      icon: <SlidersHorizontal className="w-5 h-5 text-amber-600" />,
      color: 'bg-amber-600/10 border-amber-600/30',
      action: () => {
        onSelectTab('zakat');
        onClose();
      }
    },
    {
      id: 'studio',
      title: 'استوديو بطاقات الإهداء',
      subtitle: 'تصميم ومشاركة بطاقات إسلامية فاخرة',
      icon: <PenTool className="w-5 h-5 text-rose-500" />,
      color: 'bg-rose-500/10 border-rose-500/30',
      action: () => {
        onSelectTab('studio');
        onClose();
      }
    }
  ];

  const togglePin = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    let updated: string[];
    if (pinnedIds.includes(id)) {
      updated = pinnedIds.filter(p => p !== id);
    } else {
      updated = [...pinnedIds, id];
    }
    setPinnedIds(updated);
    localStore.set('wasl_quick_pinned', updated);
  };

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-label={isEnglish ? 'Wasl Quick Access & Widgets' : 'أدوات وصل المصغرة والوصول السريع'}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-6 animate-scale-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[var(--gold-light)] text-[var(--gold)]">
              <Smartphone className="w-5 h-5 pointer-events-none" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[var(--text-main)] font-cairo">
                {isEnglish ? 'Wasl Quick Access & Widgets' : 'أدوات وصل المصغرة والوصول السريع'}
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                اختصارات فورية للأقسام اليومية مع دعم أدوات الشاشة الرئيسية
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)] transition-colors cursor-pointer touch-manipulation"
            aria-label="Close"
          >
            <X className="w-5 h-5 pointer-events-none" />
          </button>
        </div>

        {/* Shortcuts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {allShortcuts.map((item) => {
            const isPinned = pinnedIds.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={item.action}
                className="group cursor-pointer p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] hover:border-[var(--gold)] hover:shadow-sm transition-all flex items-center justify-between gap-3 text-right"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2.5 rounded-xl border ${item.color} shrink-0`}>
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[var(--text-main)] group-hover:text-[var(--gold)] transition-colors truncate">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => togglePin(e, item.id)}
                  title={isPinned ? 'إلغاء التثبيت في المفضلة' : 'تثبيت في المفضلة'}
                  aria-label={isPinned ? 'إلغاء التثبيت في المفضلة' : 'تثبيت في المفضلة'}
                  className={`p-1.5 rounded-lg text-xs transition-colors shrink-0 ${
                    isPinned ? 'text-[var(--gold)]' : 'text-[var(--text-muted)] opacity-40 hover:opacity-100'
                  }`}
                >
                  <Star className={`w-4 h-4 ${isPinned ? 'fill-current' : ''}`} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Home Screen & PWA Web Installation Tip */}
        <div className="p-4 rounded-2xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-xs text-[var(--text-main)] space-y-2">
          <div className="font-bold flex items-center gap-2 text-[var(--primary)]">
            <Smartphone className="w-4 h-4" />
            <span>تثبيت منصة وصل على شاشتك الرئيسية (PWA Web App):</span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
            • على متصفحات الهواتف الذكية والأجهزة اللوحية والحاسوب: اضغط على زر المشاركة أو خيارات المتصفح (⋮) واختر "إضافة إلى الشاشة الرئيسية" أو "تثبيت التطبيق" (Install App) للوصول الفوري والعمل المباشر بدون إنترنت وبسرعة فائقة.
          </p>
        </div>
      </div>
    </div>
  );
};
