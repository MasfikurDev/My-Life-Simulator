import type { Character, CareerPathId } from './types';
import { SKILL_CONTENT } from './skill-content';

export function getEducationSkillId(field?: string): string {
  const normalized = (field ?? '').trim().toLowerCase();
  return SKILL_CONTENT.educationFieldSkills.get(normalized) ??
    (normalized ? normalized.replace(/[^a-z0-9]+/g, '-') : 'general-learning');
}

export function getCareerSkillId(path?: CareerPathId | null): string {
  return path ? SKILL_CONTENT.careerPathSkills.get(path) ?? 'professional-practice' : 'professional-practice';
}

export function getSkillLabel(skillId: string): string {
  return SKILL_CONTENT.skillLabels.get(skillId) ??
    skillId.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

/** Older saves fall back to the closest existing attribute until a skill is first developed. */
export function getSkillLevel(character: Character, skillId: string): number {
  const saved = character.skills?.[skillId];
  if (Number.isFinite(saved)) return Math.max(0, Math.min(100, Math.round(saved!)));
  const fallback: Record<string, number> = {
    technology: Math.round((character.intelligence + (character.focus ?? 50)) / 2),
    engineering: Math.round((character.intelligence + (character.discipline ?? 50)) / 2),
    business: Math.round((character.intelligence + (character.confidence ?? 50)) / 2),
    healthcare: Math.round((character.intelligence + character.health) / 2),
    communication: character.socialSkills ?? 50,
    'customer-service': Math.round(((character.socialSkills ?? 50) + (character.confidence ?? 50)) / 2),
    operations: Math.round(((character.discipline ?? 50) + (character.focus ?? 50)) / 2),
    sales: Math.round(((character.socialSkills ?? 50) + (character.confidence ?? 50)) / 2),
    'physical-fitness': character.fitness,
    'general-learning': Math.round((character.intelligence + (character.focus ?? 50)) / 2)
  };
  return Math.max(0, Math.min(100, fallback[skillId] ?? fallback['general-learning']));
}

export function awardSkillProgress(character: Character, skillId: string, amount: number): Character {
  if (!Number.isFinite(amount) || amount <= 0) return character;
  const current = getSkillLevel(character, skillId);
  const pressure = character.stress ?? 30;
  const energy = character.stamina ?? 50;
  const efficiency = pressure >= 85 || energy < 20 ? 0.5 : pressure >= 70 || energy < 35 ? 0.75 : 1;
  const gain = Math.max(1, Math.floor(amount * efficiency));
  const next = Math.min(100, current + gain);
  if (next === current) return character;
  return { ...character, skills: { ...(character.skills ?? {}), [skillId]: next } };
}
