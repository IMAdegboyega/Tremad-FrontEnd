import React from 'react';

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Skeleton
 *
 * Simple shimmering placeholder used while async data is loading.
 * Pass tailwind sizing via `className` (e.g. "h-4 w-32").
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  ...props
}) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200/70 ${className}`}
      {...props}
    />
  );
};

export default Skeleton;
