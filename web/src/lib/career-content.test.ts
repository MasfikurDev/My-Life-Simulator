import { describe, expect, it } from 'vitest';
import careerContent from './content/career-roles.json';
import { CAREER_ROLES, validateCareerContent } from './career-content';

describe('career content', () => {
  it('loads the existing role catalogue with stable paths and salary ranges', () => {
    expect(CAREER_ROLES).toHaveLength(12);
    expect(CAREER_ROLES.find((role) => role.id === 'service-assistant')?.pathName).toBe('Customer service');
    expect(CAREER_ROLES.map((role) => role.id)).toContain('software-developer');
    expect(CAREER_ROLES.find((role) => role.id === 'software-developer')?.skillId).toBe('programming');
    expect(CAREER_ROLES.find((role) => role.id === 'it-support')?.skillId).toBe('digital-literacy');
    expect(CAREER_ROLES.find((role) => role.id === 'it-support')).toMatchObject({
      requiredQualificationFields: ['Digital skills', 'Programming'],
      requiredQualificationCategory: 'certificate'
    });
  });

  it('rejects unsupported content versions and duplicate role IDs', () => {
    expect(() => validateCareerContent({ contentVersion: 2, roles: careerContent.roles })).toThrow(/contentVersion/);
    const duplicate = { ...careerContent, roles: [careerContent.roles[0], careerContent.roles[0]] };
    expect(() => validateCareerContent(duplicate)).toThrow(/Duplicate career role id/);
  });

  it('rejects roles without a canonical skill reference', () => {
    const invalidSkill = { ...careerContent.roles[0], skillId: '' };
    expect(() => validateCareerContent({ ...careerContent, roles: [invalidSkill] })).toThrow(/skillId/);
  });

  it('rejects invalid thresholds and inverted salary ranges', () => {
    const badThreshold = { ...careerContent.roles[0], minSocialSkills: 101 };
    expect(() => validateCareerContent({ ...careerContent, roles: [badThreshold] })).toThrow(/minSocialSkills/);
    const badSalary = { ...careerContent.roles[0], annualSalaryMin: 20000, annualSalaryMax: 10000 };
    expect(() => validateCareerContent({ ...careerContent, roles: [badSalary] })).toThrow(/inverted salary range/);
  });

  it('rejects missing path definitions', () => {
    expect(() => validateCareerContent({ ...careerContent, paths: careerContent.paths.slice(1) })).toThrow(/every supported career path/);
  });

  it('rejects missing or cross-path progression links', () => {
    const missing = { ...careerContent.roles[0], nextRoleId: 'missing-role' };
    expect(() => validateCareerContent({ ...careerContent, roles: [missing] })).toThrow(/references missing next role/);
    const crossPath = [
      { ...careerContent.roles[0], nextRoleId: 'other-path' },
      { ...careerContent.roles[3], id: 'other-path', level: 2 }
    ];
    expect(() => validateCareerContent({ ...careerContent, roles: crossPath })).toThrow(/invalid next-role progression link/);
  });
});
