import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, CheckCircle, Clock, Sparkles, BookOpen, Layers } from 'lucide-react';
import { KhatmahPlan, KhatmahPreset } from '../../../types/khatmah';
import { khatmahService } from '../../../services/khatmahService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onPlanCreated: (plan: KhatmahPlan) => void;
  currentPlan?: KhatmahPlan | null;
  userId?: string;
}

export const KhatmahPlanModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onPlanCreated,
  currentPlan,
  userId,
}) => {
  const [name, setName] = useState(currentPlan?.name || 'ختمة الشهر الفضيل');
  const [preset, setPreset] = useState<KhatmahPreset>(currentPlan?.presetType || '30_days');
  const [startDate, setStartDate] = useState(
    currentPlan?.startDate || new Date().toISOString().split('T')[0]
  );
  const [targetDate, setTargetDate] = useState(
    currentPlan?.targetDate ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [customDays, setCustomDays] = useState(40);
  const [loading, setLoading] = useState(false);

  // Live calculated metrics
  const metrics = khatmahService.calculatePlanMetrics(
    preset,
    startDate,
    preset === 'custom' ? targetDate : undefined,
    preset === 'custom' ? customDays : undefined
  );

  const presetsList: { id: KhatmahPreset; title: string; desc: string; icon: string }[] = [
    { id: '7_days', title: 'ختمة أسبوعية (7 أيام)', desc: 'معدل ~87 صفحة يومياً (حوالي 4 أجزاء ونصف)', icon: '⚡' },
    { id: '15_days', title: 'ختمة خلال 15 يوماً', desc: 'معدل ~41 صفحة يومياً (حوالي جزأين)', icon: '🌙' },
    { id: '30_days', title: 'ختمة شهرية (30 يوماً)', desc: 'معدل ~21 صفحة يومياً (جزء واحد كامل يومياً)', icon: '📖' },
    { id: '60_days', title: 'ختمة خلال 60 يوماً', desc: 'معدل ~11 صفحة يومياً (نصف جزء يومياً)', icon: '🌱' },
    { id: '90_days', title: 'ختمة ربع سنوية (90 يوماً)', desc: 'معدل ~7 صفحات يومياً (قراءة يسيرة ومستمرة)', icon: '🌿' },
    { id: 'custom', title: 'خطة مخصصة', desc: 'حدد تاريخ البداية والنهاية ومعدل القراءة بنفسك', icon: '⚙️' },
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const plan = await khatmahService.createPlan(
        {
          name: name.trim() || 'ختمة كتاب الله',
          presetType: preset,
          startDate,
          targetDate: metrics.targetDate,
          customDuration: metrics.durationDays,
        },
        userId
      );
      onPlanCreated(plan);
      onClose();
    } catch (err) {
      console.error('Error creating plan:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-white dark:bg-emerald-950 border border-emerald-900/10 dark:border-emerald-800/60 rounded-3xl shadow-2xl p-6 sm:p-8 text-right overflow-hidden my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-emerald-900/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  ابدأ ختمة جديدة
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  اختر المدة المناسبة لك لختم المصحف الشريف بدقة 604 صفحات
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-emerald-900/40"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-6 mt-6">
            {/* Plan Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                اسم الختمة
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: ختمة رمضان المبارك، ختمة التدبر..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-emerald-900/30 border border-slate-200 dark:border-emerald-800 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600"
                required
              />
            </div>

            {/* Presets Grid */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5">
                خيارات مدة الختمة
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {presetsList.map((p) => {
                  const isSelected = preset === p.id;
                  return (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => setPreset(p.id)}
                      className={`p-3.5 rounded-2xl border text-right transition-all flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 dark:bg-emerald-900/50 border-emerald-600 text-emerald-950 dark:text-white shadow-xs'
                          : 'bg-white dark:bg-emerald-950/40 border-slate-200 dark:border-emerald-900/40 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                      }`}
                    >
                      <span className="text-xl shrink-0">{p.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs">{p.title}</span>
                          {isSelected && (
                            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                          {p.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Settings if Selected */}
            {preset === 'custom' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 space-y-4"
              >
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 text-xs font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>تخصيص الختمة بحسب رغبتك</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      تاريخ البدء
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-emerald-900/50 border border-slate-200 dark:border-emerald-800 text-xs text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      تاريخ الختم المستهدف
                    </label>
                    <input
                      type="date"
                      value={targetDate}
                      min={startDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-emerald-900/50 border border-slate-200 dark:border-emerald-800 text-xs text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Live Calculation Preview Banner */}
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    الهدف اليومي
                  </span>
                  <span className="text-base font-bold text-emerald-800 dark:text-emerald-300 font-mono">
                    {metrics.pagesPerDay} صفحة / يوم
                  </span>
                </div>
                <div className="border-r border-emerald-200 dark:border-emerald-800 pr-6">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    معدل الأجزاء
                  </span>
                  <span className="text-base font-bold text-emerald-800 dark:text-emerald-300 font-mono">
                    {metrics.juzPerDay} جزء / يوم
                  </span>
                </div>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  تاريخ الختم المتوقع
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  <span>{metrics.targetDate}</span>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-emerald-900/60">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-emerald-900 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-emerald-900/30"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold shadow-md shadow-emerald-700/20 disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'جاري الاعتماد...' : 'بدء الختمة الآن'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
