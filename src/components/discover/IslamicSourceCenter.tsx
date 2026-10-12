'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ExternalLink, 
  CheckCircle2, 
  BookOpen, 
  HeartHandshake, 
  Globe, 
  Award, 
  Info,
  Clock,
  Layers,
  Search
} from 'lucide-react';
import { ISLAMIC_SOURCES_REGISTRY, ContentSource } from '../../data/sourcesRegistry';
import { VERIFIED_CHARITY_PLATFORMS, CharityPlatform } from '../../data/charityData';


interface IslamicSourceCenterProps {
  isEnglish?: boolean;
}

export const IslamicSourceCenter: React.FC<IslamicSourceCenterProps> = ({ isEnglish = false }) => {
  const [activeSection, setActiveSection] = useState<'sources' | 'charity'>('sources');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const categories = [
    { id: 'all', labelAr: 'كافة المصادر', labelEn: 'All Sources' },
    { id: 'quran_text', labelAr: 'المصحف والتفاسير', labelEn: 'Quran & Tafsir' },
    { id: 'hadith', labelAr: 'الحديث الشريف', labelEn: 'Hadith' },
    { id: 'prayer_calculation', labelAr: 'المواقيت والتقويم', labelEn: 'Prayer & Calendar' },
    { id: 'fatwa_academy', labelAr: 'المجامع وهيئات الإفتاء', labelEn: 'Fiqh Academies' },
    { id: 'audio_recitation', labelAr: 'التلاوات الصوتية', labelEn: 'Audio Reciters' },
  ];

  const filteredSources = ISLAMIC_SOURCES_REGISTRY.filter(item => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesQuery = !searchFilter.trim() || 
      item.nameAr.includes(searchFilter) || 
      item.institutionAr.includes(searchFilter) || 
      item.descriptionAr.includes(searchFilter);
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[var(--gold-light)] text-[var(--gold)]">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-amiri text-[var(--text-main)]">
                {isEnglish ? 'Reliable Islamic Source Center' : 'مركز المصادر والتوثيق الشرعي'}
              </h2>
            </div>
            <p className="text-xs text-[var(--text-muted)] font-tajawal max-w-xl">
              {isEnglish 
                ? 'Complete transparency on scripture texts, Hadith gradings, prayer calculation algorithms, and authorized charity links.' 
                : 'التزام تام بالأصالة والشفافية: توثيق مصادر نصوص المصحف، درجات الأحاديث، حسابات المواقيت، والجهات الخيرية الرسمية.'}
            </p>
          </div>

          {/* Section Switcher Buttons */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] shrink-0">
            <button
              onClick={() => setActiveSection('sources')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSection === 'sources'
                  ? 'bg-gradient-to-r from-[var(--emerald-deep)] to-[var(--primary-dark)] text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              {isEnglish ? 'Content Sources' : 'مصادر المحتوى الشرعي'}
            </button>
            <button
              onClick={() => setActiveSection('charity')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSection === 'charity'
                  ? 'bg-gradient-to-r from-[var(--emerald-deep)] to-[var(--primary-dark)] text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              {isEnglish ? 'Verified Charities' : 'منصات التبرع المعتمدة'}
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: SOURCES REGISTRY */}
      {activeSection === 'sources' && (
        <div className="space-y-5">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-[var(--gold)] text-black border-[var(--gold)] shadow-sm'
                      : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-color)] hover:border-[var(--gold)]'
                  }`}
                >
                  {isEnglish ? cat.labelEn : cat.labelAr}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-auto sm:min-w-[200px] flex-1 min-w-0">
              <Search className="absolute right-3 top-2.5 w-3.5 h-3.5 text-[var(--text-muted)] pointer-events-none" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder={isEnglish ? 'Search sources...' : 'ابحث في المصادر...'}
                className="w-full pr-8 pl-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs focus:outline-none focus:border-[var(--gold)]"
              />
            </div>
          </div>

          {/* Sources Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSources.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--border-gold)]/60 transition-all shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-[var(--primary-light)] text-[var(--text-primary)] border border-[var(--border-color)] text-[10px] font-bold">
                      {item.institutionAr}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      موثّق
                    </span>
                  </div>

                  <h3 className="text-base font-bold font-amiri text-[var(--text-main)]">
                    {isEnglish ? item.nameEn : item.nameAr}
                  </h3>

                  <p className="text-xs text-[var(--text-muted)] font-tajawal leading-relaxed">
                    {item.descriptionAr}
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[var(--text-muted)]">
                    التحقق: {item.lastVerifiedYear} م
                  </span>
                  
                  {item.referenceUrl && (
                    <a
                      href={item.referenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[var(--gold)] hover:underline font-bold text-xs"
                    >
                      <span>{isEnglish ? 'Official Source' : 'المصدر الرسمي'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

            ))}
          </div>

          {/* Source Policy Statement */}
          <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] flex items-start gap-3 text-xs text-[var(--text-muted)]">
            <Info className="w-4 h-4 text-[var(--gold)] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              تعتمد منصة «وَصْل الإسلامية» سياسة صارمة في نقل النصوص الشرعية؛ حيث لا نعتمد أي فتوى مولدة بالذكاء الاصطناعي، وتخضع جميع مواد التفسير والحديث للمراجعة المؤصلة مع ذكر السند والتخريج بدقة بالغة.
            </p>
          </div>
        </div>
      )}

      {/* SECTION 2: VERIFIED CHARITIES */}
      {activeSection === 'charity' && (
        <div className="space-y-6">
          {/* Important Transparency Notice */}
          <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 space-y-2">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <span>إخلاء مسؤولية وشفافية مالية تامة</span>
            </div>
            <p className="text-xs text-[var(--text-main)] font-tajawal leading-relaxed">
              منصة «وَصْل الإسلامية» منصة دعوية وعلمية غير ربحية بالكامل، ولا تطلب ولا تجمع أي أموال أو تبرعات مباشرة عبر التطبيق، ولا تملك حسابات بنكية لجمع الأموال. الروابط المذكورة أدناه هي روابط رسمية مباشرة لمنصات حكومية ووطنية معتمدة تتيح لك إخراج صدقاتك وزكاتك بنفسك عبر قنواتها الآمنة.
            </p>
          </div>

          {/* Charity Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {VERIFIED_CHARITY_PLATFORMS.map((platform) => (
              <div
                key={platform.id}
                className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--gold)] transition-all shadow-sm flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-xl bg-[var(--gold-light)] border border-[var(--border-gold)]/40 text-[var(--gold)] text-[10px] font-bold">
                      {platform.badgeAr}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] font-mono">
                      {platform.authorityAr}
                    </span>
                  </div>


                  <h3 className="text-lg font-bold font-amiri text-[var(--text-main)] group-hover:text-[var(--gold)] transition-colors">
                    {isEnglish ? platform.nameEn : platform.nameAr}
                  </h3>

                  <p className="text-xs text-[var(--text-muted)] font-tajawal leading-relaxed">
                    {platform.descriptionAr}
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border-color)]">
                  <a
                    href={platform.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--primary-light)] text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--gold)] font-bold text-xs transition-colors"
                  >
                    <span>{isEnglish ? 'Visit Official Portal' : 'الانتقال للبوابة الرسمية'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
