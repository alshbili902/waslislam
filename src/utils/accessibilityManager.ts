/**
 * Wasl Islamic (وصل الإسلامية) - Accessibility and Senior-Friendly Mode Manager.
 * Handles senior-friendly preferences, typography scaling, high contrast tokens,
 * simplified navigation preferences, and DOM class synchronization.
 */

import { localStore } from '../lib/supabase.ts';

export interface AccessibilitySettings {
  isSeniorMode: boolean;
  fontSizeScale: number; // 1.0 (default), 1.25, 1.5
  isHighContrast: boolean;
  isSimplifiedNav: boolean;
  isReducedMotion: boolean;
}

export const DEFAULT_SETTINGS: AccessibilitySettings = {
  isSeniorMode: false,
  fontSizeScale: 1.0,
  isHighContrast: false,
  isSimplifiedNav: true,
  isReducedMotion: false
};

export const accessibilityManager = {
  getSettings(): AccessibilitySettings {
    return localStore.get<AccessibilitySettings>('accessibility_settings', DEFAULT_SETTINGS);
  },

  updateSettings(partial: Partial<AccessibilitySettings>): AccessibilitySettings {
    const current = this.getSettings();
    const updated = { ...current, ...partial };
    localStore.set('accessibility_settings', updated);
    this.applyToDOM(updated);
    return updated;
  },

  toggleSeniorMode(): boolean {
    const current = this.getSettings();
    const nextState = !current.isSeniorMode;
    this.updateSettings({
      isSeniorMode: nextState,
      fontSizeScale: nextState ? 1.3 : 1.0,
      isHighContrast: nextState,
      isSimplifiedNav: nextState
    });
    return nextState;
  },

  resetDefaults(): AccessibilitySettings {
    localStore.set('accessibility_settings', DEFAULT_SETTINGS);
    this.applyToDOM(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  },

  applyToDOM(settings?: AccessibilitySettings): void {
    if (typeof document === 'undefined') return;
    const s = settings || this.getSettings();

    const root = document.documentElement;
    if (s.isSeniorMode) {
      root.classList.add('senior-mode');
      root.style.setProperty('--font-scale', `${s.fontSizeScale}`);
    } else {
      root.classList.remove('senior-mode');
      root.style.removeProperty('--font-scale');
    }

    if (s.isHighContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (s.isReducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
  }
};
