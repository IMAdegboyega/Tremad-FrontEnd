import React from 'react';

/**
 * The class-teacher badge — a filled check in a scalloped disc, sitting beside
 * a staff member's name the way a verified tick does.
 *
 * Drawn rather than imported so it scales cleanly at the two sizes it's used
 * at (14px in a table row, 18px on the detail header) and inherits the brand
 * green rather than a stock blue.
 *
 * It always carries the grade in its `title` and its screen-reader text. A
 * bare tick beside a name means nothing on its own — "Class teacher of JSS 1"
 * is the actual information, and the badge is only the shorthand for it.
 */

interface Props {
  /** The grade they're class teacher of, e.g. "JSS 1". */
  grade: string;
  size?: number;
  className?: string;
}

const ClassTeacherBadge: React.FC<Props> = ({
  grade,
  size = 16,
  className = '',
}) => {
  const label = `Class teacher of ${grade}`;

  return (
    <span
      title={label}
      className={`inline-flex shrink-0 align-middle ${className}`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        role="img"
        aria-label={label}
        focusable="false"
      >
        {/* Scalloped disc — twelve lobes, same silhouette as a verified tick. */}
        <path
          fill="currentColor"
          d="M12 1.6l2.2 1.9 2.9-.5 1.2 2.7 2.7 1.2-.5 2.9 1.9 2.2-1.9 2.2.5 2.9-2.7 1.2-1.2 2.7-2.9-.5L12 22.4l-2.2-1.9-2.9.5-1.2-2.7-2.7-1.2.5-2.9L1.6 12l1.9-2.2-.5-2.9 2.7-1.2 1.2-2.7 2.9.5L12 1.6z"
        />
        <path
          fill="none"
          stroke="#fff"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7.8 12.2l2.9 2.9 5.5-5.8"
        />
      </svg>
    </span>
  );
};

export default ClassTeacherBadge;
