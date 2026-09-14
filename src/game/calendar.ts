/**
 * Turns the game's simple day counter into a real calendar date.
 * The game begins the day the original iPhone went on sale in the US, and
 * the historical news timeline (see news.ts) is keyed off these real dates.
 */

/** Day 1 of the game = June 29, 2007 — the day the first iPhone went on sale. */
export const START_DATE = new Date(Date.UTC(2007, 5, 29));

/** The calendar date for a given day number (day 1 = START_DATE). */
export function dateForDay(day: number): Date {
  const date = new Date(START_DATE);
  date.setUTCDate(date.getUTCDate() + (day - 1));
  return date;
}

/** True if two dates fall on the same year/month/day (ignores time of day). */
export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

/** Parse a "YYYY-MM-DD" string as a UTC date, so it compares cleanly with dateForDay. */
export function parseISODate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}
