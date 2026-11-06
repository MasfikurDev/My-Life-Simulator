import { describe, expect, it } from 'vitest';
import { advanceYear, canAffordActivity, createCharacter, formatCharacterMoney, generateRandomCharacter, getActivityCost, performActivity } from './simulation';
import { getAvailableActivityIds, getLifeStage } from './progression';
import { createGameDebugSnapshot } from './debug-export';

describe('life simulation', () => {
  it('calculates age- and currency-scaled activity costs', () => {
    const adult = { ...createCharacter('Adult', 18), currencyScale: 100, money: 3500 };
    const child = { ...createCharacter('Child', 12), currencyScale: 100, money: 0 };
    expect(getActivityCost(adult, 'study')).toBe(3500);
    expect(getActivityCost(adult, 'socialize')).toBe(2000);
    expect(getActivityCost(child, 'study')).toBe(0);
    expect(canAffordActivity(adult, 'study')).toBe(true);
    expect(canAffordActivity({ ...adult, money: 3499 }, 'study')).toBe(false);
  });
  it('rejects paid activities when the balance is insufficient', () => {
    const adult = { ...createCharacter('Adult', 30), money: 10, currencyScale: 1 };
    const study = performActivity(adult, 'study');
    const social = performActivity(adult, 'socialize');
    expect(study).toBe(adult);
    expect(social).toBe(adult);
    expect(adult.actionsRemaining).toBe(3);
  });
  it('charges the exact cost when a paid activity is affordable', () => {
    const adult = { ...createCharacter('Adult', 30), money: 35, currencyScale: 1 };
    const next = performActivity(adult, 'study');
    expect(next.money).toBe(0);
    expect(next.actionsRemaining).toBe(2);
    expect(next.intelligence).toBe(adult.intelligence + 5);
  });
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
  it('unlocks school stages, part-time work and adult jobs at the right ages', () => {
    expect(performActivity(createCharacter('Child', 15), 'apply-job', () => 0).employment).toBeNull();
    const teen = { ...createCharacter('Teen', 16), currencyScale: 1 };
    const partTime = performActivity(teen, 'apply-job', () => 0);
    expect(partTime.employment?.type).toBe('part-time');
    expect(partTime.employment?.annualSalary).toBe(5000);
    expect(getAvailableActivityIds(16, partTime.employment)).toContain('career');
    expect(getAvailableActivityIds(16, partTime.employment)).not.toContain('apply-job');
    const adult = { ...createCharacter('Adult', 18), currencyScale: 1 };
    const fullTime = performActivity(adult, 'apply-job', () => 0);
    expect(fullTime.employment?.type).toBe('full-time');
    expect(fullTime.employment?.annualSalary).toBe(18000);
    expect(getAvailableActivityIds(18, fullTime.employment)).toContain('apply-job');
  });
  it('allows higher education to unlock a better-qualified role', () => {
    const learner = { ...createCharacter('Learner', 18), education: 'Secondary education completed', educationProgress: 80, currencyScale: 1, money: 1000 };
    const graduate = performActivity(learner, 'study');
    expect(graduate.education).toBe('Higher education');
    expect(graduate.educationProgress).toBe(0);
    const hired = performActivity(graduate, 'apply-job', () => 0);
    expect(hired.employment?.title).toBe('Professional associate');
    expect(hired.employment?.annualSalary).toBe(28000);
  });
  it('credits annual salary and living costs when the year advances', () => {
    const worker = {
      ...createCharacter('Worker', 30),
      money: 100,
      employment: { title: 'Operations associate', type: 'full-time' as const, annualSalary: 10000, experienceYears: 0, performance: 60, promotions: 0, startedAtAge: 30 }
    };
    const next = advanceYear(worker);
    expect(next.money).toBe(4600);
    expect(next.lastYearIncome).toBe(10000);
    expect(next.lastYearExpenses).toBe(5500);
    expect(next.history.some((item) => item.title === 'Annual pay received')).toBe(true);
  });
  it('promotes experienced employees after sustained high performance', () => {
    const worker = {
      ...createCharacter('Worker', 30),
      employment: { title: 'Operations associate', type: 'full-time' as const, annualSalary: 10000, experienceYears: 1, performance: 90, promotions: 0, startedAtAge: 30 }
    };
    const next = advanceYear(worker);
    expect(next.employment?.title).toBe('Senior Operations associate');
    expect(next.employment?.annualSalary).toBe(12000);
    expect(next.employment?.promotions).toBe(1);
    expect(next.history.some((item) => item.title === 'Promoted at work')).toBe(true);
  });
  it('improves job performance through career development', () => {
    const worker = {
      ...createCharacter('Worker', 30),
      employment: { title: 'Operations associate', type: 'full-time' as const, annualSalary: 10000, experienceYears: 0, performance: 60, promotions: 0, startedAtAge: 30 }
    };
    const next = performActivity(worker, 'career');
    expect(next.employment?.performance).toBe(72);
    expect(next.actionsRemaining).toBe(2);
  });
  it('updates education status when a character crosses school-age boundaries', () => {
    expect(advanceYear(createCharacter('Child', 5)).education).toBe('Primary education');
    expect(advanceYear(createCharacter('Teen', 12)).education).toBe('Secondary education');
    expect(advanceYear(createCharacter('Teen', 17)).education).toBe('Secondary education completed');
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
