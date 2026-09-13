import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Heart,
  Layers,
  Eye,
  ShieldCheck,
  RefreshCw,
  Search,
} from 'lucide-react';
import { DailyWird, DailyWirdItem } from '../../types/wird';
import { SURAHS_LIST } from '../../data/quranMetadata';
import { AZKAR_DATA } from '../../data/azkarData';
import { HADITH_DATA } from '../../data/hadithData';
import { DUA_DATA } from '../../data/duaData';
import { VERIFIED_TASBIH_PHRASES, VERIFIED_QURAN_PORTIONS } from '../../services/wirdService';
import { useModalScrollLock } from '../../hooks/useModalScrollLock';

export const AdminWirdManager: React.FC = () => {
  const [wirdsList, setWirdsList] = useState<DailyWird[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWird, setEditingWird] = useState<DailyWird | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [formDate, setFormDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1); // default to tomorrow
    return d.toISOString().split('T')[0];
  });
  const [formTitle, setFormTitle] = useState('ورد اليوم');
  const [formSubtitle, setFormSubtitle] = useState('خذ من يومك دقائق تقرّبك إلى الله');
  const [formStatus, setFormStatus] = useState<'published' | 'draft'>('published');
  const [isFriday, setIsFriday] = useState(false);
  const [isRamadan, setIsRamadan] = useState(false);

  // Quran item state
  const [selectedQuranPortionId, setSelectedQuranPortionId] = useState(VERIFIED_QURAN_PORTIONS[0].id);

  // Dhikr item state
  const [selectedDhikrId, setSelectedDhikrId] = useState(AZKAR_DATA[0].id);

  // Hadith item state
  const [selectedHadithId, setSelectedHadithId] = useState(HADITH_DATA[0].id);

  // Dua item state
  const [selectedDuaId, setSelectedDuaId] = useState(DUA_DATA[0].id);

  // Tasbih item state
  const [selectedTasbihIdx, setSelectedTasbihIdx] = useState(0);

  useModalScrollLock(isModalOpen, {
    onClose: () => setIsModalOpen(false),
    closeOnEsc: true,
  });

  const fetchWirds = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/wird');
      if (res.ok) {
        const data = await res.json();
        setWirdsList(data.wirds || []);
      }
    } catch (err) {
      console.error('Failed to fetch admin wirds:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWirds();
  }, []);

  const openCreateModal = () => {
    setEditingWird(null);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    setFormDate(tomorrowStr);
    setFormTitle('ورد اليوم');
    setFormSubtitle('خذ من يومك دقائق تقرّبك إلى الله');
    setFormStatus('published');
    setIsFriday(tomorrow.getDay() === 5);
    setIsRamadan(false);
    setSelectedQuranPortionId(VERIFIED_QURAN_PORTIONS[1].id);
    setSelectedDhikrId(AZKAR_DATA[0].id);
    setSelectedHadithId(HADITH_DATA[0].id);
    setSelectedDuaId(DUA_DATA[0].id);
    setSelectedTasbihIdx(0);
    setIsModalOpen(true);
  };

  const openEditModal = (wird: DailyWird) => {
    setEditingWird(wird);
    setFormDate(wird.date);
    setFormTitle(wird.title);
    setFormSubtitle(wird.subtitle);
    setFormStatus(wird.status === 'draft' ? 'draft' : 'published');
    setIsFriday(wird.isFriday);
    setIsRamadan(wird.isRamadan);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    // Build verified items
    const qPortion = VERIFIED_QURAN_PORTIONS.find((p) => p.id === selectedQuranPortionId) || VERIFIED_QURAN_PORTIONS[1];
    const dhikr = AZKAR_DATA.find((d) => d.id === selectedDhikrId) || AZKAR_DATA[0];
    const hadith = HADITH_DATA.find((h) => h.id === selectedHadithId) || HADITH_DATA[0];
    const dua = DUA_DATA.find((d) => d.id === selectedDuaId) || DUA_DATA[0];
    const tasbih = VERIFIED_TASBIH_PHRASES[selectedTasbihIdx] || VERIFIED_TASBIH_PHRASES[0];

    const items: DailyWirdItem[] = [
      {
        id: `wird-item-quran-${formDate}`,
        type: 'quran',
        titleAr: `الجزء الأول: تلاوة من سورة ${qPortion.surahNameAr}`,
        subtitleAr: `الآيات (${qPortion.startAyah} - ${qPortion.endAyah}) • الجزء ${qPortion.juzNumber}`,
        sortOrder: 1,
        targetCount: 1,
        isVerified: true,
        sourceReference: `سورة ${qPortion.surahNameAr} [${qPortion.startAyah}-${qPortion.endAyah}]`,
        quranData: {
          surahNumber: qPortion.surahNumber,
          surahNameAr: qPortion.surahNameAr,
          startAyah: qPortion.startAyah,
          endAyah: qPortion.endAyah,
          ayahText: qPortion.textAr,
          juzNumber: qPortion.juzNumber,
          pageNumber: qPortion.pageNumber,
          tafsirShort: qPortion.tafsirShort,
        },
      },
      {
        id: `wird-item-dhikr-${formDate}`,
        type: 'dhikr',
        titleAr: 'الجزء الثاني: أذكار اليوم المأثورة',
        subtitleAr: `تكرار: ${dhikr.repeatCount} مرات • ${dhikr.sourceAr}`,
        sortOrder: 2,
        targetCount: dhikr.repeatCount || 1,
        isVerified: true,
        sourceReference: dhikr.sourceAr,
        dhikrData: {
          dhikrId: dhikr.id,
          categorySlug: dhikr.categoryId,
          categoryNameAr: 'أذكار اليوم',
          textAr: dhikr.textAr,
          sourceAr: dhikr.sourceAr,
          benefitAr: dhikr.benefitAr,
          repeatTarget: dhikr.repeatCount || 1,
        },
      },
      {
        id: `wird-item-hadith-${formDate}`,
        type: 'hadith',
        titleAr: 'الجزء الثالث: حديث اليوم الصحيح',
        subtitleAr: `${hadith.gradingAr} • رواه ${hadith.narratorAr}`,
        sortOrder: 3,
        targetCount: 1,
        isVerified: true,
        sourceReference: `${hadith.collectionAr} (${hadith.hadithNumber || ''})`,
        hadithData: {
          hadithId: hadith.id,
          collectionAr: hadith.collectionAr,
          bookAr: hadith.bookAr,
          hadithNumber: hadith.hadithNumber,
          narratorAr: hadith.narratorAr,
          textAr: hadith.textAr,
          explanationAr: hadith.explanationAr,
          gradingAr: hadith.gradingAr,
        },
      },
      {
        id: `wird-item-dua-${formDate}`,
        type: 'dua',
        titleAr: 'الجزء الرابع: دعاء اليوم المأثور',
        subtitleAr: dua.titleAr,
        sortOrder: 4,
        targetCount: 1,
        isVerified: true,
        sourceReference: dua.sourceAr,
        duaData: {
          duaId: dua.id,
          titleAr: dua.titleAr,
          textAr: dua.textAr,
          sourceAr: dua.sourceAr,
          benefitAr: dua.benefitAr,
        },
      },
      {
        id: `wird-item-tasbih-${formDate}`,
        type: 'tasbih',
        titleAr: 'الجزء الخامس: التسبيح والمسبحة الإلكترونية',
        subtitleAr: `الهدف اليومي: ${tasbih.target} تكراراً`,
        sortOrder: 5,
        targetCount: tasbih.target,
        isVerified: true,
        sourceReference: tasbih.virtue,
        tasbihData: {
          phraseAr: tasbih.phraseAr,
          targetCount: tasbih.target,
          virtueAr: tasbih.virtue,
        },
      },
    ];

    try {
      const res = await fetch('/api/admin/wird', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingWird?.id,
          date: formDate,
          title: formTitle,
          subtitle: formSubtitle,
          status: formStatus,
          isFriday,
          isRamadan,
          items,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: 'error', text: data.error || 'فشل حفظ ورد اليوم' });
        return;
      }

      setFeedback({ type: 'success', text: 'تم حفظ ورد اليوم الموثق بنجاح' });
      setIsModalOpen(false);
      fetchWirds();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'خطأ في الاتصال' });
    }
  };

  const handleDelete = async (id: string, date: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف الورد المجدول لتاريخ ${date}؟`)) return;
    try {
      const res = await fetch(`/api/admin/wird/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setFeedback({ type: 'success', text: 'تم حذف الورد بنجاح' });
        fetchWirds();
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch {
      setFeedback({ type: 'error', text: 'فشل الحذف' });
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-emerald-900/30 p-5 rounded-2xl border border-emerald-500/20">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            إدارة ورد اليوم الموثق (Daily Wird)
          </h2>
          <p className="text-xs text-emerald-200/80 mt-1">
            جدولة وإدارة وتخصيص الأوراد اليومية مع الالتزام الحصري بالمصادر الشرعية المعتمدة.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchWirds}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-200 transition-colors"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-lg transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            جدولة ورد يومي جديد
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {feedback.text}
        </div>
      )}

      {/* Info Card */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>ملاحظة هامة:</strong> النظام يعمل افتراضياً بنظام الدوران الحتمي الموثق لجميع التواريخ (بما فيها الجمعة ورمضان). إضافة ورد هنا يُتيح لك تخصيص ورد لتاريخ محدد كجدولة خاصة ذات أولوية. جميع المحتويات تخضع للتحقق الشرعي الصارم.
        </p>
      </div>

      {/* Scheduled Table */}
      <div className="bg-[#042820] border border-emerald-500/20 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-emerald-900/40 flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-200">
            الأوراد المجدولة مسبقاً ({wirdsList.length})
          </span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-emerald-300 animate-pulse">
            جاري تحميل الأوراد...
          </div>
        ) : wirdsList.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-300">
              لا توجد أوراد مجدولة يدوياً بعد
            </p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              يعمل النظام تلقائياً بالمحرك الحتمي الموثق لليوم والجمعة ورمضان. يمكنك الضغط على "جدولة ورد يومي جديد" لتخصيص تاريخ محدد.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs text-slate-200">
              <thead className="bg-emerald-950/60 text-emerald-300 font-semibold border-b border-emerald-900/40">
                <tr>
                  <th className="p-3">التاريخ</th>
                  <th className="p-3">العنوان</th>
                  <th className="p-3">النوع</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3">العناصر</th>
                  <th className="p-3 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-900/30">
                {wirdsList.map((w) => (
                  <tr key={w.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-mono font-bold text-amber-300">{w.date}</td>
                    <td className="p-3 font-medium text-white">{w.title}</td>
                    <td className="p-3">
                      {w.isFriday ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                          جمعة
                        </span>
                      ) : w.isRamadan ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                          رمضان
                        </span>
                      ) : (
                        <span className="text-slate-400">اعتيادي</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          w.status === 'published'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {w.status === 'published' ? 'منشور' : 'مسودة'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{w.items?.length || 0} أجزاء موثقة</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(w)}
                          className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 transition-colors"
                          title="تعديل"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(w.id, w.date)}
                          className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#032019] border border-emerald-500/30 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-5 text-right my-8 max-h-[90vh] overflow-y-auto scrollbar-thin">
            <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                {editingWird ? 'تعديل ورد اليوم المجدول' : 'جدولة ورد يومي موثق جديد'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-emerald-200 font-medium mb-1">
                    تاريخ الورد (YYYY-MM-DD) *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-emerald-700/50 text-white font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-emerald-200 font-medium mb-1">
                    حالة النشر *
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e: any) => setFormStatus(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-emerald-700/50 text-white text-sm"
                  >
                    <option value="published">منشور (يظهر للمستخدمين فور حلول التاريخ)</option>
                    <option value="draft">مسودة (غير معروض)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-emerald-200 font-medium mb-1">العنوان الرئيسي</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-emerald-700/50 text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-emerald-200 font-medium mb-1">العنوان الفرعي</label>
                  <input
                    type="text"
                    value={formSubtitle}
                    onChange={(e) => setFormSubtitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-emerald-700/50 text-white text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 p-3 rounded-xl bg-black/20 border border-emerald-900/40">
                <label className="flex items-center gap-2 cursor-pointer text-emerald-200">
                  <input
                    type="checkbox"
                    checked={isFriday}
                    onChange={(e) => setIsFriday(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-400"
                  />
                  <span>نمط الجمعة (ورد يوم الجمعة)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-emerald-200">
                  <input
                    type="checkbox"
                    checked={isRamadan}
                    onChange={(e) => setIsRamadan(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-400"
                  />
                  <span>نمط رمضان (ورد رمضان)</span>
                </label>
              </div>

              {/* SECTIONS SELECTION */}
              <div className="space-y-3 pt-2 border-t border-emerald-900/50">
                <h4 className="text-sm font-bold text-amber-300">
                  اختيار المحتويات الموثقة للأجزاء الخمسة:
                </h4>

                {/* Part 1: Quran */}
                <div className="p-3 rounded-xl bg-black/30 border border-emerald-800/40 space-y-1.5">
                  <label className="block font-semibold text-emerald-300">
                    1. الجزء الأول: تلاوة القرآن الكريم (موثق)
                  </label>
                  <select
                    value={selectedQuranPortionId}
                    onChange={(e) => setSelectedQuranPortionId(e.target.value)}
                    className="w-full p-2 rounded-lg bg-black/50 border border-emerald-700/40 text-white text-xs"
                  >
                    {VERIFIED_QURAN_PORTIONS.map((p) => (
                      <option key={p.id} value={p.id}>
                        سورة {p.surahNameAr} (الآيات {p.startAyah} - {p.endAyah}) • الجزء {p.juzNumber}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Part 2: Dhikr */}
                <div className="p-3 rounded-xl bg-black/30 border border-emerald-800/40 space-y-1.5">
                  <label className="block font-semibold text-emerald-300">
                    2. الجزء الثاني: أذكار اليوم (موثق من الصحيحين والسنن)
                  </label>
                  <select
                    value={selectedDhikrId}
                    onChange={(e) => setSelectedDhikrId(e.target.value)}
                    className="w-full p-2 rounded-lg bg-black/50 border border-emerald-700/40 text-white text-xs"
                  >
                    {AZKAR_DATA.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.textAr.substring(0, 70)}... ({d.sourceAr})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Part 3: Hadith */}
                <div className="p-3 rounded-xl bg-black/30 border border-emerald-800/40 space-y-1.5">
                  <label className="block font-semibold text-emerald-300">
                    3. الجزء الثالث: حديث اليوم الصحيح (البخاري / مسلم)
                  </label>
                  <select
                    value={selectedHadithId}
                    onChange={(e) => setSelectedHadithId(e.target.value)}
                    className="w-full p-2 rounded-lg bg-black/50 border border-emerald-700/40 text-white text-xs"
                  >
                    {HADITH_DATA.map((h) => (
                      <option key={h.id} value={h.id}>
                        «{h.textAr.substring(0, 70)}...» ({h.collectionAr})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Part 4: Dua */}
                <div className="p-3 rounded-xl bg-black/30 border border-emerald-800/40 space-y-1.5">
                  <label className="block font-semibold text-emerald-300">
                    4. الجزء الرابع: دعاء اليوم المأثور (القرآن / السنة)
                  </label>
                  <select
                    value={selectedDuaId}
                    onChange={(e) => setSelectedDuaId(e.target.value)}
                    className="w-full p-2 rounded-lg bg-black/50 border border-emerald-700/40 text-white text-xs"
                  >
                    {DUA_DATA.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.titleAr}: {d.textAr.substring(0, 60)}... ({d.sourceAr})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Part 5: Tasbih */}
                <div className="p-3 rounded-xl bg-black/30 border border-emerald-800/40 space-y-1.5">
                  <label className="block font-semibold text-emerald-300">
                    5. الجزء الخامس: التسبيح المعتمد
                  </label>
                  <select
                    value={selectedTasbihIdx}
                    onChange={(e) => setSelectedTasbihIdx(parseInt(e.target.value, 10))}
                    className="w-full p-2 rounded-lg bg-black/50 border border-emerald-700/40 text-white text-xs"
                  >
                    {VERIFIED_TASBIH_PHRASES.map((t, idx) => (
                      <option key={idx} value={idx}>
                        {t.phraseAr} (الهدف: {t.target})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Form buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-emerald-900/50">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-300 hover:text-white text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-lg transition-transform active:scale-95"
                >
                  حفظ ونشر ورد اليوم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
