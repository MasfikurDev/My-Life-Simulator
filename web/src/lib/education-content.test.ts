import { describe, expect, it } from 'vitest';
import { EDUCATION_PROGRAMS, validateEducationContent } from './education-content';

describe('versioned education content', () => {
  it('loads the catalogue with unique stable ids and validated definitions', () => {
    expect(EDUCATION_PROGRAMS.length).toBeGreaterThan(0);
    expect(new Set(EDUCATION_PROGRAMS.map((program) => program.id)).size).toBe(EDUCATION_PROGRAMS.length);
    expect(EDUCATION_PROGRAMS.every((program) => program.subjects.length > 0)).toBe(true);
  });

  it('accepts new programme definitions without changing the TypeScript catalogue code', () => {
    const programs = validateEducationContent({
      contentVersion: 1,
      programs: [{
        id: 'community-course',
        title: 'Community course',
        institutionType: 'Community centre',
        level: 'professional-specialist',
        minAge: 16,
        maxAge: 90,
        durationWeeks: 8,
        tuition: 0,
        fieldOptions: ['Community skills'],
        subjects: ['Foundations', '{field}', 'Practice']
      }]
    });
    expect(programs[0].id).toBe('community-course');
    expect(programs[0].subjects).toContain('{field}');
  });

  it('supports disabling a definition without deleting its stable id', () => {
    const [program] = validateEducationContent({
      contentVersion: 1,
      programs: [{ ...EDUCATION_PROGRAMS[0], enabled: false }]
    });
    expect(program.enabled).toBe(false);
    expect(program.id).toBe(EDUCATION_PROGRAMS[0].id);
  });

  it('rejects invalid enabled flags', () => {
    expect(() => validateEducationContent({
      contentVersion: 1,
      programs: [{ ...EDUCATION_PROGRAMS[0], enabled: 'no' }]
    })).toThrow(/enabled flag/);
  });

  it('rejects unsupported content versions', () => {
    expect(() => validateEducationContent({ contentVersion: 2, programs: [] })).toThrow(/contentVersion/);
  });

  it('rejects duplicate ids instead of silently selecting one definition', () => {
    const program = EDUCATION_PROGRAMS[0];
    expect(() => validateEducationContent({ contentVersion: 1, programs: [program, program] })).toThrow(/Duplicate education program id/);
  });

  it('rejects prerequisite levels that no longer exist in the catalogue', () => {
    const program = { ...EDUCATION_PROGRAMS[0], prerequisite: 'doctorate' as const };
    expect(() => validateEducationContent({ contentVersion: 1, programs: [program] })).toThrow(/missing prerequisite level/);
  });

  it('rejects progression links that reference missing programme IDs', () => {
    expect(() => validateEducationContent({
      contentVersion: 1,
      programs: [{ ...EDUCATION_PROGRAMS[0], treeConnections: [{ from: 'missing-program', style: 'alternative' }] }]
    })).toThrow(/tree connection/);
  });

  it('rejects invalid ranges, thresholds, and empty fields', () => {
    const program = { ...EDUCATION_PROGRAMS[0], minAge: 8, maxAge: 2 };
    expect(() => validateEducationContent({ contentVersion: 1, programs: [program] })).toThrow(/age range/);
    expect(() => validateEducationContent({ contentVersion: 1, programs: [{ ...EDUCATION_PROGRAMS[0], minFocus: 101 }] })).toThrow(/minFocus/);
    expect(() => validateEducationContent({ contentVersion: 1, programs: [{ ...EDUCATION_PROGRAMS[0], fieldOptions: [] }] })).toThrow(/fieldOptions/);
  });
});
