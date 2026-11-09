import { describe, expect, it } from 'vitest';
import { getWeeklyPlan, isValidWeeklyPlan } from './weekly-plan';

describe('weekly action plan', () => {
  it('keeps an explicit versioned action collection with no timetable fields', () => {
    const plan = { version: 1 as const, activities: [{ id: 'study-1', activityId: 'study' as const, action: { kind: 'education' as const, taskType: 'study' as const } }] };
    expect(getWeeklyPlan(plan)).toEqual(plan);
    expect(isValidWeeklyPlan(plan)).toBe(true);
    expect('commitments' in plan).toBe(false);
  });

  it('rejects unsupported plan versions, malformed actions and duplicate IDs', () => {
    expect(isValidWeeklyPlan({ version: 2, activities: [] })).toBe(false);
    expect(isValidWeeklyPlan({ version: 1, activities: [{ id: 'x', activityId: 'study' }] })).toBe(false);
    expect(isValidWeeklyPlan({ version: 1, activities: [
      { id: 'same', activityId: 'study', action: { kind: 'activity' } },
      { id: 'same', activityId: 'exercise', action: { kind: 'activity' } }
    ] })).toBe(false);
  });
});
