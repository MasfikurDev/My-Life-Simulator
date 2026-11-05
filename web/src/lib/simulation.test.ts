import { describe, expect, it } from 'vitest';
import { advanceYear, createCharacter, formatCharacterMoney, generateRandomCharacter, performActivity } from './simulation';
import { getAvailableActivityIds, getLifeStage } from './progression';
import { createGameDebugSnapshot } from './debug-export';

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
  it('maps each age into a gradual life stage', () => {
    expect(getLifeStage(0).id).toBe('infant'); expect(getLifeStage(3).id).toBe('preschool');
    expect(getLifeStage(6).id).toBe('childhood'); expect(getLifeStage(13).id).toBe('early-teen');
    expect(getLifeStage(16).id).toBe('older-teen'); expect(getLifeStage(18).id).toBe('young-adult');
    expect(getLifeStage(25).id).toBe('adult'); expect(getLifeStage(45).id).toBe('midlife'); expect(getLifeStage(65).id).toBe('senior');
  });
  it('enforces activity age gates in the catalogue and simulation', () => {
    expect(getAvailableActivityIds(2)).toEqual(['exercise', 'socialize']);
    expect(getAvailableActivityIds(15)).not.toContain('work'); expect(getAvailableActivityIds(16)).toContain('work');
    const toddler = createCharacter('Sam', 2);
    expect(performActivity(toddler, 'study')).toBe(toddler); expect(performActivity(toddler, 'work')).toBe(toddler);
  });
  it('creates a portable debug snapshot with full gameplay history', () => {
    const character = createCharacter('Sam', 18);
    const snapshot = createGameDebugSnapshot(character, 'slot-2', new Date('2026-11-06T00:00:00.000Z'));
    expect(snapshot.format).toBe('my-life-simulator-debug'); expect(snapshot.saveSlotId).toBe('slot-2');
    expect(snapshot.character.history).toEqual(character.history); expect(snapshot).not.toHaveProperty('deviceId');
  });
  it('generates a coherent identity and matching currency from the same country profile', () => {
    const c = generateRandomCharacter(18, () => 0);
    expect(c.nationality).toBe('Bangladeshi'); expect(c.country).toBe('Bangladesh');
    expect(c.birthplace).toBe('Dhaka'); expect(c.currency).toBe('BDT');
    expect(c.name).toBe('Adnan Ahmed'); expect(c.gender).toBe('male');
  });
  it('uses local family-name order and language for Japanese characters', () => {
    const values = Array(48).fill(0); values[0] = 0.66;
    const c = generateRandomCharacter(18, () => values.shift() ?? 0);
    expect(c.nationality).toBe('Japanese');
    expect(c.country).toBe('Japan');
    expect(c.birthplace).toBe('Tokyo');
    expect(c.language).toBe('Japanese');
    expect(c.name).toBe('Aoki Akira');
    expect(c.currency).toBe('JPY');
  });
  it('uses non-binary name pools without changing ability distributions', () => {
    const values = [0, 0.99, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let i = 0; const c = generateRandomCharacter(18, () => values[i++ % values.length]);
    expect(c.gender).toBe('non-binary'); expect(c.name).toBe('Ari Ahmed'); expect(c.personality).toHaveLength(2);
    for (const key of ['health','happiness','intelligence','fitness'] as const) expect(c[key]).toBeGreaterThanOrEqual(25);
  });
  it('does not derive ability or personality from gender identity', () => {
    const maleValues = Array(48).fill(0);
    const neutralValues = Array(48).fill(0); neutralValues[1] = 0.99;
    const male = generateRandomCharacter(30, () => maleValues.shift() ?? 0);
    const nonBinary = generateRandomCharacter(30, () => neutralValues.shift() ?? 0);
    expect(male.gender).toBe('male'); expect(nonBinary.gender).toBe('non-binary');
    expect([nonBinary.health, nonBinary.happiness, nonBinary.intelligence, nonBinary.fitness, nonBinary.personality])
      .toEqual([male.health, male.happiness, male.intelligence, male.fitness, male.personality]);
  });
  it('does not derive ability or personality from nationality', () => {
    const localValues = Array(48).fill(0);
    const otherCountryValues = Array(48).fill(0); otherCountryValues[0] = 0.99;
    const local = generateRandomCharacter(30, () => localValues.shift() ?? 0);
    const otherCountry = generateRandomCharacter(30, () => otherCountryValues.shift() ?? 0);
    expect(local.nationality).not.toBe(otherCountry.nationality);
    expect([otherCountry.health, otherCountry.happiness, otherCountry.intelligence, otherCountry.fitness, otherCountry.personality])
      .toEqual([local.health, local.happiness, local.intelligence, local.fitness, local.personality]);
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
