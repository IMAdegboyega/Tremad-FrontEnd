/**
 * Canonical class/grade list — the single source of truth.
 *
 * Used by the Add Student form ("Current Grade"), the Add Staff form, and the
 * Timetable builder, so a timetable built for a grade is guaranteed to match
 * the value stored on a student. Previously each screen kept its own copy,
 * which is how they drift.
 *
 * Mirrors tremad-backend/src/utils/classes.js. Change one, change both.
 */

export const GRADE_LEVELS = [
  'Basic 1',
  'Basic 2',
  'Basic 3',
  'Basic 4',
  'Basic 5',
  'Basic 6',
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
 * The grades that belong to the secondary school.
 *
 * Listed explicitly rather than sniffed for "JSS"/"SS" in the string. Sniffing
 * works right up until a grade arrives whose name happens to contain those
 * letters, and then it fails silently — a student quietly filed under the
 * wrong division with nothing to notice. An explicit set fails loudly instead:
 * a new grade is 'school' unless it is named here.
 */
export const COLLEGE_GRADES: readonly string[] = [
  'JSS 1',
  'JSS 2',
  'JSS 3',
  'SS 1',
  'SS 2',
  'SS 3',
];

export type Division = 'college' | 'school';

/** What each division is called in the UI. */
export const DIVISION_LABELS: Record<Division, string> = {
  college: 'TREMAD COLLEGE',
  school: 'TREMAD SCHOOL',
};

/**
 * Class names that used to be stored under a different spelling.
 *
 * "Primary 1-6" became "Basic 1-6". The rename ships with a migration, but a
 * database is only ever migrated at a moment in time — and between deploying
 * this code and running the script, rows still say "Primary". Rather than have
 * those students silently match no timetable, every read normalises first.
 * That is what makes the migration safe to run late, or twice, or never.
 *
 * Keyed on the leading word, so "Primary 3 B" -> "Basic 3 B" with the section
 * left intact.
 */
const LEGACY_GRADE_PREFIXES: Record<string, string> = {
  primary: 'Basic',
};

const LEGACY_PATTERN = new RegExp(
  `^(${Object.keys(LEGACY_GRADE_PREFIXES).join('|')})\\b`,
  'i'
);

/**
 * Rewrite a legacy class name to its current spelling. Anything already
 * current, or unrecognised, comes back untouched.
 *
 *   normaliseClassName('Primary 3 B') === 'Basic 3 B'
 *   normaliseClassName('JSS 1')       === 'JSS 1'
 */
export const normaliseClassName = (className?: string | null): string => {
  if (!className) return '';
  return className
    .trim()
    .replace(
      LEGACY_PATTERN,
      (word) => LEGACY_GRADE_PREFIXES[word.toLowerCase()] ?? word
    );
};

// Longest first, so a grade is never shadowed by a shorter one that happens to
// be its prefix. Computed once rather than re-sorted on every call.
const BY_LENGTH = [...GRADE_LEVELS].sort((a, b) => b.length - a.length);

/**
 * No grade may be a prefix of another at a space boundary.
 *
 * gradeOf() matches `value === g || value.startsWith(g + ' ')`, so if 'Basic 1'
 * and 'Basic 1 Upper' both existed, a student in 'Basic 1 Upper A' would
 * resolve to whichever sorted first — and read the wrong class's timetable.
 * Today's list is fine; this exists so that the day someone adds a grade that
 * isn't, they find out at startup rather than through a support ticket.
 *
 * Safe to throw: GRADE_LEVELS is a literal, so this cannot depend on runtime
 * data. If it passes once it passes always.
 */
for (const a of GRADE_LEVELS) {
  for (const b of GRADE_LEVELS) {
    if (a !== b && b.startsWith(`${a} `)) {
      throw new Error(
        `classes.ts: "${a}" is a prefix of "${b}". gradeOf() cannot tell them ` +
          `apart — rename one of them.`
      );
    }
  }
}

/**
 * The grade part of a stored class name, normalising legacy spellings on the
 * way.
 *
 * Students are saved with their section ('JSS 1 A') but timetables are built
 * per grade ('JSS 1'), so this maps one to the other.
 *   gradeOf('JSS 1 A')     === 'JSS 1'
 *   gradeOf('JSS 1')       === 'JSS 1'
 *   gradeOf('Basic 6 B')   === 'Basic 6'
 *   gradeOf('Primary 6 B') === 'Basic 6'   (unmigrated row, still resolves)
 */
export const gradeOf = (className?: string | null): string => {
  if (!className) return '';
  const value = normaliseClassName(className);
  const match = BY_LENGTH.find(
    (g) => value === g || value.startsWith(`${g} `)
  );
  return match ?? value;
};

/**
 * Which half of the school a class belongs to.
 *
 * JSS 1 through SS 3 are the college; everything else — including grades that
 * do not exist yet, and unrecognised or missing values — is the school.
 * Defaulting to 'school' is deliberate: it is the safer wrong answer, since
 * the college label on a six-year-old's portal is more jarring than the
 * reverse.
 *
 *   divisionOf('SS 2 A')    === 'college'
 *   divisionOf('Basic 3')   === 'school'
 *   divisionOf('Primary 3') === 'school'
 *   divisionOf(undefined)   === 'school'
 */
export const divisionOf = (className?: string | null): Division =>
  COLLEGE_GRADES.includes(gradeOf(className)) ? 'college' : 'school';

/**
 * The brand shown to a student in that class — 'TREMAD COLLEGE' for JSS/SS,
 * 'TREMAD SCHOOL' for everyone below.
 */
export const divisionLabelFor = (className?: string | null): string =>
  DIVISION_LABELS[divisionOf(className)];
