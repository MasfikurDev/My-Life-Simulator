import { describe, expect, it } from 'vitest';
import { createGameDebugSnapshot } from './debug-export';
import type { Character } from './types';

const character: Character = {
  name: 'Alex', age: 25, year: 2026, health: 90, happiness: 75,
  intelligence: 80, fitness: 70, money: 1200,
  calendar: { currentDate: '2026-11-02', birthDate: '2001-11-02' },
  weeklyPlan: { version: 1, activities: [] },
  history: [{ id: 'start', year: 2001, age: 0, title: 'Born', description: 'A new life begins.', kind: 'milestone' }]
};

describe('gameplay debug snapshot', () => {
  it('creates a portable independent copy without relying on structuredClone', () => {
    const originalStructuredClone = globalThis.structuredClone;
    try {
      Object.defineProperty(globalThis, 'structuredClone', { configurable: true, value: undefined });
      const snapshot = createGameDebugSnapshot(character, 'slot-2', new Date('2026-11-06T00:00:00.000Z'));
      expect(snapshot.format).toBe('my-life-simulator-debug');
      expect(snapshot.formatVersion).toBe(2);
      expect(snapshot.saveSlotId).toBe('slot-2');
      expect(snapshot.exportedAt).toBe('2026-11-06T00:00:00.000Z');
      expect(snapshot.character).toEqual(character);
      expect(snapshot.character).not.toBe(character);
      expect(snapshot.character.history).not.toBe(character.history);
    } finally {
      Object.defineProperty(globalThis, 'structuredClone', { configurable: true, value: originalStructuredClone });
    }
  });
});
