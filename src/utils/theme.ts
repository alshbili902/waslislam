/**
 * Theme registry and sanitization utilities for Wasl Islamic.
 * Strictly supports 'light' and 'dark' themes.
 * Any legacy, deprecated, or removed theme (such as 'saudi') automatically falls back to 'light'.
 */

export type ThemeMode = 'light' | 'dark';

export const THEMES: readonly ThemeMode[] = ['light', 'dark'] as const;

export const DEFAULT_THEME: ThemeMode = 'light';

/**
 * Checks whether a given string is a currently valid theme.
 */
export function isThemeValid(theme: unknown): theme is ThemeMode {
  return typeof theme === 'string' && (theme === 'light' || theme === 'dark');
}

/**
 * Resolves a stored theme preference safely.
 * If a user previously selected an obsolete or removed theme (e.g. 'saudi', null, undefined, or invalid string),
 * this automatically and gracefully falls back to DEFAULT_THEME ('light').
 */
export function resolveSafeTheme(stored: unknown): ThemeMode {
  if (stored === 'dark') return 'dark';
  if (stored === 'light') return 'light';
  return DEFAULT_THEME;
}
