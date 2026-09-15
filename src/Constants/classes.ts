/**
 * Canonical class/grade list — the single source of truth.
 *
 * Used by the Add Student form ("Current Grade") and the Timetable builder, so
 * a timetable built for a grade is guaranteed to match the value stored on a
 * student. Previously each screen kept its own copy, which is how they drift.
 */

export const GRADE_LEVELS = [
  'Primary 1',
  'Primary 2',
  'Primary 3',
  'Primary 4',
  'Primary 5',
  'Primary 6',
  'JSS 1',
  'JSS 2',
  'JSS 3',
  'SS 1',
  'SS 2',
  'SS 3',
] as const;

export type GradeLevel = (typeof GRADE_LEVELS)[number];

/** Sections within a grade, e.g. "JSS 1 A". */
export const CLASS_SECTIONS = ['A', 'B', 'C', 'D', 'E'] as const;

/**
 * The grade part of a stored class name.
 *
 * Students are saved with their section ("JSS 1 A") but timetables are built
 * per grade ("JSS 1"), so this maps one to the other.
 *   gradeOf('JSS 1 A') === 'JSS 1'
 *   gradeOf('JSS 1')   === 'JSS 1'
 */
export const gradeOf = (className?: string | null): string => {
  if (!className) return '';
  const value = className.trim();
  // Longest match wins, so "Primary 1" isn't shadowed by a shorter prefix.
  const match = [...GRADE_LEVELS]
    .sort((a, b) => b.length - a.length)
    .find((g) => value === g || value.startsWith(`${g} `));
  return match ?? value;
};
