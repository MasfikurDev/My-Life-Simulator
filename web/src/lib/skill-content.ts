import skillContent from './content/skills.json';
import type { CareerPathId } from './types';

export interface SkillDefinition {
  id: string;
  label: string;
}

export interface ValidatedSkillContent {
  skills: SkillDefinition[];
  skillLabels: ReadonlyMap<string, string>;
  educationFieldSkills: ReadonlyMap<string, string>;
  careerPathSkills: ReadonlyMap<CareerPathId, string>;
}

const CAREER_PATHS: readonly CareerPathId[] = ['customer-service', 'operations', 'technology', 'sales'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function validateSkillContent(value: unknown): ValidatedSkillContent {
  if (!isRecord(value) || value.contentVersion !== 1 ||
    !Array.isArray(value.skills) || value.skills.length === 0 ||
    !Array.isArray(value.educationFieldMappings) || !Array.isArray(value.careerPathMappings)) {
    throw new Error('Skill content must use supported contentVersion 1 and contain skills and mappings.');
  }

  const skills: SkillDefinition[] = [];
  const skillLabels = new Map<string, string>();
  for (const [index, item] of value.skills.entries()) {
    if (!isRecord(item) || !isText(item.id) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id) || !isText(item.label)) {
      throw new Error(`Skill at index ${index} has an invalid id or label.`);
    }
    if (skillLabels.has(item.id)) throw new Error(`Duplicate skill id: ${item.id}.`);
    skillLabels.set(item.id, item.label.trim());
    skills.push({ id: item.id, label: item.label.trim() });
  }

  const educationFieldSkills = new Map<string, string>();
  for (const [index, item] of value.educationFieldMappings.entries()) {
    if (!isRecord(item) || !isText(item.field) || !isText(item.skillId)) {
      throw new Error(`Education skill mapping at index ${index} is invalid.`);
    }
    const field = item.field.trim().toLowerCase();
    if (educationFieldSkills.has(field)) throw new Error(`Duplicate education field mapping: ${field}.`);
    if (!skillLabels.has(item.skillId)) throw new Error(`Education field ${field} references unknown skill ${item.skillId}.`);
    educationFieldSkills.set(field, item.skillId);
  }

  const careerPathSkills = new Map<CareerPathId, string>();
  for (const [index, item] of value.careerPathMappings.entries()) {
    if (!isRecord(item) || !isText(item.pathId) || !CAREER_PATHS.includes(item.pathId as CareerPathId) || !isText(item.skillId)) {
      throw new Error(`Career skill mapping at index ${index} is invalid.`);
    }
    const pathId = item.pathId as CareerPathId;
    if (careerPathSkills.has(pathId)) throw new Error(`Duplicate career path mapping: ${pathId}.`);
    if (!skillLabels.has(item.skillId)) throw new Error(`Career path ${pathId} references unknown skill ${item.skillId}.`);
    careerPathSkills.set(pathId, item.skillId);
  }
  if (careerPathSkills.size !== CAREER_PATHS.length || CAREER_PATHS.some((pathId) => !careerPathSkills.has(pathId))) {
    throw new Error('Skill content must define every supported career path exactly once.');
  }

  return { skills, skillLabels, educationFieldSkills, careerPathSkills };
}

export const SKILL_CONTENT = validateSkillContent(skillContent);
