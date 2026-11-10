import { describe, expect, it } from 'vitest';
import { advanceWeek, generateRandomCharacter, getWeeklyActivityReview, planActivity, planCareActionInNextFreeTime } from './simulation';
import { addSocialConnection, getPassiveLifestyleActivities } from './lifestyle';
import type { Character } from './types';

function seededRandom(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function ageEighteenCharacter(seed: number) {
  return generateRandomCharacter(18, seededRandom(seed));
}

function householdSupported(character: Character): Character {
  const family = character.family!;
  const householdMemberIds = family.people.map((person) => person.id);
  return {
    ...character,
    familyCulture: 'supportive' as const,
    householdArrangement: 'family-supported' as const,
    family: { ...family, householdMemberIds }
  };
}

function independent(character: Character): Character {
  const family = character.family!;
  return {
    ...character,
    money: 20,
    stamina: 24,
    familyCulture: 'neglectful' as const,
    householdArrangement: 'independent' as const,
    family: { ...family, householdMemberIds: [family.playerPersonId] }
  };
}

function stronglySupported(character: Character): Character {
  let next = householdSupported(character);
  next = addSocialConnection(next, 'Partner', 'partner', true);
  next = {
    ...next,
    socialConnections: (next.socialConnections ?? []).map((connection) => ({
      ...connection,
      closeness: 82,
      supportLevel: 'strong' as const
    }))
  };
  return next;
}

describe('age-18 full-year simulation audit', () => {
  it.each([
    ['ordinary household', () => householdSupported(ageEighteenCharacter(1801))],
    ['resource pressure', () => independent(ageEighteenCharacter(1802))],
    ['strong household and partner support', () => stronglySupported(ageEighteenCharacter(1803))]
  ])('completes 52 weekly turns for an 18-year-old: %s', (_scenario, createInitialCharacter) => {
    let character: Character = createInitialCharacter();
    expect(character.age).toBe(18);

    let minimumStamina = character.stamina ?? 50;
    let maximumStamina = character.stamina ?? 50;
    let minimumCash = character.money;
    let plannedTurns = 0;
    let passiveActivityEntries = 0;

    for (let week = 0; week < 52; week += 1) {
      const weekStart = character.calendar!.currentDate;
      const review = getWeeklyActivityReview(character);
      expect(review.issue).toBeNull();

      const passiveIds = review.passiveActivities.map((activity) => activity.id);
      expect(new Set(passiveIds).size).toBe(passiveIds.length);
      passiveActivityEntries += review.passiveActivities.length;

      // Prefer exercise while the current budget can support it; otherwise schedule
      // recovery rather than allowing a low-stamina character to become stuck.
      let planned = character.stamina >= 30
        ? planActivity(character, 'exercise')
        : planCareActionInNextFreeTime(character, 'rest');
      if (planned.issue === 'insufficient-stamina') {
        planned = planCareActionInNextFreeTime(character, 'rest');
      }
      expect(planned.issue).toBeNull();
      character = planned.character;
      plannedTurns += character.weeklyPlan.activities.length;

      const result = advanceWeek(character);
      expect(result.issue).toBeNull();
      expect(result.character.lastResolvedWeekStart).toBe(weekStart);
      expect(result.character.calendar!.currentDate).not.toBe(weekStart);
      expect(result.character.weeklyPlan.activities).toHaveLength(0);
      expect(result.character.money).toBeGreaterThanOrEqual(0);

      const resolvedPassive = getPassiveLifestyleActivities(character);
      for (const activity of resolvedPassive) {
        const matchingRecaps = result.recap.filter((line) => line.startsWith(activity.title + ':'));
        expect(matchingRecaps).toHaveLength(1);
        if (activity.staminaRecovery > 0) {
          expect(matchingRecaps[0]).toContain('Stamina +' + activity.staminaRecovery);
        }
      }

      const duplicateInput = { ...character, lastResolvedWeekStart: review.weekStart };
      const duplicateGuard = advanceWeek(duplicateInput);
      expect(duplicateGuard.issue).toBe('already-resolved');
      expect(duplicateGuard.character).toBe(duplicateInput);

      character = result.character;
      expect(character.stamina).toBeGreaterThanOrEqual(0);
      expect(character.stamina).toBeLessThanOrEqual(100);
      for (const value of [character.health, character.happiness, character.fitness, character.discipline, character.stress]) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      }

      minimumStamina = Math.min(minimumStamina, character.stamina ?? 50);
      maximumStamina = Math.max(maximumStamina, character.stamina ?? 50);
      minimumCash = Math.min(minimumCash, character.money);
    }

    expect(plannedTurns).toBeGreaterThan(0);
    expect(passiveActivityEntries).toBeGreaterThan(0);
    expect(minimumStamina).toBeGreaterThanOrEqual(0);
    expect(maximumStamina).toBeLessThanOrEqual(100);
    expect(minimumCash).toBeGreaterThanOrEqual(0);
    // 52 weekly turns are 364 days; the generated birthday falls one day later.
    expect(character.age).toBe(18);
    expect(character.year).toBe(2027);

    const birthdayWeek = advanceWeek(character);
    expect(birthdayWeek.issue).toBeNull();
    expect(birthdayWeek.character.age).toBe(19);
    expect(birthdayWeek.character.year).toBe(2027);
  });
});
