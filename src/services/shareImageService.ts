import QRCode from 'qrcode';
import {
  ShareItemData,
  DEFAULT_SHARE_CONFIG,
  SHARE_TEMPLATE_WIDTH,
  SHARE_TEMPLATE_HEIGHT
} from '../types/share';

export function toArabicDigits(str: string | number): string {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return str.toString().replace(/\d/g, (d) => arabicDigits[parseInt(d, 10)]);
}

/**
 * Returns the current Hijri date formatted in Arabic
 * Example: "١ ربيع الآخر ١٤٤٨ هـ"
 */
export function getHijriDateString(date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    return formatter.format(date);
  } catch {
    return '١ ربيع الآخر ١٤٤٨ هـ';
  }
}

/**
 * Calculates remaining days until the 1st of Ramadan
 * Handles current Ramadan dynamically
 */
export function getRamadanCountdown(now = new Date()): { days: number; text: string } {
  try {
    const parts = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    }).formatToParts(now);

    const hMonth = parseInt(parts.find((p) => p.type === 'month')?.value || '1', 10);
    const hYear = parseInt(parts.find((p) => p.type === 'year')?.value || '1448', 10);

    if (hMonth === 9) {
      return { days: 0, text: 'شهر رمضان المبارك' };
    }

    const targetYear = hMonth < 9 ? hYear : hYear + 1;
    const testDate = new Date(now.getTime());

    // Step forward day by day to find Ramadan 1st (month 9, day 1)
    for (let i = 0; i < 400; i++) {
      testDate.setDate(testDate.getDate() + 1);
      const p = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
      }).formatToParts(testDate);

      const m = parseInt(p.find((x) => x.type === 'month')?.value || '1', 10);
      const d = parseInt(p.find((x) => x.type === 'day')?.value || '1', 10);
      const y = parseInt(p.find((x) => x.type === 'year')?.value || '1448', 10);

      if (y === targetYear && m === 9 && d === 1) {
        const diffTime = testDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return {
          days: diffDays,
          text: `بقي ${toArabicDigits(diffDays)} يوماً`
        };
      }
    }
  } catch (err) {
    console.warn('Error calculating Ramadan countdown:', err);
  }

  return { days: 149, text: 'بقي ١٤٩ يوماً' };
}

export interface TextLayoutResult {
  lines: string[];
  fontSize: number;
  lineHeight: number;
  totalHeight: number;
  isTooLong: boolean;
}

/**
 * Deterministic text fitting algorithm
 * Fits text strictly within the white arch area between the Cream Plaque and Golden Divider
 */
export function fitTextToArch(
  text: string,
  maxWidth = 840,
  maxHeight = 350,
  measureContext?: CanvasRenderingContext2D,
  fontFamily = 'Amiri'
): TextLayoutResult {
  const fontSizes = [
    { size: 44, lineHeight: 68 },
    { size: 40, lineHeight: 62 },
    { size: 36, lineHeight: 56 },
    { size: 32, lineHeight: 50 },
    { size: 28, lineHeight: 44 },
    { size: 24, lineHeight: 38 },
    { size: 22, lineHeight: 34 }
  ];

  const words = text.trim().split(/\s+/);

  for (const { size, lineHeight } of fontSizes) {
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const candidate = currentLine ? `${currentLine} ${word}` : word;
      let textWidth = 0;

      if (measureContext) {
        measureContext.font = `bold ${size}px "${fontFamily}", serif`;
        textWidth = measureContext.measureText(candidate).width;
      } else {
        textWidth = candidate.length * (size * 0.52);
      }

      if (textWidth <= maxWidth) {
        currentLine = candidate;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          lines.push(word);
          currentLine = '';
        }
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    const totalHeight = lines.length * lineHeight;
    if (totalHeight <= maxHeight) {
      return {
        lines,
        fontSize: size,
        lineHeight,
        totalHeight,
        isTooLong: false
      };
    }
  }

  // Fallback for very long texts
  const fallback = fontSizes[fontSizes.length - 1];
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    let textWidth = 0;
    if (measureContext) {
      measureContext.font = `bold ${fallback.size}px "${fontFamily}", serif`;
      textWidth = measureContext.measureText(candidate).width;
    } else {
      textWidth = candidate.length * (fallback.size * 0.52);
    }
    if (textWidth <= maxWidth) {
      currentLine = candidate;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  return {
    lines,
    fontSize: fallback.size,
    lineHeight: fallback.lineHeight,
    totalHeight: lines.length * fallback.lineHeight,
    isTooLong: lines.length * fallback.lineHeight > maxHeight
  };
}

let cachedTemplateImage: HTMLImageElement | null = null;

/**
 * Loads the official Wasl Islamic share template image
 * Prioritizes the ultra high-resolution 2x master template (1364 x 2048)
 * with graceful fallback to standard resolution (682 x 1024)
 */
export async function loadTemplateImage(): Promise<HTMLImageElement> {
  if (cachedTemplateImage && cachedTemplateImage.complete) {
    return cachedTemplateImage;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      cachedTemplateImage = img;
      resolve(img);
    };
    img.onerror = () => {
      const fallback = new Image();
      fallback.crossOrigin = 'anonymous';
      fallback.onload = () => {
        cachedTemplateImage = fallback;
        resolve(fallback);
      };
      fallback.onerror = () => reject(new Error('تعذر تحميل قالب المشاركة الأساسي'));
      fallback.src = '/wasl-islamic-share-template.png';
    };
    // Use the official high-resolution 2x template (1364 x 2048)
    img.src = '/wasl-islamic-share-template@2x.png';
  });
}

/**
 * Generates the QR Code Image for waslislam.fun
 */
export async function generateQrImage(url = DEFAULT_SHARE_CONFIG.platformUrl): Promise<HTMLImageElement> {
  const qrDataUrl = await QRCode.toDataURL(url, {
    margin: 1,
    width: 256,
    color: {
      dark: '#0e2b20',
      light: '#ffffff'
    }
  });

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('تعذر توليد رمز الاستجابة السريعة (QR)'));
    img.src = qrDataUrl;
  });
}

export interface RenderCardOptions {
  item: ShareItemData;
  fontFamily?: string;
  targetCanvas?: HTMLCanvasElement;
}

/**
 * Renders the full share card onto a canvas at high resolution
 * strictly preserving the official template image at fixed original dimensions (1364 x 2048).
 */
export async function renderShareCardToCanvas(options: RenderCardOptions): Promise<{
  canvas: HTMLCanvasElement;
  layout: TextLayoutResult;
}> {
  const {
    item,
    fontFamily = DEFAULT_SHARE_CONFIG.primaryFont
  } = options;

  // 1. Setup canvas at fixed native template resolution (1364 x 2048) for retina quality
  const BASE_WIDTH = SHARE_TEMPLATE_WIDTH;
  const BASE_HEIGHT = SHARE_TEMPLATE_HEIGHT;

  const baseCanvas = options.targetCanvas || document.createElement('canvas');
  baseCanvas.width = BASE_WIDTH;
  baseCanvas.height = BASE_HEIGHT;

  const ctx = baseCanvas.getContext('2d');
  if (!ctx) throw new Error('تعذر تهيئة محرك الرسم (Canvas Context)');

  // 2. Load background template & QR code in parallel
  const [templateImg, qrImg] = await Promise.all([
    loadTemplateImage(),
    generateQrImage(item.url || DEFAULT_SHARE_CONFIG.platformUrl)
  ]);

  // 3. Draw the exact official template background
  ctx.drawImage(templateImg, 0, 0, BASE_WIDTH, BASE_HEIGHT);

  // 4. Draw the dynamic QR code over the template QR box
  // Exact coordinates at 2x: x: 128, y: 1724, width: 134, height: 134
  ctx.drawImage(qrImg, 128, 1724, 134, 134);

  // 5. Automatic Section Name Resolution
  let sectionName = item.sectionName?.trim();
  if (!sectionName) {
    switch (item.type) {
      case 'hadith':
        sectionName = 'الأحاديث';
        break;
      case 'quran':
        sectionName = 'القرآن الكريم';
        break;
      case 'dua':
        sectionName = 'الأدعية';
        break;
      case 'dhikr':
        sectionName = 'أذكار الصباح';
        break;
      case 'fatwa':
        sectionName = 'الفتاوى';
        break;
      case 'article':
        sectionName = 'المقالات';
        break;
      default:
        sectionName = 'وصل الإسلامية';
    }
  }

  // 6. Automatic Content Type Resolution
  let contentType = item.contentType?.trim();
  if (!contentType) {
    switch (item.type) {
      case 'hadith':
        contentType = 'حديث';
        break;
      case 'quran':
        contentType = 'آية';
        break;
      case 'dua':
        contentType = 'دعاء';
        break;
      case 'dhikr':
        contentType = 'ذكر';
        break;
      case 'fatwa':
        contentType = 'بيان شرعي';
        break;
      case 'article':
        contentType = 'مقال';
        break;
      default:
        contentType = 'محتوى موثق';
    }
  }

  // 7. Draw Section Name inside the Dark Green Plaque (اللوحة الخضراء)
  // Exact Center at 2x: x = 682, y = 515
  ctx.direction = 'rtl';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '800 30px "Tajawal", system-ui, sans-serif';
  ctx.fillStyle = '#fef9c3'; // Luxurious bright gold-cream on dark green
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 1;
  ctx.fillText(sectionName, 682, 515);

  // 8. Draw Content Type inside the Small Cream Plaque (اللوحة الصغيرة)
  // Exact Center at 2x: x = 682, y = 638
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.font = '800 23px "Tajawal", system-ui, sans-serif';
  ctx.fillStyle = '#064e3b'; // Deep Forest Green
  ctx.fillText(contentType, 682, 638);

  // 9. Source Text Resolution
  let sourceText = item.source?.trim() || '';
  if (!sourceText && item.type === 'quran' && item.surahName) {
    sourceText = `سورة ${item.surahName}${item.ayahNumber ? ` • الآية ${toArabicDigits(item.ayahNumber)}` : ''}`;
  }
  const hasSource = Boolean(sourceText);

  // 10. Fit and Draw Main Islamic Content inside Safe Arch White Zone
  // Zone spans from y = 675 (below cream plaque) to y = 1095 (above golden divider)
  // Midpoint = 882
  const textContent = (item.content || item.text || '').trim();
  const maxZoneHeight = hasSource ? 350 : 390;
  const layout = fitTextToArch(textContent, 840, maxZoneHeight, ctx, fontFamily);

  const sourceHeight = hasSource ? 45 : 0;
  const combinedHeight = layout.totalHeight + sourceHeight;
  const zoneCenterY = 882;
  const startY = Math.round(zoneCenterY - (combinedHeight / 2) + (layout.lineHeight / 2));
  const sourceY = startY + (layout.lines.length - 1) * layout.lineHeight + 50;

  // Draw Main Text
  ctx.font = `bold ${layout.fontSize}px "${fontFamily}", "Amiri", serif`;
  ctx.fillStyle = '#064e3b';
  ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 1;

  layout.lines.forEach((line, idx) => {
    const y = startY + idx * layout.lineHeight;
    ctx.fillText(line, 682, y);
  });

  // Reset shadow for source
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // 11. Draw Verified Source (below main text before golden divider, if present)
  if (hasSource) {
    ctx.font = '700 21px "Tajawal", system-ui, sans-serif';
    ctx.fillStyle = '#b45309'; // Warm amber gold accent
    ctx.fillText(`— ${sourceText} —`, 682, sourceY);
  }

  // 12. Draw Dynamic Hijri Date & Ramadan Countdown in the Pills
  const hijriDate = item.hijriDate?.trim() || getHijriDateString();
  const ramadanCountdown = item.ramadanCountdown?.trim() || getRamadanCountdown().text;

  ctx.font = '800 23px "Tajawal", system-ui, sans-serif';
  ctx.fillStyle = '#064e3b';

  // Left Pill: Date (center x: 508, y: 1675)
  ctx.fillText(hijriDate, 508, 1675);

  // Right Pill: Ramadan Countdown (center x: 856, y: 1675)
  ctx.fillText(ramadanCountdown, 856, 1675);

  // 13. Fixed Output: strictly preserve original template dimensions (1364 x 2048)
  // No resizing, no stretching, no aspect ratio distortion, no multi-size variants
  return { canvas: baseCanvas, layout };
}

/**
 * Copies the generated card canvas as a PNG blob to the user's clipboard
 */
export async function copyCardToClipboard(canvas: HTMLCanvasElement): Promise<boolean> {
  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        resolve(false);
        return;
      }
      try {
        if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          resolve(true);
        } else {
          resolve(false);
        }
      } catch (err) {
        console.warn('Clipboard write image failed:', err);
        resolve(false);
      }
    }, 'image/png', 1.0);
  });
}

/**
 * Downloads the card as a high-resolution PNG file
 */
export function downloadCardImage(canvas: HTMLCanvasElement, filename = 'wasl-islamic-share.png'): void {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }, 'image/png', 1.0);
}

/**
 * Invokes native Web Share API with image file
 */
export async function shareCardNative(
  canvas: HTMLCanvasElement,
  title = 'وصل الإسلامية',
  text = 'من منصة وصل الإسلامية'
): Promise<boolean> {
  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        resolve(false);
        return;
      }

      const file = new File([blob], 'wasl-islamic-card.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title,
            text,
            files: [file]
          });
          resolve(true);
        } catch (err: any) {
          if (err.name === 'AbortError') {
            resolve(true); // User closed share sheet, not an error
          } else {
            console.warn('Native share failed:', err);
            resolve(false);
          }
        }
      } else {
        resolve(false);
      }
    }, 'image/png', 1.0);
  });
}
