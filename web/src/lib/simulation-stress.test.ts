import { describe, expect, it } from 'vitest';
import { generateRandomCharacter, advanceWeek, planActivityInNextFreeTime } from './simulation';
import type { Character } from './types';

const DAYS_PER_WEEK = 7;
const WEEKS_PER_YEAR = 52;
const boundedStats = ['health', 'happiness', 'intelligence', 'fitness', 'stamina', 'focus', 'confidence', 'discipline', 'creativity', 'socialSkills', 'stress', 'comfort'] as const;

function addDays(date: string, days: number): string {
  const value = new Date(date + 'T00:00:00.000Z');
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function createAuditCharacter(age: number, employed = false): Character {
  const generated = generateRandomCharacter(age, () => 0.5);
  const birthYear = 2026 - age;
  return {
    ...generated,
    age,
    year: 2026,
    calendar: { currentDate: '2026-01-05', birthDate: birthYear + '-01-05' },
    weeklyPlan: { version: 1, activities: [] },
    pendingGameEvent: undefined,
    scheduledConsequences: [],
    familyCulture: 'neglectful',
    money: 50_000,
    currencyScale: 1,
    employment: employed ? {
      title: 'Operations assistant',
      type: 'full-time',
      annualSalary: 18_000,
      experienceYears: 1,
      performance: 60,
      promotions: 0,
      startedAtAge: age,
      roleId: 'operations-assistant',
      careerPathId: 'operations',
      employer: 'Simulation audit employer',
      level: 1,
      startedAtDate: '2026-01-05'
    } : null
  };
}

function runWeeks(start: Character, count: number): Character {
  let current = structuredClone(start);
  for (let week = 0; week < count; week += 1) {
    const previousDate = current.calendar!.currentDate;
    const result = advanceWeek(current, () => 0.5);
    expect(result.issue, 'week ' + (week + 1) + ' should resolve').toBeNull();
    expect(result.character.calendar!.currentDate).toBe(addDays(previousDate, DAYS_PER_WEEK));
    expect(result.character.weeklyPlan.activities).toHaveLength(0);
    expect(result.character.money).toBeGreaterThanOrEqual(0);
    expect(result.character.year).toBe(Number(result.character.calendar!.currentDate.slice(0, 4)));
    for (const stat of boundedStats) {
      const value = result.character[stat];
      expect(Number.isFinite(value), stat + ' must remain finite').toBe(true);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    }
    current = result.character;
  }
  return current;
}

describe('long-running gameplay simulation audit', () => {
  it('keeps a working adult stable through a full 52-week year and replays deterministically', () => {
    const start = createAuditCharacter(30, true);
    const first = runWeeks(start, WEEKS_PER_YEAR);
    const replay = runWeeks(start, WEEKS_PER_YEAR);

    expect(first).toEqual(replay);
    expect(first.calendar?.currentDate).toBe('2027-01-04');
    expect(first.year).toBe(2027);
    expect(first.age).toBe(30);
    expect(first.money).toBeGreaterThanOrEqual(0);
    expect(first.financialTransactions?.filter((entry) => entry.type === 'income')).toHaveLength(1);
  });

  it('handles a young adult reaching the adult life stage on the correct birthday', () => {
    const start = createAuditCharacter(17);
    const afterYear = runWeeks(start, WEEKS_PER_YEAR);
    expect(afterYear.age).toBe(17);
    const afterBirthday = runWeeks(start, WEEKS_PER_YEAR + 1);
    expect(afterBirthday.age).toBe(18);
    expect(afterBirthday.householdArrangement).toBe('family-supported');
    expect(afterBirthday.history.some((entry) => entry.title === 'Adult opportunities unlocked')).toBe(true);
  });

  it('keeps a child and an older adult within valid stat and money bounds over a year', () => {
    const child = runWeeks(createAuditCharacter(10), WEEKS_PER_YEAR);
    const olderAdult = runWeeks(createAuditCharacter(70), WEEKS_PER_YEAR);
    expect(child.age).toBe(10);
    expect(olderAdult.age).toBe(70);
    expect(child.money).toBeGreaterThanOrEqual(0);
    expect(olderAdult.money).toBeGreaterThanOrEqual(0);
  });

  it('resolves a planned action through the same weekly simulation path', () => {
    const start = createAuditCharacter(30);
    const planned = planActivityInNextFreeTime(start, 'exercise');
    expect(planned.issue).toBeNull();
    const result = advanceWeek(planned.character, () => 0.5);
    expect(result.issue).toBeNull();
    expect(result.character.weeklyPlan.activities).toHaveLength(0);
    expect(result.character.calendar?.currentDate).toBe('2026-01-12');
    expect(result.character.money).toBeLessThan(start.money);
  });
});
