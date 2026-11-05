import { afterEach, describe, expect, it, vi } from 'vitest';
import { createCharacter } from './simulation';
import { clearSave, getSaveSlots, loadSave, saveCharacter, setActiveSlotId } from './storage';

function installStorage() {
  const values = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key)
  });
  return values;
}
afterEach(() => vi.unstubAllGlobals());

describe('save slots', () => {
  it('starts with three empty slots', () => {
    installStorage();
    expect(getSaveSlots().map((slot) => slot.id)).toEqual(['slot-1', 'slot-2', 'slot-3']);
    expect(getSaveSlots().every((slot) => slot.character === null)).toBe(true);
  });
  it('saves, loads and clears only the selected slot', () => {
    installStorage();
    const first = createCharacter('First', 16);
    const second = createCharacter('Second', 40);
    saveCharacter(first, 'slot-1');
    saveCharacter(second, 'slot-2');
    setActiveSlotId('slot-2');
    expect(loadSave()).toEqual(second);
    clearSave('slot-2');
    expect(loadSave('slot-1')).toEqual(first);
    expect(loadSave('slot-2')).toBeNull();
  });
  it('migrates the previous single-save format without losing its character', () => {
    const values = installStorage();
    const character = createCharacter('Legacy');
    values.set('my-life-simulator.save', JSON.stringify({ schemaVersion: 1, character }));
    expect(loadSave('slot-1')).toEqual(character);
    expect(getSaveSlots()[0].character).toEqual(character);
    expect(JSON.parse(values.get('my-life-simulator.save') || '{}').schemaVersion).toBe(2);
  });
});
