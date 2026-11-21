import { describe, expect, it } from 'vitest';
import { createCharacter, performActivity, planActivityInNextFreeTime, getWeeklyActivityReview, startBusiness, manageBusiness } from './simulation';
import { applySkillAcquisition, awardSkillProgress, getCareerSkillId, getEducationSkillId, getSkillLabel, getSkillLevel } from './skills';
import { getCareerRole, getCareerRequirements, isEligibleForRole, resolveJobInterview } from './work';

describe('pursuit-based activity rewards', () => {
  it('maps education fields to reusable capability tracks', () => {
    expect(getEducationSkillId('Computer science')).toBe('programming');
    expect(getEducationSkillId('Business')).toBe('business');
    expect(getEducationSkillId('Arts')).toBe('creative-arts');
    expect(getEducationSkillId('Cybersecurity')).toBe('digital-literacy');
    expect(getEducationSkillId('Clinical specialization')).toBe('clinical-practice');
    expect(getEducationSkillId('Artificial Intelligence')).toBe('general-learning');
    expect(getCareerSkillId('technology', 'software-developer')).toBe('programming');
    expect(getCareerSkillId('technology', 'it-support')).toBe('digital-literacy');
    expect(getCareerSkillId('technology')).toBe('technology');
    expect(getCareerSkillId()).toBe('professional-practice');
    expect(getEducationSkillId('  Computer Science  ')).toBe('programming');
    expect(getSkillLabel('technology')).toBe('Technology');
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
    expect(result.skills?.programming).toBeGreaterThan(character.skills?.programming ?? getSkillLevel(character, 'programming'));
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
    expect(result.skills?.programming).toBeGreaterThan(getSkillLevel(character, 'programming'));
    expect(result.employment?.performance).toBeGreaterThan(character.employment!.performance);
  });

  it('uses pursuit skill thresholds in senior career eligibility', () => {
    const role = getCareerRole('software-developer')!;
    const character = {
      ...createCharacter('Candidate', 28),
      intelligence: 80, focus: 80, education: 'Higher education',
      careerExperienceYears: 3,
      educationRecords: [{ id: 'degree', level: 'bachelor' as const, institution: 'University', field: 'Computer science', startedAtAge: 18, completedAtAge: 22, status: 'completed' as const }],
      qualifications: [{ id: 'degree-qualification', name: "Bachelor's degree", category: 'degree' as const, issuer: 'University', field: 'Computer science', awardedAtAge: 22 }],
      skills: { programming: 49 }
    };
    expect(getCareerRequirements(character, role).find((item) => item.label === 'Relevant skill')?.met).toBe(false);
    const improved = awardSkillProgress(character, 'programming', 1);
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

describe('skill acquisition across life systems', () => {
  it('resolves education and career skill rewards through typed source rules', () => {
    const character = createCharacter('Learner', 25);
    const studied = applySkillAcquisition(character, 'activity', 'study', { field: 'Computer science' });
    expect(getSkillLevel(studied, 'programming')).toBeGreaterThan(getSkillLevel(character, 'programming'));
    const worked = applySkillAcquisition(character, 'activity', 'work', { careerPathId: 'technology', roleId: 'software-developer' });
    expect(getSkillLevel(worked, 'programming')).toBeGreaterThan(getSkillLevel(character, 'programming'));
  });

  it('develops entrepreneurship and operations through actual business actions', () => {
    const founder = { ...createCharacter('Founder', 30), money: 100000, intelligence: 80, focus: 80, confidence: 80, discipline: 80 };
    const started = startBusiness(founder, 'Northstar Shop', 'retail', 5000);
    expect(getSkillLevel(started, 'entrepreneurship')).toBeGreaterThan(getSkillLevel(founder, 'entrepreneurship'));
    const managed = manageBusiness(started, started.businesses![0].id);
    expect(getSkillLevel(managed, 'entrepreneurship')).toBeGreaterThan(getSkillLevel(started, 'entrepreneurship'));
    expect(getSkillLevel(managed, 'operations')).toBeGreaterThan(getSkillLevel(started, 'operations'));
  });

  it('develops communication through job interviews whether or not an offer is received', () => {
    const applicant = {
      ...createCharacter('Applicant', 28),
      intelligence: 80, socialSkills: 80, confidence: 80, focus: 80,
      jobApplications: [{
        id: 'application-1', listingId: 'service-assistant-2026-11-02', roleId: 'service-assistant',
        title: 'Service assistant', employer: 'Local employer', type: 'full-time' as const,
        annualSalary: 20000, appliedAt: '2026-11-02', status: 'interview' as const
      }]
    };
    const result = resolveJobInterview(applicant, 'application-1', () => 0);
    expect(getSkillLevel(result, 'communication')).toBeGreaterThan(getSkillLevel(applicant, 'communication'));
  });
});
