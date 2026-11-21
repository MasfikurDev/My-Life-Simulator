import type { Character, CareerPathId } from './types';
import { SKILL_CONTENT, type SkillDefinition, type SkillStartingStat } from './skill-content';
import { SKILL_ACQUISITION_CONTENT, type SkillAcquisitionAction, type SkillAcquisitionSource } from './skill-acquisition';

export function getEducationSkillId(field?: string): string {
  const normalized = (field ?? '').trim().toLowerCase();
  return SKILL_CONTENT.educationFieldSkills.get(normalized) ?? 'general-learning';
}

export function getEducationSubjectSkillId(subject?: string, field?: string): string | undefined {
  const normalized = (subject ?? '').trim().toLowerCase();
  if (!normalized || normalized === (field ?? '').trim().toLowerCase()) return undefined;
  return SKILL_CONTENT.educationSubjectSkills.get(normalized);
}

export function getCareerSkillId(path?: CareerPathId | null, roleId?: string): string {
  if (roleId) {
    const roleSkill = SKILL_CONTENT.careerRoleSkills.get(roleId);
    if (roleSkill) return roleSkill;
  }
  return path ? SKILL_CONTENT.careerPathSkills.get(path) ?? 'professional-practice' : 'professional-practice';
}

export function getSkillLabel(skillId: string): string {
  return SKILL_CONTENT.skillLabels.get(skillId) ??
    skillId.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

export interface SkillAcquisitionContext {
  field?: string;
  subject?: string;
  careerPathId?: CareerPathId | null;
  roleId?: string;
}

export function applySkillAcquisition(
  character: Character,
  source: SkillAcquisitionSource,
  action: SkillAcquisitionAction,
  context: SkillAcquisitionContext = {}
): Character {
  const rules = SKILL_ACQUISITION_CONTENT.rulesBySourceAction.get(source + ':' + action) ?? [];
  let next = character;
  for (const rule of rules) {
    const skillId = rule.target.kind === 'skill' ? rule.target.skillId
      : rule.target.kind === 'education-field' ? getEducationSkillId(context.field)
      : rule.target.kind === 'education-subject' ? getEducationSubjectSkillId(context.subject, context.field)
      : getCareerSkillId(context.careerPathId, context.roleId);
    if (skillId) next = awardSkillProgress(next, skillId, rule.amount);
  }
  return next;
}

function getSkillDefinition(skillId: string): SkillDefinition {
  return SKILL_CONTENT.skillById.get(skillId) ?? SKILL_CONTENT.skillById.get('general-learning')!;
}

/** Untrained skills inherit a baseline from relevant character attributes; stored progress remains authoritative. */
export function getSkillLevel(character: Character, skillId: string): number {
  const saved = character.skills?.[skillId];
  if (Number.isFinite(saved)) return Math.max(0, Math.min(100, Math.round(saved!)));
  const definition = getSkillDefinition(skillId);
  const values = definition.startingStats.map((stat: SkillStartingStat) => character[stat] ?? 50);
  const baseline = values.reduce((total, value) => total + value, 0) / values.length;
  return Math.max(0, Math.min(100, Math.round(baseline)));
}

export function awardSkillProgress(character: Character, skillId: string, amount: number): Character {
  if (!SKILL_CONTENT.skillById.has(skillId) || !Number.isFinite(amount) || amount <= 0) return character;
  const current = getSkillLevel(character, skillId);
  const pressure = character.stress ?? 30;
  const energy = character.stamina ?? 50;
  const efficiency = pressure >= 85 || energy < 20 ? 0.5 : pressure >= 70 || energy < 35 ? 0.75 : 1;
  const gain = Math.max(1, Math.floor(amount * efficiency));
  const next = Math.min(100, current + gain);
  if (next === current) return character;
  return { ...character, skills: { ...(character.skills ?? {}), [skillId]: next } };
}
