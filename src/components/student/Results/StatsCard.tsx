import { stats } from '@/Constants/Results'
import { TrendingDown, TrendingUp } from 'lucide-react'
import React from 'react'

const StatsCard = () => {
  return (
    <div>
      {/* Stats Cards - Responsive grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4'>
        {stats.map((stat, index) => (
          <div key={index} className='bg-white rounded-xl p-4 lg:p-5 shadow-sm'>
            <div className='flex items-center justify-between mb-2 lg:mb-3'>
              <span className='text-xs lg:text-sm text-gray-600'>{stat.title}</span>
              <div className='p-1.5 lg:p-2'>
                <div className='text-gray-600'>
                  {stat.icon}
                </div>
              </div>
            </div>
            <div className='mb-2'>
              <h2 className='text-2xl lg:text-3xl font-bold text-gray-900'>{stat.value}</h2>
            </div>
            <div className='flex items-center gap-1'>
              {stat.change > 0 ? (
                <TrendingUp size={14} className='text-green-600 lg:w-4 lg:h-4' />
              ) : (
                <TrendingDown size={14} className='text-red-600 lg:w-4 lg:h-4' />
              )}
              <span className={`text-sm lg:text-normal font-base ${
                stat.change > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change > 0 ? '+' : ''}{Math.abs(stat.change)}% {stat.changeLabel}
              </span>
              <span className='text-sm text-gray-500'></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StatsCard