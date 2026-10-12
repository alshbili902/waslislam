'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Sparkles, 
  Clock, 
  BookOpen, 
  Heart, 
  Share2, 
  Sliders, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  Flame,
  Sun,
  Moon
} from 'lucide-react';
import { ISLAMIC_SEASONS_DATA, IslamicSeason } from '../../data/seasonsData';
import { seasonsManager, SeasonStatusResult } from '../../utils/seasonsManager';

interface IslamicSeasonsCenterProps {
  onOpenQuran: (surahNumber: number, ayahNumber?: number) => void;
  onOpenReadingPlanner?: () => void;
  onOpenShareCard?: (content: { title: string; text: string; source: string; category: string }) => void;
  isEnglish: boolean;
}

export const IslamicSeasonsCenter: React.FC<IslamicSeasonsCenterProps> = ({
  onOpenQuran,
  onOpenReadingPlanner,
  onOpenShareCard,
  isEnglish
}) => {
  const [status, setStatus] = useState<SeasonStatusResult>(() => seasonsManager.getSeasonsStatus());
  const [selectedSeason, setSelectedSeason] = useState<IslamicSeason>(() => {
    const s = seasonsManager.getSeasonsStatus();
    return s.currentSeason || s.upcomingSeason;
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleAdjustDate = (delta: number) => {
    const newAdj = Math.min(2, Math.max(-2, status.adjustmentDays + delta));
    seasonsManager.setAdjustmentDays(newAdj);
    const updated = seasonsManager.getSeasonsStatus();
    setStatus(updated);
  };

  const handleCopyText = (id: string, text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleShareSeason = (season: IslamicSeason) => {
    if (!onOpenShareCard) return;
    onOpenShareCard({
      title: season.nameAr,
      text: `${season.summaryAr}\n\nأبرز الفضائل:\n- ${season.virtuesAr.join('\n- ')}\n\nالوظائف المستحبة:\n- ${season.recommendedActsAr.join('\n- ')}`,
      source: `${season.sourceAttribution} • وصل الإسلامية`,
      category: 'مركز المواسم الإسلامية'
    });
  };

  return (
    <div className="space-y-6">
      {/* Hero Header with Active / Upcoming Countdown */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a382b] via-[var(--bg-card)] to-[#0f241a] border border-[var(--gold)]/20 p-6 md:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--gold)]/20 border border-[var(--gold)]/40 text-[var(--gold-light)] text-xs font-semibold">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                اليوم: {status.hijriDate.day} {status.hijriDate.monthNameAr} {status.hijriDate.year} هـ
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--gold)] font-scheherazade">
              {status.currentSeason ? (
                <span>نحن الآن في موسم: {status.currentSeason.nameAr}</span>
              ) : (
                <span>الموسم القادم: {status.upcomingSeason.nameAr}</span>
              )}
            </h1>

            <p className="text-xs md:text-sm text-gray-200 leading-relaxed">
              {status.currentSeason 
                ? status.currentSeason.summaryAr 
                : `يتبقى تقريباً ${status.daysRemainingToUpcoming} يوماً على حلول ${status.upcomingSeason.nameAr}. استعد لمضاعفة الطاعات والأجور.`}
            </p>
          </div>

          {/* Countdown or Status Badge */}
          <div className="shrink-0 p-3 sm:p-4 rounded-xl bg-black/40 border border-white/10 text-center space-y-1.5 w-full sm:w-auto sm:min-w-[160px]">
            {status.currentSeason ? (
              <>
                <div className="w-3 h-3 rounded-full bg-emerald-400 mx-auto animate-pulse" />
                <span className="text-xs text-[var(--gold-light)] font-bold block">الموسم نشط حالياً</span>
                <span className="text-xs text-gray-300 block">{status.currentSeason.badgeAr}</span>
              </>
            ) : (
              <>
                <Clock className="w-5 h-5 text-[var(--gold)] mx-auto mb-1" />
                <span className="text-2xl md:text-3xl font-black text-white block">
                  {status.daysRemainingToUpcoming}
                </span>
                <span className="text-xs text-gray-300 block">يوماً متبقياً للحلول</span>
              </>
            )}

            {/* Moon sighting adjustment widget */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
              <button 
                onClick={() => handleAdjustDate(-1)} 
                className="hover:text-white px-1"
                title="إنقاص يوم حسب الرؤية المحلية"
              >
                -1
              </button>
              <span>تعديل الرؤية: {status.adjustmentDays > 0 ? `+${status.adjustmentDays}` : status.adjustmentDays}</span>
              <button 
                onClick={() => handleAdjustDate(1)} 
                className="hover:text-white px-1"
                title="زيادة يوم حسب الرؤية المحلية"
              >
                +1
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Season Navigation Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-semibold">
        {ISLAMIC_SEASONS_DATA.map(season => {
          const isSelected = selectedSeason.id === season.id;
          const isCurrentlyActive = status.currentSeason?.id === season.id;

          return (
            <button
              key={season.id}
              onClick={() => setSelectedSeason(season)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[var(--gold)] text-black font-bold shadow-md'
                  : 'bg-[var(--bg-card)] text-[var(--text-main)] hover:border-[var(--gold)] border border-[var(--border-color)]'
              }`}
            >
              {isCurrentlyActive && <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />}
              <span>{season.nameAr}</span>
            </button>
          );
        })}
      </div>

      {/* Active Season Detail Card */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-md space-y-6">
        {/* Header of selected season */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--gold)]/20 text-[var(--gold)] font-bold">
                {selectedSeason.badgeAr}
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                selectedSeason.fastingStatus === 'obligatory' ? 'bg-amber-500/20 text-amber-500' :
                selectedSeason.fastingStatus === 'prohibited_fasting' ? 'bg-rose-500/20 text-rose-500' :
                'bg-emerald-500/20 text-emerald-500'
              }`}>
                {selectedSeason.fastingStatus === 'obligatory' ? 'صيام مفروض' :
                 selectedSeason.fastingStatus === 'prohibited_fasting' ? 'يحرم صيامه (يوم عيد)' :
                 'صيام مسنون ومستحب'}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-[var(--text-main)] font-scheherazade">
              {selectedSeason.nameAr}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleShareSeason(selectedSeason)}
              className="p-2 rounded-lg border border-[var(--border-color)] hover:border-[var(--gold)] text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors"
              title="مشاركة بطاقة الموسم"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Section 1: فضائل الموسم ووظائفه */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Virtues */}
          <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-3">
            <h3 className="font-bold text-sm text-[var(--gold)] flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>الفضائل والخصائص الثابتة</span>
            </h3>
            <ul className="space-y-2 text-xs text-[var(--text-main)] leading-relaxed">
              {selectedSeason.virtuesAr.map((v, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[var(--gold)] mt-0.5 font-bold">•</span>
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended Acts */}
          <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-3">
            <h3 className="font-bold text-sm text-[var(--gold)] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>وظائف الأوقات والأعمال المستحبة</span>
            </h3>
            <ul className="space-y-2 text-xs text-[var(--text-main)] leading-relaxed">
              {selectedSeason.recommendedActsAr.map((act, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5 font-bold">•</span>
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Section 2: الآيات القرآنية المرتبطة بالموسم */}
        {selectedSeason.relatedVerses && selectedSeason.relatedVerses.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-[var(--gold)] flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>الآيات القرآنية الخاصة بالموسم</span>
            </h3>
            <div className="space-y-2.5">
              {selectedSeason.relatedVerses.map((verse, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div>
                    <span className="text-xs text-[var(--gold)] font-bold block mb-1">
                      سورة {verse.surahNameAr} [الآية {verse.ayahNumber}]
                    </span>
                    <p className="font-scheherazade text-lg text-[var(--text-main)] leading-relaxed">
                      {verse.textAr}
                    </p>
                  </div>
                  <button
                    onClick={() => onOpenQuran(verse.surahNumber, verse.ayahNumber)}
                    className="self-end md:self-center px-3 py-1.5 rounded-lg bg-[var(--gold)] text-black font-bold text-xs whitespace-nowrap hover:opacity-90"
                  >
                    اقرأ في المصحف
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 3: الأذكار والأدعية النبوية الثابتة */}
        {selectedSeason.authenticAdhkar && selectedSeason.authenticAdhkar.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-[var(--gold)] flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>الأذكار والأدعية الثابتة في هذا الموسم</span>
            </h3>
            <div className="space-y-2.5">
              {selectedSeason.authenticAdhkar.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[var(--gold)]">{item.titleAr}</span>
                    <button
                      onClick={() => handleCopyText(item.id, item.textAr)}
                      className="p-1.5 rounded-md hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors flex items-center gap-1 text-[11px]"
                    >
                      {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === item.id ? 'تم النسخ' : 'نسخ الذكر'}</span>
                    </button>
                  </div>
                  <p className="font-scheherazade text-lg md:text-xl text-[var(--text-main)] leading-loose text-right">
                    {item.textAr}
                  </p>
                  <div className="pt-2 border-t border-[var(--border-color)]/60 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                    <span>{item.virtueAr}</span>
                    <span>المصدر: {item.source}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 4: الورد والمخطط القرآني المقترح */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-[var(--emerald-deep)]/20 to-[var(--gold)]/10 border border-[var(--gold)]/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-xs text-[var(--gold)] mb-0.5">الورد والمخطط القرآني المقترح</h4>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              {selectedSeason.readingPlanSuggestion}
            </p>
          </div>
          {onOpenReadingPlanner && (
            <button
              onClick={onOpenReadingPlanner}
              className="self-end md:self-center px-4 py-2 rounded-lg bg-[var(--gold)] text-black font-bold text-xs whitespace-nowrap hover:opacity-90"
            >
              افتح مخطط الورد القرآني
            </button>
          )}
        </div>

        {/* Source Attribution Footer */}
        <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>المصدر والتوثيق: {selectedSeason.sourceAttribution}</span>
          </div>
          <span className="text-[11px]">مضبوط بحساب تقويم أم القرى بالمملكة العربية السعودية</span>
        </div>
      </div>
    </div>
  );
};
