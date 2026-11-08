import type { CareActionType, Character, HealthCondition, MedicalState } from './types';

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
const medicalState = (character: Character): MedicalState => character.medicalState ?? { conditions: [], medications: [], highStressWeeks: 0 };

export function resolveCareAction(character: Character, careType: CareActionType, weekStart: string): Character {
  const state = medicalState(character);
  const nextState: MedicalState = { ...state, conditions: state.conditions.map((condition) => ({ ...condition })), medications: [...state.medications] };
  const next: Character = { ...character, medicalState: nextState, history: [...character.history] };
  if (careType === 'rest') {
    next.stamina = clamp((next.stamina ?? 50) + 14);
    next.health = clamp(next.health + 4);
    next.happiness = clamp(next.happiness + 3);
    next.stress = clamp((next.stress ?? 30) - 14);
    next.medicalState = { ...nextState, conditions: nextState.conditions.map((condition) => condition.type === 'injury' || condition.type === 'common-illness' ? { ...condition, treatment: 'rest' as const, severity: clamp(condition.severity - 10) } : condition).filter((condition) => condition.severity > 0) };
    next.history.unshift({ id: 'care-rest-' + weekStart, age: next.age, year: next.year, date: weekStart, kind: 'activity', title: 'Took time to recover', description: 'Rest restored energy and reduced accumulated pressure.' });
  } else if (careType === 'mindfulness') {
    next.stress = clamp((next.stress ?? 30) - 10);
    next.focus = clamp((next.focus ?? 50) + 2);
    next.happiness = clamp(next.happiness + 2);
    next.history.unshift({ id: 'care-mindfulness-' + weekStart, age: next.age, year: next.year, date: weekStart, kind: 'activity', title: 'Practised mindfulness', description: 'A quiet recovery activity helped settle stress and restore focus.' });
  } else if (careType === 'counselling') {
    next.stress = clamp((next.stress ?? 30) - 20);
    next.happiness = clamp(next.happiness + 3);
    next.medicalState = { ...nextState, lastTherapyWeek: weekStart, conditions: nextState.conditions.map((condition) =>
      condition.type === 'burnout' || condition.type === 'anxiety'
        ? { ...condition, diagnosed: true, treatment: 'professional-support' as const, severity: clamp(condition.severity - 18), weeksActive: condition.weeksActive }
        : condition
    ).filter((condition) => condition.severity > 0) };
    next.history.unshift({ id: 'care-counselling-' + weekStart, age: next.age, year: next.year, date: weekStart, kind: 'milestone', title: 'Sought professional support', description: 'A counselling session provided structured support and helped reduce pressure.' });
  } else {
    next.health = clamp(next.health + 12);
    next.stamina = clamp((next.stamina ?? 50) + 5);
    next.medicalState = { ...nextState, lastCheckupWeek: weekStart, conditions: nextState.conditions.map((condition) => ({
      ...condition, diagnosed: true, treatment: (condition.type === 'burnout' || condition.type === 'anxiety' ? 'professional-support' : condition.type === 'chronic' ? 'ongoing-management' : 'medical-care') as HealthCondition['treatment'],
      severity: clamp(condition.severity - 22), weeksActive: condition.weeksActive
    })).filter((condition) => condition.severity > 0) };
    const stateAfter: MedicalState = next.medicalState ?? nextState;
    const hasMedication = stateAfter.medications.some((item) => item.weeksRemaining > 0);
    if (!hasMedication && stateAfter.conditions.some((condition) => condition.type === 'common-illness' || condition.type === 'injury')) {
      next.medicalState = { ...stateAfter, medications: [...stateAfter.medications, { id: 'prescribed-' + weekStart, name: 'Prescribed treatment', weeksRemaining: 3 }] };
    }
    next.history.unshift({ id: 'care-checkup-' + weekStart, age: next.age, year: next.year, date: weekStart, kind: 'milestone', title: 'Completed a medical check-up', description: 'A healthcare professional reviewed your health and updated your treatment plan.' });
  }
  return next;
}

function addCondition(conditions: HealthCondition[], condition: HealthCondition): HealthCondition[] {
  if (conditions.some((item) => item.type === condition.type)) return conditions;
  return [...conditions, condition];
}

/** Applies the combined pressure of recurring commitments and planned tasks once per resolved week. */
export function resolveWeeklyWellbeing(character: Character, occupiedBlocks: number, weekStart: string): { character: Character; recap: string[] } {
  const state = medicalState(character);
  const stress = character.stress ?? 30;
  const loadIncrease = occupiedBlocks >= 17 ? 9 : occupiedBlocks >= 14 ? 6 : occupiedBlocks >= 11 ? 3 : -3;
  const nextStress = clamp(stress + loadIncrease);
  const nextStamina = clamp((character.stamina ?? 50) + (occupiedBlocks >= 16 ? -7 : occupiedBlocks >= 12 ? -4 : 3));
  const highStressWeeks = nextStress >= 82 ? state.highStressWeeks + 1 : Math.max(0, state.highStressWeeks - 1);
  let conditions = state.conditions.map((condition) => {
    const treated = condition.treatment !== null;
    const recovery = treated ? (condition.treatment === 'professional-support' ? 8 : condition.treatment === 'ongoing-management' ? 3 : 5) : 0;
    const worsening = condition.type === 'burnout' && nextStress >= 75 ? 5 : condition.type === 'common-illness' && character.health < 45 ? 3 : condition.type === 'chronic' ? 2 : 1;
    return { ...condition, severity: clamp(condition.severity + (treated ? -recovery : worsening)), weeksActive: condition.weeksActive + 1 };
  }).filter((condition) => condition.severity > 0);
  if (highStressWeeks >= 2) conditions = addCondition(conditions, { id: 'condition-burnout-' + weekStart, type: 'burnout', name: 'Burnout', severity: 45, diagnosed: false, weeksActive: 1, treatment: null });
  if (highStressWeeks >= 4) conditions = addCondition(conditions, { id: 'condition-anxiety-' + weekStart, type: 'anxiety', name: 'Ongoing anxiety', severity: 35, diagnosed: false, weeksActive: 1, treatment: null });
  if (character.health <= 25) conditions = addCondition(conditions, { id: 'condition-illness-' + weekStart, type: 'common-illness', name: 'Illness / low immunity', severity: 35, diagnosed: false, weeksActive: 1, treatment: null });
  if ((character.fitness <= 15 || nextStamina <= 10) && occupiedBlocks >= 16) conditions = addCondition(conditions, { id: 'condition-injury-' + weekStart, type: 'injury', name: 'Strain or minor injury', severity: 30, diagnosed: false, weeksActive: 1, treatment: null });
  if (character.age >= 65 && character.health <= 30) conditions = addCondition(conditions, { id: 'condition-chronic-' + weekStart, type: 'chronic', name: 'Ongoing health condition', severity: 35, diagnosed: false, weeksActive: 1, treatment: null });
  const medications = state.medications.map((item) => ({ ...item, weeksRemaining: Math.max(0, item.weeksRemaining - 1) })).filter((item) => item.weeksRemaining > 0);
  const medicationRecovery = state.medications.length > 0 ? 2 : 0;
  const activeSeverity = conditions.reduce((sum, condition) => sum + condition.severity, 0);
  const next: Character = {
    ...character, stress: nextStress, stamina: nextStamina,
    health: clamp(character.health + medicationRecovery - (activeSeverity >= 120 ? 2 : activeSeverity >= 70 ? 1 : 0)),
    happiness: clamp(character.happiness + (nextStress >= 85 ? -3 : nextStress >= 70 ? -1 : nextStress <= 35 ? 1 : 0)),
    medicalState: { ...state, conditions, medications, highStressWeeks }
  };
  const recap: string[] = [];
  if (occupiedBlocks >= 14) recap.push('Wellbeing: a heavy weekly workload increased stress and fatigue.');
  if (nextStress >= 82) recap.push('Wellbeing: sustained high stress is affecting health and performance.');
  if (conditions.some((condition) => condition.type === 'burnout') && !state.conditions.some((condition) => condition.type === 'burnout')) recap.push('Health: signs of burnout have emerged. Recovery and professional support are available.');
  if (conditions.some((condition) => condition.type === 'anxiety') && !state.conditions.some((condition) => condition.type === 'anxiety')) recap.push('Health: ongoing pressure is affecting mental wellbeing. Consider seeking professional support.');
  if (activeSeverity >= 70) recap.push('Health: an untreated condition is reducing recovery and weekly performance.');
  return { character: next, recap };
}

export function getWellbeingLoadLabel(occupiedBlocks: number): string {
  return occupiedBlocks >= 17 ? 'Overloaded' : occupiedBlocks >= 14 ? 'Heavy' : occupiedBlocks >= 11 ? 'Busy' : 'Balanced';
}
