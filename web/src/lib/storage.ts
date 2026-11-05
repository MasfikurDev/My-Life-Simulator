import type { Character, SaveData } from './types';
const KEY = 'my-life-simulator.save';
const CURRENT_SCHEMA = 1;
export function loadSave(): Character | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    if (parsed.schemaVersion !== CURRENT_SCHEMA || !parsed.character) return null;
    const c = parsed.character as Character;
    if (typeof c.name !== 'string' || !Number.isInteger(c.age) || !Number.isInteger(c.year) || !Array.isArray(c.history)) return null;
    return c;
  } catch { return null; }
}
export function saveCharacter(character: Character): void {
  const data: SaveData = { schemaVersion: CURRENT_SCHEMA, character };
  localStorage.setItem(KEY, JSON.stringify(data));
}
export function clearSave(): void { localStorage.removeItem(KEY); }
