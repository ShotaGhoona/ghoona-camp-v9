import { localStorage } from '@/shared/utils/storage/storage';
import type { ThemeSettings } from '../model/types';

const THEME_STORAGE_KEY = 'ghoona-theme';

export function getStoredTheme(): ThemeSettings | null {
  return localStorage?.get<ThemeSettings>(THEME_STORAGE_KEY) ?? null;
}

export function setStoredTheme(settings: ThemeSettings): void {
  localStorage?.set(THEME_STORAGE_KEY, settings);
}

export function removeStoredTheme(): void {
  localStorage?.remove(THEME_STORAGE_KEY);
}
