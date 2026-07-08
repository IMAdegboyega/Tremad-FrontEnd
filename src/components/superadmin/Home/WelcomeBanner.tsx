'use client';

import React from 'react';
import Image from 'next/image';
import { useUser } from '@/Constants/UserContext';
import { Skeleton } from '@/components/ui/skeleton';
import { toTitleCase } from '@/lib/utils';

/**
 * SuperAdmin welcome banner.
 *
 * Identity comes from UserContext, which hydrates from the Google-login payload
 * persisted in localStorage (firstName / lastName / profileImage). We show a
 * Skeleton while the provider is still bootstrapping so we never flash the
 * fallback "Admin" greeting to a signed-in user.
 */
const WelcomeBanner = () => {
  const user = useUser();

  // While UserContext is still reading localStorage OR the stored payload
  // doesn't yet have a firstName. Keeps the banner from flashing "Admin".
  const isLoadingIdentity = !user || (user.loading && !user.firstName);
  const greetingName = toTitleCase(user?.firstName) || 'Admin';

  return (
    <div className='flex bg-gradient-to-r from-green-800 to-lime-400 rounded-xl p-4 lg:p-6 text-white'>
      <div className='flex flex-col items-start justify-center space-y-1'>
        {isLoadingIdentity ? (
          <>
            <Skeleton className='h-7 lg:h-10 w-48 lg:w-72 bg-white/30' />
            <Skeleton className='h-4 lg:h-5 w-56 lg:w-80 bg-white/20' />
          </>
        ) : (
          <>
            <h1 className='text-2xl lg:text-4xl font-semibold'>
              Welcome, {greetingName}
            </h1>
            <p className='text-sm lg:text-base text-gray-100'>
              Here is what is happening at Tremad schools today
            </p>
          </>
        )}
      </div>
      <div className='flex items-center justify-center ml-auto'>
        <Image
          src='/img/ladywriting.svg'
          alt='Admin Dashboard'
          width={150}
          height={150}
          className='w-24 h-24 lg:w-[150px] lg:h-[150px]'
        />
      </div>
    </div>
  );
};

export default WelcomeBanner;
