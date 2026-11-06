import { describe, expect, it } from 'vitest';
import { addCalendarDays, createGameCalendar, getAgeAtDate, getFirstWeekStartOfYear, getNextWeekDate, getWeekStart, isLeapYear } from './calendar';

describe('game calendar', () => {
  it('uses Monday through Sunday week boundaries', () => {
    expect(getWeekStart('2026-11-06')).toBe('2026-11-02');
    expect(getWeekStart('2026-11-02')).toBe('2026-11-02');
    expect(getWeekStart('2026-11-08')).toBe('2026-11-02');
  });

  it('advances exactly seven calendar days across month and year boundaries', () => {
    expect(getNextWeekDate('2026-01-26')).toBe('2026-02-02');
    expect(getNextWeekDate('2026-12-28')).toBe('2027-01-04');
    expect(addCalendarDays('2024-02-28', 1)).toBe('2024-02-29');
  });

  it('finds the first Monday on or after January 1', () => {
    expect(getFirstWeekStartOfYear(2026)).toBe('2026-01-05');
    expect(getFirstWeekStartOfYear(2027)).toBe('2027-01-04');
  });

  it('calculates completed age only on the birthday', () => {
    expect(getAgeAtDate('2008-01-05', '2026-01-04')).toBe(17);
    expect(getAgeAtDate('2008-01-05', '2026-01-05')).toBe(18);
    expect(getAgeAtDate('2008-01-05', '2026-01-06')).toBe(18);
  });

  it('observes February 29 birthdays on March 1 in non-leap years', () => {
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(1900)).toBe(false);
    expect(getAgeAtDate('2004-02-29', '2025-02-28')).toBe(20);
    expect(getAgeAtDate('2004-02-29', '2025-03-01')).toBe(21);
    expect(getAgeAtDate('2004-02-29', '2024-02-29')).toBe(20);
  });

  it('creates a calendar that preserves the requested starting age', () => {
    const calendar = createGameCalendar(18, 2026);
    expect(calendar).toEqual({ currentDate: '2026-01-05', birthDate: '2008-01-05' });
    expect(getAgeAtDate(calendar.birthDate, calendar.currentDate)).toBe(18);
  });

  it('rejects invalid dates and impossible chronology', () => {
    expect(() => getWeekStart('2026-02-30')).toThrow(RangeError);
    expect(() => getWeekStart('2026/02/28')).toThrow(RangeError);
    expect(() => getAgeAtDate('2020-01-01', '2019-12-31')).toThrow(RangeError);
  });
});
