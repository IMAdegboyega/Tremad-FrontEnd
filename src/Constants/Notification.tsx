import type { Notification as ApiNotification } from '@/lib/api/student.service';

/**
 * UI-side notification shape. Keeps the older field names the components
 * were built around (`description`, `date`, `iconBg`, `read`) but is now
 * derived from the API's Notification contract instead of mock data.
 */
export interface UiNotification {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: 'info' | 'warning' | 'success' | 'system' | 'project' | 'assignment' | 'announcement' | 'grade' | 'attendance';
  read: boolean;
  iconBg?: string;
}

const typeToIconBg: Record<string, string> = {
  info: 'bg-blue-100',
  warning: 'bg-orange-100',
  success: 'bg-green-100',
  system: 'bg-gray-100',
  project: 'bg-blue-100',
  assignment: 'bg-orange-100',
  announcement: 'bg-purple-100',
  grade: 'bg-green-100',
  attendance: 'bg-pink-100',
};

/**
 * Normalize an API Notification into the UI shape. Safe to call with partial
 * data; missing fields collapse to sensible defaults.
 */
export const toUiNotification = (n: ApiNotification): UiNotification => ({
  id: n._id,
  title: n.title || '(Untitled)',
  description: n.message || '',
  date: n.createdAt ? new Date(n.createdAt) : new Date(),
  type: (n.type as UiNotification['type']) || 'info',
  read: !!n.read,
  iconBg: typeToIconBg[n.type] || 'bg-gray-100',
});

/**
 * Human-friendly relative date label, e.g. "5 minutes ago", "Yesterday".
 */
export const formatNotificationDate = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Bucket notifications into today / yesterday / older for sectioned rendering.
 */
export const groupNotifications = (items: UiNotification[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  return {
    today: items.filter((n) => n.date >= today),
    yesterday: items.filter((n) => n.date >= yesterday && n.date < today),
    older: items.filter((n) => n.date < yesterday),
  };
};
