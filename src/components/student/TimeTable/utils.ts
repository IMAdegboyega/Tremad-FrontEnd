import type { TimetableEntry } from '@/lib/api/student.service';

export const WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
] as const;

/**
 * Palette cycled through by subject. Ordering is deterministic so the same
 * subject gets the same color every render.
 */
const PALETTE = [
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-green-100 text-green-700',
  'bg-pink-100 text-pink-700',
  'bg-indigo-100 text-indigo-700',
  'bg-orange-100 text-orange-700',
  'bg-cyan-100 text-cyan-700',
  'bg-teal-100 text-teal-700',
  'bg-red-100 text-red-700',
  'bg-violet-100 text-violet-700',
  'bg-emerald-100 text-emerald-700',
  'bg-rose-100 text-rose-700',
];

/**
 * Deterministic subject → tailwind color string. Uses a simple hash so the
 * same subject always maps to the same color across the week view.
 */
export const colorForSubject = (subject?: string): string => {
  if (!subject) return 'bg-gray-100 text-gray-700';
  let hash = 0;
  for (let i = 0; i < subject.length; i++) {
    hash = (hash * 31 + subject.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
};

/**
 * Normalize a "HH:MM" string — strips seconds, left-pads hours.
 */
export const normalizeTime = (t?: string): string => {
  if (!t) return '';
  const [h = '', m = '00'] = t.split(':');
  const hh = h.padStart(2, '0');
  return `${hh}:${m.slice(0, 2)}`;
};

/**
 * Collect the sorted list of unique start times across the entries.
 * Used as row headers in the WeekView and DayView.
 */
export const uniqueStartTimes = (entries: TimetableEntry[]): string[] => {
  const set = new Set<string>();
  entries.forEach((e) => {
    const t = normalizeTime(e.startTime);
    if (t) set.add(t);
  });
  return Array.from(set).sort();
};

/**
 * Bucket entries by day name (as returned from the API). Casing is preserved
 * from the API response; callers should compare case-insensitively.
 */
export const groupByDay = (
  entries: TimetableEntry[]
): Record<string, TimetableEntry[]> => {
  const acc: Record<string, TimetableEntry[]> = {};
  entries.forEach((e) => {
    const day = (e.day || '').trim();
    if (!day) return;
    if (!acc[day]) acc[day] = [];
    acc[day].push(e);
  });
  Object.values(acc).forEach((list) =>
    list.sort((a, b) =>
      normalizeTime(a.startTime).localeCompare(normalizeTime(b.startTime))
    )
  );
  return acc;
};

/**
 * Look up a single entry for a given day + start time. Case-insensitive day
 * match, exact match on normalized start time.
 */
export const entryAt = (
  entries: TimetableEntry[],
  day: string,
  startTime: string
): TimetableEntry | undefined => {
  const d = day.toLowerCase();
  const t = normalizeTime(startTime);
  return entries.find(
    (e) =>
      (e.day || '').toLowerCase() === d &&
      normalizeTime(e.startTime) === t
  );
};
