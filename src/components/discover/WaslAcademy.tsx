'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Compass, 
  Heart, 
  Bookmark, 
  Clock, 
  Layers, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Share2, 
  Award, 
  ArrowRight, 
  Search,
  HelpCircle,
  ShieldCheck,
  Check,
  RotateCcw
} from 'lucide-react';
import { 
  ACADEMY_TRACKS, 
  ACADEMY_LESSONS, 
  AcademyTrack, 
  AcademyLesson,
  LessonSection
} from '../../data/academyData';
import { localStore, supabase } from '../../lib/supabase';
import { saveItemToLibrary, isItemSaved, removeItemFromLibrary } from '../../utils/libraryManager';
import { recordGoalProgress } from '../../utils/dailyWorshipManager';

interface WaslAcademyProps {
  isEnglish?: boolean;
  onOpenShareCard?: (content: any) => void;
}

export const WaslAcademy: React.FC<WaslAcademyProps> = ({ 
  isEnglish = false,
  onOpenShareCard 
}) => {
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Completed lessons tracked by id
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(() => 
    localStore.get<string[]>('academy_completed_lessons', [])
  );

  // Quiz state for active lesson: { [questionIndex]: selectedOptionIndex }
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Sync completed lessons to localStore
  useEffect(() => {
    localStore.set('academy_completed_lessons', completedLessonIds);
  }, [completedLessonIds]);

  const activeTrack = ACADEMY_TRACKS.find(t => t.id === selectedTrackId);
  const activeLesson = ACADEMY_LESSONS.find(l => l.id === selectedLessonId);

  const isCompleted = (lessonId: string) => completedLessonIds.includes(lessonId);

  const handleToggleComplete = async (lessonId: string) => {
    let nextList: string[];
    if (completedLessonIds.includes(lessonId)) {
      nextList = completedLessonIds.filter(id => id !== lessonId);
    } else {
      nextList = [...completedLessonIds, lessonId];
      // Record progress towards daily worship activity
      recordGoalProgress('academy_lesson', 1);

      // Cloud sync if authenticated
      if (supabase) {
        try {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user && activeLesson) {
            await supabase.from('user_academy_progress').upsert({
              user_id: data.session.user.id,
              track_id: activeLesson.trackId,
              lesson_id: activeLesson.id,
              completed: true,
              completed_at: new Date().toISOString()
            });
          }
        } catch {
          // Silent local fallback
        }
      }
    }
    setCompletedLessonIds(nextList);
  };

  const handleBookmarkLesson = (lesson: AcademyLesson) => {
    const isSaved = isItemSaved(lesson.id);
    if (isSaved) {
      removeItemFromLibrary(lesson.id);
    } else {
      saveItemToLibrary({
        id: lesson.id,
        type: 'lesson',
        titleAr: lesson.titleAr,
        titleEn: lesson.titleEn,
        contentAr: lesson.summaryAr,
        categoryAr: 'دروس أكاديمية وصل',
        sourceAttribution: lesson.sourceAttribution,
      });
    }
    // Force re-render of bookmark button
    setSelectedLessonId(lesson.id);
  };

  const getTrackProgress = (trackId: string) => {
    const trackLessons = ACADEMY_LESSONS.filter(l => l.trackId === trackId);
    if (trackLessons.length === 0) return 0;
    const completedCount = trackLessons.filter(l => completedLessonIds.includes(l.id)).length;
    return Math.round((completedCount / trackLessons.length) * 100);
  };

  // Filtered tracks or lessons when searching
  const filteredLessons = searchQuery.trim()
    ? ACADEMY_LESSONS.filter(l => 
        l.titleAr.includes(searchQuery.trim()) || 
        l.summaryAr.includes(searchQuery.trim())
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Academy Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[var(--bg-card)] border border-[var(--border-gold)] p-6 sm:p-8 shadow-sm transition-all">
        {/* Soft decorative background glows */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-gradient-to-br from-[var(--primary)]/10 via-[var(--gold)]/8 to-transparent rounded-full blur-3xl pointer-events-none -translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-tl from-[var(--gold)]/10 via-[var(--primary)]/5 to-transparent rounded-full blur-2xl pointer-events-none translate-x-1/4 translate-y-1/4" />

        {/* Decorative background watermark */}
        <div className="absolute -left-4 -bottom-4 text-[var(--primary)] opacity-[0.05] dark:opacity-[0.08] pointer-events-none select-none">
          <Award className="w-52 h-52 -rotate-12" />
        </div>

        <div className="relative z-10 max-w-2xl space-y-3.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--gold-light)] border border-[var(--border-gold)] text-[var(--gold-hover)] dark:text-[var(--gold)] text-xs font-bold shadow-xs">
            <Award className="w-3.5 h-3.5 text-[var(--gold)]" />
            <span>{isEnglish ? 'Wasl Islamic Academy' : 'أكاديمية وَصْل الإسلامية الميسرة'}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-amiri text-[var(--text-main)] leading-tight">
            {isEnglish ? 'Structured Islamic Education with Verified Sources' : 'مسارات تعليمية مؤصلة بالدليل من الكتاب والسنة'}
          </h2>

          <p className="text-xs sm:text-sm text-[var(--text-muted)] font-tajawal leading-relaxed">
            {isEnglish 
              ? 'Organized tracks covering Faith, Prayer, Prophetic Seerah, Quran Reflection, and New Muslim essentials.' 
              : 'تعلّم دينك بوعي وسهولة عبر مسارات منهجية واضحة تدرج بك في الفقه والعقيدة والسيرة النبوية.'}
          </p>

          {/* Search Bar within Academy */}
          <div className="relative pt-2 max-w-md">
            <Search className="absolute right-3.5 top-5 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (selectedLessonId) setSelectedLessonId(null);
              }}
              placeholder={isEnglish ? 'Search lessons and topics...' : 'ابحث في الدروس والموضوعات...'}
              className="w-full pr-10 pl-4 py-2.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-main)] placeholder-[var(--text-muted)] text-xs focus:outline-none focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* VIEW 1: SEARCH RESULTS */}
      {searchQuery.trim() && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--text-main)]">
              {isEnglish ? `Search results (${filteredLessons.length})` : `نتائج البحث (${filteredLessons.length})`}
            </h3>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-[var(--gold)] hover:underline"
            >
              {isEnglish ? 'Clear search' : 'مسح البحث'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredLessons.map((lesson) => (
              <div
                key={lesson.id}
                onClick={() => {
                  setSelectedTrackId(lesson.trackId);
                  setSelectedLessonId(lesson.id);
                  setSearchQuery('');
                  setQuizAnswers({});
                  setQuizSubmitted(false);
                }}
                className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--gold)] transition-all cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span className="font-bold text-[var(--gold)]">{lesson.estimatedMinutes} دقائق قراءة</span>
                  {isCompleted(lesson.id) && (
                    <span className="flex items-center gap-1 text-emerald-600 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      مكتمل
                    </span>
                  )}
                </div>
                <h4 className="text-base font-bold font-amiri text-[var(--text-main)]">
                  {isEnglish ? lesson.titleEn : lesson.titleAr}
                </h4>
                <p className="text-xs text-[var(--text-muted)] line-clamp-2">
                  {lesson.summaryAr}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: ACTIVE LESSON READER */}
      {!searchQuery.trim() && activeLesson && (
        <div className="space-y-6">
          {/* Reader Top Bar */}
          <div className="flex items-center justify-between bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 shadow-sm">
            <button
              onClick={() => {
                setSelectedLessonId(null);
                setQuizAnswers({});
                setQuizSubmitted(false);
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span>{isEnglish ? 'Back to Track' : 'العودة للمسار'}</span>
            </button>

            <div className="flex items-center gap-2">
              {/* Bookmark Button */}
              <button
                onClick={() => handleBookmarkLesson(activeLesson)}
                className={`p-2 rounded-xl border transition-colors ${
                  isItemSaved(activeLesson.id)
                    ? 'bg-[var(--gold-light)] text-[var(--gold)] border-[var(--border-gold)]'
                    : 'text-[var(--text-muted)] border-[var(--border-color)] hover:bg-[var(--bg-card-subtle)]'
                }`}
                title={isEnglish ? 'Save to Library' : 'حفظ في مكتبتي'}
              >
                <Bookmark className="w-4 h-4" />
              </button>

              {/* Share Button */}
              {onOpenShareCard && (
                <button
                  onClick={() => onOpenShareCard({
                    title: activeLesson.titleAr,
                    text: activeLesson.summaryAr,
                    source: activeLesson.sourceAttribution,
                    category: 'أكاديمية وصل'
                  })}
                  className="p-2 rounded-xl border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)] transition-colors"
                  title={isEnglish ? 'Share lesson' : 'مشاركة الدرس كبطاقة'}
                >
                  <Share2 className="w-4 h-4" />
                </button>
              )}

              {/* Mark Complete Button */}
              <button
                onClick={() => handleToggleComplete(activeLesson.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  isCompleted(activeLesson.id)
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                    : 'bg-[var(--primary-light)] text-[var(--text-primary)] border-[var(--border-color)] hover:border-[var(--gold)]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isCompleted(activeLesson.id) ? (isEnglish ? 'Completed' : 'أتممت الدرس') : (isEnglish ? 'Mark Complete' : 'تحديد كمكتمل')}</span>
              </button>
            </div>
          </div>

          {/* Lesson Main Content Card */}
          <article className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
            {/* Lesson Title Header */}
            <div className="space-y-3 border-b border-[var(--border-color)] pb-6">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--gold)]">
                <Clock className="w-3.5 h-3.5" />
                <span>{activeLesson.estimatedMinutes} {isEnglish ? 'minutes read' : 'دقائق قراءة ممتعة'}</span>
                <span>•</span>
                <span>{activeTrack?.titleAr}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-amiri text-[var(--text-main)] leading-relaxed">
                {isEnglish ? activeLesson.titleEn : activeLesson.titleAr}
              </h1>
              <p className="text-sm text-[var(--text-muted)] font-tajawal leading-relaxed">
                {activeLesson.summaryAr}
              </p>
            </div>

            {/* Structured Sections */}
            <div className="space-y-8">
              {activeLesson.sections.map((section, idx) => (
                <section key={idx} className="space-y-4">
                  <h3 className="text-lg sm:text-xl font-bold font-amiri text-[var(--gold)] border-r-4 border-[var(--gold)] pr-3">
                    {section.title}
                  </h3>

                  <p className="text-base text-[var(--text-main)] font-tajawal leading-loose text-justify">
                    {section.content}
                  </p>

                  {/* Quran Ayah Reference Callout */}
                  {section.quranReference && (
                    <div className="p-5 rounded-2xl bg-[var(--gold-light)]/40 border border-[var(--border-gold)]/60 space-y-2 text-center my-4">
                      <div className="text-xs font-bold text-[var(--gold)] tracking-wide">
                        قال الله تعالى في سورة {section.quranReference.surah} (آية {section.quranReference.ayahNumber}):
                      </div>
                      <div className="text-xl sm:text-2xl font-bold font-quran text-[var(--text-main)] leading-loose">
                        ﴿ {section.quranReference.text} ﴾
                      </div>
                    </div>
                  )}

                  {/* Hadith Reference Callout */}
                  {section.hadithReference && (
                    <div className="p-5 rounded-2xl bg-[var(--primary-light)]/40 border border-[var(--border-color)] space-y-2 my-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-primary)]">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>قال رسول الله ﷺ:</span>
                      </div>
                      <div className="text-base sm:text-lg font-amiri font-bold text-[var(--text-main)] leading-relaxed">
                        « {section.hadithReference.text} »
                      </div>
                      <div className="text-xs text-[var(--text-muted)] font-mono">
                        المصدر: {section.hadithReference.source}
                      </div>
                    </div>
                  )}
                </section>
              ))}
            </div>

            {/* Source Attribution Notice */}
            <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] flex items-start gap-3 text-xs text-[var(--text-muted)]">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[var(--text-main)]">مرجع ومصدر المحتوى: </span>
                {activeLesson.sourceAttribution}
              </div>
            </div>

            {/* Interactive Knowledge Check / Quiz */}
            {activeLesson.quiz && activeLesson.quiz.length > 0 && (
              <div className="pt-6 border-t border-[var(--border-color)] space-y-5">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-[var(--gold-light)] text-[var(--gold)]">
                    <HelpCircle className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold font-amiri text-[var(--text-main)]">
                      {isEnglish ? 'Knowledge Check' : 'اختبر استيعابك للمعلومات'}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)]">
                      {isEnglish ? 'Answer the questions to reinforce your learning' : 'أسئلة ميسرة لتثبيت الفوائد والتحقق من الفهم'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {activeLesson.quiz.map((q, qIndex) => {
                    const selected = quizAnswers[qIndex];
                    const isCorrect = selected === q.correctIndex;

                    return (
                      <div key={qIndex} className="p-5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-3">
                        <div className="text-sm font-bold text-[var(--text-main)]">
                          {qIndex + 1}. {q.question}
                        </div>

                        <div className="space-y-2">
                          {q.options.map((option, optIndex) => {
                            let optionClass = 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--gold)]';
                            if (quizSubmitted) {
                              if (optIndex === q.correctIndex) {
                                optionClass = 'bg-emerald-500/20 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold';
                              } else if (selected === optIndex) {
                                optionClass = 'bg-red-500/20 border-red-500 text-red-800 dark:text-red-300';
                              }
                            } else if (selected === optIndex) {
                              optionClass = 'bg-[var(--gold-light)] border-[var(--gold)] font-bold';
                            }

                            return (
                              <button
                                key={optIndex}
                                disabled={quizSubmitted}
                                onClick={() => setQuizAnswers(prev => ({ ...prev, [qIndex]: optIndex }))}
                                className={`w-full text-right p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between ${optionClass}`}
                              >
                                <span>{option}</span>
                                {quizSubmitted && optIndex === q.correctIndex && (
                                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {quizSubmitted && (
                          <div className={`p-3 rounded-xl text-xs font-tajawal ${
                            isCorrect ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-amber-500/10 text-amber-800 dark:text-amber-300'
                          }`}>
                            <span className="font-bold">{isCorrect ? 'إجابة صحيحة وموفقة!' : 'التوضيح والتصحيح:'} </span>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Submit / Reset Quiz button */}
                <div className="flex items-center gap-3">
                  {!quizSubmitted ? (
                    <button
                      onClick={() => setQuizSubmitted(true)}
                      disabled={Object.keys(quizAnswers).length < activeLesson.quiz.length}
                      className="px-5 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold disabled:opacity-40 shadow-sm transition-colors"
                    >
                      {isEnglish ? 'Submit Answers' : 'التحقق من الإجابات'}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setQuizAnswers({});
                        setQuizSubmitted(false);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--border-color)] text-xs font-bold text-[var(--text-muted)] hover:bg-[var(--bg-card-subtle)]"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{isEnglish ? 'Retry' : 'إعادة الاختبار'}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </article>
        </div>
      )}

      {/* VIEW 3: ACTIVE TRACK LESSONS LIST */}
      {!searchQuery.trim() && !activeLesson && activeTrack && (
        <div className="space-y-6">
          {/* Back to All Tracks Header */}
          <div className="flex items-center justify-between bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 shadow-sm">
            <button
              onClick={() => setSelectedTrackId(null)}
              className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span>{isEnglish ? 'All Tracks' : 'كافة المسارات التعليمية'}</span>
            </button>

            <div className="flex items-center gap-2 text-xs font-bold text-[var(--gold)]">
              <span>{getTrackProgress(activeTrack.id)}% مكتمل</span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold font-amiri text-[var(--text-main)]">
              {isEnglish ? activeTrack.titleEn : activeTrack.titleAr}
            </h3>
            <p className="text-xs text-[var(--text-muted)] font-tajawal max-w-2xl leading-relaxed">
              {activeTrack.descriptionAr}
            </p>
          </div>

          {/* Lessons List in this Track */}
          <div className="space-y-3">
            {ACADEMY_LESSONS.filter(l => l.trackId === activeTrack.id).map((lesson, idx) => {
              const done = isCompleted(lesson.id);

              return (
                <div
                  key={lesson.id}
                  onClick={() => {
                    setSelectedLessonId(lesson.id);
                    setQuizAnswers({});
                    setQuizSubmitted(false);
                  }}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    done
                      ? 'bg-[var(--primary-light)]/20 border-emerald-500/40 hover:border-emerald-500'
                      : 'bg-[var(--bg-card)] border-[var(--border-color)] hover:border-[var(--gold)] shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      done
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)] border border-[var(--border-color)]'
                    }`}>
                      {done ? <Check className="w-5 h-5" /> : idx + 1}
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-base font-bold font-amiri text-[var(--text-main)]">
                        {isEnglish ? lesson.titleEn : lesson.titleAr}
                      </h4>
                      <p className="text-xs text-[var(--text-muted)] line-clamp-1">
                        {lesson.summaryAr}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-[var(--gold)]">
                        <Clock className="w-3 h-3" />
                        <span>{lesson.estimatedMinutes} دقائق قراءة</span>
                      </div>
                    </div>
                  </div>

                  <ChevronLeft className="w-5 h-5 text-[var(--text-muted)] shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 4: ALL TRACKS OVERVIEW (DEFAULT) */}
      {!searchQuery.trim() && !activeLesson && !activeTrack && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ACADEMY_TRACKS.map((track) => {
            const progress = getTrackProgress(track.id);

            return (
              <div
                key={track.id}
                onClick={() => setSelectedTrackId(track.id)}
                className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--gold)] transition-all cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-xl bg-[var(--gold-light)] border border-[var(--border-gold)]/40 text-[var(--gold)] text-[10px] font-bold">
                      {track.levelAr}
                    </span>
                    <span className="text-xs font-semibold text-[var(--text-muted)]">
                      {track.lessonsCount} {isEnglish ? 'lessons' : 'دروس مؤصلة'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold font-amiri text-[var(--text-main)] group-hover:text-[var(--gold)] transition-colors">
                    {isEnglish ? track.titleEn : track.titleAr}
                  </h3>

                  <p className="text-xs text-[var(--text-muted)] font-tajawal leading-relaxed line-clamp-2">
                    {track.descriptionAr}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-2 border-t border-[var(--border-color)]">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--text-muted)]">
                    <span>{isEnglish ? 'Track Progress' : 'الإنجاز'}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[var(--bg-card-subtle)] overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--gold)] rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
