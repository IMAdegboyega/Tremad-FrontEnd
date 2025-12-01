import { stats } from '@/Constants/StatManagement'
import React from 'react'

const StatManagement = () => {

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
      {stats.map((stat) => (
        <div key={stat.id} className='bg-white rounded-2xl p-5 border border-gray-100'>
          {/* Header with title and icon */}
          <div className='flex items-center justify-between mb-4'>
            <span className='text-lg text-gray-600 font-normal'>
              {stat.title}
            </span>
            <div className={'p-2 rounded-lg'}>
              <div className='text-gray-600'>
                {stat.icon}
              </div>
            </div>
          </div>

          {/* Main value */}
          <div className='mb-2'>
            <h2 className='text-4xl font-base text-gray-900'>
              {stat.value}
            </h2>
          </div>

          {/* Change indicator */}
          <div className='flex items-center gap-1'>
            <span className={`text-sm font-normal ${
              stat.change > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {stat.change > 0 ? '+' : ''}{stat.change}%
            </span>
            <span className='text-sm text-gray-500'>
              {stat.changeLabel}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default StatManagement