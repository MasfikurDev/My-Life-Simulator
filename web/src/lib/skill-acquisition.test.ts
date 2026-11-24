import { describe, expect, it } from 'vitest';
import content from './content/skill-acquisition.json';
import { SKILL_ACQUISITION_CONTENT, validateSkillAcquisitionContent } from './skill-acquisition';

describe('skill acquisition content', () => {
  it('loads the complete set of supported life-action reward rules', () => {
    expect(SKILL_ACQUISITION_CONTENT.rules.length).toBe(content.rules.length);
    expect(SKILL_ACQUISITION_CONTENT.rulesBySourceAction.get('business:manage')).toHaveLength(2);
    expect(SKILL_ACQUISITION_CONTENT.rulesBySourceAction.has('family:reconcile')).toBe(true);
    expect(SKILL_ACQUISITION_CONTENT.rulesBySourceAction.has('education-task:assignment')).toBe(true);
  });

  it('rejects duplicate rule IDs, invalid amounts and unknown skills', () => {
    expect(() => validateSkillAcquisitionContent({ ...content, rules: [...content.rules, content.rules[0]] })).toThrow(/invalid/);
    expect(() => validateSkillAcquisitionContent({ ...content, rules: content.rules.map((rule, index) => index === 0 ? { ...rule, amount: 0 } : rule) })).toThrow(/invalid/);
    expect(() => validateSkillAcquisitionContent({ ...content, rules: content.rules.map((rule, index) => index === 0 ? { ...rule, target: { kind: 'skill', skillId: 'missing' } } : rule) })).toThrow(/unknown skill target/);
  });

  it('rejects education-field rewards outside study actions', () => {
    expect(() => validateSkillAcquisitionContent({ ...content, rules: [...content.rules, {
      id: 'invalid-education-target', source: 'activity', action: 'exercise', target: { kind: 'education-field' }, amount: 1
    }] })).toThrow(/invalid or unknown skill target/);
  });

  it('rejects dynamic targets outside their owning gameplay actions', () => {
    expect(() => validateSkillAcquisitionContent({ ...content, rules: [...content.rules, {
      id: 'invalid-role-target', source: 'family', action: 'spend-time', target: { kind: 'career-role' }, amount: 1
    }] })).toThrow(/invalid or unknown skill target/);
  });
});
