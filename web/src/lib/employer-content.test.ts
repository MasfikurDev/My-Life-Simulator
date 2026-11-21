import { describe, expect, it } from 'vitest';
import employerContent from './content/career-employers.json';
import { CAREER_EMPLOYERS, validateCareerEmployers } from './employer-content';

describe('career employer content', () => {
  it('loads the existing fictional employer and sector catalogue', () => {
    expect(CAREER_EMPLOYERS).toHaveLength(8);
    expect(CAREER_EMPLOYERS.find((employer) => employer.id === 'northstar-services')).toMatchObject({
      name: 'Northstar Services',
      sector: 'Customer services'
    });
    expect(CAREER_EMPLOYERS.map((employer) => employer.name)).toContain('MarketSquare Co.');
  });

  it('rejects unsupported versions and empty catalogues', () => {
    expect(() => validateCareerEmployers({ contentVersion: 2, employers: employerContent.employers })).toThrow(/contentVersion/);
    expect(() => validateCareerEmployers({ contentVersion: 1, employers: [] })).toThrow(/contain employers/);
  });

  it('rejects missing fields and duplicate stable IDs', () => {
    expect(() => validateCareerEmployers({ contentVersion: 1, employers: [{ id: 'missing-name', sector: 'Technology' }] })).toThrow(/invalid required fields/);
    const duplicate = { ...employerContent, employers: [employerContent.employers[0], employerContent.employers[0]] };
    expect(() => validateCareerEmployers(duplicate)).toThrow(/Duplicate career employer id/);
  });
});
