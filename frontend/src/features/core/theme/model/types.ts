/**
 * テーマ設定の型定義
 */

export type ThemeMode = 'light' | 'dark' | 'system';

export type ThemePresetId = 'purple' | 'red' | 'yellow' | 'blue' | 'green';

export interface ThemePresetColors {
  primaryLight: string; // Light mode用 primary (HSL値)
  primaryDark: string; // Dark mode用 primary (より暗め)
  ringLight: string; // Light mode用 ring
  ringDark: string; // Dark mode用 ring
  accentLight: string; // Light mode用 accent
  accentDark: string; // Dark mode用 accent
}

export interface ThemePreset {
  id: ThemePresetId;
  name: string;
  hex: string; // プレビュー用
  colors: ThemePresetColors;
}

export interface ThemeSettings {
  presetId: ThemePresetId;
  mode: ThemeMode;
}
