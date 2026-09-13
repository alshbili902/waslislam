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

          {/* Quick Links */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>أقسام المنصة</span>
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('quran')} className="hover:text-emerald-700 dark:hover:text-amber-300 transition-colors">
                  المصحف الشريف والتلاوات
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('azkar')} className="hover:text-emerald-700 dark:hover:text-amber-300 transition-colors">
                  أذكار الصباح والمساء وحصن المسلم
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('hadith')} className="hover:text-emerald-700 dark:hover:text-amber-300 transition-colors">
                  صحيح السنة النبوية الشريفة
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('prayer')} className="hover:text-emerald-700 dark:hover:text-amber-300 transition-colors">
                  مواقيت الصلاة وبوصلة القبلة
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tasbih')} className="hover:text-emerald-700 dark:hover:text-amber-300 transition-colors">
                  المسبحة الإلكترونية الذكية
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('donations')} className="hover:text-emerald-700 dark:hover:text-amber-300 transition-colors">
                  الصدقة والتبرع (المنصات الرسمية)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('binbaz')} className="hover:text-emerald-700 dark:hover:text-amber-300 transition-colors">
                  موقع الشيخ الإمام ابن باز رحمه الله
                </button>
              </li>
            </ul>
          </div>

          {/* Verifications & Sources */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>المصادر المعتمدة</span>
            </h4>
            <ul className="space-y-1.5 text-slate-500 dark:text-slate-400">
              <li>• مجمع الملك فهد لطباعة المصحف الشريف</li>
              <li>• صحيح الإمام البخاري وصحيح الإمام مسلم</li>
              <li>• التفسير الميسر المعتمد</li>
              <li>• مواقيت أم القرى والهيئات الرسمية</li>
              <li>• فتاوى كبار العلماء والمجامع الفقهية</li>
            </ul>
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
