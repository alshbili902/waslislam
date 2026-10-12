'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  RotateCcw, 
  Undo2, 
  Volume2, 
  VolumeX, 
  Vibrate, 
  Target, 
  CheckCircle2, 
  Bookmark, 
  Plus, 
  Settings2,
  Sparkles,
  HeartHandshake
} from 'lucide-react';
import { localStore } from '../../lib/supabase';
import { recordGoalProgress } from '../../utils/dailyWorshipManager';

export interface DhikrPreset {
  id: string;
  textAr: string;
  textEn: string;
  fadlAr?: string;
  defaultTarget: number;
}

export const DHIKR_PRESETS: DhikrPreset[] = [
  { id: 'subhanallah', textAr: 'سُبْحَانَ اللَّهِ', textEn: 'Subhan Allah', fadlAr: 'غراس الجنة، وأحب الكلام إلى الله', defaultTarget: 33 },
  { id: 'alhamdulillah', textAr: 'الْحَمْدُ لِلَّهِ', textEn: 'Alhamdulillah', fadlAr: 'تملأ الميزان بالخير والبركة', defaultTarget: 33 },
  { id: 'allahuakbar', textAr: 'اللَّهُ أَكْبَرُ', textEn: 'Allahu Akbar', fadlAr: 'تكبير وتوحيد لعظمة الله عز وجل', defaultTarget: 34 },
  { id: 'lailahaillallah', textAr: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ', textEn: 'La ilaha illa Allah', fadlAr: 'أفضل الذكر ولا إله إلا الله', defaultTarget: 100 },
  { id: 'astaghfirullah', textAr: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ', textEn: 'Astaghfirullah', fadlAr: 'ممحاة للذنوب ومجلبة للرزق والسكينة', defaultTarget: 100 },
  { id: 'salawat', textAr: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ', textEn: 'Salawat on the Prophet', fadlAr: 'من صلى عليَّ صلاة صلى الله عليه بها عشراً', defaultTarget: 100 },
  { id: 'lahawla', textAr: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', textEn: 'La hawla wa la quwwata illa billah', fadlAr: 'كنز من كنوز الجنة', defaultTarget: 100 },
  { id: 'subhanallahi_wabihamdihi', textAr: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ', textEn: 'Subhan Allahi wa bihamdihi', fadlAr: 'كلمتان خفيفتان على اللسان ثقيلتان في الميزان', defaultTarget: 100 },
  { id: 'custom', textAr: 'ذِكْرٌ مُخَصَّص', textEn: 'Custom Dhikr', fadlAr: 'اذكر الله قياماً وقعوداً وعلى جنوبكم', defaultTarget: 33 },
];

interface DigitalTasbeehProps {
  isEnglish?: boolean;
}

export const DigitalTasbeeh: React.FC<DigitalTasbeehProps> = ({ isEnglish = false }) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(() => 
    localStore.get('tasbeeh_preset_id', 'subhanallah')
  );
  const [customText, setCustomText] = useState<string>(() => 
    localStore.get('tasbeeh_custom_text', '')
  );
  const [count, setCount] = useState<number>(() => 
    localStore.get('tasbeeh_count', 0)
  );
  const [target, setTarget] = useState<number>(() => 
    localStore.get('tasbeeh_target', 33)
  );
  const [rounds, setRounds] = useState<number>(() => 
    localStore.get('tasbeeh_rounds', 0)
  );
  const [totalLifetime, setTotalLifetime] = useState<number>(() => 
    localStore.get('tasbeeh_total_lifetime', 0)
  );
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => 
    localStore.get('tasbeeh_sound_enabled', false)
  );
  const [hapticEnabled, setHapticEnabled] = useState<boolean>(() => 
    localStore.get('tasbeeh_haptic_enabled', true)
  );
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const activePreset = DHIKR_PRESETS.find(p => p.id === selectedPresetId) || DHIKR_PRESETS[0];

  // Save changes to localStore
  useEffect(() => {
    localStore.set('tasbeeh_count', count);
    localStore.set('tasbeeh_preset_id', selectedPresetId);
    localStore.set('tasbeeh_target', target);
    localStore.set('tasbeeh_rounds', rounds);
    localStore.set('tasbeeh_total_lifetime', totalLifetime);
    localStore.set('tasbeeh_sound_enabled', soundEnabled);
    localStore.set('tasbeeh_haptic_enabled', hapticEnabled);
    localStore.set('tasbeeh_custom_text', customText);
  }, [count, selectedPresetId, target, rounds, totalLifetime, soundEnabled, hapticEnabled, customText]);

  // Gentle audio chime synthesis using Web Audio API
  const playClickSound = useCallback((isTargetReached = false) => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (isTargetReached) {
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else {
        osc.frequency.setValueAtTime(540, ctx.currentTime); // Gentle wood-like tap
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      }
    } catch {
      // Audio not permitted or interrupted, silently fail
    }
  }, [soundEnabled]);

  const triggerHaptic = useCallback((isTargetReached = false) => {
    if (!hapticEnabled || typeof navigator === 'undefined' || !navigator.vibrate) return;
    try {
      if (isTargetReached) {
        navigator.vibrate([40, 60, 40]);
      } else {
        navigator.vibrate(15);
      }
    } catch {
      // Haptics not supported or blocked
    }
  }, [hapticEnabled]);

  const handleIncrement = () => {
    const nextCount = count + 1;
    const reachedTarget = target > 0 && nextCount >= target;

    if (reachedTarget) {
      setCount(0);
      setRounds(r => r + 1);
      playClickSound(true);
      triggerHaptic(true);
      // Also register progress towards daily worship tasbeeh goal
      recordGoalProgress('tasbeeh_100', 1);
    } else {
      setCount(nextCount);
      playClickSound(false);
      triggerHaptic(false);
    }

    setTotalLifetime(t => t + 1);
  };

  const handleUndo = () => {
    if (count > 0) {
      setCount(c => c - 1);
      setTotalLifetime(t => Math.max(0, t - 1));
      triggerHaptic(false);
    } else if (rounds > 0 && target > 0) {
      setRounds(r => r - 1);
      setCount(target - 1);
      setTotalLifetime(t => Math.max(0, t - 1));
    }
  };

  const handleResetConfirm = () => {
    setCount(0);
    setRounds(0);
    setShowResetConfirm(false);
    triggerHaptic(false);
  };

  const handleSelectPreset = (preset: DhikrPreset) => {
    setSelectedPresetId(preset.id);
    if (preset.id !== 'custom') {
      setTarget(preset.defaultTarget);
    }
    setCount(0);
  };

  const progressPercent = target > 0 ? Math.min(100, Math.round((count / target) * 100)) : 0;
  const displayText = selectedPresetId === 'custom' && customText.trim()
    ? customText
    : (isEnglish ? activePreset.textEn : activePreset.textAr);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[var(--gold-light)] flex items-center justify-center text-[var(--gold)]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold font-amiri text-[var(--text-main)]">
              {isEnglish ? 'Digital Tasbeeh' : 'المسبحة الإلكترونية المباركة'}
            </h2>
            <p className="text-xs text-[var(--text-muted)] font-tajawal">
              {isEnglish ? 'Remember Allah in every moment' : 'ألا بذكر الله تطمئن القلوب'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Sound toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition-colors ${
              soundEnabled 
                ? 'bg-[var(--gold-light)] text-[var(--gold)] border-[var(--border-gold)]' 
                : 'text-[var(--text-muted)] border-[var(--border-color)] hover:bg-[var(--bg-card-subtle)]'
            }`}
            title={isEnglish ? 'Sound feedback' : 'الصوت التنبيهي'}
            aria-label="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Haptic toggle */}
          <button
            onClick={() => setHapticEnabled(!hapticEnabled)}
            className={`p-2 rounded-xl border transition-colors ${
              hapticEnabled 
                ? 'bg-[var(--primary-light)] text-[var(--text-primary)] border-[var(--border-color)]' 
                : 'text-[var(--text-muted)] border-[var(--border-color)] hover:bg-[var(--bg-card-subtle)]'
            }`}
            title={isEnglish ? 'Haptic vibration' : 'الاهتزاز اللمسي'}
            aria-label="Toggle Vibration"
          >
            <Vibrate className="w-4 h-4" />
          </button>

          {/* Config Drawer toggle */}
          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`p-2 rounded-xl border transition-colors ${
              showConfig 
                ? 'bg-[var(--gold-light)] text-[var(--gold)] border-[var(--border-gold)]' 
                : 'text-[var(--text-muted)] border-[var(--border-color)] hover:bg-[var(--bg-card-subtle)]'
            }`}
            title={isEnglish ? 'Settings' : 'خيارات المسبحة'}
            aria-label="Tasbeeh Settings"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preset Selector Carousel */}
      <div className="overflow-x-auto no-scrollbar flex items-center gap-2 pb-1">
        {DHIKR_PRESETS.map((p) => {
          const isSelected = p.id === selectedPresetId;
          return (
            <button
              key={p.id}
              onClick={() => handleSelectPreset(p)}
              className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                isSelected
                  ? 'bg-gradient-to-r from-[var(--emerald-deep)] to-[var(--primary-dark)] text-white border-[var(--border-gold)] shadow-md'
                  : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-color)] hover:border-[var(--gold)]'
              }`}
            >
              {isEnglish ? p.textEn : p.textAr.split(' ')[0] + ' ' + (p.textAr.split(' ')[1] || '')}
            </button>
          );
        })}
      </div>

      {/* Settings & Customization Drawer (Collapsible) */}
      {showConfig && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-gold)]/40 rounded-2xl p-4 space-y-4 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-main)]">
            <span className="flex items-center gap-1.5">
              <Target className="w-4 h-4 text-[var(--gold)]" />
              {isEnglish ? 'Target Count' : 'العدد المستهدف للدورة:'}
            </span>
            <div className="flex items-center gap-1">
              {[33, 100, 500, 1000].map(val => (
                <button
                  key={val}
                  onClick={() => setTarget(val)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                    target === val
                      ? 'bg-[var(--gold)] text-black border-[var(--gold)]'
                      : 'border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--gold)]'
                  }`}
                >
                  {val}
                </button>
              ))}
              <button
                onClick={() => setTarget(0)}
                className={`px-2 py-1 rounded-lg text-xs font-bold border ${
                  target === 0
                    ? 'bg-[var(--gold)] text-black border-[var(--gold)]'
                    : 'border-[var(--border-color)] text-[var(--text-muted)]'
                }`}
                title={isEnglish ? 'Unlimited' : 'مفتوح دون حد'}
              >
                {isEnglish ? 'Open' : 'مفتوح'}
              </button>
            </div>
          </div>

          {selectedPresetId === 'custom' && (
            <div className="space-y-1.5 pt-2 border-t border-[var(--border-color)]">
              <label className="text-xs font-bold text-[var(--text-muted)]">
                {isEnglish ? 'Custom Dhikr Text:' : 'نص الذكر المخصص:'}
              </label>
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder={isEnglish ? 'Type your custom dhikr...' : 'اكتب الذكر أو الدعاء المفضل...'}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-card-subtle)] text-[var(--text-main)] focus:outline-none focus:border-[var(--gold)]"
              />
            </div>
          )}
        </div>
      )}

      {/* Main Interactive Counter Card */}
      <div className="relative bg-gradient-to-b from-[var(--bg-card)] via-[var(--bg-card)] to-[var(--bg-card-subtle)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 shadow-lg text-center space-y-6 overflow-hidden">
        {/* Subtle Decorative Pattern */}
        <div className="absolute inset-0 bg-radial-vignette opacity-20 pointer-events-none" />

        {/* Selected Dhikr Display */}
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--gold-light)] border border-[var(--border-gold)]/40 text-[var(--gold)] text-xs font-bold">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>{isEnglish ? 'Active Dhikr' : 'الذكر الحالي'}</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold font-amiri text-[var(--text-main)] leading-relaxed px-2">
            {displayText}
          </h1>

          {activePreset.fadlAr && !isEnglish && (
            <p className="text-xs text-[var(--text-muted)] font-tajawal max-w-md mx-auto leading-normal">
              {activePreset.fadlAr}
            </p>
          )}
        </div>

        {/* Circular Progress & Click Area */}
        <div className="relative z-10 flex flex-col items-center justify-center pt-2 pb-4">
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke="currentColor"
                strokeWidth="4"
                className="text-[var(--border-color)] opacity-40 fill-transparent"
              />
              {target > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  stroke="var(--gold)"
                  strokeWidth="5"
                  strokeDasharray={276.46}
                  strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
                  strokeLinecap="round"
                  className="fill-transparent transition-all duration-300 ease-out"
                />
              )}
            </svg>

            {/* Huge Tap Target Button */}
            <button
              onClick={handleIncrement}
              className="absolute inset-4 rounded-full bg-gradient-to-b from-[var(--primary-light)] to-[var(--bg-card)] border-2 border-[var(--border-gold)]/60 hover:border-[var(--gold)] active:scale-95 shadow-inner transition-all flex flex-col items-center justify-center p-4 group select-none cursor-pointer focus:outline-none"
              aria-label="Tap to count"
            >
              <span className="text-5xl sm:text-6xl font-extrabold font-tajawal text-[var(--text-main)] group-hover:text-[var(--gold)] transition-colors">
                {count}
              </span>
              <span className="text-xs font-semibold text-[var(--text-muted)] mt-1">
                {target > 0 ? `${count} / ${target}` : (isEnglish ? 'Tap' : 'انقر للعد')}
              </span>
              <span className="text-[10px] text-[var(--gold)] opacity-70 mt-0.5 font-bold uppercase tracking-wider">
                {isEnglish ? 'Tap anywhere' : 'اضغط للزيادة'}
              </span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[var(--border-color)] text-center">
          <div className="p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
            <div className="text-[10px] font-semibold text-[var(--text-muted)]">
              {isEnglish ? 'Rounds Done' : 'الدورات المكتملة'}
            </div>
            <div className="text-base font-bold text-[var(--gold)] mt-0.5">
              {rounds}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
            <div className="text-[10px] font-semibold text-[var(--text-muted)]">
              {isEnglish ? 'Session Target' : 'الهدف الحالي'}
            </div>
            <div className="text-base font-bold text-[var(--text-main)] mt-0.5">
              {target > 0 ? target : '∞'}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
            <div className="text-[10px] font-semibold text-[var(--text-muted)]">
              {isEnglish ? 'Total Dhikr' : 'مجموع التسبيحات'}
            </div>
            <div className="text-base font-bold text-[var(--text-primary)] mt-0.5">
              {totalLifetime}
            </div>
          </div>
        </div>

        {/* Reset & Undo Controls */}
        <div className="flex items-center justify-between pt-2">
          {/* Undo Button */}
          <button
            onClick={handleUndo}
            disabled={count === 0 && rounds === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)] disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <Undo2 className="w-4 h-4" />
            <span>{isEnglish ? 'Undo' : 'تراجع (-1)'}</span>
          </button>

          {/* Reset Button */}
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-[var(--border-color)] text-red-500/80 hover:text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isEnglish ? 'Reset' : 'تصفير'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-muted)]">
                {isEnglish ? 'Sure?' : 'تأكيد التصفير؟'}
              </span>
              <button
                onClick={handleResetConfirm}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                {isEnglish ? 'Yes' : 'نعم'}
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-2 py-1 rounded-lg text-xs font-bold border border-[var(--border-color)] text-[var(--text-muted)] hover:bg-[var(--bg-card-subtle)]"
              >
                {isEnglish ? 'Cancel' : 'إلغاء'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
