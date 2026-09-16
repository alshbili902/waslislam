import React from 'react';
import { BookOpen, Heart, Compass, Sparkles, ShieldCheck, Download } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { BrandLogo } from './brand/BrandLogo';

interface Props {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<Props> = ({ onNavigate }) => {
  return (
    <footer className="mt-16 border-t border-emerald-900/10 dark:border-emerald-500/20 bg-white/70 dark:bg-emerald-950/70 backdrop-blur-md pt-12 pb-24 lg:pb-12 text-slate-700 dark:text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-200 dark:border-emerald-900/60 text-right">
          {/* Brand & Vision */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <BrandLogo
                variant="full"
                size="lg"
                clickable
                onClick={() => onNavigate('home')}
                className="mb-1"
              />
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg">
              منصة إسلامية رقمية شاملة وموثوقة، صممت بأعلى معايير الحداثة والوقار الإسلامي لتقديم القرآن الكريم وتلاواته، الأذكار الصحيحة، الأحاديث النبوية، ومواقيت الصلاة الدقيقة.
            </p>

            <div className="pt-2">
              <PWAInstallButton variant="header" />
            </div>
          </div>

          {/* Column 2: Worship & Rites */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>العبادات والأوراد</span>
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('prayer-times')} className="hover:text-emerald-700 dark:hover:text-amber-300 transition-colors text-right w-full">
                  مواقيت الصلاة الدقيقة والقبلة
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('fasting')} className="hover:text-emerald-700 dark:hover:text-amber-300 transition-colors text-right w-full">
                  سجل صيامي والتطوع
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('quran')} className="hover:text-emerald-700 dark:hover:text-amber-300 transition-colors text-right w-full">
                  المصحف الشريف والتلاوات
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('azkar')} className="hover:text-emerald-700 dark:hover:text-amber-300 transition-colors text-right w-full">
                  حصن المسلم وأذكار اليوم
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tasbih')} className="hover:text-emerald-700 dark:hover:text-amber-300 transition-colors text-right w-full">
                  المسبحة الإلكترونية الذكية
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('hajj-umrah')} className="hover:text-emerald-700 dark:hover:text-amber-300 transition-colors text-right w-full">
                  دليل الحج والعمرة والمواقيت
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Islamic Knowledge */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>العلوم والمعرفة الإسلامية</span>
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('names-of-allah')} className="hover:text-emerald-700 dark:hover:text-amber-300 transition-colors text-right w-full">
                  أسماء الله الحسنى الـ 99
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('seerah')} className="hover:text-emerald-700 dark:hover:text-amber-300 transition-colors text-right w-full">
                  السيرة النبوية الشريفة ﷺ
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('library')} className="hover:text-emerald-700 dark:hover:text-amber-300 transition-colors text-right w-full">
                  المكتبة الإسلامية العامة
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('hadith')} className="hover:text-emerald-700 dark:hover:text-amber-300 transition-colors text-right w-full">
                  صحيح السنة النبوية
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('wisdoms')} className="hover:text-emerald-700 dark:hover:text-amber-300 transition-colors text-right w-full">
                  الحِكَم والمواعظ الإيمانية
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('channels')} className="hover:text-emerald-700 dark:hover:text-amber-300 transition-colors text-right w-full font-bold text-emerald-700 dark:text-emerald-300">
                  القنوات الإسلامية والبث المباشر
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('quran-radio')} className="hover:text-emerald-700 dark:hover:text-amber-300 transition-colors text-right w-full">
                  إذاعة القرآن الكريم
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('discover')} className="hover:text-emerald-700 dark:hover:text-amber-300 transition-colors text-right w-full">
                  اكتشف نفحات اليوم
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('search')} className="hover:text-emerald-700 dark:hover:text-amber-300 transition-colors text-right w-full font-bold text-emerald-600 dark:text-amber-400">
                  البحث الإسلامي الشامل
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Verifications & Official Partners */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>المصادر المعتمدة</span>
            </h4>
            <ul className="space-y-1.5 text-slate-500 dark:text-slate-400">
              <li>• مجمع الملك فهد لطباعة المصحف الشريف</li>
              <li>• صحيح البخاري وصحيح مسلم</li>
              <li>• التفسير الميسر المعتمد</li>
              <li>• تقويم أم القرى وهيئة المساحة</li>
              <li>• كتب الأئمة المتقدمين المحققة</li>
            </ul>
            <div className="pt-3 space-y-1.5 border-t border-slate-200 dark:border-emerald-900/60 mt-3">
              <div>
                <button onClick={() => onNavigate('donations')} className="text-[11px] text-emerald-700 dark:text-amber-300 hover:underline">
                  منصات التبرع الرسمية المعتمدة
                </button>
              </div>
              <div>
                <button onClick={() => onNavigate('binbaz')} className="text-[11px] text-emerald-700 dark:text-amber-300 hover:underline">
                  موقع الشيخ الإمام ابن باز رحمه الله
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 text-center sm:text-right">
          <p>
            جميع الحقوق محفوظة © لمنصة <strong>وَصْل الإسْلامِيَّة</strong> (Wasl Islamic) • {new Date().getFullYear()} م / 1448 هـ
          </p>
          <p className="text-[11px] text-emerald-700 dark:text-amber-300 font-medium">
            ﴿وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ﴾
          </p>
        </div>
      </div>
    </footer>
  );
};
