import educationContent from './content/education-programs.json';

export type EducationLevel =
  | 'early-learning' | 'primary' | 'lower-secondary' | 'upper-secondary'
  | 'vocational' | 'associate' | 'bachelor' | 'master' | 'doctorate'
  | 'professional-specialist';

export interface EducationProgramDefinition {
  id: string;
  title: string;
  institutionType: string;
  level: EducationLevel;
  minAge: number;
  maxAge: number;
  durationWeeks: number;
  tuition: number;
  fieldOptions: string[];
  subjects: string[];
  prerequisite?: EducationLevel;
  prerequisiteMinAge?: number;
  minIntelligence?: number;
  minFocus?: number;
  minDiscipline?: number;
}

const LEVELS: readonly EducationLevel[] = [
  'early-learning', 'primary', 'lower-secondary', 'upper-secondary',
  'vocational', 'associate', 'bachelor', 'master', 'doctorate',
  'professional-specialist'
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isBoundedInteger(value: unknown, min: number, max: number): value is number {
  return Number.isInteger(value) && (value as number) >= min && (value as number) <= max;
}

function validateProgram(value: unknown, index: number): EducationProgramDefinition {
  const label = `Education program at index ${index}`;
  if (!isRecord(value)) throw new Error(`${label} must be an object.`);

  const requiredText = ['id', 'title', 'institutionType'] as const;
  for (const key of requiredText) {
    if (!isText(value[key])) throw new Error(`${label} has an invalid ${key}.`);
  }
  if (!LEVELS.includes(value.level as EducationLevel)) throw new Error(`${label} has an unsupported education level.`);
  if (!isBoundedInteger(value.minAge, 0, 120) || !isBoundedInteger(value.maxAge, 0, 120) || value.minAge > value.maxAge) {
    throw new Error(`${label} has an invalid age range.`);
  }
  if (!isBoundedInteger(value.durationWeeks, 1, 10000)) throw new Error(`${label} has an invalid durationWeeks.`);
  if (typeof value.tuition !== 'number' || !Number.isFinite(value.tuition) || value.tuition < 0) {
    throw new Error(`${label} has invalid tuition.`);
  }
  for (const key of ['fieldOptions', 'subjects'] as const) {
    const items = value[key];
    if (!Array.isArray(items) || items.length === 0 || !items.every(isText) || new Set(items).size !== items.length) {
      throw new Error(`${label} must define unique, non-empty ${key}.`);
    }
  }
  if (value.prerequisite !== undefined && !LEVELS.includes(value.prerequisite as EducationLevel)) {
    throw new Error(`${label} has an unsupported prerequisite.`);
  }
  if (value.prerequisiteMinAge !== undefined && !isBoundedInteger(value.prerequisiteMinAge, 0, 120)) {
    throw new Error(`${label} has an invalid prerequisiteMinAge.`);
  }
  for (const key of ['minIntelligence', 'minFocus', 'minDiscipline'] as const) {
    if (value[key] !== undefined && !isBoundedInteger(value[key], 0, 100)) {
      throw new Error(`${label} has an invalid ${key} threshold.`);
    }
  }

  return {
    id: value.id as string,
    title: value.title as string,
    institutionType: value.institutionType as string,
    level: value.level as EducationLevel,
    minAge: value.minAge as number,
    maxAge: value.maxAge as number,
    durationWeeks: value.durationWeeks as number,
    tuition: value.tuition as number,
    fieldOptions: [...value.fieldOptions as string[]],
    subjects: [...value.subjects as string[]],
    ...(value.prerequisite !== undefined ? { prerequisite: value.prerequisite as EducationLevel } : {}),
    ...(value.prerequisiteMinAge !== undefined ? { prerequisiteMinAge: value.prerequisiteMinAge as number } : {}),
    ...(value.minIntelligence !== undefined ? { minIntelligence: value.minIntelligence as number } : {}),
    ...(value.minFocus !== undefined ? { minFocus: value.minFocus as number } : {}),
    ...(value.minDiscipline !== undefined ? { minDiscipline: value.minDiscipline as number } : {})
  };
}

export function validateEducationContent(value: unknown): EducationProgramDefinition[] {
  if (!isRecord(value) || value.contentVersion !== 1 || !Array.isArray(value.programs) || value.programs.length === 0) {
    throw new Error('Education content must use supported contentVersion 1 and contain programs.');
  }
  const programs = value.programs.map(validateProgram);
  const ids = new Set<string>();
  for (const program of programs) {
    if (ids.has(program.id)) throw new Error(`Duplicate education program id: ${program.id}.`);
    ids.add(program.id);
  }
  return programs;
}

export const EDUCATION_PROGRAMS: EducationProgramDefinition[] = validateEducationContent(educationContent);
