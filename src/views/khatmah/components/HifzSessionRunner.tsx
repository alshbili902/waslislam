import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  MicOff,
  Pause,
  Play,
  RotateCcw,
  CheckCircle2,
  Volume2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Info,
  X,
  RefreshCw,
  Headphones,
  Sliders,
  Check,
} from 'lucide-react';
import { Ayah, Reciter, SurahMeta } from '../../../types';
import {
  HifzSession,
  HifzAyahResult,
  RecitationMode,
  SpeechCapabilities,
} from '../../../types/khatmah';
import { quranSpeechEngine } from '../../../services/quranSpeechEngine';
import { alignRecitationWords, calculateAyahResult } from '../../../utils/quranSpeech';
import { fetchSurahAyahs } from '../../../services/quranService';
import { khatmahService } from '../../../services/khatmahService';
import { HifzResultScreen } from './HifzResultScreen';
import {
  AyahAudioPlayerController,
  AyahAudioUIState,
  resolveAyahAudioSource,
  logHifzAudioDebug,
  getArabicAudioErrorMessage,
} from '../../../services/quranAyahAudioService';
import { RECITERS_LIST } from '../../../data/quranMetadata';

interface Props {
  surah: SurahMeta;
  startAyah: number;
  endAyah: number;
  initialMode: RecitationMode;
  initialReciterId?: string;
  onExit: () => void;
  userId?: string;
}

export type HifzSessionStage = 'listening' | 'reciting';

export const HifzSessionRunner: React.FC<Props> = ({
  surah,
  startAyah,
  endAyah,
  initialMode,
  initialReciterId = 'ar.alafasy',
  onExit,
  userId,
}) => {
  const [mode, setMode] = useState<RecitationMode>(initialMode);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loadingAyahs, setLoadingAyahs] = useState(true);
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);

  // Session Stage: 1. Listening to Reciter -> 2. Reciting by Voice
  const [sessionStage, setSessionStage] = useState<HifzSessionStage>('listening');

  // Reciter Selection
  const [selectedReciter, setSelectedReciter] = useState<Reciter>(() => {
    return (
      RECITERS_LIST.find((r) => r.id === initialReciterId) ||
      RECITERS_LIST[0]
    );
  });
  const [isReciterMenuOpen, setIsReciterMenuOpen] = useState(false);

  // Audio Playback State (Ayah Listening)
  const audioControllerRef = useRef<AyahAudioPlayerController | null>(null);
  const [audioState, setAudioState] = useState<AyahAudioUIState>('IDLE');
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioErrorMessage, setAudioErrorMessage] = useState<string | null>(null);
  const [userActionPrompt, setUserActionPrompt] = useState<string | null>(null);

  // Microphone & Speech State (Ayah Reciting)
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [speechErrorMessage, setSpeechErrorMessage] = useState<string | null>(null);

  // Session results tracking
  const [ayahResults, setAyahResults] = useState<HifzAyahResult[]>([]);
  const [completedSession, setCompletedSession] = useState<HifzSession | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Browser capability check
  const capabilities: SpeechCapabilities = quranSpeechEngine.getCapabilities();

  // Initialize persistent Audio Controller
  useEffect(() => {
    audioControllerRef.current = new AyahAudioPlayerController();
    return () => {
      if (audioControllerRef.current) {
        audioControllerRef.current.destroy();
        audioControllerRef.current = null;
      }
    };
  }, []);

  // 1. Fetch exact verified ayahs for the selected range
  useEffect(() => {
    let active = true;
    async function loadData() {
      setLoadingAyahs(true);
      const allAyahs = await fetchSurahAyahs(surah.number, selectedReciter.id);
      if (active) {
        const range = allAyahs.filter(
          (a) => a.numberInSurah >= startAyah && a.numberInSurah <= endAyah
        );
        setAyahs(range);
        setLoadingAyahs(false);
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, [surah.number, startAyah, endAyah, selectedReciter.id]);

  // 2. Setup speech listeners
  useEffect(() => {
    const unsubTranscript = quranSpeechEngine.onTranscript((transcript) => {
      setLiveTranscript(transcript);
    });

    const unsubLevel = quranSpeechEngine.onAudioLevel((level) => {
      setAudioLevel(level);
    });

    const unsubError = quranSpeechEngine.onError((msg) => {
      setSpeechErrorMessage(msg);
      setIsListening(false);
    });

    return () => {
      unsubTranscript();
      unsubLevel();
      unsubError();
      quranSpeechEngine.stop();
    };
  }, []);

  const currentAyah = ayahs[currentAyahIndex];

  // 3. Audio Loader for current Ayah
  const playCurrentAyahAudio = async (reciterToUse = selectedReciter, autoPlay = true) => {
    if (!currentAyah || !audioControllerRef.current) return;

    setAudioErrorMessage(null);
    setUserActionPrompt(null);

    // Stop speech recognition while listening to audio
    quranSpeechEngine.stop();
    setIsListening(false);

    await audioControllerRef.current.loadAndPlayAyah(
      {
        surahNumber: surah.number,
        ayahNumberInSurah: currentAyah.numberInSurah,
        reciterId: reciterToUse.id,
        autoPlay,
      },
      {
        onStateChange: (state) => {
          setAudioState(state);
          if (state === 'PLAYING') {
            setUserActionPrompt(null);
            setAudioErrorMessage(null);
          }
        },
        onTimeUpdate: (cur, dur, prog) => {
          setAudioCurrentTime(cur);
          setAudioDuration(dur);
          setAudioProgress(prog);
        },
        onEnded: () => {
          setAudioState('COMPLETED');
        },
        onError: (errMsg) => {
          setAudioErrorMessage(errMsg);
        },
        onUserActionRequired: (prompt) => {
          setUserActionPrompt(prompt);
        },
      }
    );
  };

  // Automatically start audio when Ayah changes or stage enters listening
  useEffect(() => {
    if (!currentAyah || loadingAyahs) return;

    if (sessionStage === 'listening') {
      playCurrentAyahAudio(selectedReciter, true);
    } else {
      // If entering reciting stage, stop audio
      audioControllerRef.current?.stop();
    }
  }, [currentAyah?.numberInSurah, sessionStage, loadingAyahs]);

  // Handle switching reciter
  const handleReciterChange = (reciter: Reciter) => {
    setSelectedReciter(reciter);
    setIsReciterMenuOpen(false);
    if (sessionStage === 'listening' && currentAyah) {
      playCurrentAyahAudio(reciter, true);
    }
  };

  // Handle Audio Player controls
  const handleToggleAudioPlay = async () => {
    if (!audioControllerRef.current) return;
    if (audioState === 'PLAYING') {
      audioControllerRef.current.pause();
    } else if (audioState === 'PAUSED' || audioState === 'READY') {
      setUserActionPrompt(null);
      await audioControllerRef.current.play();
    } else if (audioState === 'COMPLETED' || audioState === 'ERROR' || audioState === 'IDLE') {
      await playCurrentAyahAudio(selectedReciter, true);
    }
  };

  const handleReplayAudio = async () => {
    if (!audioControllerRef.current) return;
    await audioControllerRef.current.replay();
  };

  const handleSeekAudio = (percentage: number) => {
    audioControllerRef.current?.seek(percentage);
  };

  // Start Recitation (Phase 2)
  const handleStartRecitingStage = () => {
    // Stop audio
    audioControllerRef.current?.stop();
    setSessionStage('reciting');

    if (!hasMicPermission && capabilities.isSupported) {
      setShowPermissionModal(true);
    } else {
      startRecitation();
    }
  };

  const handleRequestMic = async () => {
    setShowPermissionModal(false);
    setSpeechErrorMessage(null);
    const granted = await quranSpeechEngine.requestMicrophone();
    if (granted) {
      setHasMicPermission(true);
      startRecitation();
    }
  };

  const startRecitation = async () => {
    setSpeechErrorMessage(null);
    setLiveTranscript('');
    const started = await quranSpeechEngine.start();
    if (started) {
      setIsListening(true);
      setIsPaused(false);
    }
  };

  const handleSpeechPauseToggle = () => {
    if (isPaused) {
      quranSpeechEngine.resume();
      setIsPaused(false);
    } else {
      quranSpeechEngine.pause();
      setIsPaused(true);
    }
  };

  const handleRetryAyah = () => {
    setLiveTranscript('');
    startRecitation();
  };

  // Switch back to listen to the reciter
  const handleSwitchToListeningStage = () => {
    quranSpeechEngine.stop();
    setIsListening(false);
    setSessionStage('listening');
  };

  // Align recognized speech with current Ayah
  const alignedWords = currentAyah
    ? alignRecitationWords(
        currentAyah.text,
        liveTranscript,
        0.85,
        isListening
      )
    : [];

  // Finish current ayah and move to next
  const handleFinishAyah = () => {
    if (!currentAyah) return;

    // Calculate result for current ayah
    const res = calculateAyahResult(
      currentAyah.number,
      currentAyah.numberInSurah,
      currentAyah.text,
      alignedWords,
      0.85
    );

    const updatedResults = [...ayahResults, res];
    setAyahResults(updatedResults);

    // Reset for next ayah
    setLiveTranscript('');
    quranSpeechEngine.stop();
    setIsListening(false);

    if (currentAyahIndex + 1 < ayahs.length) {
      setCurrentAyahIndex(currentAyahIndex + 1);
      setSessionStage('listening'); // Start next ayah in listening mode
    } else {
      // Completed all ayahs!
      finishSession(updatedResults);
    }
  };

  // Build final session and save
  const finishSession = async (finalAyahResults: HifzAyahResult[]) => {
    quranSpeechEngine.stop();
    audioControllerRef.current?.destroy();
    setIsListening(false);

    const durationSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    let totalWords = 0;
    let correctWords = 0;
    let incorrectWords = 0;
    let missingWords = 0;
    let extraWords = 0;
    const weakAyahsSet = new Set<number>();

    finalAyahResults.forEach((ar) => {
      totalWords += ar.words.length;
      correctWords += ar.correctWords;
      incorrectWords += ar.incorrectWords;
      missingWords += ar.missingWords;
      extraWords += ar.extraWords;

      if (ar.accuracy < 85) {
        weakAyahsSet.add(ar.numberInSurah);
      }
    });

    const overallAccuracy =
      totalWords > 0 ? Math.round((correctWords / totalWords) * 100) : 100;

    const sessionPayload: Omit<HifzSession, 'id' | 'createdAt'> = {
      userId,
      surahNumber: surah.number,
      surahNameAr: surah.name,
      startAyah,
      endAyah,
      mode,
      accuracy: overallAccuracy,
      durationSeconds,
      totalAyahs: ayahs.length,
      totalWords,
      correctWordsCount: correctWords,
      incorrectWordsCount: incorrectWords,
      missingWordsCount: missingWords,
      extraWordsCount: extraWords,
      weakAyahs: Array.from(weakAyahsSet),
      ayahResults: finalAyahResults,
    };

    try {
      const saved = await khatmahService.saveHifzSession(sessionPayload, userId);
      setCompletedSession(saved);
    } catch (e) {
      console.error(e);
      setCompletedSession({
        ...sessionPayload,
        id: 'session_' + Date.now(),
        createdAt: new Date().toISOString(),
      });
    }
  };

  // Format time (mm:ss)
  const formatSecs = (secs: number) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (completedSession) {
    return (
      <HifzResultScreen
        session={completedSession}
        onRetry={() => {
          setCompletedSession(null);
          setAyahResults([]);
          setCurrentAyahIndex(0);
          setLiveTranscript('');
          setSessionStage('listening');
          startTimeRef.current = Date.now();
        }}
        onReviewMistakes={() => {
          onExit();
        }}
        onClose={onExit}
        surahNameAr={surah.name}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-emerald-900/50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              quranSpeechEngine.stop();
              audioControllerRef.current?.destroy();
              onExit();
            }}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-emerald-900/40 cursor-pointer"
            title="رجوع"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <span>سورة {surah.name}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300">
                الآيات {startAyah} إلى {endAyah}
              </span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              الآية {currentAyah?.numberInSurah || 1} من {ayahs.length} في جلسة التسميع
            </span>
          </div>
        </div>

        {/* Stage & Mode Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Stage indicator pills */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-emerald-900/40 text-xs font-bold">
            <button
              onClick={handleSwitchToListeningStage}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                sessionStage === 'listening'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700'
              }`}
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>الاستماع للشيخ</span>
            </button>
            <button
              onClick={handleStartRecitingStage}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                sessionStage === 'reciting'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>التسميع الصوتي</span>
            </button>
          </div>

          {/* Mode Toggle Controls */}
          <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-emerald-900/40 text-xs">
            <button
              onClick={() => setMode('read_with_text')}
              className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                mode === 'read_with_text'
                  ? 'bg-white dark:bg-emerald-800 text-emerald-950 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              قراءة
            </button>
            <button
              onClick={() => setMode('recite_text_visible')}
              className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                mode === 'recite_text_visible'
                  ? 'bg-white dark:bg-emerald-800 text-emerald-950 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              نص ظاهر
            </button>
            <button
              onClick={() => setMode('recite_text_hidden')}
              className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                mode === 'recite_text_hidden'
                  ? 'bg-white dark:bg-emerald-800 text-emerald-950 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              نص مخفي
            </button>
          </div>
        </div>
      </div>

      {/* 2. Audio Error Alert (Contextual Arabic message with Retry) */}
      {audioErrorMessage && sessionStage === 'listening' && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 flex items-center justify-between text-amber-900 dark:text-amber-200 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{audioErrorMessage}</span>
          </div>
          <button
            onClick={() => playCurrentAyahAudio(selectedReciter, true)}
            className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>إعادة المحاولة</span>
          </button>
        </div>
      )}

      {/* 3. Speech Recognition Warning if speech engine unavailable */}
      {!capabilities.isSupported && sessionStage === 'reciting' && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 flex items-start gap-3 text-amber-900 dark:text-amber-200 text-xs leading-relaxed">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">
              التسميع الصوتي غير مدعوم في هذا المتصفح حاليًا.
            </span>
            <p className="text-slate-600 dark:text-slate-300">
              يمكنك التسميع في متصفحات Chrome و Edge و Safari و Safari iOS. تستطيع المتابعة في وضع (قراءة مع النص) واستخدام مشغل التلاوة الصوتي دون انقطاع.
            </p>
          </div>
        </div>
      )}

      {/* 4. Speech Recognition Error Alert if any */}
      {speechErrorMessage && sessionStage === 'reciting' && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/60 flex items-center justify-between text-rose-900 dark:text-rose-200 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{speechErrorMessage}</span>
          </div>
          <button
            onClick={() => setSpeechErrorMessage(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 5. Phase 1: Listening Audio Player Card */}
      {sessionStage === 'listening' && (
        <div className="rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-900 text-white p-5 sm:p-7 shadow-xl border border-emerald-600/30 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-800/60 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-emerald-300 font-bold block">
                  مرحلة الاستماع للآية {currentAyah?.numberInSurah}
                </span>
                <span className="text-sm font-bold text-white">
                  بصوت القارئ: {selectedReciter.nameAr}
                </span>
              </div>
            </div>

            {/* Reciter Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsReciterMenuOpen(!isReciterMenuOpen)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-emerald-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>تغيير القارئ</span>
              </button>

              <AnimatePresence>
                {isReciterMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute left-0 top-10 z-40 w-64 p-2 rounded-2xl bg-slate-900 border border-emerald-700/60 shadow-2xl text-right space-y-1"
                  >
                    <div className="text-[10px] text-slate-400 font-bold px-2 py-1 border-b border-emerald-950">
                      اختر القارئ المعتمد:
                    </div>
                    {RECITERS_LIST.map((r) => {
                      const isCur = selectedReciter.id === r.id;
                      return (
                        <button
                          key={r.id}
                          onClick={() => handleReciterChange(r)}
                          className={`w-full p-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            isCur
                              ? 'bg-emerald-800 text-white font-bold'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <span>{r.nameAr}</span>
                          {isCur && <Check className="w-3.5 h-3.5 text-emerald-300" />}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Progress Slider */}
          <div className="space-y-1.5">
            <div className="relative w-full h-2 rounded-full bg-emerald-950/60 cursor-pointer overflow-hidden"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = ((e.clientX - rect.left) / rect.width) * 100;
                handleSeekAudio(pct);
              }}
            >
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-150"
                style={{ width: `${audioProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-emerald-300/80 font-mono">
              <span>{formatSecs(audioCurrentTime)}</span>
              <span>{formatSecs(audioDuration)}</span>
            </div>
          </div>

          {/* Autoplay blocked banner (Mobile / strict policy) */}
          {userActionPrompt && (
            <div className="p-3 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-200 text-xs flex items-center justify-between">
              <span>{userActionPrompt}</span>
              <button
                onClick={handleToggleAudioPlay}
                className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>تشغيل التلاوة</span>
              </button>
            </div>
          )}

          {/* Playback Controls & Action Transition */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleAudioPlay}
                disabled={audioState === 'LOADING' || audioState === 'PREPARING'}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-slate-900 font-bold text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer disabled:opacity-60"
              >
                {audioState === 'LOADING' || audioState === 'PREPARING' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-700" />
                    <span>جاري التحميل...</span>
                  </>
                ) : audioState === 'PLAYING' ? (
                  <>
                    <Pause className="w-4 h-4 fill-current text-emerald-800" />
                    <span>إيقاف مؤقت</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current text-emerald-800" />
                    <span>استماع للآية</span>
                  </>
                )}
              </button>

              <button
                onClick={handleReplayAudio}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 hover:text-white transition-colors cursor-pointer"
                title="إعادة الاستماع من البداية"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <div className="text-[11px] text-emerald-300 font-medium px-2">
                {audioState === 'PLAYING' && 'جاري الاستماع...'}
                {audioState === 'PAUSED' && 'متوقف مؤقتًا'}
                {audioState === 'COMPLETED' && 'تم الاستماع للآية ✓'}
              </div>
            </div>

            {/* Button to proceed to Recitation */}
            <button
              onClick={handleStartRecitingStage}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-transform active:scale-95 cursor-pointer"
            >
              <Mic className="w-4 h-4 text-slate-950" />
              <span>
                {audioState === 'COMPLETED' ? 'بدء التسميع الصوتي الآن' : 'تخطي والتسميع الآن'}
              </span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 6. Active Ayah Display Card */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-emerald-950/90 border border-emerald-900/10 dark:border-emerald-800/60 shadow-lg p-6 sm:p-10 text-center min-h-[300px] flex flex-col justify-between">
        {/* Ayah Header Badge */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-emerald-900/50">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-center border border-emerald-300/40 font-mono">
              {currentAyah?.numberInSurah}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              الآية {currentAyah?.numberInSurah} من سورة {surah.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {sessionStage === 'reciting' && (
              <button
                onClick={handleSwitchToListeningStage}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-emerald-900/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="الاستماع لتلاوة الشيخ لهذه الآية مجددًا"
              >
                <Volume2 className="w-4 h-4" />
                <span>الاستماع للشيخ</span>
              </button>
            )}
          </div>
        </div>

        {/* Ayah Text / Hidden State */}
        <div className="my-8 flex items-center justify-center flex-1">
          {loadingAyahs ? (
            <div className="space-y-3 text-slate-400">
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs">جاري تحميل النص القرآني الموثق...</p>
            </div>
          ) : mode === 'recite_text_hidden' && sessionStage === 'reciting' && isListening ? (
            /* Mode 3: Text Hidden while reciting */
            <div className="space-y-3 py-6">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto shadow-inner">
                <EyeOff className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                النص مخفي لتسميع الآية من حفظك
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                اقرأ الآية من صدرك بصوت واضح، وسيتم كشف النتيجة ومطابقة الكلمات فور إتمام التلاوة.
              </p>
            </div>
          ) : (
            /* Modes 1 & 2: Show Verified Quran Text with real-time highlights */
            <div className="max-w-2xl mx-auto leading-loose font-scheherazade text-2xl sm:text-3xl text-right text-slate-900 dark:text-emerald-50">
              {alignedWords.map((word, idx) => {
                let wordClass = '';
                if (sessionStage === 'reciting' && mode === 'recite_text_visible') {
                  if (word.status === 'correct') wordClass = 'word-recitation-correct text-emerald-600 font-bold';
                  else if (word.status === 'incorrect') wordClass = 'word-recitation-incorrect text-rose-600 font-bold underline';
                  else if (word.status === 'unclear') wordClass = 'word-recitation-unclear text-amber-600';
                  else if (word.status === 'missing') wordClass = 'word-recitation-missing opacity-50';
                }

                return (
                  <span
                    key={idx}
                    className={`inline-block mx-1 transition-all ${wordClass}`}
                  >
                    {word.expectedWord}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Live Transcript Feedback (Reciting Phase) */}
        {sessionStage === 'reciting' && liveTranscript && (
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-emerald-900/30 border border-slate-200 dark:border-emerald-800/40 text-xs text-slate-700 dark:text-slate-300 text-right font-tajawal mb-4">
            <span className="text-[11px] text-slate-400 block mb-1 font-bold">
              ما تم رصده من تلاوتك:
            </span>
            <p className="line-clamp-2">{liveTranscript}</p>
          </div>
        )}

        {/* Phase 2: Speech Controls */}
        {sessionStage === 'reciting' && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-emerald-900/50">
            {/* Status Indicator */}
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isListening && !isPaused
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-500/30 animate-pulse'
                    : 'bg-slate-100 dark:bg-emerald-900 text-slate-600 dark:text-slate-300'
                }`}
              >
                {isListening && !isPaused ? (
                  <Mic className="w-5 h-5" />
                ) : (
                  <MicOff className="w-5 h-5" />
                )}
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  {isListening && !isPaused
                    ? 'جاري الاستماع لتلاوتك...'
                    : isPaused
                    ? 'التسميع متوقف مؤقتاً'
                    : 'الميكروفون متوقف'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {isListening && !isPaused
                    ? `مستوى التقاط الصوت: ${audioLevel}%`
                    : 'اضغط على زر البدء للقراءة بصوتك'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {!isListening ? (
                <button
                  onClick={startRecitation}
                  className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-transform active:scale-95 cursor-pointer"
                >
                  <Mic className="w-4 h-4" />
                  <span>بدء التسميع</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSpeechPauseToggle}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-emerald-900/40 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    <span>{isPaused ? 'متابعة' : 'إيقاف مؤقت'}</span>
                  </button>
                  <button
                    onClick={handleRetryAyah}
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-emerald-900/40 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors cursor-pointer"
                    title="إعادة محاولة هذه الآية"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleFinishAyah}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-transform active:scale-95 cursor-pointer"
                  >
                    <span>
                      {currentAyahIndex + 1 < ayahs.length ? 'الآية التالية' : 'إتمام الجلسة'}
                    </span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Helpful Guidance Footer */}
      <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-900/10 dark:border-emerald-800/40 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
        <Info className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
        <span>
          التسميع الصوتي أداة مساعدة لمراجعة الحفظ، ولا يغني عن التلقي والمراجعة مع أهل الاختصاص.
        </span>
      </div>

      {/* Microphone Permission Modal */}
      <AnimatePresence>
        {showPermissionModal && !hasMicPermission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-emerald-950 border border-emerald-900/10 dark:border-emerald-800/60 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl"
            >
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto shadow-inner">
                <Mic className="w-8 h-8" />
              </div>

              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                إذن استخدام الميكروفون للتسميع
              </h4>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                نحتاج إلى إذن الميكروفون للاستماع إلى تلاوتك ومطابقتها مع النص القرآني الموثق. تتم معالجة الصوت داخل متصفحك ولا يتم حفظ تسجيلاتك الصوتية أبدًا.
              </p>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowPermissionModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-emerald-900 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-emerald-900/30 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleRequestMic}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-700/20 cursor-pointer"
                >
                  السماح بالميكروفون
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
