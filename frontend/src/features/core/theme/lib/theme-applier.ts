import type { ThemePreset, ThemeMode } from '../model/types';

/**
 * システムのダークモード設定を取得
 */
export function getSystemDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * 実際のダークモード状態を計算
 */
export function resolveIsDark(mode: ThemeMode): boolean {
  if (mode === 'system') {
    return getSystemDarkMode();
  }
  return mode === 'dark';
}

/**
 * テーマをDOMに適用
 */
export function applyTheme(preset: ThemePreset, isDark: boolean): void {
  const root = document.documentElement;
  const { colors } = preset;

  // Primary (モード別)
  root.style.setProperty(
    '--primary',
    isDark ? colors.primaryDark : colors.primaryLight,
  );

  // Ring (モード別)
  root.style.setProperty('--ring', isDark ? colors.ringDark : colors.ringLight);

  // Accent (モード別)
  root.style.setProperty(
    '--accent',
    isDark ? colors.accentDark : colors.accentLight,
  );

  // ダークモードクラス
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

/**
 * システムのダークモード変更を監視
 */
export function watchSystemDarkMode(
  callback: (isDark: boolean) => void,
): () => void {
  if (typeof window === 'undefined') return () => {};

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = (e: MediaQueryListEvent) => callback(e.matches);

  mediaQuery.addEventListener('change', handler);
  return () => mediaQuery.removeEventListener('change', handler);
}
