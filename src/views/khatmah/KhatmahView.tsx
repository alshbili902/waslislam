import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Calendar,
  Mic,
  RotateCcw,
  Award,
  History,
  Sparkles,
  Layers,
} from 'lucide-react';
import { KhatmahPlan, HifzProgress, HifzSession, RecitationMode } from '../../types/khatmah';
import { khatmahService } from '../../services/khatmahService';
import { useUser } from '../../context/UserContext';

// Sub-components
import { KhatmahDashboard } from './components/KhatmahDashboard';
import { KhatmahPlanModal } from './components/KhatmahPlanModal';
import { HifzDashboard } from './components/HifzDashboard';
import { HifzReviewView } from './components/HifzReviewView';
import { KhatmahProgressView } from './components/KhatmahProgressView';
import { KhatmahHistoryView } from './components/KhatmahHistoryView';
import { HifzSessionRunner } from './components/HifzSessionRunner';
import { SURAHS_LIST } from '../../data/quranMetadata';

export type KhatmahSubTab = 'my' | 'plan' | 'hifz' | 'review' | 'progress' | 'history';

interface Props {
  initialSubTab?: KhatmahSubTab;
  onNavigate: (tab: string, contextId?: any) => void;
  contextParams?: any;
}

export const KhatmahView: React.FC<Props> = ({
  initialSubTab = 'my',
  onNavigate,
  contextParams,
}) => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<KhatmahSubTab>(initialSubTab);

  const [plan, setPlan] = useState<KhatmahPlan | null>(null);
  const [hifzList, setHifzList] = useState<HifzProgress[]>([]);
  const [sessions, setSessions] = useState<HifzSession[]>([]);
  const [weakAyahsCount, setWeakAyahsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Direct launcher for review or preselected surah
  const [directRunnerParams, setDirectRunnerParams] = useState<{
    surahNumber: number;
    startAyah: number;
    endAyah: number;
    mode: RecitationMode;
  } | null>(null);

  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Handle SEO Title
  useEffect(() => {
    let title = 'الختمة | وصل الإسلامية';
    if (activeTab === 'hifz') title = 'الحفظ والتسميع | وصل الإسلامية';
    else if (activeTab === 'review') title = 'مراجعة الحفظ | وصل الإسلامية';
    else if (activeTab === 'progress') title = 'تقدمي في الختمة | وصل الإسلامية';
    else if (activeTab === 'history') title = 'سجل التسميع | وصل الإسلامية';
    document.title = title;
  }, [activeTab]);

  // Load plan and hifz data
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      setLoading(true);
      const [activePlan, progressList, sessionList, weakList] = await Promise.all([
        khatmahService.getActivePlan(user?.id),
        khatmahService.getHifzProgressList(user?.id),
        khatmahService.getHifzSessions(user?.id),
        khatmahService.getWeakAyahsForReview(user?.id),
      ]);

      if (mounted) {
        setPlan(activePlan);
        setHifzList(progressList);
        setSessions(sessionList);
        const totalWeak = weakList.reduce((acc, curr) => acc + curr.weakAyahs.length, 0);
        setWeakAyahsCount(totalWeak);
        setLoading(false);
      }
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  // Subtabs definitions matching Section 1 requirement:
  // Desktop / Mobile Navigation:
  // ├── ختمتي
  // ├── خطة الختمة
  // ├── الحفظ والتسميع
  // ├── مراجعة الحفظ
  // ├── تقدمي
  // └── السجل
  const subTabs = [
    { id: 'my' as KhatmahSubTab, label: 'ختمتي', icon: BookOpen },
    { id: 'plan' as KhatmahSubTab, label: 'خطة الختمة', icon: Calendar },
    { id: 'hifz' as KhatmahSubTab, label: 'الحفظ والتسميع', icon: Mic },
    { id: 'review' as KhatmahSubTab, label: 'مراجعة الحفظ', icon: RotateCcw, badge: weakAyahsCount > 0 ? weakAyahsCount : undefined },
    { id: 'progress' as KhatmahSubTab, label: 'تقدمي', icon: Award },
    { id: 'history' as KhatmahSubTab, label: 'السجل', icon: History },
  ];

  const handleLaunchReview = (
    surahNumber: number,
    startAyah: number,
    endAyah: number,
    mode: RecitationMode = 'recite_text_visible'
  ) => {
    setDirectRunnerParams({
      surahNumber,
      startAyah,
      endAyah,
      mode,
    });
  };

  if (directRunnerParams) {
    const meta = SURAHS_LIST.find((s) => s.number === directRunnerParams.surahNumber) || SURAHS_LIST[0];
    return (
      <HifzSessionRunner
        surah={meta}
        startAyah={directRunnerParams.startAyah}
        endAyah={directRunnerParams.endAyah}
        initialMode={directRunnerParams.mode}
        userId={user?.id}
        onExit={() => {
          setDirectRunnerParams(null);
          khatmahService.getHifzProgressList(user?.id).then(setHifzList);
          khatmahService.getHifzSessions(user?.id).then(setSessions);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation Sub-Tab Bar (Horizontal Pill Selector) */}
      <div className="bg-white dark:bg-emerald-950/80 p-1.5 rounded-2xl border border-emerald-900/10 dark:border-emerald-800/50 shadow-xs flex items-center gap-1 overflow-x-auto scrollbar-none">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/40'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-emerald-600 dark:text-emerald-400'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-bold flex items-center justify-center font-mono">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Tab Body Content */}
      {loading ? (
        <div className="py-24 text-center text-slate-400 space-y-3">
          <div className="w-9 h-9 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">جاري تحميل بيانات الختمة والحفظ...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'my' && plan && (
              <KhatmahDashboard
                plan={plan}
                onPlanUpdate={setPlan}
                onNavigate={onNavigate}
                onSelectSubTab={(tab) => setActiveTab(tab as KhatmahSubTab)}
                userId={user?.id}
                hifzList={hifzList}
                weakAyahsCount={weakAyahsCount}
              />
            )}

            {activeTab === 'plan' && plan && (
              <KhatmahDashboard
                plan={plan}
                onPlanUpdate={setPlan}
                onNavigate={onNavigate}
                onSelectSubTab={(tab) => setActiveTab(tab as KhatmahSubTab)}
                userId={user?.id}
                hifzList={hifzList}
                weakAyahsCount={weakAyahsCount}
              />
            )}

            {activeTab === 'hifz' && (
              <HifzDashboard
                hifzList={hifzList}
                sessions={sessions}
                onHifzUpdate={setHifzList}
                onNavigate={onNavigate}
                onSelectSubTab={(tab) => setActiveTab(tab as KhatmahSubTab)}
                userId={user?.id}
                preselectedSurahNumber={contextParams?.surah}
                preselectedStartAyah={contextParams?.startAyah}
                preselectedEndAyah={contextParams?.endAyah}
              />
            )}

            {activeTab === 'review' && (
              <HifzReviewView
                onLaunchReviewSession={handleLaunchReview}
                onNavigate={onNavigate}
                userId={user?.id}
              />
            )}

            {activeTab === 'progress' && plan && (
              <KhatmahProgressView
                plan={plan}
                hifzList={hifzList}
                onNavigate={onNavigate}
              />
            )}

            {activeTab === 'history' && (
              <KhatmahHistoryView
                sessions={sessions}
                onLaunchSession={(surahNum, startA, endA) => {
                  handleLaunchReview(surahNum, startA, endA);
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};
