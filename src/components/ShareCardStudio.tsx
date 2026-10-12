'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Download, 
  Copy, 
  Share2, 
  Sparkles, 
  Check, 
  Layers, 
  Sliders, 
  RefreshCw,
  Palette,
  Maximize
} from 'lucide-react';

export interface ShareContent {
  title: string;
  text: string;
  source: string;
  category: string;
}

interface ShareCardStudioProps {
  initialContent?: ShareContent;
  isEnglish: boolean;
}

type AspectRatioType = '1:1' | '4:5' | '9:16' | '16:9';
type TemplateType = 'emerald' | 'gold' | 'dark' | 'ivory';

export const ShareCardStudio: React.FC<ShareCardStudioProps> = ({
  initialContent,
  isEnglish
}) => {
  const [content, setContent] = useState<ShareContent>(() => initialContent || {
    title: 'آية وتدبر',
    text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
    source: 'سورة الفاتحة [آية: 5]',
    category: 'quran'
  });

  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('1:1');
  const [template, setTemplate] = useState<TemplateType>('emerald');
  const [cardFontSize, setCardFontSize] = useState<number>(36);
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Get canvas dimensions based on aspect ratio
  const getDimensions = (ar: AspectRatioType) => {
    switch (ar) {
      case '1:1': return { width: 1080, height: 1080 };
      case '4:5': return { width: 1080, height: 1350 };
      case '9:16': return { width: 1080, height: 1920 };
      case '16:9': return { width: 1200, height: 675 };
    }
  };

  // Render high-res canvas
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = getDimensions(aspectRatio);
    canvas.width = width;
    canvas.height = height;

    // 1. Draw Background based on template
    if (template === 'emerald') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#064E3B');
      grad.addColorStop(0.5, '#04382A');
      grad.addColorStop(1, '#022118');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else if (template === 'gold') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#78350F');
      grad.addColorStop(0.5, '#92400E');
      grad.addColorStop(1, '#B45309');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else if (template === 'dark') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#0F172A');
      grad.addColorStop(0.5, '#090D16');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

    } else {
      // Ivory
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#FDFBF7');
      grad.addColorStop(1, '#F3EFE6');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Draw Decorative Islamic Geometric Border Frame
    const framePadding = width * 0.06;
    const frameWidth = width - framePadding * 2;
    const frameHeight = height - framePadding * 2;

    ctx.strokeStyle = template === 'ivory' ? 'rgba(180, 83, 9, 0.3)' : 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 4;
    ctx.strokeRect(framePadding, framePadding, frameWidth, frameHeight);

    // Inner subtle border
    ctx.strokeStyle = template === 'ivory' ? 'rgba(6, 95, 70, 0.15)' : 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(framePadding + 14, framePadding + 14, frameWidth - 28, frameHeight - 28);

    // Corner decorative diamond marks
    const drawCornerDiamond = (x: number, y: number) => {
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
    };
    drawCornerDiamond(framePadding, framePadding);
    drawCornerDiamond(framePadding + frameWidth, framePadding);
    drawCornerDiamond(framePadding, framePadding + frameHeight);
    drawCornerDiamond(framePadding + frameWidth, framePadding + frameHeight);

    // 3. Top Category & Brand Watermark
    ctx.textAlign = 'center';
    ctx.fillStyle = template === 'ivory' ? '#B45309' : '#F59E0B';
    ctx.font = 'bold 26px Cairo, sans-serif';
    ctx.fillText(`— ${content.title} —`, width / 2, framePadding + 80);

    // 4. Main Body Text (RTL text measurement and word wrapping)
    ctx.fillStyle = template === 'ivory' ? '#0F172A' : '#FFFFFF';
    ctx.font = `bold ${cardFontSize * (width / 1080)}px Amiri, serif`;

    const maxTextWidth = width * 0.76;
    const words = content.text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxTextWidth && currentLine) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    // Vertical center text
    const lineHeight = cardFontSize * 1.8 * (width / 1080);
    const totalTextHeight = lines.length * lineHeight;
    let startY = height / 2 - totalTextHeight / 2 + lineHeight * 0.4;

    for (const line of lines) {
      ctx.fillText(line, width / 2, startY);
      startY += lineHeight;
    }

    // 5. Source Reference (Bottom)
    ctx.fillStyle = template === 'ivory' ? '#065F46' : '#34D399';
    ctx.font = 'bold 22px Cairo, sans-serif';
    ctx.fillText(content.source, width / 2, height - framePadding - 110);

    // 6. Wasl Islamic Branding Footer
    ctx.fillStyle = template === 'ivory' ? '#64748B' : 'rgba(255, 255, 255, 0.7)';
    ctx.font = 'bold 18px Cairo, sans-serif';
    ctx.fillText('منصة وَصْل الإسلامية — Wasl Islamic', width / 2, height - framePadding - 60);
  };

  useEffect(() => {
    renderCanvas();
  }, [content, aspectRatio, template, cardFontSize]);

  // Action: Download PNG
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `wasl_islamic_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Action: Copy Image to Clipboard
  const handleCopyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        if (navigator.clipboard && (window as any).ClipboardItem) {
          const item = new (window as any).ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          setCopiedStatus('image');
          setTimeout(() => setCopiedStatus(null), 2500);
        } else {
          // Fallback to download
          handleDownload();
        }
      });
    } catch {
      handleDownload();
    }
  };

  // Action: Copy Text
  const handleCopyText = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${content.text}\n\n${content.source}\nمنصة وصل الإسلامية`);
      setCopiedStatus('text');
      setTimeout(() => setCopiedStatus(null), 2500);
    }
  };

  // Action: Native Share
  const handleNativeShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (navigator.share) {
      try {
        canvas.toBlob(async (blob) => {
          if (blob && navigator.canShare && navigator.canShare({ files: [new File([blob], 'wasl.png', { type: 'image/png' })] })) {
            const file = new File([blob], 'wasl.png', { type: 'image/png' });
            await navigator.share({
              title: content.title,
              text: `${content.text} — ${content.source}`,
              files: [file]
            });
          } else {
            await navigator.share({
              title: content.title,
              text: `${content.text} — ${content.source}\n${process.env.NEXT_PUBLIC_APP_URL || 'https://waslislam.fun'}`
            });
          }
        });
      } catch {
        handleDownload();
      }
    } else {
      handleDownload();
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Studio Header */}
      <section className="bg-[var(--bg-card)] border border-[var(--border-gold)] rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--gold-light)] text-[var(--gold)] text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>استوديو البطاقات الدعوية عالية الدقة</span>
            </div>
            <h2 className="text-2xl font-black text-[var(--text-main)] font-cairo">
              {isEnglish ? 'Share Card Studio' : 'تصميم ومشاركة البطاقات الإسلامية'}
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {isEnglish
                ? 'Create stunning high-resolution cards for Quran, Hadith, Adhkar, and Duas with one click'
                : 'صمّم بطاقات دعوية فخمة للآيات والأحاديث والأذكار بجودة فائقة جاهزة للنشر في وسائل التواصل'}
            </p>
          </div>

          {/* Quick Share Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleNativeShare}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--gold)] text-white text-xs font-bold flex items-center gap-2 shadow-md hover:scale-105 transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>{isEnglish ? 'Share' : 'مشاركة فورية'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3.5 py-2 rounded-xl bg-[var(--bg-card-subtle)] text-[var(--text-main)] text-xs font-bold border border-[var(--border-color)] hover:border-[var(--gold)] flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>تحميل PNG</span>
            </button>

            <button
              onClick={handleCopyImage}
              className="px-3.5 py-2 rounded-xl bg-[var(--bg-card-subtle)] text-[var(--text-main)] text-xs font-bold border border-[var(--border-color)] hover:border-[var(--gold)] flex items-center gap-1.5 transition-colors"
            >
              {copiedStatus === 'image' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copiedStatus === 'image' ? 'تم نسخ الصورة!' : 'نسخ كصورة'}</span>
            </button>
          </div>
        </div>

        {/* Studio Workspace: Left Controls, Right Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-6">
          {/* Controls Column (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Template Selector */}
            <div>
              <label className="block text-xs font-bold text-[var(--text-main)] mb-2">
                1. القالب اللوني والخلفية:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'emerald', labelAr: 'الزمردي الإسلامي', color: '#064E3B' },
                  { id: 'gold', labelAr: 'الذهبي الملكي', color: '#B45309' },
                  { id: 'dark', labelAr: 'الليلي الحديث', color: '#0F172A' },
                  { id: 'ivory', labelAr: 'العاجي الهادئ', color: '#FDFBF7' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTemplate(t.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                      template === t.id ? 'ring-2 ring-[var(--gold)] border-transparent shadow-sm' : 'border-[var(--border-color)]'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full shrink-0 border" style={{ backgroundColor: t.color }} />
                    <span className="truncate">{t.labelAr}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio Selector */}
            <div>
              <label className="block text-xs font-bold text-[var(--text-main)] mb-2">
                2. أبعاد ومقاس البطاقة:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: '1:1', label: 'مربع (1:1)' },
                  { id: '4:5', label: 'عمودي (4:5)' },
                  { id: '9:16', label: 'ستوري (9:16)' },
                  { id: '16:9', label: 'عرضي (16:9)' },
                ].map(ar => (
                  <button
                    key={ar.id}
                    onClick={() => setAspectRatio(ar.id as any)}
                    className={`p-2 rounded-xl border text-[11px] font-bold text-center transition-all ${
                      aspectRatio === ar.id ? 'bg-[var(--gold)] text-white border-transparent' : 'bg-[var(--bg-card-subtle)] border-[var(--border-color)] text-[var(--text-muted)]'
                    }`}
                  >
                    {ar.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size Adjuster */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-[var(--text-main)] mb-1">
                <span>3. حجم النص القرآني:</span>
                <span className="font-mono text-[var(--gold)]">{cardFontSize}px</span>
              </div>
              <input
                type="range"
                min={24}
                max={54}
                value={cardFontSize}
                onChange={(e) => setCardFontSize(Number(e.target.value))}
                className="w-full accent-[var(--gold)] cursor-pointer"
              />
            </div>

            {/* Text Customizer */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
                  العنوان العلوي للبطاقة:
                </label>
                <input
                  type="text"
                  value={content.title}
                  onChange={(e) => setContent(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-[var(--bg-card-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs font-bold text-[var(--text-main)] focus:outline-none focus:border-[var(--gold)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
                  النص الشرعي (الآية أو الحديث أو الذكر):
                </label>
                <textarea
                  rows={4}
                  value={content.text}
                  onChange={(e) => setContent(prev => ({ ...prev, text: e.target.value }))}
                  className="w-full bg-[var(--bg-card-subtle)] border border-[var(--border-color)] rounded-xl p-3 text-xs font-semibold text-[var(--text-main)] font-quran focus:outline-none focus:border-[var(--gold)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
                  المصدر أو التخريج:
                </label>
                <input
                  type="text"
                  value={content.source}
                  onChange={(e) => setContent(prev => ({ ...prev, source: e.target.value }))}
                  className="w-full bg-[var(--bg-card-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs font-bold text-[var(--text-main)] focus:outline-none focus:border-[var(--gold)]"
                />
              </div>
            </div>
          </div>

          {/* Canvas Live Preview Column (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-[var(--bg-card-subtle)] p-6 rounded-3xl border border-[var(--border-color)]">
            <span className="text-xs font-bold text-[var(--text-muted)] mb-3">
              معاينة البطاقة الناتجة (دقة تصدير أصلية 1080px):
            </span>
            <div className="w-full max-w-md shadow-2xl rounded-2xl overflow-hidden border-2 border-[var(--border-gold)]">
              <canvas
                ref={canvasRef}
                className="w-full h-auto block"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
