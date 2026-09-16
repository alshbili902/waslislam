import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Tv,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Search,
  ExternalLink,
  Radio,
  FileText,
  Upload,
  Check,
  X,
  Play,
  Clock,
  ShieldCheck,
  Sliders,
  FolderTree,
  Flame,
  Globe,
  Layers,
  Sparkles,
  Link,
  Activity
} from 'lucide-react';
import {
  IslamicChannel,
  ChannelCategory,
  M3UParsedItem,
  StreamValidationReport,
  ChannelStreamType
} from '../../types/channel';
import { channelService } from '../../services/channelService';
import { useModalScrollLock } from '../../hooks/useModalScrollLock';

export const AdminChannelsManager: React.FC = () => {
  const [subTab, setSubTab] = useState<'channels' | 'add' | 'import' | 'categories' | 'health'>('channels');

  // Data states
  const [channels, setChannels] = useState<IslamicChannel[]>([]);
  const [categories, setCategories] = useState<ChannelCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Modal / Editing states
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<IslamicChannel | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Category modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ChannelCategory | null>(null);
  const [deleteCatConfirmId, setDeleteCatConfirmId] = useState<string | null>(null);

  // Channel Form state
  const [channelForm, setChannelForm] = useState({
    name: '',
    slug: '',
    description: '',
    logoUrl: '',
    streamUrl: '',
    streamType: 'hls' as ChannelStreamType,
    categoryId: '',
    country: 'SA',
    language: 'ar',
    isActive: true,
    isFeatured: false,
    sortOrder: 0,
    sourceName: '',
    sourceUrl: '',
    licenseNote: '',
    rightsStatus: 'public_broadcast',
  });

  // Category Form state
  const [catForm, setCatForm] = useState({
    name: '',
    slug: '',
    description: '',
    icon: 'Tv',
    sortOrder: 0,
    isActive: true,
  });

  // Stream validation state
  const [validatingUrl, setValidatingUrl] = useState<string | null>(null);
  const [validationResults, setValidationResults] = useState<Record<string, StreamValidationReport>>({});

  // M3U Importer state
  const [m3uInputType, setM3uInputType] = useState<'url' | 'content'>('url');
  const [m3uUrl, setM3uUrl] = useState('');
  const [m3uContent, setM3uContent] = useState('');
  const [isParsingM3u, setIsParsingM3u] = useState(false);
  const [parsedItems, setParsedItems] = useState<(M3UParsedItem & { isDuplicate?: boolean })[]>([]);
  const [selectedM3uIds, setSelectedM3uIds] = useState<Set<string>>(new Set());
  const [m3uCategories, setM3uCategories] = useState<string[]>([]);
  const [categoryMapping, setCategoryMapping] = useState<Record<string, string>>({});
  const [isImporting, setIsImporting] = useState(false);

  // Bulk Health state
  const [isBulkChecking, setIsBulkChecking] = useState(false);
  const [healthProgress, setHealthProgress] = useState({ current: 0, total: 0 });

  useModalScrollLock(isChannelModalOpen || isCategoryModalOpen || Boolean(deleteConfirmId) || Boolean(deleteCatConfirmId));

  // Load channels and categories
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [loadedCats, loadedChans] = await Promise.all([
        channelService.getCategories(),
        channelService.getChannels(),
      ]);
      setCategories(loadedCats);
      setChannels(loadedChans);
    } catch (e: any) {
      setFeedback({ type: 'error', text: `فشل تحميل البيانات: ${e.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Quick feedback timer
  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Open Add Channel
  const handleOpenAdd = () => {
    setEditingChannel(null);
    setChannelForm({
      name: '',
      slug: '',
      description: '',
      logoUrl: '',
      streamUrl: '',
      streamType: 'hls',
      categoryId: categories[0]?.id || '',
      country: 'SA',
      language: 'ar',
      isActive: true,
      isFeatured: false,
      sortOrder: channels.length + 1,
      sourceName: '',
      sourceUrl: '',
      licenseNote: '',
      rightsStatus: 'public_broadcast',
    });
    setIsChannelModalOpen(true);
  };

  // Open Edit Channel
  const handleOpenEdit = (ch: IslamicChannel) => {
    setEditingChannel(ch);
    setChannelForm({
      name: ch.name,
      slug: ch.slug,
      description: ch.description || '',
      logoUrl: ch.logoUrl || '',
      streamUrl: ch.streamUrl,
      streamType: ch.streamType || 'hls',
      categoryId: ch.categoryId || '',
      country: ch.country || 'SA',
      language: ch.language || 'ar',
      isActive: ch.isActive,
      isFeatured: ch.isFeatured,
      sortOrder: ch.sortOrder || 0,
      sourceName: ch.sourceName || '',
      sourceUrl: ch.sourceUrl || '',
      licenseNote: ch.licenseNote || '',
      rightsStatus: ch.rightsStatus || 'public_broadcast',
    });
    setIsChannelModalOpen(true);
  };

  // Test single stream
  const handleTestStream = async (url: string) => {
    if (!url) return;
    setValidatingUrl(url);
    try {
      const report = await channelService.checkStreamHealth(url, true);
      setValidationResults((prev) => ({ ...prev, [url]: report }));
      if (report.reachable) {
        showFeedback('success', `البث متصل ومتاح (زمن الاستجابة: ${report.latencyMs || 0} مللي ثانية)`);
      } else {
        showFeedback('error', report.message || 'البث غير متاح');
      }
    } catch {
      showFeedback('error', 'فشل التحقق من صحة الرابط');
    } finally {
      setValidatingUrl(null);
    }
  };

  // Save Channel
  const handleSaveChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelForm.name.trim() || !channelForm.streamUrl.trim()) {
      showFeedback('error', 'يرجى إدخال اسم القناة ورابط البث');
      return;
    }

    try {
      await channelService.saveChannel({
        id: editingChannel?.id,
        ...channelForm,
      });
      showFeedback('success', editingChannel ? 'تم تحديث القناة بنجاح' : 'تمت إضافة القناة بنجاح');
      setIsChannelModalOpen(false);
      loadData();
    } catch (err: any) {
      showFeedback('error', err.message || 'فشل حفظ القناة');
    }
  };

  // Delete Channel
  const handleDeleteChannel = async (id: string) => {
    try {
      await channelService.deleteChannel(id);
      showFeedback('success', 'تم حذف القناة بنجاح');
      setDeleteConfirmId(null);
      loadData();
    } catch (err: any) {
      showFeedback('error', err.message || 'فشل حذف القناة');
    }
  };

  // Toggle active
  const handleToggleActive = async (ch: IslamicChannel) => {
    try {
      await channelService.saveChannel({
        ...ch,
        isActive: !ch.isActive,
      });
      showFeedback('success', `تم ${!ch.isActive ? 'تفعيل' : 'تعطيل'} القناة`);
      loadData();
    } catch (err: any) {
      showFeedback('error', err.message);
    }
  };

  // Parse M3U
  const handleParseM3U = async () => {
    if (m3uInputType === 'url' && !m3uUrl.trim()) {
      showFeedback('error', 'يرجى إدخال رابط M3U');
      return;
    }
    if (m3uInputType === 'content' && !m3uContent.trim()) {
      showFeedback('error', 'يرجى لصق نص قائمة التشغيل M3U');
      return;
    }

    setIsParsingM3u(true);
    try {
      const res = await channelService.parseM3U({
        url: m3uInputType === 'url' ? m3uUrl.trim() : undefined,
        content: m3uInputType === 'content' ? m3uContent : undefined,
      });

      setParsedItems(res.channels);
      setM3uCategories(res.categories);

      // Default select non-duplicate channels
      const initialSelected = new Set<string>();
      res.channels.forEach((c) => {
        if (!c.isDuplicate) initialSelected.add(c.id);
      });
      setSelectedM3uIds(initialSelected);

      showFeedback('success', `تم العثور على ${res.totalFound} قناة (${res.validCount} صالحة للاستيراد)`);
    } catch (err: any) {
      showFeedback('error', err.message || 'فشل تحليل ملف M3U');
    } finally {
      setIsParsingM3u(false);
    }
  };

  // Import selected M3U channels
  const handleImportSelected = async () => {
    const selected = parsedItems.filter((item) => selectedM3uIds.has(item.id));
    if (selected.length === 0) {
      showFeedback('error', 'يرجى اختيار قناة واحدة على الأقل للاستيراد');
      return;
    }

    setIsImporting(true);
    try {
      const res = await channelService.batchImportChannels(selected, categoryMapping);
      showFeedback('success', `تم استيراد ${res.importedCount} قناة بنجاح إلى قاعدة البيانات!`);
      setParsedItems([]);
      setSelectedM3uIds(new Set());
      setSubTab('channels');
      loadData();
    } catch (err: any) {
      showFeedback('error', err.message || 'فشل استيراد القنوات');
    } finally {
      setIsImporting(false);
    }
  };

  // Bulk Health Check
  const handleRunBulkHealthCheck = async () => {
    if (channels.length === 0) return;
    setIsBulkChecking(true);
    setHealthProgress({ current: 0, total: channels.length });

    const newResults: Record<string, StreamValidationReport> = {};

    for (let i = 0; i < channels.length; i++) {
      const ch = channels[i];
      setHealthProgress({ current: i + 1, total: channels.length });
      try {
        const report = await channelService.checkStreamHealth(ch.streamUrl, true);
        newResults[ch.streamUrl] = report;
      } catch {
        newResults[ch.streamUrl] = {
          reachable: false,
          status: 'unavailable',
          message: 'خطأ اتصال',
        };
      }
      // Small polite delay between checks
      await new Promise((r) => setTimeout(r, 200));
    }

    setValidationResults((prev) => ({ ...prev, ...newResults }));
    setIsBulkChecking(false);
    showFeedback('success', 'اكتمل فحص صحة جميع القنوات');
  };

  // Save Category
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name.trim()) return;

    try {
      await channelService.saveCategory({
        id: editingCategory?.id,
        ...catForm,
      });
      showFeedback('success', editingCategory ? 'تم تحديث التصنيف' : 'تمت إضافة التصنيف');
      setIsCategoryModalOpen(false);
      loadData();
    } catch (err: any) {
      showFeedback('error', err.message || 'فشل حفظ التصنيف');
    }
  };

  // Delete Category
  const handleDeleteCategory = async (id: string) => {
    try {
      await channelService.deleteCategory(id);
      showFeedback('success', 'تم حذف التصنيف بنجاح');
      setDeleteCatConfirmId(null);
      loadData();
    } catch (err: any) {
      showFeedback('error', err.message || 'فشل حذف التصنيف');
    }
  };

  // Filtered Channels for table
  const filteredChannels = useMemo(() => {
    return channels.filter((c) => {
      if (filterCategory !== 'all' && c.categoryId !== filterCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          (c.categoryName && c.categoryName.toLowerCase().includes(q)) ||
          c.streamUrl.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [channels, filterCategory, searchQuery]);

  return (
    <div className="space-y-6 font-tajawal text-slate-900 dark:text-slate-100">
      {/* Feedback message banner */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between shadow-md ${
              feedback.type === 'success'
                ? 'bg-emerald-600 text-white'
                : 'bg-rose-600 text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span>{feedback.text}</span>
            </div>
            <button onClick={() => setFeedback(null)}>
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header & Subtabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-emerald-950/70 p-4 sm:p-5 rounded-3xl border border-emerald-900/10 dark:border-emerald-800/50 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Tv className="w-5 h-5 text-emerald-600 dark:text-amber-400" />
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              إدارة القنوات الإسلامية والبث المباشر
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            إضافة وإدارة قنوات HLS واستيراد قوائم M3U متعددة القنوات وفحص صحة البث
          </p>
        </div>

        {/* Subtabs Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSubTab('channels')}
            className={`h-9 px-3.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
              subTab === 'channels'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-emerald-900/40 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>جميع القنوات ({channels.length})</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="h-9 px-3.5 rounded-xl text-xs font-bold shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة قناة</span>
          </button>

          <button
            onClick={() => setSubTab('import')}
            className={`h-9 px-3.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
              subTab === 'import'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-emerald-900/40 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>استيراد M3U</span>
          </button>

          <button
            onClick={() => setSubTab('categories')}
            className={`h-9 px-3.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
              subTab === 'categories'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-emerald-900/40 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>التصنيفات ({categories.length})</span>
          </button>

          <button
            onClick={() => setSubTab('health')}
            className={`h-9 px-3.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
              subTab === 'health'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-emerald-900/40 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>صحة البث</span>
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 1. All Channels Tab */}
      {/* ==================================================== */}
      {subTab === 'channels' && (
        <div className="space-y-4">
          {/* Filter & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن قناة أو رابط..."
                className="w-full h-10 pr-9 pl-3 rounded-xl bg-white dark:bg-emerald-950/70 border border-emerald-900/10 dark:border-emerald-800/40 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="h-10 px-3 rounded-xl bg-white dark:bg-emerald-950/70 border border-emerald-900/10 dark:border-emerald-800/40 text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
              >
                <option value="all">جميع التصنيفات</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <button
                onClick={loadData}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-emerald-900/40 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
                title="تحديث البيانات"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Channels Table */}
          <div className="bg-white dark:bg-emerald-950/70 rounded-3xl border border-emerald-900/10 dark:border-emerald-800/40 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 dark:bg-emerald-900/40 text-slate-500 dark:text-slate-400 border-b border-emerald-900/10 dark:border-emerald-800/40">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">الشعار</th>
                    <th className="py-3.5 px-4 font-bold">اسم القناة</th>
                    <th className="py-3.5 px-4 font-bold">التصنيف</th>
                    <th className="py-3.5 px-4 font-bold">النوع</th>
                    <th className="py-3.5 px-4 font-bold">الحالة</th>
                    <th className="py-3.5 px-4 font-bold">مميزة</th>
                    <th className="py-3.5 px-4 font-bold text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-emerald-900/40">
                  {filteredChannels.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        لا توجد قنوات مطابقة للبحث
                      </td>
                    </tr>
                  ) : (
                    filteredChannels.map((ch) => {
                      const health = validationResults[ch.streamUrl];
                      return (
                        <tr
                          key={ch.id}
                          className="hover:bg-slate-50/70 dark:hover:bg-emerald-900/20 transition-colors"
                        >
                          {/* Logo */}
                          <td className="py-3 px-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-emerald-900/50 p-1 flex items-center justify-center overflow-hidden border border-emerald-900/10 dark:border-emerald-800/40">
                              {ch.logoUrl ? (
                                <img
                                  src={ch.logoUrl}
                                  alt={ch.name}
                                  className="w-full h-full object-contain"
                                  onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                                />
                              ) : (
                                <Tv className="w-4 h-4 text-emerald-600" />
                              )}
                            </div>
                          </td>

                          {/* Name */}
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 dark:text-white max-w-xs truncate">
                              {ch.name}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate max-w-xs font-mono" dir="ltr">
                              {ch.streamUrl}
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3 px-4">
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-bold text-[11px]">
                              {ch.categoryName || 'إسلامية'}
                            </span>
                          </td>

                          {/* Type */}
                          <td className="py-3 px-4">
                            <span className="font-mono uppercase font-bold text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {ch.streamType || 'hls'}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleToggleActive(ch)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                                ch.isActive
                                  ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  ch.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                                }`}
                              />
                              <span>{ch.isActive ? 'مفعلة' : 'معطلة'}</span>
                            </button>
                          </td>

                          {/* Featured */}
                          <td className="py-3 px-4">
                            {ch.isFeatured ? (
                              <span className="text-amber-500 font-bold text-[11px] flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>مميزة</span>
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">—</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Test Stream */}
                              <button
                                onClick={() => handleTestStream(ch.streamUrl)}
                                disabled={validatingUrl === ch.streamUrl}
                                className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 transition-colors"
                                title="فحص صحة البث"
                              >
                                {validatingUrl === ch.streamUrl ? (
                                  <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Activity className="w-4 h-4" />
                                )}
                              </button>

                              {/* Edit */}
                              <button
                                onClick={() => handleOpenEdit(ch)}
                                className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
                                title="تعديل القناة"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => setDeleteConfirmId(ch.id)}
                                className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors"
                                title="حذف القناة"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 2. M3U Importer Tab */}
      {/* ==================================================== */}
      {subTab === 'import' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-emerald-950/70 rounded-3xl p-5 sm:p-6 border border-emerald-900/10 dark:border-emerald-800/40 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-emerald-600 dark:text-amber-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                استيراد قنوات من ملف أو رابط M3U
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              يدعم المحلل استخراج وسوم EXTINF المتقدمة (الاسم، الشعار، المجموعة، الدولة، واللغة) مع حماية متكاملة ضد الـ SSRF وفحص الروابط الآمنة وكشف التكرار.
            </p>

            {/* Input Type Selector */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setM3uInputType('url')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  m3uInputType === 'url'
                    ? 'bg-emerald-800 text-white'
                    : 'bg-slate-100 dark:bg-emerald-900/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                رابط قائمة التشغيل (URL)
              </button>
              <button
                type="button"
                onClick={() => setM3uInputType('content')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  m3uInputType === 'content'
                    ? 'bg-emerald-800 text-white'
                    : 'bg-slate-100 dark:bg-emerald-900/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                لصق نص M3U المباشر
              </button>
            </div>

            {/* Inputs */}
            {m3uInputType === 'url' ? (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  رابط قائمة M3U (HTTP / HTTPS)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={m3uUrl}
                    onChange={(e) => setM3uUrl(e.target.value)}
                    placeholder="https://example.com/playlist.m3u"
                    className="flex-1 h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-emerald-900/10 dark:border-emerald-800/40 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                    dir="ltr"
                  />
                  <button
                    onClick={handleParseM3U}
                    disabled={isParsingM3u}
                    className="h-11 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all disabled:opacity-50 shrink-0"
                  >
                    {isParsingM3u ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    <span>تحليل الرابط بأمان</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  محتوى ملف M3U
                </label>
                <textarea
                  rows={8}
                  value={m3uContent}
                  onChange={(e) => setM3uContent(e.target.value)}
                  placeholder={`#EXTM3U\n#EXTINF:-1 tvg-name="Saudi Quran" tvg-logo="https://..." group-title="قرآن",قناة القرآن الكريم\nhttps://win.holol.com/live/quran/playlist.m3u8`}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-emerald-900/10 dark:border-emerald-800/40 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  dir="ltr"
                />
                <button
                  onClick={handleParseM3U}
                  disabled={isParsingM3u}
                  className="h-11 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
                >
                  {isParsingM3u ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>تحليل المحتوى بأمان</span>
                </button>
              </div>
            )}
          </div>

          {/* Parsed Items Preview & Selection */}
          {parsedItems.length > 0 && (
            <div className="bg-white dark:bg-emerald-950/70 rounded-3xl p-5 sm:p-6 border border-emerald-900/10 dark:border-emerald-800/40 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-emerald-900/40">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    معاينة القنوات المستخرجة ({parsedItems.length} قناة)
                  </h4>
                  <p className="text-xs text-slate-500">
                    تم تحديد {selectedM3uIds.size} قناة للاستيراد
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const all = new Set(parsedItems.map((p) => p.id));
                      setSelectedM3uIds(all);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-emerald-900/40 text-slate-700 dark:text-slate-300"
                  >
                    تحديد الكل
                  </button>
                  <button
                    onClick={() => setSelectedM3uIds(new Set())}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-emerald-900/40 text-slate-700 dark:text-slate-300"
                  >
                    إلغاء التحديد
                  </button>

                  <button
                    onClick={handleImportSelected}
                    disabled={isImporting || selectedM3uIds.size === 0}
                    className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
                  >
                    {isImporting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>استيراد ({selectedM3uIds.size}) إلى قاعدة البيانات</span>
                  </button>
                </div>
              </div>

              {/* Parsed List */}
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 dark:bg-emerald-900/40 text-slate-500 dark:text-slate-400 sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">اختيار</th>
                      <th className="py-2.5 px-3">الشعار</th>
                      <th className="py-2.5 px-3">اسم القناة</th>
                      <th className="py-2.5 px-3">المجموعة الأصلية</th>
                      <th className="py-2.5 px-3">النوع</th>
                      <th className="py-2.5 px-3">التكرار</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-emerald-900/40">
                    {parsedItems.map((item) => {
                      const isChecked = selectedM3uIds.has(item.id);
                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-slate-50 dark:hover:bg-emerald-900/20 ${
                            item.isDuplicate ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                const next = new Set(selectedM3uIds);
                                if (isChecked) next.delete(item.id);
                                else next.add(item.id);
                                setSelectedM3uIds(next);
                              }}
                              className="w-4 h-4 accent-emerald-600 rounded"
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-emerald-900/50 p-1 flex items-center justify-center overflow-hidden">
                              {item.logoUrl ? (
                                <img
                                  src={item.logoUrl}
                                  alt=""
                                  className="w-full h-full object-contain"
                                  onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                                />
                              ) : (
                                <Tv className="w-3.5 h-3.5 text-slate-400" />
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono truncate max-w-sm" dir="ltr">
                              {item.streamUrl}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                            {item.group || '—'}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-mono uppercase text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                              {item.streamType}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            {item.isDuplicate ? (
                              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100/70 dark:bg-amber-900/40 px-2 py-0.5 rounded-full">
                                مكررة (موجودة مسبقاً)
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full">
                                جديدة
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* 3. Categories Management Tab */}
      {/* ==================================================== */}
      {subTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              تصنيفات القنوات المتاحة
            </h3>
            <button
              onClick={() => {
                setEditingCategory(null);
                setCatForm({
                  name: '',
                  slug: '',
                  description: '',
                  icon: 'Tv',
                  sortOrder: categories.length + 1,
                  isActive: true,
                });
                setIsCategoryModalOpen(true);
              }}
              className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة تصنيف جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const count = channels.filter((ch) => ch.categoryId === cat.id).length;
              return (
                <div
                  key={cat.id}
                  className="bg-white dark:bg-emerald-950/70 rounded-2xl p-4 border border-emerald-900/10 dark:border-emerald-800/40 shadow-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold">
                      <Tv className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{cat.name}</h4>
                      <span className="text-[11px] text-slate-400 block">{count} قناة مرتبطة</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingCategory(cat);
                        setCatForm({
                          name: cat.name,
                          slug: cat.slug,
                          description: cat.description || '',
                          icon: cat.icon || 'Tv',
                          sortOrder: cat.sortOrder || 0,
                          isActive: cat.isActive ?? true,
                        });
                        setIsCategoryModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"
                      title="تعديل"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteCatConfirmId(cat.id)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 4. Stream Health Tab */}
      {/* ==================================================== */}
      {subTab === 'health' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-emerald-950/70 rounded-3xl p-5 sm:p-6 border border-emerald-900/10 dark:border-emerald-800/40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600 dark:text-amber-400" />
                <span>فحص صحة البث المباشر المجمع</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                فحص فوري لاستجابة روابط القنوات وقياس زمن الاستجابة وحالة الاتصال
              </p>
            </div>

            <button
              onClick={handleRunBulkHealthCheck}
              disabled={isBulkChecking}
              className="h-11 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-md active:scale-95 transition-all disabled:opacity-50"
            >
              {isBulkChecking ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>
                    جارٍ الفحص ({healthProgress.current}/{healthProgress.total})...
                  </span>
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4" />
                  <span>بدء الفحص الشامل للقنوات</span>
                </>
              )}
            </button>
          </div>

          {/* Health Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {channels.map((ch) => {
              const res = validationResults[ch.streamUrl];
              return (
                <div
                  key={ch.id}
                  className="bg-white dark:bg-emerald-950/70 rounded-2xl p-4 border border-emerald-900/10 dark:border-emerald-800/40 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-emerald-900/50 p-1 flex items-center justify-center overflow-hidden">
                        {ch.logoUrl ? (
                          <img src={ch.logoUrl} alt="" className="w-full h-full object-contain" />
                        ) : (
                          <Tv className="w-4 h-4 text-emerald-600" />
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {ch.name}
                      </h4>
                    </div>

                    {res ? (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          res.reachable
                            ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            res.reachable ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        <span>{res.reachable ? 'متصل' : 'غير متاح'}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">لم يفحص بعد</span>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-emerald-900/30 p-2 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span>زمن الاستجابة:</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                        {res?.latencyMs ? `${res.latencyMs} ms` : '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>رمز الحالة:</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                        {res?.statusCode || '—'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* Channel Add/Edit Modal */}
      {/* ==================================================== */}
      <AnimatePresence>
        {isChannelModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-2xl bg-white dark:bg-emerald-950 rounded-3xl border border-emerald-900/20 dark:border-emerald-800 shadow-2xl p-6 space-y-5 my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-900/50">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Tv className="w-5 h-5 text-emerald-600" />
                  <span>{editingChannel ? 'تعديل بيانات القناة' : 'إضافة قناة إسلامية جديدة'}</span>
                </h3>
                <button
                  onClick={() => setIsChannelModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveChannel} className="space-y-4">
                {/* Name & Slug */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      اسم القناة *
                    </label>
                    <input
                      type="text"
                      required
                      value={channelForm.name}
                      onChange={(e) => setChannelForm({ ...channelForm, name: e.target.value })}
                      placeholder="مثال: قناة القرآن الكريم"
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-emerald-900/10 dark:border-emerald-800/40 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      الاسم اللطيف (Slug)
                    </label>
                    <input
                      type="text"
                      value={channelForm.slug}
                      onChange={(e) => setChannelForm({ ...channelForm, slug: e.target.value })}
                      placeholder="saudi-quran"
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-emerald-900/10 dark:border-emerald-800/40 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Stream URL & Test Button */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>رابط البث المباشر (HLS / M3U8) *</span>
                    {channelForm.streamUrl && (
                      <button
                        type="button"
                        onClick={() => handleTestStream(channelForm.streamUrl)}
                        disabled={validatingUrl === channelForm.streamUrl}
                        className="text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 font-bold text-[11px]"
                      >
                        {validatingUrl === channelForm.streamUrl ? (
                          <span>جارٍ الفحص...</span>
                        ) : (
                          <>
                            <Activity className="w-3.5 h-3.5" />
                            <span>فحص البث الآن</span>
                          </>
                        )}
                      </button>
                    )}
                  </label>
                  <input
                    type="url"
                    required
                    value={channelForm.streamUrl}
                    onChange={(e) => {
                      const url = e.target.value;
                      let streamType: ChannelStreamType = 'hls';
                      if (url.includes('.m3u8')) streamType = 'hls';
                      else if (url.includes('.m3u')) streamType = 'm3u';
                      setChannelForm({ ...channelForm, streamUrl: url, streamType });
                    }}
                    placeholder="https://.../live/playlist.m3u8"
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-emerald-900/10 dark:border-emerald-800/40 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                    dir="ltr"
                  />
                </div>

                {/* Category & Stream Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      التصنيف
                    </label>
                    <select
                      value={channelForm.categoryId}
                      onChange={(e) => setChannelForm({ ...channelForm, categoryId: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-emerald-900/10 dark:border-emerald-800/40 text-xs focus:outline-none focus:border-emerald-500"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      نوع البث
                    </label>
                    <select
                      value={channelForm.streamType}
                      onChange={(e) =>
                        setChannelForm({ ...channelForm, streamType: e.target.value as ChannelStreamType })
                      }
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-emerald-900/10 dark:border-emerald-800/40 text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="hls">HLS (.m3u8)</option>
                      <option value="m3u">M3U Playlist (.m3u)</option>
                      <option value="unknown">أخرى</option>
                    </select>
                  </div>
                </div>

                {/* Logo URL */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    رابط الشعار (Logo URL)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={channelForm.logoUrl}
                      onChange={(e) => setChannelForm({ ...channelForm, logoUrl: e.target.value })}
                      placeholder="https://.../logo.png"
                      className="flex-1 h-10 px-3 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-emerald-900/10 dark:border-emerald-800/40 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                      dir="ltr"
                    />
                    {channelForm.logoUrl && (
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-emerald-900/50 p-1 flex items-center justify-center shrink-0">
                        <img
                          src={channelForm.logoUrl}
                          alt=""
                          className="w-full h-full object-contain"
                          onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    الوصف
                  </label>
                  <textarea
                    rows={2}
                    value={channelForm.description}
                    onChange={(e) => setChannelForm({ ...channelForm, description: e.target.value })}
                    placeholder="نبذة موجزة عن محتوى القناة والبث..."
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-emerald-900/10 dark:border-emerald-800/40 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Source Attribution */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      اسم المصدر الرسمي
                    </label>
                    <input
                      type="text"
                      value={channelForm.sourceName}
                      onChange={(e) => setChannelForm({ ...channelForm, sourceName: e.target.value })}
                      placeholder="مثال: هيئة الإذاعة والتلفزيون"
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-emerald-900/10 dark:border-emerald-800/40 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      رابط موقع المصدر
                    </label>
                    <input
                      type="url"
                      value={channelForm.sourceUrl}
                      onChange={(e) => setChannelForm({ ...channelForm, sourceUrl: e.target.value })}
                      placeholder="https://sba.sa"
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-emerald-900/10 dark:border-emerald-800/40 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Toggles: Featured & Active */}
                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channelForm.isActive}
                      onChange={(e) => setChannelForm({ ...channelForm, isActive: e.target.checked })}
                      className="w-4 h-4 accent-emerald-600 rounded"
                    />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      تفعيل القناة وظهورها للجمهور
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channelForm.isFeatured}
                      onChange={(e) => setChannelForm({ ...channelForm, isFeatured: e.target.checked })}
                      className="w-4 h-4 accent-amber-500 rounded"
                    />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      قناة مميزة (تظهر في الرئيسية)
                    </span>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-emerald-900/50">
                  <button
                    type="button"
                    onClick={() => setIsChannelModalOpen(false)}
                    className="h-10 px-5 rounded-xl bg-slate-100 dark:bg-emerald-900/40 text-slate-700 dark:text-slate-300 text-xs font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md"
                  >
                    حفظ البيانات
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================================================== */}
      {/* Category Modal */}
      {/* ==================================================== */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-emerald-950 rounded-3xl border border-emerald-900/20 dark:border-emerald-800 shadow-2xl p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-emerald-900/40">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingCategory ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
                </h3>
                <button onClick={() => setIsCategoryModalOpen(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSaveCategory} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold">اسم التصنيف *</label>
                  <input
                    type="text"
                    required
                    value={catForm.name}
                    onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                    placeholder="مثال: تلاوات مختارة"
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-emerald-900/10 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold">الاسم اللطيف (Slug)</label>
                  <input
                    type="text"
                    value={catForm.slug}
                    onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })}
                    placeholder="tilawat"
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-emerald-900/10 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold">الوصف</label>
                  <input
                    type="text"
                    value={catForm.description}
                    onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                    placeholder="وصف مختصر للتصنيف..."
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-emerald-900/10 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="h-9 px-4 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="h-9 px-5 rounded-xl bg-emerald-700 text-white text-xs font-bold"
                  >
                    حفظ التصنيف
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog for Channel Delete */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white dark:bg-emerald-950 rounded-3xl border border-rose-500/30 p-6 space-y-4 shadow-2xl text-center"
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 mx-auto flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">تأكيد حذف القناة</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                هل أنت متأكد من رغبتك في حذف هذه القناة نهائياً من النظام؟
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="h-9 px-4 rounded-xl bg-slate-100 dark:bg-emerald-900/40 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => handleDeleteChannel(deleteConfirmId)}
                  className="h-9 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                >
                  نعم، احذف
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog for Category Delete */}
      <AnimatePresence>
        {deleteCatConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white dark:bg-emerald-950 rounded-3xl border border-rose-500/30 p-6 space-y-4 shadow-2xl text-center"
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 mx-auto flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">تأكيد حذف التصنيف</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                هل أنت متأكد من حذف هذا التصنيف؟ لن يتم حذف القنوات المرتبطة بل ستفقد تصنيفها الحالي.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setDeleteCatConfirmId(null)}
                  className="h-9 px-4 rounded-xl bg-slate-100 dark:bg-emerald-900/40 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => handleDeleteCategory(deleteCatConfirmId)}
                  className="h-9 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                >
                  نعم، احذف
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
