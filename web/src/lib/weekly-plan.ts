import type { PlannedActivity, WeeklyPlan } from './types';

export function getWeeklyPlan(plan: WeeklyPlan): WeeklyPlan {
  return plan;
}

export function isValidWeeklyPlan(value: unknown): value is WeeklyPlan {
  if (!value || typeof value !== 'object') return false;
  const plan = value as Partial<WeeklyPlan>;
  if (plan.version !== 1 || !Array.isArray(plan.activities)) return false;
  const ids = new Set<string>();
  return plan.activities.every((entry) => {
    if (!entry || typeof entry !== 'object') return false;
    const item = entry as Partial<PlannedActivity>;
    if (typeof item.id !== 'string' || item.id.length === 0 || ids.has(item.id)) return false;
    if (typeof item.activityId !== 'string' || !item.action || typeof item.action !== 'object') return false;
    ids.add(item.id);
    const action = item.action as { kind?: string };
    return ['activity', 'family', 'business', 'event', 'work', 'education', 'care'].includes(action.kind ?? '');
  });
}
