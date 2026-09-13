import React from 'react';

export type BrandLogoVariant = 'full' | 'compact' | 'icon' | 'responsive';
export type BrandLogoSize = 'sm' | 'md' | 'lg' | 'xl' | 'responsive';

export interface BrandLogoProps {
  variant?: BrandLogoVariant;
  size?: BrandLogoSize;
  className?: string;
  onClick?: () => void;
  clickable?: boolean;
  alt?: string;
  priority?: boolean;
  withBadgeInDark?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'compact',
  size = 'md',
  className = '',
  onClick,
  clickable = false,
  alt = 'وصل الإسلامية',
  priority = true,
  withBadgeInDark = false,
}) => {
  // Height sizing classes based on size prop
  const getHeightClasses = () => {
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
        return 'h-[var(--logo-fluid-compact-height,36px)]';
    }
  };

  const getAspectClass = (v: BrandLogoVariant) => {
    switch (v) {
      case 'icon':
        return 'aspect-square';
      case 'full':
        return 'aspect-[740/447]';
      case 'compact':
      case 'responsive':
      default:
        return 'aspect-[740/346]';
    }
  };

  const badgeClass = withBadgeInDark
    ? 'dark:bg-white/95 dark:backdrop-blur-md dark:px-2.5 dark:py-1 dark:rounded-2xl dark:shadow-md dark:shadow-emerald-950/20 transition-all'
    : '';

  const cursorClass = clickable || onClick ? 'cursor-pointer hover:opacity-95 active:scale-[0.98] transition-transform' : '';

  if (variant === 'icon') {
    return (
      <div
        className={`inline-flex items-center justify-center shrink-0 select-none ${cursorClass} ${badgeClass} ${className}`}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
      >
        <picture>
          <source srcSet="/brand/logo-icon.webp" type="image/webp" />
          <img
            src="/brand/logo-icon.png"
            alt={alt}
            width={512}
            height={512}
            fetchPriority={priority ? 'high' : 'auto'}
            loading={priority ? 'eager' : 'lazy'}
            className={`w-auto ${getHeightClasses()} aspect-square object-contain block`}
            style={{ maxHeight: '100%' }}
          />
        </picture>
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div
        className={`inline-flex items-center justify-center shrink-0 select-none ${cursorClass} ${badgeClass} ${className}`}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
      >
        <picture>
          <source srcSet="/brand/logo-full.webp" type="image/webp" />
          <img
            src="/brand/logo-full.png"
            alt={alt}
            width={740}
            height={447}
            fetchPriority={priority ? 'high' : 'auto'}
            loading={priority ? 'eager' : 'lazy'}
            className={`w-auto ${getHeightClasses()} ${getAspectClass('full')} object-contain block`}
            style={{ maxHeight: '100%' }}
          />
        </picture>
      </div>
    );
  }

  if (variant === 'responsive') {
    return (
      <div
        className={`inline-flex items-center shrink-0 select-none ${cursorClass} ${badgeClass} ${className}`}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
      >
        {/* On extra-narrow screens (< 380px), show clean icon to prevent navbar overflow */}
        <div className="flex min-[380px]:hidden items-center">
          <picture>
            <source srcSet="/brand/logo-icon.webp" type="image/webp" />
            <img
              src="/brand/logo-icon.png"
              alt={alt}
              width={512}
              height={512}
              fetchPriority={priority ? 'high' : 'auto'}
              loading={priority ? 'eager' : 'lazy'}
              className="h-8 w-8 aspect-square object-contain block"
            />
          </picture>
        </div>

        {/* On standard mobile, tablet and desktop (>= 380px), show Compact Logo (Icon + Wasl Al-Islamiyyah) */}
        <div className="hidden min-[380px]:flex items-center">
          <picture>
            <source srcSet="/brand/logo-compact.webp" type="image/webp" />
            <img
              src="/brand/logo-compact.png"
              alt={alt}
              width={740}
              height={346}
              fetchPriority={priority ? 'high' : 'auto'}
              loading={priority ? 'eager' : 'lazy'}
              className={`w-auto ${getHeightClasses()} ${getAspectClass('compact')} object-contain block`}
              style={{ maxHeight: '100%' }}
            />
          </picture>
        </div>
      </div>
    );
  }

  // Default compact
  return (
    <div
      className={`inline-flex items-center shrink-0 select-none ${cursorClass} ${badgeClass} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      <picture>
        <source srcSet="/brand/logo-compact.webp" type="image/webp" />
        <img
          src="/brand/logo-compact.png"
          alt={alt}
          width={740}
          height={346}
          fetchPriority={priority ? 'high' : 'auto'}
          loading={priority ? 'eager' : 'lazy'}
          className={`w-auto ${getHeightClasses()} ${getAspectClass('compact')} object-contain block`}
          style={{ maxHeight: '100%' }}
        />
      </picture>
    </div>
  );
};
