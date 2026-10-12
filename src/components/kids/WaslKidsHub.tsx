'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Award, 
  CheckCircle2, 
  Heart, 
  HelpCircle, 
  ShieldCheck, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  Star,
  Lock,
  Unlock,
  Smile,
  ArrowRight,
  Trophy,
  Clock,
  Lightbulb,
  Check,
  X,
  Sunrise,
  Apple,
  Moon,
  Home,
  HeartHandshake,
  Droplets
} from 'lucide-react';
import {
  IconKidsLearning,
  IconAblution,
  IconPrayerMihrab,
  IconDuaHands
} from '../icons';
import { 
  KIDS_PROPHET_STORIES, 
  WUDU_STEPS, 
  SALAH_FIVE_PRAYERS, 
  KIDS_DAILY_ADHKAR, 
  KIDS_QUIZ_QUESTIONS, 
  KidsStory 
} from '../../data/kidsData';
import { localStore } from '../../lib/supabase';

type KidsSection = 'stories' | 'wudu' | 'salah' | 'adhkar' | 'quiz';

interface WaslKidsHubProps {
  isEnglish: boolean;
  onOpenQuran?: () => void;
}

const renderWuduStepIcon = (iconType: string) => {
  switch (iconType) {
    case 'intention':
      return <HeartHandshake className="w-10 h-10 text-blue-600 dark:text-blue-400" />;
    case 'hands':
      return <IconAblution className="w-10 h-10 text-blue-600 dark:text-blue-400" />;
    case 'mouth-nose':
      return <Droplets className="w-10 h-10 text-blue-600 dark:text-blue-400" />;
    case 'face':
      return <Sparkles className="w-10 h-10 text-blue-600 dark:text-blue-400" />;
    case 'arms':
      return <IconAblution className="w-10 h-10 text-blue-600 dark:text-blue-400" />;
    case 'head-ears':
      return <Sparkles className="w-10 h-10 text-blue-600 dark:text-blue-400" />;
    case 'feet':
      return <IconAblution className="w-10 h-10 text-blue-600 dark:text-blue-400" />;
    case 'dua':
      return <IconDuaHands className="w-10 h-10 text-amber-500" />;
    default:
      return <IconAblution className="w-10 h-10 text-blue-600 dark:text-blue-400" />;
  }
};

const renderKidsDhikrIcon = (iconType: string) => {
  switch (iconType) {
    case 'morning':
      return <Sunrise className="w-6 h-6 text-amber-500" />;
    case 'meal':
      return <Apple className="w-6 h-6 text-emerald-500" />;
    case 'gratitude':
      return <Sparkles className="w-6 h-6 text-amber-500" />;
    case 'night':
      return <Moon className="w-6 h-6 text-indigo-400" />;
    case 'home':
      return <Home className="w-6 h-6 text-teal-500" />;
    case 'manners':
      return <HeartHandshake className="w-6 h-6 text-rose-500" />;
    default:
      return <IconDuaHands className="w-6 h-6 text-teal-500" />;
  }
};

export const WaslKidsHub: React.FC<WaslKidsHubProps> = ({
  isEnglish,
  onOpenQuran
}) => {
  const [currentSection, setCurrentSection] = useState<KidsSection>('stories');
  
  // Stories state
  const [selectedStory, setSelectedStory] = useState<KidsStory | null>(null);

  // Wudu step state
  const [currentWuduStep, setCurrentWuduStep] = useState(0);

  // Quiz state
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Parental Control state
  const [isParentModalOpen, setIsParentModalOpen] = useState(false);
  const [parentMathChallenge, setParentMathChallenge] = useState({ a: 6, b: 7, answer: 42 });
  const [parentInput, setParentInput] = useState('');
  const [isParentUnlocked, setIsParentUnlocked] = useState(false);
  const [parentErrorMessage, setParentErrorMessage] = useState('');

  // Child progress badges
  const [completedStories, setCompletedStories] = useState<string[]>(() => {
    return localStore.get<string[]>('wasl_kids_stories_done', []);
  });
  const [starsCount, setStarsCount] = useState<number>(() => {
    return localStore.get<number>('wasl_kids_stars', 5);
  });

  const openParentControls = () => {
    // Generate new random multiplication challenge for parents
    const a = Math.floor(Math.random() * 6) + 4; // 4 to 9
    const b = Math.floor(Math.random() * 6) + 4; // 4 to 9
    setParentMathChallenge({ a, b, answer: a * b });
    setParentInput('');
    setIsParentUnlocked(false);
    setParentErrorMessage('');
    setIsParentModalOpen(true);
  };

  const handleVerifyParent = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(parentInput.trim()) === parentMathChallenge.answer) {
      setIsParentUnlocked(true);
      setParentErrorMessage('');
    } else {
      setParentErrorMessage(isEnglish ? 'Incorrect answer. Please try again.' : 'إجابة غير صحيحة، يرجى إعادة المحاولة.');
    }
  };

  const handleCompleteStory = (storyId: string) => {
    if (!completedStories.includes(storyId)) {
      const updated = [...completedStories, storyId];
      setCompletedStories(updated);
      localStore.set('wasl_kids_stories_done', updated);
      const newStars = starsCount + 3;
      setStarsCount(newStars);
      localStore.set('wasl_kids_stars', newStars);
    }
  };

  const handleQuizAnswer = (optionIdx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(optionIdx);
    setIsAnswerSubmitted(true);
    const curQ = KIDS_QUIZ_QUESTIONS[quizQuestionIndex];
    if (optionIdx === curQ.correctIndex) {
      setQuizScore(prev => prev + 1);
      const newStars = starsCount + 2;
      setStarsCount(newStars);
      localStore.set('wasl_kids_stars', newStars);
    }
  };

  const handleNextQuizQuestion = () => {
    if (quizQuestionIndex + 1 < KIDS_QUIZ_QUESTIONS.length) {
      setQuizQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleResetQuiz = () => {
    setQuizQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setQuizScore(0);
    setQuizCompleted(false);
  };

  const handleResetAllChildData = () => {
    setCompletedStories([]);
    setStarsCount(0);
    localStore.set('wasl_kids_stories_done', []);
    localStore.set('wasl_kids_stars', 0);
    setIsParentModalOpen(false);
    alert(isEnglish ? 'Learning progress reset successfully.' : 'تمت إعادة ضبط سجل تعلم الطفل بنجاح.');
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Playful Header Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-500 text-white p-6 sm:p-8 shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-inner shrink-0 text-amber-200">
              <IconKidsLearning className="w-9 h-9" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-amber-200 text-xs font-bold mb-2 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>عالم وصل للأبطال الصغار</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-cairo">
                {isEnglish ? 'Wasl Kids Academy' : 'عالم وَصْل للصغار'}
              </h1>
              <p className="text-emerald-100 text-xs sm:text-sm mt-1 font-tajawal max-w-xl">
                {isEnglish
                  ? 'A joyful, authentic Islamic learning journey with prophetic stories, wudu guide, daily prayers, and interactive quizzes.'
                  : 'رحلة إيمانية ممتعة وموثوقة لتعليم أبنائنا قصص الأنبياء، وسنة الوضوء والصلاة، والأذكار والآداب الرفيعة.'}
              </p>
            </div>
          </div>

          {/* Stars & Parent Gate Pill */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-300 fill-amber-300 animate-pulse" />
              <div className="text-right">
                <span className="text-[10px] text-emerald-100 block">نجومي الذهبية</span>
                <span className="text-lg font-black font-mono text-amber-300">{starsCount}</span>
              </div>
            </div>

            <button
              onClick={openParentControls}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold transition-all flex items-center gap-1.5"
              title="بوابة ولي الأمر"
            >
              <Lock className="w-4 h-4 text-amber-200" />
              <span className="hidden sm:inline">إشراف الوالدين</span>
            </button>
          </div>
        </div>
      </section>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'stories' as KidsSection, label: 'قصص الأنبياء', icon: <BookOpen className="w-4 h-4 shrink-0" />, color: 'from-amber-500 to-amber-600' },
          { id: 'wudu' as KidsSection, label: 'تعلم الوضوء', icon: <IconAblution className="w-4 h-4 shrink-0" />, color: 'from-blue-500 to-blue-600' },
          { id: 'salah' as KidsSection, label: 'تعلم الصلاة', icon: <IconPrayerMihrab className="w-4 h-4 shrink-0" />, color: 'from-emerald-500 to-emerald-600' },
          { id: 'adhkar' as KidsSection, label: 'أذكاري اليومية', icon: <IconDuaHands className="w-4 h-4 shrink-0" />, color: 'from-teal-500 to-teal-600' },
          { id: 'quiz' as KidsSection, label: 'مسابقة الأبطال', icon: <Trophy className="w-4 h-4 shrink-0" />, color: 'from-purple-500 to-purple-600' },
        ].map(tab => {
          const active = currentSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setCurrentSection(tab.id);
                setSelectedStory(null);
              }}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
                active
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-md scale-102`
                  : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-color)] hover:text-[var(--text-main)]'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: قصص الأنبياء */}
      {currentSection === 'stories' && (
        <div className="space-y-6">
          {selectedStory ? (
            /* Selected Story Reader */
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm animate-fade-in">
              <button
                onClick={() => setSelectedStory(null)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-card-subtle)] text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                <ArrowRight className="w-4 h-4" />
                <span>العودة لجميع القصص</span>
              </button>

              <div className="pb-4 border-b border-[var(--border-color)]">
                <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold mb-2">
                  قصة {selectedStory.prophet}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-main)] font-cairo">
                  {selectedStory.title}
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  مدة القراءة الممتعة: ~{selectedStory.readingMinutes} دقائق • مصادر موثوقة ومراجعة
                </p>
              </div>

              {/* Story Paragraphs */}
              <div className="space-y-4">
                {selectedStory.content.map((p, idx) => (
                  <p 
                    key={idx} 
                    className="text-base sm:text-lg leading-relaxed text-[var(--text-main)] font-tajawal bg-[var(--bg-card-subtle)] p-4 sm:p-5 rounded-2xl border border-[var(--border-color)]/60"
                  >
                    {p}
                  </p>
                ))}
              </div>

              {/* Key Lessons */}
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                <h4 className="text-xs font-bold text-emerald-700 flex items-center gap-2">
                  <Star className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                  <span>ماذا نتعلم من هذه القصة المباركة؟</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-[var(--text-main)]">
                  {selectedStory.lessons.map((lesson, lIdx) => (
                    <li key={lIdx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{lesson}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Attribution */}
              <div className="text-[11px] text-[var(--text-muted)] border-t border-[var(--border-color)] pt-3">
                المصدر المعتمد: {selectedStory.verifiedSource}
              </div>

              {/* Finish Button */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    handleCompleteStory(selectedStory.id);
                    setSelectedStory(null);
                  }}
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all"
                >
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>أتممت قراءة القصة واكتسبت 3 نجوم!</span>
                  <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                </button>
              </div>
            </div>
          ) : (
            /* Story Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {KIDS_PROPHET_STORIES.map(story => {
                const isDone = completedStories.includes(story.id);
                return (
                  <div
                    key={story.id}
                    onClick={() => setSelectedStory(story)}
                    className="group cursor-pointer p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold">
                          {story.prophet}
                        </span>
                        {isDone && (
                          <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>مكتملة</span>
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-[var(--text-main)] group-hover:text-amber-600 transition-colors font-cairo">
                        {story.title}
                      </h3>
                      <p className="text-xs text-[var(--text-muted)] mt-2 line-clamp-2 leading-relaxed">
                        {story.summary}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-[var(--border-color)] flex items-center justify-between text-xs">
                      <span className="text-[var(--text-muted)] inline-flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>~{story.readingMinutes} دقائق</span>
                      </span>
                      <span className="text-amber-600 font-bold flex items-center gap-1 group-hover:-translate-x-1 transition-transform">
                        <span>اقرأ القصة</span>
                        <ChevronLeft className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: تعليم الوضوء خطوة بخطوة */}
      {currentSection === 'wudu' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[var(--text-main)] font-cairo flex items-center gap-2.5">
                <IconAblution className="w-6 h-6 text-blue-500 shrink-0" />
                <span>تعليم صفة الوضوء خطوة بخطوة</span>
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                تعلّم كيف كان يتوضأ نبينا الكريم ﷺ بطريقة مبسطة مع الأدعية النبوية المباركة
              </p>
            </div>
            <span className="text-xs font-bold font-mono px-3 py-1 rounded-full bg-blue-500/10 text-blue-600">
              الخطوة {currentWuduStep + 1} من {WUDU_STEPS.length}
            </span>
          </div>

          {/* Active Step Card */}
          {(() => {
            const step = WUDU_STEPS[currentWuduStep];
            return (
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[var(--bg-card-subtle)] to-blue-500/5 border border-blue-500/20 text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-inner">
                  {renderWuduStepIcon(step.icon)}
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-blue-600">الخطوة {step.stepNumber}</span>
                  <h3 className="text-2xl font-black text-[var(--text-main)] font-cairo">
                    {step.title}
                  </h3>
                </div>

                <p className="text-base sm:text-lg text-[var(--text-main)] font-tajawal max-w-lg mx-auto leading-relaxed">
                  {step.description}
                </p>

                {step.dhikr && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 max-w-lg mx-auto text-amber-800 dark:text-amber-200 text-sm font-amiri leading-relaxed font-bold">
                    {step.dhikr}
                  </div>
                )}

                <div className="text-xs text-[var(--text-muted)] bg-[var(--bg-card)] px-4 py-2 rounded-xl inline-flex items-center gap-1.5 border border-[var(--border-color)]">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>{step.sunnahTip}</span>
                </div>
              </div>
            );
          })()}

          {/* Stepper Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              disabled={currentWuduStep === 0}
              onClick={() => setCurrentWuduStep(prev => Math.max(0, prev - 1))}
              className="px-5 py-2.5 rounded-xl bg-[var(--bg-card-subtle)] text-xs font-bold text-[var(--text-main)] disabled:opacity-40 disabled:cursor-not-allowed border border-[var(--border-color)] flex items-center gap-2"
            >
              <ChevronRight className="w-4 h-4" />
              <span>الخطوة السابقة</span>
            </button>

            {/* Steps indicator dots */}
            <div className="flex items-center gap-1.5">
              {WUDU_STEPS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentWuduStep(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx === currentWuduStep ? 'w-6 bg-blue-600' : 'bg-[var(--border-color)]'
                  }`}
                />
              ))}
            </div>

            <button
              disabled={currentWuduStep === WUDU_STEPS.length - 1}
              onClick={() => setCurrentWuduStep(prev => Math.min(WUDU_STEPS.length - 1, prev + 1))}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
            >
              <span>الخطوة التالية</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SECTION 3: تعلم الصلاة */}
      {currentSection === 'salah' && (
        <div className="space-y-6">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-main)] font-cairo flex items-center gap-2.5 mb-2">
              <IconPrayerMihrab className="w-6 h-6 text-emerald-600 shrink-0" />
              <span>الصلوات الخمس المفروضة</span>
            </h2>
            <p className="text-xs text-[var(--text-muted)] mb-6">
              الصلاة هي الركن الثاني من أركان الإسلام، وهي صلة المسلم بربه الكريم خمس مرات في اليوم والليلة.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SALAH_FIVE_PRAYERS.map((p, idx) => (
                <div 
                  key={idx} 
                  className="p-5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-[var(--text-main)] font-cairo">
                      {p.name}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-black font-mono">
                      {p.rakahs} ركعات
                    </span>
                  </div>
                  <div className="text-xs text-[var(--text-muted)] leading-relaxed">
                    <strong className="text-[var(--text-main)]">الوقت:</strong> {p.time}
                  </div>
                  <div className="text-[11px] text-[var(--gold)] font-bold">
                    الصفة: {p.type}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: أذكاري اليومية */}
      {currentSection === 'adhkar' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {KIDS_DAILY_ADHKAR.map(item => (
            <div 
              key={item.id}
              className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-3 shadow-sm hover:border-teal-400 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[var(--primary-light)] border border-[var(--border-color)] flex items-center justify-center shrink-0 shadow-sm">
                  {renderKidsDhikrIcon(item.icon)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-main)] font-cairo">
                    {item.situation}
                  </h3>
                  <span className="text-[11px] text-[var(--text-muted)]">{item.benefit}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]/60 text-right">
                <p className="text-base sm:text-lg font-amiri font-bold text-[var(--text-main)] leading-loose">
                  {item.arabicText}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECTION 5: مسابقة الأبطال */}
      {currentSection === 'quiz' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 shadow-sm">
          {quizCompleted ? (
            <div className="text-center py-8 space-y-4 animate-scale-up">
              <div className="w-24 h-24 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-inner">
                <Trophy className="w-12 h-12 text-amber-500" />
              </div>
              <h2 className="text-2xl font-black text-[var(--text-main)] font-cairo">
                أحسنت يا بطل! أنهيت المسابقة بنجاح!
              </h2>
              <p className="text-sm text-[var(--text-muted)] font-tajawal">
                لقد أجبت بشكل صحيح على {quizScore} من {KIDS_QUIZ_QUESTIONS.length} أسئلة مباركة.
              </p>
              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={handleResetQuiz}
                  className="px-6 py-3 rounded-2xl bg-[var(--primary)] text-white text-xs font-bold shadow-md hover:bg-[var(--primary-dark)] transition-all flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>إعادة المسابقة</span>
                </button>
              </div>
            </div>
          ) : (
            (() => {
              const curQ = KIDS_QUIZ_QUESTIONS[quizQuestionIndex];
              return (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
                    <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 text-xs font-bold">
                      {curQ.category}
                    </span>
                    <span className="text-xs font-mono font-bold text-[var(--text-muted)]">
                      السؤال {quizQuestionIndex + 1} من {KIDS_QUIZ_QUESTIONS.length}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-main)] font-cairo leading-relaxed">
                    {curQ.question}
                  </h3>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {curQ.options.map((opt, optIdx) => {
                      let btnStyle = 'bg-[var(--bg-card-subtle)] border-[var(--border-color)] text-[var(--text-main)]';
                      if (isAnswerSubmitted) {
                        if (optIdx === curQ.correctIndex) {
                          btnStyle = 'bg-emerald-600 text-white border-emerald-600';
                        } else if (selectedOption === optIdx) {
                          btnStyle = 'bg-red-500 text-white border-red-500';
                        }
                      }
                      return (
                        <button
                          key={optIdx}
                          disabled={isAnswerSubmitted}
                          onClick={() => handleQuizAnswer(optIdx)}
                          className={`p-4 rounded-2xl border text-sm font-bold text-right transition-all flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {isAnswerSubmitted && optIdx === curQ.correctIndex && (
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation after answer */}
                  {isAnswerSubmitted && (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2 animate-fade-in">
                      <div className="text-xs font-bold text-emerald-700">
                        {selectedOption === curQ.correctIndex ? (
                          <span className="inline-flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>إجابة صحيحة وممتازة!</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
                            <Lightbulb className="w-4 h-4 text-amber-500" />
                            <span>معلومة مفيدة:</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--text-main)] leading-relaxed">
                        {curQ.explanation}
                      </p>
                    </div>
                  )}

                  {/* Next Question Button */}
                  {isAnswerSubmitted && (
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={handleNextQuizQuestion}
                        className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
                      >
                        <span>{quizQuestionIndex + 1 < KIDS_QUIZ_QUESTIONS.length ? 'السؤال التالي' : 'عرض النتيجة النهائية'}</span>
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })()
          )}
        </div>
      )}

      {/* PARENTAL CONTROLS MODAL (PIN / MATH GATE) */}
      {isParentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-[var(--text-main)] font-cairo">
                  بوابة ولي الأمر (Parental Gate)
                </h3>
              </div>
              <button
                onClick={() => setIsParentModalOpen(false)}
                className="p-1.5 rounded-lg text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!isParentUnlocked ? (
              <form onSubmit={handleVerifyParent} className="space-y-4">
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  لحماية الأطفال، يُرجى حل المسألة الحسابية التالية لتأكيد أنك ولي الأمر:
                </p>

                <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-center">
                  <span className="text-xl font-black font-mono text-[var(--text-main)]">
                    {parentMathChallenge.a} × {parentMathChallenge.b} = ؟
                  </span>
                </div>

                <div>
                  <input
                    type="number"
                    value={parentInput}
                    onChange={e => setParentInput(e.target.value)}
                    placeholder="اكتب الناتج هنا"
                    autoFocus
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-main)] text-sm font-bold font-mono text-center focus:outline-none focus:border-emerald-600"
                  />
                  {parentErrorMessage && (
                    <p className="text-[11px] text-red-500 mt-1.5 text-center font-bold">
                      {parentErrorMessage}
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsParentModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--text-muted)]"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
                  >
                    دخول
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 font-bold flex items-center gap-2">
                  <Unlock className="w-4 h-4" />
                  <span>تم تأكيد هوية ولي الأمر بنجاح.</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-2 border-b border-[var(--border-color)]">
                    <span className="text-[var(--text-muted)]">القصص المكتملة:</span>
                    <span className="font-bold text-[var(--text-main)]">{completedStories.length} قصص</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[var(--border-color)]">
                    <span className="text-[var(--text-muted)]">إجمالي النجوم المكتسبة:</span>
                    <span className="font-bold text-amber-500 inline-flex items-center gap-1">
                      <span>{starsCount} نجمة</span>
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[var(--border-color)]">
                    <span className="text-[var(--text-muted)]">حماية الخصوصية:</span>
                    <span className="font-bold text-emerald-600">نشطة (بدون إعلانات أو تتبع)</span>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    onClick={handleResetAllChildData}
                    className="w-full py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 font-bold text-xs hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>إعادة ضبط تقدم الطفل بالكامل</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
