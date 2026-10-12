'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Compass, 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  ShieldCheck, 
  RotateCcw, 
  Share2, 
  Check, 
  Edit3, 
  HelpCircle,
  FileText
} from 'lucide-react';
import { GuidedLearningPath, PathStep, INITIAL_LEARNING_PATHS } from '../../data/learningPathsData';
import { learningPathsManager, UserPathProgress } from '../../utils/learningPathsManager';

interface GuidedLearningPathsHubProps {
  onOpenQuran: (surahNumber: number, ayahNumber?: number) => void;
  onOpenShareCard?: (content: { title: string; text: string; source: string; category: string }) => void;
  isEnglish: boolean;
}

export const GuidedLearningPathsHub: React.FC<GuidedLearningPathsHubProps> = ({
  onOpenQuran,
  onOpenShareCard,
  isEnglish
}) => {
  const [paths, setPaths] = useState<GuidedLearningPath[]>(() => learningPathsManager.getAllPaths());
  const [selectedPath, setSelectedPath] = useState<GuidedLearningPath | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [userNote, setUserNote] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [progressRecord, setProgressRecord] = useState<Record<string, UserPathProgress>>(() => 
    learningPathsManager.getUserProgress()
  );

  const filteredPaths = paths.filter(p => {
    if (categoryFilter === 'all') return true;
    return p.category === categoryFilter;
  });

  const handleSelectPath = (path: GuidedLearningPath) => {
    setSelectedPath(path);
    const prog = learningPathsManager.getPathProgress(path.id);
    if (!prog) {
      learningPathsManager.enrollInPath(path.id);
      setCurrentStepIndex(0);
    } else {
      const resumeIndex = Math.min(path.steps.length - 1, prog.completedStepIds.length);
      setCurrentStepIndex(resumeIndex);
    }
    setProgressRecord(learningPathsManager.getUserProgress());
  };

  const handleCompleteCurrentStep = () => {
    if (!selectedPath) return;
    const currentStep = selectedPath.steps[currentStepIndex];
    const updated = learningPathsManager.completeStep(selectedPath.id, currentStep.id, userNote);
    setProgressRecord(learningPathsManager.getUserProgress());

    if (currentStepIndex < selectedPath.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setUserNote('');
    }
  };

  const handleSharePath = (path: GuidedLearningPath) => {
    if (!onOpenShareCard) return;
    onOpenShareCard({
      title: path.titleAr,
      text: `${path.descriptionAr}\n\nعدد الدروس: ${path.steps.length} درس • المدة التقديرية: ${path.estimatedHours} ساعات\n\nالمصادر المعتمدة: ${path.verifiedSources.join('، ')}`,
      source: `المسارات التعليمية الموجهة • وصل الإسلامية`,
      category: 'المسارات التعليمية'
    });
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-[var(--bg-card)] border border-[var(--border-gold)] p-6 md:p-8 shadow-sm transition-all">
        {/* Soft decorative background glows */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-gradient-to-br from-[var(--primary)]/10 via-[var(--gold)]/8 to-transparent rounded-full blur-3xl pointer-events-none -translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-tl from-[var(--gold)]/10 via-[var(--primary)]/5 to-transparent rounded-full blur-2xl pointer-events-none translate-x-1/4 translate-y-1/4" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--gold-light)] border border-[var(--border-gold)] text-[var(--gold-hover)] dark:text-[var(--gold)] text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[var(--gold)]" />
            <span>{isEnglish ? 'Guided Islamic Curricula' : 'المسارات التعليمية المنهجية الموثقة'}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--text-main)] font-scheherazade leading-tight">
            {isEnglish ? 'Guided Learning Paths' : 'المسارات التعليمية الموجهة'}
          </h1>
          <p className="text-sm md:text-base text-[var(--text-muted)] font-tajawal leading-relaxed">
            {isEnglish
              ? 'Structured educational journeys organizing Quran study, Tafsir, Hadith, and Islamic fundamentals into purposeful sequential steps.'
              : 'رحلات تعليمية متدرجة تجمع بين مدارسة القرآن، التفسير الميسر، الفقه العملي، والسيرة النبوية وفق أهداف وخطوات محددة.'}
          </p>
        </div>
      </div>

      {!selectedPath ? (
        /* CATALOG VIEW */
        <div className="space-y-6">
          {/* Category Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-semibold">
            {[
              { id: 'all', label: 'جميع المسارات' },
              { id: 'quran', label: 'علوم القرآن وتدبره' },
              { id: 'fiqh', label: 'الفقه والعبادات' },
              { id: 'seerah', label: 'السيرة النبوية' },
              { id: 'new_muslim', label: 'دليل المسلم الجديد' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                  categoryFilter === cat.id
                    ? 'bg-[var(--gold)] text-black font-bold shadow-md'
                    : 'bg-[var(--bg-card)] text-[var(--text-main)] hover:border-[var(--gold)] border border-[var(--border-color)]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Paths Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredPaths.map(path => {
              const prog = progressRecord[path.id];
              const completedCount = prog?.completedStepIds.length || 0;
              const percent = Math.round((completedCount / path.steps.length) * 100);

              return (
                <div
                  key={path.id}
                  onClick={() => handleSelectPath(path)}
                  className="bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--gold)] rounded-2xl p-6 cursor-pointer transition-all hover:shadow-lg flex flex-col justify-between group space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--gold)]/15 text-[var(--gold)] font-bold">
                        {path.categoryLabelAr}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{path.estimatedHours} ساعات تقديرية</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-[var(--text-main)] group-hover:text-[var(--gold)] transition-colors">
                      {path.titleAr}
                    </h3>

                    <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                      {path.descriptionAr}
                    </p>
                  </div>

                  {/* Progress Bar & Footer */}
                  <div className="pt-3 border-t border-[var(--border-color)] space-y-2">
                    <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                      <span>{path.steps.length} دروس تعليمية</span>
                      <span className="font-bold text-[var(--gold)]">
                        {prog ? `${percent}% مكتمل` : 'لم تبدأ بعد'}
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-[var(--bg-main)] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[var(--gold)] to-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* INTERACTIVE PATH LEARNING WORKSPACE */
        <div className="space-y-6">
          {/* Back button & Breadcrumb */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setSelectedPath(null)}
              className="flex items-center gap-1.5 text-xs font-bold text-[var(--gold)] hover:opacity-80 transition-opacity"
            >
              <ChevronRight className="w-4 h-4" />
              <span>العودة لكتالوج المسارات</span>
            </button>

            <button
              onClick={() => handleSharePath(selectedPath)}
              className="p-2 rounded-lg border border-[var(--border-color)] hover:border-[var(--gold)] text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors"
              title="مشاركة المسار"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Syllabus Steps Timeline */}
            <div className="lg:col-span-1 space-y-3">
              <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-3">
                <h3 className="font-bold text-sm text-[var(--text-main)]">
                  خطة دروس المسار ({selectedPath.steps.length})
                </h3>

                <div className="space-y-2">
                  {selectedPath.steps.map((st, idx) => {
                    const isCompleted = progressRecord[selectedPath.id]?.completedStepIds.includes(st.id);
                    const isCurrent = currentStepIndex === idx;

                    return (
                      <button
                        key={st.id}
                        onClick={() => setCurrentStepIndex(idx)}
                        className={`w-full text-right p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${
                          isCurrent
                            ? 'bg-[var(--gold)]/10 border-[var(--gold)] font-bold'
                            : 'bg-[var(--bg-main)] border-[var(--border-color)] hover:border-[var(--gold)]/40'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Circle className="w-4 h-4 text-[var(--text-muted)]" />
                          )}
                        </div>
                        <div className="flex-1">
                          <span className="block text-[var(--text-main)] leading-snug">
                            {idx + 1}. {st.titleAr}
                          </span>
                          <span className="text-[11px] text-[var(--text-muted)] mt-0.5 block">
                            {st.durationMinutes} دقيقة
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Active Step Reading Workspace */}
            <div className="lg:col-span-2 space-y-5">
              {(() => {
                const currentStep = selectedPath.steps[currentStepIndex];
                const isStepCompleted = progressRecord[selectedPath.id]?.completedStepIds.includes(currentStep.id);

                return (
                  <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-md space-y-6">
                    {/* Step Header */}
                    <div className="border-b border-[var(--border-color)] pb-4 space-y-1">
                      <div className="flex items-center justify-between text-xs text-[var(--gold)] font-bold">
                        <span>الدرس {currentStepIndex + 1} من {selectedPath.steps.length}</span>
                        <span>{currentStep.durationMinutes} دقيقة</span>
                      </div>
                      <h2 className="text-xl font-bold text-[var(--text-main)]">
                        {currentStep.titleAr}
                      </h2>
                    </div>

                    {/* Step Body Content */}
                    <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-sm text-[var(--text-main)] leading-relaxed space-y-3">
                      <p>{currentStep.contentSummaryAr}</p>
                    </div>

                    {/* Quran Reference if linked */}
                    {currentStep.referenceSurah && (
                      <div className="p-4 rounded-xl bg-gradient-to-r from-[var(--emerald-deep)]/15 to-[var(--gold)]/10 border border-[var(--gold)]/30 flex items-center justify-between gap-3">
                        <div>
                          <span className="text-xs text-[var(--gold)] font-bold block mb-1">
                            موضع قرآني مرتبط بالدرس:
                          </span>
                          <p className="text-xs text-[var(--text-muted)]">
                            سورة رقم {currentStep.referenceSurah} — الآية {currentStep.referenceAyah || 1}
                          </p>
                        </div>
                        <button
                          onClick={() => onOpenQuran(currentStep.referenceSurah!, currentStep.referenceAyah || 1)}
                          className="px-3 py-1.5 rounded-lg bg-[var(--gold)] text-black font-bold text-xs shrink-0"
                        >
                          اقرأ في المصحف
                        </button>
                      </div>
                    )}

                    {/* Reflection Question */}
                    {currentStep.reflectionQuestion && (
                      <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-2">
                        <h4 className="font-bold text-xs text-[var(--gold)] flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>سؤال تدبري للتأمل والتطبيق:</span>
                        </h4>
                        <p className="text-xs text-[var(--text-main)] leading-relaxed">
                          {currentStep.reflectionQuestion}
                        </p>
                        <textarea
                          value={userNote}
                          onChange={(e) => setUserNote(e.target.value)}
                          placeholder="اكتب خواطرك وملاحظاتك الشخصية حول هذا الدرس هنا..."
                          rows={2}
                          className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg p-2.5 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--gold)]"
                        />
                      </div>
                    )}

                    {/* Step Completion & Navigation Actions */}
                    <div className="pt-4 border-t border-[var(--border-color)] flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          disabled={currentStepIndex <= 0}
                          onClick={() => setCurrentStepIndex(prev => prev - 1)}
                          className="px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-main)] font-bold disabled:opacity-40"
                        >
                          الدرس السابق
                        </button>
                      </div>

                      <button
                        onClick={handleCompleteCurrentStep}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                          isStepCompleted
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[var(--gold)] text-black hover:opacity-90'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        <span>
                          {isStepCompleted ? 'تم إكمال الدرس (متابعة)' : 'إكمال الدرس والمتابعة'}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
