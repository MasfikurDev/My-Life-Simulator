import { describe, expect, it } from 'vitest';
import { createCharacter, performActivity, planActivityInNextFreeTime, getWeeklyActivityReview } from './simulation';
import { awardSkillProgress, getCareerSkillId, getEducationSkillId, getSkillLevel } from './skills';
import { getCareerRole, getCareerRequirements, isEligibleForRole } from './work';

describe('pursuit-based activity rewards', () => {
  it('maps education fields to reusable capability tracks', () => {
    expect(getEducationSkillId('Computer science')).toBe('technology');
    expect(getEducationSkillId('Business')).toBe('business');
    expect(getEducationSkillId('Arts')).toBe('creative-arts');
    expect(getCareerSkillId('technology')).toBe('technology');
  });

  it('rewards exercise with physical capability rather than only generic stats', () => {
    const character = createCharacter('Athlete', 25);
    const result = performActivity(character, 'exercise');
    expect(getSkillLevel(result, 'physical-fitness')).toBeGreaterThan(getSkillLevel(character, 'physical-fitness'));
    expect(result.fitness).toBeGreaterThan(character.fitness);
  });

  it('rewards education with knowledge relevant to the enrolled field', () => {
    const character = {
      ...createCharacter('Student', 20),
      educationEnrollment: {
        recordId: 'degree-1', status: 'enrolled' as const, programId: 'bachelor-degree',
        institution: 'University', level: 'bachelor' as const, field: 'Computer science',
        startedAtAge: 18, tuitionPaid: 0, weeksCompleted: 2, totalWeeks: 160,
        grade: 70, attendance: 100, weeklyStudyTarget: 3,
        subjects: [{ id: 'subject-1', name: 'Programming', grade: 70 }]
      }
    };
    const result = performActivity(character, 'study');
    expect(result.skills?.technology).toBeGreaterThan(character.skills?.technology ?? getSkillLevel(character, 'technology'));
  });

  it('rewards career development in the character current career path', () => {
    const character = {
      ...createCharacter('Developer', 28),
      employment: {
        title: 'Software developer', type: 'full-time' as const, annualSalary: 50000,
        experienceYears: 3, performance: 60, promotions: 0, startedAtAge: 25,
        roleId: 'software-developer', careerPathId: 'technology' as const
      }
    };
    const result = performActivity(character, 'career');
    expect(result.skills?.technology).toBeGreaterThan(getSkillLevel(character, 'technology'));
    expect(result.employment?.performance).toBeGreaterThan(character.employment!.performance);
  });

  it('uses pursuit skill thresholds in senior career eligibility', () => {
    const role = getCareerRole('software-developer')!;
    const character = {
      ...createCharacter('Candidate', 28),
      intelligence: 80, focus: 80, education: 'Higher education',
      careerExperienceYears: 3,
      educationRecords: [{ id: 'degree', level: 'bachelor' as const, institution: 'University', field: 'Computer science', startedAtAge: 18, completedAtAge: 22, status: 'completed' as const }],
      qualifications: [{ id: 'degree-qualification', name: \"Bachelor's degree\", category: 'degree' as const, issuer: 'University', field: 'Computer science', awardedAtAge: 22 }],
      skills: { technology: 49 }
    };
    expect(getCareerRequirements(character, role).find((item) => item.label === 'Relevant skill')?.met).toBe(false);
    const improved = awardSkillProgress(character, 'technology', 1);
    expect(isEligibleForRole(improved, role)).toBe(true);
  });

  it('shows pursuit skill gains in the weekly review forecast', () => {
    const character = createCharacter('Planner', 30);
    const planned = planActivityInNextFreeTime(character, 'exercise');
    expect(planned.issue).toBeNull();
    const review = getWeeklyActivityReview(planned.character);
    expect(review.changes.some((change) => change.key === 'skill-physical-fitness' && change.delta > 0)).toBe(true);
  });
});
