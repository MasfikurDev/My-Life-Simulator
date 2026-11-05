import { describe, expect, it } from 'vitest';
import { advanceYear, createCharacter, performActivity } from './simulation';

describe('life simulation', () => {
  it('creates a character with a starting history', () => {
    const c = createCharacter('Sam');
    expect(c.name).toBe('Sam'); expect(c.age).toBe(18); expect(c.actionsRemaining).toBe(3);
    expect(c.history).toHaveLength(1);
  });
  it('applies activity effects and consumes an action', () => {
    const c = createCharacter('Sam'); const next = performActivity(c, 'exercise');
    expect(next.fitness).toBe(c.fitness + 6); expect(next.actionsRemaining).toBe(2);
  });
  it('blocks activities when the yearly budget is empty', () => {
    const c = { ...createCharacter('Sam'), actionsRemaining: 0 };
    expect(performActivity(c, 'work')).toBe(c);
  });
  it('advances age and refreshes actions only when requested', () => {
    const next = advanceYear(createCharacter('Sam'));
    expect(next.age).toBe(19); expect(next.year).toBe(2027); expect(next.actionsRemaining).toBe(3);
  });
});
