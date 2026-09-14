import React, { useState, useEffect } from 'react';
import {
  MapPin,
  CheckCircle2,
  Circle,
  Share2,
  Heart,
  BookOpen,
  Compass,
  AlertTriangle,
  Info,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Map
} from 'lucide-react';
import { HAJJ_UMRAH_DATA } from '../data/hajjUmrahData';
import { HajjUmrahStep } from '../types';
import { useUser } from '../context/UserContext';
import { useShareModal } from '../context/ShareContext';

const HAJJ_CHECKLIST_KEY = 'wasl_hajj_checklist_v1';

export const HajjUmrahView: React.FC = () => {
  const { toggleFavorite, isFavorite } = useUser();
  const { openShareModal } = useShareModal();

  const [activeTab, setActiveTab] = useState<'umrah' | 'hajj' | 'miqat' | 'rulings' | 'duas'>('umrah');
  const [checklist, setChecklist] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(HAJJ_CHECKLIST_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  // Expanded step for accordion view
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(HAJJ_CHECKLIST_KEY, JSON.stringify(checklist));
    } catch {}
  }, [checklist]);

  const toggleCheck = (id: string) => {
    setChecklist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter datasets
  const umrahSteps = HAJJ_UMRAH_DATA.filter((s) => s.type === 'umrah');
  const hajjSteps = HAJJ_UMRAH_DATA.filter((s) => s.type === 'hajj');
  const miqats = HAJJ_UMRAH_DATA.filter((s) => s.type === 'miqat');
  const rulings = HAJJ_UMRAH_DATA.filter((s) => s.type === 'ruling');
  const duas = HAJJ_UMRAH_DATA.filter((s) => s.type === 'dua');

  // Share step using existing ShareModal
  const handleShare = (step: HajjUmrahStep) => {
    openShareModal({
      type: 'hajj_umrah',
      title: step.title,
      text: step.description.substring(0, 200),
      subtext: step.evidence ? `الدليل: ${step.evidence}` : undefined,
      reference: `${step.source} ${step.reference ? `(${step.reference})` : ''}`,
      sourceUrl: typeof window !== 'undefined' ? window.location.href : 'https://waslislam.com/hajj-umrah'
    });
  };

  // Toggle Favorite
  const handleFavorite = async (step: HajjUmrahStep) => {
    await toggleFavorite({
      type: 'hajj_umrah',
      title: step.title,
      subtitle: step.type === 'umrah' ? 'العمرة' : step.type === 'hajj' ? 'الحج' : 'أحكام ومواقيت',
      reference: step.source
    });
  };

  // Coordinates for the holy sites in Makkah
  const HOLY_SITES = [
    { name: 'المسجد الحرام والكعبة المشرفة', lat: 21.4225, lng: 39.8262, desc: 'مهوى أفئدة المسلمين، وفيه الطواف وصلاة ركعتي الطواف' },
    { name: 'مِنى (مشعر منى)', lat: 21.4133, lng: 39.8933, desc: 'المبيت يوم التروية وأيام التشريق ورمي الجمرات الثلاث' },
    { name: 'صعيد عرفات (جبل الرحمة ومسجد نمرة)', lat: 21.3547, lng: 39.9842, desc: 'الوقوف بعرفة الركن الأعظم للحج يوم 9 ذو الحجة' },
    { name: 'مُزدلفة (المشعر الحرام)', lat: 21.3833, lng: 39.9333, desc: 'المبيت ليلة النحر والجمع بين المغرب والعشاء والتقاط الحصى' }
  ];

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white dark:bg-emerald-950/80 rounded-3xl p-6 sm:p-8 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-3 border border-emerald-300/40 dark:border-emerald-700/50">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>وَأَذِّن فِي النَّاسِ بِالْحَجِّ يَأْتُوكَ رِجَالًا</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black font-amiri text-slate-900 dark:text-white leading-tight">
            دليل الحج والعمرة التفاعلي
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
            دليل شرعي عملي خطوة بخطوة لأداء مناسك العمرة والحج على هدي النبي المصطفى ﷺ، متضمناً الأركان، الواجبات، المواقيت المكانية بإحداثياتها الجغرافية، وقائمة متابعة المناسك الشخصية.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-emerald-900/60 flex flex-wrap gap-2">
          {[
            { id: 'umrah', label: 'دليل العمرة (7 خطوات)' },
            { id: 'hajj', label: 'دليل الحج يوماً بيوم' },
            { id: 'miqat', label: 'المواقيت المكانية والخريطة' },
            { id: 'rulings', label: 'الأركان، الواجبات، والمحظورات' },
            { id: 'duas', label: 'الأدعية والأذكار المأثورة' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-emerald-900/40 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-emerald-900/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: UMRAH STEP-BY-STEP */}
      {activeTab === 'umrah' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between">
            <span className="text-xs text-emerald-900 dark:text-emerald-200 font-medium">
              أكمل خطوات العمرة بالتسلسل وعلم كل خطوة في قائمتك الشخصية عند إتمامها:
            </span>
            <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300">
              {Object.values(checklist).filter(Boolean).length} من 7 مكتمل
            </span>
          </div>

          <div className="space-y-3">
            {umrahSteps.map((step) => {
              const isDone = Boolean(checklist[step.id]);
              const isFav = isFavorite('hajj_umrah', step.title);
              const isExp = expandedStep === step.id;

              return (
                <div
                  key={step.id}
                  className={`rounded-2xl border transition-all bg-white dark:bg-emerald-950/80 ${
                    isDone
                      ? 'border-emerald-500/60 bg-emerald-500/5'
                      : 'border-slate-200 dark:border-emerald-800/50'
                  }`}
                >
                  <div className="p-5 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {/* Step Number Circle */}
                      <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold font-mono text-sm flex items-center justify-center shrink-0 shadow-xs">
                        {step.stepNumber}
                      </span>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-bold font-amiri text-slate-900 dark:text-white">
                            {step.title}
                          </h3>
                          {step.ruling && (
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                                step.ruling === 'rukn'
                                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                                  : step.ruling === 'wajib'
                                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                  : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              }`}
                            >
                              {step.ruling === 'rukn' ? 'ركن لا يسقط' : step.ruling === 'wajib' ? 'واجب' : 'سنة مستحبة'}
                            </span>
                          )}
                        </div>

                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                          {step.description}
                        </p>

                        {/* Evidence and Notes when expanded */}
                        {isExp && (
                          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-emerald-900 space-y-2 text-xs">
                            {step.evidence && (
                              <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 text-amber-950 dark:text-amber-100">
                                <strong>الدليل الشرعي: </strong>
                                <span className="font-amiri">{step.evidence}</span>
                              </div>
                            )}
                            {step.notes && (
                              <div className="p-3 rounded-xl bg-slate-50 dark:bg-emerald-900/30 text-slate-700 dark:text-slate-300">
                                <strong>تنبيه فقهي: </strong>
                                <span>{step.notes}</span>
                              </div>
                            )}
                            <div className="text-[11px] text-slate-400">
                              المصدر: {step.source} {step.reference ? `(${step.reference})` : ''}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right action icons */}
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <button
                        onClick={() => toggleCheck(step.id)}
                        className={`p-2.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-colors ${
                          isDone
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-50 dark:bg-emerald-900/30 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-emerald-700 hover:bg-emerald-50'
                        }`}
                        title={isDone ? 'تم إتمام الخطوة' : 'تحديد كـ تم'}
                      >
                        <CheckCircle2 className={`w-4 h-4 ${isDone ? 'fill-current' : ''}`} />
                        <span className="hidden sm:inline">{isDone ? 'تم' : 'لم يتم'}</span>
                      </button>

                      <button
                        onClick={() => handleShare(step)}
                        className="p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-slate-50 dark:hover:bg-emerald-900/40"
                        title="مشاركة الخطوة"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setExpandedStep(isExp ? null : step.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        title={isExp ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                      >
                        {isExp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: HAJJ DAY-BY-DAY */}
      {activeTab === 'hajj' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200">
            <strong>ترتيب مناسك الحج:</strong> يبدأ بيوم التروية (8 ذو الحجة)، ثم يوم عرفة الأعظم (9 ذو الحجة)، فالمبيت بمزدلفة ليلة النحر، ثم أعمال يوم النحر (10 ذو الحجة)، ثم أيام التشريق بمنى (11 و 12 و 13 ذو الحجة)، ويختم بطواف الوداع.
          </div>

          <div className="space-y-4">
            {hajjSteps.map((step) => {
              const isDone = Boolean(checklist[step.id]);

              return (
                <div
                  key={step.id}
                  className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 sm:p-6 border border-emerald-900/10 dark:border-emerald-800/50 shadow-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 font-bold text-xs">
                        {step.dayNameAr}
                      </span>
                      {step.ruling && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-[10px] font-bold">
                          {step.ruling === 'rukn' ? 'ركن أعظم' : 'واجب'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleCheck(step.id)}
                        className={`p-2 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                          isDone
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-50 dark:bg-emerald-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-emerald-700'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isDone ? '✓ تم' : 'تحديد كـ تم'}</span>
                      </button>

                      <button
                        onClick={() => handleShare(step)}
                        className="p-2 rounded-xl text-slate-400 hover:text-emerald-600"
                        title="مشاركة"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold font-amiri text-slate-900 dark:text-white mb-2">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {step.description}
                  </p>

                  {step.evidence && (
                    <div className="mt-3 p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 text-xs text-amber-950 dark:text-amber-100">
                      <strong>الدليل: </strong>
                      <span className="font-amiri">{step.evidence}</span>
                    </div>
                  )}

                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-emerald-900/50 text-[11px] text-slate-400">
                    المصدر: {step.source} {step.reference ? `(${step.reference})` : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: MIQATS & MAP COORDINATES */}
      {activeTab === 'miqat' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
            <strong>المواقيت المكانية:</strong> هي الحدود والأماكن التي وقتها رسول الله ﷺ لمن أراد الحج أو العمرة، ولا يجوز لقاصد مكة تجاوُزها بلا إحرام.
          </div>

          {/* 5 Miqats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {miqats.map((m) => (
              <div
                key={m.id}
                className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 border border-emerald-900/10 dark:border-emerald-800/50 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="text-lg font-bold font-amiri text-slate-900 dark:text-white">
                      {m.title}
                    </h3>
                  </div>
                  {m.coordinates && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${m.coordinates.lat},${m.coordinates.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1 font-bold"
                    >
                      <span>الخريطة</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {m.description}
                </p>

                {m.coordinates && (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-emerald-900/30 text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>الإحداثيات الجغرافية:</span>
                    <span>{m.coordinates.lat.toFixed(4)}° N, {m.coordinates.lng.toFixed(4)}° E</span>
                  </div>
                )}

                <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-emerald-900/40">
                  المصدر: {m.source}
                </div>
              </div>
            ))}
          </div>

          {/* Holy Sites Coordinates in Makkah */}
          <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-6 border border-emerald-900/10 dark:border-emerald-800/50 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Map className="w-5 h-5 text-amber-500" />
              <span>إحداثيات المشاعر المقدسة بمكة المكرمة</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {HOLY_SITES.map((site) => (
                <div key={site.name} className="p-4 rounded-xl bg-slate-50 dark:bg-emerald-900/20 border border-slate-100 dark:border-emerald-800/40 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <strong className="text-xs font-bold text-slate-900 dark:text-white">
                      {site.name}
                    </strong>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${site.lat},${site.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline"
                    >
                      فتح
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    {site.desc}
                  </p>
                  <span className="text-[10px] font-mono text-slate-400 block">
                    {site.lat}° N, {site.lng}° E
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RULINGS, PILLARS, PROHIBITIONS */}
      {activeTab === 'rulings' && (
        <div className="space-y-4">
          {rulings.map((r) => (
            <div
              key={r.id}
              className="bg-white dark:bg-emerald-950/80 rounded-2xl p-6 border border-emerald-900/10 dark:border-emerald-800/50 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold font-amiri text-slate-900 dark:text-amber-300">
                  {r.title}
                </h3>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    r.ruling === 'rukn'
                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                      : r.ruling === 'prohibition'
                      ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                  }`}
                >
                  {r.ruling === 'rukn' ? 'أركان لا تسقط' : r.ruling === 'prohibition' ? 'محظورات يجب تجنبها' : 'واجبات'}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                {r.description}
              </p>

              {r.evidence && (
                <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 text-xs text-amber-950 dark:text-amber-100">
                  <strong>الدليل الفقهي: </strong>
                  <span className="font-amiri">{r.evidence}</span>
                </div>
              )}

              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-emerald-900/40">
                المصدر: {r.source} {r.reference ? `(${r.reference})` : ''}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: DUAS & ADHKAR */}
      {activeTab === 'duas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {duas.map((d) => (
            <div
              key={d.id}
              className="bg-white dark:bg-emerald-950/80 rounded-2xl p-6 border border-emerald-900/10 dark:border-emerald-800/50 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-lg font-bold font-amiri text-slate-900 dark:text-amber-300">
                    {d.title}
                  </h3>
                  <button
                    onClick={() => handleShare(d)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600"
                    title="مشاركة الدعاء"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-900/30 border border-emerald-500/20 text-center my-3">
                  <p className="text-base sm:text-lg font-bold font-amiri text-emerald-950 dark:text-emerald-100 leading-loose">
                    {d.description}
                  </p>
                </div>

                {d.evidence && (
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {d.evidence}
                  </p>
                )}
              </div>

              <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-100 dark:border-emerald-900/40">
                المصدر: {d.source}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
