'use client';

import React, { useState } from 'react';
import { 
  Download, 
  Upload, 
  ShieldCheck, 
  FileJson, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  RefreshCw, 
  Lock, 
  BookOpen, 
  Bookmark, 
  Clock, 
  Settings2,
  HardDrive
} from 'lucide-react';
import { 
  backupRestoreManager, 
  WaslBackupFile, 
  BackupValidationResult 
} from '../../utils/backupRestoreManager.ts';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEnglish: boolean;
  onRestoreSuccess?: () => void;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  onClose,
  isEnglish,
  onRestoreSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [includeFamily, setIncludeFamily] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Import State
  const [selectedFileContent, setSelectedFileContent] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<BackupValidationResult | null>(null);
  const [restoreMode, setRestoreMode] = useState<'merge' | 'replace'>('merge');
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<{ success: boolean; message: string; counts?: any } | null>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    setIsExporting(true);
    try {
      const backup = backupRestoreManager.generateBackup({ includeFamily });
      backupRestoreManager.downloadBackupFile(backup);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (e: any) {
      alert(`خطأ أثناء إنشاء النسخة: ${e.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreStatus(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setSelectedFileContent(text);
      const res = backupRestoreManager.validateBackup(text);
      setValidationResult(res);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleRestore = () => {
    if (!validationResult?.backup) return;

    if (restoreMode === 'replace') {
      const confirmReplace = confirm(
        isEnglish
          ? 'Warning: Full replacement will overwrite your current progress with this backup. Continue?'
          : 'تنبيه هام: الاستبدال الكامل سيستبدل بياناتك الحالية تماماً بالبيانات الموجودة في الملف. هل أنت متأكد من المتابعة؟'
      );
      if (!confirmReplace) return;
    }

    setIsRestoring(true);
    try {
      const result = backupRestoreManager.restoreBackup(validationResult.backup, restoreMode);
      setRestoreStatus({
        success: result.success,
        message: result.message,
        counts: result.restoredCounts
      });

      if (result.success && onRestoreSuccess) {
        onRestoreSuccess();
      }
    } catch (e: any) {
      setRestoreStatus({
        success: false,
        message: `حدث خطأ غير متوقع: ${e.message}`
      });
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-label={isEnglish ? 'Backup & Data Portability' : 'النسخ الاحتياطي ونقل البيانات'}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div className="bg-[var(--bg-card)] border border-[var(--border-gold)] rounded-3xl max-w-xl w-full p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--gold)] flex items-center justify-center text-white shadow-md">
              <HardDrive className="w-5 h-5 pointer-events-none" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-main)] font-cairo">
                {isEnglish ? 'Backup & Data Portability' : 'النسخ الاحتياطي ونقل البيانات'}
              </h2>
              <p className="text-xs text-[var(--text-muted)] font-tajawal">
                {isEnglish ? 'Secure, user-controlled data preservation' : 'حفظ ونقل بياناتك القرآنية والتدبرية بأمان تام'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer touch-manipulation"
            aria-label="Close"
          >
            <X className="w-5 h-5 pointer-events-none" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex rounded-2xl bg-[var(--bg-card-subtle)] p-1 border border-[var(--border-color)] mb-6">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'export'
                ? 'bg-[var(--primary)] text-white shadow-md'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>{isEnglish ? 'Export Backup' : 'تصدير نسخة احتياطية'}</span>
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'import'
                ? 'bg-[var(--primary)] text-white shadow-md'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>{isEnglish ? 'Restore Backup' : 'استعادة نسخة احتياطية'}</span>
          </button>
        </div>

        {/* TAB 1: EXPORT */}
        {activeTab === 'export' && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-[var(--text-muted)] space-y-2">
              <div className="font-bold text-[var(--text-main)] flex items-center gap-1.5 font-cairo">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>{isEnglish ? 'What will be exported?' : 'المحتويات المشمولة في النسخة الاحتياطية:'}</span>
              </div>
              <ul className="list-disc list-inside space-y-1 font-tajawal pr-1">
                <li>{isEnglish ? 'Quran reflections and personal study notes' : 'خواطر تدبر الآيات والملاحظات الخاصة'}</li>
                <li>{isEnglish ? 'Audio bookmarks with timestamps & reciters' : 'علامات الاستماع الصوتية مع التوقيت والقارئ'}</li>
                <li>{isEnglish ? 'Saved Quran Ayahs & personal collections' : 'الآيات المحفوظة ومجموعات التلاوة'}</li>
                <li>{isEnglish ? 'Khatmah reading plan & current page progress' : 'موضع ختمة القرآن والصفحة الحالية'}</li>
                <li>{isEnglish ? 'Application preferences, fonts, and dark mode' : 'تفضيلات العرض، الخطوط، ونمط الألوان'}</li>
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] flex items-center justify-between">
              <div>
                <span className="block text-xs font-bold text-[var(--text-main)]">
                  {isEnglish ? 'Include Shared Family Mode data' : 'تضمين بيانات وأهداف وضع العائلة'}
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">
                  {isEnglish ? 'Requires explicit authorization' : 'يتطلب موافقة صريحة لحفظ الأهداف المشتركة'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={includeFamily}
                onChange={(e) => setIncludeFamily(e.target.checked)}
                className="w-4 h-4 accent-[var(--primary)]"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-tajawal">
              <Lock className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                {isEnglish 
                  ? 'Your backup file will not include any passwords, secrets, or administrative records.'
                  : 'النسخة المحفوظة لا تحتوي على أي كلمات مرور أو مفاتيح سرية، وهي مشفرة بترميز UTF-8 لحفظ النصوص العربية بأمان.'}
              </span>
            </div>

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--gold)] text-white font-bold text-sm shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? (isEnglish ? 'Exporting...' : 'جارٍ الإنشاء...') : (isEnglish ? 'Download Backup File (.json)' : 'تنزيل وحفظ ملف النسخة الاحتياطية')}</span>
            </button>

            {exportSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{isEnglish ? 'Backup exported successfully!' : 'تم تصدير النسخة الاحتياطية بنجاح إلى جهازك'}</span>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: IMPORT */}
        {activeTab === 'import' && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] mb-2 font-cairo">
                {isEnglish ? 'Select Backup File (.json)' : 'اختر ملف النسخة الاحتياطية (.json):'}
              </label>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="w-full text-xs text-[var(--text-muted)] file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[var(--primary)] file:text-white hover:file:opacity-90 file:cursor-pointer bg-[var(--bg-card-subtle)] border border-[var(--border-color)] rounded-2xl p-2"
              />
            </div>

            {/* Validation Feedback */}
            {validationResult && !validationResult.valid && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <div>
                  <strong className="block font-bold">{isEnglish ? 'Invalid Backup File' : 'ملف غير صالح'}</strong>
                  <span>{validationResult.error}</span>
                </div>
              </div>
            )}

            {validationResult && validationResult.valid && validationResult.preview && (
              <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-gold)] space-y-3">
                <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
                  <div className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5 font-cairo">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>{isEnglish ? 'Valid Wasl Backup File' : 'ملف نسخة معتمد متوافق'}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-mono font-bold">
                    {validationResult.preview.schemaVersion}
                  </span>
                </div>

                {/* Data preview counts */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
                    <span className="text-[var(--text-muted)] block text-[11px]">{isEnglish ? 'Saved Ayahs' : 'الآيات المحفوظة'}</span>
                    <strong className="text-[var(--text-main)] font-mono">{validationResult.preview.counts.savedAyahs}</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
                    <span className="text-[var(--text-muted)] block text-[11px]">{isEnglish ? 'Reflections' : 'خواطر التدبر'}</span>
                    <strong className="text-[var(--text-main)] font-mono">{validationResult.preview.counts.reflections}</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
                    <span className="text-[var(--text-muted)] block text-[11px]">{isEnglish ? 'Audio Bookmarks' : 'علامات الاستماع'}</span>
                    <strong className="text-[var(--text-main)] font-mono">{validationResult.preview.counts.audioBookmarks}</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
                    <span className="text-[var(--text-muted)] block text-[11px]">{isEnglish ? 'Khatmah Progress' : 'تقدم الختمة'}</span>
                    <strong className="text-[var(--text-main)] font-mono">{validationResult.preview.counts.khatmahProgress ? 'موجود' : 'غير متوفر'}</strong>
                  </div>
                </div>

                {/* Merge vs Replace selector */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-[var(--text-muted)] mb-1.5 font-cairo">
                    {isEnglish ? 'Restore Strategy' : 'طريقة الاستعادة:'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRestoreMode('merge')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-right ${
                        restoreMode === 'merge'
                          ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                          : 'border-[var(--border-color)] text-[var(--text-muted)]'
                      }`}
                    >
                      <div className="font-bold">{isEnglish ? 'Smart Merge (Safe)' : 'دمج ذكي (آمن)'}</div>
                      <div className="text-[10px] font-normal opacity-80">{isEnglish ? 'Merges without duplicates' : 'يدمج دون حذف القائم'}</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRestoreMode('replace')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-right ${
                        restoreMode === 'replace'
                          ? 'border-red-500 bg-red-500/10 text-red-500'
                          : 'border-[var(--border-color)] text-[var(--text-muted)]'
                      }`}
                    >
                      <div className="font-bold">{isEnglish ? 'Full Replace' : 'استبدال كامل'}</div>
                      <div className="text-[10px] font-normal opacity-80">{isEnglish ? 'Overwrites all records' : 'يستبدل السجلات الحالية'}</div>
                    </button>
                  </div>
                </div>

                {/* Restore execute action */}
                <button
                  onClick={handleRestore}
                  disabled={isRestoring}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--gold)] text-white font-bold text-sm shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-2 mt-4"
                >
                  <RefreshCw className={`w-4 h-4 ${isRestoring ? 'animate-spin' : ''}`} />
                  <span>{isRestoring ? (isEnglish ? 'Restoring...' : 'جارٍ الاستعادة...') : (isEnglish ? 'Start Restoring Now' : 'بدء استعادة البيانات')}</span>
                </button>
              </div>
            )}

            {restoreStatus && (
              <div className={`p-4 rounded-2xl text-xs flex items-center gap-3 ${
                restoreStatus.success
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-red-500/20 text-red-500 border border-red-500/30'
              }`}>
                {restoreStatus.success ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                <div>
                  <strong className="block font-bold">{restoreStatus.message}</strong>
                  {restoreStatus.counts && (
                    <div className="text-[11px] mt-1 opacity-90 font-mono">
                      آيات: {restoreStatus.counts.savedAyahs} | خواطر: {restoreStatus.counts.reflections} | علامات صوتية: {restoreStatus.counts.audioBookmarks}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
