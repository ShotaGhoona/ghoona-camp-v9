import type { ThemePreset, ThemePresetId, ThemeSettings } from '../model/types';

export const themePresets: Record<ThemePresetId, ThemePreset> = {
  purple: {
    id: 'purple',
    name: 'Grape',
    hex: '#655395',
    colors: {
      primaryLight: '256 29% 45%', // #655395
      primaryDark: '256 29% 35%', // より暗め
      ringLight: '256 29% 45%',
      ringDark: '256 29% 35%',
      accentLight: '256 29% 95%',
      accentDark: '256 29% 20%',
    },
  },
  red: {
    id: 'red',
    name: 'Strawberry',
    hex: '#d5697e',
    colors: {
      primaryLight: '350 55% 62%', // #d5697e
      primaryDark: '350 55% 45%', // より暗め
      ringLight: '350 55% 62%',
      ringDark: '350 55% 45%',
      accentLight: '350 55% 95%',
      accentDark: '350 55% 20%',
    },
  },
  yellow: {
    id: 'yellow',
    name: 'Lemon',
    hex: '#b59235',
    colors: {
      primaryLight: '44 55% 46%', // #b59235
      primaryDark: '44 55% 35%', // より暗め
      ringLight: '44 55% 46%',
      ringDark: '44 55% 35%',
      accentLight: '44 55% 95%',
      accentDark: '44 55% 20%',
    },
  },
  blue: {
    id: 'blue',
    name: 'Soda',
    hex: '#3f77a4',
    colors: {
      primaryLight: '207 44% 45%', // #3f77a4
      primaryDark: '207 44% 35%', // より暗め
      ringLight: '207 44% 45%',
      ringDark: '207 44% 35%',
      accentLight: '207 44% 95%',
      accentDark: '207 44% 20%',
    },
  },
  green: {
    id: 'green',
    name: 'Melon',
    hex: '#698f75',
    colors: {
      primaryLight: '139 16% 49%', // #698f75
      primaryDark: '139 16% 38%', // より暗め
      ringLight: '139 16% 49%',
      ringDark: '139 16% 38%',
      accentLight: '139 16% 95%',
      accentDark: '139 16% 20%',
    },
  },
};

export const themePresetList = Object.values(themePresets);

export const defaultThemeSettings: ThemeSettings = {
  presetId: 'red',
  mode: 'system',
};
