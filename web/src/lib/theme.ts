export const GAME_THEMES = ['amoled', 'midnight', 'graphite', 'paper'] as const;
export type GameTheme = typeof GAME_THEMES[number];
export const DEFAULT_THEME: GameTheme = 'amoled';
export function isGameTheme(value: unknown): value is GameTheme {
  return typeof value === 'string' && (GAME_THEMES as readonly string[]).includes(value);
}
