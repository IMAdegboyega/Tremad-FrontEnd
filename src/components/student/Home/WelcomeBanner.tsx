'use client';

import { useUser } from '@/Constants/UserContext';
import { Skeleton } from '@/components/ui/skeleton';
import { toTitleCase } from '@/lib/utils';
import Image from 'next/image';
import React from 'react';

const WelcomeBanner = () => {
  const user = useUser();
  if (!user) return null;

  const isLoadingIdentity = user.loading && !user.firstName;

  // Display-only: capitalize the first letter of the first name so the banner
  // reads "Hi Iretomiwa!" even if the DB value is "iretomiwa" or "IRETOMIWA".
  const greetingName = toTitleCase(user.firstName) || 'there';

  return (
    <div>
      <div className='flex bg-gradient-to-r from-green-800 to-lime-400 rounded-xl lg:rounded-2xl p-3 lg:p-4 text-white'>
        <div className='flex flex-col items-start justify-center p-2 lg:p-4 space-y-0.5 lg:space-y-1'>
          {isLoadingIdentity ? (
            <>
              <Skeleton className='h-7 lg:h-10 w-40 lg:w-64 bg-white/30' />
              <Skeleton className='h-4 lg:h-5 w-24 lg:w-32 bg-white/20' />
              <Skeleton className='h-4 lg:h-5 w-48 lg:w-60 bg-white/20' />
            </>
          ) : (
            <>
              <h1 className='text-xl lg:text-4xl font-semibold lg:font-base'>
                Hi {greetingName}!
              </h1>
              {user.id && (
                <span className='text-xs lg:text-base font-base text-gray-200 lg:text-gray-300'>
                  {user.id}
                </span>
              )}
              <span className='text-xs lg:text-base font-base text-gray-200 lg:text-gray-300'>
                {[user.grade, user.classCategory, user.term]
                  .filter(Boolean)
                  .join(' • ')}
              </span>
            </>
          )}
          <h2 className='text-sm lg:text-2xl font-base pt-1 lg:pt-0'>
            Welcome to the Tremad Schools portal
          </h2>
        </div>
        <div className='flex items-center justify-center ml-auto p-2 lg:p-4'>
          <Image
            src={'/img/ladywriting.svg'}
            alt='penLady'
            width={100}
            height={100}
            className='w-16 h-16 lg:w-[100px] lg:h-[100px]'
          />
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;
