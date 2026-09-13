import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Download,
  Link,
  Check,
  AlertTriangle,
  RotateCw,
  Type,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';
import { useShareModal } from '../../context/ShareContext';
import { useModalScrollLock } from '../../hooks/useModalScrollLock';
import {
  renderShareCardToCanvas,
  copyCardToClipboard,
  downloadCardImage,
  shareCardNative,
  TextLayoutResult
} from '../../services/shareImageService';
import {
  SHARE_TEMPLATE_WIDTH,
  SHARE_TEMPLATE_HEIGHT
} from '../../types/share';

export const ShareModal: React.FC = () => {
  const { isShareModalOpen, currentItem, closeShareModal, shareConfig } = useShareModal();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const modalContainerRef = useRef<HTMLDivElement | null>(null);

  useModalScrollLock(isShareModalOpen, {
    onClose: closeShareModal,
    closeOnEsc: true,
    modalRef: modalContainerRef,
  });

  const [selectedFont, setSelectedFont] = useState<'Amiri' | 'Tajawal' | 'Scheherazade New'>(
    shareConfig.primaryFont || 'Amiri'
  );

  // Visual zoom for preview inspection only (does NOT affect exported image dimensions)
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [layoutInfo, setLayoutInfo] = useState<TextLayoutResult | null>(null);
  const [copiedState, setCopiedState] = useState<'image' | 'text' | 'link' | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'warn' | 'error'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'warn' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(parseFloat((prev + 0.25).toFixed(2)), 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(parseFloat((prev - 0.25).toFixed(2)), 0.75));
  const handleResetZoom = () => setZoomLevel(1);

  const generateCard = async () => {
    if (!currentItem) return;

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const { canvas, layout } = await renderShareCardToCanvas({
        item: currentItem,
        fontFamily: selectedFont,
        targetCanvas: canvasRef.current || undefined
      });

      canvasRef.current = canvas;
      setLayoutInfo(layout);

      const dataUrl = canvas.toDataURL('image/png');
      setPreviewUrl(dataUrl);

      if (layout.isTooLong) {
        showToast('النص طويل جدًا، تم ضبط حجم الخط ليتناسب مع القالب', 'warn');
      }
    } catch (err: any) {
      console.error('Error generating share card:', err);
      setGenerationError(err.message || 'تعذر إنشاء الصورة حالياً');
      showToast('تعذر إنشاء الصورة حالياً', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (isShareModalOpen && currentItem) {
      setZoomLevel(1);
      generateCard();
    } else {
      setPreviewUrl(null);
      setLayoutInfo(null);
      setGenerationError(null);
      setCopiedState(null);
      setNotification(null);
      setZoomLevel(1);
    }
  }, [isShareModalOpen, currentItem, selectedFont]);

  if (!isShareModalOpen || !currentItem) {
    return null;
  }

  // Handle: نسخ كصورة (بنفس أبعاد القالب الأصلية)
  const handleCopyAsImage = async () => {
    if (!canvasRef.current) return;
    try {
      const success = await copyCardToClipboard(canvasRef.current);
      if (success) {
        setCopiedState('image');
        showToast('تم نسخ الصورة بالأبعاد الأصلية المعتمدة بنجاح');
        setTimeout(() => setCopiedState(null), 2500);
      } else {
        showToast('يمكنك حفظ الصورة بدلاً من نسخها', 'warn');
      }
    } catch {
      showToast('يمكنك حفظ الصورة بدلاً من نسخها', 'warn');
    }
  };

  // Handle: حفظ الصورة (PNG عالي الجودة بالمقاس الأصلي المعتمد للقالب)
  const handleDownload = () => {
    if (!canvasRef.current) return;
    const typeLabel = currentItem.type || 'wasl';
    const filename = `wasl-islamic-share-${typeLabel}-${Date.now()}.png`;
    downloadCardImage(canvasRef.current, filename);
    showToast('تم حفظ الصورة بالمقاس الأصلي المعتمد للقالب (PNG)');
  };

  // Handle: مشاركة الصورة (Web Share API بالمقاس الأصلي)
  const handleShareImage = async () => {
    if (!canvasRef.current) return;
    const title = currentItem.title || currentItem.sectionName || 'وصل الإسلامية';
    const mainText = currentItem.content || currentItem.text || '';
    const text = mainText.slice(0, 100) + '...';
    const shared = await shareCardNative(canvasRef.current, title, text);
    if (!shared) {
      handleDownload();
    }
  };

  // Handle: نسخ النص
  const handleCopyText = async () => {
    let fullText = currentItem.content || currentItem.text || '';
    if (currentItem.source) {
      fullText += `\n[المصدر: ${currentItem.source}]`;
    } else if (currentItem.type === 'quran' && currentItem.surahName) {
      fullText += `\n[سورة ${currentItem.surahName} - آية ${currentItem.ayahNumber || ''}]`;
    }
    fullText += '\nمنصة وصل الإسلامية: waslislam.fun';

    await navigator.clipboard.writeText(fullText);
    setCopiedState('text');
    showToast('تم نسخ نص المحتوى الموثق');
    setTimeout(() => setCopiedState(null), 2500);
  };

  // Handle: مشاركة الرابط
  const handleShareLink = async () => {
    const url = currentItem.url || shareConfig.platformUrl;
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentItem.title || 'وصل الإسلامية',
          text: (currentItem.content || currentItem.text || '').slice(0, 80) + '...',
          url
        });
        return;
      } catch {
        // user cancelled or failed, copy instead
      }
    }
    await navigator.clipboard.writeText(url);
    setCopiedState('link');
    showToast('تم نسخ رابط المنصة');
    setTimeout(() => setCopiedState(null), 2500);
  };

  // Dynamic Badges Resolution
  const resolvedSectionName = currentItem.sectionName || 'وصل الإسلامية';
  const resolvedContentType =
    currentItem.contentType ||
    (currentItem.type === 'hadith'
      ? 'حديث'
      : currentItem.type === 'quran'
      ? 'آية'
      : currentItem.type === 'dhikr'
      ? 'ذكر'
      : currentItem.type === 'dua'
      ? 'دعاء'
      : currentItem.type === 'fatwa'
      ? 'بيان شرعي'
      : 'محتوى موثق');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs wasl-modal-overlay animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeShareModal();
      }}
      onTouchMove={(e) => {
        if (e.target === e.currentTarget) e.preventDefault();
      }}
    >
      {/* Hidden high-res canvas strictly maintaining original template dimensions */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Modal Dialog Window */}
      <div
        ref={modalContainerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-emerald-950 border border-emerald-900/20 dark:border-emerald-800/60 rounded-3xl w-full max-w-lg max-h-[min(94dvh,calc(100dvh-2rem))] flex flex-col shadow-2xl overflow-hidden text-right wasl-modal-overlay focus:outline-hidden"
        dir="rtl"
      >
        {/* 1. Header with Automatic Badges (Sticky Top) */}
        <div className="sticky top-0 z-20 shrink-0 p-4 sm:px-6 bg-white/95 dark:bg-emerald-950/95 backdrop-blur-md border-b border-slate-100 dark:border-emerald-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="share-modal-title" className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  بطاقة المشاركة المعتمدة
                </h2>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">
                  {resolvedSectionName}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  {resolvedContentType}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                قالب "وصل الإسلامية" الرسمي (المقاس الأصلي المعتمد للقالب)
              </p>
            </div>
          </div>

          <button
            onClick={closeShareModal}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-emerald-900/40 transition-colors"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Toast / Feedback Notification */}
        {notification && (
          <div
            className={`mx-4 sm:mx-6 mt-3 p-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                : notification.type === 'warn'
                ? 'bg-amber-50 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 border border-amber-200 dark:border-amber-800'
                : 'bg-rose-50 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Scrollable Body: Live Card Preview with Visual Zoom & Typography */}
        <div className="p-4 sm:p-5 overflow-y-auto wasl-modal-scrollable flex-1 flex flex-col items-center space-y-3.5">
          {/* Preview Toolbar with Zoom Controls */}
          <div className="w-full max-w-[340px] flex items-center justify-between text-xs px-0.5">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <span>معاينة القالب الأصلي</span>
            </span>

            {/* Visual Zoom Controls for Preview only */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-emerald-900/50 p-1 rounded-xl border border-slate-200 dark:border-emerald-800/40">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.75}
                className="p-1 rounded-lg hover:bg-white dark:hover:bg-emerald-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 transition-all"
                title="تصغير المعاينة"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="px-1.5 py-0.5 rounded-md hover:bg-white dark:hover:bg-emerald-800 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-200 transition-all"
                title="إعادة ضبط المعاينة 100%"
              >
                {Math.round(zoomLevel * 100)}%
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 2.5}
                className="p-1 rounded-lg hover:bg-white dark:hover:bg-emerald-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 transition-all"
                title="تكبير المعاينة"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              {zoomLevel !== 1 && (
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="p-1 rounded-lg hover:bg-white dark:hover:bg-emerald-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
                  title="إعادة الضبط"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Card Preview Container (Strictly preserves original template aspect ratio 2:3) */}
          <div
            className="relative w-full max-w-[310px] sm:max-w-[340px] rounded-2xl overflow-hidden shadow-2xl border border-emerald-950/15 dark:border-emerald-800/50 bg-emerald-950/10 flex items-center justify-center transition-all"
            style={{
              aspectRatio: `${SHARE_TEMPLATE_WIDTH} / ${SHARE_TEMPLATE_HEIGHT}`,
              maxHeight: '46vh'
            }}
          >
            {isGenerating && (
              <div className="absolute inset-0 bg-white/85 dark:bg-emerald-950/85 backdrop-blur-xs flex flex-col items-center justify-center z-10 gap-3">
                <RotateCw className="w-8 h-8 text-emerald-700 animate-spin" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  جاري تجهيز بطاقة المشاركة الرسمية...
                </span>
              </div>
            )}

            {generationError ? (
              <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center space-y-3">
                <AlertTriangle className="w-10 h-10 text-rose-500" />
                <p className="text-sm font-bold text-slate-800 dark:text-white">
                  تعذر إنشاء الصورة حالياً
                </p>
                <p className="text-xs text-slate-500">{generationError}</p>
                <button
                  onClick={generateCard}
                  className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors flex items-center gap-1.5"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>إعادة المحاولة</span>
                </button>
              </div>
            ) : previewUrl ? (
              <div
                className="w-full h-full flex items-center justify-center transition-transform duration-150 ease-out"
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'center center'
                }}
              >
                <img
                  src={previewUrl}
                  alt="بطاقة مشاركة وصل الإسلامية"
                  className="w-full h-full object-contain select-none"
                  draggable={false}
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                جاري التحميل...
              </div>
            )}
          </div>

          {/* Typography Selector */}
          <div className="w-full max-w-[340px] flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-emerald-900/50">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-emerald-600" />
              <span>خط النص الشرعي:</span>
            </span>
            <div className="flex items-center gap-1.5">
              {[
                { id: 'Amiri', label: 'أميري (الافتراضي)' },
                { id: 'Tajawal', label: 'تجوال' },
                { id: 'Scheherazade New', label: 'شهرزاد' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFont(f.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                    selectedFont === f.id
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                      : 'bg-slate-50 dark:bg-emerald-900/30 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-emerald-800/40 hover:border-emerald-500'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Actions Footer (Sticky Bottom) */}
        <div className="sticky bottom-0 z-20 shrink-0 p-4 sm:p-5 bg-slate-50/95 dark:bg-emerald-950/95 backdrop-blur-md border-t border-slate-100 dark:border-emerald-900/60 space-y-2.5">
          {/* Primary Action Buttons: حفظ الصورة | نسخ كصورة | مشاركة */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* 1. حفظ الصورة (PNG عالي الجودة بالمقاس الأصلي) */}
            <button
              onClick={handleDownload}
              disabled={isGenerating || !!generationError}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-800 text-white font-bold text-xs hover:bg-emerald-700 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>حفظ الصورة (PNG)</span>
            </button>

            {/* 2. نسخ كصورة (بالمقاس الأصلي) */}
            <button
              onClick={handleCopyAsImage}
              disabled={isGenerating || !!generationError}
              className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-emerald-900/60 text-slate-800 dark:text-white border border-slate-200 dark:border-emerald-800 font-bold text-xs hover:bg-emerald-50 dark:hover:bg-emerald-900 active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {copiedState === 'image' ? (
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              )}
              <span>نسخ كصورة</span>
            </button>

            {/* 3. مشاركة عبر التطبيقات (بالمقاس الأصلي) */}
            <button
              onClick={handleShareImage}
              disabled={isGenerating || !!generationError}
              className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-emerald-900/60 text-slate-800 dark:text-white border border-slate-200 dark:border-emerald-800 font-bold text-xs hover:bg-emerald-50 dark:hover:bg-emerald-900 active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>مشاركة عبر التطبيقات</span>
            </button>
          </div>

          {/* Secondary Actions: نسخ النص & مشاركة الرابط */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <button
              onClick={handleCopyText}
              className="text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium flex items-center gap-1 p-1 transition-colors cursor-pointer"
            >
              {copiedState === 'text' ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>نسخ النص فقط</span>
            </button>

            <button
              onClick={handleShareLink}
              className="text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium flex items-center gap-1 p-1 transition-colors cursor-pointer"
            >
              {copiedState === 'link' ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Link className="w-3.5 h-3.5" />
              )}
              <span>مشاركة الرابط</span>
            </button>

            <span className="text-[11px] text-slate-400 font-mono">
              waslislam.fun
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
