import skillContent from './content/skills.json';
import { EDUCATION_PROGRAMS } from './education-content';
import { CAREER_PATH_IDS, CAREER_ROLES } from './career-content';
import type { CareerRole } from './work';
import type { CareerPathId } from './types';

export type SkillGroup = 'academic' | 'business' | 'care' | 'core' | 'creative' | 'physical' | 'practical' | 'professional' | 'technical';
export type SkillStartingStat = 'intelligence' | 'fitness' | 'health' | 'focus' | 'confidence' | 'discipline' | 'creativity' | 'socialSkills';

export interface SkillDefinition {
  id: string;
  label: string;
  group: SkillGroup;
  startingStats: SkillStartingStat[];
  description: string;
  effect: string;
}

export interface ValidatedSkillContent {
  skills: SkillDefinition[];
  skillById: ReadonlyMap<string, SkillDefinition>;
  skillLabels: ReadonlyMap<string, string>;
  educationFieldSkills: ReadonlyMap<string, string>;
  educationSubjectSkills: ReadonlyMap<string, string>;
  careerPathSkills: ReadonlyMap<CareerPathId, string>;
  careerRoleSkills: ReadonlyMap<string, string>;
}

const GROUPS: readonly SkillGroup[] = ['academic','business','care','core','creative','physical','practical','professional','technical'];
const STARTING_STATS: readonly SkillStartingStat[] = ['intelligence','fitness','health','focus','confidence','discipline','creativity','socialSkills'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function isText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function validateSkillContent(value: unknown): ValidatedSkillContent {
  if (!isRecord(value) || value.contentVersion !== 1 ||
    !Array.isArray(value.skills) || value.skills.length === 0 ||
    !Array.isArray(value.educationFieldMappings) || !Array.isArray(value.educationSubjectMappings) || !Array.isArray(value.careerPathMappings)) {
    throw new Error('Skill content must use supported contentVersion 1 and contain skills and mappings.');
  }

  const skills: SkillDefinition[] = [];
  const skillById = new Map<string, SkillDefinition>();
  const skillLabels = new Map<string, string>();
  for (const [index, item] of value.skills.entries()) {
    if (!isRecord(item) || !isText(item.id) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id) ||
      !isText(item.label) || !isText(item.description) || !isText(item.effect) || !GROUPS.includes(item.group as SkillGroup) ||
      !Array.isArray(item.startingStats) || item.startingStats.length === 0 ||
      !item.startingStats.every((stat) => STARTING_STATS.includes(stat as SkillStartingStat)) ||
      new Set(item.startingStats).size !== item.startingStats.length) {
      throw new Error(`Skill at index ${index} has an invalid id, label, group, or startingStats.`);
    }
    if (skillById.has(item.id)) throw new Error(`Duplicate skill id: ${item.id}.`);
    const definition: SkillDefinition = {
      id: item.id, label: item.label.trim(), group: item.group as SkillGroup, description: item.description.trim(), effect: item.effect.trim(),
      startingStats: [...item.startingStats] as SkillStartingStat[]
    };
    skillById.set(definition.id, definition);
    skillLabels.set(definition.id, definition.label);
    skills.push(definition);
  }

  const educationFieldSkills = new Map<string, string>();
  for (const [index, item] of value.educationFieldMappings.entries()) {
    if (!isRecord(item) || !isText(item.field) || !isText(item.skillId)) {
      throw new Error(`Education skill mapping at index ${index} is invalid.`);
    }
    const field = item.field.trim().toLowerCase();
    if (educationFieldSkills.has(field)) throw new Error(`Duplicate education field mapping: ${field}.`);
    if (!skillById.has(item.skillId)) throw new Error(`Education field ${field} references unknown skill ${item.skillId}.`);
    educationFieldSkills.set(field, item.skillId);
  }

  const educationSubjectSkills = new Map<string, string>();
  for (const [index, item] of value.educationSubjectMappings.entries()) {
    if (!isRecord(item) || !isText(item.subject) || !isText(item.skillId)) {
      throw new Error(`Education subject mapping at index ${index} is invalid.`);
    }
    const subject = item.subject.trim().toLowerCase();
    if (educationSubjectSkills.has(subject)) throw new Error(`Duplicate education subject mapping: ${subject}.`);
    if (!skillById.has(item.skillId)) throw new Error(`Education subject ${subject} references unknown skill ${item.skillId}.`);
    educationSubjectSkills.set(subject, item.skillId);
  }

  const careerPathSkills = new Map<CareerPathId, string>();
  for (const [index, item] of value.careerPathMappings.entries()) {
    if (!isRecord(item) || !isText(item.pathId) || !CAREER_PATH_IDS.includes(item.pathId as CareerPathId) || !isText(item.skillId)) {
      throw new Error(`Career skill mapping at index ${index} is invalid.`);
    }
    const pathId = item.pathId as CareerPathId;
    if (careerPathSkills.has(pathId)) throw new Error(`Duplicate career path mapping: ${pathId}.`);
    if (!skillById.has(item.skillId)) throw new Error(`Career path ${pathId} references unknown skill ${item.skillId}.`);
    careerPathSkills.set(pathId, item.skillId);
  }
  if (careerPathSkills.size !== CAREER_PATH_IDS.length || CAREER_PATH_IDS.some((pathId) => !careerPathSkills.has(pathId))) {
    throw new Error('Skill content must define every supported career path exactly once.');
  }

  return { skills, skillById, skillLabels, educationFieldSkills, educationSubjectSkills, careerPathSkills, careerRoleSkills: new Map() };
}

export function validateSkillCoverage(
  content: ValidatedSkillContent,
  educationFields: readonly string[],
  educationSubjects: readonly string[],
  careerRoles: readonly Pick<CareerRole, 'id' | 'skillId'>[]
): ValidatedSkillContent {
  for (const field of educationFields) {
    if (!content.educationFieldSkills.has(field.trim().toLowerCase())) {
      throw new Error(`Education field "${field}" has no skill mapping.`);
    }
  }
  for (const subject of educationSubjects) {
    if (!content.educationSubjectSkills.has(subject.trim().toLowerCase())) {
      throw new Error(`Education subject "${subject}" has no skill mapping.`);
    }
  }
  const careerRoleSkills = new Map<string, string>();
  for (const role of careerRoles) {
    if (!content.skillById.has(role.skillId)) {
      throw new Error(`Career role ${role.id} references unknown skill ${role.skillId}.`);
    }
    if (careerRoleSkills.has(role.id)) throw new Error(`Duplicate career role skill mapping: ${role.id}.`);
    careerRoleSkills.set(role.id, role.skillId);
  }
  return { ...content, careerRoleSkills };
}

const educationFields = [...new Set(EDUCATION_PROGRAMS.flatMap((program) => program.fieldOptions))];
const educationSubjects = [...new Set(EDUCATION_PROGRAMS.flatMap((program) => program.subjects.filter((subject) => subject !== '{field}')))];
export const SKILL_CONTENT = validateSkillCoverage(validateSkillContent(skillContent), educationFields, educationSubjects, CAREER_ROLES);
