'use client';

import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Award, 
  BookOpen, 
  Plus, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Lock, 
  Settings, 
  Trash2, 
  ChevronLeft, 
  Check, 
  Heart,
  UserCheck,
  Baby,
  GraduationCap,
  ExternalLink,
  Info
} from 'lucide-react';
import { 
  familyModeManager, 
  FamilyGroup, 
  FamilyProfile, 
  FamilySharedGoal, 
  FamilyRole, 
  AgeGroup 
} from '../../utils/familyModeManager.ts';

interface FamilyModeHubProps {
  isEnglish: boolean;
  onNavigateToKids?: () => void;
  onNavigateToQuran?: () => void;
}

export const FamilyModeHub: React.FC<FamilyModeHubProps> = ({
  isEnglish,
  onNavigateToKids,
  onNavigateToQuran
}) => {
  const [family, setFamily] = useState<FamilyGroup>(() => familyModeManager.getFamilyGroup());
  const [activeProfile, setActiveProfile] = useState<FamilyProfile>(() => familyModeManager.getCurrentProfile());

  // Modal states
  const [showAddProfileModal, setShowAddProfileModal] = useState(false);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [editingChildControls, setEditingChildControls] = useState<FamilyProfile | null>(null);

  // New Profile Form
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<FamilyRole>('child');
  const [newAgeGroup, setNewAgeGroup] = useState<AgeGroup>('mid-child');
  const [newMaxMinutes, setNewMaxMinutes] = useState(45);

  // New Goal Form
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDesc, setNewGoalDesc] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState(30);
  const [newGoalUnit, setNewGoalUnit] = useState('سورة');

  const refreshFamily = () => {
    const updated = familyModeManager.getFamilyGroup();
    setFamily(updated);
    setActiveProfile(familyModeManager.getCurrentProfile());
  };

  const handleSwitchProfile = (id: string) => {
    familyModeManager.switchProfile(id);
    refreshFamily();
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    familyModeManager.createProfile({
      name: newName,
      role: newRole,
      ageGroup: newAgeGroup,
      avatar: newRole === 'child' ? 'star' : 'shield',
      parentalControls: {
        maxDailyMinutes: newRole === 'child' ? newMaxMinutes : 0,
        restrictExternalLinks: newRole === 'child',
        approvedSections: newRole === 'child' ? ['kids', 'quran', 'adhkar'] : ['all'],
        allowCommunityReflections: newRole !== 'child'
      }
    });
    setNewName('');
    setShowAddProfileModal(false);
    refreshFamily();
  };

  const handleDeleteProfile = (id: string) => {
    if (confirm(isEnglish ? 'Delete this family profile?' : 'هل أنت متأكد من حذف هذا الملف الشخصي؟')) {
      familyModeManager.deleteProfile(id);
      refreshFamily();
    }
  };

  const handleSaveParentalControls = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChildControls) return;
    familyModeManager.updateProfile(editingChildControls.id, {
      parentalControls: editingChildControls.parentalControls
    });
    setEditingChildControls(null);
    refreshFamily();
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    familyModeManager.addSharedGoal({
      title: newGoalTitle,
      description: newGoalDesc,
      targetCount: newGoalTarget,
      unit: newGoalUnit,
      assignedTo: ['all']
    });
    setNewGoalTitle('');
    setNewGoalDesc('');
    setShowAddGoalModal(false);
    refreshFamily();
  };

  const handleIncrementGoal = (id: string) => {
    familyModeManager.incrementGoalProgress(id, 1);
    refreshFamily();
  };

  const handleDeleteGoal = (id: string) => {
    if (confirm(isEnglish ? 'Remove this shared goal?' : 'هل أنت متأكد من حذف هذا الهدف المشترك؟')) {
      familyModeManager.deleteGoal(id);
      refreshFamily();
    }
  };

  const isAdmin = activeProfile.role === 'admin';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[var(--primary)] via-emerald-800 to-[var(--gold)]/80 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-amber-200">
              <Users className="w-3.5 h-3.5" />
              <span>{isEnglish ? 'Family Learning Hub' : 'بيئة الأسرة القرآنية'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-cairo">
              {family.familyName}
            </h1>
            <p className="text-sm text-white/80 max-w-xl font-tajawal leading-relaxed">
              {isEnglish 
                ? 'Organize your household learning, share Quran reading goals, and nurture authentic Islamic values with complete privacy isolation.'
                : 'نظّم مسار التعلم القرآني لأسرتك، وشارك في ختمات وأهداف أسرية هادفة، مع صون تام لخصوصية خواطر وتدبرات كل فرد.'}
            </p>
          </div>

          {/* Active Profile Badge */}
          <div className="bg-black/25 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex items-center gap-4 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center font-bold text-lg text-white">
              {activeProfile.role === 'admin' ? (
                <ShieldCheck className="w-6 h-6 text-emerald-200" />
              ) : activeProfile.role === 'child' ? (
                <Sparkles className="w-6 h-6 text-amber-200" />
              ) : (
                <BookOpen className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <div className="text-xs text-white/70 font-medium">
                {isEnglish ? 'Active Profile' : 'الملف النشط حالياً'}
              </div>
              <div className="text-base font-bold text-white flex items-center gap-2">
                <span>{activeProfile.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/40 text-emerald-100 font-bold">
                  {activeProfile.role === 'admin' ? (isEnglish ? 'Admin' : 'ولي أمر') : activeProfile.role === 'child' ? (isEnglish ? 'Child' : 'طفل') : (isEnglish ? 'Adult' : 'بالغ')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Strict Privacy Guarantee Box */}
      <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-3">
        <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed text-[var(--text-muted)] font-tajawal">
          <strong className="text-[var(--text-main)] block font-cairo mb-0.5">
            {isEnglish ? 'Strict Privacy Boundaries Enforced' : 'ضمانة الخصوصية التامة لأفراد الأسرة:'}
          </strong>
          {isEnglish 
            ? 'Personal reflections, journal notes, and private reading history of adults are strictly isolated and never visible to other household members. Only intentionally shared goals and child educational progress summaries are visible.'
            : 'خواطر التدبر، والملاحظات الشخصية، وسجل قراءة البالغين محفوظة بخصوصية تامة ولا يمكن لأي فرد آخر الاطلاع عليها. المشاركة تقتصر فقط على الأهداف الأسرية المشتركة ونسب تقدم الصغار التعليمية.'}
        </div>
      </div>

      {/* Household Profiles Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[var(--gold)]" />
            <h2 className="text-lg font-bold text-[var(--text-main)] font-cairo">
              {isEnglish ? 'Household Profiles' : 'أفراد الأسرة'}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-bold">
              {family.profiles.length}
            </span>
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowAddProfileModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--gold)] text-white text-xs font-bold shadow-md hover:opacity-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{isEnglish ? 'Add Member' : 'إضافة فرد'}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {family.profiles.map((p) => {
            const isCurr = p.id === activeProfile.id;
            return (
              <div 
                key={p.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isCurr 
                    ? 'bg-[var(--bg-card)] border-[var(--gold)] shadow-lg ring-1 ring-[var(--gold)]/30' 
                    : 'bg-[var(--bg-card)] border-[var(--border-color)] hover:border-[var(--gold)]/50'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--primary)]/10 to-[var(--gold)]/20 flex items-center justify-center shadow-inner">
                      {p.role === 'admin' ? (
                        <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      ) : p.role === 'child' ? (
                        p.ageGroup === 'early-child' ? (
                          <Baby className="w-6 h-6 text-rose-500" />
                        ) : (
                          <Sparkles className="w-6 h-6 text-amber-500" />
                        )
                      ) : (
                        <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-[var(--text-main)] font-cairo flex items-center gap-2">
                        {p.name}
                        {isCurr && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                            {isEnglish ? 'Active' : 'الحالي'}
                          </span>
                        )}
                      </h3>
                      <div className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 mt-0.5">
                        <span>{p.role === 'admin' ? (isEnglish ? 'Parent / Admin' : 'ولي أمر ومسؤول') : p.role === 'child' ? (isEnglish ? 'Child Learner' : 'متعلم ناشئ') : (isEnglish ? 'Adult' : 'بالغ')}</span>
                        {p.role === 'child' && (
                          <span className="text-amber-500">• {p.parentalControls.maxDailyMinutes > 0 ? `${p.parentalControls.maxDailyMinutes} دقيقة/يوم` : 'مفتوح'}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isAdmin && p.id !== activeProfile.id && (
                    <button
                      onClick={() => handleDeleteProfile(p.id)}
                      className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      title={isEnglish ? 'Remove' : 'حذف الملف'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Profile Stats */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[var(--bg-card-subtle)] text-xs mb-4">
                  <div className="flex flex-col">
                    <span className="text-[var(--text-muted)]">{isEnglish ? 'Quran Pages' : 'صفحات التلاوة'}</span>
                    <span className="font-bold text-[var(--text-main)] font-mono">{p.stats.quranPagesRead}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[var(--text-muted)]">
                      {p.role === 'child' ? (isEnglish ? 'Kids Lessons' : 'دروس الأطفال') : (isEnglish ? 'Surahs Read' : 'السور المنجزة')}
                    </span>
                    <span className="font-bold text-[var(--text-main)] font-mono">
                      {p.role === 'child' ? p.stats.kidsLessonsCompleted : p.stats.surahsCompleted}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {!isCurr ? (
                    <button
                      onClick={() => handleSwitchProfile(p.id)}
                      className="flex-1 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-bold hover:bg-[var(--primary-hover)] transition-all flex items-center justify-center gap-1"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{isEnglish ? 'Switch to this profile' : 'التبديل لهذا الملف'}</span>
                    </button>
                  ) : (
                    <div className="flex-1 py-2 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-xl">
                      {isEnglish ? 'Current Active Profile' : 'الملف المستخدم حالياً'}
                    </div>
                  )}

                  {isAdmin && p.role === 'child' && (
                    <button
                      onClick={() => setEditingChildControls(p)}
                      className="p-2 rounded-xl border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--gold)] transition-colors"
                      title={isEnglish ? 'Parental Controls' : 'الرقابة الأبوية'}
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shared Family Goals */}
      <div className="space-y-4 pt-4 border-t border-[var(--border-color)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[var(--gold)]" />
            <h2 className="text-lg font-bold text-[var(--text-main)] font-cairo">
              {isEnglish ? 'Shared Family Quran Goals' : 'الأهداف والختمات الأسرية المشتركة'}
            </h2>
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowAddGoalModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold)]/10 text-xs font-bold transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{isEnglish ? 'Add Shared Goal' : 'إضافة هدف أسري'}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {family.sharedGoals.map((g) => {
            const percent = Math.min(100, Math.round((g.currentCount / g.targetCount) * 100));
            return (
              <div 
                key={g.id}
                className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-base text-[var(--text-main)] font-cairo">
                      {g.title}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] font-tajawal mt-0.5">
                      {g.description}
                    </p>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteGoal(g.id)}
                      className="p-1 text-[var(--text-muted)] hover:text-red-500 rounded-lg"
                      title={isEnglish ? 'Delete' : 'حذف'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="text-[var(--text-muted)]">
                      {isEnglish ? 'Progress' : 'نسبة الإنجاز'}
                    </span>
                    <span className="text-[var(--primary)] font-mono">
                      {g.currentCount} / {g.targetCount} {g.unit} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[var(--bg-card-subtle)] overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--gold)] transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-[11px] text-[var(--text-muted)]">
                    {g.completed ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {isEnglish ? 'Goal Achieved! Alhamdulillah' : 'تم إنجاز الهدف! الحمد لله'}
                      </span>
                    ) : (
                      <span>{isEnglish ? 'All household members participating' : 'مشارك فيه جميع أفراد الأسرة'}</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleIncrementGoal(g.id)}
                    className="px-3 py-1.5 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isEnglish ? '+1 Step' : '+1 إنجاز خطوة'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Children Education Section Shortcut */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-[var(--bg-card)] to-emerald-500/10 border border-[var(--border-gold)]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-right">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <GraduationCap className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-base text-[var(--text-main)] font-cairo">
              {isEnglish ? 'Wasl Kids Academy Integration' : 'ربط أكاديمية براعم وصل للأطفال'}
            </h3>
          </div>
          <p className="text-xs text-[var(--text-muted)] max-w-xl font-tajawal">
            {isEnglish 
              ? 'Enable safe, ad-free Islamic lessons for children with Quran memorization games and moral stories.'
              : 'يمكن للوالدين توجيه الصغار نحو مسارات تعليمية آمنة خالية من الإعلانات تشمل حفظ قصار السور، الآداب الإسلامية، وقصص الأنبياء.'}
          </p>
        </div>

        {onNavigateToKids && (
          <button
            onClick={onNavigateToKids}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md transition-all shrink-0 flex items-center gap-1.5"
          >
            <span>{isEnglish ? 'Open Kids Academy' : 'فتح واحة البراعم'}</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Clarification Note */}
      <div className="text-center text-xs text-[var(--text-muted)] font-tajawal pt-2">
        <Info className="w-4 h-4 inline ml-1 opacity-70" />
        <span>
          {isEnglish 
            ? 'Progress metrics are for household motivation and organization only, and do not represent spiritual standing or divine acceptance.'
            : 'هذه الإحصاءات والأهداف وضعت للتشجيع والتنظيم الأسري فقط، وليست مقياساً لمكانة العبد أو قبوله عند الله سبحانه وتعالى.'}
        </span>
      </div>

      {/* Add Profile Modal */}
      {showAddProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-gold)] rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <h3 className="font-bold text-lg text-[var(--text-main)] font-cairo mb-4">
              {isEnglish ? 'Add Family Profile' : 'إضافة فرد جديد للأسرة'}
            </h3>
            <form onSubmit={handleCreateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] mb-1.5">
                  {isEnglish ? 'Name / Nickname' : 'الاسم أو اللقب'}
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={isEnglish ? 'e.g. Fatima' : 'مثال: فاطمة'}
                  className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--gold)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] mb-1.5">
                  {isEnglish ? 'Role' : 'نوع الحساب'}
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as FamilyRole)}
                  className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--gold)]"
                >
                  <option value="child">{isEnglish ? 'Child (with parental controls)' : 'طفل / ناشئ (مع خيارات رقابة أبوية)'}</option>
                  <option value="adult">{isEnglish ? 'Adult (private notes)' : 'بالغ (مع خواطر وملاحظات مستقلة تماماً)'}</option>
                  <option value="admin">{isEnglish ? 'Parent / Admin' : 'ولي أمر (مسؤول إدارة الأسرة)'}</option>
                </select>
              </div>

              {newRole === 'child' && (
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] mb-1.5">
                    {isEnglish ? 'Daily screen limit reminder (minutes)' : 'تذكير الحد اليومي للاستخدام (بالدقائق)'}
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={240}
                    value={newMaxMinutes}
                    onChange={(e) => setNewMaxMinutes(Number(e.target.value))}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--gold)]"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProfileModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--border-color)] text-xs font-semibold text-[var(--text-muted)]"
                >
                  {isEnglish ? 'Cancel' : 'إلغاء'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--gold)] text-white text-xs font-bold shadow-md"
                >
                  {isEnglish ? 'Save Member' : 'حفظ الفرد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Goal Modal */}
      {showAddGoalModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-gold)] rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <h3 className="font-bold text-lg text-[var(--text-main)] font-cairo mb-4">
              {isEnglish ? 'Add Shared Family Goal' : 'إضافة هدف قرآني أو تعليمي مشترك'}
            </h3>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] mb-1.5">
                  {isEnglish ? 'Goal Title' : 'عنوان الهدف'}
                </label>
                <input
                  type="text"
                  required
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  placeholder={isEnglish ? 'e.g. Ramadan Family Khatmah' : 'مثال: ختمة العائلة في شهر شعبان'}
                  className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--gold)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] mb-1.5">
                  {isEnglish ? 'Description / Guidance' : 'الوصف والهدف التربوي'}
                </label>
                <textarea
                  rows={2}
                  value={newGoalDesc}
                  onChange={(e) => setNewGoalDesc(e.target.value)}
                  placeholder={isEnglish ? 'Encouraging note...' : 'كلمة تشجيعية لأفراد العائلة...'}
                  className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--gold)] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] mb-1.5">
                    {isEnglish ? 'Target Number' : 'العدد المستهدف'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newGoalTarget}
                    onChange={(e) => setNewGoalTarget(Number(e.target.value))}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--gold)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] mb-1.5">
                    {isEnglish ? 'Unit' : 'الوحدة'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newGoalUnit}
                    onChange={(e) => setNewGoalUnit(e.target.value)}
                    placeholder="سورة / صفحة / يوم"
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--gold)]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddGoalModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--border-color)] text-xs font-semibold text-[var(--text-muted)]"
                >
                  {isEnglish ? 'Cancel' : 'إلغاء'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--gold)] text-white text-xs font-bold shadow-md"
                >
                  {isEnglish ? 'Create Goal' : 'إنشاء الهدف'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Parental Controls Modal */}
      {editingChildControls && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-gold)] rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <h3 className="font-bold text-lg text-[var(--text-main)] font-cairo mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[var(--gold)]" />
              <span>{isEnglish ? `Parental Controls: ${editingChildControls.name}` : `الرقابة الأبوية: ${editingChildControls.name}`}</span>
            </h3>
            <form onSubmit={handleSaveParentalControls} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] mb-1.5">
                  {isEnglish ? 'Daily Usage Limit (minutes)' : 'الحد اليومي المقترح للاستخدام (بالدقائق)'}
                </label>
                <input
                  type="number"
                  min={10}
                  max={240}
                  value={editingChildControls.parentalControls.maxDailyMinutes}
                  onChange={(e) => setEditingChildControls({
                    ...editingChildControls,
                    parentalControls: {
                      ...editingChildControls.parentalControls,
                      maxDailyMinutes: Number(e.target.value)
                    }
                  })}
                  className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--gold)]"
                />
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-[var(--text-main)]">
                    {isEnglish ? 'Block external links' : 'حظر فتح الروابط الخارجية'}
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    {isEnglish ? 'Keep child within vetted Islamic content' : 'إبقاء الطفل داخل المحتوى الإسلامي المعتمد'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={editingChildControls.parentalControls.restrictExternalLinks}
                  onChange={(e) => setEditingChildControls({
                    ...editingChildControls,
                    parentalControls: {
                      ...editingChildControls.parentalControls,
                      restrictExternalLinks: e.target.checked
                    }
                  })}
                  className="w-4 h-4 accent-[var(--primary)]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingChildControls(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--border-color)] text-xs font-semibold text-[var(--text-muted)]"
                >
                  {isEnglish ? 'Cancel' : 'إلغاء'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--gold)] text-white text-xs font-bold shadow-md"
                >
                  {isEnglish ? 'Save Settings' : 'حفظ الإعدادات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
