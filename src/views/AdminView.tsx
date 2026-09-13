import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  LayoutDashboard,
  BookOpen,
  FolderTree,
  Share2,
  Radio,
  Users,
  History,
  LogOut,
  Plus,
  Trash2,
  Edit3,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Sliders,
  ExternalLink,
  Menu,
  X,
  RefreshCw,
  Clock,
  Sparkles,
  FileCheck2,
  Check,
  AlertCircle,
  HandHeart,
  Award,
  Lock,
  Building2
} from 'lucide-react';
import { BrandLogo } from '../components/brand/BrandLogo';
import { useAdmin } from '../context/AdminContext';
import { useShareModal } from '../context/ShareContext';
import { AdminRadioManager } from '../components/AdminRadioManager';
import { AdminContentItem, AdminSectionItem, AuditLogEntry } from '../types/admin';
import { DonationPlatform } from '../types/donations';
import { BinBazLinkItem } from '../types/binbaz';
import { validateDonationUrl } from '../services/donationService';
import { validateBinBazUrl } from '../services/binbazService';
import { useModalScrollLock } from '../hooks/useModalScrollLock';

interface AdminViewProps {
  onNavigate: (tab: string, contextId?: any) => void;
}

type AdminTab = 'overview' | 'content' | 'sections' | 'share-cards' | 'radio' | 'donations' | 'binbaz' | 'users' | 'audit';

export const AdminView: React.FC<AdminViewProps> = ({ onNavigate }) => {
  const { adminUsername, logoutAdmin, isAdminAuthenticated, isLoadingAdminAuth } = useAdmin();
  const { openShareModal } = useShareModal();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Data states
  const [stats, setStats] = useState<any>(null);
  const [contentList, setContentList] = useState<AdminContentItem[]>([]);
  const [sectionsList, setSectionsList] = useState<AdminSectionItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Content Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal / Editor State
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<AdminContentItem | null>(null);

  useModalScrollLock(isContentModalOpen, {
    onClose: () => setIsContentModalOpen(false),
    closeOnEsc: true,
  });

  const [contentForm, setContentForm] = useState({
    title: '',
    text: '',
    source: '',
    narrator: '',
    contentType: 'ذكر',
    sectionId: '',
    status: 'published' as 'published' | 'draft' | 'needs_review' | 'rejected',
    verification: 'verified' as 'verified' | 'needs_review' | 'rejected',
  });

  // Section Modal State
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<AdminSectionItem | null>(null);

  useModalScrollLock(isSectionModalOpen, {
    onClose: () => setIsSectionModalOpen(false),
    closeOnEsc: true,
  });
  const [sectionForm, setSectionForm] = useState({
    name: '',
    type: 'dhikr',
    order: 1,
    isActive: true,
  });

  // Donations State
  const [donationsList, setDonationsList] = useState<DonationPlatform[]>([]);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [editingDonation, setEditingDonation] = useState<DonationPlatform | null>(null);

  useModalScrollLock(isDonationModalOpen, {
    onClose: () => setIsDonationModalOpen(false),
    closeOnEsc: true,
  });

  const [donationForm, setDonationForm] = useState({
    name: '',
    description: '',
    url: '',
    officialEntity: '',
    supervisingEntity: '',
    logoUrl: '',
    categoriesText: 'تبرع عام، الزكاة، الأوقاف',
    featuresText: 'فرص تبرع مباشرة، حاسبة الزكاة',
    status: 'verified' as 'verified' | 'pending_review' | 'rejected' | 'inactive',
    sortOrder: 1,
    notes: '',
  });

  // Bin Baz State
  const [binbazList, setBinbazList] = useState<BinBazLinkItem[]>([]);
  const [isBinBazModalOpen, setIsBinBazModalOpen] = useState(false);
  const [editingBinBaz, setEditingBinBaz] = useState<BinBazLinkItem | null>(null);

  useModalScrollLock(isBinBazModalOpen, {
    onClose: () => setIsBinBazModalOpen(false),
    closeOnEsc: true,
  });

  const [binbazForm, setBinbazForm] = useState({
    title: '',
    description: '',
    url: '',
    category: 'general' as any,
    categoryLabelAr: 'البوابة الرئيسية',
    status: 'verified' as 'verified' | 'draft' | 'inactive',
    sortOrder: 1,
    highlight: false,
  });

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Fetch all admin data
  const loadData = async () => {
    setIsLoadingData(true);
    try {
      const [statsRes, contentRes, sectionsRes, auditRes, usersRes, donationsRes, binbazRes] = await Promise.all([
        fetch('/api/admin/stats', { credentials: 'include' }),
        fetch('/api/admin/content', { credentials: 'include' }),
        fetch('/api/admin/sections', { credentials: 'include' }),
        fetch('/api/admin/audit-logs', { credentials: 'include' }),
        fetch('/api/admin/users', { credentials: 'include' }),
        fetch('/api/admin/donations', { credentials: 'include' }),
        fetch('/api/admin/binbaz', { credentials: 'include' }),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (contentRes.ok) {
        const data = await contentRes.json();
        setContentList(data.items || []);
      }
      if (sectionsRes.ok) {
        const data = await sectionsRes.json();
        setSectionsList(data.sections || []);
      }
      if (auditRes.ok) {
        const data = await auditRes.json();
        setAuditLogs(data.logs || []);
      }
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsersList(data.users || []);
      }
      if (donationsRes.ok) {
        const data = await donationsRes.json();
        setDonationsList(data.platforms || []);
      }
      if (binbazRes.ok) {
        const data = await binbazRes.json();
        setBinbazList(data.links || []);
      }
    } catch (e) {
      console.warn('Failed to load admin data:', e);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAdminAuthenticated) {
      loadData();
    }
  }, [isAdminAuthenticated]);

  // Handle Logout
  const handleLogout = async () => {
    if (window.confirm('هل أنت متأكد من رغبتك في تسجيل الخروج من لوحة الإدارة؟')) {
      await logoutAdmin();
      onNavigate('admin/login');
    }
  };

  // Filtered Content
  const filteredContents = useMemo(() => {
    return contentList.filter((item) => {
      const matchSearch =
        !searchQuery ||
        item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchType = filterType === 'all' || item.contentType === filterType;
      const matchStatus =
        filterStatus === 'all' ||
        item.status === filterStatus ||
        item.verification === filterStatus;

      return matchSearch && matchType && matchStatus;
    });
  }, [contentList, searchQuery, filterType, filterStatus]);

  // Open Content Editor
  const openNewContentModal = () => {
    setEditingContent(null);
    setContentForm({
      title: '',
      text: '',
      source: '',
      narrator: '',
      contentType: 'ذكر',
      sectionId: sectionsList[0]?.id || 'sec-1',
      status: 'published',
      verification: 'verified',
    });
    setIsContentModalOpen(true);
  };

  const openEditContentModal = (item: AdminContentItem) => {
    setEditingContent(item);
    setContentForm({
      title: item.title || '',
      text: item.text,
      source: item.source,
      narrator: item.narrator || '',
      contentType: item.contentType,
      sectionId: item.sectionId,
      status: item.status,
      verification: item.verification,
    });
    setIsContentModalOpen(true);
  };

  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingContent) {
        const res = await fetch(`/api/admin/content/${editingContent.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(contentForm),
        });
        if (res.ok) {
          showFeedback('تم تحديث المحتوى بنجاح');
          loadData();
          setIsContentModalOpen(false);
        }
      } else {
        const res = await fetch('/api/admin/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(contentForm),
        });
        if (res.ok) {
          showFeedback('تمت إضافة المحتوى وتوثيقه بنجاح');
          loadData();
          setIsContentModalOpen(false);
        }
      }
    } catch {
      showFeedback('فشل حفظ المحتوى، يرجى المحاولة لاحقاً', 'error');
    }
  };

  const handleDeleteContent = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المحتوى نهائياً؟')) return;
    try {
      const res = await fetch(`/api/admin/content/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        showFeedback('تم حذف المحتوى');
        loadData();
      }
    } catch {
      showFeedback('فشل حذف المحتوى', 'error');
    }
  };

  // Toggle publish status
  const handleTogglePublish = async (item: AdminContentItem) => {
    const nextStatus = item.status === 'published' ? 'draft' : 'published';
    try {
      const res = await fetch(`/api/admin/content/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        showFeedback(nextStatus === 'published' ? 'تم نشر المحتوى' : 'تم إلغاء النشر وحفظه كمسودة');
        loadData();
      }
    } catch {
      showFeedback('حدث خطأ أثناء تعديل الحالة', 'error');
    }
  };

  // Section Save
  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSection) {
        const res = await fetch(`/api/admin/sections/${editingSection.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(sectionForm),
        });
        if (res.ok) {
          showFeedback('تم تحديث بيانات القسم بنجاح');
          loadData();
          setIsSectionModalOpen(false);
        }
      } else {
        const res = await fetch('/api/admin/sections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(sectionForm),
        });
        if (res.ok) {
          showFeedback('تم إنشاء القسم الجديد بنجاح');
          loadData();
          setIsSectionModalOpen(false);
        }
      }
    } catch {
      showFeedback('فشل حفظ القسم', 'error');
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا القسم؟')) return;
    try {
      const res = await fetch(`/api/admin/sections/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        showFeedback('تم حذف القسم');
        loadData();
      }
    } catch {
      showFeedback('فشل حذف القسم', 'error');
    }
  };

  // ==========================================
  // Donations Handlers
  // ==========================================
  const handleOpenAddDonation = () => {
    setEditingDonation(null);
    setDonationForm({
      name: '',
      description: '',
      url: '',
      officialEntity: '',
      supervisingEntity: '',
      logoUrl: '',
      categoriesText: 'تبرع عام، الزكاة، الأوقاف',
      featuresText: 'فرص التبرع السريع، حساب الزكاة',
      status: 'verified',
      sortOrder: donationsList.length + 1,
      notes: '',
    });
    setIsDonationModalOpen(true);
  };

  const handleOpenEditDonation = (p: DonationPlatform) => {
    setEditingDonation(p);
    setDonationForm({
      name: p.name,
      description: p.description,
      url: p.url,
      officialEntity: p.officialEntity,
      supervisingEntity: p.supervisingEntity,
      logoUrl: p.logoUrl || '',
      categoriesText: p.categories.join('، '),
      featuresText: p.features.join('، '),
      status: p.status,
      sortOrder: p.sortOrder,
      notes: p.notes || '',
    });
    setIsDonationModalOpen(true);
  };

  const handleSaveDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    const urlValidation = validateDonationUrl(donationForm.url);
    if (!urlValidation.isValid) {
      showFeedback(urlValidation.error || 'الرابط غير صالح', 'error');
      return;
    }

    try {
      const payload = {
        name: donationForm.name.trim(),
        description: donationForm.description.trim(),
        url: urlValidation.normalizedUrl || donationForm.url.trim(),
        officialEntity: donationForm.officialEntity.trim(),
        supervisingEntity: donationForm.supervisingEntity.trim(),
        logoUrl: donationForm.logoUrl.trim() || undefined,
        categories: donationForm.categoriesText.split(/[،,]/).map((s) => s.trim()).filter(Boolean),
        features: donationForm.featuresText.split(/[،,]/).map((s) => s.trim()).filter(Boolean),
        status: donationForm.status,
        sortOrder: donationForm.sortOrder,
        notes: donationForm.notes.trim() || undefined,
      };

      const url = editingDonation ? `/api/admin/donations/${editingDonation.id}` : '/api/admin/donations';
      const method = editingDonation ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (res.ok) {
        showFeedback(editingDonation ? 'تم تعديل منصة التبرع بنجاح' : 'تمت إضافة منصة التبرع بنجاح');
        loadData();
        setIsDonationModalOpen(false);
      } else {
        const data = await res.json();
        showFeedback(data.error || 'فشل حفظ المنصة', 'error');
      }
    } catch {
      showFeedback('فشل حفظ المنصة', 'error');
    }
  };

  const handleDeleteDonation = async (id: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف منصة التبرع: ${name}؟`)) return;
    try {
      const res = await fetch(`/api/admin/donations/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        showFeedback('تم حذف منصة التبرع');
        loadData();
      }
    } catch {
      showFeedback('فشل حذف المنصة', 'error');
    }
  };

  // ==========================================
  // Bin Baz Handlers
  // ==========================================
  const handleOpenAddBinBaz = () => {
    setEditingBinBaz(null);
    setBinbazForm({
      title: '',
      description: '',
      url: 'https://binbaz.org.sa/',
      category: 'general',
      categoryLabelAr: 'البوابة الرئيسية',
      status: 'verified',
      sortOrder: binbazList.length + 1,
      highlight: false,
    });
    setIsBinBazModalOpen(true);
  };

  const handleOpenEditBinBaz = (b: BinBazLinkItem) => {
    setEditingBinBaz(b);
    setBinbazForm({
      title: b.title,
      description: b.description,
      url: b.url,
      category: b.category,
      categoryLabelAr: b.categoryLabelAr,
      status: b.status,
      sortOrder: b.sortOrder,
      highlight: Boolean(b.highlight),
    });
    setIsBinBazModalOpen(true);
  };

  const handleSaveBinBaz = async (e: React.FormEvent) => {
    e.preventDefault();
    const urlValidation = validateBinBazUrl(binbazForm.url);
    if (!urlValidation.isValid) {
      showFeedback(urlValidation.error || 'الرابط غير صالح', 'error');
      return;
    }

    try {
      const payload = {
        title: binbazForm.title.trim(),
        description: binbazForm.description.trim(),
        url: urlValidation.normalizedUrl || binbazForm.url.trim(),
        category: binbazForm.category,
        categoryLabelAr: binbazForm.categoryLabelAr.trim(),
        status: binbazForm.status,
        sortOrder: binbazForm.sortOrder,
        highlight: binbazForm.highlight,
      };

      const url = editingBinBaz ? `/api/admin/binbaz/${editingBinBaz.id}` : '/api/admin/binbaz';
      const method = editingBinBaz ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (res.ok) {
        showFeedback(editingBinBaz ? 'تم تعديل الرابط بنجاح' : 'تمت إضافة الرابط بنجاح');
        loadData();
        setIsBinBazModalOpen(false);
      } else {
        const data = await res.json();
        showFeedback(data.error || 'فشل حفظ الرابط', 'error');
      }
    } catch {
      showFeedback('فشل حفظ الرابط', 'error');
    }
  };

  const handleDeleteBinBaz = async (id: string, title: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف الرابط: ${title}؟`)) return;
    try {
      const res = await fetch(`/api/admin/binbaz/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        showFeedback('تم حذف الرابط');
        loadData();
      }
    } catch {
      showFeedback('فشل حذف الرابط', 'error');
    }
  };

  // Navigation Items
  const navTabs = [
    { id: 'overview', label: 'لوحة المؤشرات', icon: LayoutDashboard },
    { id: 'content', label: 'المحتوى الإسلامي', icon: BookOpen, badge: contentList.length },
    { id: 'sections', label: 'إدارة الأقسام', icon: FolderTree, badge: sectionsList.length },
    { id: 'donations', label: 'الصدقة والتبرع', icon: HandHeart, badge: donationsList.length },
    { id: 'binbaz', label: 'موقع ابن باز', icon: Award, badge: binbazList.length },
    { id: 'share-cards', label: 'بطاقات المشاركة', icon: Share2 },
    { id: 'radio', label: 'إذاعة القرآن الكريم', icon: Radio },
    { id: 'users', label: 'المستخدمون', icon: Users, badge: usersList.length },
    { id: 'audit', label: 'سجل التدقيق (Audit)', icon: History },
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#031c15] text-slate-900 dark:text-slate-100 flex font-tajawal selection:bg-amber-500 selection:text-slate-950">
      {/* Toast Notification */}
      {feedbackMsg && (
        <div
          className={`fixed bottom-6 left-6 z-50 px-4 py-3 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 border animate-in slide-in-from-bottom-3 ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-800 text-white border-emerald-700'
              : 'bg-rose-800 text-white border-rose-700'
          }`}
        >
          {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <AlertCircle className="w-4 h-4 text-rose-300" />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-emerald-950/95 border-l border-slate-200 dark:border-emerald-900/60 shadow-sm shrink-0 sticky top-0 h-screen overflow-y-auto">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 dark:border-emerald-900/60 flex flex-col items-center">
          <BrandLogo
            variant="compact"
            size="md"
            clickable
            onClick={() => onNavigate('home')}
            className="mb-2"
          />
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-bold text-amber-700 dark:text-amber-400">
            <ShieldCheck className="w-3 h-3" />
            <span>نظام الإدارة المركزي المعزول</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 p-3 space-y-1">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-800 text-white shadow-sm shadow-emerald-900/20'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-emerald-900/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-emerald-700 dark:text-emerald-400'}`} />
                  <span>{tab.label}</span>
                </div>
                {tab.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-emerald-900 text-amber-300'
                        : 'bg-slate-100 dark:bg-emerald-900/60 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Admin Profile & Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-emerald-900/60 space-y-2">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-emerald-900/40">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                {adminUsername?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {adminUsername || 'alshbili'}
                </p>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  مدير النظام (Admin)
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="تسجيل الخروج"
              className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => onNavigate('home')}
            className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-emerald-900 text-slate-600 dark:text-slate-400 hover:text-emerald-800 dark:hover:text-emerald-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>معاينة المنصة العامة</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white dark:bg-emerald-950/90 border-b border-slate-200 dark:border-emerald-900/60 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="p-2 lg:hidden rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-emerald-900/40"
              aria-label="القائمة"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {navTabs.find((t) => t.id === activeTab)?.label}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              disabled={isLoadingData}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-emerald-900/40 transition-colors cursor-pointer"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleLogout}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-xs font-bold border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs flex animate-in fade-in duration-200">
            <div className="w-64 bg-white dark:bg-emerald-950 p-4 flex flex-col h-full shadow-2xl border-l border-emerald-900">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-900">
                <BrandLogo variant="compact" size="sm" />
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
                {navTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as AdminTab);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold ${
                        isActive
                          ? 'bg-emerald-800 text-white'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-emerald-900/40'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </div>
                      {tab.badge !== undefined && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-emerald-900 text-slate-600 dark:text-slate-300">
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="pt-3 border-t border-slate-100 dark:border-emerald-900">
                <button
                  onClick={handleLogout}
                  className="w-full py-2 px-3 rounded-xl bg-rose-600 text-white text-xs font-bold flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileSidebarOpen(false)} />
          </div>
        )}

        {/* View Switcher Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto space-y-6">
          {/* TAB 1: OVERVIEW & STATS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-4 sm:p-5 border border-emerald-900/10 dark:border-emerald-800/60 shadow-sm text-right">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    إجمالي المحتوى الشرعي
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold font-amiri text-emerald-950 dark:text-white mt-1">
                    {stats?.counts?.totalContent ?? contentList.length}
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 mt-2 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{stats?.counts?.verifiedContent ?? 0} معتمد وموثق</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-4 sm:p-5 border border-emerald-900/10 dark:border-emerald-800/60 shadow-sm text-right">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    أقسام المنصة
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold font-amiri text-emerald-950 dark:text-white mt-1">
                    {sectionsList.length}
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 mt-2 font-medium">
                    <FolderTree className="w-3.5 h-3.5" />
                    <span>مرتبطة تلقائياً ببطاقات المشاركة</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-4 sm:p-5 border border-emerald-900/10 dark:border-emerald-800/60 shadow-sm text-right">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    المستخدمون المسجلون
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold font-amiri text-emerald-950 dark:text-white mt-1">
                    {stats?.counts?.registeredUsers ?? usersList.length}
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] text-teal-600 dark:text-teal-400 mt-2 font-medium">
                    <Users className="w-3.5 h-3.5" />
                    <span>متابعون للأوراد والختمات</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-4 sm:p-5 border border-emerald-900/10 dark:border-emerald-800/60 shadow-sm text-right">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    إذاعات القرآن المعتمدة
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold font-amiri text-emerald-950 dark:text-white mt-1">
                    {stats?.counts?.radioStations ?? 24}
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
                    <Radio className="w-3.5 h-3.5" />
                    <span>بث مباشر فوري</span>
                  </div>
                </div>
              </div>

              {/* System Security Status Banner */}
              <div className="bg-gradient-to-br from-emerald-900 to-teal-950 rounded-2xl p-5 text-white shadow-md border border-emerald-700/40 flex flex-col md:flex-row md:items-center justify-between gap-4 text-right">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-300" />
                    <h4 className="text-sm sm:text-base font-bold">
                      حالة أمان الخادم وعزل الإدارة (Isolated Security Status)
                    </h4>
                  </div>
                  <p className="text-xs text-emerald-100/80 leading-relaxed max-w-2xl">
                    نظام الإدارة يعمل بنموذج الحماية المزدوج (Server-Side Session Store • Rate-Limited Authentication • Zero User Leakage).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={openNewContentModal}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة محتوى شرعي موثق</span>
                  </button>
                </div>
              </div>

              {/* Quick Actions & Recent Content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Content Box */}
                <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 border border-slate-200 dark:border-emerald-900/60 shadow-sm text-right space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-emerald-600" />
                      <span>أحدث النصوص المضافة</span>
                    </h4>
                    <button
                      onClick={() => setActiveTab('content')}
                      className="text-xs text-emerald-700 dark:text-amber-300 hover:underline cursor-pointer"
                    >
                      عرض الكل ({contentList.length})
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {contentList.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-emerald-900/30 border border-slate-100 dark:border-emerald-900/50 flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-800/60 text-emerald-800 dark:text-emerald-200 font-bold">
                              {item.contentType}
                            </span>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                              {item.title || item.sectionName}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">
                            {item.text}
                          </p>
                          <span className="text-[10px] text-slate-400">{item.source}</span>
                        </div>

                        <button
                          onClick={() => {
                            openShareModal({
                              sectionName: item.sectionName,
                              contentType: item.contentType,
                              content: item.text,
                              source: item.source,
                            });
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-amber-300 hover:bg-slate-100 dark:hover:bg-emerald-800/40 shrink-0 cursor-pointer"
                          title="معاينة بطاقة المشاركة"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Audit Log Box */}
                <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 border border-slate-200 dark:border-emerald-900/60 shadow-sm text-right space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <History className="w-4 h-4 text-emerald-600" />
                      <span>آخر عمليات سجل التدقيق (Audit Log)</span>
                    </h4>
                    <button
                      onClick={() => setActiveTab('audit')}
                      className="text-xs text-emerald-700 dark:text-amber-300 hover:underline cursor-pointer"
                    >
                      عرض السجل بالكامل
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {auditLogs.slice(0, 4).map((log) => (
                      <div
                        key={log.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-emerald-900/30 border border-slate-100 dark:border-emerald-900/50 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                log.status === 'success'
                                  ? 'bg-emerald-500'
                                  : log.status === 'warning'
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                            />
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {log.action}
                            </span>
                            <span className="text-[10px] text-slate-400">({log.resource})</span>
                          </div>
                          {log.details && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                              {log.details}
                            </p>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ISLAMIC CONTENT MANAGEMENT */}
          {activeTab === 'content' && (
            <div className="space-y-4">
              {/* Actions & Filters Bar */}
              <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-4 border border-slate-200 dark:border-emerald-900/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex flex-1 items-center gap-3">
                  {/* Search */}
                  <div className="relative flex-1 max-w-sm">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="بحث في النصوص، المصادر، العناوين..."
                      className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-emerald-900/30 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-right"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                  </div>

                  {/* Filter by Type */}
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="py-2 px-3 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-emerald-900/30 text-xs font-bold focus:outline-hidden"
                  >
                    <option value="all">كافة الأنواع</option>
                    <option value="ذكر">الأذكار</option>
                    <option value="حديث">الأحاديث النبوية</option>
                    <option value="دعاء">الأدعية</option>
                    <option value="آية">القرآن الكريم</option>
                    <option value="فتوى">الفتاوى والمقالات</option>
                  </select>

                  {/* Filter by Status */}
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="py-2 px-3 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-emerald-900/30 text-xs font-bold focus:outline-hidden"
                  >
                    <option value="all">كافة الحالات</option>
                    <option value="published">منشور</option>
                    <option value="draft">مسودة</option>
                    <option value="verified">معتمد وموثق</option>
                    <option value="needs_review">يحتاج مراجعة</option>
                  </select>
                </div>

                <button
                  onClick={openNewContentModal}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة محتوى جديد</span>
                </button>
              </div>

              {/* Content List Table / Responsive Cards */}
              <div className="bg-white dark:bg-emerald-950/80 rounded-2xl border border-slate-200 dark:border-emerald-900/60 shadow-sm overflow-hidden text-right">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 dark:bg-emerald-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-emerald-900/60 font-bold">
                      <tr>
                        <th className="p-3.5">النوع والقسم</th>
                        <th className="p-3.5">نص المحتوى</th>
                        <th className="p-3.5">المصدر الموثق</th>
                        <th className="p-3.5">التوثيق والنشر</th>
                        <th className="p-3.5 text-center">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-emerald-900/40">
                      {filteredContents.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-400">
                            لا يوجد محتوى مطابق للبحث أو الفلترة
                          </td>
                        </tr>
                      ) : (
                        filteredContents.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-emerald-900/20 transition-colors">
                            <td className="p-3.5 align-top whitespace-nowrap">
                              <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] mb-1">
                                {item.contentType}
                              </span>
                              <p className="font-bold text-slate-800 dark:text-slate-200">
                                {item.sectionName}
                              </p>
                            </td>

                            <td className="p-3.5 align-top max-w-md">
                              {item.title && (
                                <p className="font-bold text-slate-900 dark:text-white text-xs mb-1">
                                  {item.title}
                                </p>
                              )}
                              <p className="text-slate-700 dark:text-slate-300 line-clamp-3 leading-relaxed">
                                {item.text}
                              </p>
                              {item.narrator && (
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                  الراوي: {item.narrator}
                                </span>
                              )}
                            </td>

                            <td className="p-3.5 align-top whitespace-nowrap font-medium text-slate-500 dark:text-slate-400">
                              {item.source}
                            </td>

                            <td className="p-3.5 align-top whitespace-nowrap space-y-1">
                              <div>
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    item.verification === 'verified'
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                                      : item.verification === 'needs_review'
                                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                                      : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
                                  }`}
                                >
                                  {item.verification === 'verified' && <Check className="w-3 h-3" />}
                                  {item.verification === 'verified' ? 'معتمد' : 'يحتاج مراجعة'}
                                </span>
                              </div>
                              <div>
                                <button
                                  onClick={() => handleTogglePublish(item)}
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold cursor-pointer transition-colors ${
                                    item.status === 'published'
                                      ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200'
                                  }`}
                                >
                                  {item.status === 'published' ? 'منشور (نشط)' : 'مسودة (معطل)'}
                                </button>
                              </div>
                            </td>

                            <td className="p-3.5 align-top whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() =>
                                    openShareModal({
                                      sectionName: item.sectionName,
                                      contentType: item.contentType,
                                      content: item.text,
                                      source: item.source,
                                    })
                                  }
                                  className="p-1.5 rounded-lg text-emerald-700 dark:text-amber-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 cursor-pointer"
                                  title="معاينة بطاقة المشاركة المعتمدة"
                                >
                                  <Share2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => openEditContentModal(item)}
                                  className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-emerald-900/40 cursor-pointer"
                                  title="تعديل"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteContent(item.id)}
                                  className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                                  title="حذف"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SECTIONS MANAGEMENT */}
          {activeTab === 'sections' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-4 border border-slate-200 dark:border-emerald-900/60 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    أقسام المنصة وتصنيفاتها
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    عند مشاركة أي نص دعوي، يرتبط اسم القسم تلقائياً ببطاقة المشاركة المعتمدة.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingSection(null);
                    setSectionForm({ name: '', type: 'dhikr', order: sectionsList.length + 1, isActive: true });
                    setIsSectionModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة قسم جديد</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sectionsList.map((sec) => (
                  <div
                    key={sec.id}
                    className="bg-white dark:bg-emerald-950/80 rounded-2xl p-4 border border-slate-200 dark:border-emerald-900/60 shadow-sm text-right space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-bold">
                        ترتيب العرض: {sec.order}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          sec.isActive
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {sec.isActive ? 'مفعل' : 'معطل'}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {sec.name}
                    </h4>

                    <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 dark:border-emerald-900/40 pt-3">
                      <span>{sec.itemCount || 0} نص مرتبط</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingSection(sec);
                            setSectionForm({
                              name: sec.name,
                              type: sec.type,
                              order: sec.order,
                              isActive: sec.isActive,
                            });
                            setIsSectionModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-emerald-900/40 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSection(sec.id)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: DONATIONS PLATFORMS MANAGER */}
          {activeTab === 'donations' && (
            <div className="space-y-6 text-right">
              {/* Top Banner */}
              <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 border border-slate-200 dark:border-emerald-900/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <HandHeart className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      إدارة منصات الصدقة والتبرع الرسمية
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                    إدارة دليل المنصات الوطنية المعتمدة. فقط المنصات الموثقة (Verified) والنشطة تظهر للجمهور في المنصة العامة.
                  </p>
                </div>

                <button
                  onClick={handleOpenAddDonation}
                  className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة منصة تبرع جديدة</span>
                </button>
              </div>

              {/* Platforms Table */}
              <div className="bg-white dark:bg-emerald-950/80 rounded-2xl border border-slate-200 dark:border-emerald-900/60 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 dark:bg-emerald-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-emerald-900/60 font-bold">
                      <tr>
                        <th className="p-3.5">المنصة والجهة التابعة</th>
                        <th className="p-3.5">الإشراف الحكومي</th>
                        <th className="p-3.5">الرابط الرسمي والنطاق</th>
                        <th className="p-3.5">التصنيفات</th>
                        <th className="p-3.5">الحالة</th>
                        <th className="p-3.5">الترتيب</th>
                        <th className="p-3.5 text-center">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-emerald-900/40">
                      {donationsList.map((platform) => (
                        <tr key={platform.id} className="hover:bg-slate-50 dark:hover:bg-emerald-900/20">
                          <td className="p-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/60 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-300 shrink-0">
                                <Building2 className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white">{platform.name}</p>
                                <span className="text-[10px] text-slate-400">{platform.officialEntity}</span>
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5 text-slate-600 dark:text-slate-300">
                            {platform.supervisingEntity}
                          </td>

                          <td className="p-3.5">
                            <a
                              href={platform.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-mono hover:underline text-[11px]"
                              dir="ltr"
                            >
                              <span>{new URL(platform.url).hostname}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </td>

                          <td className="p-3.5">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {platform.categories.slice(0, 3).map((c, i) => (
                                <span key={i} className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-emerald-900/50 text-[10px] text-slate-600 dark:text-slate-300">
                                  {c}
                                </span>
                              ))}
                              {platform.categories.length > 3 && (
                                <span className="text-[10px] text-slate-400">+{platform.categories.length - 3}</span>
                              )}
                            </div>
                          </td>

                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                platform.status === 'verified'
                                  ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                                  : platform.status === 'pending_review'
                                  ? 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              {platform.status === 'verified'
                                ? 'معتمد وموثق'
                                : platform.status === 'pending_review'
                                ? 'قيد المراجعة'
                                : platform.status === 'rejected'
                                ? 'مرفوض'
                                : 'معطل'}
                            </span>
                          </td>

                          <td className="p-3.5 font-mono text-center">{platform.sortOrder}</td>

                          <td className="p-3.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleOpenEditDonation(platform)}
                                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-emerald-900/60 cursor-pointer"
                                title="تعديل"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteDonation(platform.id, platform.name)}
                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
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
              </div>
            </div>
          )}

          {/* TAB: IBN BAZ SECTIONS MANAGER */}
          {activeTab === 'binbaz' && (
            <div className="space-y-6 text-right">
              {/* Top Banner */}
              <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 border border-slate-200 dark:border-emerald-900/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-600" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      إدارة روابط وأقسام موقع الشيخ ابن باز رحمه الله
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                    إدارة الروابط المباشرة الموثقة بالموقع الرسمي لسماحة الشيخ الإمام ابن باز رحمه الله التابع لمؤسسة عبدالعزيز بن باز الخيرية.
                  </p>
                </div>

                <button
                  onClick={handleOpenAddBinBaz}
                  className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة رابط قسم جديد</span>
                </button>
              </div>

              {/* Bin Baz Links Table */}
              <div className="bg-white dark:bg-emerald-950/80 rounded-2xl border border-slate-200 dark:border-emerald-900/60 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 dark:bg-emerald-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-emerald-900/60 font-bold">
                      <tr>
                        <th className="p-3.5">عنوان القسم</th>
                        <th className="p-3.5">التصنيف</th>
                        <th className="p-3.5">الرابط الرسمي</th>
                        <th className="p-3.5">مميز</th>
                        <th className="p-3.5">الحالة</th>
                        <th className="p-3.5">الترتيب</th>
                        <th className="p-3.5 text-center">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-emerald-900/40">
                      {binbazList.map((link) => (
                        <tr key={link.id} className="hover:bg-slate-50 dark:hover:bg-emerald-900/20">
                          <td className="p-3.5">
                            <p className="font-bold text-slate-900 dark:text-white">{link.title}</p>
                            <span className="text-[10px] text-slate-400 line-clamp-1">{link.description}</span>
                          </td>

                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-emerald-900/50 text-[10px] text-slate-600 dark:text-slate-300 font-medium">
                              {link.categoryLabelAr}
                            </span>
                          </td>

                          <td className="p-3.5">
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-mono hover:underline text-[11px]"
                              dir="ltr"
                            >
                              <span>{link.url}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </td>

                          <td className="p-3.5">
                            {link.highlight ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                                نعم
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[10px]">لا</span>
                            )}
                          </td>

                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                link.status === 'verified'
                                  ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              {link.status === 'verified' ? 'معتمد وموثق' : 'معطل'}
                            </span>
                          </td>

                          <td className="p-3.5 font-mono text-center">{link.sortOrder}</td>

                          <td className="p-3.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleOpenEditBinBaz(link)}
                                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-emerald-900/60 cursor-pointer"
                                title="تعديل"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteBinBaz(link.id, link.title)}
                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
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
              </div>
            </div>
          )}

          {/* TAB 4: SHARE CARDS HUB & VALIDATOR */}
          {activeTab === 'share-cards' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 border border-slate-200 dark:border-emerald-900/60 shadow-sm text-right space-y-3">
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    نظام توليد وتدقيق بطاقات المشاركة الدعوية
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                  تعتمد المنصة قالباً رسمياً هندسياً موحداً يطبع اسم القسم تلقائياً أعلى البطاقة، ونوع المحتوى، والنص المحقق مع ضبط التمركز والتناسب، ومصدر التوثيق، والتاريخ الهجري ورمز QR التفاعلي.
                </p>
              </div>

              {/* Sample Card Verification Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {contentList.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 border border-slate-200 dark:border-emerald-900/60 shadow-sm text-right space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-emerald-800 dark:text-emerald-300">
                          {item.sectionName}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold">
                          {item.contentType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-200 font-amiri leading-relaxed line-clamp-3">
                        {item.text}
                      </p>
                      <span className="text-[10px] text-slate-400 block">{item.source}</span>
                    </div>

                    <button
                      onClick={() =>
                        openShareModal({
                          sectionName: item.sectionName,
                          contentType: item.contentType,
                          content: item.text,
                          source: item.source,
                        })
                      }
                      className="w-full py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>معاينة وتوليد البطاقة</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: QURAN RADIO MANAGER */}
          {activeTab === 'radio' && <AdminRadioManager />}

          {/* TAB 6: USERS DIRECTORY */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-4 border border-slate-200 dark:border-emerald-900/60 shadow-sm flex items-center justify-between text-right">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    دليل المستخدمين المسجلين (للمعاينة والمتابعة فقط)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    منفصل تماماً عن حساب الإدارة. لا يملك المستخدمون أي وصول إلى مسارات /admin.
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-emerald-900 text-slate-700 dark:text-slate-200">
                  {usersList.length} مستخدم
                </span>
              </div>

              <div className="bg-white dark:bg-emerald-950/80 rounded-2xl border border-slate-200 dark:border-emerald-900/60 shadow-sm overflow-hidden text-right">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 dark:bg-emerald-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-emerald-900/60 font-bold">
                    <tr>
                      <th className="p-3.5">الاسم والبريد</th>
                      <th className="p-3.5">الصلاحية في الموقع</th>
                      <th className="p-3.5">تاريخ الانضمام</th>
                      <th className="p-3.5">الورد والختمة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-emerald-900/40">
                    {usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-emerald-900/20">
                        <td className="p-3.5">
                          <p className="font-bold text-slate-900 dark:text-white">{u.fullName}</p>
                          <span className="text-emerald-700 dark:text-amber-300 font-mono text-[11px]" dir="ltr">@{u.username || 'user'}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-emerald-900 text-slate-600 dark:text-slate-300 font-medium text-[10px]">
                            مستخدم عادي (User)
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-500">{u.joinedAt}</td>
                        <td className="p-3.5 text-slate-500">
                          {u.readingStreak || 0} أيام متتالية • {u.bookmarksCount || 0} إشارة مرجعية
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: AUDIT LOG */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-4 border border-slate-200 dark:border-emerald-900/60 shadow-sm flex items-center justify-between text-right">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <History className="w-4 h-4 text-amber-500" />
                    <span>سجل تدقيق عمليات الإدارة (Security Audit Trail)</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    تسجيل غير قابل للتلاعب لعمليات الدخول، وتعديل المحتوى، وحركات النظام (بدون حفظ كلمات مرور أو أسرار).
                  </p>
                </div>
                <button
                  onClick={loadData}
                  className="text-xs text-emerald-700 dark:text-amber-300 hover:underline cursor-pointer"
                >
                  تحديث السجل
                </button>
              </div>

              <div className="bg-white dark:bg-emerald-950/80 rounded-2xl border border-slate-200 dark:border-emerald-900/60 shadow-sm overflow-hidden text-right">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 dark:bg-emerald-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-emerald-900/60 font-bold">
                    <tr>
                      <th className="p-3.5">الوقت والتاريخ</th>
                      <th className="p-3.5">العملية (Action)</th>
                      <th className="p-3.5">المورد (Resource)</th>
                      <th className="p-3.5">الحالة</th>
                      <th className="p-3.5">التفاصيل</th>
                      <th className="p-3.5">عنوان IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-emerald-900/40 font-sans">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-emerald-900/20">
                        <td className="p-3.5 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                          {new Date(log.timestamp).toLocaleString('ar-SA')}
                        </td>
                        <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                          {log.action}
                        </td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {log.resource}
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              log.status === 'success'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                                : log.status === 'warning'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
                            }`}
                          >
                            {log.status === 'success' ? 'نجاح' : log.status === 'warning' ? 'تنبيه' : 'فشل'}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-300 text-xs">
                          {log.details || '-'}
                        </td>
                        <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                          {log.ip || '127.0.0.1'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: ADD / EDIT CONTENT */}
      {isContentModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 wasl-modal-overlay animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsContentModalOpen(false);
          }}
          onTouchMove={(e) => {
            if (e.target === e.currentTarget) e.preventDefault();
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-white dark:bg-emerald-950 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-emerald-800 text-right space-y-4 max-h-[min(90dvh,calc(100dvh-2rem))] overflow-y-auto wasl-modal-scrollable"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-900">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingContent ? 'تعديل المحتوى الشرعي' : 'إضافة نص شرعي موثق'}
              </h3>
              <button
                onClick={() => setIsContentModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContent} className="space-y-4 text-right">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    نوع المحتوى
                  </label>
                  <select
                    value={contentForm.contentType}
                    onChange={(e) => setContentForm({ ...contentForm, contentType: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-emerald-900/30 text-xs font-bold"
                  >
                    <option value="ذكر">ذكر</option>
                    <option value="حديث">حديث شريف</option>
                    <option value="دعاء">دعاء</option>
                    <option value="آية">آية قرآنية</option>
                    <option value="فتوى">فتوى شرعية</option>
                    <option value="مقال">مقال معرفي</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    القسم المرتبط (لربط بطاقة المشاركة)
                  </label>
                  <select
                    value={contentForm.sectionId}
                    onChange={(e) => setContentForm({ ...contentForm, sectionId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-emerald-900/30 text-xs font-bold"
                  >
                    {sectionsList.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان المحتوى (اختياري)
                </label>
                <input
                  type="text"
                  value={contentForm.title}
                  onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                  placeholder="مثال: سيد الاستغفار، فضل صلة الرحم..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-emerald-900/30 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  نص الحديث / الذكر / الآية
                </label>
                <textarea
                  rows={4}
                  value={contentForm.text}
                  onChange={(e) => setContentForm({ ...contentForm, text: e.target.value })}
                  placeholder="اكتب النص مضبوطاً بالشكل..."
                  required
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-emerald-900/30 text-xs font-amiri text-sm leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    المصدر والتحقيق
                  </label>
                  <input
                    type="text"
                    value={contentForm.source}
                    onChange={(e) => setContentForm({ ...contentForm, source: e.target.value })}
                    placeholder="مثال: صحيح البخاري (٦٣٠٦)"
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-emerald-900/30 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الراوي (إن وجد)
                  </label>
                  <input
                    type="text"
                    value={contentForm.narrator}
                    onChange={(e) => setContentForm({ ...contentForm, narrator: e.target.value })}
                    placeholder="مثال: أبو هريرة رضي الله عنه"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-emerald-900/30 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    حالة النشر
                  </label>
                  <select
                    value={contentForm.status}
                    onChange={(e) => setContentForm({ ...contentForm, status: e.target.value as any })}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-emerald-900/30 text-xs font-bold"
                  >
                    <option value="published">منشور مباشرة</option>
                    <option value="draft">حفظ كمسودة</option>
                    <option value="needs_review">قيد المراجعة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    التوثيق الشرعي
                  </label>
                  <select
                    value={contentForm.verification}
                    onChange={(e) => setContentForm({ ...contentForm, verification: e.target.value as any })}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-emerald-900/30 text-xs font-bold"
                  >
                    <option value="verified">معتمد وموثق</option>
                    <option value="needs_review">يحتاج تدقيق</option>
                    <option value="rejected">مرفوض</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-emerald-900">
                <button
                  type="button"
                  onClick={() => setIsContentModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-emerald-800 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  حفظ المحتوى
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT SECTION */}
      {isSectionModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 wasl-modal-overlay animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsSectionModalOpen(false);
          }}
          onTouchMove={(e) => {
            if (e.target === e.currentTarget) e.preventDefault();
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-emerald-950 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-emerald-800 text-right space-y-4 max-h-[min(90dvh,calc(100dvh-2rem))] overflow-y-auto wasl-modal-scrollable"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-900">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingSection ? 'تعديل بيانات القسم' : 'إضافة قسم جديد'}
              </h3>
              <button
                onClick={() => setIsSectionModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSection} className="space-y-4 text-right">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم القسم
                </label>
                <input
                  type="text"
                  value={sectionForm.name}
                  onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
                  placeholder="مثال: أذكار الصباح، أدعية السفر..."
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-emerald-900/30 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الترتيب
                  </label>
                  <input
                    type="number"
                    value={sectionForm.order}
                    onChange={(e) => setSectionForm({ ...sectionForm, order: parseInt(e.target.value, 10) || 1 })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-emerald-900/30 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الحالة
                  </label>
                  <select
                    value={sectionForm.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setSectionForm({ ...sectionForm, isActive: e.target.value === 'active' })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-emerald-900/30 text-xs font-bold"
                  >
                    <option value="active">مفعل</option>
                    <option value="inactive">معطل</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-emerald-900">
                <button
                  type="button"
                  onClick={() => setIsSectionModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-emerald-800 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  حفظ القسم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT DONATION PLATFORM */}
      {isDonationModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 wasl-modal-overlay animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsDonationModalOpen(false);
          }}
          onTouchMove={(e) => {
            if (e.target === e.currentTarget) e.preventDefault();
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-white dark:bg-emerald-950 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-emerald-800 text-right space-y-4 max-h-[min(90dvh,calc(100dvh-2rem))] overflow-y-auto wasl-modal-scrollable"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-900">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HandHeart className="w-5 h-5 text-emerald-600" />
                <span>{editingDonation ? 'تعديل منصة تبرع رسمية' : 'إضافة منصة تبرع جديدة'}</span>
              </h3>
              <button
                onClick={() => setIsDonationModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDonation} className="space-y-3.5 text-right text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    اسم المنصة *
                  </label>
                  <input
                    type="text"
                    required
                    value={donationForm.name}
                    onChange={(e) => setDonationForm({ ...donationForm, name: e.target.value })}
                    placeholder="مثال: منصة إحسان"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-emerald-900/30 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الرابط الرسمي (HTTPS فقط) *
                  </label>
                  <input
                    type="url"
                    required
                    value={donationForm.url}
                    onChange={(e) => setDonationForm({ ...donationForm, url: e.target.value })}
                    placeholder="https://..."
                    dir="ltr"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-emerald-900/30 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الجهة التابعة أو المصرحة *
                  </label>
                  <input
                    type="text"
                    required
                    value={donationForm.officialEntity}
                    onChange={(e) => setDonationForm({ ...donationForm, officialEntity: e.target.value })}
                    placeholder="مثال: الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا)"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-emerald-900/30 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الجهة الحكومية المشرفة *
                  </label>
                  <input
                    type="text"
                    required
                    value={donationForm.supervisingEntity}
                    onChange={(e) => setDonationForm({ ...donationForm, supervisingEntity: e.target.value })}
                    placeholder="مثال: وزارة الموارد البشرية والتنمية الاجتماعية"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-emerald-900/30 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الوصف التعريفي
                </label>
                <textarea
                  rows={2}
                  value={donationForm.description}
                  onChange={(e) => setDonationForm({ ...donationForm, description: e.target.value })}
                  placeholder="نبذة مختصرة وموثقة عن أهداف المنصة ومجالاتها..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-emerald-900/30 text-xs leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    المجالات والتصنيفات (مفصولة بفاصلة)
                  </label>
                  <input
                    type="text"
                    value={donationForm.categoriesText}
                    onChange={(e) => setDonationForm({ ...donationForm, categoriesText: e.target.value })}
                    placeholder="تبرع عام، الزكاة، الأوقاف، أيتام"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-emerald-900/30 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الخدمات المتاحة في المنصة (مفصولة بفاصلة)
                  </label>
                  <input
                    type="text"
                    value={donationForm.featuresText}
                    onChange={(e) => setDonationForm({ ...donationForm, featuresText: e.target.value })}
                    placeholder="فرص التبرع المباشر، حاسبة الزكاة، تبرع دوري"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-emerald-900/30 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    حالة الاعتماد والنشر
                  </label>
                  <select
                    value={donationForm.status}
                    onChange={(e) => setDonationForm({ ...donationForm, status: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-emerald-900/30 text-xs font-bold"
                  >
                    <option value="verified">معتمد وموثق (Verified) - يظهر للمستخدمين</option>
                    <option value="pending_review">قيد المراجعة والتحقق (Pending)</option>
                    <option value="rejected">مرفوض (Rejected)</option>
                    <option value="inactive">معطل مؤقتاً (Inactive)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ترتيب الظهور
                  </label>
                  <input
                    type="number"
                    value={donationForm.sortOrder}
                    onChange={(e) => setDonationForm({ ...donationForm, sortOrder: parseInt(e.target.value, 10) || 1 })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-emerald-900/30 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-emerald-900">
                <button
                  type="button"
                  onClick={() => setIsDonationModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-emerald-800 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  حفظ منصة التبرع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT BIN BAZ LINK */}
      {isBinBazModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 wasl-modal-overlay animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsBinBazModalOpen(false);
          }}
          onTouchMove={(e) => {
            if (e.target === e.currentTarget) e.preventDefault();
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white dark:bg-emerald-950 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-emerald-800 text-right space-y-4 max-h-[min(90dvh,calc(100dvh-2rem))] overflow-y-auto wasl-modal-scrollable"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-900">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                <span>{editingBinBaz ? 'تعديل قسم موقع ابن باز' : 'إضافة رابط قسم بموقع ابن باز'}</span>
              </h3>
              <button
                onClick={() => setIsBinBazModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBinBaz} className="space-y-3.5 text-right text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان القسم *
                </label>
                <input
                  type="text"
                  required
                  value={binbazForm.title}
                  onChange={(e) => setBinbazForm({ ...binbazForm, title: e.target.value })}
                  placeholder="مثال: موسوعة الفتاوى الرسمية المعتمدة"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-emerald-900/30 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الرابط المباشر (حصراً من نطاق binbaz.org.sa) *
                </label>
                <input
                  type="url"
                  required
                  value={binbazForm.url}
                  onChange={(e) => setBinbazForm({ ...binbazForm, url: e.target.value })}
                  placeholder="https://binbaz.org.sa/..."
                  dir="ltr"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-emerald-900/30 text-xs font-mono"
                />
                <span className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 block">
                  * يُشترط أن يكون الرابط مشفراً بـ HTTPS وينتمي حصرياً للموقع الرسمي لسماحة الشيخ.
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الوصف التعريفي
                </label>
                <textarea
                  rows={2}
                  value={binbazForm.description}
                  onChange={(e) => setBinbazForm({ ...binbazForm, description: e.target.value })}
                  placeholder="نبذة عن محتويات هذا القسم في الموقع الرسمي..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-emerald-900/30 text-xs leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    تصنيف القسم
                  </label>
                  <select
                    value={binbazForm.category}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      const labels: Record<string, string> = {
                        general: 'البوابة الرئيسية',
                        fatwas: 'الفتاوى',
                        nur: 'نور على الدرب',
                        books: 'الكتب والمؤلفات',
                        audios: 'الصوتيات والدروس',
                        articles: 'المقالات والبحوث',
                      };
                      setBinbazForm({
                        ...binbazForm,
                        category: val,
                        categoryLabelAr: labels[val] || 'قسم رسمي',
                      });
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-emerald-900/30 text-xs font-bold"
                  >
                    <option value="general">البوابة الرئيسية</option>
                    <option value="fatwas">الفتاوى</option>
                    <option value="nur">فتاوى نور على الدرب</option>
                    <option value="books">الكتب والمؤلفات</option>
                    <option value="audios">الصوتيات والدروس</option>
                    <option value="articles">المقالات والبحوث</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ترتيب العرض
                  </label>
                  <input
                    type="number"
                    value={binbazForm.sortOrder}
                    onChange={(e) => setBinbazForm({ ...binbazForm, sortOrder: parseInt(e.target.value, 10) || 1 })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-emerald-900/30 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={binbazForm.highlight}
                    onChange={(e) => setBinbazForm({ ...binbazForm, highlight: e.target.checked })}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    تمييز القسم ببرواز ذهبي
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={binbazForm.status === 'verified'}
                    onChange={(e) => setBinbazForm({ ...binbazForm, status: e.target.checked ? 'verified' : 'inactive' })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    تفعيل وظهور الرابط في الموقع
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-emerald-900">
                <button
                  type="button"
                  onClick={() => setIsBinBazModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-emerald-800 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  حفظ الرابط
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
