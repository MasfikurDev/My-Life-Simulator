import acquisitionContent from './content/skill-acquisition.json';
import { SKILL_CONTENT } from './skill-content';

export type SkillAcquisitionSource = 'activity' | 'education-task' | 'education-subject' | 'social' | 'family' | 'business' | 'work';
export type SkillAcquisitionAction =
  | 'study' | 'exercise' | 'socialize' | 'work' | 'career'
  | 'assignment' | 'exam' | 'spend-time' | 'reach-out' | 'reconcile'
  | 'provide-support' | 'start' | 'manage' | 'apply' | 'interview';

export type SkillAcquisitionTarget =
  | { kind: 'skill'; skillId: string }
  | { kind: 'education-field' }
  | { kind: 'education-subject' }
  | { kind: 'career-role' }
  | { kind: 'career-role-specialty' };

export interface SkillAcquisitionRule {
  id: string;
  source: SkillAcquisitionSource;
  action: SkillAcquisitionAction;
  target: SkillAcquisitionTarget;
  amount: number;
}

export interface ValidatedSkillAcquisitionContent {
  rules: SkillAcquisitionRule[];
  rulesBySourceAction: ReadonlyMap<string, readonly SkillAcquisitionRule[]>;
}

const ACTIONS: Record<SkillAcquisitionSource, readonly SkillAcquisitionAction[]> = {
  activity: ['study','exercise','socialize','work','career','apply'],
  'education-task': ['study','assignment','exam'],
  'education-subject': ['study','assignment','exam'],
  social: ['spend-time'],
  family: ['spend-time','reach-out','reconcile','provide-support'],
  business: ['start','manage'],
  work: ['apply','interview']
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function isText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function validateSkillAcquisitionContent(value: unknown): ValidatedSkillAcquisitionContent {
  if (!isRecord(value) || value.contentVersion !== 1 || !Array.isArray(value.rules)) {
    throw new Error('Skill acquisition content must use supported contentVersion 1 and contain rules.');
  }
  const rules: SkillAcquisitionRule[] = [];
  const ids = new Set<string>();
  const rulesBySourceAction = new Map<string, SkillAcquisitionRule[]>();
  for (const [index, item] of value.rules.entries()) {
    if (!isRecord(item) || !isText(item.id) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id) || ids.has(item.id) ||
      !isText(item.source) || !Object.hasOwn(ACTIONS, item.source) ||
      !isText(item.action) || !ACTIONS[item.source as SkillAcquisitionSource].includes(item.action as SkillAcquisitionAction) ||
      typeof item.amount !== 'number' || !Number.isInteger(item.amount) || item.amount < 1 || item.amount > 20 ||
      !isRecord(item.target) || !isText(item.target.kind)) {
      throw new Error(`Skill acquisition rule at index ${index} is invalid.`);
    }
    const target = item.target;
    let validatedTarget: SkillAcquisitionTarget;
    if (target.kind === 'skill' && isText(target.skillId) && SKILL_CONTENT.skillById.has(target.skillId)) {
      validatedTarget = { kind: 'skill', skillId: target.skillId };
    } else if (target.kind === 'education-field' && ((item.source === 'activity' && item.action === 'study') || item.source === 'education-task')) {
      validatedTarget = { kind: 'education-field' };
    } else if (target.kind === 'education-subject' && item.source === 'education-subject') {
      validatedTarget = { kind: 'education-subject' };
    } else if (target.kind === 'career-role' && item.source === 'activity' &&
      (item.action === 'work' || item.action === 'career')) {
      validatedTarget = { kind: 'career-role' };
    } else if (target.kind === 'career-role-specialty' && item.source === 'activity' &&
      (item.action === 'work' || item.action === 'career')) {
      validatedTarget = { kind: 'career-role-specialty' };
    } else {
      throw new Error(`Skill acquisition rule ${item.id} has an invalid or unknown skill target.`);
    }
    const rule: SkillAcquisitionRule = {
      id: item.id, source: item.source as SkillAcquisitionSource,
      action: item.action as SkillAcquisitionAction, target: validatedTarget, amount: item.amount
    };
    ids.add(rule.id);
    rules.push(rule);
    const key = rule.source + ':' + rule.action;
    rulesBySourceAction.set(key, [...(rulesBySourceAction.get(key) ?? []), rule]);
  }
  return { rules, rulesBySourceAction };
}

export const SKILL_ACQUISITION_CONTENT = validateSkillAcquisitionContent(acquisitionContent);
