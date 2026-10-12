'use client';

import React from 'react';

export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface BrandLogoProps {
  size?: LogoSize;
  className?: string;
  showText?: boolean;
  showSubtitle?: boolean;
  showBadge?: boolean;
  isEnglish?: boolean;
  onClick?: () => void;
  priority?: boolean;
}

const sizeConfig: Record<LogoSize, { container: string; img: string; width: number; height: number }> = {
  // Compact mobile header / small buttons: ~36-40px
  xs: {
    container: 'w-9 h-9 sm:w-10 sm:h-10',
    img: 'w-9 h-9 sm:w-10 sm:h-10',
    width: 40,
    height: 40,
  },
  // Mobile / compact navigation: ~44-48px
  sm: {
    container: 'w-10 h-10 sm:w-12 sm:h-12',
    img: 'w-10 h-10 sm:w-12 sm:h-12',
    width: 48,
    height: 48,
  },
  // Standard header / medium tablet: ~52-60px
  md: {
    container: 'w-11 h-11 sm:w-13 sm:h-13 md:w-14 md:h-14',
    img: 'w-11 h-11 sm:w-13 sm:h-13 md:w-14 md:h-14',
    width: 56,
    height: 56,
  },
  // Large desktop / modals / hero banner: ~64-76px
  lg: {
    container: 'w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20',
    img: 'w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20',
    width: 80,
    height: 80,
  },
  // Splash screen / loading / major showcases: ~96-128px
  xl: {
    container: 'w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32',
    img: 'w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32',
    width: 128,
    height: 128,
  },
};

/**
 * Reusable official Wasl Islamic branding component.
 * Displays the authentic emerald and gold squircle emblem with intrinsic aspect ratio preservation,
 * responsive scaling, accessible keyboard navigation, and seamless RTL alignment.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  className = '',
  showText = false,
  showSubtitle = false,
  showBadge = false,
  isEnglish = false,
  onClick,
  priority = false,
}) => {
  const cfg = sizeConfig[size] || sizeConfig.md;
  const isClickable = Boolean(onClick);

  const emblem = (
    <div
      className={`relative shrink-0 aspect-square select-none transition-transform duration-200 ${cfg.container} ${
        isClickable ? 'group-hover:scale-105 group-active:scale-95' : ''
      }`}
    >
      <picture className="w-full h-full block">
        <source srcSet="/assets/branding/wasl-logo.webp" type="image/webp" />
        <img
          src="/assets/branding/wasl-logo.png"
          alt={isEnglish ? 'Wasl Islamic Official Emblem' : 'شعار وصل الإسلامية المعتمد'}
          width={cfg.width}
          height={cfg.height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className="w-full h-full object-contain aspect-square drop-shadow-md rounded-[22%]"
          style={{ imageRendering: 'auto' }}
        />
      </picture>
    </div>
  );

  const textContent = showText && (
    <div className="flex flex-col text-right justify-center min-w-0 overflow-hidden">
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
        <h1 className="text-sm sm:text-base md:text-lg font-black tracking-tight text-[var(--text-main)] font-cairo truncate">
          {isEnglish ? 'Wasl Islamic' : 'وَصْل الإسلامية'}
        </h1>
        {showBadge && (
          <span className="hidden xl:inline-block text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[var(--gold-light)] text-[var(--gold)] border border-[var(--border-gold)] shrink-0">
            {isEnglish ? 'Official' : 'النسخة المعتمدة'}
          </span>
        )}
      </div>
      {showSubtitle && (
        <p className="text-[10px] sm:text-[11px] text-[var(--text-muted)] font-tajawal truncate hidden xl:block">
          {isEnglish ? 'Authentic Islamic Platform' : 'منصة القرآن والعلوم الإسلامية الشاملة'}
        </p>
      )}
    </div>
  );

  if (isClickable) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`group flex items-center gap-2 sm:gap-2.5 md:gap-3 text-start cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] rounded-2xl p-1 -m-1 transition-colors min-w-0 max-w-full shrink ${className}`}
        aria-label={isEnglish ? 'Wasl Islamic — Return to Home' : 'وصل الإسلامية — العودة للرئيسية'}
      >
        {emblem}
        {textContent}
      </button>
    );
  }

  return (
    <div className={`flex items-center gap-2 sm:gap-2.5 md:gap-3 min-w-0 max-w-full ${className}`}>
      {emblem}
      {textContent}
    </div>
  );
};
