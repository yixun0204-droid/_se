export const DEFAULT_PREFERENCES = Object.freeze({
  theme: 'light',
  density: 'comfortable',
  showScores: true,
});

export const THEMES = ['light', 'dark'];
export const DENSITIES = ['comfortable', 'compact'];

export function sanitizePreferences(input = {}) {
  const theme = THEMES.includes(input.theme) ? input.theme : DEFAULT_PREFERENCES.theme;
  const density = DENSITIES.includes(input.density)
    ? input.density
    : DEFAULT_PREFERENCES.density;
  const showScores =
    typeof input.showScores === 'boolean'
      ? input.showScores
      : DEFAULT_PREFERENCES.showScores;

  return { theme, density, showScores };
}

export function parsePreferences(raw) {
  if (!raw) return { ...DEFAULT_PREFERENCES };
  try {
    return sanitizePreferences(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export function serializePreferences(preferences) {
  return JSON.stringify(sanitizePreferences(preferences));
}
