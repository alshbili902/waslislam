import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  ShieldCheck,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Sparkles,
  Share2,
  Copy,
  Check,
  Filter,
  Lock
} from 'lucide-react';
import { DonationCategory, DonationPlatform } from '../types/donations';
import { donationService } from '../services/donationService';
import { useShareModal } from '../context/ShareContext';

export const DonationsView: React.FC = () => {
  const [platforms, setPlatforms] = useState<DonationPlatform[]>([]);
  const [categories, setCategories] = useState<DonationCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { openShareModal } = useShareModal();

  useEffect(() => {
    document.title = 'الصدقة والتبرع | وصل الإسلامية';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'منصات رسمية وموثوقة للصدقات والتبرعات في المملكة العربية السعودية.');
    }

    setCategories(donationService.getCategories());

    async function loadPlatforms() {
      setIsLoading(true);
      try {
        const data = await donationService.getPlatforms();
        setPlatforms(data);
      } catch (e) {
        console.warn('Failed to load donation platforms:', e);
      } finally {
        setIsLoading(false);
      }
    }

    loadPlatforms();
  }, []);

  // Filter logic
  const filteredPlatforms = platforms.filter((plat) => {
    if (plat.status !== 'verified') return false;

    // Category filter
    if (selectedCategory !== 'all') {
      const catObj = categories.find((c) => c.id === selectedCategory);
      if (catObj && !plat.categories.includes(catObj.nameAr)) {
        return false;
      }
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = plat.name.toLowerCase().includes(q);
      const matchDesc = plat.description.toLowerCase().includes(q);
      const matchEntity = plat.officialEntity.toLowerCase().includes(q) || plat.supervisingEntity.toLowerCase().includes(q);
      const matchFeatures = plat.features.some((f) => f.toLowerCase().includes(q));
      if (!matchName && !matchDesc && !matchEntity && !matchFeatures) {
        return false;
      }
    }

    return true;
  });

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 text-white p-6 sm:p-10 shadow-xl border border-emerald-800/40">
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3 text-right">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-600/40 text-xs font-bold text-emerald-300">
            <Heart className="w-3.5 h-3.5 fill-current text-rose-400" />
            <span>بوابة الخير الوطنية الموثقة</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            الصدقة والتبرع
          </h1>

          <p className="text-xs sm:text-base text-emerald-100/90 leading-relaxed font-normal">
            ساهم في الخير من خلال المنصات الرسمية والموثوقة في المملكة العربية السعودية. نوفر دليلاً مباشراً يصلك بالمنصات الحكومية المرخصة لضمان وصول تبرعك وصدقتك وزكاتك إلى مستحقيها بأمان وشفافية تامة.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-emerald-300/90">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>منصات وطنية مرخصة 100%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>روابط رسمية مشفرة بـ HTTPS</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>أجر دائم بين يديك</span>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Notice Banner */}
      <div className="rounded-2xl p-4 sm:p-5 bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 text-right flex items-start gap-3.5 text-amber-900 dark:text-amber-200">
        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs sm:text-sm leading-relaxed">
          <strong className="font-bold block text-amber-900 dark:text-amber-300">
            تنبيه أمان وشفافية مهم للمتبرعين:
          </strong>
          <p className="text-amber-800 dark:text-amber-300/90">
            منصة <strong>"وصل الإسلامية"</strong> لا تستقبل التبرعات ولا تجمع الأموال إطلاقاً، ولا تطلب أي بيانات بطاقات ائتمانية أو أرقام حسابات بنكية أو رموز تحقق (OTP). دورنا يقتصر حصرياً على دلالة المستخدم وتوجيهه برابط مباشر وآمن إلى الموقع الرسمي للمنصة الوطنية المرخصة.
          </p>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="space-y-4">
        {/* Search Box */}
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن منصة، مجال تبرع، أو خدمة خيرية (مثل: زكاة، أيتام، مساجد، إحسان)..."
            className="w-full pr-11 pl-4 py-3.5 rounded-2xl bg-white dark:bg-emerald-950/70 border border-slate-200 dark:border-emerald-800/60 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-xs transition-all text-right"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white px-2 py-1"
            >
              مسح
            </button>
          )}
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin text-right">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>المجالات:</span>
          </span>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-emerald-800 text-white shadow-sm shadow-emerald-900/30'
                  : 'bg-white dark:bg-emerald-950/60 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/40'
              }`}
            >
              {cat.nameAr}
            </button>
          ))}
        </div>
      </div>

      {/* Platforms Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredPlatforms.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-white dark:bg-emerald-950/50 border border-slate-200 dark:border-emerald-800/40 space-y-3">
          <Heart className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            لم يتم العثور على منصات مطابقة
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            جرّب تغيير كلمات البحث أو اختيار تصنيف آخر لعرض المنصات الرسمية المعتمدة.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
          >
            إعادة تعيين الفلاتر
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPlatforms.map((platform) => (
            <motion.article
              key={platform.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-emerald-950/80 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-emerald-800/50 shadow-sm hover:shadow-md transition-all text-right flex flex-col justify-between relative overflow-hidden"
            >
              {/* Subtle Islamic Top Corner Glow */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-br-full pointer-events-none" />

              <div className="space-y-4">
                {/* Platform Header Bar */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center shrink-0 shadow-xs">
                      <Building2 className="w-6 h-6 text-emerald-700 dark:text-emerald-300" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                          {platform.name}
                        </h2>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>رسمي وموثق</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {platform.officialEntity}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopyUrl(platform.id, platform.url)}
                      className="p-2 rounded-xl text-slate-400 hover:text-emerald-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-emerald-900/40 transition-colors"
                      title="نسخ الرابط الرسمي"
                    >
                      {copiedId === platform.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() =>
                        openShareModal({
                          type: 'article',
                          sectionName: 'الصدقة والتبرع',
                          contentType: 'منصة خيرية',
                          title: platform.name,
                          text: `${platform.name} - ${platform.description}\nالرابط الرسمي: ${platform.url}`,
                          source: platform.officialEntity,
                        })
                      }
                      className="p-2 rounded-xl text-slate-400 hover:text-emerald-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-emerald-900/40 transition-colors"
                      title="مشاركة كبطاقة"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {platform.description}
                </p>

                {/* Supervising Entity Info Pill */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-emerald-900/30 border border-slate-100 dark:border-emerald-900/40 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    <strong>الإشراف الحكومي:</strong> {platform.supervisingEntity}
                  </span>
                </div>

                {/* Available Services / Features */}
                {platform.features && platform.features.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                      الخدمات والمجالات المتاحة في المنصة:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {platform.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-medium bg-emerald-50/70 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-100/80 dark:border-emerald-800/40"
                        >
                          <span className="w-1 h-1 rounded-full bg-emerald-500" />
                          <span>{feature}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Action Footer */}
              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                  <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-mono" dir="ltr">
                    {new URL(platform.url).hostname}
                  </span>
                </div>

                <a
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-800/20 active:scale-95 transition-all"
                >
                  <span>زيارة المنصة الرسمية</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      )}

      {/* Bottom Islamic Assurance Footer Quote */}
      <div className="text-center py-6 border-t border-slate-200 dark:border-emerald-900/40 space-y-2">
        <p className="font-scheherazade text-xl sm:text-2xl text-emerald-800 dark:text-amber-300">
          ﴿مَّثَلُ الَّذِينَ يُنفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ أَنبَتَتْ سَبْعَ سَنَابِلَ فِي كُلِّ سُنبُلَةٍ مِّائَةُ حَبَّةٍ﴾
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          سورة البقرة • الآية ٢٦١
        </p>
      </div>
    </div>
  );
};
