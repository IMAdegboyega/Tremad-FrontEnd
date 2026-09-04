/**
 * Academic year helpers.
 *
 * A Nigerian school session runs roughly September → July, so the "current"
 * academic year depends on the month: in October 2026 you're in 2026/2027, but
 * in March 2026 you're still in 2025/2026.
 *
 * These exist so every screen picks years from ONE canonical list. Previously
 * the academic year was a free-text box, which let "2026", "2026/2027" and
 * "2026/27" all land in the database and made the year filters look broken.
 */

/** Canonical format for a session, e.g. "2026/2027". */
export const formatAcademicYear = (startYear: number) => `${startYear}/${startYear + 1}`;

/** The session we're currently in. Rolls over in September (month index 8). */
export const getCurrentAcademicYear = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const startYear = date.getMonth() >= 8 ? year : year - 1;
  return formatAcademicYear(startYear);
};

/**
 * A picker-friendly range of sessions around the current one.
 *
 * Defaults to 3 back and 100 forward — the school shouldn't ever hit the end of
 * the list, so we just stack them and let the user scroll.
 */
export const getAcademicYearOptions = (options?: {
  back?: number;
  forward?: number;
  date?: Date;
}): string[] => {
  const { back = 3, forward = 100, date = new Date() } = options ?? {};
  const currentStart = parseInt(getCurrentAcademicYear(date).slice(0, 4), 10);
  const years: string[] = [];
  for (let y = currentStart - back; y <= currentStart + forward; y++) {
    years.push(formatAcademicYear(y));
  }
  return years;
};

/**
 * Guarantees `value` appears in the option list.
 *
 * Older records may hold a legacy value (a bare "2026", say). Without this a
 * <select> would silently fall back to its first option and quietly rewrite the
 * record's year on save.
 */
export const withAcademicYear = (
  options: string[],
  value?: string | null
): string[] => (value && !options.includes(value) ? [value, ...options] : options);
