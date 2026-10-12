import React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

/**
 * Purpose-designed authentic Islamic vector icons.
 * Strict visual design adherence:
 * - 24x24 viewBox
 * - 2px stroke width matching Lucide icons
 * - strokeLinecap="round" and strokeLinejoin="round"
 * - fill="none" with stroke="currentColor"
 * - Retina sharp, responsive, light/dark theme reactive
 */

/**
 * 1. Ablution Icon (الوضوء الشرعي وطهارة الماء)
 * Represents the authentic act of ablution with clean water flowing gracefully.
 * Replaces generic water droplet emojis with a purpose-designed ablution vessel and purifying stream.
 */
export const IconAblution: React.FC<IconProps> = ({ className = 'w-6 h-6', size, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    {/* Clean ablution vessel pouring pure water over hand basin */}
    <path d="M5 11h8a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-5a2 2 0 0 1 2-2z" />
    <path d="M7 11V6a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v5" />
    <path d="M16 13l4-2" />
    <path d="M18.5 15.5c1 1.2 1.5 2 1.5 2.5a1.5 1.5 0 0 1-3 0c0-.5.5-1.3 1.5-2.5z" />
  </svg>
);

/**
 * 2. Children's Islamic Education Icon (عالم الأطفال والتربية الإيمانية)
 * An illuminated open book with knowledge stars and a peaceful emblem.
 * Replaces generic rainbow emoji with a dedicated children's Islamic learning symbol.
 */
export const IconKidsLearning: React.FC<IconProps> = ({ className = 'w-6 h-6', size, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    {/* Open children's book of knowledge */}
    <path d="M2 6c3-1.5 6-1.5 10 1 4-2.5 7-2.5 10-1v13c-3-1.5-6-1.5-10 1-4-2.5-7-2.5-10-1V6z" />
    <path d="M12 7v13" />
    {/* Little star of achievement rising above */}
    <path d="M12 2.5l.7 1.4 1.5.2-1.1 1.1.3 1.5-1.4-.7-1.4.7.3-1.5-1.1-1.1 1.5-.2z" />
  </svg>
);

/**
 * 3. Digital Tasbeeh Icon (المسبحة الإلكترونية وخرزات الذكر)
 * Professional circular prayer beads with minaret tassel marker.
 * Replaces generic bead/heart placeholders.
 */
export const IconTasbeeh: React.FC<IconProps> = ({ className = 'w-6 h-6', size, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    {/* Tasbeeh string of circular beads */}
    <circle cx="12" cy="14" r="6.5" />
    <circle cx="12" cy="7.5" r="1.5" />
    <circle cx="6.5" cy="12" r="1.5" />
    <circle cx="17.5" cy="12" r="1.5" />
    <circle cx="12" cy="20.5" r="1.5" />
    <circle cx="8" cy="9.5" r="1.5" />
    <circle cx="16" cy="9.5" r="1.5" />
    <circle cx="8" cy="17.5" r="1.5" />
    <circle cx="16" cy="17.5" r="1.5" />
    {/* Tassel marker */}
    <path d="M12 6V2.5" />
    <path d="M10 2.5h4" />
  </svg>
);

/**
 * 4. Holy Kaaba Icon (الكعبة المشرفة ومناسك الحج والعمرة)
 * Respectful geometric architectural depiction of the Kaaba with Kiswah gold border.
 */
export const IconKaaba: React.FC<IconProps> = ({ className = 'w-6 h-6', size, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M4 8l8-4 8 4v10l-8 4-8-4V8z" />
    <path d="M12 4v18" />
    <path d="M4 11l8 4 8-4" />
    <path d="M4 13l8 4 8-4" />
  </svg>
);

/**
 * 5. Prayer Mihrab & Rug Icon (المحراب والصلاة)
 * Authentic Islamic archway and prayer niche.
 */
export const IconPrayerMihrab: React.FC<IconProps> = ({ className = 'w-6 h-6', size, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M4 21V9a8 8 0 0 1 16 0v12" />
    <path d="M8 21v-8a4 4 0 0 1 8 0v8" />
    <path d="M12 3v3" />
    <path d="M3 21h18" />
  </svg>
);

/**
 * 6. Quran Stand Icon (حامل المصحف والختمة المباركة)
 * Classical wooden Rihal stand supporting the open Noble Mushaf.
 */
export const IconQuranStand: React.FC<IconProps> = ({ className = 'w-6 h-6', size, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M3 6c2.5-1 5-1 9 1 4-2 6.5-2 9-1v10c-2.5-1-5-1-9 1-4-2-6.5-2-9-1V6z" />
    <path d="M12 7v10" />
    <path d="M6 19l6-4 6 4" />
    <path d="M8 21l8-6" />
    <path d="M16 21l-8-6" />
  </svg>
);

/**
 * 7. Islamic Lantern Icon (فانوس رمضان ومواسم الطاعات)
 * Classical Ramadan Fanoos.
 */
export const IconRamadanLantern: React.FC<IconProps> = ({ className = 'w-6 h-6', size, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M12 2v2" />
    <path d="M9 4h6l2 4H7l2-4z" />
    <path d="M7 8l1 9h8l1-9H7z" />
    <path d="M8 17l-1 4h10l-1-4" />
    <path d="M10 21h4" />
    <path d="M12 10v5" />
    <path d="M9.5 12.5h5" />
  </svg>
);

/**
 * 8. Hands in Supplication (كفوف التضرع والدعاء)
 * Two open palms raised in authentic Islamic Dua.
 */
export const IconDuaHands: React.FC<IconProps> = ({ className = 'w-6 h-6', size, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M12 18v3" />
    <path d="M10 18c-3 0-5-2-5-6 0-3 1.5-6 3.5-9l1.5 5" />
    <path d="M14 18c3 0 5-2 5-6 0-3-1.5-6-3.5-9l-1.5 5" />
    <path d="M9 13a3 3 0 0 0 6 0" />
  </svg>
);
