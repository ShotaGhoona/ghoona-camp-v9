/**
 * FOUC防止用の初期化スクリプト
 * layout.tsxの<head>内でインラインスクリプトとして実行される
 * Reactハイドレーション前にテーマを適用し、ちらつきを防止する
 */
export const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('ghoona-theme');
    var presets = {
      purple: { primaryLight: '256 29% 45%', primaryDark: '256 29% 35%', ringLight: '256 29% 45%', ringDark: '256 29% 35%', accentLight: '256 29% 95%', accentDark: '256 29% 20%' },
      red: { primaryLight: '350 55% 62%', primaryDark: '350 55% 45%', ringLight: '350 55% 62%', ringDark: '350 55% 45%', accentLight: '350 55% 95%', accentDark: '350 55% 20%' },
      yellow: { primaryLight: '44 55% 46%', primaryDark: '44 55% 35%', ringLight: '44 55% 46%', ringDark: '44 55% 35%', accentLight: '44 55% 95%', accentDark: '44 55% 20%' },
      blue: { primaryLight: '207 44% 45%', primaryDark: '207 44% 35%', ringLight: '207 44% 45%', ringDark: '207 44% 35%', accentLight: '207 44% 95%', accentDark: '207 44% 20%' },
      green: { primaryLight: '139 16% 49%', primaryDark: '139 16% 38%', ringLight: '139 16% 49%', ringDark: '139 16% 38%', accentLight: '139 16% 95%', accentDark: '139 16% 20%' }
    };
    var defaultPresetId = 'red';
    var defaultMode = 'system';

    var presetId = defaultPresetId;
    var mode = defaultMode;

    if (stored) {
      var parsed = JSON.parse(stored);
      presetId = parsed.presetId || defaultPresetId;
      mode = parsed.mode || defaultMode;
    }

    var preset = presets[presetId] || presets[defaultPresetId];
    var isDark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    document.documentElement.style.setProperty('--primary', isDark ? preset.primaryDark : preset.primaryLight);
    document.documentElement.style.setProperty('--ring', isDark ? preset.ringDark : preset.ringLight);
    document.documentElement.style.setProperty('--accent', isDark ? preset.accentDark : preset.accentLight);

    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
})();
`;
