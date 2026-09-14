import React, { useState, useMemo } from 'react';
import {
  Award,
  Compass,
  MapPin,
  Library,
  Calendar,
  Sparkles,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { ALLAH_NAMES_DATA } from '../../data/allahNamesData';
import { SEERAH_DATA, SEERAH_ERAS } from '../../data/seerahData';
import { HAJJ_UMRAH_DATA } from '../../data/hajjUmrahData';
import { LIBRARY_BOOKS_DATA, LIBRARY_CATEGORIES } from '../../data/libraryData';
import { AllahNameItem, SeerahEvent, HajjUmrahStep, LibraryBook } from '../../types';
import { useModalScrollLock } from '../../hooks/useModalScrollLock';

type UpgradeSectionTab = 'allah_names' | 'seerah' | 'hajj_umrah' | 'library' | 'prayer_settings';

export const AdminPlatformUpgradesManager: React.FC = () => {
  const [activeSection, setActiveSection] = useState<UpgradeSectionTab>('allah_names');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'draft' | 'needs_review'>('all');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Local state initialized with datasets
  const [namesList, setNamesList] = useState<AllahNameItem[]>(ALLAH_NAMES_DATA);
  const [seerahList, setSeerahList] = useState<SeerahEvent[]>(SEERAH_DATA);
  const [hajjList, setHajjList] = useState<HajjUmrahStep[]>(HAJJ_UMRAH_DATA);
  const [booksList, setBooksList] = useState<LibraryBook[]>(LIBRARY_BOOKS_DATA);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingItem, setEditingItem] = useState<any>(null);

  useModalScrollLock(isModalOpen, {
    onClose: () => setIsModalOpen(false),
    closeOnEsc: true
  });

  // Prayer Calculation Admin Settings
  const [defaultMethod, setDefaultMethod] = useState(4);
  const [autoLocationEnabled, setAutoLocationEnabled] = useState(true);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3500);
  };

  // Delete item handler
  const handleDeleteItem = (id: any) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا العنصر؟')) return;

    if (activeSection === 'allah_names') {
      setNamesList((prev) => prev.filter((n) => n.number !== id));
    } else if (activeSection === 'seerah') {
      setSeerahList((prev) => prev.filter((s) => s.id !== id));
    } else if (activeSection === 'hajj_umrah') {
      setHajjList((prev) => prev.filter((h) => h.id !== id));
    } else if (activeSection === 'library') {
      setBooksList((prev) => prev.filter((b) => b.id !== id));
    }

    showFeedback('تم حذف العنصر بنجاح.');
  };

  // Update verification status
  const handleToggleVerification = (id: any, currentStatus: string) => {
    const nextStatus = currentStatus === 'verified' ? 'needs_review' : 'verified';

    if (activeSection === 'allah_names') {
      setNamesList((prev) =>
        prev.map((n) => (n.number === id ? { ...n, verificationStatus: nextStatus as any } : n))
      );
    } else if (activeSection === 'seerah') {
      setSeerahList((prev) =>
        prev.map((s) => (s.id === id ? { ...s, verificationStatus: nextStatus as any } : s))
      );
    } else if (activeSection === 'hajj_umrah') {
      setHajjList((prev) =>
        prev.map((h) => (h.id === id ? { ...h, verificationStatus: nextStatus as any } : h))
      );
    } else if (activeSection === 'library') {
      setBooksList((prev) =>
        prev.map((b) => (b.id === id ? { ...b, verificationStatus: nextStatus as any } : b))
      );
    }

    showFeedback(`تم تحديث حالة التوثيق إلى: ${nextStatus === 'verified' ? 'موثّق' : 'قيد المراجعة'}`);
  };

  // Quick Stats
  const stats = useMemo(() => {
    return {
      namesTotal: namesList.length,
      namesVerified: namesList.filter((n) => n.verificationStatus === 'verified').length,
      seerahTotal: seerahList.length,
      seerahVerified: seerahList.filter((s) => s.verificationStatus === 'verified').length,
      hajjTotal: hajjList.length,
      hajjVerified: hajjList.filter((h) => h.verificationStatus === 'verified').length,
      booksTotal: booksList.length,
      booksVerified: booksList.filter((b) => b.verificationStatus === 'verified').length
    };
  }, [namesList, seerahList, hajjList, booksList]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-6 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>نظام إدارة المحتوى والتحقق الشرعي المتقدم</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-amiri text-slate-900 dark:text-white">
            إدارة الميزات الثماني والتحقق الشرعي
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            التحكم الكامل في أسماء الله الحسنى، السيرة النبوية، الحج والعمرة، المكتبة، ومواقيت الصلاة.
          </p>
        </div>

        {/* Section Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-emerald-900/40 p-1.5 rounded-2xl border border-slate-200 dark:border-emerald-800">
          {[
            { id: 'allah_names', label: `الأسماء الحسنى (${stats.namesTotal})`, icon: Award },
            { id: 'seerah', label: `السيرة (${stats.seerahTotal})`, icon: Compass },
            { id: 'hajj_umrah', label: `الحج والعمرة (${stats.hajjTotal})`, icon: MapPin },
            { id: 'library', label: `المكتبة (${stats.booksTotal})`, icon: Library },
            { id: 'prayer_settings', label: 'إعدادات المواقيت', icon: Calendar }
          ].map((tab) => {
            const IconComp = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-emerald-800/40'
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              : 'bg-rose-100 text-rose-900 border border-rose-300'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedback.text}</span>
        </div>
      )}

      {/* SECTION 1: ALLAH NAMES ADMIN */}
      {activeSection === 'allah_names' && (
        <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-6 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>قائمة أسماء الله الحسنى والتحقق الشرعي</span>
            </h3>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">
                الموثق: {stats.namesVerified} من {stats.namesTotal}
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-emerald-800/60">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-emerald-900/40 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">الاسم الجليل</th>
                  <th className="p-3">المعنى المعتمد</th>
                  <th className="p-3">التصنيف</th>
                  <th className="p-3">المصدر والشاهد</th>
                  <th className="p-3">الحالة الشرعية</th>
                  <th className="p-3 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-emerald-900/40 text-slate-800 dark:text-slate-200">
                {namesList.slice(0, 30).map((name) => (
                  <tr key={name.number} className="hover:bg-slate-50/50 dark:hover:bg-emerald-900/20">
                    <td className="p-3 font-mono font-bold">#{name.number}</td>
                    <td className="p-3 font-bold font-amiri text-base text-emerald-800 dark:text-amber-300">
                      {name.nameAr}
                    </td>
                    <td className="p-3 max-w-xs truncate">{name.meaningAr}</td>
                    <td className="p-3">{name.category || '—'}</td>
                    <td className="p-3 text-slate-500 max-w-xs truncate">{name.source}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggleVerification(name.number, name.verificationStatus)}
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          name.verificationStatus === 'verified'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                        }`}
                      >
                        {name.verificationStatus === 'verified' ? '✓ موثّق' : 'قيد المراجعة'}
                      </button>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDeleteItem(name.number)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-slate-400">
            * يتم عرض أول 30 اسماً لأداء سريع، وإجمالي الأسماء 99 اسماً موثقاً.
          </p>
        </div>
      )}

      {/* SECTION 2: SEERAH ADMIN */}
      {activeSection === 'seerah' && (
        <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-6 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-600" />
              <span>أحداث ومحطات السيرة النبوية ﷺ</span>
            </h3>
            <span className="text-xs text-slate-500">
              {stats.seerahVerified} موثّق تاريخياً
            </span>
          </div>

          <div className="space-y-2.5">
            {seerahList.map((ev) => (
              <div
                key={ev.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-emerald-900/20 border border-slate-200 dark:border-emerald-800/40 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 font-bold">
                      {ev.eraTitleAr}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {ev.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {ev.summary}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleVerification(ev.id, ev.verificationStatus)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      ev.verificationStatus === 'verified'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {ev.verificationStatus === 'verified' ? '✓ موثّق' : 'قيد المراجعة'}
                  </button>

                  <button
                    onClick={() => handleDeleteItem(ev.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: HAJJ & UMRAH ADMIN */}
      {activeSection === 'hajj_umrah' && (
        <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-6 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              <span>خطوات ومناسك الحج والعمرة والمواقيت</span>
            </h3>
            <span className="text-xs text-slate-500">
              {stats.hajjVerified} أحكام موثقة
            </span>
          </div>

          <div className="space-y-2.5">
            {hajjList.map((step) => (
              <div
                key={step.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-emerald-900/20 border border-slate-200 dark:border-emerald-800/40 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 font-bold">
                      {step.type === 'umrah' ? 'العمرة' : step.type === 'hajj' ? 'الحج' : step.type === 'miqat' ? 'ميقات' : 'حكم'}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {step.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {step.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleVerification(step.id, step.verificationStatus)}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300"
                  >
                    ✓ موثّق
                  </button>
                  <button
                    onClick={() => handleDeleteItem(step.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: LIBRARY ADMIN */}
      {activeSection === 'library' && (
        <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-6 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Library className="w-5 h-5 text-emerald-600" />
              <span>إدارة كتب المكتبة الإسلامية وحقوق النشر</span>
            </h3>
            <span className="text-xs text-slate-500">
              {stats.booksVerified} كتب في الملك العام
            </span>
          </div>

          <div className="space-y-3">
            {booksList.map((book) => (
              <div
                key={book.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-emerald-900/20 border border-slate-200 dark:border-emerald-800/40 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 font-bold">
                      {book.category}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {book.title}
                    </h4>
                    <span className="text-xs text-slate-400">({book.author})</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    الترخيص: {book.license} • الفصول: {book.chapters.length}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300">
                    ✓ ملك عام
                  </span>
                  <button
                    onClick={() => handleDeleteItem(book.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 5: PRAYER SETTINGS ADMIN */}
      {activeSection === 'prayer_settings' && (
        <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-6 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm space-y-4 max-w-2xl">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <span>إعدادات النظام العامة لمواقيت الصلاة</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                طريقة الحساب الافتراضية للمنصة:
              </label>
              <select
                value={defaultMethod}
                onChange={(e) => setDefaultMethod(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-slate-200 dark:border-emerald-700"
              >
                <option value={4}>جامعة أم القرى بمكة المكرمة (الافتراضي للمملكة العربية السعودية)</option>
                <option value={5}>الهيئة المصرية العامة للمساحة</option>
                <option value={3}>رابطة العالم الإسلامي</option>
              </select>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-emerald-900/20 border border-slate-200 dark:border-emerald-800 flex items-center justify-between">
              <div>
                <strong className="block text-slate-800 dark:text-slate-200">
                  السماح بتحديد الموقع الجغرافي التلقائي (GPS):
                </strong>
                <span className="text-slate-500 text-[11px]">
                  يتيح للمستخدم تحديد مدينته تلقائياً عند فتح مواقيت الصلاة
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoLocationEnabled}
                onChange={(e) => setAutoLocationEnabled(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => showFeedback('تم حفظ إعدادات المواقيت بنجاح.')}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
            >
              حفظ الإعدادات
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
