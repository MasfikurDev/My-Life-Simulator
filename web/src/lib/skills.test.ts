import { describe, expect, it } from 'vitest';
import { createCharacter, performActivity, planActivityInNextFreeTime, getWeeklyActivityReview, startBusiness, manageBusiness, getAnnualTaxEstimate } from './simulation';
import { applySkillAcquisition, awardSkillProgress, getCareerSkillId, getCareerSpecialtySkillId, getEducationSkillId, getEducationSubjectSkillId, getSkillLabel, getSkillLevel } from './skills';
import { getCareerRole, getCareerRequirements, isEligibleForRole, resolveJobInterview } from './work';
import { enrollInEducation, resolveEducationWeek } from './education';

describe('pursuit-based activity rewards', () => {
  it('maps education fields to reusable capability tracks', () => {
    expect(getEducationSkillId('Computer science')).toBe('technology');
    expect(getEducationSubjectSkillId('Computer science', 'Computer science')).toBe('programming');
    expect(getEducationSubjectSkillId('Cybersecurity', 'Cybersecurity')).toBeUndefined();
    expect(getEducationSkillId('Business')).toBe('business');
    expect(getEducationSkillId('Computing')).toBe('technology');
    expect(getEducationSkillId('Programming')).toBe('technology');
    expect(getEducationSkillId('Electrical trades')).toBe('engineering');
    expect(getEducationSkillId('Automotive')).toBe('practical-trades');
    expect(getEducationSkillId('Accounting')).toBe('business');
    expect(getEducationSkillId('First aid')).toBe('healthcare');
    expect(getEducationSkillId('Teaching')).toBe('education');
    expect(getEducationSkillId('Arts')).toBe('creative-arts');
    expect(getEducationSkillId('Cybersecurity')).toBe('digital-literacy');
    expect(getEducationSkillId('Clinical specialization')).toBe('clinical-practice');
    expect(getEducationSkillId('Artificial Intelligence')).toBe('general-learning');
    expect(getCareerSkillId('technology', 'software-developer')).toBe('technology');
    expect(getCareerSpecialtySkillId('software-developer')).toBe('programming');
    expect(getCareerSkillId('technology', 'it-support')).toBe('technology');
    expect(getCareerSpecialtySkillId('it-support')).toBe('digital-literacy');
    expect(getCareerSpecialtySkillId('operations-manager')).toBe('project-management');
    expect(getEducationSubjectSkillId('Project management', 'Project management')).toBe('project-management');
    expect(getCareerSkillId('technology')).toBe('technology');
    expect(getCareerSkillId()).toBe('professional-practice');
    expect(getEducationSkillId('  Computer Science  ')).toBe('technology');
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
      skills: { technology: 50, programming: 44 }
    };
    expect(getCareerRequirements(character, role).find((item) => item.label === 'Relevant skill')?.met).toBe(true);
    expect(getCareerRequirements(character, role).find((item) => item.label === 'Specialty skill')?.met).toBe(false);
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
    expect(getSkillLevel(studied, 'technology')).toBeGreaterThan(getSkillLevel(character, 'technology'));
    const worked = applySkillAcquisition(character, 'activity', 'work', { careerPathId: 'technology', roleId: 'software-developer' });
    expect(getSkillLevel(worked, 'technology')).toBeGreaterThan(getSkillLevel(character, 'technology'));
    expect(getSkillLevel(worked, 'programming')).toBeGreaterThan(getSkillLevel(character, 'programming'));
  });

  it('develops entrepreneurship and operations through actual business actions', () => {
    const founder = { ...createCharacter('Founder', 30), money: 1000000000, currency: 'USD', currencyScale: 1, intelligence: 80, focus: 80, confidence: 80, discipline: 80 };
    const started = startBusiness(founder, 'Northstar Shop', 'retail', 500000);
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

describe('skill gameplay effects', () => {
  it('improves extra-work pay and career performance through the active role skill', () => {
    const base = {
      ...createCharacter('Worker', 30),
      employment: {
        title: 'Software developer', type: 'full-time' as const, annualSalary: 50000,
        experienceYears: 3, performance: 60, promotions: 0, startedAtAge: 25,
        roleId: 'software-developer', careerPathId: 'technology' as const
      }
    };
    const novice = { ...base, skills: { programming: 0 } };
    const skilled = { ...base, skills: { programming: 100 } };
    const noviceShift = performActivity(novice, 'work');
    const skilledShift = performActivity(skilled, 'work');
    expect(skilledShift.money - skilled.money).toBeGreaterThan(noviceShift.money - novice.money);
    const noviceDevelopment = performActivity(novice, 'career');
    const skilledDevelopment = performActivity(skilled, 'career');
    expect(skilledDevelopment.employment!.performance - skilled.employment!.performance)
      .toBeGreaterThan(noviceDevelopment.employment!.performance - novice.employment!.performance);
  });

  it('improves fitness gains through physical-fitness skill', () => {
    const base = createCharacter('Athlete', 25);
    const novice = performActivity({ ...base, skills: { 'physical-fitness': 0 } }, 'exercise');
    const skilled = performActivity({ ...base, skills: { 'physical-fitness': 100 } }, 'exercise');
    expect(skilled.fitness - base.fitness).toBeGreaterThan(novice.fitness - base.fitness);
  });

  it('improves academic task results through the enrolled field skill', () => {
    const enrolled = enrollInEducation({
      ...createCharacter('Student', 25), money: 100000, intelligence: 85, focus: 85, discipline: 85
    }, 'bachelor-degree', 'Computer science').character;
    const fieldSubject = enrolled.educationEnrollment!.subjects.find((subject) => subject.name === 'Computer science')!;
    const task = [{ taskType: 'assignment' as const, subjectId: fieldSubject.id }];
    const novice = resolveEducationWeek({ ...enrolled, skills: { programming: 20 } }, task, '2026-11-02', 4);
    const skilled = resolveEducationWeek({ ...enrolled, skills: { programming: 90 } }, task, '2026-11-02', 4);
    expect(skilled.character.educationEnrollment!.grade).toBeGreaterThan(novice.character.educationEnrollment!.grade);
  });

  it('improves business returns through entrepreneurship and operations skills', () => {
    const business = { id: 'business-1', name: 'Stable Retail', type: 'retail' as const, investedCapital: 100000, valuation: 100000, performance: 100 };
    const base = { ...createCharacter('Owner', 35), businesses: [business] };
    const novice = { ...base, skills: { entrepreneurship: 0, operations: 0 } };
    const skilled = { ...base, skills: { entrepreneurship: 100, operations: 100 } };
    expect(getAnnualTaxEstimate(skilled).assetIncomeTax).toBeGreaterThan(getAnnualTaxEstimate(novice).assetIncomeTax);
  });
});
