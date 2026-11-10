import type { PlannedActivity, WeeklyPlan } from './types';

const ACTION_KINDS = ['activity', 'family', 'business', 'event', 'work', 'education', 'care', 'food', 'social'] as const;

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
      case 'activity': return ['study', 'exercise', 'socialize', 'work', 'apply-job', 'career'].includes(item.activityId);
      case 'family': return item.activityId === 'family' && typeof action.personId === 'string' && ['spend-time', 'reach-out', 'reconcile', 'provide-support'].includes(String(action.interaction));
      case 'business': return item.activityId === 'business' && typeof action.businessId === 'string';
      case 'event': return item.activityId === 'event' && typeof action.eventId === 'string' && typeof action.choiceId === 'string' && Number.isFinite(action.staminaCost) && Number(action.staminaCost) >= 0;
      case 'work': return item.activityId === 'career' && ['apply', 'interview'].includes(String(action.workAction)) && typeof action.jobId === 'string' && typeof action.title === 'string';
      case 'education': return item.activityId === 'study' && ['study', 'assignment', 'exam'].includes(String(action.taskType));
      case 'care': return item.activityId === 'healthcare' && ['rest', 'counselling', 'medical-checkup', 'mindfulness'].includes(String(action.careType));
      case 'food': return item.activityId === 'food' && typeof action.productId === 'string' && typeof action.name === 'string' && Number.isInteger(action.quantity) && Number(action.quantity) > 0 && Number(action.quantity) <= 20 && Number.isFinite(action.staminaRecovery) && Number(action.staminaRecovery) >= 0 && Number(action.staminaRecovery) <= 30 && Number.isFinite(action.health) && Number(action.health) >= 0 && Number(action.health) <= 12 && Number.isFinite(action.happiness) && Number(action.happiness) >= 0 && Number(action.happiness) <= 10 && Number.isFinite(action.stress) && Number(action.stress) >= 0 && Number(action.stress) <= 8;
      case 'social': return item.activityId === 'socialize' && typeof action.connectionId === 'string' && action.interaction === 'spend-time';
      default: return false;
    }
  });
}
