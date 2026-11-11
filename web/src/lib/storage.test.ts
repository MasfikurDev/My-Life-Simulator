import { afterEach, describe, expect, it, vi } from 'vitest';
import { createCharacter } from './simulation';
import { CURRENT_SCHEMA, clearSave, getSaveFormatIssue, getSaveSlots, getSoundEnabled, getThemePreference, loadSave, resetSaveData, saveCharacter, setActiveSlotId, setSoundEnabled, setThemePreference } from './storage';

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

describe('current save format', () => {
  it('starts with three empty slots under the current schema', () => {
    installStorage();
    expect(getSaveSlots().map((slot) => slot.id)).toEqual(['slot-1', 'slot-2', 'slot-3']);
    expect(getSaveSlots().every((slot) => slot.character === null)).toBe(true);
    expect(getSaveFormatIssue()).toBeNull();
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
    expect(getSaveFormatIssue()).toBeNull();
  });

  it('writes only the current schema and complete weekly plan shape', () => {
    const values = installStorage();
    const character = createCharacter('Current', 18);
    saveCharacter(character, 'slot-1');
    const data = JSON.parse(values.get('my-life-simulator.save') || '{}');
    expect(data.schemaVersion).toBe(CURRENT_SCHEMA);
    expect(data.slots[0].character.weeklyPlan).toEqual({ version: 1, activities: [] });
    expect(data.slots[0].character.weeklySchedule).toBeUndefined();
    expect(data.slots[0].character.weeklyPlan.commitments).toBeUndefined();
  });

  it('rejects old saves without migrating, mutating or overwriting them', () => {
    const values = installStorage();
    const old = JSON.stringify({ schemaVersion: 5, activeSlotId: 'slot-1', slots: [
      { id: 'slot-1', character: createCharacter('Old', 18), updatedAt: 1 },
      { id: 'slot-2', character: null, updatedAt: null },
      { id: 'slot-3', character: null, updatedAt: null }
    ] });
    values.set('my-life-simulator.save', old);
    expect(getSaveFormatIssue()).toContain('older format');
    expect(loadSave('slot-1')).toBeNull();
    expect(getSaveSlots().every((slot) => slot.character === null)).toBe(true);
    expect(() => saveCharacter(createCharacter('New', 18), 'slot-1')).toThrow('older format');
    expect(values.get('my-life-simulator.save')).toBe(old);
  });

  it('requires explicit reset before creating saves over an unsupported format', () => {
    const values = installStorage();
    values.set('my-life-simulator.save', JSON.stringify({ schemaVersion: 5 }));
    expect(getSaveFormatIssue()).not.toBeNull();
    resetSaveData();
    expect(values.has('my-life-simulator.save')).toBe(false);
    expect(getSaveFormatIssue()).toBeNull();
    saveCharacter(createCharacter('Fresh start', 18), 'slot-1');
    expect(loadSave('slot-1')?.name).toBe('Fresh start');
  });

  it('refuses to persist a character that fails current-schema validation', () => {
    const values = installStorage();
    const invalid = { ...createCharacter('Invalid', 18), weeklyPlan: { version: 1, activities: [{ id: 'bad', activityId: 'study' }] } } as never;
    expect(() => saveCharacter(invalid, 'slot-1')).toThrow('current save format');
    expect(values.has('my-life-simulator.save')).toBe(false);
  });

  it('rejects malformed current-schema characters instead of partially loading them', () => {
    const values = installStorage();
    values.set('my-life-simulator.save', JSON.stringify({ schemaVersion: CURRENT_SCHEMA, activeSlotId: 'slot-1', slots: [
      { id: 'slot-1', character: { name: 'Broken', age: 18, year: 2026, money: 10, history: [] }, updatedAt: 1 },
      { id: 'slot-2', character: null, updatedAt: null },
      { id: 'slot-3', character: null, updatedAt: null }
    ] }));
    expect(getSaveFormatIssue()).toContain('invalid or uses an unsupported character format');
    expect(loadSave('slot-1')).toBeNull();
  });
});

describe('local appearance and audio preferences', () => {
  it('defaults to AMOLED and keeps theme and sound preferences independent', () => {
    const values = installStorage();
    expect(getThemePreference()).toBe('amoled');
    expect(getSoundEnabled()).toBe(true);
    setThemePreference('paper');
    setSoundEnabled(false);
    expect(getThemePreference()).toBe('paper');
    expect(getSoundEnabled()).toBe(false);
    expect(JSON.parse(values.get('my-life-simulator.settings') || '{}')).toEqual({ theme: 'paper', soundEnabled: false });
  });
  it('restores every newly registered theme from local settings', () => {
    const values = installStorage();
    const themes = ['ocean', 'forest', 'lavender', 'sunset', 'rose'] as const;
    for (const theme of themes) {
      setThemePreference(theme);
      expect(getThemePreference()).toBe(theme);
    }
    expect(JSON.parse(values.get('my-life-simulator.settings') || '{}').theme).toBe('rose');
  });
  it('falls back to AMOLED for an unknown stored theme', () => {
    const values = installStorage();
    values.set('my-life-simulator.settings', JSON.stringify({ theme: 'unknown', soundEnabled: false }));
    expect(getThemePreference()).toBe('amoled');
    expect(getSoundEnabled()).toBe(false);
  });
});
