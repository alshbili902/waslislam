import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Radio,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Search,
  ExternalLink,
  Volume2,
  Users,
  Check,
  X,
  Play,
  Pause,
  Clock,
  ArrowUpDown,
  Flame
} from 'lucide-react';
import { useRadio } from '../context/RadioContext';
import { RadioStation, RadioReciter, RadioStreamStatus } from '../types';
import { radioService, StreamValidationResult } from '../services/radioService';
import { useModalScrollLock } from '../hooks/useModalScrollLock';
import { RadioStationBadge } from './RadioStationBadge';

export const AdminRadioManager: React.FC = () => {
  const { stations, categories, reciters, refreshData } = useRadio();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isStationModalOpen, setIsStationModalOpen] = useState(false);
  const [isReciterModalOpen, setIsReciterModalOpen] = useState(false);

  useModalScrollLock(isStationModalOpen, {
    onClose: () => setIsStationModalOpen(false),
  });

  useModalScrollLock(isReciterModalOpen, {
    onClose: () => setIsReciterModalOpen(false),
  });
  const [editingStation, setEditingStation] = useState<RadioStation | null>(null);
  const [editingReciter, setEditingReciter] = useState<RadioReciter | null>(null);

  // Form states for station
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    streamUrl: '',
    logoUrl: '',
    categoryId: '',
    reciterId: '',
    bitrate: '128 kbps',
    isActive: true,
    isFeatured: false,
    status: 'working' as RadioStreamStatus,
  });

  // Form states for reciter
  const [reciterForm, setReciterForm] = useState({
    nameAr: '',
    nameEn: '',
    bioAr: '',
    imageUrl: '',
    isActive: true,
  });

  // Testing stream state
  const [validatingUrl, setValidatingUrl] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<Record<string, StreamValidationResult>>({});
  const [isBulkChecking, setIsBulkChecking] = useState(false);

  // Stats calculation
  const totalStations = stations.length;
  const activeStations = stations.filter((s) => s.isActive).length;
  const workingStations = stations.filter((s) => s.status === 'working').length;
  const brokenStations = stations.filter((s) => s.status !== 'working').length;

  const handleOpenAddStation = () => {
    setEditingStation(null);
    setFormData({
      name: '',
      description: '',
      streamUrl: '',
      logoUrl: '',
      categoryId: categories[1]?.id || 'cat-general',
      reciterId: '',
      bitrate: '128 kbps',
      isActive: true,
      isFeatured: false,
      status: 'working',
    });
    setIsStationModalOpen(true);
  };

  const handleOpenEditStation = (station: RadioStation) => {
    setEditingStation(station);
    setFormData({
      name: station.name,
      description: station.description || '',
      streamUrl: station.streamUrl,
      logoUrl: station.logoUrl || '',
      categoryId: station.categoryId,
      reciterId: station.reciterId || '',
      bitrate: station.bitrate || '128 kbps',
      isActive: station.isActive,
      isFeatured: station.isFeatured,
      status: station.status,
    });
    setIsStationModalOpen(true);
  };

  const handleSaveStation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.streamUrl || !formData.categoryId) {
      alert('يرجى ملء الحقول الإلزامية (اسم الإذاعة، رابط البث، والتصنيف)');
      return;
    }

    const cat = categories.find((c) => c.id === formData.categoryId);
    const rec = reciters.find((r) => r.id === formData.reciterId);

    await radioService.saveStation({
      id: editingStation?.id,
      name: formData.name,
      description: formData.description,
      streamUrl: formData.streamUrl,
      logoUrl: formData.logoUrl,
      categoryId: formData.categoryId,
      categoryNameAr: cat?.nameAr,
      reciterId: formData.reciterId || undefined,
      reciterNameAr: rec?.nameAr || undefined,
      bitrate: formData.bitrate,
      isActive: formData.isActive,
      isFeatured: formData.isFeatured,
      status: formData.status,
    });

    await refreshData();
    setIsStationModalOpen(false);
  };

  const handleDeleteStation = async (id: string, name: string) => {
    if (confirm(`هل أنت متأكد من رغبتك في حذف محطة "${name}"؟`)) {
      await radioService.deleteStation(id);
      await refreshData();
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    await radioService.toggleStationActive(id, !current);
    await refreshData();
  };

  const handleCheckStream = async (station: RadioStation) => {
    setValidatingUrl(station.id);
    const res = await radioService.validateStream(station.streamUrl);
    setValidationResult((prev) => ({ ...prev, [station.id]: res }));
    setValidatingUrl(null);

    // If broken, auto-update status in database/storage
    if (!res.reachable && station.status === 'working') {
      await radioService.setStationStatus(station.id, 'unavailable');
      await refreshData();
    } else if (res.reachable && station.status !== 'working') {
      await radioService.setStationStatus(station.id, 'working');
      await refreshData();
    }
  };

  const handleBulkCheckAll = async () => {
    setIsBulkChecking(true);
    for (const st of stations) {
      setValidatingUrl(st.id);
      const res = await radioService.validateStream(st.streamUrl);
      setValidationResult((prev) => ({ ...prev, [st.id]: res }));
      if (!res.reachable && st.status === 'working') {
        await radioService.setStationStatus(st.id, 'unavailable');
      } else if (res.reachable && st.status !== 'working') {
        await radioService.setStationStatus(st.id, 'working');
      }
    }
    setValidatingUrl(null);
    setIsBulkChecking(false);
    await refreshData();
  };

  // Reciter management
  const handleOpenAddReciter = () => {
    setEditingReciter(null);
    setReciterForm({
      nameAr: '',
      nameEn: '',
      bioAr: '',
      imageUrl: '',
      isActive: true,
    });
    setIsReciterModalOpen(true);
  };

  const handleSaveReciter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reciterForm.nameAr) return;

    await radioService.saveReciter({
      id: editingReciter?.id,
      nameAr: reciterForm.nameAr,
      nameEn: reciterForm.nameEn,
      bioAr: reciterForm.bioAr,
      imageUrl: reciterForm.imageUrl,
      isActive: reciterForm.isActive,
    });

    await refreshData();
    setIsReciterModalOpen(false);
  };

  const handleDeleteReciter = async (id: string, name: string) => {
    if (confirm(`هل أنت متأكد من حذف القارئ "${name}"؟`)) {
      await radioService.deleteReciter(id);
      await refreshData();
    }
  };

  const filteredStations = stations.filter((s) => {
    if (selectedCategory !== 'all' && s.categoryId !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.streamUrl.toLowerCase().includes(q) ||
        s.reciterNameAr?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-emerald-950/60 border border-slate-200 dark:border-emerald-900 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">إجمالي الإذاعات</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{totalStations}</span>
            <Radio className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-emerald-950/60 border border-slate-200 dark:border-emerald-900 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">المحطات النشطة</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{activeStations}</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-emerald-950/60 border border-slate-200 dark:border-emerald-900 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">حالة البث (تعمل)</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{workingStations}</span>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-emerald-950/60 border border-slate-200 dark:border-emerald-900 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">كبار القراء</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{reciters.length}</span>
            <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          </div>
        </div>
      </div>

      {/* Main Controls & Search Bar */}
      <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 border border-slate-200 dark:border-emerald-900 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-emerald-600" />
              <span>إدارة محطات وإذاعات القرآن الكريم</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              إضافة المحطات، فحص صلاحية روابط البث المباشر آلياً، وتحديث بيانات كبار القراء.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <button
              onClick={handleBulkCheckAll}
              disabled={isBulkChecking}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-emerald-900/60 dark:hover:bg-emerald-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isBulkChecking ? 'animate-spin' : ''}`} />
              <span>{isBulkChecking ? 'جارٍ فحص البث...' : 'فحص كافة الروابط'}</span>
            </button>

            <button
              onClick={handleOpenAddReciter}
              className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              <span>إضافة قارئ</span>
            </button>

            <button
              onClick={handleOpenAddStation}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة محطة إذاعية</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-100 dark:border-emerald-900/40">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث بالاسم، الرابط، أو القارئ..."
              className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-50 dark:bg-emerald-900/30 border border-slate-200 dark:border-emerald-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-emerald-900/40 text-slate-600 dark:text-slate-300'
              }`}
            >
              الكل ({stations.length})
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === c.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-emerald-900/40 text-slate-600 dark:text-slate-300'
                }`}
              >
                {c.nameAr}
              </button>
            ))}
          </div>
        </div>

        {/* Stations Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-emerald-900/60 text-slate-500 dark:text-slate-400">
                <th className="py-3 px-3">المحطة الإذاعية</th>
                <th className="py-3 px-3">التصنيف</th>
                <th className="py-3 px-3">القارئ</th>
                <th className="py-3 px-3">حالة البث</th>
                <th className="py-3 px-3">التفعيل</th>
                <th className="py-3 px-3 text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-emerald-900/40">
              {filteredStations.map((station) => {
                const validation = validationResult[station.id];
                const isValidating = validatingUrl === station.id;

                return (
                  <tr
                    key={station.id}
                    className="hover:bg-slate-50 dark:hover:bg-emerald-900/20 transition-colors"
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <RadioStationBadge
                          size="sm"
                          stationName={station.name}
                          categorySlug={station.categorySlug}
                          className="w-8 h-8 rounded-lg"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 dark:text-white truncate max-w-xs">
                              {station.name}
                            </span>
                            {station.isFeatured && (
                              <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-1.5 py-0.2 rounded-sm">
                                مميزة
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono block truncate max-w-xs" title={station.streamUrl}>
                            {station.streamUrl}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      {station.categoryNameAr || 'عام'}
                    </td>

                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      {station.reciterNameAr || '—'}
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            station.status === 'working'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                              : station.status === 'stopped'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              station.status === 'working'
                                ? 'bg-emerald-500'
                                : station.status === 'stopped'
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                          />
                          <span>
                            {station.status === 'working'
                              ? 'يعمل'
                              : station.status === 'stopped'
                              ? 'متوقف'
                              : 'غير متاح'}
                          </span>
                        </span>

                        {validation && (
                          <span
                            className="text-[10px] text-slate-400 font-mono"
                            title={validation.message}
                          >
                            {validation.latencyMs}ms
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <button
                        onClick={() => handleToggleActive(station.id, station.isActive)}
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md transition-colors ${
                          station.isActive
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {station.isActive ? 'مفعلة' : 'معطلة'}
                      </button>
                    </td>

                    <td className="py-3 px-3 text-left">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleCheckStream(station)}
                          disabled={isValidating}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-emerald-900/40 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors"
                          title="فحص صلاحية البث المباشر"
                        >
                          <RotateCcw
                            className={`w-3.5 h-3.5 ${isValidating ? 'animate-spin text-emerald-600' : ''}`}
                          />
                        </button>

                        <button
                          onClick={() => handleOpenEditStation(station)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-emerald-900/40 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors"
                          title="تعديل المحطة"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteStation(station.id, station.name)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-emerald-900/40 text-slate-600 dark:text-slate-300 hover:text-rose-600 transition-colors"
                          title="حذف المحطة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reciters Management Quick Section */}
      <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 border border-slate-200 dark:border-emerald-900 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            <span>قائمة كبار القراء ({reciters.length})</span>
          </h3>
          <button
            onClick={handleOpenAddReciter}
            className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة قارئ جديد</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {reciters.map((r) => (
            <div
              key={r.id}
              className="p-3 rounded-xl bg-slate-50 dark:bg-emerald-900/20 border border-slate-200/80 dark:border-emerald-900/40 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <RadioStationBadge
                  size="sm"
                  type="reciter"
                  stationName={r.nameAr}
                  className="w-9 h-9 rounded-lg"
                />
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {r.nameAr}
                  </h4>
                  <span className="text-[10px] text-slate-400 truncate block">
                    {r.nameEn}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => {
                    setEditingReciter(r);
                    setReciterForm({
                      nameAr: r.nameAr,
                      nameEn: r.nameEn,
                      bioAr: r.bioAr,
                      imageUrl: r.imageUrl,
                      isActive: r.isActive,
                    });
                    setIsReciterModalOpen(true);
                  }}
                  className="p-1 text-slate-400 hover:text-emerald-600 transition-colors"
                  title="تعديل"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteReciter(r.id, r.nameAr)}
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                  title="حذف"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Station Modal (Add / Edit) */}
      <AnimatePresence>
        {isStationModalOpen && (
          <div className="wasl-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overscroll-contain" onClick={() => setIsStationModalOpen(false)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[min(92dvh,750px)] wasl-modal-scrollable"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Radio className="w-5 h-5 text-emerald-600" />
                  <span>{editingStation ? 'تعديل المحطة الإذاعية' : 'إضافة محطة إذاعية جديدة'}</span>
                </h3>
                <button
                  onClick={() => setIsStationModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveStation} className="space-y-4 pt-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    اسم الإذاعة *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="مثال: إذاعة القرآن الكريم العامة"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    الوصف المختصر
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="بث مباشر متواصل 24 ساعة..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      رابط البث المباشر (Stream URL) *
                    </label>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!formData.streamUrl) return;
                        setValidatingUrl('form-test');
                        const res = await radioService.validateStream(formData.streamUrl);
                        setValidatingUrl(null);
                        alert(res.message);
                      }}
                      className="text-[11px] text-emerald-600 hover:underline font-bold"
                    >
                      {validatingUrl === 'form-test' ? 'جارٍ الفحص...' : 'فحص الرابط الآن'}
                    </button>
                  </div>
                  <input
                    type="url"
                    required
                    value={formData.streamUrl}
                    onChange={(e) => setFormData({ ...formData, streamUrl: e.target.value })}
                    placeholder="https://backup.qurango.net/radio/..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                      التصنيف *
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-emerald-500"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nameAr}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                      القارئ (اختياري)
                    </label>
                    <select
                      value={formData.reciterId}
                      onChange={(e) => setFormData({ ...formData, reciterId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">بدون قارئ محدد (بث عام)</option>
                      {reciters.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.nameAr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                      معدل البث (Bitrate)
                    </label>
                    <input
                      type="text"
                      value={formData.bitrate}
                      onChange={(e) => setFormData({ ...formData, bitrate: e.target.value })}
                      placeholder="128 kbps"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                      حالة البث
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as RadioStreamStatus })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="working">يعمل بشكل سليم (Working)</option>
                      <option value="stopped">متوقف مؤقتاً (Stopped)</option>
                      <option value="unavailable">غير متاح / معطل (Unavailable)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    رابط صورة أو شعار المحطة
                  </label>
                  <input
                    type="url"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      تفعيل المحطة للمستخدمين
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      تعيين كمحطة مميزة في الواجهة
                    </span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsStationModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20 transition-colors"
                  >
                    {editingStation ? 'حفظ التعديلات' : 'إضافة المحطة'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reciter Modal (Add / Edit) */}
      <AnimatePresence>
        {isReciterModalOpen && (
          <div className="wasl-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overscroll-contain" onClick={() => setIsReciterModalOpen(false)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[min(92dvh,750px)] wasl-modal-scrollable"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-teal-600" />
                  <span>{editingReciter ? 'تعديل بيانات القارئ' : 'إضافة قارئ جديد'}</span>
                </h3>
                <button
                  onClick={() => setIsReciterModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveReciter} className="space-y-4 pt-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    الاسم بالعربية *
                  </label>
                  <input
                    type="text"
                    required
                    value={reciterForm.nameAr}
                    onChange={(e) => setReciterForm({ ...reciterForm, nameAr: e.target.value })}
                    placeholder="مثال: الشيخ عبد الباسط عبد الصمد"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    الاسم بالإنجليزية
                  </label>
                  <input
                    type="text"
                    value={reciterForm.nameEn}
                    onChange={(e) => setReciterForm({ ...reciterForm, nameEn: e.target.value })}
                    placeholder="Abdulbasit Abdulsamad"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    نبذة تعريفية
                  </label>
                  <textarea
                    rows={2}
                    value={reciterForm.bioAr}
                    onChange={(e) => setReciterForm({ ...reciterForm, bioAr: e.target.value })}
                    placeholder="نبذة مختصرة عن القارئ ومسيرته القرآنية..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    رابط الصورة الشخصية
                  </label>
                  <input
                    type="url"
                    value={reciterForm.imageUrl}
                    onChange={(e) => setReciterForm({ ...reciterForm, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsReciterModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md shadow-teal-600/20 transition-colors"
                  >
                    حفظ القارئ
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
