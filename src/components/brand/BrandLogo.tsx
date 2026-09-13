import React from 'react';
import { branding } from '../../config/branding';

export type BrandLogoVariant = 'full' | 'compact' | 'icon' | 'responsive';
export type BrandLogoSize = 'sm' | 'md' | 'lg' | 'xl' | 'responsive';
export type BrandLogoTheme = 'auto' | 'light' | 'dark';

export interface BrandLogoProps {
  /** Logo variant: full (text + arch), compact (same as full lockup), icon (arch only), responsive */
  variant?: BrandLogoVariant;
  /** Sizing preset or responsive clamp */
  size?: BrandLogoSize;
  /** Force a specific theme or auto-track system/user theme without flash */
  forceTheme?: BrandLogoTheme;
  /** Custom additional className */
  className?: string;
  /** Click handler */
  onClick?: () => void;
  /** Whether the logo behaves as a clickable button/link */
  clickable?: boolean;
  /** Accessibility alt text */
  alt?: string;
  /** Loading priority */
  priority?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'compact',
  size = 'md',
  forceTheme = 'auto',
  className = '',
  onClick,
  clickable = false,
  alt = branding.name,
  priority = true,
}) => {
  // Height sizing classes based on size prop using fluid clamp where appropriate
  const getHeightClass = () => {
    switch (size) {
      case 'sm':
        return 'h-7 sm:h-8';
      case 'md':
        return 'h-9 sm:h-10 md:h-11';
      case 'lg':
        return 'h-12 sm:h-14 md:h-16';
      case 'xl':
        return 'h-16 sm:h-20 md:h-24';
      case 'responsive':
      default:
        return 'h-[clamp(34px,3.8vw,48px)]';
    }
  };

  const getAspectStyle = (v: 'full' | 'icon') => {
    return v === 'icon'
      ? { aspectRatio: branding.aspectRatio.icon }
      : { aspectRatio: branding.aspectRatio.full };
  };

  const cursorClass = clickable || onClick ? 'cursor-pointer hover:opacity-95 active:scale-[0.98] transition-transform' : '';

  // Render an individual image element for a specific theme and type
  const renderImage = (theme: 'light' | 'dark', isIcon: boolean, extraClasses = '') => {
    const assets = branding[theme][isIcon ? 'icon' : 'full'];
    const dims = isIcon ? branding.dimensions.icon : branding.dimensions.full;

    return (
      <picture className={`${extraClasses} select-none block shrink-0`}>
        <source srcSet={assets.webp} type="image/webp" />
        <source srcSet={assets.svg} type="image/svg+xml" />
        <img
          src={assets.png}
          alt={alt}
          width={dims.width}
          height={dims.height}
          fetchPriority={priority ? 'high' : 'auto'}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className={`w-auto ${getHeightClass()} object-contain block`}
          style={{
            ...getAspectStyle(isIcon ? 'icon' : 'full'),
            maxHeight: '100%',
          }}
        />
      </picture>
    );
  };

  // 1. Icon-only variant
  if (variant === 'icon') {
    return (
      <div
        className={`inline-flex items-center justify-center shrink-0 select-none ${cursorClass} ${className}`}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
      >
        {forceTheme === 'light' ? (
          renderImage('light', true)
        ) : forceTheme === 'dark' ? (
          renderImage('dark', true)
        ) : (
          <>
            {/* Zero-Flash Dual rendering: CSS controls display based on .dark class on <html> */}
            {renderImage('light', true, 'dark:hidden block')}
            {renderImage('dark', true, 'hidden dark:block')}
          </>
        )}
      </div>
    );
  }

  // 2. Responsive variant: Icon on narrow screens (< 360px), Full/Compact on wider screens
  if (variant === 'responsive') {
    return (
      <div
        className={`inline-flex items-center shrink-0 select-none ${cursorClass} ${className}`}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
      >
        {/* Extra narrow screen icon lockup */}
        <div className="flex min-[360px]:hidden items-center">
          {forceTheme === 'light' ? (
            renderImage('light', true)
          ) : forceTheme === 'dark' ? (
            renderImage('dark', true)
          ) : (
            <>
              {renderImage('light', true, 'dark:hidden block')}
              {renderImage('dark', true, 'hidden dark:block')}
            </>
          )}
        </div>

        {/* Standard screen full lockup (>= 360px) */}
        <div className="hidden min-[360px]:flex items-center">
          {forceTheme === 'light' ? (
            renderImage('light', false)
          ) : forceTheme === 'dark' ? (
            renderImage('dark', false)
          ) : (
            <>
              {renderImage('light', false, 'dark:hidden block')}
              {renderImage('dark', false, 'hidden dark:block')}
            </>
          )}
        </div>
      </div>
    );
  }

  // 3. Full / Compact variant (Default)
  return (
    <div
      className={`inline-flex items-center shrink-0 select-none ${cursorClass} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      {forceTheme === 'light' ? (
        renderImage('light', false)
      ) : forceTheme === 'dark' ? (
        renderImage('dark', false)
      ) : (
        <>
          {renderImage('light', false, 'dark:hidden block')}
          {renderImage('dark', false, 'hidden dark:block')}
        </>
      )}
    </div>
  );
};
