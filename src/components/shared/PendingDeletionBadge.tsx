import React from 'react';
import { Clock } from 'lucide-react';
import {
  DeletionState,
  isUrgent,
  purgeCountdown,
  purgeDetail,
} from '@/Constants/retention';

/**
 * The yellow clock that sits beside the name of someone who has been deleted
 * but is still inside their 365-day restore window.
 *
 * Sibling to ClassTeacherBadge, and placed the same way — immediately after
 * the name, inline, so the status travels with the person wherever their name
 * appears rather than living in a column the eye skips.
 *
 * WHY THE NAME STILL APPEARS AT ALL
 *
 * Deleting used to hide the row. That made the one window in which the
 * deletion is reversible the one window in which there's nothing to click. The
 * row stays, greyed and badged, for as long as it can still be undone.
 *
 * Renders NOTHING for a live user. That matters more than it looks: every call
 * site can pass the whole record unconditionally without guarding, which is
 * why this can be dropped beside a name in a dozen places without each one
 * inventing its own `user.isDeleted &&` check to get subtly wrong.
 */

interface Props {
  user?: DeletionState | null;
  /** `full` adds the countdown text; `icon` is the bare clock for tight rows. */
  variant?: 'icon' | 'full';
  size?: number;
  className?: string;
}

const PendingDeletionBadge: React.FC<Props> = ({
  user,
  variant = 'icon',
  size = 14,
  className = '',
}) => {
  if (!user?.isDeleted) return null;

  const urgent = isUrgent(user);
  const detail = purgeDetail(user);

  // Amber for most of the window, red for the back half — see isUrgent.
  const tone = urgent
    ? 'text-red-600 bg-red-50 border-red-200'
    : 'text-amber-600 bg-amber-50 border-amber-200';

  if (variant === 'icon') {
    return (
      <span
        title={detail}
        className={`inline-flex shrink-0 align-middle ${
          urgent ? 'text-red-500' : 'text-amber-500'
        } ${className}`}
      >
        <Clock size={size} aria-hidden="true" />
        {/*
          The icon alone is decoration. Screen readers get the full sentence,
          because "clock" beside a child's name conveys nothing about what is
          going to happen to their record.
        */}
        <span className="sr-only">{detail}</span>
      </span>
    );
  }

  return (
    <span
      title={detail}
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium align-middle ${tone} ${className}`}
    >
      <Clock size={size - 2} aria-hidden="true" />
      {purgeCountdown(user)}
      <span className="sr-only">{detail}</span>
    </span>
  );
};

export default PendingDeletionBadge;
