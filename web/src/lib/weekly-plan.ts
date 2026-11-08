import type { PlannedActivity, WeeklyPlan } from './types';

const ACTION_KINDS = ['activity', 'family', 'business', 'event', 'work', 'education', 'care'] as const;

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
    const action = item.action as Record<string, unknown>;
    if (!ACTION_KINDS.includes(action.kind as typeof ACTION_KINDS[number])) return false;
    switch (action.kind) {
      case 'activity': return true;
      case 'family': return typeof action.personId === 'string' && ['spend-time', 'reach-out', 'reconcile', 'provide-support'].includes(String(action.interaction));
      case 'business': return typeof action.businessId === 'string';
      case 'event': return typeof action.eventId === 'string' && typeof action.choiceId === 'string' && Number.isFinite(action.staminaCost) && Number(action.staminaCost) >= 0;
      case 'work': return ['apply', 'interview'].includes(String(action.workAction)) && typeof action.jobId === 'string' && typeof action.title === 'string';
      case 'education': return ['study', 'assignment', 'exam'].includes(String(action.taskType));
      case 'care': return ['rest', 'counselling', 'medical-checkup', 'mindfulness'].includes(String(action.careType));
      default: return false;
    }
  });
}
