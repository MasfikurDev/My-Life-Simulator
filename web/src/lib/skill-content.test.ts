import { describe, expect, it } from 'vitest';
import { validateSkillContent } from './skill-content';

const validContent = {
  contentVersion: 1,
  skills: [{ id: 'technology', label: 'Technology' }, { id: 'operations', label: 'Operations' }],
  educationFieldMappings: [{ field: 'Computer science', skillId: 'technology' }],
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
    expect(() => validateSkillContent({ ...validContent, skills: [...validContent.skills, { id: 'technology', label: 'Tech' }] })).toThrow(/Duplicate skill id/);
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
