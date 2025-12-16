'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { ThemeMode, ThemePresetId, ThemeSettings } from '../model/types';
import { themePresets, defaultThemeSettings } from '../constants/theme-presets';
import { getStoredTheme, setStoredTheme } from './theme-storage';
import {
  applyTheme,
  resolveIsDark,
  watchSystemDarkMode,
} from './theme-applier';

interface ThemeContextValue {
  settings: ThemeSettings;
  isDark: boolean;
  setPreset: (presetId: ThemePresetId) => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [settings, setSettings] = useState<ThemeSettings>(defaultThemeSettings);
  const [isDark, setIsDark] = useState(false);

  // 初期化: localStorageから読み込み
  useEffect(() => {
    const stored = getStoredTheme();
    if (stored) {
      setSettings(stored);
    }
  }, []);

  // テーマ適用
  useEffect(() => {
    const preset = themePresets[settings.presetId];
    const dark = resolveIsDark(settings.mode);
    setIsDark(dark);
    applyTheme(preset, dark);
  }, [settings]);

  // システム設定の監視（mode === 'system' の場合）
  useEffect(() => {
    if (settings.mode !== 'system') return;

    const unwatch = watchSystemDarkMode((systemIsDark) => {
      const preset = themePresets[settings.presetId];
      setIsDark(systemIsDark);
      applyTheme(preset, systemIsDark);
    });

    return unwatch;
  }, [settings.mode, settings.presetId]);

  const setPreset = useCallback((presetId: ThemePresetId) => {
    setSettings((prev) => {
      const next = { ...prev, presetId };
      setStoredTheme(next);
      return next;
    });
  }, []);

  const setMode = useCallback((mode: ThemeMode) => {
    setSettings((prev) => {
      const next = { ...prev, mode };
      setStoredTheme(next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ settings, isDark, setPreset, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
