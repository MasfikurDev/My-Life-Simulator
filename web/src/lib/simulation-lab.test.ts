import { describe, expect, it } from 'vitest';
import type { Character } from './types';
import {
  advanceWeek,
  generateRandomCharacter,
  getWeeklyActivityReview,
  planActivityInNextFreeTime,
  planCareActionInNextFreeTime,
  planEducationTaskInNextFreeTime
} from './simulation';
import { enrollInEducation } from './education';

type Goal = {
  id: string;
  description: string;
  reached: (character: Character) => boolean;
};

type WeeklyStrategy = (character: Character, week: number) => Character;

type Scenario = {
  id: string;
  seed: number;
  weeks: number;
  initial: Character;
  goal: Goal;
  strategy: WeeklyStrategy;
};

type ScenarioReport = {
  scenario: string;
  goal: string;
  goalReached: boolean;
  goalReachedWeek: number | null;
  survived: boolean;
  weeksCompleted: number;
  actionsPlanned: number;
  restWeeks: number;
  blockedWeeks: number;
  minimum: { health: number; happiness: number; stamina: number; cash: number };
  maximumStress: number;
  final: { age: number; health: number; happiness: number; stamina: number; stress: number; cash: number };
  failure: string | null;
};

function seededRandom(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function mustPlan(character: Character, result: { character: Character; issue: string | null; message?: string | null }): Character {
  if (result.issue) throw new Error('Strategy could not plan an action: ' + (result.message ?? result.issue));
  return result.character;
}

/** Normalize only the starting resources needed to compare strategies; retain generated identity and family. */
function preparedAdult(seed: number): Character {
  const generated = generateRandomCharacter(18, seededRandom(seed));
  return {
    ...generated,
    money: 5000,
    currencyScale: 1,
    // Keep generated wellbeing, stamina, stress, family culture and personality varied.
    // Normalize only currency so scenarios compare strategies rather than exchange-rate scale.
    intelligence: Math.max(generated.intelligence, 45),
    focus: Math.max(generated.focus, 40),
    discipline: Math.max(generated.discipline, 40),
    householdArrangement: 'family-supported',
    family: generated.family
      ? { ...generated.family, householdMemberIds: generated.family.people.map((person) => person.id) }
      : generated.family
  };
}

function runScenario(scenario: Scenario): ScenarioReport {
  let character = scenario.initial;
  let goalReachedWeek: number | null = scenario.goal.reached(character) ? 0 : null;
  let actionsPlanned = 0;
  let restWeeks = 0;
  let blockedWeeks = 0;
  let failure: string | null = null;
  const minimum = {
    health: character.health,
    happiness: character.happiness,
    stamina: character.stamina,
    cash: character.money
  };
  let maximumStress = character.stress;

  for (let week = 0; week < scenario.weeks; week += 1) {
    const weekStart = character.calendar.currentDate;
    const planned = scenario.strategy(character, week);
    const review = getWeeklyActivityReview(planned);
    if (review.issue) {
      blockedWeeks += 1;
      failure = 'Weekly plan invalid: ' + review.issue;
      break;
    }

    const actions = planned.weeklyPlan.activities;
    actionsPlanned += actions.length;
    if (actions.some((item) => item.action?.kind === 'care' && item.action.careType === 'rest')) restWeeks += 1;

    const result = advanceWeek(planned, seededRandom(scenario.seed + week + 10000));
    if (result.issue) {
      blockedWeeks += 1;
      failure = 'Could not advance week ' + (week + 1) + ': ' + result.issue;
      break;
    }

    character = result.character;
    expect(character.lastResolvedWeekStart).toBe(weekStart);
    expect(character.weeklyPlan.activities).toHaveLength(0);
    expect(character.stamina).toBeGreaterThanOrEqual(0);
    expect(character.stamina).toBeLessThanOrEqual(100);
    for (const value of [character.health, character.happiness, character.fitness, character.discipline, character.stress]) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    }
    expect(character.money).toBeGreaterThanOrEqual(0);

    minimum.health = Math.min(minimum.health, character.health);
    minimum.happiness = Math.min(minimum.happiness, character.happiness);
    minimum.stamina = Math.min(minimum.stamina, character.stamina);
    minimum.cash = Math.min(minimum.cash, character.money);
    maximumStress = Math.max(maximumStress, character.stress);

    if (goalReachedWeek === null && scenario.goal.reached(character)) goalReachedWeek = week + 1;
  }

  const weeksCompleted = character.lastResolvedWeekStart
    ? Math.max(0, Math.round((Date.parse(character.calendar.currentDate + 'T00:00:00Z') - Date.parse(scenario.initial.calendar.currentDate + 'T00:00:00Z')) / 604800000))
    : 0;
  const report: ScenarioReport = {
    scenario: scenario.id,
    goal: scenario.goal.description,
    goalReached: scenario.goal.reached(character),
    goalReachedWeek,
    survived: weeksCompleted === scenario.weeks,
    weeksCompleted,
    actionsPlanned,
    restWeeks,
    blockedWeeks,
    minimum,
    maximumStress,
    final: {
      age: character.age,
      health: character.health,
      happiness: character.happiness,
      stamina: character.stamina,
      stress: character.stress,
      cash: character.money
    },
    failure
  };
  console.info('SIMULATION_LAB ' + JSON.stringify(report));
  return report;
}

function educationPursuit(seed: number): Scenario {
  const enrolled = enrollInEducation(preparedAdult(seed), 'professional-certificate', 'Programming');
  if (enrolled.issue) throw new Error('Could not prepare education scenario: ' + enrolled.issue);
  return {
    id: '18yo-programming-certificate',
    seed,
    weeks: 12,
    initial: enrolled.character,
    goal: {
      id: 'programming-certificate',
      description: 'Complete a professional programming certificate',
      reached: (character) => (character.qualifications ?? []).some((item) => item.programId === 'professional-certificate' && item.field === 'Programming')
    },
    strategy: (character) => {
      // A deliberate student protects recovery when effort is low, otherwise meets the weekly learning target.
      if (character.stamina < 22 || character.stress > 78) {
        return mustPlan(character, planCareActionInNextFreeTime(character, 'rest'));
      }
      const withStudy = mustPlan(character, planEducationTaskInNextFreeTime(character, 'study'));
      return mustPlan(withStudy, planEducationTaskInNextFreeTime(withStudy, 'assignment'));
    }
  };
}

function fitnessPursuit(seed: number): Scenario {
  const initial = { ...preparedAdult(seed), fitness: 42 };
  return {
    id: '18yo-build-fitness',
    seed,
    weeks: 52,
    initial,
    goal: {
      id: 'fitness-70',
      description: 'Reach 70 fitness while keeping health above 40',
      reached: (character) => character.fitness >= 70 && character.health >= 40
    },
    strategy: (character) => {
      if (character.fitness >= 70) return character;
      if (character.stamina < 28 || character.stress > 75) {
        return mustPlan(character, planCareActionInNextFreeTime(character, 'rest'));
      }
      return mustPlan(character, planActivityInNextFreeTime(character, 'exercise'));
    }
  };
}

describe('goal-driven life simulation lab', () => {
  it('lets an 18-year-old complete a professional certificate without breaking weekly survival constraints', () => {
    const report = runScenario(educationPursuit(4101));
    expect(report.survived).toBe(true);
    expect(report.goalReached).toBe(true);
    expect(report.goalReachedWeek).not.toBeNull();
    expect(report.blockedWeeks).toBe(0);
    expect(report.minimum.health).toBeGreaterThan(35);
    expect(report.minimum.cash).toBeGreaterThanOrEqual(0);
  });

  it('tests whether different generated 18-year-old characters can reach a fitness goal within one year', () => {
    const reports = [4201, 4202, 4203, 4204, 4205].map((seed) => runScenario(fitnessPursuit(seed)));
    const reached = reports.filter((report) => report.goalReached).length;
    expect(reports.every((report) => report.survived)).toBe(true);
    expect(reports.every((report) => report.blockedWeeks === 0)).toBe(true);
    expect(reached).toBeGreaterThanOrEqual(4);
  });
});
