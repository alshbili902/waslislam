import React, { useState, useMemo } from 'react';
import {
  Compass,
  MapPin,
  Calendar,
  BookOpen,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Search,
  Filter,
  ExternalLink,
  Layers
} from 'lucide-react';
import { SEERAH_DATA, SEERAH_ERAS } from '../data/seerahData';
import { SeerahEvent } from '../types';
import { useUser } from '../context/UserContext';
import { useShareModal } from '../context/ShareContext';
import { normalizeArabicText } from '../services/searchService';

export const SeerahView: React.FC = () => {
  const { toggleFavorite, isFavorite } = useUser();
  const { openShareModal } = useShareModal();

  const [selectedEra, setSelectedEra] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<SeerahEvent | null>(null);

  // Filter events
  const filteredEvents = useMemo(() => {
    const q = searchQuery.trim();
    const normQ = normalizeArabicText(q);

    return SEERAH_DATA.filter((ev) => {
      const matchEra = selectedEra === 'all' || ev.era === selectedEra;
      if (!matchEra) return false;
      if (!q) return true;

      const normTitle = normalizeArabicText(ev.title);
      const normSummary = normalizeArabicText(ev.summary);
      const normContent = normalizeArabicText(ev.content);
      const normLoc = normalizeArabicText(ev.location || '');

      return (
        normTitle.includes(normQ) ||
        normSummary.includes(normQ) ||
        normContent.includes(normQ) ||
        normLoc.includes(normQ)
      );
    });
  }, [searchQuery, selectedEra]);

  // Share to existing Wasl share-card system
  const handleShare = (event: SeerahEvent) => {
    openShareModal({
      type: 'seerah',
      title: event.title,
      text: event.summary || event.content.substring(0, 180),
      subtext: event.location ? `المكان: ${event.location} • التاريخ: ${event.hijriYear || event.gregorianYear || ''}` : undefined,
      reference: `${event.source} ${event.reference ? `(${event.reference})` : ''}`,
      sourceUrl: typeof window !== 'undefined' ? window.location.href : 'https://waslislam.com/seerah'
    });
  };

  // Toggle Favorite in existing favorites system
  const handleFavorite = async (event: SeerahEvent) => {
    await toggleFavorite({
      type: 'seerah',
      title: event.title,
      subtitle: `${event.eraTitleAr} • ${event.location || ''}`,
      reference: event.source
    });
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Top Hero Banner */}
      <div className="bg-white dark:bg-emerald-950/80 rounded-3xl p-6 sm:p-8 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-3 border border-emerald-300/40 dark:border-emerald-700/50">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>لَقَدْ كَانَ لَكُمْ فِي رَسُولِ اللَّهِ أُسْوَةٌ حَسَنَةٌ</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black font-amiri text-slate-900 dark:text-white leading-tight">
            السيرة النبوية الشريفة ﷺ
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
            الخط الزمني الموثّق لحياة خير الأنام وسيد المرسلين محمد ﷺ، منذ المولد المبارك بمكة المكرمة ونزول الوحي والهجرة المباركة وحتى اكتمال الدين ووفاته ﷺ، اعتماداً على أصح المصادر الكلاسيكية المعتمدة.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>نصوص وتحقيقات موثقة من كتب السنة والسير المعتمدة</span>
            </span>
            <span>•</span>
            <span className="font-semibold text-emerald-700 dark:text-emerald-300">
              {SEERAH_DATA.length} محطة تاريخية مفصلة
            </span>
          </div>
        </div>

        {/* Search & Era Filter Tabs */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-emerald-900/60 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في أحداث السيرة والغزوات والأماكن..."
              className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-slate-200 dark:border-emerald-700/60 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Era Horizontal Scrollable Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedEra('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedEra === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-emerald-900/30 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-emerald-900/50'
              }`}
            >
              جميع المراحل ({SEERAH_DATA.length})
            </button>
            {SEERAH_ERAS.map((era) => {
              const count = SEERAH_DATA.filter((e) => e.era === era.id).length;
              return (
                <button
                  key={era.id}
                  onClick={() => setSelectedEra(era.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    selectedEra === era.id
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-emerald-900/30 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-emerald-900/50'
                  }`}
                >
                  <span>{era.titleAr}</span>
                  <span className="text-[10px] opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chronological Timeline */}
      <div className="relative pr-6 md:pr-10 border-r-2 border-emerald-200 dark:border-emerald-800/80 space-y-6">
        {filteredEvents.map((event, idx) => {
          const isFav = isFavorite('seerah', event.title);

          return (
            <div key={event.id} className="relative group">
              {/* Timeline Dot Indicator */}
              <div className="absolute -right-[31px] md:-right-[47px] top-6 w-5 h-5 rounded-full bg-white dark:bg-emerald-950 border-4 border-emerald-600 dark:border-emerald-400 group-hover:scale-125 transition-transform duration-200 shadow-sm" />

              {/* Event Card */}
              <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 sm:p-6 border border-emerald-900/10 dark:border-emerald-800/50 shadow-xs hover:shadow-md transition-all hover:border-emerald-500/50">
                {/* Era & Date Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                    {event.eraTitleAr}
                  </span>

                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        <span>{event.location}</span>
                      </span>
                    )}
                    {event.hijriYear && (
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-amber-500" />
                        <span>{event.hijriYear}</span>
                      </span>
                    )}
                    {event.gregorianYear && (
                      <span className="text-[11px] text-slate-400">
                        ({event.gregorianYear})
                      </span>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h3
                  onClick={() => setSelectedEvent(event)}
                  className="text-xl sm:text-2xl font-bold font-amiri text-slate-900 dark:text-amber-300 hover:text-emerald-700 dark:hover:text-amber-200 cursor-pointer transition-colors"
                >
                  {event.title}
                </h3>

                {/* Summary */}
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {event.summary}
                </p>

                {/* Bottom Actions */}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-emerald-900/50 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-white font-bold inline-flex items-center gap-1.5 transition-colors"
                  >
                    <span>قراءة التفاصيل والوثائق</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleFavorite(event)}
                      className={`p-2 rounded-xl transition-colors ${
                        isFav
                          ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40'
                          : 'text-slate-400 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-emerald-900/40'
                      }`}
                      title={isFav ? 'محفوظ في المفضلة' : 'حفظ في المفضلة'}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      onClick={() => handleShare(event)}
                      className="p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-slate-50 dark:hover:bg-emerald-900/40 transition-colors"
                      title="مشاركة الحدث وبطاقة التصميم"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-emerald-950/40 rounded-2xl border border-dashed border-slate-300 dark:border-emerald-800">
          <BookOpen className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <h3 className="font-bold text-slate-700 dark:text-slate-200">
            لم يتم العثور على أحداث مطابقة لبحثك
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            جرب البحث بمصطلحات أخرى مثل: غَزْوة، مكة، الهجرة، بيعة.
          </p>
        </div>
      )}

      {/* Detailed Event Modal (STRICTLY NO DEPICTION) */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-emerald-950 rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-emerald-900/20 dark:border-emerald-800/60 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-emerald-900">
              <div>
                <span className="text-xs px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-bold block mb-1 w-fit">
                  {selectedEvent.eraTitleAr}
                </span>
                <h2 className="text-2xl font-bold font-amiri text-slate-900 dark:text-amber-300">
                  {selectedEvent.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Event Metadata (Location, Date) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              {selectedEvent.location && (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-emerald-900/30 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">المكان</span>
                    <strong className="text-slate-800 dark:text-slate-200">{selectedEvent.location}</strong>
                  </div>
                </div>
              )}
              {selectedEvent.hijriYear && (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-emerald-900/30 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">التاريخ الهجري</span>
                    <strong className="text-slate-800 dark:text-slate-200">{selectedEvent.hijriYear}</strong>
                  </div>
                </div>
              )}
              {selectedEvent.gregorianYear && (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-emerald-900/30 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">الميلادي</span>
                    <strong className="text-slate-800 dark:text-slate-200">{selectedEvent.gregorianYear}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Comprehensive Content Body */}
            <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40">
                <strong className="block text-xs font-bold text-emerald-900 dark:text-emerald-300 mb-1">
                  خلاصة الموقف:
                </strong>
                <p>{selectedEvent.summary}</p>
              </div>

              <div>
                <strong className="block text-xs font-bold text-slate-900 dark:text-white mb-2">
                  التفاصيل التاريخية والروايات الثابتة:
                </strong>
                <p className="whitespace-pre-line leading-relaxed">
                  {selectedEvent.content}
                </p>
              </div>

              {selectedEvent.evidence && (
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
                  <strong className="block text-xs font-bold text-amber-900 dark:text-amber-300 mb-1">
                    الشاهد من القرآن الكريم أو الحديث الصحيح:
                  </strong>
                  <p className="font-amiri text-amber-950 dark:text-amber-100 text-sm">
                    {selectedEvent.evidence}
                  </p>
                </div>
              )}

              {/* Source verification footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-emerald-900/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>المصدر المعتمد: <strong>{selectedEvent.source}</strong> {selectedEvent.reference ? `(${selectedEvent.reference})` : ''}</span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>موثّق تاريخياً</span>
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-emerald-900 flex items-center justify-between">
              <button
                onClick={() => handleFavorite(selectedEvent)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-emerald-900/40 dark:hover:bg-emerald-900/60 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-2 transition-colors"
              >
                <Heart className={`w-4 h-4 ${isFavorite('seerah', selectedEvent.title) ? 'text-rose-500 fill-current' : ''}`} />
                <span>{isFavorite('seerah', selectedEvent.title) ? 'محفوظ في المفضلة' : 'حفظ في المفضلة'}</span>
              </button>

              <button
                onClick={() => handleShare(selectedEvent)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-sm"
              >
                <Share2 className="w-4 h-4" />
                <span>مشاركة الحدث</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
