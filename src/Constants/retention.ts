/**
 * Deletion retention — the frontend half.
 *
 * MIRROR of tremad-backend/src/utils/retention.js. Keep the two in step: the
 * day count and the countdown maths must agree, or the UI will promise an
 * admin more time than the sweep actually gives them.
 *
 * Deliberately carries NO knowledge of the purge itself. Destruction is a
 * server decision; this file only knows how to describe the window.
 */

/** How long a deleted account is kept before it can be destroyed. */
export const RETENTION_DAYS = 365;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * The deletion block every user-shaped payload now carries.
 *
 * Present on live users too, with `isDeleted: false` and nulls, so a row can
 * be rendered without first checking whether the block exists.
 */
export interface DeletionState {
  isDeleted?: boolean;
  deletedAt?: string | null;
  purgeAfter?: string | null;
  /** Server-computed, so the countdown doesn't drift with the client clock. */
  daysUntilPurge?: number | null;
}

/**
 * Whole days left, rounding up, floored at 0.
 *
 * Prefers the server's `daysUntilPurge` and only computes from `purgeAfter` as
 * a fallback — a device with a wrong system clock would otherwise show a
 * confidently wrong countdown on a decision that can't be undone after it ends.
 */
export const daysLeft = (state?: DeletionState | null): number | null => {
  if (!state?.isDeleted) return null;
  if (typeof state.daysUntilPurge === 'number') return state.daysUntilPurge;
  if (!state.purgeAfter) return null;
  const ms = new Date(state.purgeAfter).getTime() - Date.now();
  if (Number.isNaN(ms)) return null;
  return Math.max(0, Math.ceil(ms / MS_PER_DAY));
};

/**
 * How the countdown reads beside a name.
 *
 * Switches to months past 60 days because "Removed in 287 days" is a number
 * nobody parses, while "Removed in about 10 months" is immediately legible. The
 * precise figure stays available in the badge's tooltip for anyone who needs it.
 */
export const purgeCountdown = (state?: DeletionState | null): string => {
  if (!state?.isDeleted) return '';
  const left = daysLeft(state);
  /**
   * Deleted, but with no purge date — an account removed by the old handler,
   * before `purgeAfter` existed. It has no clock, so there is nothing to count
   * down; say "Deleted" rather than rendering an empty badge, which is what a
   * bare '' produced and how these records were spotted in the first place.
   *
   * scripts/setup/repair-legacy-deletions.js gives them a date. Until it has
   * been run, this is the honest label.
   */
  if (left === null) return 'Deleted';
  if (left === 0) return 'Removal due';
  if (left === 1) return 'Removed tomorrow';
  if (left <= 60) return `Removed in ${left} days`;
  return `Removed in about ${Math.round(left / 30)} months`;
};

/** The long form, for tooltips and confirmation dialogs. */
export const purgeDetail = (state?: DeletionState | null): string => {
  if (!state?.isDeleted) return '';
  const left = daysLeft(state);
  // Deleted with no clock — see purgeCountdown. Say what's true: it's deleted,
  // and nothing is scheduled to remove it.
  if (left === null) {
    return 'Deleted, with no removal date set. It will not be removed automatically.';
  }
  const on = state?.purgeAfter
    ? new Date(state.purgeAfter).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;
  if (left === 0) {
    return 'The restore window for this account has closed. It can no longer be restored.';
  }
  return `Deleted. ${left} day${left === 1 ? '' : 's'} left to restore${
    on ? ` — permanently removed on ${on}` : ''
  }.`;
};

/**
 * Past the halfway mark, the badge turns red rather than amber.
 *
 * The window is long enough that amber stops registering; something has to
 * change as the deadline approaches or the badge becomes wallpaper.
 */
export const isUrgent = (state?: DeletionState | null): boolean => {
  const left = daysLeft(state);
  return left !== null && left <= Math.floor(RETENTION_DAYS / 2);
};
