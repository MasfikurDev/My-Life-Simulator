import { describe, expect, it } from 'vitest';
import { createCharacter } from './simulation';
import { EDUCATION_PROGRAMS, enrollInEducation, getAvailableEducationPrograms, pauseEducation, resolveEducationWeek } from './education';

describe('education progression', () => {
  it('offers age-appropriate school, vocational and higher-education routes', () => {
    const child = createCharacter('Student', 8);
    expect(getAvailableEducationPrograms(child).map((program) => program.id)).toContain('primary-school');
    expect(getAvailableEducationPrograms(child).some((program) => program.level === 'bachelor')).toBe(false);
    const adult = createCharacter('Adult', 30);
    expect(getAvailableEducationPrograms(adult).map((program) => program.id)).toContain('bachelor-degree');
    expect(getAvailableEducationPrograms(adult).some((program) => program.level === 'doctorate')).toBe(false);
  });

  it('enrolls a student and automatically adds recurring class commitments', () => {
    const student = createCharacter('Student', 10);
    const result = enrollInEducation(student, 'primary-school', 'General studies');
    expect(result.issue).toBeNull();
    expect(result.character.educationEnrollment?.weeklyStudyTarget).toBe(2);
    expect(result.character.weeklySchedule?.commitments.filter((item) => item.domain === 'school')).toHaveLength(5);
    expect(result.character.educationRecords?.[0].status).toBe('enrolled');
  });

  it('rejects enrollment when tuition cannot be afforded', () => {
    const student = { ...createCharacter('Student', 25), money: 0 };
    const result = enrollInEducation(student, 'bachelor-degree', 'Computer science');
    expect(result.character).toBe(student);
    expect(result.issue).toContain('tuition');
  });

  it('reduces grades when weekly learning targets are missed', () => {
    const student = enrollInEducation(createCharacter('Student', 10), 'primary-school', 'General studies').character;
    const result = resolveEducationWeek(student, [], '2026-11-02', 8);
    expect(result.character.educationEnrollment?.grade).toBeLessThan(student.educationEnrollment!.grade);
    expect(result.recap.some((item) => item.includes('missed learning'))).toBe(true);
  });

  it('improves grades when study and assignment work is completed', () => {
    const student = enrollInEducation(createCharacter('Student', 10), 'primary-school', 'General studies').character;
    const result = resolveEducationWeek(student, ['study', 'assignment'], '2026-11-02', 8);
    expect(result.character.educationEnrollment?.grade).toBeGreaterThan(student.educationEnrollment!.grade);
  });

  it('awards a qualification after a passing programme and records the result', () => {
    const enrolled = enrollInEducation(createCharacter('Student', 25), 'professional-certificate', 'Programming').character;
    const shortCourse = { ...enrolled, educationEnrollment: { ...enrolled.educationEnrollment!, totalWeeks: 1 } };
    const result = resolveEducationWeek(shortCourse, ['study', 'assignment', 'exam'], '2026-11-02', 6);
    expect(result.character.educationEnrollment).toBeNull();
    expect(result.character.academicHistory?.[0].outcome).toBe('completed');
    expect(result.character.qualifications?.some((item) => item.field === 'Programming')).toBe(true);
  });

  it('pauses education and releases recurring class time', () => {
    const enrolled = enrollInEducation(createCharacter('Student', 10), 'primary-school', 'General studies').character;
    const paused = pauseEducation(enrolled);
    expect(paused.educationEnrollment).toBeNull();
    expect(paused.weeklySchedule?.commitments.some((item) => item.domain === 'school')).toBe(false);
    expect(paused.educationRecords?.[0].status).toBe('paused');
  });
});
