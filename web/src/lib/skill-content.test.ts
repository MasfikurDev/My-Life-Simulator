import { describe, expect, it } from 'vitest';
import { SKILL_CONTENT, validateSkillContent, validateSkillCoverage } from './skill-content';
import { EDUCATION_PROGRAMS } from './education-content';
import { CAREER_ROLES } from './career-content';

const validContent = {
  contentVersion: 1,
  skills: [{ id: 'technology', label: 'Technology', group: 'technical', startingStats: ['intelligence', 'focus'], description: 'Technical capability.', effect: 'Supports technical work.' }, { id: 'operations', label: 'Operations', group: 'professional', startingStats: ['discipline', 'focus'], description: 'Organizing work.', effect: 'Supports operations work.' }],
  educationFieldMappings: [{ field: 'Computer science', skillId: 'technology' }],
  educationSubjectMappings: [],
  careerPathMappings: [
    { pathId: 'customer-service', skillId: 'operations' },
    { pathId: 'operations', skillId: 'operations' },
    { pathId: 'technology', skillId: 'technology' },
    { pathId: 'sales', skillId: 'operations' }
  ]
};

describe('skill content validation', () => {
  it('loads unique skills and normalized field and career mappings', () => {
    const content = validateSkillContent(validContent);
    expect(content.skillLabels.get('technology')).toBe('Technology');
    expect(content.educationFieldSkills.get('computer science')).toBe('technology');
    expect(content.careerPathSkills.get('technology')).toBe('technology');
  });

  it('rejects unsupported versions and incomplete catalogues', () => {
    expect(() => validateSkillContent({ ...validContent, contentVersion: 2 })).toThrow(/contentVersion/);
    expect(() => validateSkillContent({ ...validContent, skills: [] })).toThrow(/contentVersion/);
  });

  it('rejects duplicate skill ids and duplicate normalized field mappings', () => {
    expect(() => validateSkillContent({ ...validContent, skills: [...validContent.skills, { id: 'technology', label: 'Tech', group: 'technical', startingStats: ['intelligence', 'focus'], description: 'Technical capability.', effect: 'Supports technical work.' }] })).toThrow(/Duplicate skill id/);
    expect(() => validateSkillContent({ ...validContent, educationFieldMappings: [
      ...validContent.educationFieldMappings, { field: ' computer science ', skillId: 'technology' }
    ] })).toThrow(/Duplicate education field mapping/);
  });

  it('rejects mappings that reference unknown skills', () => {
    expect(() => validateSkillContent({ ...validContent, educationFieldMappings: [{ field: 'Computing', skillId: 'missing' }] })).toThrow(/unknown skill/);
    expect(() => validateSkillContent({ ...validContent, careerPathMappings: validContent.careerPathMappings.map((item) =>
      item.pathId === 'sales' ? { ...item, skillId: 'missing' } : item
    ) })).toThrow(/unknown skill/);
  });

  it('requires every supported career path exactly once', () => {
    expect(() => validateSkillContent({ ...validContent, careerPathMappings: validContent.careerPathMappings.slice(1) })).toThrow(/every supported career path/);
    expect(() => validateSkillContent({ ...validContent, careerPathMappings: [
      ...validContent.careerPathMappings, { pathId: 'sales', skillId: 'operations' }
    ] })).toThrow(/Duplicate career path mapping/);
  });
});

describe('skill source coverage', () => {
  it('rejects education fields without an explicit mapping', () => {
    const content = validateSkillContent(validContent);
    expect(() => validateSkillCoverage(content, ['Computer science', 'Cybersecurity'], [], [])).toThrow(/Cybersecurity.*no skill mapping/);
  });

  it('rejects career roles that reference an undefined skill', () => {
    const content = validateSkillContent(validContent);
    expect(() => validateSkillCoverage(content, [], [], [{ id: 'developer', skillId: 'programming' }])).toThrow(/unknown skill programming/);
  });

  it('accepts complete source coverage and exposes role-specific skills', () => {
    const content = validateSkillContent(validContent);
    const covered = validateSkillCoverage(content, ['Computer science'], [], [{ id: 'developer', skillId: 'technology' }]);
    expect(covered.careerRoleSkills.get('developer')).toBe('technology');
  });
});

describe('production skill catalogue coverage', () => {
  it('maps every education field and every career role to a defined skill', () => {
    const fields = [...new Set(EDUCATION_PROGRAMS.flatMap((program) => program.fieldOptions))];
    const subjects = [...new Set(EDUCATION_PROGRAMS.flatMap((program) => program.subjects.filter((subject) => subject !== '{field}')))];
    expect(fields).toHaveLength(43);
    expect(SKILL_CONTENT.educationFieldSkills.size).toBeGreaterThanOrEqual(fields.length);
    expect(SKILL_CONTENT.educationSubjectSkills.size).toBeGreaterThanOrEqual(subjects.length);
    expect(subjects.every((subject) => SKILL_CONTENT.educationSubjectSkills.has(subject.toLowerCase()))).toBe(true);
    expect(SKILL_CONTENT.careerRoleSkills.size).toBe(CAREER_ROLES.length);
    expect(CAREER_ROLES.every((role) => SKILL_CONTENT.skillById.has(role.skillId) && (!role.specialtySkillId || SKILL_CONTENT.skillById.has(role.specialtySkillId)))).toBe(true);
    expect(SKILL_CONTENT.careerRoleSpecialtySkills.size).toBe(CAREER_ROLES.filter((role) => role.specialtySkillId).length);
  });

  it('gives every skill a valid starting-attribute baseline', () => {
    expect(SKILL_CONTENT.skills.length).toBeGreaterThan(18);
    expect(SKILL_CONTENT.skills.every((skill) => skill.startingStats.length > 0 && skill.description.length > 0 && skill.effect.length > 0)).toBe(true);
  });
});

describe('education subject mappings', () => {
  it('rejects missing or invalid subject mappings', () => {
    const invalid = { ...validContent, educationSubjectMappings: [{ subject: 'Numeracy', skillId: 'missing' }] };
    expect(() => validateSkillContent(invalid)).toThrow(/unknown skill/);
    const duplicate = { ...validContent, educationSubjectMappings: [{ subject: 'Numeracy', skillId: 'technology' }, { subject: ' numeracy ', skillId: 'operations' }] };
    expect(() => validateSkillContent(duplicate)).toThrow(/Duplicate education subject mapping/);
  });
});
