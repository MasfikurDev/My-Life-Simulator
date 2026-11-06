const DAY_MS = 24 * 60 * 60 * 1000;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function utcDate(year: number, monthIndex: number, day: number): Date {
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, monthIndex, day);
  return date;
}

function parseDate(value: string): Date {
  const match = DATE_PATTERN.exec(value);
  if (!match) throw new RangeError('Date must use YYYY-MM-DD format.');
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = utcDate(year, month - 1, day);
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new RangeError('Date is not a valid calendar day.');
  }
  return date;
}

function formatDate(date: Date): string {
  return [date.getUTCFullYear().toString().padStart(4, '0'), (date.getUTCMonth() + 1).toString().padStart(2, '0'), date.getUTCDate().toString().padStart(2, '0')].join('-');
}

export function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

export function addCalendarDays(value: string, days: number): string {
  if (!Number.isInteger(days)) throw new RangeError('Calendar day offset must be an integer.');
  const date = parseDate(value);
  date.setTime(date.getTime() + days * DAY_MS);
  return formatDate(date);
}

/** Returns the Monday belonging to the Monday–Sunday week containing value. */
export function getWeekStart(value: string): string {
  const date = parseDate(value);
  const daysSinceMonday = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - daysSinceMonday);
  return formatDate(date);
}

/** Returns the first Monday on or after January 1 of the supplied year. */
export function getFirstWeekStartOfYear(year: number): string {
  if (!Number.isInteger(year) || year < 1 || year > 9998) throw new RangeError('Year is outside the supported calendar range.');
  const januaryFirst = `${year.toString().padStart(4, '0')}-01-01`;
  const weekStart = getWeekStart(januaryFirst);
  return weekStart === januaryFirst ? weekStart : addCalendarDays(weekStart, 7);
}

function birthdayInYear(birthDate: Date, year: number): Date {
  const month = birthDate.getUTCMonth();
  const day = birthDate.getUTCDate();
  if (month === 1 && day === 29 && !isLeapYear(year)) return utcDate(year, 2, 1);
  return utcDate(year, month, day);
}

/** Age in completed years. February 29 birthdays fall on March 1 in non-leap years. */
export function getAgeAtDate(birthDateValue: string, currentDateValue: string): number {
  const birthDate = parseDate(birthDateValue);
  const currentDate = parseDate(currentDateValue);
  if (currentDate < birthDate) throw new RangeError('Current date cannot be earlier than the birth date.');
  let age = currentDate.getUTCFullYear() - birthDate.getUTCFullYear();
  if (currentDate < birthdayInYear(birthDate, currentDate.getUTCFullYear())) age -= 1;
  return age;
}

/** Creates a backward-compatible starting calendar without changing the chosen starting age. */
export function createGameCalendar(age: number, year: number): { currentDate: string; birthDate: string } {
  if (!Number.isInteger(age) || age < 0 || age > 120) throw new RangeError('Starting age must be an integer from 0 to 120.');
  const currentDate = getFirstWeekStartOfYear(year);
  const birthDate = `${(year - age).toString().padStart(4, '0')}-${currentDate.slice(5)}`;
  return { currentDate, birthDate };
}

/** Returns the same weekday in the following week. */
export function getNextWeekDate(currentDate: string): string {
  return addCalendarDays(currentDate, 7);
}
