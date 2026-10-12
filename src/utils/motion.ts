/**
 * Wasl Islamic (منصة وصل الإسلامية) - Motion Design System Tokens & Utilities
 * Provides unified timing, easing curves, hardware-accelerated presets,
 * smooth scrolling helpers, and reduced-motion accessibility guards.
 */

export const MOTION_DURATIONS = {
  instant: 120, // Mobile tap / toggle response
  fast: 220,    // Dropdowns, tooltips, icon hover
  normal: 340,  // Card reveals, modal dialogs, tab transitions
  cinematic: 480 // Signature emerald sweep, hero entrances
} as const;

export const MOTION_EASINGS = {
  // Fluid, polished deceleration curve for natural organic movement
  easeOutExpo: 'cubic-bezier(0.16, 1, 0.3, 1)',
  // Subtle bouncy tactile curve for buttons and interactive press
  springTactile: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  // Smooth symmetrical curve for fades and color shifts
  easeInOutSmooth: 'cubic-bezier(0.65, 0, 0.35, 1)',
  // Snappy deceleration for menus and popovers
  easeOutBack: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
} as const;

/**
 * Checks if the user has requested reduced motion either via OS preference
 * or through the app's internal accessibility settings.
 */
export function isReducedMotionPreferred(): boolean {
  if (typeof window === 'undefined') return false;
  
  // 1. Check OS / browser system preference
  const mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  if (mediaQuery?.matches) return true;

  // 2. Check DOM class set by accessibilityManager
  if (document.documentElement.classList.contains('reduced-motion') ||
      document.body.classList.contains('reduced-motion')) {
    return true;
  }

  return false;
}

/**
 * Smoothly scrolls to an element by ID or element reference,
 * taking into account sticky navigation bars and header heights.
 */
export function smoothScrollTo(target: string | HTMLElement, offset: number = 80): void {
  if (typeof window === 'undefined') return;

  const element = typeof target === 'string' ? document.getElementById(target) : target;
  if (!element) return;

  const reduced = isReducedMotionPreferred();
  const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
  const targetY = Math.max(0, elementPosition - offset);

  window.scrollTo({
    top: targetY,
    behavior: reduced ? 'auto' : 'smooth'
  });
}

/**
 * Computes a staggered delay string (in ms or seconds) for grid items.
 */
export function getStaggerDelay(index: number, baseMs: number = 45, maxMs: number = 400): string {
  const delay = Math.min(index * baseMs, maxMs);
  return `${delay}ms`;
}
