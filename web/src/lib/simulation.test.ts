import { describe, expect, it } from 'vitest';
import { advanceYear, createCharacter, formatCharacterMoney, generateRandomCharacter, performActivity } from './simulation';

describe('life simulation', () => {
  it('creates a character with a starting history', () => {
    const c = createCharacter('Sam');
    expect(c.name).toBe('Sam'); expect(c.age).toBe(18); expect(c.actionsRemaining).toBe(3);
    expect(c.history).toHaveLength(1);
  });
  it('supports birth, teen, adult and later-life starts', () => {
    expect(createCharacter('Newborn', 0).age).toBe(0);
    expect(createCharacter('Teen', 16).money).toBeGreaterThan(0);
    expect(createCharacter('Older', 60).age).toBe(60);
    expect(createCharacter('Older', 60).money).toBeGreaterThan(0);
  });
  it('keeps paid work unavailable before age 16', () => {
    const child = createCharacter('Sam', 10);
    expect(performActivity(child, 'work')).toBe(child);
    expect(performActivity(child, 'study').money).toBe(0);
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
  it('generates a coherent identity and matching currency from the same country profile', () => {
    const c = generateRandomCharacter(18, () => 0);
    expect(c.nationality).toBe('Bangladeshi'); expect(c.country).toBe('Bangladesh');
    expect(c.birthplace).toBe('Dhaka'); expect(c.currency).toBe('BDT');
    expect(c.name).toBe('Aarav Ahmed'); expect(c.gender).toBe('male');
  });
  it('uses non-binary name pools without changing ability distributions', () => {
    const values = [0, 0, 0.99, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let i = 0; const c = generateRandomCharacter(18, () => values[i++ % values.length]);
    expect(c.gender).toBe('non-binary'); expect(c.name).toBe('Ari Ahmed'); expect(c.personality).toHaveLength(2);
    for (const key of ['health','happiness','intelligence','fitness'] as const) expect(c[key]).toBeGreaterThanOrEqual(25);
  });
  it('keeps children without personal money and scales money with local currency', () => {
    const child = generateRandomCharacter(6, () => 0);
    expect(child.money).toBe(0); expect(child.currency).toBe('BDT');
    const adult = generateRandomCharacter(30, () => 0);
    expect(adult.money).toBeGreaterThan(850);
  });
  it('formats each character using their own currency', () => {
    const c = { ...generateRandomCharacter(18, () => 0), money: 1000 };
    expect(formatCharacterMoney(c)).toContain('৳');
  });
});
