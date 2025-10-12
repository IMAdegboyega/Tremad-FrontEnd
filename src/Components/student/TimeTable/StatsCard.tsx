import { stats } from '@/Constants/TimeTable'
import React from 'react'

/**
 * StatsCard Component
 * 
 * Displays key statistics and metrics related to the student's timetable and schedule.
 * Features a responsive grid layout with individual stat cards showing important information.
 * 
 * Features:
 * - Responsive grid layout (2 columns on mobile, 4 on desktop)
 * - Individual stat cards with icons, titles, and values
 * - Clean, accessible design with proper spacing and typography
 * - Integration with TimeTable constants for data
 * - Consistent styling with the overall application theme
 */
const StatsCard = () => {
  return (
    <div>
      {/* Statistics Cards Grid */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-2'>
        {/* Map through stats data to create individual cards */}
        {stats.map((stat, index) => (
          <div key={index} className='bg-white rounded-lg p-3 lg:p-4 border border-gray-100'>
            {/* Card Header with Title and Icon */}
            <div className='flex items-center justify-between mb-1 lg:mb-2'>
              <span className='text-xs lg:text-sm text-gray-600'>{stat.title}</span>
              {/* Icon with responsive scaling */}
              <div className='text-gray-400 scale-75 lg:scale-100'>
                {stat.icon}
              </div>
            </div>
            {/* Stat Value Display */}
            <p className='text-xl lg:text-2xl font-bold text-gray-900'>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StatsCard