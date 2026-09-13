import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  BookOpen,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  Volume2,
  FileText,
  Radio,
  Share2,
  Copy,
  Check,
  Award,
  Lock,
  ChevronLeft
} from 'lucide-react';
import { BinBazLinkItem } from '../types/binbaz';
import { binbazService } from '../services/binbazService';
import { useShareModal } from '../context/ShareContext';

export const BinBazView: React.FC = () => {
  const [links, setLinks] = useState<BinBazLinkItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { openShareModal } = useShareModal();

  useEffect(() => {
    document.title = 'ابن باز | وصل الإسلامية';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'الوصول إلى الموقع الرسمي لسماحة الشيخ الإمام عبدالعزيز بن باز رحمه الله - إشراف مؤسسة عبدالعزيز بن باز الخيرية.'
      );
    }

    async function loadLinks() {
      setIsLoading(true);
      try {
        const data = await binbazService.getLinks();
        setLinks(data);
      } catch (e) {
        console.warn('Failed to load Ibn Baz links:', e);
      } finally {
        setIsLoading(false);
      }
    }

    loadLinks();
  }, []);

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fatwas':
        return ShieldCheck;
      case 'nur':
        return Radio;
      case 'books':
        return BookOpen;
      case 'audios':
        return Volume2;
      case 'articles':
        return FileText;
      default:
        return Sparkles;
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-950 to-emerald-900 text-white p-6 sm:p-10 shadow-xl border border-emerald-800/40">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4 text-right">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-300">
            <Award className="w-4 h-4 text-amber-400" />
            <span>بوابة تراث كبار العلماء</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            موقع الشيخ ابن باز رحمه الله
          </h1>

          <p className="text-xs sm:text-base text-emerald-100/90 leading-relaxed font-normal">
            الوصول المباشر إلى الموقع الرسمي لتراث وفتاوى وعلوم سماحة الشيخ الإمام عبدالعزيز بن عبدالله بن باز رحمه الله، الخاضع للإشراف المباشر من مؤسسة عبدالعزيز بن باز الخيرية.
          </p>

          {/* Official Source Seal & Direct Link Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <a
              href="https://binbaz.org.sa/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              <span>زيارة الموقع الرسمي الرئيسي</span>
              <ExternalLink className="w-4 h-4 ml-0.5" />
            </a>

            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-xs text-emerald-200">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono" dir="ltr">binbaz.org.sa</span>
              <span className="text-emerald-400 font-bold">• رسمي وموثق</span>
            </div>
          </div>
        </div>
      </section>

      {/* Official Source Stamp Card */}
      <div className="rounded-2xl p-5 bg-white dark:bg-emerald-950/70 border border-emerald-900/10 dark:border-emerald-800/50 shadow-xs text-right flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
              اعتماد وموثوقية المصدر:
            </span>
            <strong className="text-sm sm:text-base font-bold text-slate-900 dark:text-white block mt-0.5">
              الموقع الرسمي لسماحة الشيخ الإمام ابن باز رحمه الله — إشراف مؤسسة عبدالعزيز بن باز الخيرية
            </strong>
          </div>
        </div>

        <a
          href="https://binbaz.org.sa/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/70 text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
        >
          <span>زيارة المصدر الرسمي</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Sections Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between text-right">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>أقسام وفهارس الموقع الرسمي للشيخ</span>
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            روابط مباشرة ومؤمنة بالنطاق الرسمي
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {links.map((link) => {
              const Icon = getCategoryIcon(link.category);
              return (
                <motion.article
                  key={link.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white dark:bg-emerald-950/80 rounded-3xl p-6 border transition-all text-right flex flex-col justify-between relative group ${
                    link.highlight
                      ? 'border-amber-500/40 shadow-md shadow-amber-500/5'
                      : 'border-slate-200/80 dark:border-emerald-800/40 hover:border-emerald-600/40 shadow-xs'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-emerald-900/50 text-slate-600 dark:text-slate-300">
                          {link.categoryLabelAr}
                        </span>
                        <button
                          onClick={() => handleCopyUrl(link.id, link.url)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors"
                          title="نسخ الرابط"
                        >
                          {copiedId === link.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() =>
                            openShareModal({
                              type: 'article',
                              sectionName: 'ابن باز',
                              contentType: 'قسم رسمي',
                              title: link.title,
                              text: `${link.title}\n${link.description}\nالمصدر الرسمي: ${link.url}`,
                              source: 'الموقع الرسمي لسماحة الشيخ الإمام ابن باز رحمه الله',
                            })
                          }
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors"
                          title="مشاركة"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-emerald-800 dark:group-hover:text-amber-300 transition-colors">
                      {link.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                      {link.description}
                    </p>
                  </div>

                  <div className="pt-5 mt-5 border-t border-slate-100 dark:border-emerald-900/50 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400 font-mono" dir="ltr">
                      binbaz.org.sa
                    </span>

                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold transition-all active:scale-95"
                    >
                      <span>تصفح القسم</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </section>

      {/* Safety and Intellectual Property Assurance Notice */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-emerald-950/40 border border-slate-200 dark:border-emerald-900/40 text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-right space-y-1">
        <strong className="block font-bold text-slate-800 dark:text-slate-200">
          ضمان النزاهة العلمية وحفظ الحقوق:
        </strong>
        <p>
          حرصاً على الأمانة العلمية ودقة النقل، لا تقوم منصة "وصل الإسلامية" بإعادة نشر الفتاوى أو التسجيلات تلقائياً عبر وسائط غير معتمدة، بل تربط المستخدم مباشرة بالمصدر الأصلي الوحيد لسماحة الشيخ الإمام ابن باز رحمه الله الخاضع لمؤسسة عبدالعزيز بن باز الخيرية.
        </p>
      </div>
    </div>
  );
};
