import type { GameTheme } from './theme';
import type { Character, SaveData, SaveSlot, SaveSlotId } from './types';
import { isValidWeeklyPlan } from './weekly-plan';

const KEY = 'my-life-simulator.save';
const SETTINGS_KEY = 'my-life-simulator.settings';
export const CURRENT_SCHEMA = 6;
const SLOT_IDS: SaveSlotId[] = ['slot-1', 'slot-2', 'slot-3'];
const emptySlots = (): SaveSlot[] => SLOT_IDS.map((id) => ({ id, character: null, updatedAt: null }));

function isCurrentCharacter(value: unknown): value is Character {
  if (!value || typeof value !== 'object') return false;
  const c = value as Partial<Character>;
  if (typeof c.name !== 'string' || !c.name.trim() || !Number.isInteger(c.age) || !Number.isInteger(c.year) ||
      !Number.isInteger(c.money) || !Array.isArray(c.history)) return false;
  if (!c.calendar || !/^\d{4}-\d{2}-\d{2}$/.test(c.calendar.currentDate) || !/^\d{4}-\d{2}-\d{2}$/.test(c.calendar.birthDate)) return false;
  if (![c.stamina, c.focus, c.confidence, c.discipline, c.creativity, c.socialSkills, c.stress].every((value) => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100)) return false;
  if (!isValidWeeklyPlan(c.weeklyPlan)) return false;
  if (c.ownedLifestyleItems !== undefined && (!Array.isArray(c.ownedLifestyleItems) || c.ownedLifestyleItems.some((item) => !item || typeof item.id !== 'string' || typeof item.productId !== 'string' || typeof item.name !== 'string' || !Number.isInteger(item.quantity) || item.quantity < 1 || !['usable', 'permanent'].includes(item.kind)))) return false;
  if (c.pendingGameEvent && (!Array.isArray(c.pendingGameEvent.choices) || c.pendingGameEvent.choices.some((choice) =>
    !Number.isFinite(choice.staminaCost) || choice.staminaCost < 0 || !Number.isFinite(choice.moneyCost) || choice.moneyCost < 0))) return false;
  return true;
}

function readData(): SaveData {
  const raw = localStorage.getItem(KEY);
  if (!raw) return { schemaVersion: CURRENT_SCHEMA, activeSlotId: 'slot-1', slots: emptySlots() };
  let parsed: unknown;
  try { parsed = JSON.parse(raw); }
  catch { throw new Error('The saved game data is unreadable. It has been left untouched.'); }
  if (!parsed || typeof parsed !== 'object') throw new Error('The saved game format is invalid. It has been left untouched.');
  const data = parsed as Partial<SaveData>;
  if (data.schemaVersion !== CURRENT_SCHEMA) {
    throw new Error('This save uses an older format and cannot be loaded by this version. Your saved data has been left untouched. Reset the old saves to start a new life.');
  }
  if (!SLOT_IDS.includes(data.activeSlotId as SaveSlotId) || !Array.isArray(data.slots) || data.slots.length !== SLOT_IDS.length) {
    throw new Error('The current save is incomplete or invalid. Your saved data has been left untouched.');
  }
  const slots = SLOT_IDS.map((id) => {
    const slot = data.slots!.find((item) => item?.id === id);
    if (!slot || (slot.character !== null && !isCurrentCharacter(slot.character)) ||
        (slot.updatedAt !== null && !Number.isFinite(slot.updatedAt))) {
      throw new Error('A save slot is invalid or uses an unsupported character format. Your saved data has been left untouched.');
    }
    return { id, character: slot.character, updatedAt: slot.updatedAt };
  });
  return { schemaVersion: CURRENT_SCHEMA, activeSlotId: data.activeSlotId as SaveSlotId, slots };
}
function writeData(data: SaveData): void { localStorage.setItem(KEY, JSON.stringify(data)); }
export function getSaveFormatIssue(): string | null {
  try { readData(); return null; } catch (error) { return error instanceof Error ? error.message : 'The saved game format is not supported.'; }
}
export function resetSaveData(): void { localStorage.removeItem(KEY); }
export function getSaveSlots(): SaveSlot[] {
  try { return readData().slots; } catch { return emptySlots(); }
}
export function getActiveSlotId(): SaveSlotId {
  try { return readData().activeSlotId; } catch { return 'slot-1'; }
}
export function setActiveSlotId(id: SaveSlotId): void {
  const data = readData(); data.activeSlotId = id; writeData(data);
}
export function loadSave(slotId: SaveSlotId = getActiveSlotId()): Character | null {
  try { return readData().slots.find((slot) => slot.id === slotId)?.character ?? null; }
  catch { return null; }
}
export function saveCharacter(character: Character, slotId: SaveSlotId = getActiveSlotId()): void {
  if (!isCurrentCharacter(character)) throw new Error('The character does not match the current save format.');
  const data = readData();
  data.slots = data.slots.map((slot) => slot.id === slotId ? { id: slotId, character, updatedAt: Date.now() } : slot);
  data.activeSlotId = slotId;
  writeData(data);
}
export function clearSave(slotId: SaveSlotId = getActiveSlotId()): void {
  const data = readData();
  data.slots = data.slots.map((slot) => slot.id === slotId ? { id: slotId, character: null, updatedAt: null } : slot);
  writeData(data);
}
type LocalGameSettings = { soundEnabled?: boolean; theme?: string };
function readSettings(): LocalGameSettings {
  try {
    const value = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') as unknown;
    return value && typeof value === 'object' ? value as LocalGameSettings : {};
  } catch { return {}; }
}
function writeSettings(patch: Partial<LocalGameSettings>): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...readSettings(), ...patch }));
}
export function getSoundEnabled(): boolean { return readSettings().soundEnabled !== false; }
export function setSoundEnabled(enabled: boolean): void { writeSettings({ soundEnabled: enabled }); }
export function getThemePreference(): GameTheme {
  const theme = readSettings().theme;
  return theme === 'midnight' || theme === 'graphite' || theme === 'paper' ? theme : 'amoled';
}
export function setThemePreference(theme: GameTheme): void { writeSettings({ theme }); }
