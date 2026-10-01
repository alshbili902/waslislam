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
} from 'lucide-react';
import { Ayah, SurahMeta } from '../../../types';
import {
  HifzSession,
  HifzAyahResult,
  RecitationMode,
  SpeechCapabilities,
} from '../../../types/khatmah';
import { quranSpeechEngine } from '../../../services/quranSpeechEngine';
import { alignRecitationWords, calculateAyahResult } from '../../../utils/quranSpeech';
import { fetchSurahAyahs } from '../../../services/quranService';
import { useAudio } from '../../../context/AudioContext';
import { khatmahService } from '../../../services/khatmahService';
import { HifzResultScreen } from './HifzResultScreen';

interface Props {
  surah: SurahMeta;
  startAyah: number;
  endAyah: number;
  initialMode: RecitationMode;
  onExit: () => void;
  userId?: string;
}

export const HifzSessionRunner: React.FC<Props> = ({
  surah,
  startAyah,
  endAyah,
  initialMode,
  onExit,
  userId,
}) => {
  const { playAyah, isPlaying: isAudioPlaying } = useAudio();

  const [mode, setMode] = useState<RecitationMode>(initialMode);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loadingAyahs, setLoadingAyahs] = useState(true);
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);

  // Microphone & Speech State
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Session results tracking
  const [ayahResults, setAyahResults] = useState<HifzAyahResult[]>([]);
  const [completedSession, setCompletedSession] = useState<HifzSession | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Browser capability check
  const capabilities: SpeechCapabilities = quranSpeechEngine.getCapabilities();

  // 1. Fetch exact verified ayahs for the selected range
  useEffect(() => {
    let active = true;
    async function loadData() {
      setLoadingAyahs(true);
      const allAyahs = await fetchSurahAyahs(surah.number);
      if (active) {
        // Slice between startAyah and endAyah
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
  }, [surah.number, startAyah, endAyah]);

  // 2. Setup speech listeners
  useEffect(() => {
    const unsubTranscript = quranSpeechEngine.onTranscript((transcript, isFinal, confidence) => {
      setLiveTranscript(transcript);
    });

    const unsubLevel = quranSpeechEngine.onAudioLevel((level) => {
      setAudioLevel(level);
    });

    const unsubError = quranSpeechEngine.onError((msg) => {
      setErrorMessage(msg);
      setIsListening(false);
    });

    return () => {
      unsubTranscript();
      unsubLevel();
      unsubError();
      quranSpeechEngine.stop();
    };
  }, []);

  // Request Microphone permission
  const handleRequestMic = async () => {
    setShowPermissionModal(false);
    setErrorMessage(null);
    const granted = await quranSpeechEngine.requestMicrophone();
    if (granted) {
      setHasMicPermission(true);
      startRecitation();
    }
  };

  // Start active recitation
  const startRecitation = async () => {
    setErrorMessage(null);
    setLiveTranscript('');
    const started = await quranSpeechEngine.start();
    if (started) {
      setIsListening(true);
      setIsPaused(false);
    }
  };

  const handlePauseToggle = () => {
    if (isPaused) {
      quranSpeechEngine.resume();
      setIsPaused(false);
    } else {
      quranSpeechEngine.pause();
      setIsPaused(true);
    }
  };

  const handleStop = () => {
    quranSpeechEngine.stop();
    setIsListening(false);
  };

  const currentAyah = ayahs[currentAyahIndex];

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

    // Reset transcript for next ayah
    setLiveTranscript('');

    if (currentAyahIndex + 1 < ayahs.length) {
      setCurrentAyahIndex(currentAyahIndex + 1);
    } else {
      // Completed all ayahs!
      finishSession(updatedResults);
    }
  };

  // Retry current ayah
  const handleRetryAyah = () => {
    setLiveTranscript('');
    startRecitation();
  };

  // Build final session and save
  const finishSession = async (finalAyahResults: HifzAyahResult[]) => {
    quranSpeechEngine.stop();
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
      // Fallback display
      setCompletedSession({
        ...sessionPayload,
        id: 'session_' + Date.now(),
        createdAt: new Date().toISOString(),
      });
    }
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
          startTimeRef.current = Date.now();
          startRecitation();
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
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-900/50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              quranSpeechEngine.stop();
              onExit();
            }}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-emerald-900/40"
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

        {/* Mode Toggle Controls */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-emerald-900/40 text-xs">
          <button
            onClick={() => setMode('read_with_text')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              mode === 'read_with_text'
                ? 'bg-white dark:bg-emerald-800 text-emerald-950 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            قراءة مع النص
          </button>
          <button
            onClick={() => setMode('recite_text_visible')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              mode === 'recite_text_visible'
                ? 'bg-white dark:bg-emerald-800 text-emerald-950 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            تسميع والنص ظاهر
          </button>
          <button
            onClick={() => setMode('recite_text_hidden')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              mode === 'recite_text_hidden'
                ? 'bg-white dark:bg-emerald-800 text-emerald-950 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            تسميع والنص مخفي
          </button>
        </div>
      </div>

      {/* 2. Browser Warning if speech engine unavailable */}
      {!capabilities.isSupported && (
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

      {/* 3. Error Alert if any */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/60 flex items-center justify-between text-rose-900 dark:text-rose-200 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4. Active Ayah Display Card */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-emerald-950/90 border border-emerald-900/10 dark:border-emerald-800/60 shadow-lg p-6 sm:p-10 text-center min-h-[320px] flex flex-col justify-between">
        {/* Ayah Header Badge */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-emerald-900/50">
          <span className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-center border border-emerald-300/40 font-mono">
            {currentAyah?.numberInSurah}
          </span>

          <div className="flex items-center gap-2">
            {currentAyah && (
              <button
                onClick={() => playAyah(surah, currentAyah)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-emerald-900/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="استماع لتلاوة القارئ لهذه الآية"
              >
                <Volume2 className="w-4 h-4" />
                <span>استماع للآية</span>
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
          ) : mode === 'recite_text_hidden' && isListening ? (
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
                if (mode === 'recite_text_visible') {
                  if (word.status === 'correct') wordClass = 'word-recitation-correct';
                  else if (word.status === 'incorrect') wordClass = 'word-recitation-incorrect';
                  else if (word.status === 'unclear') wordClass = 'word-recitation-unclear';
                  else if (word.status === 'missing') wordClass = 'word-recitation-missing';
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

        {/* Transcript Live Preview (Subtle feedback) */}
        {liveTranscript && (
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-emerald-900/30 border border-slate-200 dark:border-emerald-800/40 text-xs text-slate-700 dark:text-slate-300 text-right font-tajawal mb-4">
            <span className="text-[11px] text-slate-400 block mb-1 font-bold">
              ما تم رصده من تلاوتك:
            </span>
            <p className="line-clamp-2">{liveTranscript}</p>
          </div>
        )}

        {/* Recording Controls & Microphone Indicator */}
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
                  : 'اضغط على زر البدء للقراءة'}
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
                  onClick={handlePauseToggle}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-emerald-900/40 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  <span>{isPaused ? 'متابعة' : 'إيقاف مؤقت'}</span>
                </button>
                <button
                  onClick={handleRetryAyah}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-emerald-900/40 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors"
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
      </div>

      {/* Teacher Disclaimer */}
      <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40 flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300">
        <Info className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
        <span>
          التسميع الصوتي أداة مساعدة لمراجعة الحفظ، ولا يغني عن التلقي والمراجعة مع أهل الاختصاص.
        </span>
      </div>

      {/* 5. Microphone Permission Modal (Requirement 12) */}
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
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-emerald-900 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-emerald-900/30"
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
