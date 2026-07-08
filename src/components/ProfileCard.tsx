'use client';

import React from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/Constants/UserContext';
import { toTitleCase, getInitials } from '@/lib/utils';

const ProfileCard = () => {
  const user = useUser();
  if (!user) return null;

  const isLoadingIdentity = user.loading && !user.name;

  // Safe fallbacks so the header never shows placeholder mock data. Name is
  // title-cased at the display layer so DB values like "IRETOMIWA ADEGBOYEGA"
  // read as "Iretomiwa Adegboyega".
  const displayName =
    toTitleCase(user.name) ||
    (user.role === 'super_admin' ? 'Super Admin' : user.email || '—');
  const secondaryLine = user.id || user.email || '';
  const initials = getInitials(user.firstName, user.lastName, user.email);
  // Suppress the static /img/avatar.jpg fallback so we render initials instead.
  const avatarUrl =
    user.profile?.profileImage ||
    user.profile?.profilePicture ||
    (user.avatarUrl && user.avatarUrl !== '/img/avatar.jpg' ? user.avatarUrl : null);

  return (
    <Popover>
      <PopoverTrigger asChild>
        {/* Make the whole thing clickable */}
        <button className='flex items-center space-x-3 cursor-pointer focus:outline-none'>
          {/* Avatar */}
          <div className='w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-lime-400 to-green-500 flex items-center justify-center'>
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={displayName || 'Profile'}
                width={40}
                height={40}
                className='w-full h-full object-cover'
              />
            ) : initials ? (
              <span className='text-white text-sm font-semibold select-none'>
                {initials}
              </span>
            ) : null}
          </div>

          {/* Name & ID */}
          <div className='flex flex-col leading-tight text-left'>
            {isLoadingIdentity ? (
              <>
                <Skeleton className='h-4 w-28 mb-1' />
                <Skeleton className='h-3 w-20' />
              </>
            ) : (
              <>
                <span className='text-base font-semibold text-gray-900'>
                  {displayName}
                </span>
                {secondaryLine && (
                  <span className='text-base text-gray-500'>{secondaryLine}</span>
                )}
              </>
            )}
          </div>

          {/* Dropdown Icon */}
          <ChevronDown className='w-4 h-4 text-gray-500' />
        </button>
      </PopoverTrigger>

      <PopoverContent className='flex w-56 h-65 p-4 items-center justify-center rounded-3xl'>
        <div className='flex flex-col items-center text-center space-y-2'>
          <div className='w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-lime-400 to-green-500 flex items-center justify-center'>
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={displayName || 'Profile'}
                width={100}
                height={100}
                className='w-full h-full object-cover'
              />
            ) : initials ? (
              <span className='text-white text-2xl font-semibold select-none'>
                {initials}
              </span>
            ) : null}
          </div>

          {isLoadingIdentity ? (
            <>
              <Skeleton className='h-5 w-32' />
              <Skeleton className='h-4 w-24' />
            </>
          ) : (
            <>
              <h2 className='text-lg font-semibold text-black'>{displayName}</h2>
              {secondaryLine && (
                <span className='text-base text-gray-600'>{secondaryLine}</span>
              )}

              {(user.grade || user.term) && (
                <p className='text-base text-gray-400'>
                  {[user.grade, user.term].filter(Boolean).join(' · ')}
                </p>
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ProfileCard;
