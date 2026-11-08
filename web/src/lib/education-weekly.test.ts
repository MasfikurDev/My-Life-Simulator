import { describe, expect, it } from 'vitest';
import { createCharacter, advanceWeek, planEducationTaskInNextFreeTime, planCareActionInNextFreeTime } from './simulation';
import { enrollInEducation, pauseEducation } from './education';

describe('weekly education and care integration', () => {
  it('resolves scheduled study and assignment tasks into academic progress', () => {
    const enrolled = enrollInEducation({ ...createCharacter('Student', 10), health: 90, stress: 20, stamina: 80 }, 'primary-school', 'General studies').character;
    const study = planEducationTaskInNextFreeTime(enrolled, 'study');
    expect(study.issue).toBeNull();
    const assignment = planEducationTaskInNextFreeTime(study.character, 'assignment');
    expect(assignment.issue).toBeNull();
    const before = assignment.character.educationEnrollment!.grade;
    const result = advanceWeek(assignment.character);
    expect(result.issue).toBeNull();
    expect(result.character.educationEnrollment!.grade).toBeGreaterThan(before);
    expect(result.recap.some((item) => item.includes('weekly learning target met'))).toBe(true);
  });

  it('lowers grades when a student advances a week without academic work', () => {
    const enrolled = enrollInEducation(createCharacter('Student', 10), 'primary-school', 'General studies').character;
    const before = enrolled.educationEnrollment!.grade;
    const result = advanceWeek(enrolled);
    expect(result.issue).toBeNull();
    expect(result.character.educationEnrollment!.grade).toBeLessThan(before);
  });

  it('schedules a recovery action and applies it during week resolution', () => {
    const character = { ...createCharacter('Worker', 30), stress: 75, stamina: 25 };
    const planned = planCareActionInNextFreeTime(character, 'rest');
    expect(planned.issue).toBeNull();
    const result = advanceWeek(planned.character);
    expect(result.issue).toBeNull();
    expect(result.character.stress).toBeLessThan(character.stress!);
    expect(result.character.stamina).toBeGreaterThan(character.stamina!);
  });
  it('removes uncompleted academic reservations when a programme is paused', () => {
    const enrolled = enrollInEducation(createCharacter('Student', 10), 'primary-school', 'General studies').character;
    const planned = planEducationTaskInNextFreeTime(enrolled, 'study');
    expect(planned.issue).toBeNull();
    const paused = pauseEducation(planned.character);
    expect(paused.educationEnrollment?.status).toBe('paused');
    expect(paused.weeklyPlan?.activities.some((item) => item.action?.kind === 'education')).toBe(false);
  });

});
