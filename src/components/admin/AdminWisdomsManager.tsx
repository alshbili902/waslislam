import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Quote,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Calendar,
  Share2,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Check
} from 'lucide-react';
import {
  IslamicWisdom,
  WisdomCategory,
  WisdomContentType,
  WisdomVerificationStatus,
  ALL_WISDOM_CATEGORIES,
  WISDOM_CONTENT_TYPE_LABELS,
  WISDOM_STATUS_LABELS,
} from '../../types/wisdom';
import { wisdomService, checkDuplicateWisdom } from '../../services/wisdomService';
import { useShareModal } from '../../context/ShareContext';
import { useModalScrollLock } from '../../hooks/useModalScrollLock';

export const AdminWisdomsManager: React.FC = () => {
  const { openShareModal } = useShareModal();

  const [wisdoms, setWisdoms] = useState<IslamicWisdom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<WisdomCategory | 'الكل'>('الكل');
  const [filterStatus, setFilterStatus] = useState<WisdomVerificationStatus | 'all'>('all');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWisdom, setEditingWisdom] = useState<IslamicWisdom | null>(null);

  useModalScrollLock(isModalOpen, {
    onClose: () => setIsModalOpen(false),
    closeOnEsc: true,
  });

  // Schedule Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [schedulingWisdom, setSchedulingWisdom] = useState<IslamicWisdom | null>(null);
  const [scheduleDate, setScheduleDate] = useState(() => new Date().toISOString().split('T')[0]);

  useModalScrollLock(isScheduleModalOpen, {
    onClose: () => setIsScheduleModalOpen(false),
    closeOnEsc: true,
  });

  // Form State
  const [formContent, setFormContent] = useState('');
  const [formContentType, setFormContentType] = useState<WisdomContentType>('wisdom');
  const [formAuthor, setFormAuthor] = useState('');
  const [formSource, setFormSource] = useState('');
  const [formReference, setFormReference] = useState('');
  const [formHadithGrade, setFormHadithGrade] = useState('');
  const [formCategory, setFormCategory] = useState<WisdomCategory>('الصبر');
  const [formStatus, setFormStatus] = useState<WisdomVerificationStatus>('verified');
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formIsDaily, setFormIsDaily] = useState(false);
  const [formScheduledDate, setFormScheduledDate] = useState('');

  // Live duplicate warning state
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const fetchWisdoms = async () => {
    setIsLoading(true);
    try {
      const { items } = await wisdomService.adminGetAllWisdoms({
        category: filterCategory,
        searchQuery,
        verificationStatus: filterStatus,
        pageSize: 100,
      });
      setWisdoms(items);
    } catch (err) {
      console.warn('Error fetching admin wisdoms:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWisdoms();
  }, [filterCategory, filterStatus, searchQuery]);

  // Live duplicate detection as admin types
  useEffect(() => {
    if (formContent.trim().length >= 10) {
      const dup = checkDuplicateWisdom(formContent, wisdoms, editingWisdom?.id);
      if (dup.isDuplicate && dup.match) {
        setDuplicateWarning(
          `تحذير: يوجد محتوى مشابه أو مطابق بالفعل (تشابه ${dup.similarityPercentage}%):\n«${dup.match.content.substring(0, 60)}...»`
        );
      } else {
        setDuplicateWarning(null);
      }
    } else {
      setDuplicateWarning(null);
    }
  }, [formContent, editingWisdom, wisdoms]);

  const handleOpenAddModal = () => {
    setEditingWisdom(null);
    setFormContent('');
    setFormContentType('wisdom');
    setFormAuthor('');
    setFormSource('');
    setFormReference('');
    setFormHadithGrade('');
    setFormCategory('الصبر');
    setFormStatus('verified');
    setFormIsFeatured(false);
    setFormIsDaily(false);
    setFormScheduledDate('');
    setDuplicateWarning(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: IslamicWisdom) => {
    setEditingWisdom(item);
    setFormContent(item.content);
    setFormContentType(item.contentType);
    setFormAuthor(item.author || '');
    setFormSource(item.source);
    setFormReference(item.reference || '');
    setFormHadithGrade(item.hadithGrade || '');
    setFormCategory(item.category);
    setFormStatus(item.verificationStatus);
    setFormIsFeatured(Boolean(item.isFeatured));
    setFormIsDaily(Boolean(item.isDaily));
    setFormScheduledDate(item.scheduledDate || '');
    setDuplicateWarning(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formContent.trim()) {
      setFeedback({ type: 'error', text: 'نص الحكمة أو الموعظة مطلوب' });
      return;
    }

    if (!formSource.trim()) {
      setFeedback({ type: 'error', text: 'المصدر المعتمد مطلوب لمنع نسبة أقوال غير موثقة' });
      return;
    }

    const payload = {
      content: formContent.trim(),
      contentType: formContentType,
      author: formAuthor.trim() || undefined,
      source: formSource.trim(),
      reference: formReference.trim() || undefined,
      hadithGrade: formHadithGrade.trim() || undefined,
      category: formCategory,
      verificationStatus: formStatus,
      isFeatured: formIsFeatured,
      isDaily: formIsDaily,
      scheduledDate: formScheduledDate || undefined,
    };

    if (editingWisdom) {
      const res = await wisdomService.adminUpdateWisdom(editingWisdom.id, payload);
      if (res.success) {
        setFeedback({
          type: 'success',
          text: res.duplicateWarning ? `تم التعديل بنجاح مع تنبيه: ${res.duplicateWarning}` : 'تم تعديل الحكمة بنجاح',
        });
        setIsModalOpen(false);
        fetchWisdoms();
      } else {
        setFeedback({ type: 'error', text: 'تعذر تعديل الحكمة' });
      }
    } else {
      const res = await wisdomService.adminCreateWisdom(payload);
      if (res.success) {
        setFeedback({
          type: 'success',
          text: res.duplicateWarning ? `تمت الإضافة بنجاح مع تنبيه: ${res.duplicateWarning}` : 'تمت إضافة الحكمة بنجاح',
        });
        setIsModalOpen(false);
        fetchWisdoms();
      } else {
        setFeedback({ type: 'error', text: 'تعذر إضافة الحكمة' });
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا المحتوى نهائياً؟')) return;
    const success = await wisdomService.adminDeleteWisdom(id);
    if (success) {
      setFeedback({ type: 'success', text: 'تم حذف المحتوى بنجاح' });
      fetchWisdoms();
    } else {
      setFeedback({ type: 'error', text: 'تعذر حذف المحتوى' });
    }
  };

  const handleToggleStatus = async (item: IslamicWisdom, nextStatus: WisdomVerificationStatus) => {
    const res = await wisdomService.adminUpdateWisdom(item.id, { verificationStatus: nextStatus });
    if (res.success) {
      setFeedback({ type: 'success', text: `تم تغيير الحالة إلى: ${WISDOM_STATUS_LABELS[nextStatus]}` });
      fetchWisdoms();
    }
  };

  const handleScheduleDailySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingWisdom || !scheduleDate) return;

    const ok = await wisdomService.adminScheduleDaily(schedulingWisdom.id, scheduleDate);
    if (ok) {
      setFeedback({ type: 'success', text: `تم جدولة الحكمة لتاريخ: ${scheduleDate} بنجاح` });
      setIsScheduleModalOpen(false);
      setSchedulingWisdom(null);
      fetchWisdoms();
    }
  };

  const handlePreviewShare = (item: IslamicWisdom) => {
    let sourceText = item.source;
    if (item.author) sourceText = `${item.author} — ${item.source}`;
    if (item.reference) sourceText += ` (${item.reference})`;

    openShareModal({
      sectionName: 'الحِكَم والمواعظ',
      contentType: WISDOM_CONTENT_TYPE_LABELS[item.contentType] || 'حكمة',
      type: 'wisdom',
      content: item.content,
      text: item.content,
      source: sourceText,
      title: `معاينة: ${item.category}`,
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-emerald-950/70 p-5 rounded-2xl border border-slate-200/80 dark:border-emerald-800/40 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Quote className="w-5 h-5 text-amber-500" />
            <span>إدارة الحِكَم والمواعظ</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            إضافة ومراجعة وتوثيق الكلمات النافعة والفوائد الإيمانية مع منع الازدواجية والتحقق الصارم
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchWisdoms}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-emerald-800/50 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-emerald-900/40 transition-colors"
            title="تحديث القائمة"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة حكمة / موعظة جديدة</span>
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800'
              : 'bg-rose-100 text-rose-900 border border-rose-300 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800'
          }`}
        >
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="font-bold text-sm px-1">✕</button>
        </div>
      )}

      {/* Filter and Search Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في النص، المصدر، أو القائل..."
            className="w-full pl-3 pr-10 py-2.5 text-xs rounded-xl bg-white dark:bg-emerald-950/60 border border-slate-200 dark:border-emerald-800/50 text-slate-900 dark:text-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as any)}
            className="w-full px-3 py-2.5 text-xs rounded-xl bg-white dark:bg-emerald-950/60 border border-slate-200 dark:border-emerald-800/50 text-slate-900 dark:text-white"
          >
            <option value="الكل">جميع الموضوعات (الكل)</option>
            {ALL_WISDOM_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Verification Status Filter */}
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="w-full px-3 py-2.5 text-xs rounded-xl bg-white dark:bg-emerald-950/60 border border-slate-200 dark:border-emerald-800/50 text-slate-900 dark:text-white"
          >
            <option value="all">جميع الحالات</option>
            <option value="verified">موثّق (متاح للعامة)</option>
            <option value="needs_review">قيد المراجعة</option>
            <option value="draft">مسودة</option>
            <option value="rejected">مرفوض</option>
          </select>
        </div>
      </div>

      {/* Wisdoms Table List */}
      <div className="bg-white dark:bg-emerald-950/70 rounded-2xl border border-slate-200/80 dark:border-emerald-800/40 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-500">جاري التحميل...</div>
        ) : wisdoms.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">لا توجد حكم تطابق معايير البحث</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-emerald-900/40 border-b border-slate-200 dark:border-emerald-800/40 text-slate-700 dark:text-slate-300 font-bold">
                <tr>
                  <th className="p-3.5">النص والمصدر</th>
                  <th className="p-3.5">النوع</th>
                  <th className="p-3.5">التصنيف</th>
                  <th className="p-3.5">حالة التوثيق</th>
                  <th className="p-3.5">حكمة اليوم</th>
                  <th className="p-3.5 text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-emerald-900/30">
                {wisdoms.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-emerald-900/20 transition-colors">
                    <td className="p-3.5 max-w-sm">
                      <p className="font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-relaxed">
                        {item.content}
                      </p>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
                        {item.author && <span className="font-semibold text-emerald-700 dark:text-emerald-400">{item.author} •</span>}
                        <span>{item.source}</span>
                        {item.reference && <span className="text-slate-400">({item.reference})</span>}
                      </div>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-emerald-900/60 font-semibold text-[11px] text-slate-700 dark:text-slate-300">
                        {WISDOM_CONTENT_TYPE_LABELS[item.contentType] || item.contentType}
                      </span>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 font-bold text-[11px]">
                        {item.category}
                      </span>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            item.verificationStatus === 'verified'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                              : item.verificationStatus === 'needs_review'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200'
                              : item.verificationStatus === 'draft'
                              ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
                          }`}
                        >
                          {WISDOM_STATUS_LABELS[item.verificationStatus] || item.verificationStatus}
                        </span>

                        {/* Quick toggle to verify/unverify */}
                        {item.verificationStatus !== 'verified' ? (
                          <button
                            onClick={() => handleToggleStatus(item, 'verified')}
                            className="text-[10px] text-emerald-600 hover:underline"
                            title="توثيق المحتوى للنشر العام"
                          >
                            اعتماد
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(item, 'draft')}
                            className="text-[10px] text-slate-400 hover:underline"
                            title="إرجاع للمسودة"
                          >
                            تعطيل
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="p-3.5 whitespace-nowrap text-slate-500 text-[11px]">
                      {item.scheduledDate ? (
                        <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {item.scheduledDate}
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setSchedulingWisdom(item);
                            setIsScheduleModalOpen(true);
                          }}
                          className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                        >
                          جدولة ليوم
                        </button>
                      )}
                    </td>

                    <td className="p-3.5 whitespace-nowrap text-left">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handlePreviewShare(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-300 hover:bg-slate-100 dark:hover:bg-emerald-900/40 transition-colors"
                          title="معاينة بطاقة المشاركة الموحدة"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-300 hover:bg-slate-100 dark:hover:bg-emerald-900/40 transition-colors"
                          title="تعديل"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-emerald-900/40 transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm wasl-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-[#03231a] rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-emerald-900/20 dark:border-emerald-700/50 max-h-[min(90dvh,calc(100dvh-2rem))] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-emerald-800/40 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Quote className="w-5 h-5 text-amber-500" />
                <span>{editingWisdom ? 'تعديل الحكمة / الموعظة' : 'إضافة حكمة أو موعظة جديدة'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg"
              >
                ✕
              </button>
            </div>

            {/* Duplicate Detection Warning Banner */}
            {duplicateWarning && (
              <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 text-xs leading-relaxed flex items-start gap-2 animate-pulse">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span className="font-semibold whitespace-pre-line">{duplicateWarning}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 flex-1 overflow-y-auto pr-1">
              {/* Content */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  نص الحكمة أو الموعظة الموثقة <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="أدخل النص بدقة ومطابقة للأصل دون تحريف أو اختراع..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-emerald-900/30 text-slate-900 dark:text-white text-xs leading-relaxed font-amiri text-base focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>

              {/* Row 1: Content Type & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    نوع المحتوى <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formContentType}
                    onChange={(e) => setFormContentType(e.target.value as WisdomContentType)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-emerald-900/30 text-slate-900 dark:text-white text-xs"
                  >
                    {Object.entries(WISDOM_CONTENT_TYPE_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    التصنيف والموضوع <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as WisdomCategory)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-emerald-900/30 text-slate-900 dark:text-white text-xs"
                  >
                    {ALL_WISDOM_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Author & Source */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    القائل أو الراوي (إن وجد)
                  </label>
                  <input
                    type="text"
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    placeholder="مثال: عمر بن الخطاب، الحسن البصري، ابن القيم..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-emerald-900/30 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    المصدر المعتمد <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value)}
                    placeholder="مثال: صحيح مسلم، الفوائد، حلية الأولياء..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-emerald-900/30 text-slate-900 dark:text-white text-xs"
                    required
                  />
                </div>
              </div>

              {/* Row 3: Reference & Hadith Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    المرجع والتخريج الدقيق
                  </label>
                  <input
                    type="text"
                    value={formReference}
                    onChange={(e) => setFormReference(e.target.value)}
                    placeholder="رقم الحديث، الباب، أو الجزء والصفحة"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-emerald-900/30 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    درجة الحديث (إن وجد)
                  </label>
                  <input
                    type="text"
                    value={formHadithGrade}
                    onChange={(e) => setFormHadithGrade(e.target.value)}
                    placeholder="صحيح، حسن، متفق عليه..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-emerald-900/30 text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>

              {/* Row 4: Verification Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  حالة التحقق والتوثيق <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as WisdomVerificationStatus)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-emerald-900/30 text-slate-900 dark:text-white text-xs font-bold"
                >
                  <option value="verified">موثّق (يظهر للعامة فوراً في المنصة)</option>
                  <option value="needs_review">قيد المراجعة (محجوب عن العامة)</option>
                  <option value="draft">مسودة (محجوب عن العامة)</option>
                  <option value="rejected">مرفوض (محجوب عن العامة)</option>
                </select>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  ملاحظة صارمة: المحتوى ذو حالة «موثّق» فقط هو الذي يُعرض لجمهور المنصة.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-emerald-800/40">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-800 hover:bg-emerald-700 text-white shadow-md transition-colors"
                >
                  {editingWisdom ? 'حفظ التعديلات' : 'إضافة وتوثيق'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Schedule Daily Modal */}
      {isScheduleModalOpen && schedulingWisdom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm wasl-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsScheduleModalOpen(false);
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-[#03231a] rounded-3xl p-6 max-w-md w-full shadow-2xl border border-emerald-900/20 text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-500" />
              <span>جدولة كـ «حكمة اليوم»</span>
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-4">
              «{schedulingWisdom.content}»
            </p>

            <form onSubmit={handleScheduleDailySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  تاريخ العرض (YYYY-MM-DD)
                </label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-emerald-900/30 text-slate-900 dark:text-white text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-colors shadow-md"
                >
                  تأكيد الجدولة
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
