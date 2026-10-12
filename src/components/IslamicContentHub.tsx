'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Radio, 
  Award, 
  Layers, 
  Share2, 
  CheckCircle, 
  RotateCcw, 
  Volume2, 
  Play, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Search, 
  Copy, 
  Info,
  GraduationCap,
  ShieldCheck,
  Headphones,
  Trophy
} from 'lucide-react';
import { IconKaaba, IconDuaHands } from './icons/IslamicIcons';
import { AUTHENTIC_HADITHS, HadithItem } from '../data/hadithData';
import { ADHKAR_DATA, DhikrItem } from '../data/adhkarData';
import { ALLAH_NAMES, AllahName } from '../data/allahNamesData';
import { ISLAMIC_ARTICLES, IslamicArticle } from '../data/islamicStoriesData';
import { HAJJ_UMRAH_STEPS, HajjUmrahStep } from '../data/hajjUmrahData';
import { QUIZ_QUESTIONS, QuizQuestion } from '../data/quizData';
import { RADIO_STATIONS, RadioStation } from '../data/radioData';
import { AudioTrack } from './AudioPlayerBar';
import { WaslAcademy } from './discover/WaslAcademy';
import { IslamicSourceCenter } from './discover/IslamicSourceCenter';
import { AudioLibrary } from './discover/AudioLibrary';

interface IslamicContentHubProps {
  onPlayTrack: (track: AudioTrack) => void;
  onOpenShareCard: (content: { title: string; text: string; source: string; category: string }) => void;
  isEnglish: boolean;
  selectedReciterId?: string;
  onChangeReciter?: (id: string) => void;
}


export const IslamicContentHub: React.FC<IslamicContentHubProps> = ({
  onPlayTrack,
  onOpenShareCard,
  isEnglish,
  selectedReciterId,
  onChangeReciter
}) => {

  const [activeTab, setActiveTab] = useState<'academy' | 'hadith' | 'stories' | 'names' | 'audio' | 'sources' | 'adhkar' | 'hajj' | 'quiz'>('academy');

  // Adhkar Counter State
  const [adhkarCategory, setAdhkarCategory] = useState<'morning' | 'evening' | 'prayer' | 'sleep' | 'travel'>('morning');
  const [adhkarCounts, setAdhkarCounts] = useState<Record<string, number>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Quiz State
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);

  // Selected Allah Name modal
  const [selectedName, setSelectedName] = useState<AllahName | null>(null);

  // Adhkar Counter increment with haptic vibration feedback
  const handleCountDhikr = (item: DhikrItem) => {
    const current = adhkarCounts[item.id] || 0;
    if (current < item.count) {
      const nextCount = current + 1;
      setAdhkarCounts(prev => ({ ...prev, [item.id]: nextCount }));

      // Trigger mobile haptic feedback if supported
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(nextCount === item.count ? [50, 50, 50] : 30);
      }
    }
  };

  const handleResetDhikr = (id: string) => {
    setAdhkarCounts(prev => ({ ...prev, [id]: 0 }));
  };

  const handleCopyText = (text: string, id: string) => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Quiz logic
  const handleSelectQuizOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    if (idx === QUIZ_QUESTIONS[currentQuizIndex].correctIndex) {
      setScore(s => s + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    if (currentQuizIndex + 1 < QUIZ_QUESTIONS.length) {
      setCurrentQuizIndex(i => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsQuizCompleted(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsQuizCompleted(false);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Category Tabs Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'academy', labelAr: 'أكاديمية وصل', labelEn: 'Wasl Academy', icon: <GraduationCap className="w-4 h-4" /> },
          { id: 'audio', labelAr: 'المكتبة الصوتية والإذاعات', labelEn: 'Audio & Radio', icon: <Headphones className="w-4 h-4" /> },
          { id: 'hadith', labelAr: 'الأحاديث الصحيحة', labelEn: 'Hadith', icon: <BookOpen className="w-4 h-4" /> },
          { id: 'stories', labelAr: 'السيرة وقصص الأنبياء', labelEn: 'Seerah & Stories', icon: <BookOpen className="w-4 h-4" /> },
          { id: 'names', labelAr: 'أسماء الله الحسنى', labelEn: 'Names of Allah', icon: <Layers className="w-4 h-4" /> },
          { id: 'sources', labelAr: 'مركز المصادر والتبرع', labelEn: 'Sources & Charity', icon: <ShieldCheck className="w-4 h-4" /> },
          { id: 'adhkar', labelAr: 'حصن المسلم', labelEn: 'Adhkar', icon: <IconDuaHands className="w-4 h-4" /> },
          { id: 'hajj', labelAr: 'مناسك الحج والعمرة', labelEn: 'Hajj & Umrah', icon: <IconKaaba className="w-4 h-4" /> },
          { id: 'quiz', labelAr: 'المسابقة الإسلامية', labelEn: 'Quiz', icon: <Trophy className="w-4 h-4" /> },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 flex items-center gap-2 transition-all ${
              activeTab === t.id
                ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] text-white shadow-md border border-[var(--border-gold)]'
                : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-color)] hover:text-[var(--text-main)] hover:border-[var(--gold)]'
            }`}
          >
            {t.icon}
            <span>{isEnglish ? t.labelEn : t.labelAr}</span>
          </button>
        ))}
      </div>

      {/* A. Wasl Academy Tab */}
      {activeTab === 'academy' && (
        <WaslAcademy
          isEnglish={isEnglish}
          onOpenShareCard={onOpenShareCard}
        />
      )}

      {/* B. Audio Library & Live Radio Tab */}
      {activeTab === 'audio' && (
        <AudioLibrary
          onPlayTrack={onPlayTrack}
          selectedReciterId={selectedReciterId || 'alafasy'}
          onChangeReciter={onChangeReciter || (() => {})}
          isEnglish={isEnglish}
        />
      )}

      {/* C. Source Center & Verified Charities Tab */}
      {activeTab === 'sources' && (
        <IslamicSourceCenter
          isEnglish={isEnglish}
        />
      )}


      {/* 1. Adhkar & Hisn al-Muslim Tab */}
      {activeTab === 'adhkar' && (
        <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
            <div>
              <h2 className="text-xl font-black text-[var(--text-main)] font-cairo">
                {isEnglish ? 'Hisn al-Muslim Adhkar & Tasbeeh' : 'أذكار حصن المسلم والمسبحة الإلكترونية'}
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {isEnglish ? 'Authentic daily supplications with interactive repetition counters' : 'الأذكار المأثورة عن رسول الله ﷺ مع عدّاد تفاعلي واهتزاز عند الإتمام'}
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'morning', labelAr: 'الصباح' },
                { id: 'evening', labelAr: 'المساء' },
                { id: 'prayer', labelAr: 'بعد الصلاة' },
                { id: 'sleep', labelAr: 'النوم' },
                { id: 'travel', labelAr: 'السفر' },
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => setAdhkarCategory(c.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    adhkarCategory === c.id
                      ? 'bg-[var(--gold)] text-white shadow-sm'
                      : 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)] border border-[var(--border-color)]'
                  }`}
                >
                  {c.labelAr}
                </button>
              ))}
            </div>
          </div>

          {/* Adhkar Cards List */}
          <div className="space-y-4">
            {ADHKAR_DATA.filter(d => d.category === adhkarCategory).map((item) => {
              const countDone = adhkarCounts[item.id] || 0;
              const isFinished = countDone >= item.count;

              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isFinished
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-[var(--bg-card-subtle)] border-[var(--border-color)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-[var(--text-muted)] bg-[var(--bg-card)] px-2.5 py-1 rounded-full border border-[var(--border-color)]">
                      {item.referenceAr}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyText(item.textAr, item.id)}
                        className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-lg"
                        title="نسخ النص"
                      >
                        {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => onOpenShareCard({
                          title: item.categoryAr,
                          text: item.textAr,
                          source: item.referenceAr,
                          category: 'dhikr'
                        })}
                        className="p-1.5 text-[var(--text-muted)] hover:text-[var(--gold)] rounded-lg"
                        title="مشاركة كبطاقة"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="font-quran text-lg font-semibold text-[var(--text-main)] leading-loose my-2 text-right">
                    «{item.textAr}»
                  </p>

                  <p className="text-xs text-[var(--text-muted)] font-tajawal mb-4">
                    <strong>الفضل:</strong> {item.virtueAr}
                  </p>

                  {/* Interactive Counter Row */}
                  <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)]">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold">
                      <span className="text-[var(--text-muted)]">الإنجاز:</span>
                      <span className="text-[var(--text-primary)] text-sm">{countDone}</span>
                      <span className="text-[var(--text-muted)]">/</span>
                      <span className="text-[var(--gold)]">{item.count}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResetDhikr(item.id)}
                        className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] bg-[var(--bg-card)] border border-[var(--border-color)]"
                        title="إعادة التصفير"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleCountDhikr(item)}
                        disabled={isFinished}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all ${
                          isFinished
                            ? 'bg-emerald-600 text-white cursor-default'
                            : 'bg-gradient-to-r from-[var(--primary)] to-[var(--gold)] text-white hover:scale-105 active:scale-95'
                        }`}
                      >
                        {isFinished ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span>تم إتمام الذكر</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>اضغط للعد ({item.count - countDone} متبقٍ)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 2. Authentic Hadith Tab */}
      {activeTab === 'hadith' && (
        <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm space-y-6">
          <div className="pb-4 border-b border-[var(--border-color)]">
            <h2 className="text-xl font-black text-[var(--text-main)] font-cairo">
              {isEnglish ? 'Authentic Prophetic Hadith' : 'رياض الأحاديث النبوية الصحيحة'}
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {isEnglish ? 'Verified sayings of Prophet Muhammad ﷺ from Sahih al-Bukhari & Sahih Muslim' : 'أحاديث مسندة من صحيحي البخاري ومسلم والسنن المعتمدة مع درجتها ومصدرها'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AUTHENTIC_HADITHS.map((h) => (
              <div
                key={h.id}
                className="bg-[var(--bg-card-subtle)] border border-[var(--border-color)] rounded-2xl p-5 flex flex-col justify-between hover:border-[var(--gold)] transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 font-bold">
                      {h.grade}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] font-mono">
                      {h.source}
                    </span>
                  </div>

                  <p className="font-quran text-base sm:text-lg font-semibold text-[var(--text-main)] leading-loose mb-3">
                    «{h.arabic}»
                  </p>

                  <p className="text-xs text-[var(--text-muted)] italic font-tajawal mb-3 border-t border-[var(--border-color)] pt-2">
                    {h.english}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)] text-xs text-[var(--text-muted)]">
                  <span>الراوي: <strong>{h.narratorAr}</strong></span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopyText(h.arabic, h.id)}
                      className="p-1.5 hover:text-[var(--text-main)]"
                      title="نسخ الحديث"
                    >
                      {copiedId === h.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => onOpenShareCard({
                        title: 'حديث نبوي شريف',
                        text: h.arabic,
                        source: h.source,
                        category: 'hadith'
                      })}
                      className="p-1.5 text-[var(--gold)] hover:opacity-80"
                      title="مشاركة كبطاقة"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. 99 Names of Allah Tab */}
      {activeTab === 'names' && (
        <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm space-y-6">
          <div className="pb-4 border-b border-[var(--border-color)]">
            <h2 className="text-xl font-black text-[var(--text-main)] font-cairo">
              {isEnglish ? 'The 99 Beautiful Names of Allah' : 'أسماء الله الحسنى ومعانيها الجليلة'}
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {isEnglish ? 'Contemplate the divine names, their authentic meanings, and Quranic citations' : '«إن لله تسعة وتسعين اسماً مائة إلا واحداً من أحصاها دخل الجنة» — اضغط على أي اسم لمعرفة دلالته الشرعية'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {ALLAH_NAMES.map((n) => (
              <div
                key={n.id}
                onClick={() => setSelectedName(n)}
                className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-center cursor-pointer hover:border-[var(--gold)] hover:scale-105 transition-all group"
              >
                <span className="text-[10px] font-mono font-bold text-[var(--gold)] block mb-1">
                  #{n.id}
                </span>
                <h3 className="text-xl font-black font-quran text-[var(--text-main)] group-hover:text-[var(--gold)] transition-colors">
                  {n.arabic}
                </h3>
                <span className="text-[11px] text-[var(--text-muted)] block font-mono mt-0.5">
                  {n.transliteration}
                </span>
              </div>
            ))}
          </div>

          {/* Name Detail Modal */}
          {selectedName && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[var(--bg-card)] border border-[var(--border-gold)] rounded-3xl p-6 max-w-md w-full shadow-2xl relative text-center">
                <span className="text-xs font-mono font-bold text-[var(--gold)] bg-[var(--gold-light)] px-3 py-1 rounded-full">
                  الاسم رقم {selectedName.id}
                </span>
                <h2 className="text-4xl font-black font-quran text-[var(--gold)] my-3">
                  {selectedName.arabic}
                </h2>
                <span className="text-sm font-mono text-[var(--text-muted)] block mb-4">
                  {selectedName.transliteration}
                </span>

                <div className="bg-[var(--bg-card-subtle)] p-4 rounded-2xl border border-[var(--border-color)] text-right mb-4">
                  <h4 className="text-xs font-bold text-[var(--text-main)] mb-1">
                    المعنى والدلالة الإيمانية:
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed font-tajawal">
                    {selectedName.meaningAr}
                  </p>
                </div>

                <div className="bg-[var(--primary-light)] p-3 rounded-xl border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-quran mb-5">
                  {selectedName.quranicEvidenceAr}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onOpenShareCard({
                        title: 'اسم من أسماء الله الحسنى',
                        text: `${selectedName.arabic}\n\n${selectedName.meaningAr}`,
                        source: selectedName.quranicEvidenceAr,
                        category: 'dhikr'
                      });
                      setSelectedName(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[var(--gold)] text-white text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>مشاركة كبطاقة</span>
                  </button>
                  <button
                    onClick={() => setSelectedName(null)}
                    className="px-4 py-2.5 rounded-xl bg-[var(--bg-card-subtle)] text-[var(--text-main)] text-xs font-bold border border-[var(--border-color)]"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* 5. Seerah & Stories of the Prophets Tab */}
      {activeTab === 'stories' && (

        <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm space-y-6">
          <div className="pb-4 border-b border-[var(--border-color)]">
            <h2 className="text-xl font-black text-[var(--text-main)] font-cairo">
              {isEnglish ? 'Prophetic Seerah & Stories of the Prophets' : 'السيرة النبوية العطرة وقصص الأنبياء'}
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {isEnglish ? 'Authentic educational lessons drawn from the Quran and Sunnah' : 'دروس ومحطات خالدة وموثقة من حياة المرسلين وخاتم النبيين ﷺ'}
            </p>
          </div>

          <div className="space-y-4">
            {ISLAMIC_ARTICLES.map((art) => (
              <div
                key={art.id}
                className="p-6 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--primary)] bg-[var(--primary-light)] px-3 py-1 rounded-full">
                    {art.categoryAr}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">
                    المصدر: {art.referenceAr}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[var(--text-main)]">
                  {art.titleAr}
                </h3>

                <p className="text-xs text-[var(--text-muted)] font-tajawal leading-relaxed">
                  {art.summaryAr}
                </p>

                <div className="space-y-2 pt-2 border-t border-[var(--border-color)]">
                  {art.contentAr.map((para, idx) => (
                    <p key={idx} className="text-xs text-[var(--text-main)] font-tajawal leading-relaxed">
                      • {para}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. Hajj & Umrah Interactive Guide Tab */}
      {activeTab === 'hajj' && (
        <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm space-y-6">
          <div className="pb-4 border-b border-[var(--border-color)]">
            <h2 className="text-xl font-black text-[var(--text-main)] font-cairo">
              {isEnglish ? 'Hajj & Umrah Step-by-Step Guide' : 'دليل مناسك العمرة خطوة بخطوة'}
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {isEnglish ? 'Complete illustrated procedural guide with authentic Duas and Sunan' : 'دليل عملي ميسر وموثق لكل مرحلة من مراحل النسك من الميقات حتى التحلل'}
            </p>
          </div>

          <div className="space-y-4">
            {HAJJ_UMRAH_STEPS.map((step) => (
              <div
                key={step.id}
                className="p-5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--gold)] text-white font-black text-sm flex items-center justify-center font-mono">
                    {step.order}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[var(--text-main)]">
                      {step.titleAr}
                    </h3>
                    <span className="text-xs text-[var(--text-muted)] font-mono">{step.titleEn}</span>
                  </div>
                </div>

                <p className="text-xs text-[var(--text-main)] font-tajawal leading-relaxed">
                  {step.descriptionAr}
                </p>

                {step.duaAr && (
                  <div className="p-3 rounded-xl bg-[var(--gold-light)]/40 border border-[var(--border-gold)] text-xs text-[var(--gold)] font-quran leading-loose">
                    <strong>الدعاء المأثور:</strong> {step.duaAr}
                  </div>
                )}

                <div className="text-[11px] text-[var(--text-muted)]">
                  <strong>السنن المستحبة:</strong> {step.sunanAr.join(' • ')}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. Islamic Quiz Tab */}
      {activeTab === 'quiz' && (
        <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm space-y-6">
          <div className="pb-4 border-b border-[var(--border-color)] flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-[var(--text-main)] font-cairo">
                {isEnglish ? 'Authentic Islamic Knowledge Quiz' : 'المسابقة الثقافية الإسلامية'}
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {isEnglish ? 'Test your Islamic knowledge with verified references' : 'اختبر معلوماتك الدينية بأسئلة دقيقة مستندة إلى القرآن الكريم وصحيح السنة'}
              </p>
            </div>
            <div className="text-xs font-mono font-bold bg-[var(--primary-light)] text-[var(--primary)] px-3 py-1.5 rounded-full">
              السؤال {currentQuizIndex + 1} / {QUIZ_QUESTIONS.length}
            </div>
          </div>

          {!isQuizCompleted ? (
            <div className="max-w-xl mx-auto space-y-5">
              <h3 className="text-lg font-bold text-[var(--text-main)] text-center my-4 font-cairo">
                {QUIZ_QUESTIONS[currentQuizIndex].questionAr}
              </h3>

              <div className="space-y-2.5">
                {QUIZ_QUESTIONS[currentQuizIndex].optionsAr.map((opt, idx) => {
                  let btnStyle = 'bg-[var(--bg-card-subtle)] border-[var(--border-color)] text-[var(--text-main)] hover:border-[var(--gold)]';
                  if (isAnswered) {
                    if (idx === QUIZ_QUESTIONS[currentQuizIndex].correctIndex) {
                      btnStyle = 'bg-emerald-600 text-white border-emerald-700 shadow-md';
                    } else if (idx === selectedOption) {
                      btnStyle = 'bg-red-500 text-white border-red-600';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectQuizOption(idx)}
                      disabled={isAnswered}
                      className={`w-full p-4 rounded-xl border text-right text-xs font-bold transition-all ${btnStyle}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Explanation After Answering */}
              {isAnswered && (
                <div className="p-4 rounded-xl bg-[var(--primary-light)] border border-[var(--border-color)] space-y-2 text-xs text-[var(--text-primary)]">
                  <p className="font-tajawal leading-relaxed">
                    <strong>الشرح:</strong> {QUIZ_QUESTIONS[currentQuizIndex].explanationAr}
                  </p>
                  <span className="text-[11px] text-[var(--text-muted)] block">
                    المصدر: {QUIZ_QUESTIONS[currentQuizIndex].sourceAr}
                  </span>
                </div>
              )}

              {isAnswered && (
                <button
                  onClick={handleNextQuizQuestion}
                  className="w-full py-3 rounded-xl bg-[var(--primary)] text-white text-xs font-bold shadow-md hover:opacity-90"
                >
                  {currentQuizIndex + 1 < QUIZ_QUESTIONS.length ? 'السؤال التالي' : 'عرض النتيجة النهائية'}
                </button>
              )}
            </div>
          ) : (
            /* Quiz Completion Screen */
            <div className="text-center py-10 space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-[var(--gold-light)] text-[var(--gold)] flex items-center justify-center mx-auto shadow-md">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black font-cairo text-[var(--text-main)]">
                اكتملت المسابقة بنجاح!
              </h3>
              <p className="text-sm text-[var(--text-muted)]">
                نتيجتك: <strong className="text-[var(--text-primary)] text-lg">{score}</strong> من أصل <strong className="text-lg">{QUIZ_QUESTIONS.length}</strong>
              </p>
              <button
                onClick={handleRestartQuiz}
                className="px-6 py-2.5 rounded-xl bg-[var(--primary)] text-white text-xs font-bold shadow-md"
              >
                إعادة المحاولة
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
};
