import React from 'react'
import Image from 'next/image'

const WelcomeBanner = () => {
  // You can replace this with actual user context
  const adminName = "Tomiwa"

  return (
    <div className='flex bg-gradient-to-r from-green-800 to-lime-400 rounded-xl p-4 lg:p-6 text-white'>
      <div className='flex flex-col items-start justify-center space-y-1'>
        <h1 className='text-2xl lg:text-4xl font-semibold'>Welcome, {adminName}</h1>
        <p className='text-sm lg:text-base text-gray-100'>
          Here is what is happening at Tremad schools today
        </p>
      </div>
      <div className='flex items-center justify-center ml-auto'>
        <Image
          src='/img/ladywriting.svg' // Replace with your actual image
          alt='Admin Dashboard'
          width={150}
          height={150}
          className='w-24 h-24 lg:w-[150px] lg:h-[150px]'
        />
      </div>
    </div>
  )
}

export default WelcomeBanner