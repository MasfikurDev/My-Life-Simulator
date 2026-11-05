import type { Character, SaveData, SaveSlot, SaveSlotId } from './types';

const KEY = 'my-life-simulator.save';
const SETTINGS_KEY = 'my-life-simulator.settings';
const CURRENT_SCHEMA = 2;
const SLOT_IDS: SaveSlotId[] = ['slot-1', 'slot-2', 'slot-3'];
const emptySlots = (): SaveSlot[] => SLOT_IDS.map((id) => ({ id, character: null, updatedAt: null }));
function validCharacter(value: unknown): value is Character {
  if (!value || typeof value !== 'object') return false;
  const c = value as Partial<Character>;
  return typeof c.name === 'string' && Number.isInteger(c.age) && Number.isInteger(c.year) &&
    Number.isInteger(c.money) && Array.isArray(c.history) && Number.isInteger(c.actionsRemaining);
}
function readData(): SaveData {
  const raw = localStorage.getItem(KEY);
  if (!raw) return { schemaVersion: CURRENT_SCHEMA, activeSlotId: 'slot-1', slots: emptySlots() };
  const parsed = JSON.parse(raw) as Partial<SaveData> & { character?: unknown };
  if (parsed.schemaVersion === 1 && validCharacter(parsed.character)) {
    const slots = emptySlots();
    slots[0] = { id: 'slot-1', character: parsed.character, updatedAt: Date.now() };
    const migrated: SaveData = { schemaVersion: CURRENT_SCHEMA, activeSlotId: 'slot-1', slots };
    localStorage.setItem(KEY, JSON.stringify(migrated));
    return migrated;
  }
  if (parsed.schemaVersion !== CURRENT_SCHEMA || !Array.isArray(parsed.slots)) {
    throw new Error('The saved game format is not recognized. Your existing data has been left untouched.');
  }
  const slots = emptySlots().map((empty) => {
    const found = parsed.slots?.find((slot) => slot?.id === empty.id);
    return found && validCharacter(found.character)
      ? { id: empty.id, character: found.character, updatedAt: Number.isFinite(found.updatedAt) ? found.updatedAt! : null }
      : empty;
  });
  const activeSlotId = SLOT_IDS.includes(parsed.activeSlotId as SaveSlotId) ? parsed.activeSlotId as SaveSlotId : 'slot-1';
  return { schemaVersion: CURRENT_SCHEMA, activeSlotId, slots };
}
function writeData(data: SaveData): void { localStorage.setItem(KEY, JSON.stringify(data)); }
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
export function getSoundEnabled(): boolean {
  try {
    const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') as { soundEnabled?: boolean };
    return settings.soundEnabled !== false;
  } catch { return true; }
}
export function setSoundEnabled(enabled: boolean): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ soundEnabled: enabled }));
}
