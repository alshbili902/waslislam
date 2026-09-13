/**
 * Centralized Branding Configuration for Wasl Islamic Platform
 * منصة وصل الإسلامية - الإعدادات المركزية للهوية البصرية والشعارات
 */

export interface BrandAssetSet {
  /** Full logo with typography on the left and Islamic icon on the right */
  full: {
    svg: string;
    png: string;
    webp: string;
  };
  /** Arch & Crescent icon-only for compact/square spaces */
  icon: {
    svg: string;
    png: string;
    webp: string;
  };
  /** Social sharing card with background */
  card: {
    png: string;
  };
  /** Favicon for browser tabs */
  favicon: {
    png: string;
  };
}

export interface BrandingConfig {
  name: string;
  nameEn: string;
  slogan: string;
  sloganEn: string;
  aspectRatio: {
    full: string; // "840 / 548"
    icon: string; // "1 / 1"
  };
  dimensions: {
    full: {
      width: number;
      height: number;
    };
    icon: {
      width: number;
      height: number;
    };
  };
  light: BrandAssetSet;
  dark: BrandAssetSet;
}

export const branding: BrandingConfig = {
  name: 'وصل الإسلامية',
  nameEn: 'Wasl Islamic',
  slogan: 'خير دائم بين يديك',
  sloganEn: 'Eternal goodness in your hands',
  aspectRatio: {
    full: '840 / 548',
    icon: '1 / 1',
  },
  dimensions: {
    full: {
      width: 840,
      height: 548,
    },
    icon: {
      width: 512,
      height: 512,
    },
  },
  light: {
    full: {
      svg: '/branding/wasl-islamic-light.svg',
      png: '/branding/wasl-islamic-light.png',
      webp: '/branding/wasl-islamic-light.webp',
    },
    icon: {
      svg: '/branding/wasl-islamic-icon-light.svg',
      png: '/branding/wasl-islamic-icon-light.png',
      webp: '/branding/wasl-islamic-icon-light.webp',
    },
    card: {
      png: '/branding/og-image-light.png',
    },
    favicon: {
      png: '/branding/favicon-light.png',
    },
  },
  dark: {
    full: {
      svg: '/branding/wasl-islamic-dark.svg',
      png: '/branding/wasl-islamic-dark.png',
      webp: '/branding/wasl-islamic-dark.webp',
    },
    icon: {
      svg: '/branding/wasl-islamic-icon-dark.svg',
      png: '/branding/wasl-islamic-icon-dark.png',
      webp: '/branding/wasl-islamic-icon-dark.webp',
    },
    card: {
      png: '/branding/og-image-dark.png',
    },
    favicon: {
      png: '/branding/favicon-dark.png',
    },
  },
};

/**
 * Helper to get the correct branding asset based on active theme
 */
export function getBrandAsset(
  theme: 'light' | 'dark',
  variant: 'full' | 'icon' = 'full',
  format: 'svg' | 'png' | 'webp' = 'svg'
): string {
  return branding[theme][variant][format];
}
