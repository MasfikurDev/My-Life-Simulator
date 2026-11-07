import type { DayPeriod, PlannedActivity, WeeklyCommitment, WeeklySchedule } from './types';
import { addCalendarDays, getWeekStart } from './calendar';

export const DAY_PERIODS: readonly DayPeriod[] = ['morning', 'afternoon', 'evening'];
const PERIOD_INDEX: Record<DayPeriod, number> = { morning: 0, afternoon: 1, evening: 2 };

export type ScheduleIssueCode =
  | 'invalid-week-start'
  | 'invalid-period'
  | 'invalid-duration'
  | 'invalid-weekday'
  | 'invalid-date'
  | 'outside-week'
  | 'duplicate-id'
  | 'overlap';

export interface ScheduleIssue {
  code: ScheduleIssueCode;
  entryId?: string;
  conflictingEntryId?: string;
  date?: string;
  period?: DayPeriod;
  message: string;
}

export interface ScheduleBlock {
  date: string;
  weekday: number;
  period: DayPeriod;
  entryId: string | null;
  title: string | null;
  domain: WeeklyCommitment['domain'] | 'activity' | null;
}

export interface WeeklyScheduleResult {
  blocks: ScheduleBlock[];
  issues: ScheduleIssue[];
  valid: boolean;
}

function isPeriod(value: string): value is DayPeriod {
  return DAY_PERIODS.includes(value as DayPeriod);
}

function validDuration(value: number, startPeriod: DayPeriod): boolean {
  return Number.isInteger(value) && value >= 1 && value <= DAY_PERIODS.length - PERIOD_INDEX[startPeriod];
}

/**
 * Expands recurring commitments and dated activities into a simple 7-day,
 * three-period grid. Periods are broad planning blocks, not simulated hours.
 */
export function buildWeeklySchedule(weekStart: string, schedule: WeeklySchedule): WeeklyScheduleResult {
  const issues: ScheduleIssue[] = [];
  let normalizedWeekStart: string;
  try {
    normalizedWeekStart = getWeekStart(weekStart);
    if (normalizedWeekStart !== weekStart) {
      issues.push({ code: 'invalid-week-start', message: 'The schedule must start on a Monday.' });
    }
  } catch {
    return { blocks: [], issues: [{ code: 'invalid-week-start', message: 'The week start must be a valid ISO date.' }], valid: false };
  }

  const blocks: ScheduleBlock[] = [];
  for (let weekday = 1; weekday <= 7; weekday += 1) {
    const date = addCalendarDays(normalizedWeekStart, weekday - 1);
    for (const period of DAY_PERIODS) {
      blocks.push({ date, weekday, period, entryId: null, title: null, domain: null });
    }
  }

  if (!schedule || schedule.version !== 1 || !Array.isArray(schedule.commitments) || !Array.isArray(schedule.activities)) {
    issues.push({ code: 'invalid-duration', message: 'The weekly schedule data is not supported.' });
    return { blocks, issues, valid: false };
  }

  const seenIds = new Set<string>();
  const placements: Array<{
    id: string;
    title: string;
    domain: ScheduleBlock['domain'];
    date: string;
    startPeriod: DayPeriod;
    durationBlocks: number;
  }> = [];

  const registerId = (id: string) => {
    if (!id || seenIds.has(id)) {
      issues.push({ code: 'duplicate-id', entryId: id, message: 'Schedule entry IDs must be non-empty and unique.' });
      return false;
    }
    seenIds.add(id);
    return true;
  };

  for (const commitment of schedule.commitments as WeeklyCommitment[]) {
    if (!registerId(commitment.id)) continue;
    if (!Number.isInteger(commitment.weekday) || commitment.weekday < 1 || commitment.weekday > 7) {
      issues.push({ code: 'invalid-weekday', entryId: commitment.id, message: 'A recurring commitment must use a weekday from Monday to Sunday.' });
      continue;
    }
    if (!isPeriod(commitment.startPeriod)) {
      issues.push({ code: 'invalid-period', entryId: commitment.id, message: 'A commitment must start in the morning, afternoon, or evening.' });
      continue;
    }
    if (!validDuration(commitment.durationBlocks, commitment.startPeriod)) {
      issues.push({ code: 'invalid-duration', entryId: commitment.id, message: 'A commitment must occupy one or more available periods on the same day.' });
      continue;
    }
    placements.push({
      id: commitment.id,
      title: commitment.title,
      domain: commitment.domain,
      date: addCalendarDays(normalizedWeekStart, commitment.weekday - 1),
      startPeriod: commitment.startPeriod,
      durationBlocks: commitment.durationBlocks
    });
  }

  for (const activity of schedule.activities as PlannedActivity[]) {
    if (!registerId(activity.id)) continue;
    let activityWeek: string;
    try {
      activityWeek = getWeekStart(activity.date);
    } catch {
      issues.push({ code: 'invalid-date', entryId: activity.id, message: 'A planned activity must use a valid ISO date.' });
      continue;
    }
    if (activityWeek !== normalizedWeekStart) {
      issues.push({ code: 'outside-week', entryId: activity.id, date: activity.date, message: 'A planned activity must belong to the week being displayed.' });
      continue;
    }
    if (!isPeriod(activity.startPeriod)) {
      issues.push({ code: 'invalid-period', entryId: activity.id, date: activity.date, message: 'An activity must start in the morning, afternoon, or evening.' });
      continue;
    }
    if (!validDuration(activity.durationBlocks, activity.startPeriod)) {
      issues.push({ code: 'invalid-duration', entryId: activity.id, date: activity.date, message: 'An activity must occupy one or more available periods on the same day.' });
      continue;
    }
    placements.push({
      id: activity.id,
      title: activity.action?.kind === 'work'\n        ? (activity.action.workAction === 'apply' ? 'Job application: ' : 'Job interview: ') + activity.action.title\n        : activity.activityId,
      domain: 'activity',
      date: activity.date,
      startPeriod: activity.startPeriod,
      durationBlocks: activity.durationBlocks
    });
  }

  for (const placement of placements) {
    const start = PERIOD_INDEX[placement.startPeriod];
    for (let offset = 0; offset < placement.durationBlocks; offset += 1) {
      const period = DAY_PERIODS[start + offset];
      const block = blocks.find((item) => item.date === placement.date && item.period === period);
      if (!block) continue;
      if (block.entryId) {
        issues.push({
          code: 'overlap',
          entryId: placement.id,
          conflictingEntryId: block.entryId,
          date: placement.date,
          period,
          message: 'This time period is already reserved by another commitment or activity.'
        });
        continue;
      }
      block.entryId = placement.id;
      block.title = placement.title;
      block.domain = placement.domain;
    }
  }

  return { blocks, issues, valid: issues.length === 0 };
}

/** Counts genuinely unreserved periods; it does not impose a target or quota. */
export function countFreeTimeBlocks(weekStart: string, schedule: WeeklySchedule): number {
  const result = buildWeeklySchedule(weekStart, schedule);
  if (!result.valid) return 0;
  return result.blocks.filter((block) => block.entryId === null).length;
}

/** Safe default for new characters and legacy saves without schedule data. */
export function getWeeklySchedule(schedule?: WeeklySchedule): WeeklySchedule {
  if (!schedule) return { version: 1, commitments: [], activities: [] };
  return schedule;
}
