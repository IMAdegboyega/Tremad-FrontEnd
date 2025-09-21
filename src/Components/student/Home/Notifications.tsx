import React from 'react'
import { notifications } from '@/Constants/Notification'
import Image from 'next/image'

const Notifications = () => {

  return (
    <div className='bg-white rounded-2xl space-y-2 p-4 h-full'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-lg font-semibold text-gray-900'>
          Notifications
        </h2>
        <span className='text-sm text-green-700 hover:text-green-900 cursor-pointer font-medium'>
          See all
        </span>
      </div>
      
      <div className='space-y-3'>
        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            className='flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer'
          >
            {/* Icon/Indicator */}
            <div className={`w-10 h-10 ${notification.iconBg} rounded-lg flex-shrink-0`}>
              <Image
                src={""}
                alt="Notification Icon"
                width={40}
                height={40}
                className="object-cover rounded-lg"
              />
            </div>
            
            {/* Notification Content */}
            <div className='flex-1'>
              <p className='text-sm font-medium text-gray-900'>
                {notification.title}
              </p>
              <p className='text-xs text-gray-500 mt-0.5'>
                {notification.description}
              </p>
            </div>
            
            {/* Arrow indicator */}
            <svg 
              className='w-4 h-4 text-gray-400 flex-shrink-0 mt-1' 
              fill='none' 
              stroke='currentColor' 
              viewBox='0 0 24 24'
            >
              <path 
                strokeLinecap='round' 
                strokeLinejoin='round' 
                strokeWidth={2} 
                d='M9 5l7 7-7 7' 
              />
            </svg>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Notifications