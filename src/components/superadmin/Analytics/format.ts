import { format, formatDistanceToNow } from 'date-fns';
import type { SessionDevice } from '@/lib/api/superAdmin.service';

/** "12 Jun 2026, 14:30" — absolute timestamp for a login/session row. */
export const fmtDateTime = (value?: string | null): string => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return format(d, 'd MMM yyyy, HH:mm');
};

/** "3 hours ago" — relative time, used for last activity / last login. */
export const fmtRelative = (value?: string | null): string => {
  if (!value) return 'never';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'never';
  return `${formatDistanceToNow(d)} ago`;
};

/** Compact device label like "Chrome · Windows" / "Safari · iOS". */
export const deviceLabel = (device?: SessionDevice): string => {
  if (!device) return 'Unknown device';
  const parts = [device.browser, device.os].filter(
    (p) => p && p !== 'Unknown'
  );
  return parts.length ? parts.join(' · ') : 'Unknown device';
};

/** Tailwind classes for a role badge. */
export const roleBadgeClass = (role?: string): string => {
  switch (role) {
    case 'super_admin':
      return 'bg-purple-100 text-purple-700';
    case 'admin':
      return 'bg-blue-100 text-blue-700';
    case 'student':
      return 'bg-emerald-100 text-emerald-700';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

/** Human-friendly role label. */
export const roleLabel = (role?: string): string => {
  switch (role) {
    case 'super_admin':
      return 'Super Admin';
    case 'admin':
      return 'Staff';
    case 'student':
      return 'Student';
    default:
      return role || 'Unknown';
  }
};
