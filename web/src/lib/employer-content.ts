import employerContent from './content/career-employers.json';

export interface CareerEmployer {
  id: string;
  name: string;
  sector: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function validateCareerEmployers(value: unknown): CareerEmployer[] {
  if (!isRecord(value) || value.contentVersion !== 1 || !Array.isArray(value.employers) || value.employers.length === 0) {
    throw new Error('Career employer content must use supported contentVersion 1 and contain employers.');
  }
  const ids = new Set<string>();
  return value.employers.map((item, index) => {
    if (!isRecord(item) || !isText(item.id) || !isText(item.name) || !isText(item.sector)) {
      throw new Error(`Career employer at index ${index} has invalid required fields.`);
    }
    if (ids.has(item.id)) throw new Error(`Duplicate career employer id: ${item.id}.`);
    ids.add(item.id);
    return { id: item.id, name: item.name, sector: item.sector };
  });
}

export const CAREER_EMPLOYERS = validateCareerEmployers(employerContent);
