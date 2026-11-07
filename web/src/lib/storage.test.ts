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
  it('migrates existing multi-slot saves and preserves every character', () => {
    const values = installStorage();
    const first = createCharacter('First', 22);
    const second = createCharacter('Second', 40);
    values.set('my-life-simulator.save', JSON.stringify({ schemaVersion: 2, activeSlotId: 'slot-2', slots: [
      { id: 'slot-1', character: first, updatedAt: 1 },
      { id: 'slot-2', character: second, updatedAt: 2 },
      { id: 'slot-3', character: null, updatedAt: null }
    ] }));
    expect(loadSave('slot-1')?.name).toBe('First');
    expect(loadSave('slot-2')?.name).toBe('Second');
    expect(loadSave('slot-1')?.calendar).toBeDefined();
    expect(JSON.parse(values.get('my-life-simulator.save') || '{}').schemaVersion).toBe(4);
  });
  it('migrates schema 3 employed saves to recurring Work commitments', () => {
    const values = installStorage();
    const worker = {
      ...createCharacter('Existing worker', 30),
      employment: {
        title: 'Operations assistant',
        roleId: 'operations-assistant',
        type: 'full-time' as const,
        annualSalary: 18000,
        experienceYears: 2,
        performance: 70,
        promotions: 0,
        startedAtAge: 28,
        employer: 'Northstar Services'
      }
    };
    values.set('my-life-simulator.save', JSON.stringify({
      schemaVersion: 3,
      activeSlotId: 'slot-1',
      slots: [
        { id: 'slot-1', character: worker, updatedAt: 1 },
        { id: 'slot-2', character: null, updatedAt: null },
        { id: 'slot-3', character: null, updatedAt: null }
      ]
    }));
    const migrated = loadSave('slot-1')!;
    expect(migrated.weeklySchedule?.commitments.filter((item) => item.domain === 'work')).toHaveLength(5);
    expect(JSON.parse(values.get('my-life-simulator.save') || '{}').schemaVersion).toBe(4);
    expect(values.get('my-life-simulator.save.pre-weekly-migration')).toBeTruthy();
  });
  it('migrates pending event action costs into weekly time blocks', () => {
    const values = installStorage();
    const character = createCharacter('Legacy event', 12);
    const legacyCharacter = JSON.parse(JSON.stringify(character));
    legacyCharacter.actionsRemaining = 2;
    legacyCharacter.pendingGameEvent.choices = legacyCharacter.pendingGameEvent.choices.map((choice: { timeBlocks?: number; [key: string]: unknown }) => {
      const { timeBlocks, ...legacyChoice } = choice;
      return { ...legacyChoice, actionCost: timeBlocks };
    });
    values.set('my-life-simulator.save', JSON.stringify({ schemaVersion: 1, character: legacyCharacter }));
    const migrated = loadSave('slot-1')!;
    expect(migrated.pendingGameEvent?.choices[0].timeBlocks).toBe(1);
    expect('actionCost' in migrated.pendingGameEvent!.choices[0]).toBe(false);
  });
  it('keeps the original save payload as a recovery copy before migration', () => {
    const values = installStorage();
    const character = createCharacter('Recovery');
    const legacy = JSON.stringify({ schemaVersion: 1, character });
    values.set('my-life-simulator.save', legacy);
    loadSave('slot-1');
    expect(values.get('my-life-simulator.save.pre-weekly-migration')).toBe(legacy);
    expect(JSON.parse(values.get('my-life-simulator.save') || '{}').schemaVersion).toBe(4);
  });
  it('migrates the previous single-save format to the weekly calendar without losing its character', () => {
    const values = installStorage();
    const character = createCharacter('Legacy');
    values.set('my-life-simulator.save', JSON.stringify({ schemaVersion: 1, character }));
    expect(loadSave('slot-1')).toEqual(character);
    expect(getSaveSlots()[0].character).toEqual(character);
    expect(JSON.parse(values.get('my-life-simulator.save') || '{}').schemaVersion).toBe(4);
    expect(loadSave('slot-1')?.calendar).toBeDefined();
    expect('actionsRemaining' in (loadSave('slot-1') ?? {})).toBe(false);
  });
});
