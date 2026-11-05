import type { ActivityId, Employment } from './types';

export interface LifeStage { id: string; label: string; ageRange: string; description: string; nextAge: number | null; }

const STAGES: Array<LifeStage & { min: number; max: number }> = [
  { id: 'infant', label: 'Early childhood', ageRange: '0–2', min: 0, max: 2, description: 'Daily life centers on care, play, movement and family bonds.', nextAge: 3 },
  { id: 'preschool', label: 'Preschool years', ageRange: '3–5', min: 3, max: 5, description: 'Early learning and exploration become part of everyday life.', nextAge: 6 },
  { id: 'childhood', label: 'Childhood', ageRange: '6–12', min: 6, max: 12, description: 'School-age learning, play, health and friendships shape development.', nextAge: 13 },
  { id: 'early-teen', label: 'Early teens', ageRange: '13–15', min: 13, max: 15, description: 'Education, interests and peer relationships begin to take a larger role.', nextAge: 16 },
  { id: 'older-teen', label: 'Later teens', ageRange: '16–17', min: 16, max: 17, description: 'Part-time earning becomes available alongside education and personal development.', nextAge: 18 },
  { id: 'young-adult', label: 'Young adulthood', ageRange: '18–24', min: 18, max: 24, description: 'Adult work and financial progression become eligible systems.', nextAge: 25 },
  { id: 'adult', label: 'Adulthood', ageRange: '25–44', min: 25, max: 44, description: 'Longer-term career, household and financial responsibilities take priority.', nextAge: 45 },
  { id: 'midlife', label: 'Midlife', ageRange: '45–64', min: 45, max: 64, description: 'Career decisions, health and long-term financial planning become more important.', nextAge: 65 },
  { id: 'senior', label: 'Later life', ageRange: '65+', min: 65, max: 120, description: 'Later-life choices focus on health, relationships, interests and flexible work.', nextAge: null }
];

export function getLifeStage(age: number): LifeStage {
  const safeAge = Math.max(0, Math.floor(age));
  const stage = STAGES.find((candidate) => safeAge >= candidate.min && safeAge <= candidate.max) ?? STAGES[STAGES.length - 1];
  const { min: _min, max: _max, ...publicStage } = stage;
  return publicStage;
}

export function getEducationStage(age: number): string {
  if (age < 3) return 'Not started';
  if (age < 6) return 'Early learning';
  if (age < 13) return 'Primary education';
  if (age < 18) return 'Secondary education';
  return 'Secondary education completed';
}

export function isActivityAvailable(age: number, activity: ActivityId, employment?: Employment | null): boolean {
  if (activity === 'study') return age >= 3;
  if (activity === 'work') return age >= 16;
  if (activity === 'apply-job') return age >= 16 && (!employment || age >= 18);
  if (activity === 'career') return age >= 16 && Boolean(employment);
  return true;
}

export function getAvailableActivityIds(age: number, employment?: Employment | null): ActivityId[] {
  return (['study', 'exercise', 'socialize', 'work', 'apply-job', 'career'] as ActivityId[])
    .filter((activity) => isActivityAvailable(age, activity, employment));
}
