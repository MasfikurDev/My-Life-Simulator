import { describe, expect, it } from 'vitest';
import { createCharacter, performActivity, planCareActionInNextFreeTime, advanceWeek } from './simulation';
import { resolveCareAction, resolveWeeklyWellbeing } from './wellbeing';

describe('weekly wellbeing and medical care', () => {
  it('raises pressure and fatigue when the weekly schedule is overloaded', () => {
    const character = { ...createCharacter('Worker', 30), stress: 50, stamina: 60 };
    const result = resolveWeeklyWellbeing(character, 18, '2026-11-02');
    expect(result.character.stress).toBeGreaterThan(character.stress!);
    expect(result.character.stamina).toBeLessThan(character.stamina!);
    expect(result.recap.some((item) => item.includes('heavy weekly workload'))).toBe(true);
  });

  it('creates a burnout condition after sustained high stress', () => {
    const character = { ...createCharacter('Worker', 30), stress: 82, medicalState: { conditions: [], medications: [], highStressWeeks: 1 } };
    const result = resolveWeeklyWellbeing(character, 18, '2026-11-02');
    expect(result.character.medicalState?.conditions.some((item) => item.type === 'burnout')).toBe(true);
  });

  it('makes rest restore energy and reduce stress', () => {
    const character = { ...createCharacter('Worker', 30), stress: 75, stamina: 20 };
    const result = resolveCareAction(character, 'rest', '2026-11-02');
    expect(result.stress).toBeLessThan(character.stress!);
    expect(result.stamina).toBeGreaterThan(character.stamina!);
  });

  it('counselling reduces stress and treats mental-health conditions', () => {
    const character = { ...createCharacter('Worker', 30), stress: 85, medicalState: { conditions: [{ id: 'burnout', type: 'burnout' as const, name: 'Burnout', severity: 60, diagnosed: false, weeksActive: 2, treatment: null }], medications: [], highStressWeeks: 3 } };
    const result = resolveCareAction(character, 'counselling', '2026-11-02');
    expect(result.stress).toBeLessThan(character.stress!);
    expect(result.medicalState?.conditions[0].diagnosed).toBe(true);
    expect(result.medicalState?.conditions[0].severity).toBeLessThan(60);
  });

  it('medical check-ups diagnose conditions and provide a treatment course', () => {
    const character = { ...createCharacter('Patient', 30), medicalState: { conditions: [{ id: 'illness', type: 'common-illness' as const, name: 'Illness', severity: 50, diagnosed: false, weeksActive: 1, treatment: null }], medications: [], highStressWeeks: 0 } };
    const result = resolveCareAction(character, 'medical-checkup', '2026-11-02');
    expect(result.medicalState?.conditions[0].diagnosed).toBe(true);
    expect(result.medicalState?.medications.length).toBe(1);
    expect(result.health).toBeGreaterThan(character.health);
  });
  it('reduces study and extra-work efficiency under severe stress', () => {
    const calm = { ...createCharacter('Calm', 30), stress: 20, stamina: 80, intelligence: 50 };
    const pressured = { ...calm, stress: 90 };
    const calmStudy = performActivity(calm, 'study');
    const pressuredStudy = performActivity(pressured, 'study');
    expect(pressuredStudy.intelligence - pressured.intelligence).toBeLessThan(calmStudy.intelligence - calm.intelligence);
    const calmWork = performActivity(calm, 'work');
    const pressuredWork = performActivity(pressured, 'work');
    expect(pressuredWork.money - pressured.money).toBeLessThan(calmWork.money - calm.money);
  });

  it('can create a strain condition when physical capacity is low and the week is overloaded', () => {
    const character = { ...createCharacter('Exhausted', 30), fitness: 10, stamina: 8 };
    const result = resolveWeeklyWellbeing(character, 18, '2026-11-02');
    expect(result.character.medicalState?.conditions.some((item) => item.type === 'injury')).toBe(true);
  });

  it('keeps essential healthcare accessible to minors through family support', () => {
    const child = createCharacter('Child', 10);
    const planned = planCareActionInNextFreeTime(child, 'medical-checkup');
    expect(planned.issue).toBeNull();
    const result = advanceWeek(planned.character);
    expect(result.issue).toBeNull();
    expect(result.character.money).toBe(child.money);
    expect(result.character.health).toBeGreaterThan(child.health);
  });

});
