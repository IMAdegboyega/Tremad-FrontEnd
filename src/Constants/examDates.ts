/**
 * Exam date helpers.
 *
 * Exam sittings are stored as real calendar dates; the weekday is derived
 * rather than entered, so "12 June 2026" always renders as "Monday 12 June".
 *
 * Everything works in UTC: exam dates are date-only values, and parsing them in
 * local time can shift them a day either side of midnight.
 */

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

/** The weekday an exam date falls on, e.g. "Monday". */
export const weekdayOf = (value?: string | null): string | null => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : WEEKDAYS[d.getUTCDay()];
};

/** "Monday 12 June" — the format exams are displayed in. */
export const formatExamDate = (value?: string | null): string => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return `${WEEKDAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
};

/** "Monday 12 June 2026" — when the year matters (e.g. across sessions). */
export const formatExamDateLong = (value?: string | null): string => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return `${formatExamDate(value)} ${d.getUTCFullYear()}`;
};

/** Value for an <input type="date"> (YYYY-MM-DD). */
export const toDateInputValue = (value?: string | null): string => {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
};
