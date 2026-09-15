'use client';

/**
 * Photo-or-initials avatar for staff.
 *
 * Deliberately has no generated-cartoon fallback (unlike the student avatar,
 * which seeds DiceBear): a cartoon character next to a teacher's name in an
 * admin table reads as placeholder data. Real photo, or their initials.
 *
 * `onError` matters — a Cloudinary URL that 404s (deleted asset, bad env on a
 * new environment) would otherwise render as a broken-image icon. Falling back
 * to initials keeps the UI intact.
 */

import React, { useEffect, useState } from 'react';
import { getUploadedAvatarUrl } from '@/lib/utils';

interface Props {
  user?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    profileImage?: string | null;
    profilePicture?: string | null;
  } | null;
  /** Tailwind sizing for the circle, e.g. "w-10 h-10". */
  className?: string;
  /** Tailwind classes for the initials text. */
  textClassName?: string;
  /** Circle background when showing initials. */
  fallbackClassName?: string;
}

const initialsOf = (user: Props['user']): string => {
  const first = (user?.firstName || '').trim();
  const last = (user?.lastName || '').trim();
  if (first || last) return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  const email = (user?.email || '').trim();
  return email ? email.charAt(0).toUpperCase() : '?';
};

const UserAvatar: React.FC<Props> = ({
  user,
  className = 'w-10 h-10',
  textClassName = 'text-sm font-medium text-gray-600',
  fallbackClassName = 'bg-gray-200',
}) => {
  const url = getUploadedAvatarUrl(user);
  const [errored, setErrored] = useState(false);

  // A different user (or a freshly uploaded photo) deserves another attempt.
  useEffect(() => {
    setErrored(false);
  }, [url]);

  const name =
    `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Profile photo';

  if (url && !errored) {
    return (
      <div className={`${className} rounded-full overflow-hidden bg-gray-100 shrink-0`}>
        {/* Cloudinary is an external host; next/image would need it allow-listed. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setErrored(true)}
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div
      className={`${className} ${fallbackClassName} rounded-full shrink-0 flex items-center justify-center overflow-hidden`}
    >
      <span className={textClassName}>{initialsOf(user)}</span>
    </div>
  );
};

export default UserAvatar;
