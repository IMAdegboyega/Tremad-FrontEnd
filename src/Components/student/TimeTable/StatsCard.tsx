import { stats } from '@/Constants/TimeTable'
import React from 'react'

const StatsCard = () => {
  return (
    <div>
    {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2'>
        {stats.map((stat, index) => (
          <div key={index} className='bg-white rounded-lg p-4 border border-gray-100'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm text-gray-600'>{stat.title}</span>
              <div className='text-gray-400'>
                {stat.icon}
              </div>
            </div>
            <p className='text-2xl font-bold text-gray-900'>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StatsCard