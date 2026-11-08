import { describe, expect, it } from 'vitest';
import { createCharacter } from './simulation';
import { enrollInEducation, getAvailableEducationPrograms, pauseEducation, resumeEducation, resolveEducationWeek } from './education';
import { getCareerRole, isEligibleForRole } from './work';

describe('education progression', () => {
  it('offers age-appropriate school, vocational and higher-education routes', () => {
    const child = createCharacter('Student', 8);
    expect(getAvailableEducationPrograms(child).map((program) => program.id)).toContain('primary-school');
    expect(getAvailableEducationPrograms(child).some((program) => program.level === 'bachelor')).toBe(false);
    const adult = { ...createCharacter('Adult', 30), intelligence: 85, focus: 85, discipline: 85 };
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
    const enrolled = enrollInEducation({ ...createCharacter('Student', 25), intelligence: 85, focus: 85, discipline: 85 }, 'professional-certificate', 'Programming').character;
    const shortCourse = { ...enrolled, educationEnrollment: { ...enrolled.educationEnrollment!, totalWeeks: 1 } };
    const result = resolveEducationWeek(shortCourse, ['study', 'assignment', 'exam'], '2026-11-02', 6);
    expect(result.character.educationEnrollment).toBeNull();
    expect(result.character.academicHistory?.[0].outcome).toBe('completed');
    expect(result.character.qualifications?.some((item) => item.field === 'Programming')).toBe(true);
  });

  it('pauses education and releases recurring class time', () => {
    const enrolled = enrollInEducation(createCharacter('Student', 10), 'primary-school', 'General studies').character;
    const paused = pauseEducation(enrolled);
    expect(paused.educationEnrollment?.status).toBe('paused');
    expect(paused.educationEnrollment?.weeksCompleted).toBe(enrolled.educationEnrollment?.weeksCompleted);
    expect(paused.weeklySchedule?.commitments.some((item) => item.domain === 'school')).toBe(false);
    expect(paused.educationRecords?.[0].status).toBe('paused');
    const resumed = resumeEducation(paused);
    expect(resumed.issue).toBeNull();
    expect(resumed.character.educationEnrollment?.status).toBe('enrolled');
    expect(resumed.character.weeklySchedule?.commitments.some((item) => item.domain === 'school')).toBe(true);
  });
  it('supports early development from birth without awarding a formal degree', () => {
    const infant = createCharacter('Infant', 1);
    expect(getAvailableEducationPrograms(infant).some((program) => program.id === 'early-development')).toBe(true);
    const enrolled = enrollInEducation(infant, 'early-development', 'Play & discovery');
    expect(enrolled.issue).toBeNull();
    expect(enrolled.character.weeklySchedule?.commitments.filter((item) => item.domain === 'school')).toHaveLength(3);
    const completed = resolveEducationWeek({ ...enrolled.character, educationEnrollment: { ...enrolled.character.educationEnrollment!, totalWeeks: 1 } }, ['study'], '2026-11-02', 4);
    expect(completed.character.academicHistory?.[0].outcome).toBe('completed');
    expect(completed.character.qualifications ?? []).toHaveLength(0);
  });

  it('uses character attributes as entry requirements for advanced programmes', () => {
    const capable = { ...createCharacter('Adult', 30), intelligence: 80, focus: 80, discipline: 80 };
    const developing = { ...capable, intelligence: 25, focus: 25, discipline: 25 };
    expect(getAvailableEducationPrograms(capable).some((program) => program.id === 'bachelor-degree')).toBe(true);
    expect(getAvailableEducationPrograms(developing).some((program) => program.id === 'bachelor-degree')).toBe(false);
  });

  it('connects completed university qualifications to career eligibility', () => {
    const capable = { ...createCharacter('Graduate', 30), intelligence: 90, focus: 90, discipline: 90, money: 5000 };
    const enrolled = enrollInEducation(capable, 'bachelor-degree', 'Computer science').character;
    const shortCourse = { ...enrolled, educationEnrollment: { ...enrolled.educationEnrollment!, totalWeeks: 1 } };
    const completed = resolveEducationWeek(shortCourse, ['study', 'assignment', 'exam'], '2026-11-02', 6).character;
    const candidate = { ...completed, careerExperienceYears: 2 };
    expect(candidate.qualifications?.some((item) => item.programId === 'bachelor-degree')).toBe(true);
    expect(isEligibleForRole(candidate, getCareerRole('software-developer')!)).toBe(true);
  });

  it('uses a relevant professional certificate to unlock a matching job', () => {
    const capable = { ...createCharacter('Technician', 25), intelligence: 80, focus: 80, discipline: 80, money: 5000 };
    const role = getCareerRole('it-support')!;
    expect(isEligibleForRole(capable, role)).toBe(false);
    const enrolled = enrollInEducation(capable, 'professional-certificate', 'Programming').character;
    const completed = resolveEducationWeek({ ...enrolled, educationEnrollment: { ...enrolled.educationEnrollment!, totalWeeks: 1 } }, ['study', 'assignment', 'exam'], '2026-11-02', 6).character;
    expect(isEligibleForRole(completed, role)).toBe(true);
  });

});
