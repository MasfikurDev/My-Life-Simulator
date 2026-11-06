import { describe, expect, it } from 'vitest';
import { buildWeeklySchedule, countFreeTimeBlocks, getWeeklySchedule } from './weekly-schedule';
import type { WeeklySchedule } from './types';

const empty: WeeklySchedule = { version: 1, commitments: [], activities: [] };

describe('weekly schedule foundation', () => {
  it('creates a seven-day grid with three broad periods per day', () => {
    const result = buildWeeklySchedule('2026-11-02', empty);
    expect(result.valid).toBe(true);
    expect(result.blocks).toHaveLength(21);
    expect(countFreeTimeBlocks('2026-11-02', empty)).toBe(21);
  });

  it('expands recurring commitments on their weekday only', () => {
    const schedule: WeeklySchedule = {
      version: 1,
      commitments: [{ id: 'school-mon', title: 'School', domain: 'school', weekday: 1, startPeriod: 'morning', durationBlocks: 2 }],
      activities: []
    };
    const result = buildWeeklySchedule('2026-11-02', schedule);
    expect(result.valid).toBe(true);
    expect(result.blocks.filter((block) => block.entryId === 'school-mon').map((block) => block.period)).toEqual(['morning', 'afternoon']);
    expect(countFreeTimeBlocks('2026-11-02', schedule)).toBe(19);
  });

  it('places dated activities only inside the selected week', () => {
    const schedule: WeeklySchedule = {
      version: 1,
      commitments: [],
      activities: [{ id: 'study-1', activityId: 'study', date: '2026-11-04', startPeriod: 'evening', durationBlocks: 1 }]
    };
    const result = buildWeeklySchedule('2026-11-02', schedule);
    expect(result.valid).toBe(true);
    expect(result.blocks.find((block) => block.entryId === 'study-1')?.date).toBe('2026-11-04');
    expect(buildWeeklySchedule('2026-11-09', schedule).issues[0]?.code).toBe('outside-week');
  });

  it('rejects overlaps between recurring commitments and planned activities', () => {
    const schedule: WeeklySchedule = {
      version: 1,
      commitments: [{ id: 'work', title: 'Work shift', domain: 'work', weekday: 3, startPeriod: 'afternoon', durationBlocks: 1 }],
      activities: [{ id: 'exercise', activityId: 'exercise', date: '2026-11-04', startPeriod: 'afternoon', durationBlocks: 1 }]
    };
    const result = buildWeeklySchedule('2026-11-02', schedule);
    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'overlap' && issue.entryId === 'exercise' && issue.conflictingEntryId === 'work')).toBe(true);
    expect(countFreeTimeBlocks('2026-11-02', schedule)).toBe(0);
  });

  it('rejects invalid durations, duplicate IDs, and non-Monday week starts', () => {
    const invalid: WeeklySchedule = {
      version: 1,
      commitments: [
        { id: 'same', title: 'Too long', domain: 'other', weekday: 1, startPeriod: 'evening', durationBlocks: 2 },
        { id: 'same', title: 'Duplicate', domain: 'other', weekday: 2, startPeriod: 'morning', durationBlocks: 1 }
      ],
      activities: []
    };
    expect(buildWeeklySchedule('2026-11-02', invalid).issues.map((issue) => issue.code)).toEqual(['invalid-duration', 'duplicate-id']);
    expect(buildWeeklySchedule('2026-11-03', empty).issues[0]?.code).toBe('invalid-week-start');
  });

  it('provides an empty, backward-compatible schedule for legacy characters', () => {
    expect(getWeeklySchedule()).toEqual(empty);
    expect(getWeeklySchedule(empty)).toEqual(empty);
  });
});
