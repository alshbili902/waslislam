import React, { useState } from 'react';
import { Layers, RotateCcw, Volume2, VolumeX, Sparkles, Check, Flame, Vibrate, VibrateOff } from 'lucide-react';
import { TASBIH_PRESETS } from '../data/calendarEvents';
import { useUser } from '../context/UserContext';

export const TasbihView: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState(TASBIH_PRESETS[0]);
  const [count, setCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [pulseKey, setPulseKey] = useState(0);

  const { tasbihTotal, incrementTasbihTotal } = useUser();

  const handleTap = () => {
    const nextCount = count + 1;
    setCount(nextCount);
    incrementTasbihTotal(1);
    setPulseKey((prev) => prev + 1);

    // Audio click effect using Web Audio API
    if (soundEnabled && typeof window !== 'undefined') {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(620, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(420, audioCtx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.09, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.055);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.06);
      } catch {
        // ignore audio context failures
      }
    }

    // Subtle haptic vibration feedback for tactile feel
    if (hapticEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(20);
      } catch {
        // ignore
      }
    }

    // Target reached
    if (nextCount >= selectedPreset.targetCount) {
      setCyclesCompleted((c) => c + 1);
      setCount(0);
      if (hapticEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([35, 45, 35, 45, 65]);
        } catch {
          // ignore
        }
      }
    }
  };

  const handleReset = () => {
    setCount(0);
  };

  const progressPercent = Math.min(100, Math.round((count / selectedPreset.targetCount) * 100));

  return (
    <div className="space-y-6 pb-16 max-w-3xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 sm:p-6 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              المسبحة الإلكترونية الذكية
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            عداد إلكتروني متقدم للأذكار مع النبض البصري والتغذية الصوتية والاهتزاز اللمسي.
          </p>
        </div>

        {/* Audio and Haptic Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setHapticEnabled(!hapticEnabled)}
            className={`p-2.5 rounded-xl border transition-colors ${
              hapticEnabled
                ? 'bg-amber-50 dark:bg-amber-900/40 border-amber-500/30 text-amber-700 dark:text-amber-300'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
            }`}
            title={hapticEnabled ? 'تعطيل الاهتزاز اللمسي' : 'تفعيل الاهتزاز اللمسي'}
          >
            {hapticEnabled ? <Vibrate className="w-5 h-5" /> : <VibrateOff className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border transition-colors ${
              soundEnabled
                ? 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-600/30 text-emerald-800 dark:text-emerald-200'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
            }`}
            title={soundEnabled ? 'كتم صوت النقرة' : 'تفعيل صوت النقرة'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Presets Badges */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {TASBIH_PRESETS.map((preset) => {
          const isSelected = selectedPreset.id === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => {
                setSelectedPreset(preset);
                setCount(0);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-white dark:bg-emerald-950/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-emerald-800'
              }`}
            >
              <span>{preset.textAr}</span>
              <span className="mr-1 text-[10px] opacity-75">({preset.targetCount})</span>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Counter Circle */}
      <div className="bg-white dark:bg-emerald-950/80 rounded-3xl p-8 sm:p-12 border border-emerald-900/10 dark:border-emerald-800/50 shadow-md text-center flex flex-col items-center justify-center relative overflow-hidden">
        {/* Preset Info */}
        <div className="space-y-1 mb-8 max-w-md">
          <h2 className="font-amiri text-2xl sm:text-3xl font-bold text-emerald-950 dark:text-emerald-100">
            {selectedPreset.textAr}
          </h2>
          <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
            {selectedPreset.fadhilAr}
          </p>
        </div>

        {/* Big Tap Area with .tasbih-counter selector and tactile pulse animation */}
        <div
          id="tasbih-counter"
          onClick={handleTap}
          role="button"
          tabIndex={0}
          aria-label="عداد التسبيح الرقمي"
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              handleTap();
            }
          }}
          className="tasbih-counter relative w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 flex flex-col items-center justify-center cursor-pointer shadow-2xl hover:brightness-105 active:scale-[0.93] transition-all duration-100 select-none border-4 border-amber-400/40 group outline-none focus-visible:ring-4 focus-visible:ring-amber-400"
        >
          {/* Visual Pulse Waves on each tap */}
          {pulseKey > 0 && (
            <>
              <span
                key={`pulse-ring-${pulseKey}`}
                className="animate-tasbih-pulse pointer-events-none absolute -inset-3 rounded-full border-2 border-amber-400/80"
              />
              <span
                key={`pulse-glow-${pulseKey}`}
                className="animate-tasbih-pulse pointer-events-none absolute inset-0 rounded-full bg-amber-400/25"
              />
            </>
          )}

          {/* Progress Ring Overlay */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
            <circle
              cx="50%"
              cy="50%"
              r="46%"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="50%"
              cy="50%"
              r="46%"
              stroke="#fbbf24"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray="290"
              strokeDashoffset={290 - (290 * progressPercent) / 100}
              strokeLinecap="round"
              className="transition-all duration-150"
            />
          </svg>

          <span className="text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
            الهدف: {selectedPreset.targetCount}
          </span>
          <span
            key={`count-num-${count}`}
            className="animate-number-pop font-mono text-5xl sm:text-6xl font-bold text-white tracking-tight"
          >
            {count}
          </span>
          <span className="text-xs text-emerald-100 mt-2 font-medium group-hover:underline">
            انقر هنا للتسبيح
          </span>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-6 mt-8">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-emerald-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-emerald-900 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>تصفير الدورة</span>
          </button>

          {cyclesCompleted > 0 && (
            <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>أتممت {cyclesCompleted} دورة</span>
            </div>
          )}
        </div>

        {/* Lifetime user stats footer */}
        <div className="w-full mt-8 pt-6 border-t border-slate-100 dark:border-emerald-900/60 flex items-center justify-around text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block mb-1">نسبة إنجاز الورد</span>
            <strong className="text-base font-mono text-emerald-700 dark:text-amber-300">
              {progressPercent}%
            </strong>
          </div>
          <div className="w-px h-8 bg-slate-200 dark:bg-emerald-900" />
          <div>
            <span className="text-slate-500 dark:text-slate-400 block mb-1">إجمالي تسبيحاتك التراكمية</span>
            <strong className="text-base font-mono text-emerald-700 dark:text-amber-300">
              {tasbihTotal.toLocaleString()} تسبيحة
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
