import careerContent from './content/career-roles.json';
import type { CareerRole } from './work';
import type { CareerPathId } from './types';

const PATHS: readonly CareerPathId[] = ['customer-service', 'operations', 'technology', 'sales'];
const QUALIFICATION_CATEGORIES = ['certificate', 'license', 'diploma', 'degree', 'professional'] as const;
type QualificationCategory = typeof QUALIFICATION_CATEGORIES[number];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function isText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
function isInteger(value: unknown, min: number, max: number): value is number {
  return Number.isInteger(value) && (value as number) >= min && (value as number) <= max;
}

function validateRole(value: unknown, index: number): CareerRole {
  const label = `Career role at index ${index}`;
  if (!isRecord(value)) throw new Error(`${label} must be an object.`);
  for (const key of ['id', 'title', 'description'] as const) {
    if (!isText(value[key])) throw new Error(`${label} has an invalid ${key}.`);
  }
  if (!PATHS.includes(value.pathId as CareerPathId)) throw new Error(`${label} has an unsupported career path.`);
  if (!isInteger(value.level, 1, 100)) throw new Error(`${label} has an invalid level.`);
  if (!isInteger(value.minAge, 0, 120) || !isInteger(value.maxAge, 0, 120) || value.minAge > value.maxAge) {
    throw new Error(`${label} has an invalid age range.`);
  }
  if (!isInteger(value.minIntelligence, 0, 100) || !isInteger(value.minExperienceYears, 0, 120)) {
    throw new Error(`${label} has invalid knowledge or experience requirements.`);
  }
  if (typeof value.requiresHigherEducation !== 'boolean') throw new Error(`${label} has an invalid higher-education requirement.`);
  for (const key of ['minDiscipline', 'minCreativity', 'minFocus', 'minSocialSkills', 'minConfidence', 'minSkill'] as const) {
    if (value[key] !== undefined && !isInteger(value[key], 0, 100)) throw new Error(`${label} has an invalid ${key} threshold.`);
  }
  for (const key of ['annualSalaryMin', 'annualSalaryMax'] as const) {
    if (typeof value[key] !== 'number' || !Number.isFinite(value[key]) || value[key] < 0) throw new Error(`${label} has an invalid ${key}.`);
  }
  if ((value.annualSalaryMin as number) > (value.annualSalaryMax as number)) throw new Error(`${label} has an inverted salary range.`);
  for (const key of ['requiredQualificationIds', 'requiredQualificationFields'] as const) {
    if (value[key] !== undefined && (!Array.isArray(value[key]) || value[key].length === 0 || !value[key].every(isText) || new Set(value[key]).size !== value[key].length)) {
      throw new Error(`${label} has invalid ${key}.`);
    }
  }
  if (value.requiredQualificationCategory !== undefined && !QUALIFICATION_CATEGORIES.includes(value.requiredQualificationCategory as QualificationCategory)) {
    throw new Error(`${label} has an unsupported qualification category.`);
  }
  if (value.nextRoleId !== undefined && !isText(value.nextRoleId)) throw new Error(`${label} has an invalid nextRoleId.`);
  return {
    id: value.id as string, pathId: value.pathId as CareerPathId, pathName: '',
    title: value.title as string, level: value.level as number, description: value.description as string,
    minAge: value.minAge as number, maxAge: value.maxAge as number,
    minIntelligence: value.minIntelligence as number, minExperienceYears: value.minExperienceYears as number,
    requiresHigherEducation: value.requiresHigherEducation as boolean,
    ...(value.minDiscipline !== undefined ? { minDiscipline: value.minDiscipline as number } : {}),
    ...(value.minCreativity !== undefined ? { minCreativity: value.minCreativity as number } : {}),
    ...(value.minFocus !== undefined ? { minFocus: value.minFocus as number } : {}),
    ...(value.minSocialSkills !== undefined ? { minSocialSkills: value.minSocialSkills as number } : {}),
    ...(value.minConfidence !== undefined ? { minConfidence: value.minConfidence as number } : {}),
    ...(value.minSkill !== undefined ? { minSkill: value.minSkill as number } : {}),
    ...(value.requiredQualificationIds !== undefined ? { requiredQualificationIds: [...value.requiredQualificationIds as string[]] } : {}),
    ...(value.requiredQualificationFields !== undefined ? { requiredQualificationFields: [...value.requiredQualificationFields as string[]] } : {}),
    ...(value.requiredQualificationCategory !== undefined ? { requiredQualificationCategory: value.requiredQualificationCategory as CareerRole['requiredQualificationCategory'] } : {}),
    annualSalaryMin: value.annualSalaryMin as number, annualSalaryMax: value.annualSalaryMax as number,
    ...(value.nextRoleId !== undefined ? { nextRoleId: value.nextRoleId as string } : {})
  };
}

export function validateCareerContent(value: unknown): CareerRole[] {
  if (!isRecord(value) || value.contentVersion !== 1 || !Array.isArray(value.paths) || !Array.isArray(value.roles) || value.roles.length === 0) {
    throw new Error('Career content must use supported contentVersion 1 and contain paths and roles.');
  }
  const paths = new Map<string, string>();
  for (const [index, item] of value.paths.entries()) {
    if (!isRecord(item) || !isText(item.id) || !PATHS.includes(item.id as CareerPathId) || !isText(item.name)) {
      throw new Error(`Career path at index ${index} is invalid.`);
    }
    if (paths.has(item.id)) throw new Error(`Duplicate career path id: ${item.id}.`);
    paths.set(item.id, item.name);
  }
  if (paths.size !== PATHS.length || PATHS.some((id) => !paths.has(id))) {
    throw new Error('Career content must define every supported career path exactly once.');
  }
  const roles = value.roles.map((role, index) => {
    const validated = validateRole(role, index);
    const pathName = paths.get(validated.pathId);
    if (!pathName) throw new Error(`Career role ${validated.id} references missing career path ${validated.pathId}.`);
    return { ...validated, pathName };
  });
  const byId = new Map<string, CareerRole>();
  for (const role of roles) {
    if (byId.has(role.id)) throw new Error(`Duplicate career role id: ${role.id}.`);
    byId.set(role.id, role);
  }
  for (const role of roles) {
    if (role.nextRoleId) {
      const next = byId.get(role.nextRoleId);
      if (!next) throw new Error(`Career role ${role.id} references missing next role ${role.nextRoleId}.`);
      if (next.pathId !== role.pathId || next.level <= role.level) {
        throw new Error(`Career role ${role.id} has an invalid next-role progression link.`);
      }
    }
  }
  return roles;
}

export const CAREER_ROLES = validateCareerContent(careerContent);
