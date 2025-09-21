import { useUser } from '@/Constants/UserContext';
import Image from 'next/image';
import React from 'react'

const WelcomeBanner = () => {

    const user = useUser();
    if (!user) return null;


  return (
    <div>
        <div className='flex bg-gradient-to-r from-green-800 to-lime-400 rounded-2xl p-4 text-white'>
          <div className='flex flex-col items-start justify-center p-4 space-y-1'>
            <h1 className='text-4xl font-base'>Hi {user.firstName}!</h1>
            <span className='font-base text-gray-300'>{user.id}</span>
            <span className='font-base text-gray-300'>
              <p>{user.grade} {user.classCategory} {user.term}</p>
            </span>
            <h2 className='text-2xl font-base'>Welcome To TREMAD Schools Portal.</h2>
          </div>
          <div className='flex items-center justify-center ml-auto p-4'>
            <Image
              src={'/img/ladywriting.svg'}
              alt='penLady'
              width={100}
              height={100}
            />
          </div>
        </div>
    </div>
  )
}

export default WelcomeBanner