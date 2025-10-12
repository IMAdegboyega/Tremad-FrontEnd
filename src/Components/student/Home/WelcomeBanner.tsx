import { useUser } from '@/Constants/UserContext';
import Image from 'next/image';
import React from 'react'

const WelcomeBanner = () => {

    const user = useUser();
    if (!user) return null;

  return (
    <div>
        <div className='flex bg-gradient-to-r from-green-800 to-lime-400 rounded-xl lg:rounded-2xl p-3 lg:p-4 text-white'>
          <div className='flex flex-col items-start justify-center p-2 lg:p-4 space-y-0.5 lg:space-y-1'>
            <h1 className='text-xl lg:text-4xl font-semibold lg:font-base'>Hi {user.firstName}!</h1>
            <span className='text-xs lg:text-base font-base text-gray-200 lg:text-gray-300'>{user.id}</span>
            <span className='text-xs lg:text-base font-base text-gray-200 lg:text-gray-300'>
              {user.grade} • {user.classCategory} • {user.term}
            </span>
            <h2 className='text-sm lg:text-2xl font-base pt-1 lg:pt-0'>Welcome to the Tremad Schools portal</h2>
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
  )
}

export default WelcomeBanner